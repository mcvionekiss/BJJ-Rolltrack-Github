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

### 4. React Build Path Issue

**Problem:** The React application was built assuming it is hosted at the root path (`/`), but this wasn't explicitly configured in the package.json file.

**Fix:** Added the `"homepage": "/"` field to the frontend/package.json file to explicitly set the base URL path for the application.

### 5. Docker Compose Container Configuration Error

**Problem:** Docker Compose was failing with `KeyError: 'ContainerConfig'` when trying to create backend containers, particularly when using the `deploy` section with `replicas`.

**Fix:** Removed the `deploy` section from the docker-compose.yml file and replaced it with a standard `restart: unless-stopped` policy. Added a comment explaining how to manually scale the backend service for redundancy using `docker-compose up --scale backend=2`.

### 6. Nginx Global Directives Error

**Problem:** The nginx container was failing to start with the error: `"worker_processes" directive is not allowed here in /etc/nginx/conf.d/default.conf:2`.

**Fix:** Removed all global directives from the nginx/nginx.conf file, including:
- Removed `worker_processes auto;`
- Removed `error_log /var/log/nginx/error.log warn;`
- Removed `pid /var/run/nginx.pid;`
- Removed the `events { ... }` block
- Removed the `http { ... }` block (keeping only the server blocks inside)

These global directives should only be in the main nginx.conf file, not in configuration files placed in the conf.d directory.

### 7. Nginx Boolean Condition Error

**Problem:** The nginx container was failing to start with the error: `invalid condition "true" in /etc/nginx/conf.d/default.conf:26`.

**Fix:** Updated the USE_HTTPS conditions in nginx/nginx.conf:
- Changed `if ($USE_HTTPS = true)` to `if ($USE_HTTPS = "true")`
- Changed `if ($USE_HTTPS != true)` to `if ($USE_HTTPS != "true")`

**Explanation:** In Nginx, conditions should use string comparisons rather than unquoted boolean literals. The unquoted value "true" was causing an error because Nginx doesn't recognize it as a valid condition value. Using quoted strings is the correct way to handle these conditions in Nginx.

### 8. Environment Variable Case Sensitivity

**Problem:** The environment variables in the .env files were using lowercase boolean values (`true` and `false`), which is correct.

**Fix:** No changes were needed to the environment variables, as they were already using the correct lowercase values:
- `USE_HTTPS=true` in .env.production and .env.staging
- `USE_HTTPS=false` in .env.development

**Explanation:** Nginx is case-sensitive when it comes to string comparisons. When environment variables are substituted in the Nginx configuration, they need to match the expected format. Using lowercase values in the environment files and quoted strings in the Nginx configuration ensures compatibility.

### 9. Frontend Nginx Configuration Issue

**Problem:** The frontend Nginx configuration had a comment indicating conditional HTTPS support, but no actual condition to check if HTTPS was enabled.

**Fix:** Updated the frontend/nginx/nginx.conf file to conditionally include the HTTPS server block:
- Added `if ($USE_HTTPS != true) { return 404; }` to the HTTPS server block
- Updated the comment to clarify that the server block is only included if USE_HTTPS is true

**Explanation:** Without the conditional check, the HTTPS server block would always be included, which could cause issues if SSL certificates weren't available or if HTTPS was disabled. Adding the condition ensures that the HTTPS server block is only active when USE_HTTPS is set to true.

### 10a. Caching and Static Asset Loading Issues - Multi-Server Architecture

**Problem:** After deployment, the React app is not formatted correctly, and users are still being redirected to the register page instead of the login page despite correct configuration in both frontend and backend code.

**Investigation:** The application uses a dual-nginx architecture:
1. Main nginx container (acting as a reverse proxy)
2. Frontend container with its own nginx server for serving static assets

Both needed caching configuration fixes to fully resolve the issue.

**Fix Part 1 - Main Nginx Container:**
1. Modified the main nginx.conf configuration to reduce aggressive caching:
   ```nginx
   # For static assets like JS, CSS, and images
   expires 5m;
   add_header Cache-Control "public, max-age=300, must-revalidate";
   
   # For HTML content
   add_header Cache-Control "no-cache, no-store, must-revalidate";
   add_header Pragma "no-cache";
   add_header Expires "0";
   ```

