'use client'

import { useState, useEffect } from 'react'
import { GameProjection } from './GameProjection'
import type { ModelOutput } from '@/lib/models/types'

interface ProjectionsListProps {
  week: number
  season?: number
  className?: string
}

interface GameWithProjection {
  id: string
  homeTeam: { name: string; nflAbbr: string }
  awayTeam: { name: string; nflAbbr: string }
  kickoffTime: Date
  venue?: string
  projection?: ModelOutput
}

export function ProjectionsList({
  week,
  season = new Date().getFullYear(),
  className = '',
}: ProjectionsListProps) {
  const [games, setGames] = useState<GameWithProjection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'time' | 'confidence' | 'recommended'>(
    'time'
  )
  const [filterBy, setFilterBy] = useState<
    'all' | 'high-confidence' | 'close-games'
  >('all')

  useEffect(() => {
    loadProjections()
  }, [week, season])

  const loadProjections = async () => {
    try {
      setLoading(true)
      setError(null)

      // This would fetch from your API endpoint
      const response = await fetch(
        `/api/projections?week=${week}&season=${season}`
      )

      if (!response.ok) {
        throw new Error('Failed to load projections')
      }

      const data = await response.json()
      setGames(data.games || [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load projections'
      )
      // Mock data for development
      setGames(generateMockGames())
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedGames = games
    .filter((game) => {
      if (filterBy === 'all') return true
      if (filterBy === 'high-confidence') {
        return game.projection && game.projection.confidence >= 70
      }
      if (filterBy === 'close-games') {
        return (
          game.projection &&
          game.projection.confidence >= 50 &&
          game.projection.confidence < 60
        )
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return (
            (b.projection?.confidence || 0) - (a.projection?.confidence || 0)
          )
        case 'recommended':
          // Sort by team name of recommended pick
          const aRec =
            a.projection?.recommendedPick === 'HOME'
              ? a.homeTeam.nflAbbr
              : a.awayTeam.nflAbbr
          const bRec =
            b.projection?.recommendedPick === 'HOME'
              ? b.homeTeam.nflAbbr
              : b.awayTeam.nflAbbr
          return aRec.localeCompare(bRec)
        case 'time':
        default:
          return a.kickoffTime.getTime() - b.kickoffTime.getTime()
      }
    })

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border shadow-sm p-4 animate-pulse"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-4">
                <div className="h-12 w-24 bg-gray-200 rounded" />
                <div className="h-12 w-24 bg-gray-200 rounded" />
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center">
          <div className="text-red-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading projections
            </h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={loadProjections}
              className="mt-2 text-sm text-red-800 underline hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="time">Game Time</option>
            <option value="confidence">Confidence</option>
            <option value="recommended">Recommended Pick</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Games</option>
            <option value="high-confidence">High Confidence (70%+)</option>
            <option value="close-games">Close Games (50-60%)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>
            Week {week}, {season}
          </span>
          <span>•</span>
          <span>{filteredAndSortedGames.length} games</span>
        </div>
      </div>

      {/* Games List */}
      {filteredAndSortedGames.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg font-medium">No games found</div>
          <div className="text-sm">Try adjusting your filters</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedGames.map((game) => (
            <GameProjection
              key={game.id}
              projection={game.projection!}
              gameDetails={{
                homeTeam: game.homeTeam,
                awayTeam: game.awayTeam,
                kickoffTime: game.kickoffTime,
                venue: game.venue,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Mock data for development
function generateMockGames(): GameWithProjection[] {
  const teams = [
    { name: 'Kansas City Chiefs', nflAbbr: 'KC' },
    { name: 'Buffalo Bills', nflAbbr: 'BUF' },
    { name: 'Miami Dolphins', nflAbbr: 'MIA' },
    { name: 'New York Jets', nflAbbr: 'NYJ' },
    { name: 'Philadelphia Eagles', nflAbbr: 'PHI' },
    { name: 'Dallas Cowboys', nflAbbr: 'DAL' },
    { name: 'New York Giants', nflAbbr: 'NYG' },
    { name: 'Washington Commanders', nflAbbr: 'WAS' },
  ]

  return Array.from({ length: 4 }, (_, i) => {
    const homeTeam = teams[i * 2]
    const awayTeam = teams[i * 2 + 1]
    const confidence = 50 + Math.random() * 40 // 50-90%

    return {
      id: `game-${i}`,
      homeTeam,
      awayTeam,
      kickoffTime: new Date(Date.now() + i * 3 * 60 * 60 * 1000), // Every 3 hours
      venue: `${homeTeam.name} Stadium`,
      projection: {
        gameId: `game-${i}`,
        confidence,
        recommendedPick: Math.random() > 0.5 ? 'HOME' : 'AWAY',
        factors: {
          gameId: `game-${i}`,
          homeTeamId: 'home-id',
          awayTeamId: 'away-id',
          marketProb: 0.45 + Math.random() * 0.1,
          homeElo: 1500 + Math.random() * 200,
          awayElo: 1500 + Math.random() * 200,
          eloProb: 0.5 + Math.random() * 0.2 - 0.1,
          homeAdvantage: 2.5 + Math.random() * 2,
          restAdvantage: Math.random() * 2 - 1,
          weatherPenalty: Math.random() * 3,
          injuryPenalty: Math.random() * 2,
          rawConfidence: confidence / 100,
          adjustedConfidence: confidence,
          recommendedPick: Math.random() > 0.5 ? 'HOME' : 'AWAY',
          factorBreakdown: [
            {
              factor: 'Market Probability',
              value: 0.52,
              weight: 0.5,
              contribution: 0.26,
              description: 'Implied probability from betting lines',
            },
            {
              factor: 'Elo Rating',
              value: 0.48,
              weight: 0.3,
              contribution: 0.144,
              description: 'Team strength based on historical performance',
            },
            {
              factor: 'Home Advantage',
              value: 3.2,
              weight: 0.07,
              contribution: 0.056,
              description: 'Home field advantage and venue factors',
            },
            {
              factor: 'Rest Advantage',
              value: 0.5,
              weight: 0.03,
              contribution: 0.008,
              description: 'Advantage from extra days of rest',
            },
            {
              factor: 'Weather Impact',
              value: -1.2,
              weight: 0.07,
              contribution: -0.021,
              description: 'Weather conditions affecting gameplay',
            },
            {
              factor: 'Injury Impact',
              value: -0.8,
              weight: 0.03,
              contribution: -0.006,
              description: 'Impact of key player injuries',
            },
          ],
          // Add mock news analysis for games within close confidence range
          newsAnalysis: confidence >= 50 && confidence <= 60 ? {
            confidence: Math.floor(15 + Math.random() * 25), // 15-40% confidence
            recommendedTeam: Math.random() > 0.5 ? 'HOME' : 'AWAY',
            summary: `Key factors: ${homeTeam.name} quarterback listed as questionable with ankle injury; Recent roster move impacts team depth; Weather conditions favor running game`,
            adjustment: (Math.random() - 0.5) * 4 // -2 to +2 point adjustment
          } : undefined,
        },
        calculatedAt: new Date(),
        modelVersion: '1.0.0',
      },
    }
  })
}
