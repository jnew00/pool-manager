import { NextRequest, NextResponse } from 'next/server';
import { Number1PoolScraperService } from '@/features/uploads/services/number1pool-scraper.service';
import { GameMatcherService } from '@/features/uploads/services/game-matcher.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, poolId, season = 2025, week = 1 } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log('[Number1Pool API] Starting scrape for URL:', url);
    
    const scraper = new Number1PoolScraperService();
    const scrapedData = await scraper.scrapeWeeklyPicks(url);
    const normalizedSpreads = scraper.convertToUploadFormat(scrapedData);

    console.log(`[Number1Pool API] Successfully scraped ${normalizedSpreads.length} spreads`);

    // Use GameMatcherService to match spreads to existing games
    const gameMatcher = new GameMatcherService();
    const matchingResult = await gameMatcher.matchSpreadsToGames(normalizedSpreads, season, week);

    console.log(`[Number1Pool API] Matched ${matchingResult.matches.length} spreads to games`);
    
    if (poolId && matchingResult.matches.length > 0) {
      // Create lines for matched games
      const lineResult = await gameMatcher.createLinesForMatches(
        matchingResult.matches,
        poolId,
        'Number1Pool Scraper'
      );
      
      console.log(`[Number1Pool API] Created ${lineResult.created} lines in database`);
      
      if (lineResult.errors.length > 0) {
        console.warn('[Number1Pool API] Some errors occurred:', lineResult.errors);
      }
    }

    return NextResponse.json({
      success: true,
      source: 'number1pool-scraper',
      spreadsCount: normalizedSpreads.length,
      matchedCount: matchingResult.matches.length,
      unmatchedCount: matchingResult.unmatched.length,
      spreads: matchingResult.matches.map(match => ({
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        spread: match.spread,
        source: 'number1pool-scraper'
      })),
      unmatched: matchingResult.unmatched,
      number1poolGames: scrapedData.games, // Include raw Number1Pool games for auto-fill
      metadata: {
        scrapedAt: scrapedData.scrapedAt,
        totalGames: scrapedData.games.length
      }
    });

  } catch (error) {
    console.error('[Number1Pool API] Scraping failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Scraping failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Number1Pool scraper endpoint',
    usage: 'POST with { "url": "https://number1pool.com/picks_weekly.php?user=...&verify=..." }'
  });
}