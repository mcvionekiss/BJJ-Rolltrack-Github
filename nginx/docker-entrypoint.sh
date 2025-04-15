#!/bin/bash
# nginx/docker-entrypoint.sh - Docker entrypoint script for nginx container
# This script handles SSL certificates and starts nginx

set -e

# Color output to make logs easier to read
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting nginx container with SSL support...${NC}"

# Check if SSL certificates exist
if [[ -f /etc/nginx/ssl/fullchain.pem && -f /etc/nginx/ssl/privkey.pem ]]; then
    echo -e "${GREEN}SSL certificates found.${NC}"
else
    echo -e "${YELLOW}SSL certificates not found. Using self-signed certificates for now.${NC}"
    echo -e "${YELLOW}Run ./ssl-cert-manager.sh to obtain proper Let's Encrypt certificates.${NC}"
    
    # Create directory if it doesn't exist
    mkdir -p /etc/nginx/ssl
    
    # Generate self-signed certificates
    echo -e "${BLUE}Generating self-signed certificates...${NC}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/privkey.pem \
        -out /etc/nginx/ssl/fullchain.pem \
        -subj "/CN=staging.your-domain.com"
    
    echo -e "${GREEN}Self-signed certificates generated.${NC}"
fi

# Check for custom nginx configuration
if [[ -f /etc/nginx/conf.d/custom.conf ]]; then
    echo -e "${BLUE}Using custom nginx configuration.${NC}"
    mv /etc/nginx/conf.d/custom.conf /etc/nginx/conf.d/default.conf
fi

# Check if we need to use environment variables in templates
if [[ -d /etc/nginx/templates ]]; then
    echo -e "${BLUE}Processing nginx templates...${NC}"
    for template in /etc/nginx/templates/*.template; do
        output_file="/etc/nginx/conf.d/$(basename "$template" .template)"
        echo -e "${BLUE}Processing $template -> $output_file${NC}"
        envsubst '${DOMAIN_NAME}' < "$template" > "$output_file"
    done
fi

# Set correct permissions for SSL files
chmod 644 /etc/nginx/ssl/fullchain.pem
chmod 600 /etc/nginx/ssl/privkey.pem

echo -e "${GREEN}Starting nginx...${NC}"
exec nginx -g "daemon off;"