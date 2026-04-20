import json

def get_range(json_file, sheet_name, start_col, start_row, end_col, end_row):
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
        
        if data is None:
            return "Failed to load JSON"
            
        sheet_data = data.get(sheet_name, [])
        results = []
        
        # Simple column to index mapping (A=1, B=2, etc.)
        def col_to_num(col):
            num = 0
            for char in col:
                num = num * 26 + (ord(char.upper()) - ord('A') + 1)
            return num
        
        def split_address(addr):
            import re
            match = re.match(r"([A-Z]+)([0-9]+)", addr)
            return match.group(1), int(match.group(2))

        start_col_num = col_to_num(start_col)
        end_col_num = col_to_num(end_col)
        
        for cell in sheet_data:
            c_col, c_row = split_address(cell['address'])
            c_col_num = col_to_num(c_col)
            if start_col_num <= c_col_num <= end_col_num and start_row <= c_row <= end_row:
                results.append(cell)
        return results
    except Exception as e:
        return str(e)

json_path = r'c:\Users\Diwakar.Adhikari01\Desktop\excel-logic\extracted_formulas_com.json'
print(json.dumps(get_range(json_path, 'Calc', 'AH', 7, 'AJ', 10), indent=4))
