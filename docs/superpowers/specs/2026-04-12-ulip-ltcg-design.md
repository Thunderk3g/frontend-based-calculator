# ULIP LTCG Tax Benefit Feature — Design Spec

**Date:** 2026-04-12
**Scope:** `goal-assure-ulip-online-sales/web`
**Status:** Approved — ready for implementation planning

---

## 1. Goal

Add a "Tax Benefit — LTCG Savings" section to the BI Calculator tab that quantifies the LTCG tax a user *would* owe if the ULIP's maturity gain were instead realised from an equity mutual fund. The section surfaces the value of Section 10(10D) exemption for ULIPs with annual premium ≤ ₹2.5L.

## 2. Background

Under Indian tax law, ULIP proceeds are exempt under Section 10(10D) when annual premium ≤ ₹2.5L. Above that threshold the exemption is lost and maturity proceeds are taxed as LTCG — currently 12.5% on gains above a ₹1.25L exemption limit (post-July 2024 Union Budget). Equity mutual funds are always taxed at the same LTCG rate.

## 3. Decisions (locked)

| ID | Decision | Choice | Rationale |
|---|---|---|---|
| A | Comparator | Equity MF at current LTCG rates (12.5% above ₹1.25L) | Natural alternative product; clear, current rules |
| X | Comparator gain | Apply LTCG to the ULIP's own gain | Self-consistent, no extra assumptions |
| P2 | UI location | Dedicated section between dashboard and BI table | Room to show stats + exemption callout without clutter |
| S1 | Scenario coverage | Only currently selected scenario (4 / 8 / Custom) | Matches existing dashboard pattern, updates live on toggle |
| T1 | Above-threshold behaviour | Hide section entirely when annual premium > ₹2.5L | Matches stated intent: "we just want savings <2.5L annual" |

## 4. Architecture

Three files touched; no new files.

- **`web/src/calc.js`** — adds one pure function `computeLtcgBenefit(projection, yearlyPremium, ppt)` and three constants. Owns all tax math.
- **`web/src/ui.js`** — adds `renderLtcgSection(ltcg)` which returns the HTML string, and a one-line call inside `recalc()` that writes into a slot element placed between `#dashboard-container` and the Benefit Illustration `<div class="section">`.
- **`web/index.html`** — extends the existing `<style>` block with rules for `.ltcg-benefit`, `.ltcg-head`, `.ltcg-badge`, `.ltcg-grid`, `.ltcg-stat`, `.ltcg-val`, `.ltcg-sub`, `.ltcg-fine`, plus colour modifiers `.green`/`.red`/`.highlight`.

**Module contract:** `calc.js` is DOM-free pure math. `ui.js` is DOM-only, no tax constants.

## 5. Calculation

Constants at the top of `calc.js` near the rate-cache declarations:

```js
const LTCG_PREMIUM_THRESHOLD = 250000;   // ≤ 2.5L → exempt u/s 10(10D)
const LTCG_EXEMPTION_LIMIT   = 125000;   // ₹1.25L LTCG exemption
const LTCG_RATE              = 0.125;    // 12.5% (post-July 2024)
```

Pure function:

```js
export function computeLtcgBenefit(projection, yearlyPremium, ppt) {
    if (yearlyPremium > LTCG_PREMIUM_THRESHOLD) return null;  // T1: hide

    const totalInvested = yearlyPremium * Math.min(pt, ppt);
    const totalGain     = projection.finalFundValue - totalInvested;

    if (totalGain <= 0) {
        return {
            applicable: true, totalInvested, totalGain,
            taxableGain: 0, hypotheticalLtcg: 0, savings: 0,
        };
    }

    const taxableGain      = Math.max(0, totalGain - LTCG_EXEMPTION_LIMIT);
    const hypotheticalLtcg = taxableGain * LTCG_RATE;
    const savings          = hypotheticalLtcg;  // ULIP actually pays ₹0

    return {
        applicable: true, totalInvested, totalGain,
        taxableGain, hypotheticalLtcg, savings,
    };
}
```

