-- Manual SQL to sync production database with development
-- Run this directly against your production database

-- 1. Add PENDING to PickOutcome enum if it doesn't exist
DO $$ 
BEGIN
    ALTER TYPE "PickOutcome" ADD VALUE IF NOT EXISTS 'PENDING';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add missing columns to pools table
ALTER TABLE "pools" 
ADD COLUMN IF NOT EXISTS "season" INTEGER NOT NULL DEFAULT 2025,
ADD COLUMN IF NOT EXISTS "buyIn" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "maxEntries" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "creatorId" TEXT,
ADD COLUMN IF NOT EXISTS "url" TEXT;

-- 3. Create pool_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS "pool_completions" (
    "id" TEXT NOT NULL,
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

-- Add constraints for pool_completions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pool_completions_poolId_userId_week_season_key') THEN
        ALTER TABLE "pool_completions" ADD CONSTRAINT "pool_completions_poolId_userId_week_season_key" 
        UNIQUE ("poolId", "userId", "week", "season");
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pool_completions_poolId_fkey'
    ) THEN
        ALTER TABLE "pool_completions" ADD CONSTRAINT "pool_completions_poolId_fkey" 
        FOREIGN KEY ("poolId") REFERENCES "pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 4. Create team_ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS "team_ratings" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "season" INTEGER NOT NULL DEFAULT 2025,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "team_ratings_pkey" PRIMARY KEY ("id")
);

-- Add constraints for team_ratings
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_ratings_teamId_key') THEN
        ALTER TABLE "team_ratings" ADD CONSTRAINT "team_ratings_teamId_key" UNIQUE ("teamId");
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'team_ratings_teamId_fkey'
    ) THEN
        ALTER TABLE "team_ratings" ADD CONSTRAINT "team_ratings_teamId_fkey" 
        FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 5. Add missing columns to other tables
ALTER TABLE "games" 
ADD COLUMN IF NOT EXISTS "status" "GameStatus" DEFAULT 'SCHEDULED';

ALTER TABLE "results"
ADD COLUMN IF NOT EXISTS "status" "GameStatus" DEFAULT 'SCHEDULED';

ALTER TABLE "lines"
ADD COLUMN IF NOT EXISTS "isUserProvided" BOOLEAN DEFAULT false;

ALTER TABLE "survivor_entries"
ADD COLUMN IF NOT EXISTS "entryUrl" TEXT;

-- 6. Create all missing indexes
CREATE INDEX IF NOT EXISTS "idx_pools_season_active" ON "pools"("season", "isActive");
CREATE INDEX IF NOT EXISTS "idx_pools_type_season" ON "pools"("type", "season");
CREATE INDEX IF NOT EXISTS "idx_games_week_season" ON "games"("week", "season");
CREATE INDEX IF NOT EXISTS "idx_games_kickoff" ON "games"("kickoff");
CREATE INDEX IF NOT EXISTS "idx_games_home_team" ON "games"("homeTeamId");
CREATE INDEX IF NOT EXISTS "idx_games_away_team" ON "games"("awayTeamId");
CREATE INDEX IF NOT EXISTS "idx_survivor_entries_pool_active" ON "survivor_entries"("poolId", "isActive");
CREATE INDEX IF NOT EXISTS "idx_survivor_entries_user_pool" ON "survivor_entries"("userId", "poolId");
CREATE INDEX IF NOT EXISTS "idx_survivor_picks_entry_week" ON "survivor_picks"("entryId", "week");
CREATE INDEX IF NOT EXISTS "idx_survivor_picks_game_team" ON "survivor_picks"("gameId", "teamId");
CREATE INDEX IF NOT EXISTS "idx_teams_nfl_abbr" ON "teams"("nflAbbr");
CREATE INDEX IF NOT EXISTS "idx_games_season_week_team" ON "games"("season", "week", "homeTeamId", "awayTeamId");
CREATE INDEX IF NOT EXISTS "idx_active_pools" ON "pools"("id") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS "idx_active_entries" ON "survivor_entries"("id") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS "pool_completions_userId_week_season_idx" ON "pool_completions"("userId", "week", "season");
CREATE INDEX IF NOT EXISTS "pool_completions_poolId_idx" ON "pool_completions"("poolId");
CREATE INDEX IF NOT EXISTS "team_ratings_season_idx" ON "team_ratings"("season");
CREATE INDEX IF NOT EXISTS "team_ratings_rating_idx" ON "team_ratings"("rating");
CREATE INDEX IF NOT EXISTS "pools_season_idx" ON "pools"("season");

-- 7. Create/update _prisma_migrations table to mark everything as applied
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

-- Mark all migrations as applied
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
VALUES 
    ('init-001', 'manual', NOW(), '20250816213427_init', NOW(), 1),
    ('init-002', 'manual', NOW(), '20250816214312_add_game_status', NOW(), 1),
    ('init-003', 'manual', NOW(), '20250817172155_add_grade_overrides', NOW(), 1),
    ('init-004', 'manual', NOW(), '20250820_add_survivor_models', NOW(), 1),
    ('init-005', 'manual', NOW(), '20250823_add_data_source_tracking', NOW(), 1),
    ('init-006', 'manual', NOW(), '20250828_add_missing_pool_columns', NOW(), 1),
    ('init-007', 'manual', NOW(), '20250828_add_pending_outcome', NOW(), 1),
    ('init-008', 'manual', NOW(), '20250829_optimize_indexes', NOW(), 1)
ON CONFLICT (id) DO NOTHING;

-- Verify everything worked
SELECT 'Migration sync complete!' as status;