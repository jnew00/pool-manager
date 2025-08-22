import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const totalGames = await prisma.game.count()
  const week1Games = await prisma.game.count({ where: { week: 1 } })
  const week2Games = await prisma.game.count({ where: { week: 2 } })
  const teams = await prisma.team.count()

  console.log('📊 Database Summary:')
  console.log(`   Teams: ${teams}`)
  console.log(`   Total games: ${totalGames}`)
  console.log(`   Week 1: ${week1Games} games`)
  console.log(`   Week 2: ${week2Games} games`)

  // Show some sample games
  const sampleGames = await prisma.game.findMany({
    where: { week: { in: [1, 2] } },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
    take: 5,
    orderBy: { kickoff: 'asc' },
  })

  console.log('\n🏈 Sample games:')
  for (const game of sampleGames) {
    console.log(
      `   Week ${game.week}: ${game.awayTeam.nflAbbr} @ ${game.homeTeam.nflAbbr} - ${new Date(game.kickoff).toLocaleDateString()}`
    )
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
