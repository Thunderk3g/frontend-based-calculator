/**
 * Fund Performance Calculator Module
 * Shows real historical fund performance and calculates portfolio returns
 */
import { fetchFundData, calculatePortfolioReturn, RETURN_PERIODS } from './fundApi.js';
import { formatCurrency, formatCurrencyWhole } from './calc.js';

let allFunds = [];
let productInfo = null;
let selectedAllocations = []; // { fundCode, allocationPct }
let investmentAmount = 1000000; // Default 10 Lakhs
let selectedPeriod = '3y';
let selectedCategoryFilter = 'All'; // view-only chip filter
let isLoading = false;
let loadError = null;
let chartInstances = [];

export async function initFundPerformance(container) {
    container.innerHTML = renderLoading();
    try {
        isLoading = true;
        const data = await fetchFundData();
        allFunds = data.funds;
        productInfo = data.product;
        selectedCategoryFilter = 'All';
        isLoading = false;
        loadError = null;
    } catch (err) {
        isLoading = false;
        loadError = err.message;
    }
    render(container);
}

/**
 * Pure helper: returns a filtered + sorted fund list.
 * Sort is descending by the selected period's return field; null returns sink last.
 */
function getFilteredSortedFunds(funds, categoryFilter, periodKey) {
    const period = RETURN_PERIODS.find(p => p.key === periodKey);
    const field = period?.field ?? 'return3Y';

    const filtered = categoryFilter === 'All'
        ? funds
        : funds.filter(f => f.category === categoryFilter);

    return [...filtered].sort((a, b) => {
        const av = a[field];
        const bv = b[field];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        return bv - av;
    });
}

/**
 * Build the horizontal chip row for category filtering.
 * Always derives chips from the full fund universe so categories
 * never disappear when a filter is active.
 */
function renderCategoryChips(funds, selectedCategory) {
    const categories = [...new Set(funds.map(f => f.category))].sort();
    const items = ['All', ...categories];
    return `
        <div class="fp-chip-row" role="group" aria-label="Filter by fund category" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px">
            ${items.map(cat => `
                <button type="button" class="chip fp-cat-chip ${selectedCategory === cat ? 'on' : ''}" data-cat="${cat}" aria-pressed="${selectedCategory === cat}">${cat}</button>
            `).join('')}
        </div>
    `;
}

function renderLoading() {
    return `<div class="fp-loading">
        <div class="sp"></div>
        <div class="lt">Fetching live fund performance data...</div>
    </div>`;
}

