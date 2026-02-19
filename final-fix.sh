#!/bin/bash

echo "🔧 Final fix for admin API and Vite host issues..."

# Stop services
docker-compose -f docker-compose-enterprise.yml down

# Rebuild frontend and admin services
docker-compose -f docker-compose-enterprise.yml build frontend admin_frontend caddy-main

# Start all services
docker-compose -f docker-compose-enterprise.yml up -d

echo "✅ All fixes applied:"
echo "  - Admin API now accessible via https://school-sync.org/admin-api"
echo "  - Vite allows school-sync.org host"
echo "  - Caddy routes admin API correctly"
echo ""
echo "🌐 Test URLs:"
echo "  - Main site: https://school-sync.org"
echo "  - Admin panel: http://localhost:3002"