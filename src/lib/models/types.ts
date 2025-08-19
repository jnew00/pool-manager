/**
 * Core types for the deterministic numeric model
 */

export interface ModelWeights {
  id: string
  name: string
  weights: {
    marketProbWeight: number // 0.35 default
    eloWeight: number // 0.22 default
    lineValueWeight: number // 0.22 default - arbitrage factor
    homeAdvWeight: number // 0.05 default
    restWeight: number // 0.02 default
    divisionalWeight: number // 0.07 default - divisional rivalry factor
    revengeGameWeight: number // 0.05 default - revenge game motivation factor
    recentFormWeight: number // 0.025 default - NEW: recent form factor
    playoffImplicationsWeight: number // 0.015 default - NEW: playoff implications factor
    weatherPenaltyWeight: number // 0.015 default
    injuryPenaltyWeight: number // 0.005 default
    kElo: number // 24 default
    windThresholdMph: number // 15 default
    precipProbThreshold: number // 0.30 default
    qbOutPenalty: number // 12 default
    olClusterPenalty: number // 3 default
    dbClusterPenalty: number // 3 default
  }
  createdAt: Date
}

export interface TeamRating {
  teamId: string
  rating: number
  gamesPlayed: number
  lastUpdated: Date
}

export interface GameFactors {
  gameId: string
  homeTeamId: string
  awayTeamId: string

  // Market-derived probability
  marketProb: number

  // Elo ratings
  homeElo: number
  awayElo: number
  eloProb: number

  // Line value (arbitrage opportunity)
  lineValue: number

  // Situational adjustments
  homeAdvantage: number
  restAdvantage: number // Positive favors home, negative favors away
  divisionalFactor: number // Rivalry and divisional game adjustments
  revengeGameFactor: number // Motivation from previous season matchups
  recentFormFactor: number // Recent performance advantage (positive = home team favored)
  playoffImplicationsFactor: number // Playoff motivation difference (positive = home team more motivated)

  // Environmental penalties
  weatherPenalty: number
  injuryPenalty: number

  // News analysis tie-breaking (for close games)
  newsAnalysis?: {
    confidence: number
    recommendedTeam?: 'HOME' | 'AWAY'
    summary: string
    adjustment: number // Points added/subtracted from confidence
  }

  // Final calculations
  rawConfidence: number
  adjustedConfidence: number // 0-100 scale
  recommendedPick: 'HOME' | 'AWAY'

  // Factor breakdown for UI
  factorBreakdown: FactorContribution[]
}

export interface FactorContribution {
  factor: string
  value: number
  weight: number
  contribution: number
  description: string
}

export interface MarketData {
  spread?: number
  total?: number
  moneylineHome?: number
  moneylineAway?: number
  impliedProbHome?: number
  impliedProbAway?: number
}

export interface WeatherFactors {
  windSpeed?: number
  precipitationChance?: number
  temperature?: number
  isDome: boolean
  penalty: number
}

export interface InjuryFactors {
  homeTeamPenalty: number
  awayTeamPenalty: number
  totalPenalty: number
  qbImpact: boolean
  lineImpact: boolean
  secondaryImpact: boolean
}

export interface RestFactors {
  homeDaysRest: number
  awayDaysRest: number
  advantage: number // Positive = home advantage, negative = away advantage
}

export interface ModelInput {
  gameId: string
  homeTeamId: string
  awayTeamId: string
  kickoffTime: Date
  venue?: string

  marketData: MarketData
  currentMarketData?: MarketData
  weatherData?: WeatherFactors
  injuryData?: InjuryFactors
  restData?: RestFactors

  weights: ModelWeights['weights']
}

export interface ModelOutput {
  gameId: string
  confidence: number // 0-100
  recommendedPick: 'HOME' | 'AWAY'
  factors: GameFactors
  calculatedAt: Date
  modelVersion: string
}

export interface PickValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  pickType: 'ATS' | 'SU' | 'POINTS_PLUS' | 'SURVIVOR'
}

export interface PointsPlusValidation {
  totalPicks: number
  favoritesCount: number
  underdogsCount: number
  minimumPicksMet: boolean
  favoriteUnderdogBalance: boolean
  noPickEmGames: boolean
}

export interface SurvivorValidation {
  teamAlreadyUsed: boolean
  eliminatedEntry: boolean
  validPick: boolean
  usedTeams: string[]
}
