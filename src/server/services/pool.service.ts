import { prisma } from '@/lib/prisma'
import { BaseService } from './base.service'
import { ValidationError } from '@/lib/types/database'
import type { Pool, PoolType } from '@/lib/types/database'

const VALID_POOL_TYPES = ['ATS', 'SU', 'POINTS_PLUS', 'SURVIVOR'] as const

export interface CreatePoolData {
  name: string
  type: PoolType
  season: number
  buyIn: number
  maxEntries: number
  isActive: boolean
  description?: string
}

export interface UpdatePoolData {
  name?: string
  buyIn?: number
  maxEntries?: number
  isActive?: boolean
  description?: string
}

export class PoolService extends BaseService {
  async createPool(data: CreatePoolData): Promise<Pool> {
    this.validatePoolData(data)

    try {
      return await prisma.pool.create({
        data,
      })
    } catch (error: any) {
      throw this.handlePrismaError(error)
    }
  }

  private validatePoolData(data: CreatePoolData): void {
    this.validateRequired(data.name, 'Pool name')
    this.validateRequired(data.type, 'Pool type')
    this.validateRequired(data.season, 'Season')
    this.validateRequired(data.buyIn, 'Buy-in amount')
    this.validateRequired(data.maxEntries, 'Max entries')

    if (data.name.length > 200) {
      throw new ValidationError(
        'Pool name must be 200 characters or less',
        'name'
      )
    }

    if (!VALID_POOL_TYPES.includes(data.type as any)) {
      throw new ValidationError('Invalid pool type', 'type')
    }

    if (data.season < 1900 || data.season > 2100) {
      throw new ValidationError('Season must be a valid year', 'season')
    }

    if (data.buyIn < 0) {
      throw new ValidationError('Buy-in amount cannot be negative', 'buyIn')
    }

    if (data.maxEntries < 1) {
      throw new ValidationError(
        'Max entries must be at least 1',
        'maxEntries'
      )
    }
  }

  async getPoolById(id: string): Promise<Pool | null> {
    return await prisma.pool.findUnique({
      where: { id },
    })
  }

  async getPoolsBySeason(season: number): Promise<Pool[]> {
    return await prisma.pool.findMany({
      where: { season },
      orderBy: { name: 'asc' },
    })
  }

  async updatePool(id: string, data: UpdatePoolData): Promise<Pool> {
    this.validateRequired(id, 'Pool ID')
    this.validateUpdateData(data)

    try {
      return await prisma.pool.update({
        where: { id },
        data,
      })
    } catch (error: any) {
      throw this.handlePrismaError(error)
    }
  }

  private validateUpdateData(data: UpdatePoolData): void {
    if (data.name !== undefined && data.name.length > 200) {
      throw new ValidationError(
        'Pool name must be 200 characters or less',
        'name'
      )
    }

    if (data.buyIn !== undefined && data.buyIn < 0) {
      throw new ValidationError('Buy-in amount cannot be negative', 'buyIn')
    }

    if (data.maxEntries !== undefined && data.maxEntries < 1) {
      throw new ValidationError(
        'Max entries must be at least 1',
        'maxEntries'
      )
    }
  }

  async deletePool(id: string): Promise<boolean> {
    this.validateRequired(id, 'Pool ID')

    try {
      await prisma.pool.delete({
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