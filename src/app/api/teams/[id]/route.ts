import { NextRequest } from 'next/server'
import { TeamService } from '@/server/services/team.service'
import { NotFoundError } from '@/lib/types/database'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
  parseRequestBody,
} from '@/lib/api/response'

const teamService = new TeamService()

/**
 * GET /api/teams/[id] - Get team by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const team = await teamService.getTeamById(params.id)
    
    if (!team) {
      throw new NotFoundError('Team not found')
    }

    return createSuccessResponse(team)
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * PUT /api/teams/[id] - Update team
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const methodError = validateMethod(request, ['PUT'])
  if (methodError) return methodError

  try {
    const body = await parseRequestBody<{
      name?: string
    }>(request)

    const team = await teamService.updateTeam(params.id, body)
    return createSuccessResponse(team)
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * DELETE /api/teams/[id] - Delete team
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const methodError = validateMethod(request, ['DELETE'])
  if (methodError) return methodError

  try {
    const success = await teamService.deleteTeam(params.id)
    
    if (!success) {
      throw new NotFoundError('Team not found')
    }

    return createSuccessResponse({ deleted: true })
  } catch (error) {
    return handleServiceError(error)
  }
}