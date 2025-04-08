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

# Proxy to frontend container
location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html;  # This ensures React Router works for all paths
    
    proxy_pass http://${FRONTEND_HOST}:${FRONTEND_PORT};
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

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

# Proxy API requests to the backend
location /api/ {
    proxy_pass http://${BACKEND_HOST}:${BACKEND_PORT};
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# Redirect server error pages
error_page 500 502 503 504 /50x.html;
location = /50x.html {
    root /usr/share/nginx/html;
}