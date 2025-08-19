import { NextRequest } from 'next/server'
import { PickService } from '@/server/services/pick.service'
import { PickLockingService } from '@/server/services/pick-locking.service'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
  parseRequestBody,
  validateRequiredFields,
} from '@/lib/api/response'

const pickService = new PickService()
const lockingService = new PickLockingService()

/**
 * GET /api/picks - Get picks with optional filtering
 */
export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('entryId')

    if (entryId) {
      const picks = await pickService.getPicksByEntry(entryId)
      return createSuccessResponse(picks)
    }

    // For now, return empty array if no entryId specified
    // In a real app, you might want to return user's picks or recent picks
    return createSuccessResponse([])
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * POST /api/picks - Create new picks (supports single or bulk)
 */
export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST'])
  if (methodError) return methodError

  try {
    const body = await parseRequestBody<
      | {
          entryId: string
          picks: Array<{
            gameId: string
            teamId: string
            confidence: number
          }>
        }
      | {
          entryId: string
          gameId: string
          teamId: string
          confidence: number
        }
    >(request)

    // Handle bulk picks submission
    if ('picks' in body) {
      validateRequiredFields(body, ['entryId', 'picks'])

      if (!Array.isArray(body.picks) || body.picks.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'At least one pick is required',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      // Validate each pick
      for (const pick of body.picks) {
        validateRequiredFields(pick, ['gameId', 'teamId', 'confidence'])
      }

      // Get the pool ID for this entry to validate lock status
      const entry = await pickService.getEntry(body.entryId)
      if (!entry) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Entry not found',
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      // Validate that all games are not locked
      for (const pickData of body.picks) {
        try {
          await lockingService.validatePickSubmission(
            body.entryId,
            pickData.gameId,
            entry.poolId
          )
        } catch (error) {
          return new Response(
            JSON.stringify({
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Game is locked for picks',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
      }

      // Create all picks
      const createdPicks = []
      for (const pickData of body.picks) {
        const pick = await pickService.createPick({
          entryId: body.entryId,
          gameId: pickData.gameId,
          teamId: pickData.teamId,
          confidence: pickData.confidence,
        })
        createdPicks.push(pick)
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: createdPicks,
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Handle single pick submission (backward compatibility)
    validateRequiredFields(body, ['entryId', 'gameId', 'teamId', 'confidence'])

    // Get the pool ID for this entry to validate lock status
    const entry = await pickService.getEntry(body.entryId)
    if (!entry) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Entry not found',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate that the game is not locked
    try {
      await lockingService.validatePickSubmission(
        body.entryId,
        body.gameId,
        entry.poolId
      )
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            error instanceof Error ? error.message : 'Game is locked for picks',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const pick = await pickService.createPick({
      entryId: body.entryId,
      gameId: body.gameId,
      teamId: body.teamId,
      confidence: body.confidence,
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: pick,
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
