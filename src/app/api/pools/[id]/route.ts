import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PoolService } from '@/server/services/pool.service'
import { handleServiceError, validateMethod, parseRequestBody } from '@/lib/api/response'

const poolService = new PoolService()

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

// PATCH /api/pools/[id] - Update pool by ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const methodError = validateMethod(request, ['PATCH'])
  if (methodError) return methodError

  try {
    const { id } = await params
    const body = await parseRequestBody<{
      name?: string
      buyIn?: number
      maxEntries?: number
      isActive?: boolean
      description?: string
      url?: string
    }>(request)

    const pool = await poolService.updatePool(id, body)
    
    return NextResponse.json({
      success: true,
      data: pool,
    })
  } catch (error) {
    return handleServiceError(error)
  }
}

// DELETE /api/pools/[id] - Delete pool by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const methodError = validateMethod(request, ['DELETE'])
  if (methodError) return methodError

  try {
    const { id } = await params

    const deleted = await poolService.deletePool(id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Pool deleted successfully',
    })
  } catch (error) {
    return handleServiceError(error)
  }
}
