# BJJ RollTrack - Production Ready Application

This document explains the changes made to make the BJJ RollTrack application production-ready for deployment on Amazon EC2, with support for multiple environments, redundancy, and HTTPS.

## Table of Contents

1. [Overview of Changes](#overview-of-changes)
2. [Environment Configuration](#environment-configuration)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Deployment Process](#deployment-process)
6. [Development Workflow](#development-workflow)
7. [Troubleshooting](#troubleshooting)

## Overview of Changes

The application has been restructured to support:

- **Multiple environments**: Development, Staging, and Production
- **Environment variables**: Replacing hardcoded values
- **Redundancy**: Multiple backend instances with health checks
- **HTTPS support**: SSL termination and secure communication
- **Domain name integration**: Easy configuration for custom domains
- **Docker-based deployment**: Consistent environments across development and production

## Environment Configuration

### Environment Files

We've added environment-specific configuration files:

- `.env.development` - For local development
- `.env.staging` - For testing before production
- `.env.production` - For the live application

To use these files, copy the appropriate one to `.env`:

```bash
# For development
cp .env.development .env

# For staging
cp .env.staging .env

# For production
cp .env.production .env
```

### Key Environment Variables

#### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PIPELINE | Environment type | development, staging, production |
| DEBUG | Django debug mode | True, False |
| DJANGO_SECRET_KEY | Secret key for Django | your-secret-key |
| DB_* | Database connection details | DB_HOST=your-rds-endpoint |
| ALLOWED_HOSTS | Allowed hostnames | your-domain.com,www.your-domain.com |
| USE_HTTPS | Enable HTTPS | True, False |

#### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_ENV | Environment type | development, staging, production |
| REACT_APP_API_URL | Backend API URL | https://your-domain.com/api |
| REACT_APP_PUBLIC_URL | Frontend public URL | https://your-domain.com |

## Backend Architecture

### Key Changes

1. **Environment-based Settings**
   - Modified `settings/__init__.py` to load different settings based on the PIPELINE environment variable
   - Added `settings/staging.py` for a staging environment

2. **Production-Ready Server**
   - Replaced Django's development server with Gunicorn for production
   - Added connection pooling and database optimizations
   - Implemented proper logging configuration

3. **Health Check Endpoint**
   - Added `/health/` endpoint for monitoring and load balancing
   - Checks database connectivity and service status

4. **Docker Configuration**
   - Updated Dockerfile to support different environments
   - Added entrypoint script for environment-specific startup
   - Configured for static file collection in production

### Directory Structure

```
backend/
├── Dockerfile            # Updated for production
├── docker-entrypoint.sh  # New script for environment-specific startup
├── requirements.txt      # Dependencies
├── manage.py             # Django management script
└── server/
    ├── settings/
    │   ├── __init__.py   # Updated to support multiple environments
    │   ├── local.py      # Development settings
    │   ├── staging.py    # New staging settings
    │   └── production.py # Updated production settings
    ├── urls.py           # Updated with health check endpoint
    └── views.py          # Updated with health check function
```

### API Endpoints

All API endpoints remain the same, with the addition of:

- `/health/` - Health check endpoint for monitoring

## Frontend Architecture

### Key Changes

1. **Environment Configuration**
   - Added `src/config.js` to centralize configuration
   - Replaced hardcoded URLs with environment variables

2. **Production Build Process**
   - Updated Dockerfile to build optimized assets for production
   - Added Nginx configuration for serving static files

3. **HTTPS and Domain Support**
   - Added configuration for secure communication
   - Support for custom domains

### Directory Structure

```
frontend/
├── Dockerfile            # Updated for production
├── nginx/
│   └── nginx.conf        # New Nginx configuration for production
├── src/
│   ├── config.js         # New centralized configuration
│   └── components/       # Updated to use config instead of hardcoded URLs
└── public/               # Static assets
```

### Configuration File

The new `src/config.js` file centralizes all configuration:

```javascript
// API URL - Backend server URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Public URL - Frontend URL (for QR codes, etc.)
export const PUBLIC_URL = process.env.REACT_APP_PUBLIC_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    CSRF: `${API_URL}/auth/csrf/`,
    LOGIN: `${API_URL}/auth/login/`,
    // ... other endpoints
  },
  // ... other endpoint categories
};
```

## Deployment Process

See the [DEPLOYMENT.md](DEPLOYMENT.md) file for detailed deployment instructions.

### Quick Start

1. Provision an EC2 instance
2. Install Docker and Docker Compose
3. Clone the repository
4. Copy the appropriate environment file
5. Configure your domain (if applicable)
6. Deploy with Docker Compose:

```bash
docker-compose up -d --build
```

## Development Workflow

### Local Development

1. Use the development environment:

```bash
cp .env.development .env
```

2. Start the development servers:

```bash
docker-compose up
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

### Making Changes

When making changes to the code:

1. **Backend Changes**:
   - Update Django views, models, etc. as needed
   - The development server will automatically reload

2. **Frontend Changes**:
   - Update React components as needed
   - Use the `config.js` file for any new API endpoints
   - The development server will automatically reload

3. **Environment Variables**:
   - Add new environment variables to all `.env.*` files
   - Update the Docker Compose file if needed

## Troubleshooting

### Common Issues

1. **Container fails to start**:
   - Check logs: `docker-compose logs`
   - Verify environment variables

2. **Database connection issues**:
   - Check RDS security group settings
   - Verify database credentials

3. **HTTPS not working**:
   - Check SSL certificate paths
   - Verify Nginx configuration

### Logs

- **Backend logs**: `docker-compose logs backend`
- **Frontend logs**: `docker-compose logs frontend`
- **Nginx logs**: `docker-compose logs nginx`

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)