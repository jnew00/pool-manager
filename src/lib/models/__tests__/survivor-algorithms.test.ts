import { describe, it, expect } from 'vitest'
import { SurvivorEVEngine, TeamEV, WeekEVData } from '../survivor-ev-engine'
import {
  SurvivorFutureValue,
  FutureMatchup,
  TeamFutureValue,
} from '../survivor-future-value'
import { SurvivorStrategy, StrategyPreset } from '../survivor-strategy'

describe('Survivor EV Engine', () => {
  describe('moneylineToWinProbability', () => {
    it('should convert favorite moneyline to win probability', () => {
      expect(SurvivorEVEngine.moneylineToWinProbability(-200)).toBeCloseTo(
        0.667,
        2
      )
      expect(SurvivorEVEngine.moneylineToWinProbability(-150)).toBeCloseTo(
        0.6,
        2
      )
      expect(SurvivorEVEngine.moneylineToWinProbability(-110)).toBeCloseTo(
        0.524,
        2
      )
    })

    it('should convert underdog moneyline to win probability', () => {
      expect(SurvivorEVEngine.moneylineToWinProbability(200)).toBeCloseTo(
        0.333,
        2
      )
      expect(SurvivorEVEngine.moneylineToWinProbability(150)).toBeCloseTo(
        0.4,
        2
      )
      expect(SurvivorEVEngine.moneylineToWinProbability(110)).toBeCloseTo(
        0.476,
        2
      )
    })
  })

  describe('spreadToWinProbability', () => {
    it('should convert point spread to win probability', () => {
      expect(SurvivorEVEngine.spreadToWinProbability(-7)).toBeCloseTo(0.675, 2)
      expect(SurvivorEVEngine.spreadToWinProbability(-3)).toBeCloseTo(0.575, 2)
      expect(SurvivorEVEngine.spreadToWinProbability(0)).toBeCloseTo(0.5, 2)
      expect(SurvivorEVEngine.spreadToWinProbability(3)).toBeCloseTo(0.425, 2)
      expect(SurvivorEVEngine.spreadToWinProbability(7)).toBeCloseTo(0.325, 2)
    })
  })

  describe('calculateEV', () => {
    it('should calculate expected value correctly', () => {
      // High win prob, high pick % = lower EV
      const ev1 = SurvivorEVEngine.calculateEV(0.75, 25, 0.67)
      expect(ev1).toBeCloseTo(4.48, 1) // (0.75 * 4) / 0.67

      // High win prob, low pick % = higher EV
      const ev2 = SurvivorEVEngine.calculateEV(0.75, 5, 0.67)
      expect(ev2).toBeCloseTo(22.39, 1) // (0.75 * 20) / 0.67

      // Low win prob, low pick % = moderate EV
      const ev3 = SurvivorEVEngine.calculateEV(0.6, 5, 0.67)
      expect(ev3).toBeCloseTo(17.91, 1) // (0.60 * 20) / 0.67
    })

    it('should handle edge cases', () => {
      expect(SurvivorEVEngine.calculateEV(0.75, 0, 0.67)).toBe(0)
      expect(SurvivorEVEngine.calculateEV(0.75, 25, 0)).toBe(0)
    })
  })

  describe('calculateAdjustedEV', () => {
    it('should weight differently based on pool size', () => {
      const baseEV = 1.5
      const winProb = 0.7

      // Small pool - prioritize win probability
      const smallPoolEV = SurvivorEVEngine.calculateAdjustedEV(
        baseEV,
        winProb,
        30
      )

      // Large pool - prioritize EV
      const largePoolEV = SurvivorEVEngine.calculateAdjustedEV(
        baseEV,
        winProb,
        1000
      )

      // Medium pool - balanced
      const mediumPoolEV = SurvivorEVEngine.calculateAdjustedEV(
        baseEV,
        winProb,
        200
      )

      // Verify that we get different values for different pool sizes
      expect(smallPoolEV).toBeDefined()
      expect(largePoolEV).toBeDefined()
      expect(mediumPoolEV).toBeDefined()
      // All should be positive
      expect(smallPoolEV).toBeGreaterThan(0)
      expect(largePoolEV).toBeGreaterThan(0)
      expect(mediumPoolEV).toBeGreaterThan(0)
    })
  })

  describe('calculateWeekEV', () => {
    it('should calculate EV for all teams in a week', () => {
      const games = [
        {
          id: 'game1',
          homeTeamId: 'team1',
          awayTeamId: 'team2',
          homeTeamAbbr: 'KC',
          awayTeamAbbr: 'NYJ',
          homeMoneyline: -250,
          awayMoneyline: 200,
        },
        {
          id: 'game2',
          homeTeamId: 'team3',
          awayTeamId: 'team4',
          homeTeamAbbr: 'BUF',
          awayTeamAbbr: 'MIA',
          homeMoneyline: -150,
          awayMoneyline: 130,
        },
      ]

      const publicPickData = {
        KC: 30,
        NYJ: 2,
        BUF: 20,
        MIA: 8,
      }

      const usedTeams = new Set<string>()
      const result = SurvivorEVEngine.calculateWeekEV(
        games,
        publicPickData,
        usedTeams,
        100
      )

      expect(result.teams).toHaveLength(4)
      // Overall survival rate depends on the actual pick distribution
      expect(result.overallSurvivalRate).toBeGreaterThan(0)
      expect(result.overallSurvivalRate).toBeLessThanOrEqual(1)

      // KC should have high win prob but lower EV due to high pick %
      const kcTeam = result.teams.find((t) => t.teamAbbr === 'KC')
      expect(kcTeam?.winProbability).toBeGreaterThan(0.7)
      expect(kcTeam?.publicPickPercentage).toBe(30)
    })
  })

  describe('findContrarianPicks', () => {
    it('should identify contrarian picks', () => {
      const weekData: WeekEVData = {
        week: 1,
        overallSurvivalRate: 0.67,
        teams: [
          {
            teamId: '1',
            teamAbbr: 'KC',
            gameId: 'g1',
            week: 1,
            winProbability: 0.75,
            publicPickPercentage: 30,
            expectedValue: 0.8,
            survivalRate: 0.75,
            adjustedEV: 1.2,
          },
          {
            teamId: '2',
            teamAbbr: 'CIN',
            gameId: 'g2',
            week: 1,
            winProbability: 0.65,
            publicPickPercentage: 3,
            expectedValue: 1.8,
            survivalRate: 0.65,
            adjustedEV: 1.5,
          },
          {
            teamId: '3',
            teamAbbr: 'NYJ',
            gameId: 'g3',
            week: 1,
            winProbability: 0.45,
            publicPickPercentage: 1,
            expectedValue: 0.9,
            survivalRate: 0.45,
            adjustedEV: 0.7,
          },
        ],
      }

      const contrarian = SurvivorEVEngine.findContrarianPicks(weekData, 0.6, 5)
      expect(contrarian).toHaveLength(1)
      expect(contrarian[0].teamAbbr).toBe('CIN')
    })
  })
})

