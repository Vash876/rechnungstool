@echo off
echo ========================================
echo   🚀 Rechnungstool Server Starter
echo ========================================
echo.

REM Wechsle ins Projektverzeichnis
cd /d "c:\Users\igorn\projects\Rechnungs und Angebotstool"

echo 🔧 Starte Backend Server...
start "Backend Server" cmd /k "cd /d backend && npm run dev"

echo ⏳ Warte 3 Sekunden...
timeout /t 3 /nobreak > nul

echo 🎨 Starte Frontend Server...
start "Frontend Server" cmd /k "cd /d frontend && npm run dev"

echo.
echo ✅ Server werden gestartet!
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔗 Backend:  http://localhost:3000
echo 🗄️ Prisma Studio: Manuell starten mit 'npm run db:studio' im Backend
echo.
echo ⚠️ Zum Beenden: Schließe einfach die Fenster oder drücke Ctrl+C
echo.
pause
