import { NextRequest } from 'next/server'
import { PickLockingService } from '@/server/services/pick-locking.service'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
} from '@/lib/api/response'

const lockingService = new PickLockingService()

/**
 * GET /api/picks/lock-status - Get lock status for games
 * Query params:
 * - gameIds: comma-separated list of game IDs
 * - poolId: pool ID to check rules against
 */
export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const { searchParams } = new URL(request.url)
    const gameIdsParam = searchParams.get('gameIds')
    const poolId = searchParams.get('poolId')

    if (gameIdsParam === null || !poolId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'gameIds and poolId parameters are required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const gameIds = gameIdsParam.split(',').filter((id) => id.trim())

    if (gameIds.length === 0) {
      return createSuccessResponse({})
    }

    const lockStatuses = await lockingService.getGameLockStatus(gameIds, poolId)

    return createSuccessResponse(lockStatuses)
  } catch (error) {
    return handleServiceError(error)
  }
}
