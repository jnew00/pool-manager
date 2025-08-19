import { prisma } from '@/lib/prisma'
import { BaseService } from './base.service'
import type { Entry, PoolType, PickOutcome } from '@/lib/types/database'

export interface StandingEntry {
  entryId: string
  rank: number
  wins: number
  losses: number
  pushes: number
  voids: number
  totalPicks: number
  totalPoints: number
  winPercentage: number
  isEliminated?: boolean
  eliminatedWeek?: number
}

export interface WeeklyResult {
  week: number
  wins: number
  losses: number
  pushes: number
  voids: number
  totalPoints: number
}

export interface PickDetail {
  id: string
  gameId: string
  teamId: string
  confidence: number
  outcome?: PickOutcome
  points?: number
  week: number
  game: {
    homeTeam: { nflAbbr: string; name: string }
    awayTeam: { nflAbbr: string; name: string }
    kickoff: Date
  }
  team: {
    nflAbbr: string
    name: string
  }
  grade?: {
    outcome: PickOutcome
    points: number
  }
}

export interface EntryDetail {
  entry: {
    id: string
    poolId: string
    season: number
  }
  standing: StandingEntry
  picks: PickDetail[]
  weeklyResults: WeeklyResult[]
}

export class StandingsService extends BaseService {
  /**
   * Get overall standings for a pool in a season
   */
  async getPoolStandings(
    poolId: string,
    season: number
  ): Promise<StandingEntry[]> {
    this.validateRequired(poolId, 'Pool ID')
    this.validateRequired(season, 'Season')

    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
      select: { type: true },
    })

    if (!pool) {
      throw new Error('Pool not found')
    }

    const entries = await prisma.entry.findMany({
      where: { poolId, season },
      include: {
        picks: {
          include: {
            grade: true,
            game: {
              select: { week: true },
            },
          },
        },
      },
    })

    const standings = entries.map((entry) =>
      this.calculateEntryStanding(entry, pool.type)
    )

    // Sort by wins (desc), then by win percentage (desc), then by total points (desc)
    standings.sort((a, b) => {
      if (a.wins !== b.wins) return b.wins - a.wins
      if (a.winPercentage !== b.winPercentage)
        return b.winPercentage - a.winPercentage
      return b.totalPoints - a.totalPoints
    })

    // Assign ranks
    standings.forEach((standing, index) => {
      standing.rank = index + 1
    })

    return standings
  }

  /**
   * Get standings for a specific week
   */
  async getWeeklyStandings(
    poolId: string,
    season: number,
    week: number
  ): Promise<StandingEntry[]> {
    this.validateRequired(poolId, 'Pool ID')
    this.validateRequired(season, 'Season')
    this.validateRequired(week, 'Week')

    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
      select: { type: true },
    })

    if (!pool) {
      throw new Error('Pool not found')
    }

    const entries = await prisma.entry.findMany({
      where: { poolId, season },
      include: {
        picks: {
          where: {
            game: { week },
          },
          include: {
            grade: true,
            game: {
              select: { week: true },
            },
          },
        },
      },
    })

    const standings = entries.map((entry) =>
      this.calculateEntryStanding(entry, pool.type)
    )

    standings.sort((a, b) => {
      if (a.wins !== b.wins) return b.wins - a.wins
      if (a.winPercentage !== b.winPercentage)
        return b.winPercentage - a.winPercentage
      return b.totalPoints - a.totalPoints
    })

    standings.forEach((standing, index) => {
      standing.rank = index + 1
    })

    return standings
  }

  /**
   * Get detailed view of an entry's performance
   */
  async getEntryDetail(entryId: string, season: number): Promise<EntryDetail> {
    this.validateRequired(entryId, 'Entry ID')
    this.validateRequired(season, 'Season')

    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      include: {
        pool: {
          select: { type: true },
        },
        picks: {
          include: {
            grade: true,
            game: {
              include: {
                homeTeam: { select: { nflAbbr: true, name: true } },
                awayTeam: { select: { nflAbbr: true, name: true } },
              },
            },
            team: {
              select: { nflAbbr: true, name: true },
            },
          },
          orderBy: [{ game: { week: 'asc' } }, { game: { kickoff: 'asc' } }],
        },
      },
    })

    if (!entry) {
      throw new Error('Entry not found')
    }

    const standing = this.calculateEntryStanding(entry, entry.pool.type)

    const picks: PickDetail[] = entry.picks.map((pick) => ({
      id: pick.id,
      gameId: pick.gameId,
      teamId: pick.teamId,
      confidence: Number(pick.confidence),
      outcome: pick.grade?.outcome,
      points: pick.grade ? Number(pick.grade.points) : undefined,
      week: pick.game.week,
      game: {
        homeTeam: pick.game.homeTeam,
        awayTeam: pick.game.awayTeam,
        kickoff: pick.game.kickoff,
      },
      team: pick.team,
      grade: pick.grade
        ? {
            outcome: pick.grade.outcome,
            points: Number(pick.grade.points),
          }
        : undefined,
    }))

    const weeklyResults = this.calculateWeeklyResults(entry.picks)

    return {
      entry: {
        id: entry.id,
        poolId: entry.poolId,
        season: entry.season,
      },
      standing,
      picks,
      weeklyResults,
    }
  }

  /**
   * Calculate standing for a single entry
   */
  private calculateEntryStanding(
    entry: any,
    poolType: PoolType
  ): StandingEntry {
    let wins = 0
    let losses = 0
    let pushes = 0
    let voids = 0
    let totalPoints = 0
    let isEliminated = false
    let eliminatedWeek: number | undefined

    entry.picks.forEach((pick: any) => {
      if (pick.grade) {
        const points = Number(pick.grade.points)
        totalPoints += points

        switch (pick.grade.outcome) {
          case 'WIN':
            wins++
            break
          case 'LOSS':
            losses++
            // Check for survivor elimination
            if (poolType === 'SURVIVOR') {
              isEliminated = true
              if (!eliminatedWeek || pick.game.week < eliminatedWeek) {
                eliminatedWeek = pick.game.week
              }
            }
            break
          case 'PUSH':
            pushes++
            break
          case 'VOID':
            voids++
            break
        }
      }
    })

    const totalDecisivePicks = wins + losses
    const winPercentage = totalDecisivePicks > 0 ? wins / totalDecisivePicks : 0

    return {
      entryId: entry.id,
      rank: 0, // Will be set later
      wins,
      losses,
      pushes,
      voids,
      totalPicks: entry.picks.length,
      totalPoints,
      winPercentage,
      isEliminated: poolType === 'SURVIVOR' ? isEliminated : undefined,
      eliminatedWeek: poolType === 'SURVIVOR' ? eliminatedWeek : undefined,
    }
  }

  /**
   * Calculate weekly results for an entry
   */
  private calculateWeeklyResults(picks: any[]): WeeklyResult[] {
    const weeklyMap = new Map<number, WeeklyResult>()

    picks.forEach((pick) => {
      const week = pick.game.week

      if (!weeklyMap.has(week)) {
        weeklyMap.set(week, {
          week,
          wins: 0,
          losses: 0,
          pushes: 0,
          voids: 0,
          totalPoints: 0,
        })
      }

      const weekResult = weeklyMap.get(week)!

      if (pick.grade) {
        const points = Number(pick.grade.points)
        weekResult.totalPoints += points

        switch (pick.grade.outcome) {
          case 'WIN':
            weekResult.wins++
            break
          case 'LOSS':
            weekResult.losses++
            break
          case 'PUSH':
            weekResult.pushes++
            break
          case 'VOID':
            weekResult.voids++
            break
        }
      }
    })

    return Array.from(weeklyMap.values()).sort((a, b) => a.week - b.week)
  }
}
