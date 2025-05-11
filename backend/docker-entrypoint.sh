#!/bin/bash
set -e

echo "Running entrypoint script..."

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Additional fallback for the has_waiver column if it doesn't exist
echo "Ensuring all columns exist in the database..."
python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
import django
django.setup()
from django.db import connection
with connection.cursor() as cursor:
    try:
        # Check if has_waiver column exists in gyms table
        cursor.execute(\"\"\"
            SELECT COUNT(*)
            FROM information_schema.columns
            WHERE table_name = 'gyms' AND column_name = 'has_waiver'
        \"\"\")
        if cursor.fetchone()[0] == 0:
            print('Adding missing has_waiver column to gyms table...')
            cursor.execute('ALTER TABLE gyms ADD COLUMN has_waiver BOOLEAN DEFAULT FALSE')
            print('Added has_waiver column successfully')
    except Exception as e:
        print(f'Error checking/adding column: {e}')
"

# Start Gunicorn server
echo "Starting Gunicorn server..."
exec gunicorn server.wsgi:application --bind 0.0.0.0:8000 --workers 3