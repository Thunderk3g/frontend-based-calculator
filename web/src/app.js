import {
  loadRateData, isRateDataLoaded, calculatePremium, validateInputs,
  formatCurrency, formatCurrencyWhole,
  VARIANTS, SMOKER_OPTIONS, GENDER_OPTIONS, MEDICAL_OPTIONS,
  RESIDENCE_OPTIONS, MODE_OPTIONS, MODAL_FACTORS,
} from './calc.js';

// ═══════════════════════════════════════════
// Default Inputs (matches the Excel sample)
// ═══════════════════════════════════════════

const DEFAULTS = {
  age: 26,
  gender: 'Male',
  smoker: 'Non Smoker',
  variant: 'Life Shield',
  pt: 59,
  ppt: 10,
  sa: 9000000,
  mode: 'Monthly',
  medicalCategory: 'Medical',
  residence: 'Resident Indian',
  sisoEnabled: false,
  adbSA: 0,
};

// ═══════════════════════════════════════════
// App Entry
// ═══════════════════════════════════════════

export async function createApp(root) {
  // Load rate data first
  try {
    await loadRateData();
  } catch (err) {
    root.innerHTML = `
      <div style="padding:40px;text-align:center;color:#f43f5e">
        <h2>Failed to load rate data</h2>
        <p>${err.message}</p>
        <p style="color:#94a3b8;margin-top:16px">Run: <code>python extract_rates.py</code> first</p>
      </div>`;
    return;
  }

  // Build the UI
  root.innerHTML = buildHTML();

  // Wire up event handlers
  const state = { ...DEFAULTS };
  const elements = getElements();

  // Set initial values
  setFormValues(elements, state);

  // Bind input events
  bindEvents(elements, state);

  // Initial calculation
  runCalculation(elements, state);
}

// ═══════════════════════════════════════════
// HTML Template
// ═══════════════════════════════════════════

