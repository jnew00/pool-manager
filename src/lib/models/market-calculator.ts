import type { MarketData } from './types'

/**
 * Market probability calculator for NFL betting lines
 */
export class MarketCalculator {
  /**
   * Calculate implied probability from various market data sources
   */
  calculateImpliedProbability(marketData: MarketData): {
    homeProb: number
    awayProb: number
    source: 'moneyline' | 'spread' | 'total' | 'default'
    confidence: number
  } {
    // Priority order: moneyline > spread > total > default

    if (marketData.moneylineHome && marketData.moneylineAway) {
      return this.moneylineToImpliedProbability(
        marketData.moneylineHome,
        marketData.moneylineAway
      )
    }

    if (marketData.spread !== undefined) {
      return this.spreadToImpliedProbability(marketData.spread)
    }

    if (marketData.total !== undefined) {
      return this.totalToImpliedProbability(marketData.total)
    }

    return {
      homeProb: 0.5,
      awayProb: 0.5,
      source: 'default',
      confidence: 0.1,
    }
  }

  /**
   * Convert moneyline odds to implied probability
   */
  private moneylineToImpliedProbability(
    homeML: number,
    awayML: number
  ): {
    homeProb: number
    awayProb: number
    source: 'moneyline'
    confidence: number
  } {
    const homeImplied = this.moneylineToDecimal(homeML)
    const awayImplied = this.moneylineToDecimal(awayML)

    // Remove vig by normalizing (sportsbooks build in ~4-8% vig)
    const totalImplied = homeImplied + awayImplied
    const vigPercentage = totalImplied - 1.0

    const homeProb = homeImplied / totalImplied
    const awayProb = awayImplied / totalImplied

    // Confidence is higher when vig is normal (4-8%)
    const confidence =
      vigPercentage >= 0.04 && vigPercentage <= 0.08 ? 0.95 : 0.8

    return {
      homeProb,
      awayProb,
      source: 'moneyline',
      confidence,
    }
  }

  /**
   * Convert spread to implied probability
   */
  private spreadToImpliedProbability(spread: number): {
    homeProb: number
    awayProb: number
    source: 'spread'
    confidence: number
  } {
    // Standard NFL conversion: 1 point spread ≈ 2.8% probability shift
    // Negative spread means home team favored, positive means away favored
    const spreadFactor = 0.028

    // Base probability is 50%, adjust based on spread
    // Negative spread (home favored) increases home probability
    let homeProb = 0.5 + -spread * spreadFactor

    // Apply bounds
    homeProb = Math.max(0.05, Math.min(0.95, homeProb))
    const awayProb = 1 - homeProb

    // Confidence decreases for extreme spreads
    const confidence = this.calculateSpreadConfidence(spread)

    return {
      homeProb,
      awayProb,
      source: 'spread',
      confidence,
    }
  }

  /**
   * Convert total to rough implied probability (less reliable)
   */
  private totalToImpliedProbability(total: number): {
    homeProb: number
    awayProb: number
    source: 'total'
    confidence: number
  } {
    // This is much less reliable, but can provide some signal
    // Higher totals slightly favor home teams (offensive game plans)
    // Lower totals slightly favor defensive/road teams

    const nflAverageTotal = 47.5
    const deviation = total - nflAverageTotal

    // Small adjustment based on total (max 2% swing)
    const adjustment = Math.max(-0.02, Math.min(0.02, deviation * 0.002))

    const homeProb = 0.5 + adjustment
    const awayProb = 1 - homeProb

    return {
      homeProb,
      awayProb,
      source: 'total',
      confidence: 0.3, // Low confidence since this is speculative
    }
  }

  /**
   * Convert American moneyline to decimal implied probability
   */
  private moneylineToDecimal(moneyline: number): number {
    if (moneyline > 0) {
      // Positive odds: +200 means $100 wins $200
      return 100 / (moneyline + 100)
    } else {
      // Negative odds: -200 means bet $200 to win $100
      return Math.abs(moneyline) / (Math.abs(moneyline) + 100)
    }
  }

  /**
   * Calculate confidence based on spread magnitude
   */
  private calculateSpreadConfidence(spread: number): number {
    const absSpread = Math.abs(spread)

    // Most confident for spreads 1-10 points
    if (absSpread <= 10) {
      return 0.85
    }

    // Moderate confidence for spreads 10-17 points
    if (absSpread <= 17) {
      return 0.7
    }

    // Lower confidence for extreme spreads
    return 0.5
  }

