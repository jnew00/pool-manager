import { NextRequest, NextResponse } from 'next/server'
import { GradeOverrideService } from '@/server/services/grade-override.service'
import type { PickOutcome } from '@/lib/types/database'

const gradeOverrideService = new GradeOverrideService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gameId, newOutcome, newPoints, reason, overriddenBy } = body

    if (!gameId || !newOutcome || newPoints === undefined || !reason) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: gameId, newOutcome, newPoints, reason',
        },
        { status: 400 }
      )
    }

    const grades = await gradeOverrideService.bulkOverrideGamePicks(
      gameId,
      newOutcome as PickOutcome,
      newPoints,
      reason,
      overriddenBy
    )

    return NextResponse.json(
      {
        grades,
        count: grades.length,
        message: `Successfully overrode ${grades.length} picks for game ${gameId}`,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Bulk grade override error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to bulk override grades' },
      { status: 500 }
    )
  }
}
