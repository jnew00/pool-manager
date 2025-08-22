import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Generate realistic spreads for NFL games
function generateSpread(): number {
  // Common NFL spreads: -14 to +14, typically in 0.5 increments
  const spreads = [
    -13.5, -10.5, -7.5, -6.5, -4.5, -3.5, -2.5, -1.5, 1.5, 2.5, 3.5, 4.5, 6.5,
    7.5, 10.5, 13.5,
  ]
  return spreads[Math.floor(Math.random() * spreads.length)]
}

function generateTotal(): number {
  // Common NFL totals: 38.5 to 52.5
  return 38.5 + Math.floor(Math.random() * 15) * 0.5
}

async function addPointsPlusLines() {
  console.log('📈 Adding betting lines for Points Plus testing...')

  // Get the Points Plus pool
  const pool = await prisma.pool.findFirst({
    where: { type: 'POINTS_PLUS' },
  })

  if (!pool) {
    console.error('❌ Could not find Points Plus pool')
    process.exit(1)
  }

  console.log(`Found pool: ${pool.name}`)

  // Get week 1 games for 2025 season
  const games = await prisma.game.findMany({
    where: { season: 2025, week: 1 },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  })

  console.log(`Found ${games.length} games for week 1`)

  const createdLines = []
  for (const game of games) {
    const spread = generateSpread()
    const total = generateTotal()

    // Create user-provided line for the pool
    const line = await prisma.line.create({
      data: {
        gameId: game.id,
        poolId: pool.id,
        source: 'user_provided',
        spread: spread,
        total: total,
        moneylineHome: spread < 0 ? -150 : 120,
        moneylineAway: spread < 0 ? 130 : -140,
        isUserProvided: true,
      },
    })

    createdLines.push(line)
    console.log(
      `   ✅ ${game.awayTeam.nflAbbr} @ ${game.homeTeam.nflAbbr}: ${game.homeTeam.nflAbbr} ${spread}`
    )
  }

  console.log(
    `\n✅ Created ${createdLines.length} betting lines for Points Plus pool`
  )
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addPointsPlusLines()
    .catch((error) => {
      console.error('❌ Error adding Points Plus lines:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

export { addPointsPlusLines }
