/**
 * Core ULIP Calculation Engine for Bajaj Life Goal Assure IV
 */
import { CONFIG } from './config.js';

const ASSET_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || './';

// Cache for rate data
let aprRates = null;
let ciRates = null;
let carePlusRates = null;
let mortalityRates = null; // Normally ULIP has mortality charges table

// LTCG tax comparison constants (Indian tax law, post-July 2024 Union Budget)
const LTCG_PREMIUM_THRESHOLD = 250000;   // ≤ 2.5L → exempt under Section 10(10D)
const LTCG_EXEMPTION_LIMIT   = 125000;   // ₹1.25L per-year LTCG exemption
const LTCG_RATE              = 0.125;    // 12.5% equity LTCG rate

export async function loadRateData() {
    try {
        const [aprR, ciR, cpR, mortR] = await Promise.all([
            fetch(`${ASSET_BASE}apr_rates.json`).catch(() => ({ ok: false })),
            fetch(`${ASSET_BASE}ci_rates.json`).catch(() => ({ ok: false })),
            fetch(`${ASSET_BASE}care_plus_rates.json`).catch(() => ({ ok: false })),
            fetch(`${ASSET_BASE}mortality_rates.json`).catch(() => ({ ok: false }))
        ]);

        if (aprR && aprR.ok) aprRates = await aprR.json();
        if (ciR && ciR.ok) ciRates = await ciR.json();
        if (cpR && cpR.ok) carePlusRates = await cpR.json();
        if (mortR && mortR.ok) mortalityRates = await mortR.json();

        CONFIG.ratesLoadedCount = [aprRates, ciRates, carePlusRates, mortalityRates].filter(Boolean).length;
        console.log(`Loaded ${CONFIG.ratesLoadedCount} rate tables`);
    } catch (e) {
        console.error("Error loading rate tables:", e);
    }
}

/**
 * Validates the inputs
 */
export function validateInputs(inputs) {
    const err = [];
    if (inputs.age < CONFIG.constraints.minAge || inputs.age > CONFIG.constraints.maxAge) {
        err.push({ field: 'age', msg: `Age must be between ${CONFIG.constraints.minAge} and ${CONFIG.constraints.maxAge}` });
    }
    if (inputs.yearlyPremium < CONFIG.constraints.minPremium) {
        err.push({ field: 'yearlyPremium', msg: `Minimum premium is ₹${formatCurrencyWhole(CONFIG.constraints.minPremium)}` });
    }

    // Check total fund allocations
    const totalAlloc = Object.values(inputs.fundAllocations || {}).reduce((a, b) => a + b, 0);
    if (Math.abs(totalAlloc - 100) > 0.1) {
        err.push({ field: 'funds', msg: `Fund allocation must equal 100% (currently ${totalAlloc}%)` });
    }

    if (inputs.pt > 30) {
        err.push({ field: 'pt', msg: `Max PT is 30 years` });
    }

    return err;
}

/**
 * Compute LTCG tax benefit — what the user would owe if their ULIP gain
 * came from an equity mutual fund instead. Returns null when annual
 * premium exceeds the 2.5L exemption threshold (Section 10(10D) lost).
 *
 * @param {{finalFundValue: number}} projection - ULIP projection result
 * @param {number} yearlyPremium - Annual premium (₹)
 * @param {number} payYears - Effective pay years: Math.min(pt, ppt)
 * @returns {null | {
 *   applicable: boolean,
 *   totalInvested: number,
 *   totalGain: number,
 *   taxableGain: number,
 *   hypotheticalLtcg: number,
 *   savings: number,
 * }}
 */
export function computeLtcgBenefit(projection, yearlyPremium, payYears) {
    if (yearlyPremium > LTCG_PREMIUM_THRESHOLD) return null;

    const totalInvested = yearlyPremium * payYears;
    const totalGain = projection.finalFundValue - totalInvested;

    if (totalGain <= 0) {
        return {
            applicable: true,
            totalInvested,
            totalGain,
            taxableGain: 0,
            hypotheticalLtcg: 0,
            savings: 0,
        };
    }

    const taxableGain = Math.max(0, totalGain - LTCG_EXEMPTION_LIMIT);
    const hypotheticalLtcg = taxableGain * LTCG_RATE;

    // savings === hypotheticalLtcg today because the ULIP pays ₹0 tax under 10(10D).
    // They are kept as distinct fields because the UI labels them differently
    // ("LTCG if taxed as Equity MF" vs "You Save") and future comparators
    // (e.g. including surcharge/cess) could make them diverge.
    return {
        applicable: true,
        totalInvested,
        totalGain,
        taxableGain,
        hypotheticalLtcg,
        savings: hypotheticalLtcg,
    };
}

