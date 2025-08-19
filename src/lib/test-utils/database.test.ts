import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseTestUtils } from './database'

describe('DatabaseTestUtils', () => {
  beforeEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  afterEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  describe('createTestTeam', () => {
    it('should create a test team with default values', async () => {
      const team = await DatabaseTestUtils.createTestTeam()

      expect(team).toBeDefined()
      expect(team.nflAbbr).toBe('TST')
      expect(team.name).toBe('Test Team')
      expect(team.id).toBeDefined()
    })

    it('should create a test team with overrides', async () => {
      const team = await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'DEV',
        name: 'Custom Team',
      })

      expect(team.nflAbbr).toBe('DEV')
      expect(team.name).toBe('Custom Team')
    })
  })

  describe('createTestPool', () => {
    it('should create a test pool with default values', async () => {
      const pool = await DatabaseTestUtils.createTestPool()

      expect(pool).toBeDefined()
      expect(pool.type).toBe('ATS')
      expect(pool.season).toBe(2024)
      expect(pool.buyIn.toNumber()).toBe(50.0)
      expect(pool.maxEntries).toBe(100)
      expect(pool.isActive).toBe(true)
    })

    it('should create unique pool names', async () => {
      const pool1 = await DatabaseTestUtils.createTestPool()
      const pool2 = await DatabaseTestUtils.createTestPool()

      expect(pool1.name).not.toBe(pool2.name)
    })
  })

  describe('createTestGame', () => {
    it('should create a test game with teams', async () => {
      const homeTeam = await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'TST',
        name: 'Home Team',
      })
      const awayTeam = await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'DEV',
        name: 'Away Team',
      })

      const game = await DatabaseTestUtils.createTestGame(
        homeTeam.id,
        awayTeam.id
      )

      expect(game).toBeDefined()
      expect(game.homeTeamId).toBe(homeTeam.id)
      expect(game.awayTeamId).toBe(awayTeam.id)
      expect(game.season).toBe(2024)
      expect(game.week).toBe(1)
      expect(game.status).toBe('SCHEDULED')
    })
  })

  describe('createCompleteTestScenario', () => {
    it('should create a complete test scenario with all entities', async () => {
      const scenario = await DatabaseTestUtils.createCompleteTestScenario()

      expect(scenario.pool).toBeDefined()
      expect(scenario.homeTeam).toBeDefined()
      expect(scenario.awayTeam).toBeDefined()
      expect(scenario.game).toBeDefined()
      expect(scenario.entry).toBeDefined()
      expect(scenario.pick).toBeDefined()

      // Verify relationships
      expect(scenario.game.homeTeamId).toBe(scenario.homeTeam.id)
      expect(scenario.game.awayTeamId).toBe(scenario.awayTeam.id)
      expect(scenario.entry.poolId).toBe(scenario.pool.id)
      expect(scenario.pick.entryId).toBe(scenario.entry.id)
      expect(scenario.pick.gameId).toBe(scenario.game.id)
      expect(scenario.pick.teamId).toBe(scenario.homeTeam.id)
    })
  })

  describe('getRecordCounts', () => {
    it('should return correct counts after creating test data', async () => {
      const initialCounts = await DatabaseTestUtils.getRecordCounts()
      // Note: there may be NFL teams and pools from seed data

      await DatabaseTestUtils.createCompleteTestScenario()

      const finalCounts = await DatabaseTestUtils.getRecordCounts()
      expect(finalCounts.teams).toBe(initialCounts.teams + 2) // home and away
      expect(finalCounts.games).toBe(1)
      expect(finalCounts.pools).toBe(initialCounts.pools + 1) // Account for seed pools
      expect(finalCounts.entries).toBe(1)
      expect(finalCounts.picks).toBe(1)
    })
  })

  describe('verifyRelationships', () => {
    it('should verify all relationships are working', async () => {
      await DatabaseTestUtils.createCompleteTestScenario()

      const relationships = await DatabaseTestUtils.verifyRelationships()

      expect(relationships.gameToTeams).toBe(true)
      expect(relationships.entryToPool).toBe(true)
      expect(relationships.pickToAll).toBe(true)
    })

    it('should return false when no data exists', async () => {
      const relationships = await DatabaseTestUtils.verifyRelationships()

      expect(relationships.gameToTeams).toBe(false)
      expect(relationships.entryToPool).toBe(false)
      expect(relationships.pickToAll).toBe(false)
    })
  })

  describe('createWeekScenario', () => {
    it('should create teams and games for a specific week', async () => {
      const scenario = await DatabaseTestUtils.createWeekScenario(3, 4)

      expect(scenario.teams).toHaveLength(4)
      expect(scenario.games).toHaveLength(2) // 4 teams = 2 games

      // Verify team naming
      expect(scenario.teams[0].nflAbbr).toMatch(/^TST30.*/)
      expect(scenario.teams[1].nflAbbr).toMatch(/^TST31.*/)
      expect(scenario.teams[0].name).toBe('Week 3 Team 0')

      // Verify games use the teams
      expect(scenario.games[0].week).toBe(3)
      expect(scenario.games[0].homeTeamId).toBe(scenario.teams[0].id)
      expect(scenario.games[0].awayTeamId).toBe(scenario.teams[1].id)
    })
  })

  describe('cleanupTestData', () => {
    it('should clean up all test data in correct order', async () => {
      const initialCounts = await DatabaseTestUtils.getRecordCounts()

      // Create test data
      await DatabaseTestUtils.createCompleteTestScenario()

      const beforeCounts = await DatabaseTestUtils.getRecordCounts()
      expect(beforeCounts.picks).toBeGreaterThan(0)

      // Clean up
      await DatabaseTestUtils.cleanupTestData()

      const afterCounts = await DatabaseTestUtils.getRecordCounts()
      // Test data should be cleaned up
      expect(afterCounts.games).toBe(0)
      expect(afterCounts.pools).toBe(initialCounts.pools) // Back to seed pools
      expect(afterCounts.entries).toBe(0)
      expect(afterCounts.picks).toBe(0)
      // NFL teams from seed data may remain - only check test teams are gone
      expect(afterCounts.teams).toBe(initialCounts.teams) // Back to initial count
    })
  })
})
