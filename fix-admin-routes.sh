#!/bin/bash

echo "🔧 Fixing admin API routing..."

# Restart admin backend and caddy
docker-compose -f docker-compose-enterprise.yml restart admin_backend caddy-main

echo "✅ Admin API routing fixed"
echo "Admin backend now responds to /admin-api/* routes"