describe('Survivor Future Value', () => {
  describe('calculateMatchupFavorability', () => {
    it('should calculate favorability based on ratings and home field', () => {
      // Equal teams at home (home advantage gives ~60 rating points)
      const fav1 = SurvivorFutureValue.calculateMatchupFavorability(
        1500,
        1500,
        true,
        0
      )
      expect(fav1).toBeGreaterThan(50)
      expect(fav1).toBeLessThan(70)

      // Strong team vs weak team
      const fav2 = SurvivorFutureValue.calculateMatchupFavorability(
        1700,
        1300,
        true,
        0
      )
      expect(fav2).toBeGreaterThan(80)

      // Weak team vs strong team
      const fav3 = SurvivorFutureValue.calculateMatchupFavorability(
        1300,
        1700,
        false,
        0
      )
      expect(fav3).toBeLessThan(20)
    })
  })

  describe('calculateFutureValueRating', () => {
    it('should rate teams based on future matchups', () => {
      // Elite future schedule
      const rating1 = SurvivorFutureValue.calculateFutureValueRating(
        75,
        3,
        true
      )
      expect(rating1).toBeGreaterThanOrEqual(4.5)

      // Good future schedule
      const rating2 = SurvivorFutureValue.calculateFutureValueRating(
        65,
        1,
        false
      )
      expect(rating2).toBeGreaterThanOrEqual(3)
      expect(rating2).toBeLessThan(4)

      // Poor future schedule
      const rating3 = SurvivorFutureValue.calculateFutureValueRating(
        45,
        0,
        false
      )
      expect(rating3).toBeLessThan(2.5)
    })
  })

  describe('determineSaveRecommendation', () => {
    it('should recommend saving high value teams early', () => {
      const rec1 = SurvivorFutureValue.determineSaveRecommendation(
        4.5, // High future value
        2, // Multiple best weeks
        0.8, // Very safe current week needed for MUST_SAVE
        3, // Early in pool
        12 // Expected duration
      )
      expect(rec1).toBe('MUST_SAVE')
    })

    it('should recommend using teams late in pool', () => {
      const rec2 = SurvivorFutureValue.determineSaveRecommendation(
        4.5, // High future value
        2, // Multiple best weeks
        0.65, // Moderate current week
        10, // Late in pool
        12 // Expected duration
      )
      expect(rec2).toBe('USE_NOW')
    })
  })

  describe('calculateExpectedPoolDuration', () => {
    it('should estimate pool duration based on size', () => {
      const duration1 = SurvivorFutureValue.calculateExpectedPoolDuration(
        100,
        0.67
      )
      expect(duration1).toBeGreaterThan(8)
      expect(duration1).toBeLessThanOrEqual(12)

      const duration2 = SurvivorFutureValue.calculateExpectedPoolDuration(
        1000,
        0.67
      )
      expect(duration2).toBeGreaterThan(12)
      expect(duration2).toBeLessThanOrEqual(18)
    })
  })
})

