import { NextRequest } from 'next/server'
import { StandingsService } from '@/server/services/standings.service'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
} from '@/lib/api/response'

const standingsService = new StandingsService()

/**
 * GET /api/standings/[entryId] - Get detailed entry performance
 * Query params:
 * - season: season year
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const { entryId } = await params
    const { searchParams } = new URL(request.url)
    const seasonParam = searchParams.get('season')

    if (!seasonParam) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'season parameter is required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const season = parseInt(seasonParam)
    if (isNaN(season)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'season must be a valid number',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const entryDetail = await standingsService.getEntryDetail(entryId, season)

    return createSuccessResponse(entryDetail)
  } catch (error) {
    return handleServiceError(error)
  }
}
