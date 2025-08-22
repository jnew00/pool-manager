import { prisma } from '@/lib/prisma'

export interface PublicPickData {
  teamId: string
  teamAbbr: string
  pickPercentage: number
  pickCount?: number
  totalEntries?: number
  source: 'ESPN' | 'YAHOO' | 'SURVIVORGRID' | 'AGGREGATE' | 'INTERNAL'
  lastUpdated: Date
}

export interface WeekPublicPicks {
  week: number
  poolId?: string
  teams: PublicPickData[]
  totalEntries: number
  lastUpdated: Date
}

export interface HistoricalSurvivorData {
  week: number
  year: number
  survivalRate: number
  topPickTeam: string
  topPickPercentage: number
  biggestBust?: string // Team with highest pick % that lost
  bustPercentage?: number
}

// In-memory cache as fallback when Redis is not available
const memoryCache = new Map<string, { data: any; expiry: number }>()

export class PublicPickService {
  private static readonly CACHE_TTL = 3600 // 1 hour in seconds
  private static readonly GAME_DAY_TTL = 900 // 15 minutes on game day

  /**
   * Fetch public pick percentages from multiple sources
   */
  async getPublicPickPercentages(
    week: number,
    poolId?: string
  ): Promise<WeekPublicPicks> {
    // Check cache first
    const cacheKey = `public-picks:${week}:${poolId || 'global'}`
    const cached = await this.getCachedData(cacheKey)
    if (cached) {
      return cached
    }

    // Aggregate data from multiple sources
    const sources = await Promise.allSettled([
      this.fetchESPNPicks(week),
      this.fetchYahooPicks(week),
      this.fetchSurvivorGridPicks(week),
      poolId ? this.fetchInternalPoolPicks(poolId, week) : null,
    ])

    // Combine and normalize data
    const aggregatedData = this.aggregatePickData(sources)

    // Cache the result
    const ttl = this.isGameDay(week)
      ? PublicPickService.GAME_DAY_TTL
      : PublicPickService.CACHE_TTL
    await this.cacheData(cacheKey, aggregatedData, ttl)

    return aggregatedData
  }

  /**
   * Fetch ESPN public pick data
   */
  private async fetchESPNPicks(week: number): Promise<PublicPickData[]> {
    try {
      // In production, this would make an actual API call
      // For now, return mock data based on typical ESPN patterns
      const teams = await prisma.team.findMany()
      const games = await prisma.game.findMany({
        where: { week },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      })

      const picks: PublicPickData[] = []

      // Simulate ESPN pick distribution patterns
      games.forEach((game) => {
        // Favorites get more picks
        const homeSpread = -3 // Would come from actual odds
        const homeFavored = homeSpread < 0

        const favoredTeam = homeFavored ? game.homeTeam : game.awayTeam
        const underdog = homeFavored ? game.awayTeam : game.homeTeam

        // Pick percentage based on spread
        const spreadMagnitude = Math.abs(homeSpread)
        const favoredPickPct = Math.min(40, 10 + spreadMagnitude * 3)
        const underdogPickPct = Math.max(0.5, 2 - spreadMagnitude * 0.2)

        picks.push({
          teamId: favoredTeam.id,
          teamAbbr: favoredTeam.nflAbbr,
          pickPercentage: favoredPickPct,
          source: 'ESPN',
          lastUpdated: new Date(),
        })

        picks.push({
          teamId: underdog.id,
          teamAbbr: underdog.nflAbbr,
          pickPercentage: underdogPickPct,
          source: 'ESPN',
          lastUpdated: new Date(),
        })
      })

      return picks
    } catch (error) {
      console.error('Error fetching ESPN picks:', error)
      return []
    }
  }

