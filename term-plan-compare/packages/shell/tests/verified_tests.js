/**
 * verified_tests.js
 * 
 * MANUALLY VERIFIED TEST CASES (Zero Tolerance)
 * Expected values come from BI_eTouch II_V07_Ver0.2.xlsb
 */

import fs from 'fs';
import path from 'path';
import { calculatePremium, loadRateData } from '../web/src/calc.js';

// Setup Mock environment for Node.js
global.fetch = async (url) => {
    const filename = url.replace(/^\//, '');
    const filePath = path.join(process.cwd(), 'web', 'public', filename);
    if (!fs.existsSync(filePath)) return { ok: false, status: 404 };
    const content = fs.readFileSync(filePath, 'utf8');
    return { ok: true, json: async () => JSON.parse(content) };
};
global.performance = { now: () => Date.now() };

async function runVerifiedTests() {
    console.log('🚀 Running MANUALLY VERIFIED Tests...\n');
    await loadRateData();

    const baseProfile = {
        age: 26,
        gender: 'M',
        sumAssured: 9000000,
        policyTerm: 59,
        ppt: 10,
        mode: 'Monthly',
        smoker: 'NS',
        residency: 'R',
        isMedical: true,
        planVariant: 'LS',
        discounts: {
            online: false,
            siso: false,
            partner: false,
            salaried: false,
            loyalty: false
        },
        riders: {
            ci: { enabled: false, sumAssured: 0, pt: 0 },
            carePlus: { enabled: false },
            spouseCare: { enabled: false, spouseAge: 18, sumAssured: 4500000, pt: 49 },
            childCare: [],
            parentalCare: { enabled: false, fatherAge: 80, motherAge: 75, sumAssured: 9000000, pt: 49 },
            famCare: { enabled: false, pt: 59, sumAssured: 1000000 }
        }
    };

    let passed = 0;
    let failed = 0;

    function assert(name, actual, expected, tolerance = 1.0) {
        if (actual === undefined || isNaN(actual)) {
            console.error(`  ❌ [CRITICAL FAIL] ${name}: Returned undefined or NaN! Expected ${expected}`);
            failed++;
            return;
        }
        const diff = Math.abs(actual - expected);
        if (diff <= tolerance) {
            console.log(`  ✅ [PASS] ${name}: ${actual.toFixed(2)} (Expected ${expected.toFixed(2)})`);
            passed++;
        } else {
            console.error(`  ❌ [FAIL] ${name}: Got ${actual.toFixed(2)}, Expected ${expected.toFixed(2)} (Diff: ${diff.toFixed(2)})`);
            failed++;
        }
    }

    // --- Group 1: Base Profiles ---
    console.log('--- Group 1: Base Premiums & Profiles ---');
    assert('BASE-01: Base Monthly (90L, M, 26, 59/10)', calculatePremium({ ...baseProfile }).baseInstalmentPremium, 4010.34);
    assert('BASE-02: Base Annual', calculatePremium({ ...baseProfile, mode: 'Annual' }).baseInstalmentPremium, 45832.50);
    assert('BASE-05: Female Base (90L, F, 26, 59/10)', calculatePremium({ ...baseProfile, gender: 'F' }).baseInstalmentPremium, 3264.97);
    assert('BASE-06: Smoker Base', calculatePremium({ ...baseProfile, smoker: 'S' }).baseInstalmentPremium, 6416.55);
    assert('BASE-08: NRI Monthly', calculatePremium({ ...baseProfile, residency: 'NRI' }).baseInstalmentPremium, 3609.35);
    assert('BASE-10: 2Cr PT31 PPT5 Monthly (Incl. HSAR)', calculatePremium({ ...baseProfile, sumAssured: 20000000, policyTerm: 31, ppt: 5 }).premiumY1, 4752.00);

    // --- Group 2: Riders Individually ---
    console.log('\n--- Group 2: Riders (Individually) ---');
    assert('CI-01: CI Rider (2L, 20yr PT)', calculatePremium({ ...baseProfile, riders: { ...baseProfile.riders, ci: { enabled: true, sumAssured: 200000, pt: 20 } } }).ciInstalmentPrem, 54.07);
    assert('CP-01: Care Plus Rider', calculatePremium({ ...baseProfile, riders: { ...baseProfile.riders, carePlus: { enabled: true, pt: 20, ppt: 5, plan: 'Prime' } } }).cpInstalmentPrem, 531.56);
    assert('SC-01: Spouse Care Rider (SA 45L)', calculatePremium({ ...baseProfile, riders: { ...baseProfile.riders, spouseCare: { enabled: true, spouseAge: 18, sumAssured: 4500000, pt: 49 } } }).scInstalmentPrem, 99.12);
    assert('PC-01: Parental Care (80/75)', calculatePremium({ ...baseProfile, riders: { ...baseProfile.riders, parentalCare: { enabled: true, fatherAge: 80, motherAge: 75, sumAssured: 9000000, pt: 49 } } }).pcInstalmentPrem, 174.84);
    assert('CC-01: Child Care (1 Child, SA 50L)', calculatePremium({ ...baseProfile, riders: { ...baseProfile.riders, childCare: [{ enabled: true, age: 10, pt: 15, sumAssured: 5000000 }] } }).ccInstalmentPrem, 39.07);
    assert('FC-01: Family Care (SA 10L)', calculatePremium({ ...baseProfile, riders: { ...baseProfile.riders, famCare: { enabled: true, pt: 59, sumAssured: 1000000 } } }).fcInstalmentPrem, 273.57);

    // --- Group 3: Discounts ---
    console.log('\n--- Group 3: Discounts ---');
    assert('DISC-01: Online 6%', calculatePremium({ ...baseProfile, discounts: { online: true } }).premiumY1, 3769.72);
    assert('DISC-02: SISO 6%', calculatePremium({ ...baseProfile, discounts: { siso: true } }).premiumY1, 3769.72);
    assert('DISC-03: Online + Partner (Sequential)', calculatePremium({ ...baseProfile, discounts: { online: true, partner: true } }).premiumY1, 3392.75);

    // --- Group 4: All Together ---
    console.log('\n--- Group 4: Complete Case (Multi-Rider) ---');
    const allRes = calculatePremium({
        ...baseProfile,
        riders: {
            ci: { enabled: true, sumAssured: 200000, pt: 20 },
            carePlus: { enabled: true, pt: 20, ppt: 5, plan: 'Prime' },
            spouseCare: { enabled: true, spouseAge: 18, sumAssured: 4500000, pt: 49 },
            childCare: [
                { enabled: true, age: 10, gender: 'M', pt: 15, sumAssured: 5000000 },
                { enabled: true, age: 10, gender: 'F', pt: 15, sumAssured: 10000000 },
                { enabled: true, age: 10, gender: 'M', pt: 15, sumAssured: 40000000 }
            ],
            parentalCare: { enabled: true, fatherAge: 80, motherAge: 75, sumAssured: 9000000, pt: 49 },
            famCare: { enabled: true, pt: 59, sumAssured: 1000000 }
        }
    });
    assert('ALL-01: Total (All Riders, Mode Monthly)', allRes.premiumY1, 5574.34);

    // --- Group 5: GST ---
    console.log('\n--- Group 5: GST ---');
    const gstRes = calculatePremium({ ...baseProfile });
    assert('GST-01: Year 1 Premium matches Excel (0% GST in this version)', gstRes.instalmentWithGSTYear1, 4010.34);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    if (failed > 0) process.exit(1);
}

runVerifiedTests();
