import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
} from '@/lib/api/response'

/**
 * GET /api/completions - Get pool completions for a user/week/season
 */
export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const week = searchParams.get('week')
    const season = searchParams.get('season')

    if (!userId || !week || !season) {
      return new Response(
        JSON.stringify({ error: 'userId, week, and season are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const completions = await prisma.poolCompletion.findMany({
      where: {
        userId,
        week: parseInt(week),
        season: parseInt(season),
      },
      select: {
        poolId: true,
        isCompleted: true,
        completedAt: true,
      },
    })

    return createSuccessResponse(completions)
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * POST /api/completions - Save pool completion status
 */
export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST'])
  if (methodError) return methodError

  try {
    const body = await request.json()
    const { poolId, userId, week, season, isCompleted } = body

    if (!poolId || !userId || week === undefined || !season) {
      return new Response(
        JSON.stringify({ error: 'poolId, userId, week, and season are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const completion = await prisma.poolCompletion.upsert({
      where: {
        poolId_userId_week_season: {
          poolId,
          userId,
          week: parseInt(week),
          season: parseInt(season),
        },
      },
      update: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        poolId,
        userId,
        week: parseInt(week),
        season: parseInt(season),
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    })

    return createSuccessResponse(completion)
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * DELETE /api/completions - Clear completions for a user/week/season
 */
export async function DELETE(request: NextRequest) {
  const methodError = validateMethod(request, ['DELETE'])
  if (methodError) return methodError

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const week = searchParams.get('week')
    const season = searchParams.get('season')

    if (!userId || !week || !season) {
      return new Response(
        JSON.stringify({ error: 'userId, week, and season are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    await prisma.poolCompletion.deleteMany({
      where: {
        userId,
        week: parseInt(week),
        season: parseInt(season),
      },
    })

    return createSuccessResponse({ message: 'Completions cleared' })
  } catch (error) {
    return handleServiceError(error)
  }
}