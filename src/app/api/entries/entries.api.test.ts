import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseTestUtils } from '@/lib/test-utils/database'
import type { ApiResponse } from '@/lib/api/response'
import type { Entry } from '@/lib/types/database'
import { GET as getEntries, POST as postEntry } from './route'
import { GET as getEntry, DELETE as deleteEntry } from './[id]/route'

// Helper to create mock NextRequest
function createRequest(method: string, body?: any, queryParams?: string): Request {
  const url = new URL(`http://localhost:3000/api/entries${queryParams || ''}`)
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) }),
  }) as any
}

describe('Entries API', () => {
  let poolId: string

  beforeEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
    
    // Create test pool for entries
    const pool = await DatabaseTestUtils.createTestPool({
      name: 'Test Entry Pool',
      season: 2024,
    })
    poolId = pool.id
  })

  afterEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  describe('POST /api/entries', () => {
    it('should create a new entry', async () => {
      const entryData = {
        poolId,
        season: 2024,
      }

      const request = createRequest('POST', entryData)
      const response = await postEntry(request)
      const data: ApiResponse<Entry> = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data!.poolId).toBe(poolId)
      expect(data.data!.season).toBe(2024)
    })

    it('should return 400 for invalid entry data', async () => {
      const invalidData = {
        poolId: 'non-existent-pool',
        season: 1800, // Invalid season
      }

      const request = createRequest('POST', invalidData)
      const response = await postEntry(request)
      const data: ApiResponse = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error!.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/entries', () => {
    it('should return entries filtered by pool', async () => {
      // Create test entries with different seasons to avoid unique constraint
      await DatabaseTestUtils.createTestEntry(poolId, { season: 2024 })
      await DatabaseTestUtils.createTestEntry(poolId, { season: 2023 })
      
      // Create another pool and entry to ensure filtering works
      const otherPool = await DatabaseTestUtils.createTestPool({
        name: 'Other Pool',
        season: 2024,
      })
      await DatabaseTestUtils.createTestEntry(otherPool.id, { season: 2024 })

      const request = createRequest('GET', undefined, `?poolId=${poolId}`)
      const response = await getEntries(request)
      const data: ApiResponse<Entry[]> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data!.length).toBe(2)
      expect(data.data!.every(entry => entry.poolId === poolId)).toBe(true)
    })

    it('should return empty array when no poolId specified', async () => {
      await DatabaseTestUtils.createTestEntry(poolId, { season: 2024 })

      const request = createRequest('GET')
      const response = await getEntries(request)
      const data: ApiResponse<Entry[]> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data!.length).toBe(0)
    })
  })

  describe('GET /api/entries/[id]', () => {
    it('should return an entry by ID with pool details', async () => {
      const entry = await DatabaseTestUtils.createTestEntry(poolId, {
        season: 2024,
      })

      const request = createRequest('GET')
      const response = await getEntry(request, { params: { id: entry.id } })
      const data: ApiResponse<any> = await response.json() // Using any since it includes pool data

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data!.id).toBe(entry.id)
      expect(data.data!.poolId).toBe(poolId)
      expect(data.data!.season).toBe(2024)
      expect(data.data!.pool).toBeDefined()
      expect(data.data!.pool.name).toBe('Test Entry Pool')
    })

    it('should return 404 for non-existent entry', async () => {
      const request = createRequest('GET')
      const response = await getEntry(request, { params: { id: 'non-existent-id' } })
      const data: ApiResponse = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error!.code).toBe('NOT_FOUND')
    })
  })

  describe('DELETE /api/entries/[id]', () => {
    it('should delete an entry', async () => {
      const entry = await DatabaseTestUtils.createTestEntry(poolId, {
        season: 2024,
      })

      const request = createRequest('DELETE')
      const response = await deleteEntry(request, { params: { id: entry.id } })
      const data: ApiResponse<{ deleted: boolean }> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data!.deleted).toBe(true)
    })

    it('should return 404 when deleting non-existent entry', async () => {
      const request = createRequest('DELETE')
      const response = await deleteEntry(request, { params: { id: 'non-existent-id' } })
      const data: ApiResponse = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error!.code).toBe('NOT_FOUND')
    })
  })
})