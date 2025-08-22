import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Realistic NFL spreads based on actual Week 1 2025 matchups and 2024 season patterns
const REALISTIC_LINES = [
  // Strong favorites (7+ point spreads)
  { awayTeam: 'DAL', homeTeam: 'PHI', spread: -7.5, total: 47.5 }, // Eagles strong at home vs Cowboys
  { awayTeam: 'ARI', homeTeam: 'NO', spread: -9.5, total: 44.5 }, // Saints much better than Cardinals
  { awayTeam: 'TB', homeTeam: 'ATL', spread: -6.5, total: 48.5 }, // Falcons improved, Bucs declining

  // Moderate favorites (3.5-6.5 point spreads)
  { awayTeam: 'KC', homeTeam: 'LAC', spread: -4.5, total: 46.5 }, // Chargers home vs Chiefs
  { awayTeam: 'CIN', homeTeam: 'CLE', spread: -3.5, total: 43.5 }, // Browns home vs Bengals rivalry
  { awayTeam: 'MIA', homeTeam: 'IND', spread: -4.5, total: 45.5 }, // Colts home advantage
  { awayTeam: 'PIT', homeTeam: 'NYJ', spread: -3.5, total: 41.5 }, // Jets home vs Steelers
  { awayTeam: 'NYG', homeTeam: 'WAS', spread: -5.5, total: 44.5 }, // Commanders improved vs Giants
  { awayTeam: 'HOU', homeTeam: 'LAR', spread: -6.5, total: 47.5 }, // Rams home vs Texans
  { awayTeam: 'BAL', homeTeam: 'BUF', spread: -4.5, total: 46.5 }, // Bills home vs Ravens

  // Close games (1.5-3 point spreads)
  { awayTeam: 'LVR', homeTeam: 'NE', spread: -2.5, total: 40.5 }, // Patriots home vs Raiders
  { awayTeam: 'CAR', homeTeam: 'JAX', spread: -1.5, total: 42.5 }, // Jaguars slight home favorite
  { awayTeam: 'TEN', homeTeam: 'DEN', spread: -3.5, total: 41.5 }, // Broncos home vs Titans
  { awayTeam: 'SF', homeTeam: 'SEA', spread: -2.5, total: 45.5 }, // Seahawks home vs 49ers rivalry
  { awayTeam: 'DET', homeTeam: 'GB', spread: -1.5, total: 49.5 }, // Packers home vs Lions
  { awayTeam: 'MIN', homeTeam: 'CHI', spread: -2.5, total: 44.5 }, // Bears home vs Vikings
]

async function addRealisticLines() {
  console.log('📈 Adding realistic NFL betting lines for Points Plus pool...')

  // Get the Points Plus pool
  const pool = await prisma.pool.findFirst({
    where: { type: 'POINTS_PLUS' },
  })

  if (!pool) {
    console.error('❌ Could not find Points Plus pool')
    process.exit(1)
  }

  console.log(`Found pool: ${pool.name}`)

  let linesCreated = 0

  for (const lineData of REALISTIC_LINES) {
    // Find the game
    const game = await prisma.game.findFirst({
      where: {
        season: 2025,
        week: 1,
        homeTeam: { nflAbbr: lineData.homeTeam },
        awayTeam: { nflAbbr: lineData.awayTeam },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })

    if (!game) {
      // Try reverse (away/home swapped)
      const reverseGame = await prisma.game.findFirst({
        where: {
          season: 2025,
          week: 1,
          homeTeam: { nflAbbr: lineData.awayTeam },
          awayTeam: { nflAbbr: lineData.homeTeam },
        },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      })

      if (!reverseGame) {
        console.warn(
          `⚠️ Could not find game: ${lineData.awayTeam} @ ${lineData.homeTeam}`
        )
        continue
      }

      // Create line with reversed spread
      const line = await prisma.line.create({
        data: {
          gameId: reverseGame.id,
          poolId: pool.id,
          source: 'DraftKings',
          spread: -lineData.spread, // Reverse the spread
          total: lineData.total,
          moneylineHome: lineData.spread > 0 ? -150 : 130,
          moneylineAway: lineData.spread > 0 ? 120 : -160,
          isUserProvided: true,
        },
      })

      linesCreated++
      console.log(
        `   ✅ ${reverseGame.awayTeam.nflAbbr} @ ${reverseGame.homeTeam.nflAbbr}: ${reverseGame.homeTeam.nflAbbr} ${line.spread}`
      )
      continue
    }

    // Create line as specified
    const line = await prisma.line.create({
      data: {
        gameId: game.id,
        poolId: pool.id,
        source: 'DraftKings',
        spread: lineData.spread,
        total: lineData.total,
        moneylineHome: lineData.spread < 0 ? -150 : 120,
        moneylineAway: lineData.spread < 0 ? 130 : -140,
        isUserProvided: true,
      },
    })

    linesCreated++
    console.log(
      `   ✅ ${game.awayTeam.nflAbbr} @ ${game.homeTeam.nflAbbr}: ${game.homeTeam.nflAbbr} ${line.spread}`
    )
  }

  console.log(
    `\n✅ Created ${linesCreated} realistic betting lines for Points Plus pool`
  )
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addRealisticLines()
    .catch((error) => {
      console.error('❌ Error adding realistic lines:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

export { addRealisticLines }
