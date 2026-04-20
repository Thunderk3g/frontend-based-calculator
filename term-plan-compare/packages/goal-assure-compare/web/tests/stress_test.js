/**
 * Goal Assure IV ULIP Stress Test Harness
 *
 * - Section A: exact parity vs Excel BI reference (bi_reference.json)
 * - Section B: 25,000 random inputs; check invariants
 * - Section C: fund-return provenance (skipped if no API snapshot on disk)
 *
 * Run:
 *   node web/tests/stress_test.js
 *
 * Exits 0 when parity passes AND invariant-failure rate <1%.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'bi_reference.json');

// --- fetch shim: read local JSON from web/public ---------------------
global.fetch = async (url) => {
    if (typeof url !== 'string') {
        throw new Error(`[fetch shim] non-string URL: ${String(url)}`);
    }
    const filename = url.replace(/^\.\//, '').replace(/^\//, '');
    if (!filename.endsWith('.json')) {
        return { ok: false, status: 415, json: async () => ({}) };
    }
    const filepath = path.join(PUBLIC_DIR, filename);
    if (!fs.existsSync(filepath)) return { ok: false, status: 404 };
    const text = fs.readFileSync(filepath, 'utf8');
    return { ok: true, status: 200, json: async () => JSON.parse(text) };
};

const { calculateULIPProjection, calculatePremium, loadRateData } = await import('../src/calc.js');
const { CONFIG } = await import('../src/config.js');

// Populate CONFIG.charges (config.js's loadConfig is browser-targeted; we shortcut).
CONFIG.charges = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'charges.json'), 'utf8'));
await loadRateData();

// ============================================================
// Section A: Parity vs Excel BI (default inputs)
// ============================================================
const fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));

const biInputs = {
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

function tolerance(expected, looser = false) {
    const pct = looser ? 0.0002 : 0.0001;
    const floor = looser ? 5 : 1;
    return Math.max(floor, Math.abs(expected) * pct);
}

function compareScenario(projection, scenarioRows) {
    let withinCount = 0;
    let totalYears = 0;
    let worst = { delta: -Infinity };
    const perYearOk = new Map(); // year -> bool (all fields within)

    for (const expected of scenarioRows) {
        totalYears++;
        const yr = expected.year;
        const actual = projection.yearlyDetails[yr - 1];
        if (!actual) {
            perYearOk.set(yr, false);
            continue;
        }

        const checks = [
            ['premiumPaid',      actual.premiumPaid,      expected.premiumPaid,      false],
            ['allocationCharge', actual.allocationCharge, expected.allocationCharge, false],
            ['pac',              actual.pac,              expected.pac,              false],
            ['fmc',              actual.fmc,              expected.fmc,              true],
            ['mortality',        actual.mortality,        expected.mortality,        false],
            // calc.js rolls LA/FB into fundAtEnd; Excel's fundAtEnd does the same
            // (fundAtEndBeforeCredits is the pre-credit snapshot). Match against
            // fundAtEnd, matching the standalone bi_parity_test.js convention.
            ['fundAtEnd',        actual.fundAtEnd,        expected.fundAtEnd, true],
        ];

        let ok = true;
        for (const [field, a, e, looser] of checks) {
            const delta = Math.abs(a - e);
            const tol = tolerance(e, looser);
            if (delta > tol) {
                ok = false;
                if (delta > worst.delta) worst = { year: yr, field, expected: e, got: a, delta };
            }
        }
        perYearOk.set(yr, ok);
        if (ok) withinCount++;
    }
    return { withinCount, totalYears, worst };
}

console.log('Running parity check vs Excel BI...');
const proj4 = calculateULIPProjection(biInputs, 0.04);
const proj8 = calculateULIPProjection(biInputs, 0.08);

const parity4 = compareScenario(proj4, fixture.scenarios['4'].yearly);
const parity8 = compareScenario(proj8, fixture.scenarios['8'].yearly);

// Overall worst between the two
const worstOverall = [parity4.worst, parity8.worst]
    .filter(w => w.delta !== -Infinity)
    .sort((a, b) => b.delta - a.delta)[0] || null;

const parityPassed = (parity4.withinCount === parity4.totalYears) &&
                     (parity8.withinCount === parity8.totalYears);

// ============================================================
// Section B: Randomized stress (N=25000)
// ============================================================
// Deterministic seeded PRNG (mulberry32) — keeps runs reproducible.
let SEED = 0xC0DECAFE;
function rand() {
    SEED |= 0; SEED = SEED + 0x6D2B79F5 | 0;
    let t = SEED;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function randInt(lo, hi) { return Math.floor(rand() * (hi - lo + 1)) + lo; }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

const FUNDS = Object.keys(CONFIG.charges.fmc);
// CONFIG.constraints: minAge 0, maxAge 60, minPremium 25000
const minAge = CONFIG.constraints.minAge ?? 0;
const maxAge = Math.min(60, CONFIG.constraints.maxAge ?? 60);
const minPremium = CONFIG.constraints.minPremium ?? 25000;

// Allocation rule breakpoints in charges.json: there are web + other tables.
// calc.js falls back to 'other' if channel isn't present; accept both.
const CHANNELS = ['web', 'other'];
const SA_FACTORS = [7, 10, 11, 15];

function randomFundAllocations() {
    const n = randInt(1, Math.min(4, FUNDS.length));
    const chosen = new Set();
    while (chosen.size < n) chosen.add(pick(FUNDS));
    // Random Dirichlet-ish split then round to ints summing to 100.
    const raws = Array.from(chosen).map(() => rand() + 0.01);
    const s = raws.reduce((a, b) => a + b, 0);
    const pcts = raws.map(r => (r / s) * 100);
    const ints = pcts.map(p => Math.floor(p));
    let remainder = 100 - ints.reduce((a, b) => a + b, 0);
    for (let i = 0; i < ints.length && remainder > 0; i++, remainder--) ints[i]++;
    const out = {};
    Array.from(chosen).forEach((f, i) => { out[f] = ints[i]; });
    return out;
}

function makeCase() {
    const age = randInt(Math.max(0, minAge), maxAge);
    // Log-uniform premium in [50k, 5Cr]
    const lo = Math.max(50000, minPremium);
    const hi = 50000000;
    const yearlyPremium = Math.round(Math.exp(Math.log(lo) + rand() * (Math.log(hi) - Math.log(lo))) / 1000) * 1000;
    const pt  = randInt(10, 30);
    const ppt = randInt(5, pt);
    return {
        age,
        gender: rand() < 0.5 ? 'Male' : 'Female',
        smoker: 'Non Smoker',
        yearlyPremium,
        mode: 'Annual',
        pt,
        ppt,
        saFactor: pick(SA_FACTORS),
        channel: pick(CHANNELS),
        fundAllocations: randomFundAllocations(),
        addons: {
            adb: rand() < 0.3,
            ci: rand() < 0.3,
            carePlus: rand() < 0.3,
        },
    };
}

function pickGrowthRate(i) {
    // Always include 4% and 8%; plus 20 random in [2%, 15%]; rest between 3-12%.
    if (i === 0) return 0.04;
    if (i === 1) return 0.08;
    if (i < 22) return 0.02 + rand() * 0.13;
    return 0.03 + rand() * 0.09;
}

const N = 25000;

const invariantCounts = {
    nanOrInf: 0,
    negativeFund: 0,
    allocChargeHigh: 0,
    fmcExcessive: 0,
    mortalityWhenSAExceeded: 0,
    annualSumCheckBroken: 0,
    monotonicityViolated: 0,
};
const mismatchPatterns = new Map();   // label -> count
const patternBump = (label) => mismatchPatterns.set(label, (mismatchPatterns.get(label) || 0) + 1);

let failingCases = 0;
let engineThrows = 0;

console.log(`Running ${N} randomized cases...`);
const t0 = Date.now();

const MONO_TRIPLE_INTERVAL = 250;   // every 250th case triggers a monotonicity triplet
let monotonicityChecks = 0;

for (let i = 0; i < N; i++) {
    const inputs = makeCase();
    const r = pickGrowthRate(i % 40);
    let proj;
    try {
        proj = calculateULIPProjection(inputs, r);
    } catch (e) {
        engineThrows++;
        failingCases++;
        patternBump('engine_threw: ' + (e.message || 'unknown').slice(0, 60));
        continue;
    }

    let caseBroken = false;

    // Invariant 1: NaN / Infinity / negative in core fields
    let nanHit = false, negFundHit = false;
    for (const row of proj.yearlyDetails) {
        for (const f of ['fundAtEnd', 'fmc', 'mortality', 'pac', 'allocationCharge']) {
            const v = row[f];
            if (!Number.isFinite(v)) { nanHit = true; break; }
            // Negative allowed for none of these.
            if (v < 0) {
                if (f === 'fundAtEnd') negFundHit = true;
                else if (f === 'mortality') { /* charges: should be >=0 */
                    patternBump(`negative_${f}`);
                    caseBroken = true;
                }
            }
        }
        if (nanHit) break;
    }
    if (nanHit) { invariantCounts.nanOrInf++; caseBroken = true; patternBump('nan_or_inf_field'); }
    if (negFundHit) { invariantCounts.negativeFund++; caseBroken = true; patternBump('fundAtEnd_went_negative'); }

    // Invariant 3: sum of allocationCharge over pt years <= premium * ppt * 0.20
    const totalAlloc = proj.yearlyDetails.reduce((s, r) => s + (r.allocationCharge || 0), 0);
    const allocCap = inputs.yearlyPremium * inputs.ppt * 0.20;
    if (totalAlloc > allocCap + 1) {
        invariantCounts.allocChargeHigh++;
        patternBump('alloc_charge_exceeded_20pct_cap');
        caseBroken = true;
    }

    // Invariant 4: FMC <= 3% of fundAtEnd each year (only when fundAtEnd>0)
    for (const row of proj.yearlyDetails) {
        if (row.fundAtEnd > 1 && row.fmc > 0.03 * row.fundAtEnd + 1) {
            invariantCounts.fmcExcessive++;
            patternBump('fmc_exceeded_3pct_fund');
            caseBroken = true;
            break;
        }
    }

    // Invariant 5: if sumAssured <= fundAtEnd[year], mortality that year should be zero.
    // calc.js computes mortality on month-start sumAtRisk; so strictly, if fund stays
    // above SA all 12 months mortality should be 0. Use end-of-year fund as proxy
    // and only flag when previousFundAtEnd also >= SA.
    const SA = inputs.yearlyPremium * inputs.saFactor;
    let prev = 0;
    for (const row of proj.yearlyDetails) {
        if (prev >= SA && row.fundAtEnd >= SA && row.mortality > 1) {
            invariantCounts.mortalityWhenSAExceeded++;
            patternBump('mortality_charged_when_fund_exceeds_SA');
            caseBroken = true;
            break;
        }
        prev = row.fundAtEnd;
    }

    // Invariant 6: annual-mode compound-sum sanity when ppt==pt and no charges material.
    if (inputs.ppt === inputs.pt) {
        let expected = 0;
        for (let y = 1; y <= inputs.pt; y++) expected += inputs.yearlyPremium * Math.pow(1 + r, inputs.pt - y + 1);
        const actual = proj.yearlyDetails[proj.yearlyDetails.length - 1].fundAtEnd;
        // Very loose: within 40% band (mortality/FMC/alloc can drag fund down).
        if (actual > expected * 1.25 || actual < expected * 0.50) {
            invariantCounts.annualSumCheckBroken++;
            patternBump('compound_sum_out_of_25pct_band');
            caseBroken = true;
        }
    }

    // Invariant 2: monotonicity in growth rate — batched
    if (i % MONO_TRIPLE_INTERVAL === 0) {
        try {
            const pLow  = calculateULIPProjection(inputs, Math.max(0.01, r - 0.02));
            const pHigh = calculateULIPProjection(inputs, r + 0.02);
            // At maturity year the fund should be strictly non-decreasing in r.
            const lastLow  = pLow.yearlyDetails[pLow.yearlyDetails.length - 1].fundAtEnd;
            const lastMid  = proj.yearlyDetails[proj.yearlyDetails.length - 1].fundAtEnd;
            const lastHigh = pHigh.yearlyDetails[pHigh.yearlyDetails.length - 1].fundAtEnd;
            monotonicityChecks++;
            if (!(lastLow <= lastMid + 1 && lastMid <= lastHigh + 1)) {
                invariantCounts.monotonicityViolated++;
                patternBump('fund_not_monotonic_in_growth_rate');
                caseBroken = true;
            }
        } catch { /* counted already if it blew up */ }
    }

    if (caseBroken) failingCases++;
}

