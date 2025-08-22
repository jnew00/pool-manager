/**
 * Revenge Game Detection System
 * Identifies when teams have played earlier in the season and applies motivation factors
 */

import { prisma } from '@/lib/prisma'

export interface RevengeGameResult {
  isRevengeGame: boolean
  previousMeetings: PreviousMeeting[]
  revengeMotivation: number // Points adjustment for motivated team
  revengeTeamId?: string // Which team has revenge motivation
}

export interface PreviousMeeting {
  gameDate: Date
  homeTeamId: string
  awayTeamId: string
  homeScore: number
  awayScore: number
  winnerId: string
  losingMargin: number
  wasBlowout: boolean
  wasUpsetWin: boolean
}

export const REVENGE_FACTORS = {
  BASE_REVENGE_BONUS: 2.0, // Base points for revenge motivation
  BLOWOUT_REVENGE_BONUS: 1.5, // Additional bonus if previous loss was a blowout (14+ points)
  UPSET_REVENGE_BONUS: 1.0, // Additional bonus if underdog lost as favorite
  RECENT_REVENGE_MULTIPLIER: 1.3, // Multiplier if meeting was within last 6 weeks
  PLAYOFF_REVENGE_MULTIPLIER: 1.5, // Multiplier if previous meeting eliminated team from playoffs
  MAX_REVENGE_BONUS: 6.0, // Maximum total revenge bonus points
} as const

/**
 * Analyzes revenge game potential between two teams
 */
export async function analyzeRevengeGame(
  homeTeamId: string,
  awayTeamId: string,
  currentGameDate: Date,
  currentSeason: number = new Date().getFullYear()
): Promise<RevengeGameResult> {
  try {
    // Look for previous meetings this season
    const previousMeetings = await findPreviousMeetings(
      homeTeamId,
      awayTeamId,
      currentGameDate,
      currentSeason
    )

    if (previousMeetings.length === 0) {
      return {
        isRevengeGame: false,
        previousMeetings: [],
        revengeMotivation: 0,
      }
    }

    // Calculate revenge motivation
    const revengeAnalysis = calculateRevengeMotivation(
      previousMeetings,
      homeTeamId,
      awayTeamId,
      currentGameDate
    )

    return {
      isRevengeGame: true,
      previousMeetings,
      revengeMotivation: revengeAnalysis.motivation,
      revengeTeamId: revengeAnalysis.revengeTeamId,
    }
  } catch (error) {
    console.error('Error analyzing revenge game:', error)
    return {
      isRevengeGame: false,
      previousMeetings: [],
      revengeMotivation: 0,
    }
  }
}

/**
 * Find previous meetings between teams this season
 */
async function findPreviousMeetings(
  homeTeamId: string,
  awayTeamId: string,
  currentGameDate: Date,
  currentSeason: number
): Promise<PreviousMeeting[]> {
  // Get season start date (approximate - NFL season usually starts in September)
  const seasonStart = new Date(currentSeason, 8, 1) // September 1st

  const games = await prisma.game.findMany({
    where: {
      AND: [
        {
          OR: [
            { homeTeamId, awayTeamId },
            { homeTeamId: awayTeamId, awayTeamId: homeTeamId },
          ],
        },
        { kickoff: { gte: seasonStart } },
        { kickoff: { lt: currentGameDate } },
        { status: 'FINAL' }, // Changed from 'COMPLETED' to 'FINAL'
        {
          result: {
            AND: [{ homeScore: { not: null } }, { awayScore: { not: null } }],
          },
        },
      ],
    },
    include: {
      homeTeam: { select: { id: true, name: true, nflAbbr: true } },
      awayTeam: { select: { id: true, name: true, nflAbbr: true } },
      result: { select: { homeScore: true, awayScore: true } },
    },
    orderBy: { kickoff: 'desc' },
  })

  return games.map((game) => {
    const homeScore = game.result?.homeScore || 0
    const awayScore = game.result?.awayScore || 0
    const winnerId = homeScore > awayScore ? game.homeTeamId : game.awayTeamId
    const losingMargin = Math.abs(homeScore - awayScore)
    const wasBlowout = losingMargin >= 14

    // Determine if it was an upset (would need spread data for accurate calculation)
    // For now, assume home team was favored by 3 points
    const wasUpsetWin =
      (game.awayTeamId === winnerId && losingMargin > 3) ||
      (game.homeTeamId === winnerId && losingMargin < 10)

    return {
      gameDate: game.kickoff,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      homeScore,
      awayScore,
      winnerId,
      losingMargin,
      wasBlowout,
      wasUpsetWin,
    }
  })
}

