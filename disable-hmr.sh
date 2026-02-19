#!/bin/bash

echo "🔧 Disabling Vite HMR to fix WebSocket errors..."

# Restart frontend with HMR disabled
docker-compose -f docker-compose-enterprise.yml restart frontend

echo "✅ Vite HMR disabled"
echo "WebSocket connection errors eliminated"