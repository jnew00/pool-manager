import { Decimal } from '@prisma/client/runtime/library'

export interface TeamEV {
  teamId: string
  teamAbbr: string
  gameId: string
  week: number
  winProbability: number
  publicPickPercentage: number
  expectedValue: number
  survivalRate: number
  adjustedEV: number
}

export interface WeekEVData {
  week: number
  overallSurvivalRate: number
  teams: TeamEV[]
}

export interface MoneylineOdds {
  homeMoneyline: number
  awayMoneyline: number
}

export class SurvivorEVEngine {
  /**
   * Convert American moneyline odds to implied win probability
   */
  static moneylineToWinProbability(moneyline: number): number {
    if (moneyline > 0) {
      // Underdog: probability = 100 / (moneyline + 100)
      return 100 / (moneyline + 100)
    } else {
      // Favorite: probability = |moneyline| / (|moneyline| + 100)
      return Math.abs(moneyline) / (Math.abs(moneyline) + 100)
    }
  }

  /**
   * Calculate win probability from point spread
   * Uses simplified formula: Win% ≈ 50% + (spread * 2.5%)
   * More accurate would use historical data or distribution models
   */
  static spreadToWinProbability(spread: number): number {
    // Negative spread means team is favored
    const baseProb = 0.5
    const probPerPoint = 0.025 // 2.5% per point
    const winProb = baseProb + -spread * probPerPoint

    // Clamp between 0.01 and 0.99
    return Math.max(0.01, Math.min(0.99, winProb))
  }

  /**
   * Calculate Expected Value for a team pick
   *
   * Formula: EV = (Win% × (1 / % of entries picking team that survive)) / (Overall survival rate for the week)
   *
   * Higher EV indicates better value considering both win probability and differentiation
   */
  static calculateEV(
    winProbability: number,
    publicPickPercentage: number,
    overallSurvivalRate: number
  ): number {
    // Avoid division by zero
    if (publicPickPercentage === 0 || overallSurvivalRate === 0) {
      return 0
    }

    // Calculate survival value if we win
    // If 20% pick this team and we win, we survive while 80% of the field doesn't pick this team
    const survivalValue = 1 / (publicPickPercentage / 100)

    // Adjust for overall week survival
    const ev = (winProbability * survivalValue) / overallSurvivalRate

    return ev
  }

  /**
   * Calculate adjusted EV considering pool size
   * Small pools: prioritize win probability
   * Large pools: prioritize differentiation
   */
  static calculateAdjustedEV(
    baseEV: number,
    winProbability: number,
    poolSize: number
  ): number {
    // Weight factors based on pool size
    const smallPoolThreshold = 50
    const largePoolThreshold = 500

    let winProbWeight: number
    let evWeight: number

    if (poolSize <= smallPoolThreshold) {
      // Small pool: 70% win prob, 30% EV
      winProbWeight = 0.7
      evWeight = 0.3
    } else if (poolSize >= largePoolThreshold) {
      // Large pool: 30% win prob, 70% EV
      winProbWeight = 0.3
      evWeight = 0.7
    } else {
      // Linear interpolation between small and large
      const ratio =
        (poolSize - smallPoolThreshold) /
        (largePoolThreshold - smallPoolThreshold)
      winProbWeight = 0.7 - 0.4 * ratio
      evWeight = 0.3 + 0.4 * ratio
    }

    return winProbWeight * winProbability * 2 + evWeight * baseEV
  }

  /**
   * Calculate overall survival rate for a week based on all games
   * This represents the percentage of entries expected to survive
   */
  static calculateWeekSurvivalRate(
    teamWinProbabilities: Map<string, number>,
    publicPickDistribution: Map<string, number>
  ): number {
    let expectedSurvivalRate = 0

    publicPickDistribution.forEach((pickPercentage, teamId) => {
      const winProb = teamWinProbabilities.get(teamId) || 0.5
      expectedSurvivalRate += (pickPercentage / 100) * winProb
    })

    return expectedSurvivalRate
  }

