import { BaseDataProvider } from '../base-provider'
import type {
  OddsProvider,
  OddsData,
  ApiResponse,
  ProviderConfig,
} from '../types'

interface EspnGame {
  id: string
  date: string
  competitions: Array<{
    id: string
    competitors: Array<{
      id: string
      team: {
        abbreviation: string
        displayName: string
      }
      homeAway: 'home' | 'away'
    }>
    odds?: Array<{
      provider?: {
        name: string
      }
      details?: string
      overUnder?: number
      spread?: number
      homeTeamOdds?: {
        moneyLine?: number
        spreadOdds?: number
      }
      awayTeamOdds?: {
        moneyLine?: number
        spreadOdds?: number
      }
    }>
  }>
}

interface EspnApiResponse {
  events: EspnGame[]
}

/**
 * ESPN odds provider - free NFL data source
 */
export class EspnOddsProvider extends BaseDataProvider implements OddsProvider {
  constructor(config: Partial<ProviderConfig> = {}) {
    const defaultConfig: ProviderConfig = {
      name: 'ESPN',
      enabled: true,
      baseUrl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl',
      timeout: 10000,
      retries: 2,
      rateLimitPerMinute: 60,
      ...config,
    }

    super('ESPN', defaultConfig)
  }

  /**
   * Get odds for multiple games
   */
  async getOddsForGames(gameIds: string[], season?: number, week?: number): Promise<ApiResponse<OddsData[]>> {
    return this.withRetry(async () => {
      const allOdds: OddsData[] = []

      // ESPN API doesn't support batch requests, so we'll get all games for the specified week
      // Use seasontype=2 for regular season, default to current week if not specified
      const currentWeek = week || 1
      const response = await this.makeRequest<EspnApiResponse>(
        `/scoreboard?seasontype=2&week=${currentWeek}`
      )

      if (!response.success || !response.data) {
        return response as ApiResponse<OddsData[]>
      }

      // If gameIds is empty, return all games; otherwise filter
      const games =
        gameIds.length === 0
          ? response.data.events
          : response.data.events.filter((game) => gameIds.includes(game.id))

      for (const game of games) {
        const oddsData = this.parseGameOdds(game)
        if (oddsData) {
          allOdds.push(oddsData)
        }
      }

      return {
        success: true,
        data: allOdds,
        rateLimitRemaining: response.rateLimitRemaining,
        rateLimitReset: response.rateLimitReset,
      }
    })
  }

  /**
   * Get odds for a single game
   */
  async getOddsForGame(gameId: string): Promise<ApiResponse<OddsData>> {
    return this.withRetry(async () => {
      // Try to get specific game first
      const gameResponse = await this.makeRequest<{ events: EspnGame[] }>(
        `/scoreboard/${gameId}`
      )

      if (gameResponse.success && gameResponse.data?.events?.[0]) {
        const oddsData = this.parseGameOdds(gameResponse.data.events[0])
        if (oddsData) {
          return {
            success: true,
            data: oddsData,
            rateLimitRemaining: gameResponse.rateLimitRemaining,
            rateLimitReset: gameResponse.rateLimitReset,
          }
        }
      }

      // Fall back to searching in current scoreboard (use week 1 as fallback)
      const scoreboardResponse = await this.makeRequest<EspnApiResponse>(
        '/scoreboard?seasontype=2&week=1'
      )

      if (!scoreboardResponse.success || !scoreboardResponse.data) {
        return scoreboardResponse as ApiResponse<OddsData>
      }

      const game = scoreboardResponse.data.events.find((g) => g.id === gameId)
      if (!game) {
        return {
          success: false,
          error: {
            provider: this.name,
            endpoint: '/scoreboard',
            message: `Game ${gameId} not found`,
            timestamp: new Date(),
            retryable: false,
          },
        }
      }

      const oddsData = this.parseGameOdds(game)
      if (!oddsData) {
        return {
          success: false,
          error: {
            provider: this.name,
            endpoint: '/scoreboard',
            message: `No odds data available for game ${gameId}`,
            timestamp: new Date(),
            retryable: true,
          },
        }
      }

      return {
        success: true,
        data: oddsData,
        rateLimitRemaining: scoreboardResponse.rateLimitRemaining,
        rateLimitReset: scoreboardResponse.rateLimitReset,
      }
    })
  }

  /**
   * Get available bookmakers from ESPN
   */
  async getAvailableBookmakers(): Promise<ApiResponse<string[]>> {
    return this.withRetry(async () => {
      const response = await this.makeRequest<EspnApiResponse>('/scoreboard')

      if (!response.success || !response.data) {
        return response as ApiResponse<string[]>
      }

      const bookmakers = new Set<string>()

      for (const game of response.data.events) {
        const competition = game.competitions[0]
        if (competition.odds) {
          for (const odds of competition.odds) {
            if (odds.provider?.name) {
              bookmakers.add(odds.provider.name)
            }
          }
        }
      }

      return {
        success: true,
        data: Array.from(bookmakers),
        rateLimitRemaining: response.rateLimitRemaining,
        rateLimitReset: response.rateLimitReset,
      }
    })
  }

  /**
   * Parse ESPN game data into our odds format
   */
  private parseGameOdds(game: EspnGame): OddsData | null {
    const competition = game.competitions[0]

    const homeTeam = competition.competitors.find((c) => c.homeAway === 'home')
    const awayTeam = competition.competitors.find((c) => c.homeAway === 'away')

    if (!homeTeam || !awayTeam) {
      return null
    }

    // Create basic game data even without odds for schedule information
    const gameData: OddsData = {
      gameId: game.id,
      source: this.name,
      spread: undefined,
      total: undefined,
      moneylineHome: undefined,
      moneylineAway: undefined,
      capturedAt: new Date(),
      bookmaker: 'ESPN',
      isOpening: false,
      homeTeam: homeTeam.team.abbreviation,
      awayTeam: awayTeam.team.abbreviation,
      kickoff: new Date(game.date),
    }

    // Add odds data if available
    if (competition.odds && competition.odds.length > 0) {
      const odds = competition.odds[0]
      gameData.spread = odds.spread
      gameData.total = odds.overUnder
      gameData.moneylineHome = odds.homeTeamOdds?.moneyLine
      gameData.moneylineAway = odds.awayTeamOdds?.moneyLine
      gameData.bookmaker = odds.provider?.name || 'ESPN'
    }

    return gameData
  }

  /**
   * Get all current odds for a specific week
   */
  async getAllCurrentOdds(season?: number, week?: number): Promise<ApiResponse<OddsData[]>> {
    return this.getOddsForGames([], season, week)
  }

  /**
   * ESPN-specific health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/scoreboard')
      return response.success
    } catch {
      return false
    }
  }

  /**
   * ESPN doesn't expose rate limit headers, so we'll estimate
   */
  async getRateLimitStatus(): Promise<{
    remaining: number
    resetAt: Date
  } | null> {
    // ESPN is generally generous with their public API
    // Estimate based on our configured limit
    const resetAt = new Date()
    resetAt.setMinutes(resetAt.getMinutes() + 1)

    return {
      remaining: this.config.rateLimitPerMinute || 60,
      resetAt,
    }
  }
}
