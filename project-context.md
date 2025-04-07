# BJJ-RollTrack-Github Project Context

This document provides a comprehensive overview of the BJJ-RollTrack application's architecture, configuration, and structure to help LLMs quickly understand the project.

## Project Overview

BJJ-RollTrack is a web application for tracking Brazilian Jiu-Jitsu training sessions and progress. The application follows a modern microservices architecture with separate frontend and backend components, all orchestrated with Docker and fronted by Nginx for SSL termination and load balancing.

## Project Architecture

The project is structured as a Docker-based application with three main services:

1. **Frontend**: React-based web application
2. **Backend**: Django-based API server
3. **Nginx**: Web server for SSL termination, load balancing, and serving static content

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│   Client    │────▶│    Nginx    │────▶│  Frontend   │
│   Browser   │     │   (HTTPS)   │     │  (React)    │
│             │     │             │     │             │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                           │            ┌─────────────┐
                           └───────────▶│  Backend    │
                                        │  (Django)   │
                                        │             │
                                        └─────────────┘
```

## Directory Structure

Here's the high-level directory structure of the project:

```
BJJ-RollTrack-Github/
├── backend/               # Django backend service
│   ├── Dockerfile         # Backend container setup
│   └── ... 
├── certbot/               # Let's Encrypt certificate management
│   └── www/               # Webroot for ACME challenges
├── frontend/              # React frontend service
│   ├── Dockerfile         # Frontend container setup
│   └── ...
├── nginx/                 # Nginx configuration
│   ├── Dockerfile         # Nginx container setup
│   ├── docker-entrypoint.sh       # Startup script for Nginx
│   ├── nginx.conf         # Static Nginx configuration
│   ├── ssl/               # SSL certificates
│   │   ├── cert.pem       # SSL certificate
│   │   └── key.pem        # SSL private key
│   └── templates/         # Nginx configuration templates
│       ├── common_settings.inc            # Shared Nginx settings
│       ├── default.conf.template          # Default config template
│       ├── http_only.template             # HTTP-only config
│       ├── http_redirect.template         # HTTP to HTTPS redirect
│       └── https_server_block.template    # HTTPS server config
├── docker-compose.yml     # Service orchestration config
├── .env                   # Environment variables
└── project-context.md     # This file
```

## Service Configuration

### Frontend Service

- **Technology**: React
- **Build**: The frontend is built during the Docker image creation
- **Environment Variables**:
  - `REACT_APP_ENV`: Environment (development/production)
  - `REACT_APP_API_URL`: URL to the backend API
  - `REACT_APP_PUBLIC_URL`: Public URL of the application

### Backend Service

- **Technology**: Django
- **Database**: MySQL (AWS RDS)
- **Environment Variables**:
  - Database connection: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
  - `DJANGO_SECRET_KEY`: Secret key for Django
  - `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
  - `CORS_ALLOWED_ORIGINS`: Allowed CORS origins

### Nginx Service

- **Purpose**: SSL termination, load balancing, static file serving
- **Configuration Strategy**: Dynamic generation from templates based on environment variables
- **SSL Certificates**: Located at `/etc/nginx/ssl/cert.pem` and `/etc/nginx/ssl/key.pem`

## Nginx Configuration in Detail

### Configuration Flow

The Nginx configuration is dynamically generated at container startup based on:
1. Environment variables
2. Presence of SSL certificates

The `docker-entrypoint.sh` script:
- Checks if HTTPS is enabled (`USE_HTTPS=true`) and if SSL certificates exist
- Generates the appropriate configuration from templates
- Tests the configuration before starting Nginx

### HTTPS Configuration

When SSL is enabled and certificates are present:
- HTTP server redirects all traffic to HTTPS (except Let's Encrypt challenges)
- HTTPS server (port 443) serves the application with TLS 1.2/1.3
- HSTS headers are added for additional security
- Certificates are read from the mounted volume

### HTTP Fallback

If SSL is disabled or certificates are not available:
- HTTP-only configuration is used
- No redirection to HTTPS occurs
- Let's Encrypt challenge paths are still configured

### Proxy Configuration

- `/api/*` routes are proxied to the backend service
- All other routes are proxied to the frontend service
- Static files (JS, CSS, images) are served with appropriate cache headers
- Health check endpoints are configured for monitoring

## Environment Variables (.env)

Key environment variables that control the application:

```
# Deployment Environment
PIPELINE=production              # Environment type (development/production)
REACT_APP_ENV=production         # React app environment

# Domain Configuration
DOMAIN_NAME=rolltrackapp.com     # Primary domain name
ALLOWED_HOSTS=...                # Allowed host names

# HTTPS Configuration
USE_HTTPS=true                   # Whether to use HTTPS
SSL_CERTIFICATE=...              # Path to SSL certificate in container
SSL_KEY=...                      # Path to SSL key in container
```

## SSL/HTTPS Setup

The project supports HTTPS via:

1. **Pre-installed Certificates**: SSL certificates (cert.pem/key.pem) in the nginx/ssl directory
2. **Let's Encrypt Support**: Directory structure for Let's Encrypt ACME challenges

Certificate renewal would typically be handled by a certbot service, but this is not currently configured in the docker-compose.yml.

## Docker Volumes

The project uses several persistent volumes:
- `static-data`: Django static files
- `media-data`: Uploaded media files
- `nginx-certs`: SSL certificates
- `nginx-conf`: Nginx configuration
- `frontend-build`: Frontend build files

## Networking

All services are connected via a custom Docker network called `app-network`, allowing services to communicate with each other by container name.

## Health Checks

Each service has configured health checks to ensure robustness:
- Backend: Checks the `/health/` endpoint
- Frontend: Checks HTTP response
- Nginx: Checks HTTP response on port 80

This comprehensive overview should provide enough context for an LLM to quickly understand the project structure and assist with related tasks.