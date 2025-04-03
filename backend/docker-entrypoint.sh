#!/bin/bash
set -e

# Apply database migrations with error handling
echo "Applying database migrations..."
# First try to migrate with --fake-initial to handle existing tables
python manage.py migrate --fake-initial || {
    echo "Initial migration with --fake-initial failed, trying standard migration..."
    # If that fails, try a regular migration
    python manage.py migrate || {
        echo "Standard migration failed, trying with --run-syncdb..."
        # If that fails, try with --run-syncdb to create tables without migrations
        python manage.py migrate --run-syncdb || {
            echo "Migration failed. Check database connection and schema."
            exit 1
        }
    }
}

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