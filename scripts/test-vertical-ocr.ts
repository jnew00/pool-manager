#!/usr/bin/env npx tsx

import { createLLMNormalizerService } from '../src/features/uploads/services/llm-normalizer.service'
import { prisma } from '../src/lib/prisma'
import fs from 'fs'

async function testVerticalOCR() {
  console.log('Testing Vertical Column OCR Format\n')
  console.log('='.repeat(50))
  
  // Actual OCR output from the image
  const ocrText = fs.readFileSync('/private/tmp/last-ocr-output.txt', 'utf-8')
  
  console.log('Actual OCR Text (first 500 chars):')
  console.log(ocrText.substring(0, 500) + '...')
  console.log('\n' + '='.repeat(50) + '\n')
  
  try {
    console.log('Testing LLM parsing of vertical format...')
    const llmService = createLLMNormalizerService()
    const spreadResult = await llmService.normalizeSpreads(ocrText)
    
    console.log(`\nLLM extracted ${spreadResult.spreads.length} spreads:`)
    if (spreadResult.spreads.length > 0) {
      spreadResult.spreads.forEach((spread, i) => {
        console.log(`  ${i + 1}. Away: "${spread.away_team}" @ Home: "${spread.home_team}" | Spread: ${spread.spread_for_home}`)
      })
    } else {
      console.log('  No spreads extracted!')
      if (spreadResult.error) {
        console.log('  Error:', spreadResult.error)
      }
    }
    
    console.log('\n' + '='.repeat(50))
    console.log('\nExpected (based on image):')
    console.log('  1. Away: "DAL" @ Home: "PHI" | Spread: -6.5')
    console.log('  2. Away: "KC" @ Home: "LAC" | Spread: -2.5 or +2.5')
    console.log('  3. Away: "TB" @ Home: "ATL" | Spread: -1.5 or +1.5')
    console.log('  ... (16 total games)')
    
  } catch (error) {
    console.error('❌ ERROR during test:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testVerticalOCR().catch(console.error)