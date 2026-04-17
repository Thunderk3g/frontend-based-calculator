import assert from 'node:assert/strict';
import { computeLtcgBenefit } from '../src/calc.js';

// Helper: build a minimal projection stub with just finalFundValue
const proj = (finalFundValue) => ({ finalFundValue });

let passed = 0;
let failed = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  ok  ${name}`);
        passed++;
    } catch (e) {
        console.error(`  FAIL ${name}`);
        console.error(`       ${e.message}`);
        failed++;
    }
}

console.log('computeLtcgBenefit:');

test('returns null when annual premium exceeds 2.5L threshold', () => {
    const result = computeLtcgBenefit(proj(5000000), 250001, 10);
    assert.equal(result, null);
});

test('returns object at exact boundary premium = 2.5L', () => {
    const result = computeLtcgBenefit(proj(5000000), 250000, 10);
    assert.notEqual(result, null);
    assert.equal(result.applicable, true);
});

test('happy path: premium 2L, 10 pay years, 50L final value', () => {
    // totalInvested = 200000 * 10 = 20,00,000
    // totalGain     = 50,00,000 - 20,00,000 = 30,00,000
    // taxableGain   = 30,00,000 - 1,25,000 = 28,75,000
    // hypotheticalLtcg = 28,75,000 * 0.125 = 3,59,375
    const result = computeLtcgBenefit(proj(5000000), 200000, 10);
    assert.equal(result.totalInvested, 2000000);
    assert.equal(result.totalGain, 3000000);
    assert.equal(result.taxableGain, 2875000);
    assert.equal(result.hypotheticalLtcg, 359375);
    assert.equal(result.savings, 359375);
});

test('zero-state: gain is a loss (final < invested)', () => {
    const result = computeLtcgBenefit(proj(100000), 200000, 10);
    assert.equal(result.applicable, true);
    assert.equal(result.totalGain, -1900000);
    assert.equal(result.taxableGain, 0);
    assert.equal(result.hypotheticalLtcg, 0);
    assert.equal(result.savings, 0);
});

test('zero-state: gain under 1.25L exemption', () => {
    // totalInvested = 50000 * 5 = 2,50,000
    // totalGain     = 3,50,000 - 2,50,000 = 1,00,000 (< 1.25L)
    // taxableGain   = 0, hypotheticalLtcg = 0
    const result = computeLtcgBenefit(proj(350000), 50000, 5);
    assert.equal(result.totalGain, 100000);
    assert.equal(result.taxableGain, 0);
    assert.equal(result.savings, 0);
});

test('totalInvested equals yearlyPremium * payYears', () => {
    // The caller is responsible for passing payYears = Math.min(pt, ppt);
    // this function just multiplies.
    const result = computeLtcgBenefit(proj(1500000), 100000, 7);
    assert.equal(result.totalInvested, 700000);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
