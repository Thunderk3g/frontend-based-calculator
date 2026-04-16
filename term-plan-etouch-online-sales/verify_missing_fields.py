import json
import re

def load_json(file_path):
    with open(file_path, "r", encoding="utf-8-sig") as f:
        return json.load(f)

def col_idx_to_name(idx):
    name = ""
    while idx >= 0:
        name = chr(65 + (idx % 26)) + name
        idx = (idx // 26) - 1
    return name

def main():
    try:
        formulas_data = load_json("extracted_formulas_com.json")
        values_data = load_json("extracted_data.json")
        named_ranges = load_json("named_ranges.json")
        # Load our existing report to see what we've already covered
        with open("math_logic_explanation.json", "r") as f:
            covered_data = json.load(f)
    except Exception as e:
        print(f"Error loading files: {e}")
        return

    # Covered addresses
    covered_keys = {f"{item['sheet']}!{item['address']}" for item in covered_data}

    # 1. Check Input sheet for unmapped inputs
    input_sheet = values_data.get("Input", [])
    missing_inputs = []
    
    # Common input columns are D and J (0-indexed: 3 and 9)
    input_cols = [3, 9]
    for r_idx, row in enumerate(input_sheet):
        for c_idx in input_cols:
            if c_idx < len(row):
                val = row[c_idx]
                if val is not None and val != "":
                    addr = f"Input!{col_idx_to_name(c_idx)}{r_idx+1}"
                    if addr not in covered_keys:
                        # Find the label (usually in previous column)
                        label = "Unknown"
                        if c_idx > 0:
                            label = str(row[c_idx-1]).strip()
                        missing_inputs.append({"address": addr, "label": label, "value": val})

    # 2. Check for sheets with formulas that were totally skipped in logic trace
    # (We already have some, but let's be explicit)
    logic_sheets = ["Calc", "CI Calc", "FPR_Rate_Calculation", "FPR_Premium_Calculator", "Care Plus Validations", "SISO benefit", "FPR_Validations", "Surrender Calc"]
    missing_logic = {}
    
    for sheet_name, formulas in formulas_data.items():
        if sheet_name not in logic_sheets:
            # Check if it has actual calculation logic (not just references)
             complex_formulas = [f for f in formulas if "=" in f["formula"] and len(f["formula"]) > 10]
             if complex_formulas:
                 missing_logic[sheet_name] = len(complex_formulas)

    # Output report
    report = {
        "unmapped_inputs": missing_inputs,
        "unvisited_logic_sheets": missing_logic
    }
    
    with open("missing_fields_report.json", "w") as f:
        json.dump(report, f, indent=4)
    
    print(f"Found {len(missing_inputs)} unmapped input fields.")
    print(f"Found {len(missing_logic)} unvisited logic sheets: {list(missing_logic.keys())}")

if __name__ == "__main__":
    main()
