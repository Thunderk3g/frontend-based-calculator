import { loadRateData, calculatePremium, formatCurrency, formatCurrencyWhole, computeLtcgBenefit } from './calc.js';
import { CONFIG, loadConfig } from './config.js';
import { initFundPerformance } from './fundPerformance.js';

const ASSET_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || './';

let activeTab = 'calculator'; // 'calculator' | 'fundPerformance'

// ── GLOBAL PROFILE STATE ──
const S = {
    age: 28,
    gender: 'Male',
    smoker: 'Non Smoker',
    yearlyPremium: 1000000,
    mode: 'Annual',
    pt: 20,
    ppt: 10,
    saFactor: 10,
    channel: 'web',
    selectedScenario: 'custom', // Default to custom scenario
    customReturn: 10, // Default 10%
    fundAllocations: {}, // Active funds
    addons: { adb: false, ci: false, carePlus: false }
};

let results = null;
let chartInstance = null;

// ── RENDER ROOT ──
export function initApp(root) {
    if (Object.keys(S.fundAllocations).length === 0 && CONFIG.charges.fmc) {
        const firstFund = Object.keys(CONFIG.charges.fmc)[0];
        S.fundAllocations[firstFund] = 100;
    }

    root.innerHTML = `
        <div class="top-nav">
            <div class="nav-brand">
                <div class="nav-logo">B</div>
                <div class="logo-stack">
                    <div class="logo-top">
                        <img src="${ASSET_BASE}Bajaj Logo.png" alt="Bajaj Logo" class="logo-icon" onerror="this.style.display='none'">
                        <span class="logo-life">LIFE GOAL ASSURE IV</span>
                    </div>
                </div>
            </div>
            <div class="nav-tabs">
                <button class="nav-tab ${activeTab === 'calculator' ? 'active' : ''}" id="tab-calculator">
                    <span class="material-icons-outlined">calculate</span> BI Calculator
                </button>
                <button class="nav-tab ${activeTab === 'fundPerformance' ? 'active' : ''}" id="tab-fundPerformance">
                    <span class="material-icons-outlined">insights</span> Fund Performance
                </button>
            </div>
        </div>

        <!-- Tab: BI Calculator -->
        <main class="main" id="tab-content-calculator" style="display:${activeTab === 'calculator' ? 'block' : 'none'}">
            <div class="grid">
                <!-- Profile Panel -->
                <aside class="profile" id="profile-panel">
                    <div class="profile-hdr">
                        <span class="material-icons-outlined">person</span>
                        <h2>Customer Profile</h2>
                    </div>
                    
                    <!-- Scenario Toggle -->
                    <div class="fg" style="margin-bottom: 20px;">
                        <label>Investment Scenario</label>
                        <div class="mode-toggle" style="background: var(--input); border: 1px solid var(--border); margin-top: 4px; flex-wrap: wrap; gap: 4px;">
                            <button class="mode-btn ${S.selectedScenario === 4 ? 'active' : ''}" id="btn-scen-4" style="flex:1; min-width:60px">4%</button>
                            <button class="mode-btn ${S.selectedScenario === 8 ? 'active' : ''}" id="btn-scen-8" style="flex:1; min-width:60px">8%</button>
                            <button class="mode-btn ${S.selectedScenario === 'custom' ? 'active' : ''}" id="btn-scen-custom" style="flex:1; min-width:60px">Custom</button>
                        </div>
                        
                        <div id="custom-rate-box" style="margin-top:12px; display: ${S.selectedScenario === 'custom' ? 'block' : 'none'}">
                            <label style="font-size:11px; color:var(--t3)">Custom Growth Rate (%)</label>
                            <div style="display:flex; align-items:center; gap:10px">
                                <input type="range" id="inp-custom-rate" value="${S.customReturn}" min="0" max="50" step="0.5" style="flex:1">
                                <span style="font-weight:700; color:var(--bajaj-orange); min-width:40px">${S.customReturn}%</span>
                            </div>
                        </div>
                    </div>

                    <div class="pf" style="padding-right: 8px;">
                        <div class="fr">
                            <div class="fg">
                                <label>Age</label>
                                <input type="number" id="inp-age" value="${S.age}" min="0" max="65">
                            </div>
                            <div class="fg">
                                <label>Gender</label>
                                <select id="inp-gender">
                                    <option value="Male" ${S.gender === 'Male' ? 'selected' : ''}>Male</option>
                                    <option value="Female" ${S.gender === 'Female' ? 'selected' : ''}>Female</option>
                                </select>
                            </div>
                        </div>

                        <div class="fg">
                            <label>Annual Premium (₹)</label>
                            <input type="number" id="inp-premium" value="${S.yearlyPremium}" min="25000" step="5000">
                        </div>

                        <div class="fg">
                            <label>SA Multiple</label>
                            <input type="number" id="inp-sa-factor" value="${S.saFactor}" min="7" max="25">
                            <div style="font-size: 10px; color: var(--t3); margin-top: 4px;">Total Cover: <span id="disp-sum-assured" style="font-weight:700;color:var(--t1)">₹${formatCurrencyWhole(S.yearlyPremium * S.saFactor)}</span></div>
                        </div>

                        <div class="fr">
                            <div class="fg">
                                <label>Policy Term</label>
                                <input type="number" id="inp-pt" value="${S.pt}" min="5" max="30">
                            </div>
                            <div class="fg">
                                <label>Pay Term</label>
                                <input type="number" id="inp-ppt" value="${S.ppt}" min="5" max="30">
                            </div>
                        </div>

                        <div class="fg">
                            <label>Mode</label>
                            <select id="inp-mode">
                                <option value="Annual" ${S.mode === 'Annual' ? 'selected' : ''}>Annual</option>
                                <option value="Half-Yearly" ${S.mode === 'Half-Yearly' ? 'selected' : ''}>Half-Yearly</option>
                                <option value="Quarterly" ${S.mode === 'Quarterly' ? 'selected' : ''}>Quarterly</option>
                                <option value="Monthly" ${S.mode === 'Monthly' ? 'selected' : ''}>Monthly</option>
                            </select>
                        </div>
                        
                        <div class="sep"></div>
                        <div class="profile-hdr fund-hdr" style="margin-bottom:8px; border-bottom:none; padding-bottom:0">
                            <span class="material-icons-outlined" style="font-size:16px">pie_chart</span>
                            <h2 style="font-size:12px; display:flex; justify-content:space-between; width:100%">
                                Fund Allocation 
                                <span id="alloc-total" style="color:var(--bajaj-blue)">100%</span>
                            </h2>
                        </div>

                        <div class="fg" style="margin-bottom: 20px;">
                            <select id="inp-add-fund" style="font-size:11px; padding:10px; width:100%; cursor:pointer; background:var(--bg)">
                                <option value="">+ Add / Change Fund...</option>
                                ${Object.keys(CONFIG.charges.fmc).map(f => `<option value="${f}">${f}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div id="fund-sliders-container">
                            ${renderActiveFunds()}
                        </div>
                        <div class="card-err" id="fund-err">Total allocation must be 100%</div>
                    </div>
                </aside>

                <!-- Content Area -->
                <div class="cards-area">
                    <div id="dashboard-container"></div>
                    <div id="ltcg-benefit-slot"></div>

                    <div class="section">
                        <div class="sec-title" style="justify-content:space-between">
                            <span><span class="material-icons-outlined" style="vertical-align:middle">table_view</span> Benefit Illustration</span>
                            <span style="font-size:11px; color:var(--bajaj-orange); font-weight:700">Scenario: <span id="disp-scen-label"></span></span>
                        </div>
                        <div style="overflow-x:auto">
                            <table class="breakdown-table" id="bi-table" style="font-size:12px">
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Premium</th>
                                        <th>Mortality</th>
                                        <th>Other Charges</th>
                                        <th>FMC</th>
                                        <th>GST</th>
                                        <th>Fund Value (EOY)</th>
                                        <th>Surrender</th>
                                        <th>Death Benefit</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="section" id="riders-section">
                        <div class="sec-title">
                            <span class="material-icons-outlined">extension</span> Options & Riders
                        </div>
                        <div class="addons-grid">
                            <div class="addon" id="addon-adb">
                                <div>
                                    <h4>Accidental Death</h4>
                                    <div class="addon-price" id="price-adb">+ ₹0</div>
                                </div>
                                <div class="tog" id="tog-adb"></div>
                            </div>
                            <div class="addon" id="addon-ci">
                                <div>
                                    <h4>Critical Illness</h4>
                                    <div class="addon-price" id="price-ci">+ ₹0</div>
                                </div>
                                <div class="tog" id="tog-ci"></div>
                            </div>
                            <div class="addon" id="addon-care">
                                <div>
                                    <h4>Care Plus Rider</h4>
                                    <div class="addon-price" id="price-care">+ ₹0</div>
                                </div>
                                <div class="tog" id="tog-care"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Tab: Fund Performance -->
        <main class="main" id="tab-content-fundPerformance" style="display:${activeTab === 'fundPerformance' ? 'block' : 'none'}">
            <div id="fund-performance-root"></div>
        </main>

        <div class="bottom" id="bottom-bar" style="display:${activeTab === 'calculator' ? 'flex' : 'none'}">
            <div class="bot-info" style="gap: 40px; margin-left: 310px;">
                <div class="bot-item">
                    <span class="bot-lbl">Base Premium</span>
                    <span class="bot-val" id="ftr-base-prem" style="color: #cbd5e1; font-size:14px">₹0</span>
                </div>
                <div class="bot-item">
                    <span class="bot-lbl">Riders</span>
                    <span class="bot-val" id="ftr-riders" style="color: #cbd5e1; font-size:14px">₹0</span>
                </div>
                <div class="bot-item">
                    <span class="bot-lbl">Mode</span>
                    <span class="bot-val" id="ftr-mode" style="color: #cbd5e1; font-size:14px">Annual</span>
                </div>
                <div class="bot-item" style="padding-left: 20px; border-left: 1px solid rgba(255,255,255,0.2);">
                    <span class="bot-lbl">Total Installment Premium</span>
                    <span class="bot-val hl" id="ftr-total-prem" style="font-size:24px">₹0</span>
                </div>
            </div>
        </div>
    `;

    bindEvents();
    recalc();

    // Tab switching
    const tabCalc = document.getElementById('tab-calculator');
    const tabFP = document.getElementById('tab-fundPerformance');
    const contentCalc = document.getElementById('tab-content-calculator');
    const contentFP = document.getElementById('tab-content-fundPerformance');
    const bottomBar = document.getElementById('bottom-bar');
    let fpInitialized = false;

    const switchTab = (tab) => {
        activeTab = tab;
        tabCalc.classList.toggle('active', tab === 'calculator');
        tabFP.classList.toggle('active', tab === 'fundPerformance');
        contentCalc.style.display = tab === 'calculator' ? 'block' : 'none';
        contentFP.style.display = tab === 'fundPerformance' ? 'block' : 'none';
        bottomBar.style.display = tab === 'calculator' ? 'flex' : 'none';

        if (tab === 'fundPerformance' && !fpInitialized) {
            fpInitialized = true;
            initFundPerformance(document.getElementById('fund-performance-root'));
        }
    };

    tabCalc.addEventListener('click', () => switchTab('calculator'));
    tabFP.addEventListener('click', () => switchTab('fundPerformance'));

    // Auto-load fund performance if that tab is active
    if (activeTab === 'fundPerformance') {
        fpInitialized = true;
        initFundPerformance(document.getElementById('fund-performance-root'));
    }
}

function renderActiveFunds() {
    return Object.entries(S.fundAllocations)
        .map(([f, alloc]) => `
        <div class="fg fund-row active-fund" style="margin-bottom:16px; position:relative" data-fund="${f}">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--t1); margin-bottom:6px; align-items:center">
                <span class="fund-name-lbl" title="${f}" style="font-weight:700; color:var(--bajaj-blue)">${f.length > 30 ? f.substring(0, 27) + '...' : f}</span>
                <div style="display:flex; gap:10px; align-items:center">
                    <span class="alloc-val" style="font-weight:800; color:var(--bajaj-orange); background:rgba(243,112,33,0.1); padding:2px 6px; border-radius:4px">${alloc}%</span>
                    <span class="material-icons-outlined btn-remove-fund" style="font-size:16px; cursor:pointer; color:var(--t3); hover:color:var(--bajaj-orange)">cancel</span>
                </div>
            </div>
            <input type="range" class="fund-range" data-fund="${f}" value="${alloc}" min="0" max="100" style="width:100%; height:4px">
        </div>
    `).join('');
}

function bindEvents() {
    const bindInp = (id, field, isNum = false) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', (e) => {
            S[field] = isNum ? parseFloat(e.target.value) || 0 : e.target.value;
            recalc();
        });
    };

    bindInp('inp-age', 'age', true);
    bindInp('inp-gender', 'gender');
    bindInp('inp-premium', 'yearlyPremium', true);
    bindInp('inp-sa-factor', 'saFactor', true);
    bindInp('inp-pt', 'pt', true);
    bindInp('inp-ppt', 'ppt', true);
    bindInp('inp-mode', 'mode');

    // Scenario Toggle
    const btn4 = document.getElementById('btn-scen-4');
    const btn8 = document.getElementById('btn-scen-8');
    const btnCustom = document.getElementById('btn-scen-custom');
    const customRateBox = document.getElementById('custom-rate-box');
    const customRange = document.getElementById('inp-custom-rate');

    const updateBtns = (scen) => {
        S.selectedScenario = scen;
        [btn4, btn8, btnCustom].forEach(b => {
            const isActive = (b.id === 'btn-scen-' + (scen === 'custom' ? 'custom' : scen));
            b.classList.toggle('active', isActive);
            b.style.background = isActive ? 'var(--bajaj-orange)' : 'var(--input)';
            b.style.color = isActive ? 'white' : 'var(--t2)';
        });
        customRateBox.style.display = scen === 'custom' ? 'block' : 'none';
        recalc();
    };

    btn4.addEventListener('click', () => updateBtns(4));
    btn8.addEventListener('click', () => updateBtns(8));
    btnCustom.addEventListener('click', () => updateBtns('custom'));

    customRange.addEventListener('input', (e) => {
        S.customReturn = parseFloat(e.target.value);
        e.target.nextElementSibling.innerText = S.customReturn + '%';
        recalc();
    });

    // Fund Selection Logic
    const fundContainer = document.getElementById('fund-sliders-container');
    const addFundSelect = document.getElementById('inp-add-fund');

    const attachFundListeners = () => {
        fundContainer.querySelectorAll('.fund-range').forEach(range => {
            range.oninput = (e) => {
                const f = e.target.dataset.fund;
                const v = parseInt(e.target.value);
                S.fundAllocations[f] = v;
                e.target.parentElement.querySelector('.alloc-val').innerText = v + '%';
                recalc();
            };
        });

        fundContainer.querySelectorAll('.btn-remove-fund').forEach(btn => {
            btn.onclick = (e) => {
                const f = e.target.closest('.fund-row').dataset.fund;
                delete S.fundAllocations[f];
                fundContainer.innerHTML = renderActiveFunds();
                attachFundListeners();
                recalc();
            };
        });
    };

    addFundSelect.onchange = (e) => {
        const f = e.target.value;
        if (!f) return;
        if (!(f in S.fundAllocations)) {
            S.fundAllocations[f] = 0;
            fundContainer.innerHTML = renderActiveFunds();
            attachFundListeners();
        }
        e.target.value = "";
    };

    attachFundListeners();

    // Addons
    const bindAddon = (id, key) => {
        const el = document.getElementById(`addon-${id}`);
        const tog = document.getElementById(`tog-${id}`);
        el.addEventListener('click', () => {
            S.addons[key] = !S.addons[key];
            toggleAddonUI(id, S.addons[key]);
            recalc();
        });
    };

    const toggleAddonUI = (id, state) => {
        const el = document.getElementById(`addon-${id}`);
        const tog = document.getElementById(`tog-${id}`);
        el.classList.toggle('on', state);
        tog.classList.toggle('on', state);
    };

    bindAddon('adb', 'adb');
    bindAddon('ci', 'ci');
    bindAddon('care', 'carePlus');
}

function recalc() {
    const totalAlloc = Object.values(S.fundAllocations).reduce((a, b) => a + b, 0);
    const allocDisp = document.getElementById('alloc-total');
    const err = document.getElementById('fund-err');

    if (allocDisp) {
        allocDisp.innerText = totalAlloc + '%';
        allocDisp.style.color = totalAlloc === 100 ? 'var(--bajaj-blue)' : 'var(--bajaj-orange)';
    }

    if (totalAlloc !== 100) {
        if (err) err.style.display = 'block';
        return;
    }
    if (err) err.style.display = 'none';

    document.getElementById('disp-sum-assured').innerText = formatCurrency(S.yearlyPremium * S.saFactor);

    let weightedFMC = 0;
    Object.keys(S.fundAllocations).forEach(f => {
        weightedFMC += (S.fundAllocations[f] / 100) * (CONFIG.charges.fmc[f] || 0.0135);
    });

    results = calculatePremium({ ...S, weightedFMC });
    if (!results.success) return;

    renderDashboard();
    renderLtcg();
    renderBITable();
    renderFooter();
    setTimeout(renderChart, 0);
}

function renderDashboard() {
    const container = document.getElementById('dashboard-container');
    const scenarioKey = S.selectedScenario === 'custom' ? 'custom' : 'scenario' + S.selectedScenario;
    const proj = results.projections[scenarioKey];
    const scenLabel = S.selectedScenario === 'custom' ? S.customReturn : S.selectedScenario;

    document.getElementById('disp-scen-label').innerText = scenLabel + '% p.a.';

    container.innerHTML = `
        <div class="card best dashboard-card">
            <div class="dashboard-header">
                <div class="header-left">
                    <span class="material-icons-outlined">insights</span>
                    <span>Investment Performance Dashboard</span>
                </div>
                <div class="badge">${scenLabel}% Growth Scenario</div>
            </div>
            
            <div class="dashboard-body">
                <div class="summary-stats">
                    <div class="main-stat">
                        <label>Maturity Fund Value (Year ${S.pt})</label>
                        <div class="value highlight">${formatCurrencyWhole(proj.finalFundValue)}</div>
                        <span class="subtext">At age ${S.age + S.pt}</span>
                    </div>
                    
                    <div class="stat-grid">
                        <div class="stat-item">
                            <label>Total Invested</label>
                            <div class="val">${formatCurrencyWhole(S.yearlyPremium * Math.min(S.pt, S.ppt))}</div>
                        </div>
                        <div class="stat-item">
                            <label>Net Wealth Gain</label>
                            <div class="val blue">${formatCurrencyWhole(proj.finalFundValue - (S.yearlyPremium * Math.min(S.pt, S.ppt)))}</div>
                        </div>
                        <div class="stat-item">
                            <label>Death Benefit (Y1)</label>
                            <div class="val">${formatCurrencyWhole(proj.yearlyDetails[0].deathBenefit)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="chart-container">
                    <div class="chart-header">
                        Wealth Growth Projection
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="maturity-chart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderLtcgSection(ltcg, yearlyPremium) {
    if (ltcg === null) return '';

    const head = `
        <div class="ltcg-head">
            <span class="material-icons-outlined">savings</span>
            <h3>Tax Benefit — LTCG Savings</h3>
            <span class="ltcg-badge">Exempt u/s 10(10D)</span>
        </div>`;

    if (ltcg.savings === 0) {
        return `
        <section class="ltcg-benefit">
            ${head}
            <div class="ltcg-zero">
                Maturity gain falls within the ₹1.25L LTCG exemption — no tax would
                apply even under equity mutual-fund taxation.
            </div>
        </section>`;
    }

    return `
        <section class="ltcg-benefit">
            ${head}
            <div class="ltcg-grid">
                <div class="ltcg-stat">
                    <label>Total Invested</label>
                    <div class="ltcg-val">${formatCurrency(ltcg.totalInvested)}</div>
                </div>
                <div class="ltcg-stat">
                    <label>Maturity Gain</label>
                    <div class="ltcg-val">${formatCurrency(ltcg.totalGain)}</div>
                </div>
                <div class="ltcg-stat">
                    <label>LTCG if taxed as Equity MF</label>
                    <div class="ltcg-val red">${formatCurrency(ltcg.hypotheticalLtcg)}</div>
                    <div class="ltcg-sub">12.5% on ${formatCurrency(ltcg.taxableGain)} (above ₹1.25L exemption)</div>
                </div>
                <div class="ltcg-stat highlight">
                    <label>You Save</label>
                    <div class="ltcg-val green">${formatCurrency(ltcg.savings)}</div>
                    <div class="ltcg-sub">vs equivalent equity MF gain</div>
                </div>
            </div>
            <div class="ltcg-fine">
                Applicable because annual premium (${formatCurrency(yearlyPremium)}) is within the
                ₹2.5L limit. ULIP proceeds are tax-free under Section 10(10D). The comparison applies
                the current LTCG rate (12.5% on gains above ₹1.25L) to this ULIP's own gain as an
                equivalent mutual-fund tax liability.
            </div>
        </section>`;
}

