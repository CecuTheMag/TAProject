#!/bin/bash

echo "🔧 Comprehensive fix for all issues..."

# Stop all services
docker-compose -f docker-compose-enterprise.yml down

# Remove problematic containers and networks
docker container prune -f
docker network prune -f

# Start services in proper order
echo "Starting databases..."
docker-compose -f docker-compose-enterprise.yml up -d postgres postgres_admin redis

echo "Waiting for databases..."
sleep 20

echo "Starting backends..."
docker-compose -f docker-compose-enterprise.yml up -d backend admin_backend

echo "Waiting for backends..."
sleep 15

echo "Starting frontends..."
docker-compose -f docker-compose-enterprise.yml up -d frontend admin_frontend

echo "Starting load balancer..."
docker-compose -f docker-compose-enterprise.yml up -d caddy-main

echo "Starting monitoring..."
docker-compose -f docker-compose-enterprise.yml up -d prometheus grafana

echo "✅ All services started in proper order"
echo "🌐 URLs:"
echo "  - Main site: https://school-sync.org"
echo "  - Admin panel: http://192.168.88.220:3002"