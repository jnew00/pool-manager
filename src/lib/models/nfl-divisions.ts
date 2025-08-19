/**
 * NFL Division mappings for rivalry detection
 */

export interface DivisionInfo {
  conference: 'AFC' | 'NFC'
  division: 'North' | 'South' | 'East' | 'West'
  teams: string[]
}

export const NFL_DIVISIONS: Record<string, DivisionInfo> = {
  'AFC_NORTH': {
    conference: 'AFC',
    division: 'North',
    teams: ['BAL', 'CIN', 'CLE', 'PIT']
  },
  'AFC_SOUTH': {
    conference: 'AFC',
    division: 'South', 
    teams: ['HOU', 'IND', 'JAX', 'TEN']
  },
  'AFC_EAST': {
    conference: 'AFC',
    division: 'East',
    teams: ['BUF', 'MIA', 'NE', 'NYJ']
  },
  'AFC_WEST': {
    conference: 'AFC',
    division: 'West',
    teams: ['DEN', 'KC', 'LAC', 'LVR']
  },
  'NFC_NORTH': {
    conference: 'NFC',
    division: 'North',
    teams: ['CHI', 'DET', 'GB', 'MIN']
  },
  'NFC_SOUTH': {
    conference: 'NFC',
    division: 'South',
    teams: ['ATL', 'CAR', 'NO', 'TB']
  },
  'NFC_EAST': {
    conference: 'NFC',
    division: 'East',
    teams: ['DAL', 'NYG', 'PHI', 'WAS']
  },
  'NFC_WEST': {
    conference: 'NFC',
    division: 'West',
    teams: ['ARI', 'LAR', 'SF', 'SEA']
  }
}

// Reverse lookup: team abbr -> division info
export const TEAM_DIVISIONS: Record<string, { division: string; divisionInfo: DivisionInfo }> = {}

Object.entries(NFL_DIVISIONS).forEach(([divisionKey, divisionInfo]) => {
  divisionInfo.teams.forEach(teamAbbr => {
    TEAM_DIVISIONS[teamAbbr] = {
      division: divisionKey,
      divisionInfo
    }
  })
})

/**
 * Check if two teams are division rivals
 */
export function areTeamsDivisionRivals(homeTeamAbbr: string, awayTeamAbbr: string): boolean {
  const homeDiv = TEAM_DIVISIONS[homeTeamAbbr]
  const awayDiv = TEAM_DIVISIONS[awayTeamAbbr]
  
  if (!homeDiv || !awayDiv) {
    return false
  }
  
  return homeDiv.division === awayDiv.division
}

/**
 * Check if two teams are in the same conference
 */
export function areTeamsSameConference(homeTeamAbbr: string, awayTeamAbbr: string): boolean {
  const homeDiv = TEAM_DIVISIONS[homeTeamAbbr]
  const awayDiv = TEAM_DIVISIONS[awayTeamAbbr]
  
  if (!homeDiv || !awayDiv) {
    return false
  }
  
  return homeDiv.divisionInfo.conference === awayDiv.divisionInfo.conference
}

/**
 * Get team's division information
 */
export function getTeamDivision(teamAbbr: string): DivisionInfo | null {
  const teamDiv = TEAM_DIVISIONS[teamAbbr]
  return teamDiv ? teamDiv.divisionInfo : null
}

/**
 * Get all teams in the same division as the given team
 */
export function getDivisionRivals(teamAbbr: string): string[] {
  const teamDiv = TEAM_DIVISIONS[teamAbbr]
  if (!teamDiv) {
    return []
  }
  
  return teamDiv.divisionInfo.teams.filter(team => team !== teamAbbr)
}

/**
 * Division rivalry factors for betting analysis
 */
export const RIVALRY_FACTORS = {
  // Division games tend to be closer and more unpredictable
  DIVISION_GAME_VARIANCE: 0.15, // Increase uncertainty by 15%
  
  // Historical trends show division underdogs cover more often
  DIVISION_UNDERDOG_BONUS: 1.5, // 1.5 point bonus for division underdogs
  
  // Specific high-intensity rivalries get extra unpredictability
  INTENSE_RIVALRIES: {
    // AFC rivalries
    'PIT_BAL': 2.0,
    'BAL_PIT': 2.0,
    'NE_NYJ': 1.8,
    'NYJ_NE': 1.8,
    'KC_DEN': 1.5,
    'DEN_KC': 1.5,
    
    // NFC rivalries  
    'DAL_NYG': 2.0,
    'NYG_DAL': 2.0,
    'DAL_PHI': 1.8,
    'PHI_DAL': 1.8,
    'GB_CHI': 2.0,
    'CHI_GB': 2.0,
    'SF_SEA': 1.8,
    'SEA_SF': 1.8,
    'NO_ATL': 1.5,
    'ATL_NO': 1.5,
  } as Record<string, number>
}

/**
 * Get rivalry intensity factor between two teams
 */
export function getRivalryIntensity(homeTeamAbbr: string, awayTeamAbbr: string): number {
  const matchupKey = `${homeTeamAbbr}_${awayTeamAbbr}`
  return RIVALRY_FACTORS.INTENSE_RIVALRIES[matchupKey] || 0
}