2. Added additional debug headers to track when assets are served:
   ```nginx
   add_header X-Asset-Served-Time $date_gmt;
   ```

**Fix Part 2 - Frontend Nginx Container:**
1. Modified the frontend/nginx/common_locations.inc file to reduce caching for static assets:
   ```nginx
   # Cache static assets with reduced caching period
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       proxy_pass http://${FRONTEND_HOST}:${FRONTEND_PORT};
       proxy_set_header Host $host;
       # Reduced caching time to 5 minutes instead of 30 days
       expires 5m;
       add_header Cache-Control "public, max-age=300, must-revalidate";
       # Add timestamp in header for debugging
       add_header X-Asset-Served-Time $date_gmt;
   }
   ```

2. Strengthened the no-cache directives for HTML files:
   ```nginx
   # Don't cache HTML with stronger no-cache directives
   location ~* \.html$ {
       proxy_pass http://${FRONTEND_HOST}:${FRONTEND_PORT};
       proxy_set_header Host $host;
       expires -1;
       add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
       add_header Pragma "no-cache";
       add_header Expires "0";
       # Add timestamp in header for debugging
       add_header X-HTML-Served-Time $date_gmt;
   }
   ```

**Complete Deployment Steps:**
1. Update both nginx configuration files in the repository:
   - nginx/nginx.conf (main proxy)
   - frontend/nginx/common_locations.inc (frontend server)

2. For immediate testing on the running containers:
   ```bash
   # Step 1: Apply changes to the main nginx container
   docker cp nginx/nginx.conf bjj-nginx:/etc/nginx/nginx.conf
   docker exec bjj-nginx nginx -s reload
   
   # Step 2: For frontend nginx changes, you MUST rebuild the frontend container
   docker-compose build --no-cache frontend
   docker-compose up -d --force-recreate frontend
   ```

