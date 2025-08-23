import { NextRequest, NextResponse } from 'next/server'
import { realInjuryAnalysis } from '@/lib/models/real-injury-analysis'

/**
 * Debug endpoint to test injury data provider fallback system
 * GET /api/debug/injury-providers?teamId=team_123
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const teamId = searchParams.get('teamId') || 'team_5' // Default to a team

  try {
    console.log(`\n=== INJURY PROVIDER DEBUG TEST ===`)
    console.log(`Testing injury data providers for team: ${teamId}`)

    // Test data availability
    const availability = await realInjuryAnalysis.checkInjuryDataAvailability()
    console.log('Data availability check:', availability)

    // Test actual injury data fetching
    const injuryImpact = await realInjuryAnalysis.getTeamInjuryImpact(teamId)
    console.log('Injury impact result:', injuryImpact)

    // Test narrative generation
    const narrative = await realInjuryAnalysis.getInjuryNarrative(teamId)
    console.log('Injury narrative:', narrative)

    return NextResponse.json({
      success: true,
      teamId,
      results: {
        availability,
        injuryImpact,
        narrative,
      },
      debug: {
        timestamp: new Date().toISOString(),
        message: 'Check console logs for detailed provider fallback information',
      },
    })
  } catch (error) {
    console.error('Error in injury provider debug test:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId,
      },
      { status: 500 }
    )
  }
}