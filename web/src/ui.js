import { loadRateData, calculatePremium, formatCurrency, formatCurrencyWhole, CONFIG } from './calc.js';

// Ã¢ââ¬Ã¢ââ¬ GLOBAL PROFILE STATE (age/gender/smoker/residence/mode/sel) Ã¢ââ¬Ã¢ââ¬
const S = {
    age: 26, gender: 'Male', smoker: 'Non Smoker', residence: 'Resident Indian', income: '10L - 20L', occupation: 'Salaried', pincode: '', sel: 0,
    medicalCategory: 'TeleMedical',
    plan: 'Life Shield', channel: 'Online Sales',
    addons: { adb: false, ci: false, carePlus: false, spouseCare: false, childCare: false, famCare: false, parentalCare: false },
    discounts: { online: true, salaried: true, insuranceForAll: true, aggregator: false }
};

// Ã¢ââ¬Ã¢ââ¬ PER-CARD STATE (sa, pt, ppt, riders, discounts) Ã¢ââ¬Ã¢ââ¬
function makeCardState(sa, pt, ppt, mode = 'Monthly') {
    return {
        sa, pt, ppt, mode,
        lumpSumPct: 100, incomeMonths: 0,
        riders: {
            adb: { enabled: false, sumAssured: 0 },
            ci: { enabled: false, sumAssured: 0 },
            carePlus: { enabled: false, configured: false },
            famCare: { enabled: false, configured: false },
            spouseCare: { enabled: false },
            childCare: { enabled: false, children: [] },
            parentalCare: { enabled: false }
        },
        discounts: { prime: false, existing: false, salaried: true, ifa: true }
    };
}

// Three per-card states matching V[] array
const CS = [
    makeCardState(5000000, 34, 34),
    makeCardState(5000000, 34, 34),
    makeCardState(5000000, 34, 34)
];

// Ã¢ââ¬Ã¢ââ¬ PLAN CONFIG (Life Shield only Ã¢â¬â single plan comparator) Ã¢ââ¬Ã¢ââ¬
const PLANS = {
    'Life Shield': { pv: 'Life Shield', maxPT: 67 }
};

// Card slot names
const SLOT_NAMES = ['Variant 1', 'Variant 2', 'Variant 3'];

// Rider defs kept identical
const addonDefs = [
    { key: 'adb', label: 'Accidental Death Benefit (ADB)' },
    { key: 'ci', label: 'Critical Illness' },
    { key: 'carePlus', label: 'Care Plus' },
    { key: 'famCare', label: 'Family Care' },
    { key: 'spouseCare', label: 'Spouse Care' },
    { key: 'childCare', label: 'Child Care' },
    { key: 'parentalCare', label: 'Parental Care' }
];

// Ã¢ââ¬Ã¢ââ¬ RIDER INFO DESCRIPTIONS Ã¢ââ¬Ã¢ââ¬
const RIDER_DESCRIPTIONS = {
    adb: 'In case of accidental death, this cover amount is paid in addition to the base life cover, providing extra financial protection to your family.',
    ci: 'If diagnosed with a covered critical illness, a lump sum benefit is paid to help manage treatment costs and financial obligations.',
    carePlus: 'Health support including doctor consultations, lab tests, radiology services, fitness programs, diet plans, and mental wellness support.',
    famCare: 'Provides coverage for spouse, children, and parents under one rider, ensuring complete financial and healthcare protection for your family.'
};

// Card-level discount defs matching Excel exactly
const cardDiscDefs = [
    { key: 'prime', label: 'Prime Discount', pct: '5%' },
    { key: 'existing', label: 'Existing Customer', pct: '1%' },
    { key: 'salaried', label: 'Salaried', pct: '5%' },
    { key: 'ifa', label: 'First Time Buyer', pct: '5%' }
];

// Map card discounts Ã¢â â S.discounts keys for calc engine
function mapCardDisc(cardDisc) {
    return {
        prime: cardDisc.prime,
        loyalty: cardDisc.existing,
        salaried: cardDisc.salaried,
        insuranceForAll: cardDisc.ifa,
        online: S.discounts.online
    };
}

let results = [];

// Payments per year for each mode (mirrors CONFIG.modalFactors but standalone)
const MODE_PAYMENTS = { Annual: 1, 'Half-Yearly': 2, Quarterly: 4, Monthly: 12 };

// ═══ INDIAN NUMBER FORMATTING ═══
function formatIndian(n) {
    const num = Math.round(Math.abs(n));
    const s = String(num);
    if (s.length <= 3) return s;
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3);
    return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
}

// ═══ PPT SAVINGS DISPLAY HELPER ═══
// Shows savings when PPT < PT (limited pay scheme). Uses results[i] instalment.
function computeSavingsHtml(cs, r) {
    if (!r || !r.success || cs.ppt >= cs.pt) return '';

    const instalment = Math.round(Number(r.instalmentWithGSTYear1 || 0));
    if (instalment <= 0) return '';

    const paymentsPerYear = MODE_PAYMENTS[cs.mode] || 1;
    const regularTotal = instalment * paymentsPerYear * cs.pt;
    const selectedTotal = instalment * paymentsPerYear * cs.ppt;
    const savings = regularTotal - selectedTotal;

    if (savings <= 0) return '';

    const modeNote = cs.mode !== 'Annual'
        ? ` <span style="font-size:9px; opacity:0.8;">(≈ ${formatCurrencyWhole(Math.round(savings * (1 / (MODE_PAYMENTS[cs.mode] || 1))))} /yr basis)</span>`
        : '';

}


// ═══ TOTAL SAVINGS (PPT-based) HELPER ═══
// Shows the total money saved by choosing limited-pay (PPT < PT) vs regular-pay (PPT = PT).
// Compares: regular-pay total premium over PT years vs limited-pay total premium over PPT years.
// Visibility: ONLY when ppt < pt (hidden on regular pay).
function computeTotalSavingsHtml(i, cs, r) {
    if (!r || !r.success) return '';

    const plan = PLANS[S.plan];
    const pt = Math.min(cs.pt, plan.maxPT);
    const ppt = Math.min(cs.ppt, pt);

    // ❌ Hide when regular pay (PPT = PT)
    if (ppt >= pt) return '';

    const limitedInstalment = Math.round(Number(r.instalmentWithGSTYear1 || 0));
    if (limitedInstalment <= 0) return '';

    // Calculate what the premium WOULD BE on regular pay (PPT = PT), same riders + discounts
    let regularResult;
    try {
        const disc = cs.discounts.prime
            ? { online: !!S.discounts.online, prime: true }
            : { ...S.discounts, ...mapCardDisc(cs.discounts) };
        regularResult = calculatePremium({
            age: S.age, gender: S.gender, smoker: S.smoker, variant: plan.pv,
            pt: pt, ppt: pt,  // ← Regular pay: PPT = PT
            sa: cs.sa, mode: S.mode, medicalCategory: S.medicalCategory || 'TeleMedical', residence: S.residence,
            discounts: disc,
            riders: buildCardRiders(cs)
        });
    } catch (e) { return ''; }
    if (!regularResult || !regularResult.success) return '';

    const regularInstalment = Math.round(Number(regularResult.instalmentWithGSTYear1 || 0));
    if (regularInstalment <= 0) return '';

    const paymentsPerYear = MODE_PAYMENTS[cs.mode] || 1;
    const limitedTotal = limitedInstalment * paymentsPerYear * ppt;  // pay for PPT years
    const regularTotal = regularInstalment * paymentsPerYear * pt;   // would pay for PT years
    const totalSavings = regularTotal - limitedTotal;

    if (totalSavings <= 0) return '';

    const yearlySavings = Math.round(totalSavings / pt);

    return `<div class="total-savings-banner">
      <span class="material-icons-outlined" style="font-size:13px; flex-shrink:0;">savings</span>
      <div class="tsa-body">
        <span class="tsa-label">Total Savings</span>
        <span class="tsa-amount">&#8377;${formatIndian(Math.round(totalSavings))}</span>
        <span class="tsa-yr">&asymp; &#8377;${formatIndian(yearlySavings)}&thinsp;/&thinsp;yr</span>
      </div>
    </div>`;
}


