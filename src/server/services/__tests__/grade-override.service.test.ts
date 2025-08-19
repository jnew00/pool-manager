import { describe, it, expect, beforeEach } from 'vitest'
import { GradeOverrideService } from '../grade-override.service'
import { GradingService } from '../grading.service'
import { DatabaseTestUtils } from '@/lib/test-utils/database'
import { prisma } from '@/lib/prisma'

describe('GradeOverrideService', () => {
  let gradeOverrideService: GradeOverrideService
  let gradingService: GradingService

  beforeEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
    gradeOverrideService = new GradeOverrideService()
    gradingService = new GradingService()
  })

  it('should manually override a pick grade with reason', async () => {
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
        homeScore: 21,
        awayScore: 24,
        status: 'FINAL',
      },
    })

    // Grade normally first (should be LOSS)
    await gradingService.gradePicksForGame(game.id)

    const originalGrade = await prisma.grade.findUnique({
      where: { pickId: pick.id },
    })
    expect(originalGrade?.outcome).toBe('LOSS')

    // Override to WIN due to referee error
    const overriddenGrade = await gradeOverrideService.overrideGrade(
      pick.id,
      'WIN',
      1.0,
      'Referee incorrectly called touchdown back - official review confirmed win'
    )

    expect(overriddenGrade.outcome).toBe('WIN')
    expect(Number(overriddenGrade.points)).toBe(1.0)
    expect(overriddenGrade.details).toMatchObject({
      isManualOverride: true,
      overrideReason:
        'Referee incorrectly called touchdown back - official review confirmed win',
      originalOutcome: 'LOSS',
      originalPoints: 0,
    })
  })

  it('should track override history for audit purposes', async () => {
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
        homeScore: 21,
        awayScore: 21,
        status: 'FINAL',
      },
    })

    // Grade normally (PUSH)
    await gradingService.gradePicksForGame(game.id)

    // First override to WIN
    await gradeOverrideService.overrideGrade(
      pick.id,
      'WIN',
      1.0,
      'Game delayed by weather, home team awarded win'
    )

    // Second override to VOID
    await gradeOverrideService.overrideGrade(
      pick.id,
      'VOID',
      0.0,
      'Game officially cancelled due to severe weather'
    )

    const overrideHistory = await gradeOverrideService.getOverrideHistory(
      pick.id
    )

    expect(overrideHistory).toHaveLength(2)
    expect(overrideHistory[0].newOutcome).toBe('WIN')
    expect(overrideHistory[1].newOutcome).toBe('VOID')
    expect(overrideHistory[1].reason).toBe(
      'Game officially cancelled due to severe weather'
    )
  })

  it('should require valid reason for override', async () => {
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

    const pick = await prisma.pick.create({
      data: {
        entryId: entry.id,
        gameId: game.id,
        teamId: homeTeam.id,
        confidence: 75,
      },
    })

    await expect(
      gradeOverrideService.overrideGrade(pick.id, 'WIN', 1.0, '')
    ).rejects.toThrow('Override reason is required')

    await expect(
      gradeOverrideService.overrideGrade(pick.id, 'WIN', 1.0, 'x')
    ).rejects.toThrow('Override reason must be at least 10 characters')
  })

  it('should bulk override multiple picks for same game', async () => {
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
    const entry1 = await DatabaseTestUtils.createTestEntry({
      poolId: pool.id,
      season: 2024,
    })
    const pool2 = await DatabaseTestUtils.createTestPool({
      type: 'ATS',
      season: 2024,
    })
    const entry2 = await DatabaseTestUtils.createTestEntry({
      poolId: pool2.id,
      season: 2024,
    })

    const pick1 = await prisma.pick.create({
      data: {
        entryId: entry1.id,
        gameId: game.id,
        teamId: homeTeam.id,
        confidence: 75,
      },
    })

    const pick2 = await prisma.pick.create({
      data: {
        entryId: entry2.id,
        gameId: game.id,
        teamId: awayTeam.id,
        confidence: 80,
      },
    })

    await prisma.result.create({
      data: {
        gameId: game.id,
        homeScore: 21,
        awayScore: 24,
        status: 'FINAL',
      },
    })

    // Grade normally first
    await gradingService.gradePicksForGame(game.id)

    // Bulk override all picks for this game to VOID
    const overrides = await gradeOverrideService.bulkOverrideGamePicks(
      game.id,
      'VOID',
      0.0,
      'Game suspended due to power outage, declared no contest'
    )

    expect(overrides).toHaveLength(2)
    expect(overrides[0].outcome).toBe('VOID')
    expect(overrides[1].outcome).toBe('VOID')
  })

  it('should get override statistics for reporting', async () => {
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
        homeScore: 21,
        awayScore: 24,
        status: 'FINAL',
      },
    })

    await gradingService.gradePicksForGame(game.id)
    await gradeOverrideService.overrideGrade(
      pick.id,
      'WIN',
      1.0,
      'Test override for reporting'
    )

    const stats = await gradeOverrideService.getOverrideStats(2024, 1)

    expect(stats.totalOverrides).toBe(1)
    expect(stats.overridesByOutcome.WIN).toBe(1)
    expect(stats.gamesWithOverrides).toBe(1)
  })
})
