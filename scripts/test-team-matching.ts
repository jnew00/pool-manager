#!/usr/bin/env npx tsx

import { gameMatcherService } from '../src/features/uploads/services/game-matcher.service'

// Test the private teamMatches method via reflection
const testTeamMatching = () => {
  console.log('Testing Team Matching Logic\n')
  console.log('='.repeat(50))
  
  // Access the private method using bracket notation
  const matcher = gameMatcherService as any
  
  const testCases = [
    // Number1Pool specific test cases based on the failing matches
    { db: 'TB', upload: 'Tampa Bay Buccaneers', expected: true, description: 'TB should match Tampa Bay Buccaneers' },
    { db: 'ATL', upload: 'ATLANTA FALCONS', expected: true, description: 'ATL should match ATLANTA FALCONS' },
    { db: 'BAL', upload: 'Baltimore Ravens', expected: true, description: 'BAL should match Baltimore Ravens' },
    { db: 'BUF', upload: 'BUFFALO BILLS', expected: true, description: 'BUF should match BUFFALO BILLS' },
    { db: 'KC', upload: 'Kansas City Chiefs', expected: true, description: 'KC should match Kansas City Chiefs' },
    { db: 'LAC', upload: 'LOS ANGELES CHARGERS', expected: true, description: 'LAC should match LOS ANGELES CHARGERS' },
    { db: 'SF', upload: 'San Francisco 49ers', expected: true, description: 'SF should match San Francisco 49ers' },
    { db: 'SEA', upload: 'SEATTLE SEAHAWKS', expected: true, description: 'SEA should match SEATTLE SEAHAWKS' },
    { db: 'NYJ', upload: 'NEW YORK JETS', expected: true, description: 'NYJ should match NEW YORK JETS' },
    { db: 'WSH', upload: 'WASHINGTON COMMANDERS', expected: true, description: 'WSH should match WASHINGTON COMMANDERS' },
    
    // Original test cases
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