import { prisma } from '@/lib/prisma'
import type { RestFactors, WeatherFactors, InjuryFactors } from './types'

/**
 * Calculator for situational adjustments (home, rest, weather, injuries)
 */
export class SituationalCalculator {
  /**
   * Calculate home field advantage with venue-specific adjustments
   */
  calculateHomeAdvantage(venue?: string, isPlayoffs: boolean = false): number {
    // Base NFL home field advantage (approximately 2.5-3 points)
    let homeAdvantage = 2.8

    // Venue-specific adjustments based on historical data
    const venueAdjustments: Record<string, number> = {
      // Loudest stadiums
      'Arrowhead Stadium': 1.5, // Kansas City Chiefs
      'Lumen Field': 1.2, // Seattle Seahawks
      Superdome: 1.0, // New Orleans Saints
      'U.S. Bank Stadium': 0.8, // Minnesota Vikings

      // Weather advantage stadiums
      'Lambeau Field': 1.2, // Green Bay Packers (cold)
      'Empower Field at Mile High': 0.8, // Denver Broncos (altitude)
      'Heinz Field': 0.6, // Pittsburgh Steelers
      'Soldier Field': 0.6, // Chicago Bears

      // Domes (slightly less advantage)
      'AT&T Stadium': -0.3, // Dallas Cowboys
      'Mercedes-Benz Stadium': -0.2, // Atlanta Falcons
      'Ford Field': -0.2, // Detroit Lions
      'Lucas Oil Stadium': -0.2, // Indianapolis Colts
      'NRG Stadium': -0.2, // Houston Texans
      'State Farm Stadium': -0.2, // Arizona Cardinals

      // Neutral or slight disadvantages
      'SoFi Stadium': -0.5, // LA Rams/Chargers (new, shared)
      'MetLife Stadium': -0.4, // NY Giants/Jets (shared)
      'Hard Rock Stadium': -0.3, // Miami Dolphins
      FedExField: -0.6, // Washington Commanders
    }

    const venueAdjustment = venue ? venueAdjustments[venue] || 0 : 0
    homeAdvantage += venueAdjustment

    // Playoffs reduce home field advantage slightly
    if (isPlayoffs) {
      homeAdvantage *= 0.9
    }

    return homeAdvantage
  }

  /**
   * Calculate rest advantage/disadvantage
   */
  calculateRestAdvantage(
    homeTeamLastGame: Date,
    awayTeamLastGame: Date,
    currentGameDate: Date
  ): RestFactors {
    const msPerDay = 24 * 60 * 60 * 1000

    const homeDaysRest = Math.floor(
      (currentGameDate.getTime() - homeTeamLastGame.getTime()) / msPerDay
    )

    const awayDaysRest = Math.floor(
      (currentGameDate.getTime() - awayTeamLastGame.getTime()) / msPerDay
    )

    // Calculate advantage (positive = home team advantage)
    let advantage = 0
    const restDifference = homeDaysRest - awayDaysRest

    // Each day of extra rest is worth approximately 0.5 points
    advantage = restDifference * 0.5

    // Special cases
    if (homeDaysRest <= 3 && awayDaysRest > 6) {
      // Home team on short rest vs rested away team
      advantage -= 1.0
    } else if (awayDaysRest <= 3 && homeDaysRest > 6) {
      // Away team on short rest vs rested home team
      advantage += 1.0
    }

    // Thursday games (short week) penalty
    if (homeDaysRest <= 4 || awayDaysRest <= 4) {
      const shortRestPenalty = 0.8
      if (homeDaysRest < awayDaysRest) {
        advantage -= shortRestPenalty
      } else if (awayDaysRest < homeDaysRest) {
        advantage += shortRestPenalty
      }
    }

    // Monday night games (mini bye week) bonus
    if (homeDaysRest >= 8 || awayDaysRest >= 8) {
      const extraRestBonus = 0.3
      if (homeDaysRest > awayDaysRest) {
        advantage += extraRestBonus
      } else if (awayDaysRest > homeDaysRest) {
        advantage -= extraRestBonus
      }
    }

    return {
      homeDaysRest,
      awayDaysRest,
      advantage,
    }
  }

