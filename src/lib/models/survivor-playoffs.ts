/**
 * Survivor Pool Playoff Continuation Logic
 *
 * Handles the transition from regular season to playoffs,
 * including team reset options and wildcard rounds.
 */

import { prisma } from '@/lib/prisma'

export interface PlayoffConfiguration {
  enabled: boolean
  resetTeams: boolean // Allow reusing teams in playoffs
  wildcardWeekStart: number // Usually week 18
  playoffWeekStart: number // Usually week 19
  superBowlWeek: number // Usually week 22
  requirePlayoffTeam: boolean // Only allow picking playoff teams
}

export interface PlayoffTeam {
  teamId: string
  teamAbbr: string
  seed: number
  conference: 'AFC' | 'NFC'
  record: {
    wins: number
    losses: number
    ties: number
  }
  divisionWinner: boolean
  wildcard: boolean
}

export class SurvivorPlayoffManager {
  private config: PlayoffConfiguration

  constructor(config: PlayoffConfiguration) {
    this.config = config
  }

  /**
   * Check if we're in playoff weeks
   */
  isPlayoffWeek(week: number): boolean {
    return this.config.enabled && week >= this.config.playoffWeekStart
  }

  /**
   * Check if we're in wildcard week
   */
  isWildcardWeek(week: number): boolean {
    return this.config.enabled && week === this.config.wildcardWeekStart
  }

  /**
   * Get playoff teams based on current standings
   */
  async getPlayoffTeams(): Promise<PlayoffTeam[]> {
    const teams = await prisma.team.findMany({
      include: {
        homeGames: {
          where: {
            week: { lte: 18 },
            homeScore: { not: null },
          },
        },
        awayGames: {
          where: {
            week: { lte: 18 },
            awayScore: { not: null },
          },
        },
      },
    })

    // Calculate records for each team
    const teamRecords = teams.map((team) => {
      let wins = 0
      let losses = 0
      let ties = 0

      // Count home games
      team.homeGames.forEach((game) => {
        if (game.homeScore! > game.awayScore!) wins++
        else if (game.homeScore! < game.awayScore!) losses++
        else ties++
      })

      // Count away games
      team.awayGames.forEach((game) => {
        if (game.awayScore! > game.homeScore!) wins++
        else if (game.awayScore! < game.homeScore!) losses++
        else ties++
      })

      const winPct = (wins + ties * 0.5) / (wins + losses + ties)

      return {
        teamId: team.id,
        teamAbbr: team.abbreviation,
        teamName: team.name,
        conference: team.conference as 'AFC' | 'NFC',
        division: team.division,
        wins,
        losses,
        ties,
        winPct,
      }
    })

    // Sort by conference and win percentage
    const afcTeams = teamRecords
      .filter((t) => t.conference === 'AFC')
      .sort((a, b) => b.winPct - a.winPct)

    const nfcTeams = teamRecords
      .filter((t) => t.conference === 'NFC')
      .sort((a, b) => b.winPct - a.winPct)

    // Get division winners (top 4 from each conference)
    const afcDivisionWinners = this.getDivisionWinners(afcTeams)
    const nfcDivisionWinners = this.getDivisionWinners(nfcTeams)

    // Get wildcards (next 3 best teams)
    const afcWildcards = afcTeams
      .filter((t) => !afcDivisionWinners.includes(t))
      .slice(0, 3)

    const nfcWildcards = nfcTeams
      .filter((t) => !nfcDivisionWinners.includes(t))
      .slice(0, 3)

    // Combine and assign seeds
    const playoffTeams: PlayoffTeam[] = []

    // AFC seeding
    const afcPlayoffTeams = [...afcDivisionWinners, ...afcWildcards]
    afcPlayoffTeams
      .sort((a, b) => b.winPct - a.winPct)
      .forEach((team, index) => {
        playoffTeams.push({
          teamId: team.teamId,
          teamAbbr: team.teamAbbr,
          seed: index + 1,
          conference: 'AFC',
          record: {
            wins: team.wins,
            losses: team.losses,
            ties: team.ties,
          },
          divisionWinner: afcDivisionWinners.includes(team),
          wildcard: afcWildcards.includes(team),
        })
      })

    // NFC seeding
    const nfcPlayoffTeams = [...nfcDivisionWinners, ...nfcWildcards]
    nfcPlayoffTeams
      .sort((a, b) => b.winPct - a.winPct)
      .forEach((team, index) => {
        playoffTeams.push({
          teamId: team.teamId,
          teamAbbr: team.teamAbbr,
          seed: index + 1,
          conference: 'NFC',
          record: {
            wins: team.wins,
            losses: team.losses,
            ties: team.ties,
          },
          divisionWinner: nfcDivisionWinners.includes(team),
          wildcard: nfcWildcards.includes(team),
        })
      })

    return playoffTeams
  }

