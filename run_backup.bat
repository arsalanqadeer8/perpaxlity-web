@echo off
echo ========================================================
echo Oxford Excellence Academy - Automated Database Backup
echo ========================================================
echo.

cd /d "%~dp0"
node scripts\automated_backup.js

echo.
echo Backup process finished.
timeout /t 5
