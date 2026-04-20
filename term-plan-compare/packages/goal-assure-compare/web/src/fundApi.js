/**
 * Fund Performance API Service
 * Fetches real fund performance data from Bajaj Allianz Life API
 */

const API_URL = 'https://online.bajajlife.com/OnlineCustomerPortal/ws/Prelogin/azbj_fund_dtls';

const RETURN_PERIODS = [
    { key: '1m', label: '1 Month', field: 'return1M', bmField: 'bmReturn1M', years: 1 / 12, isAbsolute: true },
    { key: '3m', label: '3 Months', field: 'return3M', bmField: 'bmReturn3M', years: 0.25, isAbsolute: true },
    { key: '6m', label: '6 Months', field: 'return6M', bmField: 'bmReturn6M', years: 0.5, isAbsolute: true },
    { key: '1y', label: '1 Year', field: 'return1Y', bmField: 'bmReturn1Y', years: 1, isAbsolute: true },
    { key: '3y', label: '3 Years', field: 'return3Y', bmField: 'bmReturn3Y', years: 3, isAbsolute: false },
    { key: '5y', label: '5 Years', field: 'return5Y', bmField: 'bmReturn5Y', years: 5, isAbsolute: false },
    { key: '7y', label: '7 Years', field: 'return7Y', bmField: 'bmReturn7Y', years: 7, isAbsolute: false },
    { key: '10y', label: '10 Years', field: 'return10Y', bmField: 'bmReturn10Y', years: 10, isAbsolute: false },
    { key: '20y', label: '20 Years', field: 'return20Y', bmField: 'bmReturn20Y', years: 20, isAbsolute: false },
    { key: '30y', label: '30 Years', field: 'return30Y', bmField: 'bmReturn30Y', years: 30, isAbsolute: false },
    { key: 'si', label: 'Since Inception', field: 'returnSI', bmField: 'bmReturnSI', years: null, isAbsolute: false },
    { key: 'custom', label: 'Custom Period', field: 'returnCustom', bmField: 'bmReturnCustom', years: null, isAbsolute: false },
];

export { RETURN_PERIODS };

/**
 * Parse raw API fund object into a clean structure
 */
function parseFund(raw) {
    return {
        code: raw.stringval1,
        name: raw.stringval2,
        ulifNumber: raw.stringval3,
        return1M: parseFloat(raw.stringval4) || null,
        return3M: parseFloat(raw.stringval5) || null,
        return6M: parseFloat(raw.stringval6) || null,
        return1Y: parseFloat(raw.stringval7) || null,
        return3Y: parseFloat(raw.stringval8) || null,
        return5Y: parseFloat(raw.stringval9) || null,
        return7Y: parseFloat(raw.stringval10) || null,
        returnSI: parseFloat(raw.stringval11) || null,
        inceptionDate: raw.stringval12,
        starRating: raw.stringval13 ? parseInt(raw.stringval13) : null,
        riskLevel: raw.stringval14 || null,
        nav: parseFloat(raw.stringval15) || null,
        holdings: raw.stringval16,
        benchmark: raw.stringval17,
        bmReturn1M: parseFloat(raw.stringval18) || null,
        bmReturn3M: parseFloat(raw.stringval19) || null,
        bmReturn6M: parseFloat(raw.stringval20) || null,
        bmReturn1Y: parseFloat(raw.stringval21) || null,
        bmReturn3Y: parseFloat(raw.stringval22) || null,
        bmReturn5Y: parseFloat(raw.stringval23) || null,
        bmReturn7Y: parseFloat(raw.stringval24) || null,
        bmReturnSI: null,
        bmNav: parseFloat(raw.stringval27) || null,
        navDate: raw.stringval28,
        returnFromDate: raw.stringval29,
        returnCustom: parseFloat(raw.stringval30) || null,
        bmReturnCustom: parseFloat(raw.stringval31) || null,
        category: raw.stringval32 || 'Uncategorized',
    };
}