/**
 * Look up the monthly mortality charge in ₹ for the given life at the start
 * of a policy month, using the Excel Charges-sheet table (per-1000 SA/year).
 * Returns 0 when the sum-at-risk is non-positive or the rate table is absent.
 */
function monthlyMortalityCharge(sumAtRisk, gender, ageAtYearStart) {
    if (sumAtRisk <= 0 || !mortalityRates) return 0;
    const table = gender === 'Female' ? mortalityRates.female : mortalityRates.male;
    if (!table) return 0;
    const rate = table[ageAtYearStart] ?? table[String(ageAtYearStart)] ?? 0;
    return (rate * sumAtRisk) / 12000;
}

/**
 * Run the month-by-month ULIP projection for a specific growth scenario.
 *
 * Monthly sequence matches the Excel Scenario sheets (BI_Goal Assure IV):
 *   1. At year start only, add the annualised allocated premium as new units.
 *   2. Deduct PAC (₹/month lookup) and mortality (per-1000 SA on sum-at-risk).
 *   3. Grow unit price by (1+r)^(1/12) and deduct FMC as (fmc_annual/12) of
 *      the grown fund value.
 */
export function calculateULIPProjection(inputs, annualGrowthRate) {
    const { age, gender, pt, ppt, yearlyPremium, saFactor, fundAllocations, channel } = inputs;

    const sumAssured = yearlyPremium * saFactor;
    const monthlyGrowthFactor = Math.pow(1 + annualGrowthRate, 1 / 12);

    // Fund-weighted annual FMC
    let avgFMCAnnual = 0;
    if (CONFIG.charges.fmc) {
        for (const [fund, pct] of Object.entries(fundAllocations)) {
            const fundFMC = CONFIG.charges.fmc[fund] || 0.0135;
            avgFMCAnnual += fundFMC * (pct / 100);
        }
    } else {
        avgFMCAnnual = 0.0135;
    }
    const monthlyFMCRate = avgFMCAnnual / 12;

    const pacMonthlyRs = CONFIG.charges.pac_monthly_rs || {};
    const loyaltyRates = CONFIG.charges.loyalty_addition || {};
    const fundBoosterRates = CONFIG.charges.fund_booster || {};

    const allocRules = CONFIG.charges.allocation[channel] || CONFIG.charges.allocation['other'];
    const matchingAllocRule = allocRules
        ? allocRules.slice().reverse().find(r => r.minPremium <= yearlyPremium) || allocRules[0]
        : null;

    const results = {
        yearlyDetails: [],
        finalFundValue: 0,
        totalNetPremiums: 0,
        totalCharges: { allocation: 0, pac: 0, fmc: 0, mortality: 0 }
    };

    let currentFundValue = 0;
    let currentAge = age;
    // Rolling window of the last 36 month-end fund values, used to compute
    // loyalty additions and the year-20 fund booster (Excel basis: average
    // of last 36 daily-end values, proxied here by month-end values).
    const monthEndHistory = [];

    for (let year = 1; year <= pt; year++) {
        const yearlyPremiumPaid = year <= ppt ? yearlyPremium : 0;
        const allocRateThisYear = (matchingAllocRule && matchingAllocRule.ratesByYear)
            ? (matchingAllocRule.ratesByYear[year - 1] ?? 1)
            : 1;
        const allocChargeAmt = yearlyPremiumPaid * (1 - allocRateThisYear);
        const netPremium = yearlyPremiumPaid - allocChargeAmt;
        results.totalNetPremiums += netPremium;

        const pacRsThisYear = Number(pacMonthlyRs[String(year)] ?? 0);

        let yearlyPAC = 0;
        let yearlyFMC = 0;
        let yearlyMortality = 0;

        for (let month = 0; month < 12; month++) {
            // Month 0: add the annualised net premium as new units.
            if (month === 0 && netPremium > 0) {
                currentFundValue += netPremium;
            }

            // Month-start charges: PAC + mortality on sum-at-risk.
            const sumAtRisk = Math.max(0, sumAssured - currentFundValue);
            const mortRs = monthlyMortalityCharge(sumAtRisk, gender, currentAge);
            currentFundValue -= pacRsThisYear;
            currentFundValue -= mortRs;
            yearlyPAC += pacRsThisYear;
            yearlyMortality += mortRs;

            // Growth then FMC on the grown fund value.
            const grown = currentFundValue * monthlyGrowthFactor;
            const fmcAmt = grown * monthlyFMCRate;
            currentFundValue = grown - fmcAmt;
            yearlyFMC += fmcAmt;

            monthEndHistory.push(currentFundValue);
            if (monthEndHistory.length > 36) monthEndHistory.shift();
        }

        // Year-end additions: loyalty & fund booster, computed on the
        // average of the last 36 month-end fund values, then added to the
        // fund AFTER that average is captured (matches Excel precisely).
        const loyaltyRate = Number(loyaltyRates[String(year)] ?? 0);
        const boosterRate = Number(fundBoosterRates[String(year)] ?? 0);
        let loyaltyAddition = 0;
        let fundBoosterAmount = 0;
        if (loyaltyRate > 0 || boosterRate > 0) {
            const avgBase = monthEndHistory.reduce((a, b) => a + b, 0) / monthEndHistory.length;
            loyaltyAddition = avgBase * loyaltyRate;
            fundBoosterAmount = avgBase * boosterRate;
            currentFundValue += loyaltyAddition + fundBoosterAmount;
        }

        currentAge++;

        results.yearlyDetails.push({
            year,
            age: currentAge - 1,
            premiumPaid: yearlyPremiumPaid,
            allocationCharge: allocChargeAmt,
            fmc: yearlyFMC,
            mortality: yearlyMortality,
            pac: yearlyPAC,
            loyaltyAddition,
            fundBooster: fundBoosterAmount,
            otherCharges: allocChargeAmt + yearlyPAC,
            fundAtEnd: currentFundValue,
            deathBenefit: Math.max(sumAssured, 1.05 * (yearlyPremium * Math.min(year, ppt)), currentFundValue)
        });

        results.totalCharges.allocation += allocChargeAmt;
        results.totalCharges.pac += yearlyPAC;
        results.totalCharges.fmc += yearlyFMC;
        results.totalCharges.mortality += yearlyMortality;
    }

    results.finalFundValue = currentFundValue;
    return results;
}

