#!/bin/bash

echo "🔧 Fixing admin API routing (final fix)..."

# Restart admin backend and caddy
docker-compose -f docker-compose-enterprise.yml restart admin_backend caddy-main

echo "✅ Admin API routing fixed"
echo "Caddy strips /admin-api prefix, backend handles /auth/login"