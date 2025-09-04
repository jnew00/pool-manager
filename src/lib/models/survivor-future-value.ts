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
   * Calculate future value rating (1-5 stars) based on comprehensive analysis
   */
  static calculateFutureValueRating(
    averageFavorability: number,
    bestWeeksCount: number,
    hasEliteMatchup: boolean,
    strengthOfSchedule?: number,
    homeGameAdvantage?: number,
    divisionalMatchupCount?: number
  ): number {
    let baseRating = 1
    let bonusPoints = 0

    // Base rating on average favorability (more granular)
    if (averageFavorability >= 75) baseRating = 5      // Excellent schedule
    else if (averageFavorability >= 68) baseRating = 4 // Very good schedule  
    else if (averageFavorability >= 62) baseRating = 3 // Good schedule
    else if (averageFavorability >= 55) baseRating = 2 // Average schedule
    else if (averageFavorability >= 48) baseRating = 1 // Below average
    else baseRating = 1 // Poor schedule

    // Bonus for multiple best weeks (premium save opportunities)
    if (bestWeeksCount >= 3) bonusPoints += 0.75
    else if (bestWeeksCount >= 2) bonusPoints += 0.5
    else if (bestWeeksCount >= 1) bonusPoints += 0.25

    // Bonus for elite matchup opportunities
    if (hasEliteMatchup) bonusPoints += 0.5

    // Strength of schedule bonus (easier future opponents = higher rating)
    if (strengthOfSchedule !== undefined) {
      if (strengthOfSchedule < 1450) bonusPoints += 0.5      // Very weak SOS
      else if (strengthOfSchedule < 1500) bonusPoints += 0.25 // Weak SOS  
      else if (strengthOfSchedule > 1600) bonusPoints -= 0.25 // Strong SOS
      else if (strengthOfSchedule > 1650) bonusPoints -= 0.5  // Very strong SOS
    }

    // Home game advantage (more home games = slightly better)
    if (homeGameAdvantage !== undefined && homeGameAdvantage > 0.6) {
      bonusPoints += 0.25
    }

    // Divisional matchup penalty (divisional games are less predictable)
    if (divisionalMatchupCount !== undefined && divisionalMatchupCount > 2) {
      bonusPoints -= 0.25
    }

    // Calculate final rating
    const finalRating = baseRating + bonusPoints

    // Cap between 1-5 and round to nearest 0.5
    return Math.max(1, Math.min(5, Math.round(finalRating * 2) / 2))
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
   * Calculate strength of schedule for a team's future matchups
   */
  static calculateStrengthOfSchedule(
    matchups: FutureMatchup[],
    teamRatings: Map<string, number>
  ): number {
    if (matchups.length === 0) return 1500 // Average

    const opponentRatings = matchups
      .map(m => teamRatings.get(m.opponentId) || 1500)
      .filter(rating => rating > 0)

    if (opponentRatings.length === 0) return 1500

    return opponentRatings.reduce((sum, rating) => sum + rating, 0) / opponentRatings.length
  }

  /**
   * Calculate home game advantage percentage
   */
  static calculateHomeGameAdvantage(matchups: FutureMatchup[]): number {
    if (matchups.length === 0) return 0.5

    const homeGames = matchups.filter(m => m.isHome).length
    return homeGames / matchups.length
  }

  /**
   * Count divisional matchups (requires division data)
   */
  static calculateDivisionalMatchups(
    teamAbbr: string,
    matchups: FutureMatchup[]
  ): number {
    // Define divisions
    const divisions = {
      'AFC East': ['BUF', 'MIA', 'NE', 'NYJ'],
      'AFC North': ['BAL', 'CIN', 'CLE', 'PIT'],
      'AFC South': ['HOU', 'IND', 'JAX', 'TEN'],
      'AFC West': ['DEN', 'KC', 'LAC', 'LVR'],
      'NFC East': ['DAL', 'NYG', 'PHI', 'WAS'],
      'NFC North': ['CHI', 'DET', 'GB', 'MIN'],
      'NFC South': ['ATL', 'CAR', 'NO', 'TB'],
      'NFC West': ['ARI', 'LAR', 'SF', 'SEA']
    }

    // Find team's division
    let teamDivision: string[] = []
    for (const [_, teams] of Object.entries(divisions)) {
      if (teams.includes(teamAbbr)) {
        teamDivision = teams
        break
      }
    }

    if (teamDivision.length === 0) return 0

    // Count divisional opponents (excluding the team itself)
    const divisionalOpponents = teamDivision.filter(t => t !== teamAbbr)
    return matchups.filter(m => divisionalOpponents.includes(m.opponentAbbr)).length
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

      // Calculate advanced metrics for comprehensive rating
      const strengthOfSchedule = this.calculateStrengthOfSchedule(matchups, teamRatings)
      const homeGameAdvantage = this.calculateHomeGameAdvantage(matchups)
      const divisionalMatchupCount = this.calculateDivisionalMatchups(team.abbr, matchups)

      const futureValueRating = this.calculateFutureValueRating(
        averageFavorability,
        bestWeeks.length,
        hasEliteMatchup,
        strengthOfSchedule,
        homeGameAdvantage,
        divisionalMatchupCount
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
