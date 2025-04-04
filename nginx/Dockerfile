FROM nginx:alpine

# Copy templates
COPY nginx/templates /etc/nginx/templates

# Copy the entrypoint script
COPY nginx/docker-entrypoint.sh /docker-entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /docker-entrypoint.sh

# Create directories for certificates and Let's Encrypt
RUN mkdir -p /etc/nginx/ssl /var/www/certbot

# Set default environment variables
ENV DOMAIN_NAME=localhost
ENV FRONTEND_HOST=bjj-rolltrack-github_frontend_1
ENV FRONTEND_PORT=3000
ENV BACKEND_HOST=bjj-rolltrack-github_backend_1
ENV BACKEND_PORT=8000
ENV USE_HTTPS=false

# Use our custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]