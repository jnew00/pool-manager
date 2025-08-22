import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { dataProviderRegistry } from '@/lib/data-sources/provider-registry'
import { EspnOddsProvider } from '@/lib/data-sources/providers/espn-odds-provider'
import { OpenWeatherProvider } from '@/lib/data-sources/providers/openweather-provider'
import {
  MockOddsProvider,
  MockWeatherProvider,
} from '@/lib/data-sources/providers'

// Lazy initialization of providers
let providersInitialized = false

function initializeProviders() {
  if (providersInitialized) return

  // Initialize providers
  const espnProvider = new EspnOddsProvider()
  const weatherProvider = new OpenWeatherProvider({
    apiKey: process.env.OPENWEATHER_API_KEY,
  })
  const mockOddsProvider = new MockOddsProvider()
  const mockWeatherProvider = new MockWeatherProvider()

  // Register providers (use ESPN for odds always, use real weather if API key available)
  dataProviderRegistry.registerOddsProvider(espnProvider, true)
  dataProviderRegistry.registerWeatherProvider(
    process.env.OPENWEATHER_API_KEY ? weatherProvider : mockWeatherProvider,
    true
  )

  providersInitialized = true
}

// Stadium name mapping for better weather data
const STADIUM_NAMES: Record<string, string> = {
  ARI: 'State Farm Stadium',
  ATL: 'Mercedes-Benz Stadium',
  BAL: 'M&T Bank Stadium',
  BUF: 'Highmark Stadium',
  CAR: 'Bank of America Stadium',
  CHI: 'Soldier Field',
  CIN: 'Paycor Stadium',
  CLE: 'FirstEnergy Stadium',
  DAL: 'AT&T Stadium',
  DEN: 'Empower Field at Mile High',
  DET: 'Ford Field',
  GB: 'Lambeau Field',
  HOU: 'NRG Stadium',
  IND: 'Lucas Oil Stadium',
  JAX: 'TIAA Bank Field',
  KC: 'GEHA Field at Arrowhead Stadium',
  LV: 'Allegiant Stadium',
  LVR: 'Allegiant Stadium',
  LAC: 'SoFi Stadium',
  LAR: 'SoFi Stadium',
  MIA: 'Hard Rock Stadium',
  MIN: 'U.S. Bank Stadium',
  NE: 'Gillette Stadium',
  NO: 'Caesars Superdome',
  NYG: 'MetLife Stadium',
  NYJ: 'MetLife Stadium',
  PHI: 'Lincoln Financial Field',
  PIT: 'Acrisure Stadium',
  SEA: 'Lumen Field',
  SF: "Levi's Stadium",
  TB: 'Raymond James Stadium',
  TEN: 'Nissan Stadium',
  WAS: 'FedExField',
  WSH: 'FedExField',
}

function getStadiumName(teamAbbr: string): string {
  return STADIUM_NAMES[teamAbbr] || `${teamAbbr} Stadium`
}

/**
 * GET /api/data-sources - Get available providers and health status
 */
export async function GET(request: NextRequest) {
  try {
    initializeProviders()
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
    initializeProviders()
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

    // If no games found in database, try to fetch and create them from ESPN
    if (games.length === 0 && season && week) {
      console.log(
        `[Data Sources] No games found in DB for season ${season} week ${week}, fetching from ESPN...`
      )

      try {
        const allOddsResponse = await dataProviderRegistry.getAllCurrentOdds(
          'ESPN',
          season,
          week
        )

        if (
          allOddsResponse.success &&
          allOddsResponse.data &&
          allOddsResponse.data.length > 0
        ) {
          console.log(
            `[Data Sources] ESPN returned ${allOddsResponse.data.length} games, creating teams and games...`
          )

          const createdGames = []

          for (const espnGame of allOddsResponse.data) {
            // Skip games without team information
            if (!espnGame.homeTeam || !espnGame.awayTeam) {
              console.warn(
                `[Data Sources] Skipping game with missing team data:`,
                espnGame
              )
              continue
            }

            // Create or find teams
            const homeTeam = await prisma.team.upsert({
              where: { nflAbbr: espnGame.homeTeam },
              update: {},
              create: {
                nflAbbr: espnGame.homeTeam,
                name: espnGame.homeTeam, // ESPN doesn't provide full names, use abbreviation
              },
            })

            const awayTeam = await prisma.team.upsert({
              where: { nflAbbr: espnGame.awayTeam },
              update: {},
              create: {
                nflAbbr: espnGame.awayTeam,
                name: espnGame.awayTeam, // ESPN doesn't provide full names, use abbreviation
              },
            })

            // Create game
            const game = await prisma.game.create({
              data: {
                season: season!,
                week: week!,
                kickoff: espnGame.kickoff || new Date(),
                homeTeamId: homeTeam.id,
                awayTeamId: awayTeam.id,
                status: 'SCHEDULED',
                venue: getStadiumName(espnGame.homeTeam),
              },
              include: {
                homeTeam: true,
                awayTeam: true,
              },
            })

            createdGames.push(game)

            // Create odds line immediately
            await prisma.line.create({
              data: {
                gameId: game.id,
                source: espnGame.source || 'ESPN',
                spread: espnGame.spread,
                total: espnGame.total,
                moneylineHome: espnGame.moneylineHome,
                moneylineAway: espnGame.moneylineAway,
                capturedAt: espnGame.capturedAt || new Date(),
              },
            })
          }

          console.log(
            `[Data Sources] Created ${createdGames.length} games and ${createdGames.length} lines from ESPN`
          )

          return NextResponse.json({
            success: true,
            data: {
              gamesFetched: createdGames.length,
              oddsCreated: createdGames.length,
              weatherUpdated: 0,
              message: `Created ${createdGames.length} games from ESPN for season ${season} week ${week}`,
              timestamp: new Date(),
            },
          })
        }
      } catch (error) {
        console.error('[Data Sources] Error fetching from ESPN:', error)
      }

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
              await dataProviderRegistry.getAllCurrentOdds('ESPN', season, week)

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
                  .map(
                    (odds) =>
                      `${odds.awayTeam || 'Unknown'} @ ${odds.homeTeam || 'Unknown'}`
                  )
                  .join(', ')
              )

              // Find matching game by team abbreviations
              const matchingOdds = allOddsResponse.data.find((odds) => {
                // Try to match teams - ESPN might use slightly different abbreviations
                const homeMatch = odds.homeTeam === game.homeTeam.nflAbbr
                const awayMatch = odds.awayTeam === game.awayTeam.nflAbbr
                return homeMatch && awayMatch && odds.homeTeam && odds.awayTeam
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
