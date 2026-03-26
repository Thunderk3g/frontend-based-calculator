import { loadRateData, calculatePremium, formatCurrency, formatCurrencyWhole, CONFIG } from './calc.js';

// ── GLOBAL PROFILE STATE (age/gender/smoker/residence/mode/sel) ──
const S = {
    age: 26, gender: 'Male', smoker: 'Non Smoker', residence: 'Resident Indian', mode: 'Monthly', sel: 0,
    // Legacy addons/discounts kept for backward compat (not used in new UI path)
    addons: { adb: false, ci: false, carePlus: false, spouseCare: false, childCare: false, famCare: false, parentalCare: false },
    discounts: { online: false, siso: false, partner: false, salaried: false, insuranceForAll: false, aggregator: false }
};

// ── PER-CARD STATE (sa, pt, ppt, riders, discounts) ──
function makeCardState(sa, pt, ppt) {
    return {
        sa, pt, ppt,
        // Payout overrides (UI only – lump sum / family income display inputs)
        lumpSum: sa, familyIncome: 0,
        riders: {
            adb: { enabled: false, configured: false, values: { sumAssured: sa } },
            ci: { enabled: false, configured: false, values: { type: 'Comprehensive', sumAssured: 200000, pt: 20, ppt: 10 } },
            carePlus: { enabled: false, configured: false, values: { plan: 'Prime', pt: 20, ppt: 5 } },
            famCare: { enabled: false, configured: false, values: { sumAssured: 1000000, pt: pt, ppt: ppt } },
            spouseCare: { enabled: false, configured: false, values: { age: 18, gender: 'Female', sumAssured: Math.floor(sa * 0.5), pt: 49, ppt: 10 } },
            childCare: { enabled: false, configured: false, children: [{ age: 10, gender: 'Male', sumAssured: 5000000, pt: 15, ppt: 10 }] },
            parentalCare: { enabled: false, configured: false, values: { selection: 'Both Parents', fatherAge: 60, motherAge: 55, sumAssured: sa, pt: 49, ppt: 10 } }
        },
        discounts: { working: false, prime: false, existingCustomer: false }
    };
}

// Three per-card states matching V[] array
const CS = [
    makeCardState(9000000, 59, 10),
    makeCardState(9000000, 59, 10),
    makeCardState(9000000, 50, 10)
];

// ── PLAN VARIANTS (unchanged) ──
const V = [
    {
        id: 'ls', name: 'Life Shield', sub: 'Pure Term Protection', code: 'LS', pv: 'Life Shield', maxPT: 67,
        feats: ['Pure term protection', '100% lump sum payout', 'Max PT: 67 years']
    },
    {
        id: 'lsp', name: 'Life Shield Plus', sub: 'Enhanced Protection', code: 'LS', pv: 'Life Shield', maxPT: 67,
        feats: ['Same premium as Life Shield', 'Flexible death benefit payout', '50% lump sum + monthly income']
    },
    {
        id: 'lsr', name: 'Life Shield ROP', sub: 'Return of Premium', code: 'LSR', pv: 'Life Shield ROP', maxPT: 50,
        feats: ['100% premiums returned on survival', 'Death benefit covered', 'Max PT: 50 years']
    }
];

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

// Card-level discount defs (subset as specified)
const cardDiscDefs = [
    { key: 'working', label: 'Working', pct: '5%' },
    { key: 'prime', label: 'Prime', pct: '6%' },
    { key: 'existingCustomer', label: 'Existing Customer', pct: '6%' }
];

// Map card discounts → S.discounts keys for calc engine
function mapCardDisc(cardDisc) {
    return {
        online: false, siso: false, partner: false,
        salaried: cardDisc.working,
        insuranceForAll: cardDisc.prime,
        aggregator: cardDisc.existingCustomer
    };
}

let results = [];

// ── BASE RIDERS (unchanged helper) ──
function baseRiders() {
    return {
        adb: { enabled: false }, ci: { enabled: false }, carePlus: { enabled: false },
        parentalCare: { enabled: false }, spouseCare: { enabled: false }, childCare: [], famCare: { enabled: false }
    };
}

