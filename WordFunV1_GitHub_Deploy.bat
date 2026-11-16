@echo off
setlocal EnableExtensions DisableDelayedExpansion

rem ============================================================
rem React + Vite -> GitHub deployment helper for Windows
rem Place this file in the root folder beside package.json.
rem ============================================================

 title REACT + VITE GITHUB DEPLOYMENT
 color 0B
 cls
 echo ============================================================
 echo          REACT + VITE - GITHUB DEPLOYMENT
 echo ============================================================
 echo.

set "PROJECT_DIR=%~dp0"
set "REPO_URL=https://github.com/TeacherJelly/WordFunV1.git"
cd /d "%PROJECT_DIR%"
if errorlevel 1 goto PROJECT_FOLDER_ERROR

 echo Project folder:
 echo %CD%
 echo.

rem Use a project-local portable Node.js folder if one exists.
if exist "%PROJECT_DIR%node\node.exe" set "PATH=%PROJECT_DIR%node;%PATH%"

rem Check for Node.js and npm.
where node >nul 2>&1
if errorlevel 1 goto NODE_ERROR
where npm >nul 2>&1
if errorlevel 1 goto NPM_ERROR

rem Check for Git. Also check common Git for Windows install locations.
where git >nul 2>&1
if errorlevel 1 if exist "%ProgramFiles%\Git\cmd\git.exe" set "PATH=%ProgramFiles%\Git\cmd;%PATH%"
where git >nul 2>&1
if errorlevel 1 if exist "%ProgramFiles(x86)%\Git\cmd\git.exe" set "PATH=%ProgramFiles(x86)%\Git\cmd;%PATH%"
where git >nul 2>&1
if errorlevel 1 goto GIT_ERROR

rem Confirm this is a React/Vite project folder.
if not exist "package.json" goto PACKAGE_JSON_ERROR

 echo [1/8] Checking tools...
 echo Node.js version:
call node --version
if errorlevel 1 goto NODE_ERROR
 echo npm version:
call npm --version
if errorlevel 1 goto NPM_ERROR
 echo Git version:
call git --version
if errorlevel 1 goto GIT_ERROR
 echo.

rem Initialize Git if the project has not been initialized yet.
 echo [2/8] Checking Git repository...
if not exist ".git" (
    echo No local Git repository was found. Initializing one now...
    call git init
    if errorlevel 1 goto GIT_INIT_ERROR
)

rem Make sure this project uses the main branch.
call git branch -M main
if errorlevel 1 goto BRANCH_ERROR

rem Connect this project to the repository supplied by the user.
rem If origin already points somewhere else, update it to the supplied repository.
 echo Target GitHub repository:
 echo %REPO_URL%
 echo.
set "CURRENT_ORIGIN="
for /f "delims=" %%R in ('git remote get-url origin 2^>nul') do set "CURRENT_ORIGIN=%%R"
if not defined CURRENT_ORIGIN goto ADD_GITHUB_REMOTE
if /I "%CURRENT_ORIGIN%"=="%REPO_URL%" goto REMOTE_READY

echo An existing origin remote points to:
echo %CURRENT_ORIGIN%
echo Updating origin to the repository specified in this batch file...
call git remote set-url origin "%REPO_URL%"
if errorlevel 1 goto REMOTE_SET_ERROR
goto REMOTE_READY

:ADD_GITHUB_REMOTE
 echo No origin remote was found. Connecting to your GitHub repository...
call git remote add origin "%REPO_URL%"
if errorlevel 1 goto REMOTE_ADD_ERROR

:REMOTE_READY
 echo.
 echo Connected GitHub remote:
call git remote get-url origin
if errorlevel 1 goto REMOTE_READ_ERROR
 echo.

rem Create or strengthen .gitignore so dependencies, build output and secrets
rem are not accidentally added to the repository.
 echo [3/8] Checking .gitignore safety rules...
if not exist ".gitignore" (
    >".gitignore" echo # Local dependencies
)
findstr /x /c:"node_modules/" ".gitignore" >nul 2>&1
if errorlevel 1 >>".gitignore" echo node_modules/
findstr /x /c:"dist/" ".gitignore" >nul 2>&1
if errorlevel 1 >>".gitignore" echo dist/
findstr /x /c:".env" ".gitignore" >nul 2>&1
if errorlevel 1 >>".gitignore" echo .env
findstr /x /c:".env.*" ".gitignore" >nul 2>&1
if errorlevel 1 >>".gitignore" echo .env.*
findstr /x /c:"!.env.example" ".gitignore" >nul 2>&1
if errorlevel 1 >>".gitignore" echo !.env.example

