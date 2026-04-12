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
  // variant should be uppercase, smokerType should be uppercase
  const v = String(variant).toUpperCase();
  const s = String(smokerType).toUpperCase();
  return `${age}${g}${String(pt).padStart(2, '0')}${String(ppt).padStart(2, '0')}${v}${s}`;
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
    const ciSA = Number(v.sumAssured || ci.sumAssured || 0);
    const ciPT = Number(v.pt || ci.pt || 0);
    const ciPPT = Number(v.ppt || ci.ppt || ciPT);
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
    const sSA = Number(v.sumAssured || sc.sumAssured || 0);
    const sAge = Number(v.age || sc.spouseAge || sc.age || 0);
    const sPT = Number(v.pt || sc.pt || 0);
    const sPPT = Number(v.ppt || sc.ppt || sPT);

    if (sAge < 18 || sAge > 65) errors.push('Spouse Age must be between 18 and 65');
    if (sPT > 57) errors.push('Max Spouse Policy Term: 57 years');
    if (sPPT > sPT) errors.push('Spouse Care PPT cannot exceed Rider PT');
    if (sSA < (sa * 0.5)) errors.push(`Min Spouse SA is 50% of base SA`);
  }

  // Parental Care
  const pc = inputs.riders?.parentalCare;
  if (pc?.enabled) {
    const v = pc.values || {};
    const pPT = Number(v.pt || pc.pt || pc.policyTerm || 0);
    const pPPT = Number(v.ppt || pc.ppt || pc.paymentTerm || pPT);
    if (pPT > 57) errors.push('Max Parental Policy Term: 57 years');
    if (pPPT > pPT) errors.push('Parental Care PPT cannot exceed Rider PT');
  }

  // Child Care
  const cc = inputs.riders?.childCare?.enabled ? (inputs.riders.childCare.children || (Array.isArray(inputs.riders.childCare) ? inputs.riders.childCare : [])) : [];
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
    const fSA = Number(v.sumAssured || fc.sumAssured || 0);
    const fPT = Number(v.pt || fc.pt || fc.policyTerm || 0);
    const fPPT = Number(v.ppt || fc.ppt || fc.paymentTerm || fPT);
    if (fPT > 82) errors.push('Max Family Care PT: 82 years');
    if (fPPT > fPT) errors.push('Family Care PPT cannot exceed Rider PT');
    if (fSA < 100000 || fSA > sa) errors.push(`Family Care SA invalid`);
  }

  // Care Plus
  const cp = inputs.riders?.carePlus;
  if (cp?.enabled) {
    const v = cp.values || {};
    const cpPT = Number(v.pt || cp.pt || cp.policyTerm || 0);
    const cpPPT = Number(v.ppt || cp.ppt || cp.paymentTerm || cpPT);
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
    adbInstalmentPrem = Math.round(adbAnnualPrem * modalFactor);
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
  const resolvedCiMed = civ.medicalType || ci.medicalType || medicalCategory || 'TeleMedical';

  if (resolvedCiEnabled && resolvedCiSAVal > 0) {
    ciKey = buildCIKey(age, resolvedCiPTVal, resolvedCiPPTVal, genderCode, resolvedCiType, resolvedCiMed);
    ciRate = ciRates ? (ciRates[ciKey] || 0) : 0;

    // FALLBACK for CI: If exact key not found, try available PPTs for the same PT
    if (ciRate === 0 && ciRates) {
      const commonPPTs = [5, 7, 10, 15, 20, 9];
      for (const p of commonPPTs) {
        const altKey = buildCIKey(age, resolvedCiPTVal, p, genderCode, resolvedCiType, resolvedCiMed);
        if (ciRates[altKey]) {
          ciRate = ciRates[altKey];
          ciKey = altKey;
          console.warn(`CI Fallback for ${age}-${resolvedCiPTVal}-${resolvedCiPPTVal} -> using PPT ${p}`);
          break;
        }
      }
    }

    ciAnnualPrem = (ciRate / 1000) * resolvedCiSAVal;
    ciInstalmentPrem = Math.round(ciAnnualPrem * modalFactor);
  }

  // ── CARE PLUS RIDER ───────────────────────────
  let cpRate = 0, cpAnnualPrem = 0, cpInstalmentPrem = 0, cpKey = '';
  const cp = inputs.riders?.carePlus || {};
  const cpv = cp.values || {};
  const resolvedCpEnabled = !!cp.enabled;
  const resolvedCpPT = Number(cpv.pt || cp.pt || cp.policyTerm || 20);
  const resolvedCpPPT = Number(cpv.ppt || cp.ppt || cp.paymentTerm || 5);
  const resolvedCpPlan = cpv.plan || cp.plan || 'Prime';

  if (resolvedCpEnabled) {
    cpKey = buildCarePlusKey(resolvedCpPT, resolvedCpPPT, resolvedCpPlan);
    cpRate = carePlusRates ? (carePlusRates[cpKey] || 0) : 0;

    // FALLBACK for Care Plus: if exact term not found, try nearest available PPT
    if (cpRate === 0 && carePlusRates) {
      const commonPPTs = [5, 1, 10, 15, 20];
      for (const p of commonPPTs) {
        const altKey = buildCarePlusKey(resolvedCpPT, p, resolvedCpPlan);
        if (carePlusRates[altKey]) {
          cpRate = carePlusRates[altKey];
          cpKey = altKey;
          console.warn(`Care Plus Fallback for PT ${resolvedCpPT} -> using PPT ${p}`);
          break;
        }
      }
    }

    cpAnnualPrem = cpRate;
    cpInstalmentPrem = Math.round(cpAnnualPrem * modalFactor);
  }

  // ── FPR RIDERS ─────────────────────────────────
  // Parental Care
  let pcInstalmentPrem = 0;
  const parentalCare = inputs.riders?.parentalCare;
  if (parentalCare?.enabled) {
    const pv = parentalCare.values || {};
    const pPT = pv.pt || parentalCare.pt || 49;
    const pPPT = pv.ppt || parentalCare.ppt || resolvedPPT;
    const pKey = buildFPRKey(age, genderCode, pPT, pPPT, 'PC', smokerType);
    const pBaseRate = fprBaseRates ? (fprBaseRates[pKey] || 0) : 0;

    const olderParentAge = Math.max(pv.fatherAge || parentalCare.fatherAge || 0, pv.motherAge || parentalCare.motherAge || 0);
    const pDiff = olderParentAge - age;
    const pFactor = getFPRAdjustmentFactor(pDiff, 'parent');
    const pAdjustedRate = pBaseRate * (1 + pFactor);
    pcInstalmentPrem = Math.round((pAdjustedRate / 1000) * (pv.sumAssured || parentalCare.sumAssured || 0) * modalFactor);
  }

  // Spouse Care
  let scInstalmentPrem = 0;
  const spouseRider = inputs.riders?.spouseCare;
  if (spouseRider?.enabled) {
    const sv = spouseRider.values || {};
    const sPT = sv.pt || spouseRider.pt || 49;
    const sPPT = sv.ppt || spouseRider.ppt || resolvedPPT;
    const sKey = buildFPRKey(age, genderCode, sPT, sPPT, 'SC', smokerType);
    const sBaseRate = fprBaseRates ? (fprBaseRates[sKey] || 0) : 0;

    const sDiff = age - (sv.age || Number(sv.spouseAge) || Number(spouseRider.spouseAge) || 0);
    const sFactor = getFPRAdjustmentFactor(sDiff, 'spouse');
    const sAdjustedRate = sBaseRate * (1 + sFactor);
    scInstalmentPrem = Math.round((sAdjustedRate / 1000) * (sv.sumAssured || spouseRider.sumAssured || 0) * modalFactor);
  }

  // Child Care
  let ccInstalmentPrem = 0;
  const childPremDetails = [];
  const childHub = inputs.riders?.childCare;
  if (childHub?.enabled || Array.isArray(childHub)) {
    const children = childHub.children || (Array.isArray(childHub) ? childHub : []);
    children.forEach((child) => {
      const cPT = child.pt || 15;
      const cPPT = child.ppt || resolvedPPT;
      const cKey = buildFPRKey(age, genderCode, cPT, cPPT, 'CC', smokerType);
      const cBaseRate = fprBaseRates ? (fprBaseRates[cKey] || 0) : 0;
      const cPrem = Math.round((cBaseRate / 1000) * (child.sumAssured || 0) * modalFactor);
      ccInstalmentPrem += cPrem;
      childPremDetails.push(cPrem);
    });
  }

  // Fam Care
  let fcInstalmentPrem = 0;
  const famRider = inputs.riders?.famCare;
  if (famRider?.enabled) {
    const fv = famRider.values || {};
    const fPT = fv.pt || famRider.pt || 59;
    const fPPT = fv.ppt || famRider.ppt || resolvedPPT;
    const fKey = buildFPRKey(age, genderCode, fPT, fPPT, 'FC', smokerType);
    const fBaseRate = fprBaseRates ? (fprBaseRates[fKey] || 0) : 0;
    fcInstalmentPrem = Math.round((fBaseRate / 1000) * (fv.sumAssured || famRider.sumAssured || 0) * modalFactor);
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

  // ── DISCOUNTS (Multiplicative/Sequential) ────────────────
  const d = discounts || {};
  const isSiso = !!(sisoEnabled || d.siso || d.SISO || d.Siso);
  const sisoRate = isSiso ? (CONFIG.discounts.siso || 0.06) : 0;
  const primeRate = (d.prime || d.Prime) ? (CONFIG.discounts.prime || 0.05) : 0;
  // Prime implies offline sale. Disable online discount if Prime is selected.
  const onlineRate = ((d.online || d.Online) && primeRate === 0) ? 0.06 : 0;
  const loyaltyRate = (d.loyalty || d.Loyalty || d.loyaltyBenefit) ? (CONFIG.discounts.loyalty || 0.01) : 0;

  const salariedRate = (d.salaried || d.Salaried || d.salary) ? (CONFIG.discounts.salaried || 0.05) : 0;
  const aggregatorRate = (d.aggregator || d.Aggregator) ? (CONFIG.discounts.webAggregator || 0.10) : 0;
  const partnerRate = (d.partner || d.Partner) ? (CONFIG.discounts.partner || 0.10) : 0;
  const insuranceForAllRate = (d.insuranceForAll || d.InsuranceForAll) ? (CONFIG.discounts.insuranceForAll || 0.05) : 0;

  const throughoutDiscounts = [sisoRate, primeRate, loyaltyRate];
  const firstYearDiscounts = [onlineRate, salariedRate, aggregatorRate, partnerRate, insuranceForAllRate];

  // ── YEAR 1 CALCULATION ────────────────────────
  // V07 Reconciliation Fix: Riders get a 100% waiver if "Insurance for All" (First Time Buyer) is active.
  let basePartY1 = (baseInstalmentPremium - hsarDiscount);
  let riderPartY1 = totalRiderInstalment;

  [...throughoutDiscounts, ...firstYearDiscounts].forEach(rate => {
    const rVal = Number(rate || 0);
    if (rVal > 0) {
      basePartY1 *= (1 - rVal);
      riderPartY1 *= (1 - rVal);
    }
  });
  const totalInstalmentAfterDiscountsY1 = basePartY1 + riderPartY1;

  // ── YEAR 2 CALCULATION ────────────────────────
  let basePartY2 = (baseInstalmentPremium - hsarDiscount);
  let riderPartY2 = totalRiderInstalment;

  throughoutDiscounts.forEach(rate => {
    const rVal = Number(rate || 0);
    if (rVal > 0) {
      basePartY2 *= (1 - rVal);
      riderPartY2 *= (1 - rVal);
    }
  });
  const totalInstalmentAfterDiscountsY2 = basePartY2 + riderPartY2;

  const totalDiscountAmountY1 = totalInstalmentBeforeDiscounts - totalInstalmentAfterDiscountsY1;
  const totalDiscountRateY1 = totalInstalmentBeforeDiscounts > 0 ? (totalDiscountAmountY1 / totalInstalmentBeforeDiscounts) : 0;
  const totalDiscountAmountY2 = totalInstalmentBeforeDiscounts - totalInstalmentAfterDiscountsY2;
  const totalDiscountRateY2 = totalInstalmentBeforeDiscounts > 0 ? (totalDiscountAmountY2 / totalInstalmentBeforeDiscounts) : 0;

  const throughoutRate = throughoutDiscounts.reduce((sum, val) => sum + val, 0);
  const firstYearOnlyRate = firstYearDiscounts.reduce((sum, val) => sum + val, 0);

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
    appliedOnline: onlineRate > 0,
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
