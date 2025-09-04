#!/usr/bin/env npx tsx

import { Number1PoolScraperService } from '../src/features/uploads/services/number1pool-scraper.service';

async function testActualNumber1Pool() {
  try {
    console.log('🧪 Testing actual Number1Pool scraper...\n');
    
    // Test with mock HTML that matches what we might expect
    const scraper = new Number1PoolScraperService();
    
    // Create a mock parseHtml method to simulate what the actual scraper might receive
    const mockHtml = `
      <table>
        <tr>
          <td>1</td>
          <td>Thu 8:20 PM</td>
          <td>PHILADELPHIA EAGLES (0-0)</td>
          <td>Dallas Cowboys (0-0)</td>
          <td>6.5</td>
        </tr>
        <tr>
          <td>1</td>
          <td>Sun 1:00 PM</td>
          <td>CHICAGO BEARS (0-0)</td>
          <td>Minnesota Vikings (0-0)</td>
          <td>1.5</td>
        </tr>
        <tr>
          <td>1</td>
          <td>Sun 1:00 PM</td>
          <td>Minnesota Vikings (0-0)</td>
          <td>CHICAGO BEARS (0-0)</td>
          <td>1.5</td>
        </tr>
      </table>
    `;
    
    // Test the parsing directly
    console.log('🔍 Testing HTML parsing with different team arrangements...\n');
    
    const games = (scraper as any).parseHtml(mockHtml);
    
    console.log(`📊 Parsed ${games.length} games:`);
    games.forEach((game: any, i: number) => {
      console.log(`   ${i + 1}. Favorite: "${game.favorite}" vs Underdog: "${game.underdog}" (${game.spread})`);
    });
    
    console.log('\n🔄 Converting to upload format...');
    const mockScrapedData = {
      games,
      source: 'number1pool' as const,
      scrapedAt: new Date()
    };
    
    const normalizedSpreads = scraper.convertToUploadFormat(mockScrapedData);
    
    console.log(`\n📋 Normalized spreads: ${normalizedSpreads.length} entries`);
    normalizedSpreads.forEach((spread: any, i: number) => {
      console.log(`   ${i + 1}. ${spread.away_team} @ ${spread.home_team} (${spread.spread_for_home})`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testActualNumber1Pool();