**Return shape contract:**
- `null` → renderer emits empty string (section hidden; T1).
- Object with `applicable: true, savings > 0` → full stat grid renders.
- Object with `applicable: true, savings === 0` → compact zero-state message (gain under exemption or loss). No stat grid.

**Edge cases:**
- `totalGain ≤ 0` → zero-state.
- `taxableGain ≤ 0` (gain ≤ ₹1.25L) → zero-state.
- `ppt > pt` → impossible in practice because `calculateULIPProjection` already caps premium payments at year ≤ ppt; total invested uses `ppt` directly.
- No NaN/undefined paths — `projection.finalFundValue` is produced by `calculateULIPProjection` which initialises it to 0.

**Total invested uses `Math.min(pt, ppt)`** — matches the existing dashboard at `ui.js:461` and the projection loop at `calc.js:96-97` (the loop only runs for `pt` years, and premium is paid only when `year <= ppt`).

## 6. UI — Markup, placement, styling

**Slot element.** Add once to the main calculator template, between `#dashboard-container` and the existing `<div class="section">` containing the Benefit Illustration (approximately `ui.js:155`):

```html
<div id="ltcg-benefit-slot"></div>
```

**Section markup** (produced by `renderLtcgSection`):

```html
<section class="ltcg-benefit">
  <div class="ltcg-head">
    <span class="material-icons-outlined">savings</span>
    <h3>Tax Benefit — LTCG Savings</h3>
    <span class="ltcg-badge">Exempt u/s 10(10D)</span>
  </div>

  <div class="ltcg-grid">
    <div class="ltcg-stat">
      <label>Total Invested</label>
      <div class="ltcg-val">₹{formatCurrency(totalInvested)}</div>
    </div>
    <div class="ltcg-stat">
      <label>Maturity Gain</label>
      <div class="ltcg-val">₹{formatCurrency(totalGain)}</div>
    </div>
    <div class="ltcg-stat">
      <label>LTCG if taxed as Equity MF</label>
      <div class="ltcg-val red">₹{formatCurrency(hypotheticalLtcg)}</div>
      <div class="ltcg-sub">12.5% on ₹{formatCurrency(taxableGain)} (above ₹1.25L exemption)</div>
    </div>
    <div class="ltcg-stat highlight">
      <label>You Save</label>
      <div class="ltcg-val green">₹{formatCurrency(savings)}</div>
      <div class="ltcg-sub">vs equivalent equity MF gain</div>
    </div>
  </div>

  <div class="ltcg-fine">
    Applicable because annual premium (₹{formatCurrency(yearlyPremium)}) ≤ ₹2.5L.
    ULIP proceeds are tax-free under Section 10(10D). The comparison applies the
    current LTCG rate (12.5% above ₹1.25L) to this ULIP's own gain as an
    equivalent mutual-fund tax liability.
  </div>
</section>
```

**Zero-state markup** (when `savings === 0`): a single compact line inside the same `.ltcg-benefit` wrapper, with the head + badge, replacing the grid with:

```html
<div class="ltcg-zero">
  Maturity gain falls within the ₹1.25L LTCG exemption — no tax would apply
  even under equity MF taxation.
</div>
```

**Styling** (added to `index.html` `<style>` block, alongside existing `.fp-*` and `.profile` rules):

