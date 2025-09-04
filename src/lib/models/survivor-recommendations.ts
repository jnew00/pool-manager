import { SurvivorEVEngine, WeekEVData } from './survivor-ev-engine'
import { SurvivorFutureValue, SeasonProjection } from './survivor-future-value'
import {
  SurvivorStrategy,
  StrategyPreset,
  TeamRecommendation,
} from './survivor-strategy'
import {
  PublicPickService,
  WeekPublicPicks,
} from '@/server/services/public-pick-service'
import {
  SurvivorOddsService,
  WeekOdds,
} from '@/server/services/survivor-odds-service'
import {
  SurvivorWeatherService,
  WeatherImpact,
} from '@/server/services/survivor-weather-service'
import { realTeamAnalysis } from './real-team-analysis'

export interface EnhancedTeamRecommendation extends TeamRecommendation {
  opponent: string // Opponent team abbreviation
  narrativeFactors: {
    momentum?: string // Team trending up/down
    injuries?: string // Key injuries impact
    primetime?: string // Primetime game considerations
    revenge?: string // Revenge game narrative
    lookahead?: string // Potential lookahead spot
    historical?: string // Historical performance in situation
  }
  weatherImpact?: {
    risk: 'LOW' | 'MEDIUM' | 'HIGH'
    description: string
  }
  llmAdjustment?: {
    originalScore: number
    adjustedScore: number
    reasoning: string
  }
  finalConfidence: number // 0-100
}

export interface WeekRecommendations {
  week: number
  poolId: string
  survivorsRemaining: number
  strategy: StrategyPreset
  primaryPick: EnhancedTeamRecommendation
  alternativePicks: EnhancedTeamRecommendation[]
  avoidList: {
    teamAbbr: string
    reason: string
  }[]
  weekOverview: {
    difficulty: 'EASY' | 'MODERATE' | 'DIFFICULT' | 'CRITICAL'
    bestValue: string // Team with best EV
    safestPick: string // Highest win probability
    contrarianPlay: string // Low ownership, decent safety
    weatherConcerns: string[]
  }
  strategicInsights: string[]
}

export class SurvivorRecommendations {
  private publicPickService: PublicPickService
  private oddsService: SurvivorOddsService
  private weatherService: SurvivorWeatherService

  constructor() {
    this.publicPickService = new PublicPickService()
    this.oddsService = new SurvivorOddsService()
    this.weatherService = new SurvivorWeatherService()
  }

  /**
   * Generate comprehensive recommendations for a week
   */
  async generateWeekRecommendations(
    poolId: string,
    week: number,
    usedTeams: Set<string>,
    strategy: StrategyPreset = 'BALANCED',
    poolSize: number = 100,
    survivorsRemaining: number = 75
  ): Promise<WeekRecommendations> {
    // Fetch all data sources in parallel
    const [publicPicks, weekOdds, games] = await Promise.all([
      this.publicPickService.getPublicPickPercentages(week, poolId),
      this.oddsService.getWeekMoneylines(week),
      this.getWeekGames(week),
    ])

    // Get weather impacts for all games
    const weatherImpacts = await this.weatherService.getWeekWeatherImpacts(
      week,
      weekOdds.games.map((g) => ({ gameId: g.gameId, spread: g.spread }))
    )

    // Calculate EV for all teams
    const weekEV = this.calculateWeekEV(
      games,
      publicPicks,
      weekOdds,
      usedTeams,
      poolSize
    )

    // Project future value
    const seasonProjection = await this.projectSeasonValue(
      games,
      usedTeams,
      week,
      poolSize
    )

    // Get base strategy recommendations
    const strategyRecs = SurvivorStrategy.generateRecommendations(
      weekEV,
      seasonProjection,
      strategy,
      poolSize,
      survivorsRemaining
    )

    // Enhance recommendations with all data sources
    const enhancedRecs = await this.enhanceRecommendations(
      strategyRecs.topPicks,
      weatherImpacts,
      weekOdds,
      week
    )

    // Apply LLM adjustments for narrative factors
    const finalRecs = await this.applyLLMAdjustments(enhancedRecs)

    // Build avoid list with reasons
    const avoidList = this.buildAvoidList(weekEV, weatherImpacts, finalRecs)

    // Generate week overview
    const weekOverview = this.analyzeWeekDifficulty(
      weekEV,
      weatherImpacts,
      publicPicks
    )

    // Generate strategic insights
    const insights = this.generateStrategicInsights(
      week,
      survivorsRemaining,
      poolSize,
      weekEV,
      seasonProjection,
      weatherImpacts
    )

    return {
      week,
      poolId,
      survivorsRemaining,
      strategy,
      primaryPick: finalRecs[0],
      alternativePicks: finalRecs.slice(1, 4),
      avoidList,
      weekOverview,
      strategicInsights: insights,
    }
  }

