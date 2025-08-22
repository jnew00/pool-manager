/**
 * Travel and Scheduling Analysis Module
 * Analyzes travel distance, time zone changes, short rest periods, and other scheduling factors
 */

import type { ModelInput } from './types'

export interface TravelSchedulingFactors {
  travelDistance: number // Miles between team cities
  timeZoneChange: number // Hours of time zone difference (positive = east to west)
  shortWeek: boolean // Thursday/Monday game with <6 days rest
  crossCountryTravel: boolean // >2000 mile travel
  primetime: boolean // Sunday/Monday night games
  advantage: number // Positive = home team advantage from away team travel burden
  description: string
}

/**
 * NFL team home cities with coordinates and time zones
 */
const NFL_TEAM_LOCATIONS = {
  // AFC East
  BUF: {
    city: 'Buffalo',
    lat: 42.8864,
    lon: -78.8784,
    timezone: 'America/New_York',
  },
  MIA: {
    city: 'Miami',
    lat: 25.7617,
    lon: -80.1918,
    timezone: 'America/New_York',
  },
  NE: {
    city: 'Boston',
    lat: 42.3601,
    lon: -71.0589,
    timezone: 'America/New_York',
  },
  NYJ: {
    city: 'New York',
    lat: 40.7128,
    lon: -74.006,
    timezone: 'America/New_York',
  },

  // AFC North
  BAL: {
    city: 'Baltimore',
    lat: 39.2904,
    lon: -76.6122,
    timezone: 'America/New_York',
  },
  CIN: {
    city: 'Cincinnati',
    lat: 39.1031,
    lon: -84.512,
    timezone: 'America/New_York',
  },
  CLE: {
    city: 'Cleveland',
    lat: 41.4993,
    lon: -81.6944,
    timezone: 'America/New_York',
  },
  PIT: {
    city: 'Pittsburgh',
    lat: 40.4406,
    lon: -79.9959,
    timezone: 'America/New_York',
  },

  // AFC South
  HOU: {
    city: 'Houston',
    lat: 29.7604,
    lon: -95.3698,
    timezone: 'America/Chicago',
  },
  IND: {
    city: 'Indianapolis',
    lat: 39.7684,
    lon: -86.1581,
    timezone: 'America/New_York',
  },
  JAX: {
    city: 'Jacksonville',
    lat: 30.3322,
    lon: -81.6557,
    timezone: 'America/New_York',
  },
  TEN: {
    city: 'Nashville',
    lat: 36.1627,
    lon: -86.7816,
    timezone: 'America/Chicago',
  },

  // AFC West
  DEN: {
    city: 'Denver',
    lat: 39.7392,
    lon: -104.9903,
    timezone: 'America/Denver',
  },
  KC: {
    city: 'Kansas City',
    lat: 39.0997,
    lon: -94.5786,
    timezone: 'America/Chicago',
  },
  LV: {
    city: 'Las Vegas',
    lat: 36.1699,
    lon: -115.1398,
    timezone: 'America/Los_Angeles',
  },
  LAC: {
    city: 'Los Angeles',
    lat: 34.0522,
    lon: -118.2437,
    timezone: 'America/Los_Angeles',
  },

  // NFC East
  DAL: {
    city: 'Dallas',
    lat: 32.7767,
    lon: -96.797,
    timezone: 'America/Chicago',
  },
  NYG: {
    city: 'New York',
    lat: 40.7128,
    lon: -74.006,
    timezone: 'America/New_York',
  },
  PHI: {
    city: 'Philadelphia',
    lat: 39.9526,
    lon: -75.1652,
    timezone: 'America/New_York',
  },
  WAS: {
    city: 'Washington',
    lat: 38.9072,
    lon: -77.0369,
    timezone: 'America/New_York',
  },

  // NFC North
  CHI: {
    city: 'Chicago',
    lat: 41.8781,
    lon: -87.6298,
    timezone: 'America/Chicago',
  },
  DET: {
    city: 'Detroit',
    lat: 42.3314,
    lon: -83.0458,
    timezone: 'America/New_York',
  },
  GB: {
    city: 'Green Bay',
    lat: 44.5133,
    lon: -88.0133,
    timezone: 'America/Chicago',
  },
  MIN: {
    city: 'Minneapolis',
    lat: 44.9778,
    lon: -93.265,
    timezone: 'America/Chicago',
  },

  // NFC South
  ATL: {
    city: 'Atlanta',
    lat: 33.749,
    lon: -84.388,
    timezone: 'America/New_York',
  },
  CAR: {
    city: 'Charlotte',
    lat: 35.2271,
    lon: -80.8431,
    timezone: 'America/New_York',
  },
  NO: {
    city: 'New Orleans',
    lat: 29.9511,
    lon: -90.0715,
    timezone: 'America/Chicago',
  },
  TB: {
    city: 'Tampa',
    lat: 27.9506,
    lon: -82.4572,
    timezone: 'America/New_York',
  },

  // NFC West
  ARI: {
    city: 'Phoenix',
    lat: 33.4484,
    lon: -112.074,
    timezone: 'America/Phoenix',
  },
  LAR: {
    city: 'Los Angeles',
    lat: 34.0522,
    lon: -118.2437,
    timezone: 'America/Los_Angeles',
  },
  SF: {
    city: 'San Francisco',
    lat: 37.7749,
    lon: -122.4194,
    timezone: 'America/Los_Angeles',
  },
  SEA: {
    city: 'Seattle',
    lat: 47.6062,
    lon: -122.3321,
    timezone: 'America/Los_Angeles',
  },
} as const

