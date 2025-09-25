#!/usr/bin/env tsx

import { prisma } from '@/lib/prisma'

async function debugGradingQuery() {
  console.log('🔍 Debugging Grading Query\n')

  try {
    // First, find the survivor pool
    const pools = await prisma.pool.findMany({
      where: { type: 'SURVIVOR' },
      select: { id: true, name: true },
    })

    console.log(`Found ${pools.length} survivor pools:`)
    for (const pool of pools) {
      console.log(`  - ${pool.name} (${pool.id})`)
    }

    if (pools.length === 0) {
      console.log('❌ No survivor pools found!')
      return
    }

    // Look for the one with entries
    let poolWithEntries = null
    for (const pool of pools) {
      const entryCount = await prisma.survivorEntry.count({
        where: { poolId: pool.id }
      })
      console.log(`  ${pool.name}: ${entryCount} entries`)

      if (entryCount > 0 && !poolWithEntries) {
        poolWithEntries = pool
      }
    }

    const poolId = poolWithEntries ? poolWithEntries.id : pools[0].id
    const week = 1

    console.log(`\nUsing Pool: ${poolWithEntries?.name || pools[0].name} (${poolId}), Week: ${week}`)

    // Check what the grading service query would find
    const survivorPicks = await prisma.survivorPick.findMany({
      where: {
        week,
        entry: {
          poolId,
        },
        OR: [
          { result: null }, // Ungraded picks
          { result: 'PENDING' }, // Pending picks that need grading
        ],
      },
      include: {
        game: {
          include: {
            result: true,
          },
        },
        entry: {
          select: {
            entryName: true,
          },
        },
        team: {
          select: {
            name: true,
            nflAbbr: true,
          },
        },
      },
    })

    console.log(`\n📊 Grading Query Results:`)
    console.log(`Found ${survivorPicks.length} picks that match grading criteria`)

    for (const pick of survivorPicks) {
      console.log(`\n  Entry: ${pick.entry.entryName}`)
      console.log(`  Team: ${pick.team.name} (${pick.team.nflAbbr})`)
      console.log(`  Pick Result: ${pick.result}`)
      console.log(`  Game Has Result: ${pick.game.result ? 'YES' : 'NO'}`)
      if (pick.game.result) {
        console.log(`  Game Score: ${pick.game.result.awayScore}-${pick.game.result.homeScore}`)
        console.log(`  Game Status: ${pick.game.result.status}`)
      }
    }

    // Also check what ALL picks look like
    console.log(`\n📋 ALL Week ${week} Picks:`)
    const allPicks = await prisma.survivorPick.findMany({
      where: {
        week,
        entry: {
          poolId,
        },
      },
      include: {
        entry: { select: { entryName: true } },
        team: { select: { name: true, nflAbbr: true } },
        game: { include: { result: true } },
      },
    })

    console.log(`Total picks for week ${week}: ${allPicks.length}`)

    for (const pick of allPicks) {
      console.log(`  ${pick.entry.entryName}: ${pick.team.nflAbbr} - Result: ${pick.result}`)
    }

    // Check if there are any results at all
    console.log(`\n🏈 Game Results Check:`)
    const resultsCount = await prisma.result.count()
    console.log(`Total game results in database: ${resultsCount}`)

    const week1Results = await prisma.result.findMany({
      where: {
        game: {
          week: 1,
          season: 2025,
        },
      },
      include: {
        game: {
          include: {
            homeTeam: { select: { nflAbbr: true } },
            awayTeam: { select: { nflAbbr: true } },
          },
        },
      },
      take: 5,
    })

    console.log(`Week 1 results sample (${week1Results.length}):`)
    for (const result of week1Results) {
      console.log(`  ${result.game.awayTeam.nflAbbr} ${result.awayScore} - ${result.homeScore} ${result.game.homeTeam.nflAbbr}`)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugGradingQuery()