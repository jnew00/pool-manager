import { BaseDataProvider } from '../base-provider'
import type { OddsProvider, OddsData, ApiResponse, ProviderConfig } from '../types'

/**
 * Mock odds provider for testing and development
 */
export class MockOddsProvider extends BaseDataProvider implements OddsProvider {
  private mockData: Map<string, OddsData> = new Map()
  private shouldFail = false
  private failureMessage = 'Mock provider failure'

  constructor(config: Partial<ProviderConfig> = {}) {
    const defaultConfig: ProviderConfig = {
      name: 'Mock Odds',
      enabled: true,
      baseUrl: 'https://mock.api',
      timeout: 100,
      retries: 1,
      rateLimitPerMinute: 1000,
      ...config
    }

    super(defaultConfig.name, defaultConfig)
    this.seedMockData()
  }

  /**
   * Get odds for multiple games
   */
  async getOddsForGames(gameIds: string[]): Promise<ApiResponse<OddsData[]>> {
    if (this.shouldFail) {
      return this.createFailureResponse<OddsData[]>()
    }

    const odds: OddsData[] = []
    for (const gameId of gameIds) {
      const gameOdds = this.mockData.get(gameId)
      if (gameOdds) {
        odds.push(gameOdds)
      }
    }

    return {
      success: true,
      data: odds,
      rateLimitRemaining: 999,
      rateLimitReset: new Date(Date.now() + 60000)
    }
  }

  /**
   * Get odds for a single game
   */
  async getOddsForGame(gameId: string): Promise<ApiResponse<OddsData>> {
    if (this.shouldFail) {
      return this.createFailureResponse<OddsData>()
    }

    const odds = this.mockData.get(gameId)
    if (!odds) {
      return {
        success: false,
        error: {
          provider: this.name,
          endpoint: '/odds',
          message: `Game ${gameId} not found`,
          timestamp: new Date(),
          retryable: false
        }
      }
    }

    return {
      success: true,
      data: odds,
      rateLimitRemaining: 999,
      rateLimitReset: new Date(Date.now() + 60000)
    }
  }

  /**
   * Get available bookmakers
   */
  async getAvailableBookmakers(): Promise<ApiResponse<string[]>> {
    if (this.shouldFail) {
      return this.createFailureResponse<string[]>()
    }

    return {
      success: true,
      data: ['MockBook1', 'MockBook2', 'MockBook3'],
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
  addMockGame(gameId: string, odds: Partial<OddsData>): void {
    this.mockData.set(gameId, {
      gameId,
      source: this.name,
      capturedAt: new Date(),
      bookmaker: 'MockBook',
      isOpening: false,
      ...odds
    })
  }

  setFailureMode(shouldFail: boolean, message = 'Mock provider failure'): void {
    this.shouldFail = shouldFail
    this.failureMessage = message
  }

  clearMockData(): void {
    this.mockData.clear()
  }

  getMockDataCount(): number {
    return this.mockData.size
  }

  /**
   * Private methods
   */
  private seedMockData(): void {
    // Add some default mock games
    this.addMockGame('game1', {
      spread: -3.5,
      total: 47.5,
      moneylineHome: -175,
      moneylineAway: +155
    })

    this.addMockGame('game2', {
      spread: 7.0,
      total: 52.0,
      moneylineHome: +275,
      moneylineAway: -350
    })

    this.addMockGame('game3', {
      spread: -0.5,
      total: 44.5,
      moneylineHome: -110,
      moneylineAway: -110
    })
  }

  private createFailureResponse<T>(): ApiResponse<T> {
    return {
      success: false,
      error: {
        provider: this.name,
        endpoint: '/mock',
        message: this.failureMessage,
        timestamp: new Date(),
        retryable: true
      }
    }
  }
}