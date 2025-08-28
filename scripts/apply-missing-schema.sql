-- Apply only missing schema changes to production
-- This is safe to run multiple times - it only adds what's missing

BEGIN;

-- 1. Add PENDING to PickOutcome enum
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 WHERE 'PENDING' = ANY(enum_range(NULL::"PickOutcome"))
    ) THEN
        ALTER TYPE "PickOutcome" ADD VALUE 'PENDING';
        RAISE NOTICE 'Added PENDING to PickOutcome enum';
    ELSE
        RAISE NOTICE 'PENDING already exists in PickOutcome enum';
    END IF;
END $$;

-- 2. Add missing columns to pools table
DO $$
DECLARE
    col_exists boolean;
BEGIN
    -- Check and add season column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pools' AND column_name = 'season'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE "pools" ADD COLUMN "season" INTEGER NOT NULL DEFAULT 2025;
        RAISE NOTICE 'Added season column to pools table';
    END IF;
    
    -- Check and add buyIn column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pools' AND column_name = 'buyIn'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE "pools" ADD COLUMN "buyIn" DECIMAL(65,30) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added buyIn column to pools table';
    END IF;
    
    -- Check and add other columns
    ALTER TABLE "pools"
    ADD COLUMN IF NOT EXISTS "maxEntries" INTEGER NOT NULL DEFAULT 100,
    ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "description" TEXT,
    ADD COLUMN IF NOT EXISTS "creatorId" TEXT,
    ADD COLUMN IF NOT EXISTS "url" TEXT;
END $$;

-- 3. Create pool_completions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'pool_completions'
    ) THEN
        CREATE TABLE "pool_completions" (
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
        
        ALTER TABLE "pool_completions" ADD CONSTRAINT "pool_completions_poolId_userId_week_season_key" 
        UNIQUE ("poolId", "userId", "week", "season");
        
        ALTER TABLE "pool_completions" ADD CONSTRAINT "pool_completions_poolId_fkey" 
        FOREIGN KEY ("poolId") REFERENCES "pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        CREATE INDEX "pool_completions_userId_week_season_idx" ON "pool_completions"("userId", "week", "season");
        CREATE INDEX "pool_completions_poolId_idx" ON "pool_completions"("poolId");
        
        RAISE NOTICE 'Created pool_completions table';
    ELSE
        RAISE NOTICE 'pool_completions table already exists';
    END IF;
END $$;

-- 4. Create team_ratings table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'team_ratings'
    ) THEN
        CREATE TABLE "team_ratings" (
            "id" TEXT NOT NULL,
            "teamId" TEXT NOT NULL,
            "rating" DOUBLE PRECISION NOT NULL DEFAULT 1500,
            "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
            "season" INTEGER NOT NULL DEFAULT 2025,
            "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            
            CONSTRAINT "team_ratings_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "team_ratings_teamId_key" UNIQUE ("teamId")
        );
        
        ALTER TABLE "team_ratings" ADD CONSTRAINT "team_ratings_teamId_fkey" 
        FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        CREATE INDEX "team_ratings_season_idx" ON "team_ratings"("season");
        CREATE INDEX "team_ratings_rating_idx" ON "team_ratings"("rating");
        
        RAISE NOTICE 'Created team_ratings table';
    ELSE
        RAISE NOTICE 'team_ratings table already exists';
    END IF;
END $$;

-- 5. Add performance indexes
CREATE INDEX IF NOT EXISTS "idx_pools_season_active" ON "pools"("season", "isActive");
CREATE INDEX IF NOT EXISTS "idx_active_pools" ON "pools"("id") WHERE "isActive" = true;

COMMIT;

-- Show summary
SELECT 
    'Schema sync complete!' as status,
    (SELECT COUNT(*) FROM pool_completions) as pool_completions_count,
    (SELECT COUNT(*) FROM team_ratings) as team_ratings_count,
    (SELECT 'PENDING' = ANY(enum_range(NULL::"PickOutcome"))) as has_pending_enum;