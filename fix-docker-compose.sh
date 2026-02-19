#!/bin/bash

echo "🔧 Fixing Docker Compose ContainerConfig error..."

# Stop all containers
echo "Stopping all containers..."
docker-compose -f docker-compose-enterprise.yml down --remove-orphans

# Remove orphaned containers mentioned in the warning
echo "Removing orphaned containers..."
docker rm -f assetflow_backend-3_1 assetflow_admin-frontend_1 assetflow_backend-1_1 assetflow_postgres-primary_1 assetflow_admin-backend_1 assetflow_backend-2_1 assetflow_caddy-admin_1 2>/dev/null || true

# Clean up Docker system
echo "Cleaning Docker system..."
docker system prune -f
docker volume prune -f
docker network prune -f

# Remove problematic images that might have corrupted metadata
echo "Removing potentially corrupted images..."
docker rmi assetflow_backend assetflow_admin_backend assetflow_frontend assetflow_admin_frontend 2>/dev/null || true
docker rmi assetflow_grafana assetflow_prometheus 2>/dev/null || true

# Pull fresh base images
echo "Pulling fresh base images..."
docker pull node:18-alpine
docker pull node:20-alpine
docker pull ubuntu:22.04
docker pull postgres:15-alpine
docker pull redis:7-alpine
docker pull caddy:alpine
docker pull prom/prometheus:latest
docker pull grafana/grafana:latest

echo "✅ Docker environment cleaned. Now run:"
echo "docker-compose -f docker-compose-enterprise.yml up --build"