  /**
   * Calculate weather impact on game
   */
  calculateWeatherPenalty(
    weatherData: WeatherFactors,
    windThreshold: number = 15,
    precipThreshold: number = 0.3
  ): number {
    if (weatherData.isDome) {
      return 0 // No weather impact in domes
    }

    let totalPenalty = 0

    // Wind penalty (affects passing game)
    if (weatherData.windSpeed && weatherData.windSpeed > windThreshold) {
      const excessWind = weatherData.windSpeed - windThreshold
      totalPenalty += excessWind * 0.15 // 0.15 points per mph over threshold
    }

    // Precipitation penalty (affects ball handling)
    if (
      weatherData.precipitationChance &&
      weatherData.precipitationChance > precipThreshold
    ) {
      const excessPrecip = weatherData.precipitationChance - precipThreshold
      totalPenalty += excessPrecip * 8 // Up to 5.6 points for heavy rain
    }

    // Temperature penalty (extreme cold)
    if (weatherData.temperature !== undefined) {
      if (weatherData.temperature < 20) {
        // Cold weather penalty (affects ball handling, kicking)
        totalPenalty += (20 - weatherData.temperature) * 0.05
      } else if (weatherData.temperature > 95) {
        // Heat penalty (affects conditioning)
        totalPenalty += (weatherData.temperature - 95) * 0.03
      }
    }

    // Cap maximum weather penalty
    return Math.min(totalPenalty, 6.0)
  }

  /**
   * Calculate injury impact on team performance
   */
  async calculateInjuryPenalty(
    teamId: string,
    qbOutPenalty: number = 12,
    olClusterPenalty: number = 3,
    dbClusterPenalty: number = 3
  ): Promise<number> {
    try {
      // Get current injury data for team
      const injuries = await this.getTeamInjuries(teamId)

      let totalPenalty = 0
      let qbInjuries = 0
      let olInjuries = 0
      let dbInjuries = 0

      for (const injury of injuries) {
        const position = injury.position.toLowerCase()
        const status = injury.status

        // Only count OUT and DOUBTFUL players
        if (status !== 'OUT' && status !== 'DOUBTFUL') {
          continue
        }

        // QB injuries have massive impact
        if (position === 'qb') {
          if (status === 'OUT') {
            totalPenalty += qbOutPenalty
          } else if (status === 'DOUBTFUL') {
            totalPenalty += qbOutPenalty * 0.7
          }
          qbInjuries++
        }

        // Offensive line cluster penalty
        if (['lt', 'lg', 'c', 'rg', 'rt', 'ol'].includes(position)) {
          olInjuries++
        }

        // Defensive back cluster penalty
        if (['cb', 'fs', 'ss', 's', 'db'].includes(position)) {
          dbInjuries++
        }

        // Other key positions
        if (['wr1', 'wr', 'rb', 'te'].includes(position)) {
          if (status === 'OUT') {
            totalPenalty += 1.5
          } else if (status === 'DOUBTFUL') {
            totalPenalty += 1.0
          }
        }

        if (['de', 'dt', 'lb', 'olb', 'mlb'].includes(position)) {
          if (status === 'OUT') {
            totalPenalty += 1.0
          } else if (status === 'DOUBTFUL') {
            totalPenalty += 0.7
          }
        }
      }

      // Apply cluster penalties
      if (olInjuries >= 2) {
        totalPenalty += olClusterPenalty * Math.max(0, olInjuries - 1)
      }

      if (dbInjuries >= 3) {
        totalPenalty += dbClusterPenalty * Math.max(0, dbInjuries - 2)
      }

      return Math.min(totalPenalty, 20) // Cap at 20 points max
    } catch (error) {
      console.error('Error calculating injury penalty:', error)
      return 0
    }
  }

