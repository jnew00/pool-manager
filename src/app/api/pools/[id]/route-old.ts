import { NextRequest } from 'next/server'
import { PoolService } from '@/server/services/pool.service'
import { NotFoundError } from '@/lib/types/database'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
  parseRequestBody,
} from '@/lib/api/response'

const poolService = new PoolService()

/**
 * GET /api/pools/[id] - Get pool by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const { id } = await params
    const pool = await poolService.getPoolById(id)

    if (!pool) {
      throw new NotFoundError('Pool not found')
    }

    return createSuccessResponse(pool)
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * PUT /api/pools/[id] - Update pool
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const methodError = validateMethod(request, ['PUT'])
  if (methodError) return methodError

  try {
    const { id } = await params
    const body = await parseRequestBody<{
      name?: string
      buyIn?: number
      maxEntries?: number
      isActive?: boolean
      description?: string
    }>(request)

    const pool = await poolService.updatePool(id, body)
    return createSuccessResponse(pool)
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * DELETE /api/pools/[id] - Delete pool
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const methodError = validateMethod(request, ['DELETE'])
  if (methodError) return methodError

  try {
    const { id } = await params
    const success = await poolService.deletePool(id)

    if (!success) {
      throw new NotFoundError('Pool not found')
    }

    return createSuccessResponse({ deleted: true })
  } catch (error) {
    return handleServiceError(error)
  }
}
