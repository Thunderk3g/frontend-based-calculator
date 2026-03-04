/**
 * Premium Calculation Engine for Bajaj Life eTouch II (UIN: 116N198V05)
 * ═══════════════════════════════════════════════════════════════════════
 * Uses real rate data extracted from BI_eTouch II_V05_Ver09.xlsb.
 *
 * Excel Premium Summary structure (Output rows 41-52):
 *   Base Instalment Premium  = (BaseRate / 1000) × SA × ModalFactor
 *   Rider Instalment Premium = CI + ADB (each: (Rate/1000) × RiderSA × ModalFactor)
 *   SISO Discount            = 6% off Base + Riders (if enabled)
 *   Other Discounts          = Online, Partner, Salary, Insurance-for-All, etc.
 *   Total excl GST           = Premium after all discounts + Geographical Extra
 *   Total incl GST Year 1    = Total × (1 + GSTYear1)
 *   Total incl GST Year 2+   = Total × (1 + GSTYear2)
 */

// ═══════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════

export const MODAL_FACTORS = {
  Annual: 1.0,
  'Half-Yearly': 0.51,
  Quarterly: 0.26,
  Monthly: 0.0875,
};

export const SISO_DISCOUNT_RATE = 0.06; // 6%

export const CONSTRAINTS = {
  minAge: 18,
  maxAge: 65,
  maxMaturityAge: 85,
  minSA: 5000000,
};

export const VARIANTS = ['Life Shield', 'Life Shield ROP'];
export const VARIANT_CODES = { 'Life Shield': 'LS', 'Life Shield ROP': 'LSR' };

export const SMOKER_OPTIONS = ['Non Smoker', 'Smoker'];
export const GENDER_OPTIONS = ['Male', 'Female'];
export const GENDER_CODES = { Male: 'M', Female: 'F' };
export const MEDICAL_OPTIONS = ['Medical', 'Non Medical'];
export const RESIDENCE_OPTIONS = ['Resident Indian', 'NRI'];
export const RESIDENCE_CODES = { 'Resident Indian': 'R', NRI: 'P' };
export const MODE_OPTIONS = ['Annual', 'Half-Yearly', 'Quarterly', 'Monthly'];
export const CI_TYPE_OPTIONS = ['Comprehensive', 'Critical', 'Enhanced'];
export const CI_MEDICAL_TYPE_OPTIONS = ['TeleMedical'];
export const CARE_PLUS_PLAN_OPTIONS = ['Prime'];

// ═══════════════════════════════════════════
// Rate Data Store
// ═══════════════════════════════════════════

let medicalRates = null;
let nonMedicalRates = null;
let adbRates = null;
let ciRates = null;
let carePlusRates = null;

export async function loadRateData() {
  const t0 = performance.now();
  const [medResp, nonMedResp, adbResp, ciResp, cpResp] = await Promise.all([
    fetch('/medical_rates.json'),
    fetch('/non_medical_rates.json'),
    fetch('/adb_rates.json'),
    fetch('/ci_rates.json'),
    fetch('/care_plus_rates.json'),
  ]);

  if (!medResp.ok || !nonMedResp.ok || !adbResp.ok) {
    throw new Error('Failed to load rate data. Run: python extract_rates.py');
  }

  medicalRates = await medResp.json();
  nonMedicalRates = await nonMedResp.json();
  adbRates = await adbResp.json();
  ciRates = ciResp.ok ? await ciResp.json() : {};
  carePlusRates = cpResp.ok ? await cpResp.json() : {};

  const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
  console.log(`Rate data loaded in ${elapsed}s — Medical: ${Object.keys(medicalRates).length}, ADB: ${Object.keys(adbRates).length}, CI: ${Object.keys(ciRates).length}, Care+: ${Object.keys(carePlusRates).length}`);
}

// ═══════════════════════════════════════════
// Lookup Key Construction
// ═══════════════════════════════════════════

/**
 * Base rate key format (from actual data):
 *   Non-Smoker: "26M5910LSNSR5000000"  = Age + Gender + PT + PPT + Variant + 'NS' + Residence + Band
 *   Smoker:     "22F2010LSS5000000"    = Age + Gender + PT + PPT + Variant + 'S' + Band
 */
export function buildBaseKey(age, genderCode, pt, ppt, variantCode, isSmoker, residenceCode, saBand) {
  const smokerSuffix = isSmoker ? 'S' : `NS${residenceCode}`;
  return `${age}${genderCode}${pt}${ppt}${variantCode}${smokerSuffix}${saBand}`;
}

/** ADB key: "26M5910ADB" */
export function buildADBKey(age, genderCode, pt, ppt) {
  return `${age}${genderCode}${pt}${ppt}ADB`;
}

/**
 * CI rate key: "26-20-10-Male-Comprehensive-TeleMedical"
 *   = Age + BenefitTerm + PPT + Gender + CIType + MedicalType
 */
export function buildCIKey(age, benefitTerm, ppt, gender, ciType, medicalType) {
  return `${age}-${benefitTerm}-${ppt}-${gender}-${ciType}-${medicalType}`;
}

/** Care Plus key: "20-5-Prime" = BenefitTerm + PPT + PlanType */
export function buildCarePlusKey(benefitTerm, ppt, planType) {
  return `${benefitTerm}-${ppt}-${planType}`;
}

export function getSABand(sa) {
  return sa >= 10000000 ? 10000000 : 5000000;
}

// ═══════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════

export function validateInputs(inputs) {
  const errors = [];
  const { age, pt, sa } = inputs;
  if (age < CONSTRAINTS.minAge) errors.push(`Age must be at least ${CONSTRAINTS.minAge}`);
  if (age > CONSTRAINTS.maxAge) errors.push(`Age must not exceed ${CONSTRAINTS.maxAge}`);
  if (age + pt > CONSTRAINTS.maxMaturityAge) errors.push(`Maturity age (${age + pt}) exceeds ${CONSTRAINTS.maxMaturityAge}`);
  if (sa < CONSTRAINTS.minSA) errors.push(`SA must be at least ₹${(CONSTRAINTS.minSA / 100000).toFixed(0)}L`);
  if (pt < 5) errors.push('Policy Term must be at least 5 years');
  return errors;
}

// ═══════════════════════════════════════════
// Core Calculation (matches Excel Output rows 41–52)
// ═══════════════════════════════════════════

export function calculatePremium(inputs) {
  const {
    age, gender, smoker, variant, pt, ppt, sa,
    mode, medicalCategory, residence,
    sisoEnabled,
    // ADB
    adbSA,
    // CI
    ciEnabled, ciSA, ciPT, ciPPT, ciType, ciMedicalType,
    // Care Plus
    carePlusEnabled, carePlusPT, carePlusPPT, carePlusPlan,
    // GST
    gstYear1Rate, gstYear2Rate,
  } = inputs;

  // Resolve PPT
  let resolvedPPT = Number(ppt);
  if (ppt === 'PT') resolvedPPT = pt;
  else if (ppt === 'Pay Till 60') resolvedPPT = Math.max(60 - age, 5);

  // Codes
  const genderCode = GENDER_CODES[gender] || 'M';
  const isSmoker = smoker === 'Smoker';
  const variantCode = VARIANT_CODES[variant] || 'LS';
  const residenceCode = RESIDENCE_CODES[residence] || 'R';
  const saBand = getSABand(sa);
  const modalFactor = MODAL_FACTORS[mode] || 1.0;

  // ── BASE PREMIUM ──────────────────────────────
  const baseKey = buildBaseKey(age, genderCode, pt, resolvedPPT, variantCode, isSmoker, residenceCode, saBand);
  const rateTable = medicalCategory === 'Medical' ? medicalRates : nonMedicalRates;
  const baseRate = rateTable ? rateTable[baseKey] : null;

  if (baseRate === null || baseRate === undefined) {
    return { success: false, error: `Rate not found for key: ${baseKey}`, lookupKey: baseKey };
  }

  const baseAnnualPremium = (baseRate / 1000) * sa;
  const baseInstalmentPremium = baseAnnualPremium * modalFactor;

  // ── ADB RIDER ─────────────────────────────────
  let adbRate = 0, adbAnnualPrem = 0, adbInstalmentPrem = 0, adbKey = '';
  if (adbSA && adbSA > 0) {
    adbKey = buildADBKey(age, genderCode, pt, resolvedPPT);
    adbRate = adbRates ? (adbRates[adbKey] || 0) : 0;
    adbAnnualPrem = (adbRate / 1000) * adbSA;
    adbInstalmentPrem = adbAnnualPrem * modalFactor;
  }

  // ── CI RIDER ──────────────────────────────────
  let ciRate = 0, ciAnnualPrem = 0, ciInstalmentPrem = 0, ciKey = '';
  const resolvedCiSA = ciEnabled ? (Number(ciSA) || 0) : 0;
  const resolvedCiPT = Number(ciPT) || 20;
  const resolvedCiPPT = Number(ciPPT) || resolvedPPT;
  if (ciEnabled && resolvedCiSA > 0) {
    ciKey = buildCIKey(age, resolvedCiPT, resolvedCiPPT, gender, ciType || 'Comprehensive', ciMedicalType || 'TeleMedical');
    ciRate = ciRates ? (ciRates[ciKey] || 0) : 0;
    ciAnnualPrem = (ciRate / 1000) * resolvedCiSA;
    ciInstalmentPrem = ciAnnualPrem * modalFactor;
  }

  // ── CARE PLUS RIDER ───────────────────────────
  let cpRate = 0, cpAnnualPrem = 0, cpInstalmentPrem = 0, cpKey = '';
  const resolvedCpPT = Number(carePlusPT) || 20;
  const resolvedCpPPT = Number(carePlusPPT) || 5;
  if (carePlusEnabled) {
    cpKey = buildCarePlusKey(resolvedCpPT, resolvedCpPPT, carePlusPlan || 'Prime');
    cpRate = carePlusRates ? (carePlusRates[cpKey] || 0) : 0;
    // Care Plus premium is a flat annual rate (not per 1000)
    // It's the annualized premium directly from the table
    cpAnnualPrem = cpRate;
    cpInstalmentPrem = cpAnnualPrem * modalFactor;
  }

  // ── TOTALS (before discounts) ─────────────────
  const totalRiderInstalment = adbInstalmentPrem + ciInstalmentPrem + cpInstalmentPrem;
  const totalRiderAnnual = adbAnnualPrem + ciAnnualPrem + cpAnnualPrem;

  const totalInstalmentBeforeDiscounts = baseInstalmentPremium + totalRiderInstalment;
  const totalAnnualBeforeDiscounts = baseAnnualPremium + totalRiderAnnual;

  // ── SISO DISCOUNT (applied to total base + riders) ──
  const sisoDiscount = sisoEnabled ? SISO_DISCOUNT_RATE : 0;
  const sisoBaseAmount = baseInstalmentPremium * sisoDiscount;
  const sisoRiderAmount = totalRiderInstalment * sisoDiscount;
  const sisoTotalAmount = sisoBaseAmount + sisoRiderAmount;
  const instalmentAfterSISO = totalInstalmentBeforeDiscounts - sisoTotalAmount;

  // ── After all discounts (same as after SISO for now) ──
  const totalInstalmentAfterDiscounts = instalmentAfterSISO;

  // ── GST ───────────────────────────────────────
  const gstY1 = Number(gstYear1Rate) || 0;
  const gstY2 = Number(gstYear2Rate) || 0;
  const gstYear1Amount = totalInstalmentAfterDiscounts * gstY1;
  const gstYear2Amount = totalInstalmentAfterDiscounts * gstY2;
  const instalmentWithGSTYear1 = totalInstalmentAfterDiscounts + gstYear1Amount;
  const instalmentWithGSTYear2 = totalInstalmentAfterDiscounts + gstYear2Amount;

  // ── EARLY EXIT ────────────────────────────────
  const earlyExitEligible = age <= 50 && pt >= 35 && (age + pt) >= 70;

  return {
    success: true,
    lookupKey: baseKey,

    // Inputs echo
    inputs: { age, gender, smoker, variant, pt, ppt: resolvedPPT, sa, mode, medicalCategory, residence },
    modalFactor,
    saBand,

    // Base
    baseRate,
    baseAnnualPremium,
    baseInstalmentPremium,

    // ADB
    adbKey, adbRate, adbSA: adbSA || 0, adbAnnualPrem, adbInstalmentPrem,

    // CI
    ciKey, ciRate, ciSA: resolvedCiSA, ciAnnualPrem, ciInstalmentPrem,
    ciPT: resolvedCiPT, ciPPT: resolvedCiPPT,

    // Care Plus
    cpKey, cpRate, cpAnnualPrem, cpInstalmentPrem,

    // Totals before discounts
    totalRiderInstalment,
    totalInstalmentBeforeDiscounts,

    // SISO
    sisoEnabled,
    sisoDiscount,
    sisoBaseAmount,
    sisoRiderAmount,
    sisoTotalAmount,
    instalmentAfterSISO,

    // After all discounts
    totalInstalmentAfterDiscounts,

    // GST
    gstY1Rate: gstY1,
    gstY2Rate: gstY2,
    gstYear1Amount,
    gstYear2Amount,
    instalmentWithGSTYear1,
    instalmentWithGSTYear2,

    // Annualized
    totalAnnualBeforeDiscounts,
    annualizedAfterDiscounts: totalAnnualBeforeDiscounts * (1 - sisoDiscount),

    maturityAge: age + pt,
    earlyExitEligible,
  };
}

// ═══════════════════════════════════════════
// Formatters
// ═══════════════════════════════════════════

export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export function formatCurrencyWhole(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
