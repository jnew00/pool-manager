import { EspnInjuryProvider } from '../data-sources/providers/espn-injury-provider'
import { MySportsFeedsInjuryProvider } from '../data-sources/providers/mysportsfeeds-injury-provider'
import type { InjuryData } from '../data-sources/types'

export interface TeamInjuryImpact {
  teamId: string
  teamAbbr: string
  injuryCount: number
  keyPlayerInjuries: {
    playerName: string
    position: string
    status: string
    injuryType: string
    impactLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  }[]
  overallImpact: 'SEVERE' | 'MODERATE' | 'MINOR' | 'NONE'
  riskAssessment: {
    offensiveRisk: number // 0-10
    defensiveRisk: number // 0-10
    specialTeamsRisk: number // 0-10
  }
  narrativeDescription: string
}

export interface InjuryDataAvailability {
  available: boolean
  source: 'ESPN' | 'MYSPORTSFEEDS' | 'NONE'
  requiresApiKey: boolean
  message: string
}

/**
 * Real Injury Analysis Service - Replaces mock injury data with real reports
 */
export class RealInjuryAnalysis {
  private espnProvider: EspnInjuryProvider
  private msfProvider: MySportsFeedsInjuryProvider
  private injuryCache: Map<string, { data: InjuryData[]; expires: Date }> =
    new Map()

  // Key positions that have high impact on team performance
  private readonly KEY_POSITIONS = {
    QB: {
      impact: 'HIGH' as const,
      offensive: 8,
      defensive: 0,
      specialTeams: 0,
    },
    RB: {
      impact: 'MEDIUM' as const,
      offensive: 5,
      defensive: 0,
      specialTeams: 1,
    },
    WR: {
      impact: 'MEDIUM' as const,
      offensive: 4,
      defensive: 0,
      specialTeams: 1,
    },
    TE: { impact: 'LOW' as const, offensive: 3, defensive: 0, specialTeams: 1 },
    LT: {
      impact: 'HIGH' as const,
      offensive: 6,
      defensive: 0,
      specialTeams: 0,
    },
    RT: {
      impact: 'HIGH' as const,
      offensive: 5,
      defensive: 0,
      specialTeams: 0,
    },
    LG: {
      impact: 'MEDIUM' as const,
      offensive: 3,
      defensive: 0,
      specialTeams: 0,
    },
    RG: {
      impact: 'MEDIUM' as const,
      offensive: 3,
      defensive: 0,
      specialTeams: 0,
    },
    C: { impact: 'HIGH' as const, offensive: 6, defensive: 0, specialTeams: 0 },
    DE: {
      impact: 'MEDIUM' as const,
      offensive: 0,
      defensive: 5,
      specialTeams: 0,
    },
    DT: {
      impact: 'MEDIUM' as const,
      offensive: 0,
      defensive: 4,
      specialTeams: 0,
    },
    LB: {
      impact: 'MEDIUM' as const,
      offensive: 0,
      defensive: 4,
      specialTeams: 1,
    },
    CB: {
      impact: 'MEDIUM' as const,
      offensive: 0,
      defensive: 5,
      specialTeams: 1,
    },
    S: {
      impact: 'MEDIUM' as const,
      offensive: 0,
      defensive: 4,
      specialTeams: 1,
    },
    K: { impact: 'LOW' as const, offensive: 0, defensive: 0, specialTeams: 7 },
    P: { impact: 'LOW' as const, offensive: 0, defensive: 0, specialTeams: 5 },
  }

  constructor() {
    this.espnProvider = new EspnInjuryProvider()
    this.msfProvider = new MySportsFeedsInjuryProvider()
  }

  /**
   * Get comprehensive injury analysis for a team
   */
  async getTeamInjuryImpact(
    teamId: string,
    teamAbbr?: string
  ): Promise<{
    impact: TeamInjuryImpact
    dataSource: 'REAL' | 'UNAVAILABLE'
    message?: string
  }> {
    try {
      // Try to get real injury data
      const injuries = await this.getTeamInjuries(teamId)

      if (!injuries || injuries.length === 0) {
        return {
          impact: this.createEmptyImpact(teamId, teamAbbr || teamId),
          dataSource: 'UNAVAILABLE',
          message: 'No injury data available for this team',
        }
      }

      const impact = this.analyzeInjuryImpact(
        injuries,
        teamId,
        teamAbbr || teamId
      )

      return {
        impact,
        dataSource: 'REAL',
        message: `Real injury data - ${injuries.length} injuries tracked`,
      }
    } catch (error) {
      console.error('Error getting team injury impact:', error)
      return {
        impact: this.createEmptyImpact(teamId, teamAbbr || teamId),
        dataSource: 'UNAVAILABLE',
        message: 'Error fetching injury data',
      }
    }
  }

