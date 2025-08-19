import { describe, it, expect, beforeEach } from 'vitest'
import { RecentFormAnalyzer } from '../recent-form'
import { prisma } from '@/lib/prisma'
import { DatabaseTestUtils } from '@/lib/test-utils/database'

describe('RecentFormAnalyzer', () => {
  beforeEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  describe('analyzeTeamForm', () => {
    it('should return neutral form for team with no recent games', async () => {
      // Create test team
      const team = await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'TST1',
        name: 'Test Team 1'
      })

      const analyzer = new RecentFormAnalyzer()
      const result = await analyzer.analyzeTeamForm(team.id, new Date('2024-10-15'), 2024, 4)

      expect(result).toEqual({
        teamId: team.id,
        formScore: 0,
        gamesAnalyzed: 0,
        wins: 0,
        losses: 0,
        avgMarginOfVictory: 0,
        recentTrend: 'neutral'
      })
    })

    it('should analyze recent form correctly for team with wins and losses', async () => {
      // Create teams
      const homeTeam = await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'TST2',
        name: 'Test Home Team'
      })
      const opponent1 = await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'TST3',
        name: 'Test Opponent 1'
      })
      const opponent2 = await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'TST4',
        name: 'Test Opponent 2'
      })
      const opponent3 = await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'TST5',
        name: 'Test Opponent 3'
      })

      // Create games (most recent first in our test)
      // Week 3: TB wins by 14 (28-14)
      const game1 = await prisma.game.create({
        data: {
          season: 2024,
          week: 3,
          kickoff: new Date('2024-09-22T13:00:00Z'),
          homeTeamId: homeTeam.id,
          awayTeamId: opponent1.id
        }
      })
      await prisma.result.create({
        data: {
          gameId: game1.id,
          homeScore: 28,
          awayScore: 14,
          status: 'FINAL'
        }
      })

      // Week 2: TB loses by 3 (17-20) - away game
      const game2 = await prisma.game.create({
        data: {
          season: 2024,
          week: 2,
          kickoff: new Date('2024-09-15T13:00:00Z'),
          homeTeamId: opponent2.id,
          awayTeamId: homeTeam.id
        }
      })
      await prisma.result.create({
        data: {
          gameId: game2.id,
          homeScore: 20,
          awayScore: 17,
          status: 'FINAL'
        }
      })

      // Week 1: TB wins by 10 (27-17)
      const game3 = await prisma.game.create({
        data: {
          season: 2024,
          week: 1,
          kickoff: new Date('2024-09-08T13:00:00Z'),
          homeTeamId: homeTeam.id,
          awayTeamId: opponent3.id
        }
      })
      await prisma.result.create({
        data: {
          gameId: game3.id,
          homeScore: 27,
          awayScore: 17,
          status: 'FINAL'
        }
      })

      const analyzer = new RecentFormAnalyzer()
      const result = await analyzer.analyzeTeamForm(homeTeam.id, new Date('2024-10-01'), 2024, 3)

      expect(result.teamId).toBe(homeTeam.id)
      expect(result.gamesAnalyzed).toBe(3)
      expect(result.wins).toBe(2)
      expect(result.losses).toBe(1)
      expect(result.avgMarginOfVictory).toBe(7) // (14 - 3 + 10) / 3 = 7
      expect(result.recentTrend).toBe('hot') // 2 wins out of 3 games
      expect(result.formScore).toBeGreaterThan(0) // Positive form
    })

    it('should handle games without results', async () => {
      const team = await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'TST6',
        name: 'Test Team 6'
      })
      const opponent = await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'TST7',
        name: 'Test Opponent 7'
      })

      // Create game without result
      await prisma.game.create({
        data: {
          season: 2024,
          week: 1,
          kickoff: new Date('2024-09-08T13:00:00Z'),
          homeTeamId: team.id,
          awayTeamId: opponent.id
        }
      })

      const analyzer = new RecentFormAnalyzer()
      const result = await analyzer.analyzeTeamForm(team.id, new Date('2024-09-15'), 2024, 3)

      expect(result.gamesAnalyzed).toBe(0)
      expect(result.formScore).toBe(0)
    })
  })

  describe('calculateFormComparison', () => {
    it('should return neutral comparison when both teams have no form data', async () => {
      const homeTeam = await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'TST8',
        name: 'Test Home Team'
      })
      const awayTeam = await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'TST9',
        name: 'Test Away Team'
      })

      const analyzer = new RecentFormAnalyzer()
      const result = await analyzer.calculateFormComparison(
        homeTeam.id,
        awayTeam.id,
        new Date('2024-10-01'),
        2024,
        3
      )

      expect(result.homeTeamForm.formScore).toBe(0)
      expect(result.awayTeamForm.formScore).toBe(0)
      expect(result.formAdvantage).toBe(0)
      expect(result.homeTeamFavored).toBe(false)
    })
  })
})