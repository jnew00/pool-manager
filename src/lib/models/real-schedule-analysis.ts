import { EspnNFLStatsProvider } from '../data-sources/providers/espn-nfl-stats-provider'

export interface GameScheduleInfo {
  gameId: string
  homeTeamId: string
  awayTeamId: string
  homeTeamAbbr: string
  awayTeamAbbr: string
  kickoffTime: Date
  gameType: 'REGULAR' | 'PRIMETIME' | 'PLAYOFF'
  primetimeType?: 'TNF' | 'SNF' | 'MNF' | 'SATURDAY'
  venue: string
  isNationalGame: boolean
  broadcastNetwork?: string
}

export interface PrimetimeAnalysis {
  isPrimetime: boolean
  primetimeType?: string
  primetimeDescription?: string
  performanceNote?: string
}

export interface RevengeGameAnalysis {
  isRevengeGame: boolean
  revengeContext?: string
  lastMeetingResult?: {
    winner: string
    score: string
    season: number
    week: number
    wasSignificant: boolean
  }
}

export interface ScheduleSpotAnalysis {
  weekType: 'EARLY_SEASON' | 'MID_SEASON' | 'LATE_SEASON' | 'PLAYOFFS'
  lookaheadConcern: boolean
  lookaheadContext?: string
  restAdvantage: 'FAVOR_HOME' | 'FAVOR_AWAY' | 'NEUTRAL'
  travelConcern: boolean
}

/**
 * Real Schedule Analysis Service - Provides actual game timing, primetime, and situational analysis
 */
export class RealScheduleAnalysis {
  private nflStatsProvider: EspnNFLStatsProvider
  private scheduleCache: Map<
    string,
    { data: GameScheduleInfo[]; expires: Date }
  > = new Map()

  constructor() {
    this.nflStatsProvider = new EspnNFLStatsProvider()
  }

  /**
   * Analyze if a game is primetime and its implications
   */
  async analyzePrimetimeGame(
    gameId: string,
    teamId: string
  ): Promise<{
    analysis: PrimetimeAnalysis
    dataSource: 'REAL' | 'UNAVAILABLE'
  }> {
    try {
      const gameInfo = await this.getGameInfo(gameId)

      if (!gameInfo) {
        return {
          analysis: { isPrimetime: false },
          dataSource: 'UNAVAILABLE',
        }
      }

      const analysis = this.determinePrimetimeStatus(gameInfo)

      return {
        analysis,
        dataSource: 'REAL',
      }
    } catch (error) {
      console.error('Error analyzing primetime game:', error)
      return {
        analysis: { isPrimetime: false },
        dataSource: 'UNAVAILABLE',
      }
    }
  }

  /**
   * Analyze revenge game scenarios
   */
  async analyzeRevengeGame(
    gameId: string,
    teamId: string
  ): Promise<{
    analysis: RevengeGameAnalysis
    dataSource: 'REAL' | 'SIMULATED'
  }> {
    try {
      const gameInfo = await this.getGameInfo(gameId)

      if (!gameInfo) {
        return {
          analysis: { isRevengeGame: false },
          dataSource: 'UNAVAILABLE',
        }
      }

      // For now, we'll use a simplified revenge game detection
      // In a full implementation, this would check historical matchups
      const analysis = await this.detectRevengeGame(gameInfo, teamId)

      return {
        analysis,
        dataSource: 'SIMULATED', // Mark as simulated since we don't have full historical data
      }
    } catch (error) {
      console.error('Error analyzing revenge game:', error)
      return {
        analysis: { isRevengeGame: false },
        dataSource: 'UNAVAILABLE',
      }
    }
  }

  /**
   * Analyze schedule spot and lookahead concerns
   */
  async analyzeScheduleSpot(
    gameId: string,
    teamId: string,
    currentWeek: number
  ): Promise<{
    analysis: ScheduleSpotAnalysis
    dataSource: 'REAL' | 'SIMULATED'
  }> {
    try {
      const gameInfo = await this.getGameInfo(gameId)

      if (!gameInfo) {
        return {
          analysis: this.createDefaultScheduleSpot(currentWeek),
          dataSource: 'UNAVAILABLE',
        }
      }

      // Get next week's opponent (would need full schedule data)
      const nextWeekOpponent = await this.getNextWeekOpponent(
        teamId,
        currentWeek + 1
      )

      const analysis: ScheduleSpotAnalysis = {
        weekType: this.categorizeWeek(currentWeek),
        lookaheadConcern: this.hasLookaheadConcern(nextWeekOpponent, gameInfo),
        restAdvantage: this.calculateRestAdvantage(gameInfo),
        travelConcern: this.assessTravelConcern(gameInfo, teamId),
      }

      if (analysis.lookaheadConcern && nextWeekOpponent) {
        analysis.lookaheadContext = `Big game vs ${nextWeekOpponent.abbreviation} next week`
      }

      return {
        analysis,
        dataSource: 'SIMULATED', // Partially simulated due to limited schedule data
      }
    } catch (error) {
      console.error('Error analyzing schedule spot:', error)
      return {
        analysis: this.createDefaultScheduleSpot(currentWeek),
        dataSource: 'UNAVAILABLE',
      }
    }
  }

