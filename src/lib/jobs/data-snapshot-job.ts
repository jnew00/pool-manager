import cron from 'node-cron'
import { prisma } from '@/lib/prisma'
import { dataProviderRegistry } from '@/lib/data-sources'
import type { GameDataSnapshot } from '@/lib/data-sources/types'
import { EloSystem } from '@/lib/models/elo-system'
import { SurvivorGradingService } from '@/server/services/survivor-grading.service'
import { getCurrentNFLWeek } from '@/lib/utils/nfl-week'

export interface SnapshotJobConfig {
  enabled: boolean
  schedule: string // Cron expression
  preweekSchedule: string // Thursday 06:00 ET for line snapshots
  weeklySchedule: string // Sunday every 15 minutes for odds updates
  weatherSchedule: string // Every 6 hours for weather updates
  postGameSchedule: string // Tuesday 06:00 ET for post-game processing (Elo updates, etc.)
}

/**
 * Job for capturing data snapshots at scheduled intervals
 */
export class DataSnapshotJob {
  private config: SnapshotJobConfig
  private isRunning = false
  private scheduledTasks: Map<string, cron.ScheduledTask> = new Map()

  constructor(config: SnapshotJobConfig) {
    this.config = config
  }

  /**
   * Start all scheduled jobs
   */
  start(): void {
    if (!this.config.enabled) {
      console.log('Data snapshot jobs are disabled')
      return
    }

    this.startPreweekJob()
    this.startOddsUpdateJob()
    this.startWeatherUpdateJob()
    this.startPostGameJob()

    console.log('Data snapshot jobs started')
  }

  /**
   * Stop all scheduled jobs
   */
  stop(): void {
    for (const [name, task] of this.scheduledTasks) {
      task.stop()
      console.log(`Stopped job: ${name}`)
    }
    this.scheduledTasks.clear()
    console.log('All data snapshot jobs stopped')
  }

  /**
   * Thursday 06:00 ET - Snapshot lines for upcoming week
   */
  private startPreweekJob(): void {
    const task = cron.schedule(
      this.config.preweekSchedule,
      async () => {
        console.log('Running preweek line snapshot job...')
        await this.captureWeeklyLineSnapshots()
      },
      {
        scheduled: false,
        timezone: 'America/New_York',
      }
    )

    this.scheduledTasks.set('preweek-lines', task)
    task.start()
    console.log(
      `Preweek line snapshot job scheduled: ${this.config.preweekSchedule}`
    )
  }

  /**
   * Sunday every 15 minutes - Update odds during games
   */
  private startOddsUpdateJob(): void {
    const task = cron.schedule(
      this.config.weeklySchedule,
      async () => {
        const now = new Date()
        const dayOfWeek = now.getDay() // 0 = Sunday

        // Only run on Sundays and Mondays (for late games)
        if (dayOfWeek === 0 || dayOfWeek === 1) {
          console.log('Running odds update job...')
          await this.updateGameOdds()
        }
      },
      {
        scheduled: false,
        timezone: 'America/New_York',
      }
    )

    this.scheduledTasks.set('odds-updates', task)
    task.start()
    console.log(`Odds update job scheduled: ${this.config.weeklySchedule}`)
  }

  /**
   * Every 6 hours - Update weather forecasts
   */
  private startWeatherUpdateJob(): void {
    const task = cron.schedule(
      this.config.weatherSchedule,
      async () => {
        console.log('Running weather update job...')
        await this.updateWeatherForecasts()
      },
      {
        scheduled: false,
      }
    )

    this.scheduledTasks.set('weather-updates', task)
    task.start()
    console.log(`Weather update job scheduled: ${this.config.weatherSchedule}`)
  }

  /**
   * Tuesday 06:00 ET - Post-game processing (Elo rating updates, etc.)
   */
  private startPostGameJob(): void {
    const task = cron.schedule(
      this.config.postGameSchedule,
      async () => {
        console.log('Running post-game processing job...')
        await this.processCompletedWeek()
      },
      {
        scheduled: false,
        timezone: 'America/New_York',
      }
    )

    this.scheduledTasks.set('post-game-processing', task)
    task.start()
    console.log(`Post-game processing job scheduled: ${this.config.postGameSchedule}`)
  }

