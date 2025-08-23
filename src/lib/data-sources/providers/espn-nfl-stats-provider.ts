import { BaseDataProvider } from '../base-provider'
import type { ApiResponse, ProviderConfig } from '../types'

// New interfaces for NFL team data
export interface NFLTeamStats {
  teamId: string
  teamName: string
  abbreviation: string
  record: {
    wins: number
    losses: number
    ties: number
    winPercentage: number
  }
  standings: {
    position: number
    division: string
    conference: string
  }
  recentForm: {
    lastFiveGames: ('W' | 'L')[]
    currentStreak: {
      type: 'W' | 'L'
      count: number
    }
  }
  statistics: {
    pointsFor: number
    pointsAgainst: number
    pointDifferential: number
  }
  lastUpdated: Date
}

export interface NFLTeamFormAnalysis {
  teamId: string
  momentum: 'STRONG_UP' | 'UP' | 'NEUTRAL' | 'DOWN' | 'STRONG_DOWN'
  trendDescription: string
  recentPerformance: {
    lastThreeGames: ('W' | 'L')[]
    pointsForTrend: number // +/- vs season average
    pointsAgainstTrend: number
  }
  keyFactors: string[]
}

interface EspnStandingsResponse {
  standings: Array<{
    entries: Array<{
      team: {
        id: string
        uid: string
        name: string
        abbreviation: string
        displayName: string
        logos: Array<{
          href: string
        }>
      }
      stats: Array<{
        name: string
        value: number
        displayValue: string
      }>
    }>
  }>
}

interface EspnTeamResponse {
  team: {
    id: string
    name: string
    abbreviation: string
    record: {
      items: Array<{
        stats: Array<{
          name: string
          value: number
        }>
      }>
    }
    nextEvent?: Array<{
      date: string
      competitions: Array<{
        competitors: Array<{
          team: {
            id: string
            abbreviation: string
          }
          homeAway: 'home' | 'away'
        }>
      }>
    }>
  }
  events?: Array<{
    date: string
    competitions: Array<{
      competitors: Array<{
        team: {
          id: string
          abbreviation: string
        }
        winner?: boolean
        score: string
        homeAway: 'home' | 'away'
      }>
    }>
  }>
}

/**
 * ESPN NFL Team Stats Provider - Real team momentum and performance data
 */
export class EspnNFLStatsProvider extends BaseDataProvider {
  constructor(config: Partial<ProviderConfig> = {}) {
    const defaultConfig: ProviderConfig = {
      name: 'ESPN_NFL_Stats',
      enabled: true,
      baseUrl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl',
      timeout: 15000,
      retries: 2,
      rateLimitPerMinute: 60,
      ...config,
    }

    super('ESPN_NFL_Stats', defaultConfig)
  }

  /**
   * Get team statistics and standings
   */
  async getTeamStats(teamId: string): Promise<ApiResponse<NFLTeamStats>> {
    return this.withRetry(async () => {
      const response = await this.makeRequest<EspnTeamResponse>(
        `/teams/${teamId}`
      )

      if (!response.success || !response.data) {
        return response as ApiResponse<NFLTeamStats>
      }

      const teamData = response.data.team

      // Get team record
      const recordStats = teamData.record?.items?.[0]?.stats || []
      const wins = this.findStatValue(recordStats, 'wins') || 0
      const losses = this.findStatValue(recordStats, 'losses') || 0
      const ties = this.findStatValue(recordStats, 'ties') || 0

      // Calculate recent form from recent games
      const recentGames = response.data.events?.slice(0, 5) || []
      const recentForm = this.analyzeRecentGames(recentGames, teamId)

      const teamStats: NFLTeamStats = {
        teamId: teamData.id,
        teamName: teamData.name,
        abbreviation: teamData.abbreviation,
        record: {
          wins,
          losses,
          ties,
          winPercentage:
            wins + losses + ties > 0 ? wins / (wins + losses + ties) : 0,
        },
        standings: {
          position: 0, // Will be populated from standings endpoint
          division: 'Unknown',
          conference: 'Unknown',
        },
        recentForm,
        statistics: {
          pointsFor: 0, // These would need additional API calls for detailed stats
          pointsAgainst: 0,
          pointDifferential: 0,
        },
        lastUpdated: new Date(),
      }

      return {
        success: true,
        data: teamStats,
        rateLimitRemaining: response.rateLimitRemaining,
        rateLimitReset: response.rateLimitReset,
      }
    })
  }

