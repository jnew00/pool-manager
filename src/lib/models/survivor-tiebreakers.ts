/**
 * Survivor Pool Tiebreaker Systems
 *
 * Implements various tiebreaker methods for determining winners
 * when multiple entries survive the entire season.
 */

import { prisma } from '@/lib/prisma'

export interface TiebreakerResult {
  entryId: string
  rank: number
  score: number
  details: Record<string, any>
}

export type TiebreakerMethod =
  | 'CUMULATIVE_MOV' // Total margin of victory
  | 'UNUSED_RECORD' // Combined record of unused teams
  | 'FEWEST_STRIKES' // Least strikes used
  | 'EARLIEST_ELIMINATION' // For eliminated entries, who lasted longest
  | 'RANDOM' // Random selection

export class SurvivorTiebreaker {
  /**
   * Calculate tiebreaker rankings for surviving entries
   */
  async calculateRankings(
    poolId: string,
    survivingEntryIds: string[],
    methods: TiebreakerMethod[]
  ): Promise<TiebreakerResult[]> {
    const results: Map<string, TiebreakerResult> = new Map()

    // Initialize results for each entry
    for (const entryId of survivingEntryIds) {
      results.set(entryId, {
        entryId,
        rank: 1,
        score: 0,
        details: {},
      })
    }

    // Apply each tiebreaker method in order
    for (const method of methods) {
      const methodResults = await this.applyTiebreakerMethod(
        poolId,
        survivingEntryIds,
        method
      )

      // Update results with method scores
      for (const methodResult of methodResults) {
        const existing = results.get(methodResult.entryId)!
        existing.score +=
          methodResult.score *
          1000 ** (methods.length - methods.indexOf(method))
        existing.details[method] = methodResult.details
      }
    }

    // Calculate final rankings
    const sortedResults = Array.from(results.values()).sort(
      (a, b) => b.score - a.score
    )

    let currentRank = 1
    let previousScore = sortedResults[0]?.score

    for (let i = 0; i < sortedResults.length; i++) {
      if (sortedResults[i].score < previousScore) {
        currentRank = i + 1
        previousScore = sortedResults[i].score
      }
      sortedResults[i].rank = currentRank
    }

    return sortedResults
  }

  /**
   * Apply a specific tiebreaker method
   */
  private async applyTiebreakerMethod(
    poolId: string,
    entryIds: string[],
    method: TiebreakerMethod
  ): Promise<TiebreakerResult[]> {
    switch (method) {
      case 'CUMULATIVE_MOV':
        return this.calculateCumulativeMOV(entryIds)

      case 'UNUSED_RECORD':
        return this.calculateUnusedTeamsRecord(poolId, entryIds)

      case 'FEWEST_STRIKES':
        return this.calculateFewestStrikes(entryIds)

      case 'EARLIEST_ELIMINATION':
        return this.calculateEarliestElimination(entryIds)

      case 'RANDOM':
        return this.calculateRandom(entryIds)

      default:
        throw new Error(`Unknown tiebreaker method: ${method}`)
    }
  }

  /**
   * Calculate cumulative margin of victory
   */
  private async calculateCumulativeMOV(
    entryIds: string[]
  ): Promise<TiebreakerResult[]> {
    const results: TiebreakerResult[] = []

    for (const entryId of entryIds) {
      const picks = await prisma.survivorPick.findMany({
        where: {
          entryId,
          result: 'WIN',
        },
        select: {
          marginOfVictory: true,
        },
      })

      const totalMOV = picks.reduce(
        (sum, pick) => sum + (pick.marginOfVictory || 0),
        0
      )

      results.push({
        entryId,
        rank: 0,
        score: totalMOV,
        details: {
          totalMOV,
          winCount: picks.length,
          averageMOV: picks.length > 0 ? totalMOV / picks.length : 0,
        },
      })
    }

    return results
  }

  /**
   * Calculate combined record of unused teams
   */
  private async calculateUnusedTeamsRecord(
    poolId: string,
    entryIds: string[]
  ): Promise<TiebreakerResult[]> {
    const results: TiebreakerResult[] = []

    // Get all teams
    const allTeams = await prisma.team.findMany({
      select: { id: true },
    })

    for (const entryId of entryIds) {
      // Get used teams
      const usedTeams = await prisma.survivorPick.findMany({
        where: { entryId },
        select: { teamId: true },
        distinct: ['teamId'],
      })

      const usedTeamIds = new Set(usedTeams.map((p) => p.teamId))
      const unusedTeamIds = allTeams
        .filter((t) => !usedTeamIds.has(t.id))
        .map((t) => t.id)

      // Calculate combined record of unused teams
      const currentWeek = await this.getCurrentWeek()
      let totalWins = 0
      let totalLosses = 0

      for (const teamId of unusedTeamIds) {
        const wins = await prisma.game.count({
          where: {
            week: { lte: currentWeek },
            OR: [
              {
                homeTeamId: teamId,
                homeScore: { gt: prisma.game.fields.awayScore },
              },
              {
                awayTeamId: teamId,
                awayScore: { gt: prisma.game.fields.homeScore },
              },
            ],
          },
        })

        const losses = await prisma.game.count({
          where: {
            week: { lte: currentWeek },
            OR: [
              {
                homeTeamId: teamId,
                homeScore: { lt: prisma.game.fields.awayScore },
              },
              {
                awayTeamId: teamId,
                awayScore: { lt: prisma.game.fields.homeScore },
              },
            ],
          },
        })

        totalWins += wins
        totalLosses += losses
      }

      const winPercentage =
        totalWins + totalLosses > 0 ? totalWins / (totalWins + totalLosses) : 0

      results.push({
        entryId,
        rank: 0,
        score: winPercentage * 1000, // Scale for sorting
        details: {
          unusedTeamsCount: unusedTeamIds.length,
          combinedWins: totalWins,
          combinedLosses: totalLosses,
          winPercentage: winPercentage.toFixed(3),
        },
      })
    }

    return results
  }

