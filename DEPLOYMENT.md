# SchoolSync Deployment Guide

## Production Deployment

### Prerequisites
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- SSL Certificate
- Domain name

### Step-by-Step Deployment

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Application Setup
```bash
# Clone repository
git clone https://github.com/your-org/SchoolSync.git
cd SchoolSync

# Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# Start services
docker-compose up -d --build
```

#### 3. SSL Configuration
```bash
# Using Certbot for Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com

# Update Caddyfile with your domain
nano Caddyfile
```

#### 4. Database Migration
```bash
# Run initial migrations
docker-compose exec backend npm run migrate

# Create sample data (optional)
docker-compose exec backend npm run seed
```

### Environment Configuration

```env
# Production .env
NODE_ENV=production
PORT=3001

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=schoolsync_prod
DB_USER=schoolsync
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# SSL
SSL_CERT_PATH=/etc/ssl/certs/cert.pem
SSL_KEY_PATH=/etc/ssl/private/key.pem
```

### Monitoring & Maintenance

#### Health Checks
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Monitor resources
docker stats
```

#### Backup Strategy
```bash
# Database backup
docker-compose exec postgres pg_dump -U schoolsync schoolsync_prod > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec postgres pg_dump -U schoolsync schoolsync_prod > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### Security Checklist

- [ ] SSL/TLS enabled
- [ ] Firewall configured
- [ ] Database access restricted
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitoring alerts configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured

### Performance Optimization

#### Nginx Configuration
```nginx
upstream backend {
    server backend:3001;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Caching
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Scaling Considerations

#### Horizontal Scaling
- Load balancer configuration
- Database read replicas
- Redis clustering
- CDN integration

#### Monitoring
- Prometheus metrics
- Grafana dashboards
- Log aggregation
- Alert management