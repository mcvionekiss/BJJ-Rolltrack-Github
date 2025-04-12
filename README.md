# BJJ-Rolltrack Application

A web application for Brazilian Jiu Jitsu gym management, allowing student check-ins, class scheduling, and attendance tracking.

## Production-Ready Configuration

This application has been configured for deployment to multiple environments:

- **Development** - Local development environment
- **Testing** - Production-like testing without HTTPS
- **Staging** - Pre-production environment
- **Production** - Full production environment on Amazon EC2

## Key Features

- React frontend with dynamic API configuration
- Django backend with REST API
- Docker-based deployment
- MySQL database support
- Environment-specific configuration
- HTTPS support
- Production-ready security measures

## Project Structure

```
├── backend/                 # Django backend application
│   ├── server/              # Main application
│   │   ├── settings/        # Environment-specific settings
│   │   │   ├── __init__.py  # Settings loader
│   │   │   ├── local.py     # Development settings
│   │   │   ├── staging.py   # Staging settings
│   │   │   └── production.py # Production settings
│   │   ├── views.py         # API endpoints
│   │   └── urls.py          # URL routing
│   ├── Dockerfile           # Backend Docker configuration
│   └── docker-entrypoint.sh # Backend startup script
│
├── frontend/                # React frontend application
│   ├── src/                 # React source code
│   │   ├── components/      # React components
│   │   └── config.js        # API configuration
│   ├── Dockerfile           # Frontend Docker configuration
│   └── nginx/               # Frontend nginx configuration
│
├── docker-compose.yml             # Development compose file
├── docker-compose.staging.yml     # Staging compose file
├── .env.development               # Development environment variables
├── .env.testing                   # Testing environment variables
├── .env.staging                   # Staging environment variables
└── .env.production                # Production environment variables
```

## Environment Variables

To configure different environments, use the appropriate .env file:

### Development (.env.development)

```
# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000

# Backend Configuration
PIPELINE=local
DJANGO_SECRET_KEY=dev_secret_key
DB_NAME=bjj_rolltrack_dev
DB_USER=dev_user
DB_PASSWORD=dev_password
DB_HOST=localhost
DB_PORT=3306
```

### Staging (.env.staging)

```
# Frontend Configuration
REACT_APP_API_URL=http://staging.your-domain.com

# Backend Configuration
PIPELINE=staging
DJANGO_SECRET_KEY=staging_secret_key
ALLOWED_HOSTS=staging.your-domain.com
CORS_ALLOWED_ORIGINS=http://staging.your-domain.com
DB_NAME=bjj_rolltrack_staging
DB_USER=staging_user
DB_PASSWORD=staging_password
DB_HOST=your-staging-db-host
DB_PORT=3306
BYPASS_HTTPS=false
```

### Production (.env.production)

```
# Frontend Configuration
REACT_APP_API_URL=https://your-domain.com

# Backend Configuration
PIPELINE=production
DJANGO_SECRET_KEY=production_secret_key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
DB_NAME=bjj_rolltrack_prod
DB_USER=production_user
DB_PASSWORD=production_password
DB_HOST=your-mysql-endpoint.rds.amazonaws.com
DB_PORT=3306
BYPASS_HTTPS=false
```

## Deployment Instructions

### Local Development

```bash
# Start with development configuration
docker-compose up -d
```

### Staging Deployment

```bash
# Deploy to staging
docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d
```

### Production Deployment on EC2

1. Launch an EC2 instance with sufficient resources
2. Install Docker and Docker Compose
3. Set up an RDS MySQL database
4. Clone the repository
5. Create SSL certificates (if using HTTPS)
6. Create or update `.env.production` with your configuration
7. Deploy using:

```bash
docker-compose -f docker-compose.staging.yml --env-file .env.production up -d
```

## Security Features

- CSRF protection on all endpoints
- Authentication required for sensitive operations
- Rate limiting for login attempts
- Proper error handling to avoid information leakage
- HTTPS configuration
- Database connection pooling
- Cache configuration for performance

## Testing Without HTTPS

For local testing without SSL certificates:

1. Set `BYPASS_HTTPS=true` in your environment file
2. Use the `.env.testing` file for local testing
3. Access using your local IP address

## Additional Documentation

For more detailed information, see:

- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment instructions
- [TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md) - Technical details and architecture
- [PRODUCTION_README.md](PRODUCTION_README.md) - Production deployment summary