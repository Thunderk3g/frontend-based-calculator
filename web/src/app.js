import {
  loadRateData, calculatePremium, validateInputs,
  formatCurrency, formatCurrencyWhole,
  VARIANTS, SMOKER_OPTIONS, GENDER_OPTIONS, MEDICAL_OPTIONS,
  RESIDENCE_OPTIONS, MODE_OPTIONS, CI_TYPE_OPTIONS, CARE_PLUS_PLAN_OPTIONS,
  CONFIG
} from './calc.js';

// ═══════════════════════════════════════════
// Defaults (matches the Excel sample case)
// ═══════════════════════════════════════════

const DEFAULTS = {
  age: 26, gender: 'Male', smoker: 'Non Smoker', variant: 'Life Shield',
  pt: 34, ppt: 34, sa: 9000000, sumAssured: 9000000, mode: 'Monthly',
  medicalCategory: 'Medical', residence: 'Resident Indian',
  isMedical: true, residency: 'R',
  discounts: { online: false, aggregator: false, salaried: false, insuranceForAll: false },
  adbEnabled: false, adbSA: 9000000,
  ciEnabled: false, ciSA: 200000, ciPT: 20, ciPPT: 10, ciType: 'Comprehensive',
  carePlusEnabled: false, carePlusPT: 20, carePlusPPT: 5, carePlusPlan: 'Prime',
  spouseCareEnabled: false, spouseAge: 18, spouseGender: 'Female', spousePT: 49, spousePPT: 10, spouseSA: 4500000,
  childCare: [], childCareEnabled: false,
  famCareEnabled: false, famCarePT: 34, famCarePPT: 34, famCareSA: 1000000,
  parentalCare: { enabled: false, selection: 'Both Parents', fatherAge: 80, motherAge: 75, pt: 34, ppt: 34, sumAssured: 9000000 },
  gstYear1Rate: 0, gstYear2Rate: 0,
};

// ═══════════════════════════════════════════
// App Entry
// ═══════════════════════════════════════════

export async function createApp(root) {
  try {
    console.log("%c BAJAJ LIFE ETOUCH II %c UAT DEPLOYMENT ", "background:#c41230;color:#fff;padding:2px 6px;border-radius:3px 0 0 3px", "background:#1f4e79;color:#fff;padding:2px 6px;border-radius:0 3px 3px 0");
    console.log(`%c Environment: %c UAT \n Path: %c /term-plan-compare/ \n URL: %c http://balicuat.bajajlifeinsurance.com/term-plan-compare/`, "font-weight:bold", "color:#1a73e8", "color:#1a73e8", "color:#1a73e8");
    console.log("UAT Environment Date : 07-04-2026")
    await loadRateData();
    const state = JSON.parse(JSON.stringify(DEFAULTS));
    root.innerHTML = buildHTML();
    const el = getElements();

    setFormValues(el, state);
    bindEvents(el, state);

    // Initial calculation
    runCalculation(el, state);

    // Initial PT hint
    const age = state.age || 26;
    if (el.ptHint) {
      el.ptHint.textContent = `Max PT for Age ${age}: ${85 - age} years`;
    }
  } catch (err) {
    root.innerHTML = `<div style="padding:40px;text-align:center;color:#f43f5e"><h2>Failed to initialize calculator</h2><p>${err.message}</p></div>`;
    console.error('CreateApp failed:', err);
  }
}

// ═══════════════════════════════════════════
// HTML
// ═══════════════════════════════════════════

function opts(arr, id, label) {
  return `<div class="form-group"><label for="${id}">${label}</label><select id="${id}">${arr.map(v => `<option value="${v}">${v}</option>`).join('')}</select></div>`;
}
function inp(id, label, extra = '') {
  return `<div class="form-group"><label for="${id}">${label}</label><input type="number" id="${id}" ${extra} /></div>`;
}

