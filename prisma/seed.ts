import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const NFL_TEAMS = [
  { nflAbbr: 'ARI', name: 'Arizona Cardinals' },
  { nflAbbr: 'ATL', name: 'Atlanta Falcons' },
  { nflAbbr: 'BAL', name: 'Baltimore Ravens' },
  { nflAbbr: 'BUF', name: 'Buffalo Bills' },
  { nflAbbr: 'CAR', name: 'Carolina Panthers' },
  { nflAbbr: 'CHI', name: 'Chicago Bears' },
  { nflAbbr: 'CIN', name: 'Cincinnati Bengals' },
  { nflAbbr: 'CLE', name: 'Cleveland Browns' },
  { nflAbbr: 'DAL', name: 'Dallas Cowboys' },
  { nflAbbr: 'DEN', name: 'Denver Broncos' },
  { nflAbbr: 'DET', name: 'Detroit Lions' },
  { nflAbbr: 'GB', name: 'Green Bay Packers' },
  { nflAbbr: 'HOU', name: 'Houston Texans' },
  { nflAbbr: 'IND', name: 'Indianapolis Colts' },
  { nflAbbr: 'JAX', name: 'Jacksonville Jaguars' },
  { nflAbbr: 'KC', name: 'Kansas City Chiefs' },
  { nflAbbr: 'LVR', name: 'Las Vegas Raiders' },
  { nflAbbr: 'LAC', name: 'Los Angeles Chargers' },
  { nflAbbr: 'LAR', name: 'Los Angeles Rams' },
  { nflAbbr: 'MIA', name: 'Miami Dolphins' },
  { nflAbbr: 'MIN', name: 'Minnesota Vikings' },
  { nflAbbr: 'NE', name: 'New England Patriots' },
  { nflAbbr: 'NO', name: 'New Orleans Saints' },
  { nflAbbr: 'NYG', name: 'New York Giants' },
  { nflAbbr: 'NYJ', name: 'New York Jets' },
  { nflAbbr: 'PHI', name: 'Philadelphia Eagles' },
  { nflAbbr: 'PIT', name: 'Pittsburgh Steelers' },
  { nflAbbr: 'SEA', name: 'Seattle Seahawks' },
  { nflAbbr: 'SF', name: 'San Francisco 49ers' },
  { nflAbbr: 'TB', name: 'Tampa Bay Buccaneers' },
  { nflAbbr: 'TEN', name: 'Tennessee Titans' },
  { nflAbbr: 'WAS', name: 'Washington Commanders' },
]

const SAMPLE_POOLS = [
  {
    name: 'Main ATS Pool',
    type: 'ATS' as const,
    season: 2025,
    buyIn: 50,
    maxEntries: 3,
    rules: {
      pushHandling: 'refund',
      lockDeadline: 'kickoff',
    },
  },
  {
    name: 'Straight Up Pool',
    type: 'SU' as const,
    season: 2025,
    buyIn: 25,
    maxEntries: 2,
    rules: {
      pushHandling: 'refund',
      lockDeadline: 'kickoff',
    },
  },
  {
    name: 'Points Plus Challenge',
    type: 'POINTS_PLUS' as const,
    season: 2025,
    buyIn: 100,
    maxEntries: 1,
    rules: {
      minGames: 4,
      requireEqualFavUnderdogs: true,
      allowPickEm: false,
      pushHandling: 'void',
    },
  },
  {
    name: 'Survivor Pool',
    type: 'SURVIVOR' as const,
    season: 2025,
    buyIn: 20,
    maxEntries: 1,
    rules: {
      noRepeats: true,
      eliminationOnLoss: true,
    },
  },
]

const DEFAULT_MODEL_WEIGHTS = {
  name: 'Default v1',
  weights: {
    market_prob_weight: 0.5,
    elo_weight: 0.3,
    home_adv_weight: 0.07,
    rest_weight: 0.03,
    weather_penalty_weight: 0.07,
    injury_penalty_weight: 0.03,
    k_elo: 24,
    wind_threshold_mph: 15,
    precip_prob_threshold: 0.3,
    qb_out_penalty: 12,
    ol_cluster_penalty: 3,
    db_cluster_penalty: 3,
  },
}

const WEEK1_GAMES_2025 = [
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

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.grade.deleteMany()
  await prisma.pick.deleteMany()
  await prisma.entry.deleteMany()
  await prisma.result.deleteMany()
  await prisma.line.deleteMany()
  await prisma.game.deleteMany()
  await prisma.pool.deleteMany()
  await prisma.upload.deleteMany()
  await prisma.mappingProfile.deleteMany()
  await prisma.modelWeights.deleteMany()
  await prisma.team.deleteMany()

  // Seed NFL teams
  console.log('📊 Creating NFL teams...')
  const teams = await prisma.team.createMany({
    data: NFL_TEAMS,
  })
  console.log(`✅ Created ${teams.count} NFL teams`)

  // Get team IDs for game creation
  const teamLookup = new Map<string, string>()
  const allTeams = await prisma.team.findMany()
  allTeams.forEach((team) => {
    teamLookup.set(team.nflAbbr, team.id)
  })

  // Seed Week 1 games
  console.log('🏈 Creating Week 1 games...')
  const games = await Promise.all(
    WEEK1_GAMES_2025.map((game) => {
      const homeTeamId = teamLookup.get(game.homeTeamAbbr)
      const awayTeamId = teamLookup.get(game.awayTeamAbbr)
      
      if (!homeTeamId || !awayTeamId) {
        throw new Error(`Could not find team IDs for ${game.awayTeamAbbr} @ ${game.homeTeamAbbr}`)
      }

      return prisma.game.create({
        data: {
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
  console.log(`✅ Created ${games.length} Week 1 games`)

  // Seed sample pools
  console.log('🏊 Creating sample pools...')
  const pools = await Promise.all(
    SAMPLE_POOLS.map((pool) => prisma.pool.create({ data: pool }))
  )
  console.log(`✅ Created ${pools.length} sample pools`)

  // Seed default model weights
  console.log('⚖️ Creating default model weights...')
  const modelWeights = await prisma.modelWeights.create({
    data: DEFAULT_MODEL_WEIGHTS,
  })
  console.log(`✅ Created model weights: ${modelWeights.name}`)

  // Create sample mapping profile
  console.log('🗺️ Creating sample mapping profile...')
  const mappingProfile = await prisma.mappingProfile.create({
    data: {
      name: 'Standard NFL Lines CSV',
      columnMap: {
        date: 'Date',
        time: 'Time',
        away_team: 'Away',
        home_team: 'Home',
        spread: 'Spread',
        total: 'Total',
        moneyline_away: 'ML_Away',
        moneyline_home: 'ML_Home',
      },
    },
  })
  console.log(`✅ Created mapping profile: ${mappingProfile.name}`)

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })