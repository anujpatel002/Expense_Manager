@echo off
echo Starting ngrok tunnels for ExpenseFlow...
echo.
echo Backend will be on port 5001
echo Frontend will be on port 3000
echo.
echo Please run these commands in separate terminals:
echo.
echo Terminal 1 (Backend):
echo ngrok http 5001
echo.
echo Terminal 2 (Frontend):
echo ngrok http 3000
echo.
echo After starting both tunnels, update the environment variables:
echo 1. Copy the backend ngrok URL to NEXT_PUBLIC_API_URL in frontend/.env.local
echo 2. Copy the frontend ngrok URL to FRONTEND_URL in backend/.env
echo.
pause