#!/bin/sh
set -e

# Default values for environment variables
: ${DOMAIN_NAME:=localhost}
: ${FRONTEND_HOST:=bjj-rolltrack-github_frontend_1}
: ${FRONTEND_PORT:=3000}
: ${BACKEND_HOST:=bjj-rolltrack-github_backend_1}
: ${BACKEND_PORT:=8000}
: ${USE_HTTPS:=false}
: ${SSL_CERT_PATH:=/etc/nginx/ssl/cert.pem}
: ${SSL_KEY_PATH:=/etc/nginx/ssl/key.pem}

# Export all variables for envsubst
export DOMAIN_NAME
export FRONTEND_HOST
export FRONTEND_PORT
export BACKEND_HOST
export BACKEND_PORT
export SSL_CERT_PATH
export SSL_KEY_PATH

# Determine which configuration to use based on HTTPS setting and certificate existence
if [ "${USE_HTTPS}" = "true" ] && [ -f "${SSL_CERT_PATH}" ] && [ -f "${SSL_KEY_PATH}" ]; then
    echo "Setting up HTTPS configuration..."
    
    # Process the HTTPS server block template
    envsubst '${DOMAIN_NAME} ${FRONTEND_HOST} ${FRONTEND_PORT} ${BACKEND_HOST} ${BACKEND_PORT} ${SSL_CERT_PATH} ${SSL_KEY_PATH}' \
        < /etc/nginx/templates/https_server_block.template \
        > /etc/nginx/conf.d/https.conf
    
    # Process the HTTP-to-HTTPS redirect template
    envsubst '${DOMAIN_NAME}' \
        < /etc/nginx/templates/http_redirect.template \
        > /etc/nginx/conf.d/default.conf
    
    echo "HTTPS configuration complete."
else
    echo "HTTPS is disabled or certificates not found. Using HTTP only."
    
    # Process the HTTP-only template
    envsubst '${DOMAIN_NAME} ${FRONTEND_HOST} ${FRONTEND_PORT} ${BACKEND_HOST} ${BACKEND_PORT}' \
        < /etc/nginx/templates/http_only.template \
        > /etc/nginx/conf.d/default.conf
    
    echo "HTTP-only configuration complete."
fi

# Check if the configuration is valid
echo "Testing Nginx configuration..."
nginx -t

# Start Nginx in the foreground
echo "Starting Nginx..."
exec nginx -g 'daemon off;'