# Deployment Troubleshooting Guide

This document outlines common deployment issues encountered with the BJJ Rolltrack application and their solutions.

## "Welcome to nginx" Page Instead of Application

### Symptoms
- Accessing the domain shows the default "Welcome to nginx" page instead of the application login page
- Docker containers appear to be running correctly
- 400 Bad Request errors in the nginx logs

### Root Causes

We identified multiple issues that caused this problem:

1. **Nginx Configuration Conflict**
   - Multiple nginx configurations with different routing strategies were present
   - The Certbot-managed configuration (`rolltrackapp.com`) was correctly set up but not active
   - A custom configuration (`rolltrack-app.conf`) was active but using a different routing strategy
   - This conflict caused routing problems and 400 Bad Request errors

2. **Frontend Container Volume Mounts**
   - The frontend container had a development volume mount in docker-compose.yml:
     ```yaml
     volumes:
       - ./frontend:/app/frontend  # This was overriding production build files
     ```
   - This was overriding the production build files with source code

3. **Host Header Handling Issues**
   - Inconsistent Host header formatting between different nginx layers
   - The Docker nginx configuration expected the Host header in a specific format

### Solution

1. **Activate the Correct Nginx Configuration**
   ```bash
   # Remove the conflicting configuration
   sudo rm /etc/nginx/sites-enabled/rolltrack-app.conf
   
   # Enable the Certbot-managed configuration
   sudo ln -sf /etc/nginx/sites-available/rolltrackapp.com /etc/nginx/sites-enabled/
   
   # Restart nginx
   sudo systemctl restart nginx
   ```

2. **Fix Docker Compose Configuration**
   - Removed the problematic volume mount in docker-compose.yml:
     ```yaml
     volumes:
       # Only preserve node_modules volume for caching
       - /app/frontend/node_modules
     ```

3. **Simplify Host Header Handling**
   - Updated the Docker nginx configuration to use simpler header handling:
     ```nginx
     # Frontend
     location / {
         proxy_pass http://frontend:80;
         proxy_set_header Host $host;
         # other headers...
     }
     ```

4. **Restart All Services**
   ```bash
   sudo docker compose restart
   ```

### Why This Works

This approach resolves the issues by:

1. **Using a Single Configuration Path**
   - The Certbot-managed configuration is already set up correctly for:
     - HTTP to HTTPS redirection
     - Proper routing to application containers
     - SPA (Single Page Application) routing support
     - API request handling

2. **Preventing Build File Overrides**
   - Removing the development volume mount ensures the container uses the properly built production files

3. **Simplifying Header Propagation**
   - The simplified header handling ensures consistent headers are passed between the different nginx layers

## Certificate/SSL Issues

Let's Encrypt certificates are managed by Certbot, which automatically updates both the certificates and the nginx configuration. The following files are involved:

- Certificate files: `/etc/letsencrypt/live/rolltrackapp.com/`
- Nginx configuration: `/etc/nginx/sites-available/rolltrackapp.com`
- Renewal configuration: `/etc/letsencrypt/renewal/rolltrackapp.com.conf`

### Important Notes

1. **Certbot Automation**
   - Certbot automatically manages both certificates and nginx configuration
   - If you make manual changes to the Certbot-managed nginx configuration, they might be overwritten during certificate renewal

2. **Proper Configuration Order**
   - Host nginx (on ports 80/443) handles SSL termination and proxies to Docker containers
   - Docker containers should be configured to accept connections on their respective ports without SSL

3. **Docker Networking**
   - The host nginx configuration uses localhost ports (8000, 3000) to access Docker containers
   - Ensure these ports are correctly exposed in the docker-compose.yml file

## Maintenance Tips

1. **After Certificate Renewal**
   - Check if any custom configurations need to be reapplied after Certbot automatic renewals
   - Certificate renewals typically happen every 90 days

2. **Checking Nginx Configurations**
   - Review active nginx configurations: `ls -la /etc/nginx/sites-enabled/`
   - Test nginx configuration: `sudo nginx -t`
   - View error logs: `sudo tail -f /var/log/nginx/error.log`

3. **Docker Container Health Checks**
   - Check container status: `sudo docker compose ps`
   - View container logs: `sudo docker logs <container_name>`
   - Test inter-container networking: `sudo docker exec nginx curl -v http://frontend:80`

When making changes to the deployment configuration, always restart the affected services to apply the changes:

```bash
sudo systemctl restart nginx
sudo docker compose restart