/**
 * Main Premium Calculator
 */
export function calculatePremium(inputs) {
    const errs = validateInputs(inputs);
    if (errs.length > 0) {
        return { success: false, errors: errs };
    }

    const { yearlyPremium, pt, ppt, saFactor } = inputs;
    const baseSA = yearlyPremium * saFactor;

    // 1. Calculate Fund Projections
    // Scenario 1: 4%
    const proj4 = calculateULIPProjection(inputs, 0.04);
    // Scenario 2: 8%
    const proj8 = calculateULIPProjection(inputs, 0.08);
    // Scenario Custom (dynamic return)
    const projCustom = calculateULIPProjection(inputs, (inputs.customReturn || 8) / 100);

    // 2. Rider calculations
    let adbPremium = 0;
    if (inputs.addons.adb && aprRates) {
        const key = `${pt}-${ppt}`;
        const rate = aprRates[key] || aprRates[`${pt}-10`] || aprRates[`10-${ppt}`] || 0.47;
        adbPremium = (rate / 1000) * baseSA;
    }

    let ciPremium = 0;
    if (inputs.addons.ci && ciRates) {
        ciPremium = (1.5 / 1000) * baseSA;
    }

    let carePlusPremium = 0;
    if (inputs.addons.carePlus && carePlusRates) {
        carePlusPremium = (0.5 / 1000) * baseSA;
    }

    let totalRiderPremium = adbPremium + ciPremium + carePlusPremium;

    // Total payable this year
    let totalInstalmentPremium = yearlyPremium + totalRiderPremium;
    let gstBase = 0;
    let gstRider = totalRiderPremium * 0.18;

    let totalWithGST = totalInstalmentPremium + gstBase + gstRider;

    // Modal factor
    let modalFactor = 1.0;
    if (inputs.mode === 'Half-Yearly') modalFactor = 0.5;
    if (inputs.mode === 'Quarterly') modalFactor = 0.25;
    if (inputs.mode === 'Monthly') modalFactor = 1 / 12;

    const modalPremium = totalWithGST * modalFactor;

    return {
        success: true,
        basePremium: yearlyPremium,
        baseSA: baseSA,
        riderPremium: totalRiderPremium,
        gst: gstBase + gstRider,
        totalAnnualWithGST: totalWithGST,
        modalPremium: modalPremium,

        breakdown: {
            adb: adbPremium,
            ci: ciPremium,
            carePlus: carePlusPremium
        },

        projections: {
            scenario4: proj4,
            scenario8: proj8,
            custom: projCustom
        }
    };
}


// Formatters
export function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
    return '₹' + Math.round(amount).toLocaleString('en-IN');
}

export function formatCurrencyWhole(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '0';
    return Math.round(amount).toLocaleString('en-IN');
}
