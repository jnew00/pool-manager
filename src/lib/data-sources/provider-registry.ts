import type {
  OddsProvider,
  WeatherProvider,
  InjuryProvider,
  OddsData,
  WeatherData,
  InjuryData,
  ApiResponse,
  GameDataSnapshot,
} from './types'

/**
 * Registry for managing multiple data providers
 */
export class ProviderRegistry {
  private oddsProviders: Map<string, OddsProvider> = new Map()
  private weatherProviders: Map<string, WeatherProvider> = new Map()
  private injuryProviders: Map<string, InjuryProvider> = new Map()

  // Default provider names
  private defaultOddsProvider: string | null = null
  private defaultWeatherProvider: string | null = null
  private defaultInjuryProvider: string | null = null

  /**
   * Register an odds provider
   */
  registerOddsProvider(provider: OddsProvider, setAsDefault = false): void {
    this.oddsProviders.set(provider.name, provider)

    if (setAsDefault || this.defaultOddsProvider === null) {
      this.defaultOddsProvider = provider.name
    }
  }

  /**
   * Register a weather provider
   */
  registerWeatherProvider(
    provider: WeatherProvider,
    setAsDefault = false
  ): void {
    this.weatherProviders.set(provider.name, provider)

    if (setAsDefault || this.defaultWeatherProvider === null) {
      this.defaultWeatherProvider = provider.name
    }
  }

  /**
   * Register an injury provider
   */
  registerInjuryProvider(provider: InjuryProvider, setAsDefault = false): void {
    this.injuryProviders.set(provider.name, provider)

    if (setAsDefault || this.defaultInjuryProvider === null) {
      this.defaultInjuryProvider = provider.name
    }
  }

  /**
   * Get odds data from default or specified provider
   */
  async getOddsForGame(
    gameId: string,
    providerName?: string
  ): Promise<ApiResponse<OddsData>> {
    const provider = this.getOddsProvider(providerName)
    if (!provider) {
      return {
        success: false,
        error: {
          provider: providerName || 'default',
          endpoint: '/odds',
          message: 'No odds provider available',
          timestamp: new Date(),
          retryable: false,
        },
      }
    }

    return provider.getOddsForGame(gameId)
  }

  /**
   * Get odds data for multiple games
   */
  async getOddsForGames(
    gameIds: string[],
    providerName?: string,
    season?: number,
    week?: number
  ): Promise<ApiResponse<OddsData[]>> {
    const provider = this.getOddsProvider(providerName)
    if (!provider) {
      return {
        success: false,
        error: {
          provider: providerName || 'default',
          endpoint: '/odds',
          message: 'No odds provider available',
          timestamp: new Date(),
          retryable: false,
        },
      }
    }

    return provider.getOddsForGames(gameIds, season, week)
  }

  /**
   * Get all current odds from the provider (for team-based matching)
   */
  async getAllCurrentOdds(
    providerName?: string,
    season?: number,
    week?: number
  ): Promise<ApiResponse<OddsData[]>> {
    const provider = this.getOddsProvider(providerName)
    if (!provider) {
      return {
        success: false,
        error: {
          provider: providerName || 'default',
          endpoint: '/odds/all',
          message: 'No odds provider available',
          timestamp: new Date(),
          retryable: false,
        },
      }
    }

    // Use the getAllCurrentOdds method if available, otherwise fallback to getOddsForGames
    if (provider.getAllCurrentOdds) {
      return provider.getAllCurrentOdds(season, week)
    }

    return provider.getOddsForGames([], season, week)
  }

  /**
   * Get weather data for a game
   */
  async getWeatherForGame(
    gameId: string,
    venue: string,
    kickoffTime: Date,
    providerName?: string
  ): Promise<ApiResponse<WeatherData>> {
    const provider = this.getWeatherProvider(providerName)
    if (!provider) {
      return {
        success: false,
        error: {
          provider: providerName || 'default',
          endpoint: '/weather',
          message: 'No weather provider available',
          timestamp: new Date(),
          retryable: false,
        },
      }
    }

    return provider.getWeatherForGame(gameId, venue, kickoffTime)
  }

