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
 * POST /api/picks/lock - Lock in all picks for a specific week
 */
export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST'])
  if (methodError) return methodError

  try {
    const body = await parseRequestBody<{
      entryId: string
      season: number
      week: number
    }>(request)

    validateRequiredFields(body, ['entryId', 'season', 'week'])

    const result = await pickService.lockInPicksForWeek(
      body.entryId,
      body.season,
      body.week
    )

    return createSuccessResponse(result, 'Picks locked in successfully')
  } catch (error) {
    return handleServiceError(error)
  }
}
