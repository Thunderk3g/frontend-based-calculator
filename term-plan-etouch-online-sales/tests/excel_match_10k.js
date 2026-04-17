import { loadRateData, calculatePremium } from '../web/src/calc.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Mock fetch for Node.js
global.fetch = async (url) => {
    const filePath = join(__dirname, '../web/public', url.split('/').pop());
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return {
            ok: true,
            json: async () => JSON.parse(data),
            text: async () => data
        };
    } catch (err) {
        return { ok: false, status: 404, statusText: 'Not Found' };
    }
};

async function run10kTests() {
    console.log('Loading rate data...');
    try {
        await loadRateData();
    } catch (err) {
        console.error('Failed to load rate data:', err);
        process.exit(1);
    }

    const testFilePath = join(__dirname, 'excel_test_cases_10k.json');
    if (!fs.existsSync(testFilePath)) {
        console.error(`Test file not found: ${testFilePath}. Please run generation script first.`);
        process.exit(1);
    }

    const cases = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));

    console.log(`Running ${cases.length.toLocaleString()} test cases...`);

    let passed = 0;
    let failed = 0;
    let errors = 0;
    const failures = [];

    for (let i = 0; i < cases.length; i++) {
        const tc = cases[i];

        try {
            const result = calculatePremium({
                age: tc.input.age,
                gender: tc.input.gender,
                smoker: tc.input.smoker,
                residency: (tc.input.residency === 'NR' || tc.input.residency === 'NRI') ? 'NRI' : 'Resident Indian',
                planVariant: tc.input.planVariant === 'LSR' ? 'Life Shield ROP' : 'Life Shield',
                policyTerm: tc.input.policyTerm,
                ppt: tc.input.ppt,
                sumAssured: tc.input.sumAssured,
                mode: tc.input.mode,
                isMedical: tc.input.isMedical,
                riders: {
                    adb: { enabled: false },
                    ci: { enabled: false },
                    carePlus: { enabled: false },
                    parentalCare: { enabled: false },
                    spouseCare: { enabled: false },
                    childCare: [],
                    famCare: { enabled: false }
                },
                discounts: {}
            });

            if (!result.success) {
                errors++;
                if (failures.length < 100) {
                    failures.push({
                        id: tc.id,
                        desc: tc.description,
                        errors: result.errors,
                        lookupKey: result.lookupKey,
                        input: tc.input,
                        type: 'CALC_ERROR'
                    });
                }
                continue;
            }

            // Compare with tolerance ₹1 (rounding from monthly/annual)
            const tolerance = 1.0;

            // Extract raw values for comparison
            // The calculatePremium function returns instalmentWithGSTYear1 as premiumY1 for test alias
            // We want to check base premium vs base premium in tc.expected

            const annualBaseMatch = Math.abs(result.totalAnnualBeforeDiscounts - tc.expected.annualBase) <= tolerance;
            const instalmentMatch = Math.abs(result.totalInstalmentBeforeDiscounts - tc.expected.baseInstalment) <= tolerance;

            if (annualBaseMatch && instalmentMatch) {
                passed++;
            } else {
                failed++;
                if (failures.length < 100) {
                    failures.push({
                        id: tc.id,
                        desc: tc.description,
                        input: tc.input,
                        expected: {
                            annualBase: tc.expected.annualBase,
                            instalment: tc.expected.baseInstalment
                        },
                        got: {
                            annualBase: result.totalAnnualBeforeDiscounts,
                            instalment: result.totalInstalmentBeforeDiscounts
                        },
                        diff: {
                            annualBase: Math.abs(result.totalAnnualBeforeDiscounts - tc.expected.annualBase).toFixed(4),
                            instalment: Math.abs(result.totalInstalmentBeforeDiscounts - tc.expected.baseInstalment).toFixed(4)
                        },
                        type: 'MISMATCH'
                    });
                }
            }
        } catch (e) {
            errors++;
            if (failures.length < 100) {
                failures.push({
                    id: tc.id,
                    desc: tc.description,
                    error: e.message,
                    stack: e.stack,
                    type: 'EXCEPTION'
                });
            }
        }

        // Progress every 1000
        if ((i + 1) % 1000 === 0) {
            const pct = ((passed / (i + 1)) * 100).toFixed(1);
            console.log(`  Progress: ${(i + 1).toLocaleString()}/${cases.length.toLocaleString()}  PASS ${passed}  FAIL ${failed}  ERR ${errors}  (${pct}%)`);
        }
    }

    // Final report
    const total = cases.length;
    const matchRate = (passed / total * 100).toFixed(2);

    console.log('\n' + '='.repeat(55));
    console.log('  10,000 CASE EXCEL MATCH TEST RESULTS');
    console.log('='.repeat(55));
    console.log(`  Total cases  : ${total.toLocaleString()}`);
    console.log(`  PASSED       : ${passed.toLocaleString()}`);
    console.log(`  MISMATCH     : ${failed}`);
    console.log(`  CALC ERROR   : ${errors}`);
    console.log(`  Match rate   : ${matchRate}%`);
    console.log('='.repeat(55));

    if (failures.length > 0) {
        console.log('\nFIRST 10 FAILURES:');
        failures.slice(0, 10).forEach(f => {
            console.log('\n' + '-'.repeat(45));
            console.log(`ID: ${f.id} | ${f.desc}`);
            if (f.type === 'CALC_ERROR') {
                console.log('CALC_ERROR:', f.error, 'Lookup Key:', f.lookupKey);
                console.log('Input:', JSON.stringify(f.input));
            } else if (f.type === 'EXCEPTION') {
                console.log('EXCEPTION:', f.error);
            } else {
                console.log(`Expected Annual: ${f.expected.annualBase} | Got: ${f.got.annualBase} | Diff: ${f.diff.annualBase}`);
                console.log(`Expected Install: ${f.expected.instalment} | Got: ${f.got.instalment} | Diff: ${f.diff.instalment}`);
                console.log('Input:', JSON.stringify(f.input));
            }
        });

        // Group failures by profile type
        const byType = {};
        failures.forEach(f => {
            if (!f.input) return;
            const key = f.input.planVariant +
                (f.input.residency === 'NR' ? '_NRI' : '') +
                (f.input.sumAssured > 10000000 ? '_HSAR' : '') +
                (f.input.isMedical ? '_Med' : '_NMed');
            byType[key] = (byType[key] || 0) + 1;
        });

        if (Object.keys(byType).length > 0) {
            console.log('\nFailures by profile type (top 50 recorded):');
            Object.entries(byType)
                .sort(([, a], [, b]) => b - a)
                .forEach(([k, v]) => console.log(`  ${k}: ${v}`));
        }

        fs.writeFileSync(join(__dirname, 'failures_10k_report.json'), JSON.stringify(failures, null, 2));
        console.log('\nFull failures saved to: tests/failures_10k_report.json');
    }

    if (matchRate >= 99.0) {
        console.log('\n✅ PASS: >99% match rate achieved');
        process.exit(0);
    } else {
        console.log('\n❌ FAIL: <99% match rate');
        process.exit(1);
    }
}

run10kTests().catch(console.error);
