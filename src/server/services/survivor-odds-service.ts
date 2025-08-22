import { prisma } from '@/lib/prisma'

export interface GameOdds {
  gameId: string
  homeTeamId: string
  awayTeamId: string
  homeTeamAbbr: string
  awayTeamAbbr: string
  homeMoneyline: number
  awayMoneyline: number
  spread: number
  total: number
  homeWinProbability: number
  awayWinProbability: number
  source: 'DRAFTKINGS' | 'FANDUEL' | 'CAESARS' | 'BETMGM' | 'CONSENSUS'
  lastUpdated: Date
}

export interface WeekOdds {
  week: number
  games: GameOdds[]
  lastUpdated: Date
}

export interface OddsMovement {
  gameId: string
  timestamp: Date
  homeMoneylinePrev: number
  homeMoneylineCurrent: number
  awayMoneylinePrev: number
  awayMoneylineCurrent: number
  spreadPrev: number
  spreadCurrent: number
  direction: 'HOME_IMPROVING' | 'AWAY_IMPROVING' | 'STABLE'
  magnitude: 'MINOR' | 'MODERATE' | 'SIGNIFICANT'
}

// In-memory cache as fallback when Redis is not available
const memoryCache = new Map<string, { data: any; expiry: number }>()

export class SurvivorOddsService {
  private static readonly CACHE_TTL = 900 // 15 minutes
  private static readonly PREGAME_TTL = 300 // 5 minutes before games

