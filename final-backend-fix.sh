#!/bin/bash

echo "🔧 Final fix: admin password + main backend routes..."

# Restart both backends and caddy
docker-compose -f docker-compose-enterprise.yml restart backend admin_backend caddy-main

echo "✅ Fixed:"
echo "  - Admin password updated to: schoolsync2026"
echo "  - Main backend routes fixed (no /api prefix)"
echo "  - Caddy strips prefixes correctly"