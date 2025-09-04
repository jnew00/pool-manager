#!/usr/bin/env npx tsx

import { Number1PoolScraperService } from '../src/features/uploads/services/number1pool-scraper.service';
import { GameMatcherService } from '../src/features/uploads/services/game-matcher.service';

async function testNumber1PoolMatching() {
  try {
    console.log('🧪 Testing Number1Pool scraper matching...\n');
    
    // Test with a sample URL (we can mock this for testing)
    const mockUrl = 'https://number1pool.com/picks_weekly.php?user=test&verify=test';
    
    const scraper = new Number1PoolScraperService();
    const gameMatcher = new GameMatcherService();
    
    // For now, let's create some sample data that matches what we expect
    const sampleScrapedData = {
      games: [
        { week: 1, day: 'Thursday', time: '8:20 PM', favorite: 'PHILADELPHIA EAGLES', underdog: 'Dallas Cowboys', spread: 6.5 },
        { week: 1, day: 'Sunday', time: '1:00 PM', favorite: 'ATLANTA FALCONS', underdog: 'Tampa Bay Buccaneers', spread: 3.5 },
        { week: 1, day: 'Sunday', time: '1:00 PM', favorite: 'BUFFALO BILLS', underdog: 'Baltimore Ravens', spread: 2.5 },
        { week: 1, day: 'Sunday', time: '1:00 PM', favorite: 'CHICAGO BEARS', underdog: 'Minnesota Vikings', spread: 1.5 },
        { week: 1, day: 'Sunday', time: '1:00 PM', favorite: 'CLEVELAND BROWNS', underdog: 'Cincinnati Bengals', spread: 4.5 },
        { week: 1, day: 'Sunday', time: '1:00 PM', favorite: 'DENVER BRONCOS', underdog: 'Tennessee Titans', spread: 5.5 },
        { week: 1, day: 'Sunday', time: '1:00 PM', favorite: 'GREEN BAY PACKERS', underdog: 'Detroit Lions', spread: 3.0 },
        { week: 1, day: 'Sunday', time: '1:00 PM', favorite: 'INDIANAPOLIS COLTS', underdog: 'Miami Dolphins', spread: 2.0 },
        { week: 1, day: 'Sunday', time: '1:00 PM', favorite: 'JACKSONVILLE JAGUARS', underdog: 'Carolina Panthers', spread: 7.5 },
        { week: 1, day: 'Sunday', time: '4:05 PM', favorite: 'LOS ANGELES CHARGERS', underdog: 'Kansas City Chiefs', spread: 1.0 },
        { week: 1, day: 'Sunday', time: '4:25 PM', favorite: 'LOS ANGELES RAMS', underdog: 'Houston Texans', spread: 4.0 },
        { week: 1, day: 'Sunday', time: '1:00 PM', favorite: 'NEW ENGLAND PATRIOTS', underdog: 'Las Vegas Raiders', spread: 6.0 },
        { week: 1, day: 'Sunday', time: '1:00 PM', favorite: 'NEW ORLEANS SAINTS', underdog: 'Arizona Cardinals', spread: 5.0 },
        { week: 1, day: 'Monday', time: '8:15 PM', favorite: 'NEW YORK JETS', underdog: 'Pittsburgh Steelers', spread: 3.5 },
        { week: 1, day: 'Sunday', time: '8:20 PM', favorite: 'SEATTLE SEAHAWKS', underdog: 'San Francisco 49ers', spread: 2.5 },
        { week: 1, day: 'Sunday', time: '1:00 PM', favorite: 'WASHINGTON COMMANDERS', underdog: 'New York Giants', spread: 4.5 }
      ],
      source: 'number1pool' as const,
      scrapedAt: new Date()
    };
    
    console.log(`📊 Sample scraped data: ${sampleScrapedData.games.length} games`);
    sampleScrapedData.games.forEach((game, i) => {
      console.log(`   ${i + 1}. ${game.favorite} vs ${game.underdog} (${game.spread})`);
    });
    
    console.log('\n🔄 Converting to upload format...');
    const normalizedSpreads = scraper.convertToUploadFormat(sampleScrapedData);
    
    console.log(`\n📋 Normalized spreads: ${normalizedSpreads.length} entries`);
    normalizedSpreads.forEach((spread, i) => {
      console.log(`   ${i + 1}. ${spread.away_team} @ ${spread.home_team} (${spread.spread_for_home})`);
    });
    
    console.log('\n🎯 Attempting to match with database games...');
    const matchingResult = await gameMatcher.matchSpreadsToGames(normalizedSpreads, 2025, 1);
    
    console.log(`\n✅ Matching Results:`);
    console.log(`   Matches: ${matchingResult.matches.length}`);
    console.log(`   Unmatched: ${matchingResult.unmatched.length}`);
    
    console.log('\n📋 Matched games:');
    matchingResult.matches.forEach((match, i) => {
      console.log(`   ${i + 1}. ${match.awayTeam} @ ${match.homeTeam} (${match.spread})`);
    });
    
    if (matchingResult.unmatched.length > 0) {
      console.log('\n❌ Unmatched spreads:');
      matchingResult.unmatched.forEach((unmatched, i) => {
        console.log(`   ${i + 1}. ${unmatched.away_team} @ ${unmatched.home_team} (${unmatched.spread_for_home})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testNumber1PoolMatching();