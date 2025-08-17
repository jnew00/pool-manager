import { describe, it, expect, beforeEach } from 'vitest'
import { MockOddsProvider, MockWeatherProvider } from './index'

describe('Mock Providers', () => {
  describe('MockOddsProvider', () => {
    let provider: MockOddsProvider

    beforeEach(() => {
      provider = new MockOddsProvider()
    })

    it('should be initialized with default mock data', () => {
      expect(provider.getMockDataCount()).toBeGreaterThan(0)
    })

    it('should return odds for existing game', async () => {
      const response = await provider.getOddsForGame('game1')
      
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data?.gameId).toBe('game1')
      expect(response.data?.source).toBe('Mock Odds')
    })

    it('should return error for non-existent game', async () => {
      const response = await provider.getOddsForGame('nonexistent')
      
      expect(response.success).toBe(false)
      expect(response.error?.message).toContain('not found')
    })

    it('should return odds for multiple games', async () => {
      const response = await provider.getOddsForGames(['game1', 'game2'])
      
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data?.length).toBe(2)
    })

    it('should return available bookmakers', async () => {
      const response = await provider.getAvailableBookmakers()
      
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data?.length).toBeGreaterThan(0)
    })

    it('should support failure mode', async () => {
      provider.setFailureMode(true, 'Test failure')
      
      const response = await provider.getOddsForGame('game1')
      
      expect(response.success).toBe(false)
      expect(response.error?.message).toBe('Test failure')
    })

    it('should support adding custom mock games', () => {
      const initialCount = provider.getMockDataCount()
      
      provider.addMockGame('custom', {
        spread: -14.5,
        total: 55.0,
        moneylineHome: -500,
        moneylineAway: +400
      })
      
      expect(provider.getMockDataCount()).toBe(initialCount + 1)
    })

    it('should support clearing mock data', () => {
      provider.clearMockData()
      expect(provider.getMockDataCount()).toBe(0)
    })

    it('should pass health check when not in failure mode', async () => {
      expect(await provider.healthCheck()).toBe(true)
    })

    it('should fail health check when in failure mode', async () => {
      provider.setFailureMode(true)
      expect(await provider.healthCheck()).toBe(false)
    })

    it('should return rate limit status', async () => {
      const status = await provider.getRateLimitStatus()
      
      expect(status.remaining).toBeGreaterThan(0)
      expect(status.resetAt).toBeInstanceOf(Date)
    })
  })

  describe('MockWeatherProvider', () => {
    let provider: MockWeatherProvider

    beforeEach(() => {
      provider = new MockWeatherProvider()
    })

    it('should be initialized with default mock data', () => {
      expect(provider.getMockDataCount()).toBeGreaterThan(0)
    })

    it('should return weather for game', async () => {
      const kickoffTime = new Date('2024-09-08T13:00:00Z')
      const response = await provider.getWeatherForGame('game1', 'Test Stadium', kickoffTime)
      
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data?.venue).toBe('Test Stadium')
      expect(response.data?.source).toBe('Mock Weather')
    })

    it('should return weather for venue coordinates', async () => {
      const time = new Date('2024-09-08T13:00:00Z')
      const response = await provider.getWeatherForVenue('Custom Stadium', 40.7128, -74.0060, time)
      
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data?.venue).toBe('Custom Stadium')
      expect(response.data?.lat).toBe(40.7128)
      expect(response.data?.lon).toBe(-74.0060)
    })

    it('should support failure mode', async () => {
      provider.setFailureMode(true, 'Weather service down')
      
      const kickoffTime = new Date('2024-09-08T13:00:00Z')
      const response = await provider.getWeatherForGame('game1', 'Test Stadium', kickoffTime)
      
      expect(response.success).toBe(false)
      expect(response.error?.message).toBe('Weather service down')
    })

    it('should create different weather scenarios', () => {
      const initialCount = provider.getMockDataCount()
      
      provider.createClearWeather('clear-game')
      provider.createWindyWeather('windy-game')
      provider.createRainyWeather('rainy-game')
      provider.createSnowWeather('snow-game')
      provider.createDomeWeather('dome-game')
      
      expect(provider.getMockDataCount()).toBeGreaterThan(initialCount)
    })

    it('should support adding custom weather data', () => {
      const initialCount = provider.getMockDataCount()
      
      provider.addMockWeather('custom-game', {
        temperature: 85,
        windSpeed: 25,
        conditions: 'Extreme heat and wind',
        precipitationChance: 0.9
      })
      
      expect(provider.getMockDataCount()).toBe(initialCount + 1)
    })

    it('should support venue-specific weather', () => {
      provider.addMockWeatherForVenue('Lambeau Field', 44.5013, -88.0622, {
        temperature: 15,
        windSpeed: 20,
        conditions: 'Frozen tundra',
        precipitationChance: 0.8
      })
      
      // The venue data should be stored with the venue key
      expect(provider.getMockDataCount()).toBeGreaterThan(0)
    })

    it('should clear and reseed mock data', () => {
      const originalCount = provider.getMockDataCount()
      
      provider.addMockWeather('temp', { temperature: 100 })
      expect(provider.getMockDataCount()).toBeGreaterThan(originalCount)
      
      provider.clearMockData()
      expect(provider.getMockDataCount()).toBe(originalCount) // Back to seeded data
    })

    it('should pass health check when not in failure mode', async () => {
      expect(await provider.healthCheck()).toBe(true)
    })

    it('should fail health check when in failure mode', async () => {
      provider.setFailureMode(true)
      expect(await provider.healthCheck()).toBe(false)
    })

    it('should return rate limit status', async () => {
      const status = await provider.getRateLimitStatus()
      
      expect(status.remaining).toBeGreaterThan(0)
      expect(status.resetAt).toBeInstanceOf(Date)
    })
  })

  describe('Weather scenario validation', () => {
    let provider: MockWeatherProvider

    beforeEach(() => {
      provider = new MockWeatherProvider()
    })

    it('should create clear weather conditions', async () => {
      provider.createClearWeather('clear-test')
      
      const kickoffTime = new Date()
      const response = await provider.getWeatherForGame('clear-test', 'Stadium', kickoffTime)
      
      expect(response.data?.conditions).toContain('Clear')
      expect(response.data?.precipitationChance).toBeLessThan(0.1)
    })

    it('should create windy weather conditions', async () => {
      provider.createWindyWeather('windy-test')
      
      const kickoffTime = new Date()
      const response = await provider.getWeatherForGame('windy-test', 'Stadium', kickoffTime)
      
      expect(response.data?.windSpeed).toBeGreaterThan(15)
      expect(response.data?.conditions).toContain('Windy')
    })

    it('should create rainy weather conditions', async () => {
      provider.createRainyWeather('rainy-test')
      
      const kickoffTime = new Date()
      const response = await provider.getWeatherForGame('rainy-test', 'Stadium', kickoffTime)
      
      expect(response.data?.precipitationChance).toBeGreaterThan(0.7)
      expect(response.data?.conditions).toContain('rain')
    })

    it('should create snow weather conditions', async () => {
      provider.createSnowWeather('snow-test')
      
      const kickoffTime = new Date()
      const response = await provider.getWeatherForGame('snow-test', 'Stadium', kickoffTime)
      
      expect(response.data?.temperature).toBeLessThan(35)
      expect(response.data?.conditions).toContain('Snow')
    })

    it('should create dome conditions', async () => {
      provider.createDomeWeather('dome-test')
      
      const kickoffTime = new Date()
      const response = await provider.getWeatherForGame('dome-test', 'Stadium', kickoffTime)
      
      expect(response.data?.isDome).toBe(true)
      expect(response.data?.windSpeed).toBe(0)
      expect(response.data?.precipitationChance).toBe(0)
    })
  })
})