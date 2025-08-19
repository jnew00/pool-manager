import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { StandingsService } from '../standings.service'
import { DatabaseTestUtils } from '@/lib/test-utils/database'
import type { Pool, Entry, Grade, PickOutcome } from '@/lib/types/database'

describe('StandingsService', () => {
  let standingsService: StandingsService

  beforeEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
    standingsService = new StandingsService()
  })

  afterEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  it('should calculate basic standings with wins and losses', async () => {
    // Create test pool (multiple entries would be different people in same pool)
    // For testing, simulate with different seasons since constraint is (poolId, season)
    const pool = await DatabaseTestUtils.createTestPool({
      name: 'Standings Test Pool',
      type: 'ATS',
      season: 2024,
    })

    // Create entries for different seasons to test multiple entries
    const entry1 = await DatabaseTestUtils.createTestEntry({
      poolId: pool.id,
      season: 2024,
    })
    const entry2 = await DatabaseTestUtils.createTestEntry({
      poolId: pool.id,
      season: 2023,
    })
    const entry3 = await DatabaseTestUtils.createTestEntry({
      poolId: pool.id,
      season: 2022,
    })

    // Create test games
    const teams = await DatabaseTestUtils.createTestTeams(4)
    const games2024 = await DatabaseTestUtils.createTestGames(teams, 2, 2024, 1)
    const games2023 = await DatabaseTestUtils.createTestGames(teams, 2, 2023, 1)
    const games2022 = await DatabaseTestUtils.createTestGames(teams, 2, 2022, 1)

    // Entry 1 (2024): 2 wins
    const pick1 = await DatabaseTestUtils.createTestPick(
      entry1.id,
      games2024[0].id,
      teams[0].id
    )
    const pick2 = await DatabaseTestUtils.createTestPick(
      entry1.id,
      games2024[1].id,
      teams[2].id
    )
    await DatabaseTestUtils.createTestGrade(pick1.id, 'WIN', 1.0)
    await DatabaseTestUtils.createTestGrade(pick2.id, 'WIN', 1.0)

    // Entry 2 (2023): 1 win, 1 loss
    const pick3 = await DatabaseTestUtils.createTestPick(
      entry2.id,
      games2023[0].id,
      teams[1].id
    )
    const pick4 = await DatabaseTestUtils.createTestPick(
      entry2.id,
      games2023[1].id,
      teams[3].id
    )
    await DatabaseTestUtils.createTestGrade(pick3.id, 'WIN', 1.0)
    await DatabaseTestUtils.createTestGrade(pick4.id, 'LOSS', 0.0)

    // Entry 3 (2022): 2 losses
    const pick5 = await DatabaseTestUtils.createTestPick(
      entry3.id,
      games2022[0].id,
      teams[1].id
    )
    const pick6 = await DatabaseTestUtils.createTestPick(
      entry3.id,
      games2022[1].id,
      teams[3].id
    )
    await DatabaseTestUtils.createTestGrade(pick5.id, 'LOSS', 0.0)
    await DatabaseTestUtils.createTestGrade(pick6.id, 'LOSS', 0.0)

    // Test standings for 2024 season only
    const standings2024 = await standingsService.getPoolStandings(pool.id, 2024)
    expect(standings2024).toHaveLength(1)
    expect(standings2024[0].wins).toBe(2)
    expect(standings2024[0].losses).toBe(0)
    expect(standings2024[0].winPercentage).toBe(1.0)

    // Test standings for 2023 season
    const standings2023 = await standingsService.getPoolStandings(pool.id, 2023)
    expect(standings2023).toHaveLength(1)
    expect(standings2023[0].wins).toBe(1)
    expect(standings2023[0].losses).toBe(1)
    expect(standings2023[0].winPercentage).toBe(0.5)
  })

  it('should handle pushes and voids correctly', async () => {
    const pool = await DatabaseTestUtils.createTestPool({
      name: `Push Test Pool ${Date.now()}`,
      type: 'ATS',
      season: 2024,
    })

    const entry = await DatabaseTestUtils.createTestEntry({
      poolId: pool.id,
      season: 2024,
    })
    const teams = await DatabaseTestUtils.createTestTeams(4) // Need 4 teams for 2 games
    const games = await DatabaseTestUtils.createTestGames(teams, 2, 2024, 1)

    // Entry with push and void
    const pick1 = await DatabaseTestUtils.createTestPick(
      entry.id,
      games[0].id,
      teams[0].id
    )
    const pick2 = await DatabaseTestUtils.createTestPick(
      entry.id,
      games[1].id,
      teams[1].id
    )
    await DatabaseTestUtils.createTestGrade(pick1.id, 'PUSH', 0.5)
    await DatabaseTestUtils.createTestGrade(pick2.id, 'VOID', 0.0)

    const standings = await standingsService.getPoolStandings(pool.id, 2024)

    expect(standings[0].pushes).toBe(1)
    expect(standings[0].voids).toBe(1)
    expect(standings[0].totalPicks).toBe(2)
  })

  it('should calculate weekly standings', async () => {
    const pool = await DatabaseTestUtils.createTestPool({
      name: `Weekly Test Pool ${Date.now()}`,
      type: 'ATS',
      season: 2024,
    })

    const entry = await DatabaseTestUtils.createTestEntry({
      poolId: pool.id,
      season: 2024,
    })
    const teams = await DatabaseTestUtils.createTestTeams(2)

    const week1Games = await DatabaseTestUtils.createTestGames(
      teams,
      1,
      2024,
      1
    )
    const week2Games = await DatabaseTestUtils.createTestGames(
      teams,
      1,
      2024,
      2
    )

    // Week 1 picks
    const pick1 = await DatabaseTestUtils.createTestPick(
      entry.id,
      week1Games[0].id,
      teams[0].id
    )
    await DatabaseTestUtils.createTestGrade(pick1.id, 'WIN', 1.0)

    // Week 2 picks
    const pick2 = await DatabaseTestUtils.createTestPick(
      entry.id,
      week2Games[0].id,
      teams[1].id
    )
    await DatabaseTestUtils.createTestGrade(pick2.id, 'LOSS', 0.0)

    const week1Standings = await standingsService.getWeeklyStandings(
      pool.id,
      2024,
      1
    )
    const week2Standings = await standingsService.getWeeklyStandings(
      pool.id,
      2024,
      2
    )

    expect(week1Standings[0].wins).toBe(1)
    expect(week1Standings[0].losses).toBe(0)

    expect(week2Standings[0].wins).toBe(0)
    expect(week2Standings[0].losses).toBe(1)
  })

  it('should calculate points-based standings for point pools', async () => {
    const pointsPool = await DatabaseTestUtils.createTestPool({
      name: `Points Pool ${Date.now()}`,
      type: 'POINTS_PLUS',
      season: 2024,
    })

    const pointsEntry = await DatabaseTestUtils.createTestEntry({
      poolId: pointsPool.id,
      season: 2024,
    })

    const teams = await DatabaseTestUtils.createTestTeams(4) // Need 4 teams for 2 games
    const games = await DatabaseTestUtils.createTestGames(teams, 2, 2024, 1)

    // Create picks with different point values
    const pick1 = await DatabaseTestUtils.createTestPick(
      pointsEntry.id,
      games[0].id,
      teams[0].id
    )
    const pick2 = await DatabaseTestUtils.createTestPick(
      pointsEntry.id,
      games[1].id,
      teams[1].id
    )
    await DatabaseTestUtils.createTestGrade(pick1.id, 'WIN', 2.5)
    await DatabaseTestUtils.createTestGrade(pick2.id, 'WIN', 1.0)

    const standings = await standingsService.getPoolStandings(
      pointsPool.id,
      2024
    )

    expect(standings[0].totalPoints).toBe(3.5)
    expect(standings[0].wins).toBe(2)
  })

  it('should handle survivor pool elimination tracking', async () => {
    const survivorPool = await DatabaseTestUtils.createTestPool({
      name: `Survivor Pool ${Date.now()}`,
      type: 'SURVIVOR',
      season: 2024,
    })

    const survivorEntry = await DatabaseTestUtils.createTestEntry({
      poolId: survivorPool.id,
      season: 2024,
    })

    const teams = await DatabaseTestUtils.createTestTeams(2)
    const games = await DatabaseTestUtils.createTestGames(teams, 1, 2024, 1)

    // Create a losing pick (elimination)
    const pick = await DatabaseTestUtils.createTestPick(
      survivorEntry.id,
      games[0].id,
      teams[0].id
    )
    await DatabaseTestUtils.createTestGrade(pick.id, 'LOSS', 0.0)

    const standings = await standingsService.getPoolStandings(
      survivorPool.id,
      2024
    )

    expect(standings[0].isEliminated).toBe(true)
    expect(standings[0].eliminatedWeek).toBe(1)
  })

  it('should get entry detail with pick history', async () => {
    const pool = await DatabaseTestUtils.createTestPool({
      name: `Detail Test Pool ${Date.now()}`,
      type: 'ATS',
      season: 2024,
    })

    const entry = await DatabaseTestUtils.createTestEntry({
      poolId: pool.id,
      season: 2024,
    })
    const teams = await DatabaseTestUtils.createTestTeams(4) // Need 4 teams for 2 games
    const games = await DatabaseTestUtils.createTestGames(teams, 2, 2024, 1)

    const pick1 = await DatabaseTestUtils.createTestPick(
      entry.id,
      games[0].id,
      teams[0].id
    )
    const pick2 = await DatabaseTestUtils.createTestPick(
      entry.id,
      games[1].id,
      teams[1].id
    )
    await DatabaseTestUtils.createTestGrade(pick1.id, 'WIN', 1.0)
    await DatabaseTestUtils.createTestGrade(pick2.id, 'LOSS', 0.0)

    const entryDetail = await standingsService.getEntryDetail(entry.id, 2024)

    expect(entryDetail.entry.id).toBe(entry.id)
    expect(entryDetail.picks).toHaveLength(2)
    expect(entryDetail.weeklyResults).toHaveLength(1) // Only week 1
    expect(entryDetail.weeklyResults[0].week).toBe(1)
    expect(entryDetail.weeklyResults[0].wins).toBe(1)
    expect(entryDetail.weeklyResults[0].losses).toBe(1)
  })
})
