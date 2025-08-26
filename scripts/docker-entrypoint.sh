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
  
  # Mark all existing migrations as applied
  npx prisma migrate resolve --applied "20250816213427_init"
  npx prisma migrate resolve --applied "20250816214312_add_game_status" 
  npx prisma migrate resolve --applied "20250817172155_add_grade_overrides"
  npx prisma migrate resolve --applied "20250820_add_survivor_models"
  npx prisma migrate resolve --applied "20250823_add_data_source_tracking"
  npx prisma migrate resolve --applied "20250823_optimize_indexes"
  
  # Run migrations again to catch any new ones
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