  /**
   * Get all team standings for the current season
   */
  async getAllTeamStandings(): Promise<ApiResponse<NFLTeamStats[]>> {
    return this.withRetry(async () => {
      const response =
        await this.makeRequest<EspnStandingsResponse>('/standings')

      if (!response.success || !response.data) {
        return response as ApiResponse<NFLTeamStats[]>
      }

      const allTeams: NFLTeamStats[] = []

      // ESPN returns standings by division/conference
      for (const standing of response.data.standings) {
        for (const entry of standing.entries) {
          const team = entry.team
          const stats = entry.stats

          const wins = this.findStatByName(stats, 'wins')?.value || 0
          const losses = this.findStatByName(stats, 'losses')?.value || 0
          const ties = this.findStatByName(stats, 'ties')?.value || 0
          const pointsFor = this.findStatByName(stats, 'pointsFor')?.value || 0
          const pointsAgainst =
            this.findStatByName(stats, 'pointsAgainst')?.value || 0

          // For standings, we don't have recent game data, so we'll make a simplified form
          const recentForm = {
            lastFiveGames: [] as ('W' | 'L')[],
            currentStreak: { type: 'W' as const, count: 0 },
          }

          const teamStats: NFLTeamStats = {
            teamId: team.id,
            teamName: team.displayName,
            abbreviation: team.abbreviation,
            record: {
              wins,
              losses,
              ties,
              winPercentage:
                wins + losses + ties > 0 ? wins / (wins + losses + ties) : 0,
            },
            standings: {
              position: 0, // Would need to calculate from order
              division: 'Unknown',
              conference: 'Unknown',
            },
            recentForm,
            statistics: {
              pointsFor,
              pointsAgainst,
              pointDifferential: pointsFor - pointsAgainst,
            },
            lastUpdated: new Date(),
          }

          allTeams.push(teamStats)
        }
      }

      return {
        success: true,
        data: allTeams,
        rateLimitRemaining: response.rateLimitRemaining,
        rateLimitReset: response.rateLimitReset,
      }
    })
  }

  /**
   * Analyze team form and momentum
   */
  async analyzeTeamForm(
    teamId: string
  ): Promise<ApiResponse<NFLTeamFormAnalysis>> {
    const statsResponse = await this.getTeamStats(teamId)

    if (!statsResponse.success || !statsResponse.data) {
      return statsResponse as ApiResponse<NFLTeamFormAnalysis>
    }

    const teamStats = statsResponse.data
    const analysis = this.calculateMomentum(teamStats)

    return {
      success: true,
      data: analysis,
      rateLimitRemaining: statsResponse.rateLimitRemaining,
      rateLimitReset: statsResponse.rateLimitReset,
    }
  }

  /**
   * Get current week number (utility method)
   */
  async getCurrentWeek(): Promise<ApiResponse<number>> {
    return this.withRetry(async () => {
      const response = await this.makeRequest<{ week: { number: number } }>(
        '/scoreboard'
      )

      if (!response.success || !response.data) {
        // Fallback to week 1 if we can't determine current week
        return {
          success: true,
          data: 1,
          rateLimitRemaining: response.rateLimitRemaining,
          rateLimitReset: response.rateLimitReset,
        }
      }

      return {
        success: true,
        data: response.data.week?.number || 1,
        rateLimitRemaining: response.rateLimitRemaining,
        rateLimitReset: response.rateLimitReset,
      }
    })
  }

