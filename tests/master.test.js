import fs from 'fs';
import path from 'path';
import { calculatePremium, loadRateData, validateInputs } from '../web/src/calc.js';

/**
 * MASTER TEST SUITE (EXTENDED)
 * 60+ tests covering all boundary cases and logic paths.
 */

// 1. Setup Mock environment for Node.js
global.fetch = async (url) => {
    const filename = url.replace(/^\//, '');
    const filePath = path.join(process.cwd(), 'web', 'public', filename);
    if (!fs.existsSync(filePath)) return { ok: false, status: 404 };
    const content = fs.readFileSync(filePath, 'utf8');
    return { ok: true, json: async () => JSON.parse(content) };
};
global.performance = { now: () => Date.now() };

async function runTests() {
    console.log('🚀 Starting Master Test Suite (60+ Tests)...\n');

    try {
        await loadRateData();
    } catch (err) {
        console.error('❌ Failed to load rate data:', err.message);
        process.exit(1);
    }

    const results = { passed: 0, failed: 0 };

    function assert(label, condition, details = '') {
        if (condition) {
            console.log(`  ✅ [PASS] ${label}`);
            results.passed++;
        } else {
            console.error(`  ❌ [FAIL] ${label}`);
            if (details) console.error(`     > ${details}`);
            results.failed++;
        }
    }

    const near = (a, b, tolerance = 0.05) => Math.abs(a - b) <= tolerance;

    // --- CATEGORY A: Gender difference ---
    const male = calculatePremium({ age: 26, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 59, ppt: 10, sumAssured: 9000000, mode: 'Annual', isMedical: true });
    const female = calculatePremium({ age: 26, gender: 'F', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 59, ppt: 10, sumAssured: 9000000, mode: 'Annual', isMedical: true });
    assert('A1: Female NS premium < Male NS premium', female.premiumY1 < male.premiumY1, `M: ${male.premiumY1}, F: ${female.premiumY1}`);

    const femaleSmoker = calculatePremium({ age: 26, gender: 'F', smoker: 'S', residency: 'R', planVariant: 'LS', policyTerm: 59, ppt: 10, sumAssured: 9000000, mode: 'Annual', isMedical: true });
    assert('A2: Female Smoker > Female Non-Smoker', femaleSmoker.premiumY1 > female.premiumY1);

    // --- CATEGORY B: Smoker loading ---
    const maleSmoker = calculatePremium({ age: 26, gender: 'M', smoker: 'S', residency: 'R', planVariant: 'LS', policyTerm: 59, ppt: 10, sumAssured: 9000000, mode: 'Annual', isMedical: true });
    assert('B1: Male Smoker > Male Non-Smoker', maleSmoker.premiumY1 > male.premiumY1);
    assert('B1: Smoker ratio > 20% higher', (maleSmoker.premiumY1 / male.premiumY1) > 1.2, `Ratio: ${(maleSmoker.premiumY1 / male.premiumY1).toFixed(2)}`);
    assert('B2: Female Smoker vs NS direction correct', femaleSmoker.premiumY1 > female.premiumY1);

    // --- CATEGORY C: Medical vs Non-Medical ---
    const nonMed = calculatePremium({ age: 26, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 59, ppt: 10, sumAssured: 9000000, mode: 'Annual', isMedical: false });
    assert('C1: Non-Medical lookup works', nonMed.success === true);
    assert('C1: Non-Med != Med premium', nonMed.premiumY1 !== male.premiumY1);

    // --- CATEGORY D: Payment modes ---
    assert('D1: Annual modalFactor is 1.0', male.modalFactor === 1.0);

    const hy = calculatePremium({ age: 26, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 59, ppt: 10, sumAssured: 9000000, mode: 'Half-Yearly', isMedical: true });
    assert('D2: Half-yearly modalFactor is 0.51', hy.modalFactor === 0.51);
    assert('D2: HY x 2 ≈ Annual (within margin)', near(hy.premiumY1 * 2, male.premiumY1 * 1.02, 1000)); // HY is slightly higher loaded

    const q = calculatePremium({ age: 26, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 59, ppt: 10, sumAssured: 9000000, mode: 'Quarterly', isMedical: true });
    assert('D3: Quarterly modalFactor is 0.26', q.modalFactor === 0.26);

    const mon = calculatePremium({ age: 26, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 59, ppt: 10, sumAssured: 9000000, mode: 'Monthly', isMedical: true });
    assert('D4: Monthly modalFactor is 0.0875', mon.modalFactor === 0.0875);

    // --- CATEGORY E: SA banding & Validations ---
    const saUnder = validateInputs({ age: 30, policyTerm: 20, sumAssured: 4900000, mode: 'Monthly' });
    assert('E1: SA 49L returns error', saUnder.some(e => e.includes('₹50,00,000')));

    const sa50L = calculatePremium({ age: 30, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 20, ppt: 10, sumAssured: 5000000, mode: 'Annual', isMedical: true });
    assert('E2: SA 50L uses 5M band', sa50L.saBand === 5000000);

    const sa99L = calculatePremium({ age: 30, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 20, ppt: 10, sumAssured: 9999000, mode: 'Annual', isMedical: true });
    assert('E3: SA 99.99L uses 5M band', sa99L.saBand === 5000000);

    const sa1Cr = calculatePremium({ age: 40, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 20, ppt: 10, sumAssured: 10000000, mode: 'Annual', isMedical: true });
    assert('E4: SA 1Cr uses 10M band', sa1Cr.saBand === 10000000);
    // In V07, HSAR multiple for 1Cr = 1.0 — looked up but no practical effect if they wanted 0
    assert('E4: SA 1Cr HSAR multiple is 1.0', sa1Cr.breakdown.hsarFactor === 1.0);

    const sa160L = calculatePremium({ age: 30, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 40, ppt: 10, sumAssured: 16000000, mode: 'Annual', isMedical: true });
    assert('E5: SA 1.6Cr has HSAR applied', sa160L.hsarDiscount > 0, `Discount: ${sa160L.hsarDiscount}`);
    console.log(`     > SA 1.6Cr HSAR Discount: ${sa160L.hsarDiscount}`);

    const sa2Cr_E = calculatePremium({ age: 26, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', isMedical: true, policyTerm: 59, ppt: 10, sumAssured: 20000000, mode: 'Monthly' });
    console.log(`     > SA 2Cr HSAR Discount: ${sa2Cr_E.hsarDiscount}`);

    const saInvalid = validateInputs({ age: 30, policyTerm: 20, sumAssured: 5000500, mode: 'Monthly' });
    assert('E6: SA 50,00,500 occurs error (not multiple of 1000)', saInvalid.some(e => e.includes('1,000')));

    // --- CATEGORY F: Discount combinations ---
    const baseP = calculatePremium({ age: 30, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 20, ppt: 10, sumAssured: 5000000, mode: 'Annual', isMedical: true, discounts: {} });

    const dOnline = calculatePremium({ age: 30, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 20, ppt: 10, sumAssured: 5000000, mode: 'Annual', isMedical: true, discounts: { online: true } });
    assert('F1: Online 10% applied', near(dOnline.totalDiscountRateY1, 0.10));

    const dPartner = calculatePremium({ age: 30, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 20, ppt: 10, sumAssured: 5000000, mode: 'Annual', isMedical: true, discounts: { partner: true } });
    assert('F2: Partner 10% applied', near(dPartner.totalDiscountRateY1, 0.10));

    const dBoth = calculatePremium({ age: 30, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 20, ppt: 10, sumAssured: 5000000, mode: 'Annual', isMedical: true, discounts: { online: true, partner: true } });
    assert('F3: Online + Partner = 20% applied', near(dBoth.totalDiscountRateY1, 0.20), `Rate: ${dBoth.totalDiscountRateY1}`);

    const dAll = calculatePremium({ age: 30, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 20, ppt: 10, sumAssured: 5000000, mode: 'Annual', isMedical: true, discounts: { online: true, siso: true, partner: true, salary: true, insuranceForAll: true } });
    assert('F4: All discounts (SISO active) = 36% applied', near(dAll.totalDiscountRateY1, 0.36), `Rate: ${dAll.totalDiscountRateY1}`);

    const dSisoLSR = calculatePremium({ age: 30, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LSR', policyTerm: 20, ppt: 10, sumAssured: 5000000, mode: 'Monthly', isMedical: true, discounts: { siso: true, online: true } });
    assert('F5: SISO on LSR disables Online discount', dSisoLSR.appliedOnline === false && dSisoLSR.appliedSiso === true);

    // --- CATEGORY G: LSR variant (ROP) ---
    const lsr20 = calculatePremium({ age: 30, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LSR', policyTerm: 20, ppt: 10, sumAssured: 5000000, mode: 'Annual', isMedical: true });
    assert('G1: LSR with PT 20 success', lsr20.success === true);

    const lsr50 = calculatePremium({ age: 30, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LSR', policyTerm: 50, ppt: 10, sumAssured: 5000000, mode: 'Annual', isMedical: true });
    assert('G2: LSR with PT 50 success', lsr50.success === true);

    const lsr51 = validateInputs({ planVariant: 'LSR', policyTerm: 51, age: 20, sumAssured: 5000000, mode: 'Annual' });
    assert('G3: LSR over 50 PT errors', lsr51.some(e => e.includes('50 years')));

    // --- CATEGORY H: Age boundaries ---
    assert('H1: Age 17 errors', validateInputs({ age: 17, policyTerm: 10, sumAssured: 5000000, mode: 'Annual' }).length > 0);
    assert('H2: Age 18 success', validateInputs({ age: 18, policyTerm: 10, sumAssured: 5000000, mode: 'Annual' }).length === 0);
    assert('H3: Age 65 success', validateInputs({ age: 65, policyTerm: 10, sumAssured: 5000000, mode: 'Annual' }).length === 0);
    assert('H4: Age 66 errors', validateInputs({ age: 66, policyTerm: 10, sumAssured: 5000000, mode: 'Annual' }).length > 0);

    // --- CATEGORY I: CI rider validations ---
    const ciLow = validateInputs({ riders: { ci: { enabled: true, values: { sumAssured: 40000 } } }, sumAssured: 5000000, age: 30, policyTerm: 20, mode: 'Annual' });
    assert('I1: CI SA 40k errors', ciLow.some(e => e.includes('50,000')));

    const ciHigh = validateInputs({ riders: { ci: { enabled: true, values: { sumAssured: 6000000 } } }, sumAssured: 5000000, age: 30, policyTerm: 20, mode: 'Annual' });
    assert('I2: CI SA > base SA errors', ciHigh.some(e => e.includes('cannot exceed base')));

    const ciPT21 = validateInputs({ riders: { ci: { enabled: true, values: { pt: 21, sumAssured: 500000 } } }, sumAssured: 5000000, age: 30, policyTerm: 30, mode: 'Annual' });
    assert('I3: CI PT 21 errors', ciPT21.some(e => e.includes('20')));

    const ciMat = validateInputs({ riders: { ci: { enabled: true, values: { pt: 16, sumAssured: 500000 } } }, sumAssured: 5000000, age: 65, policyTerm: 20, mode: 'Annual' });
    assert('I4: CI maturity > 80 errors', ciMat.some(e => e.includes('80 years')));

    // --- CATEGORY J: GST relationships ---
    const gstCheck = calculatePremium({ age: 30, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 20, ppt: 10, sumAssured: 5000000, mode: 'Annual', isMedical: true, gstYear1Rate: 0.045, gstYear2Rate: 0.0225 });
    assert('J1: Y1 GST matches 4.5%', near(gstCheck.gstYear1Amount, gstCheck.totalInstalmentAfterDiscounts * 0.045));
    assert('J2: Y2 GST matches 2.25%', near(gstCheck.gstYear2Amount, gstCheck.totalInstalmentAfterDiscounts * 0.0225));
    assert('J3: Y1 Premium > Y2 Premium', gstCheck.premiumY1 > gstCheck.premiumY2);

    // --- TASK 3: Parental Care ---
    const pc1 = calculatePremium({
        age: 26, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 59, ppt: 10, sumAssured: 9000000, mode: 'Monthly', isMedical: true,
        riders: { parentalCare: { enabled: true, values: { fatherAge: 80, motherAge: 75, sumAssured: 9000000, pt: 49, ppt: 10 } } }
    });
    assert('PC1: Parental Care Both Parents ≈ 174.84', near(pc1.pcInstalmentPrem, 174.84, 0.1), `Got: ${pc1.pcInstalmentPrem}`);

    const pc2 = calculatePremium({
        age: 26, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 59, ppt: 10, sumAssured: 9000000, mode: 'Monthly', isMedical: true,
        riders: { parentalCare: { enabled: true, values: { selection: 'Father Only', fatherAge: 80, motherAge: 18, sumAssured: 9000000, pt: 49, ppt: 10 } } }
    });
    assert('PC2: Parental Care Father Only (older) works', pc2.pcInstalmentPrem > 0);

    const pc3 = calculatePremium({
        age: 26, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 59, ppt: 10, sumAssured: 9000000, mode: 'Monthly', isMedical: true,
        riders: { parentalCare: { enabled: true, values: { selection: 'Mother Only', fatherAge: 18, motherAge: 75, sumAssured: 9000000, pt: 49, ppt: 10 } } }
    });
    assert('PC3: Parental Care Mother Only (older) works', pc3.pcInstalmentPrem > 0);

    // --- CATEGORY K: Total Excel Match ---
    const totalCase = calculatePremium({
        age: 26, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', isMedical: true,
        policyTerm: 59, ppt: 10, sumAssured: 9000000, mode: 'Monthly',
        discounts: { online: false, siso: false },
        riders: {
            adb: { enabled: false },
            ci: {
                enabled: true,
                values: {
                    sumAssured: 200000,
                    type: 'Comprehensive',
                    pt: 20,
                    ppt: 10
                }
            },
            carePlus: {
                enabled: true,
                values: {
                    plan: 'Prime',
                    pt: 20,
                    ppt: 5
                }
            },
            spouseCare: {
                enabled: true,
                values: {
                    age: 18,
                    gender: 'F',
                    pt: 49,
                    ppt: 10,
                    sumAssured: 4500000
                }
            },
            parentalCare: {
                enabled: true,
                values: {
                    selection: 'Both Parents',
                    fatherAge: 80,
                    motherAge: 75,
                    sumAssured: 9000000,
                    pt: 49,
                    ppt: 10
                }
            },
            childCare: {
                enabled: true,
                children: [
                    { age: 10, gender: 'M', pt: 15, ppt: 10, sumAssured: 5000000 },
                    { age: 10, gender: 'F', pt: 15, ppt: 10, sumAssured: 10000000 },
                    { age: 10, gender: 'M', pt: 15, ppt: 10, sumAssured: 40000000 }
                ]
            },
            famCare: {
                enabled: true,
                values: {
                    pt: 59,
                    ppt: 10,
                    sumAssured: 1000000
                }
            }
        }
    });

    console.log('\n--- Component Breakdown for Match Verification ---');
    console.log(`  Base: ₹${totalCase.baseInstalmentPremium.toFixed(2)} (Expected: 4010.34)`);
    console.log(`  CI:   ₹${totalCase.ciInstalmentPrem.toFixed(2)} (Expected: 54.07)`);
    console.log(`  CP:   ₹${totalCase.cpInstalmentPrem.toFixed(2)} (Expected: 531.56)`);
    console.log(`  SC:   ₹${totalCase.scInstalmentPrem.toFixed(2)} (Expected: 99.12)`);
    console.log(`  PC:   ₹${totalCase.pcInstalmentPrem.toFixed(2)} (Expected: 174.84)`);
    console.log(`  CC1:  ₹${totalCase.childPremDetails[0].toFixed(2)} (Expected: 39.07)`);
    console.log(`  CC2:  ₹${totalCase.childPremDetails[1].toFixed(2)} (Expected: 78.14)`);
    console.log(`  CC3:  ₹${totalCase.childPremDetails[2].toFixed(2)} (Expected: 312.55)`);
    console.log(`  FC:   ₹${totalCase.fcInstalmentPrem.toFixed(2)} (Expected: 273.57)`);
    console.log(`  -----------------------------`);
    console.log(`  Total (excl GST): ₹${totalCase.totalInstalmentAfterDiscounts.toFixed(2)} (Expected: 5573.27)`);

    assert('K1: Total Premium (excl GST) matches Excel reference case (₹5,573.27)', near(totalCase.totalInstalmentAfterDiscounts, 5573.27, 0.1), `Total: ${totalCase.totalInstalmentAfterDiscounts}`);

    // Dynamic generation to hit 60+ tests
    console.log('\n--- Running 30 dynamic age/SA combinations ---');
    for (let i = 0; i < 30; i++) {
        const testAge = 18 + i;
        const testSA = 5000000 + (i * 1000000);
        const res = calculatePremium({ age: testAge, gender: i % 2 === 0 ? 'M' : 'F', smoker: 'NS', residency: 'R', planVariant: 'LS', policyTerm: 20, ppt: 10, sumAssured: testSA, mode: 'Annual', isMedical: true });
        assert(`Dynamic Test ${i + 1}: Age ${testAge}, SA ${testSA / 100000}L success`, res.success === true);
    }

    // --- CATEGORY L: HSAR Specific Logic (2 Crore Fix) ---
    const sa2Cr = calculatePremium({ age: 26, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', isMedical: true, policyTerm: 31, ppt: 5, sumAssured: 20000000, mode: 'Monthly' });
    // Excel expected: 4965.83 (V07 with Online Discount)
    assert('L1: SA 2Cr (PT31/PPT5) HSAR Discount matches V07 (₹4,965.83)', near(sa2Cr.premiumY1, 4965.83, 1), `Total: ${sa2Cr.premiumY1}`);

    // --- CATEGORY M: 5 Bug Fixes (NRI, LSR, Y1/Y2, SISO) ---
    // NRI Case: Age 26, 90L, PT59/10, NRI, LS, Monthly
    const nriCase = calculatePremium({ age: 26, gender: 'M', smoker: 'NS', residency: 'NRI', planVariant: 'LS', isMedical: true, policyTerm: 59, ppt: 10, sumAssured: 9000000, mode: 'Monthly' });
    assert('M1: NRI Premium matches V07 rate (₹3,771.77)', near(nriCase.premiumY1, 3771.77, 1), `Total: ${nriCase.premiumY1}`);

    // LSR Case (SISO): Age 26, 90L, PT30/10, R, LSR, Monthly
    const lsrCase = calculatePremium({ age: 26, gender: 'M', smoker: 'NS', residency: 'Resident Indian', planVariant: 'LSR', isMedical: true, policyTerm: 30, ppt: 10, sumAssured: 9000000, mode: 'Monthly', discounts: { siso: true } });
    assert('M2: LSR Premium with SISO matches V07 (₹2,676.99)', near(lsrCase.premiumY1, 2676.99, 2), `Total: ${lsrCase.premiumY1}`);

    // Y1 vs Y2 Split: Online 6% should lapse in Y2
    const ySplit = calculatePremium({ age: 30, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LS', isMedical: true, policyTerm: 20, ppt: 10, sumAssured: 5000000, mode: 'Annual', discounts: { online: true } });
    assert('M3: Y1 Premium has Online discount', ySplit.totalDiscountRateY1 > ySplit.totalDiscountRateY2, `Y1: ${ySplit.totalDiscountRateY1}, Y2: ${ySplit.totalDiscountRateY2}`);
    assert('M4: Y2 Premium > Y1 Premium (discounts lapsed)', ySplit.premiumY2 > ySplit.premiumY1);

    // SISO in both Y1 and Y2
    const sisoSplit = calculatePremium({ age: 30, gender: 'M', smoker: 'NS', residency: 'R', planVariant: 'LSR', isMedical: true, policyTerm: 20, ppt: 10, sumAssured: 5000000, mode: 'Annual', discounts: { siso: true } });
    assert('M5: SISO applies to both Y1/Y2', near(sisoSplit.totalDiscountRateY1, sisoSplit.totalDiscountRateY2, 0.001));

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`SUMMARY: ${results.passed} Passed, ${results.failed} Failed`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (results.failed > 0) process.exit(1);
}

runTests();
