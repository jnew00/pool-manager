import { GameMatcherService } from './game-matcher.service';

export interface Number1PoolGame {
  week: number;
  day: string;
  time: string;
  favorite: string;
  underdog: string;
  spread: number | null; // null for over/under games
  total?: number; // For over/under games
  isOverUnder?: boolean; // Flag to identify over/under games
  homeTeam: string;
  awayTeam: string;
  homeSpread: number | null; // null for over/under games
  sortOrder: number; // Preserve Number1Pool ordering
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

    // Sort games by their Number1Pool order (sortOrder field)
    games.sort((a, b) => a.sortOrder - b.sortOrder);

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
      console.log(`[Number1Pool] Cell breakdown: [0]="${cells[0]}" [1]="${cells[1]}" [2]="${cells[2]}" [3]="${cells[3]}" [4]="${cells[4]}"`);

      // Let's also check if we have more cells than expected
      if (cells.length > 5) {
        console.log(`[Number1Pool] Extra cells found:`, cells.slice(5));
      }
      
      if (cells.length < 5) return null;
      
      // Based on HTML structure:
      // cells[0] = week number (1, 2, 3...)
      // cells[1] = game time (Thu 8:20 PM, Fri 8:00 PM)
      // cells[2] = LEFT COLUMN = ALWAYS FAVORITE (regardless of home/away)
      // cells[3] = RIGHT COLUMN = ALWAYS UNDERDOG (regardless of home/away)
      // cells[4] = point spread (6.5, 3.5, etc.)

      const weekText = cells[0];
      const leftTeamText = cells[2];   // ALWAYS FAVORITE
      const rightTeamText = cells[3];  // ALWAYS UNDERDOG
      const spreadText = cells[4];
      const gameTime = cells[1];

      console.log(`[Number1Pool] Structured parse: Left="${leftTeamText}" vs Right="${rightTeamText}" Spread="${spreadText}" Time="${gameTime}"`);

      // Check if this is a game with over/under INCLUDED (not replacing spread)
      // Format: "Lions/BENGALS OVER" | "Lions/BENGALS UNDER" | "49.5"
      // This means the game ALSO has an over/under in addition to the spread
      const hasOverUnder = leftTeamText.includes('OVER') || leftTeamText.includes('UNDER') ||
                           rightTeamText.includes('OVER') || rightTeamText.includes('UNDER');

      let totalValue: number | undefined = undefined;

      if (hasOverUnder) {
        console.log(`[Number1Pool] Detected game with over/under option`);

        // Extract total from spreadText column
        totalValue = parseFloat(spreadText);
        if (isNaN(totalValue) || totalValue < 30 || totalValue > 70) {
          console.log(`[Number1Pool] Invalid total value: "${spreadText}" -> ${totalValue}`);
          return null;
        }

        // Extract team names from "Lions/BENGALS OVER" format
        const teamMatch = (leftTeamText.match(/^(.+?)\s+(OVER|UNDER)$/i) ||
                          rightTeamText.match(/^(.+?)\s+(OVER|UNDER)$/i));
        if (!teamMatch) {
          console.log(`[Number1Pool] Could not parse over/under team format`);
          return null;
        }

        const teamsText = teamMatch[1]; // e.g., "Lions/BENGALS"
        const teams = teamsText.split('/').map(t => t.trim());

        if (teams.length !== 2) {
          console.log(`[Number1Pool] Expected 2 teams in over/under format, got: ${teams.length}`);
          return null;
        }

        // Determine home/away based on capitalization
        const leftIsHome = this.isHomeTeam(teams[0]);
        const rightIsHome = this.isHomeTeam(teams[1]);

        let homeTeam: string, awayTeam: string;
        if (leftIsHome && !rightIsHome) {
          homeTeam = this.cleanTeamName(teams[0]);
          awayTeam = this.cleanTeamName(teams[1]);
        } else if (rightIsHome && !leftIsHome) {
          homeTeam = this.cleanTeamName(teams[1]);
          awayTeam = this.cleanTeamName(teams[0]);
        } else {
          // Fallback: assume right is home
          homeTeam = this.cleanTeamName(teams[1]);
          awayTeam = this.cleanTeamName(teams[0]);
        }

        const weekNumber = parseInt(weekText) || 1;

        // NOTE: For games with over/under, we need to ALSO look for the spread game row
        // For now, just return the over/under info and mark it
        return {
          week: weekNumber,
          day: gameTime.includes('Thu') ? 'Thursday' : gameTime.includes('Fri') ? 'Friday' : 'TBD',
          time: gameTime.replace(/^\w+\s/, ''),
          favorite: '', // Will be filled from spread row if it exists
          underdog: '', // Will be filled from spread row if it exists
          spread: null, // No spread in over/under-only row
          total: totalValue,
          isOverUnder: true,
          homeTeam,
          awayTeam,
          homeSpread: null,
          sortOrder: weekNumber
        };
      }

      // Key rules for regular spread games:
      // - Left column = ALWAYS favorite
      // - Right column = ALWAYS underdog
      // - ALL CAPS = home team
      // - Mixed case = away team