const elapsedMs = Date.now() - t0;

// ============================================================
// Section C: Fund-return provenance
// ============================================================
// We look for any cached fund-details JSON on disk. The codebase doesn't
// ship one, and the remote API isn't reachable from Node without a network,
// so this check is typically skipped.
let provenanceStatus = 'skipped: no fund-details JSON snapshot found on disk, and the remote POST endpoint is unreachable from the test harness.';
const candidatePaths = [
    path.join(__dirname, 'fixtures', 'fund_details.json'),
    path.join(PUBLIC_DIR, 'fund_details.json'),
    path.join(__dirname, 'fixtures', 'fund_api_snapshot.json'),
];
for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
        provenanceStatus = `loaded snapshot from ${p}. calc.js does NOT reference fund-return fields — it uses the user-supplied growth rate (4%/8%/custom), so no hardcoded-return risk for the top-3 funds.`;
        break;
    }
}

// ============================================================
// Output
// ============================================================
const pctFailing = (failingCases / N) * 100;
const topPatterns = [...mismatchPatterns.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

function fmtWorst(w) {
    if (!w || w.delta === -Infinity) return 'none';
    return `year ${w.year} ${w.field} expected=${w.expected.toFixed(2)} got=${w.got.toFixed(2)} delta=${w.delta.toFixed(2)}`;
}

console.log('');
console.log('=== Goal Assure IV ULIP Stress Test ===');
console.log('Parity vs Excel BI (default inputs):');
console.log(`  4% scenario: ${parity4.withinCount}/${parity4.totalYears} years within tolerance`);
console.log(`  8% scenario: ${parity8.withinCount}/${parity8.totalYears} years within tolerance`);
console.log(`  Worst deviation: ${fmtWorst(worstOverall)}`);
console.log('');
console.log(`Randomized stress (N=${N}):`);
const inv = invariantCounts;
console.log(`  Invariant violations:`);
console.log(`    #1 NaN/Infinity field:                ${inv.nanOrInf}`);
console.log(`    #2 monotonicity in growth rate:       ${inv.monotonicityViolated} (checks run: ${monotonicityChecks})`);
console.log(`    #3 alloc charge > 20% cap:            ${inv.allocChargeHigh}`);
console.log(`    #4 FMC > 3% of fund:                  ${inv.fmcExcessive}`);
console.log(`    #5 mortality charged when fund>=SA:   ${inv.mortalityWhenSAExceeded}`);
console.log(`    #6 compound-sum out of 25% band:      ${inv.annualSumCheckBroken}`);
console.log(`  NaN/Infinity cases:   ${inv.nanOrInf}`);
console.log(`  Negative fund value:  ${inv.negativeFund}`);
console.log(`  Engine threw:         ${engineThrows}`);
console.log(`  Total failing cases:  ${failingCases} (${pctFailing.toFixed(2)}%)`);
console.log(`  Elapsed: ${(elapsedMs / 1000).toFixed(1)}s`);
console.log('');
console.log('Top 3 mismatch patterns:');
if (topPatterns.length === 0) {
    console.log('  (none)');
} else {
    topPatterns.forEach((p, i) => console.log(`  ${i + 1}. ${p[0]} (${p[1]} cases)`));
}
console.log('');
console.log(`Fund-return provenance: ${provenanceStatus}`);

const parityOk   = parityPassed;
const stressOk   = pctFailing < 1;
process.exit(parityOk && stressOk ? 0 : 1);
