#!/bin/bash
set -e

echo "Running entrypoint script..."

# Explicitly set Django settings module to staging
export DJANGO_SETTINGS_MODULE=server.settings.staging
echo "Using Django settings module: $DJANGO_SETTINGS_MODULE"

# Create staticfiles directory if it doesn't exist
mkdir -p /app/backend/staticfiles

# Ensure proper permissions
chmod -R 755 /app/backend/staticfiles

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn server
echo "Starting Gunicorn server..."
exec gunicorn server.wsgi:application --bind 0.0.0.0:8000 --workers 3