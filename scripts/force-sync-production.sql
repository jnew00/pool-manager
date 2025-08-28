-- FORCE SYNC PRODUCTION DATABASE
-- This will clean up the mess and get everything in sync

-- Step 1: Clean up migration history completely
TRUNCATE TABLE _prisma_migrations;

-- Step 2: Insert ALL migrations as already applied
INSERT INTO _prisma_migrations (id, checksum, migration_name, finished_at, started_at, applied_steps_count) VALUES
('m1', 'manual', '20250816213427_init', NOW(), NOW(), 1),
('m2', 'manual', '20250816214312_add_game_status', NOW(), NOW(), 1),
('m3', 'manual', '20250817172155_add_grade_overrides', NOW(), NOW(), 1),
('m4', 'manual', '20250820_add_survivor_models', NOW(), NOW(), 1),
('m5', 'manual', '20250823_add_data_source_tracking', NOW(), NOW(), 1),
('m6', 'manual', '20250828_add_missing_pool_columns', NOW(), NOW(), 1),
('m7', 'manual', '20250828_add_pending_outcome', NOW(), NOW(), 1),
('m8', 'manual', '20250829_optimize_indexes', NOW(), NOW(), 1);

-- Step 3: Add any missing critical features

-- Add PENDING enum if missing
DO $$ 
BEGIN
    IF NOT 'PENDING' = ANY(enum_range(NULL::"PickOutcome")) THEN
        ALTER TYPE "PickOutcome" ADD VALUE 'PENDING';
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add pool_completions table if missing
CREATE TABLE IF NOT EXISTS "pool_completions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "poolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pool_completions_pkey" PRIMARY KEY ("id")
);

-- Add missing constraint if needed
DO $$
BEGIN
    ALTER TABLE "pool_completions" ADD CONSTRAINT "pool_completions_poolId_userId_week_season_key" 
        UNIQUE ("poolId", "userId", "week", "season");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add foreign key if missing
DO $$
BEGIN
    ALTER TABLE "pool_completions" ADD CONSTRAINT "pool_completions_poolId_fkey" 
        FOREIGN KEY ("poolId") REFERENCES "pools"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add team_ratings table if missing
CREATE TABLE IF NOT EXISTS "team_ratings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "teamId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "season" INTEGER NOT NULL DEFAULT 2025,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "team_ratings_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint if missing
DO $$
BEGIN
    ALTER TABLE "team_ratings" ADD CONSTRAINT "team_ratings_teamId_key" UNIQUE ("teamId");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add foreign key if missing
DO $$
BEGIN
    ALTER TABLE "team_ratings" ADD CONSTRAINT "team_ratings_teamId_fkey" 
        FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add missing columns to pools
ALTER TABLE "pools" 
ADD COLUMN IF NOT EXISTS "season" INTEGER DEFAULT 2025,
ADD COLUMN IF NOT EXISTS "buyIn" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "maxEntries" INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "creatorId" TEXT,
ADD COLUMN IF NOT EXISTS "url" TEXT;

-- Update any NULL values to defaults
UPDATE "pools" SET 
    "season" = COALESCE("season", 2025),
    "buyIn" = COALESCE("buyIn", 0),
    "maxEntries" = COALESCE("maxEntries", 100),
    "isActive" = COALESCE("isActive", true)
WHERE "season" IS NULL OR "buyIn" IS NULL OR "maxEntries" IS NULL OR "isActive" IS NULL;

-- Now add NOT NULL constraints
ALTER TABLE "pools" 
ALTER COLUMN "season" SET NOT NULL,
ALTER COLUMN "buyIn" SET NOT NULL,
ALTER COLUMN "maxEntries" SET NOT NULL,
ALTER COLUMN "isActive" SET NOT NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS "pool_completions_userId_week_season_idx" ON "pool_completions"("userId", "week", "season");
CREATE INDEX IF NOT EXISTS "pool_completions_poolId_idx" ON "pool_completions"("poolId");
CREATE INDEX IF NOT EXISTS "team_ratings_season_idx" ON "team_ratings"("season");
CREATE INDEX IF NOT EXISTS "team_ratings_rating_idx" ON "team_ratings"("rating");

SELECT 'FORCE SYNC COMPLETE - Your production database is now synced!' as status;