  /**
   * Get injury narrative for survivor pool recommendations
   */
  async getInjuryNarrative(teamId: string): Promise<{
    narrative?: string
    dataSource: 'REAL' | 'UNAVAILABLE'
  }> {
    const injuryAnalysis = await this.getTeamInjuryImpact(teamId)

    if (injuryAnalysis.dataSource === 'UNAVAILABLE') {
      return {
        dataSource: 'UNAVAILABLE',
      }
    }

    const impact = injuryAnalysis.impact

    if (
      impact.overallImpact === 'NONE' ||
      impact.keyPlayerInjuries.length === 0
    ) {
      return {
        narrative: 'No significant injuries affecting key players',
        dataSource: 'REAL',
      }
    }

    // Build narrative based on key injuries
    const keyInjuries = impact.keyPlayerInjuries.filter(
      (inj) => inj.impactLevel === 'HIGH'
    )

    if (keyInjuries.length > 0) {
      const keyInjuryNames = keyInjuries
        .map((inj) => `${inj.playerName} (${inj.position})`)
        .join(', ')
      return {
        narrative: `Key player${keyInjuries.length > 1 ? 's' : ''} ${keyInjuryNames} ${keyInjuries[0].status.toLowerCase()}`,
        dataSource: 'REAL',
      }
    }

    const mediumInjuries = impact.keyPlayerInjuries.filter(
      (inj) => inj.impactLevel === 'MEDIUM'
    )
    if (mediumInjuries.length > 0) {
      return {
        narrative: `${mediumInjuries.length} role player${mediumInjuries.length > 1 ? 's' : ''} dealing with injuries`,
        dataSource: 'REAL',
      }
    }

    return {
      narrative: impact.narrativeDescription,
      dataSource: 'REAL',
    }
  }

  /**
   * Check if injury data is available from any provider
   */
  async checkInjuryDataAvailability(): Promise<InjuryDataAvailability> {
    try {
      // Check MySportsFeeds first (premium data) if configured
      if (this.msfProvider.isConfigured()) {
        const msfAvailability = await this.msfProvider.checkDataAvailability()

        if (msfAvailability.available) {
          return {
            available: true,
            source: 'MYSPORTSFEEDS',
            requiresApiKey: false,
            message: `${msfAvailability.message} (Premium tier)`,
          }
        }
      }

      // Check ESPN as fallback (free)
      const espnAvailability = await this.espnProvider.checkDataAvailability()

      if (espnAvailability.available) {
        return {
          available: true,
          source: 'ESPN',
          requiresApiKey: false,
          message: `${espnAvailability.message} (Free tier fallback)`,
        }
      }

      // If neither provider works, check if MSF just needs configuration
      if (!this.msfProvider.isConfigured()) {
        return {
          available: false,
          source: 'MYSPORTSFEEDS',
          requiresApiKey: true,
          message:
            'MySportsFeeds API key not configured. ESPN fallback also unavailable.',
        }
      }

      return {
        available: false,
        source: 'NONE',
        requiresApiKey: false,
        message: 'No injury data providers currently available',
      }
    } catch (error) {
      return {
        available: false,
        source: 'NONE',
        requiresApiKey: false,
        message: 'Error checking injury data availability',
      }
    }
  }

  /**
   * Private helper methods
   */
  private async getTeamInjuries(teamId: string): Promise<InjuryData[] | null> {
    // Check cache first
    const cacheKey = `injuries:${teamId}`
    const cached = this.injuryCache.get(cacheKey)

    if (cached && cached.expires > new Date()) {
      return cached.data
    }

    try {
      // Try MySportsFeeds first (premium data) if configured
      if (this.msfProvider.isConfigured()) {
        console.log(`Attempting MySportsFeeds for team ${teamId}...`)
        const msfResult = await this.msfProvider.getInjuriesForTeam(teamId)

        if (msfResult.success && msfResult.data) {
          console.log(
            `MySportsFeeds success: ${msfResult.data.length} injuries found`
          )
          // Cache for 2 hours
          const expires = new Date()
          expires.setHours(expires.getHours() + 2)

          this.injuryCache.set(cacheKey, {
            data: msfResult.data,
            expires,
          })

          return msfResult.data
        } else {
          console.log(`MySportsFeeds failed: ${msfResult.error}`)
        }
      } else {
        console.log('MySportsFeeds not configured, skipping...')
      }

      // Fallback to ESPN (free)
      console.log(`Attempting ESPN fallback for team ${teamId}...`)
      const espnResult = await this.espnProvider.getInjuriesForTeam(teamId)

      if (espnResult.success && espnResult.data) {
        console.log(`ESPN success: ${espnResult.data.length} injuries found`)
        // Cache for 2 hours
        const expires = new Date()
        expires.setHours(expires.getHours() + 2)

        this.injuryCache.set(cacheKey, {
          data: espnResult.data,
          expires,
        })

        return espnResult.data
      } else {
        console.log(`ESPN also failed: ${espnResult.error}`)
      }

      return null
    } catch (error) {
      console.error(`Error fetching injuries for team ${teamId}:`, error)
      return null
    }
  }

