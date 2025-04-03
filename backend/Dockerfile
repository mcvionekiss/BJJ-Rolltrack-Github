FROM python:3.12-slim

# Set environment variables
ARG PIPELINE=development
ENV PIPELINE=${PIPELINE}
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && \
    apt-get install -y default-libmysqlclient-dev build-essential pkg-config && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .

# Install Python dependencies
RUN pip --version && \
    pip install --no-cache-dir -v -r requirements.txt && \
    pip install gunicorn

# Copy the entire project
COPY /backend .

# Create directory for logs
RUN mkdir -p /var/log/django && \
    chmod 777 /var/log/django

# Collect static files
RUN if [ "$PIPELINE" = "production" ] || [ "$PIPELINE" = "staging" ]; then \
        python manage.py collectstatic --noinput; \
    fi

EXPOSE 8000

# Use entrypoint script to handle different environments
COPY backend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]