import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseTestUtils } from '@/lib/test-utils/database'
import type { ApiResponse } from '@/lib/api/response'
import type { Team } from '@/lib/types/database'
import { GET as getTeams, POST as postTeam } from './route'
import { GET as getTeam, PUT as putTeam, DELETE as deleteTeam } from './[id]/route'

// Helper to create mock NextRequest
function createRequest(method: string, body?: any): Request {
  const url = new URL('http://localhost:3000/api/teams')
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) }),
  }) as any
}

describe('Teams API - Basic Tests', () => {
  beforeEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  afterEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  describe('POST /api/teams', () => {
    it('should create a new team', async () => {
      const teamData = {
        nflAbbr: 'TST',
        name: 'New Test Team',
      }

      const request = createRequest('POST', teamData)
      const response = await postTeam(request)
      const data: ApiResponse<Team> = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data!.nflAbbr).toBe('TST')
      expect(data.data!.name).toBe('New Test Team')
      expect(data.data!.id).toBeDefined()
    })

    it('should return 400 for invalid team data', async () => {
      const invalidData = {
        nflAbbr: '', // Empty abbreviation
        name: 'Test Team',
      }

      const request = createRequest('POST', invalidData)
      const response = await postTeam(request)
      const data: ApiResponse = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
      expect(data.error!.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/teams', () => {
    it('should return all teams', async () => {
      // Create test teams
      await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'TST',
        name: 'Test Team 1',
      })
      await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'DEV',
        name: 'Test Team 2',
      })

      const request = createRequest('GET')
      const response = await getTeams(request)
      const data: ApiResponse<Team[]> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data!.length).toBeGreaterThanOrEqual(2)

      // Find our test teams
      const testTeams = data.data!.filter((team) =>
        ['TST', 'DEV'].includes(team.nflAbbr)
      )
      expect(testTeams).toHaveLength(2)
    })
  })

  describe('GET /api/teams/[id]', () => {
    it('should return a team by ID', async () => {
      const team = await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'TST',
        name: 'Test Team',
      })

      const request = createRequest('GET')
      const response = await getTeam(request, { params: { id: team.id } })
      const data: ApiResponse<Team> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data!.id).toBe(team.id)
      expect(data.data!.nflAbbr).toBe('TST')
      expect(data.data!.name).toBe('Test Team')
    })

    it('should return 404 for non-existent team', async () => {
      const request = createRequest('GET')
      const response = await getTeam(request, { params: { id: 'non-existent-id' } })
      const data: ApiResponse = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
      expect(data.error!.code).toBe('NOT_FOUND')
    })
  })

  describe('PUT /api/teams/[id]', () => {
    it('should update a team', async () => {
      const team = await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'TST',
        name: 'Original Name',
      })

      const updateData = {
        name: 'Updated Name',
      }

      const request = createRequest('PUT', updateData)
      const response = await putTeam(request, { params: { id: team.id } })
      const data: ApiResponse<Team> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data!.name).toBe('Updated Name')
      expect(data.data!.nflAbbr).toBe('TST') // Should remain unchanged
    })
  })

  describe('DELETE /api/teams/[id]', () => {
    it('should delete a team', async () => {
      const team = await DatabaseTestUtils.createTestTeam({
        nflAbbr: 'TST',
        name: 'Team to Delete',
      })

      const request = createRequest('DELETE')
      const response = await deleteTeam(request, { params: { id: team.id } })
      const data: ApiResponse = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should return 404 for non-existent team', async () => {
      const request = createRequest('DELETE')
      const response = await deleteTeam(request, { params: { id: 'non-existent-id' } })
      const data: ApiResponse = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error!.code).toBe('NOT_FOUND')
    })
  })
})