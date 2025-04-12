# BJJ RollTrack Production Setup

This document provides an overview of the changes made to prepare the BJJ RollTrack application for production deployment, particularly on Amazon EC2.

## Changes Overview

### 1. Frontend Configuration

- Implemented a centralized `config.js` for API endpoints
- Replaced hardcoded URLs in React components with dynamic configuration
- Configured frontend to work with different backend environments

### 2. Environment-specific Configuration

Created environment files for different deployment scenarios:

- `.env.development` - Local development
- `.env.testing` - Testing production settings locally without HTTPS
- `.env.staging` - Staging environment
- `.env.production` - Production environment (EC2)

### 3. Backend Improvements

- Created Django settings for staging environments
- Enhanced security settings for production
- Configured database connection pooling
- Added proper CORS configuration
- Improved static file handling

### 4. Login Page as Root

- The login page is already configured as the default landing page
- The root URL (`/`) redirects to `/login`

## Quick Start Guide

### Local Development

```bash
# Start backend
cd backend
python manage.py runserver

# Start frontend
cd frontend
npm start
```

### Local Testing (Production-like)

```bash
# Use testing environment
docker-compose --env-file .env.testing up -d
```

### Staging Deployment

```bash
# Deploy to staging
docker-compose --env-file .env.staging up -d
```

### Production Deployment

```bash
# Deploy to production
docker-compose --env-file .env.production up -d
```

## EC2 Deployment Notes

For EC2 deployment:

1. Set up EC2 instance with Docker and Docker Compose
2. Configure `.env.production` with your actual domain and database credentials
3. Obtain SSL certificates for your domain
4. Deploy using the production environment file

For detailed deployment steps, see [DEPLOYMENT.md](DEPLOYMENT.md).

## URL Configuration

All API URLs are now centralized in `frontend/src/config.js`, which loads the base URL from environment variables:

```javascript
// frontend/src/config.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const config = {
  apiUrl: API_URL,
  endpoints: {
    auth: {
      csrf: `${API_URL}/auth/csrf/`,
      login: `${API_URL}/auth/login/`,
      // ...other endpoints
    }
  }
};
```

This allows you to change the backend URL by setting the `REACT_APP_API_URL` environment variable without modifying code.

## Database Configuration

The database configuration is now loaded from environment variables in all environments:

```
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=3306
```

For EC2 deployment, it's recommended to use Amazon RDS for the database.

## Testing Without HTTPS

For local testing of production-like settings without SSL certificates:

1. Use the `.env.testing` file
2. This sets `BYPASS_HTTPS=true` to disable HTTPS requirements
3. You can test using your local IP address

## Troubleshooting

Common issues and their solutions:

1. **Connection errors**: Check that the API URL in the config is correct
2. **CORS errors**: Ensure the frontend origin is listed in `CORS_ALLOWED_ORIGINS`
3. **Database errors**: Verify database credentials and connectivity

For more detailed troubleshooting, see [DEPLOYMENT.md](DEPLOYMENT.md).