import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock auth until next-auth is configured
async function getServerSession() {
  return { user: { id: 'user-123' } }
}

// GET /api/survivor/games - Get games for a specific week with survivor analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const week = parseInt(searchParams.get('week') || '1')
    const poolId = searchParams.get('poolId')

    if (!poolId) {
      return NextResponse.json(
        { error: 'Missing poolId parameter' },
        { status: 400 }
      )
    }

    // Fetch games for the week
    const games = await prisma.game.findMany({
      where: {
        week,
        season: 2025,
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            nflAbbr: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            nflAbbr: true,
          },
        },
        lines: {
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        kickoff: 'asc',
      },
    })

    // Transform games data for survivor context
    const transformedGames = games.map((game) => {
      const line = game.lines[0]
      const spread = line?.spread || 0
      const homeMoneyline = line?.moneylineHome || 0
      const awayMoneyline = line?.moneylineAway || 0

      // Calculate win probabilities from moneylines
      const homeWinProbability =
        homeMoneyline < 0
          ? Math.abs(homeMoneyline) / (Math.abs(homeMoneyline) + 100)
          : 100 / (homeMoneyline + 100)

      const awayWinProbability =
        awayMoneyline < 0
          ? Math.abs(awayMoneyline) / (Math.abs(awayMoneyline) + 100)
          : 100 / (awayMoneyline + 100)

      // Mock public pick percentages and EV values for now
      const homePublicPick = Math.floor(Math.random() * 30) + 5
      const awayPublicPick = Math.floor(Math.random() * 30) + 5

      const homeEV = homeWinProbability / (homePublicPick / 100)
      const awayEV = awayWinProbability / (awayPublicPick / 100)

      // Mock future value (1-5 scale)
      const homeFutureValue = Math.random() * 5
      const awayFutureValue = Math.random() * 5

      // Mock weather data
      const hasWeather = Math.random() > 0.7
      const weather = hasWeather
        ? {
            condition: ['CLEAR', 'RAIN', 'SNOW', 'WIND'][
              Math.floor(Math.random() * 4)
            ],
            risk: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as
              | 'LOW'
              | 'MEDIUM'
              | 'HIGH',
          }
        : undefined

      return {
        id: game.id,
        homeTeam: {
          id: game.homeTeam.id,
          abbr: game.homeTeam.nflAbbr,
          name: game.homeTeam.name,
          record: '0-0', // Would need to calculate from season record
        },
        awayTeam: {
          id: game.awayTeam.id,
          abbr: game.awayTeam.nflAbbr,
          name: game.awayTeam.name,
          record: '0-0', // Would need to calculate from season record
        },
        spread,
        homeWinProbability,
        awayWinProbability,
        homePublicPick,
        awayPublicPick,
        homeEV,
        awayEV,
        homeFutureValue,
        awayFutureValue,
        weather,
        time: game.kickoff.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short',
        }),
        tv: 'CBS', // Would need actual TV data
      }
    })

    return NextResponse.json({ games: transformedGames })
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
