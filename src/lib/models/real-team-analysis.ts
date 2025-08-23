import {
  EspnNFLStatsProvider,
  type NFLTeamStats,
  type NFLTeamFormAnalysis,
} from '../data-sources/providers/espn-nfl-stats-provider'
import { realInjuryAnalysis } from './real-injury-analysis'
import { realScheduleAnalysis } from './real-schedule-analysis'
import type { EnhancedTeamRecommendation } from './survivor-recommendations'

/**
 * Real Team Analysis Service - Replaces mock data with real NFL team momentum
 */
export class RealTeamAnalysis {
  private nflStatsProvider: EspnNFLStatsProvider
  private teamStatsCache: Map<string, { data: NFLTeamStats; expires: Date }> =
    new Map()
  private standingsCache: { data: NFLTeamStats[]; expires: Date } | null = null

  constructor() {
    this.nflStatsProvider = new EspnNFLStatsProvider()
  }

  /**
   * Get real team momentum analysis (replaces mock momentum)
   */
  async getTeamMomentumAnalysis(
    teamId: string,
    teamAbbr?: string
  ): Promise<{
    momentum?: string
    injuries?: string
    historical?: string
    dataSource: 'REAL' | 'UNAVAILABLE'
    message?: string
  }> {
    try {
      // Check data availability first
      const availability = await this.nflStatsProvider.checkDataAvailability()

      if (!availability.success || !availability.data?.dataAvailable) {
        return {
          dataSource: 'UNAVAILABLE',
          message:
            availability.data?.message ||
            'NFL data currently unavailable - season may not have started',
        }
      }

      // Get team form analysis
      const formResponse = await this.nflStatsProvider.analyzeTeamForm(teamId)

      if (!formResponse.success || !formResponse.data) {
        return {
          dataSource: 'UNAVAILABLE',
          message: 'Unable to fetch team data from ESPN API',
        }
      }

      const formAnalysis = formResponse.data

      // Get real injury data
      const injuryNarrative =
        await realInjuryAnalysis.getInjuryNarrative(teamId)

      return {
        momentum: formAnalysis.trendDescription,
        injuries:
          injuryNarrative.dataSource === 'REAL'
            ? injuryNarrative.narrative
            : undefined,
        historical: this.buildHistoricalContext(formAnalysis),
        dataSource: 'REAL',
        message: `Real data from ESPN - Week ${availability.data.currentWeek}`,
      }
    } catch (error) {
      console.error('Error fetching real team momentum:', error)
      return {
        dataSource: 'UNAVAILABLE',
        message: 'Error connecting to NFL data source',
      }
    }
  }

  /**
   * Get all teams with current form (for bulk analysis)
   */
  async getAllTeamsCurrentForm(): Promise<{
    teams: Map<string, NFLTeamFormAnalysis>
    dataSource: 'REAL' | 'UNAVAILABLE'
    message?: string
  }> {
    try {
      const availability = await this.nflStatsProvider.checkDataAvailability()

      if (!availability.success || !availability.data?.dataAvailable) {
        return {
          teams: new Map(),
          dataSource: 'UNAVAILABLE',
          message:
            availability.data?.message || 'NFL data currently unavailable',
        }
      }

      // Get all team standings first
      const standingsResponse = await this.getCachedStandings()

      if (!standingsResponse.success || !standingsResponse.data) {
        return {
          teams: new Map(),
          dataSource: 'UNAVAILABLE',
          message: 'Unable to fetch team standings',
        }
      }

      const teamFormMap = new Map<string, NFLTeamFormAnalysis>()

      // For each team, get their form analysis
      for (const team of standingsResponse.data) {
        try {
          const formResponse = await this.nflStatsProvider.analyzeTeamForm(
            team.teamId
          )
          if (formResponse.success && formResponse.data) {
            teamFormMap.set(team.abbreviation, formResponse.data)
          }
        } catch (error) {
          console.warn(
            `Failed to get form for team ${team.abbreviation}:`,
            error
          )
        }
      }

      return {
        teams: teamFormMap,
        dataSource: 'REAL',
        message: `Real data for ${teamFormMap.size} teams - Week ${availability.data.currentWeek}`,
      }
    } catch (error) {
      console.error('Error fetching all team forms:', error)
      return {
        teams: new Map(),
        dataSource: 'UNAVAILABLE',
        message: 'Error connecting to NFL data source',
      }
    }
  }

  /**
   * Replace mock narrative factors with real data
   */
  async generateRealNarrativeFactors(
    teamId: string,
    gameId: string,
    week: number
  ): Promise<EnhancedTeamRecommendation['narrativeFactors']> {
    const factors: EnhancedTeamRecommendation['narrativeFactors'] = {}

    try {
      // Get real momentum data
      const momentumAnalysis = await this.getTeamMomentumAnalysis(teamId)

      if (momentumAnalysis.dataSource === 'REAL') {
        // Use real data
        if (momentumAnalysis.momentum) {
          factors.momentum = momentumAnalysis.momentum
        }

        if (momentumAnalysis.historical) {
          factors.historical = momentumAnalysis.historical
        }

        // Get real injury data
        if (momentumAnalysis.injuries) {
          factors.injuries = momentumAnalysis.injuries
        }

        // Get real primetime analysis
        const primetimeAnalysis =
          await realScheduleAnalysis.analyzePrimetimeGame(gameId, teamId)
        if (
          primetimeAnalysis.dataSource === 'REAL' &&
          primetimeAnalysis.analysis.isPrimetime
        ) {
          factors.primetime = `${primetimeAnalysis.analysis.primetimeDescription} - ${primetimeAnalysis.analysis.performanceNote}`
        }

        // Get real revenge game analysis
        const revengeAnalysis = await realScheduleAnalysis.analyzeRevengeGame(
          gameId,
          teamId
        )
        if (revengeAnalysis.analysis.isRevengeGame) {
          factors.revenge =
            revengeAnalysis.analysis.revengeContext ||
            'Revenge game scenario detected'
        }

        // Get schedule spot analysis
        const scheduleAnalysis = await realScheduleAnalysis.analyzeScheduleSpot(
          gameId,
          teamId,
          week
        )
        if (scheduleAnalysis.analysis.lookaheadConcern) {
          factors.lookahead = scheduleAnalysis.analysis.lookaheadContext
        }
      } else {
        // Fallback indicators when real data unavailable
        factors.momentum = `Real data unavailable: ${momentumAnalysis.message}`
      }
    } catch (error) {
      console.error('Error generating narrative factors:', error)
      factors.momentum = 'Unable to fetch real team data'
    }

    return factors
  }

