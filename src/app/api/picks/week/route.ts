import { NextRequest } from 'next/server'
import { PickService } from '@/server/services/pick.service'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
} from '@/lib/api/response'

const pickService = new PickService()

/**
 * GET /api/picks/week - Get picks for a specific week with results and record
 */
export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('entryId')
    const season = searchParams.get('season')
    const week = searchParams.get('week')

    if (!entryId || !season || !week) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameters: entryId, season, week',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const [picks, record] = await Promise.all([
      pickService.getPicksWithResultsForWeek(
        entryId,
        parseInt(season),
        parseInt(week)
      ),
      pickService.getWeekRecord(entryId, parseInt(season), parseInt(week)),
    ])

    return createSuccessResponse({
      picks,
      record,
    })
  } catch (error) {
    return handleServiceError(error)
  }
}
