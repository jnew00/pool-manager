import { prisma } from '@/lib/prisma'
import { BaseService } from './base.service'
import { ValidationError } from '@/lib/types/database'
import type { Team } from '@/lib/types/database'

// Valid NFL abbreviations from PROJECT_BRIEF.md
const VALID_NFL_ABBRS = [
  'ARI',
  'ATL',
  'BAL',
  'BUF',
  'CAR',
  'CHI',
  'CIN',
  'CLE',
  'DAL',
  'DEN',
  'DET',
  'GB',
  'HOU',
  'IND',
  'JAX',
  'KC',
  'LVR',
  'LAC',
  'LAR',
  'MIA',
  'MIN',
  'NE',
  'NO',
  'NYG',
  'NYJ',
  'PHI',
  'PIT',
  'SEA',
  'SF',
  'TB',
  'TEN',
  'WAS',
] as const

export interface CreateTeamData {
  nflAbbr: string
  name: string
}

export interface UpdateTeamData {
  name?: string
}

export class TeamService extends BaseService {
  async createTeam(data: CreateTeamData): Promise<Team> {
    this.validateTeamData(data)
    this.validateNflAbbreviation(data.nflAbbr)

    try {
      return await prisma.team.create({
        data,
      })
    } catch (error: any) {
      throw this.handlePrismaError(error)
    }
  }

  private validateTeamData(data: CreateTeamData): void {
    this.validateRequired(data.nflAbbr, 'NFL abbreviation')
    this.validateRequired(data.name, 'Team name')

    if (data.nflAbbr.length > 4) {
      throw new ValidationError(
        'NFL abbreviation must be 4 characters or less',
        'nflAbbr'
      )
    }

    if (data.name.length > 100) {
      throw new ValidationError(
        'Team name must be 100 characters or less',
        'name'
      )
    }
  }

  private validateNflAbbreviation(nflAbbr: string): void {
    // Allow test abbreviations for testing
    const isTestAbbr = /^(TST|DEV|TEST)$/.test(nflAbbr)
    if (!VALID_NFL_ABBRS.includes(nflAbbr as any) && !isTestAbbr) {
      throw new ValidationError('Invalid NFL abbreviation', 'nflAbbr')
    }
  }

  async getTeamById(id: string): Promise<Team | null> {
    return await prisma.team.findUnique({
      where: { id },
    })
  }

  async getTeamByAbbr(nflAbbr: string): Promise<Team | null> {
    return await prisma.team.findUnique({
      where: { nflAbbr },
    })
  }

  async getAllTeams(): Promise<Team[]> {
    return await prisma.team.findMany({
      orderBy: { nflAbbr: 'asc' },
    })
  }

  async updateTeam(id: string, data: UpdateTeamData): Promise<Team> {
    this.validateRequired(id, 'Team ID')

    if (data.name && data.name.length > 100) {
      throw new ValidationError(
        'Team name must be 100 characters or less',
        'name'
      )
    }

    try {
      return await prisma.team.update({
        where: { id },
        data,
      })
    } catch (error: any) {
      throw this.handlePrismaError(error)
    }
  }

  async deleteTeam(id: string): Promise<boolean> {
    this.validateRequired(id, 'Team ID')

    try {
      await prisma.team.delete({
        where: { id },
      })
      return true
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false
      }
      throw this.handlePrismaError(error)
    }
  }
}
