-- Drop the old unique constraint
ALTER TABLE "public"."picks" DROP CONSTRAINT IF EXISTS "picks_entryId_gameId_key";

-- Add new unique constraint allowing multiple picks per game (spread + over/under)
CREATE UNIQUE INDEX "picks_entryId_gameId_teamId_overUnderPick_key" ON "public"."picks"("entryId", "gameId", "teamId", "overUnderPick");
