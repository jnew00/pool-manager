import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PickValidators } from '../pick-validators'
import { SurvivorGradingService } from '@/server/services/survivor-grading.service'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    survivorEntry: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    survivorPick: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    entry: {
      findUnique: vi.fn(),
    },
    team: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    game: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    pool: {
      findUnique: vi.fn(),
    },
    survivorWeekData: {
      upsert: vi.fn(),
    },
  },
}))

describe('Survivor Pool Integration Tests', () => {
  let validators: PickValidators
  let gradingService: SurvivorGradingService

  beforeEach(() => {
    validators = new PickValidators()
    gradingService = new SurvivorGradingService()
    vi.clearAllMocks()
  })

  describe('Full Pick Lifecycle', () => {
    it('should validate, create, and grade a survivor pick through elimination', async () => {
      // Setup: Create survivor entry
      const survivorEntry = {
        id: 'survEntry1',
        entryId: 'entry1',
        poolId: 'pool1',
        isActive: true,
        strikes: 0,
        picks: [],
        entry: {
          id: 'entry1',
          pool: {
            id: 'pool1',
            type: 'SURVIVOR',
            rules: {
              survivor: {
                strikesAllowed: 0,
                tiebreaker: 'POINT_DIFFERENTIAL',
                buybackEnabled: false,
              },
            },
          },
        },
      }

      // Week 1: Make first pick (KC)
      vi.mocked(prisma.survivorEntry.findFirst).mockResolvedValue(
        survivorEntry as any
      )
      vi.mocked(prisma.team.findUnique).mockResolvedValue({
        id: 'team1',
        nflAbbr: 'KC',
      } as any)
      vi.mocked(prisma.game.findUnique).mockResolvedValue({
        id: 'game1',
        week: 1,
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        homeTeam: { nflAbbr: 'KC' },
        awayTeam: { nflAbbr: 'NYJ' },
        marketData: {
          spread: -7,
          moneylineHome: -300,
          moneylineAway: 250,
        },
      } as any)

      // Validate Week 1 pick
      const week1Validation = await validators.validateSurvivorPick(
        'entry1',
        'game1',
        'team1',
        1
      )

      expect(week1Validation.isValid).toBe(true)
      expect(week1Validation.warnings).toContain(
        'KC is a premium team - consider saving for later weeks'
      )

      // Simulate Week 1 win
      vi.mocked(prisma.survivorPick.findUnique).mockResolvedValue({
        id: 'pick1',
        entryId: 'survEntry1',
        week: 1,
        teamId: 'team1',
        gameId: 'game1',
        result: null,
        entry: survivorEntry,
        team: { nflAbbr: 'KC' },
        game: { id: 'game1' },
      } as any)

      const week1Result = await gradingService.gradeSurvivorPick('pick1', {
        homeScore: 31,
        awayScore: 17,
        homeTeamId: 'team1',
        awayTeamId: 'team2',
      })

      expect(week1Result.outcome).toBe('WIN')
      expect(week1Result.marginOfVictory).toBe(14)
      expect(week1Result.isEliminated).toBe(false)

      // Week 2: Try to reuse KC (should fail)
      survivorEntry.picks = [
        { week: 1, teamId: 'team1', team: { nflAbbr: 'KC' } },
      ] as any

      vi.mocked(prisma.survivorEntry.findFirst).mockResolvedValue(
        survivorEntry as any
      )

      const week2InvalidValidation = await validators.validateSurvivorPick(
        'entry1',
        'game2',
        'team1', // Try to use KC again
        2
      )

      expect(week2InvalidValidation.isValid).toBe(false)
      expect(week2InvalidValidation.errors).toContain(
        'KC was already used in week 1'
      )

      // Week 2: Pick different team (BUF)
      vi.mocked(prisma.team.findUnique).mockResolvedValue({
        id: 'team3',
        nflAbbr: 'BUF',
      } as any)

      const week2Validation = await validators.validateSurvivorPick(
        'entry1',
        'game3',
        'team3',
        2
      )

      expect(week2Validation.isValid).toBe(true)

      // Week 3: Pick loses (elimination)
      survivorEntry.picks = [
        { week: 1, teamId: 'team1', team: { nflAbbr: 'KC' }, result: 'WIN' },
        { week: 2, teamId: 'team3', team: { nflAbbr: 'BUF' }, result: 'WIN' },
      ] as any

      vi.mocked(prisma.survivorPick.findUnique).mockResolvedValue({
        id: 'pick3',
        entryId: 'survEntry1',
        week: 3,
        teamId: 'team4',
        gameId: 'game4',
        result: null,
        entry: survivorEntry,
        team: { nflAbbr: 'CIN' },
        game: { id: 'game4' },
      } as any)

      vi.mocked(prisma.survivorEntry.update).mockResolvedValue({
        ...survivorEntry,
        isActive: false,
        eliminatedWeek: 3,
      } as any)

      const week3Result = await gradingService.gradeSurvivorPick('pick3', {
        homeScore: 20,
        awayScore: 23,
        homeTeamId: 'team4',
        awayTeamId: 'team5',
      })

      expect(week3Result.outcome).toBe('LOSS')
      expect(week3Result.isEliminated).toBe(true)
      expect(week3Result.strikesUsed).toBe(0)

      // Week 4: Try to make pick after elimination (should fail)
      survivorEntry.isActive = false
      survivorEntry.eliminatedWeek = 3

      vi.mocked(prisma.survivorEntry.findFirst).mockResolvedValue(
        survivorEntry as any
      )

      const week4Validation = await validators.validateSurvivorPick(
        'entry1',
        'game5',
        'team6',
        4
      )

      expect(week4Validation.isValid).toBe(false)
      expect(week4Validation.errors).toContain('Entry was eliminated in week 3')
    })

    it('should handle strikes and buyback scenarios', async () => {
      // Setup: Entry with strikes allowed
      const survivorEntry = {
        id: 'survEntry2',
        entryId: 'entry2',
        poolId: 'pool2',
        isActive: true,
        strikes: 0,
        eliminatedWeek: null,
        picks: [],
        entry: {
          id: 'entry2',
          pool: {
            id: 'pool2',
            type: 'SURVIVOR',
            rules: {
              survivor: {
                strikesAllowed: 1,
                tiebreaker: 'FEWEST_STRIKES',
                buybackEnabled: true,
                buybackWeek: 5,
                buybackFee: 100,
              },
            },
          },
        },
      }

      // First loss - use strike
      vi.mocked(prisma.survivorPick.findUnique).mockResolvedValue({
        id: 'pick1',
        entryId: 'survEntry2',
        week: 2,
        teamId: 'team1',
        gameId: 'game1',
        result: null,
        entry: survivorEntry,
        team: { nflAbbr: 'MIA' },
        game: { id: 'game1' },
      } as any)

      vi.mocked(prisma.survivorEntry.update).mockResolvedValue({
        ...survivorEntry,
        strikes: 1,
      } as any)

      const firstLossResult = await gradingService.gradeSurvivorPick('pick1', {
        homeScore: 14,
        awayScore: 21,
        homeTeamId: 'team1',
        awayTeamId: 'team2',
      })

      expect(firstLossResult.outcome).toBe('LOSS')
      expect(firstLossResult.isEliminated).toBe(false)
      expect(firstLossResult.strikesUsed).toBe(1)

      // Second loss - eliminate
      survivorEntry.strikes = 1

      vi.mocked(prisma.survivorPick.findUnique).mockResolvedValue({
        id: 'pick2',
        entryId: 'survEntry2',
        week: 4,
        teamId: 'team3',
        gameId: 'game2',
        result: null,
        entry: survivorEntry,
        team: { nflAbbr: 'DET' },
        game: { id: 'game2' },
      } as any)

      vi.mocked(prisma.survivorEntry.update).mockResolvedValue({
        ...survivorEntry,
        isActive: false,
        eliminatedWeek: 4,
      } as any)

      const secondLossResult = await gradingService.gradeSurvivorPick('pick2', {
        homeScore: 10,
        awayScore: 17,
        homeTeamId: 'team3',
        awayTeamId: 'team4',
      })

      expect(secondLossResult.outcome).toBe('LOSS')
      expect(secondLossResult.isEliminated).toBe(true)

      // Week 5 - Process buyback
      vi.mocked(prisma.survivorEntry.findUnique).mockResolvedValue({
        ...survivorEntry,
        isActive: false,
        eliminatedWeek: 4,
      } as any)
      vi.mocked(prisma.game.findFirst).mockResolvedValue({ week: 5 } as any)
      vi.mocked(prisma.survivorEntry.update).mockResolvedValue({
        ...survivorEntry,
        isActive: true,
        eliminatedWeek: null,
        strikes: 0,
      } as any)

      const buybackResult = await gradingService.processBuyback(
        'survEntry2',
        100
      )

      expect(buybackResult.success).toBe(true)
      expect(buybackResult.message).toContain('successful')

      // Can now make picks again
      survivorEntry.isActive = true
      survivorEntry.eliminatedWeek = null
      survivorEntry.strikes = 0

      vi.mocked(prisma.survivorEntry.findFirst).mockResolvedValue(
        survivorEntry as any
      )

      const postBuybackValidation = await validators.validateSurvivorPick(
        'entry2',
        'game3',
        'team5',
        6
      )

      expect(postBuybackValidation.isValid).toBe(true)
    })

    it('should handle pool-wide statistics and determine winners', async () => {
      // Setup multiple entries
      const mockEntries = [
        {
          id: 'survEntry1',
          isActive: true,
          eliminatedWeek: null,
          strikes: 0,
          picks: [
            { week: 10, teamId: 'team1', result: 'WIN', marginOfVictory: 10 },
            { week: 11, teamId: 'team2', result: 'WIN', marginOfVictory: 7 },
          ],
          entry: { user: { name: 'Player1' } },
        },
        {
          id: 'survEntry2',
          isActive: true,
          eliminatedWeek: null,
          strikes: 1,
          picks: [
            { week: 10, teamId: 'team1', result: 'WIN', marginOfVictory: 10 },
            { week: 11, teamId: 'team3', result: 'WIN', marginOfVictory: 3 },
          ],
          entry: { user: { name: 'Player2' } },
        },
        {
          id: 'survEntry3',
          isActive: false,
          eliminatedWeek: 11,
          strikes: 0,
          picks: [
            { week: 10, teamId: 'team4', result: 'WIN', marginOfVictory: 14 },
            { week: 11, teamId: 'team5', result: 'LOSS', marginOfVictory: -6 },
          ],
          entry: { user: { name: 'Player3' } },
        },
      ]

      vi.mocked(prisma.survivorEntry.findMany).mockResolvedValue(
        mockEntries as any
      )
      vi.mocked(prisma.survivorWeekData.upsert).mockResolvedValue({} as any)

      // Calculate week 11 statistics
      const weekStats = await gradingService.updatePoolStatistics('pool1', 11)

      expect(weekStats.totalEntries).toBe(3)
      expect(weekStats.survivorsRemaining).toBe(2)
      expect(weekStats.entriesEliminated).toBe(1)
      expect(weekStats.survivalRate).toBeCloseTo(0.667, 2)
      expect(weekStats.teamPickDistribution.get('team1')).toBeUndefined() // Week 10 pick
      expect(weekStats.teamPickDistribution.get('team2')).toBe(1)
      expect(weekStats.teamPickDistribution.get('team3')).toBe(1)
      expect(weekStats.teamPickDistribution.get('team5')).toBe(1)

      // Determine winners (multiple survivors - use tiebreaker)
      vi.mocked(prisma.survivorEntry.findMany).mockResolvedValue([
        mockEntries[0],
        mockEntries[1],
      ] as any)

      vi.mocked(prisma.pool.findUnique).mockResolvedValue({
        rules: {
          survivor: {
            tiebreaker: 'POINT_DIFFERENTIAL',
          },
        },
      } as any)

      // Mock tiebreaker calculations
      vi.mocked(prisma.survivorEntry.findUnique)
        .mockResolvedValueOnce(mockEntries[0] as any)
        .mockResolvedValueOnce(mockEntries[1] as any)

      vi.mocked(prisma.team.findMany).mockResolvedValue([])
      vi.mocked(prisma.game.findMany).mockResolvedValue([])

      const winners = await gradingService.determinePoolWinners('pool1')

      expect(winners.winners.length).toBeGreaterThan(0)
      expect(winners.tiebreakers.size).toBe(2)

      // Player1 should win with higher point differential (17 vs 13)
      const player1Score = winners.tiebreakers.get('survEntry1')
      const player2Score = winners.tiebreakers.get('survEntry2')

      expect(player1Score?.totalPointDifferential).toBe(17)
      expect(player2Score?.totalPointDifferential).toBe(13)
    })
  })
})
