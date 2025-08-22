#!/usr/bin/env tsx

/**
 * Test script to verify fuzzy matching logic
 */

import { gameMatcherService } from '../src/features/uploads/services/game-matcher.service'

// Test cases that should NOT match
console.log('🧪 Testing fuzzy matching logic...\n')

console.log('Testing TEN vs DEN (should be FALSE):')
console.log(
  'TEN -> DEN:',
  (gameMatcherService as any).teamMatches('DEN', 'TEN')
)
console.log(
  'DEN -> TEN:',
  (gameMatcherService as any).teamMatches('TEN', 'DEN')
)

console.log('\nTesting valid matches (should be TRUE):')
console.log('LV -> LVR:', (gameMatcherService as any).teamMatches('LVR', 'LV'))
console.log(
  'WSH -> WAS:',
  (gameMatcherService as any).teamMatches('WAS', 'WSH')
)
console.log('TB -> TB:', (gameMatcherService as any).teamMatches('TB', 'TB'))

console.log('\nTesting Tennessee variations:')
console.log(
  'TEN -> Tennessee:',
  (gameMatcherService as any).teamMatches('TEN', 'Tennessee')
)
console.log(
  'TEN -> Titans:',
  (gameMatcherService as any).teamMatches('TEN', 'Titans')
)

console.log('\nTesting Denver variations:')
console.log(
  'DEN -> Denver:',
  (gameMatcherService as any).teamMatches('DEN', 'Denver')
)
console.log(
  'DEN -> Broncos:',
  (gameMatcherService as any).teamMatches('DEN', 'Broncos')
)

console.log('\nTesting potential false positives:')
console.log(
  'TEN -> DEN (3-char):',
  (gameMatcherService as any).teamMatches('TEN', 'DEN')
)
console.log(
  'TEN vs DEN substring:',
  'TEN'.includes('DEN'),
  'DEN'.includes('TEN')
)
console.log(
  'TEN vs DEN startsWith:',
  'TEN'.startsWith('DE'),
  'DEN'.startsWith('TE')
)

// Test Levenshtein distance directly
console.log('\nLevenshtein distance tests:')
console.log(
  'TEN vs DEN distance:',
  (gameMatcherService as any).getLevenshteinDistance('TEN', 'DEN')
)
console.log(
  'KC vs KC distance:',
  (gameMatcherService as any).getLevenshteinDistance('KC', 'KC')
)
console.log(
  'LAR vs LAC distance:',
  (gameMatcherService as any).getLevenshteinDistance('LAR', 'LAC')
)

console.log('\nOther problematic matches:')
console.log(
  'LAR -> LAC:',
  (gameMatcherService as any).teamMatches('LAR', 'LAC')
)
console.log(
  'NYG -> NYJ:',
  (gameMatcherService as any).teamMatches('NYG', 'NYJ')
)