  /**
   * Get team power rating based on real performance (replaces mock ratings)
   */
  async getTeamPowerRating(teamId: string): Promise<{
    rating: number
    tier: 'ELITE' | 'STRONG' | 'AVERAGE' | 'WEAK'
    dataSource: 'REAL' | 'ESTIMATED'
    factors: string[]
  }> {
    try {
      const teamStats = await this.getCachedTeamStats(teamId)

      if (!teamStats) {
        // Return estimated rating for unavailable data
        return {
          rating: 1500,
          tier: 'AVERAGE',
          dataSource: 'ESTIMATED',
          factors: ['Real data unavailable - using neutral rating'],
        }
      }

      // Calculate power rating based on multiple real factors
      let baseRating = 1400 + teamStats.record.winPercentage * 400 // 1400-1800 based on win%

      const factors: string[] = []

      // Adjust for point differential
      if (teamStats.statistics.pointDifferential > 50) {
        baseRating += 50
        factors.push('Strong point differential')
      } else if (teamStats.statistics.pointDifferential < -50) {
        baseRating -= 50
        factors.push('Poor point differential')
      }

      // Adjust for recent form
      const recentWins = teamStats.recentForm.lastFiveGames.filter(
        (g) => g === 'W'
      ).length
      if (recentWins >= 4) {
        baseRating += 30
        factors.push('Excellent recent form')
      } else if (recentWins <= 1) {
        baseRating -= 30
        factors.push('Poor recent form')
      }

      // Determine tier
      let tier: 'ELITE' | 'STRONG' | 'AVERAGE' | 'WEAK'
      if (baseRating >= 1700) tier = 'ELITE'
      else if (baseRating >= 1600) tier = 'STRONG'
      else if (baseRating >= 1450) tier = 'AVERAGE'
      else tier = 'WEAK'

      factors.push(`${teamStats.record.wins}-${teamStats.record.losses} record`)

      return {
        rating: Math.round(baseRating),
        tier,
        dataSource: 'REAL',
        factors,
      }
    } catch (error) {
      console.error('Error calculating team power rating:', error)
      return {
        rating: 1500,
        tier: 'AVERAGE',
        dataSource: 'ESTIMATED',
        factors: ['Error fetching real data - using neutral rating'],
      }
    }
  }

  /**
   * Check if real data is available for the current season
   */
  async checkRealDataAvailability(): Promise<{
    available: boolean
    seasonActive: boolean
    currentWeek: number
    message: string
  }> {
    try {
      const availability = await this.nflStatsProvider.checkDataAvailability()

      if (availability.success && availability.data) {
        return {
          available: availability.data.dataAvailable,
          seasonActive: availability.data.seasonActive,
          currentWeek: availability.data.currentWeek,
          message: availability.data.message || 'Data status unknown',
        }
      }

      return {
        available: false,
        seasonActive: false,
        currentWeek: 0,
        message: 'Unable to check data availability',
      }
    } catch (error) {
      return {
        available: false,
        seasonActive: false,
        currentWeek: 0,
        message: 'Error connecting to data source',
      }
    }
  }

  /**
   * Private helper methods
   */
  private async getCachedTeamStats(
    teamId: string
  ): Promise<NFLTeamStats | null> {
    const cached = this.teamStatsCache.get(teamId)

    if (cached && cached.expires > new Date()) {
      return cached.data
    }

    // Fetch fresh data
    const response = await this.nflStatsProvider.getTeamStats(teamId)

    if (response.success && response.data) {
      // Cache for 1 hour
      const expires = new Date()
      expires.setHours(expires.getHours() + 1)

      this.teamStatsCache.set(teamId, {
        data: response.data,
        expires,
      })

      return response.data
    }

    return null
  }

  private async getCachedStandings() {
    if (this.standingsCache && this.standingsCache.expires > new Date()) {
      return { success: true, data: this.standingsCache.data }
    }

    // Fetch fresh standings
    const response = await this.nflStatsProvider.getAllTeamStandings()

    if (response.success && response.data) {
      // Cache for 2 hours
      const expires = new Date()
      expires.setHours(expires.getHours() + 2)

      this.standingsCache = {
        data: response.data,
        expires,
      }
    }

    return response
  }

  private buildHistoricalContext(formAnalysis: NFLTeamFormAnalysis): string {
    const keyFactors = formAnalysis.keyFactors

    if (keyFactors.includes('Strong overall record')) {
      return 'Team has maintained consistent performance throughout season'
    } else if (keyFactors.includes('Poor overall record')) {
      return 'Team has struggled with consistency this season'
    } else {
      return 'Team showing typical performance patterns for their record'
    }
  }
}

// Global instance for use across the app
export const realTeamAnalysis = new RealTeamAnalysis()
