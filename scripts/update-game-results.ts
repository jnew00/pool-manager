#!/usr/bin/env tsx

import { prisma } from '@/lib/prisma'
import axios from 'axios'

interface ESPNGame {
  id: string
  competitions: Array<{
    competitors: Array<{
      homeAway: 'home' | 'away'
      team: {
        abbreviation: string
      }
      score: string
    }>
    status: {
      type: {
        completed: boolean
      }
    }
  }>
}

async function fetchESPNScores(week: number, season: number = 2025) {
  try {
    // ESPN API endpoint for NFL scores
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${week}&seasontype=2&season=${season}`

    const response = await axios.get(url)
    const games = response.data.events as ESPNGame[]

    const results = []
    for (const game of games) {
      const competition = game.competitions[0]
      if (competition.status.type.completed) {
        const home = competition.competitors.find((c) => c.homeAway === 'home')
        const away = competition.competitors.find((c) => c.homeAway === 'away')

        if (home && away) {
          results.push({
            homeTeam: home.team.abbreviation,
            awayTeam: away.team.abbreviation,
            homeScore: parseInt(home.score),
            awayScore: parseInt(away.score),
          })
        }
      }
    }

    return results
  } catch (error) {
    console.error('Error fetching ESPN scores:', error)
    return []
  }
}

async function updateGameResults(week: number = 1, season: number = 2025) {
  console.log(`Fetching game results for Week ${week}, Season ${season}...`)

  // Get ESPN scores
  const espnScores = await fetchESPNScores(week, season)
  console.log(`Found ${espnScores.length} completed games from ESPN`)

  if (espnScores.length === 0) {
    console.log('No completed games found. Try a different week or check if games are in progress.')
    return
  }

  // Match with our database games
  const games = await prisma.game.findMany({
    where: {
      week,
      season,
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      result: true,
    },
  })

  console.log(`Found ${games.length} games in database for Week ${week}`)

  let updated = 0
  let created = 0

  for (const score of espnScores) {
    // Find matching game in database
    const game = games.find(
      (g) =>
        g.homeTeam.nflAbbr === score.homeTeam &&
        g.awayTeam.nflAbbr === score.awayTeam
    )

    if (!game) {
      console.warn(`No matching game found for ${score.awayTeam} @ ${score.homeTeam}`)
      continue
    }

    // Update or create result
    if (game.result) {
      // Update existing result
      await prisma.result.update({
        where: { gameId: game.id },
        data: {
          homeScore: score.homeScore,
          awayScore: score.awayScore,
          status: 'FINAL',
        },
      })
      updated++
      console.log(
        `Updated: ${score.awayTeam} ${score.awayScore} - ${score.homeScore} ${score.homeTeam}`
      )
    } else {
      // Create new result
      await prisma.result.create({
        data: {
          gameId: game.id,
          homeScore: score.homeScore,
          awayScore: score.awayScore,
          status: 'FINAL',
        },
      })
      created++
      console.log(
        `Created: ${score.awayTeam} ${score.awayScore} - ${score.homeScore} ${score.homeTeam}`
      )
    }
  }

  console.log(`\nSummary:`)
  console.log(`- Results updated: ${updated}`)
  console.log(`- Results created: ${created}`)
  console.log(`- Total processed: ${updated + created}/${espnScores.length}`)

  // Show games still without results
  const gamesWithoutResults = await prisma.game.findMany({
    where: {
      week,
      season,
      result: null,
    },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  })

  if (gamesWithoutResults.length > 0) {
    console.log(`\nGames still without results (${gamesWithoutResults.length}):`)
    for (const game of gamesWithoutResults) {
      console.log(`- ${game.awayTeam.name} @ ${game.homeTeam.name}`)
    }
  }
}

// Main execution
async function main() {
  const week = parseInt(process.argv[2] || '1')
  const season = parseInt(process.argv[3] || '2025')

  console.log('NFL Game Results Updater')
  console.log('========================\n')

  try {
    await updateGameResults(week, season)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()