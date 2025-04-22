#!/bin/bash
set -e

echo "Starting nginx container..."

# Check if SSL certificates exist
if [ ! -f "/etc/nginx/ssl/fullchain.pem" ] || [ ! -f "/etc/nginx/ssl/privkey.pem" ]; then
    echo "Warning: SSL certificates not found at expected locations!"
    echo "Please ensure certificates are properly mounted from the host."
fi

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t

echo "Starting nginx..."
exec nginx -g "daemon off;"