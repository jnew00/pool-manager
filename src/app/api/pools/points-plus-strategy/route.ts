import { NextRequest, NextResponse } from 'next/server'
import { PointsPlusStrategyEngine } from '@/lib/models/points-plus-strategy'
import type { PointsPlusStrategyConfig } from '@/lib/models/points-plus-strategy'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { poolId, week, season, config } = body

    if (!week || !season) {
      return NextResponse.json(
        { success: false, error: 'Week and season are required' },
        { status: 400 }
      )
    }

    // Create strategy engine with provided config
    const engine = new PointsPlusStrategyEngine(
      config as PointsPlusStrategyConfig
    )

    // Analyze the week
    const strategy = await engine.analyzeWeek(season, week, poolId)

    return NextResponse.json({
      success: true,
      data: strategy,
    })
  } catch (error) {
    console.error('Error generating Points Plus strategy:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate strategy',
      },
      { status: 500 }
    )
  }
}
