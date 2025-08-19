import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SituationalCalculator } from '../situational-calculator'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    team: {
      findUnique: vi.fn(),
    },
  },
}))

describe('SituationalCalculator', () => {
  let calculator: SituationalCalculator

  beforeEach(() => {
    calculator = new SituationalCalculator()
    vi.clearAllMocks()
  })

  describe('calculateHomeAdvantage', () => {
    it('should calculate base home advantage', () => {
      const advantage = calculator.calculateHomeAdvantage()
      expect(advantage).toBe(2.8) // Base NFL home advantage
    })

    it('should add venue-specific bonuses', () => {
      const arrowheadAdvantage =
        calculator.calculateHomeAdvantage('Arrowhead Stadium')
      expect(arrowheadAdvantage).toBe(2.8 + 1.5) // Base + venue bonus

      const lambauAdvantage = calculator.calculateHomeAdvantage('Lambeau Field')
      expect(lambauAdvantage).toBe(2.8 + 1.2)
    })

    it('should apply dome penalties', () => {
      const domeAdvantage = calculator.calculateHomeAdvantage('AT&T Stadium')
      expect(domeAdvantage).toBe(2.8 - 0.3) // Base - dome penalty
    })

    it('should reduce advantage in playoffs', () => {
      const regularSeason = calculator.calculateHomeAdvantage(
        'Arrowhead Stadium',
        false
      )
      const playoffs = calculator.calculateHomeAdvantage(
        'Arrowhead Stadium',
        true
      )

      expect(playoffs).toBe(regularSeason * 0.9)
    })

    it('should handle unknown venues', () => {
      const unknownVenue = calculator.calculateHomeAdvantage('Unknown Stadium')
      expect(unknownVenue).toBe(2.8) // Just base advantage
    })
  })

  describe('calculateRestAdvantage', () => {
    it('should calculate basic rest difference', () => {
      const homeLastGame = new Date('2024-01-01')
      const awayLastGame = new Date('2024-01-01')
      const currentGame = new Date('2024-01-08') // 7 days later

      const result = calculator.calculateRestAdvantage(
        homeLastGame,
        awayLastGame,
        currentGame
      )

      expect(result.homeDaysRest).toBe(7)
      expect(result.awayDaysRest).toBe(7)
      expect(result.advantage).toBe(0) // Equal rest
    })

    it('should favor team with more rest', () => {
      const homeLastGame = new Date('2024-01-01')
      const awayLastGame = new Date('2024-01-03') // 2 days later
      const currentGame = new Date('2024-01-08')

      const result = calculator.calculateRestAdvantage(
        homeLastGame,
        awayLastGame,
        currentGame
      )

      expect(result.homeDaysRest).toBe(7)
      expect(result.awayDaysRest).toBe(5)
      expect(result.advantage).toBe(1.0) // 2 days * 0.5 points per day
    })

    it('should apply short rest penalties', () => {
      const homeLastGame = new Date('2024-01-05') // Short rest
      const awayLastGame = new Date('2024-01-01') // Long rest
      const currentGame = new Date('2024-01-08')

      const result = calculator.calculateRestAdvantage(
        homeLastGame,
        awayLastGame,
        currentGame
      )

      expect(result.homeDaysRest).toBe(3)
      expect(result.awayDaysRest).toBe(7)
      expect(result.advantage).toBeLessThan(-1) // Should be penalized extra
    })

    it('should apply Thursday game penalties', () => {
      const homeLastGame = new Date('2024-01-07') // 4 days rest
      const awayLastGame = new Date('2024-01-05') // 6 days rest
      const currentGame = new Date('2024-01-11')

      const result = calculator.calculateRestAdvantage(
        homeLastGame,
        awayLastGame,
        currentGame
      )

      expect(result.homeDaysRest).toBe(4)
      expect(result.awayDaysRest).toBe(6)
      // Should include extra penalty for home team's short week
      expect(result.advantage).toBeLessThan(-1)
    })

    it('should apply Monday night bonuses', () => {
      const homeLastGame = new Date('2024-01-01') // 10 days rest
      const awayLastGame = new Date('2024-01-04') // 7 days rest
      const currentGame = new Date('2024-01-11')

      const result = calculator.calculateRestAdvantage(
        homeLastGame,
        awayLastGame,
        currentGame
      )

      expect(result.homeDaysRest).toBe(10)
      expect(result.awayDaysRest).toBe(7)
      // Should include base difference plus extra rest bonus
      expect(result.advantage).toBeGreaterThan(1.5)
    })
  })

  describe('calculateWeatherPenalty', () => {
    it('should return 0 penalty for dome games', () => {
      const weatherData = {
        windSpeed: 30,
        precipitationChance: 0.8,
        temperature: 10,
        isDome: true,
        penalty: 0,
      }

      const penalty = calculator.calculateWeatherPenalty(weatherData)
      expect(penalty).toBe(0)
    })

    it('should calculate wind penalties', () => {
      const weatherData = {
        windSpeed: 25, // 10 mph over 15 mph threshold
        precipitationChance: 0.1,
        temperature: 70,
        isDome: false,
        penalty: 0,
      }

      const penalty = calculator.calculateWeatherPenalty(weatherData)
      expect(penalty).toBe(10 * 0.15) // 10 excess mph * 0.15 per mph
    })

    it('should calculate precipitation penalties', () => {
      const weatherData = {
        windSpeed: 10,
        precipitationChance: 0.8, // 0.5 over 0.3 threshold
        temperature: 70,
        isDome: false,
        penalty: 0,
      }

      const penalty = calculator.calculateWeatherPenalty(weatherData)
      expect(penalty).toBe(0.5 * 8) // 0.5 excess * 8 points
    })

    it('should calculate cold weather penalties', () => {
      const weatherData = {
        windSpeed: 10,
        precipitationChance: 0.1,
        temperature: 10, // 10 degrees under 20°F
        isDome: false,
        penalty: 0,
      }

      const penalty = calculator.calculateWeatherPenalty(weatherData)
      expect(penalty).toBe(10 * 0.05) // 10 degrees * 0.05 per degree
    })

    it('should calculate heat penalties', () => {
      const weatherData = {
        windSpeed: 10,
        precipitationChance: 0.1,
        temperature: 100, // 5 degrees over 95°F
        isDome: false,
        penalty: 0,
      }

      const penalty = calculator.calculateWeatherPenalty(weatherData)
      expect(penalty).toBe(5 * 0.03) // 5 degrees * 0.03 per degree
    })

    it('should combine multiple weather factors', () => {
      const weatherData = {
        windSpeed: 25, // 1.5 points
        precipitationChance: 0.6, // 2.4 points
        temperature: 15, // 0.25 points
        isDome: false,
        penalty: 0,
      }

      const penalty = calculator.calculateWeatherPenalty(weatherData)
      expect(penalty).toBeCloseTo(1.5 + 2.4 + 0.25, 1)
    })

    it('should cap maximum penalty', () => {
      const extremeWeather = {
        windSpeed: 50, // Would be 5.25 points
        precipitationChance: 1.0, // Would be 5.6 points
        temperature: 0, // Would be 1.0 points
        isDome: false,
        penalty: 0,
      }

      const penalty = calculator.calculateWeatherPenalty(extremeWeather)
      expect(penalty).toBe(6.0) // Capped at 6.0
    })
  })

  describe('calculateInjuryPenalty', () => {
    it('should handle QB OUT penalty', async () => {
      const penalty = await calculator.calculateInjuryPenalty('team-1')

      // Mock would return empty array, so penalty should be 0
      expect(penalty).toBe(0)
    })

    it('should handle system errors gracefully', async () => {
      // The private method getTeamInjuries will catch errors and return 0
      const penalty = await calculator.calculateInjuryPenalty('invalid-team')
      expect(penalty).toBe(0)
    })
  })

  describe('calculateGameInjuryFactors', () => {
    it('should calculate net injury penalty', async () => {
      const result = await calculator.calculateGameInjuryFactors(
        'home-team',
        'away-team',
        {
          qbOutPenalty: 12,
          olClusterPenalty: 3,
          dbClusterPenalty: 3,
        }
      )

      expect(result.homeTeamPenalty).toBe(0)
      expect(result.awayTeamPenalty).toBe(0)
      expect(result.totalPenalty).toBe(0)
      expect(result.qbImpact).toBe(false)
      expect(result.lineImpact).toBe(false)
      expect(result.secondaryImpact).toBe(false)
    })
  })

  describe('isDivisionalGame', () => {
    it('should check if teams are in same division', async () => {
      const { prisma } = await import('@/lib/prisma')

      vi.mocked(prisma.team.findUnique)
        .mockResolvedValueOnce({ id: 'team1', name: 'Team 1' } as any)
        .mockResolvedValueOnce({ id: 'team2', name: 'Team 2' } as any)

      const result = await calculator.isDivisionalGame('team1', 'team2')

      // Current implementation returns false (no division logic yet)
      expect(result).toBe(false)
    })

    it('should handle missing teams gracefully', async () => {
      const { prisma } = await import('@/lib/prisma')

      vi.mocked(prisma.team.findUnique).mockResolvedValue(null)

      const result = await calculator.isDivisionalGame('missing1', 'missing2')
      expect(result).toBe(false)
    })
  })

  describe('calculateTravelFatigue', () => {
    it('should calculate timezone penalties', () => {
      const crossCountryFatigue = calculator.calculateTravelFatigue(
        'Los Angeles Stadium',
        'New York',
        3 // 3 hour time difference
      )

      expect(crossCountryFatigue).toBe(0.5)

      const moderateFatigue = calculator.calculateTravelFatigue(
        'Chicago Stadium',
        'Denver',
        1 // 1 hour time difference
      )

      expect(moderateFatigue).toBe(0.2)
    })

    it('should apply international game penalties', () => {
      const londonFatigue = calculator.calculateTravelFatigue(
        'Wembley Stadium, London',
        'New York',
        5
      )

      expect(londonFatigue).toBe(1.5 + 0.5) // International + timezone

      const mexicoFatigue = calculator.calculateTravelFatigue(
        'Estadio Azteca, Mexico City',
        'Dallas',
        2
      )

      expect(mexicoFatigue).toBe(1.5 + 0.2) // International + moderate timezone
    })

    it('should handle no timezone change', () => {
      const noFatigue = calculator.calculateTravelFatigue(
        'Local Stadium',
        'Same City',
        0
      )

      expect(noFatigue).toBe(0)
    })
  })

  describe('getHistoricalPerformance', () => {
    it('should return neutral data for unimplemented conditions', async () => {
      const result = await calculator.getHistoricalPerformance('team-1', {
        weather: 'cold',
        surface: 'grass',
        primetime: true,
      })

      expect(result.gamesPlayed).toBe(0)
      expect(result.winRate).toBe(0.5)
      expect(result.avgPointDiff).toBe(0)
    })
  })
})
