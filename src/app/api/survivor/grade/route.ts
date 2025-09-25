import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SurvivorGradingService } from '@/server/services/survivor-grading.service'

// Mock auth until next-auth is configured
async function getServerSession() {
  return { user: { id: 'user-123', isAdmin: true } }
}

// POST /api/survivor/grade - Grade survivor picks for completed games
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    const body = await request.json()
    const { poolId, week, gameResults } = body

    if (!poolId || !week) {
      return NextResponse.json(
        { error: 'Missing required parameters: poolId, week' },
        { status: 400 }
      )
    }

    const gradingService = new SurvivorGradingService()
    const results = []

    // If specific game results provided, update them first
    if (gameResults && Array.isArray(gameResults)) {
      for (const result of gameResults) {
        const { gameId, homeScore, awayScore } = result

        // Update or create game result
        await prisma.result.upsert({
          where: { gameId },
          update: {
            homeScore,
            awayScore,
            status: 'FINAL',
          },
          create: {
            gameId,
            homeScore,
            awayScore,
            status: 'FINAL',
          },
        })

        // Find and grade survivor picks for this game
        const picks = await prisma.survivorPick.findMany({
          where: {
            gameId,
            entry: {
              poolId,
            },
            result: null, // Only ungraded picks
          },
        })

        for (const pick of picks) {
          const game = await prisma.game.findUnique({
            where: { id: gameId },
          })

          if (game) {
            const gradingResult = await gradingService.gradeSurvivorPick(pick.id, {
              homeScore,
              awayScore,
              homeTeamId: game.homeTeamId,
              awayTeamId: game.awayTeamId,
            })
            results.push(gradingResult)
          }
        }
      }
    } else {
      // Grade all picks for the week
      const gradingResults = await gradingService.gradeWeekSurvivorPicks(poolId, week)
      results.push(...gradingResults)
    }

    // Get updated pool statistics
    const poolStats = await prisma.survivorEntry.groupBy({
      by: ['isActive'],
      where: { poolId },
      _count: true,
    })

    const activeCount = poolStats.find((s) => s.isActive)?._count || 0
    const eliminatedCount = poolStats.find((s) => !s.isActive)?._count || 0
    const totalCount = activeCount + eliminatedCount

    return NextResponse.json({
      success: true,
      graded: results.length,
      results,
      poolStats: {
        total: totalCount,
        active: activeCount,
        eliminated: eliminatedCount,
        survivalRate: totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(1) : '0',
      },
    })
  } catch (error) {
    console.error('Error grading survivor picks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/survivor/grade - Get grading status for a pool/week
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const poolId = searchParams.get('poolId')
    const week = parseInt(searchParams.get('week') || '1')

    if (!poolId) {
      return NextResponse.json(
        { error: 'Missing poolId parameter' },
        { status: 400 }
      )
    }

    // Get all picks for the week
    const picks = await prisma.survivorPick.findMany({
      where: {
        week,
        entry: {
          poolId,
        },
      },
      include: {
        game: {
          include: {
            result: true,
            homeTeam: true,
            awayTeam: true,
          },
        },
        team: true,
        entry: {
          select: {
            id: true,
            entryName: true,
            isActive: true,
          },
        },
      },
    })

    // Categorize picks
    const graded = picks.filter((p) => p.result !== null)
    const pending = picks.filter((p) => p.result === null && !p.game.result)
    const readyToGrade = picks.filter((p) => p.result === null && p.game.result)

    // Get games for the week
    const games = await prisma.game.findMany({
      where: {
        week,
        season: 2025,
      },
      include: {
        result: true,
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: {
        kickoff: 'asc',
      },
    })

    const gamesWithResults = games.filter((g) => g.result)
    const gamesWithoutResults = games.filter((g) => !g.result)

    return NextResponse.json({
      week,
      poolId,
      picks: {
        total: picks.length,
        graded: graded.length,
        pending: pending.length,
        readyToGrade: readyToGrade.length,
      },
      games: {
        total: games.length,
        withResults: gamesWithResults.length,
        withoutResults: gamesWithoutResults.length,
        details: games.map((g) => ({
          id: g.id,
          matchup: `${g.awayTeam.name} @ ${g.homeTeam.name}`,
          kickoff: g.kickoff,
          hasResult: !!g.result,
          result: g.result
            ? `${g.awayTeam.nflAbbr} ${g.result.awayScore} - ${g.result.homeScore} ${g.homeTeam.nflAbbr}`
            : null,
        })),
      },
      readyToGrade: readyToGrade.map((p) => ({
        entryName: p.entry.entryName,
        team: p.team.name,
        game: `${p.game.awayTeam.name} @ ${p.game.homeTeam.name}`,
        result: p.game.result
          ? `${p.game.result.awayScore} - ${p.game.result.homeScore}`
          : null,
      })),
    })
  } catch (error) {
    console.error('Error getting grading status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}