  /**
   * Capture line snapshots for all upcoming games in the week
   */
  private async captureWeeklyLineSnapshots(): Promise<void> {
    if (this.isRunning) {
      console.log('Snapshot job already running, skipping...')
      return
    }

    this.isRunning = true

    try {
      // Get upcoming games for the current week
      const upcomingGames = await this.getUpcomingGames()
      console.log(`Found ${upcomingGames.length} upcoming games`)

      for (const game of upcomingGames) {
        try {
          const snapshot = await dataProviderRegistry.getGameDataSnapshot(
            game.id,
            game.venue || 'Unknown Venue',
            game.kickoff,
            game.homeTeamId,
            game.awayTeamId
          )

          await this.saveLineSnapshot(game.id, snapshot)
          console.log(`Saved snapshot for game ${game.id}`)

          // Rate limiting - wait between requests
          await this.sleep(1000)
        } catch (error) {
          console.error(
            `Failed to capture snapshot for game ${game.id}:`,
            error
          )
        }
      }
    } catch (error) {
      console.error('Error in weekly line snapshot job:', error)
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Update odds for active games
   */
  private async updateGameOdds(): Promise<void> {
    try {
      const activeGames = await this.getActiveGames()
      console.log(`Updating odds for ${activeGames.length} active games`)

      for (const game of activeGames) {
        try {
          const oddsResponse = await dataProviderRegistry.getOddsForGame(
            game.id
          )

          if (oddsResponse.success && oddsResponse.data) {
            await this.saveOddsUpdate(game.id, oddsResponse.data)
          }

          await this.sleep(500) // Rate limiting
        } catch (error) {
          console.error(`Failed to update odds for game ${game.id}:`, error)
        }
      }
    } catch (error) {
      console.error('Error in odds update job:', error)
    }
  }

  /**
   * Update weather forecasts for upcoming games
   */
  private async updateWeatherForecasts(): Promise<void> {
    try {
      const upcomingGames = await this.getUpcomingOutdoorGames()
      console.log(`Updating weather for ${upcomingGames.length} outdoor games`)

      for (const game of upcomingGames) {
        try {
          const weatherResponse = await dataProviderRegistry.getWeatherForGame(
            game.id,
            game.venue || 'Unknown Venue',
            game.kickoff
          )

          if (weatherResponse.success && weatherResponse.data) {
            await this.saveWeatherUpdate(game.id, weatherResponse.data)
          }

          await this.sleep(1000) // Rate limiting
        } catch (error) {
          console.error(`Failed to update weather for game ${game.id}:`, error)
        }
      }
    } catch (error) {
      console.error('Error in weather update job:', error)
    }
  }

  /**
   * Get upcoming games that need snapshots
   */
  private async getUpcomingGames() {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    return await prisma.game.findMany({
      where: {
        kickoff: {
          gte: now,
          lte: nextWeek,
        },
      },
      orderBy: {
        kickoff: 'asc',
      },
    })
  }

  /**
   * Get games that are currently active or starting soon
   */
  private async getActiveGames() {
    const now = new Date()
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000)
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    return await prisma.game.findMany({
      where: {
        kickoff: {
          gte: fourHoursAgo,
          lte: twoHoursFromNow,
        },
      },
    })
  }

  /**
   * Get upcoming outdoor games that need weather updates
   */
  private async getUpcomingOutdoorGames() {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    return await prisma.game.findMany({
      where: {
        kickoff: {
          gte: now,
          lte: nextWeek,
        },
        // Filter out dome stadiums - this would need venue data
        venue: {
          not: {
            contains: 'dome',
          },
        },
      },
    })
  }

  /**
   * Save line snapshot to database
   */
  private async saveLineSnapshot(
    gameId: string,
    snapshot: GameDataSnapshot
  ): Promise<void> {
    for (const odds of snapshot.odds) {
      await prisma.line.create({
        data: {
          gameId,
          source: odds.source,
          spread: odds.spread,
          total: odds.total,
          moneylineHome: odds.moneylineHome,
          moneylineAway: odds.moneylineAway,
          capturedAt: odds.capturedAt,
          isUserProvided: false,
        },
      })
    }
  }

  /**
   * Save odds update to database
   */
  private async saveOddsUpdate(gameId: string, odds: any): Promise<void> {
    await prisma.line.create({
      data: {
        gameId,
        source: odds.source,
        spread: odds.spread,
        total: odds.total,
        moneylineHome: odds.moneylineHome,
        moneylineAway: odds.moneylineAway,
        capturedAt: odds.capturedAt,
        isUserProvided: false,
      },
    })
  }

  /**
   * Save weather update - this would need a weather table
   */
  private async saveWeatherUpdate(gameId: string, weather: any): Promise<void> {
    // For now, just log since we don't have a weather table in the schema
    console.log(`Weather update for game ${gameId}:`, {
      temperature: weather.temperature,
      windSpeed: weather.windSpeed,
      conditions: weather.conditions,
    })
  }

  /**
   * Process completed week - Update Elo ratings and grade survivor pools
   */
  private async processCompletedWeek(): Promise<void> {
    try {
      console.log('Starting post-game processing for completed week...')

      // Get recently completed games (last 7 days) that have results but haven't had Elo processed
      const completedGames = await this.getRecentlyCompletedGames()
      console.log(`Found ${completedGames.length} completed games to process`)

      if (completedGames.length === 0) {
        console.log('No completed games found for processing')
        return
      }

      // STEP 1: Update Elo ratings
      console.log('\n=== STEP 1: Updating Elo Ratings ===')
      const eloSystem = new EloSystem()
      let processedCount = 0
      let errorCount = 0

      for (const game of completedGames) {
        try {
          // Update Elo ratings based on game result
          const result = await eloSystem.updateRatingsAfterGame(
            game.homeTeamId,
            game.awayTeamId,
            game.result.homeScore,
            game.result.awayScore,
            game.lines[0]?.spread ? parseFloat(game.lines[0].spread.toString()) : undefined
          )

          console.log(`Updated Elo ratings for ${game.homeTeam.nflAbbr} vs ${game.awayTeam.nflAbbr}:`, {
            homeChange: result.homeRatingChange,
            awayChange: result.awayRatingChange,
            homeNewRating: result.homeNewRating,
            awayNewRating: result.awayNewRating,
          })

          // Mark game as Elo processed (we can add a flag to the game or result table later)
          await prisma.result.update({
            where: { gameId: game.id },
            data: {
              // We could add an "eloProcessed" field later, for now just update updatedAt
              updatedAt: new Date(),
            },
          })

          processedCount++
          await this.sleep(100) // Small delay between processing
        } catch (error) {
          console.error(`Failed to process Elo for game ${game.id}:`, error)
          errorCount++
        }
      }

      console.log(`Elo processing completed: ${processedCount} games processed, ${errorCount} errors`)

      // STEP 2: Grade Survivor Pools
      console.log('\n=== STEP 2: Grading Survivor Pools ===')
      await this.gradeSurvivorPools()

      console.log('\n=== Post-game processing completed successfully ===')
    } catch (error) {
      console.error('Error in post-game processing job:', error)
    }
  }

  /**
   * Grade all active survivor pools for the completed week
   */
  private async gradeSurvivorPools(): Promise<void> {
    try {
      // Determine the week that just completed
      const currentWeek = getCurrentNFLWeek()
      const completedWeek = currentWeek > 1 ? currentWeek - 1 : currentWeek

      console.log(`Grading survivor pools for Week ${completedWeek}`)

      // Get all active survivor pools
      const survivorPools = await prisma.pool.findMany({
        where: {
          type: 'SURVIVOR',
          isActive: true,
        },
      })

      if (survivorPools.length === 0) {
        console.log('No active survivor pools found')
        return
      }

      const gradingService = new SurvivorGradingService()
      let totalGraded = 0
      let totalEliminated = 0

      for (const pool of survivorPools) {
        console.log(`\nGrading pool: ${pool.name} (${pool.id})`)

        // Get current pool stats before grading
        const entriesBefore = await prisma.survivorEntry.findMany({
          where: { poolId: pool.id },
          select: { id: true, isActive: true },
        })
        const activeBefore = entriesBefore.filter((e) => e.isActive).length

        // Grade all picks for this pool and week
        const results = await gradingService.gradeWeekSurvivorPicks(pool.id, completedWeek)
        totalGraded += results.length

        // Get updated pool stats
        const entriesAfter = await prisma.survivorEntry.findMany({
          where: { poolId: pool.id },
          select: { id: true, isActive: true, eliminatedWeek: true },
        })
        const activeAfter = entriesAfter.filter((e) => e.isActive).length
        const eliminatedThisWeek = activeBefore - activeAfter

        totalEliminated += eliminatedThisWeek

        console.log(`  - Graded ${results.length} picks`)
        console.log(`  - Active entries: ${activeAfter}/${entriesAfter.length}`)

        if (eliminatedThisWeek > 0) {
          console.log(`  - ⚠️  Eliminated this week: ${eliminatedThisWeek}`)
        }

        const survivalRate = entriesAfter.length > 0
          ? ((activeAfter / entriesAfter.length) * 100).toFixed(1)
          : '0'
        console.log(`  - Survival rate: ${survivalRate}%`)
      }

      console.log('\n--- Survivor Grading Summary ---')
      console.log(`Total picks graded: ${totalGraded}`)
      console.log(`Total entries eliminated: ${totalEliminated}`)
      console.log(`Pools processed: ${survivorPools.length}`)

    } catch (error) {
      console.error('Error grading survivor pools:', error)
      // Don't throw - allow the job to continue even if survivor grading fails
    }
  }

  /**
   * Get recently completed games that need Elo processing
   */
  private async getRecentlyCompletedGames() {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return await prisma.game.findMany({
      where: {
        kickoff: {
          gte: sevenDaysAgo,
        },
        result: {
          isNot: null,
          homeScore: {
            not: null,
          },
          awayScore: {
            not: null,
          },
          status: {
            in: ['FINAL', 'COMPLETED'],
          },
        },
      },
      include: {
        result: true,
        homeTeam: {
          select: { nflAbbr: true },
        },
        awayTeam: {
          select: { nflAbbr: true },
        },
        lines: {
          take: 1,
          orderBy: { capturedAt: 'desc' },
        },
      },
      orderBy: {
        kickoff: 'asc',
      },
    })
  }

  /**
   * Simple sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Get current job status
   */
  getStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {}

    for (const [name, task] of this.scheduledTasks) {
      status[name] = task.getStatus() === 'scheduled'
    }

    return status
  }