3. For a complete production deployment:
   ```bash
   # Full rebuild with updated configurations
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. Clear browser caches (critical step):
   - Chrome: Settings → Privacy and Security → Clear browsing data
   - Firefox: Options → Privacy & Security → Cookies and Site Data → Clear Data
   - Or use Ctrl+F5 (Windows) or Cmd+Shift+R (Mac) for a hard refresh

**Explanation:** This issue was caused by aggressive caching (30 days for static assets) in both nginx servers. The frontend's nginx server was still using 30-day caching even after the main nginx.conf was updated. By updating both configurations and rebuilding the frontend container, we ensure that all static assets are served with appropriate caching headers.

### 10b. Nginx Environment Variable Processing Issue

**Problem:** The nginx container was failing with the error: `unknown "frontend_host" variable` even though the templates were correctly using uppercase variables (`${FRONTEND_HOST}`).

**Fix:** Modified the `nginx/docker-entrypoint.sh` script to address the variable case sensitivity issue:
- Added explicit lowercase variable exports for compatibility:
  ```bash
  export frontend_host=${FRONTEND_HOST}
  export frontend_port=${FRONTEND_PORT}
  export backend_host=${BACKEND_HOST}
  export backend_port=${BACKEND_PORT}
  export ssl_cert_path=${SSL_CERT_PATH}
  export ssl_key_path=${SSL_KEY_PATH}
  ```
- Changed from restricted variable substitution to unrestricted:
  ```bash
  # From:
  envsubst '${DOMAIN_NAME} ${FRONTEND_HOST} ${FRONTEND_PORT}...' < template > output
  # To:
  envsubst < template > output
  ```

**Explanation:** The nginx configuration processor was looking for lowercase variable names in some contexts but the script was only exporting uppercase versions. By explicitly exporting both uppercase and lowercase versions of all variables, and using unrestricted variable substitution, the script ensures all variable references will be properly replaced regardless of case.

### 11. HTTPS Configuration Issues

**Problem:** HTTPS is not working on the deployed application, resulting in connection refused errors when trying to fetch the CSRF token.

**Fix:** 
- Change `USE_HTTPS=false` to `USE_HTTPS=true` in docker-compose.yml
- Uncomment the SSL certificate volume mounts:
  ```yaml
  - ./certbot/conf/live/rolltrackapp.com/fullchain.pem:/etc/nginx/ssl/fullchain.pem:ro
  - ./certbot/conf/live/rolltrackapp.com/privkey.pem:/etc/nginx/ssl/privkey.pem:ro
  ```
- Ensure the certificate file names match between nginx.conf and environment variables:
  ```
  # In nginx.conf, change:
  ssl_certificate /etc/nginx/ssl/cert.pem;
  ssl_certificate_key /etc/nginx/ssl/key.pem;
  
  # To:
  ssl_certificate /etc/nginx/ssl/fullchain.pem;
  ssl_certificate_key /etc/nginx/ssl/privkey.pem;
  ```
  
  OR 
  
  ```
  # In docker-compose.yml, change:
  SSL_CERT_PATH=/etc/nginx/ssl/fullchain.pem
  SSL_KEY_PATH=/etc/nginx/ssl/privkey.pem
  
  # To:
  SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
  SSL_KEY_PATH=/etc/nginx/ssl/key.pem
  ```

**Explanation:** The HTTPS configuration is disabled by default, and there's a mismatch between the expected certificate file names in nginx.conf and the actual file names provided in docker-compose.yml. Additionally, the certificate volume mounts are commented out, preventing the certificates from being available to the container.

### 12. API URL Structure Mismatch

**Problem:** The frontend is trying to access API endpoints at `/api/auth/csrf/` but the backend routes auth endpoints at `/auth/csrf/` (without the "api" prefix), resulting in 404 errors.

**Fix:** 
1. **Option 1:** Update nginx.conf to route `/api/auth/` to the backend's `/auth/` path:
   ```nginx
   location /api/auth/ {
       # Remove /api prefix before passing to backend
       rewrite ^/api/(.*) /$1 break;
       proxy_pass http://bjj-rolltrack-github_backend_1:8000;
       # other proxy settings...
   }
   ```

2. **Option 2:** Update backend urls.py to include the auth endpoints with an "api" prefix:
   ```python
   # Keep existing auth routes
   path("auth/csrf/", get_csrf_token, name="csrf_token"),
   # Add duplicated routes with api prefix
   path("api/auth/csrf/", get_csrf_token, name="api_csrf_token"),
   ```

3. **Option 3:** Update frontend config.js to not include the api prefix for auth endpoints:
   ```javascript
   // If API_URL includes '/api' suffix already
   export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
   // Remove '/api' for auth endpoints
   export const AUTH_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
   
   export const API_ENDPOINTS = {
     // Auth endpoints
     AUTH: {
       CSRF: `${AUTH_BASE_URL}/auth/csrf/`,
       // other auth endpoints...
     },
     // Keep API prefix for other endpoints
     // ...
   }
   ```

**Explanation:** There's a structural mismatch between how the frontend calls API endpoints and how they're defined in the backend. The frontend includes the `/api/` prefix in all URLs, but the backend routes for auth endpoints don't include this prefix. This causes 404 errors when trying to access auth endpoints.

### 13. Redirect Path Conflict

**Problem:** Users are being redirected to the register page instead of the login page upon initial page load.

**Fix:**
Ensure frontend and backend redirects are aligned:

1. In backend/server/urls.py:
   ```python
   # Change:
   path('', RedirectView.as_view(url='/auth/login/')),
   
   # To:
   path('', RedirectView.as_view(url='/login'))
   ```
   
   OR
   
2. In frontend/src/App.js:
   ```jsx
   // Change:
   <Route path="/" element={<Navigate to="/login" />} />
   
   # To match backend URL:
   <Route path="/" element={<Navigate to="/auth/login" />} />
   <Route path="/auth/login" element={<Login />} />
   ```

**Explanation:** There's a conflict between the backend and frontend routing configurations. The backend redirects the root path to `/auth/login/`, but the frontend routes don't handle this path and instead redirect the root to `/login`. This inconsistency causes navigation issues and unexpected redirects.

### 14. Implementation Fix Details: HTTPS and Routing Issues

#### Initial Issues Reported:

1. **HTTPS Not Working**: The site couldn't be accessed over HTTPS
2. **CSRF Token Fetch Failure**: Error message `Failed to fetch CSRF token Network Error`
3. **Incorrect Redirection**: Users being redirected to register page instead of login page

#### Root Causes Identified:

1. **HTTPS Configuration Problems**:
   - `USE_HTTPS=false` in docker-compose.yml disabled HTTPS
   - SSL certificate volume mounts were commented out
   - Certificate file paths were inconsistent between nginx.conf and environment variables

2. **API Routing Mismatch**:
   - Frontend sending requests to `/api/auth/csrf/` 
   - Backend expecting requests at `/auth/csrf/` (without `/api` prefix)
   - No URL rewriting rule to handle this discrepancy

3. **Conflicting Redirect Paths**:
   - Backend redirecting root to `/auth/login/`
   - Frontend redirecting root to `/login`
   - This mismatch caused unexpected navigation behavior

#### Fixes Implemented:

1. **HTTPS Configuration Fixes**:
   - Changed `USE_HTTPS=false` to `USE_HTTPS=true` in docker-compose.yml
   - Added direct mounts for the existing SSL certificates:
     ```yaml
     - ./nginx/ssl/cert.pem:/etc/nginx/ssl/cert.pem:ro
     - ./nginx/ssl/key.pem:/etc/nginx/ssl/key.pem:ro
     ```
   - Updated SSL paths in environment variables to match the actual files:
     ```yaml
     - SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
     - SSL_KEY_PATH=/etc/nginx/ssl/key.pem
     ```

2. **API Routing Fixes**:
   - Added specific location block in nginx.conf for `/api/auth/` paths:
     ```nginx
     # Specific handler for auth endpoints - strip /api prefix
     location /api/auth/ {
         # Rewrite to remove /api prefix before passing to backend
         rewrite ^/api/(.*) /$1 break;
         proxy_pass http://bjj-rolltrack-github_backend_1:8000;
         # other proxy settings...
     }
     ```
   - This allows frontend to use `/api/auth/csrf/` while backend receives at `/auth/csrf/`
   - Added this block to both HTTP and HTTPS server blocks for consistency

3. **Redirect Path Fix**:
   - Updated backend URLs configuration to match frontend expectations:
     ```python
     # Changed from:
     path('', RedirectView.as_view(url='/auth/login/')),
     
     # To:
     path('', RedirectView.as_view(url='/login')),
     ```
   - This ensures consistent routing behavior between frontend and backend

#### Deployment Steps:

1. Update the following files:
   - docker-compose.yml
   - nginx/nginx.conf
   - backend/server/urls.py

2. Restart the services:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. Verify the fixes:
   - HTTPS should work correctly
   - CSRF token should be fetched successfully
   - Root URL should redirect to login page instead of register page

#### Additional Notes:

- SSL certificates were found in the `/nginx/ssl/` directory with names `cert.pem` and `key.pem`
- The certbot volume structure exists but directories are empty, suggesting Let's Encrypt auto-renewal is configured but not active yet
- No changes were made to frontend code as the backend and nginx routing changes addressed the issues without requiring frontend modifications

### 15. Nginx Configuration Structure and CSRF Token 404 Issue

**Problem:** Despite updating nginx.conf with proper rewrite rules for /api/auth/ paths, requests to /api/auth/csrf/ were still resulting in 404 errors. This occurred because the nginx container doesn't directly use the nginx.conf file from the repository.

**Investigation:**
- Inspecting the container revealed that nginx was using configuration files in the `/etc/nginx/conf.d/` directory
- The actual configuration was split across multiple files:
  - `default.conf`: HTTP server configuration that redirects to HTTPS
  - `https.conf`: HTTPS server configuration with SSL settings
  - `common_settings.inc`: Shared location blocks for both HTTP and HTTPS servers
- These files are generated from templates in the `/etc/nginx/templates/` directory

**Fix:**
1. Created a corrected version of `common_settings.inc` with a specific location block for `/api/auth/` paths:
   ```nginx
   # Special handling for auth API requests - ensure auth endpoints work with or without /api prefix
   location ~ ^/api/auth/(.*)$ {
       # Remove /api prefix before forwarding to backend
       rewrite ^/api/(.*) /$1 break;
       proxy_pass http://bjj-rolltrack-github_backend_1:8000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_cache_bypass $http_upgrade;
       
       # Add more detailed logging for debugging
       access_log /var/log/nginx/auth_debug.log;
   }
   ```

2. Applied the fix in two ways:
   a. **Immediate fix** (only persists until container restart):
      ```bash
      # Copy to active config and reload nginx
      docker cp common_settings.inc bjj-nginx:/etc/nginx/conf.d/common_settings.inc
      docker exec bjj-nginx nginx -s reload
      ```
   
   b. **Permanent fix** (persists after container restarts):
      ```bash
      # Copy to template directory
      docker cp common_settings.inc bjj-nginx:/etc/nginx/templates/common_settings.inc
      
      # Restart the nginx container to regenerate configs from templates
      docker-compose restart nginx
      ```

**Explanation:** The container uses a template-based configuration system that generates the actual nginx config files during container startup. Our original changes to nginx.conf weren't being applied because the container was using its own internal templates. By identifying the actual template structure and modifying both the active configuration and the template files, we ensured that the fix would persist even after container restarts.

### 16. Frontend API Endpoint Configuration Mismatch

**Problem:** Even after fixing the nginx configuration, the application was still experiencing CSRF token fetch failures and redirections to the register page instead of login. This was happening because the frontend's API endpoint construction wasn't properly handling the API_URL variable when it already included '/api' as a suffix.

**Investigation:**
- In `frontend/src/config.js`, API endpoints are constructed by appending paths to `API_URL`:
  ```javascript
  export const API_ENDPOINTS = {
    AUTH: {
      CSRF: `${API_URL}/auth/csrf/`,
      LOGIN: `${API_URL}/auth/login/`,
      // ...
    },
    // ...
  }
  ```
- In production, `REACT_APP_API_URL` is set to `https://rolltrackapp.com/api` in docker-compose.yml
- This results in auth endpoint URLs like `https://rolltrackapp.com/api/auth/csrf/` 
- However, backend routes expect auth endpoints at `/auth/csrf/` (without the `/api` prefix)
- Our nginx rewrite rule was attempting to fix this, but wasn't always matching correctly