  /**
   * Get division winners from conference teams
   */
  private getDivisionWinners(conferenceTeams: any[]): any[] {
    const divisions = ['North', 'South', 'East', 'West']
    const winners = []

    for (const division of divisions) {
      const divisionTeams = conferenceTeams.filter((t) =>
        t.division?.includes(division)
      )
      if (divisionTeams.length > 0) {
        winners.push(divisionTeams[0]) // Best record in division
      }
    }

    return winners
  }

  /**
   * Validate playoff pick
   */
  async validatePlayoffPick(
    entryId: string,
    teamId: string,
    week: number
  ): Promise<{ valid: boolean; reason?: string }> {
    // Check if it's a playoff week
    if (!this.isPlayoffWeek(week)) {
      return { valid: true } // Regular season rules apply
    }

    // Get entry's used teams
    const entry = await prisma.survivorEntry.findUnique({
      where: { id: entryId },
      include: {
        picks: {
          where: {
            result: { in: ['WIN', 'PENDING'] },
          },
          select: { teamId: true, week: true },
        },
      },
    })

    if (!entry) {
      return { valid: false, reason: 'Entry not found' }
    }

    // Check if teams can be reused in playoffs
    if (!this.config.resetTeams) {
      const hasUsedTeam = entry.picks.some((p) => p.teamId === teamId)
      if (hasUsedTeam) {
        return { valid: false, reason: 'Team already used (no playoff reset)' }
      }
    } else {
      // Teams reset for playoffs, but can't reuse within playoffs
      const playoffPicks = entry.picks.filter(
        (p) => p.week >= this.config.playoffWeekStart
      )
      const hasUsedInPlayoffs = playoffPicks.some((p) => p.teamId === teamId)
      if (hasUsedInPlayoffs) {
        return { valid: false, reason: 'Team already used in playoffs' }
      }
    }

    // Check if team is in playoffs (if required)
    if (this.config.requirePlayoffTeam) {
      const playoffTeams = await this.getPlayoffTeams()
      const isPlayoffTeam = playoffTeams.some((t) => t.teamId === teamId)

      if (!isPlayoffTeam) {
        return { valid: false, reason: 'Team not in playoffs' }
      }

      // Check if team is still alive in playoffs
      const isTeamAlive = await this.isTeamAliveInPlayoffs(teamId, week)
      if (!isTeamAlive) {
        return { valid: false, reason: 'Team eliminated from playoffs' }
      }
    }

    return { valid: true }
  }

  /**
   * Check if team is still alive in playoffs
   */
  async isTeamAliveInPlayoffs(
    teamId: string,
    currentWeek: number
  ): Promise<boolean> {
    // Get playoff games for this team
    const playoffGames = await prisma.game.findMany({
      where: {
        week: {
          gte: this.config.playoffWeekStart,
          lt: currentWeek,
        },
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        homeScore: { not: null }, // Game has been played
        awayScore: { not: null },
      },
    })

    // Check if team lost any playoff game
    for (const game of playoffGames) {
      const isHome = game.homeTeamId === teamId
      const teamScore = isHome ? game.homeScore : game.awayScore
      const oppScore = isHome ? game.awayScore : game.homeScore

      if (teamScore! < oppScore!) {
        return false // Team lost and is eliminated
      }
    }

    return true // Team hasn't lost yet
  }

  /**
   * Get available teams for playoff week
   */
  async getAvailablePlayoffTeams(
    entryId: string,
    week: number
  ): Promise<
    Array<{
      teamId: string
      teamAbbr: string
      seed: number
      conference: string
    }>
  > {
    const playoffTeams = await this.getPlayoffTeams()
    const availableTeams = []

    for (const team of playoffTeams) {
      const validation = await this.validatePlayoffPick(
        entryId,
        team.teamId,
        week
      )
      if (validation.valid) {
        const isAlive = await this.isTeamAliveInPlayoffs(team.teamId, week)
        if (isAlive) {
          availableTeams.push({
            teamId: team.teamId,
            teamAbbr: team.teamAbbr,
            seed: team.seed,
            conference: team.conference,
          })
        }
      }
    }

    return availableTeams
  }

  /**
   * Generate playoff bracket matchups
   */
  async getPlayoffBracket(week: number): Promise<
    Array<{
      round: string
      matchups: Array<{
        home: { teamAbbr: string; seed: number }
        away: { teamAbbr: string; seed: number }
        conference: string
      }>
    }>
  > {
    const playoffTeams = await this.getPlayoffTeams()
    const afcTeams = playoffTeams.filter((t) => t.conference === 'AFC')
    const nfcTeams = playoffTeams.filter((t) => t.conference === 'NFC')

    if (week === this.config.wildcardWeekStart) {
      // Wild Card Round
      return [
        {
          round: 'Wild Card',
          matchups: [
            // AFC Wild Card Games
            {
              home: afcTeams.find((t) => t.seed === 3)!,
              away: afcTeams.find((t) => t.seed === 6)!,
              conference: 'AFC',
            },
            {
              home: afcTeams.find((t) => t.seed === 4)!,
              away: afcTeams.find((t) => t.seed === 5)!,
              conference: 'AFC',
            },
            {
              home: afcTeams.find((t) => t.seed === 2)!,
              away: afcTeams.find((t) => t.seed === 7)!,
              conference: 'AFC',
            },
            // NFC Wild Card Games
            {
              home: nfcTeams.find((t) => t.seed === 3)!,
              away: nfcTeams.find((t) => t.seed === 6)!,
              conference: 'NFC',
            },
            {
              home: nfcTeams.find((t) => t.seed === 4)!,
              away: nfcTeams.find((t) => t.seed === 5)!,
              conference: 'NFC',
            },
            {
              home: nfcTeams.find((t) => t.seed === 2)!,
              away: nfcTeams.find((t) => t.seed === 7)!,
              conference: 'NFC',
            },
          ],
        },
      ]
    }

    // Additional rounds would be calculated based on results
    // This is simplified for demonstration
    return []
  }

