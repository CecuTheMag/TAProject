@echo off
echo 🚀 Starting AssetFlow Secure Deployment...

REM Stop any existing containers
docker-compose -f docker-compose-secure.yml down

REM Build and start all services
docker-compose -f docker-compose-secure.yml up --build -d

echo ✅ Services started:
echo    📊 Main App: http://localhost:3000
echo    🔐 Admin Panel: http://localhost:3002
echo    🔧 Main API: http://localhost:5000
echo    🛡️  Admin API: http://localhost:5005
echo.
echo 🔐 Admin Login: admin@assetflow.bg / assetflow2025

REM Show logs
docker-compose -f docker-compose-secure.yml logs -f