**Fix:**
1. Updated `frontend/src/config.js` to handle API_URL that already contains '/api':
   ```javascript
   // Helper function to remove /api suffix if present
   const removeApiSuffix = (url) => url.endsWith('/api') ? url.slice(0, -4) : url;

   // API base URL for auth endpoints - prevents double /api/ in paths
   export const AUTH_BASE_URL = removeApiSuffix(API_URL);

   // API Endpoints
   export const API_ENDPOINTS = {
     // Auth endpoints
     AUTH: {
       CSRF: `${AUTH_BASE_URL}/auth/csrf/`,
       LOGIN: `${AUTH_BASE_URL}/auth/login/`,
       LOGOUT: `${AUTH_BASE_URL}/auth/logout/`,
       REGISTER: `${AUTH_BASE_URL}/auth/register/`,
     },
     // ...other endpoints...
   };
   ```

2. Improved the nginx location block with a more precise regex pattern:
   ```nginx
   # Special handling for auth API requests - ensure auth endpoints work with or without /api prefix
   location ~ ^/api/auth/(.*)$ {
       # Remove /api prefix before forwarding to backend
       rewrite ^/api/(.*) /$1 break;
       proxy_pass http://bjj-rolltrack-github_backend_1:8000;
       # ... other proxy settings ...
       
       # Add more detailed logging for debugging
       access_log /var/log/nginx/auth_debug.log;
   }
   ```

