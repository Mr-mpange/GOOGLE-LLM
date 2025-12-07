@echo off
echo ========================================
echo   LLM Guardian - Stopping All Servers
echo ========================================
echo.

echo Stopping Node.js processes...
echo.

REM Kill all node processes
taskkill /F /IM node.exe >nul 2>&1

if errorlevel 1 (
    echo No Node.js processes found running.
) else (
    echo ✓ All Node.js servers stopped
)

REM Also try to free port 8080 specifically
echo.
echo Checking port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do (
    echo Killing process on port 8080 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ========================================
echo   All Servers Stopped
echo ========================================
echo.
echo You can now run START_ALL.bat again
echo.
pause
