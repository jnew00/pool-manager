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
}