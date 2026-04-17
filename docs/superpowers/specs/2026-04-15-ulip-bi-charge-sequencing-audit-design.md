# ULIP BI Charge-Sequencing Audit — Design Spec

**Date:** 2026-04-15
**Project:** `goal-assure-ulip-online-sales`
**Source of truth:** `BI_Goal Assure IV_V01_ver18.xlsb`
**System Under Test:** `web/src/calc.js` → `calculateULIPProjection()`

---

## 1. Goal

Audit the monthly charge-sequencing in `calc.js::calculateULIPProjection` against the Excel BI sheets `Scenario1` (4% growth) and `Scenario2_R` (8% growth), and fix each deviation in `calc.js` until the JS output matches Excel within tolerance, for a fixed reference input scenario.

The deliverable is **corrected `calc.js`** plus a permanent parity test that locks in the match for future regressions.

---

## 2. Background

The project calculates ULIP Benefit Illustrations in the browser via a month-by-month loop in `calc.js`. The authoritative reference is an Excel workbook with `Scenario1` and `Scenario2_R` sheets that compute the same projection row-by-row. An existing smoke test (`excel_match_test.js`) runs the JS engine and prints numbers but does not actually compare them to Excel. Visual inspection of `calc.js` already reveals real bugs (PAC hardcoded to 0, mortality using an ad-hoc curve, unclear charge order) that are almost certainly causing the two to disagree.

## 3. Reference Input Fixture

The audit uses a single fixed input scenario, matching the one already used by `excel_match_test.js`:

| Field | Value |
|---|---|
| Age | 28 |
| Gender | Male |
| Smoker | Non Smoker |
| Yearly Premium | ₹10,00,000 |
| Mode | Annual |
| Policy Term (PT) | 20 |
| Premium Pay Term (PPT) | 10 |
| Sum Assured Factor | 10× (→ SA = ₹1 Cr) |
| Channel | web |
| Fund Allocation | 50% Equity Growth Fund II, 50% Bond Fund |
| Riders | none (ADB / CI / Care Plus all off) |

**Invariant:** the Excel workbook's `Input` sheet must be set to this exact scenario when the extraction script runs. If not, the script must detect the mismatch and exit non-zero with a clear error. (Rationale: Excel's BI tabs are live formulas driven off `Input`; extracting against a different input scenario would silently produce a wrong reference.)

---

## 4. Excel Source Sheet Layout

Confirmed from inspection of `Scenario1` (rows 6, 9–25):

| Col | Header | Notes |
|---|---|---|
| B | Year | 1..20 |
| C | Month | 0..11 — **month 0 is the year-start state**, after the annual premium is added and year-start charges are applied |
| D | Age of Life Assured | Increments yearly |
| G | Premium Payment | Non-zero only at month 0, year ≤ PPT |
| H | Premium Allocation Rate | 1.0 = full allocation (no charge), 0.985 = 1.5% charge, etc. |
| I | Premium Net of Allocation charges (incl of ST) | = G × H |
| J | Unit Price at month start | Compounds monthly at the scenario rate |
| K | No. of Accum. Units | Increases with net premium, decreases with charge-unit deductions |
| L–P | Charges for ADB / APTPDB / CI / FIB / WOP (units) | Zero for this fixture (no riders) |
| Q | Sum at Risk Death Benefit Prim Life | = max(0, SA − fundValue) |
| R | Sum at Risk Death Benefit Spouse | 0 for this fixture |
| S | Mortality Charge Prim Life (units) | Charged monthly |
| T | Mortality Charge Spouse (units) | 0 for this fixture |

**Columns beyond T** (PAC, FMC, Unit Price End, closing fund value, etc.) exist but were not visible in the first 20-column inspection. The extractor must scan the full header row and locate them by text match (see §5.1). The spec does not hard-code column letters beyond T because header column positions are not yet verified.

### 4.1 Key observations from Year 1 data

