/**
 * Premium Calculation Engine for Bajaj Life eTouch II (UIN: 116N198V07)
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

import { CONFIG, loadConfig } from './config.js';
export { CONFIG };

// ═══════════════════════════════════════════
// Constants (Deprecated - Use CONFIG)
// ═══════════════════════════════════════════

export const MODAL_FACTORS = CONFIG.modalFactors;
export const SISO_DISCOUNT_RATE = CONFIG.discounts.siso;
export const CONSTRAINTS = CONFIG.constraints;

export const VARIANTS = ['Life Shield', 'Life Shield ROP'];
export const VARIANT_CODES = { 'Life Shield': 'LS', 'Life Shield ROP': 'LSR' };

export const SMOKER_OPTIONS = ['Non Smoker', 'Non Smoker Preferred', 'Smoker'];
export const SMOKER_CODES = { 'Non Smoker': 'NSR', 'Non Smoker Preferred': 'NSP', Smoker: 'S', NS: 'NSR', S: 'S' };
export const GENDER_OPTIONS = ['Male', 'Female'];
export const GENDER_CODES = { Male: 'M', Female: 'F' };
export const MEDICAL_OPTIONS = ['Medical', 'Non Medical'];
export const RESIDENCE_OPTIONS = ['Resident Indian', 'NRI'];
export const RESIDENCE_CODES = { 'Resident Indian': 'R', 'NRI': 'NR' };
export const MODE_OPTIONS = ['Annual', 'Half-Yearly', 'Quarterly', 'Monthly'];
export const CI_TYPE_OPTIONS = ['Comprehensive', 'Critical', 'Enhanced'];
export const CARE_PLUS_PLAN_OPTIONS = ['Prime', 'Pro', 'Ultra', 'Prestige', 'Optima'];

// ═══════════════════════════════════════════
// Rate Data Store
// ═══════════════════════════════════════════

let medicalRates = null;
let nonMedicalRates = null;
let adbRates = null;
let ciRates = null;
let carePlusRates = null;
let hsarRates = null;
let fprBaseRates = null;
let fprCalcData = null;

export async function loadRateData() {
  const t0 = performance.now();

  // Load config first
  await loadConfig();

  const [medResp, nonMedResp, adbResp, ciResp, cpResp] = await Promise.all([
    fetch('./medical_rates.json'),
    fetch('./non_medical_rates.json'),
    fetch('./adb_rates.json'),
    fetch('./ci_rates.json'),
    fetch('./care_plus_rates.json'),
  ]);

  if (!medResp.ok || !nonMedResp.ok || !adbResp.ok) {
    throw new Error('Failed to load rate data. Run: python extract_rates.py');
  }

  medicalRates = await medResp.json();
  nonMedicalRates = await nonMedResp.json();
  adbRates = await adbResp.json();
  ciRates = ciResp.ok ? await ciResp.json() : {};
  carePlusRates = cpResp.ok ? await cpResp.json() : {};

  try {
    const [hsarResp, fprBaseResp, fprCalcResp] = await Promise.all([
      fetch('./hsar_factors.json'),
      fetch('./fpr_base_rates.json'),
      fetch('./fpr_rate_calculation.json')
    ]);
    if (hsarResp.ok) hsarRates = await hsarResp.json();
    if (fprBaseResp.ok) fprBaseRates = await fprBaseResp.json();
    if (fprCalcResp.ok) fprCalcData = await fprCalcResp.json();
  } catch (e) { console.warn('Secondary rate data not found', e); }

  // Update config with rate count
  CONFIG.ratesLoadedCount = Object.keys(medicalRates).length + Object.keys(nonMedicalRates).length;

  const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
  console.log(`Rate data loaded in ${elapsed}s — Version: ${CONFIG.version}, Medical: ${Object.keys(medicalRates).length}, ADB: ${Object.keys(adbRates).length}, CI: ${Object.keys(ciRates).length}, Care+: ${Object.keys(carePlusRates).length}`);
}

// ═══════════════════════════════════════════
// Lookup Key Construction
// ═══════════════════════════════════════════

/**
 * Base rate key format (from actual data):
 *   Non-Smoker: "26M5910LSNSR5000000"  = Age + Gender + PT + PPT + Variant + 'NS' + Residence + Band
 *   Smoker:     "22F2010LSS5000000"    = Age + Gender + PT + PPT + Variant + 'S' + Band
 */
