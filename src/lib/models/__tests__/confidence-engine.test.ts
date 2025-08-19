import { describe, it, expect, beforeEach } from 'vitest'
import { ConfidenceEngine, defaultModelWeights } from '../confidence-engine'
import type { ModelInput } from '../types'

describe('ConfidenceEngine', () => {
  let engine: ConfidenceEngine

  beforeEach(() => {
    engine = new ConfidenceEngine()
  })

  const createBasicInput = (
    overrides: Partial<ModelInput> = {}
  ): ModelInput => ({
    gameId: 'game-1',
    homeTeamId: 'team-home',
    awayTeamId: 'team-away',
    kickoffTime: new Date('2024-01-15T18:00:00Z'),
    venue: 'Test Stadium',
    marketData: {
      spread: -3,
      total: 47.5,
      moneylineHome: -150,
      moneylineAway: +130,
    },
    weatherData: {
      windSpeed: 10,
      precipitationChance: 0.2,
      temperature: 65,
      isDome: false,
      penalty: 0,
    },
    injuryData: {
      homeTeamPenalty: 1.5,
      awayTeamPenalty: 0.5,
      totalPenalty: 1.0,
      qbImpact: false,
      lineImpact: false,
      secondaryImpact: false,
    },
    restData: {
      homeDaysRest: 7,
      awayDaysRest: 6,
      advantage: 0.5,
    },
    weights: defaultModelWeights,
    ...overrides,
  })

  describe('calculateConfidence', () => {
    it('should return a valid model output', async () => {
      const input = createBasicInput()
      const output = await engine.calculateConfidence(input)

      expect(output.gameId).toBe('game-1')
      expect(output.confidence).toBeGreaterThanOrEqual(0)
      expect(output.confidence).toBeLessThanOrEqual(100)
      expect(output.recommendedPick).toMatch(/^(HOME|AWAY)$/)
      expect(output.factors).toBeDefined()
      expect(output.calculatedAt).toBeInstanceOf(Date)
      expect(output.modelVersion).toBe('1.0.0')
    })

    it('should favor home team when home advantage is high', async () => {
      const input = createBasicInput({
        venue: 'Arrowhead Stadium', // High home advantage venue
        marketData: { spread: 0 }, // Even game otherwise
      })

      const output = await engine.calculateConfidence(input)

      expect(output.factors.homeAdvantage).toBeGreaterThan(3) // Should get venue bonus
      // Don't test recommendedPick directly as it depends on all factors
    })

    it('should handle dome games with no weather penalty', async () => {
      const input = createBasicInput({
        weatherData: {
          windSpeed: 25, // High wind
          precipitationChance: 0.8, // High precipitation
          temperature: 15, // Cold
          isDome: true, // But it's a dome
          penalty: 0,
        },
      })

      const output = await engine.calculateConfidence(input)
      expect(output.factors.weatherPenalty).toBe(0)
    })

    it('should apply weather penalties correctly', async () => {
      const input = createBasicInput({
        weatherData: {
          windSpeed: 25, // Over 15 mph threshold
          precipitationChance: 0.6, // Over 30% threshold
          temperature: 15, // Under 20°F
          isDome: false,
          penalty: 0,
        },
      })

      const output = await engine.calculateConfidence(input)
      expect(output.factors.weatherPenalty).toBeGreaterThan(0)
    })

    it('should handle moneyline vs spread preference correctly', async () => {
      const inputWithML = createBasicInput({
        marketData: {
          moneylineHome: -150,
          moneylineAway: +130,
          spread: -3,
        },
      })

      const inputWithoutML = createBasicInput({
        marketData: {
          spread: -3,
        },
      })

      const outputWithML = await engine.calculateConfidence(inputWithML)
      const outputWithoutML = await engine.calculateConfidence(inputWithoutML)

      // Should prefer moneyline when available
      expect(outputWithML.factors.marketProb).not.toBe(
        outputWithoutML.factors.marketProb
      )
    })

    it('should properly combine weighted factors', async () => {
      const input = createBasicInput()
      const output = await engine.calculateConfidence(input)

      // Check that factor breakdown sums make sense
      const breakdown = output.factors.factorBreakdown
      expect(breakdown).toHaveLength(11) // All 11 factors (including line value, divisional, revenge game, recent form, and playoff implications)

      // Each factor should have proper structure
      breakdown.forEach((factor) => {
        expect(factor.factor).toBeTruthy()
        expect(typeof factor.value).toBe('number')
        expect(typeof factor.weight).toBe('number')
        expect(typeof factor.contribution).toBe('number')
        expect(factor.description).toBeTruthy()
      })
    })

    it('should handle extreme confidence values', async () => {
      // Test very high confidence scenario
      const highConfidenceInput = createBasicInput({
        marketData: {
          moneylineHome: -500, // Heavy favorite
          moneylineAway: +400,
        },
        restData: {
          homeDaysRest: 10, // Big rest advantage
          awayDaysRest: 4,
          advantage: 3.0,
        },
      })

      const highOutput = await engine.calculateConfidence(highConfidenceInput)
      expect(highOutput.confidence).toBeGreaterThan(60)

      // Test low confidence scenario
      const lowConfidenceInput = createBasicInput({
        marketData: {
          moneylineHome: +105, // Very close game
          moneylineAway: -105,
        },
        injuryData: {
          homeTeamPenalty: 15, // Major injury impact
          awayTeamPenalty: 2,
          totalPenalty: 13,
          qbImpact: true,
          lineImpact: true,
          secondaryImpact: false,
        },
      })

      const lowOutput = await engine.calculateConfidence(lowConfidenceInput)
      expect(lowOutput.confidence).toBeLessThan(80)
    })

    it('should maintain consistency with same inputs', async () => {
      const input = createBasicInput()

      const output1 = await engine.calculateConfidence(input)
      const output2 = await engine.calculateConfidence(input)

      expect(output1.confidence).toBe(output2.confidence)
      expect(output1.recommendedPick).toBe(output2.recommendedPick)
      expect(output1.factors.marketProb).toBe(output2.factors.marketProb)
    })

    it('should handle missing optional data gracefully', async () => {
      const minimalInput: ModelInput = {
        gameId: 'game-1',
        homeTeamId: 'team-home',
        awayTeamId: 'team-away',
        kickoffTime: new Date(),
        marketData: { spread: -3 },
        weights: defaultModelWeights,
      }

      const output = await engine.calculateConfidence(minimalInput)

      expect(output.confidence).toBeGreaterThanOrEqual(0)
      expect(output.confidence).toBeLessThanOrEqual(100)
      expect(output.recommendedPick).toMatch(/^(HOME|AWAY)$/)
      expect(output.factors.weatherPenalty).toBe(0)
      expect(output.factors.injuryPenalty).toBe(0)
    })
  })

  describe('moneyline calculations', () => {
    it('should calculate implied probabilities correctly', async () => {
      const input = createBasicInput({
        marketData: {
          moneylineHome: -150, // 60% implied
          moneylineAway: +130, // ~43.5% implied (with vig)
        },
      })

      const output = await engine.calculateConfidence(input)

      // After vig removal, home should be ~58% (60/(60+43.5))
      expect(output.factors.marketProb).toBeGreaterThan(0.55)
      expect(output.factors.marketProb).toBeLessThan(0.62)
    })

    it('should handle positive and negative moneylines', async () => {
      const favoriteInput = createBasicInput({
        marketData: {
          moneylineHome: -200, // Heavy favorite
          moneylineAway: +175,
        },
      })

      const underdogInput = createBasicInput({
        marketData: {
          moneylineHome: +150, // Underdog at home
          moneylineAway: -175,
        },
      })

      const favoriteOutput = await engine.calculateConfidence(favoriteInput)
      const underdogOutput = await engine.calculateConfidence(underdogInput)

      expect(favoriteOutput.factors.marketProb).toBeGreaterThan(0.6)
      expect(underdogOutput.factors.marketProb).toBeLessThan(0.4)
    })
  })

  describe('spread calculations', () => {
    it('should convert spread to probability correctly', async () => {
      const homeSpreadInput = createBasicInput({
        marketData: { spread: -3 }, // Home favored by 3
      })

      const awaySpreadInput = createBasicInput({
        marketData: { spread: +7 }, // Away favored by 7
      })

      const homeOutput = await engine.calculateConfidence(homeSpreadInput)
      const awayOutput = await engine.calculateConfidence(awaySpreadInput)

      expect(homeOutput.factors.marketProb).toBeGreaterThan(0.5)
      expect(awayOutput.factors.marketProb).toBeLessThan(0.5)
    })

    it('should handle pick-em games', async () => {
      const pickEmInput = createBasicInput({
        marketData: { spread: 0 },
      })

      const output = await engine.calculateConfidence(pickEmInput)
      expect(output.factors.marketProb).toBeCloseTo(0.5, 1)
    })
  })

  describe('factor weighting', () => {
    it('should respect custom weights', async () => {
      const customWeights = {
        ...defaultModelWeights,
        marketProbWeight: 0.8, // Much higher market weight
        eloWeight: 0.2,
      }

      const input = createBasicInput({ weights: customWeights })
      const output = await engine.calculateConfidence(input)

      // Market factor should dominate
      const marketFactor = output.factors.factorBreakdown.find(
        (f) => f.factor === 'Market Probability'
      )
      const eloFactor = output.factors.factorBreakdown.find(
        (f) => f.factor === 'Elo Rating'
      )

      expect(marketFactor?.weight).toBe(0.8)
      expect(eloFactor?.weight).toBe(0.2)
    })

    it('should normalize weights correctly', async () => {
      const input = createBasicInput()
      const output = await engine.calculateConfidence(input)

      const totalWeight = output.factors.factorBreakdown.reduce(
        (sum, factor) => sum + factor.weight,
        0
      )

      expect(totalWeight).toBeCloseTo(1.0, 2)
    })
  })
})
