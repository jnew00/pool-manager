import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Mock auth until next-auth is configured
async function getServerSession() {
  return { user: { id: 'user-123' } }
}

const createEntrySchema = z.object({
  poolId: z.string(),
  userId: z.string(),
  name: z.string().min(1).max(50),
})

// GET /api/survivor/entries - Get all entries for a user in a pool
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const poolId = searchParams.get('poolId')
    const userId = searchParams.get('userId')

    if (!poolId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Verify user owns these entries or is admin
    if (userId !== session.user.id) {
      const pool = await prisma.pool.findUnique({
        where: { id: poolId },
        select: { creatorId: true },
      })

      if (pool?.creatorId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Get all survivor entries for the user in this pool
    const entries = await prisma.survivorEntry.findMany({
      where: {
        poolId,
        userId,
      },
      include: {
        picks: {
          where: {
            week: {
              gte: await getCurrentWeek(),
            },
          },
          orderBy: {
            week: 'desc',
          },
          take: 1,
          include: {
            team: {
              select: {
                id: true,
                nflAbbr: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Transform data for frontend
    const transformedEntries = await Promise.all(
      entries.map(async (entry) => {
        const usedTeams = await prisma.survivorPick.findMany({
          where: {
            entryId: entry.id,
            result: { in: ['WIN', 'PENDING'] },
          },
          select: {
            teamId: true,
          },
        })

        const currentPick = entry.picks[0]
        const survivalProbability = calculateSurvivalProbability(entry)

        return {
          id: entry.id,
          name: entry.entryName || `Entry ${entries.indexOf(entry) + 1}`,
          isActive: entry.isActive,
          eliminatedWeek: entry.eliminatedWeek,
          strikes: entry.strikes,
          currentPick: currentPick
            ? {
                week: currentPick.week,
                teamId: currentPick.teamId,
                teamAbbr: currentPick.team.nflAbbr,
                winProbability: await getWinProbability(
                  currentPick.teamId,
                  currentPick.week
                ),
              }
            : null,
          usedTeams: usedTeams.map((p) => p.teamId),
          strategy: 'BALANCED',
          survivalProbability,
        }
      })
    )

    return NextResponse.json(transformedEntries)
  } catch (error) {
    console.error('Error fetching entries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/survivor/entries - Create a new entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createEntrySchema.parse(body)

    // Check if pool exists and user can create entries
    const pool = await prisma.pool.findUnique({
      where: { id: validated.poolId },
      select: {
        id: true,
        type: true,
        rules: true,
        isActive: true,
      },
    })

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    if (!pool.isActive) {
      return NextResponse.json({ error: 'Pool is not active' }, { status: 403 })
    }

    if (pool.type !== 'SURVIVOR') {
      return NextResponse.json(
        { error: 'Not a survivor pool' },
        { status: 400 }
      )
    }

    // Check max entries limit
    const maxEntries = (pool?.rules as any)?.maxEntriesPerUser || 3

    const existingEntries = await prisma.survivorEntry.count({
      where: {
        poolId: validated.poolId,
        userId: validated.userId,
      },
    })

    if (existingEntries >= maxEntries) {
      return NextResponse.json(
        {
          error: `Maximum ${maxEntries} entries allowed per user`,
        },
        { status: 400 }
      )
    }

    // Create the new entry
    const entry = await prisma.survivorEntry.create({
      data: {
        poolId: validated.poolId,
        userId: validated.userId,
        entryName: validated.name,
        strikes: 0,
        isActive: true,
      },
    })

    return NextResponse.json({
      id: entry.id,
      name: entry.entryName,
      isActive: true,
      strikes: 0,
      usedTeams: [],
      strategy: 'BALANCED',
      survivalProbability: 1.0,
    })
  } catch (error) {
    console.error('Error creating entry:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
async function getCurrentWeek(): Promise<number> {
  const now = new Date()
  const seasonStart = new Date('2024-09-05') // NFL season start
  const weeksSinceStart = Math.floor(
    (now.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
  )
  return Math.min(Math.max(1, weeksSinceStart + 1), 18)
}

async function getWinProbability(
  teamId: string,
  week: number
): Promise<number> {
  // Get game and calculate win probability from odds
  const game = await prisma.game.findFirst({
    where: {
      week,
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
    },
    include: {
      lines: {
        orderBy: { capturedAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!game || !game.lines[0]) {
    return 0.5 // Default to 50% if no odds available
  }

  const line = game.lines[0]
  const isHome = game.homeTeamId === teamId
  const moneyline = isHome ? line.moneylineHome : line.moneylineAway

  if (!moneyline) {
    return 0.5 // Default if no moneyline available
  }

  // Convert moneyline to implied probability
  if (moneyline < 0) {
    return Math.abs(moneyline) / (Math.abs(moneyline) + 100)
  } else {
    return 100 / (moneyline + 100)
  }
}

function calculateSurvivalProbability(entry: any): number {
  if (entry.eliminatedWeek) return 0

  const weeksRemaining = 18 - (entry.picks[0]?.week || 1)
  const strikesUsed = entry.strikes
  const maxStrikes = 2 // Assuming 2 strikes allowed

  // Simple survival probability calculation
  const baseRate = 0.75 // Assume 75% weekly survival rate
  const strikePenalty = strikesUsed * 0.15
  const weeklyRate = Math.max(0.5, baseRate - strikePenalty)

  return Math.pow(weeklyRate, weeksRemaining)
}
