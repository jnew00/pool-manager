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
      throw new ValidationError('Confidence must be between 0 and 100', 'confidence')
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
    if (data.confidence !== undefined && (data.confidence < 0 || data.confidence > 100)) {
      throw new ValidationError('Confidence must be between 0 and 100', 'confidence')
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
}