import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check for survivor pools
  const survivorPools = await prisma.pool.findMany({
    where: { type: 'SURVIVOR' },
  })

  console.log('🏊 Survivor Pools:', survivorPools.length)
  survivorPools.forEach((pool) => {
    console.log(`   - ${pool.name} (ID: ${pool.id})`)
  })

  if (survivorPools.length === 0) {
    console.log('\n📝 No survivor pools found. Creating one...')

    // Create a survivor pool
    const pool = await prisma.pool.create({
      data: {
        name: '2025 NFL Survivor Pool',
        type: 'SURVIVOR',
        season: 2025,
        buyIn: 100,
        maxEntries: 3,
        description:
          'Last person standing wins! Pick one team per week, can only use each team once.',
        isActive: true,
        rules: {
          maxStrikes: 1,
          allowLatePicks: false,
          multiEntry: true,
          maxEntriesPerUser: 3,
          tiebreakerMethod: 'MARGIN_OF_VICTORY',
        },
      },
    })

    console.log(`✅ Created survivor pool: ${pool.name} (ID: ${pool.id})`)

    // Create some sample entries
    const entry = await prisma.survivorEntry.create({
      data: {
        poolId: pool.id,
        userId: null, // Anonymous for now
        entryName: 'Entry 1',
        isActive: true,
        strikes: 0,
      },
    })

    console.log(`✅ Created sample entry: ${entry.entryName}`)
  }

  // Check games have odds
  const gamesWithLines = await prisma.game.findMany({
    where: {
      week: { in: [1, 2] },
      lines: { some: {} },
    },
    include: { lines: true },
  })

  console.log(`\n📊 Games with betting lines: ${gamesWithLines.length}`)

  if (gamesWithLines.length === 0) {
    console.log(
      '   ⚠️  No games have betting lines. Survivor recommendations need odds data.'
    )
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
