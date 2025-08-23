-- CreateEnum for data source types
CREATE TYPE "DataSourceType" AS ENUM ('REAL', 'MOCK', 'SIMULATED', 'UNAVAILABLE');

-- CreateEnum for API providers
CREATE TYPE "ApiProvider" AS ENUM ('ESPN', 'MYSPORTSFEEDS', 'INTERNAL');

-- Add data source tracking to survivor_entries
ALTER TABLE "survivor_entries" 
ADD COLUMN "data_source_type" "DataSourceType" DEFAULT 'MOCK',
ADD COLUMN "data_last_updated" TIMESTAMP(3),
ADD COLUMN "data_source_message" TEXT;

-- Create table for API configuration and keys
CREATE TABLE "api_configurations" (
    "id" TEXT NOT NULL,
    "provider" "ApiProvider" NOT NULL,
    "name" TEXT NOT NULL,
    "base_url" TEXT NOT NULL,
    "api_key" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "rate_limit_per_minute" INTEGER DEFAULT 60,
    "timeout_ms" INTEGER DEFAULT 10000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_configurations_pkey" PRIMARY KEY ("id")
);

-- Create table for data source audit logs
CREATE TABLE "data_source_logs" (
    "id" TEXT NOT NULL,
    "provider" "ApiProvider" NOT NULL,
    "endpoint" TEXT NOT NULL,
    "request_type" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "response_time_ms" INTEGER,
    "error_message" TEXT,
    "rate_limit_remaining" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_source_logs_pkey" PRIMARY KEY ("id")
);

-- Create table for real data availability tracking
CREATE TABLE "data_availability" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "data_type" TEXT NOT NULL, -- 'team_stats', 'injuries', 'schedule'
    "provider" "ApiProvider" NOT NULL,
    "available" BOOLEAN NOT NULL,
    "last_checked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT,

    CONSTRAINT "data_availability_pkey" PRIMARY KEY ("id")
);

-- Insert default API configurations
INSERT INTO "api_configurations" ("id", "provider", "name", "base_url", "enabled", "updated_at") VALUES
('espn-nfl-stats', 'ESPN', 'ESPN NFL Stats', 'https://site.api.espn.com/apis/site/v2/sports/football/nfl', true, CURRENT_TIMESTAMP),
('espn-injury', 'ESPN', 'ESPN Injury Data', 'https://site.api.espn.com/apis/site/v2/sports/football/nfl', true, CURRENT_TIMESTAMP),
('mysportsfeeds-injury', 'MYSPORTSFEEDS', 'MySportsFeeds Injury', 'https://api.mysportsfeeds.com/v2.1/pull/nfl', false, CURRENT_TIMESTAMP);

-- Create indexes for performance
CREATE INDEX "idx_survivor_entries_data_source" ON "survivor_entries"("data_source_type");
CREATE INDEX "idx_data_source_logs_provider_timestamp" ON "data_source_logs"("provider", "timestamp");
CREATE INDEX "idx_data_availability_season_week" ON "data_availability"("season", "week");
CREATE UNIQUE INDEX "idx_api_configurations_provider_name" ON "api_configurations"("provider", "name");
CREATE UNIQUE INDEX "idx_data_availability_unique" ON "data_availability"("season", "week", "data_type", "provider");