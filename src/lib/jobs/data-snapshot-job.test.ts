import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DataSnapshotJob } from './data-snapshot-job'
import type { SnapshotJobConfig } from './data-snapshot-job'
import { DatabaseTestUtils } from '@/lib/test-utils/database'

// Mock node-cron
vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn((expression, task, options) => ({
      start: vi.fn(),
      stop: vi.fn(),
      getStatus: vi.fn(() => 'scheduled')
    }))
  }
}))

// Mock data provider registry
vi.mock('@/lib/data-sources', () => ({
  dataProviderRegistry: {
    getGameDataSnapshot: vi.fn(),
    getOddsForGame: vi.fn(),
    getWeatherForGame: vi.fn()
  }
}))

describe('DataSnapshotJob', () => {
  let job: DataSnapshotJob
  let testConfig: SnapshotJobConfig

  beforeEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
    
    testConfig = {
      enabled: true,
      schedule: '0 6 * * 4',
      preweekSchedule: '0 6 * * 4',
      weeklySchedule: '*/15 * * * 0,1',
      weatherSchedule: '0 */6 * * *'
    }
    
    job = new DataSnapshotJob(testConfig)
    vi.clearAllMocks()
  })

  afterEach(async () => {
    job.stop()
    await DatabaseTestUtils.cleanupTestData()
  })

  describe('job lifecycle', () => {
    it('should create job with config', () => {
      expect(job).toBeDefined()
    })

    it('should start all scheduled jobs when enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      job.start()
      
      expect(consoleSpy).toHaveBeenCalledWith('Data snapshot jobs started')
      consoleSpy.mockRestore()
    })

    it('should not start jobs when disabled', () => {
      const disabledConfig = { ...testConfig, enabled: false }
      const disabledJob = new DataSnapshotJob(disabledConfig)
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      disabledJob.start()
      
      expect(consoleSpy).toHaveBeenCalledWith('Data snapshot jobs are disabled')
      consoleSpy.mockRestore()
    })

    it('should stop all jobs', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      job.start()
      job.stop()
      
      expect(consoleSpy).toHaveBeenCalledWith('All data snapshot jobs stopped')
      consoleSpy.mockRestore()
    })

    it('should return job status', () => {
      job.start()
      const status = job.getStatus()
      
      expect(status).toBeDefined()
      expect(typeof status).toBe('object')
    })
  })

  describe('manual triggers', () => {
    beforeEach(async () => {
      // Create test games
      await DatabaseTestUtils.createTestGame({
        id: 'test-game-1',
        season: 2024,
        week: 1,
        kickoff: new Date('2024-09-08T13:00:00Z'),
        homeTeamId: 'team-home',
        awayTeamId: 'team-away',
        venue: 'Test Stadium'
      })
    })

    it('should trigger preweek snapshot manually', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      await job.triggerPreweekSnapshot()
      
      expect(consoleSpy).toHaveBeenCalledWith('Manually triggering preweek snapshot...')
      consoleSpy.mockRestore()
    })

    it('should trigger odds update manually', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      await job.triggerOddsUpdate()
      
      expect(consoleSpy).toHaveBeenCalledWith('Manually triggering odds update...')
      consoleSpy.mockRestore()
    })

    it('should trigger weather update manually', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      await job.triggerWeatherUpdate()
      
      expect(consoleSpy).toHaveBeenCalledWith('Manually triggering weather update...')
      consoleSpy.mockRestore()
    })
  })

  describe('data capture logic', () => {
    beforeEach(async () => {
      // Create test teams
      await DatabaseTestUtils.createTestTeam({
        id: 'team-home',
        nflAbbr: 'HOM',
        name: 'Home Team'
      })
      
      await DatabaseTestUtils.createTestTeam({
        id: 'team-away',
        nflAbbr: 'AWY',
        name: 'Away Team'
      })

      // Create upcoming test game
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 3) // 3 days from now
      
      await DatabaseTestUtils.createTestGame({
        id: 'upcoming-game',
        season: 2024,
        week: 1,
        kickoff: futureDate,
        homeTeamId: 'team-home',
        awayTeamId: 'team-away',
        venue: 'Test Stadium'
      })
    })

    it('should handle snapshot capture with real database', async () => {
      // Mock the data provider registry
      const { dataProviderRegistry } = await import('@/lib/data-sources')
      
      vi.mocked(dataProviderRegistry.getGameDataSnapshot).mockResolvedValue({
        gameId: 'upcoming-game',
        odds: [{
          gameId: 'upcoming-game',
          source: 'test',
          spread: -3.5,
          total: 47.5,
          moneylineHome: -175,
          moneylineAway: 155,
          capturedAt: new Date(),
          bookmaker: 'TestBook'
        }],
        weather: {
          gameId: 'upcoming-game',
          venue: 'Test Stadium',
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
          source: 'test'
        },
        injuries: [],
        capturedAt: new Date()
      })

      await job.triggerPreweekSnapshot()

      // Verify the snapshot was processed
      expect(dataProviderRegistry.getGameDataSnapshot).toHaveBeenCalledWith(
        'upcoming-game',
        'Test Stadium',
        expect.any(Date),
        'team-home',
        'team-away'
      )
    })

    it('should handle errors during snapshot capture', async () => {
      const { dataProviderRegistry } = await import('@/lib/data-sources')
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      vi.mocked(dataProviderRegistry.getGameDataSnapshot).mockRejectedValue(
        new Error('Provider error')
      )

      await job.triggerPreweekSnapshot()

      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('scheduling configuration', () => {
    it('should accept custom cron expressions', () => {
      const customConfig: SnapshotJobConfig = {
        enabled: true,
        schedule: '0 0 * * *',
        preweekSchedule: '0 0 * * 3', // Wednesday midnight
        weeklySchedule: '*/30 * * * 0', // Every 30 minutes on Sunday
        weatherSchedule: '0 */12 * * *' // Every 12 hours
      }

      const customJob = new DataSnapshotJob(customConfig)
      expect(customJob).toBeDefined()
    })

    it('should handle timezone considerations', () => {
      // The job should work with ET timezone for NFL schedule alignment
      const job = new DataSnapshotJob(testConfig)
      job.start()
      
      // Just verify it doesn't throw - actual timezone testing would need more setup
      expect(job.getStatus()).toBeDefined()
    })
  })

  describe('rate limiting and batching', () => {
    it('should prevent concurrent snapshot jobs', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      // Start two snapshots simultaneously
      const promise1 = job.triggerPreweekSnapshot()
      const promise2 = job.triggerPreweekSnapshot()
      
      await Promise.all([promise1, promise2])
      
      // Should see "already running" message
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('already running')
      )
      consoleSpy.mockRestore()
    })
  })
})