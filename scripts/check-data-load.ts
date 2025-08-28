#!/usr/bin/env npx tsx

import { prisma } from '../src/lib/prisma'

async function checkDataLoad() {
  console.log('Checking loaded 2025 season data...')

  try {
    // Count games by season
    const gamesBySeasonQuery = await prisma.game.groupBy({
      by: ['season'],
      _count: true,
      orderBy: { season: 'desc' }
    })

    console.log('\n📊 Games by Season:')
    gamesBySeasonQuery.forEach(result => {
      console.log(`   Season ${result.season}: ${result._count} games`)
    })

    // Count 2025 games by week
    const gamesByWeek = await prisma.game.groupBy({
      by: ['week'],
      where: { season: 2025 },
      _count: true,
      orderBy: { week: 'asc' }
    })

    console.log('\n📅 2025 Season - Games by Week:')
    gamesByWeek.forEach(result => {
      console.log(`   Week ${result.week}: ${result._count} games`)
    })

    // Total teams
    const teamsCount = await prisma.team.count()
    console.log(`\n🏈 Total Teams: ${teamsCount}`)

    // Check pools and spreads (should be empty after cleanup)
    const poolsCount = await prisma.pool.count()
    const linesCount = await prisma.line.count()
    
    console.log(`\n🏊 Pools: ${poolsCount} (should be 0)`)
    console.log(`📈 Lines/Spreads: ${linesCount} (should be 0)`)

    console.log('\n✅ Data load check completed!')
    
  } catch (error) {
    console.error('❌ Error checking data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkDataLoad()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Check failed:', error)
    process.exit(1)
  })