const MONTH_ABBR = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function fmtDate(d) {
    return `${String(d.getDate()).padStart(2, '0')}/${MONTH_ABBR[d.getMonth()]}/${d.getFullYear()}`;
}

function yearsAgoDate(years) {
    const d = new Date();
    d.setFullYear(d.getFullYear() - years);
    return d;
}

/**
 * Fire one POST to the fund-details endpoint. Resolves with parsed JSON on success,
 * throws on any error. Used as the low-level primitive for parallel window calls.
 */
async function fetchWindow(fromDate, toDate) {
    const body = {
        p_prod_id: 307,
        p_fund_name: "",
        p_flag: "product_name",
        p_from_date: fromDate,
        p_to_date: toDate,
    };

    const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!resp.ok) throw new Error(`API returned ${resp.status}`);
    const data = await resp.json();
    if (data.p_error_code !== 'success') throw new Error(data.p_message || 'API error');
    return data;
}

/**
 * Fetch fund performance data from Bajaj Life API.
 *
 * Fires three parallel calls with different date windows so each response's
 * `returnCustom` (stringval30) field carries a different look-back period.
 * After all calls resolve, we retag each window's returnCustom onto a distinct
 * field on the fund object (return10Y / return20Y / return30Y).
 *
 * Uses Promise.allSettled — if any single window fails, the page still loads
 * with the remaining windows populated and the failed one showing N/A.
 */
export async function fetchFundData() {
    const today = fmtDate(new Date());

    const windows = [
        { label: '10Y', from: fmtDate(yearsAgoDate(10)), to: today, field: 'return10Y', bmField: 'bmReturn10Y' },
        { label: '20Y', from: fmtDate(yearsAgoDate(20)), to: today, field: 'return20Y', bmField: 'bmReturn20Y' },
        { label: '30Y', from: fmtDate(yearsAgoDate(30)), to: today, field: 'return30Y', bmField: 'bmReturn30Y' },
    ];

    // Fire all three windows in parallel.
    const settled = await Promise.allSettled(
        windows.map(w => fetchWindow(w.from, w.to))
    );

    // Use the first successful response as the base — stable fields like
    // return3Y, category, name, nav are window-independent and come from
    // any successful call.
    const firstSuccess = settled.find(r => r.status === 'fulfilled');
    if (!firstSuccess) {
        const reasons = settled.map(r => r.reason?.message || 'unknown').join('; ');
        throw new Error(`All fund data calls failed: ${reasons}`);
    }

    const baseData = firstSuccess.value;
    const baseFunds = (baseData.p_funds_dtls || []).map(parseFund);
    // parseFund copies stringval30/31 into returnCustom/bmReturnCustom — but that
    // value belongs to whichever window seeded the base, not a user-specified
    // custom period. Null them so the "Custom Period" slot doesn't mislead.
    baseFunds.forEach(f => {
        f.returnCustom = null;
        f.bmReturnCustom = null;
    });
    const fundMap = new Map(baseFunds.map(f => [f.code, f]));

    // Retag each window's returnCustom / bmReturnCustom onto the per-window field.
    settled.forEach((result, i) => {
        const w = windows[i];
        if (result.status !== 'fulfilled') {
            console.warn(`[fetchFundData] Window ${w.label} failed:`, result.reason?.message);
            fundMap.forEach(fund => {
                fund[w.field] = null;
                fund[w.bmField] = null;
            });
            return;
        }
        const rawFunds = result.value.p_funds_dtls || [];
        rawFunds.forEach(raw => {
            const code = raw.stringval1;
            const fund = fundMap.get(code);
            if (!fund) return;
            const ret = parseFloat(raw.stringval30);
            const bmRet = parseFloat(raw.stringval31);
            fund[w.field] = isNaN(ret) ? null : ret;
            fund[w.bmField] = isNaN(bmRet) ? null : bmRet;
        });
        // Ensure every fund has the field even if this window's response omitted it
        fundMap.forEach(fund => {
            if (!(w.field in fund)) fund[w.field] = null;
            if (!(w.bmField in fund)) fund[w.bmField] = null;
        });
    });

    const funds = Array.from(fundMap.values());
    const product = {
        name: baseData.p_prod_dtls?.stringval1 || 'Bajaj Allianz Life Goal Assure',
        tagline: baseData.p_prod_dtls?.stringval2 || '',
    };

    return { funds, product };
}

