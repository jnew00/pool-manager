import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseTestUtils } from '@/lib/test-utils/database'
import type { ApiResponse } from '@/lib/api/response'
import type { Game } from '@/lib/types/database'
import { GET as getGames, POST as postGame } from './route'
import { GET as getGame, PUT as putGame } from './[id]/route'

// Helper to create mock NextRequest
function createRequest(
  method: string,
  body?: any,
  queryParams?: string
): Request {
  const url = new URL(`http://localhost:3000/api/games${queryParams || ''}`)
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) }),
  }) as any
}

describe('Games API', () => {
  let homeTeamId: string
  let awayTeamId: string

  beforeEach(async () => {
    await DatabaseTestUtils.cleanupTestData()

    // Create test teams for games
    const homeTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: 'TST',
      name: 'Test Home Team',
    })
    const awayTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: 'DEV',
      name: 'Test Away Team',
    })

    homeTeamId = homeTeam.id
    awayTeamId = awayTeam.id
  })

  afterEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  describe('POST /api/games', () => {
    it('should create a new game', async () => {
      const gameData = {
        season: 2024,
        week: 1,
        homeTeamId,
        awayTeamId,
        kickoff: '2024-09-10T13:00:00Z',
        status: 'SCHEDULED',
      }

      const request = createRequest('POST', gameData)
      const response = await postGame(request)
      const data: ApiResponse<Game> = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data!.season).toBe(2024)
      expect(data.data!.week).toBe(1)
      expect(data.data!.homeTeamId).toBe(homeTeamId)
      expect(data.data!.awayTeamId).toBe(awayTeamId)
      expect(data.data!.status).toBe('SCHEDULED')
    })

    it('should return 400 for invalid game data', async () => {
      const invalidData = {
        season: 2024,
        week: 0, // Invalid week
        homeTeamId,
        awayTeamId,
        kickoff: '2024-09-10T13:00:00Z',
      }

      const request = createRequest('POST', invalidData)
      const response = await postGame(request)
      const data: ApiResponse = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error!.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/games', () => {
    it('should return games with query parameters', async () => {
      // Create a test game
      const gameData = {
        season: 2024,
        week: 1,
        homeTeamId,
        awayTeamId,
        kickoff: new Date('2024-09-10T13:00:00Z'),
        status: 'SCHEDULED' as const,
      }

      await DatabaseTestUtils.createTestGame(homeTeamId, awayTeamId, gameData)

      const request = createRequest('GET', undefined, '?week=1')
      const response = await getGames(request)
      const data: ApiResponse<Game[]> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data!.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('GET /api/games/[id]', () => {
    it('should return a game by ID', async () => {
      const game = await DatabaseTestUtils.createTestGame(
        homeTeamId,
        awayTeamId,
        {
          season: 2024,
          week: 1,
        }
      )

      const request = createRequest('GET')
      const response = await getGame(request, { params: { id: game.id } })
      const data: ApiResponse<Game> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data!.id).toBe(game.id)
    })

    it('should return 404 for non-existent game', async () => {
      const request = createRequest('GET')
      const response = await getGame(request, {
        params: { id: 'non-existent-id' },
      })
      const data: ApiResponse = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error!.code).toBe('NOT_FOUND')
    })
  })

  describe('PUT /api/games/[id]', () => {
    it('should update game status', async () => {
      const game = await DatabaseTestUtils.createTestGame(
        homeTeamId,
        awayTeamId,
        {
          season: 2024,
          week: 1,
          status: 'SCHEDULED',
        }
      )

      const updateData = {
        status: 'IN_PROGRESS',
      }

      const request = createRequest('PUT', updateData)
      const response = await putGame(request, { params: { id: game.id } })
      const data: ApiResponse<Game> = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data!.status).toBe('IN_PROGRESS')
    })
  })
})
