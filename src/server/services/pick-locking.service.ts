import { prisma } from '@/lib/prisma'
import type { Pool } from '@/lib/types/database'

export class PickLockingService {
  /**
   * Check if a specific game is locked for picks based on pool rules
   */
  async isGameLocked(gameId: string, poolId: string): Promise<boolean> {
    const deadline = await this.getLockDeadlineForGame(gameId, poolId)
    return new Date() > deadline
  }

  /**
   * Get all locked games for a pool in a specific season/week
   */
  async getLockedGames(
    poolId: string,
    season: number,
    week: number
  ): Promise<string[]> {
    const games = await prisma.game.findMany({
      where: {
        season,
        week,
      },
      select: {
        id: true,
        kickoff: true,
      },
    })

    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
      select: { rules: true },
    })

    if (!pool) {
      throw new Error('Pool not found')
    }

    const lockedGameIds: string[] = []
    const currentTime = new Date()

    for (const game of games) {
      const deadline = this.calculateLockDeadline(
        game.kickoff,
        pool.rules as any,
        season,
        week
      )
      if (currentTime > deadline) {
        lockedGameIds.push(game.id)
      }
    }

    return lockedGameIds
  }

  /**
   * Validate that a pick can be submitted for a game (not locked)
   */
  async validatePickSubmission(
    entryId: string,
    gameId: string,
    poolId: string
  ): Promise<void> {
    const isLocked = await this.isGameLocked(gameId, poolId)

    if (isLocked) {
      throw new Error('Game is locked and picks cannot be submitted')
    }
  }

  /**
   * Get the lock deadline for a specific game in a pool
   */
  async getLockDeadlineForGame(gameId: string, poolId: string): Promise<Date> {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        kickoff: true,
        season: true,
        week: true,
      },
    })

    if (!game) {
      throw new Error('Game not found')
    }

    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
      select: { rules: true },
    })

    if (!pool) {
      throw new Error('Pool not found')
    }

    return this.calculateLockDeadline(
      game.kickoff,
      pool.rules as any,
      game.season,
      game.week
    )
  }

  /**
   * Calculate lock deadline based on pool rules and game information
   */
  private calculateLockDeadline(
    gameKickoff: Date,
    poolRules: any,
    season: number,
    week: number
  ): Date {
    const lockDeadlineRule = poolRules?.lockDeadline || 'game_time'

    switch (lockDeadlineRule) {
      case 'game_time':
        return new Date(gameKickoff)

      case '1_hour_before':
        return new Date(gameKickoff.getTime() - 60 * 60 * 1000) // 1 hour before

      case '2_hours_before':
        return new Date(gameKickoff.getTime() - 2 * 60 * 60 * 1000) // 2 hours before

      case 'weekly_thursday_8pm':
        return this.getThursdayDeadlineForWeek(season, week)

      case 'weekly_sunday_1pm':
        return this.getSundayDeadlineForWeek(season, week)

      default:
        // Default to game time if unknown rule
        return new Date(gameKickoff)
    }
  }

  /**
   * Get Thursday 8 PM ET deadline for a given NFL week
   */
  private getThursdayDeadlineForWeek(season: number, week: number): Date {
    // NFL season typically starts first Thursday in September
    // This is a simplified calculation - in production you'd want more precise NFL calendar data
    const seasonStart = new Date(season, 8, 1) // September 1st

    // Find first Thursday of September
    const firstThursday = new Date(seasonStart)
    const dayOfWeek = seasonStart.getDay()
    const daysUntilThursday = (4 - dayOfWeek + 7) % 7
    firstThursday.setDate(seasonStart.getDate() + daysUntilThursday)

    // Calculate the Thursday for the given week
    const weekThursday = new Date(firstThursday)
    weekThursday.setDate(firstThursday.getDate() + (week - 1) * 7)

    // Set to 8 PM ET (convert to UTC - ET is UTC-4 during NFL season)
    weekThursday.setUTCHours(24) // 8 PM ET = 24:00 UTC (midnight next day)
    weekThursday.setUTCMinutes(0)
    weekThursday.setUTCSeconds(0)
    weekThursday.setUTCMilliseconds(0)

    return weekThursday
  }

  /**
   * Get Sunday 1 PM ET deadline for a given NFL week
   */
  private getSundayDeadlineForWeek(season: number, week: number): Date {
    // Similar logic for Sunday deadlines
    const seasonStart = new Date(season, 8, 1) // September 1st

    // Find first Sunday of the season
    const firstSunday = new Date(seasonStart)
    const dayOfWeek = seasonStart.getDay()
    const daysUntilSunday = (7 - dayOfWeek) % 7
    firstSunday.setDate(seasonStart.getDate() + daysUntilSunday)

    // Calculate the Sunday for the given week
    const weekSunday = new Date(firstSunday)
    weekSunday.setDate(firstSunday.getDate() + (week - 1) * 7)

    // Set to 1 PM ET (convert to UTC - ET is UTC-4 during NFL season)
    weekSunday.setUTCHours(17) // 1 PM ET = 17:00 UTC
    weekSunday.setUTCMinutes(0)
    weekSunday.setUTCSeconds(0)
    weekSunday.setUTCMilliseconds(0)

    return weekSunday
  }

  /**
   * Get summary of lock status for multiple games
   */
  async getGameLockStatus(
    gameIds: string[],
    poolId: string
  ): Promise<
    Record<
      string,
      {
        isLocked: boolean
        deadline: Date
        timeRemaining?: number
      }
    >
  > {
    const results: Record<string, any> = {}

    for (const gameId of gameIds) {
      const deadline = await this.getLockDeadlineForGame(gameId, poolId)
      const isLocked = new Date() > deadline
      const timeRemaining = isLocked ? 0 : deadline.getTime() - Date.now()

      results[gameId] = {
        isLocked,
        deadline,
        timeRemaining: timeRemaining > 0 ? timeRemaining : undefined,
      }
    }

    return results
  }
}
