import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { TeamService } from './team.service'
import { prisma } from '@/lib/prisma'

describe('TeamService', () => {
  let teamService: TeamService

  beforeEach(() => {
    teamService = new TeamService()
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.team.deleteMany({
      where: {
        nflAbbr: {
          in: ['TST', 'DEV'],
        },
      },
    })
  })

  describe('createTeam', () => {
    it('should create a new team with valid data', async () => {
      const teamData = {
        nflAbbr: 'TST',
        name: 'Test Team',
      }

      const team = await teamService.createTeam(teamData)

      expect(team).toBeDefined()
      expect(team.nflAbbr).toBe('TST')
      expect(team.name).toBe('Test Team')
      expect(team.id).toBeDefined()
    })

    it('should throw error when creating team with duplicate nflAbbr', async () => {
      const teamData = {
        nflAbbr: 'TST',
        name: 'Test Team',
      }

      await teamService.createTeam(teamData)

      await expect(teamService.createTeam(teamData)).rejects.toThrow()
    })

    it('should validate NFL abbreviation format', async () => {
      const invalidTeamData = {
        nflAbbr: 'XXX',
        name: 'Invalid Team',
      }

      await expect(teamService.createTeam(invalidTeamData)).rejects.toThrow(
        'Invalid NFL abbreviation'
      )
    })
  })

  describe('getTeamById', () => {
    it('should return team by ID', async () => {
      const teamData = {
        nflAbbr: 'TST',
        name: 'Test Team',
      }

      const createdTeam = await teamService.createTeam(teamData)
      const foundTeam = await teamService.getTeamById(createdTeam.id)

      expect(foundTeam).toBeDefined()
      expect(foundTeam?.id).toBe(createdTeam.id)
      expect(foundTeam?.nflAbbr).toBe('TST')
    })

    it('should return null for non-existent team', async () => {
      const nonExistentId = 'non-existent-id'
      const team = await teamService.getTeamById(nonExistentId)

      expect(team).toBeNull()
    })
  })

  describe('getTeamByAbbr', () => {
    it('should return team by NFL abbreviation', async () => {
      const teamData = {
        nflAbbr: 'TST',
        name: 'Test Team',
      }

      await teamService.createTeam(teamData)
      const foundTeam = await teamService.getTeamByAbbr('TST')

      expect(foundTeam).toBeDefined()
      expect(foundTeam?.nflAbbr).toBe('TST')
      expect(foundTeam?.name).toBe('Test Team')
    })

    it('should return null for non-existent abbreviation', async () => {
      const team = await teamService.getTeamByAbbr('XXX')
      expect(team).toBeNull()
    })
  })

  describe('getAllTeams', () => {
    it('should return all teams', async () => {
      // Create test teams
      await teamService.createTeam({ nflAbbr: 'TST', name: 'Test Team 1' })
      await teamService.createTeam({ nflAbbr: 'DEV', name: 'Test Team 2' })

      const teams = await teamService.getAllTeams()

      expect(teams.length).toBeGreaterThanOrEqual(2)
      const testTeams = teams.filter((t) => ['TST', 'DEV'].includes(t.nflAbbr))
      expect(testTeams).toHaveLength(2)
    })
  })

  describe('updateTeam', () => {
    it('should update team name', async () => {
      const teamData = {
        nflAbbr: 'TST',
        name: 'Test Team',
      }

      const createdTeam = await teamService.createTeam(teamData)
      const updatedTeam = await teamService.updateTeam(createdTeam.id, {
        name: 'Updated Test Team',
      })

      expect(updatedTeam.name).toBe('Updated Test Team')
      expect(updatedTeam.nflAbbr).toBe('TST') // Should remain unchanged
    })

    it('should throw error when updating non-existent team', async () => {
      await expect(
        teamService.updateTeam('non-existent-id', { name: 'New Name' })
      ).rejects.toThrow()
    })
  })

  describe('deleteTeam', () => {
    it('should delete team by ID', async () => {
      const teamData = {
        nflAbbr: 'TST',
        name: 'Test Team',
      }

      const createdTeam = await teamService.createTeam(teamData)
      const result = await teamService.deleteTeam(createdTeam.id)

      expect(result).toBe(true)

      const deletedTeam = await teamService.getTeamById(createdTeam.id)
      expect(deletedTeam).toBeNull()
    })

    it('should return false when deleting non-existent team', async () => {
      const result = await teamService.deleteTeam('non-existent-id')
      expect(result).toBe(false)
    })
  })
})