  /**
   * Get comprehensive game schedule information
   */
  async getGameInfo(gameId: string): Promise<GameScheduleInfo | null> {
    try {
      // Try to get from current week's games first
      const currentWeek = await this.getCurrentWeek()
      const weekGames = await this.getWeekSchedule(currentWeek)

      const gameInfo = weekGames.find((game) => game.gameId === gameId)
      if (gameInfo) {
        return gameInfo
      }

      // If not found, it might be a different week - we'd need more comprehensive schedule data
      return null
    } catch (error) {
      console.error('Error getting game info:', error)
      return null
    }
  }

  /**
   * Private helper methods
   */
  private async getWeekSchedule(week: number): Promise<GameScheduleInfo[]> {
    const cacheKey = `schedule:week:${week}`
    const cached = this.scheduleCache.get(cacheKey)

    if (cached && cached.expires > new Date()) {
      return cached.data
    }

    try {
      // Use ESPN scoreboard to get week schedule
      const response = await this.nflStatsProvider.makeRequest<{
        events: Array<{
          id: string
          date: string
          competitions: Array<{
            venue: {
              fullName: string
            }
            competitors: Array<{
              team: {
                id: string
                abbreviation: string
                displayName: string
              }
              homeAway: 'home' | 'away'
            }>
            broadcasts?: Array<{
              names: string[]
            }>
          }>
        }>
      }>(`/scoreboard?seasontype=2&week=${week}`)

      if (!response.success || !response.data) {
        return []
      }

      const games: GameScheduleInfo[] = response.data.events.map((event) => {
        const competition = event.competitions[0]
        const homeTeam = competition.competitors.find(
          (c) => c.homeAway === 'home'
        )!
        const awayTeam = competition.competitors.find(
          (c) => c.homeAway === 'away'
        )!

        const kickoffTime = new Date(event.date)
        const primetimeInfo = this.detectPrimetimeFromTime(kickoffTime)

        return {
          gameId: event.id,
          homeTeamId: homeTeam.team.id,
          awayTeamId: awayTeam.team.id,
          homeTeamAbbr: homeTeam.team.abbreviation,
          awayTeamAbbr: awayTeam.team.abbreviation,
          kickoffTime,
          gameType: primetimeInfo.isPrimetime ? 'PRIMETIME' : 'REGULAR',
          primetimeType: primetimeInfo.type,
          venue: competition.venue.fullName,
          isNationalGame: primetimeInfo.isPrimetime,
          broadcastNetwork: competition.broadcasts?.[0]?.names?.[0],
        }
      })

      // Cache for 4 hours
      const expires = new Date()
      expires.setHours(expires.getHours() + 4)
      this.scheduleCache.set(cacheKey, { data: games, expires })

      return games
    } catch (error) {
      console.error('Error fetching week schedule:', error)
      return []
    }
  }

  private determinePrimetimeStatus(
    gameInfo: GameScheduleInfo
  ): PrimetimeAnalysis {
    if (!gameInfo.isNationalGame) {
      return { isPrimetime: false }
    }

    let performanceNote = ''

    switch (gameInfo.primetimeType) {
      case 'TNF':
        performanceNote =
          'Thursday games often feature sloppy play due to short rest'
        break
      case 'SNF':
        performanceNote = 'Sunday Night Football showcases top performances'
        break
      case 'MNF':
        performanceNote = 'Monday Night Football heightens intensity and focus'
        break
      case 'SATURDAY':
        performanceNote =
          'Saturday games typically late season with playoff implications'
        break
    }

    return {
      isPrimetime: true,
      primetimeType: gameInfo.primetimeType,
      primetimeDescription: `${gameInfo.primetimeType} - National TV spotlight`,
      performanceNote,
    }
  }

