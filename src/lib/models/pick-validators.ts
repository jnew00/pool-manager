import { prisma } from '@/lib/prisma'
import type {
  PickValidationResult,
  PointsPlusValidation,
  SurvivorValidation,
  MarketData,
} from './types'

/**
 * Pick validation system for different pool types
 */
export class PickValidators {
  /**
   * Validate a Points Plus pick (favorite/underdog balance)
   */
  async validatePointsPlusPick(
    entryId: string,
    gameId: string,
    teamId: string,
    week: number
  ): Promise<PickValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Get current picks for this entry in this week
      const currentPicks = await this.getEntryPicksForWeek(entryId, week)

      // Get game data and market info
      const game = await this.getGameWithMarketData(gameId)
      if (!game) {
        errors.push('Game not found')
        return { isValid: false, errors, warnings, pickType: 'POINTS_PLUS' }
      }

      // Determine if this pick is a favorite or underdog
      const isHomePick = teamId === game.homeTeamId
      const isFavorite = this.determineIfFavorite(game.marketData, isHomePick)
      const isPickEm = this.isPickEmGame(game.marketData)

      // Points Plus rules validation (now async)
      const validation = await this.validatePointsPlusRules(
        currentPicks,
        isFavorite,
        isPickEm,
        gameId
      )

      if (!validation.minimumPicksMet) {
        warnings.push(
          `Need at least 4 picks (currently have ${validation.totalPicks - 1})`
        )
      }

      // Strict enforcement of favorite/underdog balance
      if (!isPickEm) {
        if (
          isFavorite &&
          validation.favoritesCount > validation.underdogsCount
        ) {
          errors.push(
            `Must pick an underdog first - you have ${validation.favoritesCount - 1} favorites and ${validation.underdogsCount} underdogs`
          )
        } else if (
          !isFavorite &&
          validation.underdogsCount > validation.favoritesCount
        ) {
          errors.push(
            `Must pick a favorite first - you have ${validation.favoritesCount} favorites and ${validation.underdogsCount - 1} underdogs`
          )
        }
      }

      if (isPickEm) {
        errors.push(
          "Pick'em games (spread = 0) are not allowed in Points Plus pools"
        )
      }

      // Check for duplicate picks
      const duplicatePick = currentPicks.find((pick) => pick.gameId === gameId)

      if (duplicatePick) {
        errors.push('You have already made a pick for this game')
      }