  /**
   * Calculate fewest strikes used
   */
  private async calculateFewestStrikes(
    entryIds: string[]
  ): Promise<TiebreakerResult[]> {
    const results: TiebreakerResult[] = []

    for (const entryId of entryIds) {
      const entry = await prisma.survivorEntry.findUnique({
        where: { id: entryId },
        select: { strikes: true },
      })

      // Invert strikes for scoring (fewer strikes = higher score)
      const score = 100 - (entry?.strikes || 0) * 10

      results.push({
        entryId,
        rank: 0,
        score,
        details: {
          strikesUsed: entry?.strikes || 0,
        },
      })
    }

    return results
  }

  /**
   * Calculate earliest elimination (for eliminated entries)
   */
  private async calculateEarliestElimination(
    entryIds: string[]
  ): Promise<TiebreakerResult[]> {
    const results: TiebreakerResult[] = []

    for (const entryId of entryIds) {
      const entry = await prisma.survivorEntry.findUnique({
        where: { id: entryId },
        select: { eliminatedWeek: true },
      })

      // Later elimination = higher score
      const score = entry?.eliminatedWeek || 18

      results.push({
        entryId,
        rank: 0,
        score,
        details: {
          eliminatedWeek: entry?.eliminatedWeek || null,
          survivedWeeks: entry?.eliminatedWeek ? entry.eliminatedWeek - 1 : 18,
        },
      })
    }

    return results
  }

  /**
   * Random tiebreaker (last resort)
   */
  private calculateRandom(entryIds: string[]): TiebreakerResult[] {
    return entryIds.map((entryId) => ({
      entryId,
      rank: 0,
      score: Math.random() * 100,
      details: {
        randomValue: Math.random(),
      },
    }))
  }

  /**
   * Get current NFL week
   */
  private async getCurrentWeek(): Promise<number> {
    const now = new Date()
    const seasonStart = new Date('2024-09-05')
    const weeksSinceStart = Math.floor(
      (now.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
    )
    return Math.min(Math.max(1, weeksSinceStart + 1), 18)
  }

  /**
   * Calculate head-to-head record between two entries
   */
  async calculateHeadToHead(
    entry1Id: string,
    entry2Id: string
  ): Promise<{ entry1Wins: number; entry2Wins: number; ties: number }> {
    const entry1Picks = await prisma.survivorPick.findMany({
      where: { entryId: entry1Id },
      orderBy: { week: 'asc' },
    })

    const entry2Picks = await prisma.survivorPick.findMany({
      where: { entryId: entry2Id },
      orderBy: { week: 'asc' },
    })

    let entry1Wins = 0
    let entry2Wins = 0
    let ties = 0

    // Compare week by week
    const maxWeek = Math.max(
      entry1Picks[entry1Picks.length - 1]?.week || 0,
      entry2Picks[entry2Picks.length - 1]?.week || 0
    )

    for (let week = 1; week <= maxWeek; week++) {
      const pick1 = entry1Picks.find((p) => p.week === week)
      const pick2 = entry2Picks.find((p) => p.week === week)

      if (!pick1 || !pick2) continue

      if (pick1.result === 'WIN' && pick2.result === 'LOSS') {
        entry1Wins++
      } else if (pick1.result === 'LOSS' && pick2.result === 'WIN') {
        entry2Wins++
      } else if (
        pick1.result === pick2.result &&
        pick1.marginOfVictory &&
        pick2.marginOfVictory
      ) {
        // Both won or both lost - compare MOV
        if (pick1.marginOfVictory > pick2.marginOfVictory) {
          entry1Wins++
        } else if (pick2.marginOfVictory > pick1.marginOfVictory) {
          entry2Wins++
        } else {
          ties++
        }
      } else {
        ties++
      }
    }

    return { entry1Wins, entry2Wins, ties }
  }

  /**
   * Determine final pool winners with tiebreakers
   */
  async determineFinalWinners(
    poolId: string,
    maxWinners: number = 1
  ): Promise<Array<{ entryId: string; rank: number; prize?: number }>> {
    // Get all active entries
    const activeEntries = await prisma.survivorEntry.findMany({
      where: {
        poolId,
        eliminatedWeek: null,
      },
      select: { id: true },
    })

    if (activeEntries.length === 0) {
      // No survivors - find who lasted longest
      const eliminatedEntries = await prisma.survivorEntry.findMany({
        where: { poolId },
        orderBy: { eliminatedWeek: 'desc' },
        take: maxWinners,
        select: { id: true, eliminatedWeek: true },
      })

      return eliminatedEntries.map((entry, index) => ({
        entryId: entry.id,
        rank: index + 1,
      }))
    }

    if (activeEntries.length <= maxWinners) {
      // All survivors are winners
      return activeEntries.map((entry, index) => ({
        entryId: entry.id,
        rank: index + 1,
      }))
    }

    // Apply tiebreakers
    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
      select: { rules: true },
    })

    const tiebreakerMethods = (pool?.rules as any)?.tiebreakerMethods || [
      'CUMULATIVE_MOV',
      'UNUSED_RECORD',
      'FEWEST_STRIKES',
    ]

    const rankings = await this.calculateRankings(
      poolId,
      activeEntries.map((e) => e.id),
      tiebreakerMethods
    )

    return rankings.slice(0, maxWinners).map((r) => ({
      entryId: r.entryId,
      rank: r.rank,
    }))
  }
}