  /**
   * Calculate week EV with all data sources
   */
  private calculateWeekEV(
    games: any[],
    publicPicks: WeekPublicPicks,
    weekOdds: WeekOdds,
    usedTeams: Set<string>,
    poolSize: number
  ): WeekEVData {
    // Build public pick map
    const pickMap = new Map<string, number>()
    publicPicks.teams.forEach((team) => {
      pickMap.set(team.teamAbbr, team.pickPercentage)
    })

    // Build odds map
    const oddsMap = new Map<string, any>()
    weekOdds.games.forEach((game) => {
      oddsMap.set(game.gameId, game)
    })

    // Calculate EV for each team
    const teams = games.flatMap((game) => {
      const odds = oddsMap.get(game.id)
      if (!odds) return []

      return [
        {
          teamId: game.homeTeamId,
          teamAbbr: game.homeTeam.nflAbbr,
          gameId: game.id,
          week: game.week,
          winProbability: odds.homeWinProbability,
          publicPickPercentage: pickMap.get(game.homeTeam.nflAbbr) || 1,
          expectedValue: 0, // Will calculate
          survivalRate: odds.homeWinProbability,
          adjustedEV: 0, // Will calculate
        },
        {
          teamId: game.awayTeamId,
          teamAbbr: game.awayTeam.nflAbbr,
          gameId: game.id,
          week: game.week,
          winProbability: odds.awayWinProbability,
          publicPickPercentage: pickMap.get(game.awayTeam.nflAbbr) || 1,
          expectedValue: 0,
          survivalRate: odds.awayWinProbability,
          adjustedEV: 0,
        },
      ]
    })

    // Filter out used teams
    const availableTeams = teams.filter((t) => !usedTeams.has(t.teamId))

    // Calculate overall survival rate
    const overallSurvivalRate =
      availableTeams.reduce(
        (sum, t) => sum + (t.winProbability * t.publicPickPercentage) / 100,
        0
      ) /
      availableTeams.reduce((sum, t) => sum + t.publicPickPercentage / 100, 0)

    // Calculate EV for each team
    availableTeams.forEach((team) => {
      team.expectedValue = SurvivorEVEngine.calculateEV(
        team.winProbability,
        team.publicPickPercentage,
        overallSurvivalRate
      )
      team.adjustedEV = SurvivorEVEngine.calculateAdjustedEV(
        team.expectedValue,
        team.winProbability,
        poolSize
      )
    })

    return {
      week: games[0]?.week || 1,
      overallSurvivalRate,
      teams: availableTeams,
    }
  }

  /**
   * Enhance recommendations with weather and odds movement
   */
  private async enhanceRecommendations(
    recommendations: TeamRecommendation[],
    weatherImpacts: WeatherImpact[],
    weekOdds: WeekOdds,
    week: number
  ): Promise<EnhancedTeamRecommendation[]> {
    const enhanced: EnhancedTeamRecommendation[] = []

    for (const rec of recommendations) {
      // Find weather impact for this game
      const weather = weatherImpacts.find((w) => w.gameId === rec.gameId)

      // Get odds movement
      const oddsMovement = await this.oddsService.getOddsMovement(
        rec.gameId,
        24
      )

      // Analyze narrative factors
      const narrativeFactors = await this.analyzeNarrativeFactors(
        rec.teamId,
        rec.gameId,
        week
      )

      // Get opponent information
      const gameOdds = weekOdds.games.find(g => g.gameId === rec.gameId)
      const opponent = gameOdds 
        ? (gameOdds.homeTeamId === rec.teamId 
           ? gameOdds.awayTeamAbbr 
           : gameOdds.homeTeamAbbr)
        : 'TBD'

      // Build enhanced recommendation
      enhanced.push({
        ...rec,
        opponent,
        narrativeFactors,
        weatherImpact: weather
          ? {
              risk: weather.survivorImpact.favoriteRisk,
              description: weather.survivorImpact.recommendation,
            }
          : undefined,
        finalConfidence: rec.confidence,
      })
    }

    return enhanced
  }