      // Validate that we have team names and a valid spread
      if (leftTeamText && rightTeamText && spreadText) {
        const spreadValue = parseFloat(spreadText);
        console.log(`[Number1Pool] Validating spread: "${spreadText}" -> ${spreadValue} (valid: ${!isNaN(spreadValue) && spreadValue >= 0.5 && spreadValue <= 20.5})`);

        // Validate spread is a reasonable NFL spread (0.5 to 20.5)
        if (!isNaN(spreadValue) && spreadValue >= 0.5 && spreadValue <= 20.5) {
          // Assign favorite and underdog based on Number1Pool column structure
          const favorite = this.cleanTeamName(leftTeamText);   // Left column = ALWAYS favorite
          const underdog = this.cleanTeamName(rightTeamText);  // Right column = ALWAYS underdog

          // Determine which team is home/away based on capitalization
          const leftIsHome = this.isHomeTeam(leftTeamText);
          const rightIsHome = this.isHomeTeam(rightTeamText);

          // Determine home and away teams
          let homeTeam: string, awayTeam: string;

          if (leftIsHome && !rightIsHome) {
            // Left team (favorite) is home, Right team (underdog) is away
            homeTeam = favorite;
            awayTeam = underdog;
          } else if (rightIsHome && !leftIsHome) {
            // Right team (underdog) is home, Left team (favorite) is away
            homeTeam = underdog;
            awayTeam = favorite;
          } else {
            // Fallback: assume left team is away, right team is home
            console.warn(`[Number1Pool] Could not determine home/away from caps: "${leftTeamText}" vs "${rightTeamText}"`);
            homeTeam = underdog;
            awayTeam = favorite;
          }

          // Calculate homeSpread: negative if home team is favored, positive if home team is underdog
          let homeSpread: number;
          if (homeTeam === favorite) {
            // Home team is favored, so negative spread
            homeSpread = -spreadValue;
          } else {
            // Home team is underdog, so positive spread
            homeSpread = spreadValue;
          }

          // Parse actual week number
          const weekNumber = parseInt(weekText) || 1;

          return {
            week: weekNumber,
            day: gameTime.includes('Thu') ? 'Thursday' : gameTime.includes('Fri') ? 'Friday' : 'TBD',
            time: gameTime.replace(/^\w+\s/, ''), // Remove day, keep time
            favorite: favorite,
            underdog: underdog,
            spread: Math.abs(spreadValue), // Always positive spread value
            homeTeam,
            awayTeam,
            homeSpread,
            sortOrder: weekNumber // Use week number as sort order
          };
        } else {
          console.log(`[Number1Pool] Invalid spread value: "${spreadText}" -> ${spreadValue} (isNaN: ${isNaN(spreadValue)}, range: ${spreadValue >= 0.5 && spreadValue <= 20.5})`);
        }
      } else {
        console.log(`[Number1Pool] Missing required fields - Left: "${leftTeamText}", Right: "${rightTeamText}", Spread: "${spreadText}"`);
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

  private isHomeTeam(teamText: string): boolean {
    // In Number1Pool, home teams are shown in ALL CAPS
    const cleanName = this.cleanTeamName(teamText);
    return cleanName === cleanName.toUpperCase();
  }

  /**
   * Convert scraped games to normalized format for GameMatcherService
   * Merges spread and over/under rows for the same game into a single entry
   */
  convertToUploadFormat(scrapedData: Number1PoolScrapedData): any[] {
    // First, create initial entries
    const entries = scrapedData.games.map(game => ({
      home_team: game.homeTeam,
      away_team: game.awayTeam,
      spread_for_home: game.homeSpread,
      total: game.total,
      is_over_under: game.isOverUnder || false,
      source: 'number1pool-scraper',
      issues: []
    }));

    // Merge games that appear twice (spread + over/under for same matchup)
    const mergedMap = new Map<string, any>();

    for (const entry of entries) {
      const key = `${entry.away_team}@${entry.home_team}`;

      if (mergedMap.has(key)) {
        // Game already exists - merge the data
        const existing = mergedMap.get(key);
        if (entry.is_over_under) {
          // This entry has over/under data, add it to existing spread entry
          existing.total = entry.total;
          console.log(`[Number1Pool] Merged over/under (${entry.total}) with spread for ${entry.away_team} @ ${entry.home_team}`);
        } else {
          // This entry has spread data, add it to existing over/under entry
          existing.spread_for_home = entry.spread_for_home;
          existing.is_over_under = false; // Has both spread and total now
          console.log(`[Number1Pool] Merged spread (${entry.spread_for_home}) with over/under for ${entry.away_team} @ ${entry.home_team}`);
        }
      } else {
        // First time seeing this game
        mergedMap.set(key, entry);
      }
    }

    const result = Array.from(mergedMap.values());

    console.log('[Number1Pool] Converted to normalized format for GameMatcher (after merging):');
    result.forEach((spread, i) => {
      if (spread.total !== null && spread.total !== undefined && spread.spread_for_home !== null) {
        console.log(`[Number1Pool]   ${i + 1}. ${spread.away_team} @ ${spread.home_team} (Spread: ${spread.spread_for_home}, Total: ${spread.total})`);
      } else if (spread.is_over_under) {
        console.log(`[Number1Pool]   ${i + 1}. ${spread.away_team} @ ${spread.home_team} (O/U: ${spread.total})`);
      } else {
        console.log(`[Number1Pool]   ${i + 1}. ${spread.away_team} @ ${spread.home_team} (${spread.spread_for_home})`);
      }
    });

    return result;
  }

}