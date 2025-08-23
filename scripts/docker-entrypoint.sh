#!/bin/sh
set -e

echo "🚀 Starting PoolManager deployment..."

# Check database connection
echo "📊 Checking database connection..."
until node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect().then(() => {
  console.log('✅ Database connected');
  process.exit(0);
}).catch((e) => {
  console.log('❌ Database connection failed:', e.message);
  process.exit(1);
});
"; do
  echo "⏳ Waiting for database..."
  sleep 5
done

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ Migrations failed"
  exit 1
fi

# Start the application
echo "🎯 Starting application..."
exec "$@"