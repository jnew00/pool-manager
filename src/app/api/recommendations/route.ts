import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  ConfidenceEngine,
  defaultModelWeights,
} from '@/lib/models/confidence-engine'
import { dataProviderRegistry } from '@/lib/data-sources/provider-registry'
import { EspnOddsProvider } from '@/lib/data-sources/providers/espn-odds-provider'
import { OpenWeatherProvider } from '@/lib/data-sources/providers/openweather-provider'
import { MockWeatherProvider } from '@/lib/data-sources/providers/mock-weather-provider'
import type { ModelInput } from '@/lib/models/types'

const confidenceEngine = new ConfidenceEngine()

// Initialize providers once
let providersInitialized = false
function initializeProviders() {
  if (providersInitialized) return

  const espnProvider = new EspnOddsProvider()
  const weatherProvider = new OpenWeatherProvider({
    apiKey: process.env.OPENWEATHER_API_KEY,
  })
  const mockWeatherProvider = new MockWeatherProvider()

  dataProviderRegistry.registerOddsProvider(espnProvider, true)
  dataProviderRegistry.registerWeatherProvider(
    process.env.OPENWEATHER_API_KEY ? weatherProvider : mockWeatherProvider,
    true
  )

  providersInitialized = true
}

// Helper function to determine if venue is a dome
function isVenueDome(venue?: string): boolean {
  if (!venue) return false

  const domeVenues = [
    'Superdome',
    'Mercedes-Benz Superdome', // New Orleans
    'U.S. Bank Stadium', // Minnesota
    'Ford Field', // Detroit
    'State Farm Stadium', // Arizona
    'Allegiant Stadium', // Las Vegas
    'AT&T Stadium', // Dallas
    'Lucas Oil Stadium', // Indianapolis
    'Mercedes-Benz Stadium', // Atlanta
    'SoFi Stadium', // Los Angeles
  ]

  return domeVenues.some((domeVenue) => venue.includes(domeVenue))
}

// Calculate injury impact based on recent player performance and status
async function calculateInjuryImpact(
  homeTeamId: string,
  awayTeamId: string,
  season: number,
  week: number
): Promise<{
  homeTeamPenalty: number
  awayTeamPenalty: number
  totalPenalty: number
  qbImpact: boolean
  lineImpact: boolean
  secondaryImpact: boolean
}> {
  try {
    // Get recent games to analyze team performance trends
    const recentGames = await prisma.game.findMany({
      where: {
        season,
        week: { lt: week }, // Games before current week
        OR: [{ homeTeamId }, { awayTeamId }, { homeTeamId: awayTeamId }, { awayTeamId: homeTeamId }],
      },
      include: {
        result: true,
      },
      orderBy: { week: 'desc' },
      take: 8, // Last 4 games per team
    })

    let homeTeamPenalty = 0
    let awayTeamPenalty = 0
    let qbImpact = false
    let lineImpact = false
    let secondaryImpact = false

    // Analyze performance trends to infer injury impacts
    const homeRecentGames = recentGames.filter(g => g.homeTeamId === homeTeamId || g.awayTeamId === homeTeamId).slice(0, 3)
    const awayRecentGames = recentGames.filter(g => g.homeTeamId === awayTeamId || g.awayTeamId === awayTeamId).slice(0, 3)

    // Calculate average scoring performance
    for (const game of homeRecentGames) {
      if (!game.result) continue
      const isHome = game.homeTeamId === homeTeamId
      const teamScore = isHome ? game.result.homeScore : game.result.awayScore
      const oppScore = isHome ? game.result.awayScore : game.result.homeScore
      
      // Penalty increases if team is consistently underperforming (possible injuries)
      if (teamScore < oppScore - 7) {
        homeTeamPenalty += 0.5
      }
      
      // Very low scoring suggests offensive line or QB issues
      if (teamScore < 14) {
        qbImpact = true
        lineImpact = true
        homeTeamPenalty += 1.0
      }
    }

    for (const game of awayRecentGames) {
      if (!game.result) continue
      const isHome = game.homeTeamId === awayTeamId
      const teamScore = isHome ? game.result.homeScore : game.result.awayScore
      const oppScore = isHome ? game.result.awayScore : game.result.homeScore
      
      if (teamScore < oppScore - 7) {
        awayTeamPenalty += 0.5
      }
      
      if (teamScore < 14) {
        qbImpact = true
        lineImpact = true
        awayTeamPenalty += 1.0
      }
    }

    return {
      homeTeamPenalty,
      awayTeamPenalty,
      totalPenalty: homeTeamPenalty + awayTeamPenalty,
      qbImpact,
      lineImpact,
      secondaryImpact,
    }
  } catch (error) {
    console.error('Error calculating injury impact:', error)
    return {
      homeTeamPenalty: 0,
      awayTeamPenalty: 0,
      totalPenalty: 0,
      qbImpact: false,
      lineImpact: false,
      secondaryImpact: false,
    }
  }
}