function renderLtcg() {
    const slot = document.getElementById('ltcg-benefit-slot');
    if (!slot) return;

    const scenarioKey = S.selectedScenario === 'custom' ? 'custom' : 'scenario' + S.selectedScenario;
    const proj = results.projections[scenarioKey];
    const payYears = Math.min(S.pt, S.ppt);

    const ltcg = computeLtcgBenefit(proj, S.yearlyPremium, payYears);
    slot.innerHTML = renderLtcgSection(ltcg, S.yearlyPremium);
}

function renderBITable() {
    const tbody = document.querySelector('#bi-table tbody');
    const scenarioKey = S.selectedScenario === 'custom' ? 'custom' : 'scenario' + S.selectedScenario;
    const details = results.projections[scenarioKey].yearlyDetails;

    tbody.innerHTML = details.map(d => {
        const otherCharges = d.allocationCharge + d.pac;
        const gst = 0.18 * (d.mortality + otherCharges + d.fmc);
        const surrender = d.year < 5 ? 0 : d.fundAtEnd;
        return `
        <tr>
            <td>Year ${d.year}</td>
            <td class="value-cell">${formatCurrencyWhole(d.premiumPaid)}</td>
            <td class="value-cell">${formatCurrencyWhole(d.mortality)}</td>
            <td class="value-cell">${formatCurrencyWhole(otherCharges)}</td>
            <td class="value-cell">${formatCurrencyWhole(d.fmc)}</td>
            <td class="value-cell">${formatCurrencyWhole(gst)}</td>
            <td class="value-cell" style="font-weight:700; color:var(--bajaj-blue)">${formatCurrencyWhole(d.fundAtEnd)}</td>
            <td class="value-cell">${d.year < 5 ? '<span style="color:var(--t3)">Locked</span>' : formatCurrencyWhole(surrender)}</td>
            <td class="value-cell">${formatCurrencyWhole(d.deathBenefit)}</td>
        </tr>
    `;
    }).join('');
}

