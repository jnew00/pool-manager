#!/usr/bin/env tsx

/**
 * Test script to verify the scheduler integration with survivor grading
 */

import { dataSnapshotJob } from '@/lib/jobs/data-snapshot-job'

async function testSchedulerIntegration() {
  console.log('🧪 Testing Scheduler Integration with Survivor Grading')
  console.log('=' .repeat(60))

  try {
    // Test 1: Check if we can trigger post-game processing manually
    console.log('\n📋 Test 1: Manual Post-Game Processing Trigger')
    console.log('Triggering full post-game processing (includes survivor grading)...')

    await dataSnapshotJob.triggerPostGameProcessing()
    console.log('✅ Post-game processing completed successfully')

    // Test 2: Check if we can trigger just survivor grading
    console.log('\n📋 Test 2: Manual Survivor Grading Only')
    console.log('Triggering survivor grading only...')

    await dataSnapshotJob.triggerSurvivorGrading()
    console.log('✅ Survivor grading completed successfully')

    // Test 3: Check scheduler status
    console.log('\n📋 Test 3: Scheduler Status Check')
    const status = dataSnapshotJob.getStatus()
    console.log('Scheduled jobs status:', status)

    console.log('\n🎉 All integration tests passed!')
    console.log('\n📅 Production Schedule:')
    console.log('- Tuesday 6:00 AM ET: Full post-game processing')
    console.log('  - Updates Elo ratings')
    console.log('  - Grades survivor pools automatically')
    console.log('  - Eliminates entries based on results')

    console.log('\n🔧 Manual Controls Available:')
    console.log('- Full processing: POST /api/jobs/post-game-processing')
    console.log('- Survivor only: POST /api/jobs/post-game-processing {"action":"survivor-only"}')
    console.log('- Specific week: POST /api/jobs/post-game-processing {"action":"survivor-only","week":1}')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testSchedulerIntegration()