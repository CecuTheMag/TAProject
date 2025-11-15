#!/bin/sh

DOMAIN="assetflow.duckdns.org"
EMAIL="admin@assetflow.duckdns.org"

echo "Starting SSL initialization for $DOMAIN..."

# Create directories
mkdir -p /etc/letsencrypt/live/$DOMAIN
mkdir -p /var/www/certbot/.well-known/acme-challenge

# Check if certificates exist
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "Creating dummy certificate..."
    openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
        -keyout "/etc/letsencrypt/live/$DOMAIN/privkey.pem" \
        -out "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" \
        -subj "/CN=localhost"
fi

echo "Starting nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait for nginx to start
sleep 5

# Get real certificate if dummy exists
if openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -text -noout | grep -q "CN=localhost"; then
    echo "Getting Let's Encrypt certificate..."
    certbot certonly --webroot -w /var/www/certbot \
        --email $EMAIL --agree-tos --no-eff-email \
        -d $DOMAIN --non-interactive || echo "Certificate request failed, continuing with dummy cert"
    
    # Reload nginx with new certificate
    nginx -s reload
fi

# Keep nginx running
wait $NGINX_PID