  /**
   * Get EV calculations for all available teams in a week
   */
  static calculateWeekEV(
    games: Array<{
      id: string
      homeTeamId: string
      awayTeamId: string
      homeTeamAbbr: string
      awayTeamAbbr: string
      homeMoneyline?: number
      awayMoneyline?: number
      spread?: number
    }>,
    publicPickData: Record<string, number>,
    usedTeams: Set<string>,
    poolSize: number = 100
  ): WeekEVData {
    const teamWinProbabilities = new Map<string, number>()
    const teamGames = new Map<string, string>()
    const teamAbbrs = new Map<string, string>()

    // Calculate win probabilities for each team
    games.forEach((game) => {
      let homeWinProb: number
      let awayWinProb: number

      // Prefer moneyline odds if available
      if (game.homeMoneyline && game.awayMoneyline) {
        homeWinProb = this.moneylineToWinProbability(game.homeMoneyline)
        awayWinProb = this.moneylineToWinProbability(game.awayMoneyline)
      } else if (game.spread !== undefined) {
        // Home team spread is negative if they're favored
        homeWinProb = this.spreadToWinProbability(game.spread)
        awayWinProb = 1 - homeWinProb
      } else {
        // No odds available, assume 50/50
        homeWinProb = 0.5
        awayWinProb = 0.5
      }

      teamWinProbabilities.set(game.homeTeamId, homeWinProb)
      teamWinProbabilities.set(game.awayTeamId, awayWinProb)
      teamGames.set(game.homeTeamId, game.id)
      teamGames.set(game.awayTeamId, game.id)
      teamAbbrs.set(game.homeTeamId, game.homeTeamAbbr)
      teamAbbrs.set(game.awayTeamId, game.awayTeamAbbr)
    })

    // Convert public pick data to Map
    const publicPickDistribution = new Map<string, number>()
    Object.entries(publicPickData).forEach(([teamAbbr, percentage]) => {
      // Find team ID by abbreviation
      const teamId = Array.from(teamAbbrs.entries()).find(
        ([_, abbr]) => abbr === teamAbbr
      )?.[0]
      if (teamId) {
        publicPickDistribution.set(teamId, percentage)
      }
    })

    // Calculate overall survival rate
    const overallSurvivalRate = this.calculateWeekSurvivalRate(
      teamWinProbabilities,
      publicPickDistribution
    )

    // Calculate EV for each available team
    const teams: TeamEV[] = []

    teamWinProbabilities.forEach((winProb, teamId) => {
      // Skip if team already used
      if (usedTeams.has(teamId)) {
        return
      }

      const teamAbbr = teamAbbrs.get(teamId) || ''
      const publicPickPercentage = publicPickDistribution.get(teamId) || 1 // Default to 1% if no data
      const gameId = teamGames.get(teamId) || ''

      const ev = this.calculateEV(
        winProb,
        publicPickPercentage,
        overallSurvivalRate
      )
      const adjustedEV = this.calculateAdjustedEV(ev, winProb, poolSize)

      teams.push({
        teamId,
        teamAbbr,
        gameId,
        week: 1, // Will be set by caller
        winProbability: winProb,
        publicPickPercentage,
        expectedValue: ev,
        survivalRate: winProb,
        adjustedEV,
      })
    })

    // Sort by adjusted EV descending
    teams.sort((a, b) => b.adjustedEV - a.adjustedEV)

    return {
      week: 1, // Will be set by caller
      overallSurvivalRate,
      teams,
    }
  }

  /**
   * Identify contrarian picks with positive EV
   * These are low pick% teams with reasonable win probability
   */
  static findContrarianPicks(
    weekData: WeekEVData,
    minWinProbability: number = 0.55,
    maxPickPercentage: number = 5
  ): TeamEV[] {
    return weekData.teams.filter(
      (team) =>
        team.winProbability >= minWinProbability &&
        team.publicPickPercentage <= maxPickPercentage &&
        team.expectedValue > 1.0
    )
  }

  /**
   * Find the safest picks (highest win probability)
   */
  static findSafestPicks(
    weekData: WeekEVData,
    minWinProbability: number = 0.65
  ): TeamEV[] {
    return weekData.teams
      .filter((team) => team.winProbability >= minWinProbability)
      .sort((a, b) => b.winProbability - a.winProbability)
  }

  /**
   * Find optimal picks balancing EV and safety
   */
  static findBalancedPicks(
    weekData: WeekEVData,
    minWinProbability: number = 0.6,
    minEV: number = 0.9
  ): TeamEV[] {
    return weekData.teams
      .filter(
        (team) =>
          team.winProbability >= minWinProbability &&
          team.expectedValue >= minEV
      )
      .sort((a, b) => b.adjustedEV - a.adjustedEV)
  }
}