  /**
   * Calculate combined injury penalty for both teams
   */
  async calculateGameInjuryFactors(
    homeTeamId: string,
    awayTeamId: string,
    weights: {
      qbOutPenalty: number
      olClusterPenalty: number
      dbClusterPenalty: number
    }
  ): Promise<InjuryFactors> {
    const homeTeamPenalty = await this.calculateInjuryPenalty(
      homeTeamId,
      weights.qbOutPenalty,
      weights.olClusterPenalty,
      weights.dbClusterPenalty
    )

    const awayTeamPenalty = await this.calculateInjuryPenalty(
      awayTeamId,
      weights.qbOutPenalty,
      weights.olClusterPenalty,
      weights.dbClusterPenalty
    )

    // Net penalty (positive value hurts home team)
    const totalPenalty = homeTeamPenalty - awayTeamPenalty

    return {
      homeTeamPenalty,
      awayTeamPenalty,
      totalPenalty,
      qbImpact:
        homeTeamPenalty >= weights.qbOutPenalty ||
        awayTeamPenalty >= weights.qbOutPenalty,
      lineImpact:
        homeTeamPenalty >= weights.olClusterPenalty ||
        awayTeamPenalty >= weights.olClusterPenalty,
      secondaryImpact:
        homeTeamPenalty >= weights.dbClusterPenalty ||
        awayTeamPenalty >= weights.dbClusterPenalty,
    }
  }

  /**
   * Check for divisional rivalry effects
   */
  async isDivisionalGame(
    homeTeamId: string,
    awayTeamId: string
  ): Promise<boolean> {
    try {
      const homeTeam = await prisma.team.findUnique({
        where: { id: homeTeamId },
      })
      const awayTeam = await prisma.team.findUnique({
        where: { id: awayTeamId },
      })

      if (!homeTeam || !awayTeam) return false

      // Check if teams are in same division (would need division data in team table)
      // For now, return false - could be enhanced with actual division logic
      return false
    } catch {
      return false
    }
  }

  /**
   * Calculate travel fatigue for away team
   */
  calculateTravelFatigue(
    homeVenue: string,
    awayTeamLocation: string,
    timeZoneChange: number = 0
  ): number {
    let fatiguePenalty = 0

    // Time zone penalties
    if (Math.abs(timeZoneChange) >= 3) {
      fatiguePenalty += 0.5 // Cross-country travel
    } else if (Math.abs(timeZoneChange) >= 1) {
      fatiguePenalty += 0.2 // Moderate time zone change
    }

    // International games
    if (homeVenue.includes('London') || homeVenue.includes('Mexico')) {
      fatiguePenalty += 1.5
    }

    return fatiguePenalty
  }

  /**
   * Get team injuries from database
   */
  private async getTeamInjuries(teamId: string): Promise<
    Array<{
      position: string
      status: 'QUESTIONABLE' | 'DOUBTFUL' | 'OUT' | 'INJURED_RESERVE'
      playerName: string
    }>
  > {
    try {
      // This would connect to actual injury data source
      // For now, return empty array
      return []
    } catch {
      return []
    }
  }

  /**
   * Historical performance in similar conditions
   */
  async getHistoricalPerformance(
    teamId: string,
    conditions: {
      weather?: 'cold' | 'hot' | 'rain' | 'wind' | 'dome'
      surface?: 'grass' | 'turf'
      primetime?: boolean
    }
  ): Promise<{
    gamesPlayed: number
    winRate: number
    avgPointDiff: number
  }> {
    try {
      // This would query historical game data with similar conditions
      // For now, return neutral data
      return {
        gamesPlayed: 0,
        winRate: 0.5,
        avgPointDiff: 0,
      }
    } catch {
      return {
        gamesPlayed: 0,
        winRate: 0.5,
        avgPointDiff: 0,
      }
    }
  }
}
