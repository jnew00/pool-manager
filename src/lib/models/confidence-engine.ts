import type {
  ModelInput,
  ModelOutput,
  GameFactors,
  FactorContribution,
  ModelWeights,
} from './types'
import { EloSystem } from './elo-system'
import { areTeamsDivisionRivals, getRivalryIntensity, RIVALRY_FACTORS } from './nfl-divisions'
import { prisma } from '@/lib/prisma'

/**
 * Core confidence calculation engine - deterministic algorithm v1
 */
export class ConfidenceEngine {
  private modelVersion = '1.0.0'

  /**
   * Calculate confidence for a single game
   */
  async calculateConfidence(input: ModelInput): Promise<ModelOutput> {
    const factors = await this.calculateGameFactors(input)

    return {
      gameId: input.gameId,
      confidence: factors.adjustedConfidence,
      recommendedPick: factors.recommendedPick,
      factors,
      calculatedAt: new Date(),
      modelVersion: this.modelVersion,
    }
  }

  /**
   * Calculate all factors for a game
   */
  private async calculateGameFactors(input: ModelInput): Promise<GameFactors> {
    const weights = input.weights

    // 1. Market-implied probability
    const marketProb = this.calculateMarketProbability(input.marketData)

    // 2. Elo probabilities - now using real ratings
    const eloSystem = new EloSystem(weights.kElo || 24)
    const homeRating = await eloSystem.getTeamRating(input.homeTeamId)
    const awayRating = await eloSystem.getTeamRating(input.awayTeamId)
    const homeElo = homeRating.rating
    const awayElo = awayRating.rating
    const eloProb = this.calculateEloProbability(homeElo, awayElo)

    // 3. Line value (arbitrage opportunity)
    const lineValue = this.calculateLineValue(
      input.marketData,
      input.currentMarketData
    )

    // 4. Home advantage
    const homeAdvantage = this.calculateHomeAdvantage(input.venue)

    // 5. Rest advantage
    const restAdvantage = this.calculateRestAdvantage(input.restData)

    // 6. Divisional rivalry factor
    const divisionalFactor = await this.calculateDivisionalFactor(
      input.homeTeamId,
      input.awayTeamId
    )

    // 7. Weather penalty
    const weatherPenalty = this.calculateWeatherPenalty(
      input.weatherData,
      weights
    )

    // 8. Injury penalty
    const injuryPenalty = this.calculateInjuryPenalty(input.injuryData, weights)

    // 9. Weighted combination
    const rawConfidence = this.combineFactors(
      {
        marketProb,
        eloProb,
        lineValue,
        homeAdvantage,
        restAdvantage,
        divisionalFactor,
        weatherPenalty,
        injuryPenalty,
      },
      weights
    )

    console.log(
      `[Confidence Engine] Raw calculation: marketProb=${marketProb}, eloProb=${eloProb}, homeAdv=${homeAdvantage}, rawConfidence=${rawConfidence}`
    )

    // 8. Scale to 0-100 and determine pick
    const adjustedConfidence =
      isNaN(rawConfidence) || !isFinite(rawConfidence)
        ? (() => {
            console.log(
              `[Confidence Engine] Using fallback! rawConfidence=${rawConfidence} (NaN: ${isNaN(rawConfidence)}, finite: ${isFinite(rawConfidence)})`
            )
            return 50.0
          })()
        : Math.max(0, Math.min(100, rawConfidence * 100))
    const recommendedPick: 'HOME' | 'AWAY' =
      rawConfidence > 0.5 ? 'HOME' : 'AWAY'

    // 10. Factor breakdown for UI
    const factorBreakdown = this.createFactorBreakdown(
      {
        marketProb,
        eloProb,
        lineValue,
        homeAdvantage,
        restAdvantage,
        divisionalFactor,
        weatherPenalty,
        injuryPenalty,
        rawConfidence,
      },
      weights
    )

    return {
      gameId: input.gameId,
      homeTeamId: input.homeTeamId,
      awayTeamId: input.awayTeamId,
      marketProb,
      homeElo,
      awayElo,
      eloProb,
      lineValue,
      homeAdvantage,
      restAdvantage,
      divisionalFactor,
      weatherPenalty,
      injuryPenalty,
      rawConfidence,
      adjustedConfidence,
      recommendedPick,
      factorBreakdown,
    }
  }

