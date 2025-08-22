import { prisma } from '@/lib/prisma'
import type { TeamRating, ModelWeights } from './types'

/**
 * Elo-lite rating system for NFL teams
 */
export class EloSystem {
  private readonly kFactor: number
  private readonly defaultRating = 1500
  private readonly regressionFactor = 0.25 // How much to regress toward mean each season

  constructor(kFactor: number = 24) {
    this.kFactor = kFactor
  }

  /**
   * Get current Elo rating for a team
   */
  async getTeamRating(teamId: string): Promise<TeamRating> {
    // Try to get from database first
    const existingRating = await this.getStoredRating(teamId)
    if (existingRating) {
      return existingRating
    }

    // Create default rating if none exists
    return this.createDefaultRating(teamId)
  }

  /**
   * Get ratings for multiple teams
   */
  async getTeamRatings(teamIds: string[]): Promise<Map<string, TeamRating>> {
    const ratings = new Map<string, TeamRating>()

    for (const teamId of teamIds) {
      const rating = await this.getTeamRating(teamId)
      ratings.set(teamId, rating)
    }

    return ratings
  }

  /**
   * Update team ratings after a game result
   */
  async updateRatingsAfterGame(
    homeTeamId: string,
    awayTeamId: string,
    homeScore: number,
    awayScore: number,
    homeSpread?: number
  ): Promise<{
    homeRatingChange: number
    awayRatingChange: number
    homeNewRating: number
    awayNewRating: number
  }> {
    const homeRating = await this.getTeamRating(homeTeamId)
    const awayRating = await this.getTeamRating(awayTeamId)

    // Calculate expected probabilities
    const homeExpected = this.calculateExpectedScore(
      homeRating.rating,
      awayRating.rating,
      true
    )
    const awayExpected = 1 - homeExpected

    // Calculate actual results (accounting for spread if available)
    const { homeActual, awayActual } = this.calculateActualResults(
      homeScore,
      awayScore,
      homeSpread
    )

    // Calculate rating changes
    const homeChange = this.kFactor * (homeActual - homeExpected)
    const awayChange = this.kFactor * (awayActual - awayExpected)

    // Apply changes
    const homeNewRating = homeRating.rating + homeChange
    const awayNewRating = awayRating.rating + awayChange

    // Update in database
    await this.updateStoredRating(
      homeTeamId,
      homeNewRating,
      homeRating.gamesPlayed + 1
    )
    await this.updateStoredRating(
      awayTeamId,
      awayNewRating,
      awayRating.gamesPlayed + 1
    )

    return {
      homeRatingChange: homeChange,
      awayRatingChange: awayChange,
      homeNewRating,
      awayNewRating,
    }
  }

  /**
   * Calculate expected win probability for home team
   */
  calculateExpectedScore(
    homeRating: number,
    awayRating: number,
    isHomeTeam: boolean = true
  ): number {
    const homeAdvantage = isHomeTeam ? 65 : 0 // ~3 point home field advantage in Elo terms
    const ratingDiff = homeRating + homeAdvantage - awayRating

    return 1 / (1 + Math.pow(10, -ratingDiff / 400))
  }

  /**
   * Calculate probability between any two teams (neutral site)
   */
  calculateWinProbability(team1Rating: number, team2Rating: number): number {
    const ratingDiff = team1Rating - team2Rating
    return 1 / (1 + Math.pow(10, -ratingDiff / 400))
  }

  /**
   * Seed initial ratings from historical data
   */
  async seedHistoricalRatings(season: number): Promise<void> {
    // Get all teams
    const teams = await prisma.team.findMany()

    for (const team of teams) {
      // Get historical performance for seeding
      const historicalRating = await this.calculateHistoricalSeed(
        team.id,
        season
      )

      await this.updateStoredRating(team.id, historicalRating, 0)
    }
  }

  /**
   * Apply seasonal regression (move ratings toward mean)
   */
  async applySeasonalRegression(season: number): Promise<void> {
    // Get all current ratings
    const currentRatings = await this.getAllStoredRatings()

    for (const rating of currentRatings) {
      // Regress toward league average (1500)
      const regressedRating =
        rating.rating +
        (this.defaultRating - rating.rating) * this.regressionFactor

      // Reset games played for new season
      await this.updateStoredRating(rating.teamId, regressedRating, 0)
    }
  }

  /**
   * Get team strength rankings
   */
  async getTeamRankings(): Promise<
    Array<TeamRating & { rank: number; team: any }>
  > {
    const ratingsWithTeams = await prisma.teamRating.findMany({
      include: {
        team: {
          select: {
            name: true,
            nflAbbr: true,
          },
        },
      },
      orderBy: {
        rating: 'desc',
      },
    })

    return ratingsWithTeams.map((rating, index) => ({
      teamId: rating.teamId,
      rating: rating.rating,
      gamesPlayed: rating.gamesPlayed,
      lastUpdated: rating.lastUpdated,
      rank: index + 1,
      team: rating.team,
    }))
  }

