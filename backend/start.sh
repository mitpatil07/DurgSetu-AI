#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Running Migrations..."
python manage.py migrate

echo "Collecting Static Files..."
python manage.py collectstatic --noinput

echo "Setting up Admin User..."
python setup_admin.py

echo "Starting Gunicorn server..."
# The PORT environment variable is automatically provided by Render
gunicorn backend.wsgi:application --bind 0.0.0.0:${PORT:-8000}
