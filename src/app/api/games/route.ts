import { NextRequest } from 'next/server'
import { GameService } from '@/server/services/game.service'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
  parseRequestBody,
  validateRequiredFields,
  extractQueryParams,
} from '@/lib/api/response'

const gameService = new GameService()

/**
 * GET /api/games - Get games with optional filtering
 */
export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const { searchParams } = new URL(request.url)
    const week = searchParams.get('week')
    const season = searchParams.get('season')

    if (week && season) {
      const games = await gameService.getGamesBySeasonAndWeek(
        parseInt(season, 10),
        parseInt(week, 10)
      )
      return createSuccessResponse(games)
    }

    if (week) {
      const games = await gameService.getGamesByWeek(parseInt(week, 10))
      return createSuccessResponse(games)
    }

    if (season) {
      const games = await gameService.getGamesBySeason(parseInt(season, 10))
      return createSuccessResponse(games)
    }

    // For now, return empty array if no filters specified
    return createSuccessResponse([])
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * POST /api/games - Create games (single or bulk from OCR)
 */
export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST'])
  if (methodError) return methodError

  try {
    const body = await parseRequestBody<{
      // Single game creation
      season?: number
      week?: number
      homeTeamId?: string
      awayTeamId?: string
      kickoff?: string
      status?: string
      venue?: string
      // Bulk game creation from OCR
      games?: Array<{
        season: number
        week: number
        kickoff_et: string
        home_team: string
        away_team: string
        spread_for_home?: number | null
        total?: number | null
        moneyline_home?: number | null
        moneyline_away?: number | null
        source_label?: string | null
      }>
      poolId?: string
    }>(request)

    // Handle bulk game creation from OCR
    if (body.games && Array.isArray(body.games)) {
      const result = await gameService.createGamesFromOCR(
        body.games,
        body.poolId
      )
      return createSuccessResponse(result)
    }

    // Handle single game creation
    validateRequiredFields(body, [
      'season',
      'week',
      'homeTeamId',
      'awayTeamId',
      'kickoff',
    ])

    const game = await gameService.createGame({
      season: body.season!,
      week: body.week!,
      homeTeamId: body.homeTeamId!,
      awayTeamId: body.awayTeamId!,
      kickoff: new Date(body.kickoff!),
      status: body.status as any,
      venue: body.venue,
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: game,
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