**Explanation:** This was a dual-layer problem. The frontend was constructing incorrect URLs when API_URL already contained '/api', and the nginx rewrite rule wasn't always matching properly. By updating both the frontend configuration and nginx location block, we ensured that auth endpoints would work correctly regardless of how the API_URL is set.

**Important Note:** After deploying these changes, the frontend may need to be rebuilt to incorporate the config.js changes. If immediate testing is needed, consider editing the deployed JavaScript bundle directly, but a proper rebuild should be scheduled for a permanent fix.

**Important Notes:**
- When making nginx configuration changes, always use proper comment syntax with `#` prefix
- Location block order matters - more specific routes (like `/api/auth/`) should come before more general ones (like `/api/`)
- Always reload nginx after configuration changes: `nginx -s reload`
- For persistent changes across container restarts, update both:
  1. The active configuration in `/etc/nginx/conf.d/`
  2. The template files in `/etc/nginx/templates/`
- When working with templates that contain variables like `${FRONTEND_HOST}`, either:
  1. Use the same variables in your updates, or
  2. Replace them with actual values if copying directly to the conf.d directory

### 17. Nginx Configuration Syntax Errors

**Problem:** The nginx container was failing to start with the error: `"upstream" directive is not allowed here in /etc/nginx/nginx.conf:2`. After fixing this issue, another error appeared: `no "events" section in configuration`.

