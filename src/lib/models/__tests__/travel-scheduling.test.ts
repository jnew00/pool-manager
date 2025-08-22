/**
 * Tests for travel and scheduling analysis
 */

import { describe, it, expect } from 'vitest'
import {
  calculateTravelSchedulingFactors,
  calculateTravelDisadvantage,
  getTeamLocation,
} from '../travel-scheduling'
import type { ModelInput } from '../types'

describe('Travel and Scheduling Analysis', () => {
  const mockInput: ModelInput = {
    gameId: 'test-game-1',
    awayTeamId: 'SEA',
    homeTeamId: 'MIA',
    kickoffTime: new Date('2025-01-12T13:00:00Z'), // Sunday 1pm ET
    marketData: {},
    weights: {} as any,
  }

  describe('calculateTravelSchedulingFactors', () => {
    it('should calculate cross-country travel factors correctly', () => {
      const factors = calculateTravelSchedulingFactors(mockInput)

      expect(factors.travelDistance).toBeGreaterThan(2000)
      expect(factors.crossCountryTravel).toBe(true)
      expect(factors.timeZoneChange).toBe(-3) // West to East
      expect(factors.advantage).toBeGreaterThan(2) // Significant travel burden
    })

    it('should identify short week games', () => {
      const thursdayGame = {
        ...mockInput,
        kickoffTime: new Date('2025-01-09T20:00:00Z'),
      } // Thursday night
      const lastGameDate = new Date('2025-01-05T18:00:00Z') // Previous Sunday

      const factors = calculateTravelSchedulingFactors(
        thursdayGame,
        lastGameDate
      )

      expect(factors.shortWeek).toBe(true)
      expect(factors.primetime).toBe(true)
      expect(factors.advantage).toBeGreaterThan(0)
    })

    it('should identify primetime games', () => {
      const mondayNight = {
        ...mockInput,
        kickoffTime: new Date('2025-01-13T21:00:00Z'),
      } // Monday night

      const factors = calculateTravelSchedulingFactors(mondayNight)

      expect(factors.primetime).toBe(true)
    })

    it('should handle same division games with minimal travel', () => {
      const divisionGame = {
        ...mockInput,
        awayTeamId: 'NYJ',
        homeTeamId: 'BUF',
      }

      const factors = calculateTravelSchedulingFactors(divisionGame)

      expect(factors.travelDistance).toBeLessThan(500)
      expect(factors.crossCountryTravel).toBe(false)
      expect(factors.timeZoneChange).toBe(0)
      expect(factors.advantage).toBeLessThan(1)
    })

    it('should handle invalid team IDs gracefully', () => {
      const invalidInput = { ...mockInput, awayTeamId: 'INVALID' }

      const factors = calculateTravelSchedulingFactors(invalidInput)

      expect(factors.travelDistance).toBe(0)
      expect(factors.advantage).toBe(0)
      expect(factors.description).toContain('unavailable')
    })
  })

  describe('calculateTravelDisadvantage', () => {
    it('should identify severe travel disadvantage', () => {
      const result = calculateTravelDisadvantage(
        'SEA',
        'MIA',
        new Date('2025-01-09T20:00:00Z')
      ) // Thursday night

      expect(result.hasDisadvantage).toBe(true)
      expect(result.severity).toBe('SEVERE')
      expect(result.factors).toContain('cross-country journey')
      expect(result.factors).toContain('time zone disruption')
    })

    it('should identify minimal disadvantage for short trips', () => {
      const result = calculateTravelDisadvantage(
        'NYJ',
        'NYG',
        new Date('2025-01-12T13:00:00Z')
      )

      expect(result.hasDisadvantage).toBe(false)
      expect(result.severity).toBe('MINOR')
      expect(result.factors).toHaveLength(0)
    })
  })

  describe('getTeamLocation', () => {
    it('should return correct location data for valid teams', () => {
      const location = getTeamLocation('KC')

      expect(location).toBeDefined()
      expect(location?.city).toBe('Kansas City')
      expect(location?.timezone).toBe('America/Chicago')
    })

    it('should return null for invalid team IDs', () => {
      const location = getTeamLocation('INVALID')

      expect(location).toBeNull()
    })
  })

  describe('time zone calculations', () => {
    it('should correctly calculate east to west travel', () => {
      const factors = calculateTravelSchedulingFactors({
        ...mockInput,
        awayTeamId: 'NE', // Boston (ET)
        homeTeamId: 'SF', // San Francisco (PT)
        kickoffTime: new Date('2025-01-12T13:00:00Z'), // 1pm ET = 10am PT (early game)
      })

      expect(factors.timeZoneChange).toBe(3) // East to West
      expect(factors.advantage).toBeGreaterThan(0)
    })

    it('should correctly calculate west to east travel', () => {
      const factors = calculateTravelSchedulingFactors({
        ...mockInput,
        awayTeamId: 'SF', // San Francisco (PT)
        homeTeamId: 'NE', // Boston (ET)
        kickoffTime: new Date('2025-01-12T18:00:00Z'), // 1pm ET = 10am PT
      })

      expect(factors.timeZoneChange).toBe(-3) // West to East
      expect(factors.advantage).toBeGreaterThan(0)
    })
  })
})