/**
 * Calculate investment return for a single fund over a given period
 * @param {number} investment - Amount invested
 * @param {number} returnPct - Return percentage (absolute for <=1Y, CAGR for >1Y)
 * @param {object} period - Period config from RETURN_PERIODS
 * @param {number} [inceptionYears] - Years since inception (for SI calculation)
 * @returns {{ finalValue: number, gain: number, returnPct: number }}
 */
export function calculateFundReturn(investment, returnPct, period, inceptionYears) {
    if (returnPct === null || returnPct === undefined || isNaN(returnPct)) {
        return { finalValue: investment, gain: 0, returnPct: 0, available: false };
    }

    let finalValue;
    const rate = returnPct / 100;

    if (period.isAbsolute) {
        // For periods <= 1Y, the return is absolute (not annualized)
        finalValue = investment * (1 + rate);
    } else {
        // For periods > 1Y, the return is CAGR (annualized)
        const years = period.key === 'si' ? (inceptionYears || 1) : (period.years || 1);
        finalValue = investment * Math.pow(1 + rate, years);
    }

    return {
        finalValue,
        gain: finalValue - investment,
        returnPct,
        available: true,
    };
}

/**
 * Calculate weighted portfolio return for multiple fund allocations
 * @param {number} totalInvestment - Total investment amount
 * @param {Array<{fund: object, allocationPct: number}>} allocations - Fund allocations
 * @param {string} periodKey - Period key (e.g., '3y', '5y')
 * @returns {object} Portfolio calculation result
 */
export function calculatePortfolioReturn(totalInvestment, allocations, periodKey) {
    const period = RETURN_PERIODS.find(p => p.key === periodKey);
    if (!period) return null;

    let totalFinalValue = 0;
    let allAvailable = true;
    const fundResults = [];

    for (const { fund, allocationPct } of allocations) {
        const fundInvestment = totalInvestment * (allocationPct / 100);
        const returnPct = fund[period.field];

        // Calculate inception years for SI period
        let inceptionYears = null;
        if (period.key === 'si' && fund.inceptionDate) {
            const inception = new Date(fund.inceptionDate);
            inceptionYears = (new Date() - inception) / (365.25 * 24 * 60 * 60 * 1000);
        }

        // Custom period: calculate years from dates
        if (period.key === 'custom' && fund.returnFromDate && fund.navDate) {
            const parseDate = (s) => {
                const parts = s.split('-');
                return new Date(`${parts[1]} ${parts[0]}, ${parts[2]}`);
            };
            try {
                const from = parseDate(fund.returnFromDate);
                const to = parseDate(fund.navDate);
                inceptionYears = (to - from) / (365.25 * 24 * 60 * 60 * 1000);
            } catch (e) { inceptionYears = 3; }
        }

        const result = calculateFundReturn(fundInvestment, returnPct, period, inceptionYears);
        if (!result.available) allAvailable = false;

        fundResults.push({
            fund,
            allocationPct,
            investment: fundInvestment,
            ...result,
            benchmarkReturn: fund[period.bmField],
        });

        totalFinalValue += result.finalValue;
    }

    const totalGain = totalFinalValue - totalInvestment;
    const totalReturnPct = ((totalFinalValue / totalInvestment) - 1) * 100;

    // Calculate weighted CAGR for multi-year periods
    let weightedCAGR = null;
    if (!period.isAbsolute && period.years && allAvailable) {
        weightedCAGR = (Math.pow(totalFinalValue / totalInvestment, 1 / period.years) - 1) * 100;
    }

    return {
        period,
        totalInvestment,
        totalFinalValue,
        totalGain,
        totalReturnPct,
        weightedCAGR,
        allAvailable,
        fundResults,
    };
}
