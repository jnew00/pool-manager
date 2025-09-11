#!/usr/bin/env tsx

/**
 * Test script to verify ATS line arbitrage logic
 */

import { ConfidenceEngine, defaultModelWeights } from '../src/lib/models/confidence-engine'
import type { ModelInput } from '../src/lib/models/types'

async function testATSArbitrage() {
  const engine = new ConfidenceEngine()
  
  console.log('Testing ATS Line Arbitrage Logic\n')
  console.log('=' .repeat(60))
  
  // Test Case 1: Baltimore -10.5 (pool) vs -11.5 (Vegas)
  // Baltimore is the HOME FAVORITE giving fewer points in pool - should pick Baltimore
  console.log('\nTest 1: BAL -10.5 (pool) vs BAL -11.5 (Vegas)')
  console.log('Expected: Pick HOME/BAL (favorite getting better value in pool)')
  
  const test1Input: ModelInput = {
    gameId: 'test-game-1',
    homeTeamId: 'bal-ravens',
    awayTeamId: 'test-opponent',
    kickoffTime: new Date(),
    poolType: 'ATS',
    marketData: {
      spread: -10.5, // Pool spread (Baltimore favored by 10.5)
      moneylineHome: -450,
      moneylineAway: 350,
      total: 44.5
    },
    currentMarketData: {
      spread: -11.5, // Vegas spread (Baltimore favored by 11.5)
      moneylineHome: -500,
      moneylineAway: 400,
      total: 44.5
    },
    weights: defaultModelWeights,
  }
  
  const result1 = await engine.calculateConfidence(test1Input)
  console.log(`Result: Pick ${result1.recommendedPick}`)
  console.log(`Line Value: ${result1.factors.lineValue}`)
  console.log(`Confidence: ${result1.factors.adjustedConfidence.toFixed(1)}%`)
  
  // Test Case 2: Underdog HOME team getting more points in pool
  console.log('\n' + '-'.repeat(60))
  console.log('\nTest 2: TB (HOME) +7.5 (pool) vs TB +4.5 (Vegas)')
  console.log('Expected: Pick HOME/TB (underdog getting more points in pool)')
  
  const test2Input: ModelInput = {
    gameId: 'test-game-2',
    homeTeamId: 'tb-buccaneers', // TB is HOME and underdog
    awayTeamId: 'test-favorite',
    kickoffTime: new Date(),
    poolType: 'ATS',
    marketData: {
      spread: 7.5, // Pool spread (home TB is underdog getting 7.5 points)
      moneylineHome: 250,
      moneylineAway: -300,
      total: 48.5
    },
    currentMarketData: {
      spread: 4.5, // Vegas spread (home TB is underdog getting only 4.5 points)
      moneylineHome: 170,
      moneylineAway: -200,
      total: 48.5
    },
    weights: defaultModelWeights,
  }
  
  const result2 = await engine.calculateConfidence(test2Input)
  console.log(`Result: Pick ${result2.recommendedPick}`)
  console.log(`Line Value: ${result2.factors.lineValue}`)
  console.log(`Confidence: ${result2.factors.adjustedConfidence.toFixed(1)}%`)
  
  // Test Case 3: No significant arbitrage (< 1 point difference)
  console.log('\n' + '-'.repeat(60))
  console.log('\nTest 3: KC -3.0 (pool) vs KC -3.5 (Vegas)')
  console.log('Expected: Use confidence/other factors (0.5 point difference)')
  
  const test3Input: ModelInput = {
    gameId: 'test-game-3',
    homeTeamId: 'kc-chiefs',
    awayTeamId: 'test-opponent',
    kickoffTime: new Date(),
    poolType: 'ATS',
    marketData: {
      spread: -3.0, // Pool spread
      moneylineHome: -150,
      moneylineAway: 130,
      total: 47.0
    },
    currentMarketData: {
      spread: -3.5, // Vegas spread
      moneylineHome: -165,
      moneylineAway: 140,
      total: 47.0
    },
    weights: defaultModelWeights,
  }
  
  const result3 = await engine.calculateConfidence(test3Input)
  console.log(`Result: Pick ${result3.recommendedPick}`)
  console.log(`Line Value: ${result3.factors.lineValue} (below 1.0 threshold)`)
  console.log(`Confidence: ${result3.factors.adjustedConfidence.toFixed(1)}%`)
  console.log('(Pick based on confidence and other factors)')
  
  console.log('\n' + '='.repeat(60))
  console.log('Test Complete!')
  
  // Summary
  console.log('\nSummary:')
  console.log(`✓ Test 1: ${result1.recommendedPick === 'HOME' ? 'PASSED' : 'FAILED'} - Should pick HOME (BAL favorite with better value)`)
  console.log(`✓ Test 2: ${result2.recommendedPick === 'HOME' ? 'PASSED' : 'FAILED'} - Should pick HOME (TB underdog with better value)`)
  console.log(`✓ Test 3: Line value ${Math.abs(result3.factors.lineValue)} < 1.0 - Using confidence-based pick`)
}

// Run the test
testATSArbitrage().catch(console.error)