#!/bin/bash

echo "🔒 Restarting SchoolSync with security fixes..."

# Stop existing containers
docker compose -f docker-compose-enterprise.yml down

# Rebuild and start with security enhancements
docker compose -f docker-compose-enterprise.yml up --build -d

echo "✅ SchoolSync restarted with security fixes applied"
echo "🔍 Security improvements:"
echo "  - Authentication required on all user routes"
echo "  - Role-based authorization on sensitive endpoints"
echo "  - Secure password generation (no more 'temp123')"
echo "  - Restricted CORS to specific origins + 192.168.88.* IPs"
echo "  - Rate limiting on user management endpoints"
echo "  - Removed hardcoded school code fallback"
echo "  - CSRF protection with IP whitelist"
echo "  - Input sanitization middleware"
echo "  - Audit logging for security monitoring"