**Investigation:**
- The `upstream` directive was placed at the global level of the configuration file, outside of any blocks
- Nginx requires the `upstream` directive to be placed inside an `http` block
- Nginx also requires an `events` section in the main configuration, even if empty

**Fix:**
1. Added the required `http` block to contain the `upstream` directive:
   ```nginx
   # Before: 
   # Define upstream for backend servers (for load balancing)
   upstream backend_servers {
       server backend:8000;
       # Additional backend servers can be added here
   }
   
   # After:
   http {
       # Define upstream for backend servers (for load balancing)
       upstream backend_servers {
           server backend:8000;
           # Additional backend servers can be added here
       }
       
       # ... server blocks ...
   }
   ```

2. Added the mandatory `events` section at the top level:
   ```nginx
   # Events section (required by nginx)
   events {
       # Sets the maximum number of simultaneous connections that can be opened by a worker process
       worker_connections 1024;
       # multi_accept on;
   }
   
   http {
       # ... configuration continues ...
   }
   ```

3. Ensured proper nesting of all server blocks inside the http block and fixed indentation for better readability.

**Explanation:** 
- The `upstream` directive must be placed inside an `http` block because it defines HTTP load balancing resources that are only applicable within HTTP context
- The `events` section is mandatory in the main nginx configuration as it defines global connection processing parameters
- Even if the `events` section contains only defaults, it must be present for nginx to start properly
- Proper indentation and block structure not only improves readability but also helps prevent syntax errors

