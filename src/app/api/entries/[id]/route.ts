import { NextRequest } from 'next/server'
import { EntryService } from '@/server/services/entry.service'
import { NotFoundError } from '@/lib/types/database'
import {
  createSuccessResponse,
  handleServiceError,
  validateMethod,
} from '@/lib/api/response'

const entryService = new EntryService()

/**
 * GET /api/entries/[id] - Get entry by ID with pool details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const methodError = validateMethod(request, ['GET'])
  if (methodError) return methodError

  try {
    const { id } = await params
    const entry = await entryService.getEntryById(id)

    if (!entry) {
      throw new NotFoundError('Entry not found')
    }

    return createSuccessResponse(entry)
  } catch (error) {
    return handleServiceError(error)
  }
}

/**
 * DELETE /api/entries/[id] - Delete entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const methodError = validateMethod(request, ['DELETE'])
  if (methodError) return methodError

  try {
    const { id } = await params
    const success = await entryService.deleteEntry(id)

    if (!success) {
      throw new NotFoundError('Entry not found')
    }

    return createSuccessResponse({ deleted: true })
  } catch (error) {
    return handleServiceError(error)
  }
}
