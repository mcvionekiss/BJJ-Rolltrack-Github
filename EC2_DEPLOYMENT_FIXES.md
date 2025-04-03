# EC2 Deployment Fixes

This document outlines the fixes made to resolve deployment issues on Amazon EC2 and provides instructions for deploying the application.

## Issues Fixed

### 1. Nginx Configuration Error

**Problem:** The Nginx configuration had a `user nginx;` directive at the beginning of the file, which is not allowed in configuration files placed in the `/etc/nginx/conf.d/` directory.

**Fix:** Removed the `user nginx;` directive from the `nginx/nginx.conf` file and replaced it with a comment.

### 2. Database Migration Issues

**Problem:** Database migrations were failing with errors like `Table 'django_admin_log' already exists` and `Failed to open the referenced table 'gym_owner'`.

**Fix:** Updated the `backend/docker-entrypoint.sh` script to handle migrations more gracefully:
- First tries to migrate with the `--fake-initial` flag
- If that fails, tries a standard migration
- If that fails, tries with the `--run-syncdb` flag
- Provides better error handling and logging

### 3. Frontend Docker User Permission Issues

**Problem:** The frontend Dockerfile was trying to run as the `node` user for development but as `root` for production/staging, but the implementation had logical issues.

**Fix:** Updated the frontend Dockerfile to:
- Properly set user permissions based on the environment
- Correctly copy the Nginx configuration file to the templates directory
- Improve logging and startup commands

## Deployment Instructions

### 1. Set Up Environment Variables

1. Copy the appropriate environment file for your deployment:
   ```bash
   # For production
   cp .env.production .env
   ```

2. Edit the `.env` file to set your specific configuration:
   - Set `DOMAIN_NAME` to your actual domain name
   - Set `DJANGO_SECRET_KEY` to a secure key (generate one with `python backend/secretskeygenerator.py`)
   - Update database credentials if needed
   - Set `USE_HTTPS` to `True` if you want to use HTTPS

### 2. SSL Certificate Setup (for HTTPS)

If you're using HTTPS (`USE_HTTPS=True`):

1. Place your SSL certificate and key files in a directory on your EC2 instance
2. Update the `.env` file with the paths to your certificate and key:
   ```
   SSL_CERTIFICATE=/path/to/cert.pem
   SSL_KEY=/path/to/key.pem
   ```

### 3. Deploy with Docker Compose

1. Build and start the containers:
   ```bash
   docker-compose up -d --build
   ```

2. Check the logs to ensure everything is running correctly:
   ```bash
   docker-compose logs
   ```

### 4. Domain Configuration

1. Configure your domain's DNS to point to your EC2 instance's public IP address
2. If using HTTPS, ensure your SSL certificates are valid for your domain

### 5. Troubleshooting

If you encounter issues:

1. Check the container logs:
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   docker-compose logs nginx
   ```

2. For database issues, you can try resetting the migrations:
   ```bash
   docker-compose exec backend python manage.py migrate --fake-initial
   ```

3. For Nginx configuration issues, check the Nginx logs:
   ```bash
   docker-compose exec nginx cat /var/log/nginx/error.log
   ```

## Environment Configuration

The application supports three environments:

1. **Development**: Local development environment
   - Set `PIPELINE=development` and `REACT_APP_ENV=development`
   - Uses Django's development server and React's development server

2. **Staging**: Testing environment that mimics production
   - Set `PIPELINE=staging` and `REACT_APP_ENV=staging`
   - Uses Gunicorn with 2 workers and Nginx

3. **Production**: Live production environment
   - Set `PIPELINE=production` and `REACT_APP_ENV=production`
   - Uses Gunicorn with 4 workers and Nginx
   - Includes additional performance optimizations

You can switch between environments by changing these variables in your `.env` file.