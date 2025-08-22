'use client'

import { useState } from 'react'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import type { ModelOutput, FactorContribution } from '@/lib/models/types'

interface GameProjectionProps {
  projection: ModelOutput
  gameDetails: {
    homeTeam: { name: string; nflAbbr: string }
    awayTeam: { name: string; nflAbbr: string }
    kickoffTime: Date
    venue?: string
  }
  className?: string
}

export function GameProjection({
  projection,
  gameDetails,
  className = '',
}: GameProjectionProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Debug logging for news analysis
  console.log(
    '[GameProjection] projection.factors.newsAnalysis:',
    projection.factors.newsAnalysis
  )

  const confidenceLevel = getConfidenceLevel(projection.confidence)
  const isHomeRecommended = projection.recommendedPick === 'HOME'

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">
                {gameDetails.awayTeam.nflAbbr}
              </div>
              <div className="font-medium">{gameDetails.awayTeam.name}</div>
            </div>
            <div className="text-gray-400">@</div>
            <div className="text-center">
              <div className="text-sm text-gray-600">
                {gameDetails.homeTeam.nflAbbr}
              </div>
              <div className="font-medium">{gameDetails.homeTeam.name}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600">
              {gameDetails.kickoffTime.toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500">
              {gameDetails.kickoffTime.toLocaleTimeString()}
            </div>
            {gameDetails.venue && (
              <div className="text-xs text-gray-500">{gameDetails.venue}</div>
            )}
          </div>
        </div>
      </div>

      {/* Prediction Summary */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isHomeRecommended
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              Recommended:{' '}
              {isHomeRecommended
                ? gameDetails.homeTeam.nflAbbr
                : gameDetails.awayTeam.nflAbbr}
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`px-2 py-1 rounded text-xs font-medium ${
                  confidenceLevel.color
                }`}
              >
                {confidenceLevel.label}
              </div>

              {/* News Analysis Badge */}
              {projection.factors.newsAnalysis && (
                <Tippy
                  content={
                    <div className="text-sm">
                      <div className="font-medium mb-1">
                        News Analysis Active
                      </div>
                      <div className="text-gray-200 mb-2">
                        {projection.factors.newsAnalysis.summary}
                      </div>
                      {projection.factors.newsAnalysis.recommendedTeam && (
                        <div className="text-xs">
                          <span className="font-medium">Recommended:</span>{' '}
                          {projection.factors.newsAnalysis.recommendedTeam ===
                          'HOME'
                            ? gameDetails.homeTeam.nflAbbr
                            : gameDetails.awayTeam.nflAbbr}{' '}
                          ({projection.factors.newsAnalysis.confidence}%
                          confidence)
                        </div>
                      )}
                    </div>
                  }
                  placement="top"
                  theme="dark"
                  interactive={true}
                  maxWidth={300}
                >
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      projection.factors.newsAnalysis.recommendedTeam
                        ? projection.factors.newsAnalysis.recommendedTeam ===
                          'HOME'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    } cursor-help`}
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    News
                  </div>
                </Tippy>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold">
              {projection.confidence.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Confidence</div>
          </div>
        </div>

        {/* Quick Factor Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-600">Market Probability:</span>
            <span className="ml-2 font-medium">
              {(projection.factors.marketProb * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-gray-600">Elo Advantage:</span>
            <span className="ml-2 font-medium">
              {isHomeRecommended ? 'Home' : 'Away'} +
              {Math.abs(
                projection.factors.homeElo - projection.factors.awayElo
              ).toFixed(0)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Home Advantage:</span>
            <span className="ml-2 font-medium">
              +{projection.factors.homeAdvantage.toFixed(1)} pts
            </span>
          </div>
          <div>
            <span className="text-gray-600">Total Adjustments:</span>
            <span className="ml-2 font-medium">
              {(() => {
                const homeAdvantage = projection.factors.homeAdvantage || 0
                const restAdvantage = projection.factors.restAdvantage || 0
                const divisionalFactor =
                  projection.factors.divisionalFactor || 0
                const revengeGameFactor =
                  projection.factors.revengeGameFactor || 0
                const recentFormFactor =
                  projection.factors.recentFormFactor || 0
                const playoffImplicationsFactor =
                  projection.factors.playoffImplicationsFactor || 0
                const travelScheduleFactor =
                  projection.factors.travelScheduleFactor || 0
                const weatherPenalty = projection.factors.weatherPenalty || 0
                const injuryPenalty = projection.factors.injuryPenalty || 0

                const total =
                  homeAdvantage +
                  restAdvantage +
                  divisionalFactor +
                  revengeGameFactor +
                  recentFormFactor +
                  playoffImplicationsFactor +
                  travelScheduleFactor -
                  weatherPenalty -
                  injuryPenalty

                return isNaN(total) ? '0.0' : total.toFixed(1)
              })()}{' '}
              pts
            </span>
          </div>
        </div>

        {/* Toggle Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded text-sm font-medium text-gray-700 transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Factor Breakdown'}
        </button>
      </div>

      {/* Detailed Factor Breakdown */}
      {showDetails && (
        <div className="border-t bg-gray-50">
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Factor Breakdown</h4>

            <div className="space-y-3">
              {projection.factors.factorBreakdown.map((factor, index) => (
                <FactorBar key={index} factor={factor} />
              ))}
            </div>

            {/* Tie-Breaker Data */}
            {projection.tieBreakerData && (
              <div className="mt-6 pt-4 border-t">
                <h5 className="font-medium text-gray-900 mb-3">
                  Tie-Breaker Predictions
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Score Prediction */}
                  <div className="bg-white rounded-lg p-3 border">
                    <h6 className="font-medium text-sm text-gray-700 mb-2">
                      Predicted Final Score
                    </h6>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        <span
                          className={
                            projection.recommendedPick === 'AWAY'
                              ? 'text-green-600'
                              : ''
                          }
                        >
                          {gameDetails.awayTeam.nflAbbr}{' '}
                          {projection.tieBreakerData.scorePrediction.awayScore}
                        </span>
                        {' - '}
                        <span
                          className={
                            projection.recommendedPick === 'HOME'
                              ? 'text-blue-600'
                              : ''
                          }
                        >
                          {gameDetails.homeTeam.nflAbbr}{' '}
                          {projection.tieBreakerData.scorePrediction.homeScore}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Margin:{' '}
                        {Math.abs(
                          projection.tieBreakerData.scorePrediction.margin
                        ).toFixed(1)}{' '}
                        pts
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Confidence:{' '}
                        {projection.tieBreakerData.scorePrediction.confidence}%
                      </div>
                    </div>
                  </div>

                  {/* Over/Under Prediction */}
                  <div className="bg-white rounded-lg p-3 border">
                    <h6 className="font-medium text-sm text-gray-700 mb-2">
                      Over/Under Prediction
                    </h6>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        {
                          projection.tieBreakerData.overUnderPrediction
                            .prediction
                        }{' '}
                        pts
                      </div>
                      <div
                        className={`text-sm font-medium mb-1 ${
                          projection.tieBreakerData.overUnderPrediction
                            .recommendation === 'OVER'
                            ? 'text-green-600'
                            : projection.tieBreakerData.overUnderPrediction
                                  .recommendation === 'UNDER'
                              ? 'text-red-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {
                          projection.tieBreakerData.overUnderPrediction
                            .recommendation
                        }
                        {projection.tieBreakerData.overUnderPrediction
                          .marketTotal &&
                          ` (vs ${projection.tieBreakerData.overUnderPrediction.marketTotal})`}
                      </div>
                      <div className="text-xs text-gray-500">
                        Confidence:{' '}
                        {
                          projection.tieBreakerData.overUnderPrediction
                            .confidence
                        }
                        %
                      </div>
                    </div>
                  </div>
                </div>

                {/* Betting Reference */}
                <div className="mt-4 bg-white rounded-lg p-3 border">
                  <h6 className="font-medium text-sm text-gray-700 mb-2">
                    Betting Reference
                  </h6>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {projection.tieBreakerData.bettingReference.spread !==
                      undefined && (
                      <div>
                        <div className="text-gray-500">Spread</div>
                        <div className="font-mono">
                          {projection.tieBreakerData.bettingReference.spread > 0
                            ? `${gameDetails.awayTeam.nflAbbr} -${projection.tieBreakerData.bettingReference.spread}`
                            : `${gameDetails.homeTeam.nflAbbr} ${projection.tieBreakerData.bettingReference.spread}`}
                        </div>
                      </div>
                    )}
                    {projection.tieBreakerData.bettingReference.total && (
                      <div>
                        <div className="text-gray-500">O/U</div>
                        <div className="font-mono">
                          {projection.tieBreakerData.bettingReference.total}
                        </div>
                      </div>
                    )}
                    {projection.tieBreakerData.bettingReference
                      .moneylineHome && (
                      <div>
                        <div className="text-gray-500">
                          {gameDetails.homeTeam.nflAbbr} ML
                        </div>
                        <div className="font-mono">
                          {projection.tieBreakerData.bettingReference
                            .moneylineHome > 0
                            ? '+'
                            : ''}
                          {
                            projection.tieBreakerData.bettingReference
                              .moneylineHome
                          }
                        </div>
                      </div>
                    )}
                    {projection.tieBreakerData.bettingReference
                      .moneylineAway && (
                      <div>
                        <div className="text-gray-500">
                          {gameDetails.awayTeam.nflAbbr} ML
                        </div>
                        <div className="font-mono">
                          {projection.tieBreakerData.bettingReference
                            .moneylineAway > 0
                            ? '+'
                            : ''}
                          {
                            projection.tieBreakerData.bettingReference
                              .moneylineAway
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Model Details */}
            <div className="mt-4 pt-4 border-t text-xs text-gray-500">
              <div className="flex justify-between items-center">
                <span>Model Version: {projection.modelVersion}</span>
                <span>
                  Calculated: {projection.calculatedAt.toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-1">
                Raw Confidence:{' '}
                {(projection.factors.rawConfidence * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface FactorBarProps {
  factor: FactorContribution
}

function FactorBar({ factor }: FactorBarProps) {
  const weight = factor.weight ?? 0
  const contribution = factor.contribution ?? 0
  const value = factor.value ?? 0

  const impact = contribution * weight
  const isPositive = impact > 0
  const barWidth = Math.min(Math.abs(impact) * 200, 100) // Scale for display

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">{factor.factor}</span>
        <span
          className={`font-mono ${isPositive ? 'text-green-600' : 'text-red-600'}`}
        >
          {isPositive ? '+' : ''}
          {(impact * 100).toFixed(1)}%
        </span>
      </div>

      <div className="flex items-center space-x-2 text-xs text-gray-600">
        <span>Value: {value.toFixed(3)}</span>
        <span>×</span>
        <span>Weight: {weight.toFixed(2)}</span>
      </div>

      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 h-full rounded-full transition-all duration-300 ${
            isPositive ? 'bg-green-500 left-1/2' : 'bg-red-500 right-1/2'
          }`}
          style={{ width: `${barWidth}%` }}
        />
        <div className="absolute top-0 left-1/2 w-px h-full bg-gray-400" />
      </div>

      <div className="text-xs text-gray-500">{factor.description}</div>
    </div>
  )
}

function getConfidenceLevel(confidence: number): {
  label: string
  color: string
} {
  if (confidence >= 85) {
    return { label: 'Very High', color: 'bg-green-100 text-green-800' }
  } else if (confidence >= 70) {
    return { label: 'High', color: 'bg-blue-100 text-blue-800' }
  } else if (confidence >= 60) {
    return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' }
  } else if (confidence >= 55) {
    return { label: 'Low', color: 'bg-orange-100 text-orange-800' }
  } else {
    return { label: 'Very Low', color: 'bg-red-100 text-red-800' }
  }
}
