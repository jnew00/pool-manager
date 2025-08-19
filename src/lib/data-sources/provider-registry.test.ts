import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProviderRegistry } from './provider-registry'
import { MockOddsProvider, MockWeatherProvider } from './providers'
import type { OddsData, WeatherData } from './types'

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry
  let mockOddsProvider: MockOddsProvider
  let mockWeatherProvider: MockWeatherProvider

  beforeEach(() => {
    registry = new ProviderRegistry()
    mockOddsProvider = new MockOddsProvider()
    mockWeatherProvider = new MockWeatherProvider()
  })

  describe('provider registration', () => {
    it('should register odds provider', () => {
      registry.registerOddsProvider(mockOddsProvider)

      const providers = registry.getAvailableProviders()
      expect(providers.odds).toContain('Mock Odds')
    })

    it('should register weather provider', () => {
      registry.registerWeatherProvider(mockWeatherProvider)

      const providers = registry.getAvailableProviders()
      expect(providers.weather).toContain('Mock Weather')
    })

    it('should set first provider as default', () => {
      registry.registerOddsProvider(mockOddsProvider)

      const providers = registry.getAvailableProviders()
      expect(providers.odds[0]).toBe('Mock Odds')
    })

    it('should allow setting specific provider as default', () => {
      // Create providers with different names via config
      const provider1 = new MockOddsProvider({ name: 'Provider1' })
      const provider2 = new MockOddsProvider({ name: 'Provider2' })

      registry.registerOddsProvider(provider1)
      registry.registerOddsProvider(provider2, true) // Set as default

      const providers = registry.getAvailableProviders()
      expect(providers.odds).toContain(provider1.name)
      expect(providers.odds).toContain(provider2.name)
    })
  })

  describe('odds data retrieval', () => {
    beforeEach(() => {
      registry.registerOddsProvider(mockOddsProvider)
    })

    it('should get odds for single game', async () => {
      const response = await registry.getOddsForGame('game1')

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data?.gameId).toBe('game1')
    })

    it('should get odds for multiple games', async () => {
      const response = await registry.getOddsForGames(['game1', 'game2'])

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data?.length).toBe(2)
    })

    it('should handle non-existent game', async () => {
      const response = await registry.getOddsForGame('nonexistent')

      expect(response.success).toBe(false)
      expect(response.error).toBeDefined()
    })

    it('should return error when no provider registered', async () => {
      const emptyRegistry = new ProviderRegistry()
      const response = await emptyRegistry.getOddsForGame('game1')

      expect(response.success).toBe(false)
      expect(response.error?.message).toContain('No odds provider available')
    })
  })

  describe('weather data retrieval', () => {
    beforeEach(() => {
      registry.registerWeatherProvider(mockWeatherProvider)
    })

    it('should get weather for game', async () => {
      // Add specific weather data for this test
      mockWeatherProvider.addMockWeather('game1', {
        venue: 'Test Stadium',
        temperature: 75,
      })

      const kickoffTime = new Date('2024-09-08T13:00:00Z')
      const response = await registry.getWeatherForGame(
        'game1',
        'Test Stadium',
        kickoffTime
      )

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data?.venue).toBe('Test Stadium')
    })

    it('should return error when no weather provider registered', async () => {
      const emptyRegistry = new ProviderRegistry()
      const kickoffTime = new Date('2024-09-08T13:00:00Z')
      const response = await emptyRegistry.getWeatherForGame(
        'game1',
        'Test Stadium',
        kickoffTime
      )

      expect(response.success).toBe(false)
      expect(response.error?.message).toContain('No weather provider available')
    })
  })

  describe('comprehensive game data snapshot', () => {
    beforeEach(() => {
      registry.registerOddsProvider(mockOddsProvider)
      registry.registerWeatherProvider(mockWeatherProvider)
    })

    it('should create comprehensive snapshot', async () => {
      const kickoffTime = new Date('2024-09-08T13:00:00Z')
      const snapshot = await registry.getGameDataSnapshot(
        'game1',
        'Test Stadium',
        kickoffTime,
        'team1',
        'team2'
      )

      expect(snapshot.gameId).toBe('game1')
      expect(snapshot.odds).toBeDefined()
      expect(snapshot.weather).toBeDefined()
      expect(snapshot.injuries).toBeDefined()
      expect(snapshot.capturedAt).toBeInstanceOf(Date)
    })

    it('should handle partial data gracefully', async () => {
      // Set odds provider to fail
      mockOddsProvider.setFailureMode(true)

      const kickoffTime = new Date('2024-09-08T13:00:00Z')
      const snapshot = await registry.getGameDataSnapshot(
        'game1',
        'Test Stadium',
        kickoffTime,
        'team1',
        'team2'
      )

      expect(snapshot.gameId).toBe('game1')
      expect(snapshot.odds).toHaveLength(0) // Should be empty due to failure
      expect(snapshot.weather).toBeDefined() // Should still have weather
    })
  })

  describe('health checks', () => {
    beforeEach(() => {
      registry.registerOddsProvider(mockOddsProvider)
      registry.registerWeatherProvider(mockWeatherProvider)
    })

    it('should check health of all providers', async () => {
      const health = await registry.checkProviderHealth()

      expect(health['odds:Mock Odds']).toBe(true)
      expect(health['weather:Mock Weather']).toBe(true)
    })

    it('should report unhealthy providers', async () => {
      mockOddsProvider.setFailureMode(true)

      const health = await registry.checkProviderHealth()

      expect(health['odds:Mock Odds']).toBe(false)
      expect(health['weather:Mock Weather']).toBe(true)
    })
  })

  describe('provider selection', () => {
    it('should use specified provider', async () => {
      const provider1 = new MockOddsProvider({ name: 'Provider1' })
      const provider2 = new MockOddsProvider({ name: 'Provider2' })

      // Clear default data and add specific test data
      provider1.clearMockData()
      provider2.clearMockData()
      provider1.addMockGame('test', { spread: -3.5 })
      provider2.addMockGame('test', { spread: -7.0 })

      registry.registerOddsProvider(provider1)
      registry.registerOddsProvider(provider2)

      const response1 = await registry.getOddsForGame('test', provider1.name)
      const response2 = await registry.getOddsForGame('test', provider2.name)

      expect(response1.data?.spread).toBe(-3.5)
      expect(response2.data?.spread).toBe(-7.0)
    })

    it('should fall back to default provider', async () => {
      registry.registerOddsProvider(mockOddsProvider)

      const response = await registry.getOddsForGame('game1') // No provider specified

      expect(response.success).toBe(true)
      expect(response.data?.source).toBe('Mock Odds')
    })
  })
})
