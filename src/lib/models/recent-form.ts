import { prisma } from '@/lib/prisma'

export interface TeamFormResult {
  teamId: string
  formScore: number
  gamesAnalyzed: number
  wins: number
  losses: number
  avgMarginOfVictory: number
  recentTrend: 'hot' | 'cold' | 'neutral'
}

export interface FormComparisonResult {
  homeTeamForm: TeamFormResult
  awayTeamForm: TeamFormResult
  formAdvantage: number
  homeTeamFavored: boolean
}

/**
 * Analyzes recent team form based on last N games
 */
export class RecentFormAnalyzer {
  /**
   * Analyze a team's recent form
   */
  async analyzeTeamForm(
    teamId: string,
    currentDate: Date,
    season: number,
    gamesToAnalyze: number = 4
  ): Promise<TeamFormResult> {
    // Get recent games for the team (completed games only)
    const recentGames = await prisma.game.findMany({
      where: {
        OR: [
          { homeTeamId: teamId },
          { awayTeamId: teamId }
        ],
        season,
        kickoff: {
          lt: currentDate
        },
        result: {
          status: 'FINAL'
        }
      },
      include: {
        result: true,
        homeTeam: { select: { id: true } },
        awayTeam: { select: { id: true } }
      },
      orderBy: {
        kickoff: 'desc'
      },
      take: gamesToAnalyze
    })

    if (recentGames.length === 0) {
      return {
        teamId,
        formScore: 0,
        gamesAnalyzed: 0,
        wins: 0,
        losses: 0,
        avgMarginOfVictory: 0,
        recentTrend: 'neutral'
      }
    }

    let wins = 0
    let losses = 0
    let totalMargin = 0

    for (const game of recentGames) {
      if (!game.result) continue

      const isHomeTeam = game.homeTeamId === teamId
      const teamScore = isHomeTeam ? game.result.homeScore : game.result.awayScore
      const opponentScore = isHomeTeam ? game.result.awayScore : game.result.homeScore

      if (teamScore === null || opponentScore === null) continue

      const margin = teamScore - opponentScore
      totalMargin += margin

      if (margin > 0) {
        wins++
      } else {
        losses++
      }
    }

    const gamesAnalyzed = wins + losses
    const winPercentage = gamesAnalyzed > 0 ? wins / gamesAnalyzed : 0
    const avgMarginOfVictory = gamesAnalyzed > 0 ? totalMargin / gamesAnalyzed : 0

    // Calculate form score (-100 to +100)
    const formScore = this.calculateFormScore(winPercentage, avgMarginOfVictory, gamesAnalyzed)

    // Determine trend
    const recentTrend = this.determineRecentTrend(winPercentage, avgMarginOfVictory)

    return {
      teamId,
      formScore,
      gamesAnalyzed,
      wins,
      losses,
      avgMarginOfVictory,
      recentTrend
    }
  }

  /**
   * Calculate comparison between two teams' recent form
   */
  async calculateFormComparison(
    homeTeamId: string,
    awayTeamId: string,
    currentDate: Date,
    season: number,
    gamesToAnalyze: number = 4
  ): Promise<FormComparisonResult> {
    const [homeTeamForm, awayTeamForm] = await Promise.all([
      this.analyzeTeamForm(homeTeamId, currentDate, season, gamesToAnalyze),
      this.analyzeTeamForm(awayTeamId, currentDate, season, gamesToAnalyze)
    ])

    const formAdvantage = homeTeamForm.formScore - awayTeamForm.formScore
    const homeTeamFavored = formAdvantage > 0

    return {
      homeTeamForm,
      awayTeamForm,
      formAdvantage,
      homeTeamFavored
    }
  }

  /**
   * Calculate form score based on win percentage and margin of victory
   */
  private calculateFormScore(
    winPercentage: number,
    avgMarginOfVictory: number,
    gamesAnalyzed: number
  ): number {
    if (gamesAnalyzed === 0) return 0

    // Base score from win percentage (-50 to +50)
    const winScore = (winPercentage - 0.5) * 100

    // Margin adjustment (-25 to +25, capped to prevent extreme values)
    const marginAdjustment = Math.max(-25, Math.min(25, avgMarginOfVictory * 2))

    // Confidence reduction for small sample sizes
    const confidenceMultiplier = Math.min(1, gamesAnalyzed / 4)

    return (winScore + marginAdjustment) * confidenceMultiplier
  }

  /**
   * Determine recent trend category
   */
  private determineRecentTrend(winPercentage: number, avgMarginOfVictory: number): 'hot' | 'cold' | 'neutral' {
    if (winPercentage > 0.6 && avgMarginOfVictory > 3) {
      return 'hot'
    } else if (winPercentage < 0.4 && avgMarginOfVictory < -3) {
      return 'cold'
    } else {
      return 'neutral'
    }
  }
}