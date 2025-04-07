# BJJ RollTrack - Technical Implementation Guide

This technical guide provides detailed information about the implementation changes made to make the BJJ RollTrack application production-ready. It's intended for developers who need to understand the technical details of the changes.

## Table of Contents

1. [Environment Variable System](#environment-variable-system)
2. [Backend Implementation Details](#backend-implementation-details)
3. [Frontend Implementation Details](#frontend-implementation-details)
4. [Docker Configuration](#docker-configuration)
5. [Nginx Configuration](#nginx-configuration)
6. [Database Configuration](#database-configuration)
7. [Security Considerations](#security-considerations)
8. [Performance Optimizations](#performance-optimizations)

## Environment Variable System

### Implementation Details

The environment variable system is implemented using:

1. **Docker environment variables**: Passed to containers via docker-compose.yml
2. **.env files**: For local configuration
3. **Environment-specific settings files**: For Django settings

### Loading Process

1. Docker Compose loads variables from the `.env` file
2. These variables are passed to containers as environment variables
3. The backend loads variables using `os.getenv()` in `settings/__init__.py`
4. The frontend loads variables at build time for production, or at runtime for development

### Variable Precedence

1. Environment variables set in the shell
2. Variables in the `.env` file
3. Default values in the code

## Backend Implementation Details

### Django Settings Structure

The Django settings have been restructured to support multiple environments:

```python
# settings/__init__.py
import os

def get_secret(secret_id, backup=None):
    return os.getenv(secret_id, backup)

# Determine which settings file to load based on PIPELINE environment variable
pipeline = get_secret('PIPELINE', 'development')

if pipeline == 'production':
    from .production import *
elif pipeline == 'staging':
    from .staging import *
else:  # Default to development
    from .local import *

# Override settings with environment variables if they exist
ALLOWED_HOSTS = get_secret('ALLOWED_HOSTS', '').split(',') or ALLOWED_HOSTS
CORS_ALLOWED_ORIGINS = get_secret('CORS_ALLOWED_ORIGINS', '').split(',') or CORS_ALLOWED_ORIGINS
CSRF_TRUSTED_ORIGINS = get_secret('CSRF_TRUSTED_ORIGINS', '').split(',') or CSRF_TRUSTED_ORIGINS
```

### Health Check Implementation

The health check endpoint is implemented in `views.py`:

```python
@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint for monitoring and load balancing.
    Checks database connection and returns service status.
    """
    status = {
        "status": "healthy",
        "timestamp": now().isoformat(),
        "service": "BJJ RollTrack API",
        "checks": {
            "database": "ok"
        }
    }
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception as e:
        status["status"] = "unhealthy"
        status["checks"]["database"] = str(e)
    
    # Return 200 if healthy, 503 if unhealthy
    status_code = 200 if status["status"] == "healthy" else 503
    return JsonResponse(status, status=status_code)
```

### Gunicorn Configuration

For production, we use Gunicorn with the following configuration:

```bash
gunicorn server.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --timeout 120 \
    --access-logfile /var/log/django/access.log \
    --error-logfile /var/log/django/error.log
```

- **workers**: Number of worker processes (4 for production, 2 for staging)
- **timeout**: Request timeout in seconds
- **logfiles**: Locations for access and error logs

## Frontend Implementation Details

### Configuration System

The frontend configuration system is implemented in `src/config.js`:

```javascript
// API URL - Backend server URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Public URL - Frontend URL (for QR codes, etc.)
export const PUBLIC_URL = process.env.REACT_APP_PUBLIC_URL || 'http://localhost:3000';

// Environment (development, staging, production)
export const ENV = process.env.REACT_APP_ENV || 'development';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    CSRF: `${API_URL}/auth/csrf/`,
    LOGIN: `${API_URL}/auth/login/`,
    LOGOUT: `${API_URL}/auth/logout/`,
    REGISTER: `${API_URL}/auth/register/`,
  },
  // Student endpoints
  STUDENT: {
    CHECK: `${API_URL}/check-student/`,
    CHECKIN: `${API_URL}/checkin/`,
  },
  // Class endpoints
  CLASS: {
    AVAILABLE: `${API_URL}/available-classes/`,
    DETAILS: (id) => `${API_URL}/class-details/${id}/`,
    ADD: `${API_URL}/add-class/`,
  },
};

// QR Code URL
export const QR_CODE_URL = `${PUBLIC_URL}/checkin`;

// Is Production Environment
export const IS_PRODUCTION = ENV === 'production';

// Is Development Environment
export const IS_DEVELOPMENT = ENV === 'development';

// Is Staging Environment
export const IS_STAGING = ENV === 'staging';
```

### Component Updates

Components have been updated to use the configuration system instead of hardcoded URLs:

```javascript
// Before
const response = await axios.get("http://localhost:8000/auth/csrf/", { withCredentials: true });

// After
import { API_ENDPOINTS } from "../config";
const response = await axios.get(API_ENDPOINTS.AUTH.CSRF, { withCredentials: true });
```

### Build Process

For production builds, the environment variables are embedded at build time:

```bash
# In Dockerfile
ARG REACT_APP_ENV=development
ARG REACT_APP_API_URL=http://localhost:8000
ARG REACT_APP_PUBLIC_URL=http://localhost:3000

ENV REACT_APP_ENV=${REACT_APP_ENV}
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_PUBLIC_URL=${REACT_APP_PUBLIC_URL}

# Build the application if in production or staging mode
RUN if [ "$REACT_APP_ENV" = "production" ] || [ "$REACT_APP_ENV" = "staging" ]; then \
        npm run build; \
    fi
```

## Docker Configuration

### Multi-Environment Support

The Docker configuration supports multiple environments through:

1. **Build arguments**: For environment-specific builds
2. **Environment variables**: For runtime configuration
3. **Conditional logic**: For environment-specific behavior

### Backend Dockerfile

Key features of the backend Dockerfile:

```dockerfile
# Set environment variables
ARG PIPELINE=development
ENV PIPELINE=${PIPELINE}
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install Python dependencies
RUN pip install --no-cache-dir -v -r requirements.txt && \
    pip install gunicorn

# Collect static files for production/staging
RUN if [ "$PIPELINE" = "production" ] || [ "$PIPELINE" = "staging" ]; then \
        python manage.py collectstatic --noinput; \
    fi

# Use entrypoint script for environment-specific startup
ENTRYPOINT ["/docker-entrypoint.sh"]
```

### Frontend Dockerfile

Key features of the frontend Dockerfile:

```dockerfile
# Set environment variables
ARG REACT_APP_ENV=development
ARG REACT_APP_API_URL=http://localhost:8000
ARG REACT_APP_PUBLIC_URL=http://localhost:3000

ENV REACT_APP_ENV=${REACT_APP_ENV}
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_PUBLIC_URL=${REACT_APP_PUBLIC_URL}

# Build for production/staging
RUN if [ "$REACT_APP_ENV" = "production" ] || [ "$REACT_APP_ENV" = "staging" ]; then \
        npm run build && \
        apk add --no-cache nginx && \
        mkdir -p /run/nginx; \
    fi

# Start appropriate server based on environment
CMD if [ "$REACT_APP_ENV" = "production" ] || [ "$REACT_APP_ENV" = "staging" ]; then \
        nginx -g 'daemon off;'; \
    else \
        npm start; \
    fi
```

### Docker Compose Configuration

Key features of the docker-compose.yml file:

```yaml
version: '3.8'

services:
  # Backend service with multiple replicas for redundancy
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
      args:
        - PIPELINE=${PIPELINE:-development}
    deploy:
      replicas: ${BACKEND_REPLICAS:-1}
      restart_policy:
        condition: on-failure
        max_attempts: 3
    environment:
      - PIPELINE=${PIPELINE:-development}
      - DEBUG=${DEBUG:-False}
      # ... other environment variables
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend service
  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
      args:
        - REACT_APP_ENV=${REACT_APP_ENV:-development}
        - REACT_APP_API_URL=${REACT_APP_API_URL:-http://localhost:8000}
        - REACT_APP_PUBLIC_URL=${REACT_APP_PUBLIC_URL:-http://localhost:3000}
    # ... other configuration

  # Nginx service for SSL termination and load balancing
  nginx:
    image: nginx:alpine
    # ... configuration for SSL and load balancing
```

## Nginx Configuration

### SSL Termination

The Nginx configuration handles SSL termination:

```nginx
# HTTPS server
server {
    listen 443 ssl http2;
    server_name ${DOMAIN_NAME};

    # SSL configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # ... other configuration
}
```

### Load Balancing

The Nginx configuration handles load balancing for backend servers:

```nginx
# Define upstream for backend servers
upstream backend_servers {
    server backend:8000;
    # Additional backend servers can be added here for horizontal scaling
    # server backend2:8000;
    # server backend3:8000;
}

# Proxy API requests to the backend
location /api/ {
    proxy_pass http://backend_servers;
    # ... proxy settings
}
```

## Database Configuration

### Connection Pooling

The Django database configuration includes connection pooling for better performance:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": DB_NAME,
        "USER": DB_USER,
        "PASSWORD": DB_PASSWORD,
        "HOST": DB_HOST,
        "PORT": DB_PORT,
        # Production database settings for performance and reliability
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
            'connect_timeout': 10,
        },
        # Connection pooling for better performance
        'CONN_MAX_AGE': 60,
    }
}
```

### Caching

The Django settings include caching configuration:

```python
# Cache settings for better performance
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'bjj-rolltrack-cache',
    }
}
```

## Security Considerations

### HTTPS Configuration

The application is configured to use HTTPS in production and staging:

1. **SSL certificates**: Stored in `/etc/nginx/ssl/`
2. **HSTS**: Enabled for enhanced security
3. **Secure cookies**: Enabled for session cookies

### Environment Variables

Sensitive information is stored in environment variables:

1. **Database credentials**: DB_USER, DB_PASSWORD, etc.
2. **Django secret key**: DJANGO_SECRET_KEY
3. **API keys**: Any external service API keys

### CSRF Protection

The application uses Django's CSRF protection:

1. **CSRF tokens**: Generated by the backend
2. **CSRF middleware**: Enabled in Django settings
3. **CSRF headers**: Sent with API requests

## Performance Optimizations

### Backend Optimizations

1. **Connection pooling**: Reuse database connections
2. **Caching**: Cache frequently accessed data
3. **Gunicorn workers**: Multiple workers for parallel processing
4. **Static file serving**: Nginx serves static files directly

### Frontend Optimizations

1. **Production build**: Minified and optimized assets
2. **Gzip compression**: Enabled in Nginx
3. **Cache headers**: Set for static assets
4. **Code splitting**: Implemented in the React application

### Nginx Optimizations

1. **Gzip compression**: Enabled for text-based content
2. **Cache headers**: Set for static assets
3. **Keepalive connections**: Enabled for better performance
4. **Worker processes**: Set to auto for optimal resource usage