-- Performance optimization indexes for production

-- Pool-related optimizations
CREATE INDEX IF NOT EXISTS "idx_pools_season_active" ON "pools"("season", "isActive");
CREATE INDEX IF NOT EXISTS "idx_pools_type_season" ON "pools"("type", "season");

-- Game-related optimizations  
CREATE INDEX IF NOT EXISTS "idx_games_week_season" ON "games"("week", "season");
CREATE INDEX IF NOT EXISTS "idx_games_kickoff" ON "games"("kickoff");
CREATE INDEX IF NOT EXISTS "idx_games_home_team" ON "games"("homeTeamId");
CREATE INDEX IF NOT EXISTS "idx_games_away_team" ON "games"("awayTeamId");

-- Survivor pool optimizations
CREATE INDEX IF NOT EXISTS "idx_survivor_entries_pool_active" ON "survivor_entries"("poolId", "isActive");
CREATE INDEX IF NOT EXISTS "idx_survivor_entries_user_pool" ON "survivor_entries"("userId", "poolId");
CREATE INDEX IF NOT EXISTS "idx_survivor_picks_entry_week" ON "survivor_picks"("entryId", "week");
CREATE INDEX IF NOT EXISTS "idx_survivor_picks_game_team" ON "survivor_picks"("gameId", "teamId");

-- Team-related optimizations
CREATE INDEX IF NOT EXISTS "idx_teams_nfl_abbr" ON "teams"("nflAbbr");

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS "idx_games_season_week_team" ON "games"("season", "week", "homeTeamId", "awayTeamId");
CREATE INDEX IF NOT EXISTS "idx_survivor_complex" ON "survivor_entries"("poolId", "isActive", "currentWeek");

-- Partial indexes for frequently filtered data
CREATE INDEX IF NOT EXISTS "idx_active_pools" ON "pools"("id") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS "idx_active_entries" ON "survivor_entries"("id") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS "idx_current_season_games" ON "games"("id") WHERE "season" >= EXTRACT(YEAR FROM CURRENT_DATE);