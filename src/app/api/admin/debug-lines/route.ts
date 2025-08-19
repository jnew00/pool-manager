import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/admin/debug-lines - Debug betting lines in database
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const poolId = searchParams.get('poolId')
    const season = parseInt(searchParams.get('season') || '2025')
    const week = parseInt(searchParams.get('week') || '1')

    // Get all lines for the season/week
    const lines = await prisma.line.findMany({
      include: {
        game: {
          include: {
            homeTeam: { select: { nflAbbr: true } },
            awayTeam: { select: { nflAbbr: true } },
          },
        },
      },
      where: {
        game: {
          season,
          week,
        },
      },
      orderBy: {
        capturedAt: 'desc',
      },
    })

    // Filter by poolId if provided
    const filteredLines = poolId
      ? lines.filter((line) => line.poolId === poolId || line.poolId === null)
      : lines

    return NextResponse.json({
      success: true,
      data: {
        totalLines: lines.length,
        filteredLines: filteredLines.length,
        poolId: poolId || 'all',
        season,
        week,
        lines: filteredLines.map((line) => ({
          id: line.id,
          gameId: line.gameId,
          poolId: line.poolId,
          source: line.source,
          spread: line.spread,
          total: line.total,
          isUserProvided: line.isUserProvided,
          capturedAt: line.capturedAt,
          game: `${line.game.awayTeam.nflAbbr} @ ${line.game.homeTeam.nflAbbr}`,
        })),
      },
    })
  } catch (error) {
    console.error('[Debug Lines] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to debug lines',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
