#!/bin/bash

echo "🔧 Quick fix for SchoolSync Enterprise issues..."

# Stop services
docker-compose -f docker-compose-enterprise.yml down

# Remove admin database volume to fix duplicate key error
docker volume rm schoolsync_postgres_admin_data 2>/dev/null || true

# Rebuild and restart
docker-compose -f docker-compose-enterprise.yml up --build -d

echo "✅ Services restarted with fixes applied"
echo "🌐 Check: http://localhost:3002 (admin) and https://school-sync.org"