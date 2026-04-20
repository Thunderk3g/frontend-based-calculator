import json

def find_cells(json_file, target_cells):
    try:
        encodings = ['utf-8-sig', 'utf-16', 'utf-8']
        data = None
        for enc in encodings:
            try:
                with open(json_file, 'r', encoding=enc) as f:
                    data = json.load(f)
                break
            except:
                continue
        
        if data is None: return {}
            
        results = {}
        for sheet_name, cells in data.items():
            for cell in cells:
                if cell['address'] in target_cells:
                    if sheet_name not in results:
                        results[sheet_name] = []
                    results[sheet_name].append(cell)
        return results
    except Exception as e:
        return str(e)

json_path = r'c:\Users\Diwakar.Adhikari01\Desktop\excel-logic\extracted_formulas_com.json'
# F6, H6 on Output sheet
targets = ['F6', 'G6', 'H6', 'I6', 'J6', 'F7', 'G7', 'H7', 'I7', 'J7']
print(json.dumps(find_cells(json_path, targets), indent=4))
