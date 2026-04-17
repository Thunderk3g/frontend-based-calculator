# ULIP LTCG Tax Benefit Feature — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Tax Benefit — LTCG Savings" section to the BI Calculator tab that quantifies the LTCG tax a user would owe if their ULIP gain were instead realised from an equity mutual fund, showcasing the Section 10(10D) exemption available when annual premium ≤ ₹2.5L.

**Architecture:** One pure function in `calc.js` computes the tax benefit, one render helper in `ui.js` produces the HTML, and the existing `recalc()` flow writes it into a slot element placed between the dashboard and the Benefit Illustration table. CSS rules are added to the `<style>` block in `index.html`. The feature is hidden entirely when annual premium > ₹2.5L.

**Tech Stack:** Vanilla JavaScript (ES modules), Vite, Chart.js (unused for this feature). No test framework — Task 1 adds a Node script following the existing `tests/excel_match_test.js` pattern and using Node's built-in `assert`.

**Project note:** The project is not a git repository, so the usual "commit" step is replaced by "save files and move on". If git is initialised later, retroactively commit in logical chunks per task.

**Spec reference:** `docs/superpowers/specs/2026-04-12-ulip-ltcg-design.md`

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `goal-assure-ulip-online-sales/web/src/calc.js` | Pure tax math helper + constants | Modify: add `LTCG_*` constants, `computeLtcgBenefit()` export |
| `goal-assure-ulip-online-sales/web/src/ui.js` | DOM rendering + wiring into `recalc()` | Modify: import helper, add `renderLtcgSection()`, add slot element, call in `recalc()` after `renderDashboard()` |
| `goal-assure-ulip-online-sales/web/index.html` | Styles for the new section | Modify: extend `<style>` block with `.ltcg-*` rules |
| `goal-assure-ulip-online-sales/web/tests/ltcg_test.js` | Unit tests for the pure helper | Create: Node script using `assert` |

---

## Task 1: Tax math function + tests

**Files:**
- Create: `goal-assure-ulip-online-sales/web/tests/ltcg_test.js`
- Modify: `goal-assure-ulip-online-sales/web/src/calc.js` (add constants near line 10, add function after `validateInputs`)

- [ ] **Step 1.1: Write the failing test file**

Create `goal-assure-ulip-online-sales/web/tests/ltcg_test.js`:

```javascript
import assert from 'node:assert/strict';
import { computeLtcgBenefit } from '../src/calc.js';

// Helper: build a minimal projection stub with just finalFundValue
const proj = (finalFundValue) => ({ finalFundValue });

let passed = 0;
let failed = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  ok  ${name}`);
        passed++;
    } catch (e) {
        console.error(`  FAIL ${name}`);
        console.error(`       ${e.message}`);
        failed++;
    }
}

console.log('computeLtcgBenefit:');

test('returns null when annual premium exceeds 2.5L threshold', () => {
    const result = computeLtcgBenefit(proj(5000000), 250001, 10);
    assert.equal(result, null);
});

test('returns object at exact boundary premium = 2.5L', () => {
    const result = computeLtcgBenefit(proj(5000000), 250000, 10);
    assert.notEqual(result, null);
    assert.equal(result.applicable, true);
});

test('happy path: premium 2L, 10 pay years, 50L final value', () => {
    // totalInvested = 200000 * 10 = 20,00,000
    // totalGain     = 50,00,000 - 20,00,000 = 30,00,000
    // taxableGain   = 30,00,000 - 1,25,000 = 28,75,000
    // hypotheticalLtcg = 28,75,000 * 0.125 = 3,59,375
    const result = computeLtcgBenefit(proj(5000000), 200000, 10);
    assert.equal(result.totalInvested, 2000000);
    assert.equal(result.totalGain, 3000000);
    assert.equal(result.taxableGain, 2875000);
    assert.equal(result.hypotheticalLtcg, 359375);
    assert.equal(result.savings, 359375);
});

test('zero-state: gain is a loss (final < invested)', () => {
    const result = computeLtcgBenefit(proj(100000), 200000, 10);
    assert.equal(result.applicable, true);
    assert.equal(result.totalGain, -1900000);
    assert.equal(result.taxableGain, 0);
    assert.equal(result.hypotheticalLtcg, 0);
    assert.equal(result.savings, 0);
});

