/**
 * Core types for the deterministic numeric model
 */

export interface ModelWeights {
  id: string
  name: string
  weights: {
    marketProbWeight: number // 0.40 default
    eloWeight: number // 0.25 default
    lineValueWeight: number // 0.25 default - NEW: arbitrage factor
    homeAdvWeight: number // 0.05 default
    restWeight: number // 0.02 default
    divisionalWeight: number // 0.02 default - NEW: divisional rivalry factor
    weatherPenaltyWeight: number // 0.02 default
    injuryPenaltyWeight: number // 0.01 default
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

  // Environmental penalties
  weatherPenalty: number
  injuryPenalty: number

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
