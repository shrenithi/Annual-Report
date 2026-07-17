@echo off
title Annual Report Portal - Git Push Helper
echo ====================================================================
echo             ANNUAL REPORT PORTAL - GIT PUSH ASSISTANT
echo ====================================================================
echo.
echo This helper script will upload your completed local workspace code
echo to your GitHub repository:
echo https://github.com/shrenithi/Annual-Report
echo.

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git command line utility was not found on your system PATH.
    echo Please install Git from https://git-scm.com/ and try again.
    echo.
    pause
    exit /b
)

:: Initialize git if not already initialized
if not exist ".git" (
    echo [INFO] Initializing new Git repository...
    git init
    echo.
) else (
    echo [INFO] Git repository already initialized.
)

:: Link to remote repository
echo [INFO] Configuring remote origin...
git remote remove origin >nul 2>nul
git remote add origin https://github.com/shrenithi/Annual-Report.git
echo.

:: Stage all files
echo [INFO] Staging all files...
git add .
echo.

:: Check if there are changes to commit
git status | findstr /C:"nothing to commit" >nul
if %errorlevel% equ 0 (
    echo [INFO] No new changes to commit.
) else (
    echo [INFO] Committing changes...
    git commit -m "Initialize Annual Report Portal with premium glassmorphic SPA"
    echo.
)

:: Set branch name to main
echo [INFO] Setting default branch to main...
git branch -M main
echo.

:: Push changes
echo [INFO] Pushing code to GitHub...
echo (A GitHub login prompt or SSH authorization dialog may appear)
echo.
git push -u origin main

echo.
echo ====================================================================
echo Success! Your code is now synced to GitHub.
echo Repository link: https://github.com/shrenithi/Annual-Report
echo ====================================================================
echo.
pause
