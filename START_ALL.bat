@echo off
echo ========================================
echo   LLM Guardian - Starting Everything
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js found
echo.

REM Install backend dependencies
echo [2/4] Setting up backend...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo ✓ Backend dependencies already installed
)
cd ..
echo.

REM Install frontend dependencies
echo [3/4] Setting up frontend...
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo ✓ Frontend dependencies already installed
)
cd ..
echo.

REM Create .env for frontend if it doesn't exist
if not exist "frontend\.env" (
    echo Creating frontend .env file...
    echo VITE_API_URL=http://localhost:8080 > frontend\.env
)

echo [4/5] Stopping any existing servers...
REM Kill any existing node processes to avoid port conflicts
taskkill /F /IM node.exe >nul 2>&1
if errorlevel 1 (
    echo ✓ No existing servers to stop
) else (
    echo ✓ Stopped existing servers
    timeout /t 2 /nobreak >nul
)
echo.

echo [5/5] Starting servers...
echo.
echo ========================================
echo   Starting Backend and Frontend
echo ========================================
echo.
echo Backend will run on:  http://localhost:8081
echo Frontend will run on: http://localhost:3000
echo.
echo Two new windows will open:
echo   1. Backend Server (Node.js API)
echo   2. Frontend Server (React App)
echo.
echo After both servers start, open your browser to:
echo   http://localhost:3000
echo.
echo To stop the servers:
echo   - Run STOP_ALL.bat
echo   - Or close both terminal windows
echo   - Or press Ctrl+C in each window
echo.
echo ========================================
echo.

REM Start backend in new window
echo Starting backend server...
start "LLM Guardian - Backend" cmd /k "cd backend && npm start"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo Starting frontend server...
start "LLM Guardian - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Servers Starting!
echo ========================================
echo.
echo ✓ Backend starting in new window...
echo ✓ Frontend starting in new window...
echo.
echo Wait a few seconds, then open your browser to:
echo   http://localhost:3000
echo.
echo This window can be closed.
echo ========================================
echo.
pause