function buildHTML() {
  return `
  <div class="app-container">
    <header class="app-header">
      <div class="brand-badge"><span class="dot"></span>Bajaj Life eTouch II &bull; UIN: 116N198V07</div>
      <h1>Premium Calculator</h1>
      <p class="subtitle">Interactive premium estimation powered by actual rate tables</p>
    </header>

    <div class="content-grid">
      <!-- LEFT: Inputs -->
      <div style="display:flex;flex-direction:column;gap:24px">
        <!-- Base Policy -->
        <div class="card" style="animation-delay:0.1s">
          <div class="section-header"><div class="icon blue">&#9881;</div><h2>Policy Parameters</h2></div>
          <div class="form-grid">
            ${inp('age-input', 'Age (last birthday)', 'min="18" max="65" step="1"')}
            ${opts(GENDER_OPTIONS, 'gender-input', 'Gender')}
            ${opts(SMOKER_OPTIONS, 'smoker-input', 'Smoker Category')}
            ${opts(['Life Shield', 'Life Shield ROP'], 'variant-input', 'Plan Variant')}
            ${opts(MEDICAL_OPTIONS, 'medical-input', 'Premium Category')}
            ${opts(RESIDENCE_OPTIONS, 'residence-input', 'Residence Status')}
            <div class="form-group full-width">
              <label for="sa-input">Sum Assured (&#8377;)</label>
              <input type="number" id="sa-input" min="5000000" step="100000" />
            </div>
            ${inp('pt-input', 'Policy Term (years)', 'min="5" max="67" step="1"')}
            <small id="pt-hint" style="color: #888; display: block; margin-top: -12px; margin-bottom: 8px; font-size: 0.75rem"></small>
            ${inp('ppt-input', 'Payment Term (years)', 'min="1" max="67" step="1"')}
            ${opts(MODE_OPTIONS, 'mode-input', 'Payment Mode')}
          </div>
          <div id="variant-warning" class="variant-warning" style="display:none;margin-top:12px">
             Max Policy Term for Life Shield ROP is 50 years.
          </div>
        </div>

        <!-- Discounts -->
        <div class="card" style="animation-delay:0.12s">
          <div class="section-header"><div class="icon emerald">&#127991;</div><h2>% Discounts</h2></div>
          <div class="discount-grid">
            ${discountToggle('online', 'Online / Direct', '-6%')}
            ${discountToggle('aggregator', 'Account Aggregator', '-6%')}
            ${discountToggle('salaried', 'Salaried Rebate', '-5%')}
            ${discountToggle('insuranceForAll', 'First Time Buyer', '-5%')}
          </div>
        </div>

        <!-- Riders -->
        <div class="card" style="animation-delay:0.15s">
          <div class="section-header"><div class="icon purple">&#128737;</div><h2>Riders</h2></div>

          <!-- ADB -->
          <div class="rider-item">
            <div class="toggle-row"><div><span class="toggle-label">Accidental Death Benefit (ADB)</span></div><label class="toggle-switch"><input type="checkbox" id="adb-toggle" /><span class="slider"></span></label></div>
            <div id="adb-fields" class="rider-content" style="display:none">
              <div class="form-grid">${inp('adb-sa-input', 'ADB Sum Assured (&#8377;)', 'min="0" step="100000"')}</div>
              <div class="rider-prem-label" id="prem-adb">Monthly Premium: ₹0.00</div>
            </div>
          </div>

          <!-- CI -->
          <div class="rider-item">
            <div class="toggle-row"><div><span class="toggle-label">Critical Illness Rider (CI)</span></div><label class="toggle-switch"><input type="checkbox" id="ci-toggle" /><span class="slider"></span></label></div>
            <div id="ci-fields" class="rider-content" style="display:none">
              <div class="form-grid">
                ${opts(CI_TYPE_OPTIONS, 'ci-type-input', 'Rider Type')}
                ${inp('ci-sa-input', 'CI Sum Assured (&#8377;)', 'min="0" step="10000"')}
                ${inp('ci-pt-input', 'Policy Term', 'min="1" max="20" step="1"')}
                ${inp('ci-ppt-input', 'Payment Term', 'min="1" max="20" step="1"')}
              </div>
              <div class="rider-prem-label" id="prem-ci">Monthly Premium: ₹0.00</div>
            </div>
          </div>

          <!-- Care Plus -->
          <div class="rider-item">
            <div class="toggle-row"><div><span class="toggle-label">Care Plus Rider</span></div><label class="toggle-switch"><input type="checkbox" id="cp-toggle" /><span class="slider"></span></label></div>
            <div id="cp-fields" class="rider-content" style="display:none">
              <div class="form-grid">
                ${opts(['Prime', 'Pro', 'Ultra', 'Prestige', 'Optima'], 'cp-plan-input', 'Plan Type')}
                ${inp('cp-pt-input', 'Benefit Term', 'min="1" max="30" step="1"')}
                ${inp('cp-ppt-input', 'Payment Term', 'min="1" max="20" step="1"')}
              </div>
              <div class="rider-prem-label" id="prem-cp">Monthly Premium: ₹0.00</div>
            </div>
          </div>

          <!-- Spouse Care -->
          <div class="rider-item">
            <div class="toggle-row"><div><span class="toggle-label">Spouse Care Rider</span></div><label class="toggle-switch"><input type="checkbox" id="sc-toggle" /><span class="slider"></span></label></div>
            <div id="sc-fields" class="rider-content" style="display:none">
              <div class="form-grid">
                ${inp('sc-age-input', 'Spouse Age', 'min="18" max="65"')}
                ${opts(GENDER_OPTIONS, 'sc-gender-input', 'Spouse Gender')}
                ${inp('sc-sa-input', 'Spouse SA (&#8377;)', 'step="10000"')}
                ${inp('sc-pt-input', 'Policy Term', 'min="1" max="57"')}
                ${inp('sc-ppt-input', 'Payment Term', 'min="1"')}
              </div>
              <div class="rider-prem-label" id="prem-sc">Monthly Premium: ₹0.00</div>
            </div>
          </div>

          <!-- Child Care -->
          <div class="rider-item">
            <div class="toggle-row"><div><span class="toggle-label">Child Care Rider</span></div><label class="toggle-switch"><input type="checkbox" id="cc-toggle" /><span class="slider"></span></label></div>
            <div id="cc-fields" class="rider-content" style="display:none">
              <div id="child-container"></div>
              <button id="btn-add-child" class="btn-secondary" style="margin-top:8px" type="button">+ Add Child</button>
              <div class="rider-prem-label" id="prem-cc">Total Monthly Premium: ₹0.00</div>
            </div>
          </div>

          <!-- Family Care -->
          <div class="rider-item">
            <div class="toggle-row"><div><span class="toggle-label">Family Care Rider</span></div><label class="toggle-switch"><input type="checkbox" id="fc-toggle" /><span class="slider"></span></label></div>
            <div id="fc-fields" class="rider-content" style="display:none">
              <div class="form-grid">
                ${inp('fc-pt-input', 'Policy Term', 'max="82"')}
                ${inp('fc-ppt-input', 'Payment Term')}
                ${inp('fc-sa-input', 'Fam Care SA (&#8377;)', 'step="10000"')}
              </div>
              <div class="rider-prem-label" id="prem-fc">Monthly Premium: ₹0.00</div>
            </div>
          </div>

          <!-- Parental Care -->
          <div class="rider-item">
            <div class="toggle-row"><div><span class="toggle-label">Monthly Income for Parents</span></div><label class="toggle-switch"><input type="checkbox" id="pc-toggle" /><span class="slider"></span></label></div>
            <div id="pc-fields" class="rider-content" style="display:none">
              <div class="form-grid">
                ${opts(['Both Parents', 'Father Only', 'Mother Only'], 'pc-selection-input', 'Coverage')}
                ${inp('pc-father-input', 'Father Age')}
                ${inp('pc-mother-input', 'Mother Age')}
                ${inp('pc-pt-input', 'Policy Term')}
                ${inp('pc-ppt-input', 'Payment Term')}
                <div class="form-group full-width">${inp('pc-sa-input', 'Sum Assured (&#8377;)')}</div>
              </div>
              <div class="rider-prem-label" id="prem-pc">Monthly Premium: ₹0.00</div>
            </div>
          </div>
        </div>

        <!-- GST -->
        <div class="card" style="animation-delay:0.22s">
          <div class="section-header"><div class="icon amber">&#9733;</div><h2>GST Options</h2></div>
          <div class="btn-group" style="margin-bottom:16px">
            <button id="btn-gst-std" class="btn-toggle">Standard (4.5% / 2.25%)</button>
            <button id="btn-gst-none" class="btn-toggle active">No GST (0%)</button>
          </div>
          <div class="form-grid">
            <div class="form-group"><label for="gst1-input">GST Year 1 (%)</label><input type="number" id="gst1-input" min="0" max="30" step="0.1" /></div>
            <div class="form-group"><label for="gst2-input">GST Year 2+ (%)</label><input type="number" id="gst2-input" min="0" max="30" step="0.1" /></div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Results -->
      <div class="results-panel">
        <!-- Validation Error Box -->
        <div id="calc-error-box" style="
          display: none;
          background: #c0392b;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          margin: 10px 0;
          font-size: 14px;
          line-height: 1.6;
        "></div>

        <!-- Summary Cards -->
        <div class="summary-row">
          <div class="summary-card year1" style="animation:fadeInUp .5s ease-out .2s backwards"><div class="card-label">1st Year Instalment</div><div class="card-value" id="res-y1">—</div><div class="card-sub" id="res-y1-sub"></div></div>
          <div class="summary-card renewal" style="animation:fadeInUp .5s ease-out .3s backwards"><div class="card-label">Renewal Instalment</div><div class="card-value" id="res-y2">—</div><div class="card-sub" id="res-y2-sub"></div></div>
        </div>

        <!-- Breakdown -->
        <div class="card" style="animation-delay:0.3s">
          <div class="section-header"><div class="icon emerald">&#128202;</div><h2>Premium Breakdown</h2></div>
          <div class="rate-info" id="rateInfoBox">
            <div><div class="rate-label">Lookup Key</div><div class="rate-key" id="res-key">—</div></div>
            <div><div class="rate-label">Rate / 1000</div><div class="rate-value" id="res-rate">—</div></div>
          </div>
          <table class="breakdown-table"><thead><tr><th>Component</th><th style="text-align:right">Amount</th></tr></thead><tbody id="breakdownBody"></tbody></table>
        </div>

        <!-- Excel Comparison -->
        <div class="card" style="animation-delay:0.35s">
          <div class="section-header"><div class="icon purple">&#128196;</div><h2>Excel Comparison (Sample)</h2></div>
          <div id="excelComparison" style="font-size:0.85rem;color:var(--text-secondary);line-height:1.8"></div>
        </div>

        <!-- Policy Info -->
        <div class="card" style="animation-delay:0.4s">
          <div class="section-header"><div class="icon amber">&#8505;</div><h2>Policy Info</h2></div>
          <div id="policyInfo" style="font-size:0.85rem;color:var(--text-secondary);line-height:1.8"></div>
        </div>
      </div>
    </div>

    <footer class="app-footer">
      <div class="footer-content">
        <div class="version-info">
          <span class="version-label">Rate data:</span> <span class="version-value">${CONFIG.version}</span>
          <span class="divider">|</span>
          <span class="version-label">Last updated:</span> <span class="version-value">${new Date(CONFIG.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span class="divider">|</span>
          <span class="version-label">Keys loaded:</span> <span class="version-value">${CONFIG.ratesLoadedCount.toLocaleString()} rates</span>
        </div>
        <div class="disclaimer">For illustrative purposes only. Actual premiums may vary based on underwriting.</div>
      </div>
    </footer>
  </div>`;
}

