# Master Extract script for Bajaj Life Goal Assure IV (ULIP)
# Source: BI_Goal Assure IV_V01_ver18.xlsb
# Usage: python scripts\extract_all.py

import os
import json
import time
from pyxlsb import open_workbook

XLSB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                         'BI_Goal Assure IV_V01_ver18.xlsb')
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                         'web', 'public')


def clean_val(v):
    if v is None:
        return ""
    if isinstance(v, float) and v.is_integer():
        return int(v)
    return v


def extract_apr_rates(wb):
    """Extract APR (ADB rider) rates as a PT x PPT matrix."""
    print("Extracting APR (ADB Rider Rates)...")
    data = {}
    with wb.get_sheet('APR') as ws:
        ppt_headers = []
        for i, row in enumerate(ws.rows()):
            vals = [cell.v for cell in row]
            if i == 1:
                # Row 1: PPT headers starting from col 2
                ppt_headers = [int(v) for v in vals[2:] if v and v != '']
                continue
            if i < 2:
                continue
            pt = vals[1]
            if pt is None or pt == '':
                continue
            try:
                pt = int(float(pt))
            except (ValueError, TypeError):
                continue
            for j, ppt in enumerate(ppt_headers):
                rate = vals[j + 2] if j + 2 < len(vals) else ''
                if rate and rate != '' and isinstance(rate, (int, float)):
                    key = f"{pt}-{ppt}"
                    data[key] = float(rate)

    out_path = os.path.join(PUBLIC_DIR, 'apr_rates.json')
    with open(out_path, 'w') as f:
        json.dump(data, f)
    print(f"  APR rates: {len(data)} entries")


def extract_ci_rates(wb):
    """Extract CI Rates from 'CI Rates' sheet."""
    print("Extracting CI Rates...")
    data = {}
    with wb.get_sheet('CI Rates') as ws:
        for i, row in enumerate(ws.rows()):
            if i == 0:
                continue
            vals = [cell.v for cell in row]
            key = str(vals[0]).strip() if vals[0] else ""
            if not key:
                continue
            rate = vals[5] if len(vals) > 5 else 0
            data[key] = rate
    out_path = os.path.join(PUBLIC_DIR, 'ci_rates.json')
    with open(out_path, 'w') as f:
        json.dump(data, f)
    print(f"  CI rates: {len(data)} entries")


def extract_care_plus(wb):
    """Extract Care Plus Rider Rates."""
    print("Extracting Care Plus Rider Rates...")
    data = {}
    with wb.get_sheet('Life Care Plus Rider Rates') as ws:
        for i, row in enumerate(ws.rows()):
            if i == 0:
                continue
            vals = [cell.v for cell in row]
            key = str(vals[0]).strip() if vals[0] else ""
            if not key:
                continue
            rate = vals[9] if len(vals) > 9 else 0
            data[key] = rate
    out_path = os.path.join(PUBLIC_DIR, 'care_plus_rates.json')
    with open(out_path, 'w') as f:
        json.dump(data, f)
    print(f"  Care Plus rates: {len(data)} entries")


