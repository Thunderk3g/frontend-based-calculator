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

def parse_refers_to(refers_to):
    # e.g., =Input!$D$12 -> ('Input', 'D12')
    match = re.search(r"=?(['\"]?)([^'\"!]+)\1?!\$?([A-Z]+)\$?([0-9]+)", refers_to)
    if match:
        return match.group(2).replace("'", ""), f"{match.group(3)}{match.group(4)}"
    return None, None

def build_label_map(all_data, named_ranges):
    address_to_label = {}
    
    # Add named ranges to map
    for nr in named_ranges:
        sheet, addr = parse_refers_to(nr["refersTo"])
        if sheet and addr:
            address_to_label[f"{sheet}!{addr}"] = nr["name"]
    
    # Process Input/Output sheets for labels
    for sheet_name in ["Input", "Output"]:
        sheet_data = all_data.get(sheet_name, [])
        for r_idx, row in enumerate(sheet_data):
            for c_idx, val in enumerate(row):
                if val and isinstance(val, str) and val.strip():
                    label = val.strip()
                    # Look for values in the next two columns or the cell below
                    # 1. Right side
                    for offset in [1, 2]:
                        if c_idx + offset < len(row):
                             target_val = row[c_idx+offset]
                             if target_val is not None:
                                addr = f"{col_idx_to_name(c_idx+offset)}{r_idx+1}"
                                full_addr = f"{sheet_name}!{addr}"
                                if full_addr not in address_to_label and len(label) > 2:
                                    address_to_label[full_addr] = label
                    # 2. Below
                    if r_idx + 1 < len(sheet_data):
                        below_val = sheet_data[r_idx+1][c_idx] if c_idx < len(sheet_data[r_idx+1]) else None
                        if below_val is not None:
                             addr = f"{col_idx_to_name(c_idx)}{r_idx+2}"
                             full_addr = f"{sheet_name}!{addr}"
                             if full_addr not in address_to_label and len(label) > 3:
                                 # Avoid labels like "Input", "Output"
                                 if label not in ["Input", "Output", "Value", "Info"]:
                                     address_to_label[full_addr] = label

    # Seed with missing fields report if available
    try:
        with open("missing_fields_report.json", "r") as f:
            missing = json.load(f)
            for item in missing.get("unmapped_inputs", []):
                if item["address"] not in address_to_label and item["label"] and len(item["label"]) > 1:
                    address_to_label[item["address"]] = item["label"]
    except:
        pass

    return address_to_label

def simplify_formula(formula, label_map, current_sheet):
    # Pattern: (SheetName!)?([A-Z]+[0-9]+)
    pattern = r'(\'?[^!]+\'?!)?(\$?[A-Z]+\$?[0-9]+)'
    
    def replacer(match):
        sheet_ref = (match.group(1) or "").replace("'", "").replace("!", "")
        cell_ref = match.group(2).replace("$", "")
        
        full_ref = f"{sheet_ref}!{cell_ref}" if sheet_ref else f"{current_sheet}!{cell_ref}"
        
        if full_ref in label_map:
            return f"[{label_map[full_ref]}]"
        
        # Also try just cell_ref if we're in the same sheet
        if not sheet_ref and f"{current_sheet}!{cell_ref}" in label_map:
             return f"[{label_map[f'{current_sheet}!{cell_ref}']}]"
             
        return match.group(0)

    # Simplified formula
    res = re.sub(pattern, replacer, formula)
    return res

def main():
    try:
        formulas_data = load_json("extracted_formulas_com.json")
        values_data = load_json("extracted_data.json")
        named_ranges = load_json("named_ranges.json")
    except Exception as e:
        print(f"Error loading files: {e}")
        return

    label_map = build_label_map(values_data, named_ranges)
    
    all_summary = {}
    
    for sheet_name, sheet_formulas in formulas_data.items():
        logic_summary = []
        for item in sheet_formulas:
            addr = item["address"]
            formula = item["formula"]
            val = item["value"]
            
            if "=" in formula:
                simplified = simplify_formula(formula, label_map, sheet_name)
                logic_summary.append({
                    "address": addr,
                    "sheet": sheet_name,
                    "label": label_map.get(f"{sheet_name}!{addr}", addr),
                    "original": formula,
                    "simplified": simplified,
                    "value": val
                })
        all_summary[sheet_name] = logic_summary

    # Output detailed markdown per sheet
    with open("math_logic_report.md", "w", encoding="utf-8") as f:
        f.write("# Math Logic Report\n\n")
        
        # Key Outputs Summary
        f.write("## Key Calculation Highlights\n\n")
        
        # Focus on Calc sheet core logic
        calc_logic = all_summary.get("Calc", [])
        for entry in calc_logic:
            if "VLOOKUP" in entry["original"]:
                 f.write(f"### Rate Lookup: {entry['label']}\n")
                 f.write(f"- **Formula**: `{entry['simplified']}`\n")
                 f.write(f"- **Current Value**: `{entry['value']}`\n\n")

        # Focus on Input sheet results
        input_logic = all_summary.get("Input", [])
        for entry in input_logic:
            if entry["address"] in ["I12", "I13", "I15", "I16", "J202", "J221"]:
                 f.write(f"### Calculation Result: {entry['label']}\n")
                 f.write(f"- **Formula**: `{entry['simplified']}`\n")
                 f.write(f"- **Current Value**: `{entry['value']}`\n\n")

        f.write("## Full Logic Trace (By Sheet)\n")
        for sheet, items in all_summary.items():
            if not items: continue
            f.write(f"\n### Sheet: {sheet}\n")
            f.write("| Cell | Label | Simplified Logic | Value |\n")
            f.write("| --- | --- | --- | --- |\n")
            for item in items[:200]: # Show more per sheet
                f.write(f"| {item['address']} | {item['label']} | {item['simplified']} | {item['value']} |\n")

    # Generate Data Dictionary (All identifiable fields)
    with open("data_dictionary.md", "w", encoding="utf-8") as f:
        f.write("# Data Dictionary - Input & Output Fields\n\n")
        f.write("This document lists all identifiable data fields from the Input and Output sheets.\n\n")
        
        for sheet_name in ["Input", "Output"]:
            f.write(f"## {sheet_name} Fields\n")
            f.write("| Address | Label | Description/Context |\n")
            f.write("| --- | --- | --- |\n")
            
            sheet_entries = [(addr, label) for addr, label in label_map.items() if addr.startswith(f"{sheet_name}!")]
            # Sort by row number then column
            sheet_entries.sort(key=lambda x: (int(re.search(r'\d+', x[0]).group()), x[0]))
            
            for full_addr, label in sheet_entries:
                addr = full_addr.split("!")[1]
                f.write(f"| {addr} | {label} | | \n")

if __name__ == "__main__":
    main()
