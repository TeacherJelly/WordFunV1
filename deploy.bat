@echo off
setlocal

:: Force the script to run from the exact folder where this batch file is saved
cd /d "%~dp0"

title Deploying WordFunV1 to GitHub Pages

:: Hardcoded Repository Settings
set "REPO_URL=https://github.com/TeacherJelly/WordFunV1.git"
set "REPO_NAME=WordFunV1"

echo ========================================================
echo       Deploying %REPO_NAME% to GitHub Pages
echo ========================================================
echo.

:: -----------------------------------------------------------------
:: STEP 1: Check for Node.js
:: -----------------------------------------------------------------
echo [1/7] Checking for Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    set "ERR_TITLE=Node.js is Missing or Not Found"
    set "ERR_WHAT=Your computer could not find Node.js, which is required to run React and Vite projects."
    set "ERR_HOW=Download and install the LTS version of Node.js from https://nodejs.org/, restart your computer, and run this script again."
    goto ShowError
)
echo Node.js found successfully.
echo.

:: -----------------------------------------------------------------
:: STEP 2: Verify Project Folder
:: -----------------------------------------------------------------
echo [2/7] Verifying game project folder...
if not exist "package.json" (
    set "ERR_TITLE=Project File 'package.json' Missing"
    set "ERR_WHAT=The script cannot find 'package.json' in the current folder, meaning it is not running inside your game's root directory."
    set "ERR_HOW=Move this 'deploy.bat' file into the exact folder that contains your 'package.json' and 'src' folder, then run it again."
    goto ShowError
)
echo Project folder verified.
echo.

:: -----------------------------------------------------------------
:: STEP 3: Check Git and Connect Repository
:: -----------------------------------------------------------------
echo [3/7] Connecting to GitHub repository (%REPO_NAME%)...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    set "ERR_TITLE=Git is Not Installed"
    set "ERR_WHAT=The system could not find Git, which is required to upload your code to GitHub."
    set "ERR_HOW=Download and install Git from https://git-scm.com/ using the default settings, then close and reopen this folder to run the script again."
    goto ShowError
)

if not exist ".git" (
    git init >nul 2>&1
)

git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    git remote add origin %REPO_URL%
) else (
    git remote set-url origin %REPO_URL%
)
if %errorlevel% neq 0 (
    set "ERR_TITLE=Failed to Link GitHub Repository"
    set "ERR_WHAT=Git could not connect to your GitHub repository URL."
    set "ERR_HOW=Check your internet connection and verify that your repository URL (https://github.com/TeacherJelly/WordFunV1.git) is correct."
    goto ShowError
)
echo Connected to repository successfully.
echo.

:: -----------------------------------------------------------------
:: STEP 4: Configure Vite and Package Scripts safely
:: -----------------------------------------------------------------
echo [4/7] Configuring Vite base path and package.json scripts...

if exist temp_config_fix.js del temp_config_fix.js

