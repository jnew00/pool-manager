import { prisma } from '@/lib/prisma'
import type { Game, Line, Team } from '@/lib/types/database'
import { ConfidenceEngine } from './confidence-engine'
import type { ModelInput, ModelWeights } from './types'

export interface PointsPlusGameAnalysis {
  gameId: string
  homeTeam: Team
  awayTeam: Team
  spread: number
  total: number
  favorite: {
    teamId: string
    team: Team
    spread: number
    expectedMargin: number
    confidence: number
    riskLevel: 'low' | 'medium' | 'high'
  }
  underdog: {
    teamId: string
    team: Team
    spread: number
    expectedCover: number
    upsetPotential: number
    riskLevel: 'low' | 'medium' | 'high'
  }
  isPickEm: boolean
  recommendation:
    | 'strong_favorite'
    | 'lean_favorite'
    | 'avoid'
    | 'lean_underdog'
    | 'strong_underdog'
  strategicValue: number // 0-100 score
  notes: string[]
  confidenceEngineFactors?: any // Include the raw confidence engine analysis
}

export interface PointsPlusWeekStrategy {
  week: number
  availableGames: PointsPlusGameAnalysis[]
  strategy: PointsPlusStrategyConfig
  recommendations: {
    favorites: PointsPlusGameAnalysis[]
    underdogs: PointsPlusGameAnalysis[]
    totalExpectedPoints: number
    riskProfile: 'conservative' | 'balanced' | 'aggressive'
  }
}

export interface PointsPlusStrategyConfig {
  mode: 'conservative' | 'balanced' | 'aggressive' | 'custom'
  pickCount: 'minimum' | 'optimal' | 'maximum' // 4, 6-8, or all games
  favoriteThreshold: number // Min spread to consider picking favorite (-7 default)
  underdogThreshold: number // Max spread to consider underdog (+10 default)
  avoidDivisional: boolean // Divisional games are unpredictable
  avoidPrimeTime: boolean // Primetime games have different dynamics
  homeFieldWeight: number // 0-1, how much to weight home field advantage
  recentFormWeight: number // 0-1, how much to weight recent performance
  weatherImpactThreshold: number // Wind speed/precipitation threshold
  // Advanced strategy factors based on research
  favorKeyNumbers: boolean // Focus on key numbers (3, 7, 10, 14)
  homeUnderdogBonus: number // Extra value for home underdogs (0-1)
  blowoutAvoidance: boolean // Avoid picking for large margins (>14)
  closeGameFocus: boolean // Prefer games with spreads <=7
  motivationalFactors: boolean // Consider revenge games, bounce-back spots
}

export class PointsPlusStrategyEngine {
  private config: PointsPlusStrategyConfig
  private confidenceEngine: ConfidenceEngine

  constructor(config?: Partial<PointsPlusStrategyConfig>) {
    this.config = {
      mode: config?.mode || 'balanced',
      pickCount: config?.pickCount || 'optimal',
      favoriteThreshold: config?.favoriteThreshold || -7,
      underdogThreshold: config?.underdogThreshold || 10,
      avoidDivisional: config?.avoidDivisional ?? false,
      avoidPrimeTime: config?.avoidPrimeTime ?? false,
      homeFieldWeight: config?.homeFieldWeight || 0.3,
      recentFormWeight: config?.recentFormWeight || 0.4,
      weatherImpactThreshold: config?.weatherImpactThreshold || 15,
      // Advanced strategy factors
      favorKeyNumbers: config?.favorKeyNumbers ?? true,
      homeUnderdogBonus: config?.homeUnderdogBonus || 0.15,
      blowoutAvoidance: config?.blowoutAvoidance ?? true,
      closeGameFocus: config?.closeGameFocus ?? true,
      motivationalFactors: config?.motivationalFactors ?? true,
    }
    this.confidenceEngine = new ConfidenceEngine()
  }

  /**
   * Analyze all games for a given week
   */
  async analyzeWeek(
    season: number,
    week: number,
    poolId?: string
  ): Promise<PointsPlusWeekStrategy> {
    // Get all games for the week with spreads
    // First try to get pool-specific lines, then fall back to general lines
    let games = await prisma.game.findMany({
      where: { season, week },
      include: {
        homeTeam: true,
        awayTeam: true,
        lines: poolId
          ? { where: { poolId } }
          : { where: { source: 'user_provided' } },
      },
    })

    // If we have a poolId but found no lines, try getting games with any lines
    if (poolId) {
      const gamesWithPoolLines = games.filter(g => g.lines.length > 0)
      if (gamesWithPoolLines.length === 0) {
        console.log(`No pool-specific lines found for pool ${poolId}, falling back to general lines`)
        games = await prisma.game.findMany({
          where: { season, week },
          include: {
            homeTeam: true,
            awayTeam: true,
            lines: {
              where: {
                OR: [
                  { poolId: null },
                  { source: 'ESPN' },
                  { source: 'user_provided' }
                ]
              },
              take: 1, // Just take the first available line
              orderBy: [
                { poolId: 'desc' }, // Prefer pool-specific if any exist
                { capturedAt: 'desc' } // Otherwise use most recent
              ]
            },
          },
        })
      }
    }

    const analyses: PointsPlusGameAnalysis[] = []

    for (const game of games) {
      const analysis = await this.analyzeGame(game)
      if (analysis && !analysis.isPickEm) {
        // Exclude pick'em games from Points Plus
        analyses.push(analysis)
      }
    }

    // Sort by strategic value
    analyses.sort((a, b) => b.strategicValue - a.strategicValue)

    // Generate recommendations based on strategy
    const recommendations = this.generateRecommendations(analyses)

    return {
      week,
      availableGames: analyses,
      strategy: this.config,
      recommendations,
    }
  }

