#!/bin/bash

echo "🔧 Fixing CORS (allow all) and HTTPS mixed content..."

# Restart backend services to apply CORS changes
docker-compose -f docker-compose-enterprise.yml restart backend admin_backend frontend

echo "✅ Fixed:"
echo "  - CORS now allows all origins"
echo "  - Frontend uses HTTPS API when loaded over HTTPS"
echo "  - Mixed content error resolved"