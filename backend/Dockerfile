FROM python:3.12-slim

WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && \
    apt-get install -y default-libmysqlclient-dev build-essential pkg-config && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .

# Install dependencies and Gunicorn for production
RUN pip --version && \
    pip install --no-cache-dir -v -r requirements.txt && \
    pip install gunicorn

# Copy the entire project
COPY /backend .

# Create directory for static files
RUN mkdir -p staticfiles && \
    chmod +x ./docker-entrypoint.sh

# Default to production, can be overridden at runtime
ENV PIPELINE=production

EXPOSE 8000

# Use entrypoint script for startup tasks (migrations, collectstatic)
ENTRYPOINT ["/app/backend/docker-entrypoint.sh"]