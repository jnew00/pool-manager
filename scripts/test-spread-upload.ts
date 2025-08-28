#!/usr/bin/env npx tsx

import { createLLMNormalizerService } from '../src/features/uploads/services/llm-normalizer.service'
import { gameMatcherService } from '../src/features/uploads/services/game-matcher.service'
import { prisma } from '../src/lib/prisma'

async function testSpreadUpload() {
  console.log('Testing Spread Upload with LV abbreviation\n')
  console.log('='.repeat(50))
  
  // Simulated OCR text with LV abbreviation
  const mockOcrText = `
    Week 1 Spreads
    
    Raiders -3.5 vs Commanders
    49ers -2.5 at Seahawks
    Chiefs -3.5 vs Chargers
  `
  
  console.log('Mock OCR Text:')
  console.log(mockOcrText)
  console.log('\n' + '='.repeat(50) + '\n')
  
  try {
    // Step 1: Normalize spreads using LLM
    console.log('Step 1: Normalizing spreads with LLM...')
    const llmService = createLLMNormalizerService()
    const spreadResult = await llmService.normalizeSpreads(mockOcrText)
    
    console.log(`LLM extracted ${spreadResult.spreads.length} spreads:`)
    spreadResult.spreads.forEach((spread, i) => {
      console.log(`  ${i + 1}. Away: "${spread.away_team}" @ Home: "${spread.home_team}" | Spread: ${spread.spread_for_home}`)
    })
    
    console.log('\n' + '='.repeat(50) + '\n')
    
    // Step 2: Match spreads to games
    console.log('Step 2: Matching spreads to games...')
    const season = 2025
    const week = 1
    
    const matchResult = await gameMatcherService.matchSpreadsToGames(
      spreadResult.spreads,
      season,
      week
    )
    
    console.log(`\nMatching Results:`)
    console.log(`  ✅ Matched: ${matchResult.matches.length} games`)
    matchResult.matches.forEach((match) => {
      console.log(`     - ${match.awayTeam} @ ${match.homeTeam} (spread: ${match.spread})`)
    })
    
    if (matchResult.unmatched.length > 0) {
      console.log(`  ❌ Unmatched: ${matchResult.unmatched.length} spreads`)
      matchResult.unmatched.forEach((unmatched) => {
        console.log(`     - "${unmatched.away_team}" @ "${unmatched.home_team}" (spread: ${unmatched.spread_for_home})`)
      })
    }
    
    console.log('\n' + '='.repeat(50))
    console.log('\nTest Summary:')
    
    const success = matchResult.unmatched.length === 0
    if (success) {
      console.log('✅ SUCCESS: All spreads matched successfully!')
      console.log('The LV → LVR mapping is working correctly.')
    } else {
      console.log('⚠️  WARNING: Some spreads did not match.')
      console.log('Check the unmatched spreads above for issues.')
    }
    
  } catch (error) {
    console.error('❌ ERROR during test:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testSpreadUpload().catch(console.error)