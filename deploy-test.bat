@echo off
REM =====================================================================
REM   DIONYSIA - TEST deploy script
REM   Pushes the site to a SEPARATE test repo (Dionysia-test) so you can
REM   preview it on your phone and laptop.
REM
REM   This NEVER touches dionysia.ca. The live coming-soon page lives in
REM   the separate "Dionysia" repo / Vercel project and is not affected.
REM
REM   ONE-TIME SETUP before the first run:
REM     1. On GitHub, create an empty repo named exactly:  Dionysia-test
REM     2. In Vercel, "Add New Project" and import the Dionysia-test repo
REM        - this gives you a test URL like dionysia-test.vercel.app
REM     3. In Supabase: Authentication -> URL Configuration -> Redirect
REM        URLs, add:  https://*.vercel.app/**
REM        (covers the test URL so magic-link login works there)
REM
REM   After that, just run this file any time you want to update the test
REM   site. To deploy the REAL launch on May 24, use deploy.bat instead.
REM =====================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ========================================
echo   DIONYSIA  -  TEST DEPLOY
echo   (does NOT affect dionysia.ca)
echo ========================================
echo.

REM --- 1. Reset any partial .git from a prior run ---
echo [1/4] Resetting git state...
if exist .git (
  rmdir /S /Q .git
  echo       cleared old .git folder
) else (
  echo       no prior .git, fresh start
)

REM --- 2. Initialize a fresh repo ---
echo.
echo [2/4] Initializing git...
git init -b main
git config user.email "kanishtuteja@gmail.com"
git config user.name "Kanish Tuteja"

REM --- 3. Stage and commit everything ---
echo.
echo [3/4] Staging all files and committing...
git add -A
git commit -m "DIONYSIA site - test build"

REM --- 4. Wire the TEST remote and push ---
echo.
echo [4/4] Force-pushing to GitHub: KanishTuteja/Dionysia-test ...
echo.
echo       (If prompted, enter your GitHub username and a Personal
echo        Access Token: https://github.com/settings/tokens?type=beta )
echo.
git remote add origin https://github.com/KanishTuteja/Dionysia-test.git
git push -u origin main --force

echo.
echo ========================================
if %ERRORLEVEL% EQU 0 (
  echo   TEST DEPLOY COMPLETE
  echo ========================================
  echo.
  echo   Vercel rebuilds the TEST project in ~30 seconds.
  echo   Open your test URL on your phone and laptop.
  echo.
  echo   dionysia.ca is untouched - still showing coming-soon.
) else (
  echo   TEST DEPLOY FAILED - see errors above
  echo   ^( Did you create the Dionysia-test repo on GitHub first? ^)
  echo ========================================
)
echo.
pause
