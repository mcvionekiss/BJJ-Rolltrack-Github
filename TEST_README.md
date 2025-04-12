# BJJ-Rolltrack Testing Guide

This guide provides instructions for testing the BJJ-Rolltrack application using a simplified approach that avoids environment switching issues.

## Simplified Testing Approach

The testing configuration is designed to be as simple as possible, avoiding potential complexities from environment variables, HTTPS requirements, and multi-stage builds that could interfere with testing.

Key features of this testing setup:

- **Hardcoded Configuration**: No environment variables needed
- **HTTPS Bypassed**: No need for SSL certificates
- **Development Mode**: Easier debugging with source maps and hot reloading
- **Simplified Docker Setup**: No multi-stage builds or optimizations
- **Direct Volume Mounts**: Changes to code are immediately reflected

## Quick Start

The easiest way to start the testing environment is using the provided script:

```bash
# Make the script executable
chmod +x run-test.sh

# Run the test environment
./run-test.sh
```

This script will start both the frontend and backend containers in test mode and provide access URLs.

## Manual Setup

If you prefer to run the commands manually:

```bash
# Start the test environment
docker-compose -f docker-compose.test.yml up -d

# Stop the test environment
docker-compose -f docker-compose.test.yml down
```

## Accessing the Application

Once running, you can access the application at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health/

If testing from other devices on your network, use your machine's IP address instead of localhost.

## Key Files

The testing setup consists of these key files:

1. **test-config.js**: Centralized configuration with hardcoded URLs
2. **docker-compose.test.yml**: Simplified Docker Compose configuration
3. **frontend/Dockerfile.test**: Frontend Docker configuration optimized for testing
4. **run-test.sh**: Helper script to run the testing environment

## Testing vs. Production

This testing setup differs from the production configuration in several ways:

| Feature | Testing Setup | Production Setup |
|---------|---------------|------------------|
| Environment Variables | Hardcoded values | Uses .env files |
| HTTPS | Disabled | Enabled |
| Frontend Build | Development mode | Optimized production build |
| Backend Server | Django dev server | Gunicorn |
| Static Files | Served by Django | Served by nginx |
| Database | Local | RDS on EC2 |

## Troubleshooting

### Port Conflicts

If you receive errors about ports being in use:

```bash
# Check for processes using ports 3000 and 8000
lsof -i :3000
lsof -i :8000

# Stop any conflicting processes
kill -9 <PID>
```

### Container Issues

If containers don't start properly:

```bash
# Check container logs
docker logs bjj-frontend-test
docker logs bjj-backend-test

# Rebuild containers
docker-compose -f docker-compose.test.yml build --no-cache
```

### Database Connection Issues

The test setup assumes a local database. If you need to use a different database:

1. Edit `docker-compose.test.yml`
2. Update the DB_* environment variables under the backend service

## Benefits of This Approach

- **Simplicity**: No need to manage different environment files
- **Consistency**: Same testing experience for all developers
- **Isolation**: Testing configuration doesn't interfere with production setup
- **Ease of Use**: Simple script to start everything
- **No Certificates**: Avoids HTTPS-related issues during testing