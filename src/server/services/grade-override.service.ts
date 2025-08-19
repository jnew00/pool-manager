import { prisma } from '@/lib/prisma'
import { BaseService } from './base.service'
import { NotFoundError, ValidationError } from '@/lib/types/database'
import type { Grade, PickOutcome, GradeOverride } from '@/lib/types/database'

export interface OverrideStats {
  totalOverrides: number
  gamesWithOverrides: number
  overridesByOutcome: Record<PickOutcome, number>
}

export class GradeOverrideService extends BaseService {
  /**
   * Override a specific pick's grade with manual intervention
   */
  async overrideGrade(
    pickId: string,
    newOutcome: PickOutcome,
    newPoints: number,
    reason: string,
    overriddenBy?: string
  ): Promise<Grade> {
    this.validateRequired(pickId, 'Pick ID')
    this.validateRequired(newOutcome, 'New outcome')
    this.validateRequired(newPoints, 'New points')
    this.validateOverrideReason(reason)

    // Get current grade
    const currentGrade = await prisma.grade.findUnique({
      where: { pickId },
    })

    if (!currentGrade) {
      throw new NotFoundError('Grade not found for this pick')
    }

    // Record the override in history
    await prisma.gradeOverride.create({
      data: {
        pickId,
        originalOutcome: currentGrade.outcome,
        originalPoints: currentGrade.points,
        newOutcome,
        newPoints,
        reason,
        overriddenBy,
      },
    })

    // Update the grade with override details
    const updatedGrade = await prisma.grade.update({
      where: { pickId },
      data: {
        outcome: newOutcome,
        points: newPoints,
        details: {
          ...((currentGrade.details as object) || {}),
          isManualOverride: true,
          overrideReason: reason,
          originalOutcome: currentGrade.outcome,
          originalPoints: Number(currentGrade.points),
          overriddenAt: new Date().toISOString(),
          overriddenBy,
        },
      },
    })

    return updatedGrade
  }

  /**
   * Bulk override all picks for a specific game
   */
  async bulkOverrideGamePicks(
    gameId: string,
    newOutcome: PickOutcome,
    newPoints: number,
    reason: string,
    overriddenBy?: string
  ): Promise<Grade[]> {
    this.validateRequired(gameId, 'Game ID')
    this.validateOverrideReason(reason)

    // Get all picks for this game that have grades
    const picks = await prisma.pick.findMany({
      where: {
        gameId,
        grade: {
          isNot: null,
        },
      },
      include: { grade: true },
    })

    if (picks.length === 0) {
      return []
    }

    const updatedGrades: Grade[] = []

    // Process each pick in a transaction
    await prisma.$transaction(async (tx) => {
      for (const pick of picks) {
        if (!pick.grade) continue

        // Record override history
        await tx.gradeOverride.create({
          data: {
            pickId: pick.id,
            originalOutcome: pick.grade.outcome,
            originalPoints: pick.grade.points,
            newOutcome,
            newPoints,
            reason,
            overriddenBy,
          },
        })

        // Update grade
        const updatedGrade = await tx.grade.update({
          where: { pickId: pick.id },
          data: {
            outcome: newOutcome,
            points: newPoints,
            details: {
              ...((pick.grade.details as object) || {}),
              isManualOverride: true,
              overrideReason: reason,
              originalOutcome: pick.grade.outcome,
              originalPoints: Number(pick.grade.points),
              overriddenAt: new Date().toISOString(),
              overriddenBy,
            },
          },
        })

        updatedGrades.push(updatedGrade)
      }
    })

    return updatedGrades
  }

  /**
   * Get override history for a specific pick
   */
  async getOverrideHistory(pickId: string): Promise<GradeOverride[]> {
    this.validateRequired(pickId, 'Pick ID')

    return await prisma.gradeOverride.findMany({
      where: { pickId },
      orderBy: { overriddenAt: 'asc' },
    })
  }

  /**
   * Get override statistics for a season/week
   */
  async getOverrideStats(
    season: number,
    week?: number
  ): Promise<OverrideStats> {
    this.validateRequired(season, 'Season')

    const whereClause = week
      ? {
          pick: {
            game: {
              season,
              week,
            },
          },
        }
      : {
          pick: {
            game: {
              season,
            },
          },
        }

    const overrides = await prisma.gradeOverride.findMany({
      where: whereClause,
      include: {
        pick: {
          include: {
            game: true,
          },
        },
      },
    })

    // Calculate statistics
    const totalOverrides = overrides.length
    const gamesWithOverrides = new Set(overrides.map((o) => o.pick.gameId)).size

    const overridesByOutcome: Record<PickOutcome, number> = {
      WIN: 0,
      LOSS: 0,
      PUSH: 0,
      VOID: 0,
    }

    overrides.forEach((override) => {
      overridesByOutcome[override.newOutcome]++
    })

    return {
      totalOverrides,
      gamesWithOverrides,
      overridesByOutcome,
    }
  }

  /**
   * Validate override reason meets requirements
   */
  private validateOverrideReason(reason: string): void {
    if (!reason || reason.trim().length === 0) {
      throw new ValidationError('Override reason is required', 'reason')
    }

    if (reason.trim().length < 10) {
      throw new ValidationError(
        'Override reason must be at least 10 characters',
        'reason'
      )
    }
  }
}
