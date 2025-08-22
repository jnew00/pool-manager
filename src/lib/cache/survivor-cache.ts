/**
 * Performance optimization through intelligent caching
 * for Survivor Pool operations
 */

import { LRUCache } from 'lru-cache'

interface CacheOptions {
  max: number // Maximum number of items
  ttl: number // Time to live in milliseconds
}

// Cache instances
const caches = {
  recommendations: new LRUCache<string, any>({
    max: 500,
    ttl: 1000 * 60 * 5, // 5 minutes
  }),

  expectedValues: new LRUCache<string, number>({
    max: 1000,
    ttl: 1000 * 60 * 15, // 15 minutes
  }),

  publicPicks: new LRUCache<string, number>({
    max: 100,
    ttl: 1000 * 60 * 60, // 1 hour
  }),

  winProbabilities: new LRUCache<string, number>({
    max: 500,
    ttl: 1000 * 60 * 30, // 30 minutes
  }),

  playoffTeams: new LRUCache<string, any[]>({
    max: 10,
    ttl: 1000 * 60 * 60 * 24, // 24 hours
  }),

  poolStats: new LRUCache<string, any>({
    max: 100,
    ttl: 1000 * 60 * 10, // 10 minutes
  }),
}

export class SurvivorCache {
  /**
   * Get or set recommendation cache
   */
  static async getRecommendations(
    key: string,
    fetcher: () => Promise<any>
  ): Promise<any> {
    const cached = caches.recommendations.get(key)
    if (cached) {
      return cached
    }

    const data = await fetcher()
    caches.recommendations.set(key, data)
    return data
  }

  /**
   * Get or set expected value cache
   */
  static async getExpectedValue(
    teamId: string,
    week: number,
    poolSize: number,
    fetcher: () => Promise<number>
  ): Promise<number> {
    const key = `${teamId}-${week}-${poolSize}`
    const cached = caches.expectedValues.get(key)
    if (cached !== undefined) {
      return cached
    }

    const value = await fetcher()
    caches.expectedValues.set(key, value)
    return value
  }

  /**
   * Get or set public pick percentage
   */
  static async getPublicPickPercentage(
    teamId: string,
    week: number,
    fetcher: () => Promise<number>
  ): Promise<number> {
    const key = `${teamId}-${week}`
    const cached = caches.publicPicks.get(key)
    if (cached !== undefined) {
      return cached
    }

    const percentage = await fetcher()
    caches.publicPicks.set(key, percentage)
    return percentage
  }

  /**
   * Get or set win probability
   */
  static async getWinProbability(
    teamId: string,
    week: number,
    fetcher: () => Promise<number>
  ): Promise<number> {
    const key = `${teamId}-${week}`
    const cached = caches.winProbabilities.get(key)
    if (cached !== undefined) {
      return cached
    }

    const probability = await fetcher()
    caches.winProbabilities.set(key, probability)
    return probability
  }

  /**
   * Get or set playoff teams
   */
  static async getPlayoffTeams(
    season: number,
    fetcher: () => Promise<any[]>
  ): Promise<any[]> {
    const key = `playoff-${season}`
    const cached = caches.playoffTeams.get(key)
    if (cached) {
      return cached
    }

    const teams = await fetcher()
    caches.playoffTeams.set(key, teams)
    return teams
  }

  /**
   * Get or set pool statistics
   */
  static async getPoolStats(
    poolId: string,
    week: number,
    fetcher: () => Promise<any>
  ): Promise<any> {
    const key = `${poolId}-${week}`
    const cached = caches.poolStats.get(key)
    if (cached) {
      return cached
    }

    const stats = await fetcher()
    caches.poolStats.set(key, stats)
    return stats
  }

  /**
   * Clear specific cache
   */
  static clearCache(cacheName: keyof typeof caches): void {
    caches[cacheName].clear()
  }

  /**
   * Clear all caches
   */
  static clearAll(): void {
    Object.values(caches).forEach((cache) => cache.clear())
  }

  /**
   * Get cache statistics
   */
  static getStats(): Record<
    string,
    { size: number; hits: number; misses: number }
  > {
    const stats: Record<string, any> = {}

    for (const [name, cache] of Object.entries(caches)) {
      stats[name] = {
        size: cache.size,
        // LRUCache doesn't track hits/misses by default
        // These would need to be tracked separately
        hits: 0,
        misses: 0,
      }
    }

    return stats
  }

