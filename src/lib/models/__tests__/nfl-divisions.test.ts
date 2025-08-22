import { describe, it, expect } from 'vitest'
import {
  areTeamsDivisionRivals,
  areTeamsSameConference,
  getTeamDivision,
  getDivisionRivals,
  getRivalryIntensity,
  TEAM_DIVISIONS,
} from '../nfl-divisions'

describe('NFL Divisions', () => {
  describe('areTeamsDivisionRivals', () => {
    it('should identify AFC North division rivals', () => {
      expect(areTeamsDivisionRivals('PIT', 'BAL')).toBe(true)
      expect(areTeamsDivisionRivals('CIN', 'CLE')).toBe(true)
    })

    it('should identify NFC East division rivals', () => {
      expect(areTeamsDivisionRivals('DAL', 'NYG')).toBe(true)
      expect(areTeamsDivisionRivals('PHI', 'WAS')).toBe(true)
    })

    it('should return false for non-division matchups', () => {
      expect(areTeamsDivisionRivals('KC', 'TB')).toBe(false)
      expect(areTeamsDivisionRivals('SF', 'NE')).toBe(false)
    })

    it('should return false for same conference different division', () => {
      expect(areTeamsDivisionRivals('KC', 'BUF')).toBe(false) // AFC West vs AFC East
      expect(areTeamsDivisionRivals('DAL', 'SF')).toBe(false) // NFC East vs NFC West
    })
  })

  describe('areTeamsSameConference', () => {
    it('should identify AFC teams', () => {
      expect(areTeamsSameConference('KC', 'BUF')).toBe(true)
      expect(areTeamsSameConference('PIT', 'HOU')).toBe(true)
    })

    it('should identify NFC teams', () => {
      expect(areTeamsSameConference('DAL', 'SF')).toBe(true)
      expect(areTeamsSameConference('GB', 'NO')).toBe(true)
    })

    it('should return false for cross-conference matchups', () => {
      expect(areTeamsSameConference('KC', 'TB')).toBe(false)
      expect(areTeamsSameConference('NE', 'DAL')).toBe(false)
    })
  })

  describe('getTeamDivision', () => {
    it('should return correct division info for AFC teams', () => {
      const kcDivision = getTeamDivision('KC')
      expect(kcDivision?.conference).toBe('AFC')
      expect(kcDivision?.division).toBe('West')
      expect(kcDivision?.teams).toContain('KC')
    })

    it('should return correct division info for NFC teams', () => {
      const dalDivision = getTeamDivision('DAL')
      expect(dalDivision?.conference).toBe('NFC')
      expect(dalDivision?.division).toBe('East')
      expect(dalDivision?.teams).toContain('DAL')
    })

    it('should return null for invalid team', () => {
      expect(getTeamDivision('INVALID')).toBe(null)
    })
  })

  describe('getDivisionRivals', () => {
    it('should return division rivals for AFC North team', () => {
      const pitRivals = getDivisionRivals('PIT')
      expect(pitRivals).toContain('BAL')
      expect(pitRivals).toContain('CIN')
      expect(pitRivals).toContain('CLE')
      expect(pitRivals).not.toContain('PIT') // Should not include itself
      expect(pitRivals).toHaveLength(3)
    })

    it('should return division rivals for NFC East team', () => {
      const dalRivals = getDivisionRivals('DAL')
      expect(dalRivals).toContain('NYG')
      expect(dalRivals).toContain('PHI')
      expect(dalRivals).toContain('WAS')
      expect(dalRivals).not.toContain('DAL') // Should not include itself
      expect(dalRivals).toHaveLength(3)
    })

    it('should return empty array for invalid team', () => {
      expect(getDivisionRivals('INVALID')).toEqual([])
    })
  })

  describe('getRivalryIntensity', () => {
    it('should return high intensity for classic rivalries', () => {
      expect(getRivalryIntensity('PIT', 'BAL')).toBe(2.0)
      expect(getRivalryIntensity('DAL', 'NYG')).toBe(2.0)
      expect(getRivalryIntensity('GB', 'CHI')).toBe(2.0)
    })

    it('should return medium intensity for moderate rivalries', () => {
      expect(getRivalryIntensity('NE', 'NYJ')).toBe(1.8)
      expect(getRivalryIntensity('SF', 'SEA')).toBe(1.8)
    })

    it('should return zero for non-specified rivalries', () => {
      expect(getRivalryIntensity('KC', 'TB')).toBe(0)
      expect(getRivalryIntensity('HOU', 'JAX')).toBe(0) // Division rivals but not intense
    })

    it('should be directional (home vs away matters)', () => {
      expect(getRivalryIntensity('PIT', 'BAL')).toBe(2.0)
      expect(getRivalryIntensity('BAL', 'PIT')).toBe(2.0)
    })
  })

  describe('TEAM_DIVISIONS coverage', () => {
    it('should include all 32 NFL teams', () => {
      const allTeams = Object.keys(TEAM_DIVISIONS)
      expect(allTeams).toHaveLength(32)

      // Check a few key teams are included
      expect(allTeams).toContain('KC')
      expect(allTeams).toContain('TB')
      expect(allTeams).toContain('SF')
      expect(allTeams).toContain('BUF')
    })

    it('should have exactly 4 teams per division', () => {
      const divisions = [
        'AFC_NORTH',
        'AFC_SOUTH',
        'AFC_EAST',
        'AFC_WEST',
        'NFC_NORTH',
        'NFC_SOUTH',
        'NFC_EAST',
        'NFC_WEST',
      ]

      Object.values(divisions).forEach((divisionKey) => {
        const teams = Object.entries(TEAM_DIVISIONS).filter(
          ([_, info]) => info.division === divisionKey
        )
        expect(teams).toHaveLength(4)
      })
    })
  })
})
