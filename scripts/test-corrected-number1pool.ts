import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as path from 'path';
import { Number1PoolScraperService } from '../src/features/uploads/services/number1pool-scraper.service';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function testCorrectedNumber1Pool() {
  const service = new Number1PoolScraperService();
  const url = 'https://number1pool.com/picks_weekly.php?user=GatorBait&verify=5e1be4aa0b90bbbf90c7c009b37a354c';

  console.log('Testing corrected Number1Pool scraping logic...\n');

  try {
    const scrapedData = await service.scrapeWeeklyPicks(url);
    console.log(`\nScraped ${scrapedData.games.length} games:`);

    // Focus on the problematic games from week 3
    const problemGames = [
      'Buffalo Bills', 'Miami Dolphins',
      'Carolina Panthers', 'Atlanta Falcons',
      'Cleveland Browns', 'Green Bay Packers',
      'Tennessee Titans', 'Indianapolis Colts',
      'New England Patriots', 'Pittsburgh Steelers',
      'New York Giants', 'Kansas City Chiefs'
    ];

    const relevantGames = scrapedData.games.filter(game =>
      problemGames.some(team =>
        game.homeTeam.includes(team) || game.awayTeam.includes(team)
      )
    );

    console.log(`\nFound ${relevantGames.length} relevant games:\n`);

    relevantGames.forEach((game, i) => {
      console.log(`=== Game ${i + 1} ===`);
      console.log(`Away: ${game.awayTeam}`);
      console.log(`Home: ${game.homeTeam}`);
      console.log(`Home Spread: ${game.homeSpread > 0 ? '+' : ''}${game.homeSpread}`);
      console.log(`Favorite: ${game.favorite} (${game.spread})`);
      console.log(`Underdog: ${game.underdog}`);
      console.log('');
    });

    // Test conversion to upload format
    console.log('=== Converted to Upload Format ===\n');
    const uploadFormat = service.convertToUploadFormat(scrapedData);

    const relevantUploads = uploadFormat.filter(spread =>
      problemGames.some(team =>
        spread.home_team.includes(team) || spread.away_team.includes(team)
      )
    );

    relevantUploads.forEach((spread, i) => {
      console.log(`${i + 1}. ${spread.away_team} @ ${spread.home_team} (${spread.spread_for_home > 0 ? '+' : ''}${spread.spread_for_home})`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

testCorrectedNumber1Pool().catch(console.error);