function render(container) {
    if (loadError) {
        container.innerHTML = `
            <div class="fp-error">
                <span class="material-icons-outlined">error_outline</span>
                <h3>Unable to fetch fund data</h3>
                <p>${loadError}</p>
                <button class="fp-retry-btn" id="fp-retry">Retry</button>
            </div>`;
        document.getElementById('fp-retry')?.addEventListener('click', () => initFundPerformance(container));
        return;
    }

    // Group funds by category
    const categories = {};
    allFunds.forEach(f => {
        if (!categories[f.category]) categories[f.category] = [];
        categories[f.category].push(f);
    });

    const totalAlloc = selectedAllocations.reduce((s, a) => s + a.allocationPct, 0);
    const portfolioResult = totalAlloc === 100 ? calculatePortfolioReturn(investmentAmount,
        selectedAllocations.map(a => ({ fund: allFunds.find(f => f.code === a.fundCode), allocationPct: a.allocationPct })).filter(a => a.fund),
        selectedPeriod
    ) : null;

    container.innerHTML = `
        <div class="fp-wrapper">
            <!-- Left: Fund Selection Panel -->
            <aside class="fp-sidebar">
                <div class="profile-hdr">
                    <span class="material-icons-outlined">tune</span>
                    <h2>Investment Setup</h2>
                </div>

                <div class="pf">
                    <div class="fg">
                        <label>Investment Amount</label>
                        <input type="number" id="fp-investment" value="${investmentAmount}" min="10000" step="10000">
                        <div style="font-size:10px; color:var(--t3); margin-top:2px">${formatInLakhs(investmentAmount)}</div>
                    </div>

                    <div class="fg">
                        <label>Return Period</label>
                        <div class="fp-period-grid">
                            ${RETURN_PERIODS.filter(p => p.key !== 'custom').map(p => `
                                <button class="fp-period-btn ${selectedPeriod === p.key ? 'active' : ''}" data-period="${p.key}">${p.label}</button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="sep"></div>

                    <div class="profile-hdr fund-hdr" style="margin-bottom:8px; border-bottom:none; padding-bottom:0">
                        <span class="material-icons-outlined" style="font-size:16px">pie_chart</span>
                        <h2 style="font-size:12px; display:flex; justify-content:space-between; width:100%">
                            Fund Allocation
                            <span id="fp-alloc-total" style="color:${totalAlloc === 100 ? 'var(--bajaj-blue)' : 'var(--primary)'}">${totalAlloc}%</span>
                        </h2>
                    </div>

                    <div class="fg" style="margin-bottom:8px">
                        <select id="fp-add-fund" style="font-size:11px; padding:10px; width:100%; cursor:pointer; background:var(--bg)">
                            <option value="">+ Add Fund...</option>
                            ${Object.entries(categories).map(([cat, funds]) => `
                                <optgroup label="${cat}">
                                    ${funds.map(f => `<option value="${f.code}" ${selectedAllocations.find(a => a.fundCode === f.code) ? 'disabled' : ''}>${f.name}</option>`).join('')}
                                </optgroup>
                            `).join('')}
                        </select>
                    </div>

                    <div id="fp-fund-sliders">
                        ${renderFundSliders()}
                    </div>

                    ${totalAlloc !== 100 ? `<div class="card-err" style="display:block">Total allocation must equal 100% (currently ${totalAlloc}%)</div>` : ''}
                </div>
            </aside>

            <!-- Right: Results Area -->
            <div class="fp-results">
                ${portfolioResult && portfolioResult.allAvailable ? renderResults(portfolioResult) : renderFundCards()}
            </div>
        </div>
    `;

    bindFPEvents(container);
}

function renderFundSliders() {
    if (selectedAllocations.length === 0) {
        return `<div style="text-align:center; padding:20px; color:var(--t3); font-size:12px">
            Select funds from the dropdown above to start building your portfolio
        </div>`;
    }

    return selectedAllocations.map(({ fundCode, allocationPct }) => {
        const fund = allFunds.find(f => f.code === fundCode);
        if (!fund) return '';
        return `
            <div class="fp-fund-row" data-code="${fundCode}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
                    <div style="flex:1; min-width:0">
                        <div class="fp-fund-name" title="${fund.name}">${fund.name}</div>
                        <div style="font-size:9px; color:var(--t3)">${fund.category} | NAV: ${fund.nav?.toFixed(2) || 'N/A'}</div>
                    </div>
                    <div style="display:flex; gap:8px; align-items:center">
                        <span class="fp-alloc-val">${allocationPct}%</span>
                        <span class="material-icons-outlined fp-remove-fund" style="font-size:16px; cursor:pointer; color:var(--t3)">cancel</span>
                    </div>
                </div>
                <input type="range" class="fp-fund-range" data-code="${fundCode}" value="${allocationPct}" min="0" max="100" step="5">
            </div>
        `;
    }).join('');
}

function renderFundCards() {
    const periodObj = RETURN_PERIODS.find(p => p.key === selectedPeriod);
    const visibleFunds = getFilteredSortedFunds(allFunds, selectedCategoryFilter, selectedPeriod);
    return `
        <div class="fp-overview-header">
            <h3><span class="material-icons-outlined">assessment</span> All Funds - ${productInfo?.name || 'Goal Assure'}</h3>
            <p>Showing <strong>${periodObj?.label}</strong> performance, sorted highest first${selectedCategoryFilter !== 'All' ? ` · <strong>${selectedCategoryFilter}</strong>` : ''}.</p>
        </div>
        ${renderCategoryChips(allFunds, selectedCategoryFilter)}
        <div class="fp-fund-cards">
            ${visibleFunds.map(fund => {
                const ret = fund[periodObj.field];
                const bmRet = periodObj.bmField ? fund[periodObj.bmField] : null;
                const hasReturn = ret !== null && ret !== undefined;
                const isPositive = ret > 0;
                const beat = ret != null && bmRet != null && ret > bmRet;
                return `
                <div class="fp-fund-card ${!hasReturn ? 'fp-na' : ''}" data-code="${fund.code}">
                    <div class="fp-fc-header">
                        <div class="fp-fc-name">${fund.name}</div>
                        <div class="fp-fc-category">${fund.category}</div>
                    </div>
                    <div class="fp-fc-body">
                        <div class="fp-fc-return ${isPositive ? 'positive' : 'negative'}">
                            ${hasReturn ? `${ret > 0 ? '+' : ''}${ret}%` : 'N/A'}
                        </div>
                        <div class="fp-fc-label">${periodObj.label} Return${!periodObj.isAbsolute ? ' (CAGR)' : ''}</div>
                        ${bmRet != null ? `
                            <div class="fp-fc-benchmark">
                                <span>Benchmark: ${bmRet > 0 ? '+' : ''}${bmRet}%</span>
                                ${beat ? '<span class="fp-beat">Outperformed</span>' : ''}
                            </div>
                        ` : ''}
                        <div class="fp-fc-meta">
                            <span>NAV: ${fund.nav?.toFixed(2) || '-'}</span>
                            ${fund.riskLevel ? `<span class="fp-risk fp-risk-${fund.riskLevel.toLowerCase().replace(' ', '-')}">${fund.riskLevel}</span>` : ''}
                        </div>
                    </div>
                    <button class="fp-add-btn" data-code="${fund.code}" ${selectedAllocations.find(a => a.fundCode === fund.code) ? 'disabled' : ''}>
                        ${selectedAllocations.find(a => a.fundCode === fund.code) ? 'Added' : '+ Add to Portfolio'}
                    </button>
                </div>`;
            }).join('')}
        </div>
    `;
}

function renderResults(result) {
    const periodLabel = result.period.label;
    const isCAGR = !result.period.isAbsolute;
    const isProfit = result.totalGain >= 0;

    return `
        <div class="fp-result-section">
            <!-- Portfolio Summary Card -->
            <div class="fp-summary-card ${isProfit ? 'profit' : 'loss'}">
                <div class="fp-summary-header">
                    <div>
                        <span class="material-icons-outlined">account_balance_wallet</span>
                        <span>Portfolio Performance - ${periodLabel}</span>
                    </div>
                    <div class="fp-summary-badge">${isCAGR ? 'CAGR' : 'Absolute'} Return</div>
                </div>

                <div class="fp-summary-body">
                    <div class="fp-summary-main">
                        <div class="fp-summary-stat">
                            <label>Total Invested</label>
                            <div class="fp-stat-value">${formatCurrency(result.totalInvestment)}</div>
                        </div>
                        <div class="fp-summary-arrow">
                            <span class="material-icons-outlined">${isProfit ? 'trending_up' : 'trending_down'}</span>
                        </div>
                        <div class="fp-summary-stat">
                            <label>Current Value</label>
                            <div class="fp-stat-value highlight">${formatCurrency(result.totalFinalValue)}</div>
                        </div>
                    </div>

                    <div class="fp-summary-metrics">
                        <div class="fp-metric">
                            <label>${isProfit ? 'Profit' : 'Loss'}</label>
                            <div class="fp-metric-val ${isProfit ? 'green' : 'red'}">${isProfit ? '+' : ''}${formatCurrency(result.totalGain)}</div>
                        </div>
                        <div class="fp-metric">
                            <label>Total Return</label>
                            <div class="fp-metric-val ${isProfit ? 'green' : 'red'}">${isProfit ? '+' : ''}${result.totalReturnPct.toFixed(2)}%</div>
                        </div>
                        ${result.weightedCAGR !== null ? `
                        <div class="fp-metric">
                            <label>Weighted CAGR</label>
                            <div class="fp-metric-val ${result.weightedCAGR >= 0 ? 'green' : 'red'}">${result.weightedCAGR >= 0 ? '+' : ''}${result.weightedCAGR.toFixed(2)}%</div>
                        </div>` : ''}
                    </div>
                </div>
            </div>

            <!-- Fund-wise Contribution Cards -->
            <div class="fp-contrib-row">
                ${result.fundResults.map((fr, i) => {
                    const colors = ['#f37021', '#005cb9', '#0d9f6e', '#d97706', '#c41230', '#6366f1', '#14b8a6', '#ec4899'];
                    const color = colors[i % colors.length];
                    const gainPct = fr.investment > 0 ? (fr.gain / fr.investment) * 100 : 0;
                    const shareOfGain = result.totalGain !== 0 ? (fr.gain / result.totalGain) * 100 : 0;
                    const positive = fr.gain >= 0;
                    return `
                    <div class="fp-contrib-card" style="border-top:3px solid ${color}">
                        <div class="fp-contrib-name" title="${fr.fund.name}">${fr.fund.name}</div>
                        <div class="fp-contrib-alloc">${fr.allocationPct}% allocation  ·  ${formatCurrency(fr.investment)}</div>
                        <div class="fp-contrib-gain ${positive ? 'green' : 'red'}">${positive ? '+' : ''}${gainPct.toFixed(2)}%</div>
                        <div class="fp-contrib-meta">Gain: <strong class="${positive ? 'green' : 'red'}">${positive ? '+' : ''}${formatCurrency(fr.gain)}</strong></div>
                        <div class="fp-contrib-meta">Share of total gain: <strong>${isFinite(shareOfGain) ? shareOfGain.toFixed(1) : '0.0'}%</strong></div>
                    </div>`;
                }).join('')}
            </div>

            <!-- Fund-wise Breakdown -->
            <div class="fp-breakdown-section">
                <div class="sec-title">
                    <span class="material-icons-outlined">pie_chart</span> Fund-wise Breakdown
                </div>
                <div class="fp-breakdown-table-wrap">
                    <table class="breakdown-table fp-breakdown-table">
                        <thead>
                            <tr>
                                <th>Fund</th>
                                <th>Allocation</th>
                                <th>Invested</th>
                                <th>Return %</th>
                                <th>Final Value</th>
                                <th>Gain / Loss</th>
                                <th>Benchmark</th>
                                <th>Alpha</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${result.fundResults.map(fr => {
                                const gain = fr.gain;
                                const alpha = fr.returnPct !== null && fr.benchmarkReturn !== null
                                    ? (fr.returnPct - fr.benchmarkReturn).toFixed(2)
                                    : null;
                                return `
                                <tr>
                                    <td>
                                        <div class="fp-td-fund">${fr.fund.name}</div>
                                        <div class="fp-td-category">${fr.fund.category}</div>
                                    </td>
                                    <td class="value-cell">${fr.allocationPct}%</td>
                                    <td class="value-cell">${formatCurrency(fr.investment)}</td>
                                    <td class="value-cell ${fr.returnPct >= 0 ? 'fp-green' : 'fp-red'}">${fr.returnPct !== null ? `${fr.returnPct > 0 ? '+' : ''}${fr.returnPct}%` : 'N/A'}</td>
                                    <td class="value-cell" style="font-weight:700">${formatCurrency(fr.finalValue)}</td>
                                    <td class="value-cell ${gain >= 0 ? 'fp-green' : 'fp-red'}">${gain >= 0 ? '+' : ''}${formatCurrency(gain)}</td>
                                    <td class="value-cell">${fr.benchmarkReturn !== null ? `${fr.benchmarkReturn}%` : '-'}</td>
                                    <td class="value-cell ${alpha > 0 ? 'fp-green' : alpha < 0 ? 'fp-red' : ''}">${alpha !== null ? `${alpha > 0 ? '+' : ''}${alpha}%` : '-'}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Visual: Allocation Pie + Bar Chart -->
            <div class="fp-charts-row">
                <div class="fp-chart-card">
                    <div class="sec-title"><span class="material-icons-outlined">donut_large</span> Allocation Split</div>
                    <div class="fp-chart-canvas-wrap"><canvas id="fp-pie-chart"></canvas></div>
                </div>
                <div class="fp-chart-card">
                    <div class="sec-title"><span class="material-icons-outlined">bar_chart</span> Invested vs Final Value</div>
                    <div class="fp-chart-canvas-wrap"><canvas id="fp-bar-chart"></canvas></div>
                </div>
            </div>

            <!-- Fund Cards Overview -->
            <div class="fp-overview-header" style="margin-top:24px">
                <h3><span class="material-icons-outlined">assessment</span> All Available Funds</h3>
                <p>Click "Add to Portfolio" to include more funds. Sorted highest ${RETURN_PERIODS.find(p => p.key === selectedPeriod)?.label || ''} return first.</p>
            </div>
            ${renderCategoryChips(allFunds, selectedCategoryFilter)}
            <div class="fp-fund-cards compact">
                ${getFilteredSortedFunds(allFunds, selectedCategoryFilter, selectedPeriod).map(fund => {
                    const periodObj = RETURN_PERIODS.find(p => p.key === selectedPeriod);
                    const ret = fund[periodObj.field];
                    const hasReturn = ret !== null && ret !== undefined;
                    const isAdded = selectedAllocations.find(a => a.fundCode === fund.code);
                    return `
                    <div class="fp-fund-card mini ${isAdded ? 'added' : ''}" data-code="${fund.code}">
                        <div class="fp-fc-name" style="font-size:11px">${fund.name}</div>
                        <div class="fp-fc-return ${ret > 0 ? 'positive' : 'negative'}" style="font-size:16px">${hasReturn ? `${ret > 0 ? '+' : ''}${ret}%` : 'N/A'}</div>
                        <div class="fp-fc-category">${fund.category}</div>
                        <button class="fp-add-btn mini" data-code="${fund.code}" ${isAdded ? 'disabled' : ''}>
                            ${isAdded ? 'Added' : '+ Add'}
                        </button>
                    </div>`;
                }).join('')}
            </div>
        </div>
    `;
}

function bindFPEvents(container) {
    // Investment amount
    const invInput = document.getElementById('fp-investment');
    if (invInput) {
        invInput.addEventListener('input', (e) => {
            investmentAmount = parseFloat(e.target.value) || 0;
            render(container);
        });
    }

    // Period selection
    container.querySelectorAll('.fp-period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedPeriod = btn.dataset.period;
            render(container);
        });
    });

    // Category chip filter — view-only, never mutates selectedAllocations
    container.querySelectorAll('.fp-cat-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            selectedCategoryFilter = chip.dataset.cat;
            render(container);
        });
    });

    // Add fund from dropdown
    const addSelect = document.getElementById('fp-add-fund');
    if (addSelect) {
        addSelect.addEventListener('change', (e) => {
            const code = e.target.value;
            if (!code) return;
            addFundToPortfolio(code);
            render(container);
        });
    }

    // Add fund from card buttons
    container.querySelectorAll('.fp-add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.dataset.code;
            addFundToPortfolio(code);
            render(container);
        });
    });

    // Fund range sliders
    container.querySelectorAll('.fp-fund-range').forEach(range => {
        range.addEventListener('input', (e) => {
            const code = e.target.dataset.code;
            const val = parseInt(e.target.value);
            const alloc = selectedAllocations.find(a => a.fundCode === code);
            if (alloc) alloc.allocationPct = val;
            render(container);
        });
    });

    // Remove fund
    container.querySelectorAll('.fp-remove-fund').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('.fp-fund-row');
            const code = row?.dataset.code;
            if (code) {
                selectedAllocations = selectedAllocations.filter(a => a.fundCode !== code);
                render(container);
            }
        });
    });

    // Render charts if results are visible
    setTimeout(() => renderCharts(), 50);
}

