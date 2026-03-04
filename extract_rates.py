"""
Extract rate tables from BI_eTouch II_V05_Ver09.xlsb into JSON for the web frontend.
Uses pyxlsb to read the .xlsb binary workbook.
"""
import json, sys, os
from pyxlsb import open_workbook

WORKBOOK = 'BI_eTouch II_V05_Ver09.xlsb'
OUT_DIR = os.path.join('web', 'public')
os.makedirs(OUT_DIR, exist_ok=True)

def inspect_sheet(wb, sheet_name, max_rows=5):
    """Print first few rows of a sheet to understand structure."""
    print(f"\n--- {sheet_name} (first {max_rows} rows) ---")
    with wb.get_sheet(sheet_name) as sheet:
        for i, row in enumerate(sheet.rows()):
            if i >= max_rows:
                break
            vals = [c.v for c in row]
            print(f"  Row {i}: {vals[:12]}")
    return

def extract_medical_rates(wb, sheet_name, out_file):
    """
    Extract Medical/Non-Medical rate table.
    Based on the formula: VLOOKUP(key, Medical_Rates, 9, 0)
    The key is column A (concatenated lookup key), and we need column 9 (the rate).
    Named range: Medical_Rates = 'Medical Rates'!$A$1:$J$257587
    So columns A through J (10 columns). Column 9 (1-indexed) = index 8 (0-indexed).
    """
    print(f"\nExtracting {sheet_name}...")
    rates = {}
    count = 0
    with wb.get_sheet(sheet_name) as sheet:
        header = None
        for i, row in enumerate(sheet.rows()):
            vals = [c.v for c in row]
            if i == 0:
                header = vals[:11]
                print(f"  Header: {header}")
                continue
            
            key = vals[0]  # lookup key (column A)
            if key is None or key == '':
                continue
            
            key = str(key).strip()
            
            # Column 9 (1-indexed) = index 8 (0-indexed) - the rate
            rate_val = vals[8] if len(vals) > 8 else None
            # Also grab column 10 (index 9) for HSAR rate if available
            hsar_val = vals[9] if len(vals) > 9 else None
            
            if rate_val is not None:
                rates[key] = rate_val
                if hsar_val is not None and hsar_val != 0 and hsar_val != '':
                    rates[key + '_HSAR'] = hsar_val
            
            count += 1
            if count % 50000 == 0:
                print(f"  Processed {count} rows...")
    
    print(f"  Total: {count} rows, {len(rates)} unique keys")
    
    with open(os.path.join(OUT_DIR, out_file), 'w') as f:
        json.dump(rates, f)
    
    print(f"  Saved to {out_file}")
    return rates

def extract_adb_rates(wb, out_file):
    """
    Extract ADB rate table.
    Formula: VLOOKUP(key, ADB_Rate, MATCH("Rate", ADB_Header, 0), 0)
    Named range: ADB_Rate = 'ADB Rates'!$A$1:$G$24105
    ADB_Header = 'ADB Rates'!$A$1:$G$1
    We need to find which column is "Rate" in the header, then extract key->rate.
    """
    print(f"\nExtracting ADB Rates...")
    rates = {}
    count = 0
    rate_col = None
    
    with wb.get_sheet('ADB Rates') as sheet:
        for i, row in enumerate(sheet.rows()):
            vals = [c.v for c in row]
            if i == 0:
                header = vals[:8]
                print(f"  Header: {header}")
                # Rate column is at index 6 based on inspection
                rate_col = 6
                for ci, h in enumerate(header):
                    if h and str(h).strip().lower() == 'rate':
                        rate_col = ci
                        break
                print(f"  Rate column index: {rate_col}")
                continue
            
            key = vals[0]
            if key is None or key == '':
                continue
            
            key = str(key).strip()
            rate_val = vals[rate_col] if len(vals) > rate_col else None
            
            if rate_val is not None:
                rates[key] = rate_val
            
            count += 1
            if count % 5000 == 0:
                print(f"  Processed {count} rows...")
    
    print(f"  Total: {count} rows, {len(rates)} unique keys")
    
    with open(os.path.join(OUT_DIR, out_file), 'w') as f:
        json.dump(rates, f)
    
    print(f"  Saved to {out_file}")
    return rates


def extract_calc_sheet(wb, out_file):
    """Extract key cells from the Calc sheet for verification."""
    print(f"\nExtracting Calc sheet key data...")
    data = {}
    with wb.get_sheet('Calc') as sheet:
        for i, row in enumerate(sheet.rows()):
            if i > 50:
                break
            vals = [c.v for c in row]
            data[f'row_{i}'] = vals[:20]
    
    with open(os.path.join(OUT_DIR, out_file), 'w') as f:
        json.dump(data, f, indent=2)
    print(f"  Saved to {out_file}")

def main():
    if len(sys.argv) > 1 and sys.argv[1] == '--inspect':
        # Just inspect the sheets
        with open_workbook(WORKBOOK) as wb:
            sheets = wb.sheets
            print(f"Sheets: {sheets}")
            for s in ['Medical Rates', 'Non Medical Rates', 'ADB Rates', 'Calc', 'Input']:
                if s in sheets:
                    inspect_sheet(wb, s, max_rows=5)
        return
    
    print(f"Opening workbook: {WORKBOOK}")
    with open_workbook(WORKBOOK) as wb:
        sheets = wb.sheets
        print(f"Available sheets: {sheets}")
        
        # First inspect to understand structure
        for s in ['Medical Rates', 'ADB Rates', 'Calc']:
            if s in sheets:
                inspect_sheet(wb, s, max_rows=3)
        
        # Extract rate tables
        if 'Medical Rates' in sheets:
            extract_medical_rates(wb, 'Medical Rates', 'medical_rates.json')
        
        if 'Non Medical Rates' in sheets:
            extract_medical_rates(wb, 'Non Medical Rates', 'non_medical_rates.json')
        
        if 'ADB Rates' in sheets:
            extract_adb_rates(wb, 'adb_rates.json')
        
        # Extract Calc for verification
        if 'Calc' in sheets:
            extract_calc_sheet(wb, 'calc_data.json')
    
    print("\n✅ All rate data extracted successfully!")

if __name__ == '__main__':
    main()
