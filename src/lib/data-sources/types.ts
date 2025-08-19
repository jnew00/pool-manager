/**
 * Core types for external data sources (odds, weather, injuries)
 */

export interface OddsData {
  gameId: string
  source: string
  spread?: number
  total?: number
  moneylineHome?: number
  moneylineAway?: number
  capturedAt: Date
  bookmaker?: string
  isOpening?: boolean
  homeTeam?: string // Team abbreviation for matching
  awayTeam?: string // Team abbreviation for matching
  kickoff?: Date // Game date/time from provider
}

export interface WeatherData {
  gameId: string
  venue: string
  lat?: number
  lon?: number
  temperature?: number // Fahrenheit
  windSpeed?: number // mph
  windDirection?: string
  precipitationChance?: number // 0-1
  humidity?: number // 0-1
  conditions?: string // clear, rain, snow, etc.
  isDome: boolean
  capturedAt: Date
  source: string
}

export interface InjuryData {
  playerId: string
  playerName: string
  teamId: string
  position: string
  status: 'QUESTIONABLE' | 'DOUBTFUL' | 'OUT' | 'INJURED_RESERVE'
  injuryType?: string
  lastUpdated: Date
  source: string
}

export interface ProviderConfig {
  name: string
  enabled: boolean
  apiKey?: string
  baseUrl?: string
  rateLimitPerMinute?: number
  timeout?: number
  retries?: number
}

export interface DataSourceError {
  provider: string
  endpoint: string
  message: string
  timestamp: Date
  retryable: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: DataSourceError
  rateLimitRemaining?: number
  rateLimitReset?: Date
}

/**
 * Base interface for all data providers
 */
export interface DataProvider {
  readonly name: string
  readonly config: ProviderConfig

  healthCheck(): Promise<boolean>
  getRateLimitStatus(): Promise<{
    remaining: number
    resetAt: Date
  } | null>
}

/**
 * Interface for odds data providers
 */
export interface OddsProvider extends DataProvider {
  getOddsForGames(gameIds: string[], season?: number, week?: number): Promise<ApiResponse<OddsData[]>>
  getOddsForGame(gameId: string): Promise<ApiResponse<OddsData>>
  getAvailableBookmakers(): Promise<ApiResponse<string[]>>
  getAllCurrentOdds?(season?: number, week?: number): Promise<ApiResponse<OddsData[]>>
}

/**
 * Interface for weather data providers
 */
export interface WeatherProvider extends DataProvider {
  getWeatherForGame(
    gameId: string,
    venue: string,
    kickoffTime: Date
  ): Promise<ApiResponse<WeatherData>>
  getWeatherForVenue(
    venue: string,
    lat: number,
    lon: number,
    time: Date
  ): Promise<ApiResponse<WeatherData>>
}

/**
 * Interface for injury data providers
 */
export interface InjuryProvider extends DataProvider {
  getInjuriesForTeam(teamId: string): Promise<ApiResponse<InjuryData[]>>
  getInjuriesForWeek(
    season: number,
    week: number
  ): Promise<ApiResponse<InjuryData[]>>
  getPlayerInjuryStatus(
    playerId: string
  ): Promise<ApiResponse<InjuryData | null>>
}

/**
 * Aggregated data for a game
 */
export interface GameDataSnapshot {
  gameId: string
  odds: OddsData[]
  weather?: WeatherData
  injuries: InjuryData[]
  capturedAt: Date
}
