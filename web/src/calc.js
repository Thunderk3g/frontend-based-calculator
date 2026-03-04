/**
 * Premium Calculation Engine for Bajaj Life eTouch II (UIN: 116N198V05)
 * Uses real rate data extracted from the BI_eTouch II_V05_Ver09.xlsb workbook.
 *
 * Key Formula:
 *   Base Premium = (Rate / 1000) × SA
 *   Instalment   = Base Premium × Modal Factor × (1 - SISO Discount)
 *   Final        = (Instalment + Riders) × (1 + GST)
 */

// ═══════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════

export const MODAL_FACTORS = {
  Annual: 1.0,
  'Half-Yearly': 0.51,
  'Semi-Annual': 0.51,
  Quarterly: 0.26,
  Monthly: 0.0875,
};

export const GST_RATES = {
  year1: 0.045,   // 4.5% first year
  year2: 0.0225,  // 2.25% second year onwards
};

export const SISO_DISCOUNT_RATE = 0.06; // 6%

export const CONSTRAINTS = {
  minAge: 18,
  maxAge: 65,
  maxMaturityAge: 85,
  minSA: 5000000,  // ₹50 Lakhs
};

export const VARIANTS = ['Life Shield', 'Life Shield ROP'];
export const VARIANT_CODES = {
  'Life Shield': 'LS',
  'Life Shield ROP': 'LSR',
};

export const SMOKER_OPTIONS = ['Non Smoker', 'Smoker'];
export const SMOKER_CODES = {
  'Non Smoker': 'NS',
  Smoker: 'S',
};

export const GENDER_OPTIONS = ['Male', 'Female'];
export const GENDER_CODES = {
  Male: 'M',
  Female: 'F',
};

export const MEDICAL_OPTIONS = ['Medical', 'Non Medical'];

export const RESIDENCE_OPTIONS = ['Resident Indian', 'NRI'];
export const RESIDENCE_CODES = {
  'Resident Indian': 'R',
  NRI: 'P', // Non-resident maps to different code based on Excel keys
};

export const MODE_OPTIONS = ['Annual', 'Half-Yearly', 'Quarterly', 'Monthly'];

export const PPT_OPTIONS = [1, 5, 10, 12, 15, 20, 'PT', 'Pay Till 60'];

// ═══════════════════════════════════════════
// Rate Data Store
// ═══════════════════════════════════════════

let medicalRates = null;
let nonMedicalRates = null;
let adbRates = null;

export async function loadRateData() {
  const t0 = performance.now();
  const [medResp, nonMedResp, adbResp] = await Promise.all([
    fetch('/medical_rates.json'),
    fetch('/non_medical_rates.json'),
    fetch('/adb_rates.json'),
  ]);

  if (!medResp.ok || !nonMedResp.ok || !adbResp.ok) {
    throw new Error('Failed to load rate data. Run: python extract_rates.py');
  }

  medicalRates = await medResp.json();
  nonMedicalRates = await nonMedResp.json();
  adbRates = await adbResp.json();

  const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
  console.log(`Rate data loaded in ${elapsed}s — Medical: ${Object.keys(medicalRates).length} keys, ADB: ${Object.keys(adbRates).length} keys`);
  return { medicalRates, nonMedicalRates, adbRates };
}

export function isRateDataLoaded() {
  return medicalRates !== null;
}

// ═══════════════════════════════════════════
// Lookup Key Construction
// ═══════════════════════════════════════════

/**
 * Build the concatenated lookup key used by the Excel rate tables.
 * Key format from actual data:
 *   Non-Smoker: "26M5910LSNSR5000000" = Age + Gender + PT + PPT + Variant + 'NS' + Residence + Band
 *   Smoker:     "22F2010LSS5000000"   = Age + Gender + PT + PPT + Variant + 'S' + Band
 * Note: Smoker keys do NOT include residence code suffix.
 */
export function buildLookupKey(age, genderCode, pt, ppt, variantCode, isSmoker, residenceCode, saBand) {
  const smokerSuffix = isSmoker ? 'S' : `NS${residenceCode}`;
  return `${age}${genderCode}${pt}${ppt}${variantCode}${smokerSuffix}${saBand}`;
}

/**
 * Build ADB lookup key.
 * Example: "26M5910ADB"
 */
export function buildADBKey(age, genderCode, pt, ppt) {
  return `${age}${genderCode}${pt}${ppt}ADB`;
}

/**
 * Get the SA band for lookup key construction.
 */
export function getSABand(sa) {
  if (sa >= 10000000) return 10000000;
  return 5000000;
}

// ═══════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════

export function validateInputs(inputs) {
  const errors = [];
  const { age, pt, ppt, sa } = inputs;

  if (age < CONSTRAINTS.minAge) errors.push(`Age must be at least ${CONSTRAINTS.minAge} years`);
  if (age > CONSTRAINTS.maxAge) errors.push(`Age must not exceed ${CONSTRAINTS.maxAge} years`);
  if (age + pt > CONSTRAINTS.maxMaturityAge) errors.push(`Maturity age (${age + pt}) exceeds ${CONSTRAINTS.maxMaturityAge} years`);
  if (sa < CONSTRAINTS.minSA) errors.push(`Sum Assured must be at least ₹${(CONSTRAINTS.minSA / 100000).toFixed(0)} Lakhs`);
  if (pt < 5) errors.push('Policy Term must be at least 5 years');

  // PPT validation
  const numPPT = typeof ppt === 'number' ? ppt : parseInt(ppt);
  if (!isNaN(numPPT) && numPPT > pt) {
    errors.push('Premium Payment Term cannot exceed Policy Term');
  }

  return errors;
}