  /**
   * Analyze a single game for Points Plus value
   */
  private async analyzeGame(
    game: Game & { homeTeam: Team; awayTeam: Team; lines: Line[] }
  ): Promise<PointsPlusGameAnalysis | null> {
    const line = game.lines[0]
    if (!line?.spread) return null

    const spread = Number(line.spread)
    const total = Number(line.total || 0)
    const isPickEm = Math.abs(spread) < 0.5

    // Get weather data from game's apiRefs if available
    const weatherData =
      game.apiRefs &&
      typeof game.apiRefs === 'object' &&
      'weather' in game.apiRefs
        ? (game.apiRefs as any).weather
        : null
    const weatherPenalty = weatherData
      ? this.calculateWeatherPenalty(weatherData)
      : 0

    // Determine favorite and underdog
    const homeIsFavorite = spread < 0
    const favorite = homeIsFavorite ? game.homeTeam : game.awayTeam
    const underdog = homeIsFavorite ? game.awayTeam : game.homeTeam
    const favoriteSpread = Math.abs(spread)

    // Use sophisticated confidence engine for advanced analysis
    let confidenceEngineResult = null
    try {
      // Build ModelInput for confidence engine
      const modelInput: ModelInput = {
        gameId: game.id,
        homeTeamId: game.homeTeam.id,
        awayTeamId: game.awayTeam.id,
        poolType: 'POINTS_PLUS',
        kickoffTime: new Date(game.kickoff),
        venue: game.venue || '',
        marketData: {
          spread: spread,
          total: total,
          moneylineHome: line.moneylineHome
            ? Number(line.moneylineHome)
            : undefined,
          moneylineAway: line.moneylineAway
            ? Number(line.moneylineAway)
            : undefined,
        },
        currentMarketData: {
          spread: spread,
          total: total,
          moneylineHome: line.moneylineHome
            ? Number(line.moneylineHome)
            : undefined,
          moneylineAway: line.moneylineAway
            ? Number(line.moneylineAway)
            : undefined,
        },
        restData: {
          homeDaysRest: 7, // Default for weekly NFL
          awayDaysRest: 7,
          advantage: 0, // Equal rest for both teams
        },
        weatherData: weatherData,
        injuryData: {
          homeTeamPenalty: 0,
          awayTeamPenalty: 0,
          totalPenalty: 0,
          qbImpact: false,
          lineImpact: false,
          secondaryImpact: false,
        },
        weights: this.getModelWeights().weights,
      }

      confidenceEngineResult =
        await this.confidenceEngine.calculateConfidence(modelInput)
    } catch (error) {
      console.error(
        `Failed to run confidence engine for game ${game.id}:`,
        error
      )
    }

    // Calculate base values using our fallback methods
    let expectedMargin = this.calculateExpectedMargin(
      favoriteSpread,
      total,
      weatherPenalty
    )
    let confidence = this.calculateConfidence(
      favoriteSpread,
      total,
      weatherPenalty
    )
    let upsetPotential = this.calculateUpsetPotential(
      favoriteSpread,
      game,
      weatherPenalty
    )

    // Enhance with confidence engine if available
    if (confidenceEngineResult) {
      confidence = confidenceEngineResult.confidence

      // Only use confidence engine score prediction if it exists
      if (confidenceEngineResult.tieBreakerData?.scorePrediction) {
        const scorePred = confidenceEngineResult.tieBreakerData.scorePrediction
        const homePredicted = scorePred.homeScore
        const awayPredicted = scorePred.awayScore

        // Expected margin for the favorite (always positive)
        expectedMargin = homeIsFavorite
          ? Math.max(0.1, homePredicted - awayPredicted) // Home is favorite, should win by this much
          : Math.max(0.1, awayPredicted - homePredicted) // Away is favorite, should win by this much
      }
      // If no score prediction, keep the calculated expectedMargin from fallback method

      // Calculate upset potential based on confidence engine confidence
      upsetPotential = homeIsFavorite ? 100 - confidence : confidence
    }

    // Determine risk levels
    const favoriteRisk = this.assessFavoriteRisk(favoriteSpread, game)
    const underdogRisk = this.assessUnderdogRisk(favoriteSpread, game)

    // Calculate strategic value (0-100) - PRIMARILY use confidence engine if available
    const strategicValue = confidenceEngineResult?.confidence
      ? this.calculateStrategicValueFromConfidenceEngine(
          confidenceEngineResult,
          favoriteSpread,
          homeIsFavorite
        )
      : this.calculateStrategicValue(
          favoriteSpread,
          confidence,
          upsetPotential,
          game,
          weatherPenalty
        )

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      favoriteSpread,
      confidence,
      upsetPotential
    )

