import { BaseDataProvider } from '../base-provider'
import type {
  InjuryProvider,
  InjuryData,
  ApiResponse,
  ProviderConfig,
} from '../types'

interface MSFPlayer {
  id: string
  firstName: string
  lastName: string
  position: {
    abbreviation: string
  }
}

interface MSFTeam {
  id: string
  city: string
  name: string
  abbreviation: string
}

interface MSFInjury {
  player: MSFPlayer
  team: MSFTeam
  injury: {
    injuryType: string
    playingProbability: 'PROBABLE' | 'QUESTIONABLE' | 'DOUBTFUL' | 'OUT'
    description?: string
  }
  lastUpdated: string
}

interface MSFInjuryResponse {
  injuries: MSFInjury[]
}

/**
 * MySportsFeeds Injury Provider - Free tier available
 * API Docs: https://www.mysportsfeeds.com/data-feeds/api-docs/
 */
export class MySportsFeedsInjuryProvider
  extends BaseDataProvider
  implements InjuryProvider
{
  constructor(config: Partial<ProviderConfig> = {}) {
    const defaultConfig: ProviderConfig = {
      name: 'MySportsFeeds_Injury',
      enabled: true,
      baseUrl: 'https://api.mysportsfeeds.com/v2.1/pull/nfl',
      timeout: 10000,
      retries: 2,
      rateLimitPerMinute: 100, // Free tier allows good limits
      ...config,
    }

    super('MySportsFeeds_Injury', defaultConfig)
  }

  /**
   * Get injuries for a specific team
   */
  async getInjuriesForTeam(teamId: string): Promise<ApiResponse<InjuryData[]>> {
    return this.withRetry(async () => {
      // MySportsFeeds uses team abbreviations, we may need to map IDs to abbreviations
      const teamAbbr = await this.getTeamAbbreviation(teamId)

      if (!teamAbbr) {
        return {
          success: false,
          error: {
            provider: this.name,
            endpoint: '/injuries',
            message: `Could not find team abbreviation for ID: ${teamId}`,
            timestamp: new Date(),
            retryable: false,
          },
        }
      }

      const currentSeason = new Date().getFullYear()
      const response = await this.makeRequest<MSFInjuryResponse>(
        `/${currentSeason}-regular/injuries.json?team=${teamAbbr}`,
        'GET',
        undefined,
        this.getAuthHeaders()
      )

      if (!response.success || !response.data) {
        return response as ApiResponse<InjuryData[]>
      }

      const injuries: InjuryData[] = response.data.injuries.map((injury) => ({
        playerId: injury.player.id,
        playerName: `${injury.player.firstName} ${injury.player.lastName}`,
        teamId,
        position: injury.player.position.abbreviation,
        status: this.mapInjuryStatus(injury.injury.playingProbability),
        injuryType: injury.injury.injuryType,
        lastUpdated: new Date(injury.lastUpdated),
        source: this.name,
      }))

      return {
        success: true,
        data: injuries,
        rateLimitRemaining: response.rateLimitRemaining,
        rateLimitReset: response.rateLimitReset,
      }
    })
  }

  /**
   * Get injuries for a specific week across all teams
   */
  async getInjuriesForWeek(
    season: number,
    week: number
  ): Promise<ApiResponse<InjuryData[]>> {
    return this.withRetry(async () => {
      const response = await this.makeRequest<MSFInjuryResponse>(
        `/${season}-regular/injuries.json`,
        'GET',
        undefined,
        this.getAuthHeaders()
      )

      if (!response.success || !response.data) {
        return response as ApiResponse<InjuryData[]>
      }

      // MySportsFeeds doesn't filter by week, so we get all current injuries
      const injuries: InjuryData[] = response.data.injuries.map((injury) => ({
        playerId: injury.player.id,
        playerName: `${injury.player.firstName} ${injury.player.lastName}`,
        teamId: injury.team.id,
        position: injury.player.position.abbreviation,
        status: this.mapInjuryStatus(injury.injury.playingProbability),
        injuryType: injury.injury.injuryType,
        lastUpdated: new Date(injury.lastUpdated),
        source: this.name,
      }))

      return {
        success: true,
        data: injuries,
        rateLimitRemaining: response.rateLimitRemaining,
        rateLimitReset: response.rateLimitReset,
      }
    })
  }

  /**
   * Get specific player injury status
   */
  async getPlayerInjuryStatus(
    playerId: string
  ): Promise<ApiResponse<InjuryData | null>> {
    return this.withRetry(async () => {
      const currentSeason = new Date().getFullYear()
      const response = await this.makeRequest<MSFInjuryResponse>(
        `/${currentSeason}-regular/injuries.json`,
        'GET',
        undefined,
        this.getAuthHeaders()
      )

      if (!response.success || !response.data) {
        return response as ApiResponse<InjuryData | null>
      }

      const playerInjury = response.data.injuries.find(
        (injury) => injury.player.id === playerId
      )

      if (!playerInjury) {
        return {
          success: true,
          data: null,
          rateLimitRemaining: response.rateLimitRemaining,
          rateLimitReset: response.rateLimitReset,
        }
      }

      const injuryData: InjuryData = {
        playerId: playerInjury.player.id,
        playerName: `${playerInjury.player.firstName} ${playerInjury.player.lastName}`,
        teamId: playerInjury.team.id,
        position: playerInjury.player.position.abbreviation,
        status: this.mapInjuryStatus(playerInjury.injury.playingProbability),
        injuryType: playerInjury.injury.injuryType,
        lastUpdated: new Date(playerInjury.lastUpdated),
        source: this.name,
      }

      return {
        success: true,
        data: injuryData,
        rateLimitRemaining: response.rateLimitRemaining,
        rateLimitReset: response.rateLimitReset,
      }
    })
  }

  /**
   * Health check for MySportsFeeds
   */
  async healthCheck(): Promise<boolean> {
    try {
      const currentSeason = new Date().getFullYear()
      const response = await this.makeRequest(
        `/${currentSeason}-regular/injuries.json?limit=1`,
        'GET',
        undefined,
        this.getAuthHeaders()
      )
      return response.success
    } catch {
      return false
    }
  }

  /**
   * Get rate limit status
   */
  async getRateLimitStatus(): Promise<{
    remaining: number
    resetAt: Date
  } | null> {
    // MySportsFeeds provides rate limit info in headers
    // This would be populated after making a request
    return null
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey
  }

  /**
   * Get data availability status
   */
  async checkDataAvailability(): Promise<{
    available: boolean
    requiresApiKey: boolean
    message: string
  }> {
    if (!this.config.apiKey) {
      return {
        available: false,
        requiresApiKey: true,
        message: 'MySportsFeeds API key required for injury data',
      }
    }

    const healthOk = await this.healthCheck()

    return {
      available: healthOk,
      requiresApiKey: false,
      message: healthOk
        ? 'MySportsFeeds injury data available'
        : 'MySportsFeeds API currently unavailable',
    }
  }

  /**
   * Private helper methods
   */
  private getAuthHeaders(): Record<string, string> {
    if (!this.config.apiKey) {
      return {}
    }

    // MySportsFeeds uses HTTP Basic Auth with API key
    const auth = Buffer.from(`${this.config.apiKey}:MYSPORTSFEEDS`).toString(
      'base64'
    )
    return {
      Authorization: `Basic ${auth}`,
    }
  }

  private mapInjuryStatus(
    msfStatus: 'PROBABLE' | 'QUESTIONABLE' | 'DOUBTFUL' | 'OUT'
  ): InjuryData['status'] {
    switch (msfStatus) {
      case 'OUT':
        return 'OUT'
      case 'DOUBTFUL':
        return 'DOUBTFUL'
      case 'QUESTIONABLE':
        return 'QUESTIONABLE'
      case 'PROBABLE':
        return 'QUESTIONABLE' // Map probable to questionable since our enum doesn't have probable
      default:
        return 'QUESTIONABLE'
    }
  }

  private async getTeamAbbreviation(teamId: string): Promise<string | null> {
    // This would typically involve a mapping from your database team IDs to NFL abbreviations
    // For now, if the teamId is already an abbreviation, return it
    if (teamId.length === 2 || teamId.length === 3) {
      return teamId.toUpperCase()
    }

    // TODO: Implement proper team ID to abbreviation mapping
    // This would query your teams table to get the nflAbbr for a given team.id
    return null
  }
}
