@echo off
echo ========================================
echo   FIX: Google Cloud Authentication
echo ========================================
echo.
echo This will authenticate your computer to use
echo Google Cloud Vertex AI.
echo.
echo Two commands will run:
echo   1. Application authentication
echo   2. Enable Vertex AI API
echo.
echo A browser will open for you to sign in.
echo.
pause
echo.

REM Check if gcloud is installed
gcloud --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: gcloud CLI is not installed!
    echo.
    echo Please install it first:
    echo   1. Double-click: DOWNLOAD_GCLOUD.bat
    echo   2. Or visit: https://cloud.google.com/sdk/docs/install
    echo.
    echo After installation, run this script again.
    echo.
    pause
    exit /b 1
)

echo ✓ gcloud CLI is installed
echo.
echo ========================================
echo   Step 1: Application Authentication
echo ========================================
echo.
echo A browser will open. Please:
echo   1. Sign in with your Google account
echo   2. Click "Allow" to grant permissions
echo   3. Close browser when done
echo.
pause
echo.

gcloud auth application-default login

if errorlevel 1 (
    echo.
    echo ❌ Authentication failed or was cancelled
    echo.
    echo Please try again and make sure to:
    echo   - Complete the browser sign-in
    echo   - Click "Allow" when asked
    echo.
    pause
    exit /b 1
)

echo.
echo ✓ Authentication successful!
echo.
echo ========================================
echo   Step 2: Enable Vertex AI API
echo ========================================
echo.

gcloud services enable aiplatform.googleapis.com --project=rosy-stronghold-475804-s7

if errorlevel 1 (
    echo.
    echo ⚠ Could not enable API automatically
    echo.
    echo Please run this manually:
    echo   gcloud services enable aiplatform.googleapis.com --project=rosy-stronghold-475804-s7
    echo.
) else (
    echo.
    echo ✓ Vertex AI API enabled!
)

echo.
echo ========================================
echo   ✅ ALL DONE!
echo ========================================
echo.
echo Your computer is now authenticated!
echo.
echo Next steps:
echo   1. Close this window
echo   2. Run: START_ALL.bat
echo   3. Open: http://localhost:3000
echo   4. Try a prompt!
echo.
echo The authentication is saved, so you only
echo need to do this once!
echo.
echo ========================================
pause
