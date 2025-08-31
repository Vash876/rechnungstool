@echo off
echo ========================================
echo   🛑 Rechnungstool Server Stopper
echo ========================================
echo.

echo 🔄 Beende alle Node.js Prozesse...

REM Beende alle node.exe Prozesse (vorsichtig verwenden!)
taskkill /f /im node.exe 2>nul
if %errorlevel% == 0 (
    echo ✅ Node.js Prozesse beendet
) else (
    echo ⚠️ Keine Node.js Prozesse gefunden
)

REM Beende alle tsx Prozesse
taskkill /f /im tsx.exe 2>nul

REM Beende spezifische Prozesse nach Port (falls verfügbar)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo 🔌 Beende Prozess auf Port 3000 (PID: %%a)
    taskkill /f /pid %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    echo 🔌 Beende Prozess auf Port 5173 (PID: %%a)
    taskkill /f /pid %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":5555" ^| find "LISTENING"') do (
    echo 🔌 Beende Prozess auf Port 5555 (PID: %%a)
    taskkill /f /pid %%a 2>nul
)

echo.
echo ✅ Alle Server wurden beendet!
echo.
pause
