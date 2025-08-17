import { prisma } from '@/lib/prisma'
import { BaseService } from './base.service'
import { ValidationError } from '@/lib/types/database'
import type { Entry } from '@/lib/types/database'

export interface CreateEntryData {
  poolId: string
  season: number
}

export interface EntryWithPool extends Entry {
  pool: {
    id: string
    name: string
    type: string
  }
}

export class EntryService extends BaseService {
  async createEntry(data: CreateEntryData): Promise<Entry> {
    this.validateEntryData(data)

    try {
      return await prisma.entry.create({
        data,
      })
    } catch (error: any) {
      throw this.handlePrismaError(error)
    }
  }

  private validateEntryData(data: CreateEntryData): void {
    this.validateRequired(data.poolId, 'Pool ID')
    this.validateRequired(data.season, 'Season')

    if (data.season < 1900 || data.season > 2100) {
      throw new ValidationError('Season must be a valid year', 'season')
    }
  }

  async getEntryById(id: string): Promise<EntryWithPool | null> {
    return await prisma.entry.findUnique({
      where: { id },
      include: {
        pool: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })
  }

  async getEntriesByPool(poolId: string): Promise<Entry[]> {
    return await prisma.entry.findMany({
      where: { poolId },
      orderBy: { id: 'asc' },
    })
  }

  async deleteEntry(id: string): Promise<boolean> {
    this.validateRequired(id, 'Entry ID')

    try {
      await prisma.entry.delete({
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