// Build riders for a card's RS state
function buildCardRiders(cs, onlyKey) {
    const RS = cs.riders;
    const r = baseRiders();
    const keys = onlyKey ? [onlyKey] : addonDefs.map(a => a.key).filter(k => RS[k] && RS[k].enabled);
    keys.forEach(k => {
        const rc = RS[k]; if (!rc) return;
        const v = rc.values || {};
        if (k === 'adb') r.adb = { enabled: true, sumAssured: v.sumAssured || cs.sa };
        else if (k === 'ci') r.ci = { enabled: true, sumAssured: v.sumAssured, pt: v.pt, ppt: v.ppt, ciType: v.type || 'Comprehensive' };
        else if (k === 'carePlus') r.carePlus = { enabled: true, plan: v.plan, pt: v.pt, ppt: v.ppt };
        else if (k === 'spouseCare') r.spouseCare = { enabled: true, spouseAge: v.age, spouseGender: v.gender, sumAssured: v.sumAssured, pt: v.pt, ppt: v.ppt };
        else if (k === 'childCare') {
            const ch = rc.children || [{ age: 10, gender: 'Male', sumAssured: 5000000, pt: 15, ppt: 10 }];
            r.childCare = ch.map(c => ({ enabled: true, ...c }));
        }
        else if (k === 'famCare') r.famCare = { enabled: true, sumAssured: v.sumAssured, pt: v.pt, ppt: v.ppt };
        else if (k === 'parentalCare') r.parentalCare = { enabled: true, selection: v.selection, fatherAge: v.fatherAge, motherAge: v.motherAge, sumAssured: v.sumAssured, pt: v.pt, ppt: v.ppt };
    });
    return r;
}

// ── CALCULATION (same engine, per-card params) ──
function calcCard(vi, cs, withAddons) {
    const v = V[vi];
    const pt = Math.min(cs.pt, v.maxPT);
    const ppt = Math.min(cs.ppt, pt);
    const riders = withAddons ? buildCardRiders(cs) : baseRiders();
    const disc = withAddons ? mapCardDisc(cs.discounts) : {};
    return calculatePremium({
        age: S.age, gender: S.gender, smoker: S.smoker, variant: v.pv, pt, ppt,
        sa: cs.sa, mode: S.mode, medicalCategory: 'Medical', residence: S.residence,
        discounts: disc, gstYear1Rate: 0, gstYear2Rate: 0, riders
    });
}

function modeLabel() {
    return S.mode === 'Monthly' ? '/mo' : S.mode === 'Quarterly' ? '/qtr' : S.mode === 'Half-Yearly' ? '/half-yr' : '/yr';
}

// ── Rider price delta for a card ──
function getCardRiderPrice(vi, cs, key) {
    const v = V[vi];
    const pt = Math.min(cs.pt, v.maxPT);
    const ppt = Math.min(cs.ppt, pt);
    const args = {
        age: S.age, gender: S.gender, smoker: S.smoker, variant: v.pv, pt, ppt,
        sa: cs.sa, mode: S.mode, medicalCategory: 'Medical', residence: S.residence,
        discounts: {}, gstYear1Rate: 0, gstYear2Rate: 0
    };
    const base = calculatePremium({ ...args, riders: baseRiders() });
    if (!base.success) return 'N/A';
    const withR = calculatePremium({ ...args, riders: buildCardRiders(cs, key) });
    if (!withR.success) return 'N/A';
    const delta = withR.instalmentWithGSTYear1 - base.instalmentWithGSTYear1;
    return delta > 0 ? '+' + formatCurrency(delta) + modeLabel() : 'Included';
}

function recalc() {
    results = V.map((v, i) => calcCard(i, CS[i], true));
    renderCards();
    renderBottom();
}