  /**
   * Calculate survival probability for playoff weeks
   */
  async calculatePlayoffSurvivalProbability(
    entryId: string,
    fromWeek: number
  ): Promise<number> {
    if (fromWeek < this.config.playoffWeekStart) {
      // Still in regular season
      const weeksToPlayoffs = this.config.playoffWeekStart - fromWeek
      const regularSeasonSurvival = Math.pow(0.75, weeksToPlayoffs) // 75% per week baseline
      const playoffSurvival = Math.pow(0.5, 4) // 50% per playoff week (4 rounds)
      return regularSeasonSurvival * playoffSurvival
    }

    // In playoffs
    const playoffWeeksRemaining = this.config.superBowlWeek - fromWeek + 1
    return Math.pow(0.5, playoffWeeksRemaining) // 50% survival per playoff week
  }

  /**
   * Get playoff-specific recommendations
   */
  async getPlayoffRecommendations(
    entryId: string,
    week: number
  ): Promise<
    Array<{
      teamId: string
      teamAbbr: string
      recommendation: string
      confidence: number
    }>
  > {
    const availableTeams = await this.getAvailablePlayoffTeams(entryId, week)
    const recommendations = []

    for (const team of availableTeams) {
      let confidence = 0.5 // Base confidence
      let recommendation = ''

      // Higher seeds get higher confidence
      if (team.seed <= 2) {
        confidence += 0.2
        recommendation = 'Top seed with home field advantage'
      } else if (team.seed <= 4) {
        confidence += 0.1
        recommendation = 'Division winner with playoff experience'
      } else {
        recommendation = 'Wild card team - higher risk, higher reward'
      }

      // Adjust for conference strength (mock)
      if (team.conference === 'AFC') {
        confidence += 0.05
        recommendation += ' (stronger conference)'
      }

      recommendations.push({
        teamId: team.teamId,
        teamAbbr: team.teamAbbr,
        recommendation,
        confidence: Math.min(confidence, 0.9), // Cap at 90%
      })
    }

    // Sort by confidence
    recommendations.sort((a, b) => b.confidence - a.confidence)

    return recommendations
  }

  /**
   * Handle Super Bowl special case
   */
  async getSuperBowlPicks(entryId: string): Promise<{
    afc: { teamId: string; teamAbbr: string }
    nfc: { teamId: string; teamAbbr: string }
    recommended: string
  } | null> {
    const superBowlWeek = this.config.superBowlWeek

    // Get conference championship winners (simplified)
    const games = await prisma.game.findMany({
      where: {
        week: superBowlWeek - 1,
        homeScore: { not: null },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })

    const afcWinner = games.find(
      (g) => g.homeTeam.conference === 'AFC' || g.awayTeam.conference === 'AFC'
    )
    const nfcWinner = games.find(
      (g) => g.homeTeam.conference === 'NFC' || g.awayTeam.conference === 'NFC'
    )

    if (!afcWinner || !nfcWinner) {
      return null
    }

    // Determine winners (simplified)
    const afcTeam =
      afcWinner.homeScore! > afcWinner.awayScore!
        ? afcWinner.homeTeam
        : afcWinner.awayTeam

    const nfcTeam =
      nfcWinner.homeScore! > nfcWinner.awayScore!
        ? nfcWinner.homeTeam
        : nfcWinner.awayTeam

    // Check which team can be picked
    const afcValidation = await this.validatePlayoffPick(
      entryId,
      afcTeam.id,
      superBowlWeek
    )
    const nfcValidation = await this.validatePlayoffPick(
      entryId,
      nfcTeam.id,
      superBowlWeek
    )

    let recommended = 'Both teams available'
    if (!afcValidation.valid && nfcValidation.valid) {
      recommended = `Must pick ${nfcTeam.abbreviation} (${afcValidation.reason})`
    } else if (afcValidation.valid && !nfcValidation.valid) {
      recommended = `Must pick ${afcTeam.abbreviation} (${nfcValidation.reason})`
    } else if (!afcValidation.valid && !nfcValidation.valid) {
      recommended = 'No valid picks available'
    }

    return {
      afc: { teamId: afcTeam.id, teamAbbr: afcTeam.abbreviation },
      nfc: { teamId: nfcTeam.id, teamAbbr: nfcTeam.abbreviation },
      recommended,
    }
  }
}
