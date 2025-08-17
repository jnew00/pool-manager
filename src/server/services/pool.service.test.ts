import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PoolService } from './pool.service'
import { prisma } from '@/lib/prisma'
import type { PoolType } from '@/lib/types/database'

describe('PoolService', () => {
  let poolService: PoolService

  beforeEach(() => {
    poolService = new PoolService()
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.pool.deleteMany({
      where: {
        name: {
          startsWith: 'Test Pool',
        },
      },
    })
  })

  describe('createPool', () => {
    it('should create a new pool with valid data', async () => {
      const poolData = {
        name: 'Test Pool ATS',
        type: 'ATS' as PoolType,
        season: 2024,
        buyIn: 50.0,
        maxEntries: 100,
        isActive: true,
      }

      const pool = await poolService.createPool(poolData)

      expect(pool).toBeDefined()
      expect(pool.name).toBe('Test Pool ATS')
      expect(pool.type).toBe('ATS')
      expect(pool.season).toBe(2024)
      expect(pool.buyIn.toNumber()).toBe(50.0)
      expect(pool.maxEntries).toBe(100)
      expect(pool.isActive).toBe(true)
      expect(pool.id).toBeDefined()
    })

    it('should throw error when creating pool with duplicate name', async () => {
      const poolData = {
        name: 'Test Pool Duplicate',
        type: 'SU' as PoolType,
        season: 2024,
        buyIn: 25.0,
        maxEntries: 50,
        isActive: true,
      }

      await poolService.createPool(poolData)

      await expect(poolService.createPool(poolData)).rejects.toThrow()
    })

    it('should validate required fields', async () => {
      const invalidPoolData = {
        name: '',
        type: 'ATS' as PoolType,
        season: 0,
        buyIn: -10.0,
        maxEntries: 0,
        isActive: true,
      }

      await expect(poolService.createPool(invalidPoolData)).rejects.toThrow()
    })

    it('should validate pool type', async () => {
      const invalidPoolData = {
        name: 'Test Pool',
        type: 'INVALID' as PoolType,
        season: 2024,
        buyIn: 50.0,
        maxEntries: 100,
        isActive: true,
      }

      await expect(poolService.createPool(invalidPoolData)).rejects.toThrow()
    })
  })

  describe('getPoolById', () => {
    it('should return pool by ID', async () => {
      const poolData = {
        name: 'Test Pool Find',
        type: 'POINTS_PLUS' as PoolType,
        season: 2024,
        buyIn: 75.0,
        maxEntries: 200,
        isActive: true,
      }

      const createdPool = await poolService.createPool(poolData)
      const foundPool = await poolService.getPoolById(createdPool.id)

      expect(foundPool).toBeDefined()
      expect(foundPool?.id).toBe(createdPool.id)
      expect(foundPool?.name).toBe('Test Pool Find')
      expect(foundPool?.type).toBe('POINTS_PLUS')
    })

    it('should return null for non-existent pool', async () => {
      const pool = await poolService.getPoolById('non-existent-id')
      expect(pool).toBeNull()
    })
  })

  describe('getPoolsBySeason', () => {
    it('should return pools for specific season', async () => {
      const poolData = {
        name: 'Test Pool Season',
        type: 'SURVIVOR' as PoolType,
        season: 2024,
        buyIn: 100.0,
        maxEntries: 50,
        isActive: true,
      }

      await poolService.createPool(poolData)
      const pools = await poolService.getPoolsBySeason(2024)

      expect(pools.length).toBeGreaterThanOrEqual(1)
      const testPool = pools.find((p) => p.name === 'Test Pool Season')
      expect(testPool).toBeDefined()
      expect(testPool?.season).toBe(2024)
    })
  })

  describe('updatePool', () => {
    it('should update pool data', async () => {
      const poolData = {
        name: 'Test Pool Update',
        type: 'ATS' as PoolType,
        season: 2024,
        buyIn: 50.0,
        maxEntries: 100,
        isActive: true,
      }

      const createdPool = await poolService.createPool(poolData)
      const updatedPool = await poolService.updatePool(createdPool.id, {
        buyIn: 75.0,
        maxEntries: 150,
        isActive: false,
      })

      expect(updatedPool.buyIn.toNumber()).toBe(75.0)
      expect(updatedPool.maxEntries).toBe(150)
      expect(updatedPool.isActive).toBe(false)
      expect(updatedPool.name).toBe('Test Pool Update') // Should remain unchanged
    })

    it('should throw error when updating non-existent pool', async () => {
      await expect(
        poolService.updatePool('non-existent-id', { buyIn: 100.0 })
      ).rejects.toThrow()
    })
  })

  describe('deletePool', () => {
    it('should delete pool by ID', async () => {
      const poolData = {
        name: 'Test Pool Delete',
        type: 'SU' as PoolType,
        season: 2024,
        buyIn: 25.0,
        maxEntries: 75,
        isActive: true,
      }

      const createdPool = await poolService.createPool(poolData)
      const result = await poolService.deletePool(createdPool.id)

      expect(result).toBe(true)

      const deletedPool = await poolService.getPoolById(createdPool.id)
      expect(deletedPool).toBeNull()
    })

    it('should return false when deleting non-existent pool', async () => {
      const result = await poolService.deletePool('non-existent-id')
      expect(result).toBe(false)
    })
  })
})