  /**
   * Fetch current moneylines for all games in a week
   */
  async getWeekMoneylines(week: number): Promise<WeekOdds> {
    // Check cache
    const cacheKey = `odds:week:${week}`
    const cached = await this.getCachedOdds(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from multiple sportsbooks
    const sources = await Promise.allSettled([
      this.fetchDraftKingsOdds(week),
      this.fetchFanDuelOdds(week),
      this.fetchCaesarsOdds(week),
      this.fetchBetMGMOdds(week),
    ])

    // Aggregate into consensus odds
    const consensusOdds = this.calculateConsensusOdds(sources)

    // Cache the result
    const ttl = this.isCloseToGameTime(week)
      ? SurvivorOddsService.PREGAME_TTL
      : SurvivorOddsService.CACHE_TTL

    await this.cacheOdds(cacheKey, consensusOdds, ttl)

    return consensusOdds
  }

  /**
   * Convert moneyline to implied win probability
   */
  moneylineToWinProbability(moneyline: number): number {
    if (moneyline < 0) {
      // Favorite
      return Math.abs(moneyline) / (Math.abs(moneyline) + 100)
    } else {
      // Underdog
      return 100 / (moneyline + 100)
    }
  }

  /**
   * Convert spread to win probability
   */
  spreadToWinProbability(spread: number): number {
    // Using historical NFL data, each point of spread ≈ 2.5% win probability
    const baseProb = 0.5
    const probPerPoint = 0.025
    return Math.max(0.01, Math.min(0.99, baseProb + -spread * probPerPoint))
  }

  /**
   * Fetch DraftKings odds
   */
  private async fetchDraftKingsOdds(week: number): Promise<GameOdds[]> {
    try {
      // In production, would use DraftKings API or scraping
      const games = await prisma.game.findMany({
        where: { week },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      })

      return games.map((game) => {
        // Simulate realistic odds based on team strength
        const homeAdvantage = -3 // Home field advantage
        const randomFactor = (Math.random() - 0.5) * 4 // Random spread adjustment
        const spread = homeAdvantage + randomFactor

        // Convert spread to moneylines
        const { homeML, awayML } = this.spreadToMoneylines(spread)

        return {
          gameId: game.id,
          homeTeamId: game.homeTeamId,
          awayTeamId: game.awayTeamId,
          homeTeamAbbr: game.homeTeam.nflAbbr,
          awayTeamAbbr: game.awayTeam.nflAbbr,
          homeMoneyline: homeML,
          awayMoneyline: awayML,
          spread,
          total: 44.5 + Math.random() * 10, // Random total between 44.5-54.5
          homeWinProbability: this.moneylineToWinProbability(homeML),
          awayWinProbability: this.moneylineToWinProbability(awayML),
          source: 'DRAFTKINGS' as const,
          lastUpdated: new Date(),
        }
      })
    } catch (error) {
      console.error('Error fetching DraftKings odds:', error)
      return []
    }
  }

  /**
   * Fetch FanDuel odds
   */
  private async fetchFanDuelOdds(week: number): Promise<GameOdds[]> {
    try {
      const games = await prisma.game.findMany({
        where: { week },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      })

      return games.map((game) => {
        // Slightly different from DraftKings to simulate variance
        const homeAdvantage = -2.5
        const randomFactor = (Math.random() - 0.5) * 5
        const spread = homeAdvantage + randomFactor

        const { homeML, awayML } = this.spreadToMoneylines(spread)

        return {
          gameId: game.id,
          homeTeamId: game.homeTeamId,
          awayTeamId: game.awayTeamId,
          homeTeamAbbr: game.homeTeam.nflAbbr,
          awayTeamAbbr: game.awayTeam.nflAbbr,
          homeMoneyline: homeML,
          awayMoneyline: awayML,
          spread,
          total: 45 + Math.random() * 9,
          homeWinProbability: this.moneylineToWinProbability(homeML),
          awayWinProbability: this.moneylineToWinProbability(awayML),
          source: 'FANDUEL' as const,
          lastUpdated: new Date(),
        }
      })
    } catch (error) {
      console.error('Error fetching FanDuel odds:', error)
      return []
    }
  }

  /**
   * Fetch Caesars odds
   */
  private async fetchCaesarsOdds(week: number): Promise<GameOdds[]> {
    // Similar implementation to above
    return this.fetchDraftKingsOdds(week) // Simplified for demo
  }

  /**
   * Fetch BetMGM odds
   */
  private async fetchBetMGMOdds(week: number): Promise<GameOdds[]> {
    // Similar implementation to above
    return this.fetchFanDuelOdds(week) // Simplified for demo
  }

  /**
   * Calculate consensus odds from multiple sources
   */
  private calculateConsensusOdds(
    sources: PromiseSettledResult<GameOdds[]>[]
  ): WeekOdds {
    const allOdds: GameOdds[] = []

    sources.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        allOdds.push(...result.value)
      }
    })

    // Group by game
    const gameOddsMap = new Map<string, GameOdds[]>()
    allOdds.forEach((odds) => {
      const existing = gameOddsMap.get(odds.gameId) || []
      existing.push(odds)
      gameOddsMap.set(odds.gameId, existing)
    })

    // Calculate consensus for each game
    const consensusGames: GameOdds[] = []
    gameOddsMap.forEach((gameOdds, gameId) => {
      if (gameOdds.length === 0) return

      // Average the moneylines
      const avgHomeML =
        gameOdds.reduce((sum, o) => sum + o.homeMoneyline, 0) / gameOdds.length
      const avgAwayML =
        gameOdds.reduce((sum, o) => sum + o.awayMoneyline, 0) / gameOdds.length
      const avgSpread =
        gameOdds.reduce((sum, o) => sum + o.spread, 0) / gameOdds.length
      const avgTotal =
        gameOdds.reduce((sum, o) => sum + o.total, 0) / gameOdds.length

      consensusGames.push({
        gameId,
        homeTeamId: gameOdds[0].homeTeamId,
        awayTeamId: gameOdds[0].awayTeamId,
        homeTeamAbbr: gameOdds[0].homeTeamAbbr,
        awayTeamAbbr: gameOdds[0].awayTeamAbbr,
        homeMoneyline: Math.round(avgHomeML),
        awayMoneyline: Math.round(avgAwayML),
        spread: parseFloat(avgSpread.toFixed(1)),
        total: parseFloat(avgTotal.toFixed(1)),
        homeWinProbability: this.moneylineToWinProbability(avgHomeML),
        awayWinProbability: this.moneylineToWinProbability(avgAwayML),
        source: 'CONSENSUS',
        lastUpdated: new Date(),
      })
    })

    return {
      week: 1, // Would be passed in
      games: consensusGames,
      lastUpdated: new Date(),
    }
  }

  /**
   * Track odds movement for sharp action detection
   */
  async getOddsMovement(
    gameId: string,
    hoursBack: number = 24
  ): Promise<OddsMovement[]> {
    // In production, would track historical odds
    // For now, return simulated movement
    const movements: OddsMovement[] = []
    const now = Date.now()
    const intervals = Math.floor(hoursBack / 2) // Check every 2 hours

    for (let i = 0; i < intervals; i++) {
      const timestamp = new Date(now - i * 2 * 60 * 60 * 1000)
      const change = (Math.random() - 0.5) * 20 // Random movement

      movements.push({
        gameId,
        timestamp,
        homeMoneylinePrev: -150 + i * 5,
        homeMoneylineCurrent: -150 + (i + 1) * 5 + change,
        awayMoneylinePrev: 130 - i * 5,
        awayMoneylineCurrent: 130 - (i + 1) * 5 - change,
        spreadPrev: -3 + i * 0.5,
        spreadCurrent: -3 + (i + 1) * 0.5,
        direction: change > 0 ? 'HOME_IMPROVING' : 'AWAY_IMPROVING',
        magnitude:
          Math.abs(change) > 15
            ? 'SIGNIFICANT'
            : Math.abs(change) > 7
              ? 'MODERATE'
              : 'MINOR',
      })
    }

    return movements
  }

  /**
   * Get injury-adjusted odds
   */
  async getInjuryAdjustedOdds(
    gameId: string,
    injuries: Array<{ playerId: string; impact: 'HIGH' | 'MEDIUM' | 'LOW' }>
  ): Promise<GameOdds | null> {
    // Get base odds
    const games = await prisma.game.findMany({
      where: { id: gameId },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })

    if (games.length === 0) return null

    const game = games[0]
    let spreadAdjustment = 0

    // Adjust spread based on injuries
    injuries.forEach((injury) => {
      switch (injury.impact) {
        case 'HIGH':
          spreadAdjustment += 3 // Key player like QB
          break
        case 'MEDIUM':
          spreadAdjustment += 1.5 // Important starter
          break
        case 'LOW':
          spreadAdjustment += 0.5 // Role player
          break
      }
    })

    const adjustedSpread = -3 + spreadAdjustment
    const { homeML, awayML } = this.spreadToMoneylines(adjustedSpread)

    return {
      gameId,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      homeTeamAbbr: game.homeTeam.nflAbbr,
      awayTeamAbbr: game.awayTeam.nflAbbr,
      homeMoneyline: homeML,
      awayMoneyline: awayML,
      spread: adjustedSpread,
      total: 44.5,
      homeWinProbability: this.moneylineToWinProbability(homeML),
      awayWinProbability: this.moneylineToWinProbability(awayML),
      source: 'CONSENSUS',
      lastUpdated: new Date(),
    }
  }

  /**
   * Helper: Convert spread to moneylines
   */
  private spreadToMoneylines(spread: number): {
    homeML: number
    awayML: number
  } {
    // Standard conversion based on spread
    const favorite = spread < 0
    const absSpr = Math.abs(spread)

    let favML: number
    let dogML: number

    // Rough conversion table
    if (absSpr <= 2.5) {
      favML = -130 - absSpr * 10
      dogML = 110 + absSpr * 10
    } else if (absSpr <= 6.5) {
      favML = -150 - absSpr * 15
      dogML = 130 + absSpr * 12
    } else if (absSpr <= 10) {
      favML = -200 - absSpr * 20
      dogML = 170 + absSpr * 15
    } else {
      favML = -300 - absSpr * 25
      dogML = 250 + absSpr * 20
    }

    return favorite
      ? { homeML: favML, awayML: dogML }
      : { homeML: dogML, awayML: favML }
  }

  /**
   * Check if close to game time
   */
  private isCloseToGameTime(week: number): boolean {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const hour = now.getHours()

    // Thursday night, Sunday morning, Sunday afternoon, Monday night
    return (
      (dayOfWeek === 4 && hour >= 18) || // Thursday evening
      (dayOfWeek === 0 && hour >= 10) || // Sunday
      (dayOfWeek === 1 && hour >= 18)
    ) // Monday evening
  }

  /**
   * Cache helpers
   */
  private async getCachedOdds(key: string): Promise<WeekOdds | null> {
    const cached = memoryCache.get(key)
    if (cached && cached.expiry > Date.now()) {
      return cached.data
    }
    memoryCache.delete(key)
    return null
  }

  private async cacheOdds(
    key: string,
    data: WeekOdds,
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
}
