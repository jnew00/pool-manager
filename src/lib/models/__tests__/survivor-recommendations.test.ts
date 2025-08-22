import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SurvivorRecommendations } from '../survivor-recommendations'
import { PublicPickService } from '@/server/services/public-pick-service'
import { SurvivorOddsService } from '@/server/services/survivor-odds-service'
import { SurvivorWeatherService } from '@/server/services/survivor-weather-service'
import { SurvivorEVEngine } from '../survivor-ev-engine'
import { SurvivorFutureValue } from '../survivor-future-value'
import { SurvivorStrategy } from '../survivor-strategy'

// Mock services
vi.mock('@/server/services/public-pick-service')
vi.mock('@/server/services/survivor-odds-service')
vi.mock('@/server/services/survivor-weather-service')
vi.mock('../survivor-ev-engine')
vi.mock('../survivor-future-value')
vi.mock('../survivor-strategy')

describe('SurvivorRecommendations', () => {
  let recommender: SurvivorRecommendations

  beforeEach(() => {
    recommender = new SurvivorRecommendations()
    vi.clearAllMocks()
  })

  describe('generateWeekRecommendations', () => {
    it('should generate comprehensive recommendations for a week', async () => {
      // Mock public picks
      vi.mocked(
        PublicPickService.prototype.getPublicPickPercentages
      ).mockResolvedValue({
        week: 5,
        source: 'AGGREGATE',
        teams: [
          { teamAbbr: 'KC', pickPercentage: 35, trend: 'UP' },
          { teamAbbr: 'BUF', pickPercentage: 25, trend: 'STABLE' },
          { teamAbbr: 'PHI', pickPercentage: 15, trend: 'DOWN' },
          { teamAbbr: 'SF', pickPercentage: 10, trend: 'UP' },
        ],
        lastUpdated: new Date(),
      })

      // Mock odds
      vi.mocked(
        SurvivorOddsService.prototype.getWeekMoneylines
      ).mockResolvedValue({
        week: 5,
        games: [
          {
            gameId: 'game1',
            homeTeam: 'KC',
            awayTeam: 'NYJ',
            homeMoneyline: -280,
            awayMoneyline: 230,
            spread: -7,
            homeWinProbability: 0.737,
            awayWinProbability: 0.263,
            source: 'CONSENSUS',
            lastUpdated: new Date(),
          },
          {
            gameId: 'game2',
            homeTeam: 'BUF',
            awayTeam: 'MIA',
            homeMoneyline: -200,
            awayMoneyline: 170,
            spread: -4.5,
            homeWinProbability: 0.667,
            awayWinProbability: 0.333,
            source: 'CONSENSUS',
            lastUpdated: new Date(),
          },
        ],
        lastUpdated: new Date(),
      })

      // Mock weather impacts
      vi.mocked(
        SurvivorWeatherService.prototype.getWeekWeatherImpacts
      ).mockResolvedValue([
        {
          gameId: 'game1',
          temperature: 72,
          windSpeed: 0,
          precipitation: 0,
          conditions: 'DOME',
          humidity: 50,
          visibility: 10,
          lastUpdated: new Date(),
          survivorImpact: {
            favoriteRisk: 'LOW',
            underdogBoost: 0,
            recommendation: 'Perfect conditions in dome',
          },
        },
        {
          gameId: 'game2',
          temperature: 35,
          windSpeed: 20,
          precipitation: 60,
          conditions: 'SNOW',
          humidity: 85,
          visibility: 0.5,
          lastUpdated: new Date(),
          survivorImpact: {
            favoriteRisk: 'HIGH',
            underdogBoost: 4,
            recommendation: 'Avoid heavy favorites - snow expected',
          },
        },
      ])

      // Mock getWeekGames
      const getWeekGamesSpy = vi.spyOn(recommender as any, 'getWeekGames')
      getWeekGamesSpy.mockResolvedValue([
        {
          id: 'game1',
          week: 5,
          homeTeamId: 'team1',
          awayTeamId: 'team2',
          homeTeam: { id: 'team1', nflAbbr: 'KC' },
          awayTeam: { id: 'team2', nflAbbr: 'NYJ' },
        },
        {
          id: 'game2',
          week: 5,
          homeTeamId: 'team3',
          awayTeamId: 'team4',
          homeTeam: { id: 'team3', nflAbbr: 'BUF' },
          awayTeam: { id: 'team4', nflAbbr: 'MIA' },
        },
      ])

      // Mock strategy recommendations
      vi.mocked(SurvivorStrategy.generateRecommendations).mockReturnValue({
        topPicks: [
          {
            teamId: 'team1',
            teamAbbr: 'KC',
            gameId: 'game1',
            week: 5,
            compositeScore: 0.85,
            confidence: 85,
            evScore: 1.2,
            futureValueScore: 3,
            winProbability: 0.737,
            publicPickPercentage: 35,
            reasoning: 'High win probability with good value',
          },
          {
            teamId: 'team3',
            teamAbbr: 'PHI',
            gameId: 'game3',
            week: 5,
            compositeScore: 0.75,
            confidence: 75,
            evScore: 1.5,
            futureValueScore: 4,
            winProbability: 0.68,
            publicPickPercentage: 15,
            reasoning: 'Great contrarian play',
          },
        ],
        reasoning: 'Balanced approach for week 5',
      })

      // Mock odds movement
      vi.mocked(
        SurvivorOddsService.prototype.getOddsMovement
      ).mockResolvedValue([
        {
          gameId: 'game1',
          timestamp: new Date(),
          homeMoneyline: -280,
          awayMoneyline: 230,
          spread: -7,
          direction: 'HOME_IMPROVING',
          magnitude: 'MINOR',
        },
      ])

      // Mock season projection
      vi.mocked(SurvivorFutureValue.generateSeasonProjection).mockReturnValue({
        criticalWeeks: [7, 12, 15],
        teams: [
          {
            teamId: 'team1',
            teamAbbr: 'KC',
            futureValue: 4.5,
            rating: 1750,
            bestWeeks: [8, 10, 14],
            difficultWeeks: [7, 12],
            optimalUsageWeek: 8,
          },
        ],
      })

      const usedTeams = new Set(['SF', 'DAL'])
      const result = await recommender.generateWeekRecommendations(
        'pool1',
        5,
        usedTeams,
        'BALANCED',
        100,
        75
      )

      // Verify structure
      expect(result).toHaveProperty('week', 5)
      expect(result).toHaveProperty('poolId', 'pool1')
      expect(result).toHaveProperty('survivorsRemaining', 75)
      expect(result).toHaveProperty('strategy', 'BALANCED')
      expect(result).toHaveProperty('primaryPick')
      expect(result).toHaveProperty('alternativePicks')
      expect(result).toHaveProperty('avoidList')
      expect(result).toHaveProperty('weekOverview')
      expect(result).toHaveProperty('strategicInsights')

      // Verify primary pick
      expect(result.primaryPick).toHaveProperty('teamAbbr')
      expect(result.primaryPick).toHaveProperty('compositeScore')
      expect(result.primaryPick).toHaveProperty('finalConfidence')
      expect(result.primaryPick).toHaveProperty('narrativeFactors')

      // Verify week overview
      expect(result.weekOverview).toHaveProperty('difficulty')
      expect(result.weekOverview).toHaveProperty('bestValue')
      expect(result.weekOverview).toHaveProperty('safestPick')
      expect(result.weekOverview).toHaveProperty('contrarianPlay')
      expect(result.weekOverview).toHaveProperty('weatherConcerns')

      // Verify insights
      expect(result.strategicInsights).toBeInstanceOf(Array)
      expect(result.strategicInsights.length).toBeGreaterThan(0)
    })

    it('should filter out used teams', async () => {
      // Setup mocks
      vi.mocked(
        PublicPickService.prototype.getPublicPickPercentages
      ).mockResolvedValue({
        week: 5,
        source: 'AGGREGATE',
        teams: [
          { teamAbbr: 'KC', pickPercentage: 35, trend: 'UP' },
          { teamAbbr: 'BUF', pickPercentage: 25, trend: 'STABLE' },
        ],
        lastUpdated: new Date(),
      })

      vi.mocked(
        SurvivorOddsService.prototype.getWeekMoneylines
      ).mockResolvedValue({
        week: 5,
        games: [
          {
            gameId: 'game1',
            homeTeam: 'KC',
            awayTeam: 'NYJ',
            homeMoneyline: -280,
            awayMoneyline: 230,
            spread: -7,
            homeWinProbability: 0.737,
            awayWinProbability: 0.263,
            source: 'CONSENSUS',
            lastUpdated: new Date(),
          },
        ],
        lastUpdated: new Date(),
      })

      vi.mocked(
        SurvivorWeatherService.prototype.getWeekWeatherImpacts
      ).mockResolvedValue([])

      const getWeekGamesSpy = vi.spyOn(recommender as any, 'getWeekGames')
      getWeekGamesSpy.mockResolvedValue([
        {
          id: 'game1',
          week: 5,
          homeTeamId: 'team1',
          awayTeamId: 'team2',
          homeTeam: { id: 'team1', nflAbbr: 'KC' },
          awayTeam: { id: 'team2', nflAbbr: 'NYJ' },
        },
      ])

      // Mock strategy to return KC as top pick
      vi.mocked(SurvivorStrategy.generateRecommendations).mockReturnValue({
        topPicks: [
          {
            teamId: 'team2',
            teamAbbr: 'NYJ',
            gameId: 'game1',
            week: 5,
            compositeScore: 0.4,
            confidence: 40,
            evScore: 0.5,
            futureValueScore: 2,
            winProbability: 0.263,
            publicPickPercentage: 1,
            reasoning: 'Only available team',
          },
        ],
        reasoning: 'Limited options',
      })

      const usedTeams = new Set(['team1']) // KC already used
      const result = await recommender.generateWeekRecommendations(
        'pool1',
        5,
        usedTeams,
        'BALANCED',
        100,
        75
      )

      // Verify KC was filtered out
      expect(result.primaryPick.teamAbbr).not.toBe('KC')
      expect(result.primaryPick.teamId).not.toBe('team1')
    })
  })

  describe('applyLLMAdjustments', () => {
    it('should apply bounded adjustments based on narrative factors', async () => {
      const recommendations = [
        {
          teamId: 'team1',
          teamAbbr: 'KC',
          gameId: 'game1',
          week: 5,
          compositeScore: 0.8,
          confidence: 80,
          evScore: 1.2,
          futureValueScore: 4,
          winProbability: 0.737,
          publicPickPercentage: 35,
          reasoning: 'Strong favorite',
          narrativeFactors: {
            momentum: 'Team on 3-game winning streak',
            primetime: 'Sunday Night Football - national spotlight',
            injuries: undefined,
            revenge: undefined,
            lookahead: undefined,
            historical: '5-0 in last 5 meetings with opponent',
          },
          finalConfidence: 80,
        },
        {
          teamId: 'team2',
          teamAbbr: 'BUF',
          gameId: 'game2',
          week: 5,
          compositeScore: 0.7,
          confidence: 70,
          evScore: 1.0,
          futureValueScore: 3,
          winProbability: 0.667,
          publicPickPercentage: 25,
          reasoning: 'Solid pick',
          narrativeFactors: {
            momentum: 'Lost 2 of last 3 games',
            injuries: 'Missing key player on defense',
            lookahead: 'Potential lookahead to division rival next week',
          },
          finalConfidence: 70,
        },
      ]

      const result = await (recommender as any).applyLLMAdjustments(
        recommendations
      )

      // Verify adjustments
      expect(result[0].llmAdjustment).toBeDefined()
      expect(result[0].llmAdjustment?.reasoning).toContain('winning streak')
      expect(result[0].llmAdjustment?.reasoning).toContain('Primetime')
      expect(result[0].compositeScore).toBeGreaterThan(0.8) // Should increase

      expect(result[1].llmAdjustment).toBeDefined()
      // Check that at least one negative factor is mentioned
      const hasNegativeFactor =
        result[1].llmAdjustment?.reasoning.includes('struggling') ||
        result[1].llmAdjustment?.reasoning.includes('Missing key') ||
        result[1].llmAdjustment?.reasoning.includes('lookahead')
      expect(hasNegativeFactor).toBe(true)
      expect(result[1].compositeScore).toBeLessThan(0.7) // Should decrease

      // Verify bounded adjustments (max ±15%)
      expect(result[0].compositeScore).toBeLessThanOrEqual(0.8 * 1.15)
      expect(result[1].compositeScore).toBeGreaterThanOrEqual(0.7 * 0.85)

      // Verify sorting by adjusted score
      expect(result[0].compositeScore).toBeGreaterThan(result[1].compositeScore)
    })

    it('should not exceed adjustment bounds', async () => {
      const recommendation = {
        teamId: 'team1',
        teamAbbr: 'KC',
        gameId: 'game1',
        week: 5,
        compositeScore: 0.8,
        confidence: 80,
        evScore: 1.2,
        futureValueScore: 4,
        winProbability: 0.737,
        publicPickPercentage: 35,
        reasoning: 'Strong favorite',
        narrativeFactors: {
          momentum: 'Team on 5-game winning streak',
          primetime: 'Monday Night Football',
          revenge: 'Lost to opponent in playoffs',
          historical: '10-0 in last 10 meetings',
        },
        finalConfidence: 80,
      }

      const result = await (recommender as any).applyLLMAdjustments([
        recommendation,
      ])

      // Even with many positive factors, should not exceed 15% boost
      expect(result[0].compositeScore).toBeLessThanOrEqual(0.8 * 1.15)
      expect(result[0].compositeScore).toBeGreaterThanOrEqual(0.8)
    })
  })

  describe('buildAvoidList', () => {
    it('should identify teams to avoid with specific reasons', () => {
      const weekEV = {
        week: 5,
        overallSurvivalRate: 0.75,
        teams: [
          {
            teamId: 'team1',
            teamAbbr: 'NYJ',
            gameId: 'game1',
            week: 5,
            winProbability: 0.35,
            publicPickPercentage: 2,
            expectedValue: 0.3,
            survivalRate: 0.35,
            adjustedEV: 0.25,
          },
          {
            teamId: 'team2',
            teamAbbr: 'MIA',
            gameId: 'game2',
            week: 5,
            winProbability: 0.65,
            publicPickPercentage: 40,
            expectedValue: 0.4,
            survivalRate: 0.65,
            adjustedEV: 0.35,
          },
          {
            teamId: 'team3',
            teamAbbr: 'KC',
            gameId: 'game3',
            week: 5,
            winProbability: 0.75,
            publicPickPercentage: 35,
            expectedValue: 1.2,
            survivalRate: 0.75,
            adjustedEV: 1.3,
          },
        ],
      }

      const weatherImpacts = [
        {
          gameId: 'game2',
          temperature: 30,
          windSpeed: 25,
          precipitation: 70,
          conditions: 'SNOW' as const,
          humidity: 90,
          visibility: 0.3,
          lastUpdated: new Date(),
          survivorImpact: {
            favoriteRisk: 'HIGH' as const,
            underdogBoost: 5,
            recommendation: 'Avoid favorites',
          },
        },
      ]

      const recommendations = [
        {
          teamId: 'team3',
          teamAbbr: 'KC',
          gameId: 'game3',
          week: 5,
          compositeScore: 0.85,
          confidence: 85,
          evScore: 1.2,
          futureValueScore: 4,
          winProbability: 0.75,
          publicPickPercentage: 35,
          reasoning: 'Top pick',
          narrativeFactors: {},
          finalConfidence: 85,
        },
      ]

      const result = (recommender as any).buildAvoidList(
        weekEV,
        weatherImpacts,
        recommendations
      )

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)

      // Should avoid NYJ for low win probability
      const nyjAvoid = result.find((a) => a.teamAbbr === 'NYJ')
      expect(nyjAvoid).toBeDefined()
      expect(nyjAvoid?.reason).toContain('Low win probability')

      // Should avoid MIA for being too popular relative to win probability
      const miaAvoid = result.find((a) => a.teamAbbr === 'MIA')
      expect(miaAvoid).toBeDefined()
      expect(miaAvoid?.reason).toMatch(/popular|weather/)
    })
  })

  describe('analyzeWeekDifficulty', () => {
    it('should correctly assess week difficulty', () => {
      const weekEVEasy = {
        week: 5,
        overallSurvivalRate: 0.82,
        teams: Array(10)
          .fill(null)
          .map((_, i) => ({
            teamId: `team${i}`,
            teamAbbr: `T${i}`,
            gameId: `game${i}`,
            week: 5,
            winProbability: 0.7 + i * 0.01,
            publicPickPercentage: 10,
            expectedValue: 1.2,
            survivalRate: 0.7,
            adjustedEV: 1.3,
          })),
      }

      const result = (recommender as any).analyzeWeekDifficulty(
        weekEVEasy,
        [],
        { teams: [] }
      )

      expect(result.difficulty).toBe('EASY')
      expect(result.bestValue).toBeDefined()
      expect(result.safestPick).toBeDefined()
    })

    it('should identify critical weeks', () => {
      const weekEVCritical = {
        week: 14,
        overallSurvivalRate: 0.58,
        teams: [
          {
            teamId: 'team1',
            teamAbbr: 'KC',
            gameId: 'game1',
            week: 14,
            winProbability: 0.62,
            publicPickPercentage: 45,
            expectedValue: 0.8,
            survivalRate: 0.62,
            adjustedEV: 0.7,
          },
          {
            teamId: 'team2',
            teamAbbr: 'BUF',
            gameId: 'game2',
            week: 14,
            winProbability: 0.58,
            publicPickPercentage: 35,
            expectedValue: 0.9,
            survivalRate: 0.58,
            adjustedEV: 0.85,
          },
        ],
      }

      const result = (recommender as any).analyzeWeekDifficulty(
        weekEVCritical,
        [],
        { teams: [] }
      )

      expect(result.difficulty).toBe('CRITICAL')
    })

    it('should identify contrarian opportunities', () => {
      const weekEV = {
        week: 5,
        overallSurvivalRate: 0.75,
        teams: [
          {
            teamId: 'team1',
            teamAbbr: 'IND',
            gameId: 'game1',
            week: 5,
            winProbability: 0.63,
            publicPickPercentage: 3,
            expectedValue: 1.8,
            survivalRate: 0.63,
            adjustedEV: 2.0,
          },
        ],
      }

      const result = (recommender as any).analyzeWeekDifficulty(weekEV, [], {
        teams: [],
      })

      expect(result.contrarianPlay).toBe('IND')
    })
  })

  describe('generateStrategicInsights', () => {
    it('should generate relevant insights based on pool state', () => {
      const weekEV = {
        week: 8,
        overallSurvivalRate: 0.72,
        teams: [
          {
            teamId: 'team1',
            teamAbbr: 'KC',
            gameId: 'game1',
            week: 8,
            winProbability: 0.63,
            publicPickPercentage: 2.5,
            expectedValue: 1.9,
            survivalRate: 0.63,
            adjustedEV: 2.1,
          },
        ],
      }

      const seasonProjection = {
        criticalWeeks: [9, 12, 15],
        teams: [],
      }

      const weatherImpacts = [
        {
          gameId: 'game1',
          temperature: 25,
          windSpeed: 20,
          precipitation: 60,
          conditions: 'SNOW' as const,
          humidity: 85,
          visibility: 0.5,
          lastUpdated: new Date(),
          survivorImpact: {
            favoriteRisk: 'HIGH' as const,
            underdogBoost: 4,
            recommendation: 'Avoid favorites',
          },
        },
      ]

      // Early pool stage
      let insights = (recommender as any).generateStrategicInsights(
        8,
        80,
        100,
        weekEV,
        seasonProjection,
        weatherImpacts
      )
      expect(insights.some((i) => i.includes('Early pool stage'))).toBe(true)
      expect(
        insights.some((i) => i.includes('Critical week 9 approaching'))
      ).toBe(true)
      expect(insights.some((i) => i.includes('weather risk'))).toBe(true)
      expect(insights.some((i) => i.includes('Contrarian opportunity'))).toBe(
        true
      )

      // Late pool stage
      insights = (recommender as any).generateStrategicInsights(
        8,
        25,
        100,
        weekEV,
        seasonProjection,
        []
      )
      expect(insights.some((i) => i.includes('Late pool stage'))).toBe(true)

      // Large pool
      insights = (recommender as any).generateStrategicInsights(
        8,
        400,
        600,
        weekEV,
        seasonProjection,
        []
      )
      expect(insights.some((i) => i.includes('Large pool'))).toBe(true)
      expect(insights.some((i) => i.includes('differentiation'))).toBe(true)

      // Small pool
      insights = (recommender as any).generateStrategicInsights(
        8,
        30,
        40,
        weekEV,
        seasonProjection,
        []
      )
      expect(insights.some((i) => i.includes('Small pool'))).toBe(true)
      expect(insights.some((i) => i.includes('survival'))).toBe(true)
    })
  })

  describe('integration scenarios', () => {
    it('should handle different strategy presets correctly', async () => {
      // Setup base mocks
      vi.mocked(
        PublicPickService.prototype.getPublicPickPercentages
      ).mockResolvedValue({
        week: 5,
        source: 'AGGREGATE',
        teams: [
          { teamAbbr: 'KC', pickPercentage: 35, trend: 'UP' },
          { teamAbbr: 'PHI', pickPercentage: 8, trend: 'DOWN' },
        ],
        lastUpdated: new Date(),
      })

      vi.mocked(
        SurvivorOddsService.prototype.getWeekMoneylines
      ).mockResolvedValue({
        week: 5,
        games: [],
        lastUpdated: new Date(),
      })

      vi.mocked(
        SurvivorWeatherService.prototype.getWeekWeatherImpacts
      ).mockResolvedValue([])

      const getWeekGamesSpy = vi.spyOn(recommender as any, 'getWeekGames')
      getWeekGamesSpy.mockResolvedValue([])

      // Test CONSERVATIVE strategy
      vi.mocked(SurvivorStrategy.generateRecommendations).mockReturnValue({
        topPicks: [
          {
            teamId: 'team1',
            teamAbbr: 'KC',
            gameId: 'game1',
            week: 5,
            compositeScore: 0.9,
            confidence: 90,
            evScore: 0.9,
            futureValueScore: 3,
            winProbability: 0.78,
            publicPickPercentage: 35,
            reasoning: 'Safest pick - highest win probability',
          },
        ],
        reasoning: 'Conservative approach prioritizing safety',
      })

      let result = await recommender.generateWeekRecommendations(
        'pool1',
        5,
        new Set(),
        'CONSERVATIVE',
        100,
        75
      )
      expect(result.strategy).toBe('CONSERVATIVE')
      expect(result.primaryPick.winProbability).toBeGreaterThan(0.75)

      // Test CONTRARIAN strategy
      vi.mocked(SurvivorStrategy.generateRecommendations).mockReturnValue({
        topPicks: [
          {
            teamId: 'team2',
            teamAbbr: 'PHI',
            gameId: 'game2',
            week: 5,
            compositeScore: 0.75,
            confidence: 75,
            evScore: 1.8,
            futureValueScore: 4,
            winProbability: 0.64,
            publicPickPercentage: 8,
            reasoning: 'Low ownership with decent safety',
          },
        ],
        reasoning: 'Contrarian play for differentiation',
      })

      result = await recommender.generateWeekRecommendations(
        'pool1',
        5,
        new Set(),
        'CONTRARIAN',
        100,
        75
      )
      expect(result.strategy).toBe('CONTRARIAN')
      expect(result.primaryPick.publicPickPercentage).toBeLessThan(10)
    })

    it('should adapt to pool size', async () => {
      // Setup mocks
      vi.mocked(
        PublicPickService.prototype.getPublicPickPercentages
      ).mockResolvedValue({
        week: 5,
        source: 'AGGREGATE',
        teams: [],
        lastUpdated: new Date(),
      })

      vi.mocked(
        SurvivorOddsService.prototype.getWeekMoneylines
      ).mockResolvedValue({
        week: 5,
        games: [],
        lastUpdated: new Date(),
      })

      vi.mocked(
        SurvivorWeatherService.prototype.getWeekWeatherImpacts
      ).mockResolvedValue([])

      const getWeekGamesSpy = vi.spyOn(recommender as any, 'getWeekGames')
      getWeekGamesSpy.mockResolvedValue([])

      vi.mocked(SurvivorStrategy.generateRecommendations).mockReturnValue({
        topPicks: [],
        reasoning: 'Adaptive strategy',
      })

      // Small pool - should prioritize survival
      let result = await recommender.generateWeekRecommendations(
        'pool1',
        5,
        new Set(),
        'BALANCED',
        30,
        25
      )
      expect(
        result.strategicInsights.some((i) => i.includes('Small pool'))
      ).toBe(true)

      // Large pool - should prioritize differentiation
      result = await recommender.generateWeekRecommendations(
        'pool1',
        5,
        new Set(),
        'BALANCED',
        1000,
        750
      )
      expect(
        result.strategicInsights.some((i) => i.includes('Large pool'))
      ).toBe(true)
    })
  })
})
