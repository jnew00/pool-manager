import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import {
  ConfidenceEngine,
  defaultModelWeights,
} from '@/lib/models/confidence-engine'
import { dataProviderRegistry } from '@/lib/data-sources/provider-registry'
import type { ModelInput } from '@/lib/models/types'

const prisma = new PrismaClient()
const confidenceEngine = new ConfidenceEngine()

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

export async function GET(request: NextRequest) {
  try {
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

    // Calculate recommendations for each game
    const recommendations = []

    for (const game of games) {
      const line = game.lines[0] // Most recent line

      if (!line) {
        // Skip games without betting data
        continue
      }

      // Get real weather data if available
      const gameApiRefs = game.apiRefs as any
      const weatherData = gameApiRefs?.weather || {
        isDome: isVenueDome(game.venue),
        temperature: 65,
        windSpeed: 5,
        precipitationChance: 0.0,
      }

      // TODO: Get real injury data from external sources
      // For now, use placeholder data
      const injuryData = {
        homeTeamPenalty: 0,
        awayTeamPenalty: 0,
      }

      // TODO: Calculate real rest days from game history
      // For now, assume standard 7-day rest
      const restData = {
        homeDaysRest: 7,
        awayDaysRest: 7,
      }

      // Get current market data from ESPN odds provider
      const currentMarketData = await dataProviderRegistry
        .getAllCurrentOdds('espn-odds')
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
        marketData: {
          spread: line.spread ? parseFloat(line.spread.toString()) : undefined,
          total: line.total ? parseFloat(line.total.toString()) : undefined,
          moneylineHome: line.moneylineHome,
          moneylineAway: line.moneylineAway,
        },
        currentMarketData,
        weights: weights as any,
        venue: game.venue,
        restData,
        weatherData,
        injuryData,
      }

      console.log(
        `[Recommendations] Game ${game.homeTeam.nflAbbr} vs ${game.awayTeam.nflAbbr}: spread=${line.spread}, total=${line.total}, ML=${line.moneylineHome}/${line.moneylineAway}`
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
        line: {
          spread: line.spread,
          total: line.total,
          moneylineHome: line.moneylineHome,
          moneylineAway: line.moneylineAway,
          source: line.source,
        },
        recommendation: {
          pick: result.recommendedPick || 'HOME',
          confidence: confidence,
          factors: result.factors?.factorBreakdown || {},
          strength:
            confidence > 60 ? 'Strong' : confidence > 55 ? 'Moderate' : 'Weak',
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
