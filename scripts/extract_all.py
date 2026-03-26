# Master Extract script for Bajaj Life eTouch II
# Source: BI_eTouch II_V07_Ver0.2.xlsb
# Run from: frontend-based-calculator\
# Usage: python scripts\extract_all.py

import os
import json
import time
from pyxlsb import open_workbook

XLSB_PATH = 'BI_eTouch II_V07_Ver0.2.xlsb'
PUBLIC_DIR = os.path.join('web', 'public')

# Rider and Category mappings for compact FPR keys
RIDER_MAP = {
    'Spouse Care': 'SC',
    'Parental Care': 'PC',
    'Child Care': 'CC',
    'Fam Care': 'FC'
}

CAT_MAP = {
    'Full Underwriting - Non-Smoker': 'NSR',
    'Full Underwriting - Smoker': 'S',
    'Full Underwriting - Tele Medical': 'NSP',
    'Simplified Underwriting': 'SIMP'
}

def clean_val(v):
    if v is None: return ""
    if isinstance(v, float) and v.is_integer(): return int(v)
    return v

def extract_fpr_base_rates(ws):
    print("Extracting FPR_Base Rate...")
    data = {}
    for i, row in enumerate(ws.rows()):
        if i == 0: continue
        vals = [cell.v for cell in row]
        try:
            # Struct: [KeyConc, Age, PT, PPT, Rate, Gender, Category, Rider]
            age = int(vals[1])
            pt = int(vals[2])
            ppt = int(vals[3])
            rate = vals[4]
            gender = vals[5]
            category = vals[6]
            rider = vals[7]
            
            r_code = RIDER_MAP.get(rider, rider)
            c_code = CAT_MAP.get(category, category)
            key = f"{age}{gender}{pt:02d}{ppt:02d}{r_code}{c_code}"
            data[key] = rate
        except: pass
        if (i % 50000) == 0: print(f"  Processed {i} rows...")
    
    with open(os.path.join(PUBLIC_DIR, 'fpr_base_rates.json'), 'w') as f:
        json.dump(data, f)
    print(f"Finished. Total keys: {len(data)}")

def extract_lookup_table(ws, sheet_name, out_file, key_col=0, val_col=8, hsar_col=None):
    print(f"Extracting {sheet_name} (Lookups)...")
    data = {}
    for i, row in enumerate(ws.rows()):
        if i == 0: continue
        vals = [cell.v for cell in row]
        key = str(vals[key_col]).strip() if vals[key_col] else ""
        if not key: continue
        
        rate = vals[val_col] if len(vals) > val_col else None
        if rate is not None:
            data[key] = rate
            if hsar_col is not None and len(vals) > hsar_col:
                hsar_val = vals[hsar_col]
                if hsar_val and hsar_val != 0:
                    data[key + '_HSAR'] = hsar_val
                    
        if (i % 50000) == 0: print(f"  Processed {i} rows...")
    
    with open(os.path.join(PUBLIC_DIR, out_file), 'w') as f:
        json.dump(data, f)
    print(f"Finished. Total keys: {len(data)}")

def extract_ci_rates(ws):
    print("Extracting CI Rates...")
    data = {}
    for i, row in enumerate(ws.rows()):
        if i == 0: continue
        vals = [cell.v for cell in row]
        key = str(vals[0]).strip() if vals[0] else ""
        if not key: continue
        rate = vals[5] if len(vals) > 5 else 0
        data[key] = rate
    with open(os.path.join(PUBLIC_DIR, 'ci_rates.json'), 'w') as f:
        json.dump(data, f)
    print(f"Finished. Total keys: {len(data)}")

def extract_care_plus_rates(ws):
    print("Extracting Care Plus Rider Rates...")
    data = {}
    for i, row in enumerate(ws.rows()):
        if i == 0: continue
        vals = [cell.v for cell in row]
        key = str(vals[0]).strip() if vals[0] else ""
        if not key: continue
        rate = vals[9] if len(vals) > 9 else 0
        data[key] = rate
    with open(os.path.join(PUBLIC_DIR, 'care_plus_rates.json'), 'w') as f:
        json.dump(data, f)
    print(f"Finished. Total keys: {len(data)}")