  /**
   * Calculate market-implied probability from spread/moneyline
   */
  private calculateMarketProbability(
    marketData: ModelInput['marketData']
  ): number {
    // Prefer moneyline if available, otherwise use spread
    if (marketData.moneylineHome && marketData.moneylineAway) {
      return this.moneylineToImpliedProbability(
        marketData.moneylineHome,
        marketData.moneylineAway
      )
    }

    if (marketData.spread !== undefined) {
      return this.spreadToImpliedProbability(marketData.spread)
    }

    // Default to 50% if no market data
    return 0.5
  }

  /**
   * Convert moneyline to implied probability (accounting for vig)
   */
  private moneylineToImpliedProbability(
    homeML: number,
    awayML: number
  ): number {
    const homeImplied =
      homeML > 0
        ? 100 / (homeML + 100)
        : Math.abs(homeML) / (Math.abs(homeML) + 100)

    const awayImplied =
      awayML > 0
        ? 100 / (awayML + 100)
        : Math.abs(awayML) / (Math.abs(awayML) + 100)

    // Remove vig by normalizing
    const totalImplied = homeImplied + awayImplied
    return homeImplied / totalImplied
  }

  /**
   * Convert spread to implied probability using standard formula
   */
  private spreadToImpliedProbability(spread: number): number {
    // Standard formula: P = 1 / (1 + e^(spread/3))
    // Negative spread (home favored) should give >50% home probability
    return 1 / (1 + Math.exp(spread / 3))
  }

  /**
   * Calculate line value (arbitrage opportunity from pool vs current Vegas)
   */
  private calculateLineValue(
    poolMarketData: ModelInput['marketData'],
    currentMarketData?: ModelInput['marketData']
  ): number {
    // If no current market data, no arbitrage opportunity
    if (
      !currentMarketData ||
      !poolMarketData.spread ||
      !currentMarketData.spread
    ) {
      return 0
    }

    // Calculate spread difference
    // Positive value = pool line is more favorable to home team
    // Example: Pool has TB +7, Vegas has TB +4 → lineValue = +3 for TB
    const spreadDifference = currentMarketData.spread - poolMarketData.spread

    console.log(
      `[Line Value] Pool spread: ${poolMarketData.spread}, Current: ${currentMarketData.spread}, Difference: ${spreadDifference}`
    )

    return spreadDifference
  }

  /**
   * Calculate Elo-based probability
   */
  private calculateEloProbability(homeElo: number, awayElo: number): number {
    const eloDiff = homeElo - awayElo
    return 1 / (1 + Math.pow(10, -eloDiff / 400))
  }

  /**
   * Calculate home field advantage
   */
  private calculateHomeAdvantage(venue?: string): number {
    // Base home advantage - roughly 3 points in NFL
    const baseAdvantage = 3.0

    // Venue-specific adjustments (could be expanded later)
    const venueAdjustments: Record<string, number> = {
      'Arrowhead Stadium': 1.5, // KC - notoriously loud
      'Lambeau Field': 1.0, // GB - cold weather advantage
      'Lumen Field': 1.2, // SEA - 12th man
      Superdome: 0.8, // NO - dome but loud
      'Mile High': 1.0, // DEN - altitude
    }

    const venueBonus = venue ? venueAdjustments[venue] || 0 : 0
    return baseAdvantage + venueBonus
  }

  /**
   * Calculate rest advantage
   */
  private calculateRestAdvantage(restData?: ModelInput['restData']): number {
    if (!restData) return 0

    const restDiff = restData.homeDaysRest - restData.awayDaysRest

    // Each extra day of rest is worth approximately 0.5 points
    return restDiff * 0.5
  }

