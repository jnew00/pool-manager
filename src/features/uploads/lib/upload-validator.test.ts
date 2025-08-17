import { describe, it, expect } from 'vitest'
import { UploadValidator, type ValidationResult, type GameData } from './upload-validator'

describe('UploadValidator', () => {
  const validator = new UploadValidator()

  describe('validateGameData', () => {
    it('should validate valid game data', () => {
      const gameData: GameData = {
        season: 2024,
        week: 1,
        date: '2024-09-08',
        time: '13:00',
        away_team: 'BUF',
        home_team: 'LAR',
        spread: '-2.5',
        total: '47.5'
      }

      const result = validator.validateGameData(gameData)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate NFL team abbreviations', () => {
      const gameData: GameData = {
        season: 2024,
        week: 1,
        date: '2024-09-08',
        time: '13:00',
        away_team: 'INVALID',
        home_team: 'LAR',
        spread: '-2.5',
        total: '47.5'
      }

      const result = validator.validateGameData(gameData)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid away team: INVALID')
    })

    it('should validate season year range', () => {
      const gameData: GameData = {
        season: 1999,
        week: 1,
        date: '1999-09-08',
        time: '13:00',
        away_team: 'BUF',
        home_team: 'LAR',
        spread: '-2.5',
        total: '47.5'
      }

      const result = validator.validateGameData(gameData)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Season must be between 2000 and 2050')
    })

    it('should validate week number range', () => {
      const gameData: GameData = {
        season: 2024,
        week: 25,
        date: '2024-09-08',
        time: '13:00',
        away_team: 'BUF',
        home_team: 'LAR',
        spread: '-2.5',
        total: '47.5'
      }

      const result = validator.validateGameData(gameData)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Week must be between 1 and 22')
    })

    it('should validate date format', () => {
      const gameData: GameData = {
        season: 2024,
        week: 1,
        date: '09/08/2024', // Wrong format
        time: '13:00',
        away_team: 'BUF',
        home_team: 'LAR',
        spread: '-2.5',
        total: '47.5'
      }

      const result = validator.validateGameData(gameData)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid date format. Expected YYYY-MM-DD')
    })

    it('should validate time format', () => {
      const gameData: GameData = {
        season: 2024,
        week: 1,
        date: '2024-09-08',
        time: '1:00 PM', // Wrong format
        away_team: 'BUF',
        home_team: 'LAR',
        spread: '-2.5',
        total: '47.5'
      }

      const result = validator.validateGameData(gameData)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid time format. Expected HH:MM (24-hour)')
    })

    it('should validate spread is numeric', () => {
      const gameData: GameData = {
        season: 2024,
        week: 1,
        date: '2024-09-08',
        time: '13:00',
        away_team: 'BUF',
        home_team: 'LAR',
        spread: 'Pick', // Not numeric
        total: '47.5'
      }

      const result = validator.validateGameData(gameData)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Spread must be a number')
    })

    it('should allow optional fields to be empty', () => {
      const gameData: GameData = {
        season: 2024,
        week: 1,
        date: '2024-09-08',
        time: '13:00',
        away_team: 'BUF',
        home_team: 'LAR',
        spread: '',
        total: ''
      }

      const result = validator.validateGameData(gameData)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect duplicate matchups', () => {
      const gameData: GameData = {
        season: 2024,
        week: 1,
        date: '2024-09-08',
        time: '13:00',
        away_team: 'BUF',
        home_team: 'BUF', // Same team
        spread: '-2.5',
        total: '47.5'
      }

      const result = validator.validateGameData(gameData)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Home and away teams cannot be the same')
    })
  })

  describe('validateBatch', () => {
    it('should validate multiple games and return results', () => {
      const games: GameData[] = [
        {
          season: 2024,
          week: 1,
          date: '2024-09-08',
          time: '13:00',
          away_team: 'BUF',
          home_team: 'LAR',
          spread: '-2.5',
          total: '47.5'
        },
        {
          season: 2024,
          week: 1,
          date: '2024-09-08',
          time: '16:30',
          away_team: 'INVALID',
          home_team: 'NE',
          spread: '3',
          total: '42'
        }
      ]

      const results = validator.validateBatch(games)
      
      expect(results).toHaveLength(2)
      expect(results[0].valid).toBe(true)
      expect(results[1].valid).toBe(false)
      expect(results[1].errors).toContain('Invalid away team: INVALID')
    })

    it('should check for duplicate games in batch', () => {
      const games: GameData[] = [
        {
          season: 2024,
          week: 1,
          date: '2024-09-08',
          time: '13:00',
          away_team: 'BUF',
          home_team: 'LAR',
          spread: '-2.5',
          total: '47.5'
        },
        {
          season: 2024,
          week: 1,
          date: '2024-09-08',
          time: '13:00',
          away_team: 'BUF',
          home_team: 'LAR', // Duplicate
          spread: '-3',
          total: '48'
        }
      ]

      const results = validator.validateBatch(games)
      
      expect(results[1].warnings).toContain('Duplicate game: BUF @ LAR on 2024-09-08')
    })
  })

  describe('getSummary', () => {
    it('should provide validation summary', () => {
      const results: ValidationResult[] = [
        { valid: true, errors: [], warnings: [] },
        { valid: false, errors: ['Error 1'], warnings: [] },
        { valid: true, errors: [], warnings: ['Warning 1'] }
      ]

      const summary = validator.getSummary(results)
      
      expect(summary.total).toBe(3)
      expect(summary.valid).toBe(2)
      expect(summary.invalid).toBe(1)
      expect(summary.warnings).toBe(1)
      expect(summary.errorMessages).toContain('Error 1')
      expect(summary.warningMessages).toContain('Warning 1')
    })
  })
})