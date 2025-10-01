'use client'

import { useState, useEffect } from 'react'
import { PickEntry } from './PickEntry'
import type { GameWithTeams } from '@/server/services/game.service'
import type { Pool, Entry, Pick } from '@/lib/types/database'

interface WeeklyPickScreenProps {
  pool: Pool
  entry: Entry
  season: number
  week: number
}

interface PickWithResult extends Pick {
  game: {
    id: string
    season: number
    week: number
    kickoff: string
    homeTeam: {
      id: string
      nflAbbr: string
      name: string
    }
    awayTeam: {
      id: string
      nflAbbr: string
      name: string
    }
    result: {
      homeScore: number | null
      awayScore: number | null
      status: string
    } | null
  }
  team: {
    id: string
    nflAbbr: string
    name: string
  }
  grade: {
    outcome: string
    points: number
  } | null
  isCorrect: boolean | null
}

interface WeekRecord {
  wins: number
  losses: number
  pending: number
  total: number
}

export function WeeklyPickScreen({
  pool,
  entry,
  season,
  week,
}: WeeklyPickScreenProps) {
  const [games, setGames] = useState<GameWithTeams[]>([])
  const [existingPicks, setExistingPicks] = useState<Pick[]>([])
  const [isLoadingGames, setIsLoadingGames] = useState(true)
  const [isLoadingPicks, setIsLoadingPicks] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLockingIn, setIsLockingIn] = useState(false)
  const [picksLocked, setPicksLocked] = useState(false)
  const [showHistoricalView, setShowHistoricalView] = useState(false)
  const [historicalPicks, setHistoricalPicks] = useState<PickWithResult[]>([])
  const [weekRecord, setWeekRecord] = useState<WeekRecord | null>(null)

  const loadGames = async () => {
    try {
      setIsLoadingGames(true)
      setError(null)

      const url = `/api/games?season=${season}&week=${week}&poolId=${pool.id}`
      console.log('[WeeklyPickScreen] Fetching games:', url)
      const response = await fetch(url)
      const data = await response.json()

      console.log('[WeeklyPickScreen] API Response:', {
        ok: response.ok,
        status: response.status,
        dataCount: data.data?.length || 0,
        data: data
      })

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load games')
      }

      setGames(data.data || [])
      console.log('[WeeklyPickScreen] Games set to state:', data.data?.length || 0)
    } catch (err) {
      console.error('[WeeklyPickScreen] Error loading games:', err)
      setError(err instanceof Error ? err.message : 'Failed to load games')
    } finally {
      setIsLoadingGames(false)
    }
  }

  const loadExistingPicks = async () => {
    try {
      setIsLoadingPicks(true)

      const response = await fetch(`/api/picks?entryId=${entry.id}`)
      const data = await response.json()

      if (response.ok) {
        const picks = data.data || []
        setExistingPicks(picks)

        // Check if any picks are locked for this week
        const weekPicks = picks.filter((pick: Pick) =>
          games.some(game => game.id === pick.gameId)
        )
        setPicksLocked(weekPicks.some((pick: Pick) => pick.lockedAt !== null))
      }
    } catch (err) {
      // Silently handle picks loading error - not critical
    } finally {
      setIsLoadingPicks(false)
    }
  }

  const loadHistoricalData = async () => {
    try {
      const response = await fetch(
        `/api/picks/week?entryId=${entry.id}&season=${season}&week=${week}`
      )
      const data = await response.json()

      if (response.ok) {
        setHistoricalPicks(data.data.picks || [])
        setWeekRecord(data.data.record || null)
        setShowHistoricalView(true)
      }
    } catch (err) {
      console.error('Error loading historical data:', err)
    }
  }

  const handleLockIn = async () => {
    if (!confirm(`Are you sure you want to lock in your picks for Week ${week}? This action cannot be undone.`)) {
      return
    }

    try {
      setIsLockingIn(true)
      setError(null)

      const response = await fetch('/api/picks/lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId: entry.id,
          season,
          week,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to lock in picks')
      }

      setPicksLocked(true)
      await loadExistingPicks()
      alert(`Successfully locked in ${data.data.count} pick(s) for Week ${week}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock in picks')
    } finally {
      setIsLockingIn(false)
    }
  }

  useEffect(() => {
    loadGames()
    loadExistingPicks()
  }, [season, week, entry.id])

  const handlePicksSubmitted = async () => {
    // Refresh picks after successful submission
    await loadExistingPicks()
  }

  if (isLoadingGames) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading games for Week {week}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Failed to load games
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadGames}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No games available for Week {week}
        </h2>
        <p className="text-gray-600">
          Games for this week haven&apos;t been scheduled yet.
        </p>
      </div>
    )
  }

  const weeklyPicksForThisWeek = existingPicks.filter((pick) =>
    games.some((game) => game.id === pick.gameId)
  )

  // Render historical view if enabled
  if (showHistoricalView && historicalPicks.length > 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Week {week} Results
              </h1>
              <div className="mt-1 text-sm text-gray-600">
                <span className="font-medium">{pool.name}</span> •
                <span className="ml-1">Entry #{entry.id.slice(-8)}</span> •
                <span className="ml-1">{season} Season</span>
              </div>
            </div>
            <button
              onClick={() => setShowHistoricalView(false)}
              className="mt-4 sm:mt-0 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Current Week
            </button>
          </div>

          {/* Win/Loss Record */}
          {weekRecord && (
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                <div className="text-3xl font-bold text-green-700">{weekRecord.wins}</div>
                <div className="text-sm text-green-600">Wins</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                <div className="text-3xl font-bold text-red-700">{weekRecord.losses}</div>
                <div className="text-sm text-red-600">Losses</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                <div className="text-3xl font-bold text-gray-700">{weekRecord.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center">
                <div className="text-3xl font-bold text-blue-700">{weekRecord.total}</div>
                <div className="text-sm text-blue-600">Total Picks</div>
              </div>
            </div>
          )}
        </div>

        {/* Historical Picks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Picks</h2>
          <div className="space-y-3">
            {historicalPicks.map((pick) => {
              const isHomeTeam = pick.teamId === pick.game.homeTeam.id
              const pickedTeam = isHomeTeam ? pick.game.homeTeam : pick.game.awayTeam
              const opposingTeam = isHomeTeam ? pick.game.awayTeam : pick.game.homeTeam
              const result = pick.game.result
              const gameFinished = result && result.status === 'FINAL'

              let resultIndicator = null
              if (pick.isCorrect === true) {
                resultIndicator = (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Win
                  </span>
                )
              } else if (pick.isCorrect === false) {
                resultIndicator = (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    ✗ Loss
                  </span>
                )
              } else if (gameFinished) {
                resultIndicator = (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    Push/Void
                  </span>
                )
              } else {
                resultIndicator = (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                )
              }

              return (
                <div
                  key={pick.id}
                  className={`border rounded-lg p-4 ${
                    pick.isCorrect === true
                      ? 'bg-green-50 border-green-200'
                      : pick.isCorrect === false
                        ? 'bg-red-50 border-red-200'
                        : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        Picked: {pickedTeam.name} ({pickedTeam.nflAbbr})
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        vs {opposingTeam.name} ({opposingTeam.nflAbbr})
                      </div>
                      {gameFinished && result && (
                        <div className="text-sm text-gray-700 mt-1 font-medium">
                          Final: {pick.game.awayTeam.nflAbbr} {result.awayScore} - {pick.game.homeTeam.nflAbbr} {result.homeScore}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(pick.game.kickoff).toLocaleDateString()} {new Date(pick.game.kickoff).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="ml-4">
                      {resultIndicator}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Week {week} Picks
            </h1>
            <div className="mt-1 text-sm text-gray-600">
              <span className="font-medium">{pool.name}</span> •
              <span className="ml-1">Entry #{entry.id.slice(-8)}</span> •
              <span className="ml-1">{season} Season</span>
            </div>
          </div>

          {/* Week Navigation could go here in the future */}
          <div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {pool.type} Pool
            </span>
          </div>
        </div>

        {/* Existing Picks Indicator */}
        {!isLoadingPicks && weeklyPicksForThisWeek.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    You have existing picks for this week (
                    {weeklyPicksForThisWeek.length} pick
                    {weeklyPicksForThisWeek.length !== 1 ? 's' : ''}).
                    {picksLocked
                      ? ' Your picks are locked in.'
                      : ' Submitting new picks will replace your previous selections.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Lock In Button */}
            {weeklyPicksForThisWeek.length > 0 && !picksLocked && pool.type === 'SU' && (
              <div className="flex justify-end">
                <button
                  onClick={handleLockIn}
                  disabled={isLockingIn}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLockingIn ? 'Locking In...' : 'Lock In Picks'}
                </button>
              </div>
            )}

            {/* View Historical Results Button */}
            {picksLocked && (
              <div className="flex justify-end">
                <button
                  onClick={loadHistoricalData}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  View Results
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pick Entry Component */}
      <div className="bg-white rounded-lg shadow p-6">
        <PickEntry
          pool={pool}
          games={games}
          entryId={entry.id}
          onPicksSubmitted={handlePicksSubmitted}
          showHeader={false}
        />
      </div>
    </div>
  )
}
