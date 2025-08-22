import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PublicPickService } from '../public-pick-service'
import { SurvivorOddsService } from '../survivor-odds-service'
import { SurvivorWeatherService } from '../survivor-weather-service'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    team: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    game: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    survivorPick: {
      findMany: vi.fn(),
    },
  },
}))

describe('PublicPickService', () => {
  let service: PublicPickService

  beforeEach(() => {
    service = new PublicPickService()
    vi.clearAllMocks()
  })

  describe('getPublicPickPercentages', () => {
    it('should aggregate data from multiple sources', async () => {
      const mockTeams = [
        { id: 'team1', nflAbbr: 'KC' },
        { id: 'team2', nflAbbr: 'BUF' },
        { id: 'team3', nflAbbr: 'PHI' },
        { id: 'team4', nflAbbr: 'NYJ' },
      ]

      const mockGames = [
        {
          id: 'game1',
          week: 5,
          homeTeamId: 'team1',
          awayTeamId: 'team4',
          homeTeam: mockTeams[0],
          awayTeam: mockTeams[3],
        },
        {
          id: 'game2',
          week: 5,
          homeTeamId: 'team2',
          awayTeamId: 'team3',
          homeTeam: mockTeams[1],
          awayTeam: mockTeams[2],
        },
      ]

      vi.mocked(prisma.team.findMany).mockResolvedValue(mockTeams as any)
      vi.mocked(prisma.game.findMany).mockResolvedValue(mockGames as any)
      vi.mocked(prisma.survivorPick.findMany).mockResolvedValue([])

      const result = await service.getPublicPickPercentages(5)

      expect(result.week).toBe(1) // Mocked value
      expect(result.teams).toBeDefined()
      expect(result.teams.length).toBeGreaterThan(0)

      // Check that percentages sum to ~100%
      const totalPct = result.teams.reduce(
        (sum, t) => sum + t.pickPercentage,
        0
      )
      expect(totalPct).toBeCloseTo(100, 1)

      // Check that teams are sorted by pick percentage
      for (let i = 1; i < result.teams.length; i++) {
        expect(result.teams[i - 1].pickPercentage).toBeGreaterThanOrEqual(
          result.teams[i].pickPercentage
        )
      }
    })

    it('should use internal pool data when available', async () => {
      const mockPicks = [
        { teamId: 'team1', team: { nflAbbr: 'KC' } },
        { teamId: 'team1', team: { nflAbbr: 'KC' } },
        { teamId: 'team1', team: { nflAbbr: 'KC' } },
        { teamId: 'team2', team: { nflAbbr: 'BUF' } },
        { teamId: 'team3', team: { nflAbbr: 'PHI' } },
      ]

      vi.mocked(prisma.survivorPick.findMany).mockResolvedValue(
        mockPicks as any
      )
      vi.mocked(prisma.team.findMany).mockResolvedValue([])
      vi.mocked(prisma.game.findMany).mockResolvedValue([])

      const result = await service.getPublicPickPercentages(5, 'pool1')

      // Internal data should be included
      expect(vi.mocked(prisma.survivorPick.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            week: 5,
          }),
        })
      )
    })
  })

  describe('getHistoricalData', () => {
    it('should return historical survivor data', async () => {
      const result = await service.getHistoricalData(10, 2023)

      expect(result).toHaveLength(10)
      expect(result[0].year).toBe(2023)
      expect(result[0].survivalRate).toBeGreaterThan(0)
      expect(result[0].survivalRate).toBeLessThan(1)
      expect(result[0].topPickTeam).toBeDefined()
      expect(result[0].topPickPercentage).toBeGreaterThan(0)
    })
  })
})

describe('SurvivorOddsService', () => {
  let service: SurvivorOddsService

  beforeEach(() => {
    service = new SurvivorOddsService()
    vi.clearAllMocks()
  })

  describe('moneylineToWinProbability', () => {
    it('should convert favorite moneylines correctly', () => {
      expect(service.moneylineToWinProbability(-200)).toBeCloseTo(0.667, 2)
      expect(service.moneylineToWinProbability(-150)).toBeCloseTo(0.6, 2)
      expect(service.moneylineToWinProbability(-110)).toBeCloseTo(0.524, 2)
    })

    it('should convert underdog moneylines correctly', () => {
      expect(service.moneylineToWinProbability(200)).toBeCloseTo(0.333, 2)
      expect(service.moneylineToWinProbability(150)).toBeCloseTo(0.4, 2)
      expect(service.moneylineToWinProbability(110)).toBeCloseTo(0.476, 2)
    })
  })

  describe('spreadToWinProbability', () => {
    it('should convert spreads to win probability', () => {
      expect(service.spreadToWinProbability(-7)).toBeCloseTo(0.675, 2)
      expect(service.spreadToWinProbability(-3)).toBeCloseTo(0.575, 2)
      expect(service.spreadToWinProbability(0)).toBe(0.5)
      expect(service.spreadToWinProbability(3)).toBeCloseTo(0.425, 2)
      expect(service.spreadToWinProbability(7)).toBeCloseTo(0.325, 2)
    })
  })

  describe('getWeekMoneylines', () => {
    it('should fetch and aggregate odds from multiple sources', async () => {
      const mockGames = [
        {
          id: 'game1',
          week: 5,
          homeTeamId: 'team1',
          awayTeamId: 'team2',
          homeTeam: { nflAbbr: 'KC' },
          awayTeam: { nflAbbr: 'NYJ' },
        },
      ]

      vi.mocked(prisma.game.findMany).mockResolvedValue(mockGames as any)

      const result = await service.getWeekMoneylines(5)

      expect(result.week).toBe(1) // Mocked value
      expect(result.games).toBeDefined()
      expect(result.games.length).toBeGreaterThan(0)

      result.games.forEach((game) => {
        expect(game.homeWinProbability + game.awayWinProbability).toBeCloseTo(
          1,
          1
        )
        expect(game.source).toBe('CONSENSUS')
      })
    })
  })

  describe('getOddsMovement', () => {
    it('should track odds movement over time', async () => {
      const movements = await service.getOddsMovement('game1', 12)

      expect(movements.length).toBeGreaterThan(0)
      movements.forEach((movement) => {
        expect(movement.gameId).toBe('game1')
        expect(movement.direction).toMatch(
          /HOME_IMPROVING|AWAY_IMPROVING|STABLE/
        )
        expect(movement.magnitude).toMatch(/MINOR|MODERATE|SIGNIFICANT/)
      })
    })
  })

  describe('getInjuryAdjustedOdds', () => {
    it('should adjust odds based on injuries', async () => {
      const mockGame = {
        id: 'game1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        homeTeam: { nflAbbr: 'KC' },
        awayTeam: { nflAbbr: 'NYJ' },
      }

      vi.mocked(prisma.game.findMany).mockResolvedValue([mockGame] as any)

      const injuries = [
        { playerId: 'player1', impact: 'HIGH' as const },
        { playerId: 'player2', impact: 'MEDIUM' as const },
      ]

      const result = await service.getInjuryAdjustedOdds('game1', injuries)

      expect(result).toBeDefined()
      expect(result?.spread).toBeGreaterThan(-3) // Should move toward underdog
    })
  })
})

