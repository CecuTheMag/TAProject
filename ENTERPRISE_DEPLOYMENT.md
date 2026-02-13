# AssetFlow Enterprise Deployment

## Overview
The enterprise deployment provides HTTPS-secured access to both the main application and admin interface on separate ports with automatic SSL certificate management.

## Architecture

### Main Frontend (Port 443)
- **URL**: https://assetflow.bg
- **Purpose**: Student and teacher access
- **Backend**: Load-balanced across 3 backend instances
- **SSL**: Automatic Let's Encrypt certificates

### Admin Frontend (Port 445)
- **URL**: https://admin.assetflow.bg:445
- **Purpose**: System administration and school management
- **Backend**: Dedicated admin backend with isolated database
- **SSL**: Automatic Let's Encrypt certificates

## Deployment

### Quick Start
```bash
./start-enterprise.sh
```

### Manual Deployment
```bash
docker-compose -f docker-compose-enterprise.yml up --build -d
```

## Services

### Core Services
- **postgres-primary**: Main application database (Port 5433)
- **postgres_admin**: Admin database (Port 5434)
- **redis**: Caching and sessions (Port 6379)
- **backend-1/2/3**: Load-balanced API servers
- **admin-backend**: Isolated admin API server

### Frontend Services
- **frontend**: Main React application
- **admin-frontend**: Admin React application

### Load Balancers
- **caddy-main**: HTTPS proxy for main app (Port 443)
- **caddy-admin**: HTTPS proxy for admin app (Port 445)

### Monitoring
- **prometheus**: Metrics collection (Port 9090)
- **grafana**: Monitoring dashboards (Port 3001)

## SSL Certificates

Both Caddy instances automatically:
- Generate Let's Encrypt SSL certificates
- Handle certificate renewal
- Redirect HTTP to HTTPS
- Provide A+ SSL security rating

## Security Features

### Network Isolation
- Admin services use separate database
- Internal API communication secured
- Rate limiting on all endpoints

### Access Control
- Role-based permissions
- JWT authentication
- Session management via Redis

### Monitoring
- Real-time performance metrics
- Health checks for all services
- Automated alerting capabilities

## Configuration

### Environment Variables
All services use production-ready environment variables with:
- Secure database passwords
- JWT secrets
- Email configuration
- Redis clustering

### Scaling
The deployment supports:
- Horizontal backend scaling (3 instances by default)
- Database clustering
- Redis clustering
- CDN integration ready

## Maintenance

### Updates
```bash
docker-compose -f docker-compose-enterprise.yml pull
docker-compose -f docker-compose-enterprise.yml up --build -d
```

### Backup
```bash
# Database backup
docker exec postgres-primary pg_dump -U postgres SIMS > backup.sql
docker exec postgres_admin pg_dump -U admin_user SIMS_ADMIN > admin_backup.sql
```

### Logs
```bash
# View all logs
docker-compose -f docker-compose-enterprise.yml logs -f

# View specific service
docker-compose -f docker-compose-enterprise.yml logs -f frontend
```

## Access Points

- **Main Application**: https://assetflow.bg
- **Admin Interface**: https://admin.assetflow.bg:445
- **Monitoring**: http://localhost:3001 (admin/admin123)
- **Metrics**: http://localhost:9090

## Production Checklist

- [ ] DNS records point to server IP
- [ ] Firewall allows ports 80, 443, 445
- [ ] Email credentials configured
- [ ] SSL certificates generated successfully
- [ ] All health checks passing
- [ ] Monitoring dashboards accessible
- [ ] Backup procedures tested