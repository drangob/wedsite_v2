#!/bin/sh

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
exec "$@"