  /**
   * Fetch Yahoo public pick data
   */
  private async fetchYahooPicks(week: number): Promise<PublicPickData[]> {
    try {
      // In production, would scrape or use Yahoo API
      // Mock implementation with slight variation from ESPN
      const teams = await prisma.team.findMany()
      const games = await prisma.game.findMany({
        where: { week },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      })

      const picks: PublicPickData[] = []

      games.forEach((game) => {
        const homeSpread = -3.5 // Would come from actual odds
        const homeFavored = homeSpread < 0

        const favoredTeam = homeFavored ? game.homeTeam : game.awayTeam
        const underdog = homeFavored ? game.awayTeam : game.homeTeam

        // Yahoo tends to have slightly different patterns
        const spreadMagnitude = Math.abs(homeSpread)
        const favoredPickPct = Math.min(45, 12 + spreadMagnitude * 2.8)
        const underdogPickPct = Math.max(0.3, 1.5 - spreadMagnitude * 0.15)

        picks.push({
          teamId: favoredTeam.id,
          teamAbbr: favoredTeam.nflAbbr,
          pickPercentage: favoredPickPct,
          source: 'YAHOO',
          lastUpdated: new Date(),
        })

        picks.push({
          teamId: underdog.id,
          teamAbbr: underdog.nflAbbr,
          pickPercentage: underdogPickPct,
          source: 'YAHOO',
          lastUpdated: new Date(),
        })
      })

      return picks
    } catch (error) {
      console.error('Error fetching Yahoo picks:', error)
      return []
    }
  }

  /**
   * Fetch SurvivorGrid community pick data
   */
  private async fetchSurvivorGridPicks(
    week: number
  ): Promise<PublicPickData[]> {
    try {
      // SurvivorGrid provides community consensus data
      // This would integrate with their API or scraping
      const teams = await prisma.team.findMany()

      // Popular teams based on historical patterns
      const popularTeams = ['KC', 'BUF', 'PHI', 'SF', 'DAL', 'BAL']
      const midTierTeams = ['CIN', 'MIA', 'LAC', 'MIN', 'DET', 'JAX']

      return teams.map((team) => {
        let pickPct = 1 // Base percentage

        if (popularTeams.includes(team.nflAbbr)) {
          pickPct = 15 + Math.random() * 20 // 15-35%
        } else if (midTierTeams.includes(team.nflAbbr)) {
          pickPct = 3 + Math.random() * 7 // 3-10%
        } else {
          pickPct = Math.random() * 3 // 0-3%
        }

        return {
          teamId: team.id,
          teamAbbr: team.nflAbbr,
          pickPercentage: parseFloat(pickPct.toFixed(2)),
          source: 'SURVIVORGRID' as const,
          lastUpdated: new Date(),
        }
      })
    } catch (error) {
      console.error('Error fetching SurvivorGrid picks:', error)
      return []
    }
  }

  /**
   * Fetch internal pool pick distribution
   */
  private async fetchInternalPoolPicks(
    poolId: string,
    week: number
  ): Promise<PublicPickData[]> {
    try {
      // Get actual picks from our pool
      const survivorPicks = await prisma.survivorPick.findMany({
        where: {
          week,
          entry: {
            poolId,
            isActive: true,
          },
        },
        include: {
          team: true,
        },
      })

      // Count picks by team
      const pickCounts = new Map<string, { count: number; abbr: string }>()
      survivorPicks.forEach((pick) => {
        const current = pickCounts.get(pick.teamId) || {
          count: 0,
          abbr: pick.team.nflAbbr,
        }
        pickCounts.set(pick.teamId, {
          count: current.count + 1,
          abbr: pick.team.nflAbbr,
        })
      })

      const totalPicks = survivorPicks.length
      const picks: PublicPickData[] = []

      pickCounts.forEach((data, teamId) => {
        picks.push({
          teamId,
          teamAbbr: data.abbr,
          pickPercentage: (data.count / totalPicks) * 100,
          pickCount: data.count,
          totalEntries: totalPicks,
          source: 'INTERNAL',
          lastUpdated: new Date(),
        })
      })

      return picks
    } catch (error) {
      console.error('Error fetching internal pool picks:', error)
      return []
    }
  }