  /**
   * Check if line appears to be pick'em (no clear favorite)
   */
  isPickEm(marketData: MarketData): boolean {
    if (marketData.spread !== undefined) {
      return Math.abs(marketData.spread) < 0.5
    }

    if (marketData.moneylineHome && marketData.moneylineAway) {
      // Both within -120 to +120 range (roughly even)
      return (
        Math.abs(marketData.moneylineHome) <= 120 &&
        Math.abs(marketData.moneylineAway) <= 120
      )
    }

    return false
  }

  /**
   * Determine which team is favored by the market
   */
  getFavoredTeam(marketData: MarketData): 'HOME' | 'AWAY' | 'EVEN' {
    if (this.isPickEm(marketData)) {
      return 'EVEN'
    }

    if (marketData.spread !== undefined) {
      // Negative spread means home team favored, positive means away favored
      return marketData.spread < 0 ? 'HOME' : 'AWAY'
    }

    if (marketData.moneylineHome && marketData.moneylineAway) {
      // Lower absolute value (closer to even) indicates favorite
      const homeImplied = this.moneylineToDecimal(marketData.moneylineHome)
      const awayImplied = this.moneylineToDecimal(marketData.moneylineAway)
      return homeImplied > awayImplied ? 'HOME' : 'AWAY'
    }

    return 'EVEN'
  }

  /**
   * Calculate the strength of market opinion
   */
  getMarketStrength(
    marketData: MarketData
  ): 'WEAK' | 'MODERATE' | 'STRONG' | 'EXTREME' {
    const { homeProb } = this.calculateImpliedProbability(marketData)
    const deviation = Math.abs(homeProb - 0.5)

    if (deviation < 0.05) return 'WEAK' // 45-55%
    if (deviation < 0.15) return 'MODERATE' // 35-65%
    if (deviation < 0.25) return 'STRONG' // 25-75%
    return 'EXTREME' // <25% or >75%
  }

  /**
   * Convert probability back to point spread (for display)
   */
  probabilityToSpread(homeProb: number): number {
    const deviation = homeProb - 0.5
    return deviation / 0.028 // Reverse of spread calculation
  }

  /**
   * Convert probability to American moneyline (for display)
   */
  probabilityToMoneyline(prob: number): number {
    if (prob > 0.5) {
      // Favorite (negative odds)
      return -Math.round((prob / (1 - prob)) * 100)
    } else {
      // Underdog (positive odds)
      return Math.round(((1 - prob) / prob) * 100)
    }
  }

  /**
   * Validate market data for consistency
   */
  validateMarketData(marketData: MarketData): {
    isValid: boolean
    warnings: string[]
    errors: string[]
  } {
    const warnings: string[] = []
    const errors: string[] = []

    // Check for extreme values
    if (marketData.spread && Math.abs(marketData.spread) > 21) {
      warnings.push(`Extreme spread: ${marketData.spread} points`)
    }

    if (marketData.total && (marketData.total < 30 || marketData.total > 70)) {
      warnings.push(`Unusual total: ${marketData.total} points`)
    }

    // Check moneyline consistency
    if (marketData.moneylineHome && marketData.moneylineAway) {
      const homeImplied = this.moneylineToDecimal(marketData.moneylineHome)
      const awayImplied = this.moneylineToDecimal(marketData.moneylineAway)
      const totalImplied = homeImplied + awayImplied

      if (totalImplied < 1.02) {
        errors.push('Moneyline odds have negative vig (impossible)')
      }

      if (totalImplied > 1.15) {
        warnings.push(`High vig: ${((totalImplied - 1) * 100).toFixed(1)}%`)
      }
    }

    // Check spread/moneyline consistency
    if (
      marketData.spread &&
      marketData.moneylineHome &&
      marketData.moneylineAway
    ) {
      const spreadProb = this.spreadToImpliedProbability(marketData.spread)
      const mlProb = this.moneylineToImpliedProbability(
        marketData.moneylineHome,
        marketData.moneylineAway
      )

      const probDiff = Math.abs(spreadProb.homeProb - mlProb.homeProb)
      if (probDiff > 0.1) {
        warnings.push('Spread and moneyline imply different probabilities')
      }
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    }
  }
}
