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

export interface EnhancedTeamRecommendation extends TeamRecommendation {
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

      // Build enhanced recommendation
      enhanced.push({
        ...rec,
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
   * Analyze narrative factors for a team
   */
  private async analyzeNarrativeFactors(
    teamId: string,
    gameId: string,
    week: number
  ): Promise<EnhancedTeamRecommendation['narrativeFactors']> {
    // In production, would analyze real data
    // For now, return mock analysis

    const factors: EnhancedTeamRecommendation['narrativeFactors'] = {}

    // Random momentum (simplified)
    const rand = Math.random()
    if (rand > 0.7) {
      factors.momentum = 'Team on 2-game winning streak'
    } else if (rand < 0.3) {
      factors.momentum = 'Lost 2 of last 3 games'
    }

    // Check for primetime
    const primetimeGames = ['TNF', 'SNF', 'MNF']
    if (Math.random() > 0.8) {
      factors.primetime = 'Sunday Night Football - national spotlight'
    }

    // Revenge game (played last year)
    if (Math.random() > 0.9) {
      factors.revenge = 'Lost to opponent in playoffs last year'
    }

    // Lookahead spot
    if (week < 17 && Math.random() > 0.85) {
      factors.lookahead = 'Potential lookahead to division rival next week'
    }

    // Historical performance
    if (Math.random() > 0.5) {
      factors.historical = '4-1 in last 5 meetings with opponent'
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
    teams.forEach((team) => {
      // Mock ratings
      const topTeams = ['KC', 'BUF', 'PHI', 'SF', 'DAL', 'BAL']
      const rating = topTeams.includes(team.nflAbbr) ? 1700 : 1500
      teamRatings.set(team.id, rating)
    })

    // Mock schedule (would fetch real schedule)
    const schedule: any[] = []
    for (let w = currentWeek + 1; w <= 18; w++) {
      games.forEach((game) => {
        schedule.push({
          week: w,
          homeTeamId: game.homeTeamId,
          awayTeamId: game.awayTeamId,
          homeTeamAbbr: game.homeTeam.nflAbbr,
          awayTeamAbbr: game.awayTeam.nflAbbr,
        })
      })
    }

    return SurvivorFutureValue.generateSeasonProjection(
      teams,
      schedule,
      teamRatings,
      usedTeams,
      currentWeek,
      poolSize
    )
  }
}
