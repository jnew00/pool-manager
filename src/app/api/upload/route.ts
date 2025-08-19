import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FileStorageService } from '@/features/uploads/services/file-storage.service'

export async function POST(request: NextRequest) {
  console.log('[Upload API] Processing game data import...')

  try {
    const body = await request.json()
    const { games, source = 'manual_upload' } = body

    if (!games || !Array.isArray(games)) {
      return NextResponse.json(
        { error: 'Invalid games data provided' },
        { status: 400 }
      )
    }

    console.log('[Upload API] Importing', games.length, 'games')

    // Process each game and create database records
    const createdGames = []
    const errors = []

    for (const gameData of games) {
      try {
        // Validate required fields
        if (!gameData.away_team || !gameData.home_team || !gameData.date) {
          errors.push(
            `Missing required fields for game: ${JSON.stringify(gameData)}`
          )
          continue
        }

        // Parse kickoff time
        const kickoffDate = new Date(
          `${gameData.date}T${gameData.time || '13:00:00'}`
        )
        if (isNaN(kickoffDate.getTime())) {
          errors.push(
            `Invalid date/time for game: ${gameData.away_team} @ ${gameData.home_team}`
          )
          continue
        }

        // Find team IDs
        const awayTeam = await prisma.team.findFirst({
          where: { nflAbbr: gameData.away_team },
        })
        const homeTeam = await prisma.team.findFirst({
          where: { nflAbbr: gameData.home_team },
        })

        if (!awayTeam || !homeTeam) {
          errors.push(
            `Teams not found: ${gameData.away_team} or ${gameData.home_team}`
          )
          continue
        }

        // Create the game record
        const game = await prisma.game.create({
          data: {
            season: gameData.season || new Date().getFullYear(),
            week: gameData.week || 1,
            kickoff: kickoffDate,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            venue: null, // Could be enhanced later
            apiRefs: {
              source,
              originalData: gameData,
            },
          },
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        })

        // Create line data if spread/total provided
        if (gameData.spread || gameData.total) {
          await prisma.line.create({
            data: {
              gameId: game.id,
              source: 'upload',
              spread: gameData.spread ? parseFloat(gameData.spread) : null,
              total: gameData.total ? parseFloat(gameData.total) : null,
              capturedAt: new Date(),
              isUserProvided: true,
            },
          })
        }

        createdGames.push(game)
        console.log(
          '[Upload API] Created game:',
          `${awayTeam.nflAbbr} @ ${homeTeam.nflAbbr}`
        )
      } catch (gameError) {
        console.error('[Upload API] Error creating game:', gameError)
        errors.push(
          `Failed to create game: ${gameError instanceof Error ? gameError.message : 'Unknown error'}`
        )
      }
    }

    // Return results
    const result = {
      success: true,
      imported: createdGames.length,
      total: games.length,
      errors: errors.length > 0 ? errors : undefined,
      games: createdGames.map((game) => ({
        id: game.id,
        matchup: `${game.awayTeam.nflAbbr} @ ${game.homeTeam.nflAbbr}`,
        kickoff: game.kickoff,
        season: game.season,
        week: game.week,
      })),
    }

    console.log('[Upload API] Import completed:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Upload API] Import error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import game data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