- Row 9 (Year 1, Month 0): Premium = ₹10L, Alloc Rate = **1.0** (i.e., no allocation charge at year 1 for web/10L), Unit Price = 10.0, Accum Units = 100,000, SA at Risk = ₹90L, Mortality Charge (units) = 70.65.
- Rows 10–20 (Year 1, Months 1–11): Premium = 0, Unit Price slowly grows (10.021, 10.043, ...), Accum Units slowly decreases (99,879 → 98,687) as mortality+FMC units are deducted, SA at Risk drifts upward as fund value drifts down net of charges.
- Row 21 (Year 2, Month 0): Premium = ₹10L, Unit Price = 10.26, Accum Units jumps to 196,030. This confirms the next year's premium is credited **at month 0 after unit price compounding from the previous month 11**.

Implication: Excel's accounting model is **unit-based** — the fund is `accumUnits × unitPrice`, unit price compounds at the scenario rate, charges are converted to unit-count deductions at the current unit price, and premium is added by buying new units at the current unit price. `calc.js` models the fund as a single rupee total that compounds directly. For a pure growth-then-charge sequence these are mathematically equivalent in continuous time, but with discrete monthly steps and charge deductions in between, the order and timing can produce different rupee answers.

---

## 5. Architecture

Three artifacts, one direction of data flow:

```
BI_Goal Assure IV_V01_ver18.xlsb
          │
          ▼  (one-shot, committed to repo)
scripts/extract_bi_reference.py
          │
          ▼
web/tests/fixtures/bi_reference.json
          │
          ▼  (loaded per test run)
web/tests/bi_parity_test.js  ◄── web/src/calc.js (SUT)
          │
          ▼
PASS / FAIL diff report
```

### 5.1 Extractor — `scripts/extract_bi_reference.py`

- Opens the xlsb via `pyxlsb.open_workbook`.
- Reads the `Input` sheet and asserts that the input scenario matches the fixture in §3 — exits non-zero with a diff message if not.
- For each scenario sheet (`Scenario1` → `"4"`, `Scenario2_R` → `"8"`):
  - Reads the header row to locate columns by **exact header text match** (not by column letter), producing a map `{"year": "B", "month": "C", "netPremium": "I", "unitPrice": "J", "accumUnits": "K", "mortalityUnits": "S", ...}`.
  - Also locates PAC, FMC, and closing fund value columns by header-text contains-match (`"pac"`, `"policy admin"`, `"fmc"`, `"fund management"`, `"fund value"`, etc.).
  - Walks data rows — detected as rows where the Year column holds a numeric value — extracting year, month, and every located column as a float. (Does not hard-code row numbers; header/data boundary is discovered.)
  - Converts unit-valued columns to rupee-valued counterparts using `unitPrice`: `mortalityRs = mortalityUnits × unitPrice`. Emits both unit and rupee values in the JSON so the parity test can compare at whichever granularity is most informative.
  - Aggregates per year: total premium paid, total allocation charge, total PAC, total FMC, total mortality charge, fund value at year end.
- Writes `web/tests/fixtures/bi_reference.json` (structure in §5.3).
- Exits 0 on success, prints a one-line summary (`"extracted 20 years × 2 scenarios × 12 months"`).

### 5.2 Parity Test — `web/tests/bi_parity_test.js`

- Loads `bi_reference.json`.
- Loads calc rate data (`loadRateData()` pattern copied from `excel_match_test.js`).
- For each scenario (`"4"`, `"8"`):
  - Calls `calculatePremium(fixtureInputs)`, picks the corresponding `projections.scenario4` / `projections.scenario8`.
  - For each year in the reference's `yearly` array, compares these fields against `proj.yearlyDetails[year-1]`:
    - `premiumPaid`
    - `allocationCharge`
    - `pac`
    - `fmc`
    - `mortality`
    - `fundAtEnd`
  - Tolerance rule: `abs(actual - expected) <= max(1, abs(expected) * 0.0001)` (₹1 absolute OR 0.01% relative, whichever is larger).
- On any failure prints: `Scenario 4%, Year 3: fmc expected 18421.11, got 18374.44 (diff 46.67)`.
- Prints `N passed, M failed` and exits 0/1.

The test does NOT compare month-level rows in v1 — only year totals. Rationale: `calc.js` only exposes `yearlyDetails`, and adding month-level exposure is out of scope for the sequencing audit. Month-level comparison is a follow-up if year totals match but we still suspect intra-year drift.