// ═══════════════════════════════════════════
// DOM
// ═══════════════════════════════════════════

function getElements() {
  const $ = id => document.getElementById(id);
  return {
    age: $('age-input'), gender: $('gender-input'), smoker: $('smoker-input'), variant: $('variant-input'),
    pt: $('pt-input'), ppt: $('ppt-input'), sa: $('sa-input'), mode: $('mode-input'),
    medical: $('medical-input'), residence: $('residence-input'), siso: $('inp-siso'),
    adbToggle: $('adb-toggle'), adb: $('adb-sa-input'), adbFields: $('adb-fields'), premAdb: $('prem-adb'),
    ciToggle: $('ci-toggle'), ciSA: $('ci-sa-input'), ciPT: $('ci-pt-input'), ciPPT: $('ci-ppt-input'), ciType: $('ci-type-input'), ciFields: $('ci-fields'), premCi: $('prem-ci'),
    cpToggle: $('cp-toggle'), cpPT: $('cp-pt-input'), cpPPT: $('cp-ppt-input'), cpPlan: $('cp-plan-input'), cpFields: $('cp-fields'), premCp: $('prem-cp'),
    scToggle: $('sc-toggle'), scAge: $('sc-age-input'), scGender: $('sc-gender-input'), scSA: $('sc-sa-input'), scPT: $('sc-pt-input'), scPPT: $('sc-ppt-input'), scFields: $('sc-fields'), premSc: $('prem-sc'),
    ccToggle: $('cc-toggle'), ccFields: $('cc-fields'), childContainer: $('child-container'), btnAddChild: $('btn-add-child'), premCc: $('prem-cc'),
    fcToggle: $('fc-toggle'), fcSA: $('fc-sa-input'), fcPT: $('fc-pt-input'), fcPPT: $('fc-ppt-input'), fcFields: $('fc-fields'), premFc: $('prem-fc'),
    pcToggle: $('pc-toggle'), pcSelection: $('pc-selection-input'), pcFather: $('pc-father-input'), pcMother: $('pc-mother-input'), pcPT: $('pc-pt-input'), pcPPT: $('pc-ppt-input'), pcSA: $('pc-sa-input'), pcFields: $('pc-fields'), premPc: $('prem-pc'),
    gst1: $('gst1-input'), gst2: $('gst2-input'), btnGstStd: $('btn-gst-std'), btnGstNone: $('btn-gst-none'),
    variantWarning: $('variant-warning'),
    errorBox: $('calc-error-box'),
    ptHint: $('pt-hint'),
    // Discount toggles
    disco_online: $('inp-disco-online'), disco_aggregator: $('inp-disco-aggregator'),
    disco_salaried: $('inp-disco-salaried'), disco_insuranceForAll: $('inp-disco-insuranceForAll'),
    // Errors
    errSA: $('err-sa'), errBaseGeneral: $('err-base-general'), errADB: $('err-adb'), errCI: $('err-ci'), errCP: $('err-cp'), errSC: $('err-sc'), errCC: $('err-cc'), errFC: $('err-fc'), errPC: $('err-pc'),
    y1: $('res-y1'), y1Sub: $('res-y1-sub'), y2: $('res-y2'), y2Sub: $('res-y2-sub'),
    key: $('res-key'), rate: $('res-rate'),
    body: $('breakdownBody'), comparison: $('excelComparison'), info: $('policyInfo'),
  };
}

function showFieldError(id, message) {
  let el = document.getElementById(id);
  const input = document.getElementById(id.replace('err-', '').replace('-error', ''));

  if (!el && input) {
    el = document.createElement('div');
    el.className = 'merr';
    el.id = id;
    input.parentNode.appendChild(el);
  }

  if (el) {
    el.textContent = message;
    el.style.display = 'flex';
    if (input) input.classList.add('err-border');
    setTimeout(() => {
      if (el) el.style.display = 'none';
      if (input) input.classList.remove('err-border');
    }, 5000);
  }
}

