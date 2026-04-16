import pyxlsb
import sys

def inspect_workbook(file_path):
    try:
        with pyxlsb.open_workbook(file_path) as wb:
            print(f"Sheets in {file_path}:")
            for sheet_name in wb.sheets:
                print(f"- {sheet_name}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python inspect_workbook.py <path_to_xlsb>")
    else:
        inspect_workbook(sys.argv[1])