function addFundToPortfolio(code) {
    if (selectedAllocations.find(a => a.fundCode === code)) return;
    // Auto-distribute equally
    selectedAllocations.push({ fundCode: code, allocationPct: 0 });
    const each = Math.floor(100 / selectedAllocations.length / 5) * 5;
    const remainder = 100 - each * selectedAllocations.length;
    selectedAllocations.forEach((a, i) => {
        a.allocationPct = each + (i === 0 ? remainder : 0);
    });
}

function renderCharts() {
    if (typeof Chart === 'undefined') return;

    chartInstances.forEach(c => { try { c.destroy(); } catch (e) {} });
    chartInstances = [];

    const totalAlloc = selectedAllocations.reduce((s, a) => s + a.allocationPct, 0);
    if (totalAlloc !== 100) return;

    const result = calculatePortfolioReturn(investmentAmount,
        selectedAllocations.map(a => ({ fund: allFunds.find(f => f.code === a.fundCode), allocationPct: a.allocationPct })).filter(a => a.fund),
        selectedPeriod
    );
    if (!result || !result.allAvailable) return;

    // Pie Chart
    const pieCanvas = document.getElementById('fp-pie-chart');
    if (pieCanvas) {
        const colors = ['#f37021', '#005cb9', '#0d9f6e', '#d97706', '#c41230', '#6366f1', '#14b8a6', '#ec4899'];
        const pieChart = new Chart(pieCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: result.fundResults.map(fr => fr.fund.name.length > 20 ? fr.fund.name.substring(0, 18) + '...' : fr.fund.name),
                datasets: [{
                    data: result.fundResults.map(fr => fr.allocationPct),
                    backgroundColor: colors.slice(0, result.fundResults.length),
                    borderWidth: 2,
                    borderColor: '#fff',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 10 } },
                }
            }
        });
        chartInstances.push(pieChart);
    }

    // Bar Chart
    const barCanvas = document.getElementById('fp-bar-chart');
    if (barCanvas) {
        const labels = result.fundResults.map(fr => fr.fund.name.length > 15 ? fr.fund.name.substring(0, 13) + '...' : fr.fund.name);
        const barChart = new Chart(barCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Invested',
                        data: result.fundResults.map(fr => fr.investment),
                        backgroundColor: 'rgba(0, 92, 185, 0.7)',
                    },
                    {
                        label: 'Final Value',
                        data: result.fundResults.map(fr => fr.finalValue),
                        backgroundColor: 'rgba(243, 112, 33, 0.7)',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 10 } } },
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
                        }
                    },
                    x: { ticks: { font: { size: 9 } } }
                }
            }
        });
        chartInstances.push(barChart);
    }
}

function formatInLakhs(amount) {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(2)} Crore`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(2)} Lakhs`;
    return `${formatCurrencyWhole(amount)}`;
}
