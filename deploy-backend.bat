@echo off
title Deploy ExpenseFlow Backend
echo ========================================
echo    Deploy ExpenseFlow Backend to Vercel
echo ========================================
echo.
echo Deploying backend to Vercel...
cd backend
vercel --prod
echo.
echo ========================================
echo Backend deployed successfully!
echo COPY THE BACKEND URL FROM ABOVE
echo ========================================
pause