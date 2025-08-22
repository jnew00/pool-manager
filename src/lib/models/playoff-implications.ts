import { PrismaClient } from '@prisma/client'
import { prisma as globalPrisma } from '@/lib/prisma'

export interface TeamPlayoffImplications {
  inPlayoffContention: boolean
  playoffPressure: number // 0-1 scale
  record: {
    wins: number
    losses: number
    winPercentage: number
  }
  motivation: number // 0-1 scale based on playoff stakes
}

export interface PlayoffImplicationsResult {
  homeMotivation: number
  awayMotivation: number
  implications: {
    home: TeamPlayoffImplications
    away: TeamPlayoffImplications
  }
  weeklyContext: {
    week: number
    isLateSeeason: boolean
    isPlayoffWeek: boolean
  }
}

/**
 * Analyzes playoff implications and motivation for teams
 */
export class PlayoffImplicationsAnalyzer {
  private prisma: PrismaClient

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || globalPrisma
  }

  /**
   * Analyze playoff implications for both teams
   */
  async analyzePlayoffImplications(
    homeTeamId: string,
    awayTeamId: string,
    season: number,
    week: number
  ): Promise<PlayoffImplicationsResult> {
    const [homeImplications, awayImplications] = await Promise.all([
      this.analyzeTeamPlayoffSituation(homeTeamId, season, week),
      this.analyzeTeamPlayoffSituation(awayTeamId, season, week),
    ])

    // Calculate motivation based on playoff implications
    const homeMotivation = this.calculateMotivation(homeImplications, week)
    const awayMotivation = this.calculateMotivation(awayImplications, week)

    return {
      homeMotivation,
      awayMotivation,
      implications: {
        home: homeImplications,
        away: awayImplications,
      },
      weeklyContext: {
        week,
        isLateSeeason: week >= 14,
        isPlayoffWeek: week >= 18, // Wild card week
      },
    }
  }

  /**
   * Analyze a single team's playoff situation
   */
  private async analyzeTeamPlayoffSituation(
    teamId: string,
    season: number,
    week: number
  ): Promise<TeamPlayoffImplications> {
    // Get team's record up to current week
    // For now, we'll return default values since we don't have game result data in the schema
    // TODO: Add game results table or modify Game model to include scores
    const games: any[] = []

    let wins = 0
    let losses = 0

    // Since we don't have game results in the current schema,
    // we'll use default values for now
    // In a real implementation, this would query actual game results

    const totalGames = wins + losses
    const winPercentage = totalGames > 0 ? wins / totalGames : 0.5

    // Determine playoff contention and pressure
    const inPlayoffContention = this.isInPlayoffContention(wins, losses, week)
    const playoffPressure = this.calculatePlayoffPressure(wins, losses, week)

    const record = {
      wins,
      losses,
      winPercentage,
    }

    return {
      inPlayoffContention,
      playoffPressure,
      record,
      motivation: 0.5, // Will be calculated separately
    }
  }

  /**
   * Determine if team is in playoff contention
   */
  isInPlayoffContention(wins: number, losses: number, week: number): boolean {
    const totalGames = wins + losses

    // Early season - everyone is in contention
    if (week <= 8 || totalGames < 6) {
      return true
    }

    const winPercentage = totalGames > 0 ? wins / totalGames : 0.5
    const gamesRemaining = 17 - totalGames

    // Late season thresholds
    if (week >= 16) {
      // Very late season - need strong record or mathematical chance
      if (winPercentage >= 0.625) return true // 10+ wins likely
      if (winPercentage >= 0.5 && gamesRemaining >= 1) return true // 8+ wins possible
      return false
    }

    // Mid-to-late season
    if (week >= 12) {
      // Need at least .400 win percentage with games remaining
      if (winPercentage >= 0.4 && gamesRemaining >= 2) return true
      if (winPercentage >= 0.5) return true
      return false
    }

    // Mid season - more lenient
    return winPercentage >= 0.3
  }

  /**
   * Calculate playoff pressure based on record and week
   */
  calculatePlayoffPressure(wins: number, losses: number, week: number): number {
    const totalGames = wins + losses

    if (totalGames === 0) {
      return 0.5 // Default pressure for no games played
    }

    const winPercentage = wins / totalGames
    const gamesRemaining = 17 - totalGames

    // Strong teams (likely playoff bound) have lower pressure
    if (winPercentage >= 0.75) {
      return Math.max(0.1, (week - 10) / 20) // Minimal pressure, slight increase late
    }

    // Eliminated teams have minimal pressure
    if (winPercentage < 0.3 && week >= 14) {
      return Math.max(0.05, 0.3 - winPercentage)
    }

    // Bubble teams have highest pressure
    if (winPercentage >= 0.4 && winPercentage <= 0.65) {
      const lateSeeasonMultiplier = week >= 14 ? 1.5 : 1.0
      const gamesRemainingFactor = gamesRemaining <= 3 ? 1.3 : 1.0

      return Math.min(
        1.0,
        (0.5 + (0.5 - Math.abs(winPercentage - 0.5))) *
          lateSeeasonMultiplier *
          gamesRemainingFactor
      )
    }

    // Default moderate pressure
    return 0.4
  }

  /**
   * Calculate overall motivation based on playoff implications
   */
  private calculateMotivation(
    implications: TeamPlayoffImplications,
    week: number
  ): number {
    const { inPlayoffContention, playoffPressure, record } = implications

    // Base motivation
    let motivation = 0.5

    if (!inPlayoffContention) {
      // Eliminated teams have low motivation
      if (week >= 15) {
        return Math.max(0.2, 0.4 - (week - 15) * 0.05)
      }
      return 0.4
    }

    // Teams in contention
    motivation = 0.5 + playoffPressure * 0.4 // 0.5 to 0.9 range

    // Late season bonus for playoff-bound teams
    if (week >= 16) {
      motivation += 0.1
    }

    // Strong teams fighting for seeding
    if (record.winPercentage >= 0.7) {
      motivation = Math.max(motivation, 0.6) // Minimum motivation for good teams
    }

    // Ensure motivation stays in 0-1 range
    return Math.max(0.1, Math.min(1.0, motivation))
  }

  /**
   * Convert playoff implications to point spread adjustment
   */
  calculateMotivationFactor(
    homeMotivation: number,
    awayMotivation: number
  ): number {
    const motivationDifference = homeMotivation - awayMotivation

    // Convert motivation difference to points (max ±2 points)
    return motivationDifference * 2
  }
}
