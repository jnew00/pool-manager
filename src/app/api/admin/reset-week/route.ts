import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * DELETE /api/admin/reset-week - Delete all games for a specific week
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const season = parseInt(searchParams.get('season') || '2025')
    const week = parseInt(searchParams.get('week') || '1')

    console.log(`[Reset Week] Resetting season ${season}, week ${week}...`)

    // Get all games for this week
    const games = await prisma.game.findMany({
      where: { season, week },
      include: {
        homeTeam: { select: { nflAbbr: true } },
        awayTeam: { select: { nflAbbr: true } },
        lines: true,
      },
    })

    console.log(`[Reset Week] Found ${games.length} games to delete`)

    let gamesDeleted = 0
    let linesDeleted = 0

    for (const game of games) {
      console.log(
        `[Reset Week] Deleting: ${game.awayTeam.nflAbbr} @ ${game.homeTeam.nflAbbr}`
      )

      // Delete lines first
      const deletedLines = await prisma.line.deleteMany({
        where: { gameId: game.id },
      })
      linesDeleted += deletedLines.count

      // Delete game
      await prisma.game.delete({
        where: { id: game.id },
      })

      gamesDeleted++
    }

    return NextResponse.json({
      success: true,
      data: {
        season,
        week,
        gamesDeleted,
        linesDeleted,
        message: `Reset complete: removed ${gamesDeleted} games and ${linesDeleted} lines for Week ${week} ${season}`,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('[Reset Week] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset week',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
