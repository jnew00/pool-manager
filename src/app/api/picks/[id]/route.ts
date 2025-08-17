import { NextRequest } from 'next/server'
import { PickService } from '@/server/services/pick.service'
import { NotFoundError } from '@/lib/types/database'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
  parseRequestBody,
} from '@/lib/api/response'

const pickService = new PickService()

/**
 * GET /api/picks/[id] - Get pick by ID with relations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const pick = await pickService.getPickById(params.id)
    
    if (!pick) {
      throw new NotFoundError('Pick not found')
    }

    return createSuccessResponse(pick)
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * PUT /api/picks/[id] - Update pick
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const methodError = validateMethod(request, ['PUT'])
  if (methodError) return methodError

  try {
    const body = await parseRequestBody<{
      teamId?: string
      confidence?: number
    }>(request)

    const pick = await pickService.updatePick(params.id, body)
    return createSuccessResponse(pick)
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * DELETE /api/picks/[id] - Delete pick
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const methodError = validateMethod(request, ['DELETE'])
  if (methodError) return methodError

  try {
    const success = await pickService.deletePick(params.id)
    
    if (!success) {
      throw new NotFoundError('Pick not found')
    }

    return createSuccessResponse({ deleted: true })
  } catch (error) {
    return handleServiceError(error)
  }
}