// ═══ BASE RIDERS (unchanged helper) ═══
function baseRiders() {
    return {
        adb: { enabled: false }, ci: { enabled: false }, carePlus: { enabled: false },
        parentalCare: { enabled: false }, spouseCare: { enabled: false }, childCare: { enabled: false }, famCare: { enabled: false }
    };
}

// Build riders for a card's RS state (Legacy removed as functionality merged into premium engine)
function getBaseInputs(cs) {
    const plan = PLANS[S.plan];
    const pt = Math.min(cs.pt, plan.maxPT);
    const ppt = Math.min(cs.ppt, pt);
    return {
        age: S.age, gender: S.gender, smoker: S.smoker, variant: plan.pv, pt, ppt,
        sa: cs.sa, mode: cs.mode, medicalCategory: S.medicalCategory || 'TeleMedical', residence: S.residence,
        discounts: {}, gstYear1Rate: 0, gstYear2Rate: 0
    };
}

// Ã¢ââ¬Ã¢ââ¬ CALCULATION (all cards use S.plan) Ã¢ââ¬Ã¢ââ¬
function calcCard(i, cs, withAddons) {
    const plan = PLANS[S.plan];
    const pt = Math.min(cs.pt, plan.maxPT);
    const ppt = Math.min(cs.ppt, pt);
    const riders = withAddons ? buildCardRiders(cs) : baseRiders();
    // EXCLUSIVITY RULE: If Prime is on, ignore other card-level exclusives (Salaried, etc.)
    // but preserve the global Online Sales discount if it's active in the profile.
    let disc = {};
    const globalDiscs = S.discounts || {};
    if (withAddons && cs.discounts.prime) {
        disc = { prime: true };
    } else {
        disc = {
            ...globalDiscs,
            ...(withAddons ? mapCardDisc(cs.discounts) : {})
        };
    }

    try {
        return calculatePremium({
            age: S.age, gender: S.gender, smoker: S.smoker, variant: plan.pv, pt, ppt,
            sa: cs.sa, mode: cs.mode, medicalCategory: S.medicalCategory || 'TeleMedical', residence: S.residence,
            discounts: disc, riders
        });
    } catch (e) {
        console.error('[UI] calcCard failed:', e);
        return { success: false, errors: ['Calculation Error: ' + e.message] };
    }
}

function modeLabel(mode) {
    switch (mode) {
        case 'Annual': return ' /yr';
        case 'Half-Yearly': return ' /hy';
        case 'Quarterly': return ' /qt';
        case 'Monthly': return ' /mo';
        default: return ' /yr';
    }
}

function buildCardRiders(cs, includeOrExcludeKey, forceEnable) {
    const rs = {};
    const hubChildren = ['spouseCare', 'childCare', 'parentalCare'];

    Object.keys(cs.riders || {}).forEach(k => {
        const r = cs.riders[k];
        let enabled = r.enabled;

        // Handle explicit override (used for delta calculations in the cards)
        if (k === includeOrExcludeKey) {
            enabled = forceEnable;
        }

        // Special Rule for Family Hub: if we are testing 'excluding' the hub, 
        // we MUST also exclude all its sub-riders so the delta reflects the TOTAL hub cost.
        if (includeOrExcludeKey === 'famCare' && forceEnable === false) {
            if (hubChildren.includes(k)) enabled = false;
        }

        if (enabled) rs[k] = r;
    });
    return rs;
}

// Ã¢ââ¬Ã¢ââ¬ Rider price delta for a card Ã¢ââ¬Ã¢ââ¬
function getCardRiderPrice(i, cs, key) {
    console.log(`[UI] getCardRiderPrice( card:${i}, rider:${key} )`);
    const plan = PLANS[S.plan];
    const pt = Math.min(cs.pt, plan.maxPT);
    const ppt = Math.min(cs.ppt, pt);
    const args = {
        age: S.age, gender: S.gender, smoker: S.smoker, variant: plan.pv, pt, ppt,
        sa: cs.sa, mode: cs.mode, medicalCategory: S.medicalCategory, residence: S.residence,
        discounts: mapCardDisc(cs.discounts),
        gstYear1Rate: CONFIG.gst?.year1 || 0.045,
        gstYear2Rate: CONFIG.gst?.year2 || 0.0225
    };

    // 1. Premium WITHOUT this specific rider
    const ridersMinus = buildCardRiders(cs, key, false);
    const base = calculatePremium({ ...args, riders: ridersMinus });

    // 2. Premium WITH this specific rider
    const ridersPlus = buildCardRiders(cs, key, true);
    const withR = calculatePremium({ ...args, riders: ridersPlus });

    if (!withR.success) {
        const msg = (withR.errors && withR.errors.length > 0) ? withR.errors[0] : 'N/A';
        return `<span style="color:#f37021; font-size:9px; font-weight:700; display:block; margin-top:2px;">${msg}</span>`;
    }
    if (!base.success) return 'N/A';

    const v1 = Number(withR.instalmentWithGSTYear1 || 0);
    const v2 = Number(base.instalmentWithGSTYear1 || 0);
    const delta = Math.round(v1 - v2);
    const label = modeLabel(cs.mode);
    return delta > 0 ? '+' + formatCurrencyWhole(delta) + label : 'Included';
}

function recalc() {
    console.log('[UI] recalc() starting...');
    const plan = PLANS[S.plan];
    const maxPTForAge = 85 - S.age;
    const absMaxPT = Math.min(plan.maxPT, maxPTForAge);

    CS.forEach(cs => {
        if (cs.pt > absMaxPT) cs.pt = absMaxPT;
        if (cs.ppt > cs.pt) cs.ppt = cs.pt;

        // Auto-sync riders with base plan conditions (Excel logic: Riders follow base plan by default)
        Object.keys(cs.riders).forEach(rk => {
            const r = cs.riders[rk];
            if (!r.enabled) return;

            // 1. Sync Sum Assured (if it was equal to or greater than base, keep it synced)
            if (r.sumAssured !== undefined && r.sumAssured > cs.sa) r.sumAssured = cs.sa;

            if (r.values && !r.configured) {
                // Fixed Rule: CI and Care Plus should default to 20 (capped by plan PT)
                // Other riders follow the base plan exactly
                if (rk === 'ci' || rk === 'carePlus') {
                    // Default to 10 or 20 if possible for better data matching
                    const defPT = cs.pt >= 20 ? 20 : (cs.pt >= 15 ? 15 : 10);
                    r.values.pt = Math.min(defPT, cs.pt);
                    r.values.ppt = Math.min(r.values.pt, cs.ppt >= 10 ? 10 : 5);
                } else {
                    r.values.pt = cs.pt;
                    r.values.ppt = cs.ppt;
                }
            }

            if (r.values) {
                if (r.values.sumAssured !== undefined && r.values.sumAssured > cs.sa) {
                    r.values.sumAssured = cs.sa;
                }
            } else if (rk === 'adb' || rk === 'ci') {
                // Ensure adb/ci without 'values' still reflect base SA in their state
                if (r.sumAssured > cs.sa) r.sumAssured = cs.sa;
            }
        });
    });

    results = CS.map((cs, i) => calcCard(i, cs, true));
    console.log('[UI] recalc() calcCard finished, calling renderCards...');
    renderCards();
    renderGlobalFooter();
}

