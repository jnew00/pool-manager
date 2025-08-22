import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyData() {
  console.log('🔍 Verifying database data...\n')

  // Check teams
  const teamCount = await prisma.team.count()
  console.log(`📊 Teams: ${teamCount} total`)

  // Check games
  const gameCount = await prisma.game.count()
  const week1Games = await prisma.game.findMany({
    where: { season: 2025, week: 1 },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: { kickoff: 'asc' },
  })

  console.log(
    `🏈 Games: ${gameCount} total, ${week1Games.length} in Week 1 of 2025\n`
  )

  if (week1Games.length > 0) {
    console.log('📋 Week 1 Games:')
    week1Games.forEach((game, index) => {
      const kickoffLocal = game.kickoff.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      })
      console.log(
        `   ${index + 1}. ${game.awayTeam.nflAbbr} @ ${game.homeTeam.nflAbbr} - ${kickoffLocal}`
      )
      console.log(`      ${game.venue}`)
    })
  }

  // Check pools
  const poolCount = await prisma.pool.count()
  const pools = await prisma.pool.findMany({
    select: { name: true, type: true, buyIn: true, season: true },
  })

  console.log(`\n🏊 Pools: ${poolCount} total`)
  pools.forEach((pool) => {
    console.log(
      `   - ${pool.name} (${pool.type}, $${pool.buyIn}, Season ${pool.season})`
    )
  })

  // Check model weights
  const weightCount = await prisma.modelWeights.count()
  console.log(`\n⚖️ Model weights: ${weightCount} configurations`)

  console.log('\n✅ Database verification complete!')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyData()
    .catch((error) => {
      console.error('❌ Error verifying data:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
