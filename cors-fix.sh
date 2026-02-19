#!/bin/bash

echo "🔧 Fixing CORS for 192.168.88.* network..."

# Restart backend services to apply CORS changes
docker-compose -f docker-compose-enterprise.yml restart backend admin_backend

echo "✅ CORS fixed for 192.168.88.* network"
echo "Admin panel should now work from http://192.168.88.220:3002"