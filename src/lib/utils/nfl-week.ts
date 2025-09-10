/**
 * Calculate the current NFL week based on Tuesday rollover
 * @param date Optional date to calculate week for (defaults to now)
 * @returns Current NFL week number (1-18 for regular season)
 */
export function getCurrentNFLWeek(date: Date = new Date()): number {
  const currentYear = date.getFullYear()
  
  // NFL season typically starts in early September
  // For 2025, season starts September 4th (Thursday)
  // Week rolls over on Tuesday
  const seasonStart = new Date(currentYear, 8, 2) // Sept 2, 2025 (Tuesday before Week 1)
  
  // If before season start, return week 1
  if (date < seasonStart) return 1
  
  // Calculate days since season start
  const daysSinceStart = Math.floor((date.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24))
  
  // Each week starts on Tuesday (every 7 days)
  const weekNumber = Math.floor(daysSinceStart / 7) + 1
  
  // Cap at week 18 (regular season)
  return Math.min(weekNumber, 18)
}

/**
 * Get the start date of a specific NFL week
 * @param week Week number (1-18)
 * @param year Year of the season
 * @returns Tuesday start date of the specified week
 */
export function getWeekStartDate(week: number, year: number): Date {
  const seasonStart = new Date(year, 8, 2) // Sept 2 (Tuesday before Week 1)
  const daysToAdd = (week - 1) * 7
  const weekStart = new Date(seasonStart)
  weekStart.setDate(weekStart.getDate() + daysToAdd)
  return weekStart
}

/**
 * Check if a given week is in the past, current, or future
 * @param week Week number to check
 * @param year Year of the season
 * @returns 'past' | 'current' | 'future'
 */
export function getWeekStatus(week: number, year: number): 'past' | 'current' | 'future' {
  const now = new Date()
  const currentWeek = getCurrentNFLWeek(now)
  const currentYear = now.getFullYear()
  
  if (year < currentYear) return 'past'
  if (year > currentYear) return 'future'
  
  if (week < currentWeek) return 'past'
  if (week > currentWeek) return 'future'
  return 'current'
}