import { prisma } from '@/lib/prisma'
import { BaseService } from './base.service'
import { NotFoundError, ValidationError } from '@/lib/types/database'
import type { Grade, PickOutcome, PoolType } from '@/lib/types/database'

export class GradingService extends BaseService {
  /**
   * Grade all picks for a specific game based on the game result
   */
  async gradePicksForGame(gameId: string): Promise<Grade[]> {
    this.validateRequired(gameId, 'Game ID')

    // Get game result
    const result = await prisma.result.findUnique({
      where: { gameId },
      include: {
        game: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    })

    if (!result) {
      throw new NotFoundError('Game result not found')
    }

    // Get all picks for this game
    const picks = await prisma.pick.findMany({
      where: { gameId },
      include: {
        entry: {
          include: {
            pool: true,
          },
        },
        team: true,
      },
    })

    if (picks.length === 0) {
      return []
    }

    const grades: Grade[] = []

    for (const pick of picks) {
      const gradingResult = this.calculatePickGrade(pick, result)

      // Upsert grade (create or update)
      const grade = await prisma.grade.upsert({
        where: { pickId: pick.id },
        update: {
          outcome: gradingResult.outcome,
          points: gradingResult.points,
          details: gradingResult.details || {},
        },
        create: {
          pickId: pick.id,
          outcome: gradingResult.outcome,
          points: gradingResult.points,
          details: gradingResult.details || {},
        },
      })

      grades.push(grade)
    }

    return grades
  }

  /**
   * Calculate the grade for a single pick based on game result
   */
  private calculatePickGrade(
    pick: any,
    result: any
  ): {
    outcome: PickOutcome
    points: number
    details?: Record<string, any>
  } {
    const poolType: PoolType = pick.entry.pool.type
    const game = result.game

    // Handle cancelled games
    if (result.status === 'CANCELLED') {
      return {
        outcome: 'VOID',
        points: 0.0,
        details: { reason: 'Game cancelled' },
      }
    }

    // Handle games without final scores
    if (result.homeScore === null || result.awayScore === null) {
      return {
        outcome: 'VOID',
        points: 0.0,
        details: { reason: 'No final score available' },
      }
    }

    const homeScore = result.homeScore
    const awayScore = result.awayScore
    const pickedTeamId = pick.teamId

    // Determine if picked team won, lost, or tied
    let didWin: boolean | null = null

    if (pickedTeamId === game.homeTeamId) {
      // Picked home team
      if (homeScore > awayScore) {
        didWin = true
      } else if (homeScore < awayScore) {
        didWin = false
      } else {
        didWin = null // tie
      }
    } else if (pickedTeamId === game.awayTeamId) {
      // Picked away team
      if (awayScore > homeScore) {
        didWin = true
      } else if (awayScore < homeScore) {
        didWin = false
      } else {
        didWin = null // tie
      }
    } else {
      throw new ValidationError('Pick team does not match game teams', 'teamId')
    }

    // Handle ties first
    if (didWin === null) {
      return {
        outcome: 'PUSH',
        points: 0.5,
      }
    }

    // Handle wins and losses
    if (didWin) {
      const points = this.calculateWinPoints(poolType, pick.confidence)
      return {
        outcome: 'WIN',
        points,
        details: { confidenceUsed: pick.confidence },
      }
    } else {
      return {
        outcome: 'LOSS',
        points: 0.0,
      }
    }
  }

  /**
   * Calculate points awarded for a win based on pool type
   */
  private calculateWinPoints(poolType: PoolType, confidence: number): number {
    switch (poolType) {
      case 'ATS':
      case 'SU':
      case 'SURVIVOR':
        return 1.0 // Standard point for these pool types

      case 'POINTS_PLUS':
        // Confidence-based scoring: confidence% / 50
        // 50% confidence = 1.0 point, 100% confidence = 2.0 points
        return confidence / 50.0

      default:
        return 1.0
    }
  }
}
