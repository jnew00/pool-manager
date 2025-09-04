import { prisma } from '@/lib/prisma'

export interface WeatherConditions {
  gameId: string
  temperature: number // Fahrenheit
  windSpeed: number // MPH
  precipitation: number // Percentage chance
  conditions: 'CLEAR' | 'RAIN' | 'SNOW' | 'WIND' | 'FOG' | 'DOME'
  humidity: number // Percentage
  visibility: number // Miles
  lastUpdated: Date
}

export interface WeatherImpact {
  gameId: string
  conditions: WeatherConditions
  survivorImpact: {
    favoriteRisk: 'LOW' | 'MEDIUM' | 'HIGH'
    underdogBoost: number // Percentage boost to underdog chances
    totalImpact: number // Expected impact on total points
    passingImpact: 'MINIMAL' | 'MODERATE' | 'SEVERE'
    rushingBoost: boolean
    turnoverRisk: 'LOW' | 'MEDIUM' | 'HIGH'
    recommendation: string
  }
}

export class SurvivorWeatherService {
  /**
   * Get weather conditions for a game
   */
  async getGameWeather(gameId: string): Promise<WeatherConditions> {
    // In production, would integrate with weather API
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        homeTeam: true,
      },
    })

    if (!game) {
      throw new Error('Game not found')
    }

    // Check if dome team
    const domeTeams = [
      'MIN',
      'DET',
      'NO',
      'ATL',
      'IND',
      'DAL',
      'HOU',
      'LV',
      'LAR',
      'ARI',
    ]
    const isDome = domeTeams.includes(game.homeTeam.nflAbbr)

    if (isDome) {
      return {
        gameId,
        temperature: 72,
        windSpeed: 0,
        precipitation: 0,
        conditions: 'DOME',
        humidity: 50,
        visibility: 10,
        lastUpdated: new Date(),
      }
    }

    // Simulate weather based on location and time of year
    const weather = this.simulateWeather(game.homeTeam.nflAbbr, game.week)

    return {
      gameId,
      ...weather,
      lastUpdated: new Date(),
    }
  }

  /**
   * Calculate weather impact on survivor picks
   */
  async calculateSurvivorImpact(
    gameId: string,
    spread: number
  ): Promise<WeatherImpact> {
    const conditions = await this.getGameWeather(gameId)

    let favoriteRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
    let underdogBoost = 0
    let totalImpact = 0
    let passingImpact: 'MINIMAL' | 'MODERATE' | 'SEVERE' = 'MINIMAL'
    let rushingBoost = false
    let turnoverRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
    let recommendation = ''

    // Analyze conditions
    switch (conditions.conditions) {
      case 'DOME':
        recommendation = 'Perfect conditions - no weather concerns'
        break

      case 'RAIN':
        if (conditions.precipitation > 70) {
          favoriteRisk = 'MEDIUM'
          underdogBoost = 3
          totalImpact = -7
          passingImpact = 'MODERATE'
          rushingBoost = true
          turnoverRisk = 'MEDIUM'
          recommendation =
            'Heavy rain increases variance - consider avoiding large favorites'
        } else {
          favoriteRisk = 'LOW'
          underdogBoost = 1
          totalImpact = -3
          passingImpact = 'MINIMAL'
          recommendation = 'Light rain - minimal impact expected'
        }
        break

      case 'SNOW':
        favoriteRisk = 'HIGH'
        underdogBoost = 5
        totalImpact = -10
        passingImpact = 'SEVERE'
        rushingBoost = true
        turnoverRisk = 'HIGH'
        recommendation =
          'Snow games are highly unpredictable - avoid in Survivor pools'
        break

      case 'WIND':
        if (conditions.windSpeed > 20) {
          favoriteRisk = 'MEDIUM'
          underdogBoost = 2
          totalImpact = -5
          passingImpact = 'SEVERE'
          rushingBoost = true
          turnoverRisk = 'MEDIUM'
          recommendation = `Strong winds (${conditions.windSpeed} MPH) will impact passing game`
        } else {
          favoriteRisk = 'LOW'
          underdogBoost = 1
          totalImpact = -2
          passingImpact = 'MODERATE'
          recommendation = 'Moderate wind - some impact on deep passing'
        }
        break

      case 'FOG':
        favoriteRisk = 'MEDIUM'
        underdogBoost = 2
        totalImpact = -3
        passingImpact = 'MODERATE'
        turnoverRisk = 'MEDIUM'
        recommendation = 'Limited visibility could affect play calling'
        break

      case 'CLEAR':
        // Check extreme temperatures
        if (conditions.temperature < 20) {
          favoriteRisk = 'MEDIUM'
          underdogBoost = 2
          totalImpact = -4
          passingImpact = 'MINIMAL'
          turnoverRisk = 'MEDIUM'
          recommendation = 'Extreme cold - ball handling could be affected'
        } else if (conditions.temperature > 90) {
          favoriteRisk = 'LOW'
          underdogBoost = 1
          totalImpact = 2
          passingImpact = 'MINIMAL'
          recommendation = 'High heat - fatigue could be a factor late'
        } else {
          recommendation = 'Good weather conditions'
        }
        break
    }

    // Adjust for spread
    if (Math.abs(spread) > 7 && favoriteRisk !== 'LOW') {
      recommendation += '. Large spread + bad weather = increased upset risk'
      underdogBoost += 2
    }

    return {
      gameId,
      conditions,
      survivorImpact: {
        favoriteRisk,
        underdogBoost,
        totalImpact,
        passingImpact,
        rushingBoost,
        turnoverRisk,
        recommendation,
      },
    }
  }

  /**
   * Get weather impact for all games in a week
   */
  async getWeekWeatherImpacts(
    week: number,
    odds: Array<{ gameId: string; spread: number }>
  ): Promise<WeatherImpact[]> {
    const impacts: WeatherImpact[] = []

    for (const game of odds) {
      const impact = await this.calculateSurvivorImpact(
        game.gameId,
        game.spread
      )
      impacts.push(impact)
    }

    // Sort by risk level
    impacts.sort((a, b) => {
      const riskOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
      return (
        riskOrder[b.survivorImpact.favoriteRisk] -
        riskOrder[a.survivorImpact.favoriteRisk]
      )
    })

    return impacts
  }

  /**
   * Historical weather upset analysis
   */
  async getHistoricalWeatherUpsets(
    conditions: 'RAIN' | 'SNOW' | 'WIND',
    spreadThreshold: number = 7
  ): Promise<{
    condition: string
    totalGames: number
    upsets: number
    upsetRate: number
    averageScoreDifferential: number
  }> {
    // In production, would query historical database
    // For now, return typical patterns
    const patterns = {
      RAIN: {
        totalGames: 150,
        upsets: 28,
        upsetRate: 0.187,
        averageScoreDifferential: -2.3,
      },
      SNOW: {
        totalGames: 45,
        upsets: 12,
        upsetRate: 0.267,
        averageScoreDifferential: -4.1,
      },
      WIND: {
        totalGames: 120,
        upsets: 20,
        upsetRate: 0.167,
        averageScoreDifferential: -1.8,
      },
    }

    return {
      condition: conditions,
      ...patterns[conditions],
    }
  }

  /**
   * Get weather based on location and week using deterministic patterns
   */
  private simulateWeather(
    teamAbbr: string,
    week: number
  ): Omit<WeatherConditions, 'gameId' | 'lastUpdated'> {
    // Team location classifications
    const coldWeatherTeams = [
      'BUF',
      'NE',
      'NYJ',
      'GB',
      'CHI',
      'MIN',
      'DET',
      'CLE',
      'PIT',
      'DEN',
    ]
    const warmWeatherTeams = [
      'MIA',
      'TB',
      'JAX',
      'NO',
      'HOU',
      'ARI',
      'LAR',
      'LAC',
      'LV',
      'SF',
    ]
    const coastalTeams = ['BUF', 'NE', 'NYJ', 'MIA', 'TB', 'JAX', 'LAC', 'SEA', 'SF']
    const windyTeams = ['CHI', 'DEN', 'BUF', 'GB', 'KC'] // Known for windy conditions

    const isColdWeather = coldWeatherTeams.includes(teamAbbr)
    const isWarmWeather = warmWeatherTeams.includes(teamAbbr)
    const isCoastal = coastalTeams.includes(teamAbbr)
    const isWindy = windyTeams.includes(teamAbbr)

    // Deterministic base temperature by week and location
    let baseTemp = 70
    if (week <= 4) {
      baseTemp = 75 // Early season (September)
    } else if (week <= 8) {
      baseTemp = 65 // Mid season (October)
    } else if (week <= 12) {
      baseTemp = 55 // Late season (November)
    } else {
      baseTemp = 40 // Winter (December/January)
    }

    // Adjust for location
    if (isColdWeather) {
      baseTemp -= 15
    } else if (isWarmWeather) {
      baseTemp += 15
    }

    // Deterministic weather patterns based on team and week
    let conditions: WeatherConditions['conditions'] = 'CLEAR'
    let precipitation = 0
    let windSpeed = 8 // Base wind speed
    
    // Create deterministic weather based on team abbreviation hash and week
    const teamHash = teamAbbr.charCodeAt(0) + teamAbbr.charCodeAt(1) + (teamAbbr.charCodeAt(2) || 0)
    const weatherSeed = (teamHash + week) % 100

    // Deterministic weather events
    if (weatherSeed < 15 && isCoastal) {
      // Rain more likely for coastal teams
      conditions = 'RAIN'
      precipitation = 45
      windSpeed = 15
    } else if (weatherSeed < 8 && week > 12 && isColdWeather) {
      // Snow in winter for cold weather teams
      conditions = 'SNOW'
      precipitation = 60
      baseTemp = 28
      windSpeed = 20
    } else if (weatherSeed < 20 && isWindy) {
      // Wind more likely for windy cities
      conditions = 'WIND'
      windSpeed = 25
    } else if (weatherSeed < 3) {
      // Rare fog
      conditions = 'FOG'
      windSpeed = 5
    }

    // Calculate final temperature with location variance
    const locationTempVariance = teamHash % 20 - 10 // -10 to +10 degree variance
    const finalTemp = Math.round(baseTemp + locationTempVariance)

    return {
      temperature: Math.max(10, Math.min(95, finalTemp)), // Keep within reasonable bounds
      windSpeed: Math.round(windSpeed),
      precipitation: Math.round(precipitation),
      conditions,
      humidity: Math.min(90, Math.max(20, 50 + (teamHash % 40 - 20))), // 30-70% based on location
      visibility: conditions === 'FOG' ? 0.25 : 10,
    }
  }

  /**
   * Get teams that perform well in bad weather
   */
  getBadWeatherTeams(): string[] {
    // Teams historically good in bad weather
    return [
      'BAL', // Strong defense, run game
      'SF', // Physical style
      'NE', // Cold weather experience
      'BUF', // Cold weather experience
      'GB', // Lambeau Field advantage
      'PIT', // Physical, defensive team
      'TEN', // Strong run game
      'CLE', // AFC North weather
    ]
  }

  /**
   * Get teams that struggle in bad weather
   */
  getFairWeatherTeams(): string[] {
    // Teams that rely on passing or play in good weather
    return [
      'MIA', // Warm weather team
      'ARI', // Desert team, relies on passing
      'LAR', // Passing offense
      'LAC', // Passing offense
      'NO', // Dome team outdoors
      'ATL', // Dome team outdoors
      'IND', // Dome team outdoors
      'TB', // Warm weather, passing offense
    ]
  }
}