  /**
   * Warm up caches with frequently accessed data
   */
  static async warmUp(poolId: string, currentWeek: number): Promise<void> {
    // This would pre-load frequently accessed data
    // Implementation depends on specific use cases
    console.log(`Warming up caches for pool ${poolId}, week ${currentWeek}`)
  }
}

/**
 * Database query optimizer
 */
export class QueryOptimizer {
  /**
   * Batch fetch entries with related data
   */
  static getBatchEntryQuery() {
    return {
      include: {
        picks: {
          where: {
            result: { in: ['WIN', 'PENDING'] },
          },
          include: {
            team: {
              select: {
                id: true,
                abbreviation: true,
                name: true,
              },
            },
          },
          orderBy: {
            week: 'desc' as const,
          },
        },
      },
    }
  }

  /**
   * Optimized game query with minimal data
   */
  static getOptimizedGameQuery(week: number) {
    return {
      where: { week },
      select: {
        id: true,
        week: true,
        homeTeamId: true,
        awayTeamId: true,
        homeMoneyline: true,
        awayMoneyline: true,
        homeSpread: true,
        awaySpread: true,
        homeScore: true,
        awayScore: true,
        homeTeam: {
          select: {
            id: true,
            abbreviation: true,
            name: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            abbreviation: true,
            name: true,
          },
        },
      },
    }
  }

  /**
   * Batch operations for picks
   */
  static async batchCreatePicks(
    picks: Array<{
      entryId: string
      week: number
      teamId: string
    }>
  ) {
    // Use createMany for better performance
    return {
      data: picks.map((pick) => ({
        ...pick,
        result: 'PENDING' as const,
        createdAt: new Date(),
      })),
    }
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map()

  /**
   * Start timing an operation
   */
  static startTimer(label: string): void {
    this.timers.set(label, performance.now())
  }

  /**
   * End timing and log result
   */
  static endTimer(label: string): number {
    const startTime = this.timers.get(label)
    if (!startTime) {
      console.warn(`No timer found for label: ${label}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(label)

    if (duration > 1000) {
      console.warn(`Slow operation: ${label} took ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * Measure async operation
   */
  static async measure<T>(
    label: string,
    operation: () => Promise<T>
  ): Promise<T> {
    this.startTimer(label)
    try {
      const result = await operation()
      const duration = this.endTimer(label)

      // Log slow operations
      if (duration > 1000) {
        console.warn(
          `Slow async operation: ${label} took ${duration.toFixed(2)}ms`
        )
      }

      return result
    } catch (error) {
      this.endTimer(label)
      throw error
    }
  }

  /**
   * Get performance report
   */
  static getReport(): string {
    const activeTimers = Array.from(this.timers.entries())

    if (activeTimers.length === 0) {
      return 'No active performance measurements'
    }

    const now = performance.now()
    const report = activeTimers
      .map(([label, startTime]) => {
        const duration = now - startTime
        return `${label}: ${duration.toFixed(2)}ms (in progress)`
      })
      .join('\n')

    return `Active Performance Measurements:\n${report}`
  }
}

/**
 * Connection pooling configuration
 */
export const connectionPoolConfig = {
  // Prisma connection pool settings
  database: {
    connectionLimit: 10, // Maximum connections
    connectTimeout: 60000, // 60 seconds
    acquireTimeout: 60000,
    timeout: 60000,
  },

  // API rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later',
  },

  // Query timeout settings
  queryTimeout: {
    default: 5000, // 5 seconds
    complex: 10000, // 10 seconds for complex queries
    report: 30000, // 30 seconds for reports
  },
}

/**
 * Lazy loading utilities
 */
export class LazyLoader {
  private static loadedModules: Map<string, any> = new Map()

  /**
   * Lazy load a module
   */
  static async load<T>(
    moduleName: string,
    loader: () => Promise<T>
  ): Promise<T> {
    const cached = this.loadedModules.get(moduleName)
    if (cached) {
      return cached
    }

    const loadedModule = await loader()
    this.loadedModules.set(moduleName, loadedModule)
    return loadedModule
  }

  /**
   * Preload critical modules
   */
  static async preloadCritical(): Promise<void> {
    // Preload frequently used modules
    const criticalModules = [
      'survivor-recommendations',
      'survivor-ev-engine',
      'survivor-strategy',
    ]

    await Promise.all(
      criticalModules.map(async (moduleName) => {
        try {
          await import(`@/lib/models/${moduleName}`)
          console.log(`Preloaded: ${moduleName}`)
        } catch (error) {
          console.error(`Failed to preload ${moduleName}:`, error)
        }
      })
    )
  }
}
