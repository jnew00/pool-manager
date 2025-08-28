#!/usr/bin/env npx tsx

import { prisma } from '../src/lib/prisma'

async function clearPoolsAndSpreads() {
  console.log('Clearing pools and spreads data...')

  try {
    // Delete in correct order to respect foreign key constraints
    
    // 1. Clear survivor entries and related data
    await prisma.survivorPick.deleteMany()
    console.log('✓ Cleared survivor picks')
    
    await prisma.survivorEntry.deleteMany()
    console.log('✓ Cleared survivor entries')

    // 2. Clear picks
    await prisma.pick.deleteMany()
    console.log('✓ Cleared picks')

    // 3. Clear pool completions
    await prisma.poolCompletion.deleteMany()
    console.log('✓ Cleared pool completions')

    // 4. Clear pools
    await prisma.pool.deleteMany()
    console.log('✓ Cleared pools')

    // 5. Clear spreads/lines
    await prisma.line.deleteMany()
    console.log('✓ Cleared lines/spreads')

    console.log('✅ Successfully cleared all pools and spreads data!')
    
  } catch (error) {
    console.error('❌ Error clearing data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the clear operation
clearPoolsAndSpreads()
  .then(() => {
    console.log('Clear operation completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Clear operation failed:', error)
    process.exit(1)
  })

export { clearPoolsAndSpreads }