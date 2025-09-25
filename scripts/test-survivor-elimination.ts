#!/usr/bin/env tsx

import { prisma } from '@/lib/prisma'
import { SurvivorGradingService } from '@/server/services/survivor-grading.service'

async function testSurvivorElimination() {
  console.log('Testing survivor elimination logic...\n')

  try {
    // Find a survivor pool
    const pool = await prisma.pool.findFirst({
      where: { type: 'SURVIVOR' },
    })

    if (!pool) {
      console.error('No survivor pool found. Please create one first.')
      process.exit(1)
    }

    console.log(`Using pool: ${pool.name} (${pool.id})`)

    // Find or create a test entry
    let entry = await prisma.survivorEntry.findFirst({
      where: {
        poolId: pool.id,
        entryName: 'Test Entry for Elimination',
      },
    })

    if (!entry) {
      console.log('Creating test entry...')
      entry = await prisma.survivorEntry.create({
        data: {
          poolId: pool.id,
          userId: 'user-123',
          entryName: 'Test Entry for Elimination',
          isActive: true,
          strikes: 0,
        },
      })
    }

    // Reset entry to active state for testing
    await prisma.survivorEntry.update({
      where: { id: entry.id },
      data: {
        isActive: true,
        strikes: 0,
        eliminatedWeek: null,
      },
    })

    console.log(`Entry: ${entry.entryName} (${entry.id})`)

    // Find a game for week 1
    const game = await prisma.game.findFirst({
      where: {
        week: 1,
        season: 2025,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })

    if (!game) {
      console.error('No games found for week 1. Please run seed script first.')
      process.exit(1)
    }

    console.log(`\nGame: ${game.awayTeam.name} @ ${game.homeTeam.name}`)

    // Create a pick for the home team
    const pick = await prisma.survivorPick.upsert({
      where: {
        entryId_week: {
          entryId: entry.id,
          week: 1,
        },
      },
      create: {
        entryId: entry.id,
        week: 1,
        teamId: game.homeTeamId,
        gameId: game.id,
        result: 'PENDING',
      },
      update: {
        teamId: game.homeTeamId,
        gameId: game.id,
        result: 'PENDING',
      },
    })

    console.log(`Created pick: ${game.homeTeam.name} for Week 1`)

    // Create or update game result where home team LOSES
    const gameResult = await prisma.gameResult.upsert({
      where: { gameId: game.id },
      create: {
        gameId: game.id,
        homeScore: 14,
        awayScore: 21, // Away team wins
        isFinal: true,
      },
      update: {
        homeScore: 14,
        awayScore: 21,
        isFinal: true,
      },
    })

    console.log(`\nSimulating game result: Away ${gameResult.awayScore}, Home ${gameResult.homeScore}`)
    console.log('Home team (picked team) LOSES\n')

    // Grade the pick
    const gradingService = new SurvivorGradingService()
    const result = await gradingService.gradeSurvivorPick(pick.id, {
      homeScore: gameResult.homeScore,
      awayScore: gameResult.awayScore,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
    })

    console.log('Grading Result:')
    console.log(`- Outcome: ${result.outcome}`)
    console.log(`- Eliminated: ${result.isEliminated}`)
    console.log(`- Strikes: ${result.strikesUsed}/${result.strikesAllowed}`)

    // Verify entry status
    const updatedEntry = await prisma.survivorEntry.findUnique({
      where: { id: entry.id },
    })

    console.log('\nEntry Status After Grading:')
    console.log(`- Active: ${updatedEntry?.isActive}`)
    console.log(`- Eliminated Week: ${updatedEntry?.eliminatedWeek || 'N/A'}`)
    console.log(`- Strikes: ${updatedEntry?.strikes}`)

    // Test with another entry that has strikes allowed
    console.log('\n--- Testing with strikes allowed ---')

    // Update pool rules to allow 1 strike
    await prisma.pool.update({
      where: { id: pool.id },
      data: {
        rules: {
          ...(pool.rules as any),
          survivor: {
            strikesAllowed: 1,
          },
        },
      },
    })

    // Create another entry
    const entry2 = await prisma.survivorEntry.create({
      data: {
        poolId: pool.id,
        userId: 'user-123',
        entryName: 'Test Entry with Strikes',
        isActive: true,
        strikes: 0,
      },
    })

    // Create a pick for this entry
    const pick2 = await prisma.survivorPick.create({
      data: {
        entryId: entry2.id,
        week: 1,
        teamId: game.homeTeamId,
        gameId: game.id,
        result: 'PENDING',
      },
    })

    // Grade this pick
    const result2 = await gradingService.gradeSurvivorPick(pick2.id, {
      homeScore: gameResult.homeScore,
      awayScore: gameResult.awayScore,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
    })

    console.log('\nGrading Result (with strikes allowed):')
    console.log(`- Outcome: ${result2.outcome}`)
    console.log(`- Eliminated: ${result2.isEliminated}`)
    console.log(`- Strikes: ${result2.strikesUsed}/${result2.strikesAllowed}`)

    const updatedEntry2 = await prisma.survivorEntry.findUnique({
      where: { id: entry2.id },
    })

    console.log('\nEntry Status After Grading (with strikes):')
    console.log(`- Active: ${updatedEntry2?.isActive}`)
    console.log(`- Eliminated Week: ${updatedEntry2?.eliminatedWeek || 'N/A'}`)
    console.log(`- Strikes: ${updatedEntry2?.strikes}`)

    console.log('\n✅ Test completed successfully!')
  } catch (error) {
    console.error('Test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testSurvivorElimination()