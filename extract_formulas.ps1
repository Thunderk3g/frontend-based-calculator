param (
    [string]$filePath,
    [string[]]$sheetNames
)

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    $fullPath = [System.IO.Path]::GetFullPath($filePath)
    $workbook = $excel.Workbooks.Open($fullPath)
    $results = @{}

    foreach ($sheetName in $sheetNames) {
        $sheet = $workbook.Sheets.Item($sheetName)
        $sheetData = @()

        try {
            $formulaCells = $sheet.UsedRange.SpecialCells(-4123) # xlCellTypeFormulas
            foreach ($cell in $formulaCells) {
                $sheetData += @{
                    address = $cell.AddressLocal($false, $false)
                    formula = $cell.Formula
                    value = $cell.Value2
                }
            }
        } catch {
            # No formulas found in this sheet
        }
        $results[$sheetName] = $sheetData
    }

    $names = @()
    foreach ($n in $workbook.Names) {
        $names += @{
            name = $n.Name
            refersTo = $n.RefersTo
        }
    }
    $names | ConvertTo-Json | Out-File "named_ranges.json" -Encoding utf8

    $results | ConvertTo-Json -Depth 10 | Out-File "extracted_formulas_com.json" -Encoding utf8
}
catch {
    Write-Error $_.Exception.Message
}
finally {
    if ($workbook) { $workbook.Close($false) }
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
