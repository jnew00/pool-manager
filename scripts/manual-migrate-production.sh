#!/bin/sh
# Manual migration script for production database
# Run this directly on production server if docker-entrypoint.sh migrations aren't working
#
# Usage: docker exec -it <container-name> ./scripts/manual-migrate-production.sh

set -e

echo "🔧 Manual Production Database Migration"
echo "========================================"
echo ""
echo "This will run the 20250930224423_add_over_under_picks migration"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable not set"
  echo "Please set DATABASE_URL before running this script"
  exit 1
fi

echo "📊 Running migration SQL..."
echo ""

# Run the exact migration SQL using psql
psql "$DATABASE_URL" <<'SQL'
-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OverUnderChoice') THEN
    CREATE TYPE "OverUnderChoice" AS ENUM ('OVER', 'UNDER');
  END IF;
END $$;

-- DropForeignKey (safely)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'picks_teamId_fkey' AND table_name = 'picks'
  ) THEN
    ALTER TABLE "picks" DROP CONSTRAINT "picks_teamId_fkey";
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'picks' AND column_name = 'overUnderPick'
  ) THEN
    ALTER TABLE "picks" ADD COLUMN "overUnderPick" "OverUnderChoice";
  END IF;
END $$;

ALTER TABLE "picks" ALTER COLUMN "teamId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "picks"
  ADD CONSTRAINT "picks_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "teams"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
SQL

echo ""
echo "✅ Migration SQL executed successfully!"
echo ""
echo "📝 Marking migration as applied in Prisma..."

npx prisma migrate resolve --applied "20250930224423_add_over_under_picks"

echo ""
echo "✅ Production database migration complete!"
echo ""
echo "🔄 Restart is not needed - changes are live!"
