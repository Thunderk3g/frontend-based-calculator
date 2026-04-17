import { calculatePremium, loadRateData } from '../src/calc.js';
import { CONFIG } from '../src/config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'bi_reference.json');

global.fetch = async (url) => {
    const filename = url.replace('./', '');
    const filepath = path.join(PUBLIC_DIR, filename);
    if (!fs.existsSync(filepath)) return { ok: false };
    const data = fs.readFileSync(filepath, 'utf8');
    return { ok: true, json: async () => JSON.parse(data) };
};

// Charges must match to 0.01% (₹1 minimum). Fund values get 0.02% because
// loyalty additions are computed on a "last-36-months average" basis that
// drifts by a few rupees per year from Excel's daily-average basis, and the
// drift compounds across years 15-20.
function within(actual, expected, looserField) {
    const pct = looserField ? 0.0002 : 0.0001;
    const floor = looserField ? 5 : 1;
    const tol = Math.max(floor, Math.abs(expected) * pct);
    return Math.abs(actual - expected) <= tol;
}

function fmtDiff(actual, expected) {
    const diff = actual - expected;
    return `expected ${expected.toFixed(2)}, got ${actual.toFixed(2)} (diff ${diff.toFixed(2)})`;
}

async function run() {
    const fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));

    CONFIG.charges = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'charges.json'), 'utf8'));
    await loadRateData();

    const inputs = {
        age: fixture.metadata.inputs.age,
        gender: fixture.metadata.inputs.gender,
        smoker: fixture.metadata.inputs.smoker,
        yearlyPremium: fixture.metadata.inputs.yearlyPremium,
        mode: fixture.metadata.inputs.mode,
        pt: fixture.metadata.inputs.pt,
        ppt: fixture.metadata.inputs.ppt,
        saFactor: fixture.metadata.inputs.saFactor,
        channel: fixture.metadata.inputs.channel,
        fundAllocations: fixture.metadata.inputs.fundAllocations,
        addons: { adb: false, ci: false, carePlus: false },
    };

    const res = calculatePremium(inputs);
    if (!res.success) {
        console.error('calculatePremium failed:', res.errors);
        process.exit(1);
    }

    let passed = 0;
    let failed = 0;
    const failures = [];

    for (const [key, scenario] of Object.entries(fixture.scenarios)) {
        const proj = key === '4' ? res.projections.scenario4 : res.projections.scenario8;
        for (const expected of scenario.yearly) {
            const yr = expected.year;
            const actual = proj.yearlyDetails[yr - 1];
            if (!actual) {
                failed++;
                failures.push(`Scenario ${key}%, Year ${yr}: missing yearlyDetails`);
                continue;
            }

            const checks = [
                ['premiumPaid', actual.premiumPaid, expected.premiumPaid],
                ['allocationCharge', actual.allocationCharge, expected.allocationCharge],
                ['pac', actual.pac, expected.pac],
                ['fmc', actual.fmc, expected.fmc],
                ['mortality', actual.mortality, expected.mortality],
                ['fundAtEnd', actual.fundAtEnd, expected.fundAtEnd],
            ];

            for (const [field, a, e] of checks) {
                const looser = field === 'fundAtEnd' || field === 'fmc';
                if (within(a, e, looser)) {
                    passed++;
                } else {
                    failed++;
                    failures.push(`Scenario ${key}%, Year ${yr}: ${field} ${fmtDiff(a, e)}`);
                }
            }
        }
    }

    if (failures.length) {
        console.log('\nFAILURES:');
        for (const f of failures.slice(0, 60)) console.log('  ' + f);
        if (failures.length > 60) console.log(`  ... and ${failures.length - 60} more`);
    }
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed === 0 ? 0 : 1);
}

run().catch((e) => { console.error(e); process.exit(1); });
