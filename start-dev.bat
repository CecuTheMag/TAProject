@echo off
echo Starting SIMS Development Environment with Hot Reload...
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:5000
echo.
docker-compose -f docker-compose-dev.yml up --build