// ═══════════════════════════════════════════
// Core Calculation
// ═══════════════════════════════════════════

export function calculatePremium(inputs) {
  const {
    age, gender, smoker, variant, pt, ppt, sa,
    mode, medicalCategory, residence,
    sisoEnabled, adbSA,
  } = inputs;

  // Resolve PPT
  let resolvedPPT = ppt;
  if (ppt === 'PT' || ppt === pt) resolvedPPT = pt;
  else if (ppt === 'Pay Till 60') resolvedPPT = Math.max(60 - age, 5);
  else resolvedPPT = Number(ppt);

  // Codes
  const genderCode = GENDER_CODES[gender] || 'M';
  const isSmoker = smoker === 'Smoker';
  const variantCode = VARIANT_CODES[variant] || 'LS';
  const residenceCode = RESIDENCE_CODES[residence] || 'R';
  const saBand = getSABand(sa);

  // Build lookup key
  const lookupKey = buildLookupKey(age, genderCode, pt, resolvedPPT, variantCode, isSmoker, residenceCode, saBand);

  // Get rate from table
  const rateTable = medicalCategory === 'Medical' ? medicalRates : nonMedicalRates;
  const baseRate = rateTable ? rateTable[lookupKey] : null;

  if (baseRate === null || baseRate === undefined) {
    return {
      success: false,
      error: `Rate not found for key: ${lookupKey}`,
      lookupKey,
      inputs: { age, gender, smoker, variant, pt, ppt: resolvedPPT, sa, mode, medicalCategory, residence },
    };
  }

  // Calculate base premium
  const annualBasePremium = (baseRate / 1000) * sa;

  // Modal factor
  const modalFactor = MODAL_FACTORS[mode] || 1.0;
  const instalmentBase = annualBasePremium * modalFactor;

  // SISO Discount
  const sisoDiscount = sisoEnabled ? SISO_DISCOUNT_RATE : 0;
  const sisoAmount = instalmentBase * sisoDiscount;
  const instalmentAfterSISO = instalmentBase * (1 - sisoDiscount);

  // ADB Rider
  let adbRate = 0;
  let adbInstalmentPremium = 0;
  let adbAnnualPremium = 0;
  let adbKey = '';
  if (adbSA && adbSA > 0) {
    adbKey = buildADBKey(age, genderCode, pt, resolvedPPT);
    adbRate = adbRates ? adbRates[adbKey] : null;
    if (adbRate) {
      adbAnnualPremium = (adbRate / 1000) * adbSA;
      adbInstalmentPremium = adbAnnualPremium * modalFactor;
    }
  }

  // Total instalment before GST
  const totalInstalmentBeforeGST = instalmentAfterSISO + adbInstalmentPremium;

  // GST calculations
  const gstYear1 = totalInstalmentBeforeGST * GST_RATES.year1;
  const gstYear2 = totalInstalmentBeforeGST * GST_RATES.year2;
  const instalmentWithGSTYear1 = totalInstalmentBeforeGST + gstYear1;
  const instalmentWithGSTYear2 = totalInstalmentBeforeGST + gstYear2;

  // Annualized amounts
  const annualizedAfterSISO = annualBasePremium * (1 - sisoDiscount);
  const annualizedTotal = annualizedAfterSISO + adbAnnualPremium;

  // Early Exit eligibility
  const earlyExitEligible = age <= 50 && pt >= 35 && (age + pt) >= 70;

  return {
    success: true,
    lookupKey,
    inputs: { age, gender, smoker, variant, pt, ppt: resolvedPPT, sa, mode, medicalCategory, residence },

    // Rate
    baseRate,
    saBand,

    // Base premium
    annualBasePremium,
    modalFactor,
    instalmentBase,

    // Discounts
    sisoEnabled,
    sisoDiscount,
    sisoAmount,
    instalmentAfterSISO,

    // Riders
    adbKey,
    adbRate: adbRate || 0,
    adbSA: adbSA || 0,
    adbAnnualPremium,
    adbInstalmentPremium,

    // Totals
    totalInstalmentBeforeGST,

    // GST
    gstYear1Rate: GST_RATES.year1,
    gstYear1,
    gstYear2Rate: GST_RATES.year2,
    gstYear2,

    // Final
    instalmentWithGSTYear1,
    instalmentWithGSTYear2,

    // Annualized
    annualizedAfterSISO,
    annualizedTotal,

    // Info
    earlyExitEligible,
    maturityAge: age + pt,
  };
}

// ═══════════════════════════════════════════
// Formatter
// ═══════════════════════════════════════════

export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCurrencyWhole(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
