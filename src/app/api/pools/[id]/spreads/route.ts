import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/pools/[id]/spreads - Get pool-specific spreads for a season/week
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params
    const poolId = resolvedParams.id

    // Get pool-specific lines for the given week
    const lines = await prisma.line.findMany({
      where: {
        poolId,
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
      spreads,
    })
  } catch (error) {
    console.error('Failed to get pool spreads:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get pool spreads',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/pools/[id]/spreads - Create or update a pool-specific spread
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const poolId = resolvedParams.id
    const body = await request.json()
    const {
      gameId,
      spread,
      total,
      moneylineHome,
      moneylineAway,
      source = 'user_provided',
      isUserProvided = true,
    } = body

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    // Verify the game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    // Check if a line already exists for this pool and game
    const existingLine = await prisma.line.findFirst({
      where: {
        gameId,
        poolId,
      },
    })

    let line
    if (existingLine) {
      // Update existing line
      line = await prisma.line.update({
        where: { id: existingLine.id },
        data: {
          spread: spread ? parseFloat(spread) : null,
          total: total ? parseFloat(total) : null,
          moneylineHome: moneylineHome ? parseInt(moneylineHome) : null,
          moneylineAway: moneylineAway ? parseInt(moneylineAway) : null,
          source,
          isUserProvided,
          capturedAt: new Date(),
        },
      })
    } else {
      // Create new line
      line = await prisma.line.create({
        data: {
          gameId,
          poolId,
          spread: spread ? parseFloat(spread) : null,
          total: total ? parseFloat(total) : null,
          moneylineHome: moneylineHome ? parseInt(moneylineHome) : null,
          moneylineAway: moneylineAway ? parseInt(moneylineAway) : null,
          source,
          isUserProvided,
          capturedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      line: {
        id: line.id,
        gameId: line.gameId,
        spread: line.spread,
        total: line.total,
        moneylineHome: line.moneylineHome,
        moneylineAway: line.moneylineAway,
        source: line.source,
        isUserProvided: line.isUserProvided,
        capturedAt: line.capturedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to create/update pool spread:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create/update pool spread',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/pools/[id]/spreads - Delete a pool-specific spread
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const poolId = resolvedParams.id
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    // Find and delete the line
    const deletedLine = await prisma.line.deleteMany({
      where: {
        gameId,
        poolId,
      },
    })

    return NextResponse.json({
      success: true,
      deletedCount: deletedLine.count,
    })
  } catch (error) {
    console.error('Failed to delete pool spread:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete pool spread',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}