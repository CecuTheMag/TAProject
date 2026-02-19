#!/bin/bash

echo "🔧 Fixing admin frontend API calls..."

# Restart admin frontend to apply API fixes
docker-compose -f docker-compose-enterprise.yml restart admin_frontend

echo "✅ Admin frontend API calls fixed"
echo "Database import modal now uses proper API endpoints"