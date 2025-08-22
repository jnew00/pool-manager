import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎯 Setting up odds for Survivor pool...')

  // Check pools
  const pools = await prisma.pool.findMany()
  console.log('\n📊 Available pools:')
  pools.forEach((pool) => {
    console.log(`   - ${pool.name} (${pool.type}) - ID: ${pool.id}`)
  })

  // Get survivor pool
  const survivorPool = pools.find((p) => p.type === 'SURVIVOR')
  if (!survivorPool) {
    console.error('❌ No survivor pool found!')
    return
  }

  // Get games for weeks 1 and 2
  const games = await prisma.game.findMany({
    where: {
      season: 2025,
      week: { in: [1, 2] },
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      lines: true,
    },
    orderBy: [{ week: 'asc' }, { kickoff: 'asc' }],
  })

  console.log(`\n🏈 Found ${games.length} games for weeks 1-2`)

  // Add betting lines for games that don't have them
  let linesAdded = 0

  for (const game of games) {
    // Check if this game already has lines for survivor pool
    const existingLine = game.lines.find((l) => l.poolId === survivorPool.id)

    if (!existingLine) {
      // Generate realistic spread based on team strengths
      // For simplicity, we'll use random but realistic spreads
      const isFavoriteHome = Math.random() > 0.45 // Slight home advantage
      const spreadMagnitude = Math.floor(Math.random() * 14) + 1 // 1-14 point spread
      const spread = isFavoriteHome ? -spreadMagnitude : spreadMagnitude
      const total = Math.floor(Math.random() * 15) + 38 // Total between 38-52

      // Calculate moneylines based on spread
      let moneylineHome: number
      let moneylineAway: number

      if (spread < -7) {
        moneylineHome = -300 + spread * 20
        moneylineAway = 250 + spread * -15
      } else if (spread < -3.5) {
        moneylineHome = -200 + spread * 15
        moneylineAway = 170 + spread * -12
      } else if (spread < 0) {
        moneylineHome = -150 + spread * 10
        moneylineAway = 130 + spread * -8
      } else if (spread < 3.5) {
        moneylineHome = 130 + spread * 8
        moneylineAway = -150 + spread * -10
      } else if (spread < 7) {
        moneylineHome = 170 + spread * 12
        moneylineAway = -200 + spread * -15
      } else {
        moneylineHome = 250 + spread * 15
        moneylineAway = -300 + spread * -20
      }

      const line = await prisma.line.create({
        data: {
          gameId: game.id,
          poolId: survivorPool.id,
          source: 'System Generated',
          spread,
          total,
          moneylineHome: Math.round(moneylineHome),
          moneylineAway: Math.round(moneylineAway),
          isUserProvided: false,
        },
      })

      linesAdded++
      console.log(
        `   ✅ Week ${game.week}: ${game.awayTeam.nflAbbr} @ ${game.homeTeam.nflAbbr} - Line: ${game.homeTeam.nflAbbr} ${spread}`
      )
    }
  }

  console.log(`\n✅ Added ${linesAdded} betting lines for Survivor pool`)

  // Check survivor entries
  const entries = await prisma.survivorEntry.count({
    where: { poolId: survivorPool.id },
  })

  console.log(`\n📋 Survivor pool has ${entries} entries`)

  if (entries === 0) {
    console.log('Creating sample entry...')
    const entry = await prisma.survivorEntry.create({
      data: {
        poolId: survivorPool.id,
        userId: null,
        entryName: 'Sample Entry 1',
        isActive: true,
        strikes: 0,
      },
    })
    console.log(`✅ Created entry: ${entry.entryName}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
