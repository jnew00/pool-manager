import { NextRequest } from 'next/server'
import { StandingsService } from '@/server/services/standings.service'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
} from '@/lib/api/response'

const standingsService = new StandingsService()

/**
 * GET /api/standings - Get pool standings
 * Query params:
 * - poolId: pool ID to get standings for
 * - season: season year
 * - week?: optional week number for weekly standings
 */
export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const { searchParams } = new URL(request.url)
    const poolId = searchParams.get('poolId')
    const seasonParam = searchParams.get('season')
    const weekParam = searchParams.get('week')

    if (!poolId || !seasonParam) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'poolId and season parameters are required',
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

    let standings
    if (weekParam) {
      const week = parseInt(weekParam)
      if (isNaN(week)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'week must be a valid number',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
      standings = await standingsService.getWeeklyStandings(
        poolId,
        season,
        week
      )
    } else {
      standings = await standingsService.getPoolStandings(poolId, season)
    }

    return createSuccessResponse(standings)
  } catch (error) {
    return handleServiceError(error)
  }
}
