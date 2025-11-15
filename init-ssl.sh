#!/bin/sh

DOMAIN="assetflow.duckdns.org"
EMAIL="admin@assetflow.duckdns.org"

echo "Starting SSL initialization for $DOMAIN..."

# Create all necessary directories
mkdir -p /etc/letsencrypt/live/$DOMAIN
mkdir -p /var/www/certbot/.well-known/acme-challenge
chmod -R 755 /var/www/certbot

# Always create dummy certificate first
echo "Creating dummy certificate..."
openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
    -keyout "/etc/letsencrypt/live/$DOMAIN/privkey.pem" \
    -out "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" \
    -subj "/CN=localhost"

echo "Starting nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait for nginx to be ready
sleep 10

# Get real certificate
echo "Getting Let's Encrypt certificate..."
certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL --agree-tos --no-eff-email \
    -d $DOMAIN --non-interactive --force-renewal || echo "Certificate failed, continuing with dummy"

# Reload nginx if certificate was successful
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ] && ! openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -text -noout | grep -q "CN=localhost"; then
    echo "Reloading nginx with real certificate..."
    nginx -s reload
fi

# Keep nginx running
wait $NGINX_PID