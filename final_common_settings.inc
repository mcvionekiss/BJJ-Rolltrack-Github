# Enable gzip compression
gzip on;
gzip_comp_level 5;
gzip_min_length 256;
gzip_proxied any;
gzip_vary on;
gzip_types
application/javascript
application/json
application/x-javascript
application/xml
application/xml+rss
image/svg+xml
text/css
text/javascript
text/plain
text/xml;

# Proxy to frontend
location / {
    proxy_pass http://bjj-rolltrack-github_frontend_1:80;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    proxy_pass http://bjj-rolltrack-github_frontend_1:80;
    proxy_set_header Host $host;
    expires 30d;
    add_header Cache-Control "public, no-transform";
}

# Don't cache HTML
location ~* \.html$ {
    proxy_pass http://bjj-rolltrack-github_frontend_1:80;
    proxy_set_header Host $host;
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
}

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

# Proxy API requests to the backend
location /api/ {
    proxy_pass http://bjj-rolltrack-github_backend_1:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# Serve static files directly
location /static/ {
    alias /usr/share/nginx/static/;
    expires 30d;
    add_header Cache-Control "public, no-transform";
}

# Serve media files directly
location /media/ {
    alias /usr/share/nginx/media/;
    expires 30d;
    add_header Cache-Control "public, no-transform";
}

# Redirect server error pages
error_page 500 502 503 504 /50x.html;
location = /50x.html {
    root /usr/share/nginx/html;
}