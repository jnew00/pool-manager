'use client'

import { useState } from 'react'
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

            <div
              className={`px-2 py-1 rounded text-xs font-medium ${
                confidenceLevel.color
              }`}
            >
              {confidenceLevel.label}
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
              {(
                projection.factors.weatherPenalty +
                projection.factors.injuryPenalty +
                projection.factors.restAdvantage
              ).toFixed(1)}{' '}
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
  const impact = factor.contribution * factor.weight
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
        <span>Value: {factor.value.toFixed(3)}</span>
        <span>×</span>
        <span>Weight: {factor.weight.toFixed(2)}</span>
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
