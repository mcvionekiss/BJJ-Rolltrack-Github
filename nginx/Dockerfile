FROM nginx:alpine

# Install dependencies for SSL management and certbot
RUN apk add --no-cache \
    bash \
    openssl \
    certbot \
    certbot-nginx \
    py3-pip \
    python3 \
    && pip3 install --upgrade pip \
    && pip3 install certbot-dns-cloudflare \
    && mkdir -p /etc/nginx/ssl /etc/nginx/templates

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create directories for Let's Encrypt
RUN mkdir -p /var/www/certbot /etc/letsencrypt

# Default nginx config - this will be overridden by mounted config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Default self-signed certificate - overridden by actual certs
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/privkey.pem \
    -out /etc/nginx/ssl/fullchain.pem \
    -subj "/CN=localhost"

# Set working directory for easier command execution
WORKDIR /etc/nginx

# Use our custom entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]