def extract_charges(wb):
    """Extract all charge tables from 'Charges' sheet."""
    print("Extracting Charges...")
    charges = {
        "allocation": {},
        "pac": {},
        "fmc": {},
        "pacInflationRate": 0.05
    }

    with wb.get_sheet('Charges') as ws:
        rows_data = []
        for row in ws.rows():
            rows_data.append([cell.v for cell in row])

    # Allocation Charges - Web Channel (rows 14-17 based on inspection)
    # Row 14: headers, rows 15-17: data by premium slab
    allocation_web = []
    for r in range(15, 18):
        if r < len(rows_data):
            row = rows_data[r]
            label = str(row[1]) if row[1] else ""
            min_prem = row[2] if row[2] else 0
            rates = []
            for c in range(3, min(len(row), 25)):
                val = row[c]
                rates.append(float(val) if val is not None else 1.0)
            allocation_web.append({
                "label": label,
                "minPremium": min_prem,
                "ratesByYear": rates
            })
    charges["allocation"]["web"] = allocation_web

    # Allocation Charges - Other Channel (rows 8-11)
    allocation_other = []
    for r in range(9, 12):
        if r < len(rows_data):
            row = rows_data[r]
            label = str(row[1]) if row[1] else ""
            min_prem = row[2] if row[2] else 0
            rates = []
            for c in range(3, min(len(row), 25)):
                val = row[c]
                rates.append(float(val) if val is not None else 1.0)
            allocation_other.append({
                "label": label,
                "minPremium": min_prem,
                "ratesByYear": rates
            })
    charges["allocation"]["other"] = allocation_other

    # PAC (Policy Admin Charges) - starting around row 29
    pac_inflation = rows_data[29][2] if len(rows_data) > 29 and rows_data[29][2] else 0.05
    charges["pacInflationRate"] = pac_inflation

    pac_rates = {}
    for r in range(34, 54):
        if r < len(rows_data):
            row = rows_data[r]
            month = row[1]
            rate = row[2]
            if month is not None and rate is not None:
                pac_rates[str(int(month))] = float(rate)
    charges["pac"] = pac_rates

    # FMC (Fund Management Charges) - starting around row 68
    fmc = {}
    for r in range(70, 98): # Extended to capture all 28 funds
        if r < len(rows_data):
            row = rows_data[r]
            fund_name = str(row[1]).strip() if row[1] else ""
            rate = row[3]
            if fund_name and rate is not None:
                fmc[fund_name] = float(rate)
    charges["fmc"] = fmc

    out_path = os.path.join(PUBLIC_DIR, 'charges.json')
    with open(out_path, 'w') as f:
        json.dump(charges, f, indent=2)
    print(f"  Charges extracted (FMC funds: {len(fmc)}, PAC entries: {len(pac_rates)})")


def extract_bulk_data(wb):
    """Extract Input, CIS fields, Version control, CI Calc into one JSON."""
    print("Extracting bulk data (Input, CIS, Version, CI Calc)...")
    extracted = {}
    sheets_to_extract = ['Input', 'CIS fields', 'Version control', 'CI Calc',
                         'SPW Validations', 'Life Care Plus Validations']

    for sn in sheets_to_extract:
        if sn in wb.sheets:
            print(f"  Extracting {sn}...")
            rows = []
            with wb.get_sheet(sn) as ws:
                for row in ws.rows():
                    rows.append([clean_val(cell.v) for cell in row])
            extracted[sn] = rows

    out_path = os.path.join(PUBLIC_DIR, 'extracted_data.json')
    with open(out_path, 'w') as f:
        json.dump(extracted, f)
    print(f"  Bulk data: {len(extracted)} sheets")


def extract_raw_json(wb, sheet_name, out_file):
    """Extract a sheet as raw JSON rows."""
    if sheet_name not in wb.sheets:
        print(f"  Sheet '{sheet_name}' not found, skipping.")
        return
    print(f"Extracting {sheet_name} -> {out_file}...")
    rows = []
    with wb.get_sheet(sheet_name) as ws:
        for row in ws.rows():
            rows.append([clean_val(cell.v) for cell in row])
    out_path = os.path.join(PUBLIC_DIR, out_file)
    with open(out_path, 'w') as f:
        json.dump(rows, f)
    print(f"  {sheet_name}: {len(rows)} rows")


def run():
    start_time = time.time()
    if not os.path.exists(PUBLIC_DIR):
        os.makedirs(PUBLIC_DIR)

    print(f"Opening workbook: {XLSB_PATH}")
    with open_workbook(XLSB_PATH) as wb:
        print(f"Found {len(wb.sheets)} sheets: {wb.sheets}")

        # 1. Rate tables
        extract_apr_rates(wb)
        extract_ci_rates(wb)
        extract_care_plus(wb)

        # 2. Charges
        extract_charges(wb)

        # 3. Bulk data
        extract_bulk_data(wb)

        # 4. Individual metadata files
        raw_mappings = {
            'CIS fields': 'cis_fields.json',
            'Version control': 'version_control.json',
            'Life Care Plus Validations': 'care_plus_validations.json',
            'SPW Validations': 'spw_validations.json',
            'Commission': 'commission.json',
        }
        for sheet_name, out_file in raw_mappings.items():
            extract_raw_json(wb, sheet_name, out_file)

    print(f"\nTotal Extraction time: {time.time() - start_time:.1f}s")


if __name__ == "__main__":
    run()
