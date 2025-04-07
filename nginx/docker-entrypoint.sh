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
    
    # Add lowercase versions of variables for compatibility
    export frontend_host=${FRONTEND_HOST}
    export frontend_port=${FRONTEND_PORT}
    export backend_host=${BACKEND_HOST}
    export backend_port=${BACKEND_PORT}
    export ssl_cert_path=${SSL_CERT_PATH}
    export ssl_key_path=${SSL_KEY_PATH}
    
    # Process common settings first, limiting envsubst to only replace our environment variables
    # This prevents it from replacing Nginx variables like $remote_addr, $host, etc.
    envsubst '${DOMAIN_NAME} ${FRONTEND_HOST} ${FRONTEND_PORT} ${BACKEND_HOST} ${BACKEND_PORT} ${SSL_CERT_PATH} ${SSL_KEY_PATH}' < /etc/nginx/templates/common_settings.inc > /etc/nginx/conf.d/common_settings.inc
    
    # Process the HTTPS server block template with limited substitution
    envsubst '${DOMAIN_NAME} ${FRONTEND_HOST} ${FRONTEND_PORT} ${BACKEND_HOST} ${BACKEND_PORT} ${SSL_CERT_PATH} ${SSL_KEY_PATH}' < /etc/nginx/templates/https_server_block.template > /etc/nginx/conf.d/https.conf
    
    # Update the include path in the processed config to point to the processed common settings
    sed -i 's|include /etc/nginx/templates/common_settings.inc|include /etc/nginx/conf.d/common_settings.inc|g' /etc/nginx/conf.d/https.conf
    
    # Process the HTTP-to-HTTPS redirect template with limited substitution
    envsubst '${DOMAIN_NAME} ${FRONTEND_HOST} ${FRONTEND_PORT} ${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/templates/http_redirect.template > /etc/nginx/conf.d/default.conf
    
    echo "HTTPS configuration complete."
else
    echo "HTTPS is disabled or certificates not found. Using HTTP only."
    
    # Process the HTTP-only template - use unrestricted envsubst to catch all variables
    # This fixes the "unknown frontend_host variable" error by ensuring all env vars are substituted
    export frontend_host=${FRONTEND_HOST}  # Add lowercase version for compatibility
    export frontend_port=${FRONTEND_PORT}  # Add lowercase version for compatibility
    export backend_host=${BACKEND_HOST}    # Add lowercase version for compatibility
    export backend_port=${BACKEND_PORT}    # Add lowercase version for compatibility
    
    # Process common settings first, limiting envsubst to only replace our environment variables
    # This prevents it from replacing Nginx variables like $remote_addr, $host, etc.
    envsubst '${DOMAIN_NAME} ${FRONTEND_HOST} ${FRONTEND_PORT} ${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/templates/common_settings.inc > /etc/nginx/conf.d/common_settings.inc
    
    # Process the HTTP-only template with limited substitution
    envsubst '${DOMAIN_NAME} ${FRONTEND_HOST} ${FRONTEND_PORT} ${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/templates/http_only.template > /etc/nginx/conf.d/default.conf
    
    # Update the include path in the processed config to point to the processed common settings
    sed -i 's|include /etc/nginx/templates/common_settings.inc|include /etc/nginx/conf.d/common_settings.inc|g' /etc/nginx/conf.d/default.conf
    
    echo "HTTP-only configuration complete."
fi

# Check if the configuration is valid
echo "Testing Nginx configuration..."
nginx -t

# Start Nginx in the foreground
echo "Starting Nginx..."
exec nginx -g 'daemon off;'