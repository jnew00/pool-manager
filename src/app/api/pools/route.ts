import { NextRequest } from 'next/server'
import { PoolService } from '@/server/services/pool.service'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
  parseRequestBody,
  validateRequiredFields,
} from '@/lib/api/response'

const poolService = new PoolService()

/**
 * GET /api/pools - Get pools with optional filtering
 */
export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season')

    if (season) {
      const pools = await poolService.getPoolsBySeason(parseInt(season, 10))
      return createSuccessResponse(pools)
    }

    // For now, return empty array if no season specified
    // In a real app, you might want to return all pools or current season pools
    return createSuccessResponse([])
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * POST /api/pools - Create a new pool
 */
export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST'])
  if (methodError) return methodError

  try {
    const body = await parseRequestBody<{
      name: string
      type: string
      season: number
      buyIn: number
      maxEntries: number
      isActive: boolean
      description?: string
    }>(request)

    validateRequiredFields(body, ['name', 'type', 'season', 'buyIn', 'maxEntries', 'isActive'])

    const pool = await poolService.createPool({
      name: body.name,
      type: body.type as any,
      season: body.season,
      buyIn: body.buyIn,
      maxEntries: body.maxEntries,
      isActive: body.isActive,
      description: body.description,
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: pool,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return handleServiceError(error)
  }
}