import { getCurrentNFLWeek, getWeekStartDate, getWeekStatus } from './nfl-week'

describe('NFL Week Utilities', () => {
  describe('getCurrentNFLWeek', () => {
    it('should return week 1 before season starts', () => {
      const beforeSeason = new Date(2025, 7, 15) // August 15, 2025
      expect(getCurrentNFLWeek(beforeSeason)).toBe(1)
    })

    it('should return week 1 on first Tuesday of season', () => {
      const firstTuesday = new Date(2025, 8, 2) // Sept 2, 2025
      expect(getCurrentNFLWeek(firstTuesday)).toBe(1)
    })

    it('should return week 2 on second Tuesday', () => {
      const secondTuesday = new Date(2025, 8, 9) // Sept 9, 2025
      expect(getCurrentNFLWeek(secondTuesday)).toBe(2)
    })

    it('should handle mid-season correctly', () => {
      const week10Tuesday = new Date(2025, 10, 4) // Nov 4, 2025 (Week 10)
      expect(getCurrentNFLWeek(week10Tuesday)).toBe(10)
    })

    it('should cap at week 18', () => {
      const afterSeason = new Date(2026, 1, 1) // Feb 1, 2026
      expect(getCurrentNFLWeek(afterSeason)).toBe(18)
    })
  })

  describe('getWeekStartDate', () => {
    it('should return correct start date for week 1', () => {
      const week1Start = getWeekStartDate(1, 2025)
      expect(week1Start.getDate()).toBe(2)
      expect(week1Start.getMonth()).toBe(8) // September (0-indexed)
      expect(week1Start.getFullYear()).toBe(2025)
    })

    it('should return correct start date for week 10', () => {
      const week10Start = getWeekStartDate(10, 2025)
      const expectedDate = new Date(2025, 8, 2) // Sept 2
      expectedDate.setDate(expectedDate.getDate() + 63) // 9 weeks * 7 days
      expect(week10Start.getTime()).toBe(expectedDate.getTime())
    })
  })

  describe('getWeekStatus', () => {
    it('should return past for previous years', () => {
      expect(getWeekStatus(10, 2023)).toBe('past')
    })

    it('should return future for future years', () => {
      expect(getWeekStatus(10, 2027)).toBe('future')
    })

    it('should handle current year correctly', () => {
      const currentYear = new Date().getFullYear()
      const currentWeek = getCurrentNFLWeek()
      
      expect(getWeekStatus(currentWeek - 1, currentYear)).toBe('past')
      expect(getWeekStatus(currentWeek, currentYear)).toBe('current')
      expect(getWeekStatus(currentWeek + 1, currentYear)).toBe('future')
    })
  })
})