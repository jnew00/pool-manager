import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { TeamService } from './team.service'
import { GameService } from './game.service'
import { PoolService } from './pool.service'
import { EntryService } from './entry.service'
import { PickService } from './pick.service'
import { DatabaseTestUtils } from '@/lib/test-utils/database'

/**
 * Integration tests that verify all services work together
 * with real database operations and foreign key relationships
 */
describe('Service Integration Tests', () => {
  let teamService: TeamService
  let gameService: GameService
  let poolService: PoolService
  let entryService: EntryService
  let pickService: PickService

  beforeEach(async () => {
    // Initialize all services
    teamService = new TeamService()
    gameService = new GameService()
    poolService = new PoolService()
    entryService = new EntryService()
    pickService = new PickService()

    // Clean slate for each test
    await DatabaseTestUtils.cleanupTestData()
  })

  afterEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  describe('Complete workflow integration', () => {
    it('should handle full pool management workflow', async () => {
      // Step 1: Create teams
      const homeTeam = await teamService.createTeam({
        nflAbbr: 'TST',
        name: 'Test Home Team',
      })
      const awayTeam = await teamService.createTeam({
        nflAbbr: 'DEV',
        name: 'Test Away Team',
      })

      expect(homeTeam).toBeDefined()
      expect(awayTeam).toBeDefined()

      // Step 2: Create a game between the teams
      const game = await gameService.createGame({
        season: 2024,
        week: 1,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        kickoff: new Date('2024-09-10T13:00:00Z'),
        status: 'SCHEDULED',
      })

      expect(game).toBeDefined()
      expect(game.homeTeamId).toBe(homeTeam.id)
      expect(game.awayTeamId).toBe(awayTeam.id)

      // Step 3: Create a pool
      const pool = await poolService.createPool({
        name: 'Integration Test Pool',
        type: 'ATS',
        season: 2024,
        buyIn: 100.0,
        maxEntries: 50,
        isActive: true,
      })

      expect(pool).toBeDefined()
      expect(pool.type).toBe('ATS')
      expect(pool.buyIn.toNumber()).toBe(100.0)

      // Step 4: Create an entry in the pool
      const entry = await entryService.createEntry({
        poolId: pool.id,
        season: 2024,
      })

      expect(entry).toBeDefined()
      expect(entry.poolId).toBe(pool.id)

      // Step 5: Create a pick for the entry
      const pick = await pickService.createPick({
        entryId: entry.id,
        gameId: game.id,
        teamId: homeTeam.id, // Pick the home team
        confidence: 85.0,
      })

      expect(pick).toBeDefined()
      expect(pick.entryId).toBe(entry.id)
      expect(pick.gameId).toBe(game.id)
      expect(pick.teamId).toBe(homeTeam.id)
      expect(pick.confidence.toNumber()).toBe(85.0)

      // Verify the complete integration with relationships
      const pickWithRelations = await pickService.getPickById(pick.id)
      expect(pickWithRelations).toBeDefined()
      expect(pickWithRelations?.game.id).toBe(game.id)
      expect(pickWithRelations?.team.id).toBe(homeTeam.id)
      expect(pickWithRelations?.entry.id).toBe(entry.id)
    })

    it('should handle foreign key constraints correctly', async () => {
      // Test that we cannot create invalid relationships
      const nonExistentId = 'clz0000000000000000000001'

      // Cannot create game with non-existent teams
      await expect(
        gameService.createGame({
          season: 2024,
          week: 1,
          homeTeamId: nonExistentId,
          awayTeamId: nonExistentId,
          kickoff: new Date(),
          status: 'SCHEDULED',
        })
      ).rejects.toThrow()

      // Cannot create entry with non-existent pool
      await expect(
        entryService.createEntry({
          poolId: nonExistentId,
          season: 2024,
        })
      ).rejects.toThrow()

      // Cannot create pick with non-existent references
      await expect(
        pickService.createPick({
          entryId: nonExistentId,
          gameId: nonExistentId,
          teamId: nonExistentId,
          confidence: 75.0,
        })
      ).rejects.toThrow()
    })

    it('should handle unique constraints correctly', async () => {
      // Create a team
      await teamService.createTeam({
        nflAbbr: 'TEST',
        name: 'Unique Team',
      })

      // Cannot create another team with same abbreviation
      await expect(
        teamService.createTeam({
          nflAbbr: 'TEST',
          name: 'Another Team',
        })
      ).rejects.toThrow()

      // Create a pool
      await poolService.createPool({
        name: 'Unique Pool',
        type: 'SU',
        season: 2024,
        buyIn: 50.0,
        maxEntries: 100,
        isActive: true,
      })

      // Cannot create another pool with same name
      await expect(
        poolService.createPool({
          name: 'Unique Pool',
          type: 'ATS',
          season: 2024,
          buyIn: 75.0,
          maxEntries: 150,
          isActive: true,
        })
      ).rejects.toThrow()
    })

    it('should handle cascading operations correctly', async () => {
      // Create a complete scenario
      const scenario = await DatabaseTestUtils.createCompleteTestScenario()

      // Verify all relationships exist
      const relationships = await DatabaseTestUtils.verifyRelationships()
      expect(relationships.gameToTeams).toBe(true)
      expect(relationships.entryToPool).toBe(true)
      expect(relationships.pickToAll).toBe(true)

      // Delete the pick first (respects FK constraints)
      const pickDeleted = await pickService.deletePick(scenario.pick.id)
      expect(pickDeleted).toBe(true)

      // Now we can delete the entry
      const entryDeleted = await entryService.deleteEntry(scenario.entry.id)
      expect(entryDeleted).toBe(true)

      // Verify counts decreased appropriately
      const counts = await DatabaseTestUtils.getRecordCounts()
      expect(counts.picks).toBe(0)
      expect(counts.entries).toBe(0)
    })

    it('should handle multiple pools and entries correctly', async () => {
      // Create two pools for different seasons
      const pool2024 = await poolService.createPool({
        name: 'Pool 2024',
        type: 'ATS',
        season: 2024,
        buyIn: 50.0,
        maxEntries: 100,
        isActive: true,
      })

      const pool2025 = await poolService.createPool({
        name: 'Pool 2025',
        type: 'SU',
        season: 2025,
        buyIn: 75.0,
        maxEntries: 150,
        isActive: true,
      })

      // Create entries for both seasons
      const entry2024 = await entryService.createEntry({
        poolId: pool2024.id,
        season: 2024,
      })

      const entry2025 = await entryService.createEntry({
        poolId: pool2025.id,
        season: 2025,
      })

      // Verify entries are linked to correct pools
      const entryWith2024Pool = await entryService.getEntryById(entry2024.id)
      const entryWith2025Pool = await entryService.getEntryById(entry2025.id)

      expect(entryWith2024Pool?.pool.name).toBe('Pool 2024')
      expect(entryWith2025Pool?.pool.name).toBe('Pool 2025')

      // Verify season filtering works
      const pools2024 = await poolService.getPoolsBySeason(2024)
      const pools2025 = await poolService.getPoolsBySeason(2025)

      expect(pools2024).toHaveLength(1)
      expect(pools2025).toHaveLength(1)
      expect(pools2024[0].name).toBe('Pool 2024')
      expect(pools2025[0].name).toBe('Pool 2025')
    })

    it('should demonstrate database test utilities effectiveness', async () => {
      // Use utilities to create a week scenario
      const weekData = await DatabaseTestUtils.createWeekScenario(5, 6)

      expect(weekData.teams).toHaveLength(6)
      expect(weekData.games).toHaveLength(3) // 6 teams = 3 games

      // Verify all games are for week 5
      weekData.games.forEach((game) => {
        expect(game.week).toBe(5)
      })

      // Verify teams are used in games
      const gameTeamIds = weekData.games.flatMap((g) => [
        g.homeTeamId,
        g.awayTeamId,
      ])
      const teamIds = weekData.teams.map((t) => t.id)

      gameTeamIds.forEach((id) => {
        expect(teamIds).toContain(id)
      })

      // Cleanup should remove all test data
      await DatabaseTestUtils.cleanupTestData()

      const finalCounts = await DatabaseTestUtils.getRecordCounts()
      expect(finalCounts.games).toBe(0)
      // Note: NFL teams from seed data may remain
    })
  })
})