function buildHTML() {
  return `
    <div class="app-container">
      <!-- Header -->
      <header class="app-header">
        <div class="brand-badge">
          <span class="dot"></span>
          Bajaj Life eTouch II &bull; UIN: 116N198V05
        </div>
        <h1>Premium Calculator</h1>
        <p class="subtitle">Interactive premium estimation powered by actual rate tables</p>
      </header>

      <!-- Main Grid -->
      <div class="content-grid">

        <!-- Left: Input Panel -->
        <div class="card" style="animation-delay: 0.1s" id="inputCard">
          <div class="section-header">
            <div class="icon blue">⚙</div>
            <h2>Policy Parameters</h2>
          </div>

          <div class="form-grid">
            <!-- Age -->
            <div class="form-group">
              <label for="inp-age">Age (last birthday)</label>
              <input type="number" id="inp-age" min="18" max="65" step="1" placeholder="18–65" />
            </div>

            <!-- Gender -->
            <div class="form-group">
              <label for="inp-gender">Gender</label>
              <select id="inp-gender">
                ${GENDER_OPTIONS.map(g => `<option value="${g}">${g}</option>`).join('')}
              </select>
            </div>

            <!-- Smoker -->
            <div class="form-group">
              <label for="inp-smoker">Smoker Category</label>
              <select id="inp-smoker">
                ${SMOKER_OPTIONS.map(s => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>

            <!-- Variant -->
            <div class="form-group">
              <label for="inp-variant">Plan Variant</label>
              <select id="inp-variant">
                ${VARIANTS.map(v => `<option value="${v}">${v}</option>`).join('')}
              </select>
            </div>

            <!-- Medical Category -->
            <div class="form-group">
              <label for="inp-medical">Premium Category</label>
              <select id="inp-medical">
                ${MEDICAL_OPTIONS.map(m => `<option value="${m}">${m}</option>`).join('')}
              </select>
            </div>

            <!-- Residence -->
            <div class="form-group">
              <label for="inp-residence">Residence Status</label>
              <select id="inp-residence">
                ${RESIDENCE_OPTIONS.map(r => `<option value="${r}">${r}</option>`).join('')}
              </select>
            </div>

            <!-- Sum Assured -->
            <div class="form-group full-width">
              <label for="inp-sa">Sum Assured (₹)</label>
              <input type="number" id="inp-sa" min="5000000" step="100000" placeholder="Min ₹50,00,000" />
            </div>

            <!-- PT -->
            <div class="form-group">
              <label for="inp-pt">Policy Term (years)</label>
              <input type="number" id="inp-pt" min="5" max="67" step="1" placeholder="5–67" />
            </div>

            <!-- PPT -->
            <div class="form-group">
              <label for="inp-ppt">Payment Term (years)</label>
              <input type="number" id="inp-ppt" min="1" max="67" step="1" placeholder="1, 5, 10, 12…" />
            </div>

            <!-- Mode -->
            <div class="form-group">
              <label for="inp-mode">Payment Mode</label>
              <select id="inp-mode">
                ${MODE_OPTIONS.map(m => `<option value="${m}">${m}</option>`).join('')}
              </select>
            </div>

            <!-- ADB SA -->
            <div class="form-group">
              <label for="inp-adb">ADB Sum Assured (₹)</label>
              <input type="number" id="inp-adb" min="0" step="100000" placeholder="0 if none" />
            </div>
          </div>

          <!-- SISO Toggle -->
          <div class="toggle-row" style="margin-top: 16px">
            <div>
              <span class="toggle-label">SISO Benefit</span>
              <span class="toggle-badge">−6%</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="inp-siso" />
              <span class="slider"></span>
            </label>
          </div>

          <!-- Validation -->
          <div class="validation-alert" id="validationAlert"></div>
        </div>

        <!-- Right: Results Panel -->
        <div class="results-panel">
          <!-- Summary Cards -->
          <div class="summary-row">
            <div class="summary-card year1" style="animation: fadeInUp 0.5s ease-out 0.2s backwards">
              <div class="card-label">1st Year Instalment (with GST)</div>
              <div class="card-value" id="result-year1">—</div>
              <div class="card-sub" id="result-year1-gst">GST @ 4.5%</div>
            </div>
            <div class="summary-card renewal" style="animation: fadeInUp 0.5s ease-out 0.3s backwards">
              <div class="card-label">Renewal Instalment (with GST)</div>
              <div class="card-value" id="result-year2">—</div>
              <div class="card-sub" id="result-year2-gst">GST @ 2.25%</div>
            </div>
          </div>

          <!-- Breakdown Card -->
          <div class="card" style="animation-delay: 0.3s">
            <div class="section-header">
              <div class="icon emerald">📊</div>
              <h2>Premium Breakdown</h2>
            </div>

            <!-- Rate Info -->
            <div class="rate-info" id="rateInfoBox">
              <div>
                <div class="rate-label">Lookup Key</div>
                <div class="rate-key" id="result-key">—</div>
              </div>
              <div>
                <div class="rate-label">Rate / 1000</div>
                <div class="rate-value" id="result-rate">—</div>
              </div>
            </div>

            <table class="breakdown-table" id="breakdownTable">
              <thead>
                <tr>
                  <th>Component</th>
                  <th style="text-align:right">Amount</th>
                </tr>
              </thead>
              <tbody id="breakdownBody">
              </tbody>
            </table>
          </div>

          <!-- Info Card -->
          <div class="card" style="animation-delay: 0.4s">
            <div class="section-header">
              <div class="icon amber">ℹ</div>
              <h2>Policy Info</h2>
            </div>
            <div id="policyInfo" style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.8">
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════
// DOM References
// ═══════════════════════════════════════════

function getElements() {
  return {
    age: document.getElementById('inp-age'),
    gender: document.getElementById('inp-gender'),
    smoker: document.getElementById('inp-smoker'),
    variant: document.getElementById('inp-variant'),
    pt: document.getElementById('inp-pt'),
    ppt: document.getElementById('inp-ppt'),
    sa: document.getElementById('inp-sa'),
    mode: document.getElementById('inp-mode'),
    medical: document.getElementById('inp-medical'),
    residence: document.getElementById('inp-residence'),
    adb: document.getElementById('inp-adb'),
    siso: document.getElementById('inp-siso'),
    validation: document.getElementById('validationAlert'),
    year1: document.getElementById('result-year1'),
    year1Gst: document.getElementById('result-year1-gst'),
    year2: document.getElementById('result-year2'),
    year2Gst: document.getElementById('result-year2-gst'),
    key: document.getElementById('result-key'),
    rate: document.getElementById('result-rate'),
    breakdownBody: document.getElementById('breakdownBody'),
    policyInfo: document.getElementById('policyInfo'),
  };
}

// ═══════════════════════════════════════════
// Form Management
// ═══════════════════════════════════════════

function setFormValues(el, state) {
  el.age.value = state.age;
  el.gender.value = state.gender;
  el.smoker.value = state.smoker;
  el.variant.value = state.variant;
  el.pt.value = state.pt;
  el.ppt.value = state.ppt;
  el.sa.value = state.sa;
  el.mode.value = state.mode;
  el.medical.value = state.medicalCategory;
  el.residence.value = state.residence;
  el.adb.value = state.adbSA;
  el.siso.checked = state.sisoEnabled;
}

function bindEvents(el, state) {
  const recalc = () => {
    readForm(el, state);
    runCalculation(el, state);
  };

  el.age.addEventListener('input', recalc);
  el.gender.addEventListener('change', recalc);
  el.smoker.addEventListener('change', recalc);
  el.variant.addEventListener('change', recalc);
  el.pt.addEventListener('input', recalc);
  el.ppt.addEventListener('input', recalc);
  el.sa.addEventListener('input', recalc);
  el.mode.addEventListener('change', recalc);
  el.medical.addEventListener('change', recalc);
  el.residence.addEventListener('change', recalc);
  el.adb.addEventListener('input', recalc);
  el.siso.addEventListener('change', recalc);
}

function readForm(el, state) {
  state.age = parseInt(el.age.value) || 0;
  state.gender = el.gender.value;
  state.smoker = el.smoker.value;
  state.variant = el.variant.value;
  state.pt = parseInt(el.pt.value) || 0;
  state.ppt = parseInt(el.ppt.value) || 0;
  state.sa = parseInt(el.sa.value) || 0;
  state.mode = el.mode.value;
  state.medicalCategory = el.medical.value;
  state.residence = el.residence.value;
  state.adbSA = parseInt(el.adb.value) || 0;
  state.sisoEnabled = el.siso.checked;
}

// ═══════════════════════════════════════════
// Calculation + Render
// ═══════════════════════════════════════════

function runCalculation(el, state) {
  // Validate
  const errors = validateInputs(state);

  if (errors.length > 0) {
    el.validation.className = 'validation-alert error';
    el.validation.innerHTML = '⚠ ' + errors.join(' &bull; ');
    clearResults(el);
    return;
  }
  el.validation.className = 'validation-alert';
  el.validation.innerHTML = '';

  // Calculate
  const result = calculatePremium(state);

  if (!result.success) {
    el.validation.className = 'validation-alert error';
    el.validation.innerHTML = '⚠ ' + result.error;
    el.key.textContent = result.lookupKey || '—';
    clearResults(el);
    return;
  }

  // Render results
  renderResults(el, result);
}

function clearResults(el) {
  el.year1.textContent = '—';
  el.year2.textContent = '—';
  el.rate.textContent = '—';
  el.breakdownBody.innerHTML = '';
  el.policyInfo.innerHTML = '';
}

function renderResults(el, r) {
  // Summary cards
  el.year1.textContent = formatCurrency(r.instalmentWithGSTYear1);
  el.year1Gst.textContent = `Incl. GST @ ${(r.gstYear1Rate * 100).toFixed(1)}% = ${formatCurrency(r.gstYear1)}`;
  el.year2.textContent = formatCurrency(r.instalmentWithGSTYear2);
  el.year2Gst.textContent = `Incl. GST @ ${(r.gstYear2Rate * 100).toFixed(2)}% = ${formatCurrency(r.gstYear2)}`;

  // Rate info
  el.key.textContent = r.lookupKey;
  el.rate.textContent = r.baseRate.toFixed(4);

  // Breakdown
  const rows = [];

  rows.push({ label: `Base Rate (per ₹1,000 SA)`, value: r.baseRate.toFixed(4), cls: '' });
  rows.push({ label: `Sum Assured`, value: formatCurrencyWhole(r.inputs.sa), cls: '' });
  rows.push({ label: `SA Band`, value: formatCurrencyWhole(r.saBand), cls: '' });
  rows.push({ label: `Annual Base Premium`, value: formatCurrency(r.annualBasePremium), cls: '', formula: `(${r.baseRate.toFixed(4)} / 1000) × ${formatCurrencyWhole(r.inputs.sa)}` });
  rows.push({ label: `Modal Factor (${r.inputs.mode})`, value: r.modalFactor.toFixed(4), cls: '' });
  rows.push({ label: `Instalment Base Premium`, value: formatCurrency(r.instalmentBase), cls: 'subtotal-row', formula: `${formatCurrency(r.annualBasePremium)} × ${r.modalFactor}` });

  if (r.sisoEnabled) {
    rows.push({ label: `SISO Discount (6%)`, value: `− ${formatCurrency(r.sisoAmount)}`, cls: 'discount-row' });
  }

  rows.push({ label: `Instalment After Discounts`, value: formatCurrency(r.instalmentAfterSISO), cls: 'subtotal-row' });

  if (r.adbSA > 0 && r.adbRate > 0) {
    rows.push({ label: `ADB Rate (per ₹1,000)`, value: r.adbRate.toFixed(4), cls: '' });
    rows.push({ label: `ADB Sum Assured`, value: formatCurrencyWhole(r.adbSA), cls: '' });
    rows.push({ label: `ADB Instalment Premium`, value: formatCurrency(r.adbInstalmentPremium), cls: '', formula: `(${r.adbRate.toFixed(4)} / 1000) × ${formatCurrencyWhole(r.adbSA)} × ${r.modalFactor}` });
  }

  rows.push({ label: `Total Instalment (excl. GST)`, value: formatCurrency(r.totalInstalmentBeforeGST), cls: 'subtotal-row' });

  rows.push({ label: `GST — Year 1 (${(r.gstYear1Rate * 100).toFixed(1)}%)`, value: `+ ${formatCurrency(r.gstYear1)}`, cls: 'gst-row' });
  rows.push({ label: `1st Year Instalment (with GST)`, value: formatCurrency(r.instalmentWithGSTYear1), cls: 'total-row' });

  rows.push({ label: `GST — Year 2+ (${(r.gstYear2Rate * 100).toFixed(2)}%)`, value: `+ ${formatCurrency(r.gstYear2)}`, cls: 'gst-row' });
  rows.push({ label: `Renewal Instalment (with GST)`, value: formatCurrency(r.instalmentWithGSTYear2), cls: 'total-row' });

  el.breakdownBody.innerHTML = rows.map(r => `
    <tr class="${r.cls}">
      <td class="label-cell">
        ${r.label}
        ${r.formula ? `<div class="formula-cell">${r.formula}</div>` : ''}
      </td>
      <td class="value-cell">${r.value}</td>
    </tr>
  `).join('');

  // Policy info
  el.policyInfo.innerHTML = `
    <div><strong>Maturity Age:</strong> ${r.maturityAge} years</div>
    <div><strong>Early Exit Eligible:</strong> ${r.earlyExitEligible ? '✓ Yes' : '✗ No'}</div>
    <div><strong>Annualized Premium (excl. GST):</strong> ${formatCurrency(r.annualizedTotal)}</div>
    <div><strong>Premium Category:</strong> ${r.inputs.medicalCategory} — ${r.inputs.residence === 'Resident Indian' ? 'Resident' : 'NRI'}</div>
    <div style="margin-top:8px; font-size:0.78rem; color:var(--text-muted)">
      Terminal Illness Benefit Cap: ₹2 Crores &bull;
      Product: Non-Linked, Non-Participating, Individual Life Insurance Term Plan
    </div>
  `;
}
