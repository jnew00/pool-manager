import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { dataProviderRegistry } from '@/lib/data-sources/provider-registry'
import { EspnOddsProvider } from '@/lib/data-sources/providers/espn-odds-provider'
import { OpenWeatherProvider } from '@/lib/data-sources/providers/openweather-provider'
import {
  MockOddsProvider,
  MockWeatherProvider,
} from '@/lib/data-sources/providers'

const prisma = new PrismaClient()

// Initialize providers
const espnProvider = new EspnOddsProvider()
const weatherProvider = new OpenWeatherProvider({
  apiKey: process.env.OPENWEATHER_API_KEY,
})
const mockOddsProvider = new MockOddsProvider()
const mockWeatherProvider = new MockWeatherProvider()

// Register providers (use mock if no API keys)
dataProviderRegistry.registerOddsProvider(
  process.env.OPENWEATHER_API_KEY ? espnProvider : mockOddsProvider,
  true
)
dataProviderRegistry.registerWeatherProvider(
  process.env.OPENWEATHER_API_KEY ? weatherProvider : mockWeatherProvider,
  true
)

/**
 * GET /api/data-sources - Get available providers and health status
 */
export async function GET(request: NextRequest) {
  try {
    const availableProviders = dataProviderRegistry.getAvailableProviders()
    const healthStatus = await dataProviderRegistry.checkProviderHealth()

    return NextResponse.json({
      success: true,
      data: {
        providers: availableProviders,
        health: healthStatus,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('Failed to get data sources status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get data sources status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/data-sources - Trigger data fetching for games
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gameIds, season, week, dataTypes = ['odds', 'weather'] } = body

    if (!gameIds && (!season || !week)) {
      return NextResponse.json(
        { error: 'Either gameIds or season/week parameters are required' },
        { status: 400 }
      )
    }

    let games
    if (gameIds) {
      games = await prisma.game.findMany({
        where: { id: { in: gameIds } },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      })
    } else {
      games = await prisma.game.findMany({
        where: { season, week },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      })
    }

    if (games.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'No games found for the specified criteria',
          gamesFetched: 0,
          oddsCreated: 0,
          weatherUpdated: 0,
        },
      })
    }

    let oddsCreated = 0
    let weatherUpdated = 0
    let errors: string[] = []

    for (const game of games) {
      try {
        // Fetch odds data if requested
        if (dataTypes.includes('odds')) {
          console.log(
            `[Data Sources] Fetching odds for game ${game.homeTeam.nflAbbr} vs ${game.awayTeam.nflAbbr}`
          )

          try {
            // Get all current odds from ESPN and match by teams
            const allOddsResponse =
              await dataProviderRegistry.getAllCurrentOdds()

            if (allOddsResponse.success && allOddsResponse.data) {
              console.log(
                `[Data Sources] ESPN returned ${allOddsResponse.data.length} games`
              )
              console.log(
                `[Data Sources] Looking for: ${game.homeTeam.nflAbbr} vs ${game.awayTeam.nflAbbr}`
              )
              console.log(
                `[Data Sources] Available games:`,
                allOddsResponse.data
                  .map((odds) => `${odds.awayTeam} @ ${odds.homeTeam}`)
                  .join(', ')
              )

              // Find matching game by team abbreviations
              const matchingOdds = allOddsResponse.data.find((odds) => {
                // Try to match teams - ESPN might use slightly different abbreviations
                const homeMatch = odds.homeTeam === game.homeTeam.nflAbbr
                const awayMatch = odds.awayTeam === game.awayTeam.nflAbbr
                return homeMatch && awayMatch
              })

              if (matchingOdds) {
                // Store odds as a new line
                await prisma.line.create({
                  data: {
                    gameId: game.id,
                    source: matchingOdds.source,
                    spread: matchingOdds.spread,
                    total: matchingOdds.total,
                    moneylineHome: matchingOdds.moneylineHome,
                    moneylineAway: matchingOdds.moneylineAway,
                    isUserProvided: false,
                  },
                })
                oddsCreated++
                console.log(
                  `[Data Sources] Found odds for ${game.homeTeam.nflAbbr} vs ${game.awayTeam.nflAbbr}`
                )
              } else {
                errors.push(
                  `Odds for ${game.homeTeam.nflAbbr} vs ${game.awayTeam.nflAbbr}: No matching game found in ESPN data`
                )
              }
            } else {
              errors.push(
                `Odds for ${game.homeTeam.nflAbbr} vs ${game.awayTeam.nflAbbr}: ${allOddsResponse.error?.message || 'Failed to fetch odds'}`
              )
            }
          } catch (error) {
            errors.push(
              `Odds for ${game.homeTeam.nflAbbr} vs ${game.awayTeam.nflAbbr}: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
          }
        }

        // Fetch weather data if requested
        if (dataTypes.includes('weather') && game.venue) {
          console.log(
            `[Data Sources] Fetching weather for game ${game.id} at ${game.venue}`
          )
          const weatherResponse = await dataProviderRegistry.getWeatherForGame(
            game.id,
            game.venue,
            new Date(game.kickoff)
          )

          if (weatherResponse.success && weatherResponse.data) {
            // Store weather data in game's apiRefs field for now
            await prisma.game.update({
              where: { id: game.id },
              data: {
                apiRefs: {
                  ...((game.apiRefs as any) || {}),
                  weather: weatherResponse.data,
                },
              },
            })
            weatherUpdated++
          } else if (weatherResponse.error) {
            errors.push(
              `Weather for ${game.venue}: ${weatherResponse.error.message}`
            )
          }
        }
      } catch (error) {
        errors.push(
          `Game ${game.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        gamesFetched: games.length,
        oddsCreated,
        weatherUpdated,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('Failed to fetch external data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch external data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
