#!/bin/bash
set -e

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Create superuser if DJANGO_SUPERUSER_* environment variables are set
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_EMAIL" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "Creating superuser..."
    python manage.py createsuperuser --noinput || true
fi

# Start server based on environment
if [ "$PIPELINE" = "production" ]; then
    echo "Starting production server with Gunicorn..."
    # Start Gunicorn with 4 workers, timeout of 120 seconds
    exec gunicorn server.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers 4 \
        --timeout 120 \
        --access-logfile /var/log/django/access.log \
        --error-logfile /var/log/django/error.log
elif [ "$PIPELINE" = "staging" ]; then
    echo "Starting staging server with Gunicorn..."
    # Start Gunicorn with 2 workers, timeout of 120 seconds
    exec gunicorn server.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers 2 \
        --timeout 120 \
        --access-logfile /var/log/django/access.log \
        --error-logfile /var/log/django/error.log
else
    echo "Starting development server..."
    # Start Django development server
    exec python manage.py runserver 0.0.0.0:8000
fi