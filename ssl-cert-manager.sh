#!/bin/bash
# ssl-cert-manager.sh - Automated SSL certificate generation and renewal for staging environment
# This script handles obtaining and renewing Let's Encrypt SSL certificates using certbot
# and configures them for use with nginx

set -e

# Configuration variables - modify as needed
DOMAIN_NAME=${DOMAIN_NAME:-staging.your-domain.com}
EMAIL=${EMAIL:-your-email@example.com}
CERTBOT_OPTIONS="--non-interactive --agree-tos --email $EMAIL"
NGINX_CONTAINER="bjj-nginx"
NGINX_SSL_DIR="./nginx/ssl"
STAGING_ARG=""

# Color output to make logs easier to read
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print usage information
function show_usage {
    echo -e "Usage: $0 [OPTIONS]"
    echo -e "Options:"
    echo -e "  --domain DOMAIN     Domain name for certificate (default: $DOMAIN_NAME)"
    echo -e "  --email EMAIL       Email for Let's Encrypt notifications (default: $EMAIL)"
    echo -e "  --staging           Use Let's Encrypt staging environment (for testing)"
    echo -e "  --force-renewal     Force certificate renewal even if not expired"
    echo -e "  --help              Show this help message"
    exit 1
}

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --domain) DOMAIN_NAME="$2"; shift ;;
        --email) EMAIL="$2"; shift ;;
        --staging) STAGING_ARG="--test-cert" ;;
        --force-renewal) FORCE_RENEWAL="--force-renewal" ;;
        --help) show_usage ;;
        *) echo "Unknown parameter: $1"; show_usage ;;
    esac
    shift
done

echo -e "${BLUE}SSL Certificate Manager for Staging Environment${NC}"
echo -e "${BLUE}Domain: ${DOMAIN_NAME}${NC}"
echo -e "${BLUE}Email: ${EMAIL}${NC}"
if [[ -n "$STAGING_ARG" ]]; then
    echo -e "${YELLOW}Using Let's Encrypt staging environment${NC}"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Create SSL directory if it doesn't exist
mkdir -p "$NGINX_SSL_DIR"

# Function to check if nginx container is running
check_nginx_running() {
    if ! docker ps | grep -q "$NGINX_CONTAINER"; then
        echo -e "${YELLOW}Warning: Nginx container '$NGINX_CONTAINER' is not running${NC}"
        echo -e "${YELLOW}Starting nginx container...${NC}"
        if ! docker-compose up -d nginx; then
            echo -e "${RED}Error: Failed to start nginx container${NC}"
            exit 1
        fi
        # Wait for nginx to start
        sleep 5
    fi
}

# Function to stop nginx during certificate issuance (to free port 80)
stop_nginx() {
    echo -e "${BLUE}Stopping nginx to free port 80...${NC}"
    if ! docker stop "$NGINX_CONTAINER"; then
        echo -e "${RED}Error: Failed to stop nginx container${NC}"
        exit 1
    fi
}

# Function to start nginx after certificate issuance
start_nginx() {
    echo -e "${BLUE}Starting nginx...${NC}"
    if ! docker-compose up -d nginx; then
        echo -e "${RED}Error: Failed to start nginx container${NC}"
        exit 1
    fi
}

# Check if certificates already exist
if [[ -f "$NGINX_SSL_DIR/fullchain.pem" && -f "$NGINX_SSL_DIR/privkey.pem" && -z "$FORCE_RENEWAL" ]]; then
    echo -e "${GREEN}Certificates already exist. Checking expiration...${NC}"
    
    # Check certificate expiration (30 days before expiry is the default renewal window)
    EXPIRY=$(openssl x509 -enddate -noout -in "$NGINX_SSL_DIR/fullchain.pem" | cut -d= -f 2)
    EXPIRY_TIMESTAMP=$(date -d "$EXPIRY" +%s)
    NOW_TIMESTAMP=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRY_TIMESTAMP - $NOW_TIMESTAMP) / 86400 ))
    
    echo -e "${BLUE}Certificate expires in $DAYS_LEFT days ($EXPIRY)${NC}"
    
    # If more than 30 days until expiration, skip renewal unless forced
    if [[ $DAYS_LEFT -gt 30 ]]; then
        echo -e "${GREEN}Certificate is still valid. Use --force-renewal to renew anyway.${NC}"
        exit 0
    else
        echo -e "${YELLOW}Certificate will expire soon. Proceeding with renewal.${NC}"
    fi
fi

# Make sure nginx is running first (to check configuration)
check_nginx_running

# Stop nginx to free port 80 for certbot
stop_nginx

echo -e "${BLUE}Obtaining SSL certificate for $DOMAIN_NAME...${NC}"

# Run certbot to obtain or renew certificate
if ! certbot certonly $CERTBOT_OPTIONS $STAGING_ARG $FORCE_RENEWAL \
    --standalone \
    -d "$DOMAIN_NAME"; then
    echo -e "${RED}Error: Failed to obtain certificate${NC}"
    start_nginx
    exit 1
fi

# Copy certificates to nginx ssl directory
echo -e "${BLUE}Copying certificates to nginx ssl directory...${NC}"
cp /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem "$NGINX_SSL_DIR/"
cp /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem "$NGINX_SSL_DIR/"

# Set proper permissions
chmod 644 "$NGINX_SSL_DIR/fullchain.pem"
chmod 600 "$NGINX_SSL_DIR/privkey.pem"

# Start nginx with new certificates
start_nginx

echo -e "${GREEN}SSL certificate successfully obtained and configured!${NC}"
echo -e "${BLUE}Certificate location: $NGINX_SSL_DIR${NC}"

# Add cron job for auto-renewal if it doesn't exist
if ! crontab -l | grep -q "ssl-cert-manager.sh"; then
    echo -e "${BLUE}Setting up automatic renewal (cron job)...${NC}"
    (crontab -l 2>/dev/null; echo "0 3 * * * $(pwd)/ssl-cert-manager.sh > $(pwd)/ssl-cert-manager.log 2>&1") | crontab -
    echo -e "${GREEN}Automatic renewal configured. Certificates will be checked daily at 3:00 AM.${NC}"
fi

echo -e "${GREEN}Done! Your staging environment is now configured with SSL.${NC}"
exit 0