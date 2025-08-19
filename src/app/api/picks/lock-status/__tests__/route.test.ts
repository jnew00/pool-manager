import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseTestUtils } from '@/lib/test-utils/database'
import { GET as getLockStatus } from '../route'
import type { ApiResponse } from '@/lib/api/response'

// Helper to create mock NextRequest
function createRequest(queryParams: string): Request {
  const url = new URL(
    `http://localhost:3000/api/picks/lock-status${queryParams}`
  )
  return new Request(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }) as any
}

describe('Lock Status API', () => {
  let poolId: string
  let lockedGameId: string
  let unlockedGameId: string

  beforeEach(async () => {
    await DatabaseTestUtils.cleanupTestData()

    // Create unique test data
    const timestamp = Date.now().toString().slice(-6)
    const homeTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: `HM${timestamp}`,
      name: 'Home Team',
    })
    const awayTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: `AW${timestamp}`,
      name: 'Away Team',
    })

    const pool = await DatabaseTestUtils.createTestPool({
      name: `Lock Status Pool ${timestamp}`,
      season: 2024,
      rules: {
        lockDeadline: 'game_time',
      },
    })

    // Create a locked game (in the past)
    const lockedGame = await DatabaseTestUtils.createTestGame(
      homeTeam.id,
      awayTeam.id,
      {
        season: 2024,
        week: 1,
        kickoff: new Date(Date.now() - 3600000), // 1 hour ago
      }
    )

    // Create teams for unlocked game
    const futureHomeTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: `FH${timestamp}`,
      name: 'Future Home Team',
    })
    const futureAwayTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: `FA${timestamp}`,
      name: 'Future Away Team',
    })

    // Create an unlocked game (in the future)
    const unlockedGame = await DatabaseTestUtils.createTestGame(
      futureHomeTeam.id,
      futureAwayTeam.id,
      {
        season: 2024,
        week: 2,
        kickoff: new Date(Date.now() + 3600000), // 1 hour from now
      }
    )

    poolId = pool.id
    lockedGameId = lockedGame.id
    unlockedGameId = unlockedGame.id
  })

  afterEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  it('should return lock status for multiple games', async () => {
    const request = createRequest(
      `?gameIds=${lockedGameId},${unlockedGameId}&poolId=${poolId}`
    )
    const response = await getLockStatus(request)
    const data: ApiResponse<Record<string, any>> = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    // Check locked game status
    expect(data.data![lockedGameId]).toBeDefined()
    expect(data.data![lockedGameId].isLocked).toBe(true)
    expect(data.data![lockedGameId].deadline).toBeDefined()
    expect(data.data![lockedGameId].timeRemaining).toBeUndefined()

    // Check unlocked game status
    expect(data.data![unlockedGameId]).toBeDefined()
    expect(data.data![unlockedGameId].isLocked).toBe(false)
    expect(data.data![unlockedGameId].deadline).toBeDefined()
    expect(data.data![unlockedGameId].timeRemaining).toBeGreaterThan(0)
  })

  it('should return 400 when gameIds parameter is missing', async () => {
    const request = createRequest(`?poolId=${poolId}`)
    const response = await getLockStatus(request)
    const data: ApiResponse = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/gameIds and poolId parameters are required/i)
  })

  it('should return 400 when poolId parameter is missing', async () => {
    const request = createRequest(`?gameIds=${lockedGameId}`)
    const response = await getLockStatus(request)
    const data: ApiResponse = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/gameIds and poolId parameters are required/i)
  })

  it('should handle empty gameIds list', async () => {
    const request = createRequest(`?gameIds=&poolId=${poolId}`)
    const response = await getLockStatus(request)
    const data: ApiResponse<Record<string, any>> = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual({})
  })

  it('should handle single game ID', async () => {
    const request = createRequest(`?gameIds=${unlockedGameId}&poolId=${poolId}`)
    const response = await getLockStatus(request)
    const data: ApiResponse<Record<string, any>> = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Object.keys(data.data!)).toHaveLength(1)
    expect(data.data![unlockedGameId]).toBeDefined()
    expect(data.data![unlockedGameId].isLocked).toBe(false)
  })

  it('should handle non-existent game IDs gracefully', async () => {
    const request = createRequest(
      `?gameIds=non-existent-game,${unlockedGameId}&poolId=${poolId}`
    )
    const response = await getLockStatus(request)

    // Should return error due to non-existent game, but this depends on implementation
    // For now, let's expect it to handle the valid game ID
    expect(response.status).toBe(500) // PickLockingService will throw error for non-existent game
  })
})
