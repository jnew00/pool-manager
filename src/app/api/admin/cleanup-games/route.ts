import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/admin/cleanup-games - Remove duplicate games with placeholder dates
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('[Cleanup Games] Starting cleanup of duplicate games...')

    // Find games with placeholder dates (August 2025) - these are from ESPN external data fetch
    const placeholderGames = await prisma.game.findMany({
      where: {
        season: 2025,
        week: 1,
        kickoff: {
          gte: new Date('2025-08-01'),
          lt: new Date('2025-09-01'),
        },
      },
      include: {
        homeTeam: { select: { nflAbbr: true } },
        awayTeam: { select: { nflAbbr: true } },
        lines: true,
      },
    })

    console.log(
      `[Cleanup Games] Found ${placeholderGames.length} games with placeholder dates`
    )

    let gamesDeleted = 0
    let linesDeleted = 0

    for (const game of placeholderGames) {
      console.log(
        `[Cleanup Games] Removing placeholder game: ${game.awayTeam.nflAbbr} @ ${game.homeTeam.nflAbbr} (${game.kickoff})`
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

    // Count remaining games
    const remainingGames = await prisma.game.count({
      where: {
        season: 2025,
        week: 1,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        gamesDeleted,
        linesDeleted,
        remainingGames,
        message: `Cleanup complete: removed ${gamesDeleted} placeholder games and ${linesDeleted} lines. ${remainingGames} games remaining.`,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('[Cleanup Games] Error during cleanup:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cleanup games',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
