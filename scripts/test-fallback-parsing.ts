#!/usr/bin/env npx tsx

import { createLLMNormalizerService } from '../src/features/uploads/services/llm-normalizer.service'
import { prisma } from '../src/lib/prisma'

async function testFallbackParsing() {
  console.log('Testing Fallback Parsing (no vs/@/at indicators)\n')
  console.log('='.repeat(50))
  
  // Mock OCR text without explicit indicators
  const mockOcrText = `
    Week 1 Spreads
    
    Cowboys -3.5 Eagles
    49ers -2.5 Seahawks  
    Chiefs -7 Chargers
  `
  
  console.log('Mock OCR Text (no vs/@/at indicators):')
  console.log(mockOcrText)
  console.log('\n' + '='.repeat(50) + '\n')
  
  try {
    console.log('Testing LLM fallback parsing...')
    const llmService = createLLMNormalizerService()
    const spreadResult = await llmService.normalizeSpreads(mockOcrText)
    
    console.log(`LLM extracted ${spreadResult.spreads.length} spreads:`)
    spreadResult.spreads.forEach((spread, i) => {
      console.log(`  ${i + 1}. Away: "${spread.away_team}" @ Home: "${spread.home_team}" | Spread: ${spread.spread_for_home}`)
    })
    
    console.log('\n' + '='.repeat(50))
    console.log('\nExpected Results (left=away, right=home):')
    console.log('  1. Away: "DAL" @ Home: "PHI" | Spread: -3.5 (Cowboys favored on road)')
    console.log('  2. Away: "SF" @ Home: "SEA" | Spread: -2.5 (49ers favored on road)')  
    console.log('  3. Away: "KC" @ Home: "LAC" | Spread: -7 (Chiefs favored on road)')
    
    console.log('\n' + '='.repeat(50))
    
    const success = spreadResult.spreads.length === 3 &&
                   spreadResult.spreads[0].away_team === 'DAL' &&
                   spreadResult.spreads[0].home_team === 'PHI' &&
                   spreadResult.spreads[0].spread_for_home === -3.5
    
    if (success) {
      console.log('✅ SUCCESS: Fallback parsing working correctly!')
      console.log('Left team correctly identified as AWAY, right team as HOME.')
    } else {
      console.log('⚠️  WARNING: Fallback parsing may have issues.')
      console.log('Check the results above.')
    }
    
  } catch (error) {
    console.error('❌ ERROR during test:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testFallbackParsing().catch(console.error)