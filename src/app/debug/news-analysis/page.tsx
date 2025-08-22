'use client'

import { useState, useEffect } from 'react'
import { GameProjection } from '@/features/projections/components/GameProjection'
import type { ModelOutput } from '@/lib/models/types'

export default function NewsAnalysisDebugPage() {
  const [newsResult, setNewsResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testNewsAnalysis = async () => {
      try {
        const response = await fetch('/api/debug/news-analysis')
        const data = await response.json()
        setNewsResult(data)
      } catch (error) {
        console.error('Failed to test news analysis:', error)
        setNewsResult({ success: false, error: 'Failed to fetch' })
      } finally {
        setLoading(false)
      }
    }

    testNewsAnalysis()
  }, [])

  // Create a mock projection with news analysis
  const mockProjection: ModelOutput = {
    gameId: 'test-game-1',
    confidence: 55.0,
    recommendedPick: 'HOME',
    factors: {
      marketProb: 0.55,
      homeElo: 1650,
      awayElo: 1600,
      homeAdvantage: 3.0,
      restAdvantage: 0,
      weatherPenalty: 0,
      injuryPenalty: 0,
      divisionalFactor: 0,
      revengeGameFactor: 0,
      lineValue: 0,
      rawConfidence: 0.55,
      factorBreakdown: [],
      // Add mock news analysis result - Force it to appear for testing
      newsAnalysis: {
        confidence: 20, // Above the 5 threshold
        recommendedTeam: 'HOME' as const,
        summary: newsResult?.success
          ? newsResult.result.summary
          : 'Key factors: Test quarterback listed as questionable with ankle injury; Recent roster move impacts team depth; Weather conditions favor running game',
        adjustment: 2.5,
      },
    },
    modelVersion: '1.0.0',
    calculatedAt: new Date(),
  }

  const mockGameDetails = {
    homeTeam: { name: 'Kansas City Chiefs', nflAbbr: 'KC' },
    awayTeam: { name: 'Buffalo Bills', nflAbbr: 'BUF' },
    kickoffTime: new Date(),
    venue: 'Arrowhead Stadium',
  }

  if (loading) {
    return <div className="p-8">Testing news analysis service...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">News Analysis Debug Page</h1>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Service Test Result</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(newsResult, null, 2)}
        </pre>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">
          GameProjection Component Test
        </h2>

        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <strong>Debug:</strong> mockProjection.factors.newsAnalysis =
          <pre className="mt-1">
            {JSON.stringify(mockProjection.factors.newsAnalysis, null, 2)}
          </pre>
        </div>

        <GameProjection
          projection={mockProjection}
          gameDetails={mockGameDetails}
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
        <h3 className="font-medium text-yellow-800">Expected Behavior:</h3>
        <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
          <li>Should see a "News" badge next to the confidence level</li>
          <li>Badge should be blue (home), green (away), or gray (neutral)</li>
          <li>Hovering should show news analysis details</li>
          <li>If no badge appears, check the service test result above</li>
        </ul>
      </div>
    </div>
  )
}