      // Add helpful warnings about strategy
      if (validation.totalPicks <= 2 && !errors.length) {
        warnings.push(
          'Consider your overall strategy - picking only heavy favorites may limit upside'
        )
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        pickType: 'POINTS_PLUS',
        metadata: {
          favoritesCount: validation.favoritesCount,
          underdogsCount: validation.underdogsCount,
          totalPicks: validation.totalPicks,
          isPickEm,
        },
      }
    } catch (error) {
      console.error('Error validating Points Plus pick:', error)
      return {
        isValid: false,
        errors: ['Validation failed due to system error'],
        warnings: [],
        pickType: 'POINTS_PLUS',
      }
    }
  }

  /**
   * Validate a Survivor pick (team reuse prevention)
   */
  async validateSurvivorPick(
    entryId: string,
    gameId: string,
    teamId: string,
    week: number
  ): Promise<PickValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Get survivor entry with enhanced data
      const survivorEntry = await prisma.survivorEntry.findFirst({
        where: { entryId },
        include: {
          picks: {
            include: {
              game: {
                include: {
                  Result: true,
                  homeTeam: true,
                  awayTeam: true,
                },
              },
              team: true,
            },
            orderBy: { week: 'asc' },
          },
          entry: {
            include: {
              pool: true,
            },
          },
        },
      })

      if (!survivorEntry) {
        errors.push('Survivor entry not found')
        return { isValid: false, errors, warnings, pickType: 'SURVIVOR' }
      }

      // Get pool rules
      const poolRules = survivorEntry.entry.pool.rules as any
      const strikesAllowed = poolRules?.survivor?.strikesAllowed || 0
      const tiebreaker = poolRules?.survivor?.tiebreaker || 'POINT_DIFFERENTIAL'
      const buybackEnabled = poolRules?.survivor?.buybackEnabled || false
      const buybackWeek = poolRules?.survivor?.buybackWeek || 5

      // Check if entry is still active
      if (!survivorEntry.isActive) {
        if (survivorEntry.eliminatedWeek) {
          errors.push(
            `Entry was eliminated in week ${survivorEntry.eliminatedWeek}`
          )
        } else {
          errors.push('Entry is no longer active')
        }

        // Check buyback eligibility
        if (
          buybackEnabled &&
          week === buybackWeek &&
          survivorEntry.eliminatedWeek &&
          survivorEntry.eliminatedWeek < buybackWeek
        ) {
          warnings.push(
            `Buyback available this week! Contact pool admin to re-enter.`
          )
        }

        return { isValid: false, errors, warnings, pickType: 'SURVIVOR' }
      }

      // Check if already picked this week
      const thisWeekPick = survivorEntry.picks.find((p) => p.week === week)
      if (thisWeekPick) {
        errors.push(
          `Already made a pick for week ${week}: ${thisWeekPick.team.nflAbbr}`
        )
        return { isValid: false, errors, warnings, pickType: 'SURVIVOR' }
      }

      // Get all teams previously used by this entry
      const usedTeams = new Set(survivorEntry.picks.map((pick) => pick.teamId))

      // Check if team has been used before
      if (usedTeams.has(teamId)) {
        const previousPick = survivorEntry.picks.find(
          (p) => p.teamId === teamId
        )
        errors.push(
          `${previousPick?.team.nflAbbr} was already used in week ${previousPick?.week}`
        )
      }

      // Get game and market data for strategic warnings
      const game = await this.getGameWithMarketData(gameId)
      const team = await prisma.team.findUnique({ where: { id: teamId } })

      if (game && team) {
        const isHomePick = teamId === game.homeTeamId
        const isFavorite = this.determineIfFavorite(game.marketData, isHomePick)

        // Win probability warning
        const winProb = this.calculateWinProbability(
          game.marketData,
          isHomePick
        )
        if (winProb < 0.6) {
          warnings.push(
            `${team.nflAbbr} has only ${(winProb * 100).toFixed(1)}% win probability`
          )
        }

        // Road favorite warning
        if (isFavorite && !isHomePick) {
          warnings.push(
            'Road favorites historically underperform in Survivor pools'
          )
        }

        // Early season premium team warning
        if (week <= 6 && this.isPopularSurvivorTeam(team.nflAbbr)) {
          warnings.push(
            `${team.nflAbbr} is a premium team - consider saving for later weeks`
          )
        }

        // Division rival warning
        const opponent = isHomePick ? game.awayTeam : game.homeTeam
        if (
          opponent &&
          this.areDivisionRivals(team.nflAbbr, opponent.nflAbbr)
        ) {
          warnings.push('Division games can be unpredictable')
        }
      }

      // Strikes status
      if (strikesAllowed > 0) {
        warnings.push(
          `Strikes used: ${survivorEntry.strikes}/${strikesAllowed}`
        )
      }

      // Critical weeks ahead warning
      const remainingWeeks = 18 - week
      const remainingTeams = 32 - usedTeams.size
      if (remainingWeeks > remainingTeams) {
        warnings.push(
          `Limited teams remaining: ${remainingTeams} teams for ${remainingWeeks} potential weeks`
        )
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        pickType: 'SURVIVOR',
        metadata: {
          usedTeams: Array.from(usedTeams),
          strikesUsed: survivorEntry.strikes,
          strikesAllowed,
          weeksSurvived: survivorEntry.picks.filter((p) => p.result === 'WIN')
            .length,
          isActive: survivorEntry.isActive,
        },
      }
    } catch (error) {
      console.error('Error validating Survivor pick:', error)
      return {
        isValid: false,
        errors: ['Validation failed due to system error'],
        warnings: [],
        pickType: 'SURVIVOR',
      }
    }
  }

  /**
   * Validate Against The Spread (ATS) pick
   */
  async validateATSPick(
    entryId: string,
    gameId: string,
    teamId: string,
    week: number
  ): Promise<PickValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Basic validation - check for duplicate picks
      const currentPicks = await this.getEntryPicksForWeek(entryId, week)
      const duplicatePick = currentPicks.find((pick) => pick.gameId === gameId)

      if (duplicatePick) {
        errors.push('You have already made a pick for this game')
      }

      // Game must exist and have spread
      const game = await this.getGameWithMarketData(gameId)
      if (!game) {
        errors.push('Game not found')
      } else if (!game.marketData?.spread) {
        warnings.push('No point spread available for this game')
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        pickType: 'ATS',
      }
    } catch (error) {
      console.error('Error validating ATS pick:', error)
      return {
        isValid: false,
        errors: ['Validation failed due to system error'],
        warnings: [],
        pickType: 'ATS',
      }
    }
  }

  /**
   * Validate Straight Up (SU) pick
   */
  async validateSUPick(
    entryId: string,
    gameId: string,
    teamId: string,
    week: number
  ): Promise<PickValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Basic validation - check for duplicate picks
      const currentPicks = await this.getEntryPicksForWeek(entryId, week)
      const duplicatePick = currentPicks.find((pick) => pick.gameId === gameId)

      if (duplicatePick) {
        errors.push('You have already made a pick for this game')
      }

      // Game must exist
      const game = await prisma.game.findUnique({ where: { id: gameId } })
      if (!game) {
        errors.push('Game not found')
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        pickType: 'SU',
      }
    } catch (error) {
      console.error('Error validating SU pick:', error)
      return {
        isValid: false,
        errors: ['Validation failed due to system error'],
        warnings: [],
        pickType: 'SU',
      }
    }
  }

  /**
   * Get comprehensive pick validation for entry
   */
  async getPickValidationSummary(
    entryId: string,
    week: number
  ): Promise<{
    pointsPlus?: PointsPlusValidation
    survivor?: SurvivorValidation
    totalPicks: number
    maxPicks: number
    canMakeMorePicks: boolean
  }> {
    try {
      const entry = await prisma.entry.findUnique({
        where: { id: entryId },
        include: {
          pool: true,
          picks: {
            where: {
              game: { week },
            },
            include: {
              game: {
                include: {
                  homeTeam: true,
                  awayTeam: true,
                },
              },
            },
          },
        },
      })

      if (!entry) {
        throw new Error('Entry not found')
      }

      const totalPicks = entry.picks.length
      const maxPicks = await this.getMaxPicksForWeek(week)
      const canMakeMorePicks = totalPicks < maxPicks

      const result: any = {
        totalPicks,
        maxPicks,
        canMakeMorePicks,
      }

      // Add pool-specific validation
      if (entry.pool.type === 'POINTS_PLUS') {
        result.pointsPlus = await this.getPointsPlusValidationSummary(
          entry.picks
        )
      }

      if (entry.pool.type === 'SURVIVOR') {
        result.survivor = await this.getSurvivorValidationSummary(entryId)
      }

      return result
    } catch (error) {
      console.error('Error getting pick validation summary:', error)
      throw error
    }
  }

  /**
   * Private helper methods
   */
  private async getEntryPicksForWeek(entryId: string, week: number) {
    return await prisma.pick.findMany({
      where: {
        entryId,
        game: { week },
      },
      include: {
        game: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    })
  }

  private async getGameWithMarketData(gameId: string) {
    // This would include market data from odds providers
    // For now, return basic game data
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })

    if (!game) return null

    // Mock market data - would be replaced with actual odds data
    return {
      ...game,
      marketData: {
        spread: 0, // Would come from odds provider
        total: 47.5,
        moneylineHome: -110,
        moneylineAway: -110,
      } as MarketData,
    }
  }

  private determineIfFavorite(
    marketData: MarketData,
    isHomePick: boolean
  ): boolean {
    if (marketData.spread !== undefined) {
      // Home team is favorite if spread is negative
      // Away team is favorite if spread is positive
      const homeIsFavorite = marketData.spread < 0
      return isHomePick ? homeIsFavorite : !homeIsFavorite
    }

    if (marketData.moneylineHome && marketData.moneylineAway) {
      // Lower absolute value indicates favorite
      const homeIsFavorite =
        Math.abs(marketData.moneylineHome) > Math.abs(marketData.moneylineAway)
      return isHomePick ? homeIsFavorite : !homeIsFavorite
    }

    return false // Default to underdog if no market data
  }

  private isPickEmGame(marketData: MarketData): boolean {
    if (marketData.spread !== undefined) {
      return Math.abs(marketData.spread) < 0.5
    }

    if (marketData.moneylineHome && marketData.moneylineAway) {
      // Both lines within -120 to +120 range
      return (
        Math.abs(marketData.moneylineHome) <= 120 &&
        Math.abs(marketData.moneylineAway) <= 120
      )
    }

    return false
  }

  private async validatePointsPlusRules(
    currentPicks: any[],
    isFavorite: boolean,
    isPickEm: boolean,
    gameId: string
  ): Promise<PointsPlusValidation> {
    let favoritesCount = 0
    let underdogsCount = 0

    // Count existing picks properly
    for (const pick of currentPicks) {
      if (pick.game && pick.game.id !== gameId) {
        const pickGame = await this.getGameWithMarketData(pick.game.id)
        if (pickGame && pickGame.marketData?.spread) {
          const isHomePick = pick.teamId === pickGame.homeTeamId
          const pickIsFavorite = this.determineIfFavorite(
            pickGame.marketData,
            isHomePick
          )
          if (pickIsFavorite) {
            favoritesCount++
          } else {
            underdogsCount++
          }
        }
      }
    }

    // Add current pick
    if (isFavorite && !isPickEm) {
      favoritesCount++
    } else if (!isFavorite && !isPickEm) {
      underdogsCount++
    }

    const totalPicks =
      currentPicks.filter((p) => p.game?.id !== gameId).length + 1
    const minimumPicks = 4 // Points Plus minimum

    return {
      totalPicks,
      favoritesCount,
      underdogsCount,
      minimumPicksMet: totalPicks >= minimumPicks,
      favoriteUnderdogBalance: favoritesCount === underdogsCount,
      noPickEmGames: !isPickEm,
    }
  }

  private checkSurvivorElimination(picks: any[]): boolean {
    // Check if any previous pick resulted in elimination
    for (const pick of picks) {
      if (pick.game.Result) {
        const homeWon =
          (pick.game.Result.homeScore || 0) > (pick.game.Result.awayScore || 0)
        const awayWon =
          (pick.game.Result.awayScore || 0) > (pick.game.Result.homeScore || 0)

        const pickedHome = pick.teamId === pick.game.homeTeamId
        const pickWon = (pickedHome && homeWon) || (!pickedHome && awayWon)

        if (!pickWon) {
          return true // Entry eliminated
        }
      }
    }

    return false
  }

  private isPopularSurvivorTeam(teamAbbr: string): boolean {
    // Teams commonly used early in Survivor pools
    const popularTeams = ['KC', 'BUF', 'PHI', 'SF', 'DAL', 'MIA', 'BAL']
    return popularTeams.includes(teamAbbr)
  }

  private calculateWinProbability(
    marketData: MarketData,
    isHomePick: boolean
  ): number {
    // Convert moneyline to win probability
    if (marketData.moneylineHome && marketData.moneylineAway) {
      const homeLine = marketData.moneylineHome
      const awayLine = marketData.moneylineAway

      let homeWinProb: number
      if (homeLine < 0) {
        // Home team is favorite
        homeWinProb = Math.abs(homeLine) / (Math.abs(homeLine) + 100)
      } else {
        // Home team is underdog
        homeWinProb = 100 / (homeLine + 100)
      }

      return isHomePick ? homeWinProb : 1 - homeWinProb
    }

    // Fallback to spread-based calculation
    if (marketData.spread !== undefined) {
      const baseProb = 0.5
      const probPerPoint = 0.025
      const homeWinProb = baseProb + -marketData.spread * probPerPoint
      return isHomePick ? homeWinProb : 1 - homeWinProb
    }

    return 0.5 // Default to 50% if no data
  }

  private areDivisionRivals(team1: string, team2: string): boolean {
    const divisions = {
      'AFC East': ['BUF', 'MIA', 'NE', 'NYJ'],
      'AFC North': ['BAL', 'CIN', 'CLE', 'PIT'],
      'AFC South': ['HOU', 'IND', 'JAX', 'TEN'],
      'AFC West': ['DEN', 'KC', 'LV', 'LAC'],
      'NFC East': ['DAL', 'NYG', 'PHI', 'WAS'],
      'NFC North': ['CHI', 'DET', 'GB', 'MIN'],
      'NFC South': ['ATL', 'CAR', 'NO', 'TB'],
      'NFC West': ['ARI', 'LAR', 'SF', 'SEA'],
    }

    for (const division of Object.values(divisions)) {
      if (division.includes(team1) && division.includes(team2)) {
        return true
      }
    }

    return false
  }

  private async getMaxPicksForWeek(week: number): Promise<number> {
    // Get number of games in the week
    const gameCount = await prisma.game.count({
      where: { week },
    })

    return gameCount // Most pools allow one pick per game
  }

  private async getPointsPlusValidationSummary(
    picks: any[]
  ): Promise<PointsPlusValidation> {
    let favoritesCount = 0
    let underdogsCount = 0

    // Would analyze each pick to determine favorite/underdog
    // For now, return basic structure
    for (const pick of picks) {
      // Mock analysis - would use actual market data
      if (Math.random() > 0.5) {
        favoritesCount++
      } else {
        underdogsCount++
      }
    }

    return {
      totalPicks: picks.length,
      favoritesCount,
      underdogsCount,
      minimumPicksMet: picks.length >= 5,
      favoriteUnderdogBalance: Math.abs(favoritesCount - underdogsCount) <= 2,
      noPickEmGames: true, // Would check actual games
    }
  }

  private async getSurvivorValidationSummary(
    entryId: string
  ): Promise<SurvivorValidation> {
    const survivorEntry = await prisma.survivorEntry.findFirst({
      where: { entryId },
      include: {
        picks: {
          include: {
            game: {
              include: {
                Result: true,
              },
            },
            team: true,
          },
        },
        entry: {
          include: {
            pool: true,
          },
        },
      },
    })

    if (!survivorEntry) {
      return {
        teamAlreadyUsed: false,
        eliminatedEntry: true,
        validPick: false,
        usedTeams: [],
      }
    }

    const usedTeams = survivorEntry.picks.map((pick) => pick.teamId)
    const eliminatedEntry = !survivorEntry.isActive

    return {
      teamAlreadyUsed: false, // Would check against specific team
      eliminatedEntry,
      validPick: survivorEntry.isActive,
      usedTeams,
    }
  }
}