function renderFooter() {
    document.getElementById('ftr-base-prem').innerText = formatCurrency(results.basePremium);
    document.getElementById('ftr-riders').innerText = formatCurrency(results.riderPremium);
    document.getElementById('ftr-mode').innerText = S.mode;
    document.getElementById('ftr-total-prem').innerText = formatCurrency(results.modalPremium);

    const setPrice = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = '+ ' + formatCurrency(val);
    };
    setPrice('price-adb', results.breakdown.adb);
    setPrice('price-ci', results.breakdown.ci);
    setPrice('price-care', results.breakdown.carePlus);
}

function renderChart() {
    const canvas = document.getElementById('maturity-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scenarioKey = S.selectedScenario === 'custom' ? 'custom' : 'scenario' + S.selectedScenario;
    const details = results.projections[scenarioKey].yearlyDetails;

    const labels = details.map(d => '' + d.year);
    const fundData = details.map(d => d.fundAtEnd);
    const premiumData = [];
    let runningPremium = 0;
    details.forEach(d => {
        runningPremium += d.premiumPaid;
        premiumData.push(runningPremium);
    });

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Fund Value',
                    data: fundData,
                    borderColor: '#f37021',
                    backgroundColor: 'rgba(243, 112, 33, 0.05)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#f37021'
                },
                {
                    label: 'Total Paid',
                    data: premiumData,
                    borderColor: '#0b3a6e',
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0,
                    borderWidth: 1.5,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: true, position: 'bottom', labels: { boxWidth: 8, font: { size: 10, weight: '600' } } },
                tooltip: { backgroundColor: 'rgba(11, 58, 110, 0.95)', titleFont: { size: 12 }, padding: 12 }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: val => {
                            if (val >= 10000000) return (val / 10000000).toFixed(1) + ' Cr';
                            if (val >= 100000) return (val / 100000).toFixed(1) + ' L';
                            return val;
                        },
                        font: { size: 9 }
                    },
                    grid: { color: 'rgba(226, 232, 240, 0.5)' }
                },
                x: { ticks: { font: { size: 9 } }, grid: { display: false } }
            }
        }
    });
}

export async function bootstrap(rootId) {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.innerHTML = `<div class="ld"><div class="sp"></div><div class="lt">Initializing Dashboard...</div></div>`;
    try {
        await loadConfig();
        await loadRateData();
        setTimeout(() => initApp(root), 300);
    } catch (e) {
        root.innerHTML = `<div>Error: ${e}</div>`;
    }
}