function clearFieldError(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function discountToggle(id, label, pct) {
  return `<div class="toggle-row"><div><span class="toggle-label">${label}</span> <span class="toggle-badge">${pct}</span></div><label class="toggle-switch"><input type="checkbox" id="inp-disco-${id}" /><span class="slider"></span></label></div>`;
}

function setFormValues(el, s) {
  const safeSet = (e, v) => { if (e) e.value = v; };
  const safeCheck = (e, c) => { if (e) e.checked = c; };
  const safeDisp = (e, d) => { if (e) e.style.display = d; };

  safeSet(el.age, s.age); safeSet(el.gender, s.gender); safeSet(el.smoker, s.smoker);
  safeSet(el.variant, s.variant); safeSet(el.pt, s.pt); safeSet(el.ppt, s.ppt);
  safeSet(el.sa, s.sa); safeSet(el.mode, s.mode); safeSet(el.medical, s.medicalCategory);
  safeSet(el.residence, s.residence);

  safeCheck(el.disco_online, s.discounts.online);
  safeCheck(el.disco_aggregator, s.discounts.aggregator);
  safeCheck(el.disco_salaried, s.discounts.salaried);
  safeCheck(el.disco_insuranceForAll, s.discounts.insuranceForAll);

  safeCheck(el.adbToggle, s.adbEnabled); safeSet(el.adb, s.adbSA || s.sa);
  safeCheck(el.ciToggle, s.ciEnabled); safeSet(el.ciSA, s.ciSA); safeSet(el.ciPT, s.ciPT); safeSet(el.ciPPT, s.ciPPT); safeSet(el.ciType, s.ciType);
  safeCheck(el.cpToggle, s.carePlusEnabled); safeSet(el.cpPT, s.carePlusPT); safeSet(el.cpPPT, s.carePlusPPT); safeSet(el.cpPlan, s.carePlusPlan);
  safeCheck(el.scToggle, s.spouseCareEnabled); safeSet(el.scAge, s.spouseAge); safeSet(el.scGender, s.spouseGender); safeSet(el.scSA, s.spouseSA); safeSet(el.scPT, s.spousePT); safeSet(el.scPPT, s.spousePPT);
  safeCheck(el.ccToggle, s.childCare.some(c => c.enabled));
  safeCheck(el.fcToggle, s.famCareEnabled); safeSet(el.fcSA, s.famCareSA); safeSet(el.fcPT, s.famCarePT); safeSet(el.fcPPT, s.famCarePPT);
  safeCheck(el.pcToggle, s.parentalCare?.enabled); safeSet(el.pcSelection, s.parentalCare?.selection || 'Both Parents');
  safeSet(el.pcFather, s.parentalCare?.fatherAge || 80); safeSet(el.pcMother, s.parentalCare?.motherAge || 75);
  safeSet(el.pcPT, s.parentalCare?.pt || 49); safeSet(el.pcPPT, s.parentalCare?.ppt || 10); safeSet(el.pcSA, s.parentalCare?.sumAssured || 9000000);

  safeDisp(el.adbFields, el.adbToggle?.checked ? 'block' : 'none');
  safeDisp(el.ciFields, s.ciEnabled ? 'block' : 'none');
  safeDisp(el.cpFields, s.carePlusEnabled ? 'block' : 'none');
  safeDisp(el.scFields, s.spouseCareEnabled ? 'block' : 'none');
  safeDisp(el.ccFields, el.ccToggle?.checked ? 'block' : 'none');
  safeDisp(el.fcFields, s.famCareEnabled ? 'block' : 'none');
  safeDisp(el.pcFields, el.pcToggle?.checked ? 'block' : 'none');

  safeSet(el.gst1, s.gstYear1Rate * 100); safeSet(el.gst2, s.gstYear2Rate * 100);
  if (el.btnGstNone) el.btnGstNone.classList.toggle('active', s.gstYear1Rate === 0);
  if (el.btnGstStd) el.btnGstStd.classList.toggle('active', s.gstYear1Rate > 0);

  safeDisp(el.variantWarning, s.variant === 'Life Shield ROP' ? 'block' : 'none');

  renderChildren(el, s);
  setInputValues(el, s);
}

function setInputValues(el, s) {
  const safe = (e, val) => {
    if (e && val !== undefined && val !== null) e.value = val;
  };

  // ADB
  safe(el.adb, s.adbSA || s.sa || s.sumAssured);

  // CI
  safe(el.ciSA, s.ciSA || 200000);
  safe(el.ciPT, s.ciPT || 20);
  safe(el.ciPPT, s.ciPPT || 10);
  safe(el.ciType, s.ciType || 'Comprehensive');

  // Care Plus
  safe(el.cpPT, s.carePlusPT || 20);
  safe(el.cpPPT, s.carePlusPPT || 5);
  safe(el.cpPlan, s.carePlusPlan || 'Prime');

  // Spouse
  safe(el.scAge, s.spouseAge || 18);
  safe(el.scSA, s.spouseSA || 4500000);
  safe(el.scPT, s.spousePT || 49);
  safe(el.scPPT, s.spousePPT || 10);
  safe(el.scGender, s.spouseGender || 'Female');

  // Family Care
  safe(el.fcPT, s.famCarePT || 59);
  safe(el.fcPPT, s.famCarePPT || 10);
  safe(el.fcSA, s.famCareSA || 1000000);

  // Parental Care
  safe(el.pcSelection, s.parentalCare?.selection || 'Both Parents');
  safe(el.pcFather, s.parentalCare?.fatherAge || 80);
  safe(el.pcMother, s.parentalCare?.motherAge || 75);
  safe(el.pcPT, s.parentalCare?.pt || 49);
  safe(el.pcPPT, s.parentalCare?.ppt || 10);
  safe(el.pcSA, s.parentalCare?.sumAssured || 9000000);
}

function renderChildren(el, s, childPrems = []) {
  el.childContainer.innerHTML = s.childCare.map((c, i) => {
    const prem = childPrems[i] || 0;
    return `
    <div class="child-card child-item" data-idx="${i}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-weight:600;font-size:0.85rem">Child ${i + 1}</span>
        <button class="btn-remove" type="button">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group"><label>Age</label><input type="number" class="c-age child-age" /></div>
        <div class="form-group"><label>Gender</label><div class="radio-group">
          <label><input type="radio" name="gender-${i}" value="Male" class="c-gender-m"> M</label>
          <label><input type="radio" name="gender-${i}" value="Female" class="c-gender-f"> F</label>
        </div></div>
        <div class="form-group"><label>SA (&#8377;)</label><input type="number" class="c-sa child-sa" /></div>
        <div class="form-group"><label>PT</label><input type="number" class="c-pt child-pt" /></div>
        <div class="form-group"><label>PPT</label><input type="number" class="c-ppt child-ppt" /></div>
      </div>
      <div class="rider-prem-label" style="text-align:right; margin-top:8px; font-size:0.8rem; opacity:0.8">Monthly: ${formatCurrency(prem)}</div>
    </div>`;
  }).join('');

  // Explicit value binding to ensure visibility
  const items = el.childContainer.querySelectorAll('.child-item');
  s.childCare.forEach((c, i) => {
    const item = items[i];
    if (item) {
      item.querySelector('.child-age').value = c.age ?? 10;
      item.querySelector('.child-sa').value = c.sumAssured ?? 5000000;
      item.querySelector('.child-pt').value = c.pt ?? 15;
      item.querySelector('.child-ppt').value = c.ppt ?? 10;
      item.querySelectorAll('input[type="radio"]').forEach(r => {
        r.checked = (r.value === c.gender);
      });
    }
  });

  // Re-bind events for children
  el.childContainer.querySelectorAll('input, select').forEach(e => e.addEventListener('input', () => { readForm(el, s); runCalculation(el, s); }));
  el.childContainer.querySelectorAll('.btn-remove').forEach(btn => btn.addEventListener('click', (e) => {
    e.target.closest('.child-card').remove();
    readForm(el, s); runCalculation(el, s);
  }));
}

function bindEvents(el, state) {
  const recalc = () => { readForm(el, state); runCalculation(el, state); };

  let ageDebounce;
  el.age.addEventListener('input', () => {
    clearTimeout(ageDebounce);
    ageDebounce = setTimeout(() => {
      const v = parseInt(el.age.value);
      if (v >= 18 && v <= 65) {
        if (el.ptHint) el.ptHint.textContent = `Max PT for Age ${v}: ${85 - v} years`;
      }
    }, 600);
  });

  el.age.addEventListener('change', () => {
    let age = parseInt(el.age.value);

    if (isNaN(age) || age < 18) {
      showFieldError('age-error', 'Minimum age is 18 years.');
      age = 18;
      el.age.value = 18;
    } else if (age > 65) {
      showFieldError('age-error', `Maximum entry age is 65 years. Age has been set to 65.`);
      age = 65;
      el.age.value = 65;
    } else {
      clearFieldError('age-error');
    }

    state.age = age;

    // Auto-fix PT if needed
    const maxPT = 85 - age;
    if (state.pt > maxPT) {
      state.pt = maxPT;
      el.pt.value = maxPT;
      showFieldError('pt-error', `Policy Term reduced to ${maxPT} years (Max maturity age is 85).`);
    }

    recalc();
  });

  el.sa.addEventListener('change', () => {
    let sa = parseInt(el.sa.value);
    if (sa < 5000000) {
      showFieldError('sa-error', 'Minimum Sum Assured is ₹50,00,000.');
      return;
    }
    if (sa % 1000 !== 0) {
      showFieldError('sa-error', 'Sum Assured must be a multiple of ₹1,000.');
      return;
    }
    clearFieldError('sa-error');
    state.sa = sa;
    state.sumAssured = sa;
    if (el.adbToggle && el.adbToggle.checked) { el.adb.value = el.sa.value; state.adbSA = sa; }
    recalc();
  });

  el.pt.addEventListener('change', () => {
    let pt = parseInt(el.pt.value);
    const maxPT = 85 - state.age;
    if (pt > maxPT) {
      showFieldError('pt-error', `Maximum Policy Term for Age ${state.age} is ${maxPT} years. (Age + PT cannot exceed 85)`);
      pt = maxPT;
      el.pt.value = maxPT;
    } else if (pt < 5) {
      showFieldError('pt-error', 'Minimum Policy Term is 5 years.');
      // No auto-correct for min PT mentioned but good for consistency
    } else {
      clearFieldError('pt-error');
    }

    // LSR Constraint
    if ((state.variant === 'Life Shield ROP' || state.variant === 'LSR') && pt > 50) {
      showFieldError('pt-error', 'Maximum Policy Term for Life Shield ROP is 50 years.');
      pt = 50;
      el.pt.value = 50;
    }

    state.pt = pt;
    state.policyTerm = pt;
    state.ppt = pt; el.ppt.value = pt; // Excel logic: Default to Regular Pay (PT = PPT)
    recalc();
  });

  el.ppt.addEventListener('change', () => {
    let ppt = parseInt(el.ppt.value);
    if (ppt > state.pt) {
      showFieldError('ppt-error', `Payment Term cannot exceed Policy Term (${state.pt} years).`);
      ppt = state.pt;
      el.ppt.value = state.pt;
    } else if (ppt < 1) {
      showFieldError('ppt-error', 'Minimum Payment Term is 1 year.');
      ppt = 1;
      el.ppt.value = 1;
    } else {
      clearFieldError('ppt-error');
    }
    state.ppt = ppt;
    recalc();
  });

  el.ciSA.addEventListener('change', () => {
    let ciSA = parseInt(el.ciSA.value);
    if (ciSA < 50000) showFieldError('ci-sa-error', 'Minimum CI Sum Assured is ₹50,000.');
    else if (ciSA > state.sa) showFieldError('ci-sa-error', 'CI Sum Assured cannot exceed base Sum Assured.');
    else if (state.residency === 'NR' && ciSA > 5000000) showFieldError('ci-sa-error', 'For NRI customers, maximum CI Sum Assured is ₹50,00,000.');
    else clearFieldError('ci-sa-error');
    recalc();
  });

  el.ciPT.addEventListener('change', () => {
    let ciPT = parseInt(el.ciPT.value);
    if (ciPT > 20) showFieldError('ci-pt-error', 'Maximum CI Policy Term is 20 years.');
    else if (state.age + ciPT > 80) showFieldError('ci-pt-error', 'CI Rider maturity age cannot exceed 80 years.');
    else clearFieldError('ci-pt-error');
    recalc();
  });

  [el.adb, el.ciPPT, el.cpPT, el.cpPPT, el.scAge, el.scSA, el.scPT, el.scPPT, el.fcSA, el.fcPT, el.fcPPT, el.pcFather, el.pcMother, el.pcPT, el.pcPPT, el.pcSA, el.gst1, el.gst2].forEach(e => {
    if (e) e.addEventListener('change', recalc);
  });

  el.gender.addEventListener('change', () => { state.gender = el.gender.value; recalc(); });
  el.smoker.addEventListener('change', () => { state.smoker = el.smoker.value; recalc(); });
  el.variant.addEventListener('change', () => { state.variant = el.variant.value; recalc(); });
  el.mode.addEventListener('change', () => { state.mode = el.mode.value; recalc(); });
  el.medical.addEventListener('change', () => { state.medicalCategory = el.medical.value; recalc(); });

  el.residence.addEventListener('change', () => {
    state.residence = el.residence.value;
    state.residency = (state.residence === 'NRI' ? 'NR' : 'R');
    if (state.residency === 'NR' && state.smoker !== 'Smoker') {
      state.smoker = 'Non Smoker Preferred';
      el.smoker.value = 'Non Smoker Preferred';
    }
    recalc();
  });

  // Discount toggles
  [el.disco_online, el.disco_aggregator, el.disco_salaried, el.disco_insuranceForAll].forEach(e => e.addEventListener('change', recalc));

  // Toggles visibility logic
  el.adbToggle.addEventListener('change', () => {
    el.adbFields.style.display = el.adbToggle.checked ? 'block' : 'none';
    state.adbEnabled = el.adbToggle.checked;
    if (state.adbEnabled && (!state.adbSA || state.adbSA === 0)) {
      state.adbSA = state.sa;
    }
    recalc();
  });
  el.ciToggle.addEventListener('change', () => { el.ciFields.style.display = el.ciToggle.checked ? 'block' : 'none'; recalc(); });
  el.cpToggle.addEventListener('change', () => { el.cpFields.style.display = el.cpToggle.checked ? 'block' : 'none'; recalc(); });
  el.scToggle.addEventListener('change', () => { el.scFields.style.display = el.scToggle.checked ? 'block' : 'none'; recalc(); });
  el.ccToggle.addEventListener('change', () => {
    el.ccFields.style.display = el.ccToggle.checked ? 'block' : 'none';
    if (el.ccToggle.checked && state.childCare.length === 0) {
      state.childCare = [{ enabled: true, age: 10, gender: 'Male', pt: 15, ppt: 10, sumAssured: 5000000 }];
      renderChildren(el, state);
    }
    recalc();
  });
  el.fcToggle.addEventListener('change', () => { el.fcFields.style.display = el.fcToggle.checked ? 'block' : 'none'; recalc(); });
  el.pcToggle.addEventListener('change', () => {
    el.pcFields.style.display = el.pcToggle.checked ? 'block' : 'none';
    recalc();
  });

  el.btnAddChild.addEventListener('click', () => {
    readForm(el, state);
    if (state.childCare.length < 3) {
      const idx = state.childCare.length;
      const childDefaults = [
        { enabled: true, age: 10, gender: 'Male', pt: 15, ppt: 10, sumAssured: 5000000 },
        { enabled: true, age: 10, gender: 'Female', pt: 15, ppt: 10, sumAssured: 10000000 },
        { enabled: true, age: 10, gender: 'Male', pt: 15, ppt: 10, sumAssured: 40000000 }
      ];
      state.childCare.push(childDefaults[idx]);
      renderChildren(el, state);
      recalc();
    }
  });

  // GST Buttons
  el.btnGstStd.addEventListener('click', () => {
    el.gst1.value = 4.5; el.gst2.value = 2.25;
    el.btnGstStd.classList.add('active'); el.btnGstNone.classList.remove('active');
    recalc();
  });
  el.btnGstNone.addEventListener('click', () => {
    el.gst1.value = 0; el.gst2.value = 0;
    el.btnGstNone.classList.add('active'); el.btnGstStd.classList.remove('active');
    recalc();
  });



  el.residence.addEventListener('change', () => {
    state.residence = el.residence.value;
    if (state.residence === 'NRI' && state.smoker !== 'Smoker') {
      state.smoker = 'Non Smoker Preferred';
      el.smoker.value = 'Non Smoker Preferred';
    }
    recalc();
  });
}

function readForm(el, s) {
  s.age = parseInt(el.age.value) || 0; s.gender = el.gender.value; s.smoker = el.smoker.value;
  s.variant = el.variant.value; s.pt = parseInt(el.pt.value) || 0; s.ppt = parseInt(el.ppt.value) || 0;
  s.sa = parseInt(el.sa.value) || 0; s.mode = el.mode.value; s.medicalCategory = el.medical.value;
  s.residence = el.residence.value;
  s.residency = (s.residence === 'NRI' ? 'NR' : 'R');
  s.isMedical = (s.medicalCategory === 'Medical');

  s.discounts = {
    online: el.disco_online.checked,
    aggregator: el.disco_aggregator.checked,
    salaried: el.disco_salaried.checked,
    insuranceForAll: el.disco_insuranceForAll.checked
  };

  s.adbEnabled = el.adbToggle.checked;
  s.adbSA = el.adbToggle.checked ? (parseInt(el.adb.value) || 0) : 0;
  s.ciEnabled = el.ciToggle.checked; s.ciSA = parseInt(el.ciSA.value) || 0;
  s.ciPT = parseInt(el.ciPT.value) || 20; s.ciPPT = parseInt(el.ciPPT.value) || 10;
  s.ciType = el.ciType.value;
  s.carePlusEnabled = el.cpToggle.checked; s.carePlusPT = parseInt(el.cpPT.value) || 20;
  s.carePlusPPT = parseInt(el.cpPPT.value) || 5; s.carePlusPlan = el.cpPlan.value;

  s.spouseCareEnabled = el.scToggle.checked;
  s.spouseAge = parseInt(el.scAge.value) || 0; s.spouseGender = el.scGender.value;
  s.spouseSA = parseInt(el.scSA.value) || 0; s.spousePT = parseInt(el.scPT.value) || 0; s.spousePPT = parseInt(el.scPPT.value) || 0;

  s.parentalCare = {
    enabled: el.pcToggle.checked,
    selection: el.pcSelection.value,
    fatherAge: parseInt(el.pcFather.value) || 0,
    motherAge: parseInt(el.pcMother.value) || 0,
    pt: parseInt(el.pcPT.value) || 0,
    ppt: parseInt(el.pcPPT.value) || 0,
    sumAssured: parseInt(el.pcSA.value) || 0
  };

  s.famCareEnabled = el.fcToggle.checked;
  s.famCareSA = parseInt(el.fcSA.value) || 0; s.famCarePT = parseInt(el.fcPT.value) || 0; s.famCarePPT = parseInt(el.fcPPT.value) || 0;

  const cards = el.childContainer.querySelectorAll('.child-card');
  s.childCare = Array.from(cards).map((card, i) => {
    const m = card.querySelector(`input[name="gender-${i}"]:checked`);
    return {
      enabled: el.ccToggle.checked,
      age: parseInt(card.querySelector('.child-age').value) || 0,
      gender: m ? m.value : 'Male',
      sumAssured: parseInt(card.querySelector('.child-sa').value) || 0,
      pt: parseInt(card.querySelector('.child-pt').value) || 0,
      ppt: parseInt(card.querySelector('.child-ppt').value) || 0
    };
  });

  s.gstYear1Rate = (parseFloat(el.gst1.value) || 0) / 100;
  s.gstYear2Rate = (parseFloat(el.gst2.value) || 0) / 100;
}

// ═══════════════════════════════════════════
// Render
// ═══════════════════════════════════════════

function runCalculation(el, state) {
  // Clear previous inline errors
  Object.values(el).forEach(e => { if (e && e.classList && e.classList.contains('field-error')) e.textContent = ''; });

  // Note: Local validation mapping simplified. Errors are now primarily displayed 
  // via the validationAlert box returned by calculatePremium() for better UX.

  // Toggle variant warning
  el.variantWarning.style.display = state.variant === 'Life Shield ROP' ? 'block' : 'none';

  // SISO Rule Enforcement (LSR only)
  if (state.variant !== 'Life Shield ROP' && el.siso?.checked) {
    el.siso.checked = false;
    state.discounts.siso = false;
  }

  console.log('Calculation Start | ADB Enabled:', state.adbEnabled, 'ADB SA:', state.adbSA);

  const r = calculatePremium({
    ...state,
    riders: {
      adb: { enabled: state.adbEnabled, sumAssured: state.adbSA },
      ci: { enabled: state.ciEnabled, sumAssured: state.ciSA, pt: state.ciPT, ppt: state.ciPPT, ciType: state.ciType },
      carePlus: { enabled: state.carePlusEnabled, pt: state.carePlusPT, ppt: state.carePlusPPT, plan: state.carePlusPlan },
      parentalCare: state.parentalCare,
      spouseCare: { enabled: state.spouseCareEnabled, spouseAge: state.spouseAge, spouseGender: state.spouseGender, sumAssured: state.spouseSA, pt: state.spousePT, ppt: state.spousePPT },
      childCare: state.childCare,
      famCare: { enabled: state.famCareEnabled, sumAssured: state.famCareSA, pt: state.famCarePT, ppt: state.famCarePPT }
    }
  });

  if (!r.success) {
    if (el.errorBox) {
      el.errorBox.style.display = 'block';
      el.errorBox.innerHTML = (r.errors || [r.error])
        .map(e => `⚠️ ${e}`)
        .join('<br>');
    }

    // Hide summaries and breakdowns using styling
    el.y1.textContent = '—';
    el.y1Sub.textContent = '';
    el.y2.textContent = '—';
    el.y2Sub.textContent = '';
    el.key.textContent = r.lookupKey || '—';
    el.rate.textContent = '—';
    el.body.innerHTML = '';
    el.info.innerHTML = '';
    el.comparison.innerHTML = '';
    return;
  }

  // Clear error box on success
  if (el.errorBox) el.errorBox.style.display = 'none';

  // Update rider premiums displayed in cards
  const m = r.inputs.mode || 'Annual';
  el.premAdb.textContent = `${m} Premium: ${formatCurrency(r.adbInstalmentPrem)}`;
  el.premCi.textContent = `${m} Premium: ${formatCurrency(r.ciInstalmentPrem)}`;
  el.premCp.textContent = `${m} Premium: ${formatCurrency(r.cpInstalmentPrem)}`;
  el.premSc.textContent = `${m} Premium: ${formatCurrency(r.scInstalmentPrem)}`;
  el.premPc.textContent = `${m} Premium: ${formatCurrency(r.pcInstalmentPrem)}`;
  el.premCc.textContent = `Total ${m} Premium: ${formatCurrency(r.ccInstalmentPrem)}`;
  el.premFc.textContent = `${m} Premium: ${formatCurrency(r.fcInstalmentPrem)}`;

  // Update individual child premium labels without re-rendering cards
  const childCards = el.childContainer.querySelectorAll('.child-card');
  childCards.forEach((card, idx) => {
    const label = card.querySelector('.rider-prem-label');
    if (label) {
      label.textContent = `${m}: ${formatCurrency(r.childPremDetails[idx] || 0)}`;
    }
  });

  render(el, r);
}

function clear(el) {
  el.y1.textContent = '—'; el.y2.textContent = '—'; el.rate.textContent = '—';
  el.body.innerHTML = ''; el.info.innerHTML = ''; el.comparison.innerHTML = '';
}

function render(el, r) {
  const modeMap = { 'Monthly': '/mon', 'Annual': '/yr', 'Half-Yearly': '/hlyr', 'Quarterly': '/qtr' };
  const modeSuffix = modeMap[r.inputs.mode || 'Annual'] || '';

  // Summary
  el.y1.textContent = formatCurrency(r.instalmentWithGSTYear1).replace('.00', '') + modeSuffix;
  el.y1Sub.textContent = r.gstY1Rate > 0 ? `Incl. GST @ ${(r.gstY1Rate * 100).toFixed(1)}% = ${formatCurrency(r.gstYear1Amount)}` : 'GST: 0%';
  el.y2.textContent = formatCurrency(r.instalmentWithGSTYear2).replace('.00', '') + modeSuffix;
  el.y2Sub.textContent = r.gstY2Rate > 0 ? `Incl. GST @ ${(r.gstY2Rate * 100).toFixed(2)}% = ${formatCurrency(r.gstYear2Amount)}` : 'GST: 0%';

  el.key.textContent = r.lookupKey;
  el.rate.textContent = r.baseRate.toFixed(4);

  // Breakdown rows (matching Excel Output rows 41-52)
  const rows = [];

  // ─── Base Premium ───
  rows.push({ l: 'Base Rate (per ₹1,000 SA)', v: r.baseRate.toFixed(4) });
  rows.push({ l: 'Sum Assured', v: formatCurrencyWhole(r.inputs.sa) });
  rows.push({ l: `Annual Base Premium`, v: formatCurrency(r.baseAnnualPremium), f: `(${r.baseRate.toFixed(4)} / 1000) × ${formatCurrencyWhole(r.inputs.sa)}` });
  rows.push({ l: 'Modal Factor', v: r.modalFactor.toFixed(4) });
  rows.push({ l: 'Base Instalment Premium', v: formatCurrency(r.baseInstalmentPremium) });

  if (r.hsarDiscount > 0) {
    rows.push({ l: 'High Sum Assured Rebate (HSAR)', v: '-' + formatCurrency(r.hsarDiscount), cls: 'discount-row' });
  }

  // ─── Riders ───
  if (r.adbInstalmentPrem > 0) {
    rows.push({ l: `ADB Rider (Rate: ${r.adbRate.toFixed(4)}, SA: ${formatCurrencyWhole(r.adbSA)})`, v: formatCurrency(r.adbInstalmentPrem) });
  }
  if (r.ciInstalmentPrem > 0) {
    rows.push({ l: `CI Rider (Rate: ${r.ciRate.toFixed(2)}, SA: ${formatCurrencyWhole(r.ciSA)})`, v: formatCurrency(r.ciInstalmentPrem), f: `(${r.ciRate.toFixed(2)} / 1000) × ${formatCurrencyWhole(r.ciSA)} × ${r.modalFactor}` });
  }
  if (r.cpInstalmentPrem > 0) {
    rows.push({ l: `Care Plus Rider (Annual: ${formatCurrency(r.cpAnnualPrem)})`, v: formatCurrency(r.cpInstalmentPrem) });
  }
  if (r.pcInstalmentPrem > 0 || r.parentalCareInstalment > 0) {
    rows.push({ l: 'Parental Care Rider', v: formatCurrency(r.pcInstalmentPrem || r.parentalCareInstalment) });
  }
  if (r.scInstalmentPrem > 0) {
    rows.push({ l: 'Spouse Care Rider', v: formatCurrency(r.scInstalmentPrem) });
  }
  if (r.ccInstalmentPrem > 0) {
    r.childPremDetails.forEach((p, i) => {
      rows.push({ l: `Child Care (Child ${i + 1})`, v: formatCurrency(p) });
    });
  }
  if (r.fcInstalmentPrem > 0 || r.famCareInstalment > 0) {
    rows.push({ l: 'Family Care Rider', v: formatCurrency(r.fcInstalmentPrem || r.famCareInstalment) });
  }
  if (r.totalRiderInstalment > 0) {
    rows.push({ l: 'Total Rider Instalment', v: formatCurrency(r.totalRiderInstalment), cls: 'subtotal-row' });
  }

  // ─── Row 41: Instalment Premium without GST ───
  rows.push({ l: 'Instalment Premium without GST', v: formatCurrency(r.totalInstalmentBeforeDiscounts), cls: 'subtotal-row' });

  // ─── Discounts ───
  if (r.sisoEnabled) {
    rows.push({ l: 'SISO Benefit (−6%)', v: `− ${formatCurrency(r.sisoTotalAmount || 0)}`, cls: 'discount-row' });
  }
  if (r.firstYearDiscountRate > 0) {
    rows.push({ l: `Other First Year Discounts (${(r.firstYearDiscountRate * 100).toFixed(0)}%)`, v: `− ${formatCurrency(r.totalDiscountAmount - (r.sisoTotalAmount || 0))}`, cls: 'discount-row' });
  }

  // ─── Row 50: After all discounts ───
  rows.push({ l: 'Instalment Premium after discounts (excl GST)', v: formatCurrency(r.totalInstalmentAfterDiscounts), cls: 'subtotal-row' });

  // ─── GST ───
  if (r.gstY1Rate > 0) {
    rows.push({ l: `GST Year 1 (${(r.gstY1Rate * 100).toFixed(1)}%)`, v: `+ ${formatCurrency(r.gstYear1Amount)}`, cls: 'gst-row' });
  }
  rows.push({ l: 'Instalment with GST (1st Year)', v: formatCurrency(r.instalmentWithGSTYear1), cls: 'total-row' });

  if (r.gstY2Rate > 0) {
    rows.push({ l: `GST Year 2+ (${(r.gstY2Rate * 100).toFixed(2)}%)`, v: `+ ${formatCurrency(r.gstYear2Amount)}`, cls: 'gst-row' });
  }
  rows.push({ l: 'Instalment with GST (2nd Year Onwards)', v: formatCurrency(r.instalmentWithGSTYear2), cls: 'total-row' });

  el.body.innerHTML = rows.map(r => `
    <tr class="${r.cls || ''}">
      <td class="label-cell">${r.l}${r.f ? `<div class="formula-cell">${r.f}</div>` : ''}</td>
      <td class="value-cell">${r.v}</td>
    </tr>`).join('');

  // independent reference profile
  const ref = calculatePremium({
    age: 26, gender: 'M', smoker: 'NS', residence: 'Resident Indian', medicalCategory: 'Medical', variant: 'Life Shield',
    policyTerm: 59, ppt: 10, sa: 9000000, mode: 'Monthly',
    discounts: { online: false, aggregator: false, partner: false, salaried: false, insuranceForAll: false, siso: false },
    gstYear1Rate: 0, gstYear2Rate: 0,
    riders: {
      adb: { enabled: false },
      ci: { enabled: true, sumAssured: 200000, pt: 20, ppt: 10, ciType: 'Comprehensive' },
      carePlus: { enabled: true, pt: 20, ppt: 5, plan: 'Prime' },
      spouseCare: { enabled: true, spouseAge: 18, spouseGender: 'Female', sumAssured: 4500000, pt: 49, ppt: 10 },
      parentalCare: { enabled: true, selection: 'Both Parents', fatherAge: 80, motherAge: 75, sumAssured: 9000000, pt: 49, ppt: 10 },
      childCare: [
        { enabled: true, age: 10, gender: 'Male', pt: 15, ppt: 10, sumAssured: 5000000 },
        { enabled: true, age: 10, gender: 'Female', pt: 15, ppt: 10, sumAssured: 10000000 },
        { enabled: true, age: 10, gender: 'Male', pt: 15, ppt: 10, sumAssured: 40000000 }
      ],
      famCare: { enabled: true, sumAssured: 1000000, pt: 59, ppt: 10 }
    }
  });

  el.comparison.innerHTML = `
    <table class="breakdown-table" style="font-size:0.82rem">
      <thead><tr><th>Excel Component</th><th>Expected</th><th>App Value</th><th>Match?</th></tr></thead>
      <tbody>
        ${cmpRow('Base Instalment', 4010.34, ref.baseInstalmentPremium)}
        ${cmpRow('CI Rider', 54.07, ref.ciInstalmentPrem)}
        ${cmpRow('Care Plus', 531.56, ref.cpInstalmentPrem)}
        ${cmpRow('Spouse Care', 99.12, ref.scInstalmentPrem)}
        ${cmpRow('Parental Care', 174.84, ref.pcInstalmentPrem)}
        ${cmpRow('Child Care 1', 39.07, ref.childPremDetails[0])}
        ${cmpRow('Child Care 2', 78.14, ref.childPremDetails[1])}
        ${cmpRow('Child Care 3', 312.55, ref.childPremDetails[2])}
        ${cmpRow('Family Care', 273.57, ref.fcInstalmentPrem)}
        ${cmpRow('TOTAL Monthly', 5573.27, ref.premiumY1)}
      </tbody>
    </table>
    <div style="margin-top:8px;font-size:0.75rem;color:var(--text-muted)">Reference Profile: Age 26, 90L/PT59/10, All Riders ON.</div>`;

  // Policy info
  el.info.innerHTML = `
    <div><strong>Maturity Age:</strong> ${r.maturityAge} years</div>
    <div><strong>Early Exit Eligible:</strong> ${r.earlyExitEligible ? '&#10003; Yes' : '&#10007; No'}</div>
    <div><strong>Annualized Premium (excl GST):</strong> ${formatCurrency(r.annualizedAfterDiscounts)}</div>
    <div><strong>SA Band:</strong> ${formatCurrencyWhole(r.saBand)}</div>
    <div style="margin-top:8px;font-size:0.78rem;color:var(--text-muted)">Terminal Illness Benefit Cap: ₹2 Crores</div>`;

  setInputValues(el, r.inputs);
}

function cmpRow(label, excelVal, appVal) {
  const match = Math.abs(excelVal - appVal) < 0.01;
  const icon = match ? '<span style="color:var(--accent-emerald)">&#10003;</span>' : '<span style="color:var(--accent-rose)">&#10007;</span>';
  return `<tr>
    <td class="label-cell">${label}</td>
    <td class="value-cell">${formatCurrency(excelVal)}</td>
    <td class="value-cell">${formatCurrency(appVal)}</td>
    <td style="text-align:center">${icon}</td>
  </tr>`;
}
