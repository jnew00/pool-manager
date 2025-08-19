import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PickLockingService } from '../pick-locking.service'
import { DatabaseTestUtils } from '@/lib/test-utils/database'
import type { Pool, Game } from '@/lib/types/database'

describe('PickLockingService', () => {
  let service: PickLockingService
  let testPool: Pool
  let testGame: Game
  let homeTeamId: string
  let awayTeamId: string

  beforeEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
    service = new PickLockingService()

    // Create test data with unique timestamps to avoid collisions
    const timestamp = Date.now().toString().slice(-6)
    const homeTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: `HM${timestamp}`,
      name: 'Home Team',
    })
    const awayTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: `AW${timestamp}`,
      name: 'Away Team',
    })

    testPool = await DatabaseTestUtils.createTestPool({
      name: 'Test Pool',
      season: 2024,
      rules: {
        lockDeadline: 'game_time', // Lock at game time
      },
    })

    testGame = await DatabaseTestUtils.createTestGame(
      homeTeam.id,
      awayTeam.id,
      {
        season: 2024,
        week: 1,
        kickoff: new Date('2024-09-08T13:00:00Z'), // Future kickoff
      }
    )

    homeTeamId = homeTeam.id
    awayTeamId = awayTeam.id
  })

  afterEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  describe('isGameLocked', () => {
    it('should return false for games before lockDeadline', async () => {
      // Game kicks off in the future
      const futureGame = await DatabaseTestUtils.createTestGame(
        homeTeamId,
        awayTeamId,
        {
          season: 2024,
          week: 2,
          kickoff: new Date(Date.now() + 3600000), // 1 hour from now
        }
      )

      const isLocked = await service.isGameLocked(futureGame.id, testPool.id)
      expect(isLocked).toBe(false)
    })

    it('should return true for games after lockDeadline', async () => {
      // Game kicked off in the past
      const pastGame = await DatabaseTestUtils.createTestGame(
        homeTeamId,
        awayTeamId,
        {
          season: 2024,
          week: 2,
          kickoff: new Date(Date.now() - 3600000), // 1 hour ago
        }
      )

      const isLocked = await service.isGameLocked(pastGame.id, testPool.id)
      expect(isLocked).toBe(true)
    })

    it('should handle different lock deadline types', async () => {
      // Create pool with 1-hour before game time lock
      const timestamp = Date.now().toString().slice(-6)
      const earlyLockPool = await DatabaseTestUtils.createTestPool({
        name: `Early Lock Pool ${timestamp}`,
        season: 2024,
        rules: {
          lockDeadline: '1_hour_before',
        },
      })

      // Create unique teams for this test
      const testHomeTeam = await DatabaseTestUtils.createTestTeam({
        nflAbbr: `EH${timestamp}`,
        name: 'Early Home Team',
      })
      const testAwayTeam = await DatabaseTestUtils.createTestTeam({
        nflAbbr: `EA${timestamp}`,
        name: 'Early Away Team',
      })

      // Game kicks off in 30 minutes (within 1 hour)
      const soonGame = await DatabaseTestUtils.createTestGame(
        testHomeTeam.id,
        testAwayTeam.id,
        {
          season: 2024,
          week: 3,
          kickoff: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        }
      )

      const isLocked = await service.isGameLocked(soonGame.id, earlyLockPool.id)
      expect(isLocked).toBe(true)
    })

    it('should handle weekly lock deadline', async () => {
      // Create pool with weekly lock (Thursday 8:00 PM ET)
      const timestamp = Date.now().toString().slice(-6)
      const weeklyLockPool = await DatabaseTestUtils.createTestPool({
        name: `Weekly Lock Pool ${timestamp}`,
        season: 2024,
        rules: {
          lockDeadline: 'weekly_thursday_8pm',
        },
      })

      // Mock current time to be Friday (after Thursday 8 PM)
      const fridayDate = new Date('2024-09-06T20:00:00Z') // Friday 8 PM UTC
      const originalNow = Date.now
      Date.now = () => fridayDate.getTime()

      try {
        const isLocked = await service.isGameLocked(
          testGame.id,
          weeklyLockPool.id
        )
        expect(isLocked).toBe(true)
      } finally {
        Date.now = originalNow
      }
    })
  })

  describe('getLockedGames', () => {
    it('should return list of locked games for a pool', async () => {
      // Create unique teams for different games
      const timestamp = Date.now().toString().slice(-6)
      const futureHomeTeam = await DatabaseTestUtils.createTestTeam({
        nflAbbr: `FH${timestamp}`,
        name: 'Future Home Team',
      })
      const futureAwayTeam = await DatabaseTestUtils.createTestTeam({
        nflAbbr: `FA${timestamp}`,
        name: 'Future Away Team',
      })
      const pastHomeTeam = await DatabaseTestUtils.createTestTeam({
        nflAbbr: `PH${timestamp}`,
        name: 'Past Home Team',
      })
      const pastAwayTeam = await DatabaseTestUtils.createTestTeam({
        nflAbbr: `PA${timestamp}`,
        name: 'Past Away Team',
      })

      // Create a mix of future and past games
      const futureGame = await DatabaseTestUtils.createTestGame(
        futureHomeTeam.id,
        futureAwayTeam.id,
        {
          season: 2024,
          week: 2,
          kickoff: new Date(Date.now() + 3600000), // Future
        }
      )

      const pastGame = await DatabaseTestUtils.createTestGame(
        pastHomeTeam.id,
        pastAwayTeam.id,
        {
          season: 2024,
          week: 2,
          kickoff: new Date(Date.now() - 3600000), // Past
        }
      )

      const lockedGames = await service.getLockedGames(testPool.id, 2024, 2)

      expect(lockedGames).toContain(pastGame.id)
      expect(lockedGames).not.toContain(futureGame.id)
    })

    it('should return empty array when no games are locked', async () => {
      // All games in the future
      await DatabaseTestUtils.createTestGame(homeTeamId, awayTeamId, {
        season: 2024,
        week: 5,
        kickoff: new Date(Date.now() + 3600000),
      })

      const lockedGames = await service.getLockedGames(testPool.id, 2024, 5)
      expect(lockedGames).toEqual([])
    })
  })

  describe('validatePickSubmission', () => {
    it('should throw error when trying to pick on locked game', async () => {
      const pastGame = await DatabaseTestUtils.createTestGame(
        homeTeamId,
        awayTeamId,
        {
          season: 2024,
          week: 4,
          kickoff: new Date(Date.now() - 3600000), // Past
        }
      )

      const entryId = 'test-entry-id'

      await expect(
        service.validatePickSubmission(entryId, pastGame.id, testPool.id)
      ).rejects.toThrow('Game is locked and picks cannot be submitted')
    })

    it('should pass validation for unlocked games', async () => {
      const futureGame = await DatabaseTestUtils.createTestGame(
        homeTeamId,
        awayTeamId,
        {
          season: 2024,
          week: 4,
          kickoff: new Date(Date.now() + 3600000), // Future
        }
      )

      const entryId = 'test-entry-id'

      // Should not throw
      await expect(
        service.validatePickSubmission(entryId, futureGame.id, testPool.id)
      ).resolves.toBeUndefined()
    })
  })

  describe('getLockDeadlineForGame', () => {
    it('should calculate deadline for game_time rule', async () => {
      const gameTime = new Date('2024-09-08T13:00:00Z')

      const deadline = await service.getLockDeadlineForGame(
        testGame.id,
        testPool.id
      )
      expect(deadline).toEqual(gameTime)
    })

    it('should calculate deadline for 1_hour_before rule', async () => {
      const timestamp = Date.now().toString().slice(-6)
      const hourBeforePool = await DatabaseTestUtils.createTestPool({
        name: `Hour Before Pool ${timestamp}`,
        season: 2024,
        rules: {
          lockDeadline: '1_hour_before',
        },
      })

      const gameTime = new Date('2024-09-08T13:00:00Z')
      const expectedDeadline = new Date('2024-09-08T12:00:00Z') // 1 hour before

      const deadline = await service.getLockDeadlineForGame(
        testGame.id,
        hourBeforePool.id
      )
      expect(deadline).toEqual(expectedDeadline)
    })

    it('should calculate deadline for weekly rule', async () => {
      const timestamp = Date.now().toString().slice(-6)
      const weeklyPool = await DatabaseTestUtils.createTestPool({
        name: `Weekly Pool ${timestamp}`,
        season: 2024,
        rules: {
          lockDeadline: 'weekly_thursday_8pm',
        },
      })

      // For a game in week 1 of 2024, Thursday should be Sept 5
      const expectedDeadline = new Date('2024-09-05T20:00:00-04:00') // Thursday 8 PM ET

      const deadline = await service.getLockDeadlineForGame(
        testGame.id,
        weeklyPool.id
      )
      expect(deadline.getDay()).toBe(4) // Thursday
      expect(deadline.getHours()).toBe(20) // 8 PM
    })
  })
})