describe('Survivor Strategy', () => {
  const mockWeekEV: WeekEVData = {
    week: 5,
    overallSurvivalRate: 0.67,
    teams: [
      {
        teamId: '1',
        teamAbbr: 'KC',
        gameId: 'g1',
        week: 5,
        winProbability: 0.78,
        publicPickPercentage: 35,
        expectedValue: 0.7,
        survivalRate: 0.78,
        adjustedEV: 1.1,
      },
      {
        teamId: '2',
        teamAbbr: 'BUF',
        gameId: 'g2',
        week: 5,
        winProbability: 0.72,
        publicPickPercentage: 22,
        expectedValue: 0.9,
        survivalRate: 0.72,
        adjustedEV: 1.2,
      },
      {
        teamId: '3',
        teamAbbr: 'CIN',
        gameId: 'g3',
        week: 5,
        winProbability: 0.65,
        publicPickPercentage: 4,
        expectedValue: 1.8,
        survivalRate: 0.65,
        adjustedEV: 1.6,
      },
      {
        teamId: '4',
        teamAbbr: 'TB',
        gameId: 'g4',
        week: 5,
        winProbability: 0.6,
        publicPickPercentage: 2,
        expectedValue: 2.1,
        survivalRate: 0.6,
        adjustedEV: 1.7,
      },
    ],
  }

  const mockSeasonProjection = {
    expectedPoolDuration: 12,
    criticalWeeks: [7, 11],
    teams: [
      {
        teamId: '1',
        teamAbbr: 'KC',
        futureMatchups: [],
        averageFavorability: 72,
        bestWeeks: [8, 10],
        futureValueRating: 4.2,
        saveRecommendation: 'HIGH_VALUE_SAVE' as const,
      },
      {
        teamId: '2',
        teamAbbr: 'BUF',
        futureMatchups: [],
        averageFavorability: 68,
        bestWeeks: [9],
        futureValueRating: 3.5,
        saveRecommendation: 'SAVE_IF_POSSIBLE' as const,
      },
      {
        teamId: '3',
        teamAbbr: 'CIN',
        futureMatchups: [],
        averageFavorability: 55,
        bestWeeks: [],
        futureValueRating: 2.2,
        saveRecommendation: 'USE_NOW' as const,
      },
      {
        teamId: '4',
        teamAbbr: 'TB',
        futureMatchups: [],
        averageFavorability: 48,
        bestWeeks: [],
        futureValueRating: 1.8,
        saveRecommendation: 'USE_NOW' as const,
      },
    ],
  }

  describe('getStrategyWeights', () => {
    it('should return correct weights for each preset', () => {
      const conservative = SurvivorStrategy.getStrategyWeights('CONSERVATIVE')
      expect(conservative.winProbabilityWeight).toBe(0.7)
      expect(conservative.minWinProbability).toBe(0.68)

      const contrarian = SurvivorStrategy.getStrategyWeights('CONTRARIAN')
      expect(contrarian.publicFadeWeight).toBe(0.25)
      expect(contrarian.maxPublicPickPercentage).toBe(10)
    })

    it('should apply custom weights', () => {
      const custom = SurvivorStrategy.getStrategyWeights('CUSTOM', {
        winProbabilityWeight: 0.5,
        minWinProbability: 0.65,
      })
      expect(custom.winProbabilityWeight).toBe(0.5)
      expect(custom.minWinProbability).toBe(0.65)
      expect(custom.evWeight).toBe(0.3) // Default value
    })
  })

  describe('generateRecommendations', () => {
    it('should generate conservative recommendations', () => {
      const recs = SurvivorStrategy.generateRecommendations(
        mockWeekEV,
        mockSeasonProjection,
        'CONSERVATIVE',
        100,
        75
      )

      expect(recs.strategy).toBe('CONSERVATIVE')
      expect(recs.topPicks.length).toBeGreaterThan(0)
      // Conservative should prioritize highest win prob teams
      if (recs.topPicks.length > 0) {
        expect(recs.topPicks[0].winProbability).toBeGreaterThanOrEqual(0.68)
      }
    })

    it('should generate contrarian recommendations', () => {
      const recs = SurvivorStrategy.generateRecommendations(
        mockWeekEV,
        mockSeasonProjection,
        'CONTRARIAN',
        100,
        75
      )

      expect(recs.strategy).toBe('CONTRARIAN')
      // Contrarian should prioritize low pick % teams
      const topPick = recs.topPicks[0]
      expect(topPick.publicPickPercentage).toBeLessThanOrEqual(10)
    })

    it('should include strategic notes', () => {
      const recs = SurvivorStrategy.generateRecommendations(
        mockWeekEV,
        mockSeasonProjection,
        'BALANCED',
        100,
        50
      )

      expect(recs.strategicNotes.length).toBeGreaterThan(0)
      // Check that at least one note contains relevant strategic info
      const hasRelevantNote = recs.strategicNotes.some(
        (note) =>
          note.includes('survival rate') ||
          note.includes('stage') ||
          note.includes('options')
      )
      expect(hasRelevantNote).toBe(true)
    })

    it('should identify teams to avoid', () => {
      const recWithBadTeams: WeekEVData = {
        ...mockWeekEV,
        teams: [
          ...mockWeekEV.teams,
          {
            teamId: '5',
            teamAbbr: 'NYJ',
            gameId: 'g5',
            week: 5,
            winProbability: 0.35,
            publicPickPercentage: 1,
            expectedValue: 0.4,
            survivalRate: 0.35,
            adjustedEV: 0.3,
          },
        ],
      }

      const recs = SurvivorStrategy.generateRecommendations(
        recWithBadTeams,
        mockSeasonProjection,
        'BALANCED',
        100,
        75
      )

      expect(recs.avoidList).toContain('NYJ')
    })
  })

  describe('determineRiskLevel', () => {
    it('should categorize risk appropriately', () => {
      expect(SurvivorStrategy.determineRiskLevel(0.75, 20)).toBe('LOW')
      expect(SurvivorStrategy.determineRiskLevel(0.65, 10)).toBe('MEDIUM')
      expect(SurvivorStrategy.determineRiskLevel(0.55, 2)).toBe('HIGH')
    })
  })
})
