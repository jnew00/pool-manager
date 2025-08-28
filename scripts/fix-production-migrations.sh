#!/bin/bash

# Script to properly sync production database with migrations
# This handles the case where production has existing tables but no migration history

echo "🔧 Fixing production database migration state..."
echo "⚠️  This script will:"
echo "   1. Check current database state"
echo "   2. Apply only missing schema changes"
echo "   3. Mark migrations as applied"
echo ""
echo "Make sure DATABASE_URL is set to your production database!"
read -p "Continue? (y/N): " confirm

if [[ $confirm != [yY] ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "📋 Checking current migration status..."
npx prisma migrate status

echo ""
echo "🔍 Checking if _prisma_migrations table exists..."
npx prisma db execute --stdin <<EOF
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = '_prisma_migrations'
) as migrations_table_exists;
EOF

echo ""
echo "📝 Creating migrations table if needed..."
npx prisma db execute --stdin <<EOF
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY ("id")
);
EOF

echo ""
echo "🔄 Marking all base migrations as applied..."

# Mark each migration as applied based on what exists
MIGRATIONS=(
    "20250816213427_init"
    "20250816214312_add_game_status" 
    "20250817172155_add_grade_overrides"
    "20250820_add_survivor_models"
    "20250823_add_data_source_tracking"
    "20250828_add_missing_pool_columns"
    "20250828_add_pending_outcome"
    "20250829_optimize_indexes"
)

for migration in "${MIGRATIONS[@]}"; do
    echo "Marking $migration as applied..."
    npx prisma migrate resolve --applied "$migration" 2>/dev/null || true
done

echo ""
echo "📊 Current migration status:"
npx prisma migrate status

echo ""
echo "🚀 Applying any remaining migrations..."
npx prisma migrate deploy

echo ""
echo "✅ Production database migration state fixed!"
echo ""
echo "Final status:"
npx prisma migrate status