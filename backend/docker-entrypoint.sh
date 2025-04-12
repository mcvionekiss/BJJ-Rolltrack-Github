#!/bin/bash
set -e

echo "Running entrypoint script..."

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn server
echo "Starting Gunicorn server..."
exec gunicorn server.wsgi:application --bind 0.0.0.0:8000 --workers 3