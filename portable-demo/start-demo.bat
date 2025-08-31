@echo off
title Rechnungs- und Angebotstool Demo
color 0A

echo ========================================
echo    Rechnungs- und Angebotstool Demo
echo ========================================
echo.
echo Starte Backend Server...
echo.

REM Prüfe ob Node.js verfügbar ist
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo FEHLER: Node.js ist nicht installiert!
    echo.
    echo Bitte installieren Sie Node.js von: https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Wechsle ins Backend-Verzeichnis
cd /d "%~dp0\..\backend"

REM Installiere Dependencies falls nötig
if not exist "node_modules" (
    echo Installiere Abhängigkeiten...
    call npm install
)

REM Generiere Prisma Client
echo Generiere Datenbank...
call npx prisma generate
call npx prisma db push

REM Starte Backend Server
echo.
echo ========================================
echo   🚀 Server wird gestartet...
echo   📱 Frontend: http://localhost:3000
echo   🔧 Backend API: http://localhost:3000/api
echo ========================================
echo.
echo ✅ Login: admin@handwerk.de / admin123
echo.
echo Zum Beenden: Strg+C drücken
echo ========================================

REM Öffne Browser automatisch nach 3 Sekunden
timeout /t 3 /nobreak >nul
start http://localhost:3000

REM Starte Server
call npm run dev

pause
