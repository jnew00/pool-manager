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
      const gradingResult = await this.calculatePickGrade(pick, result)

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
  private async calculatePickGrade(
    pick: any,
    result: any
  ): Promise<{
    outcome: PickOutcome
    points: number
    details?: Record<string, any>
  }> {
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

    // Check if this is an over/under pick
    if (pick.overUnderPick) {
      return this.calculateOverUnderGrade(
        pick.overUnderPick,
        homeScore,
        awayScore,
        game,
        poolType,
        pick.confidence
      )
    }

    const pickedTeamId = pick.teamId

    // Validate team-based pick
    if (!pickedTeamId) {
      throw new ValidationError('Pick must have either teamId or overUnderPick', 'pick')
    }

    // Determine if picked team won, lost, or tied
    let didWin: boolean | null = null
    let pickedTeamScore = 0
    let opponentScore = 0

    if (pickedTeamId === game.homeTeamId) {
      // Picked home team
      pickedTeamScore = homeScore
      opponentScore = awayScore
      if (homeScore > awayScore) {
        didWin = true
      } else if (homeScore < awayScore) {
        didWin = false
      } else {
        didWin = null // tie
      }
    } else if (pickedTeamId === game.awayTeamId) {
      // Picked away team
      pickedTeamScore = awayScore
      opponentScore = homeScore
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

    // Points Plus uses margin-based scoring
    if (poolType === 'POINTS_PLUS') {
      return this.calculatePointsPlusGrade(
        didWin,
        pickedTeamScore,
        opponentScore,
        homeScore,
        awayScore
      )
    }

    // Handle ties first for other pool types
    if (didWin === null) {
      return {
        outcome: 'PUSH',
        points: 0.5,
      }
    }

    // Handle wins and losses for other pool types
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
   * Calculate over/under pick grading
   */
  private async calculateOverUnderGrade(
    overUnderPick: 'OVER' | 'UNDER',
    homeScore: number,
    awayScore: number,
    game: any,
    poolType: PoolType,
    confidence: number
  ): Promise<{
    outcome: PickOutcome
    points: number
    details?: Record<string, any>
  }> {
    // Get the line for this game to find the total
    const line = await prisma.line.findFirst({
      where: {
        gameId: game.id,
        total: { not: null }
      },
      orderBy: { capturedAt: 'desc' }
    })

    if (!line || !line.total) {
      return {
        outcome: 'VOID',
        points: 0.0,
        details: { reason: 'No total line available' },
      }
    }

    const totalScore = homeScore + awayScore
    const lineTotal = Number(line.total)

    let didWin: boolean | null = null

    if (totalScore > lineTotal) {
      // Actual score went over
      didWin = overUnderPick === 'OVER'
    } else if (totalScore < lineTotal) {
      // Actual score went under
      didWin = overUnderPick === 'UNDER'
    } else {
      // Push - exact total
      didWin = null
    }

    // Handle push
    if (didWin === null) {
      return {
        outcome: 'PUSH',
        points: 0.5,
        details: {
          totalScore,
          lineTotal,
          homeScore,
          awayScore,
        },
      }
    }

    // Handle win/loss
    if (didWin) {
      const points = this.calculateWinPoints(poolType, confidence)
      return {
        outcome: 'WIN',
        points,
        details: {
          totalScore,
          lineTotal,
          homeScore,
          awayScore,
          overUnderPick,
          confidenceUsed: confidence,
        },
      }
    } else {
      return {
        outcome: 'LOSS',
        points: 0.0,
        details: {
          totalScore,
          lineTotal,
          homeScore,
          awayScore,
          overUnderPick,
        },
      }
    }
  }

  /**
   * Calculate Points Plus grading based on margin of victory/defeat
   */
  private calculatePointsPlusGrade(
    didWin: boolean | null,
    pickedTeamScore: number,
    opponentScore: number,
    homeScore: number,
    awayScore: number
  ): {
    outcome: PickOutcome
    points: number
    details?: Record<string, any>
  } {
    // Handle ties - 0 points for Points Plus
    if (didWin === null) {
      return {
        outcome: 'PUSH',
        points: 0,
        details: {
          homeScore,
          awayScore,
          tie: true,
        },
      }
    }

    const margin = Math.abs(pickedTeamScore - opponentScore)

    if (didWin) {
      // Win: add margin of victory
      return {
        outcome: 'WIN',
        points: margin,
        details: {
          marginOfVictory: margin,
          homeScore,
          awayScore,
        },
      }
    } else {
      // Loss: subtract margin of defeat
      return {
        outcome: 'LOSS',
        points: -margin,
        details: {
          marginOfDefeat: margin,
          homeScore,
          awayScore,
        },
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
        // This should not be called for Points Plus - use calculatePointsPlusGrade instead
        return confidence / 50.0

      default:
        return 1.0
    }
  }
}
