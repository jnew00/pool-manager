import { NextRequest, NextResponse } from 'next/server'
import { dataSnapshotJob } from '@/lib/jobs/data-snapshot-job'

/**
 * POST /api/jobs/post-game-processing - Manually trigger post-game processing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { action, week } = body

    console.log('[Post-Game Processing API] Manual trigger requested:', { action, week })

    if (action === 'survivor-only') {
      // Just run survivor grading (includes ESPN fetch)
      await dataSnapshotJob.triggerSurvivorGrading(week)
      return NextResponse.json({
        success: true,
        message: `Survivor grading completed${week ? ` for week ${week}` : ''} (includes ESPN results fetch)`,
        timestamp: new Date().toISOString(),
      })
    } else if (action === 'espn-only') {
      // Just fetch ESPN results
      if (!week) {
        return NextResponse.json({
          success: false,
          error: 'Week parameter required for ESPN-only fetch',
        }, { status: 400 })
      }
      await dataSnapshotJob.triggerESPNResultsFetch(week)
      return NextResponse.json({
        success: true,
        message: `ESPN results fetched for week ${week}`,
        timestamp: new Date().toISOString(),
      })
    } else {
      // Run full post-game processing (includes survivor grading)
      await dataSnapshotJob.triggerPostGameProcessing()
      return NextResponse.json({
        success: true,
        message: 'Post-game processing (including survivor grading) completed successfully',
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('[Post-Game Processing API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run post-game processing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/jobs/post-game-processing - Get job status
 */
export async function GET(request: NextRequest) {
  try {
    const status = dataSnapshotJob.getStatus()
    
    return NextResponse.json({
      success: true,
      data: {
        jobStatus: status,
        schedules: {
          postGameSchedule: '0 6 * * 2', // Tuesday 06:00 ET
          description: 'Runs every Tuesday at 6 AM ET for Elo rating updates and survivor pool grading',
        },
        processing: {
          step1: 'Fetch game results from ESPN API',
          step2: 'Update Elo ratings for completed games',
          step3: 'Grade survivor pools (eliminate losing entries)',
        },
        manualTriggers: {
          full: 'POST /api/jobs/post-game-processing (ESPN + Elo + Survivor)',
          survivorOnly: 'POST /api/jobs/post-game-processing {"action":"survivor-only"}',
          specificWeek: 'POST /api/jobs/post-game-processing {"action":"survivor-only","week":1}',
          espnOnly: 'POST /api/jobs/post-game-processing {"action":"espn-only","week":1}',
        },
        enabled: process.env.NODE_ENV === 'production',
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[Post-Game Processing API] Error getting status:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get job status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}