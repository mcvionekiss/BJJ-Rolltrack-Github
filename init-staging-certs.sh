#!/bin/bash
# init-staging-certs.sh - Initialize SSL certificates for staging environment
# This script should be run once to set up initial certificates

set -e

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}BJJ Rolltrack SSL Certificate Initialization${NC}"
echo -e "${BLUE}==========================================${NC}"
echo -e "${YELLOW}This script will set up SSL certificates for your staging environment.${NC}"

# Make sure ssl-cert-manager.sh is executable
if [[ ! -x "./ssl-cert-manager.sh" ]]; then
    echo -e "${BLUE}Making ssl-cert-manager.sh executable...${NC}"
    chmod +x ./ssl-cert-manager.sh
fi

# Make sure the nginx entrypoint script is executable
if [[ ! -x "./nginx/docker-entrypoint.sh" ]]; then
    echo -e "${BLUE}Making nginx docker-entrypoint.sh executable...${NC}"
    chmod +x ./nginx/docker-entrypoint.sh
fi

# Create ssl directory if it doesn't exist
if [[ ! -d "./nginx/ssl" ]]; then
    echo -e "${BLUE}Creating SSL directory...${NC}"
    mkdir -p ./nginx/ssl
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo -e "${YELLOW}Please start Docker and try again${NC}"
    exit 1
fi

# Load environment variables
source .env.staging
DOMAIN_NAME=${DOMAIN_NAME:-staging.your-domain.com}

# Ask about testing mode
read -p "Use Let's Encrypt staging environment (for testing)? (y/n): " use_staging
if [[ "$use_staging" == "y" ]]; then
    STAGING_ARG="--staging"
    echo -e "${YELLOW}Using Let's Encrypt staging environment (certificates won't be trusted)${NC}"
else
    STAGING_ARG=""
    echo -e "${GREEN}Using Let's Encrypt production environment${NC}"
fi

# Ask for email (or use from env)
EMAIL=${EMAIL:-"your-email@example.com"}
read -p "Email for Let's Encrypt notifications [$EMAIL]: " email_input
if [[ -n "$email_input" ]]; then
    EMAIL="$email_input"
fi

echo -e "${BLUE}Domain: ${DOMAIN_NAME}${NC}"
echo -e "${BLUE}Email: ${EMAIL}${NC}"

# Stop any existing nginx container
if docker ps | grep -q "bjj-nginx"; then
    echo -e "${BLUE}Stopping existing nginx container...${NC}"
    docker stop bjj-nginx
fi

# Run certbot
echo -e "${BLUE}Obtaining SSL certificate...${NC}"
./ssl-cert-manager.sh --domain "$DOMAIN_NAME" --email "$EMAIL" $STAGING_ARG

echo -e "${GREEN}SSL certificate initialization complete!${NC}"
echo -e "${BLUE}You can start your staging environment with:${NC}"
echo -e "    docker-compose up -d"
echo -e "${YELLOW}Your certificates will automatically renew when needed.${NC}"

echo -e "\n${BLUE}Next steps:${NC}"
echo -e "1. Update your DNS records to point ${DOMAIN_NAME} to your server's IP address"
echo -e "2. Ensure ports 80 and 443 are open on your server firewall"
echo -e "3. Start your application with docker-compose up -d"
echo -e "4. Access your application at https://${DOMAIN_NAME}"

exit 0