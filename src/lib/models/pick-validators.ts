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

      // Points Plus rules validation
      const validation = this.validatePointsPlusRules(
        currentPicks,
        isFavorite,
        isPickEm
      )

      if (!validation.minimumPicksMet) {
        warnings.push('Need to make more picks to meet minimum requirement')
      }

      if (!validation.favoriteUnderdogBalance && !isPickEm) {
        warnings.push('Consider balancing favorites and underdogs')
      }

      if (validation.noPickEmGames && isPickEm) {
        errors.push("Pick'em games are not allowed in Points Plus pools")
      }

      // Check for duplicate picks
      const duplicatePick = currentPicks.find((pick) => pick.gameId === gameId)

      if (duplicatePick) {
        errors.push('You have already made a pick for this game')
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        pickType: 'POINTS_PLUS',
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
      // Check if entry is still alive
      const entry = await prisma.entry.findUnique({
        where: { id: entryId },
        include: {
          picks: {
            where: {
              game: {
                week: { lt: week },
              },
            },
            include: {
              game: {
                include: {
                  Result: true,
                },
              },
            },
          },
        },
      })

      if (!entry) {
        errors.push('Entry not found')
        return { isValid: false, errors, warnings, pickType: 'SURVIVOR' }
      }

      // Check if entry has been eliminated
      const isEliminated = this.checkSurvivorElimination(entry.picks)
      if (isEliminated) {
        errors.push('Entry has been eliminated and cannot make more picks')
        return { isValid: false, errors, warnings, pickType: 'SURVIVOR' }
      }

      // Get all teams previously used by this entry
      const usedTeams = entry.picks.map((pick) => pick.teamId)

      // Check if team has been used before
      if (usedTeams.includes(teamId)) {
        errors.push('This team has already been used in a previous week')
      }

      // Survivor-specific warnings
      const team = await prisma.team.findUnique({ where: { id: teamId } })
      if (team) {
        // Warn about using popular teams early in season
        if (week <= 8 && this.isPopularSurvivorTeam(team.nflAbbr)) {
          warnings.push(
            `${team.nflAbbr} is a popular choice - consider saving for later weeks`
          )
        }

        // Warn about road favorites
        const game = await this.getGameWithMarketData(gameId)
        if (game) {
          const isHomePick = teamId === game.homeTeamId
          const isFavorite = this.determineIfFavorite(
            game.marketData,
            isHomePick
          )

          if (isFavorite && !isHomePick) {
            warnings.push('Road favorites can be risky in Survivor pools')
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        pickType: 'SURVIVOR',
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

  private validatePointsPlusRules(
    currentPicks: any[],
    isFavorite: boolean,
    isPickEm: boolean
  ): PointsPlusValidation {
    let favoritesCount = 0
    let underdogsCount = 0

    for (const pick of currentPicks) {
      // Would need to determine favorite/underdog for each existing pick
      // For now, assume roughly even split
      if (Math.random() > 0.5) {
        favoritesCount++
      } else {
        underdogsCount++
      }
    }

    // Add current pick
    if (isFavorite) {
      favoritesCount++
    } else if (!isPickEm) {
      underdogsCount++
    }

    const totalPicks = currentPicks.length + 1
    const minimumPicks = 5 // Configurable per pool

    return {
      totalPicks,
      favoritesCount,
      underdogsCount,
      minimumPicksMet: totalPicks >= minimumPicks,
      favoriteUnderdogBalance: Math.abs(favoritesCount - underdogsCount) <= 2,
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
    const allPicks = await prisma.pick.findMany({
      where: { entryId },
      include: {
        game: {
          include: {
            Result: true,
          },
        },
      },
    })

    const usedTeams = allPicks.map((pick) => pick.teamId)
    const eliminatedEntry = this.checkSurvivorElimination(allPicks)

    return {
      teamAlreadyUsed: false, // Would check against specific team
      eliminatedEntry,
      validPick: !eliminatedEntry,
      usedTeams,
    }
  }
}