/**
 * Time zone offset mapping (from UTC in standard time)
 */
const TIMEZONE_OFFSETS = {
  'America/New_York': -5, // EST
  'America/Chicago': -6, // CST
  'America/Denver': -7, // MST
  'America/Phoenix': -7, // MST (no DST)
  'America/Los_Angeles': -8, // PST
}

/**
 * Calculate great circle distance between two coordinates
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculate time zone difference between two cities
 */
function calculateTimeZoneDifference(
  fromTimezone: string,
  toTimezone: string
): number {
  const fromOffset =
    TIMEZONE_OFFSETS[fromTimezone as keyof typeof TIMEZONE_OFFSETS] || 0
  const toOffset =
    TIMEZONE_OFFSETS[toTimezone as keyof typeof TIMEZONE_OFFSETS] || 0
  return fromOffset - toOffset // Positive means traveling east to west
}

/**
 * Determine if it's a short week game (Thursday/Monday with <6 days rest)
 */
function isShortWeek(kickoffTime: Date, lastGameDate?: Date): boolean {
  if (!lastGameDate) return false

  const daysDiff =
    (kickoffTime.getTime() - lastGameDate.getTime()) / (1000 * 60 * 60 * 24)
  const gameDay = kickoffTime.getDay() // 0=Sunday, 4=Thursday, 1=Monday

  // Thursday games with <6 days rest, or Monday games with <6 days rest
  return (gameDay === 4 || gameDay === 1) && daysDiff < 6
}

/**
 * Determine if it's a primetime game
 */
function isPrimetime(kickoffTime: Date): boolean {
  const gameDay = kickoffTime.getDay()
  const hour = kickoffTime.getHours()

  // Sunday Night Football (Sunday after 7pm), Monday Night Football, Thursday Night Football
  return (gameDay === 0 && hour >= 19) || gameDay === 1 || gameDay === 4
}

/**
 * Calculate travel and scheduling factors for a game
 */
