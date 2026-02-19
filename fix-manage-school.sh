#!/bin/bash

echo "🔧 Fixing school management iframe URL..."

# Restart admin frontend to apply the iframe URL fix
docker-compose -f docker-compose-enterprise.yml restart admin_frontend

echo "✅ School management iframe URL fixed"
echo "Manage button now opens https://school-sync.org instead of localhost"