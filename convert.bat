@echo off
setlocal

:: --- CONFIGURATION ---
set "INPUT_XLSX=%~dp0menu.xlsx"
set "TEMP_CSV=%~dp0temp_menu.csv"
set "OUTPUT_JS=%~dp0menu.js"

:: Check if XLSX exists
if not exist "%INPUT_XLSX%" (
    echo Error: menu.xlsx not found.
    pause
    exit /b
)

echo 1. Converting XLSX to CSV using PowerShell...

:: Create a temporary PowerShell script to handle the Excel conversion
echo $excel = New-Object -ComObject Excel.Application > convert.ps1
echo $excel.Visible = $false >> convert.ps1
echo $excel.DisplayAlerts = $false >> convert.ps1
echo $wb = $excel.Workbooks.Open('%INPUT_XLSX%') >> convert.ps1
:: 6 equals the CSV format code in Excel
echo $wb.SaveAs('%TEMP_CSV%', 6) >> convert.ps1
echo $wb.Close($false) >> convert.ps1
echo $excel.Quit() >> convert.ps1
echo [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) ^| Out-Null >> convert.ps1

:: Run the PowerShell script
powershell -ExecutionPolicy Bypass -File convert.ps1

:: Check if CSV was created successfully
if not exist "%TEMP_CSV%" (
    echo Error: Failed to convert Excel file. Make sure Excel is installed.
    del convert.ps1
    pause
    exit /b
)

echo 2. Wrapping CSV content into JS format...

:: Write the top of the JS file
echo const menuData = `> "%OUTPUT_JS%"

:: Append the temporary CSV content
type "%TEMP_CSV%" >> "%OUTPUT_JS%"

:: Write the bottom of the JS file
echo `; >> "%OUTPUT_JS%"

echo 3. Cleaning up temporary files...
del convert.ps1
del "%TEMP_CSV%"

echo Success! Saved to %OUTPUT_JS%
pause