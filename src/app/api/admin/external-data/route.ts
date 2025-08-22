import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { dataProviderRegistry } from '@/lib/data-sources/provider-registry'
import { EspnOddsProvider } from '@/lib/data-sources/providers/espn-odds-provider'
import { OpenWeatherProvider } from '@/lib/data-sources/providers/openweather-provider'
import {
  MockOddsProvider,
  MockWeatherProvider,
} from '@/lib/data-sources/providers'

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
 * POST /api/admin/external-data - Fetch fresh ESPN games and create database entries
 */
export async function POST(request: NextRequest) {
  try {
    const { season, week } = await request.json()

    if (!season || !week) {
      return NextResponse.json(
        {
          success: false,
          error: 'Season and week are required',
        },
        { status: 400 }
      )
    }

    console.log(
      `[External Data] Fetching ESPN data for season ${season}, week ${week}...`
    )

    // Get all current odds/games from ESPN
    const allOddsResponse = await dataProviderRegistry.getAllCurrentOdds()

    if (!allOddsResponse.success || !allOddsResponse.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch ESPN data',
          details: allOddsResponse.error?.message || 'No data returned',
        },
        { status: 500 }
      )
    }

    console.log(
      `[External Data] ESPN returned ${allOddsResponse.data.length} games`
    )

    let gamesCreated = 0
    let oddsCreated = 0
    let weatherCreated = 0
    const errors: string[] = []

    // Create games and odds from ESPN data
    for (const oddsData of allOddsResponse.data) {
      try {
        // Find teams by NFL abbreviation
        const homeTeam = await prisma.team.findUnique({
          where: { nflAbbr: oddsData.homeTeam },
        })
        const awayTeam = await prisma.team.findUnique({
          where: { nflAbbr: oddsData.awayTeam },
        })

        if (!homeTeam || !awayTeam) {
          errors.push(
            `Teams not found for ${oddsData.awayTeam} @ ${oddsData.homeTeam}`
          )
          continue
        }

        // Check if game already exists
        const existingGame = await prisma.game.findFirst({
          where: {
            season,
            week,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
          },
        })

        let game
        if (existingGame) {
          game = existingGame

          // Update existing game with real kickoff date if we have it
          if (oddsData.kickoff && existingGame.kickoff) {
            const existingDate = new Date(existingGame.kickoff)
            const newDate = oddsData.kickoff
            const timeDiff = Math.abs(
              existingDate.getTime() - new Date().getTime()
            )
            const daysDiff = timeDiff / (1000 * 60 * 60 * 24)

            // Update if existing date looks like a placeholder (within 2 days of today)
            if (daysDiff < 2) {
              await prisma.game.update({
                where: { id: existingGame.id },
                data: { kickoff: newDate },
              })
              console.log(
                `[External Data] Updated kickoff for ${oddsData.awayTeam} @ ${oddsData.homeTeam}: ${newDate.toISOString()}`
              )
            }
          }

          console.log(
            `[External Data] Game exists: ${oddsData.awayTeam} @ ${oddsData.homeTeam}`
          )
        } else {
          // Create new game using kickoff date from provider or fallback to placeholder
          const kickoffDate =
            oddsData.kickoff ||
            (() => {
              const placeholder = new Date()
              placeholder.setDate(placeholder.getDate() + 7) // Next week as fallback
              return placeholder
            })()

          game = await prisma.game.create({
            data: {
              season,
              week,
              kickoff: kickoffDate,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              status: 'SCHEDULED',
              venue: `${homeTeam.name} Stadium`, // Placeholder venue
            },
          })
          gamesCreated++
          console.log(
            `[External Data] Created game: ${oddsData.awayTeam} @ ${oddsData.homeTeam} at ${kickoffDate.toISOString()}`
          )
        }

        // Create odds line if we have data
        if (
          oddsData.spread !== undefined ||
          oddsData.total !== undefined ||
          oddsData.moneylineHome !== undefined
        ) {
          await prisma.line.create({
            data: {
              gameId: game.id,
              source: oddsData.source,
              spread: oddsData.spread,
              total: oddsData.total,
              moneylineHome: oddsData.moneylineHome,
              moneylineAway: oddsData.moneylineAway,
              isUserProvided: false,
            },
          })
          oddsCreated++
          console.log(
            `[External Data] Created odds: spread ${oddsData.spread}, total ${oddsData.total}`
          )
        }
      } catch (error) {
        errors.push(
          `Failed to process ${oddsData.awayTeam} @ ${oddsData.homeTeam}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    console.log(
      `[External Data] Complete: ${gamesCreated} games created, ${oddsCreated} odds created`
    )

    return NextResponse.json({
      success: true,
      data: {
        gamesCreated,
        oddsCreated,
        weatherCreated,
        totalGames: allOddsResponse.data.length,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('[External Data] Error:', error)
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
