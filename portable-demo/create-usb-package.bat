@echo off
title USB Demo Package Builder
color 0E

echo ========================================
echo   📦 USB Demo Package Builder
echo ========================================
echo.

set SOURCE_DIR=%~dp0..
set USB_DIR=%~dp0usb-demo
set DATE_TIME=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%

echo 🗂️ Erstelle Demo Package...
echo.

REM Erstelle USB Demo Ordner
if exist "%USB_DIR%" rmdir /s /q "%USB_DIR%"
mkdir "%USB_DIR%"

echo ✅ Kopiere Backend...
xcopy "%SOURCE_DIR%\backend" "%USB_DIR%\backend" /E /I /H /Y /Q

echo ✅ Kopiere Frontend...  
xcopy "%SOURCE_DIR%\frontend" "%USB_DIR%\frontend" /E /I /H /Y /Q

REM Kopiere wichtige Root-Dateien
echo ✅ Kopiere Config-Dateien...
copy "%SOURCE_DIR%\README.md" "%USB_DIR%\" >nul 2>&1
copy "%SOURCE_DIR%\.env.example" "%USB_DIR%\" >nul 2>&1

REM Kopiere Demo-Skripte
echo ✅ Kopiere Demo-Skripte...
copy "%~dp0start-demo.bat" "%USB_DIR%\" >nul
copy "%~dp0setup-demo.bat" "%USB_DIR%\" >nul
copy "%~dp0README-DEMO.md" "%USB_DIR%\" >nul

REM Lösche node_modules und andere große Ordner
echo 🧹 Bereinige für USB...
if exist "%USB_DIR%\backend\node_modules" rmdir /s /q "%USB_DIR%\backend\node_modules"
if exist "%USB_DIR%\frontend\node_modules" rmdir /s /q "%USB_DIR%\frontend\node_modules"
if exist "%USB_DIR%\backend\dist" rmdir /s /q "%USB_DIR%\backend\dist"
if exist "%USB_DIR%\frontend\dist" rmdir /s /q "%USB_DIR%\frontend\dist"

REM Erstelle .env für Demo
echo ✅ Erstelle Demo-Konfiguration...
echo DATABASE_URL="file:./dev.db" > "%USB_DIR%\backend\.env"
echo JWT_SECRET="demo-secret-key-for-presentation" >> "%USB_DIR%\backend\.env"
echo NODE_ENV="development" >> "%USB_DIR%\backend\.env"
echo PORT=3000 >> "%USB_DIR%\backend\.env"

REM Erstelle Installations-Anweisungen
echo ✅ Erstelle Anweisungen...
echo. > "%USB_DIR%\SCHNELLSTART.txt"
echo ========================================= >> "%USB_DIR%\SCHNELLSTART.txt"
echo   🚀 RECHNUNGSTOOL DEMO - SCHNELLSTART = >> "%USB_DIR%\SCHNELLSTART.txt"
echo ========================================= >> "%USB_DIR%\SCHNELLSTART.txt"
echo. >> "%USB_DIR%\SCHNELLSTART.txt"
echo 1. setup-demo.bat ausführen (einmalig) >> "%USB_DIR%\SCHNELLSTART.txt"
echo 2. start-demo.bat ausführen >> "%USB_DIR%\SCHNELLSTART.txt"
echo 3. Browser öffnet automatisch >> "%USB_DIR%\SCHNELLSTART.txt"
echo. >> "%USB_DIR%\SCHNELLSTART.txt"
echo Login: admin@handwerk.de / admin123 >> "%USB_DIR%\SCHNELLSTART.txt"
echo. >> "%USB_DIR%\SCHNELLSTART.txt"
echo Benötigt: Node.js (wird automatisch erkannt) >> "%USB_DIR%\SCHNELLSTART.txt"

echo.
echo ========================================
echo   ✅ USB Demo Package erstellt!
echo ========================================
echo.
echo 📁 Speicherort: %USB_DIR%
echo 💾 Größe: 
dir "%USB_DIR%" | find "Datei(en)"
echo.
echo 📋 Nächste Schritte:
echo 1. Ordner "usb-demo" auf USB-Stick kopieren
echo 2. Beim Kunden: setup-demo.bat ausführen  
echo 3. Danach: start-demo.bat für Demo
echo.
echo 🎯 Demo-Login: admin@handwerk.de / admin123
echo.
pause
