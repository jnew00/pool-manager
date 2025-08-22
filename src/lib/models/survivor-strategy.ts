import { TeamEV, WeekEVData, SurvivorEVEngine } from './survivor-ev-engine'
import {
  TeamFutureValue,
  SeasonProjection,
  SurvivorFutureValue,
} from './survivor-future-value'

export type StrategyPreset =
  | 'CONSERVATIVE'
  | 'BALANCED'
  | 'CONTRARIAN'
  | 'RISK_SEEKING'
  | 'CUSTOM'

export interface StrategyWeights {
  winProbabilityWeight: number
  evWeight: number
  futureValueWeight: number
  publicFadeWeight: number // Weight for avoiding popular picks
  minWinProbability: number
  maxPublicPickPercentage: number
  futureValueThreshold: number // Min future value rating to consider saving
}

export interface TeamRecommendation {
  teamId: string
  teamAbbr: string
  gameId: string
  strategy: StrategyPreset
  compositeScore: number
  winProbability: number
  expectedValue: number
  futureValueRating: number
  publicPickPercentage: number
  reasoning: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  confidence: number // 0-100
}

export interface StrategyRecommendations {
  week: number
  poolSize: number
  survivorsRemaining: number
  strategy: StrategyPreset
  topPicks: TeamRecommendation[]
  alternativePicks: TeamRecommendation[]
  avoidList: string[] // Teams to avoid this week
  strategicNotes: string[]
}

export class SurvivorStrategy {
  private static readonly STRATEGY_PRESETS: Record<
    StrategyPreset,
    StrategyWeights
  > = {
    CONSERVATIVE: {
      winProbabilityWeight: 0.7,
      evWeight: 0.1,
      futureValueWeight: 0.15,
      publicFadeWeight: 0.05,
      minWinProbability: 0.68,
      maxPublicPickPercentage: 100,
      futureValueThreshold: 3.5,
    },
    BALANCED: {
      winProbabilityWeight: 0.4,
      evWeight: 0.3,
      futureValueWeight: 0.2,
      publicFadeWeight: 0.1,
      minWinProbability: 0.62,
      maxPublicPickPercentage: 100,
      futureValueThreshold: 3.0,
    },
    CONTRARIAN: {
      winProbabilityWeight: 0.25,
      evWeight: 0.35,
      futureValueWeight: 0.15,
      publicFadeWeight: 0.25,
      minWinProbability: 0.58,
      maxPublicPickPercentage: 10,
      futureValueThreshold: 2.5,
    },
    RISK_SEEKING: {
      winProbabilityWeight: 0.15,
      evWeight: 0.45,
      futureValueWeight: 0.1,
      publicFadeWeight: 0.3,
      minWinProbability: 0.55,
      maxPublicPickPercentage: 5,
      futureValueThreshold: 2.0,
    },
    CUSTOM: {
      // Default to balanced, user can override
      winProbabilityWeight: 0.4,
      evWeight: 0.3,
      futureValueWeight: 0.2,
      publicFadeWeight: 0.1,
      minWinProbability: 0.6,
      maxPublicPickPercentage: 100,
      futureValueThreshold: 3.0,
    },
  }

  /**
   * Get strategy weights for a preset
   */
  static getStrategyWeights(
    preset: StrategyPreset,
    customWeights?: Partial<StrategyWeights>
  ): StrategyWeights {
    const baseWeights = this.STRATEGY_PRESETS[preset]

    if (preset === 'CUSTOM' && customWeights) {
      return { ...baseWeights, ...customWeights }
    }

    return baseWeights
  }

  /**
   * Calculate composite score for a team based on strategy weights
   */
  static calculateCompositeScore(
    team: TeamEV,
    futureValue: TeamFutureValue | undefined,
    weights: StrategyWeights
  ): number {
    const winProbScore = team.winProbability * weights.winProbabilityWeight
    const evScore = Math.min(team.expectedValue, 2) * weights.evWeight * 0.5 // Cap EV contribution
    const futureValueScore =
      ((futureValue?.futureValueRating || 2.5) / 5) * weights.futureValueWeight

    // Public fade score (inverse of pick percentage)
    const publicFadeScore =
      (1 - team.publicPickPercentage / 100) * weights.publicFadeWeight

    return winProbScore + evScore + futureValueScore + publicFadeScore
  }