export function calculateTravelSchedulingFactors(
  input: ModelInput,
  lastAwayGameDate?: Date,
  lastHomeGameDate?: Date
): TravelSchedulingFactors {
  const awayTeamLocation =
    NFL_TEAM_LOCATIONS[input.awayTeamId as keyof typeof NFL_TEAM_LOCATIONS]
  const homeTeamLocation =
    NFL_TEAM_LOCATIONS[input.homeTeamId as keyof typeof NFL_TEAM_LOCATIONS]

  if (!awayTeamLocation || !homeTeamLocation) {
    return {
      travelDistance: 0,
      timeZoneChange: 0,
      shortWeek: false,
      crossCountryTravel: false,
      primetime: false,
      advantage: 0,
      description: 'Team location data unavailable',
    }
  }

  // Calculate travel distance
  const travelDistance = calculateDistance(
    awayTeamLocation.lat,
    awayTeamLocation.lon,
    homeTeamLocation.lat,
    homeTeamLocation.lon
  )

  // Calculate time zone change for away team
  const timeZoneChange = calculateTimeZoneDifference(
    awayTeamLocation.timezone,
    homeTeamLocation.timezone
  )

  // Check for short week
  const shortWeek = isShortWeek(input.kickoffTime, lastAwayGameDate)

  // Check for cross-country travel (>2000 miles)
  const crossCountryTravel = travelDistance > 2000

  // Check for primetime game
  const primetime = isPrimetime(input.kickoffTime)

  // Calculate advantage (positive = home team benefits from away team's travel burden)
  let advantage = 0
  let description = 'No significant travel factors'

  // Distance penalty (more severe for longer distances)
  if (travelDistance > 500) {
    advantage += Math.min(travelDistance / 1000, 3) // Max 3 point advantage for 3000+ mile trips
  }

  // Time zone penalty (more severe going west to east for early games)
  if (Math.abs(timeZoneChange) >= 2) {
    const gameHour = input.kickoffTime.getHours()

    if (timeZoneChange > 0) {
      // West to East travel - harder for early games
      advantage += gameHour < 16 ? 1.5 : 0.5
    } else {
      // East to West travel - generally less disruptive
      advantage += 0.5
    }
  }

  // Short week penalty for away team
  if (shortWeek) {
    advantage += 1.5
  }

  // Cross-country travel penalty
  if (crossCountryTravel) {
    advantage += 1
  }

  // Primetime game - slightly favors home team due to crowd and travel fatigue
  if (primetime) {
    advantage += 0.5
  }

  // Create description
  const factors = []
  if (travelDistance > 1500)
    factors.push(`${Math.round(travelDistance)} mile trip`)
  if (Math.abs(timeZoneChange) >= 2)
    factors.push(`${Math.abs(timeZoneChange)} hour time change`)
  if (shortWeek) factors.push('short week')
  if (crossCountryTravel) factors.push('cross-country travel')
  if (primetime) factors.push('primetime game')

  if (factors.length > 0) {
    description = `Away team: ${factors.join(', ')}`
  }

  return {
    travelDistance: Math.round(travelDistance),
    timeZoneChange,
    shortWeek,
    crossCountryTravel,
    primetime,
    advantage: Number(advantage.toFixed(1)),
    description,
  }
}

/**
 * Get team location info for a team ID
 */
export function getTeamLocation(teamId: string) {
  return NFL_TEAM_LOCATIONS[teamId as keyof typeof NFL_TEAM_LOCATIONS] || null
}

/**
 * Calculate if a team has a travel disadvantage compared to opponent
 */
export function calculateTravelDisadvantage(
  awayTeamId: string,
  homeTeamId: string,
  kickoffTime: Date
): {
  hasDisadvantage: boolean
  severity: 'MINOR' | 'MODERATE' | 'SEVERE'
  factors: string[]
} {
  const factors = calculateTravelSchedulingFactors({
    gameId: '',
    awayTeamId,
    homeTeamId,
    kickoffTime,
    marketData: {},
    weights: {} as any,
  })

  const severity =
    factors.advantage >= 2.5
      ? 'SEVERE'
      : factors.advantage >= 1.5
        ? 'MODERATE'
        : 'MINOR'

  const factorList = []
  if (factors.travelDistance > 1500) factorList.push('long distance travel')
  if (Math.abs(factors.timeZoneChange) >= 2)
    factorList.push('time zone disruption')
  if (factors.shortWeek) factorList.push('short rest period')
  if (factors.crossCountryTravel) factorList.push('cross-country journey')

  return {
    hasDisadvantage: factors.advantage > 0.5,
    severity,
    factors: factorList,
  }
}