  /**
   * Manual trigger for testing
   */
  async triggerPreweekSnapshot(): Promise<void> {
    console.log('Manually triggering preweek snapshot...')
    await this.captureWeeklyLineSnapshots()
  }

  async triggerOddsUpdate(): Promise<void> {
    console.log('Manually triggering odds update...')
    await this.updateGameOdds()
  }

  async triggerWeatherUpdate(): Promise<void> {
    console.log('Manually triggering weather update...')
    await this.updateWeatherForecasts()
  }

  async triggerPostGameProcessing(): Promise<void> {
    console.log('Manually triggering post-game processing...')
    await this.processCompletedWeek()
  }

  async triggerSurvivorGrading(week?: number): Promise<void> {
    console.log(`Manually triggering survivor grading${week ? ` for week ${week}` : ''}...`)

    if (week) {
      // Grade specific week across all pools
      const survivorPools = await prisma.pool.findMany({
        where: {
          type: 'SURVIVOR',
          isActive: true,
        },
      })

      const gradingService = new SurvivorGradingService()
      for (const pool of survivorPools) {
        console.log(`Grading pool: ${pool.name} for week ${week}`)
        const results = await gradingService.gradeWeekSurvivorPicks(pool.id, week)
        console.log(`Graded ${results.length} picks`)
      }
    } else {
      // Use existing automatic logic
      await this.gradeSurvivorPools()
    }
  }
}

// Default configuration
export const defaultSnapshotConfig: SnapshotJobConfig = {
  enabled: process.env.NODE_ENV === 'production',
  schedule: '0 6 * * 4', // Default: Thursday 6 AM
  preweekSchedule: '0 6 * * 4', // Thursday 06:00 ET
  weeklySchedule: '*/15 * * * 0,1', // Every 15 minutes on Sunday/Monday
  weatherSchedule: '0 */6 * * *', // Every 6 hours
  postGameSchedule: '0 6 * * 2', // Tuesday 06:00 ET for post-game processing
}

// Global instance
export const dataSnapshotJob = new DataSnapshotJob(defaultSnapshotConfig)
