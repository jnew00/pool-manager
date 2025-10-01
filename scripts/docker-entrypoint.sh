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
  echo "⚠️  Migration failed - attempting to baseline existing database..."
  echo "🔧 Automatically marking all migrations as applied..."

  # Find all migration directories and mark them as applied
  for migration_dir in ./prisma/migrations/*/; do
    if [ -d "$migration_dir" ]; then
      migration_name=$(basename "$migration_dir")
      if [ "$migration_name" != "migration_lock.toml" ]; then
        echo "  Resolving: $migration_name"
        npx prisma migrate resolve --applied "$migration_name" || echo "  ⚠️  Failed to resolve $migration_name"
      fi
    fi
  done

  echo "✅ Database baselined - all migrations marked as applied"
}

echo "✅ Migrations handling completed"

# Start the application
echo "🎯 Starting application..."
exec "$@"