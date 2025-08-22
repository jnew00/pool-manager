#!/usr/bin/env tsx

/**
 * Script to create a test Survivor pool
 * Run with: npx tsx scripts/create-survivor-pool.ts
 */

import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Creating test Survivor pool...')

  try {
    // Create Survivor pool
    const pool = await prisma.pool.create({
      data: {
        name: 'NFL Survivor Pool 2024',
        type: 'SURVIVOR',
        season: 2024,
        buyIn: 100,
        maxEntries: 3,
        isActive: true,
        description: 'Test Survivor pool with all features enabled',
        rules: {
          strikesAllowed: 2,
          buybackAvailable: true,
          buybackCost: 50,
          buybackDeadline: 8,
          tiebreakerMethods: [
            'CUMULATIVE_MOV',
            'UNUSED_RECORD',
            'FEWEST_STRIKES',
          ],
          maxEntriesPerUser: 3,
          playoffReset: true,
          autoGrade: true,
          requirePayment: false,
          publicPicks: true,
          showStandings: true,
        },
      },
    })

    console.log('Survivor pool created:', pool.id)

    // Create a Survivor entry for the pool
    const entry = await prisma.survivorEntry.create({
      data: {
        poolId: pool.id,
        userId: 'test-user',
        entryName: 'Entry 1',
        strikes: 0,
      },
    })

    console.log('Survivor entry created:', entry.id)

    // Create some sample teams if they don't exist
    const teams = [
      { nflAbbr: 'KC', name: 'Kansas City Chiefs' },
      { nflAbbr: 'BUF', name: 'Buffalo Bills' },
      { nflAbbr: 'PHI', name: 'Philadelphia Eagles' },
      { nflAbbr: 'SF', name: 'San Francisco 49ers' },
      { nflAbbr: 'DAL', name: 'Dallas Cowboys' },
      { nflAbbr: 'MIA', name: 'Miami Dolphins' },
      { nflAbbr: 'BAL', name: 'Baltimore Ravens' },
      { nflAbbr: 'DET', name: 'Detroit Lions' },
    ]

    for (const team of teams) {
      await prisma.team.upsert({
        where: { nflAbbr: team.nflAbbr },
        update: {},
        create: team,
      })
    }

    console.log('Sample teams created/verified')

    // Get all teams to use their IDs
    const allTeams = await prisma.team.findMany()
    const teamMap = new Map(allTeams.map((t) => [t.nflAbbr, t.id]))

    // Create some sample games for week 1
    const week1Games = [
      {
        homeTeam: 'KC',
        awayTeam: 'BUF',
      },
      {
        homeTeam: 'PHI',
        awayTeam: 'SF',
      },
      {
        homeTeam: 'DAL',
        awayTeam: 'MIA',
      },
      {
        homeTeam: 'BAL',
        awayTeam: 'DET',
      },
    ]

    for (const gameData of week1Games) {
      const homeTeamId = teamMap.get(gameData.homeTeam)
      const awayTeamId = teamMap.get(gameData.awayTeam)

      if (homeTeamId && awayTeamId) {
        await prisma.game.create({
          data: {
            season: 2024,
            week: 1,
            kickoff: new Date('2024-09-08T13:00:00Z'),
            homeTeamId,
            awayTeamId,
          },
        })
      }
    }

    console.log('Sample games created for week 1')

    console.log('\n✅ Survivor pool setup complete!')
    console.log(`\nPool ID: ${pool.id}`)
    console.log(`Navigate to: /pools/${pool.id}`)
    console.log('(You should be redirected to /survivor/${pool.id})')
  } catch (error) {
    console.error('Error creating Survivor pool:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