  /**
   * Apply LLM adjustments for narrative factors
   */
  private async applyLLMAdjustments(
    recommendations: EnhancedTeamRecommendation[]
  ): Promise<EnhancedTeamRecommendation[]> {
    // In production, would call LLM API
    // For now, apply rule-based adjustments

    return recommendations
      .map((rec) => {
        let adjustment = 0
        let reasoning = []

        // Momentum adjustment
        if (rec.narrativeFactors.momentum?.includes('winning streak')) {
          adjustment += 0.05
          reasoning.push('Team on winning streak')
        } else if (rec.narrativeFactors.momentum?.includes('losing streak')) {
          adjustment -= 0.05
          reasoning.push('Team struggling recently')
        }

        // Injury adjustment
        if (rec.narrativeFactors.injuries?.includes('key player out')) {
          adjustment -= 0.1
          reasoning.push('Missing key player')
        }

        // Primetime adjustment
        if (rec.narrativeFactors.primetime) {
          adjustment += 0.02
          reasoning.push('Primetime performers')
        }

        // Revenge game boost
        if (rec.narrativeFactors.revenge) {
          adjustment += 0.03
          reasoning.push('Revenge game motivation')
        }

        // Lookahead trap
        if (rec.narrativeFactors.lookahead) {
          adjustment -= 0.07
          reasoning.push('Potential lookahead spot')
        }

        // Apply bounded adjustment (max ±15%)
        const boundedAdjustment = Math.max(-0.15, Math.min(0.15, adjustment))
        const adjustedScore = rec.compositeScore * (1 + boundedAdjustment)

        return {
          ...rec,
          llmAdjustment:
            adjustment !== 0
              ? {
                  originalScore: rec.compositeScore,
                  adjustedScore,
                  reasoning: reasoning.join('. '),
                }
              : undefined,
          compositeScore: adjustedScore,
          finalConfidence: Math.round(
            rec.confidence * (1 + boundedAdjustment / 2)
          ),
        }
      })
      .sort((a, b) => b.compositeScore - a.compositeScore)
  }

  /**
   * Analyze narrative factors for a team using REAL data
   */
  private async analyzeNarrativeFactors(
    teamId: string,
    gameId: string,
    week: number
  ): Promise<EnhancedTeamRecommendation['narrativeFactors']> {
    // Use real team analysis service
    const realFactors = await realTeamAnalysis.generateRealNarrativeFactors(
      teamId,
      gameId,
      week
    )

    // Still add some placeholder logic for factors not yet implemented with real data
    const factors: EnhancedTeamRecommendation['narrativeFactors'] = {
      ...realFactors,
    }

    // Deterministic narrative factor analysis based on game data
    try {
      const game = await this.getGameDetails(gameId)
      if (game) {
        // Check for primetime based on kickoff time
        const gameHour = new Date(game.kickoff).getHours()
        if (gameHour >= 19 || gameHour <= 2) { // 7 PM or later, or very early (Monday night)
          factors.primetime = 'Primetime game - enhanced focus and pressure'
        }

        // Revenge game analysis based on previous season results
        const previousMatchup = await this.getPreviousSeasonMatchup(
          game.homeTeamId,
          game.awayTeamId
        )
        if (previousMatchup && previousMatchup.wasUpset) {
          factors.revenge = `Potential revenge spot - team lost unexpectedly last season`
        }

        // Lookahead analysis based on next week's opponents
        if (week < 17) {
          const nextWeekStrength = await this.getNextWeekOpponentStrength(
            teamId,
            week + 1
          )
          if (nextWeekStrength > 0.7) {
            factors.lookahead = `Potential lookahead spot with tough opponent next week`
          }
        }
      }
    } catch (error) {
      console.warn('Error analyzing narrative factors:', error)
    }

    return factors
  }