  /**
   * Check if season/data is available
   */
  async checkDataAvailability(): Promise<
    ApiResponse<{
      seasonActive: boolean
      currentWeek: number
      dataAvailable: boolean
      message?: string
    }>
  > {
    const weekResponse = await this.getCurrentWeek()

    if (!weekResponse.success) {
      return {
        success: true,
        data: {
          seasonActive: false,
          currentWeek: 0,
          dataAvailable: false,
          message:
            'Unable to connect to ESPN API - season may not have started or API unavailable',
        },
      }
    }

    const currentWeek = weekResponse.data || 0
    const seasonActive = currentWeek > 0 && currentWeek <= 18

    return {
      success: true,
      data: {
        seasonActive,
        currentWeek,
        dataAvailable: seasonActive,
        message: seasonActive
          ? `Season active - Week ${currentWeek}`
          : currentWeek === 0
            ? 'Season has not started yet - using historical/preseason data'
            : 'Season has ended - using final season data',
      },
    }
  }

  /**
   * Health check specific to NFL stats
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/standings')
      return response.success
    } catch {
      return false
    }
  }

  /**
   * Private helper methods
   */
  private findStatValue(
    stats: Array<{ name: string; value: number }>,
    statName: string
  ): number | null {
    const stat = stats.find((s) => s.name === statName)
    return stat ? stat.value : null
  }

  private findStatByName(
    stats: Array<{ name: string; value: number; displayValue: string }>,
    statName: string
  ) {
    return stats.find((s) => s.name === statName)
  }

  private analyzeRecentGames(
    games: any[],
    teamId: string
  ): NFLTeamStats['recentForm'] {
    const lastFiveGames: ('W' | 'L')[] = []
    let currentStreak = { type: 'W' as 'W' | 'L', count: 0 }

    for (const game of games.slice(0, 5)) {
      const competition = game.competitions?.[0]
      if (!competition) continue

      const teamCompetitor = competition.competitors?.find(
        (c: any) => c.team.id === teamId
      )
      if (!teamCompetitor) continue

      const isWin = teamCompetitor.winner === true
      const result = isWin ? 'W' : 'L'
      lastFiveGames.push(result)

      // Calculate current streak (from most recent games)
      if (lastFiveGames.length === 1) {
        currentStreak = { type: result, count: 1 }
      } else if (currentStreak.type === result) {
        currentStreak.count++
      }
    }

    return {
      lastFiveGames,
      currentStreak,
    }
  }

  private calculateMomentum(teamStats: NFLTeamStats): NFLTeamFormAnalysis {
    const { recentForm, record } = teamStats
    const lastThreeGames = recentForm.lastFiveGames.slice(0, 3)

    // Calculate momentum based on recent performance
    const recentWins = lastThreeGames.filter((result) => result === 'W').length
    const streakType = recentForm.currentStreak.type
    const streakCount = recentForm.currentStreak.count

    let momentum: NFLTeamFormAnalysis['momentum']
    let trendDescription: string
    const keyFactors: string[] = []

    // Determine momentum
    if (streakCount >= 3 && streakType === 'W') {
      momentum = 'STRONG_UP'
      trendDescription = `Team on ${streakCount}-game winning streak`
      keyFactors.push('Strong winning momentum')
    } else if (streakCount >= 3 && streakType === 'L') {
      momentum = 'STRONG_DOWN'
      trendDescription = `Team has lost ${streakCount} straight games`
      keyFactors.push('Struggling with consecutive losses')
    } else if (recentWins >= 2) {
      momentum = 'UP'
      trendDescription = `Team won ${recentWins} of last 3 games`
      keyFactors.push('Positive recent form')
    } else if (recentWins === 0) {
      momentum = 'DOWN'
      trendDescription = 'Team lost last 3 games'
      keyFactors.push('Recent struggles')
    } else {
      momentum = 'NEUTRAL'
      trendDescription = `Team is ${recentWins}-${3 - recentWins} in last 3 games`
      keyFactors.push('Mixed recent results')
    }

    // Add record-based factors
    if (record.winPercentage > 0.7) {
      keyFactors.push('Strong overall record')
    } else if (record.winPercentage < 0.3) {
      keyFactors.push('Poor overall record')
    }

    return {
      teamId: teamStats.teamId,
      momentum,
      trendDescription,
      recentPerformance: {
        lastThreeGames,
        pointsForTrend: 0, // Would need more detailed stats
        pointsAgainstTrend: 0,
      },
      keyFactors,
    }
  }
}
