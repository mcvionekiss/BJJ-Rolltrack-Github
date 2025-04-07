# Nginx Configuration Structure

This document provides a detailed explanation of the Nginx configuration setup used in this project. Understanding this structure is crucial for debugging and maintaining the application.

## Overview

The nginx configuration in this project uses a template-based system that generates the actual configuration files during container startup. This approach allows for dynamic configuration based on environment variables.

## Configuration Files Overview

The Nginx configuration in this project is split across multiple files and uses a template-based generation system. This creates a layered structure that can be confusing if you're only looking at the repository files.

### Repository Files vs. Container Files

One of the most important things to understand is that the Nginx configuration files you see in the repository are **not directly used** by the Nginx container. Instead, they are used as templates to generate the actual configuration files that run inside the container.

| Repository Files | Container Files |
|------------------|-----------------|
| `nginx/nginx.conf` | `/etc/nginx/nginx.conf` (main config) |
| `nginx/templates/*.template` | `/etc/nginx/conf.d/*.conf` (generated configs) |

### Configuration Files Inside the Container

When the Nginx container starts, it uses the following configuration files:

1. **`/etc/nginx/nginx.conf`** - The main Nginx configuration file with global settings
2. **`/etc/nginx/conf.d/default.conf`** - HTTP server configuration that redirects to HTTPS
3. **`/etc/nginx/conf.d/https.conf`** - HTTPS server configuration with SSL settings
4. **`/etc/nginx/conf.d/common_settings.inc`** - Shared location blocks included by both server configurations

## How Configuration is Generated

The `docker-entrypoint.sh` script in the Nginx container is responsible for generating the final configuration files:

1. It reads template files from `/etc/nginx/templates/`
2. It substitutes environment variables using `envsubst`
3. It writes the processed files to `/etc/nginx/conf.d/`

### Environment Variable Substitution

Variables in templates are written as `${VARIABLE_NAME}` and are replaced with their values during startup. The container supports both uppercase and lowercase variables, but you need to explicitly export both formats for proper substitution.

```bash
# In docker-entrypoint.sh
export FRONTEND_HOST=...
export frontend_host=${FRONTEND_HOST}  # Lowercase version for templates that use lowercase
```

## Configuration Structure Details

### 1. Main Nginx Configuration (`nginx.conf`)

This file contains the global Nginx settings and should include:
- `user` directive
- `worker_processes` and other performance settings
- `events` block with connection settings
- Main `http` block with global HTTP settings
- `include /etc/nginx/conf.d/*.conf;` directive to load server configurations

### 2. HTTP Server Configuration (`default.conf`)

This file defines the HTTP server that listens on port 80:
- Redirects all traffic to HTTPS when SSL is available
- Handles Let's Encrypt certificate validation challenges
- Sample structure:
  ```nginx
  server {
      listen 80;
      server_name example.com;
      
      # Let's Encrypt verification
      location /.well-known/acme-challenge/ {
          root /var/www/certbot;
      }
      
      # Redirect to HTTPS
      location / {
          return 301 https://$host$request_uri;
      }
  }
  ```

### 3. HTTPS Server Configuration (`https.conf`)

This file defines the HTTPS server that listens on port 443:
- Contains SSL certificate configuration
- Includes common settings from `common_settings.inc`
- Sample structure:
  ```nginx
  server {
      listen 443 ssl http2;
      server_name example.com;
      
      # SSL Configuration
      ssl_certificate /etc/nginx/ssl/cert.pem;
      ssl_certificate_key /etc/nginx/ssl/key.pem;
      ssl_protocols TLSv1.2 TLSv1.3;
      
      # Include common settings
      include /etc/nginx/conf.d/common_settings.inc;
  }
  ```

### 4. Common Settings (`common_settings.inc`)

This file contains the location blocks shared by both HTTP and HTTPS servers:
- Frontend proxy configuration
- Backend API proxy configuration
- Static file handling
- Location-specific caching rules
- Sample structure:
  ```nginx
  # Frontend routes
  location / {
      proxy_pass http://frontend:80;
      # proxy headers...
  }
  
  # API routes
  location /api/ {
      proxy_pass http://backend:8000;
      # proxy headers...
  }
  
  # Special route handling
  location /api/auth/ {
      rewrite ^/api/(.*) /$1 break;
      proxy_pass http://backend:8000;
      # proxy headers...
  }
  ```