  /**
   * Build avoid list with specific reasons
   */
  private buildAvoidList(
    weekEV: WeekEVData,
    weatherImpacts: WeatherImpact[],
    recommendations: EnhancedTeamRecommendation[]
  ): Array<{ teamAbbr: string; reason: string }> {
    const avoidList: Array<{ teamAbbr: string; reason: string }> = []
    const recTeams = new Set(recommendations.map((r) => r.teamAbbr))

    weekEV.teams.forEach((team) => {
      // Already recommended
      if (recTeams.has(team.teamAbbr)) return

      // Poor win probability
      if (team.winProbability < 0.5) {
        avoidList.push({
          teamAbbr: team.teamAbbr,
          reason: `Low win probability (${(team.winProbability * 100).toFixed(1)}%)`,
        })
        return
      }

      // Poor EV despite decent win probability
      if (team.winProbability > 0.6 && team.expectedValue < 0.5) {
        avoidList.push({
          teamAbbr: team.teamAbbr,
          reason: 'Too popular relative to win probability',
        })
        return
      }

      // Bad weather for favorite
      const weather = weatherImpacts.find((w) => {
        const game = weekEV.teams.find((t) => t.gameId === w.gameId)
        return game?.teamAbbr === team.teamAbbr
      })

      if (weather && weather.survivorImpact.favoriteRisk === 'HIGH') {
        avoidList.push({
          teamAbbr: team.teamAbbr,
          reason: 'High weather risk',
        })
      }
    })

    return avoidList.slice(0, 5) // Top 5 teams to avoid
  }

  /**
   * Analyze week difficulty
   */
  private analyzeWeekDifficulty(
    weekEV: WeekEVData,
    weatherImpacts: WeatherImpact[],
    publicPicks: WeekPublicPicks
  ): WeekRecommendations['weekOverview'] {
    // Count safe options
    const safeOptions = weekEV.teams.filter(
      (t) => t.winProbability > 0.65
    ).length
    const weatherRisks = weatherImpacts
      .filter((w) => w.survivorImpact.favoriteRisk === 'HIGH')
      .map((w) => w.gameId)

    // Determine difficulty
    let difficulty: 'EASY' | 'MODERATE' | 'DIFFICULT' | 'CRITICAL'
    if (safeOptions >= 8) {
      difficulty = 'EASY'
    } else if (safeOptions >= 4) {
      difficulty = 'MODERATE'
    } else if (safeOptions >= 2) {
      difficulty = 'DIFFICULT'
    } else {
      difficulty = 'CRITICAL'
    }

    // Find best options
    const bestValue =
      weekEV.teams.length > 0
        ? weekEV.teams.reduce((best, team) =>
            team.expectedValue > best.expectedValue ? team : best
          )
        : { teamAbbr: 'None' }

    const safestPick =
      weekEV.teams.length > 0
        ? weekEV.teams.reduce((safest, team) =>
            team.winProbability > safest.winProbability ? team : safest
          )
        : { teamAbbr: 'None' }

    const contrarianPlay = weekEV.teams
      .filter((t) => t.publicPickPercentage < 5 && t.winProbability > 0.58)
      .sort((a, b) => b.expectedValue - a.expectedValue)[0]

    const weatherConcerns = weatherRisks.map((gameId) => {
      const team = weekEV.teams.find((t) => t.gameId === gameId)
      return team ? `${team.teamAbbr} (${gameId})` : gameId
    })

    return {
      difficulty,
      bestValue: bestValue.teamAbbr,
      safestPick: safestPick.teamAbbr,
      contrarianPlay: contrarianPlay?.teamAbbr || 'None',
      weatherConcerns,
    }
  }

