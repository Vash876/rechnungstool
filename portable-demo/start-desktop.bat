@echo off
title Rechnungstool Desktop App
color 0A

echo ========================================
echo   🖥️  Rechnungstool Desktop App
echo ========================================
echo.

echo 📋 Prüfe Voraussetzungen...

REM Prüfe ob Node.js verfügbar ist
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js ist nicht installiert!
    echo.
    echo 📥 Lade Node.js herunter...
    start https://nodejs.org/en/download/
    echo.
    echo Bitte Node.js installieren und dann erneut ausführen.
    pause
    exit /b 1
)

echo ✅ Node.js gefunden: 
node --version

REM Prüfe ob Backend Dependencies installiert sind
if not exist "..\backend\node_modules" (
    echo.
    echo 📦 Installiere Backend Dependencies...
    cd /d "%~dp0\..\backend"
    call npm install
    call npx prisma generate
    call npx prisma db push
    cd /d "%~dp0"
)

REM Prüfe ob Electron Dependencies installiert sind  
if not exist "node_modules" (
    echo.
    echo 🖥️ Installiere Electron Dependencies...
    call npm install
)

echo.
echo ========================================
echo   🚀 Starte Desktop App...
echo ========================================
echo.
echo ✅ Backend wird automatisch gestartet
echo ✅ App öffnet sich in wenigen Sekunden
echo ✅ Login: admin@handwerk.de / admin123
echo.
echo 🔧 Zum Debugging: Strg+Shift+I
echo 🛑 Zum Beenden: App-Fenster schließen
echo.

REM Starte Electron App
call npm run electron

echo.
echo App wurde beendet.
pause
