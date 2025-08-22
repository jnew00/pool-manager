#!/usr/bin/env tsx

/**
 * Load NFL schedule from ESPN API
 * Fetches games for specified season/week and creates them in the database
 */

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { gameMatcherService } from '../src/features/uploads/services/game-matcher.service'

// Load environment variables
config()

const prisma = new PrismaClient()

interface EspnGame {
  id: string
  date: string
  season: {
    year: number
    type: number
  }
  week: {
    number: number
  }
  competitions: Array<{
    id: string
    competitors: Array<{
      id: string
      team: {
        abbreviation: string
        displayName: string
      }
      homeAway: 'home' | 'away'
    }>
    venue?: {
      fullName: string
    }
  }>
}

interface EspnApiResponse {
  events: EspnGame[]
  season: {
    year: number
    type: number
  }
  week: {
    number: number
  }
}

async function loadScheduleFromEspn(
  season: number = 2025,
  week: number = 1,
  seasonType: number = 2
) {
  console.log(
    `🏈 Loading Week ${week} schedule for ${season} season from ESPN...`
  )

  try {
    // Fetch schedule from ESPN API
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=${seasonType}&week=${week}`
    console.log(`📡 Fetching: ${url}`)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(
        `ESPN API request failed: ${response.status} ${response.statusText}`
      )
    }

    const data: EspnApiResponse = await response.json()

    if (!data.events || data.events.length === 0) {
      console.log(`ℹ️  No games found for Week ${week}`)
      return
    }

    console.log(`📊 Found ${data.events.length} games`)

    // Get all teams for fuzzy matching
    const teams = await prisma.team.findMany()

    // Track teams that couldn't be matched
    const unmatchedTeams = new Set<{ abbr: string; name: string }>()

    // Process each game
    const gamesToCreate = []

    for (const espnGame of data.events) {
      const competition = espnGame.competitions[0]
      const homeTeam = competition.competitors.find(
        (c) => c.homeAway === 'home'
      )
      const awayTeam = competition.competitors.find(
        (c) => c.homeAway === 'away'
      )

      if (!homeTeam || !awayTeam) {
        console.warn(`⚠️  Skipping game ${espnGame.id}: missing team data`)
        continue
      }

      // Use fuzzy matching to find teams
      const homeTeamMatch = teams.find((dbTeam) =>
        gameMatcherService['teamMatches'](
          dbTeam.nflAbbr,
          homeTeam.team.abbreviation
        )
      )
      const awayTeamMatch = teams.find((dbTeam) =>
        gameMatcherService['teamMatches'](
          dbTeam.nflAbbr,
          awayTeam.team.abbreviation
        )
      )

      if (!homeTeamMatch) {
        unmatchedTeams.add({
          abbr: homeTeam.team.abbreviation,
          name: homeTeam.team.displayName,
        })
      }
      if (!awayTeamMatch) {
        unmatchedTeams.add({
          abbr: awayTeam.team.abbreviation,
          name: awayTeam.team.displayName,
        })
      }

      // Only add game if both teams were matched
      if (homeTeamMatch && awayTeamMatch) {
        // Check if game already exists
        const existingGame = await prisma.game.findFirst({
          where: {
            season: season,
            week: week,
            homeTeamId: homeTeamMatch.id,
            awayTeamId: awayTeamMatch.id,
          },
        })

        if (existingGame) {
          console.log(
            `ℹ️  Game already exists: ${awayTeam.team.abbreviation} @ ${homeTeam.team.abbreviation} (${awayTeamMatch.nflAbbr} @ ${homeTeamMatch.nflAbbr})`
          )
          continue
        }

        gamesToCreate.push({
          season: season,
          week: week,
          kickoff: new Date(espnGame.date),
          homeTeamId: homeTeamMatch.id,
          awayTeamId: awayTeamMatch.id,
          venue: competition.venue?.fullName,
          status: 'SCHEDULED' as const,
          apiRefs: {
            espnId: espnGame.id,
            espnCompetitionId: competition.id,
          },
        })
      }
    }

    // Report unmatched teams
    if (unmatchedTeams.size > 0) {
      console.log(`\n⚠️  Unmatched teams (fuzzy matching failed):`)
      unmatchedTeams.forEach((team) => {
        console.log(`   - ${team.abbr}: ${team.name}`)
      })
      console.log(
        `\n💡 Check TEAM_MATCHING_GUIDE.md to add new variations to fuzzy matching`
      )
    }

    if (gamesToCreate.length === 0) {
      console.log(`ℹ️  No new games to create`)
      return
    }

    console.log(`\n📝 Creating ${gamesToCreate.length} games...`)

    // Create games in database
    const createdGames = await prisma.game.createMany({
      data: gamesToCreate,
    })

    console.log(
      `✅ Successfully created ${createdGames.count} games for Week ${week}`
    )

    // Display created games
    console.log(`\n🏈 Games created:`)
    for (const game of gamesToCreate) {
      const homeTeam = teams.find((t) => t.id === game.homeTeamId)
      const awayTeam = teams.find((t) => t.id === game.awayTeamId)
      const kickoffLocal = game.kickoff.toLocaleString()
      console.log(
        `   ${awayTeam?.nflAbbr} @ ${homeTeam?.nflAbbr} - ${kickoffLocal}`
      )
    }
  } catch (error) {
    console.error('❌ Failed to load schedule from ESPN:', error)
    throw error
  }
}

async function main() {
  const season = parseInt(process.argv[2] || '2025')
  const week = parseInt(process.argv[3] || '1')
  const seasonType = parseInt(process.argv[4] || '2') // 2 = regular season

  console.log(`🚀 Loading NFL schedule`)
  console.log(`   Season: ${season}`)
  console.log(`   Week: ${week}`)
  console.log(
    `   Type: ${seasonType === 1 ? 'Preseason' : seasonType === 2 ? 'Regular Season' : 'Postseason'}`
  )

  await loadScheduleFromEspn(season, week, seasonType)

  console.log(`\n🎉 Schedule loading completed!`)
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
