import { NextRequest } from 'next/server'
import { EntryService } from '@/server/services/entry.service'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
  parseRequestBody,
  validateRequiredFields,
} from '@/lib/api/response'

const entryService = new EntryService()

/**
 * GET /api/entries - Get entries with optional filtering
 */
export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const { searchParams } = new URL(request.url)
    const poolId = searchParams.get('poolId')

    if (poolId) {
      const entries = await entryService.getEntriesByPool(poolId)
      return createSuccessResponse(entries)
    }

    // For now, return empty array if no poolId specified
    // In a real app, you might want to return all entries or user's entries
    return createSuccessResponse([])
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * POST /api/entries - Create a new entry
 */
export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST'])
  if (methodError) return methodError

  try {
    const body = await parseRequestBody<{
      poolId: string
      season: number
    }>(request)

    validateRequiredFields(body, ['poolId', 'season'])

    const entry = await entryService.createEntry({
      poolId: body.poolId,
      season: body.season,
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: entry,
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