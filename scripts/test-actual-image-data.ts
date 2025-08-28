#!/usr/bin/env npx tsx

import { createLLMNormalizerService } from '../src/features/uploads/services/llm-normalizer.service'
import { prisma } from '../src/lib/prisma'

async function testActualImageData() {
  console.log('Testing Actual Image Data Parsing\n')
  console.log('='.repeat(50))
  
  // Exact data from the image - two column format
  const mockOcrText = `
    Cowboys +6.5 Eagles -6.5
    Chiefs +2.5 Chargers +2.5
    Buccaneers +1.5 Falcons +1.5
    Bengals +5.5 Browns +5.5
    Dolphins +0.5 Colts -0.5
    Raiders +3.5 Patriots -3.5
    Cardinals +3.5 Saints +3.5
    Steelers +2.5 Jets +2.5
    Giants +6.5 Commanders -6.5
    Panthers +2.5 Jaguars -2.5
    Titans +6.5 Broncos -6.5
    49ers +1.5 Seahawks +1.5
    Lions +0.5 Packers +0.5
    Texans +2.5 Rams -2.5
    Ravens +1.5 Bills -1.5
    Vikings +0.5 Bears -0.5
  `
  
  console.log('Mock OCR Text (from actual image):')
  console.log(mockOcrText)
  console.log('\n' + '='.repeat(50) + '\n')
  
  try {
    console.log('Testing LLM parsing...')
    const llmService = createLLMNormalizerService()
    const spreadResult = await llmService.normalizeSpreads(mockOcrText)
    
    console.log(`LLM extracted ${spreadResult.spreads.length} spreads:`)
    spreadResult.spreads.forEach((spread, i) => {
      console.log(`  ${i + 1}. Away: "${spread.away_team}" @ Home: "${spread.home_team}" | Spread: ${spread.spread_for_home}`)
    })
    
    console.log('\n' + '='.repeat(50))
    console.log('\nExpected Results (based on image layout):')
    console.log('  1. Away: "DAL" @ Home: "PHI" | Spread: -6.5 (Eagles favored)')
    console.log('  2. Away: "KC" @ Home: "LAC" | Spread: -2.5 (Chargers favored)')
    console.log('  3. Away: "TB" @ Home: "ATL" | Spread: -1.5 (Falcons favored)')
    // ... etc
    
    console.log('\n' + '='.repeat(50))
    
    // Check first few for correctness
    const firstCorrect = spreadResult.spreads[0]?.away_team === 'DAL' && 
                        spreadResult.spreads[0]?.home_team === 'PHI' &&
                        spreadResult.spreads[0]?.spread_for_home === -6.5
    
    if (firstCorrect) {
      console.log('✅ First matchup parsed correctly!')
    } else {
      console.log('❌ First matchup parsing incorrect')
      if (spreadResult.spreads[0]) {
        console.log(`   Got: ${spreadResult.spreads[0].away_team} @ ${spreadResult.spreads[0].home_team} | ${spreadResult.spreads[0].spread_for_home}`)
      }
    }
    
  } catch (error) {
    console.error('❌ ERROR during test:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testActualImageData().catch(console.error)