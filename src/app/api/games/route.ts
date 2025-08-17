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

    if (week) {
      const games = await gameService.getGamesByWeek(parseInt(week, 10))
      return createSuccessResponse(games)
    }

    // For now, return empty array if no week specified
    // In a real app, you might want to return all games or recent games
    return createSuccessResponse([])
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * POST /api/games - Create a new game
 */
export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST'])
  if (methodError) return methodError

  try {
    const body = await parseRequestBody<{
      season: number
      week: number
      homeTeamId: string
      awayTeamId: string
      kickoff: string
      status?: string
      venue?: string
    }>(request)

    validateRequiredFields(body, ['season', 'week', 'homeTeamId', 'awayTeamId', 'kickoff'])

    const game = await gameService.createGame({
      season: body.season,
      week: body.week,
      homeTeamId: body.homeTeamId,
      awayTeamId: body.awayTeamId,
      kickoff: new Date(body.kickoff),
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