  /**
   * Determine risk level based on win probability and public pick %
   */
  static determineRiskLevel(
    winProbability: number,
    publicPickPercentage: number
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (winProbability >= 0.7 && publicPickPercentage >= 10) return 'LOW'
    if (
      winProbability >= 0.65 ||
      (winProbability >= 0.6 && publicPickPercentage < 5)
    )
      return 'MEDIUM'
    return 'HIGH'
  }

  /**
   * Generate reasoning for a pick recommendation
   */
  static generateReasoning(
    team: TeamEV,
    futureValue: TeamFutureValue | undefined,
    strategy: StrategyPreset
  ): string {
    const reasons: string[] = []

    // Win probability assessment
    if (team.winProbability >= 0.75) {
      reasons.push(
        `Heavy favorite (${(team.winProbability * 100).toFixed(1)}% win probability)`
      )
    } else if (team.winProbability >= 0.65) {
      reasons.push(
        `Solid favorite (${(team.winProbability * 100).toFixed(1)}% win probability)`
      )
    } else {
      reasons.push(
        `Moderate favorite (${(team.winProbability * 100).toFixed(1)}% win probability)`
      )
    }

    // EV assessment
    if (team.expectedValue > 1.5) {
      reasons.push(
        `Excellent expected value (${team.expectedValue.toFixed(2)} EV)`
      )
    } else if (team.expectedValue > 1.0) {
      reasons.push(
        `Positive expected value (${team.expectedValue.toFixed(2)} EV)`
      )
    }

    // Public pick assessment
    if (team.publicPickPercentage < 5) {
      reasons.push(
        `Contrarian pick (only ${team.publicPickPercentage.toFixed(1)}% picking)`
      )
    } else if (team.publicPickPercentage > 20) {
      reasons.push(
        `Popular pick (${team.publicPickPercentage.toFixed(1)}% of entries)`
      )
    }

    // Future value assessment
    if (futureValue) {
      if (futureValue.futureValueRating >= 4) {
        reasons.push('High future value - consider saving if possible')
      } else if (futureValue.futureValueRating <= 2) {
        reasons.push('Low future value - good to use now')
      }

      if (futureValue.bestWeeks.length > 0) {
        reasons.push(
          `Best future weeks: ${futureValue.bestWeeks.slice(0, 2).join(', ')}`
        )
      }
    }

    // Strategy-specific reasoning
    switch (strategy) {
      case 'CONSERVATIVE':
        reasons.push('Maximizing survival probability')
        break
      case 'CONTRARIAN':
        reasons.push('Differentiating from the field')
        break
      case 'RISK_SEEKING':
        reasons.push('High risk/reward for pool positioning')
        break
    }

    return reasons.join('. ')
  }

  /**
   * Calculate confidence score (0-100) for a recommendation
   */
  static calculateConfidence(
    team: TeamEV,
    futureValue: TeamFutureValue | undefined,
    weights: StrategyWeights
  ): number {
    let confidence = 50 // Base confidence

    // Win probability contribution
    if (team.winProbability >= 0.75) confidence += 20
    else if (team.winProbability >= 0.65) confidence += 10
    else if (team.winProbability < 0.55) confidence -= 10

    // EV contribution
    if (team.expectedValue > 1.5) confidence += 15
    else if (team.expectedValue > 1.0) confidence += 5
    else if (team.expectedValue < 0.8) confidence -= 10

    // Future value contribution
    if (futureValue) {
      if (futureValue.saveRecommendation === 'USE_NOW') confidence += 10
      else if (futureValue.saveRecommendation === 'MUST_SAVE') confidence -= 15
    }

    // Strategy alignment
    if (team.winProbability >= weights.minWinProbability) confidence += 5
    if (team.publicPickPercentage <= weights.maxPublicPickPercentage)
      confidence += 5

    return Math.max(0, Math.min(100, confidence))
  }

