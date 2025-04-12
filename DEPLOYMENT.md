# BJJ RollTrack Deployment Guide

This document provides instructions for deploying the BJJ RollTrack application to different environments, with a focus on production deployment to Amazon EC2.

## Table of Contents

1. [Environment Overview](#environment-overview)
2. [Local Development](#local-development)
3. [Testing Environment](#testing-environment)
4. [Staging Environment](#staging-environment)
5. [Production Environment](#production-environment)
6. [EC2 Deployment Steps](#ec2-deployment-steps)
7. [Database Configuration](#database-configuration)
8. [SSL Certificates](#ssl-certificates)
9. [Troubleshooting](#troubleshooting)

## Environment Overview

BJJ RollTrack supports multiple deployment environments through environment-specific configuration files:

- **Development**: Local development environment
- **Testing**: Local testing of production-like settings without HTTPS
- **Staging**: Pre-production environment for final testing
- **Production**: Live environment for end users

Each environment uses corresponding configuration files:
- `.env.development` - Development variables
- `.env.testing` - Testing with production-like settings
- `.env.staging` - Staging environment variables
- `.env.production` - Production environment variables

## Local Development

For local development:

```bash
# Start the backend
cd backend
python manage.py runserver

# Start the frontend
cd frontend
npm start
```

## Testing Environment

The testing environment allows you to test production-like settings locally without requiring SSL certificates:

```bash
# Start services using testing configuration
docker-compose --env-file .env.testing up -d
```

Key features of the testing environment:
- Uses production settings with `BYPASS_HTTPS=true`
- Allows testing with your local IP address
- No SSL certificates required

## Staging Environment

The staging environment mirrors production but uses separate infrastructure:

```bash
# Deploy to staging
docker-compose --env-file .env.staging up -d
```

Before deploying to staging:
1. Update `.env.staging` with your actual staging domain and credentials
2. Ensure your DNS is properly configured for the staging domain
3. Obtain SSL certificates for your staging domain

## Production Environment

For production deployment to EC2:

```bash
# Deploy to production
docker-compose --env-file .env.production up -d
```

## EC2 Deployment Steps

### 1. Provision EC2 Instance

1. Launch an EC2 instance (t2.medium or better recommended)
2. Configure security groups:
   - HTTP (80) - For initial setup and redirects
   - HTTPS (443) - For secure traffic
   - SSH (22) - For administration

### 2. Install Dependencies

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Install Docker and Docker Compose
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu

# Install additional tools
sudo apt install -y git certbot
```

### 3. Clone Repository

```bash
git clone https://github.com/your-username/BJJ-Rolltrack.git
cd BJJ-Rolltrack
```

### 4. Configure Environment

1. Copy the example production environment file:
   ```bash
   cp .env.production.example .env.production
   ```

2. Edit the configuration with your actual values:
   ```bash
   nano .env.production
   ```
   
   Update:
   - `REACT_APP_API_URL` with your actual domain
   - `DJANGO_SECRET_KEY` with a secure key
   - `ALLOWED_HOSTS` with your domain
   - `CORS_ALLOWED_ORIGINS` with your domain
   - Database credentials for your RDS instance
   - `DOMAIN_NAME` with your actual domain

### 5. Set Up SSL Certificates

```bash
# Get certificates using Let's Encrypt
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Create directory for certificates
mkdir -p nginx/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl
```

### 6. Deploy Application

```bash
# Build and start containers
docker-compose --env-file .env.production up -d --build
```

### 7. Set Up Auto-renewal for SSL Certificates

```bash
# Create renewal script
cat > renew-certs.sh << 'EOF'
#!/bin/bash
certbot renew
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /path/to/BJJ-Rolltrack/nginx/ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem /path/to/BJJ-Rolltrack/nginx/ssl/
docker-compose -f /path/to/BJJ-Rolltrack/docker-compose.yml restart nginx
EOF

chmod +x renew-certs.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 3 * * * /path/to/renew-certs.sh") | crontab -
```

## Database Configuration

The application is configured to use MySQL:

1. **For production**: Create an RDS MySQL instance
2. **For testing/staging**: Use a local MySQL server

Database configuration is specified in environment files:
```
DB_NAME=bjj_rolltrack_prod
DB_USER=your_db_user
DB_PASSWORD=your_strong_password
DB_HOST=your-db-host
DB_PORT=3306
```

## SSL Certificates

For production and staging environments, SSL certificates are required:

1. **Let's Encrypt**: Free certificates, renewable every 90 days
2. **AWS Certificate Manager**: If using AWS services like CloudFront or ALB

For the testing environment, SSL is disabled via the `BYPASS_HTTPS=true` setting.

## Troubleshooting

### Common Issues

1. **Connection refused to backend**:
   - Check that the backend container is running
   - Verify the API URL in the frontend configuration

2. **CORS errors**:
   - Ensure `CORS_ALLOWED_ORIGINS` includes your frontend domain
   - Check that the protocol (http/https) matches

3. **Database connection issues**:
   - Verify database credentials
   - Check security group rules for RDS access

4. **SSL certificate errors**:
   - Ensure certificates are properly installed
   - Verify the domain names match your actual domain

### Checking Logs

```bash
# Check container logs
docker-compose logs nginx
docker-compose logs backend
docker-compose logs frontend
```

### Restarting Services

```bash
# Restart specific service
docker-compose restart backend

# Restart all services
docker-compose restart