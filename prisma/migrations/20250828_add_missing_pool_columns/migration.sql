-- Add missing columns to pools table
ALTER TABLE "pools" 
ADD COLUMN IF NOT EXISTS "season" INTEGER NOT NULL DEFAULT 2025,
ADD COLUMN IF NOT EXISTS "buyIn" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "maxEntries" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "creatorId" TEXT,
ADD COLUMN IF NOT EXISTS "url" TEXT;

-- Add unique constraint on name if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pools_name_key') THEN
        ALTER TABLE "pools" ADD CONSTRAINT "pools_name_key" UNIQUE ("name");
    END IF;
END $$;

-- Create index on season if it doesn't exist
CREATE INDEX IF NOT EXISTS "pools_season_idx" ON "pools"("season");

-- Add missing columns to other tables that may be incomplete

-- Check and add missing columns to games table
ALTER TABLE "games" 
ADD COLUMN IF NOT EXISTS "status" "GameStatus" DEFAULT 'SCHEDULED';

-- Check and add missing columns to results table
ALTER TABLE "results"
ADD COLUMN IF NOT EXISTS "status" "GameStatus" DEFAULT 'SCHEDULED';

-- Add missing columns to lines table if needed
ALTER TABLE "lines"
ADD COLUMN IF NOT EXISTS "isUserProvided" BOOLEAN DEFAULT false;

-- Add missing columns to survivor_entries if needed
ALTER TABLE "survivor_entries"
ADD COLUMN IF NOT EXISTS "entryUrl" TEXT;

-- Add PoolCompletion table if it doesn't exist
CREATE TABLE IF NOT EXISTS "pool_completions" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "pool_completions_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint and indexes for pool_completions if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pool_completions_poolId_userId_week_season_key') THEN
        ALTER TABLE "pool_completions" ADD CONSTRAINT "pool_completions_poolId_userId_week_season_key" 
        UNIQUE ("poolId", "userId", "week", "season");
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "pool_completions_userId_week_season_idx" ON "pool_completions"("userId", "week", "season");
CREATE INDEX IF NOT EXISTS "pool_completions_poolId_idx" ON "pool_completions"("poolId");

-- Add foreign key for pool_completions if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pool_completions_poolId_fkey'
    ) THEN
        ALTER TABLE "pool_completions" ADD CONSTRAINT "pool_completions_poolId_fkey" 
        FOREIGN KEY ("poolId") REFERENCES "pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Add TeamRating table if it doesn't exist
CREATE TABLE IF NOT EXISTS "team_ratings" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "season" INTEGER NOT NULL DEFAULT 2025,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "team_ratings_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint and indexes for team_ratings if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_ratings_teamId_key') THEN
        ALTER TABLE "team_ratings" ADD CONSTRAINT "team_ratings_teamId_key" UNIQUE ("teamId");
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "team_ratings_season_idx" ON "team_ratings"("season");
CREATE INDEX IF NOT EXISTS "team_ratings_rating_idx" ON "team_ratings"("rating");

-- Add foreign key for team_ratings if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'team_ratings_teamId_fkey'
    ) THEN
        ALTER TABLE "team_ratings" ADD CONSTRAINT "team_ratings_teamId_fkey" 
        FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;