import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TestGame {
  season: number
  week: number
  kickoff: Date
  awayTeamAbbr: string
  homeTeamAbbr: string
  venue: string
}

const WEEK1_GAMES_2025: TestGame[] = [
  {
    season: 2025,
    week: 1,
    kickoff: new Date('2025-01-12T18:00:00.000Z'), // Sunday 1:00 PM ET
    awayTeamAbbr: 'BUF',
    homeTeamAbbr: 'KC',
    venue: 'GEHA Field at Arrowhead Stadium',
  },
  {
    season: 2025,
    week: 1,
    kickoff: new Date('2025-01-12T21:25:00.000Z'), // Sunday 4:25 PM ET
    awayTeamAbbr: 'DAL',
    homeTeamAbbr: 'PHI',
    venue: 'Lincoln Financial Field',
  },
  {
    season: 2025,
    week: 1,
    kickoff: new Date('2025-01-13T01:20:00.000Z'), // Sunday 8:20 PM ET
    awayTeamAbbr: 'SF',
    homeTeamAbbr: 'SEA',
    venue: 'Lumen Field',
  },
  {
    season: 2025,
    week: 1,
    kickoff: new Date('2025-01-14T02:15:00.000Z'), // Monday 9:15 PM ET
    awayTeamAbbr: 'NYJ',
    homeTeamAbbr: 'PIT',
    venue: 'Acrisure Stadium',
  },
]

async function addTestGames(games: TestGame[]) {
  console.log('🏈 Adding test games...')

  // Get team lookup map
  const teamLookup = new Map<string, string>()
  const allTeams = await prisma.team.findMany()
  allTeams.forEach((team) => {
    teamLookup.set(team.nflAbbr, team.id)
  })

  // Check for missing teams
  const missingTeams = games
    .flatMap(g => [g.homeTeamAbbr, g.awayTeamAbbr])
    .filter(abbr => !teamLookup.has(abbr))
    .filter((abbr, index, arr) => arr.indexOf(abbr) === index) // unique

  if (missingTeams.length > 0) {
    console.error(`❌ Missing teams: ${missingTeams.join(', ')}`)
    console.log('💡 Run "npm run db:seed" first to create all NFL teams')
    process.exit(1)
  }

  // Create games
  const createdGames = await Promise.all(
    games.map((game) => {
      const homeTeamId = teamLookup.get(game.homeTeamAbbr)!
      const awayTeamId = teamLookup.get(game.awayTeamAbbr)!

      return prisma.game.upsert({
        where: {
          season_week_homeTeamId_awayTeamId: {
            season: game.season,
            week: game.week,
            homeTeamId,
            awayTeamId,
          },
        },
        update: {
          kickoff: game.kickoff,
          venue: game.venue,
        },
        create: {
          season: game.season,
          week: game.week,
          kickoff: game.kickoff,
          homeTeamId,
          awayTeamId,
          venue: game.venue,
          status: 'SCHEDULED',
        },
      })
    })
  )

  console.log(`✅ Added/updated ${createdGames.length} test games`)
  
  // Display the games
  console.log('\n📋 Games created:')
  for (const game of createdGames) {
    const homeTeam = allTeams.find(t => t.id === game.homeTeamId)
    const awayTeam = allTeams.find(t => t.id === game.awayTeamId)
    console.log(
      `   ${awayTeam?.nflAbbr} @ ${homeTeam?.nflAbbr} - ${game.kickoff.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      })}`
    )
  }
}

async function main() {
  try {
    await addTestGames(WEEK1_GAMES_2025)
    console.log('\n🎉 Test games added successfully!')
  } catch (error) {
    console.error('❌ Error adding test games:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().finally(async () => {
    await prisma.$disconnect()
  })
}

export { addTestGames, WEEK1_GAMES_2025 }