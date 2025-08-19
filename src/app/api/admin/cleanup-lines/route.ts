import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * DELETE /api/admin/cleanup-lines - Remove unrealistic betting lines
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('[Cleanup] Starting cleanup of unrealistic betting lines...')

    // Find lines with unrealistic spreads (typical NFL spreads are ±0.5 to ±17)
    const unrealisticLines = await prisma.line.findMany({
      where: {
        OR: [
          { spread: { gt: 20 } }, // Spreads over 20 points
          { spread: { lt: -20 } }, // Spreads under -20 points
          { total: { lt: 30 } }, // Totals under 30 (unrealistic for NFL)
          { total: { gt: 70 } }, // Totals over 70 (unrealistic for NFL)
        ],
      },
      include: {
        game: {
          include: {
            homeTeam: { select: { nflAbbr: true } },
            awayTeam: { select: { nflAbbr: true } },
          },
        },
      },
    })

    console.log(
      `[Cleanup] Found ${unrealisticLines.length} unrealistic lines to remove`
    )

    for (const line of unrealisticLines) {
      console.log(
        `[Cleanup] Removing line: ${line.game.awayTeam.nflAbbr} @ ${line.game.homeTeam.nflAbbr} - spread: ${line.spread}, total: ${line.total}, source: ${line.source}`
      )
    }

    // Delete the unrealistic lines
    const deleteResult = await prisma.line.deleteMany({
      where: {
        OR: [
          { spread: { gt: 20 } },
          { spread: { lt: -20 } },
          { total: { lt: 30 } },
          { total: { gt: 70 } },
        ],
      },
    })

    console.log(`[Cleanup] Deleted ${deleteResult.count} unrealistic lines`)

    // Also clean up duplicate games created from the old upload process
    // Find games that were created from OCR uploads (not ESPN data)
    const ocrGames = await prisma.game.findMany({
      where: {
        kickoff: '1970-01-01T00:00:00.000Z', // Default timestamp from bad OCR data
      },
      include: {
        homeTeam: { select: { nflAbbr: true } },
        awayTeam: { select: { nflAbbr: true } },
        lines: true,
      },
    })

    console.log(
      `[Cleanup] Found ${ocrGames.length} games with bad kickoff timestamps`
    )

    let gamesDeleted = 0
    for (const game of ocrGames) {
      console.log(
        `[Cleanup] Removing bad game: ${game.awayTeam.nflAbbr} @ ${game.homeTeam.nflAbbr} with ${game.lines.length} lines`
      )

      // Delete lines first, then game
      await prisma.line.deleteMany({
        where: { gameId: game.id },
      })

      await prisma.game.delete({
        where: { id: game.id },
      })

      gamesDeleted++
    }

    return NextResponse.json({
      success: true,
      data: {
        linesDeleted: deleteResult.count,
        gamesDeleted,
        message: `Cleanup complete: removed ${deleteResult.count} unrealistic lines and ${gamesDeleted} bad games`,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('[Cleanup] Error during cleanup:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cleanup lines',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
