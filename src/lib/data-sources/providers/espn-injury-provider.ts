import { BaseDataProvider } from '../base-provider'
import type {
  InjuryProvider,
  InjuryData,
  ApiResponse,
  ProviderConfig,
} from '../types'

interface EspnAthleteInjury {
  id: string
  displayName: string
  position: {
    abbreviation: string
  }
  injuries?: Array<{
    status: string
    date: string
    type?: string
    details?: {
      type?: string
      detail?: string
    }
  }>
}

interface EspnTeamInjuryResponse {
  athletes: EspnAthleteInjury[]
}

/**
 * ESPN Injury Provider - Free API for injury data
 * Uses ESPN's public API endpoints for injury reports
 */
export class EspnInjuryProvider
  extends BaseDataProvider
  implements InjuryProvider
{
  constructor(config: Partial<ProviderConfig> = {}) {
    const defaultConfig: ProviderConfig = {
      name: 'ESPN_Injury',
      enabled: true,
      baseUrl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl',
      timeout: 10000,
      retries: 2,
      rateLimitPerMinute: 60,
      ...config,
    }

    super('ESPN_Injury', defaultConfig)
  }

  /**
   * Get injuries for a specific team
   */
  async getInjuriesForTeam(teamId: string): Promise<ApiResponse<InjuryData[]>> {
    return this.withRetry(async () => {
      // ESPN uses team abbreviations or IDs
      const teamIdentifier = await this.getTeamIdentifier(teamId)

      if (!teamIdentifier) {
        return {
          success: false,
          error: {
            provider: this.name,
            endpoint: '/teams/{id}/injuries',
            message: `Could not resolve team identifier for: ${teamId}`,
            timestamp: new Date(),
            retryable: false,
          },
        }
      }

      // Try ESPN's team injuries endpoint
      const response = await this.makeRequest<EspnTeamInjuryResponse>(
        `/teams/${teamIdentifier}/injuries`
      )

      if (!response.success || !response.data) {
        // Fallback: try to get injuries from team roster
        return this.getInjuriesFromRoster(teamIdentifier)
      }

      const injuries: InjuryData[] = this.parseEspnInjuries(
        response.data.athletes,
        teamId
      )

      return {
        success: true,
        data: injuries,
        rateLimitRemaining: response.rateLimitRemaining,
        rateLimitReset: response.rateLimitReset,
      }
    })
  }

  /**
   * Get injuries for a specific week (ESPN doesn't filter by week, so we get current)
   */
  async getInjuriesForWeek(
    season: number,
    week: number
  ): Promise<ApiResponse<InjuryData[]>> {
    return this.withRetry(async () => {
      // Get all teams first
      const teamsResponse = await this.makeRequest<{
        sports: Array<{
          leagues: Array<{
            teams: Array<{
              team: {
                id: string
                abbreviation: string
              }
            }>
          }>
        }>
      }>('/teams')

      if (!teamsResponse.success || !teamsResponse.data) {
        return teamsResponse as ApiResponse<InjuryData[]>
      }

      const allInjuries: InjuryData[] = []

      // Get team list
      const teams = teamsResponse.data.sports?.[0]?.leagues?.[0]?.teams || []

      // Fetch injuries for each team (with rate limiting)
      for (const teamWrapper of teams.slice(0, 10)) {
        // Limit to avoid rate limits
        try {
          const teamInjuries = await this.getInjuriesForTeam(
            teamWrapper.team.id
          )
          if (teamInjuries.success && teamInjuries.data) {
            allInjuries.push(...teamInjuries.data)
          }

          // Small delay to avoid rate limits
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.warn(
            `Failed to get injuries for team ${teamWrapper.team.abbreviation}:`,
            error
          )
        }
      }

      return {
        success: true,
        data: allInjuries,
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
      // ESPN player injury endpoint
      const response = await this.makeRequest<{
        athlete: EspnAthleteInjury
      }>(`/athletes/${playerId}`)

      if (!response.success || !response.data) {
        return {
          success: true,
          data: null,
        }
      }

      const athlete = response.data.athlete
      if (!athlete.injuries || athlete.injuries.length === 0) {
        return {
          success: true,
          data: null,
        }
      }

      const latestInjury = athlete.injuries[0] // Most recent injury
      const injuryData: InjuryData = {
        playerId: athlete.id,
        playerName: athlete.displayName,
        teamId: '', // Would need to be resolved from athlete data
        position: athlete.position.abbreviation,
        status: this.mapEspnInjuryStatus(latestInjury.status),
        injuryType:
          latestInjury.details?.type || latestInjury.type || 'Unknown',
        lastUpdated: new Date(latestInjury.date),
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
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/teams?limit=1')
      return response.success
    } catch {
      return false
    }
  }

  /**
   * Check data availability (ESPN is always free)
   */
  async checkDataAvailability(): Promise<{
    available: boolean
    requiresApiKey: boolean
    message: string
  }> {
    const healthOk = await this.healthCheck()

    return {
      available: healthOk,
      requiresApiKey: false,
      message: healthOk
        ? 'ESPN injury data available (free)'
        : 'ESPN API currently unavailable',
    }
  }

  /**
   * Private helper methods
   */
  private async getInjuriesFromRoster(
    teamId: string
  ): Promise<ApiResponse<InjuryData[]>> {
    const rosterResponse = await this.makeRequest<{
      athletes: Array<{
        items: EspnAthleteInjury[]
      }>
    }>(`/teams/${teamId}/roster`)

    if (!rosterResponse.success || !rosterResponse.data) {
      return {
        success: false,
        error: {
          provider: this.name,
          endpoint: `/teams/${teamId}/roster`,
          message: 'No roster data available',
          timestamp: new Date(),
          retryable: true,
        },
      }
    }

    const allPlayers = rosterResponse.data.athletes.flatMap(
      (group) => group.items
    )
    const injuries = this.parseEspnInjuries(allPlayers, teamId)

    return {
      success: true,
      data: injuries,
      rateLimitRemaining: rosterResponse.rateLimitRemaining,
      rateLimitReset: rosterResponse.rateLimitReset,
    }
  }

  private parseEspnInjuries(
    athletes: EspnAthleteInjury[],
    teamId: string
  ): InjuryData[] {
    const injuries: InjuryData[] = []

    for (const athlete of athletes) {
      if (!athlete.injuries || athlete.injuries.length === 0) {
        continue
      }

      const latestInjury = athlete.injuries[0]

      injuries.push({
        playerId: athlete.id,
        playerName: athlete.displayName,
        teamId,
        position: athlete.position.abbreviation,
        status: this.mapEspnInjuryStatus(latestInjury.status),
        injuryType: latestInjury.details?.type || latestInjury.type || 'Injury',
        lastUpdated: new Date(latestInjury.date),
        source: this.name,
      })
    }

    return injuries
  }

  private mapEspnInjuryStatus(espnStatus: string): InjuryData['status'] {
    const status = espnStatus.toUpperCase()

    if (status.includes('OUT') || status.includes('INACTIVE')) {
      return 'OUT'
    } else if (status.includes('DOUBTFUL')) {
      return 'DOUBTFUL'
    } else if (status.includes('QUESTIONABLE') || status.includes('LIMITED')) {
      return 'QUESTIONABLE'
    } else if (status.includes('IR') || status.includes('INJURED RESERVE')) {
      return 'INJURED_RESERVE'
    } else {
      return 'QUESTIONABLE' // Default fallback
    }
  }

  private async getTeamIdentifier(teamId: string): Promise<string | null> {
    // If it's already a short abbreviation, use it
    if (teamId.length <= 3 && /^[A-Z]+$/.test(teamId)) {
      return teamId
    }

    // Otherwise, assume it's our internal team ID and try to use it directly
    return teamId
  }
}