- `.ltcg-benefit` — card with `background: var(--white)`, `border: 1px solid var(--border)`, `border-radius: var(--r)`, `box-shadow: var(--shadow-card)`, `padding: 22px`, `margin-bottom: 20px`.
- `.ltcg-head` — flex row, icon + h3 + badge pushed right with `margin-left: auto`.
- `.ltcg-head .material-icons-outlined` — `color: var(--bajaj-blue)`, `font-size: 22px`.
- `.ltcg-head h3` — `font-size: 15px; font-weight: 700; color: var(--t1)`.
- `.ltcg-badge` — pill, `background: #ecfdf5; color: #0d9f6e; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.04em`.
- `.ltcg-grid` — `display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 16px`.
- `.ltcg-stat` — `padding: 12px 14px; border-radius: 10px; background: var(--input); border: 1px solid var(--border)`.
- `.ltcg-stat.highlight` — `background: #fff8f3; border-color: var(--bajaj-orange)`.
- `.ltcg-stat label` — `font-size: 10px; color: var(--t3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em`.
- `.ltcg-val` — `font-size: 20px; font-weight: 800; color: var(--t1); margin-top: 4px`.
- `.ltcg-val.green` — `color: #0d9f6e`.
- `.ltcg-val.red` — `color: #dc2626`.
- `.ltcg-sub` — `font-size: 10px; color: var(--t3); margin-top: 2px`.
- `.ltcg-fine` — `font-size: 10px; color: var(--t3); margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border); line-height: 1.5`.
- `.ltcg-zero` — `font-size: 12px; color: var(--t2); padding: 14px; background: var(--input); border-radius: 10px; margin-top: 12px`.
- `@media (max-width: 640px) { .ltcg-grid { grid-template-columns: 1fr; } .ltcg-head { flex-wrap: wrap; } }`.

## 7. Wiring & rerender

- `recalc()` in `ui.js` already drives the full dashboard rebuild on every input change. Inside `recalc()`, after the projection for the selected scenario is available, call:
  ```js
  const activeProjection = projections[scenarioKey];
  const ltcg = computeLtcgBenefit(activeProjection, S.yearlyPremium, S.ppt);
  document.getElementById('ltcg-benefit-slot').innerHTML = renderLtcgSection(ltcg);
  ```
  where `scenarioKey` is the same one already computed at `ui.js:434`.
- No event listeners added. The section rerenders naturally on premium / pt / ppt / scenario / fund-allocation changes because `recalc()` already fires for all of those.
- `renderLtcgSection(ltcg)` returns `''` when `ltcg === null`, otherwise returns the full section or zero-state markup.

## 8. Testing (manual)

No automated test harness exists in the repo. Manual verification checklist:

1. **Happy path:** Premium ₹2,00,000, PT 20, PPT 10, scenario 8% → section shows non-zero savings, stat grid populated, badge visible.
2. **Threshold hide (T1):** Change premium to ₹2,50,001 → section disappears entirely. Change back → section reappears.
3. **Exact boundary:** Premium ₹2,50,000 → section shows (≤ 2.5L is inclusive).
4. **Zero-state (gain under exemption):** Premium ₹50,000, PT 5, scenario 4% → gain < ₹1.25L → `.ltcg-zero` message renders, no stat grid.
5. **Zero-state (loss):** Custom rate 0% → `totalGain ≤ 0` → zero-state message renders.
6. **Scenario toggle:** Switch 4% / 8% / Custom → all numbers update live without page reload.
7. **PPT shorter than PT:** PT 20, PPT 7 → `totalInvested = yearlyPremium × 7` (not × 20). Verify against the BI table's "Total Premium Paid" column.
8. **Responsive:** Shrink browser to < 640px → grid collapses to single column, badge wraps under heading.
9. **Blue footer overlap:** Scroll to bottom of main content → the new section is not clipped by the fixed `.bottom` bar (footer fix from prior session already handles this).

## 9. Out of scope

- Equivalent-MF simulation with expense ratio (Option Y rejected — user chose X).
- Historical LTCG rates (pre-July 2024). Use current 12.5% / ₹1.25L.
- Surrender, partial withdrawal, or mid-term tax treatment.
- STT, cess, surcharge, or slab-rate treatment for high-income users.
- Automated unit tests (repo has no test harness; add in a future pass).
- Fund Performance tab. Feature is scoped to the BI Calculator tab only.

## 10. File summary

| File | Change |
|---|---|
| `goal-assure-ulip-online-sales/web/src/calc.js` | Add `LTCG_*` constants, `computeLtcgBenefit()`, export |
| `goal-assure-ulip-online-sales/web/src/ui.js` | Add `renderLtcgSection()`, slot `<div>`, call inside `recalc()`, import from `calc.js` |
| `goal-assure-ulip-online-sales/web/index.html` | Add `.ltcg-*` styles to existing `<style>` block |
