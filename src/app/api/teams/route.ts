import { NextRequest } from 'next/server'
import { TeamService } from '@/server/services/team.service'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
  parseRequestBody,
  validateRequiredFields,
} from '@/lib/api/response'

const teamService = new TeamService()

/**
 * GET /api/teams - Get all teams
 */
export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const teams = await teamService.getAllTeams()
    return createSuccessResponse(teams)
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * POST /api/teams - Create a new team
 */
export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST'])
  if (methodError) return methodError

  try {
    const body = await parseRequestBody<{
      nflAbbr: string
      name: string
    }>(request)

    validateRequiredFields(body, ['nflAbbr', 'name'])

    const team = await teamService.createTeam({
      nflAbbr: body.nflAbbr,
      name: body.name,
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: team,
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