// Ã¢ââ¬Ã¢ââ¬ RENDER CARDS Ã¢ââ¬Ã¢ââ¬
function renderCards() {
    console.log('[UI] renderCards() starting...');
    const g = document.getElementById('cg');
    if (!g) { console.error('[UI] cg missing!'); return; }
    const isNRI = S.residence === 'NRI';

    // Compute best disabled for now per user request
    let bestIdx = -1;
    const plan = PLANS[S.plan];
    const baseRes = CS.map((cs, i) => calcCard(i, cs, false));
    /*
    let bestCPL = Infinity;
    baseRes.forEach((r, i) => {
        if (r.success) {
            const mf = CONFIG.modalFactors[S.mode] || 1;
            const ann = r.instalmentWithGSTYear1 / mf;
            const cpl = ann / (CS[i].sa / 100000);
            if (cpl < bestCPL) { bestCPL = cpl; bestIdx = i; }
        }
    });
    */

    g.innerHTML = CS.map((cs, i) => {
        const r = results[i];
        const br = baseRes[i];
        const sel = (S.sel === i);
        const best = (bestIdx === i);
        const cls = 'card fi' + (sel ? ' selected' : '') + (best ? ' best' : '');

        const ptUsed = Math.min(cs.pt, plan.maxPT);
        const ptCapped = cs.pt > plan.maxPT;

        // Error handling
        if (r && !r.success && br && !br.success) {
            return `<div class="card-col"><div class="${cls}" data-i="${i}">
        <span class="badge">Best Value</span>
        <div class="card-name">${SLOT_NAMES[i]}</div>
        <div class="card-err show">${(r.errors || []).join('. ')}</div>
        <div class="sel-btn"><button>Select Plan</button></div></div>
        <div class="footer-p-block" id="footer-prem-${i}">
          <div class="global-prem-col"><div class="card-prem-label">${SLOT_NAMES[i]}  --  YEAR 1</div><div class="card-prem-value highlight"> -- </div></div>
          <div class="global-prem-col"><div class="card-prem-label">RENEWAL (YR 2+)</div><div class="card-prem-value"> -- </div></div>
        </div></div>`;
        }

        // Ã¢ââ¬Ã¢ââ¬ Plan Inputs Ã¢ââ¬Ã¢ââ¬

        // Ã¢ââ¬Ã¢ââ¬ Rider rows Ã¢ââ¬Ã¢ââ¬
        const cardRiders = [
            { key: 'adb', label: 'Accidental Death', hasEdit: false, icon: 'bolt' },
            { key: 'ci', label: 'Critical Illness', hasEdit: true, icon: 'medical_services' },
            { key: 'carePlus', label: 'Care Plus', hasEdit: true, icon: 'security' },
            { key: 'famCare', label: 'Family Care Hub', hasEdit: true, icon: 'family_restroom' }
        ];

        const riderRowsHtml = cardRiders.map(rd => {
            const rc = cs.riders[rd.key];
            const on = rc.enabled;
            const price = getCardRiderPrice(i, cs, rd.key);
            const editHtml = (rd.hasEdit && on) ? `<span class="card-rider-edit" data-ci="${i}" data-k="${rd.key}" title="Edit Configuration" style="background:none; color:#005DA4; padding:0; margin-left:4px;"><span class="material-icons-outlined" style="font-size:16px;">edit</span></span>` : '';
            const infoHtml = RIDER_DESCRIPTIONS[rd.key] ? `<button class="rider-info-btn" data-rk="${rd.key}" title="About this rider">i</button>` : '';

            let subText = "";
            if (rd.key === 'famCare' && on) {
                const subs = [];
                if (cs.riders.spouseCare.enabled) subs.push("Spouse");
                if (cs.riders.childCare.enabled) subs.push("Child");
                if (cs.riders.parentalCare.enabled) subs.push("Parents");
                if (subs.length > 0) subText = `<div style="font-size:9px; color:#64748b; font-weight:600; margin-top:2px;">Includes: ${subs.join(', ')}</div>`;
            }

            return `<div class="card-rider-row">
        <div class="card-rider-info">
          <div class="card-rider-label">
            <span class="material-icons-outlined" style="font-size:12px;">${rd.icon}</span>
            ${rd.label}${infoHtml}${editHtml}
          </div>
          ${on ? `<div class="card-rider-price">${price}</div>` : ''}
          ${subText}
        </div>
        <div class="card-rider-right">
          <div class="tog${on ? ' on' : ''}" data-ci="${i}" data-k="${rd.key}"></div>
        </div>
      </div>`;
        }).join('');

        // Ã¢ââ¬Ã¢ââ¬ Discount rows Ã¢ââ¬Ã¢ââ¬
        const discRowsHtml = cardDiscDefs.map(dd => {
            const on = cs.discounts[dd.key];
            return `<div class="card-disc-row">
        <div class="card-disc-label">${dd.label} <span style="color:#059669; font-weight:800; opacity:0.8;">-${dd.pct}</span></div>
        <div class="tog${on ? ' on' : ''}" data-ci="${i}" data-dk="${dd.key}"></div>
      </div>`;
        }).join('');

        const errHtml = (r && !r.success) ? `<div class="card-err show" style="margin-top:10px;">${(r.errors || []).join('. ')}</div>` : '';
        const noteHtml = ptCapped ? `<div class="card-note" style="background:#fff7ed; color:#c2410c; border:1px solid #ffedd5;">Notice: Using PT = ${plan.maxPT} (max for ${S.plan})</div>` : '';

        return `<div class="card-col">
      <div class="${cls}" data-i="${i}" style="animation-delay:${i * .08}s">
      <div class="card-name">${SLOT_NAMES[i]}</div>

      <div class="card-section" style="margin-top:0; border-top:none; padding-top:10px;">
        <div class="card-fg"><label>Sum Assured</label>
          <div class="sa-input-wrapper">
            <span class="sa-rupee-symbol">&#8377;</span>
            <input type="text" inputmode="numeric" class="c-sa" data-ci="${i}" data-raw="${cs.sa}" value="${formatIndian(cs.sa)}">
          </div>
          <div class="quick-sa-grid">
            <div class="qsa" data-ci="${i}" data-v="7500000">75L</div>
            <div class="qsa" data-ci="${i}" data-v="10000000">1Cr</div>
            <div class="qsa" data-ci="${i}" data-v="15000000">1.5Cr</div>
            <div class="qsa" data-ci="${i}" data-v="20000000">2Cr</div>
          </div>
        </div>
        <div class="card-fr">
          <!-- Policy Term -->
          <div class="card-fg combo-box">
            <label>Policy Term</label>
            <div class="combo-wrapper input-small c-pt-btn" data-ci="${i}" style="cursor: pointer;">
              <span>Age ${S.age + cs.pt}</span>
              <span class="material-icons-outlined" style="font-size:16px; color:#64748b;">expand_more</span>
            </div>
            <div class="combo-list c-pt-list" data-ci="${i}">
              ${(() => {
                const maxPTForAge = 85 - S.age;
                const limit = Math.min(plan.maxPT, maxPTForAge);
                return Array.from({ length: Math.max(0, limit - 4) }, (_, k) => k + 5)
                    .map(n => `<div class="combo-item${n === cs.pt ? ' active' : ''}" data-val="${n}">Age ${S.age + n}</div>`)
                    .join('');
            })()}
            </div>
          </div>

          <!-- Payment Term -->
          <div class="card-fg combo-box">
            <label>Payment Term</label>
            <div class="combo-wrapper input-small c-ppt-btn" data-ci="${i}" style="cursor: pointer;">
              <span>${cs.ppt} yrs</span>
              <span class="material-icons-outlined" style="font-size:16px; color:#64748b;">expand_more</span>
            </div>
            <div class="combo-list c-ppt-list" data-ci="${i}">
              ${(() => {
                const stdPPTs = [5, 6, 10, 12, 15, 20];
                const payTill60 = 60 - S.age;
                let opts = stdPPTs.filter(n => n < cs.pt);
                if (payTill60 > 0 && payTill60 < cs.pt && !stdPPTs.includes(payTill60)) {
                    opts.push(payTill60);
                }
                opts.push(cs.pt); // Regular Pay
                opts.sort((a, b) => a - b);
                return opts.map(n => {
                    let label = n === cs.pt ? `${n} yrs (Regular)` : n === payTill60 ? `${n} yrs (Till 60)` : `${n} yrs`;
                    return `<div class="combo-item${n === cs.ppt ? ' active' : ''}" data-val="${n}">${label}</div>`;
                }).join('');
            })()}
            </div>
          </div>
        </div>
        <div class="card-fg" style="margin:12px 0;">
          <label>Payment Frequency</label>
          <div class="mode-toggle dark" style="background:rgba(0,0,0,0.05); border:1px solid rgba(0,0,0,0.05);">
            ${['Annual', 'Half-Yearly', 'Quarterly', 'Monthly'].map(m => {
                const label = m === 'Half-Yearly' ? 'Half-Yr' : m;
                return `<button class="mode-btn card-mode-btn${cs.mode === m ? ' active' : ''}" data-ci="${i}" data-m="${m}">${label}</button>`;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="card-sect" style="margin-top:10px; border-top:1px solid rgba(0,0,0,0.05); padding-top:10px;">
        <div class="sect-header">
          <span class="material-icons-outlined" style="font-size:14px;">payments</span>
          <span>PAYOUT OPTIONS</span>
        </div>
        <div class="card-fr" style="margin-top:5px;">
          <div class="card-fg grow">
            <label>Lump Sum (%)</label>
            <div style="display:flex; flex-direction:column;">
              <input type="number" class="c-ls-pct input-small" data-ci="${i}" value="${cs.lumpSumPct}" min="0" max="100">
              <span style="font-size:7.5px; line-height:1.2; color:var(--p1); font-weight:600; margin-top:2px;">${formatCurrencyWhole((cs.lumpSumPct / 100) * cs.sa)}</span>
            </div>
          </div>
          <div class="card-fg grow">
            <label>Payout Period</label>
            <select class="c-mi-months select-clean input-small" data-ci="${i}">
              ${[0, 12, 24, 36, 48, 60, 120].map(m => `<option value="${m}" ${cs.incomeMonths === m ? 'selected' : ''}>${m === 0 ? '0 years' : (m / 12) + ' years'}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="payout-result" style="margin-top:2px; background:rgba(0,102,204,0.02); padding:2px 4px; border-radius:4px; border:1px solid rgba(0,102,204,0.08); text-align:center;">
          <div style="font-size:6.5px; line-height:1; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.3px;">Monthly Income: <span style="font-size:12px; font-weight:800; color:var(--p1);">${formatCurrency(cs.incomeMonths > 0 ? ((1 - (cs.lumpSumPct / 100)) * cs.sa) / cs.incomeMonths : 0)}</span></div>
          <div style="font-size:6.5px; line-height:1; color:var(--text-dim); margin-top:1px;">Pool: ${formatCurrencyWhole((1 - (cs.lumpSumPct / 100)) * cs.sa)}</div>
        </div>
      </div>

      <div class="card-section">
        <div class="card-sec-title">
          <span class="material-icons-outlined" style="font-size:12px;">add_moderator</span>
          Riders
        </div>
        ${riderRowsHtml}
      </div>

      <div class="card-section">
        <div class="card-sec-title">
          <span class="material-icons-outlined" style="font-size:12px;">local_offer</span>
          Exclusive Offs
        </div>
        ${discRowsHtml}
      </div>

      <div class="card-spacer"></div>
      ${noteHtml}${errHtml}

      <div class="sel-btn"><button>${sel ? '&#10003; Selected' : 'Select Plan'}</button></div>
    </div>
    <div class="premium-sticky-unit">
      <div class="savings-outer" id="savings-outer-${i}">${computeTotalSavingsHtml(i, cs, r)}</div>
      <div class="footer-p-block" id="footer-prem-${i}">
        <div class="prem-row">
          <div class="global-prem-col">
            <div class="card-prem-label">${SLOT_NAMES[i]}  --  YEAR 1</div>
            <div class="card-prem-value highlight">${(r && r.success && r.instalmentWithGSTYear1 > 0) ? formatCurrency(Math.round(r.instalmentWithGSTYear1)) : ' -- '}</div>
          </div>
          <div class="global-prem-col">
            <div class="card-prem-label">RENEWAL (YR 2+)</div>
            <div class="card-prem-value">${(r && r.success && r.instalmentWithGSTYear2 > 0) ? formatCurrency(Math.round(r.instalmentWithGSTYear2)) : ' -- '}</div>
          </div>
        </div>
      </div>
    </div>
    </div>`;
    }).join('');

    // Bindings
    g.querySelectorAll('.card').forEach(c => {
        c.querySelector('.sel-btn button').addEventListener('click', e => {
            e.stopPropagation();
            const idx = parseInt(c.dataset.i);
            if (S.sel !== idx) {
                S.sel = idx;
                recalc();
            }
        });
    });

    g.querySelectorAll('.card-mode-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const ci = parseInt(btn.dataset.ci);
            const m = btn.dataset.m;
            CS[ci].mode = m;
            recalc();
        });
    });

    g.querySelectorAll('.c-sa').forEach(el => {
        el.addEventListener('focus', e => {
            e.stopPropagation();
            // Show raw number while editing
            el.value = el.dataset.raw || el.value.replace(/,/g, '');
            el.select();
        });
        el.addEventListener('blur', e => {
            // Format with Indian commas on blur
            const raw = parseInt(el.value.replace(/,/g, '')) || 5000000;
            el.dataset.raw = raw;
            el.value = formatIndian(raw);
        });
        el.addEventListener('change', e => {
            e.stopPropagation();
            const ci = parseInt(el.dataset.ci);
            const raw = parseInt(el.value.replace(/,/g, '')) || 5000000;
            el.dataset.raw = raw;
            CS[ci].sa = raw;
            CS[ci].lumpSum = raw;
            recalc();
        });
        el.addEventListener('click', e => e.stopPropagation());
    });
    g.querySelectorAll('.qsa').forEach(el => {
        el.addEventListener('click', e => {
            e.stopPropagation();
            const ci = parseInt(el.dataset.ci);
            const val = parseInt(el.dataset.v);
            CS[ci].sa = val;
            CS[ci].lumpSum = val;
            recalc();
        });
    });
    g.querySelectorAll('.c-pt-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const ci = btn.dataset.ci;
            const list = g.querySelector(`.c-pt-list[data-ci="${ci}"]`);
            const isOpen = list.classList.contains('open');

            document.querySelectorAll('.combo-list').forEach(l => l.classList.remove('open'));
            if (!isOpen) list.classList.add('open');
        });
    });

    g.querySelectorAll('.c-pt-list .combo-item').forEach(item => {
        item.addEventListener('click', e => {
            e.stopPropagation();
            const list = item.closest('.combo-list');
            const ci = parseInt(list.dataset.ci);
            const val = parseInt(item.dataset.val);

            CS[ci].pt = val;
            CS[ci].ppt = val; // Synchronized PPT with PT (Regular Pay) as per Excel logic

            list.classList.remove('open');
            recalc();
        });
    });



    // Combobox Logic: Payment Term
    g.querySelectorAll('.c-ppt-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const ci = btn.dataset.ci;
            const list = g.querySelector(`.c-ppt-list[data-ci="${ci}"]`);
            const isOpen = list.classList.contains('open');

            document.querySelectorAll('.combo-list').forEach(l => l.classList.remove('open'));
            if (!isOpen) list.classList.add('open');
        });
    });

    g.querySelectorAll('.c-ppt-list .combo-item').forEach(item => {
        item.addEventListener('click', e => {
            e.stopPropagation();
            const list = item.closest('.combo-list');
            const ci = parseInt(list.dataset.ci);
            const val = parseInt(item.dataset.val);

            CS[ci].ppt = val;
            list.classList.remove('open');
            recalc();
        });
    });



    // Global click listener to close combo lists
    // (Moved out of renderCards to avoid accumulation)
    g.querySelectorAll('.c-ls-pct').forEach(el => {
        el.addEventListener('click', e => e.stopPropagation());
        el.addEventListener('change', e => {
            const ci = parseInt(el.dataset.ci);
            CS[ci].lumpSumPct = parseInt(el.value) || 0;
            if (CS[ci].lumpSumPct === 100) {
                CS[ci].incomeMonths = 0;
            } else if (CS[ci].incomeMonths === 0) {
                CS[ci].incomeMonths = 24; // Default to 2 years if not 100%
            }
            recalc();
        });
    });
    g.querySelectorAll('.c-mi-months').forEach(el => {
        el.addEventListener('click', e => e.stopPropagation());
        el.addEventListener('change', e => {
            const ci = parseInt(el.dataset.ci);
            const val = parseInt(el.value);
            CS[ci].incomeMonths = isNaN(val) ? 24 : val;
            if (CS[ci].incomeMonths === 0) {
                CS[ci].lumpSumPct = 100;
            } else if (CS[ci].lumpSumPct === 100) {
                CS[ci].lumpSumPct = 25; // Default back from 100 if a period is selected
            }
            recalc();
        });
    });
    g.querySelectorAll('.tog[data-k]').forEach(t => {
        t.addEventListener('click', e => {
            e.stopPropagation();
            const ci = parseInt(t.dataset.ci);
            const k = t.dataset.k;
            const rc = CS[ci].riders[k];
            if (rc.enabled) {
                rc.enabled = false; rc.configured = false;
                if (k === 'famCare') {
                    CS[ci].riders.spouseCare.enabled = false;
                    CS[ci].riders.childCare.enabled = false;
                    CS[ci].riders.parentalCare.enabled = false;
                }
                recalc();
            } else { openRiderModal(ci, k); }
        });
    });
    g.querySelectorAll('.card-rider-edit').forEach(el => {
        el.addEventListener('click', e => {
            e.stopPropagation(); openRiderModal(parseInt(el.dataset.ci), el.dataset.k);
        });
    });
    g.querySelectorAll('.rider-info-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const key = btn.dataset.rk;
            const labelMap = { adb: 'Accidental Death Benefit', ci: 'Critical Illness', carePlus: 'Care Plus', famCare: 'Family Care Hub' };
            openInfoModal(labelMap[key] || key, RIDER_DESCRIPTIONS[key] || '');
        });
    });
    g.querySelectorAll('.tog[data-dk]').forEach(t => {
        t.addEventListener('click', e => {
            e.stopPropagation();
            const ci = parseInt(t.dataset.ci);
            const dk = t.dataset.dk;
            const wasOn = CS[ci].discounts[dk];
            const nowOn = !wasOn;

            if (nowOn) {
                if (dk === 'prime') {
                    // Disable all other card toggles
                    Object.keys(CS[ci].discounts).forEach(k => {
                        if (k !== 'prime') CS[ci].discounts[k] = false;
                    });
                    showCardError(ci, "Prime Discount enabled: Other exclusives disabled.");
                } else if (CS[ci].discounts.prime) {
                    // If turning on anything else, disable prime
                    CS[ci].discounts.prime = false;
                    showCardError(ci, "Prime Discount disabled (mutually exclusive).");
                }
            }

            CS[ci].discounts[dk] = nowOn;
            recalc();
        });
    });
}

function showCardError(ci, msg) {
    const card = document.querySelector(`.card[data-i="${ci}"]`);
    if (!card) return;
    let err = card.querySelector('.card-err-transient');
    if (!err) {
        err = document.createElement('div');
        err.className = 'card-err show card-err-transient';
        err.style.cssText = "margin-bottom:12px; background:#fef2f2; color:#dc2626; border:1px solid #fee2e2; font-size:11px; font-weight:700; padding:10px; border-radius:8px; display:flex; align-items:center; gap:6px;";
        const spacer = card.querySelector('.card-spacer');
        if (spacer) spacer.parentNode.insertBefore(err, spacer);
    }
    err.innerHTML = msg;
    err.style.display = 'flex';
    setTimeout(() => { if (err) err.style.display = 'none'; }, 5000);
}

function renderGlobalFooter() {
    CS.forEach((cs, i) => {
        const block = document.getElementById(`footer-prem-${i}`);
        const savingsEl = document.getElementById(`savings-outer-${i}`);
        if (!block) return;
        const r = results[i];
        const y1 = (r && r.success) ? Math.round(r.instalmentWithGSTYear1) : 0;
        const y2 = (r && r.success) ? Math.round(r.instalmentWithGSTYear2) : 0;
        // Update savings banner (above the blue block, inside shared sticky unit)
        if (savingsEl) savingsEl.innerHTML = computeTotalSavingsHtml(i, cs, r);
        // Update premium values inside blue block
        block.innerHTML = `
            <div class="prem-row">
                <div class="global-prem-col">
                    <div class="card-prem-label">${SLOT_NAMES[i]}  --  YEAR 1</div>
                    <div class="card-prem-value highlight">${y1 > 0 ? formatCurrency(y1) : ' -- '}</div>
                </div>
                <div class="global-prem-col">
                    <div class="card-prem-label">RENEWAL (YR 2+)</div>
                    <div class="card-prem-value">${y2 > 0 ? formatCurrency(y2) : ' -- '}</div>
                </div>
            </div>`;
    });
}

// Ã¢ââ¬Ã¢ââ¬ RIDER INFO MODAL Ã¢ââ¬Ã¢ââ¬
function openInfoModal(title, desc) {
    document.getElementById('rim-title').textContent = title;
    document.getElementById('rim-desc').textContent = desc;
    document.getElementById('rider-info-modal').classList.add('show');
}
function closeInfoModal() {
    document.getElementById('rider-info-modal').classList.remove('show');
}
document.getElementById('rim-close').addEventListener('click', closeInfoModal);
document.getElementById('rim-ok').addEventListener('click', closeInfoModal);
document.getElementById('rider-info-modal').addEventListener('click', e => { if (e.target.id === 'rider-info-modal') closeInfoModal(); });

// Ã¢ââ¬Ã¢ââ¬ MODAL SYSTEM (unchanged logic, wired to per-card state) Ã¢ââ¬Ã¢ââ¬
let activeModalCardIdx = null;
let activeModalKey = null;

function openRiderModal(ci, key) {
    activeModalCardIdx = ci; activeModalKey = key;
    const cs = CS[ci];
    document.getElementById('rm-title').textContent = addonDefs.find(a => a.key === key).label;
    document.getElementById('rm-body').innerHTML = getModalBody(key, cs);
    document.getElementById('rm-error').style.display = 'none';
    const body = document.getElementById('rm-body');
    if (body) body.querySelectorAll('.merr').forEach(el => { el.textContent = ''; el.style.display = 'none'; });
    bindModalEvents(key);
    document.getElementById('rider-modal').classList.add('show');
}

function bindModalEvents(key) {
    if (key === 'famCare') {
        ['sc', 'cc', 'pc'].forEach(sub => {
            const t = document.getElementById(`m-${sub}-tog`);
            if (t) {
                t.addEventListener('click', () => {
                    const on = t.classList.toggle('on');
                    document.getElementById(`m-${sub}-panel`).style.display = on ? 'block' : 'none';
                });
            }
        });
        const ps = document.getElementById('m-pc-sel');
        const updatePC = () => {
            const v = ps.value;
            document.getElementById('m-pc-fa-grp').style.display = (v === 'Both Parents' || v === 'Father Only') ? 'flex' : 'none';
            document.getElementById('m-pc-ma-grp').style.display = (v === 'Both Parents' || v === 'Mother Only') ? 'flex' : 'none';
        };
        ps.addEventListener('change', updatePC); updatePC();
    }
}

function closeModal() {
    document.getElementById('rider-modal').classList.remove('show');
    document.getElementById('rm-error').style.display = 'none';
    activeModalKey = null; activeModalCardIdx = null;
}

function syncFamilyHubData(ci) {
    if (activeModalKey !== 'famCare') return;
    const cs = CS[ci];
    cs.riders.famCare.values = {
        sumAssured: parseInt(document.getElementById('m-fc-sa').value),
        pt: parseInt(document.getElementById('m-fc-pt').value),
        ppt: parseInt(document.getElementById('m-fc-ppt').value)
    };
    cs.riders.spouseCare.enabled = document.getElementById('m-sc-tog')?.classList.contains('on');
    if (cs.riders.spouseCare.enabled) {
        cs.riders.spouseCare.values = {
            age: parseInt(document.getElementById('m-sc-age').value),
            gender: document.getElementById('m-sc-gen').value,
            sumAssured: parseInt(document.getElementById('m-sc-sa').value),
            pt: parseInt(document.getElementById('m-sc-pt').value),
            ppt: parseInt(document.getElementById('m-sc-ppt').value)
        };
    }
    cs.riders.childCare.enabled = document.getElementById('m-cc-tog')?.classList.contains('on');
    if (cs.riders.childCare.enabled) {
        const list = cs.riders.childCare.children || [];
        for (let i = 0; i < list.length; i++) {
            list[i] = {
                age: parseInt(document.getElementById(`m-cc-age-${i}`).value),
                gender: document.getElementById(`m-cc-gen-${i}`).value,
                sumAssured: parseInt(document.getElementById(`m-cc-sa-${i}`).value),
                pt: parseInt(document.getElementById(`m-cc-pt-${i}`).value),
                ppt: parseInt(document.getElementById(`m-cc-ppt-${i}`).value)
            };
        }
    }
    cs.riders.parentalCare.enabled = document.getElementById('m-pc-tog')?.classList.contains('on');
    if (cs.riders.parentalCare.enabled) {
        cs.riders.parentalCare.values = {
            selection: document.getElementById('m-pc-sel').value,
            fatherAge: parseInt(document.getElementById('m-pc-fa').value),
            motherAge: parseInt(document.getElementById('m-pc-ma').value),
            sumAssured: parseInt(document.getElementById('m-pc-sa').value),
            pt: parseInt(document.getElementById('m-pc-pt').value),
            ppt: parseInt(document.getElementById('m-pc-ppt').value)
        };
    }
}

document.getElementById('rm-close').addEventListener('click', closeModal);
document.getElementById('rm-cancel').addEventListener('click', closeModal);
document.getElementById('rider-modal').addEventListener('click', e => { if (e.target.id === 'rider-modal') closeModal(); });
document.getElementById('rm-apply').addEventListener('click', () => {
    if (activeModalKey === null) return;
    applyModal(activeModalCardIdx, activeModalKey);
});

function getModalBody(key, cs) {
    if (key === 'famCare') {
        const fc = cs.riders.famCare.values || { sumAssured: 1000000, pt: 34, ppt: 34 };
        const sc = cs.riders.spouseCare;
        const cc = cs.riders.childCare;
        const pc = cs.riders.parentalCare;
        const scv = sc.values || { age: 18, gender: 'Female', sumAssured: cs.sa * 0.5, pt: 34, ppt: 34 };
        const pcv = pc.values || { selection: 'Both Parents', fatherAge: 60, motherAge: 55, sumAssured: 0, pt: 34, ppt: 34 };
        const ch = cc.children || [];
        return `
      <div class="modal-section" style="margin-top:4px;"><div class="modal-sec-hdr"><div class="modal-sec-title">Family Income Benefit</div></div>
        <div class="modal-group"><label>Sum Assured (&#8377;)</label><input type="number" id="m-fc-sa" value="${fc.sumAssured}"><div class="merr" id="err-m-fc-sa"></div></div>
        <div class="modal-row" style="margin-top:10px;"><div class="modal-group"><label>Policy Term</label><input type="number" id="m-fc-pt" value="${fc.pt}"><div class="merr" id="err-m-fc-pt"></div></div><div class="modal-group"><label>Payment Term</label><input type="number" id="m-fc-ppt" value="${fc.ppt}"><div class="merr" id="err-m-fc-ppt"></div></div></div>
      </div>
      <div class="modal-section"><div class="modal-sec-hdr"><div class="modal-sec-title">Spouse Care</div><div class="tog${sc.enabled ? ' on' : ''}" id="m-sc-tog"></div></div>
        <div id="m-sc-panel" style="display:${sc.enabled ? 'block' : 'none'}">
          <div class="modal-row"><div class="modal-group"><label>Age</label><input type="number" id="m-sc-age" value="${scv.age}"><div class="merr" id="err-m-sc-age"></div></div><div class="modal-group"><label>Gender</label><select id="m-sc-gen"><option value="Female"${scv.gender === 'Female' ? ' selected' : ''}>Female</option><option value="Male"${scv.gender === 'Male' ? ' selected' : ''}>Male</option></select></div></div>
          <div class="modal-group" style="margin-top:8px;"><label>Sum Assured (&#8377;)</label><input type="number" id="m-sc-sa" value="${scv.sumAssured}"><div class="merr" id="err-m-sc-sa"></div></div>
          <div class="modal-row" style="margin-top:8px;"><div class="modal-group"><label>PT</label><input type="number" id="m-sc-pt" value="${scv.pt}"><div class="merr" id="err-m-sc-pt"></div></div><div class="modal-group"><label>PPT</label><input type="number" id="m-sc-ppt" value="${scv.ppt}"><div class="merr" id="err-m-sc-ppt"></div></div></div>
        </div>
      </div>
      <div class="modal-section"><div class="modal-sec-hdr"><div class="modal-sec-title">Child Care</div><div class="tog${cc.enabled ? ' on' : ''}" id="m-cc-tog"></div></div>
        <div id="m-cc-panel" style="display:${cc.enabled ? 'block' : 'none'}"><div id="m-cc-list">${ch.map((c, i) => `
          <div class="modal-section" style="background:#fff; border:1px dashed #cbd5e1; padding:12px; margin-bottom:10px;"><div class="modal-sec-hdr"><strong>Child ${i + 1}</strong> <button onclick="removeChildHub(${i})" style="color:#f37021; background:none; border:none; font-size:11px; font-weight:700; cursor:pointer;">Remove</button></div>
            <div class="modal-row"><div class="modal-group"><label>Age</label><input type="number" id="m-cc-age-${i}" value="${c.age}"><div class="merr" id="err-m-cc-age-${i}"></div></div><div class="modal-group"><label>Gender</label><select id="m-cc-gen-${i}"><option value="Male"${c.gender === 'Male' ? ' selected' : ''}>Male</option><option value="Female"${c.gender === 'Female' ? ' selected' : ''}>Female</option></select></div></div>
            <div class="modal-group" style="margin-top:8px;"><label>Sum Assured (&#8377;)</label><input type="number" id="m-cc-sa-${i}" value="${c.sumAssured}"><div class="merr" id="err-m-cc-sa-${i}"></div></div>
            <div class="modal-row" style="margin-top:8px;"><div class="modal-group"><label>PT</label><input type="number" id="m-cc-pt-${i}" value="${c.pt}"><div class="merr" id="err-m-cc-pt-${i}"></div></div><div class="modal-group"><label>PPT</label><input type="number" id="m-cc-ppt-${i}" value="${c.ppt}"><div class="merr" id="err-m-cc-ppt-${i}"></div></div></div></div>`).join('')}</div>
          ${ch.length < 3 ? `<button onclick="addChildHub()" style="width:100%; padding:8px; border-radius:8px; border:2px dashed #e2e8f0; background:none; color:#64748b; font-weight:700; cursor:pointer; margin-top:5px;">+ Add Child</button>` : ''}</div>
      </div>
      <div class="modal-section"><div class="modal-sec-hdr"><div class="modal-sec-title">Parental Care</div><div class="tog${pc.enabled ? ' on' : ''}" id="m-pc-tog"></div></div>
        <div id="m-pc-panel" style="display:${pc.enabled ? 'block' : 'none'}">
          <div class="modal-group"><label>Coverage</label><select id="m-pc-sel"><option value="Both Parents"${pcv.selection === 'Both Parents' ? ' selected' : ''}>Both Parents</option><option value="Father Only"${pcv.selection === 'Father Only' ? ' selected' : ''}>Father Only</option><option value="Mother Only"${pcv.selection === 'Mother Only' ? ' selected' : ''}>Mother Only</option></select></div>
          <div class="modal-row" style="margin-top:8px;"><div class="modal-group" id="m-pc-fa-grp"><label>Father Age</label><input type="number" id="m-pc-fa" value="${pcv.fatherAge}"><div class="merr" id="err-m-pc-fa"></div></div><div class="modal-group" id="m-pc-ma-grp"><label>Mother Age</label><input type="number" id="m-pc-ma" value="${pcv.motherAge}"><div class="merr" id="err-m-pc-ma"></div></div></div>
          <div class="modal-group" style="margin-top:8px;"><label>Sum Assured (&#8377;)</label><input type="number" id="m-pc-sa" value="${pcv.sumAssured}"><div class="merr" id="err-m-pc-sa"></div></div>
          <div class="modal-row" style="margin-top:8px;"><div class="modal-group"><label>PT</label><input type="number" id="m-pc-pt" value="${pcv.pt}"><div class="merr" id="err-m-pc-pt"></div></div><div class="modal-group"><label>PPT</label><input type="number" id="m-pc-ppt" value="${pcv.ppt}"><div class="merr" id="err-m-pc-ppt"></div></div></div>
        </div>
      </div>
      </div>`;
    }
    const v = cs.riders[key]?.values || {};
    switch (key) {
        case 'adb': return `<div class="modal-section" style="margin-top:4px;"><div class="modal-group"><label>Sum Assured (&#8377;)</label><input type="number" id="m-adb-sa" value="${v.sumAssured || cs.sa}"><div style="font-size:10px;color:#64748b;margin-top:4px">Max: &#8377;${cs.sa.toLocaleString('en-IN')}</div><div class="merr" id="err-m-adb-sa"></div></div></div>`;
        case 'ci': {
            const defPT = Math.min(20, cs.pt);
            return `<div class="modal-section" style="margin-top:4px;">
        <div class="modal-group"><label>Type</label><select id="m-ci-type"><option value="Comprehensive"${v.type === 'Comprehensive' ? ' selected' : ''}>Comprehensive</option><option value="Critical"${v.type === 'Critical' ? ' selected' : ''}>Critical</option><option value="Enhanced"${v.type === 'Enhanced' ? ' selected' : ''}>Enhanced</option></select></div>
        <div class="modal-group" style="margin-top:12px;"><label>Sum Assured (&#8377;)</label><input type="number" id="m-ci-sa" value="${v.sumAssured}"><div class="merr" id="err-m-ci-sa"></div></div>
        <div class="modal-row" style="margin-top:12px;">
          <div class="modal-group"><label>Policy Term</label><input type="number" id="m-ci-pt" value="${v.pt || defPT}"><div class="merr" id="err-m-ci-pt"></div></div>
          <div class="modal-group"><label>Payment Term</label><input type="number" id="m-ci-ppt" value="${v.ppt || defPT}"><div class="merr" id="err-m-ci-ppt"></div></div>
        </div>
      </div>`;
        }
        case 'carePlus': {
            const defPT = Math.min(20, cs.pt);
            return `<div class="modal-section" style="margin-top:4px;">
        <div class="modal-group"><label>Plan Type</label><select id="m-cp-plan"><option value="Prime"${v.plan === 'Prime' ? ' selected' : ''}>Prime</option><option value="Pro"${v.plan === 'Pro' ? ' selected' : ''}>Pro</option><option value="Ultra"${v.plan === 'Ultra' ? ' selected' : ''}>Ultra</option><option value="Prestige"${v.plan === 'Prestige' ? ' selected' : ''}>Prestige</option><option value="Optima"${v.plan === 'Optima' ? ' selected' : ''}>Optima</option></select></div>
        <div class="modal-row" style="margin-top:12px;">
          <div class="modal-group"><label>Policy Term</label><input type="number" id="m-cp-pt" value="${v.pt || defPT}"><div class="merr" id="err-m-cp-pt"></div></div>
          <div class="modal-group"><label>Payment Term</label><input type="number" id="m-cp-ppt" value="${v.ppt || defPT}"><div class="merr" id="err-m-cp-ppt"></div></div>
        </div>
      </div>`;
        }
        default: return '';
    }
}

window.addChildHub = function () {
    syncFamilyHubData(activeModalCardIdx);
    const cs = CS[activeModalCardIdx];
    if (!cs.riders.childCare.children) cs.riders.childCare.children = [];
    if (cs.riders.childCare.children.length < 3) {
        cs.riders.childCare.children.push({ age: 10, gender: 'Male', sumAssured: 5000000, pt: 15, ppt: 10 });
        document.getElementById('rm-body').innerHTML = getModalBody('famCare', cs);
        bindModalEvents('famCare');
    }
};
window.removeChildHub = function (i) {
    syncFamilyHubData(activeModalCardIdx);
    const cs = CS[activeModalCardIdx];
    cs.riders.childCare.children.splice(i, 1);
    document.getElementById('rm-body').innerHTML = getModalBody('famCare', cs);
    bindModalEvents('famCare');
};

function cleanInt(v) {
    if (typeof v === 'number') return Math.floor(v);
    return parseInt(String(v || '').replace(/[^0-9]/g, '')) || 0;
}

// applyModal: identical validation logic, wired to CS[ci]
function applyModal(ci, key) {
    const cs = CS[ci];
    const rc = cs.riders[key];

    if (key === 'famCare') {
        rc.enabled = true;
        rc.enabled = true;
        rc.values = {
            sumAssured: cleanInt(document.getElementById('m-fc-sa').value),
            pt: cleanInt(document.getElementById('m-fc-pt').value),
            ppt: cleanInt(document.getElementById('m-fc-ppt').value)
        };
        const scOn = document.getElementById('m-sc-tog').classList.contains('on');
        cs.riders.spouseCare.enabled = scOn;
        if (scOn) {
            cs.riders.spouseCare.values = {
                age: cleanInt(document.getElementById('m-sc-age').value),
                gender: document.getElementById('m-sc-gen').value,
                sumAssured: cleanInt(document.getElementById('m-sc-sa').value),
                pt: cleanInt(document.getElementById('m-sc-pt').value),
                ppt: cleanInt(document.getElementById('m-sc-ppt').value)
            };
        }
        const ccOn = document.getElementById('m-cc-tog').classList.contains('on');
        cs.riders.childCare.enabled = ccOn;
        if (ccOn) {
            const ch = [];
            const list = cs.riders.childCare.children || [];
            for (let i = 0; i < list.length; i++) {
                ch.push({
                    age: cleanInt(document.getElementById(`m-cc-age-${i}`).value),
                    gender: document.getElementById(`m-cc-gen-${i}`).value,
                    sumAssured: cleanInt(document.getElementById(`m-cc-sa-${i}`).value),
                    pt: cleanInt(document.getElementById(`m-cc-pt-${i}`).value),
                    ppt: cleanInt(document.getElementById(`m-cc-ppt-${i}`).value)
                });
            }
            cs.riders.childCare.children = ch;
        }
        const pcOn = document.getElementById('m-pc-tog').classList.contains('on');
        cs.riders.parentalCare.enabled = pcOn;
        if (pcOn) {
            cs.riders.parentalCare.values = {
                selection: document.getElementById('m-pc-sel').value,
                fatherAge: cleanInt(document.getElementById('m-pc-fa').value),
                motherAge: cleanInt(document.getElementById('m-pc-ma').value),
                sumAssured: cleanInt(document.getElementById('m-pc-sa').value),
                pt: cleanInt(document.getElementById('m-pc-pt').value),
                ppt: cleanInt(document.getElementById('m-pc-ppt').value)
            };
        }
        rc.configured = true;
    }

    switch (key) {
        case 'adb': {
            const sa = cleanInt(document.getElementById('m-adb-sa').value) || 0;
            if (sa < 5000000 || sa > 100000000) {
                showFieldError("ADB SA must be between &#8377;50L and &#8377;10Cr", 'm-adb-sa');
                return;
            }
            if (sa > cs.sa) {
                showFieldError("ADB SA cannot exceed base Sum Assured", 'm-adb-sa');
                return;
            }
            rc.enabled = true; rc.configured = true;
            rc.values = { sumAssured: sa };
            break;
        }
        case 'ci': {
            const sa = cleanInt(document.getElementById('m-ci-sa').value) || 0;
            if (sa < 200000) {
                showFieldError("Minimum CI Sum Assured is &#8377;2L", 'm-ci-sa');
                return;
            }
            if (sa > cs.sa) {
                showFieldError("CI Sum Assured cannot exceed base Sum Assured", 'm-ci-sa');
                return;
            }
            rc.enabled = true; rc.configured = true;
            rc.values = {
                type: document.getElementById('m-ci-type').value,
                sumAssured: sa,
                pt: cleanInt(document.getElementById('m-ci-pt').value),
                ppt: cleanInt(document.getElementById('m-ci-ppt').value)
            };
            break;
        }
        case 'carePlus': {
            rc.enabled = true; rc.configured = true;
            rc.values = {
                plan: document.getElementById('m-cp-plan').value,
                pt: cleanInt(document.getElementById('m-cp-pt').value),
                ppt: cleanInt(document.getElementById('m-cp-ppt').value)
            };
            break;
        }
    }

    // VALIDATE BEFORE APPLY
    const res = calcCard(ci, cs, true);
    if (!res.success) {
        showFieldError(res.errors[0]);
        return; // Don't close
    }

    recalc(); closeModal();
}

function showFieldError(error, inputId = null) {
    const errEl = document.getElementById('rm-error');
    if (errEl) {
        errEl.innerHTML = error;
        errEl.style.display = 'flex';
        errEl.style.alignItems = 'center';
        errEl.style.gap = '8px';
        errEl.style.color = '#dc2626';
        errEl.style.backgroundColor = '#fef2f2';
        errEl.style.padding = '8px';
        errEl.style.borderRadius = '4px';
    }
    if (inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            input.classList.add('err-border');
            setTimeout(() => input.classList.remove('err-border'), 5000);
        }
    }
    const body = document.getElementById('rm-body');
    if (body) body.querySelectorAll('.merr').forEach(el => { el.textContent = ''; el.style.display = 'none'; });

    let fieldId = '';
    const msg = error.toLowerCase();

    if (msg.includes('spouse sa')) fieldId = 'm-sc-sa';
    else if (msg.includes('adb sa')) fieldId = 'm-adb-sa';
    else if (msg.includes('ci sa')) fieldId = 'm-ci-sa';
    else if (msg.includes('spouse term') || msg.includes('spouse pt')) fieldId = 'm-sc-pt';
    else if (msg.includes('spouse age')) fieldId = 'm-sc-age';
    else if (msg.includes('child sa')) fieldId = 'm-cc-sa-0'; // Default to first child
    else if (msg.includes('parental sa')) fieldId = 'm-pc-sa';
    else if (msg.includes('sa') || msg.includes('sum assured')) {
        fieldId = inputId || ['m-fc-sa', 'm-adb-sa', 'm-ci-sa', 'm-sc-sa', 'm-cc-sa', 'm-pc-sa'].find(id => document.getElementById(id));
    }

    if (fieldId && document.getElementById(fieldId)) {
        const errDiv = document.getElementById(`err-${fieldId}`);
        if (errDiv) {
            errDiv.textContent = error;
            errDiv.style.display = 'flex';
        }
        document.getElementById(fieldId).classList.add('err-border');
    } else {
        const errDiv = document.getElementById('rm-error');
        errDiv.textContent = error;
        errDiv.style.display = 'block';
    }
}



function bindProfile() {
    const rc = () => {
        S.age = parseInt(document.getElementById('i-age').value) || 26;
        S.gender = document.getElementById('i-gen').value;
        S.smoker = document.getElementById('i-smk').value;
        S.residence = document.getElementById('i-res').value;
        S.income = document.getElementById('i-income').value;
        S.occupation = document.getElementById('i-occ').value;
        S.pincode = document.getElementById('i-pin').value;

        // Force 'Online Sales' defaults
        S.channel = 'Online Sales';
        S.discounts.online = true;

        // Sync salaried discount in all cards if occupation changes to Salaried
        const isSal = (S.occupation === 'Salaried');
        CS.forEach(c => c.discounts.salaried = isSal);

        recalc();
    };

    ['i-age', 'i-gen', 'i-smk', 'i-res', 'i-income', 'i-occ'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', rc);
    });

    const pinInp = document.getElementById('i-pin');
    const pinErr = document.getElementById('pin-err');
    if (pinInp) {
        pinInp.addEventListener('input', async e => {
            const val = e.target.value.replace(/\D/g, '');
            e.target.value = val;
            S.pincode = val;

            const basicValid = /^[1-9][0-9]{5}$/.test(val);
            if (val.length > 0 && (val.length < 6 || val[0] === '0')) {
                if (pinErr) {
                    pinErr.textContent = val[0] === '0' ? 'Starts with 0 (Invalid)' : 'Invalid Indian Pincode';
                    pinErr.style.display = 'block';
                }
            } else {
                if (pinErr) pinErr.style.display = 'none';
            }

            if (val.length === 6 && basicValid) {
                // Remote check
                pinInp.classList.add('loading-border');
                try {
                    const apiKey = '579b464db66ec23bdd000001cdc3b564546246a772a26393094f5645';
                    const url = `https://api.data.gov.in/resource/5c2f62fe-5afa-4119-a499-fec9d604d5bd?api-key=${apiKey}&format=json&limit=1&filters[pincode]=${val}`;
                    const resp = await fetch(url);
                    const data = await resp.json();
                    const exists = (data.total > 0);

                    if (!exists) {
                        if (pinErr) {
                            pinErr.textContent = 'Pincode not found in directory';
                            pinErr.style.display = 'block';
                        }
                    } else {
                        if (pinErr) pinErr.style.display = 'none';
                        rc();
                    }
                } catch (err) {
                    console.warn('Pincode API failed:', err);
                    rc(); // Fallback to basic validation
                } finally {
                    pinInp.classList.remove('loading-border');
                }
            }
        });
    }
}


async function init() {
    console.log("%c BAJAJ LIFE ETOUCH II %c UAT DEPLOYMENT ", "background:#c41230;color:#fff;padding:2px 6px;border-radius:3px 0 0 3px", "background:#1f4e79;color:#fff;padding:2px 6px;border-radius:0 3px 3px 0");
    console.log(`%c Environment: %c UAT \n Path: %c /term-plan-compare/ \n URL: %c http://balicuat.bajajlifeinsurance.com/term-plan-compare/`, "font-weight:bold", "color:#1a73e8", "color:#1a73e8", "color:#1a73e8");
    console.log("UAT Environment Date : 07-04-2026");
    try {
        await loadRateData();
        document.getElementById('ld').style.display = 'none';
        document.getElementById('nav').style.display = 'flex';
        document.getElementById('mc').style.display = 'block';
        bindProfile(); recalc();
    } catch (e) {
        document.getElementById('ld').innerHTML = `<div style="color:#dc2626;text-align:center;padding:40px"><h2>Failed to load</h2><p>${e.message}</p></div>`;
    }
}
// Close any open combo lists when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.combo-box')) {
        document.querySelectorAll('.combo-list').forEach(l => l.classList.remove('open'));
    }
});

init();
