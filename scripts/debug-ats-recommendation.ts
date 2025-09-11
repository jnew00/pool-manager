#!/usr/bin/env tsx

/**
 * Debug script for ATS recommendations - helps understand why a pick was made
 */

import { ConfidenceEngine, defaultModelWeights } from '../src/lib/models/confidence-engine'
import type { ModelInput } from '../src/lib/models/types'

async function debugATSRecommendation(
  homeTeam: string,
  awayTeam: string,
  poolSpread: number,
  vegasSpread: number,
  lineValueWeight: number = 0.215
) {
  console.log('ATS Recommendation Debug Tool\n')
  console.log('=' .repeat(60))
  
  console.log(`\nGame: ${awayTeam} @ ${homeTeam}`)
  console.log(`Pool Spread: ${homeTeam} ${poolSpread > 0 ? '+' : ''}${poolSpread}`)
  console.log(`Vegas Spread: ${homeTeam} ${vegasSpread > 0 ? '+' : ''}${vegasSpread}`)
  console.log(`Line Value Weight: ${(lineValueWeight * 100).toFixed(1)}%`)
  
  // Calculate line value
  const lineValue = vegasSpread - poolSpread
  console.log(`Line Value: ${lineValue} (${lineValue < 0 ? 'favor HOME' : 'favor AWAY'})`)
  
  // Determine favorite/underdog
  const homeIsFavorite = poolSpread < 0
  const favoriteTeam = homeIsFavorite ? homeTeam : awayTeam
  const underdogTeam = homeIsFavorite ? awayTeam : homeTeam
  console.log(`Favorite: ${favoriteTeam} (${homeIsFavorite ? 'HOME' : 'AWAY'})`)
  console.log(`Underdog: ${underdogTeam} (${homeIsFavorite ? 'AWAY' : 'HOME'})`)
  
  // Calculate arbitrage threshold
  const arbitrageThreshold = Math.max(0.5, 1.5 - (lineValueWeight * 2))
  console.log(`Arbitrage Threshold: ${arbitrageThreshold} (based on ${lineValueWeight} weight)`)
  
  const engine = new ConfidenceEngine()
  
  const testInput: ModelInput = {
    gameId: 'debug-game',
    homeTeamId: homeTeam.toLowerCase().replace(' ', '-'),
    awayTeamId: awayTeam.toLowerCase().replace(' ', '-'),
    kickoffTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    poolType: 'ATS',
    marketData: {
      spread: poolSpread,
      moneylineHome: poolSpread < 0 ? -150 : 120, // Estimate ML from spread
      moneylineAway: poolSpread < 0 ? 130 : -140,
      total: 44.5
    },
    currentMarketData: {
      spread: vegasSpread,
      moneylineHome: vegasSpread < 0 ? -160 : 110,
      moneylineAway: vegasSpread < 0 ? 140 : -130,
      total: 44.5
    },
    weights: {
      ...defaultModelWeights,
      lineValueWeight: lineValueWeight
    },
  }
  
  console.log('\n' + '-'.repeat(60))
  console.log('Running Confidence Engine...\n')
  
  const result = await engine.calculateConfidence(testInput)
  
  console.log('\n' + '-'.repeat(60))
  console.log('RESULTS:')
  console.log(`Recommended Pick: ${result.recommendedPick} (${result.recommendedPick === 'HOME' ? homeTeam : awayTeam})`)
  console.log(`Confidence: ${result.factors.adjustedConfidence.toFixed(1)}%`)
  console.log(`Line Value Factor: ${result.factors.lineValue}`)
  
  // Analysis
  console.log('\n' + '-'.repeat(60))
  console.log('ANALYSIS:')
  
  if (Math.abs(lineValue) >= arbitrageThreshold) {
    console.log(`✅ ARBITRAGE TRIGGERED (|${lineValue}| >= ${arbitrageThreshold})`)
    
    if (homeIsFavorite) {
      const shouldPickHome = lineValue < 0
      console.log(`   Home is favorite, lineValue ${lineValue} ${lineValue < 0 ? '< 0' : '>= 0'}`)
      console.log(`   ${shouldPickHome ? '✅' : '❌'} Should pick HOME (${homeTeam})`)
      console.log(`   ${!shouldPickHome ? '✅' : '❌'} Should pick AWAY (${awayTeam})`)
    } else {
      const shouldPickHome = lineValue < 0
      console.log(`   Away is favorite, lineValue ${lineValue} ${lineValue < 0 ? '< 0' : '>= 0'}`)
      console.log(`   ${shouldPickHome ? '✅' : '❌'} Should pick HOME (${homeTeam}) - underdog`)
      console.log(`   ${!shouldPickHome ? '✅' : '❌'} Should pick AWAY (${awayTeam}) - favorite`)
    }
  } else {
    console.log(`❌ NO ARBITRAGE (|${lineValue}| < ${arbitrageThreshold})`)
    console.log(`   Using confidence-based pick instead`)
    console.log(`   Confidence: ${result.factors.adjustedConfidence.toFixed(1)}%`)
  }
  
  console.log('\n' + '='.repeat(60))
  return result
}

// Example usage - testing the actual BAL vs CLE scenario
async function main() {
  // Test Case: CLE vs BAL with actual spreads
  await debugATSRecommendation(
    'BAL',      // Home team
    'CLE',      // Away team  
    -10.5,      // Pool spread (BAL favored by 10.5 - YOUR UPLOADED LINE)
    -11.5,      // Vegas spread (BAL favored by 11.5 - ESPN LINE)
    0.95        // Line value weight (95% - USER SETTING)
  )
}

// Run automatically to test
main().catch(console.error)

console.log('\nTo test your specific CLE vs BAL scenario:')
console.log('1. Update the values in the main() function above')
console.log('2. Uncomment the main().catch(console.error) line')
console.log('3. Run: npx tsx scripts/debug-ats-recommendation.ts')
console.log('\nOr call debugATSRecommendation() directly with your values')

export { debugATSRecommendation }