import { describe, it, expect } from 'vitest'
import { PlayoffImplicationsAnalyzer } from '../playoff-implications'

describe('PlayoffImplicationsAnalyzer', () => {
  let analyzer: PlayoffImplicationsAnalyzer

  beforeEach(() => {
    analyzer = new PlayoffImplicationsAnalyzer()
  })

  describe('calculatePlayoffPressure', () => {
    it('should calculate high pressure for bubble teams late in season', () => {
      const pressure = analyzer.calculatePlayoffPressure(8, 8, 17) // 8-8 record in week 17
      expect(pressure).toBeGreaterThan(0.7)
    })

    it('should calculate low pressure for strong teams', () => {
      const pressure = analyzer.calculatePlayoffPressure(13, 3, 17) // 13-3 record
      expect(pressure).toBeLessThan(0.4)
    })

    it('should calculate minimal pressure for eliminated teams', () => {
      const pressure = analyzer.calculatePlayoffPressure(2, 14, 17) // 2-14 record
      expect(pressure).toBeLessThan(0.2)
    })

    it('should handle early season with moderate pressure', () => {
      const pressure = analyzer.calculatePlayoffPressure(3, 3, 7) // 3-3 record in week 7
      // For bubble teams (.500 record), pressure should be higher
      expect(pressure).toBeGreaterThan(0.8) // Bubble teams have high pressure
    })
  })

  describe('isInPlayoffContention', () => {
    it('should identify strong teams as in contention', () => {
      const contention = analyzer.isInPlayoffContention(11, 5, 17)
      expect(contention).toBe(true)
    })

    it('should identify bubble teams as in contention', () => {
      const contention = analyzer.isInPlayoffContention(8, 8, 16)
      expect(contention).toBe(true)
    })

    it('should identify eliminated teams as not in contention', () => {
      const contention = analyzer.isInPlayoffContention(3, 13, 17)
      expect(contention).toBe(false)
    })

    it('should consider all teams in contention early in season', () => {
      const contention = analyzer.isInPlayoffContention(2, 3, 6)
      expect(contention).toBe(true)
    })

    it('should handle edge cases around .500', () => {
      // 8-8 late in season should still be in contention
      const contention = analyzer.isInPlayoffContention(8, 8, 17)
      expect(contention).toBe(true)
      
      // Very poor record should be eliminated
      const eliminated = analyzer.isInPlayoffContention(1, 15, 17)
      expect(eliminated).toBe(false)
    })
  })

  describe('calculateMotivationFactor', () => {
    it('should convert motivation difference to point spread', () => {
      // Home team more motivated
      const homeAdvantage = analyzer.calculateMotivationFactor(0.8, 0.4)
      expect(homeAdvantage).toBeCloseTo(0.8, 1) // 0.4 * 2 = 0.8 points

      // Away team more motivated  
      const awayAdvantage = analyzer.calculateMotivationFactor(0.3, 0.7)
      expect(awayAdvantage).toBeCloseTo(-0.8, 1) // -0.4 * 2 = -0.8 points

      // Equal motivation
      const neutral = analyzer.calculateMotivationFactor(0.5, 0.5)
      expect(neutral).toBe(0)
    })

    it('should cap motivation factors at maximum spread', () => {
      // Maximum motivation difference should cap at 2 points
      const maxAdvantage = analyzer.calculateMotivationFactor(1.0, 0.0)
      expect(maxAdvantage).toBe(2.0)

      const maxDisadvantage = analyzer.calculateMotivationFactor(0.0, 1.0)
      expect(maxDisadvantage).toBe(-2.0)
    })
  })
})