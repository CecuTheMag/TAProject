#!/bin/bash

echo "🔧 Fixing main frontend HTTPS API calls..."

# Restart main frontend to apply HTTPS API fixes
docker-compose -f docker-compose-enterprise.yml restart frontend

echo "✅ Main frontend HTTPS API calls fixed"
echo "Mixed content error should be resolved"