import { describe, it, expect } from 'vitest'
import { CsvParser, type ColumnMapping } from './csv-parser'

describe('CsvParser', () => {
  const parser = new CsvParser()

  describe('parseHeaders', () => {
    it('should extract headers from CSV content', () => {
      const csvContent =
        'Date,Time,Away,Home,Spread,Total\n2024-09-08,13:00,BUF,LAR,-2.5,47.5'

      const headers = parser.parseHeaders(csvContent)

      expect(headers).toEqual([
        'Date',
        'Time',
        'Away',
        'Home',
        'Spread',
        'Total',
      ])
    })

    it('should handle headers with spaces and special characters', () => {
      const csvContent =
        'Game Date, Game Time, Away Team, Home Team, Point Spread, O/U Total\ndata'

      const headers = parser.parseHeaders(csvContent)

      expect(headers).toEqual([
        'Game Date',
        ' Game Time',
        ' Away Team',
        ' Home Team',
        ' Point Spread',
        ' O/U Total',
      ])
    })

    it('should throw error for empty CSV', () => {
      expect(() => parser.parseHeaders('')).toThrow('Empty CSV content')
    })
  })

  describe('parseWithMapping', () => {
    it('should parse CSV with column mapping', () => {
      const csvContent = `Date,Time,Away,Home,Spread,Total
2024-09-08,13:00,BUF,LAR,-2.5,47.5
2024-09-08,16:30,MIA,NE,3,42`

      const mapping: ColumnMapping = {
        date: 'Date',
        time: 'Time',
        away_team: 'Away',
        home_team: 'Home',
        spread: 'Spread',
        total: 'Total',
      }

      const result = parser.parseWithMapping(csvContent, mapping)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        date: '2024-09-08',
        time: '13:00',
        away_team: 'BUF',
        home_team: 'LAR',
        spread: '-2.5',
        total: '47.5',
      })
      expect(result[1]).toEqual({
        date: '2024-09-08',
        time: '16:30',
        away_team: 'MIA',
        home_team: 'NE',
        spread: '3',
        total: '42',
      })
    })

    it('should handle missing columns gracefully', () => {
      const csvContent = `Date,Away,Home
2024-09-08,BUF,LAR`

      const mapping: ColumnMapping = {
        date: 'Date',
        away_team: 'Away',
        home_team: 'Home',
        spread: 'Spread', // Missing column
        total: 'Total', // Missing column
      }

      const result = parser.parseWithMapping(csvContent, mapping)

      expect(result[0]).toEqual({
        date: '2024-09-08',
        away_team: 'BUF',
        home_team: 'LAR',
        spread: '',
        total: '',
      })
    })

    it('should skip empty rows', () => {
      const csvContent = `Date,Away,Home
2024-09-08,BUF,LAR

2024-09-09,MIA,NE`

      const mapping: ColumnMapping = {
        date: 'Date',
        away_team: 'Away',
        home_team: 'Home',
      }

      const result = parser.parseWithMapping(csvContent, mapping)

      expect(result).toHaveLength(2)
      expect(result[0].date).toBe('2024-09-08')
      expect(result[1].date).toBe('2024-09-09')
    })

    it('should throw error for invalid mapping', () => {
      const csvContent = 'Col1,Col2\nval1,val2'
      const mapping: ColumnMapping = {}

      expect(() => parser.parseWithMapping(csvContent, mapping)).toThrow(
        'No column mappings provided'
      )
    })
  })

  describe('detectDelimiter', () => {
    it('should detect comma delimiter', () => {
      const csvContent = 'col1,col2,col3\nval1,val2,val3'

      const delimiter = parser.detectDelimiter(csvContent)

      expect(delimiter).toBe(',')
    })

    it('should detect semicolon delimiter', () => {
      const csvContent = 'col1;col2;col3\nval1;val2;val3'

      const delimiter = parser.detectDelimiter(csvContent)

      expect(delimiter).toBe(';')
    })

    it('should detect tab delimiter', () => {
      const csvContent = 'col1\tcol2\tcol3\nval1\tval2\tval3'

      const delimiter = parser.detectDelimiter(csvContent)

      expect(delimiter).toBe('\t')
    })

    it('should default to comma if uncertain', () => {
      const csvContent = 'single_column\nvalue'

      const delimiter = parser.detectDelimiter(csvContent)

      expect(delimiter).toBe(',')
    })
  })

  describe('validateRow', () => {
    it('should validate required fields are present', () => {
      const row = { date: '2024-09-08', away_team: 'BUF', home_team: 'LAR' }
      const requiredFields = ['date', 'away_team', 'home_team']

      const errors = parser.validateRow(row, requiredFields)

      expect(errors).toHaveLength(0)
    })

    it('should return errors for missing required fields', () => {
      const row = { date: '2024-09-08', away_team: '' }
      const requiredFields = ['date', 'away_team', 'home_team']

      const errors = parser.validateRow(row, requiredFields)

      expect(errors).toContain('Missing required field: away_team')
      expect(errors).toContain('Missing required field: home_team')
    })
  })
})