  /**
   * Get rating history for a team
   */
  async getTeamRatingHistory(
    teamId: string,
    season?: number
  ): Promise<
    Array<{
      date: Date
      rating: number
      gameId?: string
      opponent?: string
      change?: number
    }>
  > {
    // This would require a rating_history table to track changes over time
    // For now, return current rating
    const current = await this.getTeamRating(teamId)

    return [
      {
        date: current.lastUpdated,
        rating: current.rating,
      },
    ]
  }

  /**
   * Private helper methods
   */
  private async getStoredRating(teamId: string): Promise<TeamRating | null> {
    try {
      const rating = await prisma.teamRating.findUnique({
        where: { teamId },
      })

      return rating
        ? {
            teamId: rating.teamId,
            rating: rating.rating,
            gamesPlayed: rating.gamesPlayed,
            lastUpdated: rating.lastUpdated,
          }
        : null
    } catch {
      return null
    }
  }

  private async getAllStoredRatings(): Promise<TeamRating[]> {
    try {
      const ratings = await prisma.teamRating.findMany()

      return ratings.map((rating) => ({
        teamId: rating.teamId,
        rating: rating.rating,
        gamesPlayed: rating.gamesPlayed,
        lastUpdated: rating.lastUpdated,
      }))
    } catch {
      return []
    }
  }

  private async updateStoredRating(
    teamId: string,
    rating: number,
    gamesPlayed: number
  ): Promise<void> {
    try {
      await prisma.teamRating.upsert({
        where: { teamId },
        update: {
          rating,
          gamesPlayed,
          lastUpdated: new Date(),
        },
        create: {
          teamId,
          rating,
          gamesPlayed,
          lastUpdated: new Date(),
        },
      })
    } catch (error) {
      console.error('Failed to update team rating:', error)
    }
  }

  private createDefaultRating(teamId: string): TeamRating {
    return {
      teamId,
      rating: this.defaultRating,
      gamesPlayed: 0,
      lastUpdated: new Date(),
    }
  }

  private calculateActualResults(
    homeScore: number,
    awayScore: number,
    homeSpread?: number
  ): { homeActual: number; awayActual: number } {
    // If spread is provided, use against-the-spread result
    if (homeSpread !== undefined) {
      const adjustedHomeScore = homeScore + homeSpread

      if (adjustedHomeScore > awayScore) {
        return { homeActual: 1, awayActual: 0 } // Home covers
      } else if (adjustedHomeScore < awayScore) {
        return { homeActual: 0, awayActual: 1 } // Away covers
      } else {
        return { homeActual: 0.5, awayActual: 0.5 } // Push
      }
    }

    // Otherwise use straight-up win/loss
    if (homeScore > awayScore) {
      return { homeActual: 1, awayActual: 0 }
    } else if (awayScore > homeScore) {
      return { homeActual: 0, awayActual: 1 }
    } else {
      return { homeActual: 0.5, awayActual: 0.5 } // Tie
    }
  }

  private async calculateHistoricalSeed(
    teamId: string,
    currentSeason: number
  ): Promise<number> {
    // Get historical win percentage for seeding
    try {
      const historicalGames = await prisma.game.findMany({
        where: {
          OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
          season: {
            gte: currentSeason - 3, // Look back 3 seasons
            lt: currentSeason,
          },
        },
        include: {
          result: true,
        },
      })

      if (historicalGames.length === 0) {
        return this.defaultRating
      }

      let wins = 0
      let totalGames = 0

      for (const game of historicalGames) {
        if (!game.result) continue

        const isHome = game.homeTeamId === teamId
        const homeScore = game.result.homeScore || 0
        const awayScore = game.result.awayScore || 0

        if (
          (isHome && homeScore > awayScore) ||
          (!isHome && awayScore > homeScore)
        ) {
          wins++
        }
        totalGames++
      }

      if (totalGames === 0) {
        return this.defaultRating
      }

      const winRate = wins / totalGames

      // Convert win rate to Elo rating (roughly)
      // 50% win rate = 1500, each 10% = ~100 points
      return this.defaultRating + (winRate - 0.5) * 1000
    } catch {
      return this.defaultRating
    }
  }

  /**
   * Utility methods for external use
   */

  /**
   * Convert Elo rating to expected win percentage vs average team
   */
  ratingToWinPercentage(rating: number): number {
    return this.calculateWinProbability(rating, this.defaultRating)
  }

  /**
   * Convert win percentage to approximate Elo rating
   */
  winPercentageToRating(winPct: number): number {
    return this.defaultRating + (winPct - 0.5) * 1000
  }

  /**
   * Get rating difference equivalent to point spread
   */
  spreadToRatingDiff(spread: number): number {
    // Roughly 1 point = 25 Elo points
    return spread * 25
  }

  /**
   * Convert rating difference to equivalent point spread
   */
  ratingDiffToSpread(ratingDiff: number): number {
    return ratingDiff / 25
  }
}
