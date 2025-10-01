import { prisma } from '@/lib/prisma'
import { BaseService } from './base.service'
import { ValidationError } from '@/lib/types/database'
import type { Pick } from '@/lib/types/database'

export interface CreatePickData {
  entryId: string
  gameId: string
  teamId: string
  confidence: number
}

export interface UpdatePickData {
  teamId?: string
  confidence?: number
}

export interface PickWithRelations extends Pick {
  game: {
    id: string
    week: number
    kickoff: Date
  }
  team: {
    id: string
    nflAbbr: string
    name: string
  }
  entry: {
    id: string
    season: number
  }
}

export class PickService extends BaseService {
  async createPick(data: CreatePickData): Promise<Pick> {
    this.validatePickData(data)

    try {
      return await prisma.pick.create({
        data,
      })
    } catch (error: any) {
      throw this.handlePrismaError(error)
    }
  }

  private validatePickData(data: CreatePickData): void {
    this.validateRequired(data.entryId, 'Entry ID')
    this.validateRequired(data.gameId, 'Game ID')
    this.validateRequired(data.teamId, 'Team ID')
    this.validateRequired(data.confidence, 'Confidence')

    if (data.confidence < 0 || data.confidence > 100) {
      throw new ValidationError(
        'Confidence must be between 0 and 100',
        'confidence'
      )
    }
  }

  async getPickById(id: string): Promise<PickWithRelations | null> {
    return await prisma.pick.findUnique({
      where: { id },
      include: {
        game: {
          select: {
            id: true,
            week: true,
            kickoff: true,
          },
        },
        team: {
          select: {
            id: true,
            nflAbbr: true,
            name: true,
          },
        },
        entry: {
          select: {
            id: true,
            season: true,
          },
        },
      },
    })
  }

  async getPicksByEntry(entryId: string): Promise<Pick[]> {
    return await prisma.pick.findMany({
      where: { entryId },
      orderBy: { id: 'asc' },
    })
  }

  async updatePick(id: string, data: UpdatePickData): Promise<Pick> {
    this.validateRequired(id, 'Pick ID')
    this.validateUpdateData(data)

    try {
      return await prisma.pick.update({
        where: { id },
        data,
      })
    } catch (error: any) {
      throw this.handlePrismaError(error)
    }
  }

  private validateUpdateData(data: UpdatePickData): void {
    if (
      data.confidence !== undefined &&
      (data.confidence < 0 || data.confidence > 100)
    ) {
      throw new ValidationError(
        'Confidence must be between 0 and 100',
        'confidence'
      )
    }
  }

  async getEntry(
    entryId: string
  ): Promise<{ id: string; poolId: string } | null> {
    this.validateRequired(entryId, 'Entry ID')

    try {
      return await prisma.entry.findUnique({
        where: { id: entryId },
        select: {
          id: true,
          poolId: true,
        },
      })
    } catch (error: any) {
      throw this.handlePrismaError(error)
    }
  }

  async deletePick(id: string): Promise<boolean> {
    this.validateRequired(id, 'Pick ID')

    try {
      await prisma.pick.delete({
        where: { id },
      })
      return true
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false
      }
      throw this.handlePrismaError(error)
    }
  }

  /**
   * Lock in all picks for a specific entry and week
   */
  async lockInPicksForWeek(
    entryId: string,
    season: number,
    week: number
  ): Promise<{ count: number; picks: Pick[] }> {
    this.validateRequired(entryId, 'Entry ID')
    this.validateRequired(season, 'Season')
    this.validateRequired(week, 'Week')

    try {
      // Get all picks for this entry and week that aren't already locked
      const picks = await prisma.pick.findMany({
        where: {
          entryId,
          lockedAt: null,
          game: {
            season,
            week,
          },
        },
        include: {
          game: true,
        },
      })

      if (picks.length === 0) {
        throw new ValidationError(
          'No unlocked picks found for this week',
          'picks'
        )
      }

      // Lock all picks at once
      const lockedAt = new Date()
      const updateResult = await prisma.pick.updateMany({
        where: {
          id: {
            in: picks.map((p) => p.id),
          },
        },
        data: {
          lockedAt,
        },
      })

      // Fetch updated picks to return
      const updatedPicks = await prisma.pick.findMany({
        where: {
          id: {
            in: picks.map((p) => p.id),
          },
        },
      })

      return {
        count: updateResult.count,
        picks: updatedPicks,
      }
    } catch (error: any) {
      throw this.handlePrismaError(error)
    }
  }

  /**
   * Get picks for a specific entry and week with game results
   */
  async getPicksWithResultsForWeek(
    entryId: string,
    season: number,
    week: number
  ): Promise<any[]> {
    this.validateRequired(entryId, 'Entry ID')
    this.validateRequired(season, 'Season')
    this.validateRequired(week, 'Week')

    try {
      const picks = await prisma.pick.findMany({
        where: {
          entryId,
          game: {
            season,
            week,
          },
        },
        include: {
          game: {
            include: {
              homeTeam: true,
              awayTeam: true,
              result: true,
            },
          },
          team: true,
          grade: true,
        },
        orderBy: {
          game: {
            kickoff: 'asc',
          },
        },
      })

      return picks.map((pick) => ({
        ...pick,
        isCorrect:
          pick.grade?.outcome === 'WIN'
            ? true
            : pick.grade?.outcome === 'LOSS'
              ? false
              : null,
      }))
    } catch (error: any) {
      throw this.handlePrismaError(error)
    }
  }

  /**
   * Get win/loss record for a specific entry and week
   */
  async getWeekRecord(
    entryId: string,
    season: number,
    week: number
  ): Promise<{ wins: number; losses: number; pending: number; total: number }> {
    this.validateRequired(entryId, 'Entry ID')
    this.validateRequired(season, 'Season')
    this.validateRequired(week, 'Week')

    try {
      const picks = await prisma.pick.findMany({
        where: {
          entryId,
          game: {
            season,
            week,
          },
        },
        include: {
          grade: true,
        },
      })

      const wins = picks.filter((p) => p.grade?.outcome === 'WIN').length
      const losses = picks.filter((p) => p.grade?.outcome === 'LOSS').length
      const pending = picks.filter(
        (p) => !p.grade || p.grade.outcome === 'PENDING'
      ).length

      return {
        wins,
        losses,
        pending,
        total: picks.length,
      }
    } catch (error: any) {
      throw this.handlePrismaError(error)
    }
  }
}
