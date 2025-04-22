#!/bin/bash
set -e

echo "Starting nginx container..."

# Check SSL directory and permissions
echo "Checking SSL directory and certificates..."
ls -la /etc/nginx/ssl/ || echo "SSL directory doesn't exist or cannot be accessed!"

# Check if SSL certificates exist
if [ ! -f "/etc/nginx/ssl/fullchain.pem" ] || [ ! -f "/etc/nginx/ssl/privkey.pem" ]; then
    echo "Warning: SSL certificates not found at expected locations!"
    echo "Please ensure certificates are properly mounted from the host."
    echo "Looking for certificate files in common locations..."
    find /etc -name "fullchain.pem" 2>/dev/null || echo "No fullchain.pem found"
    find /etc -name "privkey.pem" 2>/dev/null || echo "No privkey.pem found"
else
    echo "SSL certificates found! Checking permissions..."
    ls -la /etc/nginx/ssl/fullchain.pem
    ls -la /etc/nginx/ssl/privkey.pem
fi

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t

echo "Starting nginx..."
exec nginx -g "daemon off;"