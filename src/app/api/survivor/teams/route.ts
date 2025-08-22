import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock auth until next-auth is configured
async function getServerSession() {
  return { user: { id: 'user-123' } }
}

const NFL_DIVISIONS = {
  AFC: {
    East: ['BUF', 'MIA', 'NE', 'NYJ'],
    North: ['BAL', 'CIN', 'CLE', 'PIT'],
    South: ['HOU', 'IND', 'JAX', 'TEN'],
    West: ['DEN', 'KC', 'LV', 'LAC'],
  },
  NFC: {
    East: ['DAL', 'NYG', 'PHI', 'WAS'],
    North: ['CHI', 'DET', 'GB', 'MIN'],
    South: ['ATL', 'CAR', 'NO', 'TB'],
    West: ['ARI', 'LAR', 'SF', 'SEA'],
  },
}

function getTeamDivisionInfo(abbr: string) {
  for (const [conference, divisions] of Object.entries(NFL_DIVISIONS)) {
    for (const [division, teams] of Object.entries(divisions)) {
      if (teams.includes(abbr)) {
        return { conference: conference as 'AFC' | 'NFC', division }
      }
    }
  }
  return { conference: 'AFC' as const, division: 'East' } // Default fallback
}

// GET /api/survivor/teams - Get available teams for a given week
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const week = parseInt(searchParams.get('week') || '1')
    const poolId = searchParams.get('poolId')
    const season = parseInt(searchParams.get('season') || '2025')

    console.log('Teams API request:', { week, poolId, season })

    if (!poolId) {
      return NextResponse.json(
        { error: 'Missing poolId parameter' },
        { status: 400 }
      )
    }

    // Get all games for the specified week
    const games = await prisma.game.findMany({
      where: {
        week,
        season,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        lines: {
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        kickoff: 'asc',
      },
    })

    console.log(
      `Found ${games.length} games for week ${week}, season ${season}`
    )

    // Transform games into unique team options (one entry per team)
    const teamMap = new Map()

    for (const game of games) {
      const line = game.lines[0]

      // Home team - only add if not already in map
      if (!teamMap.has(game.homeTeam.id)) {
        const homeTeamInfo = getTeamDivisionInfo(game.homeTeam.nflAbbr)
        teamMap.set(game.homeTeam.id, {
          id: game.homeTeam.id,
          name: game.homeTeam.name,
          abbr: game.homeTeam.nflAbbr,
          conference: homeTeamInfo.conference,
          division: homeTeamInfo.division,
          currentRecord: '0-0', // Mock record for now
          available: true, // Will be set by TeamSelector based on used teams
          gameId: game.id,
          opponent: game.awayTeam.nflAbbr,
          isHome: true,
          kickoff: game.kickoff,
          spread: line?.spread ? parseFloat(line.spread.toString()) : null,
          moneyline: line?.moneylineHome || null,
          winProbability: calculateWinProbability(line?.moneylineHome),
          publicPickPercentage: Math.floor(Math.random() * 30) + 5, // Mock for now
          expectedValue: calculateExpectedValue(
            calculateWinProbability(line?.moneylineHome),
            Math.floor(Math.random() * 30) + 5
          ),
          futureValue: Math.random() * 5, // 1-5 scale
          gameStatus: game.status,
        })
      }

      // Away team - only add if not already in map
      if (!teamMap.has(game.awayTeam.id)) {
        const awayTeamInfo = getTeamDivisionInfo(game.awayTeam.nflAbbr)
        teamMap.set(game.awayTeam.id, {
          id: game.awayTeam.id,
          name: game.awayTeam.name,
          abbr: game.awayTeam.nflAbbr,
          conference: awayTeamInfo.conference,
          division: awayTeamInfo.division,
          currentRecord: '0-0', // Mock record for now
          available: true, // Will be set by TeamSelector based on used teams
          gameId: game.id,
          opponent: game.homeTeam.nflAbbr,
          isHome: false,
          kickoff: game.kickoff,
          spread: line?.spread ? -parseFloat(line.spread.toString()) : null,
          moneyline: line?.moneylineAway || null,
          winProbability: calculateWinProbability(line?.moneylineAway),
          publicPickPercentage: Math.floor(Math.random() * 30) + 5, // Mock for now
          expectedValue: calculateExpectedValue(
            calculateWinProbability(line?.moneylineAway),
            Math.floor(Math.random() * 30) + 5
          ),
          futureValue: Math.random() * 5, // 1-5 scale
          gameStatus: game.status,
        })
      }
    }

    const teams = Array.from(teamMap.values())

    // Sort teams by kickoff time, then by team name
    teams.sort((a, b) => {
      const kickoffDiff =
        new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
      if (kickoffDiff !== 0) return kickoffDiff
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateWinProbability(moneyline: number | null): number {
  if (!moneyline) return 0.5

  // Convert moneyline to implied probability
  if (moneyline < 0) {
    return Math.abs(moneyline) / (Math.abs(moneyline) + 100)
  } else {
    return 100 / (moneyline + 100)
  }
}

function calculateExpectedValue(
  winProbability: number,
  publicPickPercentage: number
): number {
  // EV = Win Probability / (Public Pick % / 100)
  return winProbability / (publicPickPercentage / 100)
}
