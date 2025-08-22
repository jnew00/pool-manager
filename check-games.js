import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkGames() {
  try {
    // Check games for week 1, 2025
    const games = await prisma.game.findMany({
      where: {
        week: 1,
        season: 2025,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        lines: {
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        kickoff: 'asc',
      },
    })
    console.log('Games found for Week 1, 2025:', games.length)

    if (games.length === 0) {
      // Check what weeks/seasons we have
      const allGames = await prisma.game.findMany({
        select: {
          season: true,
          week: true,
        },
        distinct: ['season', 'week'],
        orderBy: [{ season: 'desc' }, { week: 'asc' }],
      })
      console.log('Available season/week combinations:', allGames)
    } else {
      console.log('First game sample:', {
        id: games[0].id,
        homeTeam: games[0].homeTeam.name,
        awayTeam: games[0].awayTeam.name,
        kickoff: games[0].kickoff,
        lines: games[0].lines.length,
      })
    }

    // Also check teams
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        nflAbbr: true,
      },
      take: 5,
    })
    console.log('Sample teams in database:', teams)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkGames()
