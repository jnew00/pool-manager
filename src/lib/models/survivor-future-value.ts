import { Decimal } from '@prisma/client/runtime/library'

export interface FutureMatchup {
  week: number
  opponentId: string
  opponentAbbr: string
  isHome: boolean
  projectedSpread?: number
  projectedWinProbability?: number
  favorabilityScore: number // 0-100
}

export interface TeamFutureValue {
  teamId: string
  teamAbbr: string
  futureMatchups: FutureMatchup[]
  averageFavorability: number
  bestWeeks: number[] // Weeks where team is likely to be biggest favorite
  futureValueRating: number // 1-5 stars
  saveRecommendation:
    | 'USE_NOW'
    | 'SAVE_IF_POSSIBLE'
    | 'HIGH_VALUE_SAVE'
    | 'MUST_SAVE'
}

export interface SeasonProjection {
  expectedPoolDuration: number // Expected weeks until pool ends
  criticalWeeks: number[] // Weeks with limited good options
  teams: TeamFutureValue[]
}

export class SurvivorFutureValue {
  /**
   * Calculate future value rating (1-5 stars) based on upcoming matchups
   */
  static calculateFutureValueRating(
    averageFavorability: number,
    bestWeeksCount: number,
    hasEliteMatchup: boolean
  ): number {
    let rating = 1

    // Base rating on average favorability
    if (averageFavorability >= 70) rating = 4
    else if (averageFavorability >= 60) rating = 3
    else if (averageFavorability >= 50) rating = 2

    // Bonus for multiple best weeks
    if (bestWeeksCount >= 2) rating += 0.5

    // Bonus for elite matchup (e.g., vs worst teams)
    if (hasEliteMatchup) rating += 0.5

    // Cap at 5
    return Math.min(5, rating)
  }

  /**
   * Calculate favorability score for a matchup (0-100)
   * Based on opponent strength, home/away, and other factors
   */
  static calculateMatchupFavorability(
    teamRating: number,
    opponentRating: number,
    isHome: boolean,
    restAdvantage: number = 0 // days of extra rest
  ): number {
    // Rating difference (Elo-style)
    const ratingDiff = teamRating - opponentRating

    // Home field advantage (~3 points)
    const homeAdvantage = isHome ? 60 : -60

    // Rest advantage (~1 point per day)
    const restBonus = restAdvantage * 20

    // Convert to favorability score (0-100)
    const totalAdvantage = ratingDiff + homeAdvantage + restBonus

    // Use logistic function to convert to 0-100 scale
    // This gives us a smooth curve where 0 diff = 50, +400 = ~90, -400 = ~10
    const favorability = 100 / (1 + Math.exp(-totalAdvantage / 100))

    return Math.round(favorability)
  }

  /**
   * Project future matchups for a team
   */
  static projectTeamMatchups(
    teamId: string,
    teamAbbr: string,
    schedule: Array<{
      week: number
      homeTeamId: string
      awayTeamId: string
      homeTeamAbbr: string
      awayTeamAbbr: string
    }>,
    teamRatings: Map<string, number>,
    currentWeek: number,
    weeksToProject: number = 10
  ): FutureMatchup[] {
    const matchups: FutureMatchup[] = []
    const teamRating = teamRatings.get(teamId) || 1500

    for (
      let week = currentWeek + 1;
      week <= currentWeek + weeksToProject;
      week++
    ) {
      const game = schedule.find(
        (g) =>
          g.week === week &&
          (g.homeTeamId === teamId || g.awayTeamId === teamId)
      )

      if (!game) continue

      const isHome = game.homeTeamId === teamId
      const opponentId = isHome ? game.awayTeamId : game.homeTeamId
      const opponentAbbr = isHome ? game.awayTeamAbbr : game.homeTeamAbbr
      const opponentRating = teamRatings.get(opponentId) || 1500

      const favorabilityScore = this.calculateMatchupFavorability(
        teamRating,
        opponentRating,
        isHome
      )

      // Project spread based on rating difference
      const ratingDiff = teamRating - opponentRating
      const homeAdj = isHome ? -3 : 3
      const projectedSpread = -(ratingDiff / 25) + homeAdj // Negative means favored

      // Convert spread to win probability
      const projectedWinProbability =
        this.spreadToWinProbability(projectedSpread)

      matchups.push({
        week,
        opponentId,
        opponentAbbr,
        isHome,
        projectedSpread,
        projectedWinProbability,
        favorabilityScore,
      })
    }

    return matchups
  }

  /**
   * Helper to convert spread to win probability
   */
  private static spreadToWinProbability(spread: number): number {
    const baseProb = 0.5
    const probPerPoint = 0.025
    const winProb = baseProb + -spread * probPerPoint
    return Math.max(0.01, Math.min(0.99, winProb))
  }

  /**
   * Identify weeks where a team is likely to be the biggest favorite
   */
  static identifyBestWeeks(
    teamMatchups: FutureMatchup[],
    allTeamsMatchups: Map<string, FutureMatchup[]>,
    threshold: number = 75 // Favorability threshold
  ): number[] {
    const bestWeeks: number[] = []

    teamMatchups.forEach((matchup) => {
      if (matchup.favorabilityScore < threshold) return

      // Check if this team is likely to be one of the best options this week
      let betterOptionsCount = 0

      allTeamsMatchups.forEach((otherMatchups, otherTeamId) => {
        const otherWeekMatchup = otherMatchups.find(
          (m) => m.week === matchup.week
        )
        if (
          otherWeekMatchup &&
          otherWeekMatchup.favorabilityScore > matchup.favorabilityScore
        ) {
          betterOptionsCount++
        }
      })

      // If fewer than 3 teams have better matchups, this is a best week
      if (betterOptionsCount < 3) {
        bestWeeks.push(matchup.week)
      }
    })

    return bestWeeks
  }

