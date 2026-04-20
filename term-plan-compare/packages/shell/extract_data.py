from python_calamine import CalamineWorkbook
import sys
import json

def extract_sheet_data(file_path, sheet_names):
    results = {}
    try:
        workbook = CalamineWorkbook.from_path(file_path)
        for sn in sheet_names:
            print(f"Processing sheet: {sn}")
            results[sn] = []
            results[sn] = workbook.get_sheet_by_name(sn).to_python()
        return results
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_data.py <path_to_xlsb> <sheet1> <sheet2> ...")
    else:
        file_path = sys.argv[1]
        sheets = sys.argv[2:]
        data = extract_sheet_data(file_path, sheets)
        if data:
            with open("extracted_data.json", "w") as f:
                json.dump(data, f, indent=4, default=str)
            print("Data saved to extracted_data.json")
