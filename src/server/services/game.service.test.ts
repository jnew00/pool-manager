import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { GameService } from './game.service'
import { DatabaseTestUtils } from '@/lib/test-utils/database'
import type { GameStatus } from '@/lib/types/database'

describe('GameService', () => {
  let gameService: GameService
  let homeTeamId: string
  let awayTeamId: string

  beforeEach(async () => {
    gameService = new GameService()

    // Create test teams using utilities
    const homeTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: 'TST',
      name: 'Test Home Team',
    })
    const awayTeam = await DatabaseTestUtils.createTestTeam({
      nflAbbr: 'DEV',
      name: 'Test Away Team',
    })

    homeTeamId = homeTeam.id
    awayTeamId = awayTeam.id
  })

  afterEach(async () => {
    // Clean up using utilities
    await DatabaseTestUtils.cleanupTestData()
  })

  describe('createGame', () => {
    it('should create a new game with valid data', async () => {
      const gameData = {
        season: 2024,
        week: 1,
        homeTeamId,
        awayTeamId,
        kickoff: new Date('2024-09-10T13:00:00Z'),
        status: 'SCHEDULED' as GameStatus,
      }

      const game = await gameService.createGame(gameData)

      expect(game).toBeDefined()
      expect(game.season).toBe(2024)
      expect(game.week).toBe(1)
      expect(game.homeTeamId).toBe(homeTeamId)
      expect(game.awayTeamId).toBe(awayTeamId)
      expect(game.status).toBe('SCHEDULED')
      expect(game.id).toBeDefined()
    })

    it('should throw error when creating game with same teams', async () => {
      const gameData = {
        season: 2024,
        week: 1,
        homeTeamId,
        awayTeamId: homeTeamId, // Same as home team
        kickoff: new Date('2024-09-10T13:00:00Z'),
        status: 'SCHEDULED' as GameStatus,
      }

      await expect(gameService.createGame(gameData)).rejects.toThrow(
        'Home and away teams cannot be the same'
      )
    })

    it('should validate required fields', async () => {
      const invalidGameData = {
        season: 2024,
        week: 0, // Invalid week
        homeTeamId: '',
        awayTeamId: '',
        kickoff: new Date(),
        status: 'SCHEDULED' as GameStatus,
      }

      await expect(gameService.createGame(invalidGameData)).rejects.toThrow()
    })
  })

  describe('getGameById', () => {
    it('should return game by ID with team relations', async () => {
      const gameData = {
        season: 2024,
        week: 1,
        homeTeamId,
        awayTeamId,
        kickoff: new Date('2024-09-10T13:00:00Z'),
        status: 'SCHEDULED' as GameStatus,
      }

      const createdGame = await gameService.createGame(gameData)
      const foundGame = await gameService.getGameById(createdGame.id)

      expect(foundGame).toBeDefined()
      expect(foundGame?.id).toBe(createdGame.id)
      expect(foundGame?.homeTeam).toBeDefined()
      expect(foundGame?.awayTeam).toBeDefined()
    })

    it('should return null for non-existent game', async () => {
      const game = await gameService.getGameById('non-existent-id')
      expect(game).toBeNull()
    })
  })

  describe('getGamesByWeek', () => {
    it('should return games for specific week', async () => {
      const gameData1 = {
        season: 2024,
        week: 1,
        homeTeamId,
        awayTeamId,
        kickoff: new Date('2024-09-10T13:00:00Z'),
        status: 'SCHEDULED' as GameStatus,
      }

      await gameService.createGame(gameData1)
      const games = await gameService.getGamesByWeek(1)

      expect(games.length).toBeGreaterThanOrEqual(1)
      expect(games[0].week).toBe(1)
    })
  })

  describe('updateGameStatus', () => {
    it('should update game status', async () => {
      const gameData = {
        season: 2024,
        week: 1,
        homeTeamId,
        awayTeamId,
        kickoff: new Date('2024-09-10T13:00:00Z'),
        status: 'SCHEDULED' as GameStatus,
      }

      const createdGame = await gameService.createGame(gameData)
      const updatedGame = await gameService.updateGameStatus(
        createdGame.id,
        'IN_PROGRESS'
      )

      expect(updatedGame.status).toBe('IN_PROGRESS')
    })

    it('should throw error when updating non-existent game', async () => {
      await expect(
        gameService.updateGameStatus('non-existent-id', 'COMPLETED')
      ).rejects.toThrow()
    })
  })
})