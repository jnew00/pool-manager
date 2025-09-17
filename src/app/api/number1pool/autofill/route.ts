import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, games, defaultSelection = '1' } = body;

    if (!url || !games || !Array.isArray(games)) {
      return NextResponse.json(
        { error: 'URL and games array are required' },
        { status: 400 }
      );
    }

    console.log('[Number1Pool AutoFill] Starting auto-fill for:', url);
    console.log('[Number1Pool AutoFill] Games to fill:', games.length);

    // Use the Puppeteer MCP to navigate and auto-fill
    const puppeteerResponse = await fetch('http://localhost:3000/api/puppeteer/navigate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!puppeteerResponse.ok) {
      throw new Error('Failed to navigate to Number1Pool website');
    }

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Auto-fill the form
    let gamesProcessed = 0;

    for (const game of games) {
      const gameNumber = game.sortOrder || (games.indexOf(game) + 1);
      const selectName = `Game_${gameNumber.toString().padStart(2, '0')}`;

      try {
        // Use Puppeteer to select the value
        const selectResponse = await fetch('http://localhost:3000/api/puppeteer/evaluate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            script: `
              const select = document.querySelector('select[name="${selectName}"]');
              if (select) {
                select.value = '${defaultSelection}';
                select.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('Set ${selectName} to ${defaultSelection} (${game.favorite} vs ${game.underdog})');
                true;
              } else {
                console.warn('Select not found: ${selectName}');
                false;
              }
            `
          }),
        });

        if (selectResponse.ok) {
          const result = await selectResponse.json();
          if (result.result) {
            gamesProcessed++;
          }
        }
      } catch (error) {
        console.warn(`[Number1Pool AutoFill] Failed to fill game ${gameNumber}:`, error);
      }
    }

    console.log(`[Number1Pool AutoFill] Successfully filled ${gamesProcessed}/${games.length} games`);

    return NextResponse.json({
      success: true,
      gamesProcessed,
      totalGames: games.length,
      url,
      message: `Auto-filled ${gamesProcessed} games with ${defaultSelection === '1' ? 'favorites' : 'underdogs'}`
    });

  } catch (error) {
    console.error('[Number1Pool AutoFill] Error:', error);

    return NextResponse.json(
      {
        error: 'Auto-fill failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Number1Pool auto-fill endpoint',
    usage: 'POST with { "url": "...", "games": [...], "defaultSelection": "1" }'
  });
}