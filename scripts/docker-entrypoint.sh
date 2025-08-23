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

if [ $? -ne 0 ]; then
  echo "⚠️  Migration failed, attempting to baseline existing database..."
  # Try to baseline with the first migration
  npx prisma migrate resolve --applied "20250816213427_init"
  
  # Run migrations again
  npx prisma migrate deploy
  
  if [ $? -eq 0 ]; then
    echo "✅ Migrations completed after baseline"
  else
    echo "❌ Migrations still failed"
    exit 1
  fi
else
  echo "✅ Migrations completed successfully"
fi

# Start the application
echo "🎯 Starting application..."
exec "$@"