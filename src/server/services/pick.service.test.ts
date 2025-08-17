import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PickService } from './pick.service'
import { EntryService } from './entry.service'
import { PoolService } from './pool.service'
import { TeamService } from './team.service'
import { GameService } from './game.service'
import { prisma } from '@/lib/prisma'

describe('PickService', () => {
  let pickService: PickService
  let entryService: EntryService
  let poolService: PoolService
  let teamService: TeamService
  let gameService: GameService
  let entryId: string
  let gameId: string
  let teamId: string

  beforeEach(async () => {
    pickService = new PickService()
    entryService = new EntryService()
    poolService = new PoolService()
    teamService = new TeamService()
    gameService = new GameService()

    // Create test pool
    const pool = await poolService.createPool({
      name: 'Test Pool for Picks',
      type: 'ATS',
      season: 2024,
      buyIn: 50.0,
      maxEntries: 100,
      isActive: true,
    })

    // Create test entry
    const entry = await entryService.createEntry({
      poolId: pool.id,
      season: 2024,
    })
    entryId = entry.id

    // Create test teams
    const homeTeam = await teamService.createTeam({
      nflAbbr: 'TST',
      name: 'Test Home Team',
    })
    const awayTeam = await teamService.createTeam({
      nflAbbr: 'DEV',
      name: 'Test Away Team',
    })
    teamId = homeTeam.id

    // Create test game
    const game = await gameService.createGame({
      season: 2024,
      week: 1,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      kickoff: new Date('2024-09-10T13:00:00Z'),
      status: 'SCHEDULED',
    })
    gameId = game.id
  })

  afterEach(async () => {
    // Clean up test data in reverse order
    await prisma.pick.deleteMany({
      where: { entryId },
    })
    await prisma.entry.deleteMany({
      where: { id: entryId },
    })
    await prisma.game.deleteMany({
      where: { id: gameId },
    })
    await prisma.team.deleteMany({
      where: {
        nflAbbr: {
          in: ['TST', 'DEV', 'TEST'],
        },
      },
    })
    await prisma.pool.deleteMany({
      where: {
        name: {
          startsWith: 'Test Pool',
        },
      },
    })
  })

  describe('createPick', () => {
    it('should create a new pick with valid data', async () => {
      const pickData = {
        entryId,
        gameId,
        teamId,
        confidence: 85,
      }

      const pick = await pickService.createPick(pickData)

      expect(pick).toBeDefined()
      expect(pick.entryId).toBe(entryId)
      expect(pick.gameId).toBe(gameId)
      expect(pick.teamId).toBe(teamId)
      expect(pick.confidence.toNumber()).toBe(85)
      expect(pick.id).toBeDefined()
    })

    it('should validate required fields', async () => {
      const invalidPickData = {
        entryId: '',
        gameId: '',
        teamId: '',
        confidence: -5,
      }

      await expect(pickService.createPick(invalidPickData)).rejects.toThrow()
    })
  })

  describe('getPickById', () => {
    it('should return pick by ID with relations', async () => {
      const pickData = {
        entryId,
        gameId,
        teamId,
        confidence: 75,
      }

      const createdPick = await pickService.createPick(pickData)
      const foundPick = await pickService.getPickById(createdPick.id)

      expect(foundPick).toBeDefined()
      expect(foundPick?.id).toBe(createdPick.id)
      expect(foundPick?.game).toBeDefined()
      expect(foundPick?.team).toBeDefined()
      expect(foundPick?.entry).toBeDefined()
    })

    it('should return null for non-existent pick', async () => {
      const pick = await pickService.getPickById('non-existent-id')
      expect(pick).toBeNull()
    })
  })

  describe('getPicksByEntry', () => {
    it('should return picks for specific entry', async () => {
      const pickData = {
        entryId,
        gameId,
        teamId,
        confidence: 65,
      }

      await pickService.createPick(pickData)
      const picks = await pickService.getPicksByEntry(entryId)

      expect(picks.length).toBe(1)
      expect(picks[0].entryId).toBe(entryId)
    })
  })

  describe('updatePick', () => {
    it('should update pick team', async () => {
      // Create another team to switch to
      const newTeam = await teamService.createTeam({
        nflAbbr: 'TEST',
        name: 'New Team',
      })

      const pickData = {
        entryId,
        gameId,
        teamId,
        confidence: 90,
      }

      const createdPick = await pickService.createPick(pickData)
      const updatedPick = await pickService.updatePick(createdPick.id, {
        teamId: newTeam.id,
      })

      expect(updatedPick.teamId).toBe(newTeam.id)
      expect(updatedPick.entryId).toBe(entryId) // Should remain unchanged

      // Clean up handled by afterEach
    })

    it('should throw error when updating non-existent pick', async () => {
      await expect(
        pickService.updatePick('non-existent-id', { teamId })
      ).rejects.toThrow()
    })
  })

  describe('deletePick', () => {
    it('should delete pick by ID', async () => {
      const pickData = {
        entryId,
        gameId,
        teamId,
        confidence: 55,
      }

      const createdPick = await pickService.createPick(pickData)
      const result = await pickService.deletePick(createdPick.id)

      expect(result).toBe(true)

      const deletedPick = await pickService.getPickById(createdPick.id)
      expect(deletedPick).toBeNull()
    })

    it('should return false when deleting non-existent pick', async () => {
      const result = await pickService.deletePick('non-existent-id')
      expect(result).toBe(false)
    })
  })
})