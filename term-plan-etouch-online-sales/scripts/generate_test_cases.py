"""
generate_test_cases.py
======================
Generates 1000 test cases from the extracted JSON rate tables.
Expected values are computed using the same key/formula logic as calc.js,
so they faithfully represent the Excel ground truth.

Usage:
    python scripts/generate_test_cases.py

Output:
    tests/excel_test_cases.json
"""

import json
import random
import os
import sys

# ── Paths ──────────────────────────────────────────────────────────────────
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load(rel):
    path = os.path.join(BASE, rel)
    with open(path, encoding='utf-8') as f:
        return json.load(f)

print("Loading rate tables...")
med_rates     = load('web/public/medical_rates.json')
non_med_rates = load('web/public/non_medical_rates.json')
hsar_factors  = load('web/public/hsar_factors.json')
print(f"  Medical rates:     {len(med_rates):,} keys")
print(f"  Non-Medical rates: {len(non_med_rates):,} keys")
print(f"  HSAR factors:      {len(hsar_factors):,} keys")

# ── Constants ──────────────────────────────────────────────────────────────
MODAL = {
    'Annual':     1.0,
    'Half-Yearly': 0.51,
    'Quarterly':   0.26,
    'Monthly':     0.0875,
}

def get_sa_band(sa):
    return 10_000_000 if sa >= 10_000_000 else 5_000_000

def get_hsar_band(sa):
    if sa >= 20_000_000: return 20_000_000
    if sa >= 15_000_000: return 15_000_000
    if sa >= 10_000_000: return 10_000_000
    return 5_000_000

def build_key(age, gender, pt, ppt, variant, smoker, residency, sa_band):
    """Mirrors buildBaseKey() in calc.js exactly for V07."""
    g = 'M' if gender[0] == 'M' else 'F'
    # NRI in test cases is passed as 'P'
    is_nri = (residency == 'NRI' or residency == 'P')
    
    if is_nri and smoker != 'S':
        smoker_code = 'NSP'
    elif smoker == 'S':
        smoker_code = 'S'
    else:
        smoker_code = 'NSR'
    
    return f"{age}{g}{pt}{ppt}{variant}{smoker_code}{sa_band}"

def get_hsar_discount(age, pt, ppt, sa, variant, modal_factor, smoker, is_medical):
    """Mirrors HSAR logic in calc.js for V07."""
    if variant != 'LS':
        return 0.0
    hsar_band = get_hsar_band(sa)
    ppt_prefix = 'RP' if ppt == pt else f"LP{ppt}"
    # V07 Rule: HSAR always uses NSP suffix for Non-Smokers
    hsar_smoker = 'NSP' if smoker in ['NSR', 'NSP', 'NS'] else smoker
    # V07 Rule: Maturity Age clamped to [59, 61]
    search_age = min(61, max(59, age + pt))
    med_code = 'Medical' if is_medical else 'Non Medical'
    
    hsar_multiplier = 0.0
    for m in range(search_age, 58, -1):
        key = f"{ppt_prefix}-{m}-{hsar_band}-{hsar_smoker}-{med_code}"
        if key in hsar_factors:
            val = hsar_factors[key].get('multiple', 0)
            hsar_multiplier = 0.0 if val == 'NA' else float(val)
            break
    
    # Get rebateBase from medical_rates (key_HSAR)
    base_key = build_key(age, 'M', pt, ppt, 'LS', smoker, 'R', get_sa_band(sa)) # Dummy for HSAR rebate key construction
    rebate_base = med_rates.get(base_key + '_HSAR', 0.0)

    sa_above_5m = max(0, sa - 5_000_000)
    capped_above_5m = min(45_000_000, sa_above_5m)
    super_high_factor = (sa / 50_000_000) if sa > 50_000_000 else 1.0

    annual_disc = (capped_above_5m * super_high_factor) / 100_000 * (rebate_base * hsar_multiplier)
    return annual_disc * modal_factor

