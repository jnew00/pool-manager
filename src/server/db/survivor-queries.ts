/**
 * Optimized database queries for Survivor Pool
 * Uses efficient query patterns and indexing strategies
 */

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { SurvivorCache } from '@/lib/cache/survivor-cache'

export class OptimizedSurvivorQueries {
  /**
   * Get pool with minimal data for list views
   */
  static async getPoolSummary(poolId: string) {
    return SurvivorCache.getPoolStats(`summary-${poolId}`, 0, async () => {
      return prisma.pool.findUnique({
        where: { id: poolId },
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          season: true,
          _count: {
            select: {
              members: true,
            },
          },
        },
      })
    })
  }

  /**
   * Efficient batch fetch for multiple entries
   */
  static async getBatchEntries(entryIds: string[]) {
    return prisma.survivorEntry.findMany({
      where: {
        id: { in: entryIds },
      },
      include: {
        picks: {
          select: {
            week: true,
            teamId: true,
            result: true,
            marginOfVictory: true,
            team: {
              select: {
                abbreviation: true,
              },
            },
          },
          orderBy: {
            week: 'desc',
          },
        },
      },
    })
  }

  /**
   * Get active entries count efficiently
   */
  static async getActiveSurvivorsCount(poolId: string, week: number) {
    return SurvivorCache.getPoolStats(`active-${poolId}`, week, async () => {
      return prisma.survivorEntry.count({
        where: {
          poolId,
          eliminatedWeek: null,
        },
      })
    })
  }

  /**
   * Optimized query for week's games with odds
   */
  static async getWeekGamesWithOdds(week: number) {
    return prisma.game.findMany({
      where: { week },
      select: {
        id: true,
        week: true,
        gameTime: true,
        homeTeamId: true,
        awayTeamId: true,
        homeMoneyline: true,
        awayMoneyline: true,
        homeSpread: true,
        overUnder: true,
        homeScore: true,
        awayScore: true,
        homeTeam: {
          select: {
            id: true,
            abbreviation: true,
            name: true,
            primaryColor: true,
            secondaryColor: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            abbreviation: true,
            name: true,
            primaryColor: true,
            secondaryColor: true,
          },
        },
      },
      orderBy: {
        gameTime: 'asc',
      },
    })
  }

  /**
   * Get user's picks for a week with team details
   */
  static async getUserWeekPicks(userId: string, poolId: string, week: number) {
    return prisma.survivorPick.findMany({
      where: {
        week,
        entry: {
          userId,
          poolId,
        },
      },
      select: {
        id: true,
        week: true,
        teamId: true,
        result: true,
        marginOfVictory: true,
        entryId: true,
        team: {
          select: {
            abbreviation: true,
            name: true,
          },
        },
        entry: {
          select: {
            id: true,
            name: true,
            eliminatedWeek: true,
          },
        },
      },
    })
  }

  /**
   * Bulk update pick results
   */
  static async bulkUpdatePickResults(
    updates: Array<{
      pickId: string
      result: 'WIN' | 'LOSS'
      marginOfVictory?: number
    }>
  ) {
    // Use transaction for consistency
    return prisma.$transaction(
      updates.map((update) =>
        prisma.survivorPick.update({
          where: { id: update.pickId },
          data: {
            result: update.result,
            marginOfVictory: update.marginOfVictory,
          },
        })
      )
    )
  }

  /**
   * Get team usage statistics for pool
   */
  static async getTeamUsageStats(poolId: string, week: number) {
    const key = `team-usage-${poolId}-${week}`

    return SurvivorCache.getPoolStats(key, week, async () => {
      const result = await prisma.$queryRaw<
        Array<{
          teamId: string
          teamAbbr: string
          usageCount: bigint
          winCount: bigint
          lossCount: bigint
        }>
      >`
        SELECT 
          t.id as "teamId",
          t.abbreviation as "teamAbbr",
          COUNT(DISTINCT sp.id) as "usageCount",
          COUNT(CASE WHEN sp.result = 'WIN' THEN 1 END) as "winCount",
          COUNT(CASE WHEN sp.result = 'LOSS' THEN 1 END) as "lossCount"
        FROM "Team" t
        LEFT JOIN "SurvivorPick" sp ON sp."teamId" = t.id
        LEFT JOIN "SurvivorEntry" se ON se.id = sp."entryId"
        WHERE se."poolId" = ${poolId}
          AND sp.week <= ${week}
        GROUP BY t.id, t.abbreviation
        ORDER BY "usageCount" DESC
      `

      // Convert BigInt to number for JSON serialization
      return result.map((row) => ({
        teamId: row.teamId,
        teamAbbr: row.teamAbbr,
        usageCount: Number(row.usageCount),
        winCount: Number(row.winCount),
        lossCount: Number(row.lossCount),
        winRate: Number(row.winCount) / Math.max(1, Number(row.usageCount)),
      }))
    })
  }

  /**
   * Get elimination statistics by week
   */
  static async getEliminationStats(poolId: string) {
    const result = await prisma.$queryRaw<
      Array<{
        week: number
        eliminations: bigint
      }>
    >`
      SELECT 
        "eliminatedWeek" as week,
        COUNT(*) as eliminations
      FROM "SurvivorEntry"
      WHERE "poolId" = ${poolId}
        AND "eliminatedWeek" IS NOT NULL
      GROUP BY "eliminatedWeek"
      ORDER BY "eliminatedWeek"
    `

    return result.map((row) => ({
      week: row.week,
      eliminations: Number(row.eliminations),
    }))
  }

  /**
   * Get head-to-head comparison data
   */
  static async getHeadToHeadData(entry1Id: string, entry2Id: string) {
    const [entry1Picks, entry2Picks] = await Promise.all([
      prisma.survivorPick.findMany({
        where: { entryId: entry1Id },
        select: {
          week: true,
          teamId: true,
          result: true,
          marginOfVictory: true,
          team: {
            select: { abbreviation: true },
          },
        },
        orderBy: { week: 'asc' },
      }),
      prisma.survivorPick.findMany({
        where: { entryId: entry2Id },
        select: {
          week: true,
          teamId: true,
          result: true,
          marginOfVictory: true,
          team: {
            select: { abbreviation: true },
          },
        },
        orderBy: { week: 'asc' },
      }),
    ])

    return { entry1Picks, entry2Picks }
  }

  /**
   * Create indexes for optimal performance
   */
  static async createIndexes() {
    // These would be added to your Prisma schema
    // Shown here for documentation
    const indexQueries = [
      // Composite index for entry lookups
      `CREATE INDEX IF NOT EXISTS idx_survivor_entry_pool_user 
       ON "SurvivorEntry"("poolId", "userId")`,

      // Index for active entries
      `CREATE INDEX IF NOT EXISTS idx_survivor_entry_active 
       ON "SurvivorEntry"("poolId", "eliminatedWeek") 
       WHERE "eliminatedWeek" IS NULL`,

      // Index for pick lookups
      `CREATE INDEX IF NOT EXISTS idx_survivor_pick_entry_week 
       ON "SurvivorPick"("entryId", "week")`,

      // Index for team usage
      `CREATE INDEX IF NOT EXISTS idx_survivor_pick_team_result 
       ON "SurvivorPick"("teamId", "result")`,

      // Index for game lookups
      `CREATE INDEX IF NOT EXISTS idx_game_week_time 
       ON "Game"("week", "gameTime")`,
    ]

    // Execute in production via migration
    console.log('Indexes to be created:', indexQueries)
  }

  /**
   * Vacuum and analyze tables for performance
   */
  static async optimizeTables() {
    if (process.env.NODE_ENV === 'production') {
      await prisma.$executeRaw`VACUUM ANALYZE "SurvivorEntry"`
      await prisma.$executeRaw`VACUUM ANALYZE "SurvivorPick"`
      await prisma.$executeRaw`VACUUM ANALYZE "Game"`
      console.log('Database tables optimized')
    }
  }
}

