import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ESPN_LINES = [
  // BUF @ KC
  {
    awayTeamAbbr: 'DAL',
    homeTeamAbbr: 'PHI',
    spread: -6.5,
    total: 46.5,
    moneylineHome: -290,
    moneylineAway: 240,
  },
  // SF @ SEA
  {
    awayTeamAbbr: 'SF',
    homeTeamAbbr: 'SEA',
    spread: 2.5,
    total: 45.5,
    moneylineHome: 120,
    moneylineAway: -140,
  },
  // KC @ LAC
  {
    awayTeamAbbr: 'KC',
    homeTeamAbbr: 'LAC',
    spread: 3.5,
    total: 45.5,
    moneylineHome: 155,
    moneylineAway: -185,
  },
  // CIN @ CLE
  {
    awayTeamAbbr: 'CIN',
    homeTeamAbbr: 'CLE',
    spread: 5.5,
    total: 46.5,
    moneylineHome: 225,
    moneylineAway: -275,
  },
]

async function addGeneralLines() {
  console.log('📈 Adding general ESPN betting lines...')

  // Get all games
  const games = await prisma.game.findMany({
    where: { season: 2025, week: 1 },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  })

  // Create general lines (poolId: null) for ESPN data
  const createdLines = []
  for (const espnLine of ESPN_LINES) {
    const game = games.find(
      (g) =>
        g.homeTeam.nflAbbr === espnLine.homeTeamAbbr &&
        g.awayTeam.nflAbbr === espnLine.awayTeamAbbr
    )

    if (!game) {
      console.warn(
        `⚠️ Could not find game: ${espnLine.awayTeamAbbr} @ ${espnLine.homeTeamAbbr}`
      )
      continue
    }

    // Create general ESPN line (poolId: null)
    const espnLineLine = await prisma.line.create({
      data: {
        gameId: game.id,
        poolId: null, // General ESPN line
        source: 'ESPN',
        spread: espnLine.spread,
        total: espnLine.total,
        moneylineHome: espnLine.moneylineHome,
        moneylineAway: espnLine.moneylineAway,
        isUserProvided: false,
        capturedAt: new Date(),
      },
    })

    createdLines.push(espnLineLine)
    console.log(
      `   ✅ ${espnLine.awayTeamAbbr} @ ${espnLine.homeTeamAbbr}: ${espnLine.homeTeamAbbr} ${espnLine.spread}`
    )
  }

  console.log(
    `\n✅ Created ${createdLines.length} general ESPN betting lines`
  )
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addGeneralLines()
    .catch((error) => {
      console.error('❌ Error adding general lines:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

export { addGeneralLines }