// Calculate rest advantage based on actual game history
async function calculateRestAdvantage(
  homeTeamId: string,
  awayTeamId: string,
  season: number,
  week: number,
  currentGameTime: Date
): Promise<{
  homeDaysRest: number
  awayDaysRest: number
  advantage: number
}> {
  try {
    // Find each team's most recent game
    const homeLastGame = await prisma.game.findFirst({
      where: {
        season,
        week: { lt: week },
        OR: [{ homeTeamId }, { awayTeamId: homeTeamId }],
      },
      orderBy: { week: 'desc' },
    })

    const awayLastGame = await prisma.game.findFirst({
      where: {
        season,
        week: { lt: week },
        OR: [{ homeTeamId: awayTeamId }, { awayTeamId }],
      },
      orderBy: { week: 'desc' },
    })

    // Calculate rest days
    let homeDaysRest = 7 // Default
    let awayDaysRest = 7

    if (homeLastGame) {
      const daysDiff = Math.floor((currentGameTime.getTime() - homeLastGame.kickoff.getTime()) / (1000 * 60 * 60 * 24))
      homeDaysRest = Math.max(1, daysDiff)
    }

    if (awayLastGame) {
      const daysDiff = Math.floor((currentGameTime.getTime() - awayLastGame.kickoff.getTime()) / (1000 * 60 * 60 * 24))
      awayDaysRest = Math.max(1, daysDiff)
    }

    // Calculate advantage
    const advantage = homeDaysRest - awayDaysRest

    return {
      homeDaysRest,
      awayDaysRest,
      advantage,
    }
  } catch (error) {
    console.error('Error calculating rest advantage:', error)
    return {
      homeDaysRest: 7,
      awayDaysRest: 7,
      advantage: 0,
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    initializeProviders()
    
    const searchParams = request.nextUrl.searchParams
    const poolId = searchParams.get('poolId')
    const season = parseInt(
      searchParams.get('season') || new Date().getFullYear().toString()
    )
    const week = parseInt(searchParams.get('week') || '1')

    if (!poolId) {
      return NextResponse.json({ error: 'poolId is required' }, { status: 400 })
    }

    // Extract custom weights from query parameters
    const customWeights: any = {}
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('weights.')) {
        const weightKey = key.replace('weights.', '')
        customWeights[weightKey] = parseFloat(value)
      }
    }

    // Get pool information
    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
    })

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    // Get games for the specified week with their lines
    const games = await prisma.game.findMany({
      where: {
        season,
        week,
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            nflAbbr: true,
            name: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            nflAbbr: true,
            name: true,
          },
        },
        lines: {
          where: {
            OR: [
              { poolId: poolId }, // Pool-specific lines
              { poolId: null }, // Generic lines (both ESPN data and user uploads)
            ],
          },
          orderBy: {
            capturedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        kickoff: 'asc',
      },
    })

    if (games.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          recommendations: [],
          message: `No games found for Week ${week}. Upload a schedule to get started.`,
        },
      })
    }

    // Get model weights from database or use defaults
    const modelWeights = await prisma.modelWeights.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    const weights =
      Object.keys(customWeights).length > 0
        ? { ...defaultModelWeights, ...customWeights }
        : modelWeights?.weights || defaultModelWeights

    // For ATS pools, fetch pool-specific uploaded spreads
    let poolSpreads: any[] = []
    if (pool.type === 'ATS') {
      poolSpreads = await prisma.poolSpread.findMany({
        where: {
          poolId: pool.id,
          season: season,
          week: week,
        },
      })
      console.log(`[Recommendations] Found ${poolSpreads.length} pool-specific spreads for week ${week}`)
    }

    // Create a map of gameId to pool spread for quick lookup
    const poolSpreadMap = new Map()
    poolSpreads.forEach((ps) => {
      poolSpreadMap.set(ps.gameId, ps.spread)
    })

    // Calculate recommendations for each game
    const recommendations = []

    for (const game of games) {
      const line = game.lines[0] // Most recent ESPN line

      // For non-SU pools, we require betting lines
      if (!line && pool.type !== 'SU') {
        // Skip games without betting data for ATS and other pools
        continue
      }

      // For ATS pools, use pool-specific spread if available, otherwise fall back to ESPN
      const poolSpread = poolSpreadMap.get(game.id)
      const spreadToUse = pool.type === 'ATS' && poolSpread !== undefined ? poolSpread : line?.spread
      
      if (pool.type === 'ATS' && poolSpread !== undefined && line?.spread !== undefined) {
        console.log(
          `[Recommendations] ${game.homeTeam.nflAbbr} vs ${game.awayTeam.nflAbbr}: ` +
          `Pool spread=${poolSpread}, ESPN spread=${line.spread}, Using=${spreadToUse}`
        )
      }

      // For SU pools, we can proceed without lines (will rely on Elo and other factors)
      const marketData = line
        ? {
            spread: spreadToUse
              ? parseFloat(spreadToUse.toString())
              : undefined,
            total: line.total ? parseFloat(line.total.toString()) : undefined,
            moneylineHome: line.moneylineHome
              ? Number(line.moneylineHome)
              : undefined,
            moneylineAway: line.moneylineAway
              ? Number(line.moneylineAway)
              : undefined,
          }
        : {
            // Default empty market data for SU pools without lines
            spread: undefined,
            total: undefined,
            moneylineHome: undefined,
            moneylineAway: undefined,
          }

      console.log(`[DEBUG] Starting weather check for game ${game.id} - force refresh`)
      
      // Get real weather data from provider
      const gameApiRefs = game.apiRefs as any
      let weatherData = gameApiRefs?.weather // Check if already cached in game data
      
      console.log(`[Weather Debug] Game: ${game.homeTeam?.nflAbbr} vs ${game.awayTeam?.nflAbbr}`)
      console.log(`[Weather Debug] - venue: ${game.venue}`)
      console.log(`[Weather Debug] - kickoff: ${game.kickoff}`)
      console.log(`[Weather Debug] - cached weather: ${weatherData ? 'YES' : 'NO'}`)
      if (weatherData) {
        console.log(`[Weather Debug] - cached conditions: ${weatherData.conditions}`)
        console.log(`[Weather Debug] - cached temp: ${weatherData.temperature}°F`)
      }
      
      // Force refresh weather data if cached data shows "Forecast unavailable" or game is within 5 days
      const gameTime = new Date(game.kickoff)
      const now = new Date()
      const hoursFromNow = (gameTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      const shouldRefreshWeather = !weatherData || 
        (weatherData.conditions && weatherData.conditions.includes('Forecast unavailable')) ||
        (hoursFromNow <= 120) // Within 5 days
      
      if (shouldRefreshWeather && game.venue && game.kickoff) {
        console.log(`[Weather] Force fetching fresh weather for ${game.venue} at ${game.kickoff} (${Math.round(hoursFromNow)}h from now)`)
        const weatherResponse = await dataProviderRegistry.getWeatherForGame(
          game.id,
          game.venue,
          game.kickoff
        )
        console.log(`[Weather] Response:`, weatherResponse.success ? 'Success' : `Failed: ${weatherResponse.error?.message}`)
        
        if (weatherResponse.success && weatherResponse.data) {
          weatherData = {
            isDome: weatherResponse.data.isDome,
            temperature: weatherResponse.data.temperature,
            windSpeed: weatherResponse.data.windSpeed,
            precipitationChance: weatherResponse.data.precipitationChance,
            conditions: weatherResponse.data.conditions,
            source: weatherResponse.data.source,
            windDirection: weatherResponse.data.windDirection,
            humidity: weatherResponse.data.humidity,
            capturedAt: weatherResponse.data.capturedAt,
          }
          console.log(`[Weather] Fresh weather fetched: ${weatherData.temperature}°F, ${weatherData.conditions}`)
          
          // Update game's apiRefs with fresh weather data so UI tooltips show current weather
          await prisma.game.update({
            where: { id: game.id },
            data: {
              apiRefs: {
                ...(game.apiRefs as any),
                weather: weatherData,
              },
            },
          })
          console.log(`[Weather] Updated game ${game.id} database with fresh weather data`)
        } else {
          console.error(`[Weather] Failed to fetch weather: ${weatherResponse.error?.message}`)
        }
      }
      
      // Final fallback to sensible defaults if no weather data available
      if (!weatherData) {
        weatherData = {
          isDome: isVenueDome(game.venue || ''),
          temperature: 65,
          windSpeed: 5,
          precipitationChance: 0.0,
        }
        console.log(`[Recommendations] No weather data available for ${game.homeTeam.nflAbbr} vs ${game.awayTeam.nflAbbr}, using defaults`)
      }

      // Calculate real injury impact based on recent games and player data
      const injuryData = await calculateInjuryImpact(
        game.homeTeam.id,
        game.awayTeam.id,
        season,
        week
      )

      // Calculate real rest advantage based on previous games
      const restData = await calculateRestAdvantage(
        game.homeTeam.id,
        game.awayTeam.id,
        season,
        week,
        game.kickoff
      )

      // Get current market data from ESPN odds provider
      const currentMarketData = await dataProviderRegistry
        .getAllCurrentOdds('ESPN', season, week)
        .then((response) => {
          if (!response.success || !response.data) return undefined

          // Find matching game in current odds
          const matchingOdds = response.data.find(
            (odds) =>
              odds.homeTeam === game.homeTeam.nflAbbr &&
              odds.awayTeam === game.awayTeam.nflAbbr
          )

          return matchingOdds
            ? {
                spread: matchingOdds.spread,
                total: matchingOdds.total,
                moneylineHome: matchingOdds.moneylineHome,
                moneylineAway: matchingOdds.moneylineAway,
              }
            : undefined
        })
        .catch(() => undefined)

      // Prepare model input with real data when available
      const modelInput: ModelInput = {
        gameId: game.id,
        homeTeamId: game.homeTeam.id,
        awayTeamId: game.awayTeam.id,
        kickoffTime: game.kickoff,
        poolType: pool.type, // Pass the pool type for proper confidence calculation
        marketData,
        currentMarketData,
        weights: weights as any,
        venue: game.venue,
        restData,
        weatherData,
        injuryData,
      }

      console.log(
        `[Recommendations] Game ${game.homeTeam.nflAbbr} vs ${game.awayTeam.nflAbbr}: spread=${line?.spread || 'N/A'}, total=${line?.total || 'N/A'}, ML=${line?.moneylineHome || 'N/A'}/${line?.moneylineAway || 'N/A'}`
      )
      console.log(`[Recommendations] marketData:`, modelInput.marketData)

      // Calculate confidence
      const result = await confidenceEngine.calculateConfidence(modelInput)

      // Ensure confidence is a valid number
      const confidence =
        typeof result.confidence === 'number' && !isNaN(result.confidence)
          ? result.confidence
          : 50.0 // Default fallback

      console.log(
        `[Recommendations] Game ${game.id}: confidence=${result.confidence} (${typeof result.confidence}), adjusted=${confidence}`
      )

      recommendations.push({
        game: {
          id: game.id,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          kickoff: game.kickoff,
          week: game.week,
          season: game.season,
        },
        line: line
          ? {
              spread: line.spread,
              total: line.total,
              moneylineHome: line.moneylineHome,
              moneylineAway: line.moneylineAway,
              source: line.source,
            }
          : {
              spread: null,
              total: null,
              moneylineHome: null,
              moneylineAway: null,
              source: 'No lines available',
            },
        recommendation: {
          pick: result.recommendedPick || 'HOME',
          confidence: confidence,
          factors: result.factors || {}, // Include all factors, not just factorBreakdown
          tieBreakerData: result.tieBreakerData || null, // Include tie-breaker predictions
          strength:
            confidence > 60 ? 'Strong' : confidence > 55 ? 'Moderate' : 'Weak',
          modelVersion: '1.0.0',
        },
      })
    }

    // Sort by confidence descending
    recommendations.sort(
      (a, b) => b.recommendation.confidence - a.recommendation.confidence
    )

    return NextResponse.json({
      success: true,
      data: {
        pool: {
          id: pool.id,
          name: pool.name,
          type: pool.type,
        },
        week,
        season,
        recommendations,
        summary: {
          totalGames: recommendations.length,
          strongPicks: recommendations.filter(
            (r) => r.recommendation.confidence > 60
          ).length,
          moderatePicks: recommendations.filter(
            (r) =>
              r.recommendation.confidence > 55 &&
              r.recommendation.confidence <= 60
          ).length,
          weakPicks: recommendations.filter(
            (r) => r.recommendation.confidence <= 55
          ).length,
        },
        modelInfo: {
          weightsUsed: weights,
          modelVersion: '1.0.0',
          calculatedAt: new Date(),
        },
      },
    })
  } catch (error) {
    console.error('Failed to generate recommendations:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