  /**
   * Aggregate pick data from multiple sources
   */
  private aggregatePickData(
    sources: PromiseSettledResult<PublicPickData[] | null>[]
  ): WeekPublicPicks {
    const allPicks: PublicPickData[] = []

    sources.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        allPicks.push(...result.value)
      }
    })

    // Group by team and calculate weighted average
    const teamAggregates = new Map<
      string,
      {
        teamId: string
        teamAbbr: string
        sources: PublicPickData[]
        avgPercentage: number
      }
    >()

    allPicks.forEach((pick) => {
      const existing = teamAggregates.get(pick.teamId) || {
        teamId: pick.teamId,
        teamAbbr: pick.teamAbbr,
        sources: [],
        avgPercentage: 0,
      }
      existing.sources.push(pick)
      teamAggregates.set(pick.teamId, existing)
    })

    // Calculate weighted averages (internal pool data gets higher weight)
    const aggregatedTeams: PublicPickData[] = []
    teamAggregates.forEach((aggregate) => {
      const weights = {
        INTERNAL: 0.4,
        ESPN: 0.2,
        YAHOO: 0.2,
        SURVIVORGRID: 0.2,
      }

      let weightedSum = 0
      let totalWeight = 0

      aggregate.sources.forEach((source) => {
        const weight = weights[source.source] || 0.1
        weightedSum += source.pickPercentage * weight
        totalWeight += weight
      })

      aggregatedTeams.push({
        teamId: aggregate.teamId,
        teamAbbr: aggregate.teamAbbr,
        pickPercentage: parseFloat((weightedSum / totalWeight).toFixed(2)),
        source: 'AGGREGATE',
        lastUpdated: new Date(),
      })
    })

    // Normalize percentages to sum to 100%
    const totalPct = aggregatedTeams.reduce(
      (sum, t) => sum + t.pickPercentage,
      0
    )
    if (totalPct > 0) {
      aggregatedTeams.forEach((team) => {
        team.pickPercentage = parseFloat(
          ((team.pickPercentage / totalPct) * 100).toFixed(2)
        )
      })
    }

    return {
      week: 1, // Would be passed in
      teams: aggregatedTeams.sort(
        (a, b) => b.pickPercentage - a.pickPercentage
      ),
      totalEntries: 1000, // Would calculate from actual data
      lastUpdated: new Date(),
    }
  }

  /**
   * Get historical survivor pool data
   */
  async getHistoricalData(
    week: number,
    year?: number
  ): Promise<HistoricalSurvivorData[]> {
    // In production, would fetch from historical database
    // For now, return typical historical patterns
    const currentYear = new Date().getFullYear()
    const targetYear = year || currentYear - 1

    const historicalData: HistoricalSurvivorData[] = []

    // Typical survival rates by week
    const survivalRates = [
      0.67,
      0.7,
      0.65,
      0.72,
      0.68, // Weeks 1-5
      0.63,
      0.69,
      0.71,
      0.66,
      0.7, // Weeks 6-10
      0.64,
      0.68,
      0.72,
      0.67,
      0.65, // Weeks 11-15
      0.7,
      0.73,
      0.75, // Weeks 16-18
    ]

    for (let w = 1; w <= Math.min(week, 18); w++) {
      historicalData.push({
        week: w,
        year: targetYear,
        survivalRate: survivalRates[w - 1] || 0.67,
        topPickTeam: this.getHistoricalTopPick(w),
        topPickPercentage: 20 + Math.random() * 15,
        biggestBust:
          Math.random() > 0.7 ? this.getHistoricalBust(w) : undefined,
        bustPercentage:
          Math.random() > 0.7 ? 15 + Math.random() * 10 : undefined,
      })
    }

    return historicalData
  }

  /**
   * Helper methods
   */
  private isGameDay(week: number): boolean {
    const now = new Date()
    const dayOfWeek = now.getDay()
    // Thursday through Monday are game days
    return dayOfWeek === 4 || dayOfWeek === 0 || dayOfWeek === 1
  }

  private async getCachedData(key: string): Promise<WeekPublicPicks | null> {
    const cached = memoryCache.get(key)
    if (cached && cached.expiry > Date.now()) {
      return cached.data
    }
    memoryCache.delete(key)
    return null
  }

  private async cacheData(
    key: string,
    data: WeekPublicPicks,
    ttl: number
  ): Promise<void> {
    memoryCache.set(key, {
      data,
      expiry: Date.now() + ttl * 1000,
    })

    // Clean up expired entries periodically
    if (memoryCache.size > 100) {
      const now = Date.now()
      for (const [k, v] of memoryCache.entries()) {
        if (v.expiry < now) {
          memoryCache.delete(k)
        }
      }
    }
  }

  private getHistoricalTopPick(week: number): string {
    const topPicks = [
      'BUF',
      'KC',
      'PHI',
      'SF',
      'DAL',
      'BAL',
      'CIN',
      'MIA',
      'LAC',
      'MIN',
      'DET',
      'JAX',
      'GB',
      'TB',
      'SEA',
      'LAR',
      'NO',
      'NE',
    ]
    return topPicks[week - 1] || 'KC'
  }

  private getHistoricalBust(week: number): string {
    const busts = ['CIN', 'MIA', 'TB', 'JAX', 'MIN', 'DET', 'SEA', 'LAR']
    return busts[Math.floor(Math.random() * busts.length)]
  }
}