  /**
   * Get injury data for a team
   */
  async getInjuriesForTeam(
    teamId: string,
    providerName?: string
  ): Promise<ApiResponse<InjuryData[]>> {
    const provider = this.getInjuryProvider(providerName)
    if (!provider) {
      return {
        success: false,
        error: {
          provider: providerName || 'default',
          endpoint: '/injuries',
          message: 'No injury provider available',
          timestamp: new Date(),
          retryable: false,
        },
      }
    }

    return provider.getInjuriesForTeam(teamId)
  }

  /**
   * Get comprehensive data snapshot for a game
   */
  async getGameDataSnapshot(
    gameId: string,
    venue: string,
    kickoffTime: Date,
    homeTeamId: string,
    awayTeamId: string
  ): Promise<GameDataSnapshot> {
    const snapshot: GameDataSnapshot = {
      gameId,
      odds: [],
      injuries: [],
      capturedAt: new Date(),
    }

    // Get odds data
    const oddsResponse = await this.getOddsForGame(gameId)
    if (oddsResponse.success && oddsResponse.data) {
      snapshot.odds = [oddsResponse.data]
    }

    // Get weather data
    const weatherResponse = await this.getWeatherForGame(
      gameId,
      venue,
      kickoffTime
    )
    if (weatherResponse.success && weatherResponse.data) {
      snapshot.weather = weatherResponse.data
    }

    // Get injury data for both teams
    const [homeInjuries, awayInjuries] = await Promise.all([
      this.getInjuriesForTeam(homeTeamId),
      this.getInjuriesForTeam(awayTeamId),
    ])

    if (homeInjuries.success && homeInjuries.data) {
      snapshot.injuries.push(...homeInjuries.data)
    }

    if (awayInjuries.success && awayInjuries.data) {
      snapshot.injuries.push(...awayInjuries.data)
    }

    return snapshot
  }

  /**
   * Health check for all providers
   */
  async checkProviderHealth(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}

    // Check odds providers
    for (const [name, provider] of this.oddsProviders) {
      try {
        results[`odds:${name}`] = await provider.healthCheck()
      } catch {
        results[`odds:${name}`] = false
      }
    }

    // Check weather providers
    for (const [name, provider] of this.weatherProviders) {
      try {
        results[`weather:${name}`] = await provider.healthCheck()
      } catch {
        results[`weather:${name}`] = false
      }
    }

    // Check injury providers
    for (const [name, provider] of this.injuryProviders) {
      try {
        results[`injury:${name}`] = await provider.healthCheck()
      } catch {
        results[`injury:${name}`] = false
      }
    }

    return results
  }

  /**
   * Get available provider names
   */
  getAvailableProviders(): {
    odds: string[]
    weather: string[]
    injury: string[]
  } {
    return {
      odds: Array.from(this.oddsProviders.keys()),
      weather: Array.from(this.weatherProviders.keys()),
      injury: Array.from(this.injuryProviders.keys()),
    }
  }

  /**
   * Private helper methods
   */
  private getOddsProvider(name?: string): OddsProvider | null {
    const providerName = name || this.defaultOddsProvider
    return providerName ? this.oddsProviders.get(providerName) || null : null
  }

  private getWeatherProvider(name?: string): WeatherProvider | null {
    const providerName = name || this.defaultWeatherProvider
    return providerName ? this.weatherProviders.get(providerName) || null : null
  }

  private getInjuryProvider(name?: string): InjuryProvider | null {
    const providerName = name || this.defaultInjuryProvider
    return providerName ? this.injuryProviders.get(providerName) || null : null
  }
}

// Global registry instance
export const dataProviderRegistry = new ProviderRegistry()
