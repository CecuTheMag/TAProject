#!/bin/bash

echo "🔧 Fixing Vite WebSocket HMR configuration..."

# Restart frontend to apply Vite config changes
docker-compose -f docker-compose-enterprise.yml restart frontend

echo "✅ Vite WebSocket configuration fixed"
echo "HMR WebSocket errors should be resolved"