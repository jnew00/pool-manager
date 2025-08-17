import { BaseDataProvider } from '../base-provider'
import type { WeatherProvider, WeatherData, ApiResponse, ProviderConfig } from '../types'

/**
 * Mock weather provider for testing and development
 */
export class MockWeatherProvider extends BaseDataProvider implements WeatherProvider {
  private mockData: Map<string, WeatherData> = new Map()
  private shouldFail = false
  private failureMessage = 'Mock weather provider failure'

  constructor(config: Partial<ProviderConfig> = {}) {
    const defaultConfig: ProviderConfig = {
      name: 'Mock Weather',
      enabled: true,
      baseUrl: 'https://mock.weather.api',
      timeout: 100,
      retries: 1,
      rateLimitPerMinute: 1000,
      ...config
    }

    super(defaultConfig.name, defaultConfig)
    this.seedMockData()
  }

  /**
   * Get weather for a game
   */
  async getWeatherForGame(gameId: string, venue: string, kickoffTime: Date): Promise<ApiResponse<WeatherData>> {
    if (this.shouldFail) {
      return this.createFailureResponse<WeatherData>()
    }

    const weather = this.mockData.get(gameId) || this.createDefaultWeather(gameId, venue)
    
    // Update the venue to match the requested venue
    const updatedWeather = { ...weather, gameId, venue }

    return {
      success: true,
      data: updatedWeather,
      rateLimitRemaining: 999,
      rateLimitReset: new Date(Date.now() + 60000)
    }
  }

  /**
   * Get weather for venue coordinates
   */
  async getWeatherForVenue(venue: string, lat: number, lon: number, time: Date): Promise<ApiResponse<WeatherData>> {
    if (this.shouldFail) {
      return this.createFailureResponse<WeatherData>()
    }

    const venueKey = `${venue}-${lat}-${lon}`
    const weather = this.mockData.get(venueKey) || this.createDefaultWeather('', venue, lat, lon)

    return {
      success: true,
      data: weather,
      rateLimitRemaining: 999,
      rateLimitReset: new Date(Date.now() + 60000)
    }
  }

  /**
   * Mock health check
   */
  async healthCheck(): Promise<boolean> {
    return !this.shouldFail
  }

  /**
   * Mock rate limit status
   */
  async getRateLimitStatus(): Promise<{ remaining: number; resetAt: Date }> {
    return {
      remaining: 999,
      resetAt: new Date(Date.now() + 60000)
    }
  }

  /**
   * Test helpers
   */
  addMockWeather(gameId: string, weather: Partial<WeatherData>): void {
    this.mockData.set(gameId, {
      gameId,
      venue: 'Mock Stadium',
      lat: 40.0,
      lon: -80.0,
      temperature: 72,
      windSpeed: 5,
      windDirection: 'SW',
      precipitationChance: 0.1,
      humidity: 0.6,
      conditions: 'Clear',
      isDome: false,
      capturedAt: new Date(),
      source: this.name,
      ...weather
    })
  }

  addMockWeatherForVenue(venue: string, lat: number, lon: number, weather: Partial<WeatherData>): void {
    const venueKey = `${venue}-${lat}-${lon}`
    this.mockData.set(venueKey, {
      gameId: '',
      venue,
      lat,
      lon,
      temperature: 72,
      windSpeed: 5,
      windDirection: 'SW',
      precipitationChance: 0.1,
      humidity: 0.6,
      conditions: 'Clear',
      isDome: false,
      capturedAt: new Date(),
      source: this.name,
      ...weather
    })
  }

  setFailureMode(shouldFail: boolean, message = 'Mock weather provider failure'): void {
    this.shouldFail = shouldFail
    this.failureMessage = message
  }

  clearMockData(): void {
    this.mockData.clear()
    this.seedMockData()
  }

  getMockDataCount(): number {
    return this.mockData.size
  }

  /**
   * Create weather scenarios for testing
   */
  createClearWeather(gameId: string): void {
    this.addMockWeather(gameId, {
      temperature: 75,
      windSpeed: 3,
      windDirection: 'SW',
      precipitationChance: 0.0,
      humidity: 0.4,
      conditions: 'Clear skies'
    })
  }

  createWindyWeather(gameId: string): void {
    this.addMockWeather(gameId, {
      temperature: 68,
      windSpeed: 18,
      windDirection: 'NW',
      precipitationChance: 0.1,
      humidity: 0.5,
      conditions: 'Windy'
    })
  }

  createRainyWeather(gameId: string): void {
    this.addMockWeather(gameId, {
      temperature: 62,
      windSpeed: 8,
      windDirection: 'E',
      precipitationChance: 0.8,
      humidity: 0.9,
      conditions: 'Heavy rain'
    })
  }

  createSnowWeather(gameId: string): void {
    this.addMockWeather(gameId, {
      temperature: 28,
      windSpeed: 12,
      windDirection: 'N',
      precipitationChance: 0.9,
      humidity: 0.8,
      conditions: 'Snow'
    })
  }

  createDomeWeather(gameId: string): void {
    this.addMockWeather(gameId, {
      temperature: 72,
      windSpeed: 0,
      windDirection: 'None',
      precipitationChance: 0.0,
      humidity: 0.4,
      conditions: 'Indoor climate controlled',
      isDome: true
    })
  }

  /**
   * Private methods
   */
  private seedMockData(): void {
    // Create different weather scenarios for testing
    this.createClearWeather('game1')
    this.createWindyWeather('game2')
    this.createRainyWeather('game3')
    this.createSnowWeather('game4')
    this.createDomeWeather('game5')
  }

  private createDefaultWeather(gameId: string, venue: string, lat = 40.0, lon = -80.0): WeatherData {
    return {
      gameId,
      venue,
      lat,
      lon,
      temperature: 72,
      windSpeed: 5,
      windDirection: 'SW',
      precipitationChance: 0.2,
      humidity: 0.6,
      conditions: 'Partly cloudy',
      isDome: venue.toLowerCase().includes('dome') || venue.toLowerCase().includes('stadium'),
      capturedAt: new Date(),
      source: this.name
    }
  }

  private createFailureResponse<T>(): ApiResponse<T> {
    return {
      success: false,
      error: {
        provider: this.name,
        endpoint: '/mock-weather',
        message: this.failureMessage,
        timestamp: new Date(),
        retryable: true
      }
    }
  }
}