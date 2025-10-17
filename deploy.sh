#!/bin/bash

echo "🚀 Deploying SIMS with Enterprise Scalability..."

# Build and deploy with Docker Compose
echo "📦 Building containers..."
docker-compose build

echo "🔄 Starting services..."
docker-compose up -d

echo "⚖️ Scaling backend services..."
docker-compose up -d --scale backend-1=2 --scale backend-2=2 --scale backend-3=2

echo "🔍 Checking service health..."
sleep 10

# Health checks
for i in {1..3}; do
  echo "Checking backend-$i health..."
  docker-compose exec backend-$i curl -f http://localhost:5000/health || echo "❌ Backend-$i unhealthy"
done

echo "📊 Services status:"
docker-compose ps

echo "🎯 Load balancer available at: http://localhost"
echo "📈 Monitoring available at: http://localhost:3000 (Grafana)"
echo "📊 Metrics available at: http://localhost:9090 (Prometheus)"

echo "✅ Deployment complete!"