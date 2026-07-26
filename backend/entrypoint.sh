#!/usr/bin/env bash
set -e

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Setting up admin user..."
python setup_admin.py || true

# If DEBUG is False or SERVE_GUNICORN is set, run Gunicorn for production
if [ "${DEBUG,,}" = "false" ] || [ "${SERVE_GUNICORN}" = "true" ]; then
    echo "Collecting static files..."
    python manage.py collectstatic --noinput
    echo "Starting Gunicorn production server..."
    exec gunicorn backend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3 --timeout 120
else
    echo "Starting Django Development Server with auto-reloading..."
    exec python manage.py runserver 0.0.0.0:${PORT:-8000}
fi