  private analyzeInjuryImpact(
    injuries: InjuryData[],
    teamId: string,
    teamAbbr: string
  ): TeamInjuryImpact {
    const keyPlayerInjuries = injuries
      .map((injury) => {
        const positionInfo = this.KEY_POSITIONS[
          injury.position as keyof typeof this.KEY_POSITIONS
        ] || {
          impact: 'LOW' as const,
          offensive: 1,
          defensive: 1,
          specialTeams: 1,
        }

        return {
          playerName: injury.playerName,
          position: injury.position,
          status: injury.status,
          injuryType: injury.injuryType || 'Injury',
          impactLevel: positionInfo.impact,
        }
      })
      .filter(
        (injury) => injury.impactLevel !== 'LOW' || injury.status === 'OUT'
      )

    // Calculate risk assessment
    let offensiveRisk = 0
    let defensiveRisk = 0
    let specialTeamsRisk = 0

    for (const injury of keyPlayerInjuries) {
      const positionInfo =
        this.KEY_POSITIONS[injury.position as keyof typeof this.KEY_POSITIONS]
      if (positionInfo) {
        const multiplier =
          injury.status === 'OUT'
            ? 1.0
            : injury.status === 'DOUBTFUL'
              ? 0.7
              : injury.status === 'QUESTIONABLE'
                ? 0.4
                : 0.2

        offensiveRisk += positionInfo.offensive * multiplier
        defensiveRisk += positionInfo.defensive * multiplier
        specialTeamsRisk += positionInfo.specialTeams * multiplier
      }
    }

    // Determine overall impact
    const totalRisk = offensiveRisk + defensiveRisk + specialTeamsRisk
    let overallImpact: TeamInjuryImpact['overallImpact']

    if (totalRisk >= 15) {
      overallImpact = 'SEVERE'
    } else if (totalRisk >= 8) {
      overallImpact = 'MODERATE'
    } else if (totalRisk >= 3) {
      overallImpact = 'MINOR'
    } else {
      overallImpact = 'NONE'
    }

    // Generate narrative description
    let narrativeDescription = ''
    if (overallImpact === 'SEVERE') {
      narrativeDescription =
        'Multiple key injuries significantly impact team strength'
    } else if (overallImpact === 'MODERATE') {
      narrativeDescription = 'Some important players dealing with injuries'
    } else if (overallImpact === 'MINOR') {
      narrativeDescription = 'Minor injury concerns but depth should compensate'
    } else {
      narrativeDescription =
        'Team relatively healthy with no major injury concerns'
    }

    return {
      teamId,
      teamAbbr,
      injuryCount: injuries.length,
      keyPlayerInjuries,
      overallImpact,
      riskAssessment: {
        offensiveRisk: Math.min(10, Math.round(offensiveRisk)),
        defensiveRisk: Math.min(10, Math.round(defensiveRisk)),
        specialTeamsRisk: Math.min(10, Math.round(specialTeamsRisk)),
      },
      narrativeDescription,
    }
  }

  private createEmptyImpact(
    teamId: string,
    teamAbbr: string
  ): TeamInjuryImpact {
    return {
      teamId,
      teamAbbr,
      injuryCount: 0,
      keyPlayerInjuries: [],
      overallImpact: 'NONE',
      riskAssessment: {
        offensiveRisk: 0,
        defensiveRisk: 0,
        specialTeamsRisk: 0,
      },
      narrativeDescription: 'Injury data not available',
    }
  }
}

// Global instance for use across the app
export const realInjuryAnalysis = new RealInjuryAnalysis()