    // Generate strategy notes (including weather and confidence engine insights)
    const notes = this.generateNotes(
      game,
      favoriteSpread,
      confidence,
      weatherData,
      confidenceEngineResult
    )

    return {
      gameId: game.id,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      spread,
      total,
      favorite: {
        teamId: favorite.id,
        team: favorite,
        spread: -favoriteSpread,
        expectedMargin,
        confidence,
        riskLevel: favoriteRisk,
      },
      underdog: {
        teamId: underdog.id,
        team: underdog,
        spread: favoriteSpread,
        expectedCover: 100 - confidence,
        upsetPotential,
        riskLevel: underdogRisk,
      },
      isPickEm,
      recommendation,
      strategicValue,
      notes,
      confidenceEngineFactors: confidenceEngineResult?.factors, // Include the detailed factors
    }
  }

  /**
   * Calculate weather penalty for outdoor games
   */
  private calculateWeatherPenalty(weatherData: any): number {
    if (!weatherData || weatherData.isDome) return 0

    let penalty = 0

    // Wind penalty (affects passing/kicking accuracy)
    if (
      weatherData.windSpeed &&
      weatherData.windSpeed > this.config.weatherImpactThreshold
    ) {
      const excessWind =
        weatherData.windSpeed - this.config.weatherImpactThreshold
      penalty += excessWind * 0.15 // 0.15 points per mph over threshold
    }

    // Precipitation penalty (affects ball handling)
    if (
      weatherData.precipitationChance &&
      weatherData.precipitationChance > 40
    ) {
      const excessPrecip = weatherData.precipitationChance - 40
      penalty += excessPrecip * 0.05 // 0.05 points per % over 40%
    }

    // Temperature penalties
    if (weatherData.temperature !== undefined) {
      if (weatherData.temperature < 20) {
        // Cold weather penalty (affects ball handling, kicking)
        penalty += (20 - weatherData.temperature) * 0.1
      } else if (weatherData.temperature > 90) {
        // Hot weather penalty (affects player performance)
        penalty += (weatherData.temperature - 90) * 0.05
      }
    }

    return Math.min(penalty, 5) // Cap at 5 points maximum penalty
  }

  /**
   * Calculate expected margin of victory (for the favorite - always positive)
   */
  private calculateExpectedMargin(
    favoriteSpread: number,
    total: number,
    weatherPenalty: number = 0
  ): number {
    // Base expected margin is the favorite spread (should be positive)
    let margin = Math.abs(favoriteSpread)

    // Adjust for total (high-scoring games have more variance)
    if (total > 50) {
      margin *= 1.1 // Higher variance in high-scoring games
    } else if (total < 40) {
      margin *= 0.95 // Lower variance in low-scoring games
    }

    // Weather reduces expected margin (games closer to spread)
    if (weatherPenalty > 0) {
      margin *= 1 - weatherPenalty * 0.02 // Reduce margin by 2% per weather point
    }

    return Math.round(Math.max(0.1, margin) * 10) / 10 // Ensure at least 0.1 point margin
  }

  /**
   * Calculate confidence in the favorite covering
   */
  private calculateConfidence(
    spread: number,
    total: number,
    weatherPenalty: number = 0
  ): number {
    // Base confidence from spread
    let confidence = 50 + spread * 2.5

    // Cap confidence
    confidence = Math.min(Math.max(confidence, 20), 85)

    // Adjust for total
    if (total > 50) {
      confidence -= 5 // Less predictable
    } else if (total < 40) {
      confidence += 3 // More predictable
    }

    // Weather reduces confidence (makes games less predictable)
    if (weatherPenalty > 0) {
      confidence -= weatherPenalty * 3 // Reduce confidence by 3% per weather point
    }

    return Math.round(Math.max(confidence, 15)) // Minimum 15% confidence
  }

  /**
   * Calculate upset potential for underdog
   */
  private calculateUpsetPotential(
    spread: number,
    game: any,
    weatherPenalty: number = 0
  ): number {
    let potential = 50 - spread * 2.5

    // Home underdogs get a boost
    const homeIsFavorite = game.lines[0]?.spread < 0
    if (!homeIsFavorite) {
      potential += 10 // Home underdog advantage
    }

    // Divisional games increase upset potential
    if (this.isDivisionalGame(game)) {
      potential += 15
    }

    // Weather increases upset potential (makes games less predictable)
    if (weatherPenalty > 0) {
      potential += weatherPenalty * 4 // Increase upset chance by 4% per weather point
    }

    return Math.min(Math.max(potential, 5), 75)
  }

  /**
   * Assess risk level for picking the favorite
   */
  private assessFavoriteRisk(
    spread: number,
    game: any
  ): 'low' | 'medium' | 'high' {
    if (spread >= 10) return 'low'
    if (spread >= 7) return 'medium'
    if (spread >= 3.5) return 'high'
    return 'high'
  }

  /**
   * Assess risk level for picking the underdog
   */
  private assessUnderdogRisk(
    spread: number,
    game: any
  ): 'low' | 'medium' | 'high' {
    if (spread <= 3.5) return 'low'
    if (spread <= 7) return 'medium'
    return 'high'
  }

  /**
   * Calculate strategic value using confidence engine's sophisticated analysis
   */
  private calculateStrategicValueFromConfidenceEngine(
    confidenceEngineResult: any,
    favoriteSpread: number,
    homeIsFavorite: boolean
  ): number {
    const factors = confidenceEngineResult.factors
    const confidence = confidenceEngineResult.confidence

    // Start with confidence as base (50-100 range)
    let value = Math.max(30, confidence)

    // Add sophisticated factor bonuses/penalties (each factor can add/subtract up to 10 points)

    // Market efficiency and line value (very important for Points Plus)
    if (factors.lineValue) {
      const lineValueBonus = Math.abs(factors.lineValue) * 15 // Up to 15 point bonus for good line value
      value += lineValueBonus
    }

    // Elo rating advantage (fundamental team strength)
    if (factors.eloContribution) {
      const eloBonus = Math.abs(factors.eloContribution) * 10 // Up to 10 point bonus
      value += eloBonus
    }

    // Weather impacts (especially important for totals and margins)
    if (factors.weatherPenalty && factors.weatherPenalty < 0) {
      // Bad weather can create opportunities for underdog value
      const weatherFactor = Math.abs(factors.weatherPenalty) * 8
      if (favoriteSpread <= 7) {
        // Close games get bonus in bad weather
        value += weatherFactor
      } else {
        // Big favorites penalized in bad weather
        value -= weatherFactor * 0.5
      }
    }

    // Divisional games (unpredictable, could help or hurt)
    if (factors.divisionalFactor && Math.abs(factors.divisionalFactor) > 0.01) {
      if (favoriteSpread <= 7) {
        // Close divisional games are valuable
        value += 8
      } else {
        // Big divisional spreads are risky
        value -= 5
      }
    }

    // Revenge game motivation
    if (
      factors.revengeGameFactor &&
      Math.abs(factors.revengeGameFactor) > 0.01
    ) {
      value += Math.abs(factors.revengeGameFactor) * 12 // Revenge games create value
    }

    // Recent form trends
    if (factors.recentFormFactor && Math.abs(factors.recentFormFactor) > 0.01) {
      value += Math.abs(factors.recentFormFactor) * 8 // Form trends matter
    }

    // Playoff implications (desperation/motivation factor)
    if (
      factors.playoffImplicationsFactor &&
      Math.abs(factors.playoffImplicationsFactor) > 0.01
    ) {
      value += Math.abs(factors.playoffImplicationsFactor) * 10 // High stakes = value
    }

    // Home field advantage
    if (factors.homeAdvantage) {
      const homeBonus = Math.abs(factors.homeAdvantage) * 6
      if (homeIsFavorite) {
        value += homeBonus // Home favorites get boost
      } else {
        value += homeBonus * 1.3 // Home underdogs get bigger boost
      }
    }

    // Travel/scheduling factors
    if (
      factors.travelScheduleFactor &&
      Math.abs(factors.travelScheduleFactor) > 0.01
    ) {
      value += Math.abs(factors.travelScheduleFactor) * 7
    }

    // News analysis (sentiment and information edge)
    if (factors.newsAnalysis && factors.newsAnalysis.analysisConfidence > 0) {
      const newsBonus = (factors.newsAnalysis.analysisConfidence / 100) * 8
      value += newsBonus
    }

    // Injury impacts
    if (factors.injuryPenalty && factors.injuryPenalty < 0) {
      const injuryFactor = Math.abs(factors.injuryPenalty) * 6
      // Injuries create opportunities for underdogs, problems for favorites
      if (favoriteSpread >= 7) {
        value -= injuryFactor // Big favorites hurt more by injuries
      } else {
        value += injuryFactor * 0.5 // Close games get slight boost from injury uncertainty
      }
    }

    return Math.min(Math.max(Math.round(value), 0), 100)
  }

  /**
   * Calculate overall strategic value of the game (fallback method)
   */
  private calculateStrategicValue(
    spread: number,
    confidence: number,
    upsetPotential: number,
    game: any,
    weatherPenalty: number = 0,
    confidenceEngineResult?: any
  ): number {
    let value = 50

    // Base calculation - enhanced if we have confidence engine data
    if (confidenceEngineResult?.factors) {
      // Use sophisticated multi-factor analysis for more accurate strategic value
      const factors = confidenceEngineResult.factors

      // Weight factors based on Points Plus strategy importance
      value =
        30 +
        // Base 30 points
        ((factors.marketProbContribution || 0) * 15 +
          (factors.eloContribution || 0) * 12 +
          (factors.divisionalFactor || 0) * 8 +
          (factors.revengeGameFactor || 0) * 6 +
          (factors.recentFormFactor || 0) * 8 +
          (factors.playoffImplicationsFactor || 0) * 5 +
          (factors.lineValue || 0) * 10 +
          (factors.homeAdvantage || 0) * 6) *
          100 // Scale to 0-70 range (30 base + 70 max from factors)
    } else {
      // Fallback to original calculation
      // Favorites: High confidence + big spread = high value
      if (spread >= this.config.favoriteThreshold * -1) {
        value = confidence * 0.8 + (spread / 20) * 20
      }
      // Underdogs: Low spread + high upset potential = high value
      else if (spread <= this.config.underdogThreshold) {
        value = upsetPotential * 0.8 + ((20 - spread) / 20) * 20
      }
    }

    // RESEARCH-BASED ENHANCEMENTS

    // Key Numbers Bonus (3, 7, 10, 14 are most common margins)
    if (this.config.favorKeyNumbers) {
      const keyNumbers = [3, 7, 10, 14]
      const absSpread = Math.abs(spread)
      if (keyNumbers.some((key) => Math.abs(absSpread - key) <= 0.5)) {
        value += 10 // Bonus for games near key numbers
      }
    }

    // Home Underdog Bonus (research shows they outperform expectations)
    if (this.config.homeUnderdogBonus > 0) {
      const homeIsFavorite = game.lines[0]?.spread < 0
      if (!homeIsFavorite && spread <= 7) {
        // Home underdog in close game
        value += this.config.homeUnderdogBonus * 100
      }
    }

    // Blowout Avoidance (margins >14 are rare, per research)
    if (this.config.blowoutAvoidance && Math.abs(spread) > 14) {
      value *= 0.7 // Penalty for large spreads
    }

    // Close Game Focus (most games decided by 7 or less)
    if (this.config.closeGameFocus && Math.abs(spread) <= 7) {
      value += 15 // Bonus for close games
    }

    // Weather Impact (bad weather makes games unpredictable but favors underdogs)
    if (weatherPenalty > 0) {
      if (spread <= 7) {
        // Small spreads get bonus in bad weather (more upsets)
        value += weatherPenalty * 5
      } else {
        // Large spreads get penalty in bad weather (harder to cover)
        value -= weatherPenalty * 3
      }
    }

    // Divisional Game Penalties (more unpredictable)
    if (this.config.avoidDivisional && this.isDivisionalGame(game)) {
      value *= 0.8
    }

    // Prime Time Penalties (public betting skews lines)
    if (this.config.avoidPrimeTime && this.isPrimeTimeGame(game)) {
      value *= 0.9
    }

    return Math.min(Math.max(Math.round(value), 0), 100)
  }

  /**
   * Generate recommendation for a game
   */
  private generateRecommendation(
    spread: number,
    confidence: number,
    upsetPotential: number
  ): PointsPlusGameAnalysis['recommendation'] {
    // Strong favorites (big spreads with high confidence)
    if (spread >= 7 && confidence >= 65) return 'strong_favorite'
    if (spread >= 4 && confidence >= 60) return 'lean_favorite'

    // Strong underdogs (small spreads with good upset potential)
    if (spread <= 3 && upsetPotential >= 35) return 'strong_underdog'
    if (spread <= 6 && upsetPotential >= 30) return 'lean_underdog'

    // Medium confidence favorites
    if (spread >= 3.5 && confidence >= 55) return 'lean_favorite'

    // Medium upset potential underdogs
    if (spread <= 10 && upsetPotential >= 25) return 'lean_underdog'

    // Default to avoid for very close games or low confidence
    return 'avoid'
  }

  /**
   * Generate strategy notes for a game
   */
  private generateNotes(
    game: any,
    spread: number,
    confidence: number,
    weatherData?: any,
    confidenceEngineResult?: any
  ): string[] {
    const notes: string[] = []
    const absSpread = Math.abs(spread)

    // Add sophisticated confidence engine insights
    if (confidenceEngineResult?.factors) {
      const factors = confidenceEngineResult.factors

      // News analysis insights
      if (factors.newsAnalysis?.summary) {
        notes.push(`News Analysis: ${factors.newsAnalysis.summary}`)
      }

      // Revenge game factors
      if (
        factors.revengeGameFactor &&
        Math.abs(factors.revengeGameFactor) > 0.02
      ) {
        notes.push(
          `Revenge game factor: ${factors.revengeGameFactor > 0 ? 'favors home' : 'favors away'}`
        )
      }

      // Recent form insights
      if (
        factors.recentFormFactor &&
        Math.abs(factors.recentFormFactor) > 0.02
      ) {
        notes.push(
          `Recent form: ${factors.recentFormFactor > 0 ? 'home trending up' : 'away trending up'}`
        )
      }

      // Playoff implications
      if (
        factors.playoffImplicationsFactor &&
        Math.abs(factors.playoffImplicationsFactor) > 0.01
      ) {
        notes.push(
          `Playoff implications: ${factors.playoffImplicationsFactor > 0 ? 'home has more to play for' : 'away has more to play for'}`
        )
      }

      // Travel/scheduling advantages
      if (
        factors.travelScheduleFactor &&
        Math.abs(factors.travelScheduleFactor) > 0.01
      ) {
        notes.push(
          `Travel/scheduling: ${factors.travelScheduleFactor > 0 ? 'home has advantage' : 'away has advantage'}`
        )
      }
    }

    // Margin analysis based on research
    if (absSpread >= 14) {
      notes.push('Large spread - blowouts are rare (avoid if possible)')
    } else if (absSpread >= 10) {
      notes.push('Strong favorite - solid value for Points Plus')
    } else if (absSpread <= 3) {
      notes.push('Close game - most common NFL outcome')
    } else if (absSpread <= 7) {
      notes.push('Competitive game - 67% of NFL games decided by ≤7')
    }

    // Key numbers analysis
    const keyNumbers = [3, 7, 10, 14]
    if (keyNumbers.some((key) => Math.abs(absSpread - key) <= 0.5)) {
      const nearestKey = keyNumbers.reduce((prev, curr) =>
        Math.abs(curr - absSpread) < Math.abs(prev - absSpread) ? curr : prev
      )
      notes.push(`Near key number ${nearestKey} - common margin in NFL`)
    }

    // Home underdog bonus (research-backed)
    const homeIsFavorite = game.lines[0]?.spread < 0
    if (!homeIsFavorite && absSpread <= 7) {
      notes.push('Home underdog - historically outperforms expectations')
    }

    // Divisional considerations
    if (this.isDivisionalGame(game)) {
      notes.push('Divisional rivalry - games often closer than spread')
    }

    // Prime time considerations
    if (this.isPrimeTimeGame(game)) {
      notes.push('Prime time - public betting can inflate favorites')
    }

    // Weather considerations
    if (weatherData && !weatherData.isDome) {
      if (
        weatherData.windSpeed &&
        weatherData.windSpeed > this.config.weatherImpactThreshold
      ) {
        notes.push(
          `High winds (${weatherData.windSpeed} mph) - affects passing/kicking`
        )
      }
      if (
        weatherData.precipitationChance &&
        weatherData.precipitationChance > 40
      ) {
        notes.push(
          `Rain likely (${weatherData.precipitationChance}%) - impacts ball handling`
        )
      }
      if (weatherData.temperature !== undefined) {
        if (weatherData.temperature < 32) {
          notes.push(
            `Freezing conditions (${weatherData.temperature}°F) - affects performance`
          )
        } else if (weatherData.temperature > 90) {
          notes.push(
            `Hot weather (${weatherData.temperature}°F) - player fatigue factor`
          )
        }
      }
    } else if (weatherData?.isDome) {
      notes.push('Dome game - no weather impact')
    }

    return notes
  }

  /**
   * Generate pick recommendations based on strategy
   */
  private generateRecommendations(
    analyses: PointsPlusGameAnalysis[]
  ): PointsPlusWeekStrategy['recommendations'] {
    // Create a list of all possible picks (both sides of each game) with their expected values
    const allPossiblePicks: Array<{
      game: PointsPlusGameAnalysis
      side: 'favorite' | 'underdog'
      expectedValue: number
      strategicValue: number
    }> = []

    for (const game of analyses) {
      // Calculate expected value for picking the favorite
      const favoriteExpectedValue =
        (game.favorite.confidence / 100) * game.favorite.expectedMargin

      // Calculate expected value for picking the underdog
      const upsetChance = game.underdog.upsetPotential / 100
      const underdogExpectedValue =
        upsetChance * game.underdog.spread +
        (1 - upsetChance) * -game.underdog.spread

      // Add both sides as possible picks
      allPossiblePicks.push({
        game,
        side: 'favorite',
        expectedValue: isFinite(favoriteExpectedValue)
          ? favoriteExpectedValue
          : 0,
        strategicValue: game.strategicValue,
      })

      allPossiblePicks.push({
        game,
        side: 'underdog',
        expectedValue: isFinite(underdogExpectedValue)
          ? underdogExpectedValue
          : 0,
        strategicValue: game.strategicValue,
      })
    }

    // Sort all possible picks by expected value (highest first)
    allPossiblePicks.sort((a, b) => {
      // Primary sort: expected value
      if (Math.abs(b.expectedValue - a.expectedValue) > 0.01) {
        return b.expectedValue - a.expectedValue
      }
      // Secondary sort: strategic value
      return b.strategicValue - a.strategicValue
    })

    // Now select the best picks while ensuring balance and game exclusivity
    const selectedGameIds = new Set<string>()
    const favorites: PointsPlusGameAnalysis[] = []
    const underdogs: PointsPlusGameAnalysis[] = []

    // Points Plus pool requirements: minimum 4 favorites and 4 underdogs
    const minFavorites = 4
    const minUnderdogs = 4
    const minTotalPicks = 8

    // Determine pick count
    const idealPickCount = this.determinePickCount(analyses.length)
    const actualPickCount = Math.max(idealPickCount, minTotalPicks)
    const maxPerSide = Math.ceil(actualPickCount / 2)

    // Select the best picks while maintaining balance
    for (const pick of allPossiblePicks) {
      const gameId = pick.game.gameId

      // Skip if we've already picked this game
      if (selectedGameIds.has(gameId)) continue

      // Skip if we've reached our limits
      const totalPicks = favorites.length + underdogs.length
      if (totalPicks >= actualPickCount) break

      // Check if we can add this pick type
      if (pick.side === 'favorite' && favorites.length < maxPerSide) {
        favorites.push(pick.game)
        selectedGameIds.add(gameId)
      } else if (pick.side === 'underdog' && underdogs.length < maxPerSide) {
        underdogs.push(pick.game)
        selectedGameIds.add(gameId)
      }

      // Early exit if we have balanced picks and minimum requirement
      if (
        favorites.length >= minFavorites &&
        underdogs.length >= minUnderdogs &&
        Math.abs(favorites.length - underdogs.length) <= 1 &&
        favorites.length + underdogs.length >= actualPickCount
      ) {
        break
      }
    }

    // Ensure we meet minimum requirements (4 favorites, 4 underdogs, 8 total)
    if (
      favorites.length < minFavorites ||
      underdogs.length < minUnderdogs ||
      favorites.length + underdogs.length < minTotalPicks
    ) {
      // Emergency fallback: balance the picks by adding more from the best available
      const remainingPicks = allPossiblePicks.filter(
        (pick) => !selectedGameIds.has(pick.game.gameId)
      )

      // Add more favorites if needed
      while (favorites.length < minFavorites && remainingPicks.length > 0) {
        const bestFavorite = remainingPicks.find(
          (pick) =>
            pick.side === 'favorite' && !selectedGameIds.has(pick.game.gameId)
        )
        if (bestFavorite) {
          favorites.push(bestFavorite.game)
          selectedGameIds.add(bestFavorite.game.gameId)
          const index = remainingPicks.indexOf(bestFavorite)
          remainingPicks.splice(index, 1)
        } else {
          break
        }
      }

      // Add more underdogs if needed
      while (underdogs.length < minUnderdogs && remainingPicks.length > 0) {
        const bestUnderdog = remainingPicks.find(
          (pick) =>
            pick.side === 'underdog' && !selectedGameIds.has(pick.game.gameId)
        )
        if (bestUnderdog) {
          underdogs.push(bestUnderdog.game)
          selectedGameIds.add(bestUnderdog.game.gameId)
          const index = remainingPicks.indexOf(bestUnderdog)
          remainingPicks.splice(index, 1)
        } else {
          break
        }
      }

      // Balance to equal numbers if possible
      const totalSelected = favorites.length + underdogs.length
      if (totalSelected < actualPickCount && remainingPicks.length > 0) {
        const needed = actualPickCount - totalSelected
        const favoriteDeficit = underdogs.length - favorites.length

        for (let i = 0; i < needed && remainingPicks.length > 0; i++) {
          let bestPick
          if (favoriteDeficit > 0) {
            // Need more favorites
            bestPick =
              remainingPicks.find(
                (pick) =>
                  pick.side === 'favorite' &&
                  !selectedGameIds.has(pick.game.gameId)
              ) ||
              remainingPicks.find(
                (pick) => !selectedGameIds.has(pick.game.gameId)
              )
          } else if (favoriteDeficit < 0) {
            // Need more underdogs
            bestPick =
              remainingPicks.find(
                (pick) =>
                  pick.side === 'underdog' &&
                  !selectedGameIds.has(pick.game.gameId)
              ) ||
              remainingPicks.find(
                (pick) => !selectedGameIds.has(pick.game.gameId)
              )
          } else {
            // Even, take the best available
            bestPick = remainingPicks.find(
              (pick) => !selectedGameIds.has(pick.game.gameId)
            )
          }

          if (bestPick) {
            if (bestPick.side === 'favorite') {
              favorites.push(bestPick.game)
            } else {
              underdogs.push(bestPick.game)
            }
            selectedGameIds.add(bestPick.game.gameId)
            const index = remainingPicks.indexOf(bestPick)
            remainingPicks.splice(index, 1)
          }
        }
      }
    }

    // Calculate expected points
    const totalExpectedPoints = this.calculateExpectedPoints(
      favorites,
      underdogs
    )

    // Determine risk profile
    const riskProfile = this.determineRiskProfile(favorites, underdogs)

    return {
      favorites,
      underdogs,
      totalExpectedPoints,
      riskProfile,
    }
  }

  /**
   * Determine optimal pick count based on strategy and available games
   */
  private determinePickCount(availableGames: number): number {
    switch (this.config.pickCount) {
      case 'minimum':
        return 4 // Always return minimum required
      case 'optimal':
        // Research-based optimal selection: 6-8 games for best risk/reward
        // But scale based on available quality games
        if (availableGames >= 12) return 8 // Full slate
        if (availableGames >= 8) return 6 // Reduced slate
        return Math.max(4, Math.min(availableGames, 6)) // Minimum viable
      case 'maximum':
        // Take up to 10-12 games maximum (research shows diminishing returns beyond this)
        return Math.min(availableGames, 12)
      default:
        return Math.max(4, 6) // Default to 6 with minimum of 4
    }
  }

  /**
   * Calculate expected points from recommendations
   */
  private calculateExpectedPoints(
    favorites: PointsPlusGameAnalysis[],
    underdogs: PointsPlusGameAnalysis[]
  ): number {
    let expected = 0

    // Favorites: confidence * expected margin
    for (const fav of favorites) {
      const confidence = fav.favorite.confidence ?? 50
      const expectedMargin = fav.favorite.expectedMargin ?? 0
      const contribution = (confidence / 100) * expectedMargin
      if (isFinite(contribution)) {
        expected += contribution
      }
    }

    // Underdogs: upset potential * spread - (1-upset) * spread
    for (const dog of underdogs) {
      const upsetChance = (dog.underdog.upsetPotential ?? 25) / 100
      const spread = dog.underdog.spread ?? 0
      const winPoints = spread
      const lossPoints = -spread
      const contribution =
        upsetChance * winPoints + (1 - upsetChance) * lossPoints
      if (isFinite(contribution)) {
        expected += contribution
      }
    }

    const result = Math.round(expected * 10) / 10
    return isFinite(result) ? result : 0
  }

  /**
   * Determine risk profile of recommendations
   */
  private determineRiskProfile(
    favorites: PointsPlusGameAnalysis[],
    underdogs: PointsPlusGameAnalysis[]
  ): 'conservative' | 'balanced' | 'aggressive' {
    const avgFavoriteSpread =
      favorites.reduce((sum, f) => sum + Math.abs(f.favorite.spread), 0) /
      favorites.length
    const avgUnderdogSpread =
      underdogs.reduce((sum, u) => sum + u.underdog.spread, 0) /
      underdogs.length

    if (avgFavoriteSpread >= 10 && avgUnderdogSpread <= 7) {
      return 'conservative'
    } else if (avgFavoriteSpread <= 7 || avgUnderdogSpread >= 10) {
      return 'aggressive'
    }
    return 'balanced'
  }

  /**
   * Check if game is divisional
   */
  private isDivisionalGame(game: any): boolean {
    // This would need actual division data
    // For now, return false
    return false
  }

  /**
   * Check if game is in prime time
   */
  private isPrimeTimeGame(game: any): boolean {
    const kickoff = new Date(game.kickoff)
    const day = kickoff.getDay()
    const hour = kickoff.getHours()

    // Sunday/Monday night, Thursday night
    return (
      (day === 0 && hour >= 20) || // Sunday night
      (day === 1 && hour >= 20) || // Monday night
      (day === 4 && hour >= 20) // Thursday night
    )
  }

  /**
   * Update strategy configuration
   */
  updateConfig(config: Partial<PointsPlusStrategyConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  getConfig(): PointsPlusStrategyConfig {
    return { ...this.config }
  }

  /**
   * Get model weights for confidence engine
   */
  private getModelWeights(): ModelWeights {
    return {
      id: 'points-plus-strategy',
      name: 'Points Plus Strategy Weights',
      weights: {
        marketProbWeight: 0.35, // Slightly less than default for Points Plus
        eloWeight: 0.25,
        lineValueWeight: 0.22,
        homeAdvWeight: 0.08,
        restWeight: 0.03,
        divisionalWeight: 0.05,
        revengeGameWeight: 0.03,
        recentFormWeight: 0.05,
        playoffImplicationsWeight: 0.02,
        travelScheduleWeight: 0.03,
        weatherPenaltyWeight: 0.08,
        injuryPenaltyWeight: 0.03,
        kElo: 24,
        windThresholdMph: 15,
        precipProbThreshold: 0.3,
        qbOutPenalty: 12,
        olClusterPenalty: 3,
        dbClusterPenalty: 3,
      },
      createdAt: new Date(),
    }
  }
}