describe('SurvivorWeatherService', () => {
  let service: SurvivorWeatherService

  beforeEach(() => {
    service = new SurvivorWeatherService()
    vi.clearAllMocks()
  })

  describe('getGameWeather', () => {
    it('should return dome conditions for dome teams', async () => {
      const mockGame = {
        id: 'game1',
        homeTeam: { nflAbbr: 'MIN' }, // Dome team
        week: 10,
      }

      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockGame as any)

      const result = await service.getGameWeather('game1')

      expect(result.conditions).toBe('DOME')
      expect(result.temperature).toBe(72)
      expect(result.windSpeed).toBe(0)
      expect(result.precipitation).toBe(0)
    })

    it('should simulate weather for outdoor teams', async () => {
      const mockGame = {
        id: 'game1',
        homeTeam: { nflAbbr: 'GB' }, // Outdoor cold weather team
        week: 14, // Late season
      }

      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockGame as any)

      const result = await service.getGameWeather('game1')

      expect(result.conditions).toBeDefined()
      expect(result.temperature).toBeLessThan(60) // Cold weather expected
    })
  })

  describe('calculateSurvivorImpact', () => {
    it('should identify high risk in snow conditions', async () => {
      const mockGame = {
        id: 'game1',
        homeTeam: { nflAbbr: 'BUF' },
        week: 15,
      }

      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockGame as any)

      // Mock to return snow conditions
      const getWeatherSpy = vi.spyOn(service, 'getGameWeather')
      getWeatherSpy.mockResolvedValue({
        gameId: 'game1',
        temperature: 25,
        windSpeed: 15,
        precipitation: 80,
        conditions: 'SNOW',
        humidity: 85,
        visibility: 0.5,
        lastUpdated: new Date(),
      })

      const result = await service.calculateSurvivorImpact('game1', -10)

      expect(result.survivorImpact.favoriteRisk).toBe('HIGH')
      expect(result.survivorImpact.underdogBoost).toBeGreaterThan(3)
      expect(result.survivorImpact.recommendation).toContain('avoid')
    })

    it('should show minimal impact in dome conditions', async () => {
      const mockGame = {
        id: 'game1',
        homeTeam: { nflAbbr: 'MIN' },
        week: 10,
      }

      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockGame as any)

      const result = await service.calculateSurvivorImpact('game1', -7)

      expect(result.survivorImpact.favoriteRisk).toBe('LOW')
      expect(result.survivorImpact.underdogBoost).toBe(0)
      expect(result.survivorImpact.recommendation).toContain(
        'Perfect conditions'
      )
    })
  })

  describe('getHistoricalWeatherUpsets', () => {
    it('should return historical upset rates', async () => {
      const result = await service.getHistoricalWeatherUpsets('SNOW', 7)

      expect(result.condition).toBe('SNOW')
      expect(result.upsetRate).toBeGreaterThan(0.2) // Snow has high upset rate
      expect(result.averageScoreDifferential).toBeLessThan(0)
    })
  })

  describe('getBadWeatherTeams', () => {
    it('should identify teams that perform well in bad weather', () => {
      const teams = service.getBadWeatherTeams()

      expect(teams).toContain('BAL') // Strong run game
      expect(teams).toContain('BUF') // Cold weather experience
      expect(teams).toContain('GB') // Lambeau advantage
    })
  })

  describe('getFairWeatherTeams', () => {
    it('should identify teams that struggle in bad weather', () => {
      const teams = service.getFairWeatherTeams()

      expect(teams).toContain('MIA') // Warm weather team
      expect(teams).toContain('ARI') // Desert team
      expect(teams).toContain('NO') // Dome team outdoors
    })
  })
})
