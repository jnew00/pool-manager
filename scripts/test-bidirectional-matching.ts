#!/usr/bin/env npx tsx

import { GameMatcherService } from '../src/features/uploads/services/game-matcher.service';

async function testBidirectionalMatching() {
  try {
    console.log('🧪 Testing bidirectional matching logic...\n');
    
    const gameMatcher = new GameMatcherService();
    
    // Create test data that specifically tests the bidirectional matching
    // Database has: MIN @ CHI (Minnesota away, Chicago home)
    // Number1Pool scrapes: CHICAGO BEARS @ Minnesota Vikings (Chicago away, Minnesota home)
    const problematicSpreads = [
      {
        away_team: 'CHICAGO BEARS',
        home_team: 'Minnesota Vikings', 
        spread_for_home: 1.5,
        source: 'number1pool-scraper',
        issues: []
      }
    ];
    
    console.log('📊 Testing problematic spread that requires bidirectional matching:');
    console.log(`   CHICAGO BEARS @ Minnesota Vikings (should match MIN @ CHI in database)`);
    
    console.log('\n🎯 Attempting to match with database games...');
    const matchingResult = await gameMatcher.matchSpreadsToGames(problematicSpreads, 2025, 1);
    
    console.log(`\n✅ Matching Results:`);
    console.log(`   Matches: ${matchingResult.matches.length}`);
    console.log(`   Unmatched: ${matchingResult.unmatched.length}`);
    
    if (matchingResult.matches.length > 0) {
      console.log('\n📋 Matched games:');
      matchingResult.matches.forEach((match, i) => {
        console.log(`   ${i + 1}. ${match.awayTeam} @ ${match.homeTeam} (${match.spread})`);
      });
    }
    
    if (matchingResult.unmatched.length > 0) {
      console.log('\n❌ Unmatched spreads:');
      matchingResult.unmatched.forEach((unmatched, i) => {
        console.log(`   ${i + 1}. ${unmatched.away_team} @ ${unmatched.home_team} (${unmatched.spread_for_home})`);
      });
    }
    
    if (matchingResult.matches.length === 1) {
      console.log('\n🎉 Success! Bidirectional matching is working!');
    } else {
      console.log('\n❌ Failed! Bidirectional matching is not working properly.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBidirectionalMatching();