#!/usr/bin/env tsx

/**
 * Survivor Pool Weekly Grading Workflow
 *
 * This script:
 * 1. Fetches game results from ESPN
 * 2. Updates the database with results
 * 3. Grades all survivor picks
 * 4. Shows elimination summary
 */

import { prisma } from '@/lib/prisma'
import { SurvivorGradingService } from '@/server/services/survivor-grading.service'
import axios from 'axios'

async function fetchESPNScores(week: number, season: number = 2025) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${week}&seasontype=2&season=${season}`
    const response = await axios.get(url)
    const games = response.data.events || []

    const results = []
    for (const game of games) {
      const competition = game.competitions?.[0]
      if (competition?.status?.type?.completed) {
        const home = competition.competitors.find((c: any) => c.homeAway === 'home')
        const away = competition.competitors.find((c: any) => c.homeAway === 'away')

        if (home && away) {
          results.push({
            homeTeam: home.team.abbreviation,
            awayTeam: away.team.abbreviation,
            homeScore: parseInt(home.score),
            awayScore: parseInt(away.score),
          })
        }
      }
    }

    return results
  } catch (error) {
    console.error('Error fetching ESPN scores:', error)
    return []
  }
}

async function runWeeklyGrading(week: number = 1) {
  console.log(`\n🏈 SURVIVOR POOL WEEKLY GRADING - WEEK ${week}`)
  console.log('=' .repeat(50))

  // Step 1: Fetch and update game results
  console.log('\n📊 Step 1: Fetching game results from ESPN...')
  const espnScores = await fetchESPNScores(week)

  if (espnScores.length === 0) {
    console.log('⚠️  No completed games found. Games may still be in progress.')
    return
  }

  console.log(`✅ Found ${espnScores.length} completed games`)

  // Step 2: Update database with results
  console.log('\n💾 Step 2: Updating database with results...')
  const games = await prisma.game.findMany({
    where: { week, season: 2025 },
    include: {
      homeTeam: true,
      awayTeam: true,
      result: true,
    },
  })

  let resultsUpdated = 0
  for (const score of espnScores) {
    const game = games.find(
      (g) =>
        g.homeTeam.nflAbbr === score.homeTeam &&
        g.awayTeam.nflAbbr === score.awayTeam
    )

    if (game) {
      await prisma.result.upsert({
        where: { gameId: game.id },
        create: {
          gameId: game.id,
          homeScore: score.homeScore,
          awayScore: score.awayScore,
          status: 'FINAL',
        },
        update: {
          homeScore: score.homeScore,
          awayScore: score.awayScore,
          status: 'FINAL',
        },
      })
      resultsUpdated++
      console.log(`   ${score.awayTeam} ${score.awayScore} - ${score.homeScore} ${score.homeTeam}`)
    }
  }

  console.log(`✅ Updated ${resultsUpdated} game results`)

  // Step 3: Grade survivor picks for all pools
  console.log('\n🎯 Step 3: Grading survivor picks...')
  const pools = await prisma.pool.findMany({
    where: { type: 'SURVIVOR', isActive: true },
  })

  const gradingService = new SurvivorGradingService()
  const allResults = []

  for (const pool of pools) {
    console.log(`\n   Pool: ${pool.name}`)

    // Get entries before grading
    const entriesBefore = await prisma.survivorEntry.findMany({
      where: { poolId: pool.id },
      select: { id: true, entryName: true, isActive: true },
    })
    const activeBefore = entriesBefore.filter((e) => e.isActive).length

    // Grade the picks
    const results = await gradingService.gradeWeekSurvivorPicks(pool.id, week)
    allResults.push(...results)

    // Get entries after grading
    const entriesAfter = await prisma.survivorEntry.findMany({
      where: { poolId: pool.id },
      include: {
        picks: {
          where: { week },
          include: { team: true },
        },
      },
    })

    const activeAfter = entriesAfter.filter((e) => e.isActive).length
    const eliminated = activeBefore - activeAfter

    console.log(`   - Graded ${results.length} picks`)
    console.log(`   - Active entries: ${activeAfter}/${entriesAfter.length}`)
    if (eliminated > 0) {
      console.log(`   - ❌ ELIMINATED THIS WEEK: ${eliminated}`)

      // Show who was eliminated
      const eliminatedEntries = entriesAfter.filter(
        (e) => !e.isActive && e.eliminatedWeek === week
      )
      for (const entry of eliminatedEntries) {
        const pick = entry.picks[0]
        console.log(`      • ${entry.entryName} (picked ${pick?.team?.name || 'Unknown'})`)
      }
    }
  }

  // Step 4: Summary
  console.log('\n📈 GRADING SUMMARY')
  console.log('=' .repeat(50))
  console.log(`Total picks graded: ${allResults.length}`)

  const wins = allResults.filter((r) => r.outcome === 'WIN').length
  const losses = allResults.filter((r) => r.outcome === 'LOSS').length
  const eliminations = allResults.filter((r) => r.isEliminated).length

  console.log(`Wins: ${wins}`)
  console.log(`Losses: ${losses}`)
  console.log(`Eliminations: ${eliminations}`)

  // Show overall survival rate across all pools
  const allEntries = await prisma.survivorEntry.findMany()
  const stillActive = allEntries.filter((e) => e.isActive).length
  const survivalRate = ((stillActive / allEntries.length) * 100).toFixed(1)

  console.log(`\nOverall survival rate: ${survivalRate}% (${stillActive}/${allEntries.length})`)
}

// Main execution
async function main() {
  const week = parseInt(process.argv[2] || '1')

  try {
    await runWeeklyGrading(week)
    console.log('\n✅ Weekly grading complete!')
  } catch (error) {
    console.error('\n❌ Error during grading:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()