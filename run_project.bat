@echo off
title Annual Report Management System - Run Portal
echo ===================================================
echo Starting Annual Report Management System...
echo ===================================================
echo.
echo Installing dependencies (if required)...
call npm install
echo.
echo Launching local server...
npm run dev
pause
