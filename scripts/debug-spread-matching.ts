#!/usr/bin/env tsx

/**
 * Debug script to test spread matching with your actual data
 * Usage: npx tsx scripts/debug-spread-matching.ts
 */

import { gameMatcherService } from '../src/features/uploads/services/game-matcher.service'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugSpreadMatching() {
  console.log('🔍 Debug Spread Matching Tool\n')

  // Get Week 1 games
  const games = await prisma.game.findMany({
    where: { season: 2025, week: 1 },
    include: {
      homeTeam: { select: { nflAbbr: true, name: true } },
      awayTeam: { select: { nflAbbr: true, name: true } },
    },
    orderBy: [{ awayTeam: { nflAbbr: 'asc' } }],
  })

  console.log(`📊 Found ${games.length} Week 1 games:`)
  games.forEach((game, i) => {
    console.log(
      `   ${i + 1}. ${game.awayTeam.nflAbbr} @ ${game.homeTeam.nflAbbr}`
    )
  })

  // Sample spread data with various formats to test
  const testSpreads = [
    // Common abbreviation formats
    { away_team: 'ARI', home_team: 'NO', spread_for_home: -3 },
    { away_team: 'BAL', home_team: 'BUF', spread_for_home: -1.5 },
    { away_team: 'DAL', home_team: 'PHI', spread_for_home: -3 },
    { away_team: 'LV', home_team: 'NE', spread_for_home: 1 },
    { away_team: 'MIA', home_team: 'IND', spread_for_home: 2.5 },
    { away_team: 'SF', home_team: 'SEA', spread_for_home: -1 },
    { away_team: 'TB', home_team: 'ATL', spread_for_home: -2 },

    // Full team names
    { away_team: 'Arizona', home_team: 'New Orleans', spread_for_home: -3 },
    { away_team: 'Baltimore', home_team: 'Buffalo', spread_for_home: -1.5 },
    { away_team: 'Dallas', home_team: 'Philadelphia', spread_for_home: -3 },
    { away_team: 'Las Vegas', home_team: 'New England', spread_for_home: 1 },
    { away_team: 'Miami', home_team: 'Indianapolis', spread_for_home: 2.5 },
    { away_team: 'San Francisco', home_team: 'Seattle', spread_for_home: -1 },
    { away_team: 'Tampa Bay', home_team: 'Atlanta', spread_for_home: -2 },

    // Team nicknames
    { away_team: 'Cardinals', home_team: 'Saints', spread_for_home: -3 },
    { away_team: 'Ravens', home_team: 'Bills', spread_for_home: -1.5 },
    { away_team: 'Cowboys', home_team: 'Eagles', spread_for_home: -3 },
    { away_team: 'Raiders', home_team: 'Patriots', spread_for_home: 1 },
    { away_team: 'Dolphins', home_team: 'Colts', spread_for_home: 2.5 },
    { away_team: '49ers', home_team: 'Seahawks', spread_for_home: -1 },
    { away_team: 'Bucs', home_team: 'Falcons', spread_for_home: -2 },
  ]

  console.log(`\n🧪 Testing ${testSpreads.length} spread variations...\n`)

  let successCount = 0
  let failureCount = 0

  for (const spread of testSpreads) {
    const matchResult = games.find((game) => {
      const homeMatch = (gameMatcherService as any).teamMatches(
        game.homeTeam.nflAbbr,
        spread.home_team
      )
      const awayMatch = (gameMatcherService as any).teamMatches(
        game.awayTeam.nflAbbr,
        spread.away_team
      )
      return homeMatch && awayMatch
    })

    if (matchResult) {
      console.log(
        `✅ ${spread.away_team} @ ${spread.home_team} → ${matchResult.awayTeam.nflAbbr} @ ${matchResult.homeTeam.nflAbbr}`
      )
      successCount++
    } else {
      console.log(`❌ ${spread.away_team} @ ${spread.home_team} → NO MATCH`)
      failureCount++

      // Debug why it failed
      console.log(`   🔍 Checking individual team matches:`)
      games.forEach((game) => {
        const homeMatch = (gameMatcherService as any).teamMatches(
          game.homeTeam.nflAbbr,
          spread.home_team
        )
        const awayMatch = (gameMatcherService as any).teamMatches(
          game.awayTeam.nflAbbr,
          spread.away_team
        )

        if (homeMatch && !awayMatch) {
          console.log(
            `      Home match only: ${spread.home_team} → ${game.homeTeam.nflAbbr} (missing away: ${spread.away_team})`
          )
        } else if (!homeMatch && awayMatch) {
          console.log(
            `      Away match only: ${spread.away_team} → ${game.awayTeam.nflAbbr} (missing home: ${spread.home_team})`
          )
        }
      })
    }
  }

  console.log(`\n📊 Results:`)
  console.log(`   ✅ Successful matches: ${successCount}`)
  console.log(`   ❌ Failed matches: ${failureCount}`)
  console.log(
    `   📈 Success rate: ${Math.round((successCount / (successCount + failureCount)) * 100)}%`
  )

  await prisma.$disconnect()
}

// Add your own test data here
function testYourData() {
  console.log('\n🎯 Test your actual spread data:')
  console.log(
    'Modify this function to include the exact team names from your upload file'
  )

  // Example: Replace with your actual data
  const yourSpreads = [
    // { away_team: 'Team Name From Your File', home_team: 'Team Name From Your File', spread_for_home: -3 },
  ]

  if (yourSpreads.length === 0) {
    console.log(
      '💡 Add your spread data to the yourSpreads array in this script to test it'
    )
  }
}

debugSpreadMatching()
  .then(() => testYourData())
  .catch(console.error)
