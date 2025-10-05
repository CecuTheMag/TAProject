@echo off
echo Starting School Inventory System...
echo.

echo Starting Backend...
start "Backend" cmd /k "cd backend && npm run dev"

echo Staring Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

