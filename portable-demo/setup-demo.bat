@echo off
title Rechnungs- und Angebotstool - Setup
color 0B

echo ========================================
echo   Setup: Rechnungs- und Angebotstool  
echo ========================================
echo.

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

echo.
echo 📦 Installiere Backend Dependencies...
cd /d "%~dp0\..\backend"
call npm install

echo.
echo 🎨 Installiere Frontend Dependencies...
cd /d "%~dp0\..\frontend"  
call npm install

echo.
echo 🗄️ Setup Datenbank...
cd /d "%~dp0\..\backend"
call npx prisma generate
call npx prisma db push

echo.
echo ========================================
echo   ✅ Setup abgeschlossen!
echo ========================================
echo.
echo Zum Starten: start-demo.bat ausführen
echo.
pause
