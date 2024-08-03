#!/bin/sh

# Run migrations
echo "Running migrations..."
prisma migrate deploy

# Start the application
echo "Starting the application..."
exec "$@"