  /**
   * Calculate divisional rivalry factor
   */
  private async calculateDivisionalFactor(
    homeTeamId: string,
    awayTeamId: string
  ): Promise<number> {
    try {
      // Get team abbreviations from database
      const teams = await prisma.team.findMany({
        where: {
          id: {
            in: [homeTeamId, awayTeamId]
          }
        },
        select: {
          id: true,
          nflAbbr: true
        }
      })

      if (teams.length !== 2) {
        return 0 // Teams not found
      }

      const homeTeam = teams.find(t => t.id === homeTeamId)
      const awayTeam = teams.find(t => t.id === awayTeamId)

      if (!homeTeam || !awayTeam) {
        return 0
      }

      // Check if teams are division rivals
      const isDivisionalGame = areTeamsDivisionRivals(homeTeam.nflAbbr, awayTeam.nflAbbr)
      
      if (!isDivisionalGame) {
        return 0 // No divisional factor for non-division games
      }

      // Base divisional game variance (makes games more unpredictable)
      let divisionalAdjustment = 0

      // Get rivalry intensity
      const rivalryIntensity = getRivalryIntensity(homeTeam.nflAbbr, awayTeam.nflAbbr)

      // Division games tend to be closer - this reduces confidence in heavy favorites
      // We'll apply this as a point adjustment that favors underdogs
      if (rivalryIntensity > 0) {
        // Intense rivalries get bigger underdog bonus
        divisionalAdjustment = RIVALRY_FACTORS.DIVISION_UNDERDOG_BONUS * rivalryIntensity
      } else {
        // Regular division games get standard underdog bonus
        divisionalAdjustment = RIVALRY_FACTORS.DIVISION_UNDERDOG_BONUS
      }

      console.log(
        `[Divisional Factor] ${homeTeam.nflAbbr} vs ${awayTeam.nflAbbr}: divisional=${isDivisionalGame}, rivalry=${rivalryIntensity}, adjustment=${divisionalAdjustment}`
      )

      return divisionalAdjustment

    } catch (error) {
      console.error('Error calculating divisional factor:', error)
      return 0
    }
  }

  /**
   * Calculate weather penalty
   */
  private calculateWeatherPenalty(
    weatherData?: ModelInput['weatherData'],
    weights: ModelInput['weights']
  ): number {
    if (!weatherData || weatherData.isDome) return 0

    let penalty = 0

    // Wind penalty
    if (
      weatherData.windSpeed &&
      weatherData.windSpeed > weights.windThresholdMph
    ) {
      const excessWind = weatherData.windSpeed - weights.windThresholdMph
      penalty += excessWind * 0.2 // 0.2 points per mph over threshold
    }

    // Precipitation penalty
    if (
      weatherData.precipitationChance &&
      weatherData.precipitationChance > weights.precipProbThreshold
    ) {
      const excessPrecip =
        weatherData.precipitationChance - weights.precipProbThreshold
      penalty += excessPrecip * 10 // Up to 7 points for heavy rain/snow
    }

    // Temperature penalty (extreme cold)
    if (weatherData.temperature && weatherData.temperature < 20) {
      penalty += (20 - weatherData.temperature) * 0.1
    }

    return penalty
  }

  /**
   * Calculate injury penalty
   */
  private calculateInjuryPenalty(
    injuryData?: ModelInput['injuryData'],
    weights: ModelInput['weights']
  ): number {
    if (!injuryData) return 0

    let homePenalty = 0
    let awayPenalty = 0

    // Apply penalties from injury data
    homePenalty += injuryData.homeTeamPenalty
    awayPenalty += injuryData.awayTeamPenalty

    // Return net penalty (positive hurts home team)
    return homePenalty - awayPenalty
  }

  /**
   * Combine all factors using weighted average
   */
  private combineFactors(
    factors: {
      marketProb: number
      eloProb: number
      lineValue: number
      homeAdvantage: number
      restAdvantage: number
      divisionalFactor: number
      weatherPenalty: number
      injuryPenalty: number
    },
    weights: ModelInput['weights']
  ): number {
    // Convert point spreads to probability adjustments
    const homeAdvProb = this.pointsToProb(factors.homeAdvantage)
    const restAdvProb = this.pointsToProb(factors.restAdvantage)
    const divisionalProb = this.pointsToProb(factors.divisionalFactor)
    const weatherPenaltyProb = this.pointsToProb(-factors.weatherPenalty)
    const injuryPenaltyProb = this.pointsToProb(-factors.injuryPenalty)
    const lineValueProb = this.pointsToProb(factors.lineValue)

    console.log(`[Confidence Engine] Weights:`, weights)
    console.log(
      `[Confidence Engine] Probability conversions: homeAdv=${homeAdvProb}, rest=${restAdvProb}, divisional=${divisionalProb} (${factors.divisionalFactor} pts), lineValue=${lineValueProb} (${factors.lineValue} pts)`
    )

    const marketWeight = weights.marketProbWeight || 0.4
    const eloWeight = weights.eloWeight || 0.25
    const lineValueWeight = weights.lineValueWeight || 0.25
    const homeAdvWeight = weights.homeAdvWeight || 0.05
    const restWeight = weights.restWeight || 0.02
    const divisionalWeight = weights.divisionalWeight || 0.02
    const weatherWeight = weights.weatherPenaltyWeight || 0.02
    const injuryWeight = weights.injuryPenaltyWeight || 0.01

    // Weighted combination
    const weightedProb =
      factors.marketProb * marketWeight +
      factors.eloProb * eloWeight +
      lineValueProb * lineValueWeight +
      homeAdvProb * homeAdvWeight +
      restAdvProb * restWeight +
      divisionalProb * divisionalWeight +
      weatherPenaltyProb * weatherWeight +
      injuryPenaltyProb * injuryWeight

    // Normalize by total weights
    const totalWeight =
      marketWeight +
      eloWeight +
      lineValueWeight +
      homeAdvWeight +
      restWeight +
      divisionalWeight +
      weatherWeight +
      injuryWeight

    console.log(
      `[Confidence Engine] weightedProb=${weightedProb}, totalWeight=${totalWeight}, result=${weightedProb / totalWeight}`
    )

    return weightedProb / totalWeight
  }

