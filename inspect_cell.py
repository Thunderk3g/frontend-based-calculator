import pyxlsb
import sys

def inspect_cell(file_path, sheet_name):
    with pyxlsb.open_workbook(file_path) as wb:
        with wb.get_sheet(sheet_name) as sheet:
            for row in sheet:
                for cell in row:
                    if cell.v is not None:
                        print(f"Cell at Row {cell.r}, Col {cell.c}:")
                        print(f"  Value (v): {cell.v}")
                        print(f"  Type of cell: {type(cell)}")
                        print(f"  Attributes: {dir(cell)}")
                        # Try to find anything that looks like a formula
                        for attr in dir(cell):
                            if not attr.startswith('_'):
                                try:
                                    print(f"  {attr}: {getattr(cell, attr)}")
                                except:
                                    pass
                        return

if __name__ == "__main__":
    inspect_cell(sys.argv[1], sys.argv[2])
