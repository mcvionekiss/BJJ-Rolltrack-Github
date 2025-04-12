#!/bin/bash

# Simple test runner for BJJ-Rolltrack
# This script helps run the application in test mode without environment complexity

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BOLD}BJJ-Rolltrack Test Runner${NC}"
echo "This script will run the application in test mode."

# Check if Docker is installed and running
if ! command -v docker &> /dev/null
then
    echo -e "${RED}Error: Docker is not installed or not in PATH${NC}"
    exit 1
fi

if ! docker info &> /dev/null
then
    echo -e "${RED}Error: Docker daemon is not running${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null
then
    echo -e "${YELLOW}Warning: docker-compose not found, trying Docker Compose plugin...${NC}"
    
    if ! docker compose version &> /dev/null
    then
        echo -e "${RED}Error: Neither docker-compose nor Docker Compose plugin found${NC}"
        exit 1
    else
        COMPOSE_CMD="docker compose"
    fi
else
    COMPOSE_CMD="docker-compose"
fi

echo -e "\n${BOLD}Starting test environment...${NC}"
echo "Using docker-compose.test.yml with simplified configuration"

# Run the application in test mode
$COMPOSE_CMD -f docker-compose.test.yml down
$COMPOSE_CMD -f docker-compose.test.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start test environment${NC}"
    exit 1
fi

# Get the IP address for access instructions
IP_ADDRESS=$(hostname -I | awk '{print $1}')
if [ -z "$IP_ADDRESS" ]; then
    IP_ADDRESS="localhost"
fi

echo -e "\n${GREEN}Test environment started successfully!${NC}"
echo -e "\n${BOLD}Access the application:${NC}"
echo -e "Frontend: ${GREEN}http://$IP_ADDRESS:3000${NC}"
echo -e "Backend API: ${GREEN}http://$IP_ADDRESS:8000${NC}"
echo -e "API docs: ${GREEN}http://$IP_ADDRESS:8000/health/${NC}"

echo -e "\n${BOLD}Test Configuration:${NC}"
echo "- Using hardcoded URLs in test-config.js"
echo "- HTTPS requirements are bypassed"
echo "- Login with any test credentials (test mode)"

echo -e "\n${BOLD}To stop the test environment:${NC}"
echo "$COMPOSE_CMD -f docker-compose.test.yml down"

exit 0