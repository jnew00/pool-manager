import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Mock auth until next-auth is configured
async function getServerSession() {
  return { user: { id: 'user-123' } }
}

const updateEntrySchema = z.object({
  entryName: z.string().min(1).max(50).optional(),
  entryUrl: z
    .union([z.string().url(), z.literal(''), z.null(), z.undefined()])
    .optional(),
})

// PATCH /api/survivor/pools/[poolId]/entries/[entryId] - Update entry basic info
export async function PATCH(
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
    const validated = updateEntrySchema.parse(body)

    // Verify entry exists and belongs to the user
    const entry = await prisma.survivorEntry.findFirst({
      where: {
        id: entryId,
        poolId,
        userId: session.user.id,
      },
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found or access denied' },
        { status: 404 }
      )
    }

    // Check if new entry name conflicts with existing entries
    if (validated.entryName && validated.entryName !== entry.entryName) {
      const existingEntryWithName = await prisma.survivorEntry.findFirst({
        where: {
          poolId,
          userId: session.user.id,
          entryName: validated.entryName,
          id: { not: entryId }, // Exclude current entry
        },
      })

      if (existingEntryWithName) {
        return NextResponse.json(
          {
            error: `Entry name '${validated.entryName}' already exists. Please choose a different name.`,
          },
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: any = {}
    if (validated.entryName !== undefined) {
      updateData.entryName = validated.entryName
    }
    if (validated.entryUrl !== undefined) {
      updateData.entryUrl =
        validated.entryUrl &&
        validated.entryUrl !== '' &&
        validated.entryUrl !== null
          ? validated.entryUrl
          : null
    }

    // Update the entry
    const updatedEntry = await prisma.survivorEntry.update({
      where: { id: entryId },
      data: updateData,
    })

    return NextResponse.json({
      id: updatedEntry.id,
      entryName: updatedEntry.entryName,
      entryUrl: updatedEntry.entryUrl,
      userId: updatedEntry.userId,
      isActive: updatedEntry.isActive,
      eliminatedWeek: updatedEntry.eliminatedWeek,
      strikes: updatedEntry.strikes,
    })
  } catch (error) {
    console.error('Error updating entry:', error)
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
