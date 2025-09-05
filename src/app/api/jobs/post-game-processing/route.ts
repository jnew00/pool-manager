import { NextRequest, NextResponse } from 'next/server'
import { dataSnapshotJob } from '@/lib/jobs/data-snapshot-job'

/**
 * POST /api/jobs/post-game-processing - Manually trigger post-game processing
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Post-Game Processing API] Manual trigger requested')
    
    // Trigger the post-game processing job manually
    await dataSnapshotJob.triggerPostGameProcessing()
    
    return NextResponse.json({
      success: true,
      message: 'Post-game processing completed successfully',
      timestamp: new Date().toISOString(),
    })
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
          description: 'Runs every Tuesday at 6 AM ET for Elo rating updates',
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