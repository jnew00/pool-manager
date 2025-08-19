import type {
  ModelInput,
  ModelOutput,
  GameFactors,
  FactorContribution,
  ModelWeights,
} from './types'
import { EloSystem } from './elo-system'
import { areTeamsDivisionRivals, getRivalryIntensity, RIVALRY_FACTORS } from './nfl-divisions'
import { analyzeRevengeGame, type RevengeGameResult } from './revenge-game'
import { NewsAnalysisService, type NewsAnalysisResult } from './news-analysis'
import { RecentFormAnalyzer, type FormComparisonResult } from './recent-form'
import { PlayoffImplicationsAnalyzer, type PlayoffImplicationsResult } from './playoff-implications'
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

    // 7. Revenge game motivation
    const revengeGameFactor = await this.calculateRevengeGameFactor(
      input.homeTeamId,
      input.awayTeamId,
      input.kickoffTime
    )

    // 8. Recent form factor
    const recentFormFactor = await this.calculateRecentFormFactor(
      input.homeTeamId,
      input.awayTeamId,
      input.kickoffTime,
      input.kickoffTime.getFullYear()
    )

    // 9. Playoff implications factor
    const playoffImplicationsFactor = await this.calculatePlayoffImplicationsFactor(
      input.homeTeamId,
      input.awayTeamId,
      input.kickoffTime
    )

    // 10. Weather penalty
    const weatherPenalty = this.calculateWeatherPenalty(
      input.weatherData,
      weights
    )

    // 11. Injury penalty
    const injuryPenalty = this.calculateInjuryPenalty(input.injuryData, weights)

    // 12. Weighted combination
    const rawConfidence = this.combineFactors(
      {
        marketProb,
        eloProb,
        lineValue,
        homeAdvantage,
        restAdvantage,
        divisionalFactor,
        revengeGameFactor,
        recentFormFactor,
        playoffImplicationsFactor,
        weatherPenalty,
        injuryPenalty,
      },
      weights
    )

    console.log(
      `[Confidence Engine] Raw calculation: marketProb=${marketProb}, eloProb=${eloProb}, homeAdv=${homeAdvantage}, rawConfidence=${rawConfidence}`
    )

    // 8. Scale to 0-100 and determine initial pick
    let adjustedConfidence =
      isNaN(rawConfidence) || !isFinite(rawConfidence)
        ? (() => {
            console.log(
              `[Confidence Engine] Using fallback! rawConfidence=${rawConfidence} (NaN: ${isNaN(rawConfidence)}, finite: ${isFinite(rawConfidence)})`
            )
            return 50.0
          })()
        : Math.max(0, Math.min(100, rawConfidence * 100))
    let recommendedPick: 'HOME' | 'AWAY' =
      rawConfidence > 0.5 ? 'HOME' : 'AWAY'

    // 9. News Analysis Tie-Breaking (for close games)
    let newsAnalysis: NewsAnalysisResult | null = null
    let newsAdjustment = 0
    const originalConfidence = adjustedConfidence
    const confidenceDifference = Math.abs(adjustedConfidence - 50)
    
    if (confidenceDifference <= 10) { // Only for games within 10 points of 50%
      console.log(`[Confidence Engine] Close game detected (${adjustedConfidence}%), applying news analysis tie-breaker`)
      
      try {
        const [homeTeam, awayTeam] = await Promise.all([
          prisma.team.findUnique({ where: { id: input.homeTeamId }, select: { name: true } }),
          prisma.team.findUnique({ where: { id: input.awayTeamId }, select: { name: true } })
        ])

        console.log(`[Confidence Engine] Teams found: Home=${homeTeam?.name}, Away=${awayTeam?.name}`)

        if (homeTeam && awayTeam) {
          console.log(`[Confidence Engine] Creating NewsAnalysisService and analyzing game`)
          const newsService = new NewsAnalysisService({
            useMockData: process.env.USE_MOCK_NEWS_DATA === 'true',
            confidenceRangeMin: Number(process.env.NEWS_ANALYSIS_MIN_RANGE) || 0,
            confidenceRangeMax: Number(process.env.NEWS_ANALYSIS_MAX_RANGE) || 10
          })
          newsAnalysis = await newsService.analyzeGame({
            gameId: input.gameId,
            homeTeamId: input.homeTeamId,
            awayTeamId: input.awayTeamId,
            homeTeamName: homeTeam.name,
            awayTeamName: awayTeam.name,
            kickoffTime: input.kickoffTime,
            venue: input.venue,
            confidenceDifference,
            currentHomeConfidence: adjustedConfidence,
            currentAwayConfidence: 100 - adjustedConfidence
          })

          console.log(`[Confidence Engine] News analysis result:`, {
            analysisConfidence: newsAnalysis?.analysisConfidence,
            recommendedTeam: newsAnalysis?.recommendedTeam,
            keyFactors: newsAnalysis?.keyFactors?.length,
            summary: newsAnalysis?.summary
          })

          // Apply news analysis adjustment if it has a recommendation
          if (newsAnalysis.recommendedTeam && newsAnalysis.analysisConfidence > 0) {
            const maxAdjustment = (newsAnalysis.analysisConfidence / 100) * 5 // Max 5 point adjustment
            
            if (newsAnalysis.recommendedTeam === 'HOME') {
              newsAdjustment = maxAdjustment
              adjustedConfidence = Math.min(100, adjustedConfidence + newsAdjustment)
              if (adjustedConfidence > 50) recommendedPick = 'HOME'
            } else {
              newsAdjustment = -maxAdjustment
              adjustedConfidence = Math.max(0, adjustedConfidence + newsAdjustment)
              if (adjustedConfidence < 50) recommendedPick = 'AWAY'
            }

            console.log(
              `[Confidence Engine] News analysis applied: ${newsAnalysis.recommendedTeam} (${newsAdjustment > 0 ? '+' : ''}${newsAdjustment.toFixed(1)} pts), new confidence: ${adjustedConfidence.toFixed(1)}%`
            )
          }
        }
      } catch (error) {
        console.warn('[Confidence Engine] News analysis failed:', error)
      }
    }

    // 12. Factor breakdown for UI
    const factorBreakdown = this.createFactorBreakdown(
      {
        marketProb,
        eloProb,
        lineValue,
        homeAdvantage,
        restAdvantage,
        divisionalFactor,
        revengeGameFactor,
        recentFormFactor,
        playoffImplicationsFactor,
        weatherPenalty,
        injuryPenalty,
        rawConfidence,
      },
      weights
    )

    // Show UI badge whenever news analysis was performed, regardless of confidence
    const finalNewsAnalysis = newsAnalysis ? {
      confidence: newsAnalysis.analysisConfidence,
      recommendedTeam: newsAnalysis.recommendedTeam,
      summary: newsAnalysis.summary,
      adjustment: newsAdjustment
    } : undefined

    console.log(`[Confidence Engine] Final newsAnalysis for UI:`, finalNewsAnalysis)

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
      revengeGameFactor,
      recentFormFactor,
      playoffImplicationsFactor,
      weatherPenalty,
      injuryPenalty,
      newsAnalysis: finalNewsAnalysis,
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
   * Calculate revenge game motivation factor
   */
  private async calculateRevengeGameFactor(
    homeTeamId: string,
    awayTeamId: string,
    gameDate: Date
  ): Promise<number> {
    try {
      const revengeAnalysis = await analyzeRevengeGame(
        homeTeamId,
        awayTeamId,
        gameDate,
        gameDate.getFullYear()
      )

      if (!revengeAnalysis.isRevengeGame) {
        return 0
      }

      // Apply revenge motivation to the motivated team
      // Positive value favors home team, negative favors away team
      let revengeAdjustment = 0

      if (revengeAnalysis.revengeTeamId === homeTeamId) {
        // Home team seeking revenge - positive adjustment
        revengeAdjustment = revengeAnalysis.revengeMotivation
      } else if (revengeAnalysis.revengeTeamId === awayTeamId) {
        // Away team seeking revenge - negative adjustment (favors away)
        revengeAdjustment = -revengeAnalysis.revengeMotivation
      }

      console.log(
        `[Revenge Game] Motivation: ${revengeAdjustment} points for team ${revengeAnalysis.revengeTeamId}`
      )

      return revengeAdjustment

    } catch (error) {
      console.error('Error calculating revenge game factor:', error)
      return 0
    }
  }

  /**
   * Calculate recent form factor based on last 4 games
   */
  private async calculateRecentFormFactor(
    homeTeamId: string,
    awayTeamId: string,
    gameDate: Date,
    season: number
  ): Promise<number> {
    try {
      const formAnalyzer = new RecentFormAnalyzer()
      const formComparison = await formAnalyzer.calculateFormComparison(
        homeTeamId,
        awayTeamId,
        gameDate,
        season,
        4 // Analyze last 4 games
      )

      // Convert form advantage to point spread adjustment
      // Form advantage is the difference in form scores (-100 to +100 each)
      // We'll convert this to a smaller point adjustment (max ~3 points)
      const formAdvantage = formComparison.formAdvantage
      const maxFormAdjustment = 3.0 // Maximum points from recent form
      
      // Scale form advantage (-200 to +200) to point adjustment (-3 to +3)
      const formAdjustment = Math.max(
        -maxFormAdjustment,
        Math.min(maxFormAdjustment, (formAdvantage / 200) * maxFormAdjustment * 2)
      )

      console.log(
        `[Recent Form] Home: ${formComparison.homeTeamForm.formScore.toFixed(1)} (${formComparison.homeTeamForm.recentTrend}), Away: ${formComparison.awayTeamForm.formScore.toFixed(1)} (${formComparison.awayTeamForm.recentTrend}), Adjustment: ${formAdjustment.toFixed(1)} points`
      )

      return formAdjustment

    } catch (error) {
      console.error('Error calculating recent form factor:', error)
      return 0
    }
  }

  /**
   * Calculate playoff implications factor
   */
  private async calculatePlayoffImplicationsFactor(
    homeTeamId: string,
    awayTeamId: string,
    gameDate: Date
  ): Promise<number> {
    try {
      const analyzer = new PlayoffImplicationsAnalyzer()
      const season = gameDate.getFullYear()
      const week = this.getWeekFromDate(gameDate, season)
      
      const playoffAnalysis = await analyzer.analyzePlayoffImplications(
        homeTeamId,
        awayTeamId,
        season,
        week
      )

      // Convert motivation difference to point spread adjustment
      const motivationFactor = analyzer.calculateMotivationFactor(
        playoffAnalysis.homeMotivation,
        playoffAnalysis.awayMotivation
      )

      console.log(
        `[Playoff Implications] Home motivation: ${(playoffAnalysis.homeMotivation * 100).toFixed(1)}%, Away motivation: ${(playoffAnalysis.awayMotivation * 100).toFixed(1)}%, Factor: ${motivationFactor.toFixed(2)} points`
      )

      return motivationFactor

    } catch (error) {
      console.error('Error calculating playoff implications factor:', error)
      return 0
    }
  }

  /**
   * Estimate NFL week from game date
   */
  private getWeekFromDate(gameDate: Date, season: number): number {
    // NFL season typically starts first Thursday after Labor Day (first Monday in September)
    const seasonStart = new Date(season, 8, 1) // September 1st as baseline
    
    // Find first Thursday of September
    while (seasonStart.getDay() !== 4) { // 4 = Thursday
      seasonStart.setDate(seasonStart.getDate() + 1)
    }
    
    const diffTime = gameDate.getTime() - seasonStart.getTime()
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
    
    return Math.max(1, Math.min(18, diffWeeks + 1))
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
      revengeGameFactor: number
      recentFormFactor: number
      playoffImplicationsFactor: number
      weatherPenalty: number
      injuryPenalty: number
    },
    weights: ModelInput['weights']
  ): number {
    // Convert point spreads to probability adjustments
    const homeAdvProb = this.pointsToProb(factors.homeAdvantage)
    const restAdvProb = this.pointsToProb(factors.restAdvantage)
    const divisionalProb = this.pointsToProb(factors.divisionalFactor)
    const revengeGameProb = this.pointsToProb(factors.revengeGameFactor)
    const recentFormProb = this.pointsToProb(factors.recentFormFactor)
    const playoffImplicationsProb = this.pointsToProb(factors.playoffImplicationsFactor)
    const weatherPenaltyProb = this.pointsToProb(-factors.weatherPenalty)
    const injuryPenaltyProb = this.pointsToProb(-factors.injuryPenalty)
    const lineValueProb = this.pointsToProb(factors.lineValue)

    console.log(`[Confidence Engine] Weights:`, weights)
    console.log(
      `[Confidence Engine] Probability conversions: homeAdv=${homeAdvProb}, rest=${restAdvProb}, divisional=${divisionalProb} (${factors.divisionalFactor} pts), revenge=${revengeGameProb} (${factors.revengeGameFactor} pts), recentForm=${recentFormProb} (${factors.recentFormFactor} pts), lineValue=${lineValueProb} (${factors.lineValue} pts)`
    )

    const marketWeight = weights.marketProbWeight || 0.335
    const eloWeight = weights.eloWeight || 0.215
    const lineValueWeight = weights.lineValueWeight || 0.215
    const homeAdvWeight = weights.homeAdvWeight || 0.050
    const restWeight = weights.restWeight || 0.02
    const divisionalWeight = weights.divisionalWeight || 0.065
    const revengeGameWeight = weights.revengeGameWeight || 0.05
    const recentFormWeight = weights.recentFormWeight || 0.025
    const playoffImplicationsWeight = weights.playoffImplicationsWeight || 0.015
    const weatherWeight = weights.weatherPenaltyWeight || 0.005
    const injuryWeight = weights.injuryPenaltyWeight || 0.005

    // Weighted combination
    const weightedProb =
      factors.marketProb * marketWeight +
      factors.eloProb * eloWeight +
      lineValueProb * lineValueWeight +
      homeAdvProb * homeAdvWeight +
      restAdvProb * restWeight +
      divisionalProb * divisionalWeight +
      revengeGameProb * revengeGameWeight +
      recentFormProb * recentFormWeight +
      playoffImplicationsProb * playoffImplicationsWeight +
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
      revengeGameWeight +
      recentFormWeight +
      playoffImplicationsWeight +
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
      revengeGameFactor: number
      recentFormFactor: number
      playoffImplicationsFactor: number
      weatherPenalty: number
      injuryPenalty: number
      rawConfidence: number
    },
    weights: ModelInput['weights']
  ): FactorContribution[] {
    // Handle both camelCase and snake_case property names
    const getWeight = (camelCase: string, snakeCase: string) => {
      return (weights as any)[camelCase] ?? (weights as any)[snakeCase] ?? 0
    }

    return [
      {
        factor: 'Market Probability',
        value: factors.marketProb,
        weight: getWeight('marketProbWeight', 'market_prob_weight'),
        contribution: factors.marketProb * getWeight('marketProbWeight', 'market_prob_weight'),
        description: 'Implied probability from betting lines',
      },
      {
        factor: 'Elo Rating',
        value: factors.eloProb,
        weight: getWeight('eloWeight', 'elo_weight'),
        contribution: factors.eloProb * getWeight('eloWeight', 'elo_weight'),
        description: 'Team strength based on historical performance',
      },
      {
        factor: 'Line Value',
        value: factors.lineValue,
        weight: getWeight('lineValueWeight', 'line_value_weight'),
        contribution:
          this.pointsToProb(factors.lineValue) * getWeight('lineValueWeight', 'line_value_weight'),
        description: 'Arbitrage value vs current Vegas lines',
      },
      {
        factor: 'Home Advantage',
        value: factors.homeAdvantage,
        weight: getWeight('homeAdvWeight', 'home_adv_weight'),
        contribution:
          this.pointsToProb(factors.homeAdvantage) * getWeight('homeAdvWeight', 'home_adv_weight'),
        description: 'Home field advantage and venue factors',
      },
      {
        factor: 'Rest Advantage',
        value: factors.restAdvantage,
        weight: getWeight('restWeight', 'rest_weight'),
        contribution:
          this.pointsToProb(factors.restAdvantage) * getWeight('restWeight', 'rest_weight'),
        description: 'Advantage from extra days of rest',
      },
      {
        factor: 'Divisional Rivalry',
        value: factors.divisionalFactor,
        weight: getWeight('divisionalWeight', 'divisional_weight'),
        contribution:
          this.pointsToProb(factors.divisionalFactor) * getWeight('divisionalWeight', 'divisional_weight'),
        description: 'Division game and rivalry factors',
      },
      {
        factor: 'Revenge Game',
        value: factors.revengeGameFactor,
        weight: getWeight('revengeGameWeight', 'revenge_game_weight'),
        contribution:
          this.pointsToProb(factors.revengeGameFactor) * getWeight('revengeGameWeight', 'revenge_game_weight'),
        description: 'Motivation from previous season matchups',
      },
      {
        factor: 'Recent Form',
        value: factors.recentFormFactor,
        weight: getWeight('recentFormWeight', 'recent_form_weight'),
        contribution:
          this.pointsToProb(factors.recentFormFactor) * getWeight('recentFormWeight', 'recent_form_weight'),
        description: 'Team performance in last 4 games',
      },
      {
        factor: 'Playoff Implications',
        value: factors.playoffImplicationsFactor,
        weight: getWeight('playoffImplicationsWeight', 'playoff_implications_weight'),
        contribution:
          this.pointsToProb(factors.playoffImplicationsFactor) * getWeight('playoffImplicationsWeight', 'playoff_implications_weight'),
        description: 'Motivation from playoff positioning and pressure',
      },
      {
        factor: 'Weather Impact',
        value: -factors.weatherPenalty,
        weight: getWeight('weatherPenaltyWeight', 'weather_penalty_weight'),
        contribution:
          this.pointsToProb(-factors.weatherPenalty) *
          getWeight('weatherPenaltyWeight', 'weather_penalty_weight'),
        description: 'Weather conditions affecting gameplay',
      },
      {
        factor: 'Injury Impact',
        value: -factors.injuryPenalty,
        weight: getWeight('injuryPenaltyWeight', 'injury_penalty_weight'),
        contribution:
          this.pointsToProb(-factors.injuryPenalty) *
          getWeight('injuryPenaltyWeight', 'injury_penalty_weight'),
        description: 'Impact of key player injuries',
      },
    ]
  }
}

/**
 * Default model weights from project requirements
 */
export const defaultModelWeights: ModelWeights['weights'] = {
  marketProbWeight: 0.335, // Market probability weight
  eloWeight: 0.215, // Elo rating weight
  lineValueWeight: 0.215, // Line value weight
  homeAdvWeight: 0.050, // Reduced from 0.055 to make room for playoff implications
  restWeight: 0.02, // Rest advantage weight
  divisionalWeight: 0.065, // Divisional rivalry weight
  revengeGameWeight: 0.05, // Revenge game motivation factor
  recentFormWeight: 0.025, // Recent form factor (team performance last 4 games)
  playoffImplicationsWeight: 0.015, // Playoff implications factor (motivation from playoff positioning)
  weatherPenaltyWeight: 0.005, // Reduced from 0.010 to make weights sum to 1.0
  injuryPenaltyWeight: 0.005, // Injury penalty weight
  kElo: 24,
  windThresholdMph: 15,
  precipProbThreshold: 0.3,
  qbOutPenalty: 12,
  olClusterPenalty: 3,
  dbClusterPenalty: 3,
}
