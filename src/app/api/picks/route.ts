import { NextRequest } from 'next/server'
import { PickService } from '@/server/services/pick.service'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
  parseRequestBody,
  validateRequiredFields,
} from '@/lib/api/response'

const pickService = new PickService()

/**
 * GET /api/picks - Get picks with optional filtering
 */
export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('entryId')

    if (entryId) {
      const picks = await pickService.getPicksByEntry(entryId)
      return createSuccessResponse(picks)
    }

    // For now, return empty array if no entryId specified
    // In a real app, you might want to return user's picks or recent picks
    return createSuccessResponse([])
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * POST /api/picks - Create a new pick
 */
export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST'])
  if (methodError) return methodError

  try {
    const body = await parseRequestBody<{
      entryId: string
      gameId: string
      teamId: string
      confidence: number
    }>(request)

    validateRequiredFields(body, ['entryId', 'gameId', 'teamId', 'confidence'])

    const pick = await pickService.createPick({
      entryId: body.entryId,
      gameId: body.gameId,
      teamId: body.teamId,
      confidence: body.confidence,
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: pick,
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