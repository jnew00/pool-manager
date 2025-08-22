import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock auth until next-auth is configured
async function getServerSession() {
  return { user: { id: 'user-123' } }
}

// GET /api/survivor/pools/[poolId]/settings - Get pool settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ poolId: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { poolId } = await params

    // Get pool with rules/settings
    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
      select: {
        id: true,
        name: true,
        type: true,
        rules: true,
        isActive: true,
      },
    })

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    if (pool.type !== 'SURVIVOR') {
      return NextResponse.json(
        { error: 'Not a survivor pool' },
        { status: 400 }
      )
    }

    // Extract settings from rules JSON or provide defaults
    const rules = (pool.rules as any) || {}

    const settings = {
      maxStrikes: rules.strikesAllowed || 1,
      allowLatePicks: rules.allowLatePicks || false,
      multiEntry: rules.maxEntriesPerUser > 1 || true,
      maxEntriesPerUser: rules.maxEntriesPerUser || 3,
      buybackEnabled: rules.buybackAvailable || false,
      buybackCost: rules.buybackCost || 100,
      buybackDeadlineWeek: rules.buybackDeadlineWeek || 6,
      tiebreakerMethod: rules.tiebreakerMethod || 'MARGIN_OF_VICTORY',
      publicPicksEnabled: rules.publicPicks !== false,
      publicPicksDelay: rules.publicPicksDelay || 0,
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching pool settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/survivor/pools/[poolId]/settings - Update pool settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ poolId: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { poolId } = await params
    const body = await request.json()

    // Check if user is pool admin (for now, just allow authenticated users)
    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
      select: {
        id: true,
        type: true,
        creatorId: true,
      },
    })

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    if (pool.type !== 'SURVIVOR') {
      return NextResponse.json(
        { error: 'Not a survivor pool' },
        { status: 400 }
      )
    }

    // For now, allow any authenticated user to update settings
    // In production, check if user is pool admin

    // Update pool rules with new settings
    const updatedRules = {
      strikesAllowed: body.maxStrikes || 1,
      allowLatePicks: body.allowLatePicks || false,
      maxEntriesPerUser: body.maxEntriesPerUser || 3,
      buybackAvailable: body.buybackEnabled || false,
      buybackCost: body.buybackCost || 100,
      buybackDeadlineWeek: body.buybackDeadlineWeek || 6,
      tiebreakerMethod: body.tiebreakerMethod || 'MARGIN_OF_VICTORY',
      publicPicks: body.publicPicksEnabled !== false,
      publicPicksDelay: body.publicPicksDelay || 0,
    }

    await prisma.pool.update({
      where: { id: poolId },
      data: {
        rules: updatedRules,
      },
    })

    const settings = {
      maxStrikes: updatedRules.strikesAllowed,
      allowLatePicks: updatedRules.allowLatePicks,
      multiEntry: updatedRules.maxEntriesPerUser > 1,
      maxEntriesPerUser: updatedRules.maxEntriesPerUser,
      buybackEnabled: updatedRules.buybackAvailable,
      buybackCost: updatedRules.buybackCost,
      buybackDeadlineWeek: updatedRules.buybackDeadlineWeek,
      tiebreakerMethod: updatedRules.tiebreakerMethod,
      publicPicksEnabled: updatedRules.publicPicks,
      publicPicksDelay: updatedRules.publicPicksDelay,
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating pool settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
