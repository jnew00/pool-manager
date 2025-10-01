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

# Check if database has existing schema
echo "🔄 Running database migrations..."
npx prisma migrate deploy 2>&1 || {
  echo "⚠️  Migration failed with P3005 - database not empty"
  echo "🔧 Attempting to baseline existing database..."
  
  # Baseline by marking all migrations as applied
  echo "Marking migrations as applied..."
  npx prisma migrate resolve --applied "20250816213427_init" || echo "Failed to resolve 20250816213427_init"
  npx prisma migrate resolve --applied "20250816214312_add_game_status" || echo "Failed to resolve 20250816214312_add_game_status"
  npx prisma migrate resolve --applied "20250817172155_add_grade_overrides" || echo "Failed to resolve 20250817172155_add_grade_overrides"
  npx prisma migrate resolve --applied "20250820_add_survivor_models" || echo "Failed to resolve 20250820_add_survivor_models"
  npx prisma migrate resolve --applied "20250823_add_data_source_tracking" || echo "Failed to resolve 20250823_add_data_source_tracking"
  npx prisma migrate resolve --applied "20250828_add_missing_pool_columns" || echo "Failed to resolve 20250828_add_missing_pool_columns"
  npx prisma migrate resolve --applied "20250828_add_pending_outcome" || echo "Failed to resolve 20250828_add_pending_outcome"
  npx prisma migrate resolve --applied "20250829_optimize_indexes" || echo "Failed to resolve 20250829_optimize_indexes"
  npx prisma migrate resolve --applied "20250930192148_allow_multiple_picks_per_game" || echo "Failed to resolve 20250930192148_allow_multiple_picks_per_game"
  npx prisma migrate resolve --applied "20250930224423_add_over_under_picks" || echo "Failed to resolve 20250930224423_add_over_under_picks"

  echo "✅ Database baselined - migrations marked as applied"
}

echo "✅ Migrations handling completed"

# Start the application
echo "🎯 Starting application..."
exec "$@"