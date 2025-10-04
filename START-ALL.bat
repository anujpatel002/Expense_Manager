@echo off
echo ========================================
echo    ExpenseFlow Complete Setup
echo ========================================
echo.
echo This will open 3 terminals:
echo 1. Backend Server (port 5001)
echo 2. Frontend Server (port 3000)  
echo 3. Ngrok Tunnels (Both Backend + Frontend)
echo.
echo IMPORTANT: Wait for servers to start before running ngrok!
echo.
pause

echo Opening terminals...
start terminal1-backend.bat
timeout /t 3 /nobreak >nul
start terminal2-frontend.bat
timeout /t 5 /nobreak >nul
start terminal3-ngrok-both.bat

echo.
echo ========================================
echo All terminals opened!
echo.
echo NEXT STEPS:
echo 1. Wait for both servers to start
echo 2. Copy both ngrok URLs from terminal 3
echo 3. Run: node configure-demo.js [backend-url] [frontend-url]
echo 4. Restart servers (Ctrl+C and run again)
echo 5. Share frontend URL for public demo!
echo ========================================
pause