// ── RENDER CARDS ──
function renderCards() {
    const g = document.getElementById('cg');
    const ml = modeLabel();
    const isNRI = S.residence === 'NRI';

    // Compute best (no-addon base)
    let bestIdx = -1, bestCPL = Infinity;
    const baseRes = V.map((v, i) => calcCard(i, CS[i], false));
    baseRes.forEach((r, i) => {
        if (r.success) {
            const mf = CONFIG.modalFactors[S.mode] || 1;
            const ann = r.instalmentWithGSTYear1 / mf;
            const cpl = ann / (CS[i].sa / 100000);
            if (cpl < bestCPL) { bestCPL = cpl; bestIdx = i; }
        }
    });

    g.innerHTML = V.map((v, i) => {
        const cs = CS[i];
        const r = results[i];
        const br = baseRes[i];
        const sel = (S.sel === i);
        const best = (bestIdx === i);
        const cls = 'card fi' + (sel ? ' selected' : '') + (best ? ' best' : '');

        const ptUsed = Math.min(cs.pt, v.maxPT);
        const ptCapped = cs.pt > v.maxPT;

        // Premium values
        const show = sel ? r : br;
        const y1 = (show && show.success) ? show.instalmentWithGSTYear1 : 0;
        const y2 = (show && show.success) ? show.instalmentWithGSTYear2 : 0;

        // Error handling
        if (r && !r.success && br && !br.success) {
            return `<div class="${cls}" data-i="${i}">
        <span class="badge">Best Value</span>
        <div class="card-name">${v.name}</div>
        <div class="card-err show">${(r.errors || []).join('. ')}</div>
        <div class="sel-btn"><button>Select Plan</button></div></div>`;
        }

        // ── Plan Inputs ──
        const ptOpts = Array.from({ length: v.maxPT - 4 }, (_, k) => k + 5)
            .map(n => `<option value="${n}"${n === cs.pt ? ' selected' : ''}>${n} yrs</option>`).join('');
        const pptOpts = Array.from({ length: Math.min(cs.pt, v.maxPT) }, (_, k) => k + 1)
            .map(n => `<option value="${n}"${n === cs.ppt ? ' selected' : ''}>${n} yrs</option>`).join('');

        // ── Rider rows ──
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
            const editHtml = (rd.hasEdit && on) ? `<span class="card-rider-edit" data-ci="${i}" data-k="${rd.key}" title="Edit Configuration" style="background:none; color:#0b3a6e; padding:0; margin-left:4px;"><span class="material-icons-outlined" style="font-size:16px;">edit</span></span>` : '';

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
            <span class="material-icons-outlined" style="font-size:14px;">${rd.icon}</span>
            ${rd.label}${editHtml}
          </div>
          ${on ? `<div class="card-rider-price">${price}</div>` : ''}
          ${subText}
        </div>
        <div class="card-rider-right">
          <div class="tog${on ? ' on' : ''}" data-ci="${i}" data-k="${rd.key}"></div>
        </div>
      </div>`;
        }).join('');

        // ── Discount rows ──
        const discRowsHtml = cardDiscDefs.map(dd => {
            const on = cs.discounts[dd.key];
            return `<div class="card-disc-row">
        <div class="card-disc-label">${dd.label} <span style="color:#059669; font-weight:800; opacity:0.8;">−${dd.pct}</span></div>
        <div class="tog${on ? ' on' : ''}" data-ci="${i}" data-dk="${dd.key}"></div>
      </div>`;
        }).join('');

        const errHtml = (show && !show.success) ? `<div class="card-err show" style="margin-top:10px;">${(show.errors || []).join('. ')}</div>` : '';
        const noteHtml = ptCapped ? `<div class="card-note" style="background:#fff7ed; color:#c2410c; border:1px solid #ffedd5;">Notice: Using PT = ${v.maxPT} (max for ${v.name})</div>` : '';

        return `<div class="${cls}" data-i="${i}" style="animation-delay:${i * .08}s">
      <span class="badge">Best Value</span>
      <div class="card-name" style="font-size:18px; color:#0b3a6e; margin-bottom:15px; font-weight:800;">${v.name}</div>

      <div class="card-section" style="margin-top:0; border-top:none; padding-top:0;">

        <div class="card-fg"><label>Sum Assured (₹)</label>
          <input type="number" class="c-sa" data-ci="${i}" value="${cs.sa}" min="5000000" step="100000">
        </div>
        <div class="card-fr">
          <!-- Policy Term Combobox -->
          <div class="card-fg combo-box">
            <label>Policy Term</label>
            <div class="combo-wrapper">
              <input type="number" class="combo-input c-pt-input" data-ci="${i}" value="${cs.pt}" placeholder="Years">
              <button class="combo-btn c-pt-btn" data-ci="${i}">
                <span class="material-icons-outlined">expand_more</span>
              </button>
            </div>
            <div class="combo-list c-pt-list" data-ci="${i}">
              ${Array.from({ length: v.maxPT - 4 }, (_, k) => k + 5).map(n => `<div class="combo-item${n === cs.pt ? ' active' : ''}" data-val="${n}">${n} yrs</div>`).join('')}
            </div>
          </div>

          <!-- Payment Term Combobox -->
          <div class="card-fg combo-box">
            <label>Payment Term</label>
            <div class="combo-wrapper">
              <input type="number" class="combo-input c-ppt-input" data-ci="${i}" value="${cs.ppt}" placeholder="Years">
              <button class="combo-btn c-ppt-btn" data-ci="${i}">
                <span class="material-icons-outlined">expand_more</span>
              </button>
            </div>
            <div class="combo-list c-ppt-list" data-ci="${i}">
              ${Array.from({ length: Math.min(cs.pt, v.maxPT) }, (_, k) => k + 1).map(n => `<div class="combo-item${n === cs.ppt ? ' active' : ''}" data-val="${n}">${n} yrs</div>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="card-section">
        <div class="card-sec-title">
          <span class="material-icons-outlined" style="font-size:14px;">payments</span>
          Payout Options
        </div>
        <div class="card-fr">
          <div class="card-fg"><label>Lump Sum (₹)</label>
            <input type="number" class="c-ls" data-ci="${i}" value="${cs.lumpSum}" step="100000">
          </div>
          <div class="card-fg"><label>Income (₹)</label>
            <input type="number" class="c-fi" data-ci="${i}" value="${cs.familyIncome}" step="100000">
          </div>
        </div>
      </div>

      <div class="card-section">
        <div class="card-sec-title">
          <span class="material-icons-outlined" style="font-size:14px;">add_moderator</span>
          Riders
        </div>
        ${riderRowsHtml}
      </div>

      <div class="card-section">
        <div class="card-sec-title">
          <span class="material-icons-outlined" style="font-size:14px;">local_offer</span>
          Exclusive Offs
        </div>
        ${discRowsHtml}
      </div>

      <div class="card-spacer"></div>
      ${noteHtml}${errHtml}

      <div class="card-prem-block">
        <div class="card-prem-title">Calculated Premium</div>
        <div class="card-prem-main">
          <span class="yr-lbl">First Year</span>
          <span class="amt">${y1 > 0 ? formatCurrency(y1) + ml : '—'}</span>
        </div>
        <div class="card-prem-renewal">
          <span class="renewal-lbl">Renewal (Yr 2+)</span>
          <span class="renewal-amt">${y2 > 0 ? formatCurrency(y2) + ml : '—'}</span>
        </div>
      </div>
      
      <div class="sel-btn" style="margin-top:15px;"><button>${sel ? '✓ Selected' : 'Select Plan'}</button></div>
    </div>`;
    }).join('');

    // Bindings
    g.querySelectorAll('.card').forEach(c => {
        c.querySelector('.sel-btn button').addEventListener('click', e => {
            e.stopPropagation(); S.sel = parseInt(c.dataset.i); recalc();
        });
        c.addEventListener('click', () => { S.sel = parseInt(c.dataset.i); recalc(); });
    });
    g.querySelectorAll('.c-sa').forEach(el => {
        el.addEventListener('change', e => {
            e.stopPropagation();
            const ci = parseInt(el.dataset.ci);
            CS[ci].sa = parseInt(el.value) || 5000000;
            CS[ci].lumpSum = CS[ci].sa;
            recalc();
        });
        el.addEventListener('click', e => e.stopPropagation());
    });
    // Combobox Logic: Policy Term
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
            if (CS[ci].ppt > CS[ci].pt) CS[ci].ppt = CS[ci].pt;

            list.classList.remove('open');
            recalc();
        });
    });

    g.querySelectorAll('.c-pt-input').forEach(input => {
        input.addEventListener('input', e => {
            const ci = parseInt(input.dataset.ci);
            const val = parseInt(input.value) || 0;
            CS[ci].pt = val;
            // We don't recalc on every keystroke to avoid jitter, but we'll use 'change' for final sync
        });
        input.addEventListener('change', e => {
            const ci = parseInt(input.dataset.ci);
            if (CS[ci].ppt > CS[ci].pt) CS[ci].ppt = CS[ci].pt;
            recalc();
        });
        input.addEventListener('click', e => e.stopPropagation());
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

    g.querySelectorAll('.c-ppt-input').forEach(input => {
        input.addEventListener('input', e => {
            const ci = parseInt(input.dataset.ci);
            CS[ci].ppt = parseInt(input.value) || 0;
        });
        input.addEventListener('change', e => recalc());
        input.addEventListener('click', e => e.stopPropagation());
    });

    // Global click listener to close combo lists
    // (Moved out of renderCards to avoid accumulation)
    g.querySelectorAll('.c-ls').forEach(el => {
        el.addEventListener('change', e => { e.stopPropagation(); CS[parseInt(el.dataset.ci)].lumpSum = parseInt(el.value) || 0; });
        el.addEventListener('click', e => e.stopPropagation());
    });
    g.querySelectorAll('.c-fi').forEach(el => {
        el.addEventListener('change', e => { e.stopPropagation(); CS[parseInt(el.dataset.ci)].familyIncome = parseInt(el.value) || 0; });
        el.addEventListener('click', e => e.stopPropagation());
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
    g.querySelectorAll('.tog[data-dk]').forEach(t => {
        t.addEventListener('click', e => {
            e.stopPropagation();
            const ci = parseInt(t.dataset.ci);
            const dk = t.dataset.dk;
            CS[ci].discounts[dk] = !CS[ci].discounts[dk];
            recalc();
        });
    });
}

// ── MODAL SYSTEM (unchanged logic, wired to per-card state) ──
let activeModalCardIdx = null;
let activeModalKey = null;

function openRiderModal(ci, key) {
    activeModalCardIdx = ci; activeModalKey = key;
    const cs = CS[ci];
    document.getElementById('rm-title').textContent = addonDefs.find(a => a.key === key).label;
    document.getElementById('rm-body').innerHTML = getModalBody(key, cs);
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
        const fc = cs.riders.famCare.values || { sumAssured: 1000000, pt: 20, ppt: 10 };
        const sc = cs.riders.spouseCare;
        const cc = cs.riders.childCare;
        const pc = cs.riders.parentalCare;
        const scv = sc.values || { age: 18, gender: 'Female', sumAssured: 0, pt: 49, ppt: 10 };
        const pcv = pc.values || { selection: 'Both Parents', fatherAge: 60, motherAge: 55, sumAssured: 0, pt: 49, ppt: 10 };
        const ch = cc.children || [];
        return `
      <div class="modal-section" style="margin-top:0;"><div class="modal-sec-hdr"><div class="modal-sec-title">Family Income Benefit</div></div>
        <div class="modal-group"><label>Sum Assured (₹)</label><input type="number" id="m-fc-sa" value="${fc.sumAssured}"></div>
        <div class="modal-row" style="margin-top:10px;"><div class="modal-group"><label>Policy Term</label><input type="number" id="m-fc-pt" value="${fc.pt}"></div><div class="modal-group"><label>Payment Term</label><input type="number" id="m-fc-ppt" value="${fc.ppt}"></div></div>
      </div>
      <div class="modal-section"><div class="modal-sec-hdr"><div class="modal-sec-title">Spouse Care</div><div class="tog${sc.enabled ? ' on' : ''}" id="m-sc-tog"></div></div>
        <div id="m-sc-panel" style="display:${sc.enabled ? 'block' : 'none'}">
          <div class="modal-row"><div class="modal-group"><label>Age</label><input type="number" id="m-sc-age" value="${scv.age}"></div><div class="modal-group"><label>Gender</label><select id="m-sc-gen"><option value="Female"${scv.gender === 'Female' ? ' selected' : ''}>Female</option><option value="Male"${scv.gender === 'Male' ? ' selected' : ''}>Male</option></select></div></div>
          <div class="modal-group" style="margin-top:8px;"><label>Sum Assured (₹)</label><input type="number" id="m-sc-sa" value="${scv.sumAssured}"></div>
          <div class="modal-row" style="margin-top:8px;"><div class="modal-group"><label>PT</label><input type="number" id="m-sc-pt" value="${scv.pt}"></div><div class="modal-group"><label>PPT</label><input type="number" id="m-sc-ppt" value="${scv.ppt}"></div></div>
        </div>
      </div>
      <div class="modal-section"><div class="modal-sec-hdr"><div class="modal-sec-title">Child Care</div><div class="tog${cc.enabled ? ' on' : ''}" id="m-cc-tog"></div></div>
        <div id="m-cc-panel" style="display:${cc.enabled ? 'block' : 'none'}"><div id="m-cc-list">${ch.map((c, i) => `
          <div class="modal-section" style="background:#fff; border:1px dashed #cbd5e1; padding:12px; margin-bottom:10px;"><div class="modal-sec-hdr"><strong>Child ${i + 1}</strong> <button onclick="removeChildHub(${i})" style="color:#ef4444; background:none; border:none; font-size:11px; font-weight:700; cursor:pointer;">Remove</button></div>
            <div class="modal-row"><div class="modal-group"><label>Age</label><input type="number" id="m-cc-age-${i}" value="${c.age}"></div><div class="modal-group"><label>Gender</label><select id="m-cc-gen-${i}"><option value="Male"${c.gender === 'Male' ? ' selected' : ''}>Male</option><option value="Female"${c.gender === 'Female' ? ' selected' : ''}>Female</option></select></div></div>
            <div class="modal-group" style="margin-top:8px;"><label>Sum Assured (₹)</label><input type="number" id="m-cc-sa-${i}" value="${c.sumAssured}"></div>
            <div class="modal-row" style="margin-top:8px;"><div class="modal-group"><label>PT</label><input type="number" id="m-cc-pt-${i}" value="${c.pt}"></div><div class="modal-group"><label>PPT</label><input type="number" id="m-cc-ppt-${i}" value="${c.ppt}"></div></div></div>`).join('')}</div>
          ${ch.length < 3 ? `<button onclick="addChildHub()" style="width:100%; padding:8px; border-radius:8px; border:2px dashed #e2e8f0; background:none; color:#64748b; font-weight:700; cursor:pointer; margin-top:5px;">+ Add Child</button>` : ''}</div>
      </div>
      <div class="modal-section"><div class="modal-sec-hdr"><div class="modal-sec-title">Parental Care</div><div class="tog${pc.enabled ? ' on' : ''}" id="m-pc-tog"></div></div>
        <div id="m-pc-panel" style="display:${pc.enabled ? 'block' : 'none'}">
          <div class="modal-group"><label>Coverage</label><select id="m-pc-sel"><option value="Both Parents"${pcv.selection === 'Both Parents' ? ' selected' : ''}>Both Parents</option><option value="Father Only"${pcv.selection === 'Father Only' ? ' selected' : ''}>Father Only</option><option value="Mother Only"${pcv.selection === 'Mother Only' ? ' selected' : ''}>Mother Only</option></select></div>
          <div class="modal-row" style="margin-top:8px;"><div class="modal-group" id="m-pc-fa-grp"><label>Father Age</label><input type="number" id="m-pc-fa" value="${pcv.fatherAge}"></div><div class="modal-group" id="m-pc-ma-grp"><label>Mother Age</label><input type="number" id="m-pc-ma" value="${pcv.motherAge}"></div></div>
          <div class="modal-group" style="margin-top:8px;"><label>Sum Assured (₹)</label><input type="number" id="m-pc-sa" value="${pcv.sumAssured}"></div>
          <div class="modal-row" style="margin-top:8px;"><div class="modal-group"><label>PT</label><input type="number" id="m-pc-pt" value="${pcv.pt}"></div><div class="modal-group"><label>PPT</label><input type="number" id="m-pc-ppt" value="${pcv.ppt}"></div></div>
        </div>
      </div>
      </div>`;
    }
    const v = cs.riders[key]?.values || {};
    switch (key) {
        case 'adb': return `<div class="modal-section" style="margin-top:0;"><div class="modal-group"><label>Sum Assured (₹)</label><input type="number" id="m-sa" value="${v.sumAssured || cs.sa}"><div style="font-size:10px;color:#64748b;margin-top:4px">Max: ₹${cs.sa.toLocaleString('en-IN')}</div></div></div>`;
        case 'ci': return `<div class="modal-section" style="margin-top:0;"><div class="modal-group"><label>Type</label><select id="m-type"><option value="Comprehensive"${v.type === 'Comprehensive' ? ' selected' : ''}>Comprehensive</option><option value="Critical"${v.type === 'Critical' ? ' selected' : ''}>Critical</option><option value="Enhanced"${v.type === 'Enhanced' ? ' selected' : ''}>Enhanced</option></select></div><div class="modal-group" style="margin-top:12px;"><label>Sum Assured (₹)</label><input type="number" id="m-sa" value="${v.sumAssured}"></div><div class="modal-row" style="margin-top:12px;"><div class="modal-group"><label>Policy Term</label><input type="number" id="m-pt" value="${v.pt}"></div><div class="modal-group"><label>Payment Term</label><input type="number" id="m-ppt" value="${v.ppt}"></div></div></div>`;
        case 'carePlus': return `<div class="modal-section" style="margin-top:0;"><div class="modal-group"><label>Plan Type</label><select id="m-plan"><option value="Prime"${v.plan === 'Prime' ? ' selected' : ''}>Prime</option><option value="Pro"${v.plan === 'Pro' ? ' selected' : ''}>Pro</option><option value="Ultra"${v.plan === 'Ultra' ? ' selected' : ''}>Ultra</option><option value="Prestige"${v.plan === 'Prestige' ? ' selected' : ''}>Prestige</option><option value="Optima"${v.plan === 'Optima' ? ' selected' : ''}>Optima</option></select></div><div class="modal-row" style="margin-top:12px;"><div class="modal-group"><label>Policy Term</label><input type="number" id="m-pt" value="${v.pt}"></div><div class="modal-group"><label>Payment Term</label><input type="number" id="m-ppt" value="${v.ppt}"></div></div></div>`;
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

// applyModal: identical validation logic, wired to CS[ci]
function applyModal(ci, key) {
    const cs = CS[ci];
    const rc = cs.riders[key];

    if (key === 'famCare') {
        rc.enabled = true;
        rc.values = {
            sumAssured: parseInt(document.getElementById('m-fc-sa').value),
            pt: parseInt(document.getElementById('m-fc-pt').value),
            ppt: parseInt(document.getElementById('m-fc-ppt').value)
        };
        const scOn = document.getElementById('m-sc-tog').classList.contains('on');
        cs.riders.spouseCare.enabled = scOn;
        if (scOn) {
            cs.riders.spouseCare.values = {
                age: parseInt(document.getElementById('m-sc-age').value),
                gender: document.getElementById('m-sc-gen').value,
                sumAssured: parseInt(document.getElementById('m-sc-sa').value),
                pt: parseInt(document.getElementById('m-sc-pt').value),
                ppt: parseInt(document.getElementById('m-sc-ppt').value)
            };
        }
        const ccOn = document.getElementById('m-cc-tog').classList.contains('on');
        cs.riders.childCare.enabled = ccOn;
        if (ccOn) {
            const ch = [];
            const list = cs.riders.childCare.children || [];
            for (let i = 0; i < list.length; i++) {
                ch.push({
                    age: parseInt(document.getElementById(`m-cc-age-${i}`).value),
                    gender: document.getElementById(`m-cc-gen-${i}`).value,
                    sumAssured: parseInt(document.getElementById(`m-cc-sa-${i}`).value),
                    pt: parseInt(document.getElementById(`m-cc-pt-${i}`).value),
                    ppt: parseInt(document.getElementById(`m-cc-ppt-${i}`).value)
                });
            }
            cs.riders.childCare.children = ch;
        }
        const pcOn = document.getElementById('m-pc-tog').classList.contains('on');
        cs.riders.parentalCare.enabled = pcOn;
        if (pcOn) {
            cs.riders.parentalCare.values = {
                selection: document.getElementById('m-pc-sel').value,
                fatherAge: parseInt(document.getElementById('m-pc-fa').value),
                motherAge: parseInt(document.getElementById('m-pc-ma').value),
                sumAssured: parseInt(document.getElementById('m-pc-sa').value),
                pt: parseInt(document.getElementById('m-pc-pt').value),
                ppt: parseInt(document.getElementById('m-pc-ppt').value)
            };
        }
        rc.configured = true;
        recalc(); closeModal(); return;
    }

    switch (key) {
        case 'adb': {
            const sa = parseInt(document.getElementById('m-sa').value) || 0;
            if (sa > cs.sa) { alert('ADB SA cannot exceed base SA'); return; }
            rc.enabled = true; rc.configured = true;
            rc.values = { sumAssured: sa };
            break;
        }
        case 'ci': {
            rc.enabled = true; rc.configured = true;
            rc.values = {
                type: document.getElementById('m-type').value,
                sumAssured: parseInt(document.getElementById('m-sa').value),
                pt: parseInt(document.getElementById('m-pt').value),
                ppt: parseInt(document.getElementById('m-ppt').value)
            };
            break;
        }
        case 'carePlus': {
            rc.enabled = true; rc.configured = true;
            rc.values = {
                plan: document.getElementById('m-plan').value,
                pt: parseInt(document.getElementById('m-pt').value),
                ppt: parseInt(document.getElementById('m-ppt').value)
            };
            break;
        }
    }
    recalc(); closeModal();
}

// ── BOTTOM BAR (unchanged) ──
function renderBottom() {
    const v = V[S.sel];
    const r = results[S.sel];
    const ml = modeLabel();
    const rCount = addonDefs.filter(a => CS[S.sel].riders[a.key]?.enabled).length;
    const nm = rCount > 0 ? `${v.name} + ${rCount} Rider${rCount > 1 ? 's' : ''}` : v.name;
    document.getElementById('b-name').textContent = nm;
    if (r && r.success) {
        document.getElementById('b-y1').textContent = formatCurrency(r.instalmentWithGSTYear1) + ' ' + ml;
        document.getElementById('b-y2').textContent = formatCurrency(r.instalmentWithGSTYear2) + ' ' + ml;
    } else {
        document.getElementById('b-y1').textContent = '—';
        document.getElementById('b-y2').textContent = '—';
    }
}

// ── PROFILE BINDING (age/gender/smoker/residence only) ──
function bindProfile() {
    const rc = () => {
        S.age = parseInt(document.getElementById('i-age').value) || 26;
        S.gender = document.getElementById('i-gen').value;
        S.smoker = document.getElementById('i-smk').value;
        S.residence = document.getElementById('i-res').value;
        recalc();
    };
    ['i-age', 'i-gen', 'i-smk', 'i-res'].forEach(id => document.getElementById(id).addEventListener('change', rc));
}

function bindMode() {
    document.querySelectorAll('.mode-btn').forEach(b => {
        b.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(x => x.classList.remove('active'));
            b.classList.add('active'); S.mode = b.dataset.m; recalc();
        });
    });
}

async function init() {
    try {
        await loadRateData();
        document.getElementById('ld').style.display = 'none';
        document.getElementById('nav').style.display = 'flex';
        document.getElementById('mc').style.display = 'block';
        document.getElementById('bb').style.display = 'flex';
        bindProfile(); bindMode(); recalc();
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
