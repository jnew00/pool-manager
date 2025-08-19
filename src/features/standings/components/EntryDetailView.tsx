'use client'

import { useState } from 'react'
import type { PoolType } from '@/lib/types/database'

export interface EntryDetail {
  entry: {
    id: string
    poolId: string
    season: number
  }
  standing: {
    entryId: string
    rank: number
    wins: number
    losses: number
    pushes: number
    voids: number
    totalPicks: number
    totalPoints: number
    winPercentage: number
    isEliminated?: boolean
    eliminatedWeek?: number
  }
  picks: Array<{
    id: string
    gameId: string
    teamId: string
    confidence: number
    outcome: 'WIN' | 'LOSS' | 'PUSH' | 'VOID'
    points: number
    week: number
    game: {
      homeTeam: { nflAbbr: string; name: string }
      awayTeam: { nflAbbr: string; name: string }
      kickoff: Date
    }
    team: { nflAbbr: string; name: string }
    grade: {
      outcome: 'WIN' | 'LOSS' | 'PUSH' | 'VOID'
      points: number
    }
  }>
  weeklyResults: Array<{
    week: number
    wins: number
    losses: number
    pushes: number
    voids: number
    totalPoints: number
  }>
}

interface EntryDetailViewProps {
  entryDetail: EntryDetail | null
  poolType: PoolType
  onClose: () => void
  isLoading?: boolean
  error?: string
}

export function EntryDetailView({
  entryDetail,
  poolType,
  onClose,
  isLoading = false,
  error,
}: EntryDetailViewProps) {
  const [weekFilter, setWeekFilter] = useState<string>('')
  const [outcomeFilter, setOutcomeFilter] = useState<string>('')

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Loading entry details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Entry Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  if (!entryDetail) {
    return null
  }

  const { entry, standing, picks, weeklyResults } = entryDetail

  // Filter picks based on selected filters
  const filteredPicks = picks.filter((pick) => {
    if (weekFilter && pick.week.toString() !== weekFilter) {
      return false
    }
    if (outcomeFilter && pick.outcome !== outcomeFilter) {
      return false
    }
    return true
  })

  // Group picks by week
  const picksByWeek = filteredPicks.reduce(
    (acc, pick) => {
      if (!acc[pick.week]) {
        acc[pick.week] = []
      }
      acc[pick.week].push(pick)
      return acc
    },
    {} as Record<number, typeof picks>
  )

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const formatGameMatchup = (pick: (typeof picks)[0]) => {
    const { homeTeam, awayTeam } = pick.game
    return `${awayTeam.nflAbbr} @ ${homeTeam.nflAbbr}`
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'WIN':
        return 'text-green-600 bg-green-100'
      case 'LOSS':
        return 'text-red-600 bg-red-100'
      case 'PUSH':
        return 'text-yellow-600 bg-yellow-100'
      case 'VOID':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getWeeklyRecord = (weekResult: (typeof weeklyResults)[0]) => {
    if (weekResult.pushes > 0) {
      return `${weekResult.wins}-${weekResult.losses}-${weekResult.pushes}`
    }
    return `${weekResult.wins}-${weekResult.losses}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Entry Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Entry Overview */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Entry Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">Entry ID</div>
                <div className="font-medium">{entry.id}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Rank</div>
                <div className="font-medium">Rank: {standing.rank}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Record</div>
                <div className="font-medium">
                  {standing.wins}-{standing.losses}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Win %</div>
                <div className="font-medium">
                  {formatPercentage(standing.winPercentage)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Points</div>
                <div className="font-medium">
                  {standing.totalPoints.toFixed(1)}
                </div>
              </div>
              {poolType === 'SURVIVOR' && standing.isEliminated && (
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-medium text-red-600">
                    Eliminated
                    {standing.eliminatedWeek && (
                      <div className="text-sm">
                        Week {standing.eliminatedWeek}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                Total Picks: {standing.totalPicks}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                Wins: {standing.wins}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                Losses: {standing.losses}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                Pushes: {standing.pushes}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                Voids: {standing.voids}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Performance */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Weekly Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyResults.map((weekResult) => (
              <div key={weekResult.week} className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium">Week {weekResult.week}</div>
                <div className="text-sm text-gray-600">
                  {getWeeklyRecord(weekResult)}
                </div>
                <div className="text-sm text-gray-600">
                  {weekResult.totalPoints.toFixed(1)} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pick History */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Pick History</h3>
            <div className="flex gap-4">
              <select
                value={weekFilter}
                onChange={(e) => setWeekFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
                aria-label="Filter by week"
              >
                <option value="">All Weeks</option>
                {Array.from(new Set(picks.map((p) => p.week)))
                  .sort()
                  .map((week) => (
                    <option key={week} value={week.toString()}>
                      Week {week}
                    </option>
                  ))}
              </select>
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
                aria-label="Filter by outcome"
              >
                <option value="">All Outcomes</option>
                <option value="WIN">Wins</option>
                <option value="LOSS">Losses</option>
                <option value="PUSH">Pushes</option>
                <option value="VOID">Voids</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(picksByWeek)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([week, weekPicks]) => (
                <div
                  key={week}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h4 className="font-medium mb-3">Week {week}</h4>
                  <div className="space-y-2">
                    {weekPicks.map((pick) => (
                      <div
                        key={pick.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {formatGameMatchup(pick)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Picked: {pick.team.nflAbbr} • Confidence:{' '}
                            {pick.confidence}%
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getOutcomeColor(pick.outcome)}`}
                          >
                            {pick.outcome}
                          </span>
                          <div className="text-sm font-medium">
                            {pick.points.toFixed(1)} pts
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