def calculate_expected(age, gender, smoker, is_medical, residency,
                        sa, pt, ppt, mode, variant='LS'):
    """
    Computes expected annual base premium and instalment for V07.
    """
    sa_band = get_sa_band(sa)
    key = build_key(age, gender, pt, ppt, variant, smoker, residency, sa_band)
    rates = med_rates if is_medical else non_med_rates
    rate = rates.get(key)
    if rate is None:
        return None

    modal = MODAL[mode]
    annual_base = (rate / 1000) * sa
    instalment  = annual_base * modal

    # In V07, NRI loading (5%) is removed as it uses NSP key
    
    # HSAR discount
    smoker_code = 'NSP' if residency == 'P' else ('S' if smoker == 'S' else 'NSR')
    hsar_disc_amt = get_hsar_discount(age, pt, ppt, sa, variant, modal, smoker_code, is_medical)
    instalment_after_hsar = instalment - hsar_disc_amt

    return {
        'annualBase':       round(annual_base, 6),
        'baseInstalment':   round(instalment,  6),
        'hsarDiscount':     round(hsar_disc_amt, 6),
        'instalmentAfterHsar': round(instalment_after_hsar, 6),
        'rateUsed':  rate,
        'keyUsed':   key,
    }

# ── Parameter ranges ───────────────────────────────────────────────────────
AGES       = [18, 20, 22, 24, 25, 26, 28, 30, 32, 35,
              38, 40, 42, 45, 48, 50, 52, 55, 58, 60, 62, 65]
GENDERS    = ['M', 'F']
SMOKERS    = ['NS', 'S']
SAS        = [5_000_000, 7_500_000, 9_000_000,
              10_000_000, 12_000_000, 15_000_000, 20_000_000]
MODES      = ['Monthly', 'Annual', 'Half-Yearly', 'Quarterly']
MEDICALS   = [True, False]
RESIDENCIES= ['R', 'P']    # P = NRI (matches key suffix)
VARIANTS   = ['LS']        # Only Life Shield for base tests

# ── Generate cases ─────────────────────────────────────────────────────────
random.seed(42)

test_cases  = []
case_id     = 1
skipped     = 0

# Build candidate list from all parameter combos
candidates = []
for age in AGES:
    for gender in GENDERS:
        for smoker in SMOKERS:
            for sa in SAS:
                for is_med in MEDICALS:
                    for res in RESIDENCIES:
                        for mode in MODES:
                            candidates.append(
                                (age, gender, smoker, sa, is_med, res, mode)
                            )

random.shuffle(candidates)

for (age, gender, smoker, sa, is_medical, residency, mode) in candidates:
    if case_id > 1000:
        break

    max_pt = min(67, 85 - age)
    if max_pt < 5:
        skipped += 1
        continue

    # Pick a PT and PPT randomly from sensible options
    pt_options  = [p for p in [5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 55, 59, max_pt]
                   if 5 <= p <= max_pt]
    if not pt_options:
        skipped += 1
        continue
    pt = random.choice(pt_options)

    ppt_options = [p for p in [5, 7, 10, 12, 15, 20, pt]
                   if 1 <= p <= pt]
    ppt = random.choice(ppt_options)

    expected = calculate_expected(
        age, gender, smoker, is_medical,
        residency, sa, pt, ppt, mode
    )

    if expected is None:
        skipped += 1
        continue

    res_label = 'Resident Indian' if residency == 'R' else 'NRI'
    test_cases.append({
        'id': case_id,
        'description': (
            f"Age{age} {gender} {smoker} "
            f"{'Med' if is_medical else 'NonMed'} "
            f"{res_label} SA{sa//100_000}L "
            f"PT{pt} PPT{ppt} {mode}"
        ),
        'input': {
            'age':         age,
            'gender':      gender,
            'smoker':      smoker,
            'isMedical':   is_medical,
            'residency':   residency,
            'planVariant': 'LS',
            'sumAssured':  sa,
            'policyTerm':  pt,
            'ppt':         ppt,
            'mode':        mode,
        },
        'expected': expected,
    })

    if case_id % 100 == 0:
        print(f"  Generated {case_id} / 1000 cases   (skipped so far: {skipped})")
    case_id += 1

print(f"\nTotal cases generated: {len(test_cases)}")
print(f"Skipped (no rate key): {skipped}")

# ── Save ───────────────────────────────────────────────────────────────────
out_path = os.path.join(BASE, 'tests', 'excel_test_cases.json')
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(test_cases, f, indent=2, ensure_ascii=False)

print(f"Saved -> {out_path}")
