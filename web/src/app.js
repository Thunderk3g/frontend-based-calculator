import {
  loadRateData, calculatePremium, validateInputs,
  formatCurrency, formatCurrencyWhole,
  VARIANTS, SMOKER_OPTIONS, GENDER_OPTIONS, MEDICAL_OPTIONS,
  RESIDENCE_OPTIONS, MODE_OPTIONS, CI_TYPE_OPTIONS, CARE_PLUS_PLAN_OPTIONS,
} from './calc.js';

// ═══════════════════════════════════════════
// Defaults (matches the Excel sample case)
// ═══════════════════════════════════════════

const DEFAULTS = {
  age: 26, gender: 'Male', smoker: 'Non Smoker', variant: 'Life Shield',
  pt: 59, ppt: 10, sa: 9000000, mode: 'Monthly',
  medicalCategory: 'Medical', residence: 'Resident Indian',
  sisoEnabled: false, adbSA: 0,
  // CI Rider
  ciEnabled: true, ciSA: 200000, ciPT: 20, ciPPT: 10, ciType: 'Comprehensive', ciMedicalType: 'TeleMedical',
  // Care Plus
  carePlusEnabled: false, carePlusPT: 20, carePlusPPT: 5, carePlusPlan: 'Prime',
  // GST (0 in the sample Excel case)
  gstYear1Rate: 0, gstYear2Rate: 0,
};

// ═══════════════════════════════════════════
// App Entry
// ═══════════════════════════════════════════

