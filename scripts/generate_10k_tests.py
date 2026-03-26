"""
Bajaj Life eTouch II — 10,000 Test Cases
Generates exhaustive test cases from actual rate table keys.
Aligned to calc.js HSAR and NRI logic.
"""

import json
import itertools
import random
from pathlib import Path

# ── Load rate tables ──────────────────────
print("Loading rate tables...")
base = Path(".")
med_path = base / "web/public/medical_rates.json"
nmed_path = base / "web/public/non_medical_rates.json"
hsar_path = base / "web/public/hsar_factors.json"

med  = json.loads(med_path.read_text(encoding="utf-8"))
nmed = json.loads(nmed_path.read_text(encoding="utf-8"))
hsar_config = json.loads(hsar_path.read_text(encoding="utf-8"))

# ── Extract PT/PPT combos ────────────────
combos = set()
for key in med.keys():
    if "_HSAR" in key: continue
    for variant in ["LSNSR","LSNSP","LSS","LSRNSR","LSRNSP","LSRS"]:
        if variant in key:
            prefix = key.split(variant)[0]
            rest = prefix[3:] # rest of prefix after age (2) and gender (1)
            # Try all splits and keep only valid ones
            for pt_len in range(1, len(rest)):
                pt_str, ppt_str = rest[:pt_len], rest[pt_len:]
                if pt_str.isdigit() and ppt_str.isdigit():
                    pt, ppt = int(pt_str), int(ppt_str)
                    # HEURISTIC: In this product, PT is 5-67, PPT is 1-pt or "Pay till 60"
                    if 5 <= pt <= 67 and 1 <= ppt <= pt:
                         combos.add((pt, ppt))
            break
pt_ppt_list = sorted(combos)
print(f"Extracted {len(pt_ppt_list)} valid PT/PPT combinations.")

AGES = list(range(18, 66))
GENDERS = ["M", "F"]
SMOKERS = ["NS", "S"]
MEDICALS = [True, False]
RESIDENCIES = ["Resident Indian", "NRI"]
VARIANTS = ["LS", "LSR"]
MODES = ["Monthly", "Annual", "Half-Yearly", "Quarterly"]
SA_BANDS = [5000000, 7500000, 9000000, 10000000, 12000000, 15000000, 20000000, 55000000]

MODAL = {"Annual": 1.0, "Half-Yearly": 0.51, "Quarterly": 0.26, "Monthly": 0.0875}

def get_hsar_multiplier(ppt, pt, maturity_age, sa, smoker, is_medical, residency):
    if sa < 10000000: return 0
    if sa >= 20000000: band = 20000000
    elif sa >= 15000000: band = 15000000
    else: band = 10000000

    ppt_prefix = 'RP' if ppt == pt else f'LP{ppt}'
    hsar_smoker = 'NSP' if smoker in ['NS', 'NSP', 'NSR'] else smoker
    med_code = 'Medical' if is_medical else 'Non Medical'
    search_age = min(61, max(59, maturity_age))
    for m in range(search_age, 58, -1):
        key = f"{ppt_prefix}-{m}-{band}-{hsar_smoker}-{med_code}"
        if key in hsar_config:
            mult = hsar_config[key].get("multiple", 0)
            return 0 if mult == "NA" else float(mult)
    return 0

def build_key(age, gender, pt, ppt, variant, smoker, residency, sa_band):
    g = gender[0]
    if residency == "NRI" and smoker != "S":
        smoker_code = "NSP"
    elif smoker == "S":
        smoker_code = "S"
    else:
        smoker_code = "NSR"
    return f"{age}{g}{pt}{ppt}{variant}{smoker_code}{sa_band}"

def calculate_expected(age, gender, smoker, is_medical, residency, sa, pt, ppt, mode, variant="LS"):
    # Production constraints check
    if age + pt > 85: return None
    if variant == "LSR" and pt > 50: return None
    if sa < 5000000: return None
    if pt < 5: return None
    if ppt > pt: return None

    sa_band = 5000000 if sa < 10000000 else 10000000
    table = med if is_medical else nmed
    key = build_key(age, gender, pt, ppt, variant, smoker, residency, sa_band)
    rate = table.get(key)
    if rate is None: return None

    annual_base = (rate / 1000) * sa
    annual_hsar_discount = 0
    if variant == "LS":
        hsar_key = key + "_HSAR"
        rebate_base = table.get(hsar_key, 0)
        if rebate_base:
            mult = get_hsar_multiplier(ppt, pt, age + pt, sa, smoker, is_medical, residency)
            rebate_rate = rebate_base * mult
            sa_above_5m = max(0, sa - 5000000)
            capped_sa = min(45000000, sa_above_5m)
            super_high_factor = (sa / 50000000) if sa > 50000000 else 1.0
            annual_hsar_discount = (capped_sa * super_high_factor) / 100000 * rebate_rate

    annual_total = annual_base - annual_hsar_discount
    modal_factor = MODAL[mode]
    instalment = annual_total * modal_factor

    return {
        "annualBase": round(annual_total, 4),
        "baseInstalment": round(instalment, 4),
    }

print("\nGenerating 10,000 cases...")
test_cases = []
case_id = 1
seen = set()
random.seed(42)

def add(age, gender, smoker, is_med, res, v, sa, mode, pt, ppt):
    global case_id
    if case_id > 10000: return False
    exp = calculate_expected(age, gender, smoker, is_med, res, sa, pt, ppt, mode, v)
    if not exp: return False
    sig = (age, gender, smoker, is_med, res, v, sa, mode, pt, ppt)
    if sig in seen: return False
    seen.add(sig)
    test_cases.append({"id": case_id, "description": f"Case {case_id}", "input": {"age": age, "gender": gender, "smoker": smoker, "isMedical": is_med, "residency": res, "planVariant": v, "sumAssured": sa, "policyTerm": pt, "ppt": ppt, "mode": mode}, "expected": exp})
    case_id += 1
    return True

# Sampling
while case_id <= 10000:
    a, g, s, m, r, v = random.choice(AGES), random.choice(GENDERS), random.choice(SMOKERS), random.choice(MEDICALS), random.choice(RESIDENCIES), random.choice(VARIANTS)
    pt, ppt = random.choice(pt_ppt_list)
    sa, mode = random.choice(SA_BANDS), random.choice(MODES)
    add(a, g, s, m, r, v, sa, mode, pt, ppt)

Path("tests/excel_test_cases_10k.json").write_text(json.dumps(test_cases, indent=2), encoding="utf-8")
print(f"Done! Created 10,000 cases.")
