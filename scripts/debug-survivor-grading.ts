#!/usr/bin/env tsx

import { prisma } from '@/lib/prisma'

async function debugSurvivorGrading() {
  console.log('🔍 Debugging Survivor Pool Grading\n')

  try {
    // Find the survivor pool
    const pool = await prisma.pool.findFirst({
      where: {
        type: 'SURVIVOR',
        name: 'Survivor Pool'
      }
    })

    if (!pool) {
      console.log('❌ No survivor pool found')
      return
    }

    console.log(`📋 Pool: ${pool.name} (${pool.id})`)

    // Check entries
    const entries = await prisma.survivorEntry.findMany({
      where: { poolId: pool.id },
      include: {
        picks: {
          include: {
            team: { select: { name: true, nflAbbr: true } },
            game: {
              include: {
                result: true,
                homeTeam: { select: { nflAbbr: true } },
                awayTeam: { select: { nflAbbr: true } }
              }
            }
          }
        }
      }
    })

    console.log(`\n👥 Found ${entries.length} entries:`)

    for (const entry of entries) {
      console.log(`\n  Entry: ${entry.entryName || 'Unnamed'}`)
      console.log(`  - Active: ${entry.isActive}`)
      console.log(`  - Strikes: ${entry.strikes}`)
      console.log(`  - Picks: ${entry.picks.length}`)

      if (entry.picks.length > 0) {
        console.log(`  - Pick details:`)
        for (const pick of entry.picks) {
          const gameResult = pick.game.result
          console.log(`    Week ${pick.week}: ${pick.team.name} (${pick.team.nflAbbr})`)
          console.log(`      Game: ${pick.game.awayTeam.nflAbbr} @ ${pick.game.homeTeam.nflAbbr}`)
          console.log(`      Result: ${pick.result || 'PENDING'}`)
          console.log(`      Game Result: ${gameResult ? `${gameResult.awayScore}-${gameResult.homeScore}` : 'NO RESULT'}`)
        }
      }
    }

    // Check Week 3 specifically
    console.log('\n📅 Week 3 Analysis:')

    const week3Picks = await prisma.survivorPick.findMany({
      where: {
        week: 3,
        entry: { poolId: pool.id }
      },
      include: {
        team: true,
        game: { include: { result: true } },
        entry: { select: { entryName: true } }
      }
    })

    console.log(`Week 3 picks found: ${week3Picks.length}`)

    for (const pick of week3Picks) {
      console.log(`  ${pick.entry.entryName}: ${pick.team.name} - Result: ${pick.result || 'PENDING'}`)
      console.log(`    Game has result: ${pick.game.result ? 'YES' : 'NO'}`)
      if (pick.game.result) {
        console.log(`    Score: ${pick.game.result.awayScore}-${pick.game.result.homeScore}`)
      }
    }

    // Check games for Week 3
    console.log('\n🏈 Week 3 Games:')
    const week3Games = await prisma.game.findMany({
      where: {
        week: 3,
        season: 2025
      },
      include: {
        result: true,
        homeTeam: { select: { nflAbbr: true } },
        awayTeam: { select: { nflAbbr: true } }
      },
      take: 5
    })

    console.log(`Week 3 games found: ${week3Games.length}`)
    for (const game of week3Games) {
      const hasResult = !!game.result
      console.log(`  ${game.awayTeam.nflAbbr} @ ${game.homeTeam.nflAbbr} - Result: ${hasResult ? 'YES' : 'NO'}`)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugSurvivorGrading()