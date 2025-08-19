import { NextRequest, NextResponse } from 'next/server'
import { GradeOverrideService } from '@/server/services/grade-override.service'
import type { PickOutcome } from '@/lib/types/database'

const gradeOverrideService = new GradeOverrideService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pickId, newOutcome, newPoints, reason, overriddenBy } = body

    if (!pickId || !newOutcome || newPoints === undefined || !reason) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: pickId, newOutcome, newPoints, reason',
        },
        { status: 400 }
      )
    }

    const grade = await gradeOverrideService.overrideGrade(
      pickId,
      newOutcome as PickOutcome,
      newPoints,
      reason,
      overriddenBy
    )

    return NextResponse.json({ grade }, { status: 200 })
  } catch (error: any) {
    console.error('Grade override error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to override grade' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pickId = searchParams.get('pickId')

    if (!pickId) {
      return NextResponse.json(
        { error: 'pickId parameter is required' },
        { status: 400 }
      )
    }

    const history = await gradeOverrideService.getOverrideHistory(pickId)

    return NextResponse.json({ history }, { status: 200 })
  } catch (error: any) {
    console.error('Get override history error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get override history' },
      { status: 500 }
    )
  }
}