/**
 * Connection pool manager
 */
export class ConnectionManager {
  private static instance: ConnectionManager
  private connectionCount = 0
  private maxConnections = 10

  static getInstance(): ConnectionManager {
    if (!this.instance) {
      this.instance = new ConnectionManager()
    }
    return this.instance
  }

  async executeWithConnection<T>(operation: () => Promise<T>): Promise<T> {
    if (this.connectionCount >= this.maxConnections) {
      // Wait for available connection
      await new Promise((resolve) => setTimeout(resolve, 100))
      return this.executeWithConnection(operation)
    }

    this.connectionCount++
    try {
      return await operation()
    } finally {
      this.connectionCount--
    }
  }

  getConnectionStats() {
    return {
      active: this.connectionCount,
      max: this.maxConnections,
      available: this.maxConnections - this.connectionCount,
    }
  }
}

/**
 * Query batching utilities
 */
export class QueryBatcher {
  private static batches = new Map<string, Promise<any>>()
  private static batchData = new Map<string, any[]>()
  private static batchTimers = new Map<string, NodeJS.Timeout>()

  static async addToBatch<T>(
    batchKey: string,
    data: any,
    executor: (batch: any[]) => Promise<T[]>,
    delay: number = 10
  ): Promise<T> {
    // Add to batch data
    if (!this.batchData.has(batchKey)) {
      this.batchData.set(batchKey, [])
    }
    const batch = this.batchData.get(batchKey)!
    const index = batch.length
    batch.push(data)

    // Create or reuse batch promise
    if (!this.batches.has(batchKey)) {
      this.batches.set(
        batchKey,
        new Promise(async (resolve) => {
          // Clear any existing timer
          const existingTimer = this.batchTimers.get(batchKey)
          if (existingTimer) {
            clearTimeout(existingTimer)
          }

          // Set new timer
          const timer = setTimeout(async () => {
            const batchToExecute = this.batchData.get(batchKey)!
            this.batchData.delete(batchKey)
            this.batches.delete(batchKey)
            this.batchTimers.delete(batchKey)

            try {
              const results = await executor(batchToExecute)
              resolve(results)
            } catch (error) {
              console.error(`Batch execution failed for ${batchKey}:`, error)
              resolve([])
            }
          }, delay)

          this.batchTimers.set(batchKey, timer)
        })
      )
    }

    const results = await this.batches.get(batchKey)
    return results[index]
  }
}
