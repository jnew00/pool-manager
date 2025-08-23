'use client'

import { GameProjection } from '@/features/projections/components/GameProjection'

export default function TestBadgePage() {
  const mockProjection = {
    gameId: 'test-game-1',
    confidence: 55.0,
    recommendedPick: 'HOME' as const,
    factors: {
      gameId: 'test-game-1',
      homeTeamId: 'home-id',
      awayTeamId: 'away-id',
      marketProb: 0.55,
      homeElo: 1650,
      awayElo: 1600,
      eloProb: 0.5,
      homeAdvantage: 3.0,
      restAdvantage: 0,
      weatherPenalty: 0,
      injuryPenalty: 0,
      divisionalFactor: 0,
      revengeGameFactor: 0,
      lineValue: 0,
      rawConfidence: 0.55,
      adjustedConfidence: 55.0,
      recommendedPick: 'HOME' as const,
      factorBreakdown: [],
      // This should DEFINITELY trigger the badge
      newsAnalysis: {
        confidence: 25,
        recommendedTeam: 'HOME' as const,
        summary:
          'Key factors: Test quarterback injury affecting team performance',
        adjustment: 2.0,
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">News Analysis Badge Test</h1>

      <div className="mb-4 p-4 bg-yellow-100 rounded">
        <p>
          <strong>Expected:</strong> Should see a blue &quot;News&quot; badge with hover
          tooltip
        </p>
        <p>
          <strong>newsAnalysis data:</strong>
        </p>
        <pre className="text-sm mt-2">
          {JSON.stringify(mockProjection.factors.newsAnalysis, null, 2)}
        </pre>
      </div>

      <GameProjection
        projection={mockProjection}
        gameDetails={mockGameDetails}
      />
    </div>
  )
}
