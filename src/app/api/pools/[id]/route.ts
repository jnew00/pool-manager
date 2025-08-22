import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple GET /api/pools/[id] - Get pool by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pool = await prisma.pool.findUnique({
      where: { id },
      include: {
        survivorEntries: {
          include: {
            picks: {
              include: {
                team: true,
                game: {
                  include: {
                    homeTeam: true,
                    awayTeam: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: pool,
    })
  } catch (error) {
    console.error('Error fetching pool:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
