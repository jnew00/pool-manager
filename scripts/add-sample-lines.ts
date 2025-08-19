import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SAMPLE_LINES = [
  // BUF @ KC
  { awayTeamAbbr: 'BUF', homeTeamAbbr: 'KC', spread: -1.5, total: 48.5, moneylineHome: -110, moneylineAway: -110 },
  // DAL @ PHI
  { awayTeamAbbr: 'DAL', homeTeamAbbr: 'PHI', spread: -3.5, total: 51.0, moneylineHome: -175, moneylineAway: +145 },
  // SF @ SEA
  { awayTeamAbbr: 'SF', homeTeamAbbr: 'SEA', spread: -2.5, total: 46.5, moneylineHome: -135, moneylineAway: +115 },
  // NYJ @ PIT
  { awayTeamAbbr: 'NYJ', homeTeamAbbr: 'PIT', spread: -6.0, total: 43.5, moneylineHome: -260, moneylineAway: +210 },
]

async function addSampleLines() {
  console.log('📈 Adding sample betting lines...')

  // Get all games and teams
  const games = await prisma.game.findMany({
    where: { season: 2025, week: 1 },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  })

  const pools = await prisma.pool.findMany()
  const mainPool = pools.find(p => p.name === 'Main ATS Pool')

  if (!mainPool) {
    console.error('❌ Could not find Main ATS Pool')
    process.exit(1)
  }

  // Create lines for each game
  const createdLines = []
  for (const sampleLine of SAMPLE_LINES) {
    const game = games.find(g => 
      g.homeTeam.nflAbbr === sampleLine.homeTeamAbbr && 
      g.awayTeam.nflAbbr === sampleLine.awayTeamAbbr
    )

    if (!game) {
      console.warn(`⚠️ Could not find game: ${sampleLine.awayTeamAbbr} @ ${sampleLine.homeTeamAbbr}`)
      continue
    }

    // Create market line (from sportsbook)
    const marketLine = await prisma.line.create({
      data: {
        gameId: game.id,
        source: 'DraftKings',
        spread: sampleLine.spread,
        total: sampleLine.total,
        moneylineHome: sampleLine.moneylineHome,
        moneylineAway: sampleLine.moneylineAway,
        isUserProvided: false,
      },
    })

    // Create pool line (user-provided, slightly different)
    const poolLine = await prisma.line.create({
      data: {
        gameId: game.id,
        poolId: mainPool.id,
        source: 'Pool Admin',
        spread: sampleLine.spread + (Math.random() - 0.5), // Small variation
        total: sampleLine.total + (Math.random() - 0.5), // Small variation
        moneylineHome: sampleLine.moneylineHome,
        moneylineAway: sampleLine.moneylineAway,
        isUserProvided: true,
      },
    })

    createdLines.push(marketLine, poolLine)
    console.log(`   ✅ ${sampleLine.awayTeamAbbr} @ ${sampleLine.homeTeamAbbr}: ${sampleLine.homeTeamAbbr} ${sampleLine.spread}`)
  }

  console.log(`\n✅ Created ${createdLines.length} betting lines (${createdLines.length / 2} games × 2 sources each)`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addSampleLines()
    .catch(error => {
      console.error('❌ Error adding sample lines:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

export { addSampleLines }