import { prisma } from '../src/lib/prisma'

async function checkGames() {
  const currentSeason = new Date().getFullYear()
  const currentWeek = 1 // Adjust as needed
  
  console.log(`\nChecking games for Season ${currentSeason}, Week ${currentWeek}:`)
  
  const games = await prisma.game.findMany({
    where: { season: currentSeason, week: currentWeek },
    include: {
      homeTeam: {
        select: {
          id: true,
          nflAbbr: true,
          name: true,
        },
      },
      awayTeam: {
        select: {
          id: true,
          nflAbbr: true,
          name: true,
        },
      },
    },
  })

  if (games.length === 0) {
    console.log('No games found! Need to fetch ESPN data first.')
    return
  }

  console.log(`\nFound ${games.length} games:`)
  games.forEach((game, i) => {
    console.log(`${i + 1}. ${game.awayTeam.nflAbbr} @ ${game.homeTeam.nflAbbr} (${game.awayTeam.name} at ${game.homeTeam.name})`)
  })

  // Helper function to convert team names to abbreviations (same as in upload API)
  const teamNameToAbbr = (teamName: string): string => {
    const nameMap: Record<string, string> = {
      'Cardinals': 'ARI', 'Arizona': 'ARI',
      'Falcons': 'ATL', 'Atlanta': 'ATL', 
      'Ravens': 'BAL', 'Baltimore': 'BAL',
      'Bills': 'BUF', 'Buffalo': 'BUF',
      'Panthers': 'CAR', 'Carolina': 'CAR',
      'Bears': 'CHI', 'Chicago': 'CHI',
      'Bengals': 'CIN', 'Cincinnati': 'CIN',
      'Browns': 'CLE', 'Cleveland': 'CLE',
      'Cowboys': 'DAL', 'Dallas': 'DAL',
      'Broncos': 'DEN', 'Denver': 'DEN',
      'Lions': 'DET', 'Detroit': 'DET',
      'Packers': 'GB', 'Green Bay': 'GB',
      'Texans': 'HOU', 'Houston': 'HOU',
      'Colts': 'IND', 'Indianapolis': 'IND',
      'Jaguars': 'JAX', 'Jacksonville': 'JAX', 'Jags': 'JAX',
      'Chiefs': 'KC', 'Kansas City': 'KC',
      'Raiders': 'LVR', 'Las Vegas': 'LVR', 'Vegas': 'LVR', 'Oakland': 'LVR',
      'Chargers': 'LAC', 'Los Angeles Chargers': 'LAC',
      'Rams': 'LAR', 'Los Angeles Rams': 'LAR',
      'Dolphins': 'MIA', 'Miami': 'MIA',
      'Vikings': 'MIN', 'Minnesota': 'MIN',
      'Patriots': 'NE', 'New England': 'NE',
      'Saints': 'NO', 'New Orleans': 'NO',
      'Giants': 'NYG', 'New York Giants': 'NYG',
      'Jets': 'NYJ', 'New York Jets': 'NYJ',
      'Eagles': 'PHI', 'Philadelphia': 'PHI',
      'Steelers': 'PIT', 'Pittsburgh': 'PIT',
      '49ers': 'SF', 'San Francisco': 'SF', 'Niners': 'SF',
      'Seahawks': 'SEA', 'Seattle': 'SEA',
      'Buccaneers': 'TB', 'Tampa Bay': 'TB', 'Bucs': 'TB',
      'Titans': 'TEN', 'Tennessee': 'TEN',
      'Commanders': 'WAS', 'Washington': 'WAS'
    }
    
    return nameMap[teamName] || teamName
  }

  // Now check our test data with conversion
  const testSpreads = [
    { away_team: 'Cowboys', home_team: 'Eagles', spread_for_home: 6.5 },
    { away_team: 'Chiefs', home_team: 'Chargers', spread_for_home: 2.5 },
    { away_team: 'Buccaneers', home_team: 'Falcons', spread_for_home: 1.5 },
    { away_team: 'Bengals', home_team: 'Browns', spread_for_home: 5.5 },
    { away_team: 'Dolphins', home_team: 'Colts', spread_for_home: 0.5 },
  ]

  console.log('\nChecking matchability of test spreads with conversion:')
  
  for (const spread of testSpreads) {
    // Convert team names to abbreviations
    const awayAbbr = teamNameToAbbr(spread.away_team)
    const homeAbbr = teamNameToAbbr(spread.home_team)
    
    console.log(`\nTesting: ${spread.away_team}(${awayAbbr}) @ ${spread.home_team}(${homeAbbr})`)
    
    // Try exact match first
    let match = games.find(
      (game) =>
        game.homeTeam.nflAbbr === homeAbbr &&
        game.awayTeam.nflAbbr === awayAbbr
    )

    if (match) {
      console.log(`✓ MATCH: ${awayAbbr} @ ${homeAbbr} → ${match.awayTeam.nflAbbr} @ ${match.homeTeam.nflAbbr}`)
    } else {
      console.log(`✗ NO MATCH: ${awayAbbr} @ ${homeAbbr}`)
      
      // Check for reverse match (home/away swapped)
      let reverseMatch = games.find(
        (game) =>
          game.homeTeam.nflAbbr === awayAbbr &&
          game.awayTeam.nflAbbr === homeAbbr
      )
      
      if (reverseMatch) {
        console.log(`  ! REVERSE MATCH FOUND: ${reverseMatch.awayTeam.nflAbbr} @ ${reverseMatch.homeTeam.nflAbbr}`)
        console.log(`    This means we should swap home/away in our parsing`)
      }
    }
  }

  await prisma.$disconnect()
}

checkGames().catch(console.error)
