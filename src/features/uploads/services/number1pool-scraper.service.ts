import { GameMatcherService } from './game-matcher.service';

export interface Number1PoolGame {
  week: number;
  day: string;
  time: string;
  favorite: string;
  underdog: string;
  spread: number;
}

export interface Number1PoolScrapedData {
  games: Number1PoolGame[];
  source: 'number1pool';
  scrapedAt: Date;
}

export class Number1PoolScraperService {
  async scrapeWeeklyPicks(url: string): Promise<Number1PoolScrapedData> {
    try {
      console.log('[Number1Pool] Scraping spreads from:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const html = await response.text();
      const games = this.parseHtml(html);

      console.log(`[Number1Pool] Successfully scraped ${games.length} games`);
      
      // Debug: log first few games
      if (games.length > 0) {
        console.log('[Number1Pool] Sample scraped games:');
        games.slice(0, 3).forEach((game, i) => {
          console.log(`[Number1Pool]   ${i + 1}. ${game.favorite} vs ${game.underdog} (${game.spread})`);
        });
      }
      
      return {
        games,
        source: 'number1pool',
        scrapedAt: new Date()
      };
    } catch (error) {
      console.error('[Number1Pool] Scraping failed:', error);
      throw new Error(`Number1Pool scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseHtml(html: string): Number1PoolGame[] {
    const games: Number1PoolGame[] = [];
    
    // Look for table rows with game data
    const tableRowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
    const rows = html.match(tableRowRegex) || [];
    
    console.log(`[Number1Pool] Found ${rows.length} table rows to parse`);
    
    for (const row of rows) {
      const game = this.parseGameRow(row);
      if (game) {
        games.push(game);
      }
    }
    
    return games;
  }

  private parseGameRow(rowHtml: string): Number1PoolGame | null {
    try {
      // Extract cell contents
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const cells: string[] = [];
      let match;
      
      while ((match = cellRegex.exec(rowHtml)) !== null) {
        // Strip HTML tags and clean text
        const cellText = match[1]
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/&nbsp;/g, ' ') // Replace &nbsp;
          .trim();
        cells.push(cellText);
      }
      
      console.log(`[Number1Pool] Row cells:`, cells);
      
      if (cells.length < 5) return null;
      
      // Based on HTML structure:
      // cells[0] = week number (1, 2, 3...)
      // cells[1] = game time (Thu 8:20 PM, Fri 8:00 PM)
      // cells[2] = favorite team (PHILADELPHIA EAGLES (0-0))
      // cells[3] = underdog team (Dallas Cowboys (0-0))
      // cells[4] = point spread (6.5, 3.5, etc.)
      
      const favoriteText = cells[2];
      const underdogText = cells[3];  
      const spreadText = cells[4];
      const gameTime = cells[1];
      
      console.log(`[Number1Pool] Structured parse: Fav="${favoriteText}" vs Under="${underdogText}" Spread="${spreadText}" Time="${gameTime}"`);
      
      // Validate that we have team names and a valid spread
      if (favoriteText && underdogText && spreadText) {
        const spreadValue = parseFloat(spreadText);
        
        // Validate spread is a reasonable NFL spread (0.5 to 20.5)
        if (!isNaN(spreadValue) && spreadValue >= 0.5 && spreadValue <= 20.5) {
          return {
            week: 1,
            day: gameTime.includes('Thu') ? 'Thursday' : gameTime.includes('Fri') ? 'Friday' : 'TBD',
            time: gameTime.replace(/^\w+\s/, ''), // Remove day, keep time
            favorite: this.cleanTeamName(favoriteText),
            underdog: this.cleanTeamName(underdogText),
            spread: spreadValue
          };
        }
      }
      
      console.log(`[Number1Pool] Failed validation - skipping row`);
      return null;
    } catch (error) {
      console.error('[Number1Pool] Error parsing row:', error);
      return null;
    }
  }

  private cleanTeamName(teamText: string): string {
    // Remove record like "(0-0)" and clean up
    return teamText
      .replace(/\([0-9-]+\)/g, '')
      .trim()
      .replace(/\s+/g, ' ');
  }

  /**
   * Convert scraped games to normalized format for GameMatcherService
   */
  convertToUploadFormat(scrapedData: Number1PoolScrapedData): any[] {
    const result = scrapedData.games.map(game => ({
      home_team: game.underdog, // The underdog (right column) is the home team
      away_team: game.favorite, // The favorite (left column) is the away team  
      spread_for_home: -game.spread, // Flip spread since favorite is now away
      source: 'number1pool-scraper',
      issues: []
    }));
    
    console.log('[Number1Pool] Converted to normalized format for GameMatcher:');
    result.slice(0, 3).forEach((spread, i) => {
      console.log(`[Number1Pool]   ${i + 1}. ${spread.away_team} @ ${spread.home_team} (${spread.spread_for_home})`);
    });
    
    return result;
  }

}