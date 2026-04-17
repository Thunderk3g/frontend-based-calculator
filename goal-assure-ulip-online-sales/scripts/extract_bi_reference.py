"""
Extract Benefit Illustration reference data from the Goal Assure IV xlsb
workbook for the parity audit. Writes web/tests/fixtures/bi_reference.json.

Fixture (must match Excel Input sheet):
  Age 28, Male, Non Smoker, Yearly Premium 10,00,000, Annual mode,
  PT=20, PPT=10, SA Factor 10x, Channel=web, 100% Nifty 500 Low Volatility 50 Index Fund.

Exits non-zero if the Input sheet does not match this scenario.
"""
import json
import os
import sys
import pyxlsb

XLSB_PATH = os.path.join(os.path.dirname(__file__), '..', 'BI_Goal Assure IV_V01_ver18.xlsb')
OUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'web', 'tests', 'fixtures', 'bi_reference.json')
MORT_OUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'web', 'public', 'mortality_rates.json')
CHARGES_OUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'web', 'public', 'charges.json')

EXPECTED_INPUTS = {
    'age': 28,
    'gender': 'M',
    'yearlyPremium': 1000000.0,
    'pt': 20.0,
    'ppt': 10.0,
    'saFactor': 10.0,
    'fund': 'Nifty 500 Low Volatility 50 Index Fund',
    'fundAllocation': 1.0,
}


def to_num(v):
    try:
        if v is None or v == '':
            return 0.0
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def verify_input_sheet(wb):
    with wb.get_sheet('Input') as sh:
        rows = list(sh.rows())

    def cell(row_idx, col_idx):
        if row_idx >= len(rows):
            return None
        for c in rows[row_idx]:
            for idx, col in enumerate(rows[row_idx]):
                pass
        return None

    lookup = {}
    for r_idx, row in enumerate(rows):
        vals = {c_idx: c.v for c_idx, c in enumerate(row) if c.v is not None}
        lookup[r_idx] = vals

    gender = lookup.get(16, {}).get(3)
    age = to_num(lookup.get(17, {}).get(3))
    prem = to_num(lookup.get(20, {}).get(3))
    pt = to_num(lookup.get(23, {}).get(3))
    ppt = to_num(lookup.get(25, {}).get(3))
    sa_factor = to_num(lookup.get(39, {}).get(3))
    nifty_500_lv_alloc = to_num(lookup.get(83, {}).get(3))

    problems = []
    if int(age) != EXPECTED_INPUTS['age']:
        problems.append(f"age: expected {EXPECTED_INPUTS['age']}, got {age}")
    if gender != EXPECTED_INPUTS['gender']:
        problems.append(f"gender: expected {EXPECTED_INPUTS['gender']}, got {gender!r}")
    if prem != EXPECTED_INPUTS['yearlyPremium']:
        problems.append(f"yearlyPremium: expected {EXPECTED_INPUTS['yearlyPremium']}, got {prem}")
    if pt != EXPECTED_INPUTS['pt']:
        problems.append(f"pt: expected {EXPECTED_INPUTS['pt']}, got {pt}")
    if ppt != EXPECTED_INPUTS['ppt']:
        problems.append(f"ppt: expected {EXPECTED_INPUTS['ppt']}, got {ppt}")
    if sa_factor != EXPECTED_INPUTS['saFactor']:
        problems.append(f"saFactor: expected {EXPECTED_INPUTS['saFactor']}, got {sa_factor}")
    if abs(nifty_500_lv_alloc - 1.0) > 1e-6:
        problems.append(
            f"fundAllocation: Input sheet expects 100% Nifty 500 Low Volatility 50 Index Fund, "
            f"got {nifty_500_lv_alloc}"
        )
    if problems:
        print("ERROR: Input sheet fixture does not match expected:", file=sys.stderr)
        for p in problems:
            print("  - " + p, file=sys.stderr)
        sys.exit(1)


def extract_scenario(wb, sheet_name, growth_rate):
    """Extract yearly totals. Columns (0-indexed, detected from header row 7):
    1=Year 2=Month 3=Age 6=PremPayment 7=AllocRate 8=NetPrem
    9=UnitPriceStart 10=UnitsAfterNetPrem 16=SARPrim 18=MortalityUnits
    23=PACUnits 24=UnitsAfterAllDed 25=FundAfterDedBeginMonth
    27=FundEndMonth 29=LoyaltyAddRs 30=FundBoosterRs
    """
    with wb.get_sheet(sheet_name) as sh:
        rows = list(sh.rows())

    yearly = {}
    fmc_monthly = 0.0135 / 12
    monthly_growth = (1 + growth_rate) ** (1 / 12) - 1

    for row in rows:
        vals = {c_idx: c.v for c_idx, c in enumerate(row) if c.v is not None}
        if 1 not in vals or 2 not in vals:
            continue
        y_raw, m_raw = vals[1], vals[2]
        if not isinstance(y_raw, (int, float)) or not isinstance(m_raw, (int, float)):
            continue
        yr, mo = int(y_raw), int(m_raw)
        if yr < 1 or yr > 30:
            continue
        if mo < 0 or mo > 11:
            continue

        if yr not in yearly:
            yearly[yr] = {
                'year': yr,
                'age': int(to_num(vals.get(3))),
                'premiumPaid': 0.0,
                'allocationCharge': 0.0,
                'pac': 0.0,
                'fmc': 0.0,
                'mortality': 0.0,
                'loyaltyAddition': 0.0,
                'fundBooster': 0.0,
                'fundAtEnd': 0.0,
                'fundAtEndExcludingLoyalty': 0.0,
            }
        y = yearly[yr]

        prm = to_num(vals.get(6))
        alloc_r = to_num(vals.get(7)) or 1.0
        upc = to_num(vals.get(9))
        pac_units = to_num(vals.get(23))
        mort_units = to_num(vals.get(18))
        fund_after_ded_begin = to_num(vals.get(25))
        fund_end_month = to_num(vals.get(27))
        la_rs = to_num(vals.get(29))
        fb_rs = to_num(vals.get(30))

        y['premiumPaid'] += prm
        y['allocationCharge'] += prm * (1 - alloc_r)
        y['pac'] += pac_units * upc
        y['mortality'] += mort_units * upc
        y['loyaltyAddition'] += la_rs
        y['fundBooster'] += fb_rs
        y['fmc'] += fund_after_ded_begin * (1 + monthly_growth) * fmc_monthly

        if mo == 11:
            # Excel col 27 at M11 is the fund before the year-end loyalty
            # credit is applied; calc.js's yearly fundAtEnd reports the
            # post-credit value (LA + FB already added).
            y['fundAtEnd'] = fund_end_month + y['loyaltyAddition'] + y['fundBooster']
            y['fundAtEndBeforeCredits'] = fund_end_month

    return [yearly[yr] for yr in sorted(yearly.keys())]


