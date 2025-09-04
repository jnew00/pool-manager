#!/usr/bin/env npx tsx

import { GameMatcherService } from '../src/features/uploads/services/game-matcher.service';
import { prisma } from '../src/lib/prisma';

async function testUpsertLogic() {
  try {
    console.log('🧪 Testing upsert logic...\n');
    
    const gameMatcher = new GameMatcherService();
    
    // Get the pool ID that has Number1Pool lines
    const poolId = 'cmevvqanp0000p1l613l2x77b';
    
    // Count lines before
    const linesBefore = await prisma.line.count({
      where: {
        poolId: poolId,
        source: 'Number1Pool Scraper'
      }
    });
    
    console.log(`📊 Lines before test: ${linesBefore}`);
    
    // Create a test match that should already exist in the database
    const testMatches = [
      {
        gameId: 'cmevvqia20004p1l6elwegzvy', // This should be one of the existing games
        homeTeam: 'PHI',
        awayTeam: 'DAL',
        spread: 7.0, // Different spread to test update
        matched: true,
        issues: []
      }
    ];
    
    console.log('🔄 Attempting to create/update line with new spread...');
    
    const result = await gameMatcher.createLinesForMatches(
      testMatches,
      poolId,
      'Number1Pool Scraper'
    );
    
    console.log(`✅ Result: ${result.created} lines processed, ${result.errors.length} errors`);
    
    if (result.errors.length > 0) {
      console.log('❌ Errors:', result.errors);
    }
    
    // Count lines after
    const linesAfter = await prisma.line.count({
      where: {
        poolId: poolId,
        source: 'Number1Pool Scraper'
      }
    });
    
    console.log(`📊 Lines after test: ${linesAfter}`);
    
    if (linesBefore === linesAfter) {
      console.log('🎉 Success! Line count unchanged - upsert logic worked (updated existing line)');
    } else {
      console.log('⚠️  Line count changed - this might indicate an issue with upsert logic');
    }
    
    // Check the specific line to see if spread was updated
    const updatedLine = await prisma.line.findFirst({
      where: {
        gameId: testMatches[0].gameId,
        poolId: poolId,
        source: 'Number1Pool Scraper'
      },
      include: {
        game: {
          include: {
            homeTeam: { select: { nflAbbr: true } },
            awayTeam: { select: { nflAbbr: true } }
          }
        }
      }
    });
    
    if (updatedLine) {
      console.log(`\n📋 Updated line details:`);
      console.log(`   Game: ${updatedLine.game.awayTeam.nflAbbr} @ ${updatedLine.game.homeTeam.nflAbbr}`);
      console.log(`   Spread: ${updatedLine.spread}`);
      console.log(`   Updated at: ${updatedLine.capturedAt}`);
      
      if (Number(updatedLine.spread) === testMatches[0].spread) {
        console.log('✅ Spread was successfully updated!');
      } else {
        console.log('❌ Spread was not updated correctly');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUpsertLogic();