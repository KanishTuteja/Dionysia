@echo off
REM =====================================================================
REM   DIONYSIA — One-click deploy script
REM   Cleans dev files, initializes git, commits, force-pushes to GitHub.
REM   Prereqs: git installed, GitHub credentials saved (Git Credential
REM            Manager handles this on Windows automatically the first time).
REM =====================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ========================================
echo   DIONYSIA DEPLOY
echo ========================================
echo.

REM --- 1. Clean up dev-only files ---
echo [1/6] Removing dev-only files...
if exist supabase-test.html (
  del /F /Q supabase-test.html
  echo       deleted supabase-test.html
) else (
  echo       supabase-test.html already gone
)
if exist discover-tweaks.jsx (
  del /F /Q discover-tweaks.jsx
  echo       deleted discover-tweaks.jsx
) else (
  echo       discover-tweaks.jsx already gone
)
if exist tweaks-panel.jsx (
  del /F /Q tweaks-panel.jsx
  echo       deleted tweaks-panel.jsx
) else (
  echo       tweaks-panel.jsx already gone
)

REM --- 2. Reset any partial .git from prior attempts ---
echo.
echo [2/6] Resetting any partial git state...
if exist .git (
  rmdir /S /Q .git
  echo       cleared old .git folder
) else (
  echo       no prior .git, fresh start
)

REM --- 3. Initialize fresh repo ---
echo.
echo [3/6] Initializing git...
git init -b main
git config user.email "kanishtuteja@gmail.com"
git config user.name "Kanish Tuteja"

REM --- 4. Stage and commit ---
echo.
echo [4/6] Staging all files and committing...
git add -A
git commit -m "Full DIONYSIA app: auth, database, mux foundation, mobile nav, signal rating, plausible"

REM --- 5. Wire remote ---
echo.
echo [5/6] Wiring remote: KanishTuteja/Dionysia...
git remote add origin https://github.com/KanishTuteja/Dionysia.git

REM --- 6. Force push (overwrites the old coming-soon-only repo) ---
echo.
echo [6/6] Force-pushing to GitHub main branch...
echo.
echo       (If prompted for credentials, enter your GitHub username and
echo        a Personal Access Token. Generate one at:
echo        https://github.com/settings/tokens?type=beta )
echo.
git push -u origin main --force

echo.
echo ========================================
if %ERRORLEVEL% EQU 0 (
  echo   DEPLOY COMPLETE
  echo ========================================
  echo.
  echo   Vercel will auto-deploy in ~30 seconds.
  echo   Watch: https://vercel.com/dionysia/dionysia/deployments
  echo   Live:  https://dionysia.ca
) else (
  echo   DEPLOY FAILED — see errors above
  echo ========================================
)
echo.
pause
