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

  const loadGames = async () => {
    try {
      setIsLoadingGames(true)
      setError(null)

      const response = await fetch(`/api/games?season=${season}&week=${week}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load games')
      }

      setGames(data.data || [])
    } catch (err) {
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
        setExistingPicks(data.data || [])
      }
    } catch (err) {
      // Silently handle picks loading error - not critical
      console.warn('Failed to load existing picks:', err)
    } finally {
      setIsLoadingPicks(false)
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
          Games for this week haven't been scheduled yet.
        </p>
      </div>
    )
  }

  const weeklyPicksForThisWeek = existingPicks.filter((pick) =>
    games.some((game) => game.id === pick.gameId)
  )

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
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
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
                  {weeklyPicksForThisWeek.length !== 1 ? 's' : ''}). Submitting
                  new picks will replace your previous selections.
                </p>
              </div>
            </div>
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
