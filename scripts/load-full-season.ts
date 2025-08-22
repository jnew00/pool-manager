#!/usr/bin/env tsx

/**
 * Load full NFL season schedule from ESPN API
 * Loads all weeks for regular season, with optional preseason and playoffs
 */

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { execSync } from 'child_process'

// Load environment variables
config()

const prisma = new PrismaClient()

interface LoadOptions {
  season: number
  includePreseason?: boolean
  includePlayoffs?: boolean
  startWeek?: number
  endWeek?: number
}

async function loadFullSeason(options: LoadOptions) {
  const {
    season,
    includePreseason = false,
    includePlayoffs = false,
    startWeek = 1,
    endWeek = 18,
  } = options

  console.log(`🏈 Loading ${season} NFL season schedule`)
  console.log(`   Regular Season: Week ${startWeek} - ${endWeek}`)
  console.log(`   Preseason: ${includePreseason ? 'Yes' : 'No'}`)
  console.log(`   Playoffs: ${includePlayoffs ? 'Yes' : 'No'}`)

  let totalGamesLoaded = 0
  let totalErrors = 0

  // Load preseason if requested
  if (includePreseason) {
    console.log(`\n📅 Loading Preseason...`)
    for (let week = 1; week <= 4; week++) {
      try {
        console.log(`Loading Preseason Week ${week}...`)
        execSync(`npm run db:load-schedule ${season} ${week} 1`, {
          stdio: 'inherit',
        })

        // Count games added
        const games = await prisma.game.count({
          where: { season, week, apiRefs: { path: ['seasonType'], equals: 1 } },
        })
        totalGamesLoaded += games
      } catch (error) {
        console.error(`❌ Failed to load Preseason Week ${week}:`, error)
        totalErrors++
      }
    }
  }

  // Load regular season
  console.log(`\n📅 Loading Regular Season...`)
  for (let week = startWeek; week <= endWeek; week++) {
    try {
      console.log(`Loading Week ${week}...`)
      execSync(`npm run db:load-schedule ${season} ${week} 2`, {
        stdio: 'inherit',
      })

      // Count games added for this week
      const games = await prisma.game.count({
        where: { season, week },
      })
      console.log(`   ✅ Week ${week}: ${games} games`)
      totalGamesLoaded += games
    } catch (error) {
      console.error(`❌ Failed to load Week ${week}:`, error)
      totalErrors++
    }
  }

  // Load playoffs if requested
  if (includePlayoffs) {
    console.log(`\n📅 Loading Playoffs...`)

    // Playoff structure: Wild Card (Week 1), Divisional (Week 2), Conference (Week 3), Super Bowl (Week 4)
    const playoffWeeks = [
      { week: 1, name: 'Wild Card' },
      { week: 2, name: 'Divisional' },
      { week: 3, name: 'Conference Championships' },
      { week: 4, name: 'Super Bowl' },
    ]

    for (const playoff of playoffWeeks) {
      try {
        console.log(`Loading ${playoff.name} (Playoff Week ${playoff.week})...`)
        execSync(`npm run db:load-schedule ${season} ${playoff.week} 3`, {
          stdio: 'inherit',
        })

        const games = await prisma.game.count({
          where: {
            season,
            week: playoff.week,
            apiRefs: { path: ['seasonType'], equals: 3 },
          },
        })
        totalGamesLoaded += games
      } catch (error) {
        console.error(`❌ Failed to load ${playoff.name}:`, error)
        totalErrors++
      }
    }
  }

  // Summary
  console.log(`\n🎉 Season loading completed!`)
  console.log(`   Total games loaded: ${totalGamesLoaded}`)
  console.log(`   Errors: ${totalErrors}`)

  // Show final count by week
  const weekCounts = await prisma.game.groupBy({
    by: ['week'],
    where: { season },
    _count: { id: true },
    orderBy: { week: 'asc' },
  })

  console.log(`\n📊 Games by week:`)
  weekCounts.forEach(({ week, _count }) => {
    console.log(`   Week ${week}: ${_count.id} games`)
  })
}

async function main() {
  const season = parseInt(process.argv[2] || '2025')
  const includePreseason = process.argv.includes('--preseason')
  const includePlayoffs = process.argv.includes('--playoffs')

  // Parse week range if provided
  let startWeek = 1
  let endWeek = 18

  const weekRangeArg = process.argv.find((arg) => arg.startsWith('--weeks='))
  if (weekRangeArg) {
    const range = weekRangeArg.split('=')[1]
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(Number)
      startWeek = start
      endWeek = end
    } else {
      startWeek = endWeek = Number(range)
    }
  }

  await loadFullSeason({
    season,
    includePreseason,
    includePlayoffs,
    startWeek,
    endWeek,
  })
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
