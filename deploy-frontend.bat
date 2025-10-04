@echo off
title Deploy ExpenseFlow Frontend
echo ========================================
echo    Deploy ExpenseFlow Frontend to Vercel
echo ========================================
echo.
echo Deploying frontend to Vercel...
cd frontend
vercel --prod
echo.
echo ========================================
echo Frontend deployed successfully!
echo SHARE THE FRONTEND URL FROM ABOVE
echo ========================================
pause