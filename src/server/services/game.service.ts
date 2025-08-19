import { prisma } from '@/lib/prisma'
import { BaseService } from './base.service'
import { ValidationError } from '@/lib/types/database'
import type { Game, GameStatus } from '@/lib/types/database'

export interface CreateGameData {
  season: number
  week: number
  homeTeamId: string
  awayTeamId: string
  kickoff: Date
  status?: GameStatus
  venue?: string
}

export interface GameWithTeams extends Game {
  homeTeam: {
    id: string
    nflAbbr: string
    name: string
  }
  awayTeam: {
    id: string
    nflAbbr: string
    name: string
  }
}

export class GameService extends BaseService {
  async createGame(data: CreateGameData): Promise<Game> {
    this.validateGameData(data)

    try {
      return await prisma.game.create({
        data,
      })
    } catch (error: any) {
      throw this.handlePrismaError(error)
    }
  }

  private validateGameData(data: CreateGameData): void {
    this.validateRequired(data.season, 'Season')
    this.validateRequired(data.week, 'Week')
    this.validateRequired(data.homeTeamId, 'Home team ID')
    this.validateRequired(data.awayTeamId, 'Away team ID')
    this.validateRequired(data.kickoff, 'Kickoff time')

    if (data.season < 1900 || data.season > 2100) {
      throw new ValidationError('Season must be a valid year', 'season')
    }

    if (data.week < 1 || data.week > 18) {
      throw new ValidationError('Week must be between 1 and 18', 'week')
    }

    if (data.homeTeamId === data.awayTeamId) {
      throw new ValidationError(
        'Home and away teams cannot be the same',
        'awayTeamId'
      )
    }
  }

  async getGameById(id: string): Promise<GameWithTeams | null> {
    return await prisma.game.findUnique({
      where: { id },
      include: {
        homeTeam: {
          select: {
            id: true,
            nflAbbr: true,
            name: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            nflAbbr: true,
            name: true,
          },
        },
      },
    })
  }

  async getGamesByWeek(week: number): Promise<GameWithTeams[]> {
    return await prisma.game.findMany({
      where: { week },
      include: {
        homeTeam: {
          select: {
            id: true,
            nflAbbr: true,
            name: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            nflAbbr: true,
            name: true,
          },
        },
      },
      orderBy: { kickoff: 'asc' },
    })
  }

  async getGamesBySeason(season: number): Promise<GameWithTeams[]> {
    return await prisma.game.findMany({
      where: { season },
      include: {
        homeTeam: {
          select: {
            id: true,
            nflAbbr: true,
            name: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            nflAbbr: true,
            name: true,
          },
        },
      },
      orderBy: [{ week: 'asc' }, { kickoff: 'asc' }],
    })
  }

  async getGamesBySeasonAndWeek(
    season: number,
    week: number
  ): Promise<GameWithTeams[]> {
    return await prisma.game.findMany({
      where: { season, week },
      include: {
        homeTeam: {
          select: {
            id: true,
            nflAbbr: true,
            name: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            nflAbbr: true,
            name: true,
          },
        },
      },
      orderBy: { kickoff: 'asc' },
    })
  }

  async updateGameStatus(id: string, status: GameStatus): Promise<Game> {
    this.validateRequired(id, 'Game ID')
    this.validateRequired(status, 'Game status')

    try {
      return await prisma.game.update({
        where: { id },
        data: { status },
      })
    } catch (error: any) {
      throw this.handlePrismaError(error)
    }
  }

  async createGamesFromOCR(
    gamesData: Array<{
      season: number
      week: number
      kickoff_et: string
      home_team: string
      away_team: string
      spread_for_home?: number | null
      total?: number | null
      moneyline_home?: number | null
      moneyline_away?: number | null
      source_label?: string | null
    }>,
    poolId?: string
  ) {
    const results = {
      gamesCreated: 0,
      gamesUpdated: 0,
      linesCreated: 0,
      errors: [] as string[],
    }

    for (const gameData of gamesData) {
      try {
        // Find teams by NFL abbreviation
        const homeTeam = await prisma.team.findUnique({
          where: { nflAbbr: gameData.home_team },
        })
        const awayTeam = await prisma.team.findUnique({
          where: { nflAbbr: gameData.away_team },
        })

        if (!homeTeam || !awayTeam) {
          results.errors.push(
            `Teams not found: ${gameData.away_team} @ ${gameData.home_team}`
          )
          continue
        }

        // Check if game already exists
        const existingGame = await prisma.game.findFirst({
          where: {
            season: gameData.season,
            week: gameData.week,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
          },
        })

        let game
        if (existingGame) {
          game = existingGame
          results.gamesUpdated++
        } else {
          // Create new game
          game = await prisma.game.create({
            data: {
              season: gameData.season,
              week: gameData.week,
              kickoff: new Date(gameData.kickoff_et),
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              status: 'SCHEDULED',
            },
          })
          results.gamesCreated++
        }

        // Create line data if we have betting information
        const hasLineData =
          gameData.spread_for_home !== null ||
          gameData.total !== null ||
          gameData.moneyline_home !== null ||
          gameData.moneyline_away !== null

        if (hasLineData) {
          await prisma.line.create({
            data: {
              gameId: game.id,
              poolId: poolId || null,
              source: gameData.source_label || 'OCR Upload',
              spread: gameData.spread_for_home,
              total: gameData.total,
              moneylineHome: gameData.moneyline_home,
              moneylineAway: gameData.moneyline_away,
              isUserProvided: true,
            },
          })
          results.linesCreated++
        }
      } catch (error) {
        results.errors.push(
          `Failed to process game ${gameData.away_team} @ ${gameData.home_team}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
        continue
      }
    }

    return results
  }
}