## Location Block Order and Priority

Nginx processes location blocks in a specific order, which is **critical** for proper routing:

1. **Exact match**: `location = /path`
2. **Preferential prefix match**: `location ^~ /path`
3. **Regex match**: `location ~ /path/.*\.php$`
4. **Prefix match**: `location /path`

In our configuration, the order of location blocks in `common_settings.inc` is crucial:

```nginx
# More specific route must come first
location /api/auth/ {
    # ...
}

# More general route comes after
location /api/ {
    # ...
}
```

If these were reversed, the `/api/` block would always match first, and the `/api/auth/` block would never be used.

## SSL Certificate Configuration

SSL certificates are mounted into the container at `/etc/nginx/ssl/`:

- Certificate file: `/etc/nginx/ssl/cert.pem`
- Private key: `/etc/nginx/ssl/key.pem`

These paths must match the ones referenced in the `https.conf` file and in the environment variables:

```yaml
# In docker-compose.yml
environment:
  - SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
  - SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

## Making Changes to Nginx Configuration

### Method 1: Update Template Files (Recommended)

For persistent changes that survive container restarts:

1. Modify the template files in `nginx/templates/`
2. Rebuild and restart the Nginx container:
   ```bash
   docker-compose up -d --build nginx
   ```

### Method 2: Direct File Modification (Quick Testing)

For testing changes before making them permanent:

1. Modify files directly inside the container:
   ```bash
   docker exec -it bjj-nginx vi /etc/nginx/conf.d/common_settings.inc
   ```
2. Reload Nginx to apply changes:
   ```bash
   docker exec bjj-nginx nginx -s reload
   ```
3. If the changes work, update the template files to make them persistent

## Common Debugging Commands

### Check Nginx Configuration Syntax

```bash
docker exec bjj-nginx nginx -t
```

### View Nginx Configuration Inside Container

```bash
docker exec bjj-nginx cat /etc/nginx/conf.d/common_settings.inc
```

### View Nginx Error Logs

```bash
docker exec bjj-nginx cat /var/log/nginx/error.log
```

### Check If Nginx is Running

```bash
docker exec bjj-nginx ps aux | grep nginx
```

### Check If SSL Certificates Are Present

```bash
docker exec bjj-nginx ls -la /etc/nginx/ssl/
```

## Common Issues and Solutions

### 1. "unknown directive" Error

**Problem**: Error like `unknown directive "Enable"` in configuration files.

**Solution**: Ensure all comments start with `#`. Text without `#` is interpreted as a directive.

### 2. 404 Errors for API Routes

**Problem**: API requests return 404 even though the routes are correctly defined in the backend.

**Solution**: 
- Check location block order in `common_settings.inc`
- Ensure more specific routes come before general routes
- Verify `proxy_pass` points to the correct service

### 3. SSL Certificate Errors

**Problem**: SSL handshake fails or certificates aren't found.

**Solution**:
- Ensure certificate files exist at the paths specified in `https.conf`
- Check volume mounts in `docker-compose.yml`
- Verify SSL paths in environment variables match actual file paths

### 4. Rewrite Rule Not Working

**Problem**: URL rewriting not functioning as expected.

**Solution**:
- Verify syntax of `rewrite` directive
- Check logs to see what URL is being passed to the upstream server
- Test with `curl` using the `-v` flag to see request details

## Advanced Configuration

### HTTP/2 Support

HTTP/2 is enabled on the HTTPS server with the directive in `https.conf`:

```nginx
listen 443 ssl http2;
```

Note: The newer syntax is:

```nginx
listen 443 ssl;
http2 on;
```

### HSTS (HTTP Strict Transport Security)

HSTS is enabled to enhance security:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### Gzip Compression

Gzip compression is enabled for text-based content:

```nginx
gzip on;
gzip_comp_level 5;
gzip_types text/plain text/css application/javascript application/json;
```

## Conclusion

Understanding the Nginx configuration structure is essential for maintaining and troubleshooting the application. The layered approach with templates and include files provides flexibility but requires attention to where changes need to be made.

Remember that the most common issue is making changes to files in the repository but not seeing them reflected in the running container. Always verify which files are actually being used by checking inside the container.