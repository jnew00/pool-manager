import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Mock auth until next-auth is configured
async function getServerSession() {
  return { user: { id: 'user-123' } }
}

const copyPicksSchema = z.object({
  sourceEntryId: z.string(),
  targetEntryIds: z.array(z.string()).min(1),
  week: z.number().min(1).max(18),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = copyPicksSchema.parse(body)

    // Get source entry and pick
    const sourceEntry = await prisma.survivorEntry.findFirst({
      where: {
        id: validated.sourceEntryId,
        userId: session.user.id,
        eliminatedWeek: null,
      },
      include: {
        picks: {
          where: {
            week: validated.week,
          },
          include: {
            team: {
              select: {
                id: true,
                abbreviation: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!sourceEntry) {
      return NextResponse.json(
        {
          error: 'Source entry not found or not owned by user',
        },
        { status: 403 }
      )
    }

    if (sourceEntry.picks.length === 0) {
      return NextResponse.json(
        {
          error: 'No pick found for source entry in specified week',
        },
        { status: 400 }
      )
    }

    const sourcePick = sourceEntry.picks[0]

    // Verify target entries are owned by user and can use the team
    const targetEntries = await prisma.survivorEntry.findMany({
      where: {
        id: { in: validated.targetEntryIds },
        userId: session.user.id,
        eliminatedWeek: null,
      },
      include: {
        picks: {
          where: {
            result: { in: ['WIN', 'PENDING'] },
          },
          select: {
            teamId: true,
            week: true,
          },
        },
      },
    })

    if (targetEntries.length !== validated.targetEntryIds.length) {
      return NextResponse.json(
        {
          error: 'Some target entries not found or not owned by user',
        },
        { status: 403 }
      )
    }

    // Check which entries can use the team
    const validTargets = []
    const invalidTargets = []

    for (const target of targetEntries) {
      const hasUsedTeam = target.picks.some(
        (p) => p.teamId === sourcePick.teamId
      )
      const hasPickThisWeek = target.picks.some(
        (p) => p.week === validated.week
      )

      if (hasUsedTeam) {
        invalidTargets.push({
          entryId: target.id,
          reason: `Already used ${sourcePick.team.abbreviation}`,
        })
      } else if (hasPickThisWeek) {
        // Update existing pick
        await prisma.survivorPick.updateMany({
          where: {
            entryId: target.id,
            week: validated.week,
          },
          data: {
            teamId: sourcePick.teamId,
          },
        })
        validTargets.push(target.id)
      } else {
        // Create new pick
        await prisma.survivorPick.create({
          data: {
            entryId: target.id,
            week: validated.week,
            teamId: sourcePick.teamId,
            result: 'PENDING',
          },
        })
        validTargets.push(target.id)
      }
    }

    return NextResponse.json({
      success: true,
      copiedTo: validTargets,
      failed: invalidTargets,
      pick: {
        week: validated.week,
        teamId: sourcePick.teamId,
        teamAbbr: sourcePick.team.abbreviation,
        teamName: sourcePick.team.name,
      },
    })
  } catch (error) {
    console.error('Error copying picks:', error)
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
