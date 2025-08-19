import { describe, it, expect, beforeEach } from 'vitest'
import { MarketCalculator } from '../market-calculator'
import type { MarketData } from '../types'

describe('MarketCalculator', () => {
  let calculator: MarketCalculator

  beforeEach(() => {
    calculator = new MarketCalculator()
  })

  describe('calculateImpliedProbability', () => {
    it('should prefer moneyline over spread when both available', () => {
      const marketData: MarketData = {
        moneylineHome: -150,
        moneylineAway: +130,
        spread: -3,
      }

      const result = calculator.calculateImpliedProbability(marketData)

      expect(result.source).toBe('moneyline')
      expect(result.homeProb).toBeGreaterThan(0.5)
      expect(result.awayProb).toBeLessThan(0.5)
      expect(result.confidence).toBeGreaterThanOrEqual(0.8)
    })

    it('should use spread when moneyline not available', () => {
      const marketData: MarketData = {
        spread: -3.5,
      }

      const result = calculator.calculateImpliedProbability(marketData)

      expect(result.source).toBe('spread')
      expect(result.homeProb).toBeGreaterThan(0.5)
      expect(result.awayProb).toBeLessThan(0.5)
    })

    it('should fallback to total when only total available', () => {
      const marketData: MarketData = {
        total: 55.5, // High total
      }

      const result = calculator.calculateImpliedProbability(marketData)

      expect(result.source).toBe('total')
      expect(result.confidence).toBe(0.3) // Low confidence for total-only
    })

    it('should return default when no market data', () => {
      const marketData: MarketData = {}

      const result = calculator.calculateImpliedProbability(marketData)

      expect(result.source).toBe('default')
      expect(result.homeProb).toBe(0.5)
      expect(result.awayProb).toBe(0.5)
      expect(result.confidence).toBe(0.1)
    })
  })

  describe('moneyline calculations', () => {
    it('should handle positive moneylines correctly', () => {
      const marketData: MarketData = {
        moneylineHome: +150, // Home underdog
        moneylineAway: -175, // Away favorite
      }

      const result = calculator.calculateImpliedProbability(marketData)

      expect(result.homeProb).toBeLessThan(0.5)
      expect(result.awayProb).toBeGreaterThan(0.5)
      expect(result.homeProb + result.awayProb).toBeCloseTo(1.0, 2)
    })

    it('should handle negative moneylines correctly', () => {
      const marketData: MarketData = {
        moneylineHome: -200, // Heavy home favorite
        moneylineAway: +175,
      }

      const result = calculator.calculateImpliedProbability(marketData)

      expect(result.homeProb).toBeGreaterThan(0.6)
      expect(result.awayProb).toBeLessThan(0.4)
    })

    it('should remove vig correctly', () => {
      const marketData: MarketData = {
        moneylineHome: -110,
        moneylineAway: -110, // Equal odds with standard vig
      }

      const result = calculator.calculateImpliedProbability(marketData)

      // Should be exactly 50/50 after vig removal
      expect(result.homeProb).toBeCloseTo(0.5, 2)
      expect(result.awayProb).toBeCloseTo(0.5, 2)
      expect(result.confidence).toBeGreaterThan(0.9) // Normal vig
    })

    it('should detect unusual vig levels', () => {
      const highVigData: MarketData = {
        moneylineHome: -130,
        moneylineAway: -130, // Very high vig
      }

      const result = calculator.calculateImpliedProbability(highVigData)
      expect(result.confidence).toBe(0.8) // Lower confidence due to unusual vig
    })
  })

  describe('spread calculations', () => {
    it('should convert spread to probability correctly', () => {
      const marketData: MarketData = {
        spread: -7, // Home favored by 7
      }

      const result = calculator.calculateImpliedProbability(marketData)

      expect(result.homeProb).toBeGreaterThan(0.6)
      expect(result.awayProb).toBeLessThan(0.4)
      expect(result.source).toBe('spread')
    })

    it('should handle pick-em games', () => {
      const marketData: MarketData = {
        spread: 0,
      }

      const result = calculator.calculateImpliedProbability(marketData)

      expect(result.homeProb).toBeCloseTo(0.5, 2)
      expect(result.awayProb).toBeCloseTo(0.5, 2)
    })

    it('should handle extreme spreads with lower confidence', () => {
      const extremeSpread: MarketData = {
        spread: -21, // Very large spread
      }

      const result = calculator.calculateImpliedProbability(extremeSpread)

      expect(result.homeProb).toBeGreaterThan(0.8)
      expect(result.confidence).toBe(0.5) // Lower confidence for extreme spreads
    })

    it('should maintain bounds for extreme inputs', () => {
      const veryExtremeSpread: MarketData = {
        spread: -50, // Unrealistic spread
      }

      const result = calculator.calculateImpliedProbability(veryExtremeSpread)

      expect(result.homeProb).toBeLessThanOrEqual(0.95)
      expect(result.awayProb).toBeGreaterThanOrEqual(0.05)
    })
  })

  describe('total calculations', () => {
    it('should favor home team slightly for high totals', () => {
      const highTotal: MarketData = {
        total: 60, // Well above average
      }

      const result = calculator.calculateImpliedProbability(highTotal)

      expect(result.homeProb).toBeGreaterThan(0.5)
      expect(result.confidence).toBe(0.3) // Low confidence
    })

    it('should favor away team slightly for low totals', () => {
      const lowTotal: MarketData = {
        total: 35, // Well below average
      }

      const result = calculator.calculateImpliedProbability(lowTotal)

      expect(result.homeProb).toBeLessThan(0.5)
      expect(result.confidence).toBe(0.3)
    })

    it('should not make large adjustments from total alone', () => {
      const extremeTotal: MarketData = {
        total: 70, // Very high total
      }

      const result = calculator.calculateImpliedProbability(extremeTotal)

      // Should not move more than 2% from 50%
      expect(Math.abs(result.homeProb - 0.5)).toBeLessThan(0.021)
    })
  })

  describe('utility methods', () => {
    it('should identify pick-em games correctly', () => {
      expect(calculator.isPickEm({ spread: 0 })).toBe(true)
      expect(calculator.isPickEm({ spread: -0.5 })).toBe(false)
      expect(calculator.isPickEm({ spread: 0.5 })).toBe(false)

      expect(
        calculator.isPickEm({
          moneylineHome: -105,
          moneylineAway: -115,
        })
      ).toBe(true)

      expect(
        calculator.isPickEm({
          moneylineHome: -150,
          moneylineAway: +130,
        })
      ).toBe(false)
    })

    it('should identify favored team correctly', () => {
      expect(calculator.getFavoredTeam({ spread: -3 })).toBe('HOME')
      expect(calculator.getFavoredTeam({ spread: 3 })).toBe('AWAY')
      expect(calculator.getFavoredTeam({ spread: 0 })).toBe('EVEN')

      expect(
        calculator.getFavoredTeam({
          moneylineHome: -150,
          moneylineAway: +130,
        })
      ).toBe('HOME')

      expect(
        calculator.getFavoredTeam({
          moneylineHome: +150,
          moneylineAway: -130,
        })
      ).toBe('AWAY')
    })

    it('should assess market strength correctly', () => {
      expect(calculator.getMarketStrength({ spread: -1 })).toBe('WEAK')
      expect(calculator.getMarketStrength({ spread: -7 })).toBe('STRONG') // 7-point spread creates strong market opinion
      expect(calculator.getMarketStrength({ spread: -14 })).toBe('EXTREME') // 14-point spread is extreme
      expect(calculator.getMarketStrength({ spread: -21 })).toBe('EXTREME')
    })

    it('should convert probability back to spread', () => {
      const spread = calculator.probabilityToSpread(0.6)
      expect(spread).toBeCloseTo(3.57, 1) // Approximately 3.6 point spread

      const evenSpread = calculator.probabilityToSpread(0.5)
      expect(evenSpread).toBeCloseTo(0, 2)
    })

    it('should convert probability to moneyline', () => {
      const favoriteML = calculator.probabilityToMoneyline(0.6)
      expect(favoriteML).toBeLessThan(0) // Should be negative (favorite)
      expect(favoriteML).toBeCloseTo(-150, 0)

      const underdogML = calculator.probabilityToMoneyline(0.4)
      expect(underdogML).toBeGreaterThan(0) // Should be positive (underdog)
      expect(underdogML).toBeCloseTo(150, 0)
    })
  })

  describe('validateMarketData', () => {
    it('should pass validation for normal market data', () => {
      const marketData: MarketData = {
        spread: -3,
        total: 47.5,
        moneylineHome: -150,
        moneylineAway: +130,
      }

      const validation = calculator.validateMarketData(marketData)

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should warn about extreme spreads', () => {
      const marketData: MarketData = {
        spread: -24, // Very large spread
      }

      const validation = calculator.validateMarketData(marketData)

      expect(validation.isValid).toBe(true)
      expect(validation.warnings).toContain('Extreme spread: -24 points')
    })

    it('should warn about unusual totals', () => {
      const marketData: MarketData = {
        total: 25, // Very low total
      }

      const validation = calculator.validateMarketData(marketData)

      expect(validation.isValid).toBe(true)
      expect(validation.warnings).toContain('Unusual total: 25 points')
    })

    it('should detect impossible vig', () => {
      const marketData: MarketData = {
        moneylineHome: +150, // Both positive = impossible
        moneylineAway: +150,
      }

      const validation = calculator.validateMarketData(marketData)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain(
        'Moneyline odds have negative vig (impossible)'
      )
    })

    it('should warn about high vig', () => {
      const marketData: MarketData = {
        moneylineHome: -140,
        moneylineAway: -140, // This creates very high vig (over 15%)
      }

      const validation = calculator.validateMarketData(marketData)

      expect(validation.isValid).toBe(true)
      expect(validation.warnings.some((w) => w.includes('High vig'))).toBe(true)
    })

    it('should detect inconsistent spread/moneyline', () => {
      const marketData: MarketData = {
        spread: -7, // Home favored by 7
        moneylineHome: +200, // But home is underdog in moneyline
        moneylineAway: -250,
      }

      const validation = calculator.validateMarketData(marketData)

      expect(validation.warnings).toContain(
        'Spread and moneyline imply different probabilities'
      )
    })
  })
})
