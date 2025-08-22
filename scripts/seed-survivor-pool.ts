import { PrismaClient, PoolType, PickOutcome } from '@prisma/client'

const prisma = new PrismaClient()

async function seedSurvivorPool() {
  console.log('🌱 Seeding Survivor Pool data...')

  try {
    // Create a test Survivor pool
    const survivorPool = await prisma.pool.upsert({
      where: { name: 'Test Survivor Pool 2025' },
      update: {},
      create: {
        name: 'Test Survivor Pool 2025',
        type: PoolType.SURVIVOR,
        season: 2025,
        buyIn: 100,
        maxEntries: 1000,
        isActive: true,
        description: 'Test Survivor pool for development',
        rules: {
          strikesAllowed: 1,
          tiebreaker: 'marginOfVictory',
          buybackRules: {
            allowed: true,
            maxBuybacks: 1,
            buybackCost: 50,
            buybackDeadlineWeek: 8,
          },
          startWeek: 1,
          defaultPick: 'highestFavorite',
          tiesCountAs: 'loss',
        },
      },
    })

    console.log('✅ Created Survivor pool:', survivorPool.name)

    // Create test Survivor entries
    const testEntries = []
    for (let i = 1; i <= 5; i++) {
      const entry = await prisma.survivorEntry.create({
        data: {
          poolId: survivorPool.id,
          userId: `test-user-${i}`,
          entryName: `Entry ${i}`,
          strikes: 0,
          isActive: true,
        },
      })
      testEntries.push(entry)
      console.log(`✅ Created Survivor entry: ${entry.entryName}`)
    }

    // Get some games from week 1 to create test picks
    const week1Games = await prisma.game.findMany({
      where: {
        season: 2025,
        week: 1,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      take: 3,
    })

    if (week1Games.length > 0) {
      // Create picks for first 3 entries
      for (let i = 0; i < Math.min(3, testEntries.length); i++) {
        const entry = testEntries[i]
        const game = week1Games[i % week1Games.length]

        // Pick the home team for simplicity
        const pick = await prisma.survivorPick.create({
          data: {
            entryId: entry.id,
            week: 1,
            teamId: game.homeTeamId,
            gameId: game.id,
            result: null, // Game not yet played
            marginOfVictory: null,
            lockedAt: new Date(),
          },
        })

        console.log(
          `✅ Created pick for ${entry.entryName}: ${game.homeTeam.nflAbbr} in Week 1`
        )
      }

      // Create sample week data
      const weekData = await prisma.survivorWeekData.create({
        data: {
          poolId: survivorPool.id,
          week: 1,
          totalEntries: 5,
          survivingEntries: 5,
          publicPickData: {
            KC: 25.5,
            BUF: 18.2,
            SF: 15.7,
            PHI: 12.3,
            DAL: 8.9,
            CIN: 6.4,
            BAL: 5.2,
            other: 7.8,
          },
        },
      })

      console.log('✅ Created Survivor week data for Week 1')
    }

    // Create a second pool with strikes/elimination data for testing
    const eliminationPool = await prisma.pool.upsert({
      where: { name: 'Test Elimination Pool 2025' },
      update: {},
      create: {
        name: 'Test Elimination Pool 2025',
        type: PoolType.SURVIVOR,
        season: 2025,
        buyIn: 50,
        maxEntries: 500,
        isActive: true,
        description: 'Test pool with eliminations',
        rules: {
          strikesAllowed: 0,
          tiebreaker: 'fewestStrikes',
          buybackRules: {
            allowed: false,
          },
          startWeek: 1,
          defaultPick: null,
          tiesCountAs: 'loss',
        },
      },
    })

    // Create entries with various states
    const eliminatedEntry = await prisma.survivorEntry.create({
      data: {
        poolId: eliminationPool.id,
        userId: 'eliminated-user',
        entryName: 'Eliminated Entry',
        eliminatedWeek: 3,
        strikes: 0,
        isActive: false,
      },
    })

    const activeWithStrike = await prisma.survivorEntry.create({
      data: {
        poolId: eliminationPool.id,
        userId: 'strike-user',
        entryName: 'Entry with Strike',
        eliminatedWeek: null,
        strikes: 1,
        isActive: true,
      },
    })

    console.log('✅ Created elimination test data')

    console.log('\n🎉 Survivor pool seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding Survivor pool:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedSurvivorPool().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
