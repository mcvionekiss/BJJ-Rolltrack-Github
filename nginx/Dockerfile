FROM nginx:alpine

# Install basic tools
RUN apk add --no-cache bash

# Create directory for SSL certificates
RUN mkdir -p /etc/nginx/ssl

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set working directory
WORKDIR /etc/nginx

# Use our entrypoint script
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]