  /**
   * Generate strategic insights
   */
  private generateStrategicInsights(
    week: number,
    survivorsRemaining: number,
    poolSize: number,
    weekEV: WeekEVData,
    seasonProjection: SeasonProjection,
    weatherImpacts: WeatherImpact[]
  ): string[] {
    const insights: string[] = []

    // Pool stage insight
    const survivalRate = survivorsRemaining / poolSize
    if (survivalRate > 0.7) {
      insights.push('Early pool stage - prioritize preserving premium teams')
    } else if (survivalRate < 0.3) {
      insights.push('Late pool stage - use your best remaining teams')
    }

    // Field survival rate
    insights.push(
      `Field survival rate: ${(weekEV.overallSurvivalRate * 100).toFixed(1)}%`
    )

    // Critical weeks ahead
    const criticalWeeks = seasonProjection.criticalWeeks.filter((w) => w > week)
    if (criticalWeeks.length > 0 && criticalWeeks[0] - week <= 2) {
      insights.push(
        `Critical week ${criticalWeeks[0]} approaching - save strong teams if possible`
      )
    }

    // Weather impact
    const highRiskGames = weatherImpacts.filter(
      (w) => w.survivorImpact.favoriteRisk === 'HIGH'
    ).length
    if (highRiskGames > 0) {
      insights.push(`${highRiskGames} games with high weather risk this week`)
    }

    // Contrarian opportunity
    const lowOwnershipValue = weekEV.teams.find(
      (t) => t.publicPickPercentage < 3 && t.winProbability > 0.62
    )
    if (lowOwnershipValue) {
      insights.push(
        `Contrarian opportunity: ${lowOwnershipValue.teamAbbr} at ${lowOwnershipValue.publicPickPercentage}% ownership`
      )
    }

    // Pool size strategy
    if (poolSize > 500) {
      insights.push('Large pool - differentiation is key to winning')
    } else if (poolSize < 50) {
      insights.push('Small pool - prioritize survival over differentiation')
    }

    return insights
  }

