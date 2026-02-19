#!/bin/bash

echo "🔧 Restarting Caddy with updated network configuration..."

# Restart Caddy to pick up network changes
docker-compose -f docker-compose-enterprise.yml restart caddy-main

echo "✅ Caddy restarted with access to all networks"
echo "Admin API should now be accessible at https://school-sync.org/admin-api"