import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as path from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function testNumber1PoolWeek3() {
  const url = 'https://number1pool.com/picks_weekly.php?user=GatorBait&verify=5e1be4aa0b90bbbf90c7c009b37a354c';

  console.log('Fetching Number1Pool Week 3 data...');

  const response = await fetch(url);
  const html = await response.text();

  // Look for specific games mentioned
  const gamesToCheck = [
    'Buffalo Bills',
    'Miami Dolphins',
    'Carolina Panthers',
    'Atlanta Falcons',
    'Cleveland Browns',
    'Green Bay Packers',
    'Tennessee Titans',
    'Indianapolis Colts',
    'New England Patriots',
    'Pittsburgh Steelers',
    'New York Giants',
    'Kansas City Chiefs'
  ];

  // Save HTML for debugging
  const fs = await import('fs');
  fs.writeFileSync('number1pool-week3.html', html);
  console.log('Saved HTML to number1pool-week3.html');

  // Look for different patterns - the site might use divs or other structure
  const tableRowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  const divRowRegex = /<div[^>]*class="[^"]*row[^"]*"[^>]*>[\s\S]*?<\/div>/gi;

  let rows = html.match(tableRowRegex) || [];
  console.log(`\nFound ${rows.length} <tr> table rows`);

  if (rows.length === 0) {
    rows = html.match(divRowRegex) || [];
    console.log(`Found ${rows.length} <div> rows`);
  }

  // Also check if any of our target teams appear at all
  console.log('\nChecking for team presence in HTML:');
  gamesToCheck.forEach(team => {
    if (html.includes(team)) {
      console.log(`  ✓ Found: ${team}`);
      // Find context around the team
      const teamIndex = html.indexOf(team);
      const contextStart = Math.max(0, teamIndex - 200);
      const contextEnd = Math.min(html.length, teamIndex + 200);
      const context = html.substring(contextStart, contextEnd);
      console.log(`    Context: ...${context.replace(/\s+/g, ' ').substring(0, 150)}...`);
    } else {
      console.log(`  ✗ Not found: ${team}`);
    }
  });

  // Parse relevant rows
  let gameCount = 0;
  for (const row of rows) {
    // Check if row contains any of our teams
    const hasTeam = gamesToCheck.some(team => row.includes(team));

    if (hasTeam) {
      gameCount++;
      console.log(`\n=== Game Row ${gameCount} ===`);

      // Extract cells
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const cells: string[] = [];
      let match;

      while ((match = cellRegex.exec(row)) !== null) {
        const cellText = match[1]
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim();
        cells.push(cellText);
      }

      if (cells.length >= 5) {
        console.log('Week:', cells[0]);
        console.log('Time:', cells[1]);
        console.log('Left Column (Cell 2):', cells[2]);
        console.log('Right Column (Cell 3):', cells[3]);
        console.log('Spread:', cells[4]);

        // Determine which teams are which
        const leftTeam = cells[2];
        const rightTeam = cells[3];
        const spread = parseFloat(cells[4]);

        console.log(`\nInterpretation:`);
        console.log(`  Left team (${leftTeam}) is the FAVORITE with spread -${spread}`);
        console.log(`  Right team (${rightTeam}) is the UNDERDOG with spread +${spread}`);
        console.log(`  In our system: Away @ Home format`);
        console.log(`  Should be: ${leftTeam} @ ${rightTeam} with home spread +${spread}`);
      }

      // Also show raw HTML for debugging
      console.log('\nRaw HTML (first 500 chars):');
      console.log(row.substring(0, 500));
    }
  }

  console.log(`\n\nTotal games with target teams found: ${gameCount}`);
}

testNumber1PoolWeek3().catch(console.error);