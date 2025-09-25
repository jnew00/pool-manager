#!/usr/bin/env tsx

import { prisma } from '@/lib/prisma'
import { SurvivorGradingService } from '@/server/services/survivor-grading.service'

async function gradeSurvivorWeek() {
  const poolId = process.argv[2]
  const week = parseInt(process.argv[3] || '1')

  if (!poolId) {
    console.error('Usage: tsx scripts/grade-survivor-week.ts <poolId> [week]')
    process.exit(1)
  }

  console.log(`Grading survivor pool ${poolId} for week ${week}...`)

  try {
    const gradingService = new SurvivorGradingService()
    const results = await gradingService.gradeWeekSurvivorPicks(poolId, week)

    console.log(`\nGraded ${results.length} picks:`)
    for (const result of results) {
      console.log(`- Entry ${result.entryId}: ${result.outcome}`)
      if (result.isEliminated) {
        console.log(`  ⚠️  ELIMINATED (${result.strikesUsed}/${result.strikesAllowed} strikes used)`)
      } else if (result.outcome === 'LOSS') {
        console.log(`  Strike used (${result.strikesUsed}/${result.strikesAllowed})`)
      }
    }

    // Show pool stats
    const poolStats = await prisma.survivorEntry.findMany({
      where: { poolId },
      select: {
        id: true,
        entryName: true,
        isActive: true,
        strikes: true,
        eliminatedWeek: true,
      },
    })

    const active = poolStats.filter((e) => e.isActive)
    const eliminated = poolStats.filter((e) => !e.isActive)

    console.log(`\nPool Status:`)
    console.log(`- Active entries: ${active.length}`)
    console.log(`- Eliminated entries: ${eliminated.length}`)
    console.log(`- Survival rate: ${((active.length / poolStats.length) * 100).toFixed(1)}%`)

    if (eliminated.length > 0) {
      console.log(`\nEliminated Entries:`)
      for (const entry of eliminated) {
        console.log(`- ${entry.entryName}: Week ${entry.eliminatedWeek}`)
      }
    }
  } catch (error) {
    console.error('Error grading survivor week:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

gradeSurvivorWeek()