export function buildBaseKey(age, genderCode, pt, ppt, variant, smokerType, saBand) {
  const g = (genderCode === 'Male' || genderCode === 'M') ? 'M' : 'F';
  return `${age}${g}${pt}${ppt}${variant}${smokerType}${saBand}`;
}

export function buildHSARKey(pptPrefix, maturity, saBand, smokerType, isMedical) {
  const smokerCode = smokerType === 'S' ? 'S' : (smokerType === 'NSP' ? 'NSP' : 'NSR');
  const medCode = isMedical ? 'Medical' : 'Non Medical';
  return `${pptPrefix}-${maturity}-${saBand}-${smokerCode}-${medCode}`;
}

export function buildFPRKey(age, genderCode, pt, ppt, variant, smokerType) {
  const g = (genderCode === 'Male' || genderCode === 'M') ? 'M' : 'F';
  return `${age}${g}${String(pt).padStart(2, '0')}${String(ppt).padStart(2, '0')}${variant}${smokerType}`;
}

export function buildADBKey(age, genderCode, pt, ppt) {
  const g = (genderCode === 'Male' || genderCode === 'M') ? 'M' : 'F';
  return `${age}${g}${pt}${ppt}ADB`;
}

export function buildCIKey(age, pt, ppt, gender, type, medicalType) {
  const g = (gender === 'Male' || gender === 'M') ? 'Male' : 'Female';
  return `${age}-${pt}-${ppt}-${g}-${type}-${medicalType}`;
}

/** Care Plus key: "20-5-Prime" = BenefitTerm + PPT + PlanType */
export function buildCarePlusKey(benefitTerm, ppt, planType) {
  return `${benefitTerm}-${ppt}-${planType}`;
}

export function getSABand(sa) {
  return sa >= 10000000 ? 10000000 : 5000000;
}

function getHSARBand(sa) {
  if (sa >= 20000000) return 20000000;
  if (sa >= 15000000) return 15000000;
  if (sa >= 10000000) return 10000000;
  return 5000000;
}

/** FPR Key: Age + Gender + PT + PPT + RiderCode + Category */
// The previous buildFPRKey is replaced by the new one above.

function getFPRAdjustmentFactor(diff, type) {
  if (!fprCalcData) return 0;

  // column 8: Spouse (LA - Spouse Age)
  // column 11: Parent (Parent - LA Age)
  const colIndex = type === 'spouse' ? 8 : 11;
  const factorCol = colIndex + 1;

  // Search matching row for difference
  for (let i = 2; i < fprCalcData.length; i++) {
    const row = fprCalcData[i];
    const targetDiff = row[colIndex];
    if (targetDiff === undefined || targetDiff === '') continue;

    // Handle "9 and above" or "39 and above"
    if (typeof targetDiff === 'string' && targetDiff.includes('above')) {
      const min = parseInt(targetDiff);
      if (diff >= min) return parseFloat(row[factorCol]) || 0;
    }
    // Handle "20 and below" or "-12 and below"
    if (typeof targetDiff === 'string' && targetDiff.includes('below')) {
      const max = parseInt(targetDiff);
      if (diff <= max) return parseFloat(row[factorCol]) || 0;
    }
    // Direct match
    if (Number(targetDiff) === diff) return parseFloat(row[factorCol]) || 0;
  }
  return 0;
}

// ═══════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════