### 5.3 Fixture JSON schema

```json
{
  "metadata": {
    "source": "BI_Goal Assure IV_V01_ver18.xlsb",
    "extractedAt": "2026-04-15",
    "inputs": {
      "age": 28, "gender": "Male", "smoker": "Non Smoker",
      "yearlyPremium": 1000000, "pt": 20, "ppt": 10, "saFactor": 10,
      "channel": "web", "mode": "Annual",
      "fundAllocations": { "Equity Growth Fund II": 50, "Bond Fund": 50 }
    }
  },
  "scenarios": {
    "4": {
      "sourceSheet": "Scenario1",
      "yearly": [
        {
          "year": 1,
          "premiumPaid": 1000000,
          "allocationCharge": 0,
          "pac": 0,
          "fmc": 0,
          "mortality": 0,
          "fundAtEnd": 0
        }
      ],
      "monthly": [
        {
          "year": 1, "month": 0,
          "unitPrice": 10.0, "accumUnits": 100000,
          "fundValue": 1000000, "saAtRisk": 9000000,
          "mortalityUnits": 70.65, "mortalityRs": 706.5
        }
      ]
    },
    "8": {
      "sourceSheet": "Scenario2_R",
      "yearly": [],
      "monthly": []
    }
  }
}
```

Exact numeric values above are placeholders — the extractor populates them from Excel.

---

## 6. Known Problems in `calc.js` (to be fixed against the parity test)

Located by inspection of `web/src/calc.js`:

| # | Line | Problem |
|---|---|---|
| P1 | 181 | `let pacFixed = 0` — Policy Administration Charge hardcoded to zero regardless of policy month. |
| P2 | 177–180 | PAC lookup logic is confused about % vs ₹ (comments: `"PAC is usually fixed Rs amount, wait, let's treat it as fixed or percentage"`) — must resolve against Excel. |
| P3 | 196 | Mortality uses `approxMortalityRateAnnual = 0.001 * Math.pow(1.05, currentAge - 20)` — an ad-hoc curve. Should read from `mortalityRates` table (declared at L10 but apparently never populated in the loop). |
| P4 | 173 | Premium is added in **month 1**; Excel shows premium in **month 0** (year-start state). Off-by-one in sequencing. |
| P5 | 186–199 | Order is: `premium → PAC → growth → FMC → mortality`. Excel's order is TBD from the extractor but mortality charge in Excel appears at month 0 (before any growth), suggesting: `premium → alloc → charges-at-month-start → growth`. Must match Excel. |
| P6 | 160–164 | Allocation rule lookup: `matchingAllocRule = allocRules.find(r => r.minPremium <= yearlyPremium) || allocRules[0]`. Needs verification against Excel column H for this fixture (Year 1 Month 0 shows 1.0 → no charge). |
| P7 | 132 | `monthlyFMC = avgFMCAnnual / 12` — straight division. Excel may use daily compounded FMC or end-of-month valuation; verify via test. |
| P8 | calc.js top | `mortalityRates = null` is declared but I don't see a loader populating it from a JSON file. If `loadRateData` doesn't fetch mortality, that must be fixed first. |

These are **expected** to surface as parity-test failures. The implementation plan will address them one at a time, root-cause-first.

---

## 7. Fix Strategy (for the implementation plan to sequence)

After the parity test is in place and failing, fixes proceed one line-item at a time, highest-impact first:

1. **Load mortality table** — confirm/write a loader in `calc.js` (mirroring `loadRateData`) that populates `mortalityRates` from an extracted JSON. If no such JSON exists in `public/`, add it to `extract_all.py`.
2. **Wire mortality into the loop** — replace the ad-hoc curve with a table lookup by `(gender, smoker, currentAge)`.
3. **Fix PAC** — locate the PAC table in the `Charges` sheet (or wherever Excel keeps it), extract to `charges.json`, apply in `calc.js` with the right units (% of premium vs fixed ₹ — answered by the extraction).
4. **Fix allocation rate** — verify column H for year 1 of the fixture; fix `matchingAllocRule` lookup if it disagrees.
5. **Fix charge sequencing** — reorder the monthly loop to mirror Excel's month-0 semantics (premium + charges at year start, growth over the month, next month's charges against grown value).
6. **Fix FMC timing** — if remaining residual after the above, investigate FMC averaging/compounding.