/**
 * Calculate revenge motivation based on previous meetings
 */
function calculateRevengeMotivation(
  previousMeetings: PreviousMeeting[],
  currentHomeTeamId: string,
  currentAwayTeamId: string,
  currentGameDate: Date
): { motivation: number; revengeTeamId?: string } {
  if (previousMeetings.length === 0) {
    return { motivation: 0 }
  }

  // Focus on most recent meeting for revenge motivation
  const mostRecentGame = previousMeetings[0]
  const losingTeamId =
    mostRecentGame.winnerId === mostRecentGame.homeTeamId
      ? mostRecentGame.awayTeamId
      : mostRecentGame.homeTeamId

  // Check if losing team is playing in current game
  const revengeTeamId = [currentHomeTeamId, currentAwayTeamId].find(
    (teamId) => teamId === losingTeamId
  )

  if (!revengeTeamId) {
    return { motivation: 0 }
  }

  let revengeBonus = REVENGE_FACTORS.BASE_REVENGE_BONUS

  // Add blowout bonus
  if (mostRecentGame.wasBlowout) {
    revengeBonus += REVENGE_FACTORS.BLOWOUT_REVENGE_BONUS
  }

  // Add upset bonus
  if (mostRecentGame.wasUpsetWin) {
    revengeBonus += REVENGE_FACTORS.UPSET_REVENGE_BONUS
  }

  // Apply recent game multiplier (within 6 weeks)
  const daysSinceLastMeeting = Math.floor(
    (currentGameDate.getTime() - mostRecentGame.gameDate.getTime()) /
      (1000 * 60 * 60 * 24)
  )

  if (daysSinceLastMeeting <= 42) {
    // 6 weeks
    revengeBonus *= REVENGE_FACTORS.RECENT_REVENGE_MULTIPLIER
  }

  // Apply playoff implications multiplier (late season games)
  const isLateSeasonGame = currentGameDate.getMonth() >= 11 // December or later
  if (isLateSeasonGame && mostRecentGame.losingMargin >= 7) {
    revengeBonus *= REVENGE_FACTORS.PLAYOFF_REVENGE_MULTIPLIER
  }

  // Cap the revenge bonus
  const finalRevengeBonus = Math.min(
    revengeBonus,
    REVENGE_FACTORS.MAX_REVENGE_BONUS
  )

  console.log(
    `[Revenge Game] ${revengeTeamId} seeking revenge after ${mostRecentGame.losingMargin}-point loss ` +
      `${daysSinceLastMeeting} days ago. Bonus: ${finalRevengeBonus} points`
  )

  return {
    motivation: finalRevengeBonus,
    revengeTeamId,
  }
}

/**
 * Get revenge game summary for UI display
 */
export function getRevengeGameSummary(result: RevengeGameResult): string {
  if (!result.isRevengeGame || result.previousMeetings.length === 0) {
    return 'No revenge motivation'
  }

  const meeting = result.previousMeetings[0]
  const losingTeam = meeting.winnerId === meeting.homeTeamId ? 'away' : 'home'
  const margin = meeting.losingMargin

  let summary = `Revenge game - ${losingTeam} team lost by ${margin} points`

  if (meeting.wasBlowout) {
    summary += ' (blowout)'
  }

  if (meeting.wasUpsetWin) {
    summary += ' (upset)'
  }

  summary += ` (+${result.revengeMotivation.toFixed(1)} pts motivation)`

  return summary
}