  /**
   * Helper methods
   */
  private async getWeekGames(week: number): Promise<any[]> {
    const { prisma } = await import('@/lib/prisma')

    const games = await prisma.game.findMany({
      where: {
        week,
        season: 2025,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        lines: {
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        kickoff: 'asc',
      },
    })

    return games
  }

  private async projectSeasonValue(
    games: any[],
    usedTeams: Set<string>,
    currentWeek: number,
    poolSize: number
  ): Promise<SeasonProjection> {
    // In production, would use real schedule and ratings
    // For now, use simplified projection

    const teams = games
      .flatMap((g) => [g.homeTeam, g.awayTeam])
      .filter((t) => !usedTeams.has(t.id))

    const teamRatings = new Map<string, number>()

    // Get real team ratings or fall back to estimated ratings
    for (const team of teams) {
      try {
        const powerRating = await realTeamAnalysis.getTeamPowerRating(team.id)
        teamRatings.set(team.id, powerRating.rating)
      } catch (error) {
        console.warn(
          `Failed to get real rating for team ${team.nflAbbr}, using estimated rating`
        )
        // Use sophisticated tier-based rating system for future value analysis
        const rating = this.calculateDeterministicTeamRating(team.nflAbbr)
        teamRatings.set(team.id, rating)
      }
    }

    // Fetch real schedule from database
    const schedule = await this.getRemainingSchedule(currentWeek)

    return SurvivorFutureValue.generateSeasonProjection(
      teams,
      schedule,
      teamRatings,
      usedTeams,
      currentWeek,
      poolSize
    )
  }

  /**
   * Get game details for narrative analysis
   */
  private async getGameDetails(gameId: string): Promise<any> {
    const { prisma } = await import('@/lib/prisma')
    return await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })
  }

  /**
   * Get previous season matchup for revenge game analysis
   */
  private async getPreviousSeasonMatchup(
    homeTeamId: string,
    awayTeamId: string
  ): Promise<{ wasUpset: boolean } | null> {
    const { prisma } = await import('@/lib/prisma')
    
    try {
      // Look for previous season matchup
      const previousGame = await prisma.game.findFirst({
        where: {
          OR: [
            { homeTeamId, awayTeamId },
            { homeTeamId: awayTeamId, awayTeamId: homeTeamId },
          ],
          season: 2024, // Previous season
        },
        include: {
          result: true,
          lines: {
            take: 1,
            orderBy: { capturedAt: 'asc' },
          },
        },
      })

      if (!previousGame || !previousGame.result || !previousGame.lines[0]) {
        return null
      }

      const result = previousGame.result
      const line = previousGame.lines[0]
      
      // Determine if it was an upset (underdog won straight up)
      const homeWon = (result.homeScore || 0) > (result.awayScore || 0)
      const homeWasFavored = (line.spread || 0) < 0

      const wasUpset = (homeWon && !homeWasFavored) || (!homeWon && homeWasFavored)

      return { wasUpset }
    } catch (error) {
      console.warn('Error fetching previous matchup:', error)
      return null
    }
  }

  /**
   * Get next week opponent strength for lookahead analysis
   */
  private async getNextWeekOpponentStrength(
    teamId: string,
    nextWeek: number
  ): Promise<number> {
    const { prisma } = await import('@/lib/prisma')
    
    try {
      const nextGame = await prisma.game.findFirst({
        where: {
          week: nextWeek,
          OR: [
            { homeTeamId: teamId },
            { awayTeamId: teamId },
          ],
        },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      })

      if (!nextGame) return 0

      // Get opponent team
      const opponent = nextGame.homeTeamId === teamId 
        ? nextGame.awayTeam 
        : nextGame.homeTeam

      // Calculate strength based on tier system (same as odds service)
      const tierA = ['KC', 'BUF', 'PHI', 'SF', 'BAL', 'CIN', 'MIA']
      const tierB = ['DAL', 'MIN', 'DET', 'LAC', 'TEN', 'NYJ', 'SEA', 'JAX']
      
      if (tierA.includes(opponent.nflAbbr)) return 0.9
      if (tierB.includes(opponent.nflAbbr)) return 0.7
      return 0.5

    } catch (error) {
      console.warn('Error fetching next week opponent:', error)
      return 0.5
    }
  }

  /**
   * Get remaining schedule from database
   */
  private async getRemainingSchedule(currentWeek: number): Promise<any[]> {
    const { prisma } = await import('@/lib/prisma')
    
    const games = await prisma.game.findMany({
      where: {
        week: {
          gt: currentWeek,
        },
        season: 2025,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: [
        { week: 'asc' },
        { kickoff: 'asc' },
      ],
    })

    return games.map((game) => ({
      week: game.week,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      homeTeamAbbr: game.homeTeam.nflAbbr,
      awayTeamAbbr: game.awayTeam.nflAbbr,
      kickoff: game.kickoff,
    }))
  }

  /**
   * Calculate sophisticated deterministic team rating based on multiple factors
   */
  private calculateDeterministicTeamRating(teamAbbr: string): number {
    const baseRating = 1500 // NFL average

    // Tier 1: Elite teams (likely playoff contenders)
    const tier1Teams = ['KC', 'BUF', 'PHI', 'SF'] // Championship-caliber
    if (tier1Teams.includes(teamAbbr)) {
      return 1750 + this.getTeamVariance(teamAbbr, 50) // 1750-1800
    }

    // Tier 2: Strong teams (wild card/division contenders)  
    const tier2Teams = ['BAL', 'CIN', 'MIA', 'DAL', 'MIN', 'DET']
    if (tier2Teams.includes(teamAbbr)) {
      return 1650 + this.getTeamVariance(teamAbbr, 50) // 1650-1700
    }

    // Tier 3: Competitive teams (bubble teams)
    const tier3Teams = ['LAC', 'NYJ', 'SEA', 'JAX', 'TEN', 'NO', 'ATL', 'GB', 'TB']
    if (tier3Teams.includes(teamAbbr)) {
      return 1550 + this.getTeamVariance(teamAbbr, 50) // 1550-1600
    }

    // Tier 4: Inconsistent teams 
    const tier4Teams = ['LAR', 'PIT', 'CLE', 'IND', 'WAS', 'LVR']
    if (tier4Teams.includes(teamAbbr)) {
      return 1450 + this.getTeamVariance(teamAbbr, 50) // 1450-1500
    }

    // Tier 5: Rebuilding/struggling teams
    const tier5Teams = ['DEN', 'NE', 'CHI', 'NYG', 'CAR', 'HOU', 'ARI']
    if (tier5Teams.includes(teamAbbr)) {
      return 1350 + this.getTeamVariance(teamAbbr, 50) // 1350-1400
    }

    // Default for any unlisted teams
    return baseRating + this.getTeamVariance(teamAbbr, 30)
  }

  /**
   * Get deterministic variance for team ratings to avoid ties
   */
  private getTeamVariance(teamAbbr: string, maxVariance: number): number {
    // Create consistent variance based on team abbreviation
    const hash = teamAbbr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return (hash % maxVariance) - Math.floor(maxVariance / 2)
  }
}