def extract_mortality_rates(wb):
    with wb.get_sheet('Charges') as sh:
        rows = list(sh.rows())
    rates = {'male': {}, 'female': {}}
    for row in rows:
        vals = {c_idx: c.v for c_idx, c in enumerate(row) if c.v is not None}
        age = vals.get(1)
        if not isinstance(age, (int, float)):
            continue
        if age < 0 or age > 120:
            continue
        male = vals.get(2)
        female = vals.get(3)
        if isinstance(male, (int, float)) and isinstance(female, (int, float)):
            if int(age) not in rates['male']:
                rates['male'][int(age)] = float(male)
                rates['female'][int(age)] = float(female)
    return rates


def extract_pac_monthly_rs(wb):
    """The Scenario sheets reveal PAC is flat ₹500/month years 1-10 then ₹0.
    Rather than re-derive a formula, read one month per year from Scenario1.
    """
    pac = {}
    with wb.get_sheet('Scenario1') as sh:
        rows = list(sh.rows())
    for row in rows:
        vals = {c_idx: c.v for c_idx, c in enumerate(row) if c.v is not None}
        y_raw, m_raw = vals.get(1), vals.get(2)
        if not isinstance(y_raw, (int, float)) or not isinstance(m_raw, (int, float)):
            continue
        if int(m_raw) != 0:
            continue
        yr = int(y_raw)
        upc = to_num(vals.get(9))
        pac_units = to_num(vals.get(23))
        pac[str(yr)] = round(pac_units * upc, 2)
    return pac


def update_charges_json(pac_monthly_rs):
    with open(CHARGES_OUT_PATH, 'r') as f:
        charges = json.load(f)
    charges['pac_monthly_rs'] = pac_monthly_rs
    # Loyalty addition & fund booster rates (applied at year end against
    # the average of the last 36 month-end fund values). Extracted from
    # the Charges sheet "Loyalty Addition" table.
    charges['loyalty_addition'] = {'10': 0.01, '15': 0.015, '20': 0.02}
    charges['fund_booster'] = {'20': 0.02}
    with open(CHARGES_OUT_PATH, 'w') as f:
        json.dump(charges, f, indent=2)


def main():
    if not os.path.exists(XLSB_PATH):
        print(f"ERROR: workbook not found at {XLSB_PATH}", file=sys.stderr)
        sys.exit(1)

    with pyxlsb.open_workbook(XLSB_PATH) as wb:
        verify_input_sheet(wb)
        s1 = extract_scenario(wb, 'Scenario1', 0.04)
        s2 = extract_scenario(wb, 'Scenario2_R', 0.08)
        mortality = extract_mortality_rates(wb)
        pac_monthly_rs = extract_pac_monthly_rs(wb)

    out = {
        'metadata': {
            'source': 'BI_Goal Assure IV_V01_ver18.xlsb',
            'extractedAt': '2026-04-15',
            'inputs': {
                'age': 28, 'gender': 'Male', 'smoker': 'Non Smoker',
                'yearlyPremium': 1000000, 'pt': 20, 'ppt': 10, 'saFactor': 10,
                'channel': 'web', 'mode': 'Annual',
                'fundAllocations': {'Nifty 500 Low Volatility 50 Index Fund': 100},
            },
            'toleranceNote': 'Charges compared within max(1, 0.01% of expected). '
                             'Fund values compared excluding loyalty additions and fund booster.',
        },
        'scenarios': {
            '4': {'sourceSheet': 'Scenario1', 'yearly': s1},
            '8': {'sourceSheet': 'Scenario2_R', 'yearly': s2},
        },
    }

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, 'w') as f:
        json.dump(out, f, indent=2)

    with open(MORT_OUT_PATH, 'w') as f:
        json.dump(mortality, f, indent=2)

    update_charges_json(pac_monthly_rs)

    print(f"Extracted {len(s1)} years x 2 scenarios to {OUT_PATH}")
    print(f"Wrote mortality table to {MORT_OUT_PATH}")
    print(f"Updated PAC monthly Rs in {CHARGES_OUT_PATH}")


if __name__ == '__main__':
    main()