def extract_hsar_factors(ws):
    print("Extracting HSAR Factors...")
    data = {}
    for i, row in enumerate(ws.rows()):
        if i == 0: continue
        vals = [cell.v for cell in row]
        # Key: `${pptPrefix}-${maturityAge}-${hsarBand}`
        # Struct: [Conc, PPT, MaturityAge, SA_Min, SA_Max, Multiple, ...]
        try:
            ppt = str(vals[1])
            mat_age = int(vals[2])
            sa_min = int(vals[3])
            multiple = vals[5]
            smoker = str(vals[6])
            medical = str(vals[7])
            key = f"{ppt}-{mat_age}-{int(sa_min)}-{smoker}-{medical}"
            data[key] = {"multiple": multiple}
        except: pass
    with open(os.path.join(PUBLIC_DIR, 'hsar_factors.json'), 'w') as f:
        json.dump(data, f)
    print(f"Finished. Total keys: {len(data)}")

def extract_raw_json(ws, out_file):
    print(f"Extracting Raw Json: {out_file}...")
    rows = []
    for row in ws.rows():
        rows.append([clean_val(cell.v) for cell in row])
    with open(os.path.join(PUBLIC_DIR, out_file), 'w', encoding='utf-8') as f:
        json.dump(rows, f)
    print(f"Finished. Total rows: {len(rows)}")

def run():
    start_time = time.time()
    if not os.path.exists(PUBLIC_DIR): os.makedirs(PUBLIC_DIR)
    
    print(f"Opening workbook: {XLSB_PATH}")
    with open_workbook(XLSB_PATH) as wb:
        all_sheets = wb.sheets
        print(f"Found {len(all_sheets)} sheets.")
        
        # 1. Complex Lookup Tables
        if 'FPR_Base Rate' in all_sheets:
            with wb.get_sheet('FPR_Base Rate') as ws: extract_fpr_base_rates(ws)
        
        if 'Medical Rates' in all_sheets:
            with wb.get_sheet('Medical Rates') as ws: 
                extract_lookup_table(ws, 'Medical Rates', 'medical_rates.json', key_col=0, val_col=8, hsar_col=9)
        
        if 'Non Medical Rates' in all_sheets:
            with wb.get_sheet('Non Medical Rates') as ws:
                extract_lookup_table(ws, 'Non Medical Rates', 'non_medical_rates.json', key_col=0, val_col=8, hsar_col=9)

        if 'ADB Rates' in all_sheets:
            with wb.get_sheet('ADB Rates') as ws:
                extract_lookup_table(ws, 'ADB Rates', 'adb_rates.json', key_col=0, val_col=6)

        if 'CI Rates' in all_sheets:
            with wb.get_sheet('CI Rates') as ws: extract_ci_rates(ws)
            
        if 'Care Plus Rider Rates' in all_sheets:
            with wb.get_sheet('Care Plus Rider Rates') as ws: extract_care_plus_rates(ws)
            
        if 'HSAR Factor' in all_sheets:
            with wb.get_sheet('HSAR Factor') as ws: extract_hsar_factors(ws)

        # 2. Bulk Data Extracted into extracted_data.json
        essential_sheets = ['Input', 'Output', 'Calc', 'CIS fields', 'Version Control']
        extracted_data = {}
        for sn in essential_sheets:
            if sn in all_sheets:
                print(f"Extracting {sn} into extracted_data.json...")
                rows = []
                with wb.get_sheet(sn) as ws:
                    for row in ws.rows():
                        rows.append([clean_val(cell.v) for cell in row])
                extracted_data[sn] = rows
        with open(os.path.join(PUBLIC_DIR, 'extracted_data.json'), 'w') as f:
            json.dump(extracted_data, f)
            
        # 3. Individual Metadata Files
        raw_mappings = {
            'FPR_Rate_Calculation': 'fpr_rate_calculation.json',
            'FPR_Premium_Calculator': 'fpr_premium_calculator.json',
            'SISO benefit': 'siso_benefit.json',
            'Care Plus Validations': 'care_plus_validations.json',
            'Surrender Factors': 'surrender_factors.json',
            'Surrender Calc': 'surrender_calc.json',
            'Version Control': 'version_control.json',
            'CIS fields': 'cis_fields.json'
        }
        for sheet_name, out_file in raw_mappings.items():
            if sheet_name in all_sheets:
                with wb.get_sheet(sheet_name) as ws: extract_raw_json(ws, out_file)

    print(f"\nTotal Extraction time: {time.time() - start_time:.1f}s")

if __name__ == "__main__":
    run()
