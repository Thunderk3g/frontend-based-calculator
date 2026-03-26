
import json
import random
from pathlib import Path

# Load rate tables
base = Path(".")
med_path = base / "web/public/medical_rates.json"
hsar_path = base / "web/public/hsar_factors.json"

if not med_path.exists():
    print("Run from project root.")
    exit(1)

med = json.loads(med_path.read_text(encoding="utf-8"))
hsar_config = json.loads(hsar_path.read_text(encoding="utf-8"))

AGES = list(range(18, 60))
GENDERS = ["Male", "Female"]
SA_OPTS = [5000000, 10000000, 25000000, 50000000]
MODES = ["Annual", "Monthly"]

def generate_complex_case(id):
    age = random.choice(AGES)
    sa = random.choice(SA_OPTS)
    pt = random.randint(20, 40)
    ppt = random.choice([5, 10, pt])
    
    riders = {
        "adb": {"enabled": random.random() > 0.5, "sumAssured": sa},
        "ci": {"enabled": random.random() > 0.7, "sumAssured": 500000, "pt": 20, "ppt": 10},
        "spouseCare": {"enabled": random.random() > 0.8, "age": 25, "sumAssured": sa//2, "pt": 20, "ppt": 10},
        "parentalCare": {"enabled": random.random() > 0.9, "fatherAge": 60, "motherAge": 55, "sumAssured": sa, "pt": 20, "ppt": 10},
        "childCare": []
    }
    
    if random.random() > 0.8:
        riders["childCare"].append({"enabled": True, "age": 5, "gender": "Male", "sumAssured": 1000000, "pt": 15, "ppt": 10})

    return {
        "id": 10000 + id,
        "description": f"Complex Rider Case {id}",
        "input": {
            "age": age, "gender": random.choice(GENDERS), "smoker": "Non Smoker",
            "residence": "Resident Indian", "planVariant": "Life Shield",
            "sumAssured": sa, "policyTerm": pt, "ppt": ppt, "mode": random.choice(MODES),
            "riders": riders
        }
    }

cases = [generate_complex_case(i) for i in range(1, 10001)]
dest = base / "tests/complex_cases_10k.json"
dest.write_text(json.dumps(cases, indent=2))
print(f"Generated 10,000 complex cases in {dest}")
