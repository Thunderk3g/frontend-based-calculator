import os
import json
import time

try:
    import win32com.client
except ImportError:
    print("pip install pywin32 required for live Excel automation")
    exit(1)

EXCEL_FILE = os.path.abspath("BI_eTouch II_V07_Ver0.2.xlsb")

# Sample data to inject to test the mechanism
TEST_CASES = [
    {"age": 30, "gender": "Male", "pt": 40, "ppt": 40, "sa": 10000000, "smoker": "Non Smoker"},
    {"age": 45, "gender": "Female", "pt": 20, "ppt": 10, "sa": 20000000, "smoker": "Smoker Preferred"}
]

def run_live_test():
    print("Launching Excel COM Object (this may take a moment)...")
    excel = win32com.client.DispatchEx("Excel.Application")
    excel.Visible = False
    excel.DisplayAlerts = False
    
    try:
        print(f"Opening Workbook: {EXCEL_FILE}")
        start_wb = time.time()
        wb = excel.Workbooks.Open(EXCEL_FILE, UpdateLinks=0, ReadOnly=True)
        print(f"Workbook opened in {time.time() - start_wb:.2f} seconds")
        
        ws_in = wb.Sheets("Input")
        ws_out = wb.Sheets("Output")
        
        results = []
        for i, tc in enumerate(TEST_CASES):
            # In real 30K script, map all exact cells: Age, Gender, PT, PPT, SA, etc.
            # E.g., ws_in.Range("C6").Value = tc["age"]
            print(f"[{i+1}/{len(TEST_CASES)}] Passing to Excel: {tc}")
            
            # Since cell addresses are unknown here without mapping, we just demonstrate:
            # ws_in.Range("C8").Value = tc["age"]
            # ws_in.Range("C9").Value = tc["gender"]
            
            # excel.Calculate() # Force sheet calculate
            
            # test_result = ws_out.Range("E34").Value # Example reading Premium total
            results.append({"status": "Simulation Prepared - Cell Mappings Needed"})
            
    except Exception as e:
        print(f"Excel Automation Error: {str(e)}")
    finally:
        try:
            wb.Close(SaveChanges=False)
            excel.Quit()
        except:
            pass

if __name__ == "__main__":
    run_live_test()
