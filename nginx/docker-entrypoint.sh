#!/bin/sh
set -e

# Default values for environment variables
: ${DOMAIN_NAME:=localhost}
: ${FRONTEND_HOST:=bjj-rolltrack-github_frontend_1}
: ${FRONTEND_PORT:=3000}
: ${BACKEND_HOST:=bjj-rolltrack-github_backend_1}
: ${BACKEND_PORT:=8000}
: ${USE_HTTPS:=false}

# Prepare HTTPS related variables
if [ "${USE_HTTPS}" = "true" ] && [ -f "/etc/nginx/ssl/cert.pem" ] && [ -f "/etc/nginx/ssl/key.pem" ]; then
    echo "Setting up HTTPS configuration..."
    HTTPS_REDIRECT="return 301 https://\$host\$request_uri;"
    
    # Load the HTTPS server block template and replace variables
    HTTPS_SERVER_BLOCK=$(cat /etc/nginx/templates/https_server_block.template | \
        sed "s|\${DOMAIN_NAME}|${DOMAIN_NAME}|g" | \
        sed "s|\${FRONTEND_HOST}|${FRONTEND_HOST}|g" | \
        sed "s|\${FRONTEND_PORT}|${FRONTEND_PORT}|g" | \
        sed "s|\${BACKEND_HOST}|${BACKEND_HOST}|g" | \
        sed "s|\${BACKEND_PORT}|${BACKEND_PORT}|g")
else
    echo "HTTPS is disabled or certificates not found. Using HTTP only."
    HTTPS_REDIRECT=""
    HTTPS_SERVER_BLOCK=""
fi

# Replace variables in the main config template
cat /etc/nginx/templates/default.conf.template | \
    sed "s|\${DOMAIN_NAME}|${DOMAIN_NAME}|g" | \
    sed "s|\${FRONTEND_HOST}|${FRONTEND_HOST}|g" | \
    sed "s|\${FRONTEND_PORT}|${FRONTEND_PORT}|g" | \
    sed "s|\${BACKEND_HOST}|${BACKEND_HOST}|g" | \
    sed "s|\${BACKEND_PORT}|${BACKEND_PORT}|g" | \
    sed "s|\${HTTPS_REDIRECT}|${HTTPS_REDIRECT}|g" | \
    sed "s|\${HTTPS_SERVER_BLOCK}|${HTTPS_SERVER_BLOCK}|g" > /etc/nginx/conf.d/default.conf

# Check if the configuration is valid
echo "Testing Nginx configuration..."
nginx -t

# Start Nginx in the foreground
echo "Starting Nginx..."
exec nginx -g 'daemon off;'