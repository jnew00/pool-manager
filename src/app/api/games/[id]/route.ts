import { NextRequest } from 'next/server'
import { GameService } from '@/server/services/game.service'
import { NotFoundError } from '@/lib/types/database'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
  parseRequestBody,
} from '@/lib/api/response'

const gameService = new GameService()

/**
 * GET /api/games/[id] - Get game by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const game = await gameService.getGameById(params.id)
    
    if (!game) {
      throw new NotFoundError('Game not found')
    }

    return createSuccessResponse(game)
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * PUT /api/games/[id] - Update game
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const methodError = validateMethod(request, ['PUT'])
  if (methodError) return methodError

  try {
    const body = await parseRequestBody<{
      status?: string
    }>(request)

    const game = await gameService.updateGameStatus(params.id, body.status as any)
    return createSuccessResponse(game)
  } catch (error) {
    return handleServiceError(error)
  }
}