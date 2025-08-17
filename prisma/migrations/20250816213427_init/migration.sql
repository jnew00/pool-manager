-- CreateEnum
CREATE TYPE "public"."PoolType" AS ENUM ('ATS', 'SU', 'POINTS_PLUS', 'SURVIVOR');

-- CreateEnum
CREATE TYPE "public"."GameStatus" AS ENUM ('SCHEDULED', 'FINAL');

-- CreateEnum
CREATE TYPE "public"."PickOutcome" AS ENUM ('WIN', 'LOSS', 'PUSH', 'VOID');

-- CreateEnum
CREATE TYPE "public"."UploadKind" AS ENUM ('CSV', 'IMAGE');

-- CreateTable
CREATE TABLE "public"."teams" (
    "id" TEXT NOT NULL,
    "nflAbbr" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."games" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "kickoff" TIMESTAMP(3) NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "venue" TEXT,
    "lat" DECIMAL(65,30),
    "lon" DECIMAL(65,30),
    "apiRefs" JSONB,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lines" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "poolId" TEXT,
    "source" TEXT NOT NULL,
    "spread" DECIMAL(65,30),
    "total" DECIMAL(65,30),
    "moneylineHome" INTEGER,
    "moneylineAway" INTEGER,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isUserProvided" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."PoolType" NOT NULL,
    "rules" JSONB,

    CONSTRAINT "pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."entries" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "season" INTEGER NOT NULL,

    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."picks" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3),
    "confidence" DECIMAL(65,30) NOT NULL,
    "sourceUploadId" TEXT,

    CONSTRAINT "picks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."results" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "status" "public"."GameStatus" NOT NULL DEFAULT 'SCHEDULED',

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grades" (
    "id" TEXT NOT NULL,
    "pickId" TEXT NOT NULL,
    "outcome" "public"."PickOutcome" NOT NULL,
    "points" DECIMAL(65,30) NOT NULL,
    "details" JSONB,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."uploads" (
    "id" TEXT NOT NULL,
    "kind" "public"."UploadKind" NOT NULL,
    "path" TEXT NOT NULL,
    "parsed" JSONB,
    "mappingProfileId" TEXT,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mapping_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "columnMap" JSONB NOT NULL,

    CONSTRAINT "mapping_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."model_weights" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weights" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_weights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_nflAbbr_key" ON "public"."teams"("nflAbbr");

-- CreateIndex
CREATE INDEX "games_season_week_idx" ON "public"."games"("season", "week");

-- CreateIndex
CREATE INDEX "games_kickoff_idx" ON "public"."games"("kickoff");

-- CreateIndex
CREATE UNIQUE INDEX "games_season_week_homeTeamId_awayTeamId_key" ON "public"."games"("season", "week", "homeTeamId", "awayTeamId");

-- CreateIndex
CREATE INDEX "lines_gameId_idx" ON "public"."lines"("gameId");

-- CreateIndex
CREATE INDEX "lines_capturedAt_idx" ON "public"."lines"("capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "entries_poolId_season_key" ON "public"."entries"("poolId", "season");

-- CreateIndex
CREATE INDEX "picks_gameId_idx" ON "public"."picks"("gameId");

-- CreateIndex
CREATE INDEX "picks_teamId_idx" ON "public"."picks"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "picks_entryId_gameId_key" ON "public"."picks"("entryId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "results_gameId_key" ON "public"."results"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "grades_pickId_key" ON "public"."grades"("pickId");

-- CreateIndex
CREATE UNIQUE INDEX "mapping_profiles_name_key" ON "public"."mapping_profiles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "model_weights_name_key" ON "public"."model_weights"("name");

-- AddForeignKey
ALTER TABLE "public"."games" ADD CONSTRAINT "games_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "public"."teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."games" ADD CONSTRAINT "games_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "public"."teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lines" ADD CONSTRAINT "lines_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lines" ADD CONSTRAINT "lines_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "public"."pools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entries" ADD CONSTRAINT "entries_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "public"."pools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."picks" ADD CONSTRAINT "picks_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."picks" ADD CONSTRAINT "picks_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."picks" ADD CONSTRAINT "picks_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."picks" ADD CONSTRAINT "picks_sourceUploadId_fkey" FOREIGN KEY ("sourceUploadId") REFERENCES "public"."uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."results" ADD CONSTRAINT "results_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grades" ADD CONSTRAINT "grades_pickId_fkey" FOREIGN KEY ("pickId") REFERENCES "public"."picks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."uploads" ADD CONSTRAINT "uploads_mappingProfileId_fkey" FOREIGN KEY ("mappingProfileId") REFERENCES "public"."mapping_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
