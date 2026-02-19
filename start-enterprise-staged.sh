#!/bin/bash

echo "🚀 Starting SchoolSync Enterprise with staged deployment..."

# Clean up first
echo "Cleaning up orphaned containers..."
docker-compose -f docker-compose-enterprise.yml down --remove-orphans 2>/dev/null || true

# Remove orphaned containers specifically
docker rm -f assetflow_backend-3_1 assetflow_admin-frontend_1 assetflow_backend-1_1 assetflow_postgres-primary_1 assetflow_admin-backend_1 assetflow_backend-2_1 assetflow_caddy-admin_1 2>/dev/null || true

# Stage 1: Start databases and Redis first
echo "Stage 1: Starting databases and Redis..."
docker-compose -f docker-compose-enterprise.yml up -d postgres postgres_admin redis

# Wait for databases to be ready
echo "Waiting for databases to be ready..."
sleep 30

# Stage 2: Build and start backend services
echo "Stage 2: Building and starting backend services..."
docker-compose -f docker-compose-enterprise.yml build backend admin_backend
docker-compose -f docker-compose-enterprise.yml up -d backend admin_backend

# Wait for backends to be ready
echo "Waiting for backend services..."
sleep 20

# Stage 3: Build and start frontend services
echo "Stage 3: Building and starting frontend services..."
docker-compose -f docker-compose-enterprise.yml build frontend admin_frontend
docker-compose -f docker-compose-enterprise.yml up -d frontend admin_frontend

# Stage 4: Start remaining services
echo "Stage 4: Starting load balancer and monitoring..."
docker-compose -f docker-compose-enterprise.yml up -d caddy-main prometheus grafana

echo "✅ All services started successfully!"
echo ""
echo "🌐 Access points:"
echo "  - Main App: http://localhost:3000"
echo "  - Admin Panel: http://localhost:3002"
echo "  - API: http://localhost:5000"
echo "  - Admin API: http://localhost:5005"
echo "  - Grafana: http://localhost:3001"
echo "  - Prometheus: http://localhost:9090"
echo ""
echo "📊 Check status with: docker-compose -f docker-compose-enterprise.yml ps"