import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/lines - Get general ESPN spreads (poolId: null) for a season/week
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season')
    const week = searchParams.get('week')

    if (!season || !week) {
      return NextResponse.json(
        { error: 'Season and week parameters are required' },
        { status: 400 }
      )
    }

    // Get general ESPN lines (poolId: null) for the given week
    const lines = await prisma.line.findMany({
      where: {
        poolId: null, // General ESPN lines only
        game: {
          season: parseInt(season),
          week: parseInt(week),
        },
      },
      include: {
        game: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
      orderBy: {
        game: {
          kickoff: 'asc',
        },
      },
    })

    // Transform to spread format
    const spreads = lines.map((line) => ({
      id: line.id,
      gameId: line.gameId,
      homeTeam: line.game.homeTeam.nflAbbr,
      awayTeam: line.game.awayTeam.nflAbbr,
      spread: line.spread,
      total: line.total,
      moneylineHome: line.moneylineHome,
      moneylineAway: line.moneylineAway,
      source: line.source,
      isUserProvided: line.isUserProvided,
      capturedAt: line.capturedAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      lines: spreads,
    })
  } catch (error) {
    console.error('Failed to get general lines:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get general lines',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}