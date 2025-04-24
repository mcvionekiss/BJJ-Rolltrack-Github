#!/bin/bash
set -e

echo "Running entrypoint script..."



# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn server
echo "Starting Gunicorn server..."
exec gunicorn server.wsgi:application --bind 0.0.0.0:8000 --workers 3