@echo off
title ExpenseFlow Ngrok Tunnels
echo ========================================
echo    ExpenseFlow Ngrok Tunnels (Both)
echo ========================================
echo.
echo Creating public tunnels for both backend and frontend...
echo Backend: port 5001
echo Frontend: port 3000
echo.
echo COPY BOTH HTTPS URLS FROM BELOW:
echo.
ngrok start --config ngrok.yml --all