Each fix is verified by re-running the parity test. Fix proceeds only when the current failing line item goes green without breaking any line item already green.

---

## 8. Out of Scope

- Rider calculations (ADB, CI, Care Plus). If a rider rate lookup is wrong it won't affect this audit because the fixture has all riders off. Rider parity is a separate spec.
- GST on premiums or riders.
- Surrender value, reduction in yield, and IRR columns in Excel.
- Scenario Custom (not present in Excel as a BI tab).
- `Scenario1(SPW)` and `Scenario2_R(SPW)` — Single Premium Wealth variant, separate audit.
- UI changes. The BI table in `ui.js` may continue to display whatever `calc.js` returns; its rendering is unchanged by this audit.
- Refactoring `calc.js` into smaller units. Tempting, but a focused sequencing audit is a better place to fix bugs than a refactor.

---

## 9. Acceptance Criteria

1. `python scripts/extract_bi_reference.py` runs cleanly against the repo's `.xlsb`, produces `web/tests/fixtures/bi_reference.json`, exits 0.
2. `node web/tests/bi_parity_test.js` runs, exits 0, reports all 20 years for both scenarios within tolerance.
3. `node web/tests/ltcg_test.js` still passes (6/6).
4. `node web/tests/excel_match_test.js` still runs without crashing (it's an output-dump test, no assertions to break).
5. `npm run dev` starts the UI; BI Calculator tab renders the year-by-year Benefit Illustration table and the LTCG section without JS errors.
6. `calc.js` no longer contains the comments `"stick to 0 for simplicity if uncertain"` or `"Dummy curve mimicking mortality"`.

---

## 10. File Summary

| File | Change |
|---|---|
| `scripts/extract_bi_reference.py` | Create |
| `web/tests/fixtures/bi_reference.json` | Create (committed fixture) |
| `web/tests/bi_parity_test.js` | Create |
| `web/src/calc.js` | Modify (fix P1–P8 as parity test fails reveal) |
| `web/public/mortality_rates.json` | Possibly create (if §7 step 1 finds it missing) |
| `scripts/extract_all.py` | Possibly modify (if PAC/mortality tables not already extracted) |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Excel `Input` sheet currently holds a different scenario than the fixture | Medium | Extractor asserts, prints the mismatch, exits non-zero. User updates Input in Excel, saves, re-runs extractor. |
| PAC/FMC column headers don't match the strings I'll grep for | Medium | Extractor dumps all header strings on first run for manual verification; failure mode is a loud error, not silent wrong data. |
| Matching Excel to the rupee requires switching `calc.js` to a units-based internal model | Low-Medium | If per-year totals don't converge within tolerance after steps 1–6, declare it and open a follow-up spec for a unit-based rewrite. Don't expand scope mid-audit. |
| Mortality rates JSON doesn't exist; `extract_all.py` needs extending | Medium | Accept the scope bleed — add one function to `extract_all.py`, mirror the existing pattern (APR/CI extractors). |
| `pyxlsb` can't read the sheet at all on this machine | Low | Already verified working via `find_sheets.py` and the inline test in §4. |

---

## 12. Self-Review Notes

- **Scope check:** single focused audit, one fixture, two scenarios, year-level parity. Decomposable into ~5 implementation tasks (extractor, test harness, mortality table, PAC fix, sequencing fix).
- **Placeholder scan:** fixture JSON values in §5.3 are explicitly labeled placeholders; the extractor populates them. No other TBDs.
- **Ambiguity check:** §5.2 tolerance rule and §9 acceptance criteria are both quantitative and testable. "Match Excel" is operationalized as "parity test green."
- **Internal consistency:** §3 fixture matches §5.3 metadata matches §6 line references matches §10 file list. §6 bugs map 1:1 to §7 fix order.
- **YAGNI:** no month-level comparison in v1, no UI changes, no refactoring, no rider work, no SPW variant.