export function validateInputs(inputs) {
  const errors = [];
  const age = Number(inputs.age || 0);
  const sa = Number(inputs.sa || inputs.sumAssured || 0);
  const pt = Number(inputs.pt || inputs.policyTerm || 0);
  const ppt = Number(inputs.ppt || inputs.premiumPaymentTerm || 0);
  const variant = inputs.variant || inputs.planVariant || 'Life Shield';

  const minBaseSA = Number(CONFIG.constraints.minSA);
  const minBasePT = 5;
  const maxMaturityAge = Number(CONFIG.constraints.maxMaturityAge);

  if (age < Number(CONFIG.constraints.minAge) || age > Number(CONFIG.constraints.maxAge)) {
    errors.push(`Age must be between ${CONFIG.constraints.minAge} and ${CONFIG.constraints.maxAge} years`);
  }
  if ((age + pt) > maxMaturityAge) {
    errors.push(`Maturity Age ${age + pt} exceeds maximum of ${maxMaturityAge} years.`);
  }
  if (sa < minBaseSA) {
    errors.push(`Minimum Sum Assured is ₹${minBaseSA.toLocaleString('en-IN')}`);
  }
  if (pt < minBasePT) {
    errors.push(`Policy Term must be at least ${minBasePT} years`);
  }
  if (sa % 1000 !== 0) {
    errors.push(`Sum Assured must be in multiples of ₹1,000`);
  }
  if (variant === 'Life Shield ROP' || variant === 'LSR' || variant === 'LSRNSR' || variant === 'Life Shield ROP') {
    if (pt > 50) errors.push(`For Life Shield ROP, maximum Policy Term is 50 years`);
  }

  // CI Rider
  const ci = inputs.riders?.ci;
  if (ci?.enabled) {
    const v = ci.values || {};
    const ciSA = Number(v.sumAssured || 0);
    const ciPT = Number(v.pt || 0);
    const ciPPT = Number(v.ppt || ciPT);
    const minCiSA = Number(CONFIG.ciLimits.minSA);
    const maxCiPT = Number(CONFIG.ciLimits.maxPT);

    if (ciSA < minCiSA) {
      errors.push(`Min CI SA is ₹${minCiSA.toLocaleString('en-IN')}`);
    }
    if (ciSA > sa) errors.push(`CI SA cannot exceed base Sum Assured`);
    if (ciPT > maxCiPT) errors.push(`Max CI Policy Term is ${maxCiPT} years`);
    if (ciPPT > ciPT) errors.push(`CI PPT cannot exceed CI PT`);
    if ((age + ciPT) > Number(CONFIG.ciLimits.maxMaturityAge)) {
      errors.push(`CI Maturity Age ${age + ciPT} exceeds maximum of ${CONFIG.ciLimits.maxMaturityAge} years`);
    }
  }

  // Spouse Care
  const sc = inputs.riders?.spouseCare;
  if (sc?.enabled) {
    const v = sc.values || {};
    const sSA = Number(v.sumAssured || 0);
    const sAge = Number(v.age || 0);
    const sPT = Number(v.pt || 0);
    const sPPT = Number(v.ppt || sPT);

    if (sAge < 18 || sAge > 65) errors.push('Spouse Age must be between 18 and 65');
    if (sPT > 57) errors.push('Max Spouse Policy Term: 57 years');
    if (sPPT > sPT) errors.push('Spouse Care PPT cannot exceed Rider PT');
    if (sSA < (sa * 0.5)) errors.push(`Min Spouse SA is 50% of base SA`);
  }

  // Parental Care
  const pc = inputs.riders?.parentalCare;
  if (pc?.enabled) {
    const v = pc.values || {};
    const pPT = Number(v.pt || 0);
    const pPPT = Number(v.ppt || pPT);
    if (pPT > 57) errors.push('Max Parental Policy Term: 57 years');
    if (pPPT > pPT) errors.push('Parental Care PPT cannot exceed Rider PT');
  }

  // Child Care
  const cc = inputs.riders?.childCare?.enabled ? (inputs.riders.childCare.children || []) : [];
  cc.forEach((child, i) => {
    const cPT = Number(child.pt || 0);
    const cPPT = Number(child.ppt || cPT);
    if (cPT > 25) errors.push(`Max Child Care PT: 25 years`);
    if (cPPT > cPT) errors.push(`Child ${i + 1} PPT exceeds PT`);
  });

  // Family Care
  const fc = inputs.riders?.famCare;
  if (fc?.enabled) {
    const v = fc.values || {};
    const fSA = Number(v.sumAssured || 0);
    const fPT = Number(v.pt || 0);
    const fPPT = Number(v.ppt || fPT);
    if (fPT > 82) errors.push('Max Family Care PT: 82 years');
    if (fPPT > fPT) errors.push('Family Care PPT cannot exceed Rider PT');
    if (fSA < 100000 || fSA > sa) errors.push(`Family Care SA invalid`);
  }

  // Care Plus
  const cp = inputs.riders?.carePlus;
  if (cp?.enabled) {
    const v = cp.values || {};
    const cpPT = Number(v.pt || 0);
    const cpPPT = Number(v.ppt || cpPT);
    const lim = CONFIG.carePlusLimits || { minPT: 1, maxPT: 20 };
    if (cpPT < Number(lim.minPT) || cpPT > Number(lim.maxPT)) {
      errors.push(`Care Plus Policy Term must be between ${lim.minPT} and ${lim.maxPT} years`);
    }
    if (cpPPT > cpPT) errors.push('Care Plus PPT cannot exceed Rider PT');
  }

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
    // Additional Discounts
    discounts = {}
  } = inputs;

  // Resolve Aliases (for test compatibility)
  const resolvedSA = Number(sa || inputs.sumAssured || inputs.SA || 0);
  const resolvedPT = Number(pt || inputs.policyTerm || inputs.PT || 0);
  const resolvedVariant = variant || inputs.planVariant || 'Life Shield';
  const resolvedMode = mode || 'Annual';
  const resolvedSmoker = smoker || inputs.smoker || 'Non Smoker';
  const resolvedResidency = residence || inputs.residency || 'Resident Indian';
  const resolvedMedical = (medicalCategory === 'Non Medical' || inputs.isMedical === false) ? 'Non Medical' : 'Medical';

  // Resolve PPT
  let resolvedPPT = Number(ppt);
  if (ppt === 'PT') resolvedPPT = pt;
  else if (ppt === 'Pay Till 60') resolvedPPT = Math.max(60 - age, 5);

  // Codes
  const genderCode = GENDER_CODES[gender] || gender || 'M';
  const variantCode = VARIANT_CODES[resolvedVariant] || resolvedVariant || 'LS';

  // --- VALIDATION START ---
  const validationErrors = validateInputs({
    ...inputs,
    age, pt: resolvedPT, ppt: resolvedPPT, sa: resolvedSA, variant: resolvedVariant
  });
  if (validationErrors.length > 0) {
    return { success: false, errors: validationErrors };
  }
  // --- VALIDATION END ---
  const breakdown = {};
  const residenceCode = RESIDENCE_CODES[resolvedResidency] || 'R';
  const saBand = getSABand(resolvedSA);
  const modalFactor = CONFIG.modalFactors[mode] || CONFIG.modalFactors.Annual;

  // Resolve Smoker/Residency code for V07
  let smokerType = SMOKER_CODES[resolvedSmoker] || resolvedSmoker || 'NSR';
  // V07 Rule: NRI Non-Smokers use NSP key. NRI Smokers use S key.
  if (resolvedResidency === 'NRI' && (smokerType === 'NSR' || smokerType === 'NSP')) {
    smokerType = 'NSP';
  }

  let baseKey = buildBaseKey(age, genderCode, resolvedPT, resolvedPPT, variantCode, smokerType, saBand);
  const rateTable = resolvedMedical === 'Medical' ? medicalRates : nonMedicalRates;
  let baseRate = rateTable ? rateTable[baseKey] : null;

  // FALLBACK: If NSR (Regular) is not found, try NSP (Preferred)
  // In many PT/PPT combinations, the BI data only contains one of the two for non-smokers.
  if (baseRate === null || baseRate === undefined) {
    if (smokerType === 'NSR' && rateTable) {
      const fallbackKey = buildBaseKey(age, genderCode, resolvedPT, resolvedPPT, variantCode, 'NSP', saBand);
      baseRate = rateTable[fallbackKey];
      if (baseRate !== null && baseRate !== undefined) {
        console.warn(`Falling back to NSP rate for key: ${baseKey}`);
      }
    }
  }

  if (baseRate === null || baseRate === undefined) {
    const maxPTForAge = 85 - age;
    if (resolvedPT > maxPTForAge) {
      return {
        success: false,
        errors: [`Policy Term too long. Max PT for Age ${age} is ${maxPTForAge} years (Maturity Age 85).`]
      };
    }

    // Contextual hint for PPT
    const payTill60Value = 60 - age;
    let pptHint = '';
    if (resolvedPPT === 8 && age !== 52) {
      pptHint = ` Note: PPT 8 is only available when it represents "Pay Till 60" (for entry age 52). For Age ${age}, "Pay Till 60" is PPT ${payTill60Value}.`;
    } else if (resolvedPPT !== resolvedPT) {
      pptHint = ` Standard Limited Pay options for most ages are: 5, 6, 10, 12, 15, and 20 years.`;
    }

    return {
      success: false,
      errors: [`The combination of Age ${age}, Gender ${genderCode}, PT ${resolvedPT}, PPT ${resolvedPPT}, and Variant ${resolvedVariant} is not supported in the current rate tables.${pptHint} (Tried Key: ${baseKey}).`],
      lookupKey: baseKey
    };
  }

  let baseAnnualPremium = (baseRate / 1000) * resolvedSA;

  // NRI Loading (Bug 1): Removed in V07 (uses NSP key instead)

  const baseInstalmentPremium = baseAnnualPremium * modalFactor;

  // ── ADB RIDER ─────────────────────────────────
  let adbRate = 0, adbAnnualPrem = 0, adbInstalmentPrem = 0, adbKey = '';
  const adb = inputs.riders?.adb || {};
  const adbv = adb.values || {};
  const resolvedAdbEnabled = adb.enabled;
  const resolvedAdbSAVal = Number(adbv.sumAssured || adb.sumAssured || 0);
  const resolvedAdbSA = resolvedAdbEnabled ? resolvedAdbSAVal : 0;

  if (resolvedAdbSA > 0) {
    adbKey = buildADBKey(age, genderCode, resolvedPT, resolvedPPT);
    adbRate = adbRates ? (adbRates[adbKey] || 0) : 0;
    adbAnnualPrem = (adbRate / 1000) * resolvedAdbSA;
    adbInstalmentPrem = adbAnnualPrem * modalFactor;
  }

  // ── CI RIDER ──────────────────────────────────
  let ciRate = 0, ciAnnualPrem = 0, ciInstalmentPrem = 0, ciKey = '';
  const ci = inputs.riders?.ci || {};
  const civ = ci.values || {};
  const resolvedCiEnabled = ci.enabled;
  const resolvedCiSAVal = Number(civ.sumAssured || ci.sumAssured || 0);
  const resolvedCiPTVal = Number(civ.pt || ci.pt || pt || 20);
  const resolvedCiPPTVal = Number(civ.ppt || ci.ppt || ppt || 5);
  const resolvedCiType = civ.type || ci.type || 'Comprehensive';
  const resolvedCiMed = civ.medicalType || ci.medicalType || 'TeleMedical';

  if (resolvedCiEnabled && resolvedCiSAVal > 0) {
    ciKey = buildCIKey(age, resolvedCiPTVal, resolvedCiPPTVal, genderCode, resolvedCiType, resolvedCiMed);
    ciRate = ciRates ? (ciRates[ciKey] || 0) : 0;
    ciAnnualPrem = (ciRate / 1000) * resolvedCiSAVal;
    ciInstalmentPrem = ciAnnualPrem * modalFactor;
  }

  // ── CARE PLUS RIDER ───────────────────────────
  let cpRate = 0, cpAnnualPrem = 0, cpInstalmentPrem = 0, cpKey = '';
  const cp = inputs.riders?.carePlus || {};
  const cpv = cp.values || {};
  const resolvedCpEnabled = cp.enabled;
  const resolvedCpPT = Number(cpv.pt || cp.pt) || 20;
  const resolvedCpPPT = Number(cpv.ppt || cp.ppt) || 5;
  const resolvedCpPlan = cpv.plan || cp.plan || 'Prime';

  if (resolvedCpEnabled) {
    cpKey = buildCarePlusKey(resolvedCpPT, resolvedCpPPT, resolvedCpPlan);
    cpRate = carePlusRates ? (carePlusRates[cpKey] || 0) : 0;
    cpAnnualPrem = cpRate;
    cpInstalmentPrem = cpAnnualPrem * modalFactor;
  }

  // ── FPR RIDERS ─────────────────────────────────
  // Parental Care (Existing)
  let pcInstalmentPrem = 0;
  const parentalRider = inputs.riders?.parentalCare;
  if (parentalRider?.enabled) {
    const pv = parentalRider.values || {};
    const pPT = pv.pt || 49;
    const pPPT = pv.ppt || resolvedPPT;
    const pKey = buildFPRKey(age, genderCode, pPT, pPPT, 'PC', smokerType);
    const pBaseRate = fprBaseRates ? (fprBaseRates[pKey] || 0) : 0;

    const olderParentAge = Math.max(pv.fatherAge || 0, pv.motherAge || 0);
    const pDiff = olderParentAge - age;
    const pFactor = getFPRAdjustmentFactor(pDiff, 'parent');
    const pAdjustedRate = pBaseRate * (1 + pFactor);
    pcInstalmentPrem = (pAdjustedRate / 1000) * (pv.sumAssured || 0) * modalFactor;
  }

  // Spouse Care
  let scInstalmentPrem = 0;
  const spouseRider = inputs.riders?.spouseCare;
  if (spouseRider?.enabled) {
    const sv = spouseRider.values || {};
    const sPT = sv.pt || 49;
    const sPPT = sv.ppt || resolvedPPT;
    const sKey = buildFPRKey(age, genderCode, sPT, sPPT, 'SC', smokerType);
    const sBaseRate = fprBaseRates ? (fprBaseRates[sKey] || 0) : 0;

    const sDiff = age - (sv.age || Number(sv.spouseAge) || 0);
    const sFactor = getFPRAdjustmentFactor(sDiff, 'spouse');
    const sAdjustedRate = sBaseRate * (1 + sFactor);
    scInstalmentPrem = (sAdjustedRate / 1000) * (sv.sumAssured || 0) * modalFactor;
  }

  // Child Care
  let ccInstalmentPrem = 0;
  const childPremDetails = [];
  const childHub = inputs.riders?.childCare;
  if (childHub?.enabled) {
    const children = childHub.children || [];
    children.forEach((child) => {
      const cPT = child.pt || 15;
      const cPPT = child.ppt || resolvedPPT;
      const cKey = buildFPRKey(age, genderCode, cPT, cPPT, 'CC', smokerType);
      const cBaseRate = fprBaseRates ? (fprBaseRates[cKey] || 0) : 0;
      const cPrem = (cBaseRate / 1000) * (child.sumAssured || 0) * modalFactor;
      ccInstalmentPrem += cPrem;
      childPremDetails.push(cPrem);
    });
  }

  // Fam Care
  let fcInstalmentPrem = 0;
  const famRider = inputs.riders?.famCare;
  if (famRider?.enabled) {
    const fv = famRider.values || {};
    const fPT = fv.pt || 59;
    const fPPT = fv.ppt || resolvedPPT;
    const fKey = buildFPRKey(age, genderCode, fPT, fPPT, 'FC', smokerType);
    const fBaseRate = fprBaseRates ? (fprBaseRates[fKey] || 0) : 0;
    fcInstalmentPrem = (fBaseRate / 1000) * (fv.sumAssured || 0) * modalFactor;
  }

  // ── HSAR DISCOUNT ────────────────────────────────
  let hsarDiscount = 0;
  if (hsarRates && variantCode === 'LS') {
    const hsarBand = getHSARBand(resolvedSA);
    const pptPrefix = resolvedPPT === resolvedPT ? 'RP' : `LP${resolvedPPT}`;
    const maturityAge = age + resolvedPT;

    // V07 Rule: HSAR always uses NSP suffix for Non-Smokers (both Resident and NRI)
    const hsarSmoker = (smokerType === 'NSR' || smokerType === 'NSP') ? 'NSP' : smokerType;
    // V07 Rule: Maturity Age clamped to [59, 61] for lookup
    const searchAge = Math.min(61, Math.max(59, maturityAge));

    let hsarData = null;
    for (let m = searchAge; m >= 59; m--) {
      const key = buildHSARKey(pptPrefix, m, hsarBand, hsarSmoker, resolvedMedical === 'Medical');
      if (hsarRates[key]) {
        hsarData = hsarRates[key];
        break;
      }
    }

    if (hsarData) {
      const hsarMultiplier = hsarData.multiple === 'NA' ? 0 : Number(hsarData.multiple);
      // HSAR Rebate base is stored in medical_rates.json with _HSAR suffix (column 10 in Excel)
      // HSAR Rebate base is stored in the same rate table as the base rate
      const rebateBase = rateTable[baseKey + '_HSAR'] || 0;
      const hsarRebateRate = rebateBase * hsarMultiplier;

      // Formula from Cell B18 in Calc sheet:
      // =IF(B15=FALSE, MIN(45000000, SA-5000000)*IF(SA>50000000, SA/50000000, 1)/100000 * RebateRate, "")
      const saAbove5M = Math.max(0, resolvedSA - 5000000);
      const cappedAbove5M = Math.min(45000000, saAbove5M);
      const superHighSAFactor = resolvedSA > 50000000 ? (resolvedSA / 50000000) : 1;

      const annualDiscount = (cappedAbove5M * superHighSAFactor) / 100000 * hsarRebateRate;
      hsarDiscount = annualDiscount * modalFactor;

      // Update breakdown
      breakdown.hsarFactor = hsarMultiplier;
      breakdown.hsarRebateBase = rebateBase;
    }
  }

  // ── TOTALS (before discounts) ─────────────────
  const totalRiderInstalment = adbInstalmentPrem + ciInstalmentPrem + cpInstalmentPrem + pcInstalmentPrem + scInstalmentPrem + ccInstalmentPrem + fcInstalmentPrem;
  const totalRiderAnnual = adbAnnualPrem + ciAnnualPrem + cpAnnualPrem + (pcInstalmentPrem / modalFactor) + (scInstalmentPrem / modalFactor) + (ccInstalmentPrem / modalFactor) + (fcInstalmentPrem / modalFactor);

  const totalInstalmentBeforeDiscounts = (baseInstalmentPremium - hsarDiscount) + totalRiderInstalment;
  const totalAnnualBeforeDiscounts = (baseAnnualPremium - (hsarDiscount / modalFactor)) + totalRiderAnnual;

  // ── DISCOUNTS ──────────────────────────────────
  // 1. Throughout PPT Discounts (Applied every year)
  const isSiso = !!(sisoEnabled || (discounts && (discounts.siso || discounts.SISO || discounts.Siso)));
  const sisoRate = isSiso ? (CONFIG.discounts.siso || 0.06) : 0;

  const staffRate = (discounts && (discounts.staff || discounts.Staff)) ? (discounts.staffRate || 0.04) : 0;
  const loyaltyRate = (discounts && (discounts.loyalty || discounts.loyaltyBenefit)) ? (CONFIG.discounts.loyalty || 0.01) : 0;

  // 2. Online Sales Discount (In V07, this is a Channel-based First Year benefit)
  // Analysis confirms 10% Online discount for Y1 matches Excel 2094 target.
  const onlineRate = (discounts && (discounts.online || discounts.Online)) ? 0.10 : 0;
  const isOnlineOnlyY1 = true;

  // 3. Other First Year Discounts (Removed after Y1)
  let extraFirstYearRate = 0;
  if (discounts && (discounts.prime || discounts.Prime)) extraFirstYearRate += (CONFIG.discounts.prime || 0.06);
  if (discounts && (discounts.aggregator || discounts.Aggregator)) extraFirstYearRate += (CONFIG.discounts.webAggregator || 0.06);
  if (discounts && (discounts.partner || discounts.Partner)) extraFirstYearRate += (CONFIG.discounts.partner || 0.10);
  if (discounts && (discounts.salaried || discounts.salary || discounts.Salaried)) extraFirstYearRate += (CONFIG.discounts.salaried || 0.05);
  if (discounts && (discounts.insuranceForAll || discounts.InsuranceForAll)) extraFirstYearRate += (CONFIG.discounts.insuranceForAll || 0.05);

  const throughoutRate = sisoRate + staffRate + loyaltyRate + (!isOnlineOnlyY1 ? onlineRate : 0);
  const firstYearOnlyRate = extraFirstYearRate + (isOnlineOnlyY1 ? onlineRate : 0);

  // ── YEAR 1 CALCULATION ────────────────────────
  const totalDiscountRateY1 = throughoutRate + firstYearOnlyRate;
  const totalDiscountAmountY1 = totalInstalmentBeforeDiscounts * totalDiscountRateY1;
  const totalInstalmentAfterDiscountsY1 = totalInstalmentBeforeDiscounts - totalDiscountAmountY1;

  // ── YEAR 2 CALCULATION ────────────────────────
  const totalDiscountRateY2 = throughoutRate;
  const totalDiscountAmountY2 = totalInstalmentBeforeDiscounts * totalDiscountRateY2;
  const totalInstalmentAfterDiscountsY2 = totalInstalmentBeforeDiscounts - totalDiscountAmountY2;

  // ── GST ───────────────────────────────────────
  const gstY1 = CONFIG.gst.year1;
  const gstY2 = CONFIG.gst.year2;

  const instalmentWithGSTYear1 = (totalInstalmentAfterDiscountsY1) * (1 + gstY1);
  const instalmentWithGSTYear2 = (totalInstalmentAfterDiscountsY2) * (1 + gstY2);

  // console.log(`[DEBUG] Final Y1: ${instalmentWithGSTYear1}, Y2: ${instalmentWithGSTYear2}, Disc: ${onlineRate}`);

  // ── EARLY EXIT ────────────────────────────────
  const earlyExitEligible = age <= 50 && resolvedPT >= 35 && (age + resolvedPT) >= 70;

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
    adbKey, adbRate, adbSA: resolvedAdbSA, adbAnnualPrem, adbInstalmentPrem,

    // CI
    ciKey, ciRate, ciSA: resolvedCiSAVal, ciAnnualPrem, ciInstalmentPrem,
    ciPT: resolvedCiPTVal, ciPPT: resolvedCiPPTVal,

    // Care Plus
    cpKey, cpRate, cpAnnualPrem, cpInstalmentPrem,

    // Totals before discounts
    totalRiderInstalment,
    totalInstalmentBeforeDiscounts,

    // Discounts
    sisoEnabled: isSiso,
    sisoRate,
    totalDiscountRateY1,
    totalDiscountRateY2,
    throughoutRate,
    firstYearOnlyRate,

    // HSAR
    hsarDiscount,

    // FPR
    pcInstalmentPrem,
    parentalCareInstalment: pcInstalmentPrem,
    scInstalmentPrem,
    ccInstalmentPrem,
    childPremDetails,
    fcInstalmentPrem,
    famCareInstalment: fcInstalmentPrem,

    // After all discounts
    totalInstalmentAfterDiscounts: totalInstalmentAfterDiscountsY1,
    totalInstalmentAfterDiscountsYear2: totalInstalmentAfterDiscountsY2,
    premiumY1: instalmentWithGSTYear1,
    premiumY2: instalmentWithGSTYear2,

    // GST
    gstY1Rate: gstY1,
    gstY2Rate: gstY2,
    gstYear1Amount: totalInstalmentAfterDiscountsY1 * gstY1,
    gstYear2Amount: totalInstalmentAfterDiscountsY2 * gstY2,
    instalmentWithGSTYear1,
    instalmentWithGSTYear2,

    // Annualized
    totalAnnualBeforeDiscounts,
    annualizedAfterDiscounts: totalAnnualBeforeDiscounts * (1 - totalDiscountRateY1),

    maturityAge: age + resolvedPT,
    earlyExitEligible,
    breakdown,

    // Test compatibility
    appliedOnline: discounts.online && !isSiso,
    appliedSiso: isSiso
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
