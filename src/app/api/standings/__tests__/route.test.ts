import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseTestUtils } from '@/lib/test-utils/database'
import { GET as getStandings } from '../route'
import type { ApiResponse } from '@/lib/api/response'

// Helper to create mock NextRequest
function createRequest(queryParams: string): Request {
  const url = new URL(`http://localhost:3000/api/standings${queryParams}`)
  return new Request(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }) as any
}

describe('Standings API', () => {
  let poolId: string

  beforeEach(async () => {
    await DatabaseTestUtils.cleanupTestData()

    // Create test pool with some standings data
    const pool = await DatabaseTestUtils.createTestPool({
      name: `Standings API Pool ${Date.now()}`,
      type: 'ATS',
      season: 2024,
    })
    poolId = pool.id

    // Create entry with some picks and grades
    const entry = await DatabaseTestUtils.createTestEntry({
      poolId: pool.id,
      season: 2024,
    })
    const teams = await DatabaseTestUtils.createTestTeams(4)
    const games = await DatabaseTestUtils.createTestGames(teams, 2, 2024, 1)

    const pick1 = await DatabaseTestUtils.createTestPick(
      entry.id,
      games[0].id,
      teams[0].id
    )
    const pick2 = await DatabaseTestUtils.createTestPick(
      entry.id,
      games[1].id,
      teams[2].id
    )
    await DatabaseTestUtils.createTestGrade(pick1.id, 'WIN', 1.0)
    await DatabaseTestUtils.createTestGrade(pick2.id, 'LOSS', 0.0)
  })

  afterEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  it('should return pool standings for a season', async () => {
    const request = createRequest(`?poolId=${poolId}&season=2024`)
    const response = await getStandings(request)
    const data: ApiResponse<any[]> = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(Array.isArray(data.data)).toBe(true)
    expect(data.data!.length).toBe(1)

    const standing = data.data![0]
    expect(standing.wins).toBe(1)
    expect(standing.losses).toBe(1)
    expect(standing.winPercentage).toBe(0.5)
    expect(standing.rank).toBe(1)
  })

  it('should return weekly standings when week parameter is provided', async () => {
    const request = createRequest(`?poolId=${poolId}&season=2024&week=1`)
    const response = await getStandings(request)
    const data: ApiResponse<any[]> = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(Array.isArray(data.data)).toBe(true)
    expect(data.data!.length).toBe(1)

    const standing = data.data![0]
    expect(standing.wins).toBe(1)
    expect(standing.losses).toBe(1)
  })

  it('should return 400 when poolId parameter is missing', async () => {
    const request = createRequest('?season=2024')
    const response = await getStandings(request)
    const data: ApiResponse = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/poolId and season parameters are required/i)
  })

  it('should return 400 when season parameter is missing', async () => {
    const request = createRequest(`?poolId=${poolId}`)
    const response = await getStandings(request)
    const data: ApiResponse = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/poolId and season parameters are required/i)
  })

  it('should return 400 when season is not a valid number', async () => {
    const request = createRequest(`?poolId=${poolId}&season=invalid`)
    const response = await getStandings(request)
    const data: ApiResponse = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/season must be a valid number/i)
  })

  it('should return 400 when week is not a valid number', async () => {
    const request = createRequest(`?poolId=${poolId}&season=2024&week=invalid`)
    const response = await getStandings(request)
    const data: ApiResponse = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/week must be a valid number/i)
  })

  it('should return 500 for non-existent pool', async () => {
    const request = createRequest('?poolId=non-existent&season=2024')
    const response = await getStandings(request)
    const data: ApiResponse = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    // Error structure may vary, just verify it exists
    expect(data.error).toBeDefined()
  })
})
