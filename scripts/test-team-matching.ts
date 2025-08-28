#!/usr/bin/env npx tsx

import { gameMatcherService } from '../src/features/uploads/services/game-matcher.service'

// Test the private teamMatches method via reflection
const testTeamMatching = () => {
  console.log('Testing Team Matching Logic\n')
  console.log('='.repeat(50))
  
  // Access the private method using bracket notation
  const matcher = gameMatcherService as any
  
  const testCases = [
    { db: 'LVR', upload: 'LV', expected: true, description: 'LVR database should match LV upload' },
    { db: 'LVR', upload: 'LVR', expected: true, description: 'LVR should match LVR exactly' },
    { db: 'LVR', upload: 'Las Vegas', expected: true, description: 'LVR should match Las Vegas' },
    { db: 'LVR', upload: 'Raiders', expected: true, description: 'LVR should match Raiders' },
    { db: 'LVR', upload: 'Vegas', expected: true, description: 'LVR should match Vegas' },
    { db: 'LVR', upload: 'OAK', expected: true, description: 'LVR should match OAK (old abbreviation)' },
    { db: 'WAS', upload: 'WSH', expected: true, description: 'WAS database should match WSH upload' },
    { db: 'WAS', upload: 'Washington', expected: true, description: 'WAS should match Washington' },
    { db: 'TB', upload: 'TPA', expected: true, description: 'TB should match TPA' },
    { db: 'TB', upload: 'Tampa', expected: true, description: 'TB should match Tampa' },
    { db: 'SF', upload: 'SFO', expected: true, description: 'SF should match SFO' },
    { db: 'GB', upload: 'GNB', expected: true, description: 'GB should match GNB' },
    { db: 'LAC', upload: 'SD', expected: true, description: 'LAC should match SD (old city)' },
    // Negative test cases
    { db: 'LVR', upload: 'KC', expected: false, description: 'LVR should NOT match KC' },
    { db: 'WAS', upload: 'NYG', expected: false, description: 'WAS should NOT match NYG' },
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of testCases) {
    try {
      const result = matcher.teamMatches(test.db, test.upload)
      const status = result === test.expected ? '✅ PASS' : '❌ FAIL'
      
      if (result === test.expected) {
        passed++
      } else {
        failed++
      }
      
      console.log(`${status}: ${test.description}`)
      console.log(`  DB: "${test.db}" vs Upload: "${test.upload}" => ${result} (expected: ${test.expected})`)
      
      if (result !== test.expected) {
        console.log(`  ⚠️  MISMATCH DETECTED`)
      }
      console.log()
    } catch (error) {
      console.error(`❌ ERROR testing ${test.description}:`, error)
      failed++
    }
  }
  
  console.log('='.repeat(50))
  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length} total tests`)
  
  if (failed > 0) {
    process.exit(1)
  }
}

// Run the tests
testTeamMatching()