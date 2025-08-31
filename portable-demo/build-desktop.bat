@echo off
title Desktop App Builder - Rechnungstool
color 0E

echo ========================================
echo   📦 Desktop App Builder
echo ========================================
echo.

echo 🔨 Baue Desktop-Anwendung...
echo.

REM Stelle sicher, dass Backend vorbereitet ist
echo ✅ Bereite Backend vor...
cd /d "%~dp0\..\backend"

REM Installiere Backend Dependencies
if not exist "node_modules" (
    echo 📦 Installiere Backend Dependencies...
    call npm install --production
) else (
    echo ✅ Backend Dependencies bereits installiert
)

REM Stelle sicher, dass alle Dependencies vorhanden sind
echo 🔄 Aktualisiere Dependencies für Production...
call npm install --production

REM Kompiliere TypeScript zu JavaScript
echo 🔨 Kompiliere Backend...
call npm run build

REM Generiere Prisma Client
echo 🗄️ Generiere Prisma Client...
call npx prisma generate

REM Stelle sicher, dass Frontend gebaut ist
echo ✅ Prüfe Frontend Build...
cd /d "%~dp0\..\frontend"
if not exist "dist" (
    echo 🎨 Baue Frontend...
    call npm run build
) else (
    echo ✅ Frontend bereits gebaut
)

REM Zurück zum Electron-Ordner
cd /d "%~dp0"

REM Installiere Electron Dependencies
if not exist "node_modules" (
    echo 📦 Installiere Electron Dependencies...
    call npm install
) else (
    echo ✅ Electron Dependencies bereits installiert
)

echo.
echo 🔨 Erstelle ausführbare Desktop-App...
echo    (Das kann einige Minuten dauern...)
echo.

REM Erstelle die .env Datei für das Backend im Build
echo ✅ Erstelle Production-Konfiguration...
echo DATABASE_URL="file:./dev.db" > "%~dp0\..\backend\.env.production"
echo JWT_SECRET="production-secret-key-change-in-real-deployment" >> "%~dp0\..\backend\.env.production"
echo NODE_ENV="production" >> "%~dp0\..\backend\.env.production"
echo PORT=3000 >> "%~dp0\..\backend\.env.production"

REM Baue die Desktop-App
call npm run pack

echo.
echo ========================================
echo   ✅ Desktop App erstellt!
echo ========================================
echo.
echo 📁 Speicherort: %~dp0dist\win-unpacked\
echo 📦 Installer: %~dp0dist\
echo.
echo 💾 Die App ist jetzt als .exe verfügbar und kann
echo    auf anderen Windows-PCs ohne Node.js laufen!
echo.
echo 📋 Zum Testen: 
echo    1. Gehe in den 'dist\win-unpacked' Ordner
echo    2. Starte 'Rechnungstool.exe'
echo.
echo 💡 Für Verteilung:
echo    Die komplette Ordner 'win-unpacked' kopieren
echo    ODER den Installer aus 'dist' verwenden
echo.
pause
