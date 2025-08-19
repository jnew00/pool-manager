import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseTestUtils } from '@/lib/test-utils/database'
import { POST as postPick } from '../route'

// Helper to create mock NextRequest
function createRequest(method: string, body?: any): Request {
  const url = new URL('http://localhost:3000/api/picks')
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) }),
  }) as any
}

describe('Pick Locking API Integration', () => {
  let entryId: string
  let lockedGameId: string
  let unlockedGameId: string
  let homeTeamId: string
  let awayTeamId: string

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
      name: `Lock Test Pool ${timestamp}`,
      season: 2024,
      rules: {
        lockDeadline: 'game_time', // Lock at game time
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

    // Create second set of teams for unlocked game
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

    const entry = await DatabaseTestUtils.createTestEntry(pool.id, {
      season: 2024,
    })

    homeTeamId = homeTeam.id
    awayTeamId = awayTeam.id
    lockedGameId = lockedGame.id
    unlockedGameId = unlockedGame.id
    entryId = entry.id
  })

  afterEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  it('should reject picks for locked games', async () => {
    const pickData = {
      entryId,
      gameId: lockedGameId,
      teamId: homeTeamId,
      confidence: 85,
    }

    const request = createRequest('POST', pickData)
    const response = await postPick(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/game is locked/i)
  })

  it('should allow picks for unlocked games', async () => {
    const pickData = {
      entryId,
      gameId: unlockedGameId,
      teamId: homeTeamId,
      confidence: 85,
    }

    const request = createRequest('POST', pickData)
    const response = await postPick(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(data.data.gameId).toBe(unlockedGameId)
  })

  it('should reject bulk picks when any game is locked', async () => {
    const bulkPickData = {
      entryId,
      picks: [
        {
          gameId: unlockedGameId,
          teamId: homeTeamId,
          confidence: 75,
        },
        {
          gameId: lockedGameId, // This one is locked
          teamId: awayTeamId,
          confidence: 85,
        },
      ],
    }

    const request = createRequest('POST', bulkPickData)
    const response = await postPick(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/game is locked/i)
  })

  it('should allow bulk picks when all games are unlocked', async () => {
    // Create another unlocked game for testing bulk picks
    const timestamp = Date.now().toString().slice(-6)
    const extraHomeTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: `EH${timestamp}`,
      name: 'Extra Home Team',
    })
    const extraAwayTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: `EA${timestamp}`,
      name: 'Extra Away Team',
    })

    const extraUnlockedGame = await DatabaseTestUtils.createTestGame(
      extraHomeTeam.id,
      extraAwayTeam.id,
      {
        season: 2024,
        week: 3,
        kickoff: new Date(Date.now() + 7200000), // 2 hours from now
      }
    )

    const bulkPickData = {
      entryId,
      picks: [
        {
          gameId: unlockedGameId,
          teamId: homeTeamId,
          confidence: 75,
        },
        {
          gameId: extraUnlockedGame.id,
          teamId: extraAwayTeam.id,
          confidence: 85,
        },
      ],
    }

    const request = createRequest('POST', bulkPickData)
    const response = await postPick(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(2)
    expect(data.data[0].gameId).toBe(unlockedGameId)
    expect(data.data[1].gameId).toBe(extraUnlockedGame.id)
  })

  it('should handle different lock deadline types', async () => {
    // Create pool with 1-hour before deadline
    const timestamp = Date.now().toString().slice(-6)
    const earlyLockPool = await DatabaseTestUtils.createTestPool({
      name: `Early Lock Pool ${timestamp}`,
      season: 2024,
      rules: {
        lockDeadline: '1_hour_before',
      },
    })

    const earlyEntry = await DatabaseTestUtils.createTestEntry(
      earlyLockPool.id,
      {
        season: 2024,
      }
    )

    // Create teams for this test
    const testHomeTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: `TH${timestamp}`,
      name: 'Test Home Team',
    })
    const testAwayTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: `TA${timestamp}`,
      name: 'Test Away Team',
    })

    // Game kicks off in 30 minutes (should be locked with 1-hour rule)
    const soonGame = await DatabaseTestUtils.createTestGame(
      testHomeTeam.id,
      testAwayTeam.id,
      {
        season: 2024,
        week: 4,
        kickoff: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      }
    )

    const pickData = {
      entryId: earlyEntry.id,
      gameId: soonGame.id,
      teamId: testHomeTeam.id,
      confidence: 80,
    }

    const request = createRequest('POST', pickData)
    const response = await postPick(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/game is locked/i)
  })
})
