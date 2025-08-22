import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SurvivorGradingService } from '../survivor-grading.service'
import { prisma } from '@/lib/prisma'
import { PickOutcome } from '@prisma/client'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    survivorPick: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    survivorEntry: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    survivorWeekData: {
      upsert: vi.fn(),
    },
    team: {
      findMany: vi.fn(),
    },
    game: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    pool: {
      findUnique: vi.fn(),
    },
  },
}))

describe('SurvivorGradingService', () => {
  let service: SurvivorGradingService

  beforeEach(() => {
    service = new SurvivorGradingService()
    vi.clearAllMocks()
  })

  describe('gradeSurvivorPick', () => {
    it('should grade a winning pick correctly', async () => {
      const mockPick = {
        id: 'pick1',
        entryId: 'entry1',
        teamId: 'team1',
        week: 5,
        entry: {
          id: 'survEntry1',
          strikes: 0,
          isActive: true,
          entry: {
            pool: {
              rules: {
                survivor: {
                  strikesAllowed: 1,
                  tiebreaker: 'POINT_DIFFERENTIAL',
                },
              },
            },
          },
          picks: [],
        },
        team: { nflAbbr: 'KC' },
        game: { id: 'game1' },
      }

      vi.mocked(prisma.survivorPick.findUnique).mockResolvedValue(
        mockPick as any
      )
      vi.mocked(prisma.survivorPick.update).mockResolvedValue({
        ...mockPick,
        result: 'WIN',
        marginOfVictory: 10,
      } as any)

      const result = await service.gradeSurvivorPick('pick1', {
        homeScore: 27,
        awayScore: 17,
        homeTeamId: 'team1',
        awayTeamId: 'team2',
      })

      expect(result.outcome).toBe('WIN')
      expect(result.marginOfVictory).toBe(10)
      expect(result.isEliminated).toBe(false)
      expect(result.strikesUsed).toBe(0)
    })

    it('should use a strike for first loss when strikes available', async () => {
      const mockPick = {
        id: 'pick1',
        entryId: 'entry1',
        teamId: 'team1',
        week: 5,
        entry: {
          id: 'survEntry1',
          strikes: 0,
          isActive: true,
          entry: {
            pool: {
              rules: {
                survivor: {
                  strikesAllowed: 1,
                  tiebreaker: 'POINT_DIFFERENTIAL',
                },
              },
            },
          },
          picks: [],
        },
        team: { nflAbbr: 'KC' },
        game: { id: 'game1' },
      }

      vi.mocked(prisma.survivorPick.findUnique).mockResolvedValue(
        mockPick as any
      )
      vi.mocked(prisma.survivorEntry.update).mockResolvedValue({
        ...mockPick.entry,
        strikes: 1,
      } as any)

      const result = await service.gradeSurvivorPick('pick1', {
        homeScore: 17,
        awayScore: 27,
        homeTeamId: 'team1',
        awayTeamId: 'team2',
      })

      expect(result.outcome).toBe('LOSS')
      expect(result.isEliminated).toBe(false)
      expect(result.strikesUsed).toBe(1)
      expect(vi.mocked(prisma.survivorEntry.update)).toHaveBeenCalledWith({
        where: { id: 'survEntry1' },
        data: { strikes: 1 },
      })
    })

    it('should eliminate entry when no strikes left', async () => {
      const mockPick = {
        id: 'pick1',
        entryId: 'entry1',
        teamId: 'team1',
        week: 5,
        entry: {
          id: 'survEntry1',
          strikes: 1, // Already used one strike
          isActive: true,
          entry: {
            pool: {
              rules: {
                survivor: {
                  strikesAllowed: 1,
                  tiebreaker: 'POINT_DIFFERENTIAL',
                },
              },
            },
          },
          picks: [],
        },
        team: { nflAbbr: 'KC' },
        game: { id: 'game1' },
      }

      vi.mocked(prisma.survivorPick.findUnique).mockResolvedValue(
        mockPick as any
      )
      vi.mocked(prisma.survivorEntry.update).mockResolvedValue({
        ...mockPick.entry,
        isActive: false,
        eliminatedWeek: 5,
      } as any)

      const result = await service.gradeSurvivorPick('pick1', {
        homeScore: 17,
        awayScore: 27,
        homeTeamId: 'team1',
        awayTeamId: 'team2',
      })

      expect(result.outcome).toBe('LOSS')
      expect(result.isEliminated).toBe(true)
      expect(result.strikesUsed).toBe(1)
      expect(vi.mocked(prisma.survivorEntry.update)).toHaveBeenCalledWith({
        where: { id: 'survEntry1' },
        data: {
          isActive: false,
          eliminatedWeek: 5,
        },
      })
    })
  })

  describe('calculateTiebreakers', () => {
    it('should calculate point differential correctly', async () => {
      const mockEntry = {
        id: 'survEntry1',
        strikes: 1,
        picks: [
          { marginOfVictory: 10, teamId: 'team1' },
          { marginOfVictory: 7, teamId: 'team2' },
          { marginOfVictory: -3, teamId: 'team3' }, // Lost but used strike
          { marginOfVictory: 14, teamId: 'team4' },
        ],
      }

      vi.mocked(prisma.survivorEntry.findUnique).mockResolvedValue(
        mockEntry as any
      )
      vi.mocked(prisma.team.findMany).mockResolvedValue([
        { id: 'team1', nflAbbr: 'KC' },
        { id: 'team2', nflAbbr: 'BUF' },
        { id: 'team3', nflAbbr: 'CIN' },
        { id: 'team4', nflAbbr: 'PHI' },
        { id: 'team5', nflAbbr: 'SF' },
        { id: 'team6', nflAbbr: 'DAL' },
      ] as any)
      vi.mocked(prisma.game.findMany).mockResolvedValue([])

      const result = await service.calculateTiebreakers('survEntry1')

      expect(result.totalPointDifferential).toBe(28) // 10 + 7 - 3 + 14
      expect(result.fewestStrikesUsed).toBe(1)
    })
  })

  describe('updatePoolStatistics', () => {
    it('should calculate pool statistics correctly', async () => {
      const mockEntries = [
        {
          id: 'entry1',
          isActive: true,
          eliminatedWeek: null,
          picks: [{ week: 5, teamId: 'team1', result: 'WIN' }],
        },
        {
          id: 'entry2',
          isActive: true,
          eliminatedWeek: null,
          picks: [{ week: 5, teamId: 'team1', result: 'WIN' }],
        },
        {
          id: 'entry3',
          isActive: false,
          eliminatedWeek: 5,
          picks: [{ week: 5, teamId: 'team2', result: 'LOSS' }],
        },
        {
          id: 'entry4',
          isActive: true,
          eliminatedWeek: null,
          picks: [{ week: 5, teamId: 'team3', result: 'WIN' }],
        },
      ]

      vi.mocked(prisma.survivorEntry.findMany).mockResolvedValue(
        mockEntries as any
      )
      vi.mocked(prisma.survivorWeekData.upsert).mockResolvedValue({} as any)

      const result = await service.updatePoolStatistics('pool1', 5)

      expect(result.totalEntries).toBe(4)
      expect(result.survivorsRemaining).toBe(3)
      expect(result.entriesEliminated).toBe(1)
      expect(result.survivalRate).toBe(0.75)
      expect(result.teamPickDistribution.get('team1')).toBe(2)
      expect(result.eliminationsByTeam.get('team2')).toBe(1)
    })
  })

  describe('processBuyback', () => {
    it('should allow buyback in correct week', async () => {
      const mockEntry = {
        id: 'survEntry1',
        isActive: false,
        eliminatedWeek: 3,
        entry: {
          pool: {
            rules: {
              survivor: {
                buybackEnabled: true,
                buybackWeek: 5,
                buybackFee: 50,
              },
            },
          },
        },
      }

      vi.mocked(prisma.survivorEntry.findUnique).mockResolvedValue(
        mockEntry as any
      )
      vi.mocked(prisma.game.findFirst).mockResolvedValue({ week: 5 } as any)
      vi.mocked(prisma.survivorEntry.update).mockResolvedValue({
        ...mockEntry,
        isActive: true,
        eliminatedWeek: null,
        strikes: 0,
      } as any)

      const result = await service.processBuyback('survEntry1', 50)

      expect(result.success).toBe(true)
      expect(result.message).toContain('successful')
      expect(vi.mocked(prisma.survivorEntry.update)).toHaveBeenCalledWith({
        where: { id: 'survEntry1' },
        data: {
          isActive: true,
          eliminatedWeek: null,
          strikes: 0,
        },
      })
    })

    it('should reject buyback in wrong week', async () => {
      const mockEntry = {
        id: 'survEntry1',
        isActive: false,
        eliminatedWeek: 3,
        entry: {
          pool: {
            rules: {
              survivor: {
                buybackEnabled: true,
                buybackWeek: 5,
                buybackFee: 50,
              },
            },
          },
        },
      }

      vi.mocked(prisma.survivorEntry.findUnique).mockResolvedValue(
        mockEntry as any
      )
      vi.mocked(prisma.game.findFirst).mockResolvedValue({ week: 6 } as any)

      const result = await service.processBuyback('survEntry1', 50)

      expect(result.success).toBe(false)
      expect(result.message).toContain('only allowed in week 5')
    })

    it('should reject buyback for active entry', async () => {
      const mockEntry = {
        id: 'survEntry1',
        isActive: true,
        eliminatedWeek: null,
        entry: {
          pool: {
            rules: {
              survivor: {
                buybackEnabled: true,
                buybackWeek: 5,
                buybackFee: 50,
              },
            },
          },
        },
      }

      vi.mocked(prisma.survivorEntry.findUnique).mockResolvedValue(
        mockEntry as any
      )

      const result = await service.processBuyback('survEntry1', 50)

      expect(result.success).toBe(false)
      expect(result.message).toContain('still active')
    })
  })

  describe('determinePoolWinners', () => {
    it('should identify single winner when one survivor remains', async () => {
      const mockEntries = [
        {
          id: 'survEntry1',
          isActive: true,
          entry: {
            user: { name: 'Winner' },
          },
        },
      ]

      vi.mocked(prisma.survivorEntry.findMany).mockResolvedValue(
        mockEntries as any
      )

      const result = await service.determinePoolWinners('pool1')

      expect(result.winners).toEqual(['survEntry1'])
      expect(result.tiebreakers.size).toBe(0)
    })

    it('should use tiebreakers for multiple survivors', async () => {
      const mockEntries = [
        {
          id: 'survEntry1',
          isActive: true,
          entry: {
            user: { name: 'Player1' },
          },
        },
        {
          id: 'survEntry2',
          isActive: true,
          entry: {
            user: { name: 'Player2' },
          },
        },
      ]

      vi.mocked(prisma.survivorEntry.findMany).mockResolvedValue(
        mockEntries as any
      )
      vi.mocked(prisma.pool.findUnique).mockResolvedValue({
        rules: {
          survivor: {
            tiebreaker: 'POINT_DIFFERENTIAL',
          },
        },
      } as any)

      // Mock tiebreaker calculations
      vi.mocked(prisma.survivorEntry.findUnique)
        .mockResolvedValueOnce({
          id: 'survEntry1',
          strikes: 0,
          picks: [{ marginOfVictory: 10 }, { marginOfVictory: 7 }],
        } as any)
        .mockResolvedValueOnce({
          id: 'survEntry2',
          strikes: 1,
          picks: [{ marginOfVictory: 14 }, { marginOfVictory: 3 }],
        } as any)

      vi.mocked(prisma.team.findMany).mockResolvedValue([])
      vi.mocked(prisma.game.findMany).mockResolvedValue([])

      const result = await service.determinePoolWinners('pool1')

      expect(result.winners.length).toBeGreaterThan(0)
      expect(result.tiebreakers.size).toBe(2)
    })
  })
})