rem Stop if node_modules was already committed/tracked in Git.
call git ls-files node_modules | findstr /r "." >nul 2>&1
if not errorlevel 1 goto NODEMODULES_TRACKED_ERROR

rem Create a GitHub Pages workflow only when no workflow file exists.
 echo.
 echo [4/8] Checking GitHub Pages deployment workflow...
set "WORKFLOW_FOUND="
if exist ".github\workflows\*.yml" set "WORKFLOW_FOUND=1"
if exist ".github\workflows\*.yaml" set "WORKFLOW_FOUND=1"
if defined WORKFLOW_FOUND (
    echo An existing GitHub Actions workflow was found. It will not be overwritten.
    findstr /s /i /c:"actions/deploy-pages" ".github\workflows\*.yml" ".github\workflows\*.yaml" >nul 2>&1
    if errorlevel 1 (
        echo WARNING: I could not find an actions/deploy-pages step in the workflow files.
        echo Check that your existing workflow actually publishes to GitHub Pages.
    )
) else (
    echo No GitHub Actions workflow was found. Creating a Vite-to-GitHub-Pages workflow...
    if not exist ".github" mkdir ".github"
    if errorlevel 1 goto WORKFLOW_FOLDER_ERROR
    if not exist ".github\workflows" mkdir ".github\workflows"
    if errorlevel 1 goto WORKFLOW_FOLDER_ERROR
    (
        echo name: Deploy React Vite app to GitHub Pages
        echo.
        echo on:
        echo   push:
        echo     branches: [main]
        echo   workflow_dispatch:
        echo.
        echo permissions:
        echo   contents: read
        echo   pages: write
        echo   id-token: write
        echo.
        echo concurrency:
        echo   group: pages
        echo   cancel-in-progress: true
        echo.
        echo jobs:
        echo   deploy:
        echo     environment:
        echo       name: github-pages
        echo       url: ${{ steps.deployment.outputs.page_url }}
        echo     runs-on: ubuntu-latest
        echo     steps:
        echo       - name: Checkout source code
        echo         uses: actions/checkout@v7
        echo       - name: Set up Node.js
        echo         uses: actions/setup-node@v7
        echo         with:
        echo           node-version: lts/*
        echo       - name: Install dependencies
        echo         run: npm install --legacy-peer-deps
        echo       - name: Build Vite application
        echo         run: npm run build
        echo       - name: Configure GitHub Pages
        echo         uses: actions/configure-pages@v6
        echo       - name: Upload website files
        echo         uses: actions/upload-pages-artifact@v5
        echo         with:
        echo           path: ./dist
        echo       - name: Deploy website
        echo         id: deployment
        echo         uses: actions/deploy-pages@v5
    ) > ".github\workflows\deploy.yml"
    if errorlevel 1 goto WORKFLOW_CREATE_ERROR
    echo GitHub Pages workflow created: .github\workflows\deploy.yml
)

rem Install project dependencies. This includes the legacy peer dependency
rem option previously used by this project setup.
 echo.
 echo [5/8] Installing project dependencies...
 echo Command: npm install --legacy-peer-deps
 echo This may take a few minutes.
call npm install --legacy-peer-deps
if errorlevel 1 goto INSTALL_ERROR

rem Build production files locally before committing anything.
 echo.
 echo [6/8] Building the production website...
 echo Command: npm run build
call npm run build
if errorlevel 1 goto BUILD_ERROR
if not exist "dist\index.html" goto DIST_MISSING_ERROR
 echo Build completed successfully. The dist folder is ready.

rem Stage changes, then commit only if something has changed.
 echo.
 echo [7/8] Preparing changed files for GitHub...
call git add .
if errorlevel 1 goto GIT_ADD_ERROR
call git diff --cached --quiet
if errorlevel 1 (
    echo New or modified files were found. Creating a commit...
    call git commit -m "Update React Vite application"
    if errorlevel 1 goto COMMIT_ERROR
) else (
    echo There are no new changes to commit.
)

rem Push main to GitHub. GitHub Actions will build/deploy the live website.
 echo.
 echo [8/8] Uploading your project to GitHub...
call git push -u origin main
if errorlevel 1 goto PUSH_ERROR

 echo.
 echo ============================================================
 echo                  UPLOAD SUCCESSFUL!
 echo ============================================================
 echo Your local project has been pushed to GitHub.
 echo.
 echo GitHub repository: https://github.com/TeacherJelly/WordFunV1
 echo Expected GitHub Pages address, if Pages is enabled:
 echo https://teacherjelly.github.io/WordFunV1/
 echo.
 echo IMPORTANT: GitHub Pages deployment runs separately in GitHub Actions.
 echo 1. Open your GitHub repository in your browser.
 echo 2. Click the Actions tab.
 echo 3. Open the newest "Deploy React Vite app to GitHub Pages" run.
 echo 4. Wait for the green check mark before testing your website.
 echo.
 echo ONE-TIME GITHUB PAGES SETTING:
 echo Open your repository: Settings ^> Pages ^> Build and deployment.
 echo Set Source to "GitHub Actions" if it is not already selected.
 echo.
 echo VITE IMAGE/PATH REMINDER FOR THIS REPOSITORY:
 echo Your vite.config.ts or vite.config.js should include:
 echo     base: '/WordFunV1/',
 echo This is important for logos, background images, and other assets on GitHub Pages.
 echo.
 echo For security, never put private API keys directly in React frontend code.
 echo ============================================================
goto SUCCESS_END

:PROJECT_FOLDER_ERROR
echo ERROR: Windows could not open the folder containing this batch file.
echo SOLUTION: Move this .bat file into the main React/Vite project folder,
echo beside package.json, then run it again.
goto ERROR_END

:NODE_ERROR
echo ERROR: Node.js was not found or could not run.
echo SOLUTION:
echo 1. Install Node.js from https://nodejs.org/ or check your existing installation.
echo 2. Close and reopen Command Prompt after installing.
echo 3. If using portable Node.js, place node.exe and npm.cmd in a folder named "node"
echo    inside this project folder.
echo 4. Run this batch file again.
goto ERROR_END

:NPM_ERROR
echo ERROR: npm was not found or could not run.
echo SOLUTION:
echo 1. Reinstall Node.js from https://nodejs.org/ using the Windows installer.
echo 2. Make sure the option to add Node.js to PATH is enabled.
echo 3. Restart Command Prompt and run this file again.
echo 4. For portable Node.js, confirm that npm.cmd is inside the project's "node" folder.
goto ERROR_END

:GIT_ERROR
echo ERROR: Git was not found on this computer.
echo SOLUTION:
echo 1. Download Git for Windows: https://git-scm.com/downloads/win
 echo 2. Install it using the default options.
echo 3. Close and reopen Command Prompt, then run this file again.
goto ERROR_END

:PACKAGE_JSON_ERROR
echo ERROR: package.json was not found.
echo SOLUTION:
echo 1. This batch file must be in your main React/Vite project folder.
echo 2. Find the folder containing package.json.
echo 3. Move this .bat file into that folder and run it again.
goto ERROR_END

:GIT_INIT_ERROR
echo ERROR: Git could not initialize this project folder.
echo SOLUTION: Check that you have permission to edit this folder and that
 echo Git is installed correctly. Then run this file again.
goto ERROR_END

:BRANCH_ERROR
echo ERROR: Git could not switch or rename the local branch to main.
echo SOLUTION: Open Command Prompt in this folder and run:
echo     git status
echo If a merge, rebase, or cherry-pick is in progress, finish or safely cancel it
 echo before running this deployment file again.
goto ERROR_END

:REMOTE_URL_EMPTY_ERROR
echo ERROR: No repository URL was entered.
echo SOLUTION: Run this file again and paste the HTTPS URL copied from
 echo the green Code button in your GitHub repository.
goto ERROR_END

:REMOTE_ADD_ERROR
echo ERROR: Git could not save the GitHub repository URL as origin.
echo SOLUTION: Check that the URL is correct. You can inspect configured remotes with:
echo     git remote -v
echo If needed, correct the URL with:
echo     git remote set-url origin https://github.com/USERNAME/REPOSITORY.git
goto ERROR_END

:REMOTE_READ_ERROR
echo ERROR: Git could not read the remote named origin.
echo SOLUTION: Check the repository URL with:
echo     git remote -v
echo Then correct it with git remote set-url origin YOUR_REPOSITORY_URL.
goto ERROR_END

:REMOTE_SET_ERROR
echo ERROR: Git could not update the origin remote URL.
echo SOLUTION:
echo 1. Check that this folder is a valid Git repository.
echo 2. Run this command from the project folder:
echo     git remote -v
echo 3. Then set the correct URL manually:
echo     git remote set-url origin https://github.com/TeacherJelly/WordFunV1.git
echo 4. Run this batch file again.
goto ERROR_END

:NODEMODULES_TRACKED_ERROR
echo ERROR: The node_modules folder is already tracked by Git.
echo WHY: It is very large and should not be uploaded to GitHub.
echo SOLUTION: In Command Prompt, run these commands from this project folder:
echo     git rm -r --cached node_modules
echo     git add .gitignore
 echo     git commit -m "Stop tracking node_modules"
echo Then run this batch file again.
goto ERROR_END

:WORKFLOW_FOLDER_ERROR
echo ERROR: Windows could not create the .github\workflows folder.
echo SOLUTION: Check that this project folder is not read-only and that your
 echo Windows account has permission to create folders here.
goto ERROR_END

:WORKFLOW_CREATE_ERROR
echo ERROR: The GitHub Pages workflow file could not be created.
echo SOLUTION: Create this file manually:
echo     .github\workflows\deploy.yml
 echo Then follow the Vite GitHub Pages deployment guide:
echo     https://vite.dev/guide/static-deploy.html
 echo Do not delete any existing workflow files.
goto ERROR_END

:INSTALL_ERROR
echo ERROR: npm could not install the project dependencies.
echo SOLUTION:
echo 1. Read the npm error shown above; it usually names the package causing trouble.
echo 2. Check your internet connection.
echo 3. Confirm package.json is valid and the project's Node.js version is supported.
echo 4. If the error mentions dependency conflicts, this script already uses
 echo    --legacy-peer-deps. The package versions may need to be corrected.
echo 5. Fix the reported issue, then run this batch file again.
goto ERROR_END

:BUILD_ERROR
echo ERROR: The React/Vite production build failed.
echo SOLUTION:
echo 1. Read the first red error above; it usually identifies the file and line.
echo 2. Fix syntax errors, missing imports, missing packages, or TypeScript errors.
echo 3. Test with: npm run build
 echo 4. When that command succeeds, run this batch file again.
goto ERROR_END

:DIST_MISSING_ERROR
echo ERROR: The build finished but dist\index.html was not found.
echo SOLUTION:
echo 1. Open vite.config.js or vite.config.ts.
echo 2. Check whether build.outDir was changed from the default "dist" folder.
echo 3. If you use a different output folder, the GitHub workflow's artifact path
 echo    must be changed to that folder as well.
echo 4. Otherwise, restore Vite's default output folder and run this file again.
goto ERROR_END

:GIT_ADD_ERROR
echo ERROR: Git could not stage your project files.
echo SOLUTION: Check whether files are locked, whether you have write permission,
echo and whether the disk has enough free space. Then run git status and try again.
goto ERROR_END

:COMMIT_ERROR
echo ERROR: Git could not create a commit.
echo SOLUTION:
echo 1. Configure your Git identity if it has not been set:
echo     git config --global user.name "Your Name"
echo     git config --global user.email "you@example.com"
echo 2. Then run this batch file again.
echo Use the email associated with your GitHub account if appropriate.
goto ERROR_END

:PUSH_ERROR
echo ERROR: Git could not upload your commit to GitHub.
echo COMMON CAUSES AND SOLUTIONS:
echo.
echo A. SIGN-IN OR PERMISSION PROBLEM:
echo    Complete the GitHub sign-in prompt. Confirm you have write access
 echo    to this repository. For HTTPS, use Git Credential Manager when prompted.
echo.
echo B. REMOTE REPOSITORY ALREADY HAS A README OR OTHER COMMIT:
echo    GitHub may reject the push because its history is different.
echo    Do NOT use git push --force. First inspect:
echo        git status
 echo        git log --oneline --all --decorate -5
 echo    Then merge the remote branch carefully, for example:
echo        git pull origin main --allow-unrelated-histories
 echo    Resolve any conflicts, commit the merge, and run this file again.
echo.
echo C. WRONG REPOSITORY URL:
echo    Check with: git remote -v
 echo    Correct it with: git remote set-url origin https://github.com/USERNAME/REPOSITORY.git
 echo.
echo D. NETWORK OR SERVER PROBLEM:
echo    Check your internet connection and GitHub status, then retry.
goto ERROR_END

:ERROR_END
echo.
echo ============================================================
echo DEPLOYMENT STOPPED - NO FURTHER STEPS WERE RUN.
echo Read the explanation above, fix the problem, and run this file again.
echo ============================================================
pause
exit /b 1

:SUCCESS_END
echo.
echo Press any key to close this window.
pause >nul
exit /b 0
