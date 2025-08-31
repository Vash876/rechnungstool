@echo off
echo ========================================
echo   🗄️ Prisma Studio Starter
echo ========================================
echo.

REM Wechsle ins Backend-Verzeichnis
cd /d "c:\Users\igorn\projects\Rechnungs und Angebotstool\backend"

echo 🚀 Starte Prisma Studio...
echo 📊 URL: http://localhost:5555
echo.

npm run db:studio

pause