echo const fs = require('fs'); > temp_config_fix.js
echo try { >> temp_config_fix.js
echo   const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); >> temp_config_fix.js
echo   if (!pkg.scripts) pkg.scripts = {}; >> temp_config_fix.js
echo   pkg.scripts.predeploy = 'npm run build'; >> temp_config_fix.js
echo   pkg.scripts.deploy = 'gh-pages -d dist'; >> temp_config_fix.js
echo   fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2)); >> temp_config_fix.js
echo } catch (e) { >> temp_config_fix.js
echo   console.error('PKG_ERR:', e.message); >> temp_config_fix.js
echo   process.exit(1); >> temp_config_fix.js
echo } >> temp_config_fix.js
echo try { >> temp_config_fix.js
echo   const files = ['vite.config.ts', 'vite.config.js']; >> temp_config_fix.js
echo   const file = files.find(f => fs.existsSync(f)); >> temp_config_fix.js
echo   if (file) { >> temp_config_fix.js
echo     let content = fs.readFileSync(file, 'utf8'); >> temp_config_fix.js
echo     if (content.indexOf('base:') === -1) { >> temp_config_fix.js
echo       content = content.replace(/return\s*\{/, "return {\n      base: '/WordFunV1/',"); >> temp_config_fix.js
echo       fs.writeFileSync(file, content); >> temp_config_fix.js
echo     } >> temp_config_fix.js
echo   } else { >> temp_config_fix.js
echo     console.error('VITE_ERR: No vite.config file found!'); >> temp_config_fix.js
echo     process.exit(1); >> temp_config_fix.js
echo   } >> temp_config_fix.js
echo } catch (e) { >> temp_config_fix.js
echo   console.error('VITE_ERR:', e.message); >> temp_config_fix.js
echo   process.exit(1); >> temp_config_fix.js
echo } >> temp_config_fix.js

node temp_config_fix.js
set "CONFIG_EXIT=%errorlevel%"
if exist temp_config_fix.js del temp_config_fix.js

if %CONFIG_EXIT% neq 0 (
    set "ERR_TITLE=Could Not Update Project Configuration Files"
    set "ERR_WHAT=An error occurred while automatically modifying your package.json or vite.config file."
    set "ERR_HOW=Ensure your package.json and vite.config.ts are not open/locked in another program, or add base: '/WordFunV1/' inside your vite.config file manually."
    goto ShowError
)
echo Configuration updated successfully.
echo.

:: -----------------------------------------------------------------
:: STEP 5: Install Dependencies & gh-pages
:: -----------------------------------------------------------------
echo [5/7] Installing project packages and deployment tools...
call npm install
if %errorlevel% neq 0 (
    set "ERR_TITLE=Failed to Install Project Dependencies (npm install)"
    set "ERR_WHAT=Node.js tried to download necessary game libraries from the internet but failed."
    set "ERR_HOW=Check your internet connection or corporate firewall/VPN settings, and try running the script again."
    goto ShowError
)

call npm install gh-pages --save-dev
if %errorlevel% neq 0 (
    set "ERR_TITLE=Failed to Install 'gh-pages' Tool"
    set "ERR_WHAT=npm could not install the helper package required to push your built website to GitHub Pages."
    set "ERR_HOW=Right-click your batch file, select 'Run as administrator', or check your internet connection."
    goto ShowError
)
echo All dependencies installed.
echo.

:: -----------------------------------------------------------------
:: STEP 6: Build Game and Push Source Code
:: -----------------------------------------------------------------
echo [6/7] Building game and backing up source code to GitHub...
call npm run build
if %errorlevel% neq 0 (
    set "ERR_TITLE=Game Build Failed (Vite Compilation Error)"
    set "ERR_WHAT=There is a syntax error or broken code inside your React/AI Studio files preventing the game from turning into a website."
    set "ERR_HOW=Look at the red error messages printed by Vite right above this box to find the exact file and line number with the bug, fix it in your code, and run this script again."
    goto ShowError
)

git branch -M main
git add .
git commit -m "Deploy WordFunV1 updates" >nul 2>&1
git push -u origin main
if %errorlevel% neq 0 (
    set "ERR_TITLE=Failed to Upload Source Code to GitHub"
    set "ERR_WHAT=GitHub rejected your code upload. This usually happens if you are not signed into Git on this PC, or if your GitHub repository has a README file created online that conflicts with your local files."
    set "ERR_HOW=Open your command prompt in this folder, run 'git pull origin main --rebase', sign in when prompted, and run this script again."
    goto ShowError
)
echo Source code pushed to main branch.
echo.

:: -----------------------------------------------------------------
:: STEP 7: Publish to GitHub Pages
:: -----------------------------------------------------------------
echo [7/7] Publishing live website to GitHub Pages...
call npm run deploy
if %errorlevel% neq 0 (
    set "ERR_TITLE=Failed to Publish to GitHub Pages"
    set "ERR_WHAT=The deployment tool could not push the built website files to the 'gh-pages' branch on GitHub."
    set "ERR_HOW=Check your internet connection and ensure your GitHub account has proper write permissions to the repository."
    goto ShowError
)

:: -----------------------------------------------------------------
:: SUCCESS
:: -----------------------------------------------------------------
echo.
echo ========================================================
echo   SUCCESS! WordFunV1 is successfully deployed!
echo ========================================================
echo 1. Go to: https://github.com/TeacherJelly/WordFunV1/settings/pages
echo 2. Under "Branch", select "gh-pages" and click Save.
echo 3. Wait 1-2 minutes, then play your game at:
echo    https://teacherjelly.github.io/WordFunV1/
echo.
echo Press any key to exit...
pause >nul
exit /b 0

:: -----------------------------------------------------------------
:: ERROR HANDLER
:: -----------------------------------------------------------------
:ShowError
if exist temp_config_fix.js del temp_config_fix.js
echo.
echo ========================================================
echo  ERROR DETECTED: %ERR_TITLE%
echo ========================================================
echo.
echo [What went wrong]:
echo %ERR_WHAT%
echo.
echo [How to fix it]:
echo %ERR_HOW%
echo.
echo ========================================================
echo Press any key to exit...
pause >nul
exit /b 1