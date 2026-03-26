/**
 * excel_match_test.js
 * ====================
 * Validates that calculatePremium() in calc.js matches the expected values
 * stored in tests/excel_test_cases.json (generated from rate tables).
 *
 * Usage:
 *   node tests/excel_match_test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Node.js mocks (same as master.test.js) ─────────────────────────────────
global.fetch = async (url) => {
    const filename = url.replace(/^\//, '');
    const filePath = path.join(process.cwd(), 'web', 'public', filename);
    if (!fs.existsSync(filePath)) return { ok: false, status: 404 };
    const content = fs.readFileSync(filePath, 'utf8');
    return { ok: true, json: async () => JSON.parse(content) };
};
global.performance = { now: () => Date.now() };

// ── Now safe to import calc.js (which calls fetch at load time) ────────────
import { loadRateData, calculatePremium } from '../web/src/calc.js';

const CASES_FILE = path.join(__dirname, 'excel_test_cases.json');
const REPORT_FILE = path.join(__dirname, 'failures_report.json');
const TOLERANCE = 0.01;   // Rs 0.01 tolerance

// ── Helpers ────────────────────────────────────────────────────────────────
function eq(a, b) { return Math.abs(a - b) <= TOLERANCE; }

function mapInput(tc) {
    const i = tc.input;
    return {
        age: i.age,
        gender: i.gender === 'M' ? 'Male' : 'Female',
        smoker: i.smoker === 'NS' ? 'Non Smoker' : 'Smoker',
        variant: 'Life Shield',
        policyTerm: i.policyTerm,
        pt: i.policyTerm,
        ppt: i.ppt,
        sumAssured: i.sumAssured,
        sa: i.sumAssured,
        mode: i.mode,
        medicalCategory: i.isMedical ? 'Medical' : 'Non Medical',
        residence: i.residency === 'R' ? 'Resident Indian' : 'NRI',
        discounts: {
            online: false, aggregator: false, partner: false,
            salaried: false, insuranceForAll: false, siso: false,
        },
        gstYear1Rate: 0,
        gstYear2Rate: 0,
        riders: {
            adb: { enabled: false },
            ci: { enabled: false },
            carePlus: { enabled: false },
            parentalCare: { enabled: false },
            spouseCare: { enabled: false },
            childCare: [],
            famCare: { enabled: false },
        },
    };
}

// ── Main ───────────────────────────────────────────────────────────────────
async function runTests() {
    console.log('='.repeat(52));
    console.log('  EXCEL MATCH TEST -- Bajaj Life eTouch II');
    console.log('='.repeat(52));

    if (!fs.existsSync(CASES_FILE)) {
        console.error(`\nTest cases file not found:\n   ${CASES_FILE}`);
        console.error('   Run:  py scripts/generate_test_cases.py\n');
        process.exit(1);
    }

    console.log('\n> Loading rate data...');
    await loadRateData();

    const cases = JSON.parse(fs.readFileSync(CASES_FILE, 'utf8'));
    console.log(`> Running ${cases.length} test cases...\n`);

    let passed = 0;
    let failed = 0;
    let calcErr = 0;
    const failures = [];

    for (let i = 0; i < cases.length; i++) {
        const tc = cases[i];
        const params = mapInput(tc);

        let result;
        try {
            result = calculatePremium(params);
        } catch (e) {
            calcErr++;
            failures.push({ id: tc.id, input: tc.input, error: e.message });
            continue;
        }

        if (!result.success) {
            calcErr++;
            failures.push({ id: tc.id, input: tc.input, error: result.error });
            continue;
        }

        // Compare annual base premium and instalment
        const gotAnnual = result.baseAnnualPremium;
        const gotInstalment = result.baseInstalmentPremium;
        const expAnnual = tc.expected.annualBase;
        const expInstalment = tc.expected.baseInstalment;

        const annualOk = eq(gotAnnual, expAnnual);
        const instalmentOk = eq(gotInstalment, expInstalment);

        if (annualOk && instalmentOk) {
            passed++;
        } else {
            failed++;
            failures.push({
                id: tc.id,
                desc: tc.description,
                input: tc.input,
                expected: { annualBase: expAnnual, baseInstalment: expInstalment, keyUsed: tc.expected.keyUsed },
                got: { annualBase: gotAnnual, baseInstalment: gotInstalment, keyUsed: result.lookupKey },
                diff: {
                    annualBase: Math.abs(gotAnnual - expAnnual),
                    baseInstalment: Math.abs(gotInstalment - expInstalment),
                },
            });
        }

        if ((i + 1) % 100 === 0) {
            const pct = ((passed / (i + 1)) * 100).toFixed(1);
            console.log(
                `  Progress: ${String(i + 1).padStart(4)}/${cases.length}` +
                `  |  PASS ${passed}  FAIL ${failed}  ERR ${calcErr}  (${pct}%)`
            );
        }
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    const total = cases.length;
    const matchRate = ((passed / total) * 100).toFixed(2);

    console.log('\n' + '='.repeat(52));
    console.log('  RESULTS');
    console.log('='.repeat(52));
    console.log(`  Total cases  : ${total}`);
    console.log(`  PASSED       : ${passed}`);
    console.log(`  MISMATCH     : ${failed}`);
    console.log(`  CALC ERROR   : ${calcErr}`);
    console.log(`  Match rate   : ${matchRate}%`);
    console.log('='.repeat(52));

    if (failures.length > 0) {
        console.log('\nFirst 10 Failures:');
        failures.slice(0, 10).forEach(f => {
            console.log(`\n  ID ${f.id}: ${f.desc || ''}`);
            if (f.error) {
                console.log(`  ERROR: ${f.error}`);
            } else {
                console.log(`  Key Expected : ${f.expected.keyUsed}`);
                console.log(`  Key Got      : ${f.got.keyUsed}`);
                console.log(`  Annual Base  -- expected ${f.expected.annualBase.toFixed(4)}  got ${f.got.annualBase.toFixed(4)}  diff ${f.diff.annualBase.toFixed(6)}`);
                console.log(`  Instalment   -- expected ${f.expected.baseInstalment.toFixed(4)}  got ${f.got.baseInstalment.toFixed(4)}  diff ${f.diff.baseInstalment.toFixed(6)}`);
            }
        });

        fs.writeFileSync(REPORT_FILE, JSON.stringify(failures, null, 2), 'utf8');
        console.log(`\n  Full report saved -> ${REPORT_FILE}`);
    }

    const exitCode = (failed + calcErr) > 0 ? 1 : 0;
    console.log(`\nSUMMARY: ${passed} Passed, ${failed + calcErr} Failed\n`);
    process.exit(exitCode);
}

runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