  /**
   * Convert point advantage to probability using standard NFL conversion
   */
  private pointsToProb(points: number): number {
    // Standard conversion: 3 points = 50% probability shift
    return 0.5 + points / 6 // 6 points = full probability shift
  }

  /**
   * Create factor breakdown for UI display
   */
  private createFactorBreakdown(
    factors: {
      marketProb: number
      eloProb: number
      lineValue: number
      homeAdvantage: number
      restAdvantage: number
      divisionalFactor: number
      weatherPenalty: number
      injuryPenalty: number
      rawConfidence: number
    },
    weights: ModelInput['weights']
  ): FactorContribution[] {
    return [
      {
        factor: 'Market Probability',
        value: factors.marketProb,
        weight: weights.marketProbWeight,
        contribution: factors.marketProb * weights.marketProbWeight,
        description: 'Implied probability from betting lines',
      },
      {
        factor: 'Elo Rating',
        value: factors.eloProb,
        weight: weights.eloWeight,
        contribution: factors.eloProb * weights.eloWeight,
        description: 'Team strength based on historical performance',
      },
      {
        factor: 'Line Value',
        value: factors.lineValue,
        weight: weights.lineValueWeight,
        contribution:
          this.pointsToProb(factors.lineValue) * weights.lineValueWeight,
        description: 'Arbitrage value vs current Vegas lines',
      },
      {
        factor: 'Home Advantage',
        value: factors.homeAdvantage,
        weight: weights.homeAdvWeight,
        contribution:
          this.pointsToProb(factors.homeAdvantage) * weights.homeAdvWeight,
        description: 'Home field advantage and venue factors',
      },
      {
        factor: 'Rest Advantage',
        value: factors.restAdvantage,
        weight: weights.restWeight,
        contribution:
          this.pointsToProb(factors.restAdvantage) * weights.restWeight,
        description: 'Advantage from extra days of rest',
      },
      {
        factor: 'Divisional Rivalry',
        value: factors.divisionalFactor,
        weight: weights.divisionalWeight,
        contribution:
          this.pointsToProb(factors.divisionalFactor) * weights.divisionalWeight,
        description: 'Division game and rivalry factors',
      },
      {
        factor: 'Weather Impact',
        value: -factors.weatherPenalty,
        weight: weights.weatherPenaltyWeight,
        contribution:
          this.pointsToProb(-factors.weatherPenalty) *
          weights.weatherPenaltyWeight,
        description: 'Weather conditions affecting gameplay',
      },
      {
        factor: 'Injury Impact',
        value: -factors.injuryPenalty,
        weight: weights.injuryPenaltyWeight,
        contribution:
          this.pointsToProb(-factors.injuryPenalty) *
          weights.injuryPenaltyWeight,
        description: 'Impact of key player injuries',
      },
    ]
  }
}

/**
 * Default model weights from project requirements
 */
export const defaultModelWeights: ModelWeights['weights'] = {
  marketProbWeight: 0.37, // Reduced to make room for divisional factor
  eloWeight: 0.23, // Reduced to make room for divisional factor
  lineValueWeight: 0.23, // Reduced to make room for divisional factor
  homeAdvWeight: 0.05, // Kept same
  restWeight: 0.02, // Kept same
  divisionalWeight: 0.08, // NEW: Divisional rivalry factor (higher weight due to NFL unpredictability)
  weatherPenaltyWeight: 0.015, // Slightly reduced
  injuryPenaltyWeight: 0.005, // Slightly reduced
  kElo: 24,
  windThresholdMph: 15,
  precipProbThreshold: 0.3,
  qbOutPenalty: 12,
  olClusterPenalty: 3,
  dbClusterPenalty: 3,
}
