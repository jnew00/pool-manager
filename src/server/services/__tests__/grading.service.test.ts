import { describe, it, expect, beforeEach } from 'vitest'
import { GradingService } from '../grading.service'
import { DatabaseTestUtils } from '@/lib/test-utils/database'
import { prisma } from '@/lib/prisma'

describe('GradingService', () => {
  let gradingService: GradingService

  beforeEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
    gradingService = new GradingService()
  })

  it('should grade ATS picks correctly for completed game', async () => {
    const teams = await DatabaseTestUtils.createTestTeams(4)
    expect(teams.length).toBeGreaterThan(1)
    const homeTeam = teams[0]
    const awayTeam = teams[1]

    const game = await DatabaseTestUtils.createTestGame(
      homeTeam.id,
      awayTeam.id,
      {
        week: 1,
        season: 2024,
        status: 'FINAL',
      }
    )

    const pool = await DatabaseTestUtils.createTestPool({
      type: 'ATS',
      season: 2024,
    })

    const entry = await DatabaseTestUtils.createTestEntry({
      poolId: pool.id,
      season: 2024,
    })

    const pick = await prisma.pick.create({
      data: {
        entryId: entry.id,
        gameId: game.id,
        teamId: homeTeam.id,
        confidence: 75,
      },
    })

    await prisma.result.create({
      data: {
        gameId: game.id,
        homeScore: 24,
        awayScore: 17,
        status: 'FINAL',
      },
    })

    const grades = await gradingService.gradePicksForGame(game.id)

    expect(grades).toHaveLength(1)
    expect(grades[0].outcome).toBe('WIN')
    expect(Number(grades[0].points)).toBe(1.0)
  })

  it('should handle tie games as pushes', async () => {
    const teams = await DatabaseTestUtils.createTestTeams(2)
    const homeTeam = teams[0]
    const awayTeam = teams[1]

    const game = await DatabaseTestUtils.createTestGame(
      homeTeam.id,
      awayTeam.id,
      { week: 1, season: 2024, status: 'FINAL' }
    )

    const pool = await DatabaseTestUtils.createTestPool({
      type: 'ATS',
      season: 2024,
    })
    const entry = await DatabaseTestUtils.createTestEntry({
      poolId: pool.id,
      season: 2024,
    })

    await prisma.pick.create({
      data: {
        entryId: entry.id,
        gameId: game.id,
        teamId: homeTeam.id,
        confidence: 75,
      },
    })

    await prisma.result.create({
      data: {
        gameId: game.id,
        homeScore: 21,
        awayScore: 21,
        status: 'FINAL',
      },
    })

    const grades = await gradingService.gradePicksForGame(game.id)

    expect(grades).toHaveLength(1)
    expect(grades[0].outcome).toBe('PUSH')
    expect(Number(grades[0].points)).toBe(0.5)
  })

  it('should handle points-plus picks with confidence weighting', async () => {
    const teams = await DatabaseTestUtils.createTestTeams(2)
    const homeTeam = teams[0]
    const awayTeam = teams[1]

    const game = await DatabaseTestUtils.createTestGame(
      homeTeam.id,
      awayTeam.id,
      { week: 1, season: 2024, status: 'FINAL' }
    )

    const pool = await DatabaseTestUtils.createTestPool({
      type: 'POINTS_PLUS',
      season: 2024,
    })
    const entry = await DatabaseTestUtils.createTestEntry({
      poolId: pool.id,
      season: 2024,
    })

    await prisma.pick.create({
      data: {
        entryId: entry.id,
        gameId: game.id,
        teamId: homeTeam.id,
        confidence: 90,
      },
    })

    await prisma.result.create({
      data: {
        gameId: game.id,
        homeScore: 28,
        awayScore: 14,
        status: 'FINAL',
      },
    })

    const grades = await gradingService.gradePicksForGame(game.id)

    expect(grades).toHaveLength(1)
    expect(grades[0].outcome).toBe('WIN')
    expect(Number(grades[0].points)).toBe(1.8) // 90% confidence = 1.8 points
  })

  it('should not grade picks for games without results', async () => {
    const teams = await DatabaseTestUtils.createTestTeams(2)
    const homeTeam = teams[0]
    const awayTeam = teams[1]

    const game = await DatabaseTestUtils.createTestGame(
      homeTeam.id,
      awayTeam.id,
      { week: 1, season: 2024, status: 'SCHEDULED' }
    )

    await expect(gradingService.gradePicksForGame(game.id)).rejects.toThrow(
      'Game result not found'
    )
  })
})