  /**
   * Generate strategy recommendations for a week
   */
  static generateRecommendations(
    weekEV: WeekEVData,
    seasonProjection: SeasonProjection,
    strategy: StrategyPreset,
    poolSize: number,
    survivorsRemaining: number,
    customWeights?: Partial<StrategyWeights>
  ): StrategyRecommendations {
    const weights = this.getStrategyWeights(strategy, customWeights)
    const recommendations: TeamRecommendation[] = []

    // Create a map of future values for quick lookup
    const futureValueMap = new Map<string, TeamFutureValue>()
    seasonProjection.teams.forEach((team) => {
      futureValueMap.set(team.teamId, team)
    })

    // Calculate composite scores for all teams
    weekEV.teams.forEach((team) => {
      const futureValue = futureValueMap.get(team.teamId)

      // Apply strategy filters
      if (team.winProbability < weights.minWinProbability) return
      if (team.publicPickPercentage > weights.maxPublicPickPercentage) return

      // Skip high future value teams if we have other options
      if (
        futureValue &&
        futureValue.futureValueRating >= weights.futureValueThreshold
      ) {
        // Only skip if we're early in the pool and have alternatives
        const poolProgress = 1 - survivorsRemaining / poolSize
        if (poolProgress < 0.5 && weekEV.teams.length > 5) {
          if (futureValue.saveRecommendation === 'MUST_SAVE') return
        }
      }

      const compositeScore = this.calculateCompositeScore(
        team,
        futureValue,
        weights
      )
      const riskLevel = this.determineRiskLevel(
        team.winProbability,
        team.publicPickPercentage
      )
      const reasoning = this.generateReasoning(team, futureValue, strategy)
      const confidence = this.calculateConfidence(team, futureValue, weights)

      recommendations.push({
        teamId: team.teamId,
        teamAbbr: team.teamAbbr,
        gameId: team.gameId,
        strategy,
        compositeScore,
        winProbability: team.winProbability,
        expectedValue: team.expectedValue,
        futureValueRating: futureValue?.futureValueRating || 2.5,
        publicPickPercentage: team.publicPickPercentage,
        reasoning,
        riskLevel,
        confidence,
      })
    })

    // Sort by composite score
    recommendations.sort((a, b) => b.compositeScore - a.compositeScore)

    // Identify teams to avoid
    const avoidList = weekEV.teams
      .filter((team) => team.winProbability < 0.5 || team.expectedValue < 0.5)
      .map((team) => team.teamAbbr)

    // Generate strategic notes
    const strategicNotes = this.generateStrategicNotes(
      weekEV,
      seasonProjection,
      strategy,
      survivorsRemaining,
      poolSize
    )

    return {
      week: weekEV.week,
      poolSize,
      survivorsRemaining,
      strategy,
      topPicks: recommendations.slice(0, 3),
      alternativePicks: recommendations.slice(3, 6),
      avoidList,
      strategicNotes,
    }
  }

  /**
   * Generate strategic notes and insights
   */
  private static generateStrategicNotes(
    weekEV: WeekEVData,
    seasonProjection: SeasonProjection,
    strategy: StrategyPreset,
    survivorsRemaining: number,
    poolSize: number
  ): string[] {
    const notes: string[] = []

    // Pool progress assessment
    const poolProgress = 1 - survivorsRemaining / poolSize
    if (poolProgress < 0.3) {
      notes.push(
        'Early pool stage - focus on preserving premium teams for later weeks'
      )
    } else if (poolProgress > 0.7) {
      notes.push('Late pool stage - use your best remaining teams to survive')
    }

    // Week difficulty assessment
    const avgWinProb =
      weekEV.teams.reduce((sum, t) => sum + t.winProbability, 0) /
      weekEV.teams.length
    if (avgWinProb < 0.6) {
      notes.push(
        'Difficult week with limited safe options - consider using a premium team'
      )
    } else if (avgWinProb > 0.65) {
      notes.push(
        'Multiple strong options available - good week to save premium teams'
      )
    }

    // Critical weeks warning
    if (seasonProjection.criticalWeeks.includes(weekEV.week + 1)) {
      notes.push(
        `Week ${weekEV.week + 1} is a critical week with limited options - plan accordingly`
      )
    }

    // Strategy-specific notes
    switch (strategy) {
      case 'CONSERVATIVE':
        notes.push('Prioritizing highest win probability to maximize survival')
        break
      case 'CONTRARIAN':
        notes.push(
          'Targeting low ownership teams to gain leverage on the field'
        )
        break
      case 'BALANCED':
        notes.push('Balancing safety with expected value optimization')
        break
      case 'RISK_SEEKING':
        notes.push(
          'Aggressive differentiation strategy - higher variance outcomes expected'
        )
        break
    }

    // Survival rate insight
    notes.push(
      `Expected field survival rate: ${(weekEV.overallSurvivalRate * 100).toFixed(1)}%`
    )

    return notes
  }
}