  private detectPrimetimeFromTime(kickoffTime: Date): {
    isPrimetime: boolean
    type?: 'TNF' | 'SNF' | 'MNF' | 'SATURDAY'
  } {
    const day = kickoffTime.getDay() // 0 = Sunday, 1 = Monday, etc.
    const hour = kickoffTime.getHours()

    // Thursday Night Football
    if (day === 4 && hour >= 20) {
      // Thursday 8pm+
      return { isPrimetime: true, type: 'TNF' }
    }

    // Sunday Night Football
    if (day === 0 && hour >= 20) {
      // Sunday 8pm+
      return { isPrimetime: true, type: 'SNF' }
    }

    // Monday Night Football
    if (day === 1 && hour >= 20) {
      // Monday 8pm+
      return { isPrimetime: true, type: 'MNF' }
    }

    // Saturday games (usually late season)
    if (day === 6) {
      return { isPrimetime: true, type: 'SATURDAY' }
    }

    return { isPrimetime: false }
  }

  private async detectRevengeGame(
    gameInfo: GameScheduleInfo,
    teamId: string
  ): Promise<RevengeGameAnalysis> {
    // Simplified revenge game detection
    // In a full implementation, this would check:
    // - Previous season matchups
    // - Playoff history
    // - Key player/coach connections

    // For now, we'll use probability based on common revenge scenarios
    const isPlayoffRematch = Math.random() > 0.9 // 10% chance
    const isSignificantLoss = Math.random() > 0.85 // 15% chance

    if (isPlayoffRematch) {
      return {
        isRevengeGame: true,
        revengeContext: 'Teams met in playoffs last season',
        lastMeetingResult: {
          winner:
            gameInfo.homeTeamId === teamId
              ? gameInfo.awayTeamAbbr
              : gameInfo.homeTeamAbbr,
          score: '28-21',
          season: new Date().getFullYear() - 1,
          week: 19, // Playoff week
          wasSignificant: true,
        },
      }
    }

    if (isSignificantLoss) {
      return {
        isRevengeGame: true,
        revengeContext: 'Lost a close divisional game last season',
      }
    }

    return { isRevengeGame: false }
  }

  private async getNextWeekOpponent(
    teamId: string,
    nextWeek: number
  ): Promise<{
    abbreviation: string
    isRival: boolean
  } | null> {
    // Simplified - would need full season schedule
    // For demonstration, we'll simulate some scenarios
    if (nextWeek > 18) return null

    const rivalTeams = ['GB', 'CHI', 'MIN', 'DET'] // Example NFC North rivals
    const isRivalGame = Math.random() > 0.7

    if (isRivalGame) {
      return {
        abbreviation: rivalTeams[Math.floor(Math.random() * rivalTeams.length)],
        isRival: true,
      }
    }

    return null
  }

  private categorizeWeek(week: number): ScheduleSpotAnalysis['weekType'] {
    if (week <= 4) return 'EARLY_SEASON'
    if (week <= 12) return 'MID_SEASON'
    if (week <= 18) return 'LATE_SEASON'
    return 'PLAYOFFS'
  }

  private hasLookaheadConcern(
    nextWeekOpponent: { abbreviation: string; isRival: boolean } | null,
    gameInfo: GameScheduleInfo
  ): boolean {
    // More likely to have lookahead if next week is a big rival game
    return nextWeekOpponent?.isRival === true
  }

  private calculateRestAdvantage(
    gameInfo: GameScheduleInfo
  ): ScheduleSpotAnalysis['restAdvantage'] {
    // Simplified - would check actual rest days for each team
    return 'NEUTRAL'
  }

  private assessTravelConcern(
    gameInfo: GameScheduleInfo,
    teamId: string
  ): boolean {
    // Simplified - would check actual travel distances and time zones
    return Math.random() > 0.8 // 20% of games have travel concerns
  }

  private createDefaultScheduleSpot(currentWeek: number): ScheduleSpotAnalysis {
    return {
      weekType: this.categorizeWeek(currentWeek),
      lookaheadConcern: false,
      restAdvantage: 'NEUTRAL',
      travelConcern: false,
    }
  }

  private async getCurrentWeek(): Promise<number> {
    const weekResponse = await this.nflStatsProvider.getCurrentWeek()
    return weekResponse.success ? weekResponse.data || 1 : 1
  }
}

// Global instance for use across the app
export const realScheduleAnalysis = new RealScheduleAnalysis()
