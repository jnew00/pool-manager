import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseTestUtils } from '@/lib/test-utils/database'
import type { ApiResponse } from '@/lib/api/response'
import type { Pool, PoolType } from '@/lib/types/database'
import { GET as getPools, POST as postPool } from './route'
import { GET as getPool, PUT as putPool, DELETE as deletePool } from './[id]/route'

// Helper to create mock NextRequest
function createRequest(method: string, body?: any, queryParams?: string): Request {
  const url = new URL(`http://localhost:3000/api/pools${queryParams || ''}`)
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) }),
  }) as any
}

describe('Pools API', () => {
  beforeEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  afterEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  describe('POST /api/pools', () => {
    it('should create a new pool', async () => {
      const poolData = {
        name: 'Test Season Pool',
        type: 'ATS' as PoolType,
        season: 2024,
        buyIn: 100,
        maxEntries: 50,
        isActive: true,
        description: 'Test pool description',
      }

      const request = createRequest('POST', poolData)
      const response = await postPool(request)
      const data: ApiResponse<Pool> = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data!.name).toBe('Test Season Pool')
      expect(data.data!.type).toBe('ATS')
      expect(data.data!.season).toBe(2024)
      expect(data.data!.buyIn).toBe('100')
      expect(data.data!.maxEntries).toBe(50)
      expect(data.data!.isActive).toBe(true)
    })

    it('should return 400 for invalid pool data', async () => {
      const invalidData = {
        name: 'Valid Pool Name',
        type: 'INVALID_TYPE' as PoolType,
        season: 2024,
        buyIn: -10, // Invalid negative buy-in
        maxEntries: 0, // Invalid max entries
        isActive: true,
      }

      const request = createRequest('POST', invalidData)
      const response = await postPool(request)
      const data: ApiResponse = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error!.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/pools', () => {
    it('should return pools filtered by season', async () => {
      // Create test pools
      await DatabaseTestUtils.createTestPool({
        name: 'Pool 2024',
        season: 2024,
      })
      await DatabaseTestUtils.createTestPool({
        name: 'Pool 2023',
        season: 2023,
      })

      const request = createRequest('GET', undefined, '?season=2024')
      const response = await getPools(request)
      const data: ApiResponse<Pool[]> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data!.length).toBe(1)
      expect(data.data![0].season).toBe(2024)
    })

    it('should return empty array when no season specified', async () => {
      await DatabaseTestUtils.createTestPool({ season: 2024 })

      const request = createRequest('GET')
      const response = await getPools(request)
      const data: ApiResponse<Pool[]> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data!.length).toBe(0)
    })
  })

  describe('GET /api/pools/[id]', () => {
    it('should return a pool by ID', async () => {
      const pool = await DatabaseTestUtils.createTestPool({
        name: 'Specific Pool',
        type: 'SU',
      })

      const request = createRequest('GET')
      const response = await getPool(request, { params: { id: pool.id } })
      const data: ApiResponse<Pool> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data!.id).toBe(pool.id)
      expect(data.data!.name).toBe('Specific Pool')
      expect(data.data!.type).toBe('SU')
    })

    it('should return 404 for non-existent pool', async () => {
      const request = createRequest('GET')
      const response = await getPool(request, { params: { id: 'non-existent-id' } })
      const data: ApiResponse = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error!.code).toBe('NOT_FOUND')
    })
  })

  describe('PUT /api/pools/[id]', () => {
    it('should update pool properties', async () => {
      const pool = await DatabaseTestUtils.createTestPool({
        name: 'Original Pool',
        buyIn: 50,
        isActive: true,
      })

      const updateData = {
        name: 'Updated Pool Name',
        buyIn: 75,
        isActive: false,
      }

      const request = createRequest('PUT', updateData)
      const response = await putPool(request, { params: { id: pool.id } })
      const data: ApiResponse<Pool> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data!.name).toBe('Updated Pool Name')
      expect(data.data!.buyIn).toBe('75')
      expect(data.data!.isActive).toBe(false)
    })
  })

  describe('DELETE /api/pools/[id]', () => {
    it('should delete a pool', async () => {
      const pool = await DatabaseTestUtils.createTestPool({
        name: 'Pool to Delete',
      })

      const request = createRequest('DELETE')
      const response = await deletePool(request, { params: { id: pool.id } })
      const data: ApiResponse<{ deleted: boolean }> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data!.deleted).toBe(true)
    })

    it('should return 404 when deleting non-existent pool', async () => {
      const request = createRequest('DELETE')
      const response = await deletePool(request, { params: { id: 'non-existent-id' } })
      const data: ApiResponse = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error!.code).toBe('NOT_FOUND')
    })
  })
})