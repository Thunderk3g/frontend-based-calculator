import pyxlsb
import sys
import json

def extract_formulas(file_path, sheet_names):
    results = {}
    try:
        with pyxlsb.open_workbook(file_path) as wb:
            for sn in sheet_names:
                print(f"Processing sheet: {sn}")
                results[sn] = []
                with wb.get_sheet(sn) as sheet:
                    for row in sheet:
                        for cell in row:
                            if cell.f:
                                results[sn].append({
                                    "address": f"{pyxlsb.convert_to_column_name(cell.c)}{cell.r + 1}",
                                    "formula": cell.f,
                                    "value": cell.v
                                })
        return results
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_formulas.py <path_to_xlsb> <sheet1> <sheet2> ...")
    else:
        file_path = sys.argv[1]
        sheets = sys.argv[2:]
        data = extract_formulas(file_path, sheets)
        if data:
            with open("extracted_formulas.json", "w") as f:
                json.dump(data, f, indent=4)
            print("Formulas saved to extracted_formulas.json")
