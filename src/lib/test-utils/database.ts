import { prisma } from '@/lib/prisma'
import type { Team, Game, Pool, Entry, Pick, PoolType, GameStatus } from '@/lib/types/database'

/**
 * Database test utilities for consistent test data creation and cleanup
 */
export class DatabaseTestUtils {
  /**
   * Clean up all test data in proper order (respecting foreign key constraints)
   */
  static async cleanupTestData(): Promise<void> {
    // Delete in reverse dependency order, being careful to only delete test data
    await prisma.pick.deleteMany({})
    await prisma.entry.deleteMany({})
    
    // Only delete test pools (those with Test in the name or specific test pools)
    await prisma.pool.deleteMany({
      where: {
        name: {
          contains: 'Test',
        },
      },
    })
    
    await prisma.game.deleteMany({})
    
    // Only delete test mapping profiles (those with Test in the name)
    await prisma.mappingProfile.deleteMany({
      where: {
        name: {
          contains: 'Test',
        },
      },
    })
    
    // Only delete test teams (those with test abbreviations that won't conflict with NFL teams)
    await prisma.team.deleteMany({
      where: {
        OR: [
          {
            nflAbbr: {
              startsWith: 'TST', // All test teams
            },
          },
          {
            nflAbbr: {
              in: ['DEV', 'TEST'],
            },
          },
        ],
      },
    })
  }

  /**
   * Create a test team with valid test abbreviation
   */
  static async createTestTeam(
    overrides: Partial<{ nflAbbr: string; name: string }> = {}
  ): Promise<Team> {
    const defaultData = {
      nflAbbr: 'TST',
      name: 'Test Team',
    }
    
    return await prisma.team.create({
      data: { ...defaultData, ...overrides },
    })
  }

  /**
   * Create a test game with provided teams
   */
  static async createTestGame(
    homeTeamId: string,
    awayTeamId: string,
    overrides: Partial<{
      season: number
      week: number
      kickoff: Date
      status: GameStatus
      venue: string
    }> = {}
  ): Promise<Game> {
    const defaultData = {
      season: 2024,
      week: 1,
      kickoff: new Date('2024-09-10T13:00:00Z'),
      status: 'SCHEDULED' as GameStatus,
    }

    return await prisma.game.create({
      data: {
        ...defaultData,
        ...overrides,
        homeTeamId,
        awayTeamId,
      },
    })
  }

  /**
   * Create a test pool
   */
  static async createTestPool(
    overrides: Partial<{
      name: string
      type: PoolType
      season: number
      buyIn: number
      maxEntries: number
      isActive: boolean
      description: string
    }> = {}
  ): Promise<Pool> {
    const defaultData = {
      name: `Test Pool ${Date.now()}-${Math.random().toString(36).slice(2)}`, // Ensure uniqueness
      type: 'ATS' as PoolType,
      season: 2024,
      buyIn: 50.0,
      maxEntries: 100,
      isActive: true,
    }

    return await prisma.pool.create({
      data: { ...defaultData, ...overrides },
    })
  }

  /**
   * Create a test entry
   */
  static async createTestEntry(
    poolId: string,
    overrides: Partial<{ season: number }> = {}
  ): Promise<Entry> {
    const defaultData = {
      season: 2024,
    }

    return await prisma.entry.create({
      data: {
        ...defaultData,
        ...overrides,
        poolId,
      },
    })
  }

  /**
   * Create a test pick
   */
  static async createTestPick(
    entryId: string,
    gameId: string,
    teamId: string,
    overrides: Partial<{ confidence: number }> = {}
  ): Promise<Pick> {
    const defaultData = {
      confidence: 75.0,
    }

    return await prisma.pick.create({
      data: {
        ...defaultData,
        ...overrides,
        entryId,
        gameId,
        teamId,
      },
    })
  }

  /**
   * Create a complete test scenario with pool, teams, game, entry, and pick
   */
  static async createCompleteTestScenario(): Promise<{
    pool: Pool
    homeTeam: Team
    awayTeam: Team
    game: Game
    entry: Entry
    pick: Pick
  }> {
    // Create teams
    const homeTeam = await this.createTestTeam({
      nflAbbr: 'TST',
      name: 'Test Home Team',
    })
    const awayTeam = await this.createTestTeam({
      nflAbbr: 'DEV',
      name: 'Test Away Team',
    })

    // Create pool
    const pool = await this.createTestPool({
      name: `Complete Test Pool ${Date.now()}-${Math.random().toString(36).slice(2)}`,
    })

    // Create game
    const game = await this.createTestGame(homeTeam.id, awayTeam.id)

    // Create entry
    const entry = await this.createTestEntry(pool.id)

    // Create pick
    const pick = await this.createTestPick(entry.id, game.id, homeTeam.id, {
      confidence: 85.0,
    })

    return {
      pool,
      homeTeam,
      awayTeam,
      game,
      entry,
      pick,
    }
  }

  /**
   * Get count of records for each table (useful for debugging tests)
   */
  static async getRecordCounts(): Promise<{
    teams: number
    games: number
    pools: number
    entries: number
    picks: number
  }> {
    const [teams, games, pools, entries, picks] = await Promise.all([
      prisma.team.count(),
      prisma.game.count(),
      prisma.pool.count(),
      prisma.entry.count(),
      prisma.pick.count(),
    ])

    return { teams, games, pools, entries, picks }
  }

  /**
   * Verify foreign key relationships are working
   */
  static async verifyRelationships(): Promise<{
    gameToTeams: boolean
    entryToPool: boolean
    pickToAll: boolean
  }> {
    try {
      // Test game -> teams relationship
      const gameWithTeams = await prisma.game.findFirst({
        include: { homeTeam: true, awayTeam: true },
      })
      const gameToTeams = !!gameWithTeams?.homeTeam && !!gameWithTeams?.awayTeam

      // Test entry -> pool relationship
      const entryWithPool = await prisma.entry.findFirst({
        include: { pool: true },
      })
      const entryToPool = !!entryWithPool?.pool

      // Test pick -> all relationships
      const pickWithAll = await prisma.pick.findFirst({
        include: { entry: true, game: true, team: true },
      })
      const pickToAll = !!(
        pickWithAll?.entry &&
        pickWithAll?.game &&
        pickWithAll?.team
      )

      return { gameToTeams, entryToPool, pickToAll }
    } catch (error) {
      return { gameToTeams: false, entryToPool: false, pickToAll: false }
    }
  }

  /**
   * Create test data for specific week scenarios
   */
  static async createWeekScenario(week: number, teamCount: number = 2): Promise<{
    teams: Team[]
    games: Game[]
  }> {
    const teams: Team[] = []
    const games: Game[] = []

    // Create teams with timestamp to ensure uniqueness
    const timestamp = Date.now()
    for (let i = 0; i < teamCount; i++) {
      const team = await this.createTestTeam({
        nflAbbr: `TST${week}${i}${timestamp.toString().slice(-2)}`.slice(0, 8), // Keep within reasonable length
        name: `Week ${week} Team ${i}`,
      })
      teams.push(team)
    }

    // Create games for the week (pair teams)
    for (let i = 0; i < teamCount - 1; i += 2) {
      const game = await this.createTestGame(teams[i].id, teams[i + 1].id, {
        week,
        kickoff: new Date(`2024-09-${10 + week}T13:00:00Z`),
      })
      games.push(game)
    }

    return { teams, games }
  }
}