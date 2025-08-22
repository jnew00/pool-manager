import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  analyzeRevengeGame,
  getRevengeGameSummary,
  REVENGE_FACTORS,
} from '../revenge-game'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    game: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'
const mockPrisma = vi.mocked(prisma)

describe('Revenge Game System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const homeTeamId = 'team-home'
  const awayTeamId = 'team-away'
  const currentGameDate = new Date('2024-12-15T18:00:00Z')
  const currentSeason = 2024

  describe('analyzeRevengeGame', () => {
    it('should return no revenge motivation when no previous meetings exist', async () => {
      mockPrisma.game.findMany.mockResolvedValue([])

      const result = await analyzeRevengeGame(
        homeTeamId,
        awayTeamId,
        currentGameDate,
        currentSeason
      )

      expect(result.isRevengeGame).toBe(false)
      expect(result.previousMeetings).toHaveLength(0)
      expect(result.revengeMotivation).toBe(0)
      expect(result.revengeTeamId).toBeUndefined()
    })

    it('should identify revenge game when home team lost previous meeting', async () => {
      const previousGame = {
        kickoff: new Date('2024-11-01T18:00:00Z'),
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        status: 'FINAL',
        homeTeam: { id: homeTeamId, name: 'Home Team', nflAbbr: 'HT' },
        awayTeam: { id: awayTeamId, name: 'Away Team', nflAbbr: 'AT' },
        result: { homeScore: 17, awayScore: 24 },
      }

      mockPrisma.game.findMany.mockResolvedValue([previousGame])

      const result = await analyzeRevengeGame(
        homeTeamId,
        awayTeamId,
        currentGameDate,
        currentSeason
      )

      expect(result.isRevengeGame).toBe(true)
      expect(result.previousMeetings).toHaveLength(1)
      expect(result.revengeMotivation).toBeGreaterThan(
        REVENGE_FACTORS.BASE_REVENGE_BONUS
      )
      expect(result.revengeMotivation).toBeLessThanOrEqual(
        REVENGE_FACTORS.MAX_REVENGE_BONUS
      )
      expect(result.revengeTeamId).toBe(homeTeamId) // Home team lost and seeking revenge
    })

    it('should identify revenge game when away team lost previous meeting', async () => {
      const previousGame = {
        kickoff: new Date('2024-11-01T18:00:00Z'),
        homeTeamId: awayTeamId, // Teams switched
        awayTeamId: homeTeamId,
        status: 'FINAL',
        homeTeam: { id: awayTeamId, name: 'Away Team', nflAbbr: 'AT' },
        awayTeam: { id: homeTeamId, name: 'Home Team', nflAbbr: 'HT' },
        result: { homeScore: 28, awayScore: 14 }, // Away team lost by 14
      }

      mockPrisma.game.findMany.mockResolvedValue([previousGame])

      const result = await analyzeRevengeGame(
        homeTeamId,
        awayTeamId,
        currentGameDate,
        currentSeason
      )

      expect(result.isRevengeGame).toBe(true)
      expect(result.revengeTeamId).toBe(homeTeamId) // Home team in current game lost previous meeting
      expect(result.revengeMotivation).toBeGreaterThan(
        REVENGE_FACTORS.BASE_REVENGE_BONUS
      ) // Should include blowout bonus
    })

    it('should apply blowout bonus for losses of 14+ points', async () => {
      const blowoutGame = {
        kickoff: new Date('2024-11-01T18:00:00Z'),
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        status: 'FINAL',
        homeTeam: { id: homeTeamId, name: 'Home Team', nflAbbr: 'HT' },
        awayTeam: { id: awayTeamId, name: 'Away Team', nflAbbr: 'AT' },
        result: { homeScore: 10, awayScore: 35 }, // Home team lost by 25 points (blowout)
      }

      mockPrisma.game.findMany.mockResolvedValue([blowoutGame])

      const result = await analyzeRevengeGame(
        homeTeamId,
        awayTeamId,
        currentGameDate,
        currentSeason
      )

      // Should be more than just base bonus since it includes blowout
      expect(result.revengeMotivation).toBeGreaterThan(
        REVENGE_FACTORS.BASE_REVENGE_BONUS +
          REVENGE_FACTORS.BLOWOUT_REVENGE_BONUS
      )
      expect(result.revengeMotivation).toBeLessThanOrEqual(
        REVENGE_FACTORS.MAX_REVENGE_BONUS
      )
    })

    it('should apply recent game multiplier for games within 6 weeks', async () => {
      const earlySeasonGameDate = new Date('2024-10-15T18:00:00Z') // October game to avoid playoff multiplier
      const recentGame = {
        kickoff: new Date('2024-10-01T18:00:00Z'), // 2 weeks before October game
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        status: 'FINAL',
        homeTeam: { id: homeTeamId, name: 'Home Team', nflAbbr: 'HT' },
        awayTeam: { id: awayTeamId, name: 'Away Team', nflAbbr: 'AT' },
        result: { homeScore: 14, awayScore: 21 },
      }

      mockPrisma.game.findMany.mockResolvedValue([recentGame])

      const result = await analyzeRevengeGame(
        homeTeamId,
        awayTeamId,
        earlySeasonGameDate,
        currentSeason
      )

      // Should be greater than base bonus due to recent multiplier
      expect(result.revengeMotivation).toBeGreaterThan(
        REVENGE_FACTORS.BASE_REVENGE_BONUS
      )
      expect(result.revengeMotivation).toBeLessThanOrEqual(
        REVENGE_FACTORS.MAX_REVENGE_BONUS
      )
    })

    it('should apply playoff multiplier for late season games', async () => {
      const lateSeasonGameDate = new Date('2024-12-20T18:00:00Z') // Late December
      const previousGame = {
        kickoff: new Date('2024-09-15T18:00:00Z'), // Early season to avoid recent multiplier
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        status: 'FINAL',
        homeTeam: { id: homeTeamId, name: 'Home Team', nflAbbr: 'HT' },
        awayTeam: { id: awayTeamId, name: 'Away Team', nflAbbr: 'AT' },
        result: { homeScore: 17, awayScore: 28 }, // 11-point loss (>= 7 for playoff implications)
      }

      mockPrisma.game.findMany.mockResolvedValue([previousGame])

      const result = await analyzeRevengeGame(
        homeTeamId,
        awayTeamId,
        lateSeasonGameDate,
        currentSeason
      )

      // Should be greater than base bonus due to playoff multiplier
      expect(result.revengeMotivation).toBeGreaterThan(
        REVENGE_FACTORS.BASE_REVENGE_BONUS
      )
      expect(result.revengeMotivation).toBeLessThanOrEqual(
        REVENGE_FACTORS.MAX_REVENGE_BONUS
      )
    })

    it('should cap revenge bonus at maximum allowed', async () => {
      const extremeRevengeGame = {
        kickoff: new Date('2024-12-01T18:00:00Z'), // Recent (multiplier applies)
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        status: 'FINAL',
        homeTeam: { id: homeTeamId, name: 'Home Team', nflAbbr: 'HT' },
        awayTeam: { id: awayTeamId, name: 'Away Team', nflAbbr: 'AT' },
        result: { homeScore: 7, awayScore: 42 }, // 35-point blowout
      }

      mockPrisma.game.findMany.mockResolvedValue([extremeRevengeGame])

      // Use late season date to trigger playoff multiplier too
      const lateSeasonDate = new Date('2024-12-20T18:00:00Z')
      const result = await analyzeRevengeGame(
        homeTeamId,
        awayTeamId,
        lateSeasonDate,
        currentSeason
      )

      expect(result.revengeMotivation).toBeLessThanOrEqual(
        REVENGE_FACTORS.MAX_REVENGE_BONUS
      )
    })

    it('should handle multiple previous meetings and use most recent', async () => {
      const olderGame = {
        kickoff: new Date('2024-09-15T18:00:00Z'),
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        status: 'FINAL',
        homeTeam: { id: homeTeamId, name: 'Home Team', nflAbbr: 'HT' },
        awayTeam: { id: awayTeamId, name: 'Away Team', nflAbbr: 'AT' },
        result: { homeScore: 35, awayScore: 14 }, // Home team won
      }

      const recentGame = {
        kickoff: new Date('2024-11-15T18:00:00Z'),
        homeTeamId: awayTeamId, // Switched locations
        awayTeamId: homeTeamId,
        status: 'FINAL',
        homeTeam: { id: awayTeamId, name: 'Away Team', nflAbbr: 'AT' },
        awayTeam: { id: homeTeamId, name: 'Home Team', nflAbbr: 'HT' },
        result: { homeScore: 21, awayScore: 14 }, // Current home team lost
      }

      // Return in reverse chronological order (most recent first)
      mockPrisma.game.findMany.mockResolvedValue([recentGame, olderGame])

      const result = await analyzeRevengeGame(
        homeTeamId,
        awayTeamId,
        currentGameDate,
        currentSeason
      )

      expect(result.revengeTeamId).toBe(homeTeamId) // Based on most recent game loss
      expect(result.previousMeetings).toHaveLength(2)
      expect(result.previousMeetings[0].gameDate).toEqual(recentGame.kickoff)
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.game.findMany.mockRejectedValue(new Error('Database error'))

      const result = await analyzeRevengeGame(
        homeTeamId,
        awayTeamId,
        currentGameDate,
        currentSeason
      )

      expect(result.isRevengeGame).toBe(false)
      expect(result.previousMeetings).toHaveLength(0)
      expect(result.revengeMotivation).toBe(0)
    })
  })

  describe('getRevengeGameSummary', () => {
    it('should return no revenge message when not a revenge game', () => {
      const result = {
        isRevengeGame: false,
        previousMeetings: [],
        revengeMotivation: 0,
      }

      const summary = getRevengeGameSummary(result)
      expect(summary).toBe('No revenge motivation')
    })

    it('should generate proper summary for standard revenge game', () => {
      const result = {
        isRevengeGame: true,
        previousMeetings: [
          {
            gameDate: new Date('2024-11-01T18:00:00Z'),
            homeTeamId: 'team-home',
            awayTeamId: 'team-away',
            homeScore: 17,
            awayScore: 24,
            winnerId: 'team-away',
            losingMargin: 7,
            wasBlowout: false,
            wasUpsetWin: false,
          },
        ],
        revengeMotivation: 2.5,
        revengeTeamId: 'team-home',
      }

      const summary = getRevengeGameSummary(result)
      expect(summary).toBe(
        'Revenge game - home team lost by 7 points (+2.5 pts motivation)'
      )
    })

    it('should include blowout indicator in summary', () => {
      const result = {
        isRevengeGame: true,
        previousMeetings: [
          {
            gameDate: new Date('2024-11-01T18:00:00Z'),
            homeTeamId: 'team-home',
            awayTeamId: 'team-away',
            homeScore: 10,
            awayScore: 35,
            winnerId: 'team-away',
            losingMargin: 25,
            wasBlowout: true,
            wasUpsetWin: false,
          },
        ],
        revengeMotivation: 4.0,
        revengeTeamId: 'team-home',
      }

      const summary = getRevengeGameSummary(result)
      expect(summary).toContain('blowout')
      expect(summary).toContain('+4.0 pts motivation')
    })

    it('should include upset indicator in summary', () => {
      const result = {
        isRevengeGame: true,
        previousMeetings: [
          {
            gameDate: new Date('2024-11-01T18:00:00Z'),
            homeTeamId: 'team-home',
            awayTeamId: 'team-away',
            homeScore: 21,
            awayScore: 24,
            winnerId: 'team-away',
            losingMargin: 3,
            wasBlowout: false,
            wasUpsetWin: true,
          },
        ],
        revengeMotivation: 3.0,
        revengeTeamId: 'team-home',
      }

      const summary = getRevengeGameSummary(result)
      expect(summary).toContain('upset')
      expect(summary).toContain('+3.0 pts motivation')
    })

    it('should include both blowout and upset indicators', () => {
      const result = {
        isRevengeGame: true,
        previousMeetings: [
          {
            gameDate: new Date('2024-11-01T18:00:00Z'),
            homeTeamId: 'team-home',
            awayTeamId: 'team-away',
            homeScore: 7,
            awayScore: 28,
            winnerId: 'team-away',
            losingMargin: 21,
            wasBlowout: true,
            wasUpsetWin: true,
          },
        ],
        revengeMotivation: 5.0,
        revengeTeamId: 'team-home',
      }

      const summary = getRevengeGameSummary(result)
      expect(summary).toContain('blowout')
      expect(summary).toContain('upset')
      expect(summary).toContain('+5.0 pts motivation')
    })
  })

  describe('REVENGE_FACTORS constants', () => {
    it('should have reasonable factor values', () => {
      expect(REVENGE_FACTORS.BASE_REVENGE_BONUS).toBeGreaterThan(0)
      expect(REVENGE_FACTORS.BLOWOUT_REVENGE_BONUS).toBeGreaterThan(0)
      expect(REVENGE_FACTORS.UPSET_REVENGE_BONUS).toBeGreaterThan(0)
      expect(REVENGE_FACTORS.RECENT_REVENGE_MULTIPLIER).toBeGreaterThan(1)
      expect(REVENGE_FACTORS.PLAYOFF_REVENGE_MULTIPLIER).toBeGreaterThan(1)
      expect(REVENGE_FACTORS.MAX_REVENGE_BONUS).toBeGreaterThan(
        REVENGE_FACTORS.BASE_REVENGE_BONUS
      )
    })
  })
})