**Testing:** After applying these fixes, the nginx syntax test passes successfully and the container starts normally:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
Starting Nginx...
```

**Note:** There may still be a harmless warning about the deprecated `listen ... http2` directive. This is not an error but a recommendation to use the newer `http2` directive syntax instead.

**Additional Issue:** After fixing the above errors, you might encounter the following issue:
```
nginx: [emerg] host not found in upstream "bjj-rolltrack-github_frontend_1" in /etc/nginx/nginx.conf:38
```

**Fix:**
1. In nginx.conf, replace all instances of full container names with service names as defined in docker-compose.yml:
   ```nginx
   # Change from:
   proxy_pass http://bjj-rolltrack-github_frontend_1:80;
   proxy_pass http://bjj-rolltrack-github_backend_1:8000;
   
   # To:
   proxy_pass http://frontend:80;
   proxy_pass http://backend:8000;
   ```

2. This change should be made for all proxy_pass directives in both HTTP and HTTPS server blocks.

**Explanation:** 
- Docker Compose uses DNS for service discovery based on service names, not container names
- Container names may change or be dynamically assigned with prefixes based on the project name
- Using the service names directly (frontend, backend) as defined in docker-compose.yml is more reliable
- This ensures proper DNS resolution within the Docker network regardless of container name changes

### 18. Static Asset 404 Errors with SPA Routes

**Problem:** The login page was unable to load its static assets (JS and CSS files), resulting in 404 errors:
```
GET https://rolltrackapp.com/static/js/main.2aedc46c.js net::ERR_ABORTED 404 (Not Found)
GET https://rolltrackapp.com/static/css/main.e75da00a.css net::ERR_ABORTED 404 (Not Found)
```
While the register page worked correctly, the login page specifically had issues loading its assets.

**Fix:** Updated the nginx configuration to better handle Single Page Application (SPA) routing and static file serving:
1. Added a more specific location block for static files with reduced caching:
   ```nginx
   # Handle static asset requests
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
       root /usr/share/nginx/html;
       expires 5m;
       add_header Cache-Control "public, max-age=300, must-revalidate";
       add_header X-Asset-Served-Time $date_gmt;
       try_files $uri =404;
   }
   ```

2. Improved the main location block to properly handle SPA routing and prevent HTML caching:
   ```nginx
   # Handle SPA routing - serve index.html for all non-file routes
   location / {
       root /usr/share/nginx/html;
       index index.html;
       try_files $uri $uri/ /index.html;
       
       # Disable caching for HTML to ensure fresh content
       add_header Cache-Control "no-cache, no-store, must-revalidate";
       add_header Pragma "no-cache";
       add_header Expires "0";
   }
   ```

3. Ensured all location blocks were properly ordered from most specific to least specific

**Explanation:** 
- Single Page Applications (SPAs) like React require special nginx configuration to handle direct URL access
- When a user directly navigates to a route like /login, the server needs to serve index.html, not try to find a /login file
- Static assets need to be properly handled with their own location block
- Aggressive caching (30 days) was preventing updated files from being loaded by returning browsers
- Reducing cache times to 5 minutes and adding proper cache control headers ensures that clients get fresh content
- The try_files directive is critical for SPA routing, ensuring all non-file routes serve the main index.html
- Location block order matters - more specific patterns should be listed before more general ones

**For a Complete Solution:**
To ensure the fix is permanently applied and included in future deployments:

1. Apply the fixes to the running containers:
   ```bash
   # Copy updated nginx.conf to the container
   docker cp nginx/nginx.conf bjj-nginx:/etc/nginx/nginx.conf
   
   # Reload Nginx configuration
   docker exec bjj-nginx nginx -s reload
   ```

2. If issues persist, perform a more thorough update:
   ```bash
   # Rebuild the frontend container completely
   docker-compose build --no-cache frontend
   
   # Restart containers
   docker-compose up -d --force-recreate nginx frontend
   ```

3. Clear browser cache:
   - Use hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache through browser settings

4. To ensure the fix is applied automatically with every deployment, update your docker-compose.yml to mount the updated nginx.conf:
   ```yaml
   services:
     nginx:
       # ... other configuration ...
       volumes:
         # ... other volumes ...
         - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
   ```

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
   - Ensure `REACT_APP_API_URL` and API endpoint configurations are consistent with your backend routes

### 2. Update Package.json (if needed)

Ensure the frontend/package.json file has the "homepage" field set correctly:
```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "homepage": "/",
  ...
}
```

### 3. SSL Certificate Setup (for HTTPS)

If you're using HTTPS (`USE_HTTPS=True`):

1. Place your SSL certificate and key files in a directory on your EC2 instance
2. Update the `.env` file with the paths to your certificate and key:
   ```
   SSL_CERTIFICATE=/path/to/cert.pem
   SSL_KEY=/path/to/key.pem
   ```

### 4. Deploy with Docker Compose

1. Build and start the containers:
   ```bash
   docker-compose up -d --build
   ```

2. Check the logs to ensure everything is running correctly:
   ```bash
   docker-compose logs
   ```

3. For redundancy, you can manually scale the backend service:
   ```bash
   docker-compose up -d --scale backend=2
   ```

### 5. Domain Configuration

1. Configure your domain's DNS to point to your EC2 instance's public IP address
2. If using HTTPS, ensure your SSL certificates are valid for your domain

### 6. Troubleshooting

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

4. If you encounter the `KeyError: 'ContainerConfig'` error again, make sure you're not using the `deploy` section in your docker-compose.yml file, as this is only supported in Docker Swarm mode.

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