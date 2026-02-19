#!/bin/bash

echo "🔧 Fixing admin backend API calls..."

# Restart admin backend to apply API endpoint fixes
docker-compose -f docker-compose-enterprise.yml restart admin_backend

echo "✅ Admin backend API calls fixed"
echo "Admin backend now calls main backend without /api prefix"