import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseTestUtils } from '@/lib/test-utils/database'
import type { ApiResponse } from '@/lib/api/response'
import type { Pick } from '@/lib/types/database'
import { GET as getPicks, POST as postPick } from './route'
import { GET as getPick, PUT as putPick, DELETE as deletePick } from './[id]/route'

// Helper to create mock NextRequest
function createRequest(method: string, body?: any, queryParams?: string): Request {
  const url = new URL(`http://localhost:3000/api/picks${queryParams || ''}`)
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) }),
  }) as any
}

describe('Picks API', () => {
  let entryId: string
  let gameId: string
  let homeTeamId: string
  let awayTeamId: string
  let homeTeamAbbr: string

  beforeEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
    
    // Create test data chain: Teams -> Pool -> Game -> Entry
    // Use timestamp to make team abbreviations unique across tests
    const timestamp = Date.now().toString().slice(-3)
    homeTeamAbbr = `HM${timestamp}`
    const homeTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: homeTeamAbbr,
      name: 'Home Team',
    })
    const awayTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: `AW${timestamp}`,
      name: 'Away Team',
    })
    
    const pool = await DatabaseTestUtils.createTestPool({
      name: 'Test Pick Pool',
      season: 2024,
    })
    
    const game = await DatabaseTestUtils.createTestGame(homeTeam.id, awayTeam.id, {
      season: 2024,
      week: 1,
    })
    
    const entry = await DatabaseTestUtils.createTestEntry(pool.id, {
      season: 2024,
    })
    
    homeTeamId = homeTeam.id
    awayTeamId = awayTeam.id
    gameId = game.id
    entryId = entry.id
  })

  afterEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  describe('POST /api/picks', () => {
    it('should create a new pick', async () => {
      const pickData = {
        entryId,
        gameId,
        teamId: homeTeamId,
        confidence: 85,
      }

      const request = createRequest('POST', pickData)
      const response = await postPick(request)
      const data: ApiResponse<Pick> = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data!.entryId).toBe(entryId)
      expect(data.data!.gameId).toBe(gameId)
      expect(data.data!.teamId).toBe(homeTeamId)
      expect(data.data!.confidence).toBe('85') // Decimal returned as string
    })

    it('should return 400 for invalid pick data', async () => {
      const invalidData = {
        entryId,
        gameId,
        teamId: homeTeamId,
        confidence: 150, // Invalid confidence > 100
      }

      const request = createRequest('POST', invalidData)
      const response = await postPick(request)
      const data: ApiResponse = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error!.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/picks', () => {
    it('should return picks filtered by entry', async () => {
      // Create test picks
      await DatabaseTestUtils.createTestPick(entryId, gameId, homeTeamId, { confidence: 85 })
      
      // Create another entry to test filtering
      const anotherEntry = await DatabaseTestUtils.createTestEntry(
        (await DatabaseTestUtils.createTestPool({ name: 'Other Pool', season: 2023 })).id,
        { season: 2023 }
      )
      await DatabaseTestUtils.createTestPick(anotherEntry.id, gameId, awayTeamId, { confidence: 75 })

      const request = createRequest('GET', undefined, `?entryId=${entryId}`)
      const response = await getPicks(request)
      const data: ApiResponse<Pick[]> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data!.length).toBe(1)
      expect(data.data![0].entryId).toBe(entryId)
    })

    it('should return empty array when no entryId specified', async () => {
      await DatabaseTestUtils.createTestPick(entryId, gameId, homeTeamId, { confidence: 85 })

      const request = createRequest('GET')
      const response = await getPicks(request)
      const data: ApiResponse<Pick[]> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data!.length).toBe(0)
    })
  })

  describe('GET /api/picks/[id]', () => {
    it('should return a pick by ID with relations', async () => {
      const pick = await DatabaseTestUtils.createTestPick(entryId, gameId, homeTeamId, {
        confidence: 90,
      })

      const request = createRequest('GET')
      const response = await getPick(request, { params: { id: pick.id } })
      const data: ApiResponse<any> = await response.json() // Using any since it includes relations

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data!.id).toBe(pick.id)
      expect(data.data!.entryId).toBe(entryId)
      expect(data.data!.gameId).toBe(gameId)
      expect(data.data!.teamId).toBe(homeTeamId)
      expect(data.data!.game).toBeDefined()
      expect(data.data!.team).toBeDefined()
      expect(data.data!.entry).toBeDefined()
      expect(data.data!.team.nflAbbr).toBe(homeTeamAbbr)
    })

    it('should return 404 for non-existent pick', async () => {
      const request = createRequest('GET')
      const response = await getPick(request, { params: { id: 'non-existent-id' } })
      const data: ApiResponse = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error!.code).toBe('NOT_FOUND')
    })
  })

  describe('PUT /api/picks/[id]', () => {
    it('should update pick properties', async () => {
      const pick = await DatabaseTestUtils.createTestPick(entryId, gameId, homeTeamId, {
        confidence: 75,
      })

      const updateData = {
        teamId: awayTeamId,
        confidence: 95,
      }

      const request = createRequest('PUT', updateData)
      const response = await putPick(request, { params: { id: pick.id } })
      const data: ApiResponse<Pick> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data!.teamId).toBe(awayTeamId)
      expect(data.data!.confidence).toBe('95') // Decimal returned as string
    })
  })

  describe('DELETE /api/picks/[id]', () => {
    it('should delete a pick', async () => {
      const pick = await DatabaseTestUtils.createTestPick(entryId, gameId, homeTeamId, {
        confidence: 80,
      })

      const request = createRequest('DELETE')
      const response = await deletePick(request, { params: { id: pick.id } })
      const data: ApiResponse<{ deleted: boolean }> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data!.deleted).toBe(true)
    })

    it('should return 404 when deleting non-existent pick', async () => {
      const request = createRequest('DELETE')
      const response = await deletePick(request, { params: { id: 'non-existent-id' } })
      const data: ApiResponse = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error!.code).toBe('NOT_FOUND')
    })
  })
})