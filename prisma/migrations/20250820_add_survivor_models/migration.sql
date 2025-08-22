-- Create Survivor Entry table
CREATE TABLE IF NOT EXISTS "survivor_entries" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "userId" TEXT,
    "entryName" TEXT,
    "eliminatedWeek" INTEGER,
    "strikes" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survivor_entries_pkey" PRIMARY KEY ("id")
);

-- Create Survivor Pick table
CREATE TABLE IF NOT EXISTS "survivor_picks" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "teamId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "result" "PickOutcome",
    "marginOfVictory" INTEGER,
    "pickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),

    CONSTRAINT "survivor_picks_pkey" PRIMARY KEY ("id")
);

-- Create Survivor Week Data table  
CREATE TABLE IF NOT EXISTS "survivor_week_data" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "totalEntries" INTEGER NOT NULL,
    "survivingEntries" INTEGER NOT NULL,
    "publicPickData" JSONB,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survivor_week_data_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
ALTER TABLE "survivor_entries" ADD CONSTRAINT "survivor_entries_poolId_userId_entryName_key" UNIQUE("poolId", "userId", "entryName");
ALTER TABLE "survivor_picks" ADD CONSTRAINT "survivor_picks_entryId_week_key" UNIQUE("entryId", "week");
ALTER TABLE "survivor_picks" ADD CONSTRAINT "survivor_picks_entryId_teamId_key" UNIQUE("entryId", "teamId");
ALTER TABLE "survivor_week_data" ADD CONSTRAINT "survivor_week_data_poolId_week_key" UNIQUE("poolId", "week");

-- Create indexes
CREATE INDEX "survivor_entries_poolId_idx" ON "survivor_entries"("poolId");
CREATE INDEX "survivor_entries_isActive_idx" ON "survivor_entries"("isActive");
CREATE INDEX "survivor_picks_week_idx" ON "survivor_picks"("week");
CREATE INDEX "survivor_picks_teamId_idx" ON "survivor_picks"("teamId");
CREATE INDEX "survivor_week_data_week_idx" ON "survivor_week_data"("week");

-- Add foreign keys
ALTER TABLE "survivor_entries" ADD CONSTRAINT "survivor_entries_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "pools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "survivor_picks" ADD CONSTRAINT "survivor_picks_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "survivor_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "survivor_picks" ADD CONSTRAINT "survivor_picks_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "survivor_picks" ADD CONSTRAINT "survivor_picks_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "survivor_week_data" ADD CONSTRAINT "survivor_week_data_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "pools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;