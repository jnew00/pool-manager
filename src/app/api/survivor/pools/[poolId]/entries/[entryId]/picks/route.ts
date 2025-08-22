import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock auth until next-auth is configured
async function getServerSession() {
  return { user: { id: 'user-123' } }
}

// GET /api/survivor/pools/[poolId]/entries/[entryId]/picks - Get survivor picks for an entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ poolId: string; entryId: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { poolId, entryId } = await params

    const picks = await prisma.survivorPick.findMany({
      where: {
        entryId: entryId,
        entry: {
          poolId: poolId,
          userId: session.user.id,
        },
      },
      include: {
        team: true,
        game: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
      orderBy: {
        week: 'asc',
      },
    })

    return NextResponse.json({ picks })
  } catch (error) {
    console.error('Error fetching picks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/survivor/pools/[poolId]/entries/[entryId]/picks - Submit a survivor pick
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ poolId: string; entryId: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { poolId, entryId } = await params
    const body = await request.json()
    const { teamId, gameId, week = 1 } = body

    console.log('Submitting survivor pick:', {
      poolId,
      entryId,
      teamId,
      gameId,
      week,
    })

    // Validate the entry exists and belongs to the user
    const entry = await prisma.survivorEntry.findFirst({
      where: {
        id: entryId,
        poolId: poolId,
        userId: session.user.id,
      },
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found or not owned by user' },
        { status: 404 }
      )
    }

    // Check if entry is still active
    if (!entry.isActive) {
      return NextResponse.json(
        { error: 'Entry is eliminated' },
        { status: 400 }
      )
    }

    // Check if pick already exists for this week
    const existingPick = await prisma.survivorPick.findFirst({
      where: {
        entryId: entryId,
        week: week,
      },
      include: {
        team: true,
        game: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    })

    if (existingPick) {
      console.log(
        'ERROR: Pick already exists for week',
        week,
        'entryId:',
        entryId,
        'Team:',
        existingPick.team.name
      )
      return NextResponse.json(
        {
          error: `Pick already submitted for this week. You selected ${existingPick.team.name} for Week ${week}.`,
          existingPick: {
            teamName: existingPick.team.name,
            teamAbbr: existingPick.team.nflAbbr,
            week: existingPick.week,
            result: existingPick.result,
          },
        },
        { status: 400 }
      )
    }

    // Check if team has been used before by this entry
    const previousTeamUse = await prisma.survivorPick.findFirst({
      where: {
        entryId: entryId,
        teamId: teamId,
      },
    })

    if (previousTeamUse) {
      console.log('ERROR: Team already used:', teamId, 'for entryId:', entryId)
      return NextResponse.json(
        { error: 'Team has already been used in this survivor pool' },
        { status: 400 }
      )
    }

    // Validate the game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Validate the team is playing in this game
    if (game.homeTeamId !== teamId && game.awayTeamId !== teamId) {
      console.log(
        'ERROR: Team not in game. TeamId:',
        teamId,
        'HomeTeamId:',
        game.homeTeamId,
        'AwayTeamId:',
        game.awayTeamId
      )
      return NextResponse.json(
        { error: 'Team is not playing in the specified game' },
        { status: 400 }
      )
    }

    // Create the survivor pick
    const pick = await prisma.survivorPick.create({
      data: {
        entryId: entryId,
        week: week,
        teamId: teamId,
        gameId: gameId,
        result: 'PENDING', // Will be updated when game completes
      },
      include: {
        team: true,
        game: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    })

    console.log('Survivor pick created:', pick.id)

    return NextResponse.json({
      success: true,
      pick: {
        id: pick.id,
        week: pick.week,
        team: {
          id: pick.team.id,
          name: pick.team.name,
          abbr: pick.team.nflAbbr,
        },
        game: {
          id: pick.game.id,
          homeTeam: pick.game.homeTeam.name,
          awayTeam: pick.game.awayTeam.name,
          kickoff: pick.game.kickoff,
        },
        pickedAt: pick.pickedAt,
      },
    })
  } catch (error) {
    console.error('Error submitting survivor pick:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/survivor/pools/[poolId]/entries/[entryId]/picks - Update an existing survivor pick
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ poolId: string; entryId: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { poolId, entryId } = await params
    const body = await request.json()
    const { teamId, gameId, week = 1, pickId } = body

    console.log('Updating survivor pick:', {
      poolId,
      entryId,
      teamId,
      gameId,
      week,
      pickId,
    })

    // Validate the entry exists and belongs to the user
    const entry = await prisma.survivorEntry.findFirst({
      where: {
        id: entryId,
        poolId: poolId,
        userId: session.user.id,
      },
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found or not owned by user' },
        { status: 404 }
      )
    }

    // Check if entry is still active
    if (!entry.isActive) {
      return NextResponse.json(
        { error: 'Entry is eliminated' },
        { status: 400 }
      )
    }

    // Find the existing pick for this week
    const existingPick = await prisma.survivorPick.findFirst({
      where: {
        entryId: entryId,
        week: week,
      },
      include: {
        team: true,
        game: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    })

    if (!existingPick) {
      return NextResponse.json(
        { error: 'No existing pick found for this week' },
        { status: 404 }
      )
    }

    // Check if game has already started (can't update after game starts)
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Check if game has started (simplified - in production would check actual kickoff time)
    if (existingPick.result !== 'PENDING') {
      return NextResponse.json(
        {
          error: 'Cannot update pick after game has completed',
          currentResult: existingPick.result,
        },
        { status: 400 }
      )
    }

    // Validate the team is playing in the new game
    if (game.homeTeamId !== teamId && game.awayTeamId !== teamId) {
      console.log(
        'ERROR: Team not in game. TeamId:',
        teamId,
        'HomeTeamId:',
        game.homeTeamId,
        'AwayTeamId:',
        game.awayTeamId
      )
      return NextResponse.json(
        { error: 'Team is not playing in the specified game' },
        { status: 400 }
      )
    }

    // Check if team has been used before by this entry (excluding current pick)
    const previousTeamUse = await prisma.survivorPick.findFirst({
      where: {
        entryId: entryId,
        teamId: teamId,
        id: { not: existingPick.id }, // Exclude the current pick we're updating
      },
    })

    if (previousTeamUse) {
      console.log('ERROR: Team already used:', teamId, 'for entryId:', entryId)
      return NextResponse.json(
        { error: 'Team has already been used in this survivor pool' },
        { status: 400 }
      )
    }

    // Update the survivor pick
    const updatedPick = await prisma.survivorPick.update({
      where: { id: existingPick.id },
      data: {
        teamId: teamId,
        gameId: gameId,
        pickedAt: new Date(), // Update the timestamp
      },
      include: {
        team: true,
        game: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    })

    console.log('Survivor pick updated:', updatedPick.id)

    return NextResponse.json({
      success: true,
      updated: true,
      pick: {
        id: updatedPick.id,
        week: updatedPick.week,
        team: {
          id: updatedPick.team.id,
          name: updatedPick.team.name,
          abbr: updatedPick.team.nflAbbr,
        },
        game: {
          id: updatedPick.game.id,
          homeTeam: updatedPick.game.homeTeam.name,
          awayTeam: updatedPick.game.awayTeam.name,
          kickoff: updatedPick.game.kickoff,
        },
        pickedAt: updatedPick.pickedAt,
      },
    })
  } catch (error) {
    console.error('Error updating survivor pick:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