test('zero-state: gain under 1.25L exemption', () => {
    // totalInvested = 50000 * 5 = 2,50,000
    // totalGain     = 3,50,000 - 2,50,000 = 1,00,000 (< 1.25L)
    // taxableGain   = 0, hypotheticalLtcg = 0
    const result = computeLtcgBenefit(proj(350000), 50000, 5);
    assert.equal(result.totalGain, 100000);
    assert.equal(result.taxableGain, 0);
    assert.equal(result.savings, 0);
});

test('uses Math.min(pt, ppt) semantics via ppt param', () => {
    // Caller is expected to pass ppt = Math.min(S.pt, S.ppt)
    // Verify the function treats its 3rd arg as the pay-years count
    const result = computeLtcgBenefit(proj(1500000), 100000, 7);
    assert.equal(result.totalInvested, 700000);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
```

- [ ] **Step 1.2: Run the test to verify it fails**

Run:
```bash
cd /c/Users/Diwakar.Adhikari01/Desktop/Calculators/goal-assure-ulip-online-sales && node web/tests/ltcg_test.js
```

Expected: exits with non-zero status. The import of `computeLtcgBenefit` from `../src/calc.js` fails with `SyntaxError` or the call throws "computeLtcgBenefit is not a function" because nothing is exported yet.

- [ ] **Step 1.3: Add constants to `calc.js`**

In `goal-assure-ulip-online-sales/web/src/calc.js`, add these constants immediately after the existing `let mortalityRates = null;` line (around line 10):

```javascript
// LTCG tax comparison constants (Indian tax law, post-July 2024 Union Budget)
const LTCG_PREMIUM_THRESHOLD = 250000;   // ≤ 2.5L → exempt under Section 10(10D)
const LTCG_EXEMPTION_LIMIT   = 125000;   // ₹1.25L per-year LTCG exemption
const LTCG_RATE              = 0.125;    // 12.5% equity LTCG rate
```

- [ ] **Step 1.4: Add the pure function to `calc.js`**

In `goal-assure-ulip-online-sales/web/src/calc.js`, add this function immediately after `validateInputs` (after its closing `}`, approximately line 55):

```javascript
/**
 * Compute LTCG tax benefit — what the user would owe if their ULIP gain
 * came from an equity mutual fund instead. Returns null when annual
 * premium exceeds the 2.5L exemption threshold (Section 10(10D) lost).
 *
 * @param {{finalFundValue: number}} projection - ULIP projection result
 * @param {number} yearlyPremium - Annual premium (₹)
 * @param {number} payYears - Effective pay years: Math.min(pt, ppt)
 * @returns {null | {
 *   applicable: boolean,
 *   totalInvested: number,
 *   totalGain: number,
 *   taxableGain: number,
 *   hypotheticalLtcg: number,
 *   savings: number,
 * }}
 */
export function computeLtcgBenefit(projection, yearlyPremium, payYears) {
    if (yearlyPremium > LTCG_PREMIUM_THRESHOLD) return null;

    const totalInvested = yearlyPremium * payYears;
    const totalGain = projection.finalFundValue - totalInvested;

    if (totalGain <= 0) {
        return {
            applicable: true,
            totalInvested,
            totalGain,
            taxableGain: 0,
            hypotheticalLtcg: 0,
            savings: 0,
        };
    }

    const taxableGain = Math.max(0, totalGain - LTCG_EXEMPTION_LIMIT);
    const hypotheticalLtcg = taxableGain * LTCG_RATE;

    return {
        applicable: true,
        totalInvested,
        totalGain,
        taxableGain,
        hypotheticalLtcg,
        savings: hypotheticalLtcg,
    };
}
```

- [ ] **Step 1.5: Run the test to verify it passes**

Run:
```bash
cd /c/Users/Diwakar.Adhikari01/Desktop/Calculators/goal-assure-ulip-online-sales && node web/tests/ltcg_test.js
```

Expected output:
```
computeLtcgBenefit:
  ok  returns null when annual premium exceeds 2.5L threshold
  ok  returns object at exact boundary premium = 2.5L
  ok  happy path: premium 2L, 10 pay years, 50L final value
  ok  zero-state: gain is a loss (final < invested)
  ok  zero-state: gain under 1.25L exemption
  ok  uses Math.min(pt, ppt) semantics via ppt param

6 passed, 0 failed
```
Exit code: 0.

- [ ] **Step 1.6: Save and move on**

No git commit (project is not a git repo). Verify both files are saved on disk. Move to Task 2.

---

## Task 2: Render helper + slot element in `ui.js`

**Files:**
- Modify: `goal-assure-ulip-online-sales/web/src/ui.js`

- [ ] **Step 2.1: Add the import**

In `goal-assure-ulip-online-sales/web/src/ui.js`, find the existing import line at the top that imports from `./calc.js` (it currently imports `formatCurrency`, `formatCurrencyWhole`, `calculatePremium`, etc.). Add `computeLtcgBenefit` to that import list.

Before (approximate):
```javascript
import { calculatePremium, loadRateData, formatCurrency, formatCurrencyWhole } from './calc.js';
```

After:
```javascript
import { calculatePremium, loadRateData, formatCurrency, formatCurrencyWhole, computeLtcgBenefit } from './calc.js';
```

If the actual import line differs, preserve the existing named imports and append `computeLtcgBenefit` at the end.

- [ ] **Step 2.2: Add the slot element**

In `goal-assure-ulip-online-sales/web/src/ui.js`, find the calculator tab's content area at approximately `ui.js:155`:

```html
                <!-- Content Area -->
                <div class="cards-area">
                    <div id="dashboard-container"></div>

                    <div class="section">
                        <div class="sec-title" style="justify-content:space-between">
```

Insert a new line containing the slot element between `<div id="dashboard-container"></div>` and `<div class="section">`. Result:

```html
                <!-- Content Area -->
                <div class="cards-area">
                    <div id="dashboard-container"></div>

                    <div id="ltcg-benefit-slot"></div>

                    <div class="section">
                        <div class="sec-title" style="justify-content:space-between">
```

- [ ] **Step 2.3: Add `renderLtcgSection()` helper**

In `goal-assure-ulip-online-sales/web/src/ui.js`, add this function immediately after `renderDashboard()` (after its closing `}`, approximately line 485):

```javascript
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
```

- [ ] **Step 2.4: Syntax-check the module**

Run:
```bash
cd /c/Users/Diwakar.Adhikari01/Desktop/Calculators/goal-assure-ulip-online-sales && node -e "import('./web/src/ui.js').then(()=>console.log('ui OK')).catch(e=>{console.error(e.message);process.exit(1)})"
```

Expected: `ui OK` printed, exit code 0.

- [ ] **Step 2.5: Save and move on**

Move to Task 3.

---

## Task 3: Wire `renderLtcgSection()` into `recalc()`

**Files:**
- Modify: `goal-assure-ulip-online-sales/web/src/ui.js`

- [ ] **Step 3.1: Add the call inside `recalc()`**

In `goal-assure-ulip-online-sales/web/src/ui.js`, find the `recalc()` function (around line 423). The current body is:

```javascript
    results = calculatePremium({ ...S, weightedFMC });
    if (!results.success) return;

    renderDashboard();
    renderBITable();
    renderFooter();
    setTimeout(renderChart, 0);
}
```

Add the LTCG render call between `renderDashboard()` and `renderBITable()`:

```javascript
    results = calculatePremium({ ...S, weightedFMC });
    if (!results.success) return;

    renderDashboard();
    renderLtcg();
    renderBITable();
    renderFooter();
    setTimeout(renderChart, 0);
}
```

- [ ] **Step 3.2: Add the `renderLtcg()` wrapper function**

In `goal-assure-ulip-online-sales/web/src/ui.js`, add this function immediately after `renderLtcgSection()` (the helper added in Task 2):

```javascript
function renderLtcg() {
    const slot = document.getElementById('ltcg-benefit-slot');
    if (!slot) return;

    const scenarioKey = S.selectedScenario === 'custom' ? 'custom' : 'scenario' + S.selectedScenario;
    const proj = results.projections[scenarioKey];
    const payYears = Math.min(S.pt, S.ppt);

    const ltcg = computeLtcgBenefit(proj, S.yearlyPremium, payYears);
    slot.innerHTML = renderLtcgSection(ltcg, S.yearlyPremium);
}
```

- [ ] **Step 3.3: Syntax-check the module**

Run:
```bash
cd /c/Users/Diwakar.Adhikari01/Desktop/Calculators/goal-assure-ulip-online-sales && node -e "import('./web/src/ui.js').then(()=>console.log('ui OK')).catch(e=>{console.error(e.message);process.exit(1)})"
```

Expected: `ui OK` printed, exit code 0.

- [ ] **Step 3.4: Re-run the unit tests to confirm nothing regressed**

Run:
```bash
cd /c/Users/Diwakar.Adhikari01/Desktop/Calculators/goal-assure-ulip-online-sales && node web/tests/ltcg_test.js
```

Expected: `6 passed, 0 failed`, exit code 0.

- [ ] **Step 3.5: Save and move on**

Move to Task 4.

---

## Task 4: Add CSS styles

**Files:**
- Modify: `goal-assure-ulip-online-sales/web/index.html`

- [ ] **Step 4.1: Locate insertion point**

In `goal-assure-ulip-online-sales/web/index.html`, find the existing `.fp-contrib-meta` rules (added in an earlier session — approximately around the end of the `<style>` block before the media query). The `.ltcg-*` rules will be inserted immediately after the last `.fp-contrib-*` rule, before the `@media (max-width: 900px)` block.

- [ ] **Step 4.2: Insert the LTCG styles**

Add this CSS block immediately after the `.fp-contrib-meta .red` rule (or equivalent last `.fp-contrib-*` rule) in `goal-assure-ulip-online-sales/web/index.html`:

```css
    /* LTCG Tax Benefit Section */
    .ltcg-benefit {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: var(--r);
      box-shadow: var(--shadow-card);
      padding: 22px;
      margin-bottom: 20px;
    }
    .ltcg-head {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border);
    }
    .ltcg-head .material-icons-outlined {
      color: var(--bajaj-blue);
      font-size: 22px;
    }
    .ltcg-head h3 {
      font-size: 15px;
      font-weight: 700;
      color: var(--t1);
      margin: 0;
    }
    .ltcg-badge {
      margin-left: auto;
      background: #ecfdf5;
      color: #0d9f6e;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .ltcg-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    .ltcg-stat {
      padding: 12px 14px;
      border-radius: 10px;
      background: var(--input);
      border: 1px solid var(--border);
    }
    .ltcg-stat.highlight {
      background: #fff8f3;
      border-color: var(--bajaj-orange);
    }
    .ltcg-stat label {
      font-size: 10px;
      color: var(--t3);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .ltcg-val {
      font-size: 20px;
      font-weight: 800;
      color: var(--t1);
      margin-top: 4px;
    }
    .ltcg-val.green { color: #0d9f6e; }
    .ltcg-val.red   { color: #dc2626; }
    .ltcg-sub {
      font-size: 10px;
      color: var(--t3);
      margin-top: 2px;
    }
    .ltcg-fine {
      font-size: 10px;
      color: var(--t3);
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px dashed var(--border);
      line-height: 1.5;
    }
    .ltcg-zero {
      font-size: 12px;
      color: var(--t2);
      padding: 14px;
      background: var(--input);
      border-radius: 10px;
      margin-top: 12px;
      line-height: 1.5;
    }
```

- [ ] **Step 4.3: Add responsive collapse rule**

In `goal-assure-ulip-online-sales/web/index.html`, find the existing `@media (max-width: 900px)` block (approximately line 389-395 in the current file). Add an additional media block for the LTCG grid immediately after that existing block:

```css
    @media (max-width: 640px) {
      .ltcg-grid { grid-template-columns: 1fr; }
      .ltcg-head { flex-wrap: wrap; }
      .ltcg-badge { margin-left: 0; }
    }
```

- [ ] **Step 4.4: Save and move on**

No syntax-checkable output here (plain CSS inside HTML). Move to Task 5.

---

## Task 5: End-to-end manual verification

**Files:** none (verification only)

- [ ] **Step 5.1: Start the dev server**

Run in the project root:
```bash
cd /c/Users/Diwakar.Adhikari01/Desktop/Calculators/goal-assure-ulip-online-sales && npm run dev
```

Expected: Vite prints a local URL (typically `http://localhost:5173`). Open it in a browser, hard-refresh (Ctrl+F5) to load new CSS.

- [ ] **Step 5.2: Verify happy path**

On the BI Calculator tab, set:
- Annual Premium: `200000`
- Policy Term (PT): `20`
- Pay Term (PPT): `10`
- Scenario: `8%`

Expected:
- New "Tax Benefit — LTCG Savings" section appears between the dashboard and the Benefit Illustration table.
- Green "Exempt u/s 10(10D)" pill is visible in the header.
- Four stat tiles render with non-zero Total Invested (₹20,00,000), non-zero Maturity Gain, non-zero LTCG (red), non-zero "You Save" (green).
- Fine-print text at the bottom references the ₹2.5L limit.

- [ ] **Step 5.3: Verify T1 — hide when premium > 2.5L**

Change Annual Premium to `250001`.

Expected: The entire Tax Benefit section disappears. Only dashboard and BI table remain.

Change Annual Premium back to `250000` (exact boundary).

Expected: The section reappears.

- [ ] **Step 5.4: Verify zero-state for gain under exemption**

Set:
- Annual Premium: `50000`
- PT: `5`
- PPT: `5`
- Scenario: `4%`

Expected: The Tax Benefit header and badge render, but instead of the stat grid you see the `.ltcg-zero` message "Maturity gain falls within the ₹1.25L LTCG exemption — no tax would apply even under equity mutual-fund taxation."

- [ ] **Step 5.5: Verify zero-state for a loss**

Keep the same inputs, switch scenario to `Custom` and drag the rate to `0%`.

Expected: Because `finalFundValue < totalInvested` after charges, the zero-state message renders (same as Step 5.4).

- [ ] **Step 5.6: Verify scenario toggling updates the numbers**

Premium `200000`, PT `20`, PPT `10`. Toggle 4% → 8% → Custom (10%) sequentially.

Expected: Every stat tile in the Tax Benefit section updates live for each scenario. No stale numbers.

- [ ] **Step 5.7: Verify PPT shorter than PT edge case**

Set Premium `100000`, PT `20`, PPT `7`.

Expected: "Total Invested" reads ₹7,00,000 (not ₹20,00,000). Matches the BI table's total premium paid column.

- [ ] **Step 5.8: Verify responsive collapse**

Open DevTools and shrink the viewport to 600px wide.

Expected: The four stat tiles collapse to a single column. The "Exempt u/s 10(10D)" badge wraps to a new line under the heading.

- [ ] **Step 5.9: Verify no blue-footer overlap**

Scroll to the bottom of the content area.

Expected: The Tax Benefit section sits above the BI table, which sits above the Options & Riders section. None of them are clipped by the fixed `.bottom` blue footer.

- [ ] **Step 5.10: Verify Fund Performance tab untouched**

Click the Fund Performance nav tab.

Expected: No LTCG section appears. The fund-performance UI behaves exactly as before (the feature is BI-tab scoped).

- [ ] **Step 5.11: Stop the dev server**

`Ctrl+C` in the terminal running `npm run dev`.

---

## Self-Review

Running through the spec section by section:

- **§1 Goal:** covered by Tasks 1-4 (math + UI + wiring + styles).
- **§2 Background:** purely context, no task needed.
- **§3 Decisions (A, X, P2, S1, T1):** A/X encoded in Task 1 (LTCG formula on ULIP's own gain at 12.5% / ₹1.25L). P2 encoded in Task 2.2 (slot placement). S1 encoded in Task 3.2 (uses `S.selectedScenario` → `scenarioKey`). T1 encoded in Task 1.4 (function returns `null` when premium > 2.5L).
- **§4 Architecture:** three files touched, no new files except the new test file — matches Tasks 1-4.
- **§5 Calculation:** Task 1 implements constants and function exactly as specified, with the `Math.min(pt, ppt)` fix lifted to the caller (Task 3.2) and the function taking `payYears` directly so it stays pure.
- **§6 UI markup + styling:** Task 2 renders the markup, Task 4 adds the CSS. `.ltcg-zero` and `.ltcg-fine` both present.
- **§7 Wiring:** Task 3 adds `renderLtcg()` invocation in `recalc()` after `renderDashboard()`.
- **§8 Testing:** manual checklist implemented as Task 5.1-5.10; spec steps 1-9 map to Task 5 steps 5.2-5.10 in the same order. Unit coverage for the pure function is added in Task 1 (not in the original spec, but a no-cost addition since `tests/excel_match_test.js` already establishes the pattern).
- **§9 Out of scope:** explicitly not planned. Confirmed nothing in the plan accidentally adds them.
- **§10 File summary:** matches the plan's File Structure table.

**Placeholder scan:** none — every step contains complete code, exact commands, and expected output.

**Type consistency:** function is named `computeLtcgBenefit` in all four places (`calc.js` export, `ui.js` import, `ui.js` call, test file import). Return shape (`applicable`, `totalInvested`, `totalGain`, `taxableGain`, `hypotheticalLtcg`, `savings`) is used consistently in the test assertions (Task 1.1), the renderer (Task 2.3), and the wrapper (Task 3.2). The renderer's 2nd parameter `yearlyPremium` matches the caller in Task 3.2.

**Commit policy:** repo is not a git repo; "commit" steps are omitted in favour of "save and move on". Called out in the header.