  /**
   * Determine save recommendation based on future value
   */
  static determineSaveRecommendation(
    futureValueRating: number,
    bestWeeksCount: number,
    currentWeekWinProbability: number,
    weeksSurvived: number,
    expectedPoolDuration: number
  ): 'USE_NOW' | 'SAVE_IF_POSSIBLE' | 'HIGH_VALUE_SAVE' | 'MUST_SAVE' {
    // Late in the pool, use good teams
    if (weeksSurvived > expectedPoolDuration * 0.7) {
      return 'USE_NOW'
    }

    // Very safe current week, consider saving good teams
    if (currentWeekWinProbability > 0.75) {
      if (futureValueRating >= 4.5) return 'MUST_SAVE'
      if (futureValueRating >= 3.5) return 'HIGH_VALUE_SAVE'
      if (futureValueRating >= 2.5) return 'SAVE_IF_POSSIBLE'
    }

    // Moderate current week
    if (currentWeekWinProbability > 0.65) {
      if (futureValueRating >= 4.5 && bestWeeksCount >= 2)
        return 'HIGH_VALUE_SAVE'
      if (futureValueRating >= 3.5) return 'SAVE_IF_POSSIBLE'
    }

    // Default to using now if no strong reason to save
    return 'USE_NOW'
  }

  /**
   * Calculate expected pool duration based on historical survival rates
   */
  static calculateExpectedPoolDuration(
    poolSize: number,
    averageWeeklySurvivalRate: number = 0.67 // Historical average
  ): number {
    // Calculate weeks until less than 1 survivor expected
    let survivors = poolSize
    let weeks = 0

    while (survivors > 1 && weeks < 18) {
      survivors *= averageWeeklySurvivalRate
      weeks++
    }

    return weeks
  }

  /**
   * Identify critical weeks with limited good options
   */
  static identifyCriticalWeeks(
    schedule: Array<{
      week: number
      homeTeamId: string
      awayTeamId: string
    }>,
    teamRatings: Map<string, number>,
    weeksToAnalyze: number = 10
  ): number[] {
    const criticalWeeks: number[] = []

    for (let week = 1; week <= weeksToAnalyze; week++) {
      const weekGames = schedule.filter((g) => g.week === week)
      let strongFavoritesCount = 0

      weekGames.forEach((game) => {
        const homeRating = teamRatings.get(game.homeTeamId) || 1500
        const awayRating = teamRatings.get(game.awayTeamId) || 1500
        const ratingDiff = Math.abs(homeRating - awayRating)

        // Count games with significant favorites (>7 point spread equivalent)
        if (ratingDiff > 175) {
          strongFavoritesCount++
        }
      })

      // Week is critical if fewer than 4 strong favorites
      if (strongFavoritesCount < 4) {
        criticalWeeks.push(week)
      }
    }

    return criticalWeeks
  }

  /**
   * Generate complete season projection with future values for all teams
   */
  static generateSeasonProjection(
    teams: Array<{ id: string; abbr: string }>,
    schedule: Array<{
      week: number
      homeTeamId: string
      awayTeamId: string
      homeTeamAbbr: string
      awayTeamAbbr: string
    }>,
    teamRatings: Map<string, number>,
    usedTeams: Set<string>,
    currentWeek: number,
    poolSize: number
  ): SeasonProjection {
    const expectedPoolDuration = this.calculateExpectedPoolDuration(poolSize)
    const weeksToProject = Math.min(expectedPoolDuration - currentWeek + 2, 10)

    // Get critical weeks
    const criticalWeeks = this.identifyCriticalWeeks(
      schedule.filter((g) => g.week > currentWeek),
      teamRatings,
      weeksToProject
    )

    // Calculate future value for each available team
    const allTeamsMatchups = new Map<string, FutureMatchup[]>()
    const teamFutureValues: TeamFutureValue[] = []

    // First pass: collect all matchups
    teams.forEach((team) => {
      if (usedTeams.has(team.id)) return

      const matchups = this.projectTeamMatchups(
        team.id,
        team.abbr,
        schedule,
        teamRatings,
        currentWeek,
        weeksToProject
      )

      allTeamsMatchups.set(team.id, matchups)
    })

    // Second pass: calculate future values with context
    allTeamsMatchups.forEach((matchups, teamId) => {
      const team = teams.find((t) => t.id === teamId)
      if (!team) return

      const averageFavorability =
        matchups.length > 0
          ? matchups.reduce((sum, m) => sum + m.favorabilityScore, 0) /
            matchups.length
          : 50

      const bestWeeks = this.identifyBestWeeks(matchups, allTeamsMatchups)

      const hasEliteMatchup = matchups.some((m) => m.favorabilityScore >= 85)

      const futureValueRating = this.calculateFutureValueRating(
        averageFavorability,
        bestWeeks.length,
        hasEliteMatchup
      )

      // Determine save recommendation (will need current week data in practice)
      const saveRecommendation = this.determineSaveRecommendation(
        futureValueRating,
        bestWeeks.length,
        0.65, // Placeholder for current week win probability
        currentWeek - 1,
        expectedPoolDuration
      )

      teamFutureValues.push({
        teamId: team.id,
        teamAbbr: team.abbr,
        futureMatchups: matchups,
        averageFavorability,
        bestWeeks,
        futureValueRating,
        saveRecommendation,
      })
    })

    // Sort by future value rating
    teamFutureValues.sort((a, b) => b.futureValueRating - a.futureValueRating)

    return {
      expectedPoolDuration,
      criticalWeeks,
      teams: teamFutureValues,
    }
  }
}
