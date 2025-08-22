import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PrismaClient, PoolType, PickOutcome } from '@prisma/client'

const prisma = new PrismaClient()

describe('Survivor Models', () => {
  let testPool: any
  let testTeams: any[]
  let testGame: any

  beforeEach(async () => {
    // Create test pool
    testPool = await prisma.pool.create({
      data: {
        name: `Test Survivor Pool ${Date.now()}`,
        type: PoolType.SURVIVOR,
        season: 2025,
        buyIn: 100,
        maxEntries: 100,
        rules: {
          strikesAllowed: 1,
          tiebreaker: 'marginOfVictory',
        },
      },
    })

    // Get test teams
    testTeams = await prisma.team.findMany({
      where: {
        nflAbbr: {
          in: ['TST', 'DEV'],
        },
      },
    })

    // If test teams don't exist, create them
    if (testTeams.length < 2) {
      testTeams = await Promise.all([
        prisma.team.create({
          data: { nflAbbr: 'TST', name: 'Test Team' },
        }),
        prisma.team.create({
          data: { nflAbbr: 'DEV', name: 'Dev Team' },
        }),
      ])
    }

    // Create a test game
    testGame = await prisma.game.create({
      data: {
        season: 2025,
        week: 1,
        kickoff: new Date('2025-09-07T13:00:00'),
        homeTeamId: testTeams[0].id,
        awayTeamId: testTeams[1].id,
      },
    })
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.survivorPick.deleteMany({
      where: {
        entry: {
          poolId: testPool.id,
        },
      },
    })

    await prisma.survivorEntry.deleteMany({
      where: { poolId: testPool.id },
    })

    await prisma.survivorWeekData.deleteMany({
      where: { poolId: testPool.id },
    })

    await prisma.game.delete({
      where: { id: testGame.id },
    })

    await prisma.pool.delete({
      where: { id: testPool.id },
    })
  })

  describe('SurvivorEntry', () => {
    it('should create a survivor entry', async () => {
      const entry = await prisma.survivorEntry.create({
        data: {
          poolId: testPool.id,
          userId: 'test-user',
          entryName: 'Test Entry',
          strikes: 0,
          isActive: true,
        },
      })

      expect(entry).toBeDefined()
      expect(entry.poolId).toBe(testPool.id)
      expect(entry.userId).toBe('test-user')
      expect(entry.entryName).toBe('Test Entry')
      expect(entry.strikes).toBe(0)
      expect(entry.isActive).toBe(true)
      expect(entry.eliminatedWeek).toBeNull()
    })

    it('should enforce unique constraint on poolId, userId, entryName', async () => {
      await prisma.survivorEntry.create({
        data: {
          poolId: testPool.id,
          userId: 'test-user',
          entryName: 'Entry 1',
          strikes: 0,
          isActive: true,
        },
      })

      await expect(
        prisma.survivorEntry.create({
          data: {
            poolId: testPool.id,
            userId: 'test-user',
            entryName: 'Entry 1',
            strikes: 0,
            isActive: true,
          },
        })
      ).rejects.toThrow()
    })

    it('should track elimination status', async () => {
      const entry = await prisma.survivorEntry.create({
        data: {
          poolId: testPool.id,
          userId: 'test-user',
          entryName: 'Eliminated Entry',
          eliminatedWeek: 3,
          strikes: 1,
          isActive: false,
        },
      })

      expect(entry.eliminatedWeek).toBe(3)
      expect(entry.isActive).toBe(false)
    })
  })

  describe('SurvivorPick', () => {
    let testEntry: any

    beforeEach(async () => {
      testEntry = await prisma.survivorEntry.create({
        data: {
          poolId: testPool.id,
          userId: 'test-user',
          entryName: 'Test Entry',
        },
      })
    })

    it('should create a survivor pick', async () => {
      const pick = await prisma.survivorPick.create({
        data: {
          entryId: testEntry.id,
          week: 1,
          teamId: testTeams[0].id,
          gameId: testGame.id,
        },
      })

      expect(pick).toBeDefined()
      expect(pick.entryId).toBe(testEntry.id)
      expect(pick.week).toBe(1)
      expect(pick.teamId).toBe(testTeams[0].id)
      expect(pick.gameId).toBe(testGame.id)
      expect(pick.result).toBeNull()
      expect(pick.marginOfVictory).toBeNull()
    })

    it('should enforce one pick per week per entry', async () => {
      await prisma.survivorPick.create({
        data: {
          entryId: testEntry.id,
          week: 1,
          teamId: testTeams[0].id,
          gameId: testGame.id,
        },
      })

      await expect(
        prisma.survivorPick.create({
          data: {
            entryId: testEntry.id,
            week: 1,
            teamId: testTeams[1].id,
            gameId: testGame.id,
          },
        })
      ).rejects.toThrow()
    })

    it('should enforce no team reuse per entry', async () => {
      await prisma.survivorPick.create({
        data: {
          entryId: testEntry.id,
          week: 1,
          teamId: testTeams[0].id,
          gameId: testGame.id,
        },
      })

      // Create another game for week 2
      const week2Game = await prisma.game.create({
        data: {
          season: 2025,
          week: 2,
          kickoff: new Date('2025-09-14T13:00:00'),
          homeTeamId: testTeams[0].id,
          awayTeamId: testTeams[1].id,
        },
      })

      await expect(
        prisma.survivorPick.create({
          data: {
            entryId: testEntry.id,
            week: 2,
            teamId: testTeams[0].id, // Same team as week 1
            gameId: week2Game.id,
          },
        })
      ).rejects.toThrow()

      // Clean up
      await prisma.game.delete({
        where: { id: week2Game.id },
      })
    })

    it('should track pick results and margin of victory', async () => {
      const pick = await prisma.survivorPick.create({
        data: {
          entryId: testEntry.id,
          week: 1,
          teamId: testTeams[0].id,
          gameId: testGame.id,
          result: PickOutcome.WIN,
          marginOfVictory: 14,
        },
      })

      expect(pick.result).toBe(PickOutcome.WIN)
      expect(pick.marginOfVictory).toBe(14)
    })
  })

  describe('SurvivorWeekData', () => {
    it('should create week data for tracking', async () => {
      const weekData = await prisma.survivorWeekData.create({
        data: {
          poolId: testPool.id,
          week: 1,
          totalEntries: 100,
          survivingEntries: 85,
          publicPickData: {
            KC: 25.5,
            BUF: 18.2,
            SF: 15.7,
            other: 40.6,
          },
        },
      })

      expect(weekData).toBeDefined()
      expect(weekData.poolId).toBe(testPool.id)
      expect(weekData.week).toBe(1)
      expect(weekData.totalEntries).toBe(100)
      expect(weekData.survivingEntries).toBe(85)
      expect(weekData.publicPickData).toHaveProperty('KC')
    })

    it('should enforce unique constraint on poolId and week', async () => {
      await prisma.survivorWeekData.create({
        data: {
          poolId: testPool.id,
          week: 1,
          totalEntries: 100,
          survivingEntries: 100,
        },
      })

      await expect(
        prisma.survivorWeekData.create({
          data: {
            poolId: testPool.id,
            week: 1,
            totalEntries: 100,
            survivingEntries: 95,
          },
        })
      ).rejects.toThrow()
    })
  })

  describe('Pool Rules for Survivor', () => {
    it('should store survivor-specific rules in pool', async () => {
      const pool = await prisma.pool.findUnique({
        where: { id: testPool.id },
      })

      expect(pool?.type).toBe(PoolType.SURVIVOR)
      expect(pool?.rules).toBeDefined()

      const rules = pool?.rules as any
      expect(rules.strikesAllowed).toBe(1)
      expect(rules.tiebreaker).toBe('marginOfVictory')
    })

    it('should support different survivor rule configurations', async () => {
      const strictPool = await prisma.pool.create({
        data: {
          name: `Strict Survivor Pool ${Date.now()}`,
          type: PoolType.SURVIVOR,
          season: 2025,
          buyIn: 200,
          maxEntries: 50,
          rules: {
            strikesAllowed: 0,
            tiebreaker: 'cumulativePointDifferential',
            buybackRules: {
              allowed: false,
            },
            startWeek: 1,
            defaultPick: null,
            tiesCountAs: 'loss',
            continueIntoPlayoffs: true,
          },
        },
      })

      const rules = strictPool.rules as any
      expect(rules.strikesAllowed).toBe(0)
      expect(rules.buybackRules.allowed).toBe(false)
      expect(rules.continueIntoPlayoffs).toBe(true)

      // Clean up
      await prisma.pool.delete({
        where: { id: strictPool.id },
      })
    })
  })
})