export async function createApp(root) {
  try { await loadRateData(); }
  catch (err) {
    root.innerHTML = `<div style="padding:40px;text-align:center;color:#f43f5e"><h2>Failed to load rate data</h2><p>${err.message}</p></div>`;
    return;
  }
  root.innerHTML = buildHTML();
  const state = { ...DEFAULTS };
  const el = getElements();
  setFormValues(el, state);
  bindEvents(el, state);
  runCalculation(el, state);
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
      <div class="brand-badge"><span class="dot"></span>Bajaj Life eTouch II &bull; UIN: 116N198V05</div>
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
            ${inp('inp-age', 'Age (last birthday)', 'min="18" max="65" step="1"')}
            ${opts(GENDER_OPTIONS, 'inp-gender', 'Gender')}
            ${opts(SMOKER_OPTIONS, 'inp-smoker', 'Smoker Category')}
            ${opts(VARIANTS, 'inp-variant', 'Plan Variant')}
            ${opts(MEDICAL_OPTIONS, 'inp-medical', 'Premium Category')}
            ${opts(RESIDENCE_OPTIONS, 'inp-residence', 'Residence Status')}
            <div class="form-group full-width"><label for="inp-sa">Sum Assured (&#8377;)</label><input type="number" id="inp-sa" min="5000000" step="100000" /></div>
            ${inp('inp-pt', 'Policy Term (years)', 'min="5" max="67" step="1"')}
            ${inp('inp-ppt', 'Payment Term (years)', 'min="1" max="67" step="1"')}
            ${opts(MODE_OPTIONS, 'inp-mode', 'Payment Mode')}
          </div>
          <!-- SISO -->
          <div class="toggle-row" style="margin-top:16px"><div><span class="toggle-label">SISO Benefit</span><span class="toggle-badge">&minus;6%</span></div><label class="toggle-switch"><input type="checkbox" id="inp-siso" /><span class="slider"></span></label></div>
        </div>

        <!-- Riders -->
        <div class="card" style="animation-delay:0.15s">
          <div class="section-header"><div class="icon purple">&#128737;</div><h2>Riders</h2></div>

          <!-- ADB -->
          <div style="margin-bottom:16px">
            <div class="toggle-row"><div><span class="toggle-label">Accidental Death Benefit (ADB)</span></div><label class="toggle-switch"><input type="checkbox" id="inp-adb-toggle" /><span class="slider"></span></label></div>
            <div id="adb-fields" style="display:none;margin-top:8px">
              <div class="form-grid">${inp('inp-adb', 'ADB Sum Assured (&#8377;)', 'min="0" step="100000"')}</div>
            </div>
          </div>

          <!-- CI -->
          <div style="margin-bottom:16px">
            <div class="toggle-row"><div><span class="toggle-label">Critical Illness Rider (CI)</span></div><label class="toggle-switch"><input type="checkbox" id="inp-ci-toggle" /><span class="slider"></span></label></div>
            <div id="ci-fields" style="display:none;margin-top:8px">
              <div class="form-grid">
                ${inp('inp-ci-sa', 'CI Sum Assured (&#8377;)', 'min="0" step="10000"')}
                ${inp('inp-ci-pt', 'CI Benefit Term', 'min="1" max="20" step="1"')}
                ${inp('inp-ci-ppt', 'CI Payment Term', 'min="1" max="20" step="1"')}
                ${opts(CI_TYPE_OPTIONS, 'inp-ci-type', 'CI Type')}
              </div>
            </div>
          </div>

          <!-- Care Plus -->
          <div>
            <div class="toggle-row"><div><span class="toggle-label">Care Plus Rider</span></div><label class="toggle-switch"><input type="checkbox" id="inp-cp-toggle" /><span class="slider"></span></label></div>
            <div id="cp-fields" style="display:none;margin-top:8px">
              <div class="form-grid">
                ${inp('inp-cp-pt', 'Care Plus Benefit Term', 'min="1" max="30" step="1"')}
                ${inp('inp-cp-ppt', 'Care Plus Payment Term', 'min="1" max="20" step="1"')}
                ${opts(CARE_PLUS_PLAN_OPTIONS, 'inp-cp-plan', 'Plan Type')}
              </div>
            </div>
          </div>
        </div>

        <!-- GST -->
        <div class="card" style="animation-delay:0.2s">
          <div class="section-header"><div class="icon amber">&#9733;</div><h2>GST Rates</h2></div>
          <div class="form-grid">
            <div class="form-group"><label for="inp-gst1">GST Year 1 (%)</label><input type="number" id="inp-gst1" min="0" max="30" step="0.1" /></div>
            <div class="form-group"><label for="inp-gst2">GST Year 2+ (%)</label><input type="number" id="inp-gst2" min="0" max="30" step="0.1" /></div>
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:8px">Standard: 4.5% Y1, 2.25% Y2+. Set to 0 to exclude GST.</div>
        </div>
      </div>

      <!-- RIGHT: Results -->
      <div class="results-panel">
        <!-- Validation -->
        <div class="validation-alert" id="validationAlert"></div>

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
  </div>`;
}

// ═══════════════════════════════════════════
// DOM
// ═══════════════════════════════════════════

function getElements() {
  const $ = id => document.getElementById(id);
  return {
    age: $('inp-age'), gender: $('inp-gender'), smoker: $('inp-smoker'), variant: $('inp-variant'),
    pt: $('inp-pt'), ppt: $('inp-ppt'), sa: $('inp-sa'), mode: $('inp-mode'),
    medical: $('inp-medical'), residence: $('inp-residence'), siso: $('inp-siso'),
    adbToggle: $('inp-adb-toggle'), adb: $('inp-adb'), adbFields: $('adb-fields'),
    ciToggle: $('inp-ci-toggle'), ciSA: $('inp-ci-sa'), ciPT: $('inp-ci-pt'), ciPPT: $('inp-ci-ppt'), ciType: $('inp-ci-type'), ciFields: $('ci-fields'),
    cpToggle: $('inp-cp-toggle'), cpPT: $('inp-cp-pt'), cpPPT: $('inp-cp-ppt'), cpPlan: $('inp-cp-plan'), cpFields: $('cp-fields'),
    gst1: $('inp-gst1'), gst2: $('inp-gst2'),
    validation: $('validationAlert'),
    y1: $('res-y1'), y1Sub: $('res-y1-sub'), y2: $('res-y2'), y2Sub: $('res-y2-sub'),
    key: $('res-key'), rate: $('res-rate'),
    body: $('breakdownBody'), comparison: $('excelComparison'), info: $('policyInfo'),
  };
}

function setFormValues(el, s) {
  el.age.value = s.age; el.gender.value = s.gender; el.smoker.value = s.smoker;
  el.variant.value = s.variant; el.pt.value = s.pt; el.ppt.value = s.ppt;
  el.sa.value = s.sa; el.mode.value = s.mode; el.medical.value = s.medicalCategory;
  el.residence.value = s.residence; el.siso.checked = s.sisoEnabled;
  el.adb.value = s.adbSA; el.adbToggle.checked = s.adbSA > 0;
  el.ciToggle.checked = s.ciEnabled; el.ciSA.value = s.ciSA; el.ciPT.value = s.ciPT; el.ciPPT.value = s.ciPPT; el.ciType.value = s.ciType;
  el.cpToggle.checked = s.carePlusEnabled; el.cpPT.value = s.carePlusPT; el.cpPPT.value = s.carePlusPPT; el.cpPlan.value = s.carePlusPlan;
  el.gst1.value = (s.gstYear1Rate * 100); el.gst2.value = (s.gstYear2Rate * 100);
  el.adbFields.style.display = s.adbSA > 0 ? 'block' : 'none';
  el.ciFields.style.display = s.ciEnabled ? 'block' : 'none';
  el.cpFields.style.display = s.carePlusEnabled ? 'block' : 'none';
}

function bindEvents(el, state) {
  const recalc = () => { readForm(el, state); runCalculation(el, state); };
  // All inputs
  [el.age, el.pt, el.ppt, el.sa, el.adb, el.ciSA, el.ciPT, el.ciPPT, el.cpPT, el.cpPPT, el.gst1, el.gst2].forEach(e => e.addEventListener('input', recalc));
  [el.gender, el.smoker, el.variant, el.mode, el.medical, el.residence, el.ciType, el.cpPlan].forEach(e => e.addEventListener('change', recalc));
  [el.siso].forEach(e => e.addEventListener('change', recalc));
  // Toggles
  el.adbToggle.addEventListener('change', () => { el.adbFields.style.display = el.adbToggle.checked ? 'block' : 'none'; recalc(); });
  el.ciToggle.addEventListener('change', () => { el.ciFields.style.display = el.ciToggle.checked ? 'block' : 'none'; recalc(); });
  el.cpToggle.addEventListener('change', () => { el.cpFields.style.display = el.cpToggle.checked ? 'block' : 'none'; recalc(); });
}

function readForm(el, s) {
  s.age = parseInt(el.age.value) || 0; s.gender = el.gender.value; s.smoker = el.smoker.value;
  s.variant = el.variant.value; s.pt = parseInt(el.pt.value) || 0; s.ppt = parseInt(el.ppt.value) || 0;
  s.sa = parseInt(el.sa.value) || 0; s.mode = el.mode.value; s.medicalCategory = el.medical.value;
  s.residence = el.residence.value; s.sisoEnabled = el.siso.checked;
  s.adbSA = el.adbToggle.checked ? (parseInt(el.adb.value) || 0) : 0;
  s.ciEnabled = el.ciToggle.checked; s.ciSA = parseInt(el.ciSA.value) || 0;
  s.ciPT = parseInt(el.ciPT.value) || 20; s.ciPPT = parseInt(el.ciPPT.value) || 10;
  s.ciType = el.ciType.value; s.ciMedicalType = 'TeleMedical';
  s.carePlusEnabled = el.cpToggle.checked; s.carePlusPT = parseInt(el.cpPT.value) || 20;
  s.carePlusPPT = parseInt(el.cpPPT.value) || 5; s.carePlusPlan = el.cpPlan.value;
  s.gstYear1Rate = (parseFloat(el.gst1.value) || 0) / 100;
  s.gstYear2Rate = (parseFloat(el.gst2.value) || 0) / 100;
}

// ═══════════════════════════════════════════
// Render
// ═══════════════════════════════════════════

function runCalculation(el, state) {
  const errors = validateInputs(state);
  if (errors.length) {
    el.validation.className = 'validation-alert error';
    el.validation.innerHTML = '&#9888; ' + errors.join(' &bull; ');
    clear(el); return;
  }
  el.validation.className = 'validation-alert'; el.validation.innerHTML = '';

  const r = calculatePremium(state);
  if (!r.success) {
    el.validation.className = 'validation-alert error';
    el.validation.innerHTML = '&#9888; ' + r.error;
    el.key.textContent = r.lookupKey || '—'; clear(el); return;
  }
  render(el, r);
}

function clear(el) {
  el.y1.textContent = '—'; el.y2.textContent = '—'; el.rate.textContent = '—';
  el.body.innerHTML = ''; el.info.innerHTML = ''; el.comparison.innerHTML = '';
}

function render(el, r) {
  // Summary
  el.y1.textContent = formatCurrency(r.instalmentWithGSTYear1);
  el.y1Sub.textContent = r.gstY1Rate > 0 ? `Incl. GST @ ${(r.gstY1Rate * 100).toFixed(1)}% = ${formatCurrency(r.gstYear1Amount)}` : 'GST: 0%';
  el.y2.textContent = formatCurrency(r.instalmentWithGSTYear2);
  el.y2Sub.textContent = r.gstY2Rate > 0 ? `Incl. GST @ ${(r.gstY2Rate * 100).toFixed(2)}% = ${formatCurrency(r.gstYear2Amount)}` : 'GST: 0%';

  el.key.textContent = r.lookupKey;
  el.rate.textContent = r.baseRate.toFixed(4);

  // Breakdown rows (matching Excel Output rows 41-52)
  const rows = [];

  // ─── Base Premium ───
  rows.push({ l: 'Base Rate (per ₹1,000 SA)', v: r.baseRate.toFixed(4) });
  rows.push({ l: 'Sum Assured', v: formatCurrencyWhole(r.inputs.sa) });
  rows.push({ l: `Annual Base Premium`, v: formatCurrency(r.baseAnnualPremium), f: `(${r.baseRate.toFixed(4)} / 1000) × ${formatCurrencyWhole(r.inputs.sa)}` });
  rows.push({ l: `Modal Factor (${r.inputs.mode})`, v: r.modalFactor.toFixed(4) });
  rows.push({ l: 'Base Instalment Premium', v: formatCurrency(r.baseInstalmentPremium), cls: 'subtotal-row' });

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
  if (r.totalRiderInstalment > 0) {
    rows.push({ l: 'Total Rider Instalment', v: formatCurrency(r.totalRiderInstalment), cls: 'subtotal-row' });
  }

  // ─── Row 41: Instalment Premium without GST ───
  rows.push({ l: 'Instalment Premium without GST', v: formatCurrency(r.totalInstalmentBeforeDiscounts), cls: 'subtotal-row' });

  // ─── SISO ───
  if (r.sisoEnabled) {
    rows.push({ l: 'SISO Benefit (−6%)', v: `− ${formatCurrency(r.sisoTotalAmount)}`, cls: 'discount-row' });
    rows.push({ l: 'After SISO Benefit', v: formatCurrency(r.instalmentAfterSISO) });
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

  // Excel comparison (sample case)
  el.comparison.innerHTML = `
    <table class="breakdown-table" style="font-size:0.82rem">
      <thead><tr><th>Excel Output (Row)</th><th>Excel Value</th><th>App Value</th><th>Match?</th></tr></thead>
      <tbody>
        ${cmpRow('Base Instalment (Row 41 col F)', 3893.5575, r.baseInstalmentPremium)}
        ${cmpRow('CI Rider Instalment (Row 41 col H)', 54.075, r.ciInstalmentPrem)}
        ${cmpRow('Total excl GST (Row 41 col J)', 3947.6325, r.totalInstalmentBeforeDiscounts)}
        ${cmpRow('SISO (Row 42)', 0, r.sisoTotalAmount)}
        ${cmpRow('After discounts (Row 50)', 3947.6325, r.totalInstalmentAfterDiscounts)}
        ${cmpRow('With GST Y1 (Row 51)', 3947.6325, r.instalmentWithGSTYear1)}
        ${cmpRow('With GST Y2+ (Row 52)', 3947.6325, r.instalmentWithGSTYear2)}
      </tbody>
    </table>
    <div style="margin-top:8px;font-size:0.75rem;color:var(--text-muted)">Excel sample: Age=26, M, NS, LS, Medical, Resident, SA=90L, PT=59, PPT=10, Monthly, SISO=No, CI SA=2L, GST=0%</div>`;

  // Policy info
  el.info.innerHTML = `
    <div><strong>Maturity Age:</strong> ${r.maturityAge} years</div>
    <div><strong>Early Exit Eligible:</strong> ${r.earlyExitEligible ? '&#10003; Yes' : '&#10007; No'}</div>
    <div><strong>Annualized Premium (excl GST):</strong> ${formatCurrency(r.annualizedAfterDiscounts)}</div>
    <div><strong>SA Band:</strong> ${formatCurrencyWhole(r.saBand)}</div>
    <div style="margin-top:8px;font-size:0.78rem;color:var(--text-muted)">Terminal Illness Benefit Cap: ₹2 Crores</div>`;
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
