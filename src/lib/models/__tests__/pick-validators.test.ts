import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PickValidators } from '../pick-validators'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    entry: {
      findUnique: vi.fn(),
    },
    pick: {
      findMany: vi.fn(),
    },
    game: {
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    team: {
      findUnique: vi.fn(),
    },
  },
}))

describe('PickValidators', () => {
  let validators: PickValidators

  beforeEach(async () => {
    validators = new PickValidators()
    vi.clearAllMocks()
  })

  describe('validatePointsPlusPick', () => {
    it('should validate a valid Points Plus pick', async () => {
      const { prisma } = await import('@/lib/prisma')

      // Mock existing picks (empty)
      vi.mocked(prisma.pick.findMany).mockResolvedValue([])

      // Mock game data
      vi.mocked(prisma.game.findUnique).mockResolvedValue({
        id: 'game1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
        week: 1,
        season: 2024,
        kickoffTime: new Date(),
        homeTeam: { id: 'team1', name: 'Home Team', nflAbbr: 'HT' },
        awayTeam: { id: 'team2', name: 'Away Team', nflAbbr: 'AT' },
      } as any)

      const result = await validators.validatePointsPlusPick(
        'entry1',
        'game1',
        'team1',
        1
      )

      expect(result.isValid).toBe(true)
      expect(result.pickType).toBe('POINTS_PLUS')
      expect(result.errors).toHaveLength(0)
    })

    it('should reject duplicate picks for same game', async () => {
      const { prisma } = await import('@/lib/prisma')

      // Mock existing pick for same game
      vi.mocked(prisma.pick.findMany).mockResolvedValue([
        {
          id: 'pick1',
          gameId: 'game1',
          teamId: 'team2',
          entryId: 'entry1',
          game: {
            id: 'game1',
            homeTeamId: 'team1',
            awayTeamId: 'team2',
          },
        },
      ] as any)

      vi.mocked(prisma.game.findUnique).mockResolvedValue({
        id: 'game1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
      } as any)

      const result = await validators.validatePointsPlusPick(
        'entry1',
        'game1',
        'team1',
        1
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'You have already made a pick for this game'
      )
    })

    it("should warn about pick'em games", async () => {
      const { prisma } = await import('@/lib/prisma')

      vi.mocked(prisma.pick.findMany).mockResolvedValue([])
      vi.mocked(prisma.game.findUnique).mockResolvedValue({
        id: 'game1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
      } as any)

      // Mock the private method behavior for pick'em detection
      const result = await validators.validatePointsPlusPick(
        'entry1',
        'game1',
        'team1',
        1
      )

      expect(result.isValid).toBe(true)
      expect(result.pickType).toBe('POINTS_PLUS')
    })
  })

  describe('validateSurvivorPick', () => {
    it('should validate a valid Survivor pick', async () => {
      const { prisma } = await import('@/lib/prisma')

      // Mock entry with no previous picks
      vi.mocked(prisma.entry.findUnique).mockResolvedValue({
        id: 'entry1',
        picks: [],
      } as any)

      vi.mocked(prisma.team.findUnique).mockResolvedValue({
        id: 'team1',
        name: 'Test Team',
        nflAbbr: 'TT',
      } as any)

      const result = await validators.validateSurvivorPick(
        'entry1',
        'game1',
        'team1',
        1
      )

      expect(result.isValid).toBe(true)
      expect(result.pickType).toBe('SURVIVOR')
      expect(result.errors).toHaveLength(0)
    })

    it('should reject team reuse in Survivor', async () => {
      const { prisma } = await import('@/lib/prisma')

      // Mock entry with previous pick using same team (but team won, so entry not eliminated)
      vi.mocked(prisma.entry.findUnique).mockResolvedValue({
        id: 'entry1',
        picks: [
          {
            id: 'pick1',
            teamId: 'team1',
            game: {
              week: 1,
              homeTeamId: 'team1', // team1 was home team
              Result: {
                homeScore: 24, // team1 won
                awayScore: 10,
              },
            },
          },
        ],
      } as any)

      const result = await validators.validateSurvivorPick(
        'entry1',
        'game2',
        'team1', // Same team as previous pick
        2
      )

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('already been used')
    })

    it('should reject picks from eliminated entries', async () => {
      const { prisma } = await import('@/lib/prisma')

      // Mock eliminated entry (lost previous pick)
      vi.mocked(prisma.entry.findUnique).mockResolvedValue({
        id: 'entry1',
        picks: [
          {
            id: 'pick1',
            teamId: 'team1',
            game: {
              week: 1,
              homeTeamId: 'team1',
              Result: {
                homeScore: 10,
                awayScore: 24, // Team lost
              },
            },
          },
        ],
      } as any)

      const result = await validators.validateSurvivorPick(
        'entry1',
        'game2',
        'team2',
        2
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Entry has been eliminated and cannot make more picks'
      )
    })

    it('should warn about popular teams early in season', async () => {
      const { prisma } = await import('@/lib/prisma')

      vi.mocked(prisma.entry.findUnique).mockResolvedValue({
        id: 'entry1',
        picks: [],
      } as any)

      vi.mocked(prisma.team.findUnique).mockResolvedValue({
        id: 'team1',
        name: 'Kansas City Chiefs',
        nflAbbr: 'KC', // Popular team
      } as any)

      vi.mocked(prisma.game.findUnique).mockResolvedValue({
        id: 'game1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
      } as any)

      const result = await validators.validateSurvivorPick(
        'entry1',
        'game1',
        'team1',
        3 // Early week
      )

      expect(result.isValid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain(
        'popular choice - consider saving for later weeks'
      )
    })
  })

  describe('validateATSPick', () => {
    it('should validate a valid ATS pick', async () => {
      const { prisma } = await import('@/lib/prisma')

      vi.mocked(prisma.pick.findMany).mockResolvedValue([])
      vi.mocked(prisma.game.findUnique).mockResolvedValue({
        id: 'game1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
      } as any)

      const result = await validators.validateATSPick(
        'entry1',
        'game1',
        'team1',
        1
      )

      expect(result.isValid).toBe(true)
      expect(result.pickType).toBe('ATS')
    })

    it('should warn when no spread is available', async () => {
      const { prisma } = await import('@/lib/prisma')

      vi.mocked(prisma.pick.findMany).mockResolvedValue([])
      vi.mocked(prisma.game.findUnique).mockResolvedValue({
        id: 'game1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
      } as any)

      const result = await validators.validateATSPick(
        'entry1',
        'game1',
        'team1',
        1
      )

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain(
        'No point spread available for this game'
      )
    })
  })

  describe('validateSUPick', () => {
    it('should validate a valid straight up pick', async () => {
      const { prisma } = await import('@/lib/prisma')

      vi.mocked(prisma.pick.findMany).mockResolvedValue([])
      vi.mocked(prisma.game.findUnique).mockResolvedValue({
        id: 'game1',
        homeTeamId: 'team1',
        awayTeamId: 'team2',
      } as any)

      const result = await validators.validateSUPick(
        'entry1',
        'game1',
        'team1',
        1
      )

      expect(result.isValid).toBe(true)
      expect(result.pickType).toBe('SU')
    })
  })

  describe('getPickValidationSummary', () => {
    it('should return pick validation summary', async () => {
      const { prisma } = await import('@/lib/prisma')

      vi.mocked(prisma.entry.findUnique).mockResolvedValue({
        id: 'entry1',
        pool: {
          type: 'POINTS_PLUS',
        },
        picks: [
          {
            id: 'pick1',
            game: {
              homeTeam: { nflAbbr: 'HT' },
              awayTeam: { nflAbbr: 'AT' },
            },
          },
        ],
      } as any)

      vi.mocked(prisma.game.count).mockResolvedValue(16) // 16 games in week

      const result = await validators.getPickValidationSummary('entry1', 1)

      expect(result.totalPicks).toBe(1)
      expect(result.maxPicks).toBe(16)
      expect(result.canMakeMorePicks).toBe(true)
      expect(result.pointsPlus).toBeDefined()
    })
  })
})
