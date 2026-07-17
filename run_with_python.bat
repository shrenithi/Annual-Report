@echo off
title Annual Report - Python Server
echo ===================================================
echo Starting Static HTTP Server via Python...
echo ===================================================
echo.
echo Click or open this link in your browser:
echo http://localhost:8000/
echo.
echo ===================================================
echo (Keep this window open while using the application)
echo ===================================================
echo.

:: Try 'py' launcher first (highly recommended on Windows)
py -m http.server 8000
if %ERRORLEVEL% EQU 0 goto end

:: Fallback to 'python'
python -m http.server 8000
if %ERRORLEVEL% EQU 0 goto end

echo.
echo ===================================================
echo ERROR: Python is not detected on your system PATH.
echo.
echo Please make sure you have Python installed, and that
echo "Add Python to PATH" was checked during installation.
echo ===================================================

:end
pause
