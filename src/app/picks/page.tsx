'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { WeeklyPickScreen } from '@/features/picks/components/WeeklyPickScreen'
import type { Pool, Entry } from '@/lib/types/database'

export default function PicksPage() {
  const [pools, setPools] = useState<Pool[]>([])
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoadingPools, setIsLoadingPools] = useState(true)
  const [isLoadingEntries, setIsLoadingEntries] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Current season and week (could be dynamic in the future)
  const currentSeason = new Date().getFullYear()
  const currentWeek = 1 // This could be calculated based on current date

  const loadPools = async () => {
    try {
      setIsLoadingPools(true)
      setError(null)

      const response = await fetch('/api/pools')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load pools')
      }

      setPools(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pools')
    } finally {
      setIsLoadingPools(false)
    }
  }

  const loadEntries = async (poolId: string) => {
    try {
      setIsLoadingEntries(true)

      const response = await fetch(`/api/entries?poolId=${poolId}`)
      const data = await response.json()

      if (response.ok) {
        setEntries(data.data || [])
      } else {
        setEntries([])
      }
    } catch (err) {
      console.warn('Failed to load entries:', err)
      setEntries([])
    } finally {
      setIsLoadingEntries(false)
    }
  }

  useEffect(() => {
    loadPools()
  }, [])

  const handlePoolSelect = (pool: Pool) => {
    setSelectedPool(pool)
    setSelectedEntry(null)
    loadEntries(pool.id)
  }

  const handleEntrySelect = (entry: Entry) => {
    setSelectedEntry(entry)
  }

  const handleBackToPoolSelection = () => {
    setSelectedPool(null)
    setSelectedEntry(null)
    setEntries([])
  }

  const handleBackToEntrySelection = () => {
    setSelectedEntry(null)
  }

  const handleCreateEntry = async () => {
    if (!selectedPool) return

    try {
      setIsLoadingEntries(true)
      setError(null)

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poolId: selectedPool.id,
          season: currentSeason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create entry')
      }

      // Refresh entries list to show the new entry
      await loadEntries(selectedPool.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry')
    } finally {
      setIsLoadingEntries(false)
    }
  }

  if (isLoadingPools) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800">
        <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 dark:border-gray-800">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">PM</span>
                </div>
                <div>
                  <Link
                    href="/"
                    className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600"
                  >
                    PoolManager
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    NFL Pool System
                  </p>
                </div>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  href="/pools"
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  Pools
                </Link>
                <Link
                  href="/picks"
                  className="text-blue-600 dark:text-blue-400 transition-colors font-medium"
                >
                  Picks
                </Link>
                <Link
                  href="/standings"
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  Standings
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading pools...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">PM</span>
              </div>
              <div>
                <Link
                  href="/"
                  className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600"
                >
                  PoolManager
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  NFL Pool System
                </p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/pools"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Pools
              </Link>
              <Link
                href="/picks"
                className="text-blue-600 dark:text-blue-400 transition-colors font-medium"
              >
                Picks
              </Link>
              <Link
                href="/standings"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Standings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {selectedPool && selectedEntry ? (
          // Show Weekly Pick Screen
          <div>
            <div className="mb-6">
              <button
                onClick={handleBackToEntrySelection}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Entry Selection
              </button>
            </div>
            <WeeklyPickScreen
              pool={selectedPool}
              entry={selectedEntry}
              season={currentSeason}
              week={currentWeek}
            />
          </div>
        ) : selectedPool ? (
          // Show Entry Selection
          <div>
            <div className="mb-6">
              <button
                onClick={handleBackToPoolSelection}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Pool Selection
              </button>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Select Entry
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Choose your entry for {selectedPool.name}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 max-w-2xl mx-auto">
                <p className="text-red-800 dark:text-red-200 text-center">
                  {error}
                </p>
              </div>
            )}

            {isLoadingEntries ? (
              <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Loading entries...
                  </p>
                </div>
              </div>
            ) : entries.length > 0 ? (
              <div className="grid gap-4 max-w-2xl mx-auto">
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleEntrySelect(entry)}
                    className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-200 text-left"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Entry #{entry.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Season: {entry.season}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  No Entries Found
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto">
                  No entries found for this pool. Create an entry to start
                  making picks.
                </p>
                <button
                  onClick={() => handleCreateEntry()}
                  disabled={isLoadingEntries}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingEntries ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Entry...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Create Entry
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          // Show Pool Selection
          <div>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                Weekly Picks
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Make your picks for Week {currentWeek}
              </p>
            </div>

            {error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center mb-8">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                  Failed to load pools
                </h3>
                <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
                <button
                  onClick={loadPools}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : pools.length > 0 ? (
              <div className="grid gap-6 max-w-4xl mx-auto">
                {pools.map((pool) => (
                  <button
                    key={pool.id}
                    onClick={() => handlePoolSelect(pool)}
                    className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-200 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {pool.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium">
                            {pool.type}
                          </span>
                          <span>Season: {pool.season}</span>
                          {pool.buyIn > 0 && <span>Buy-in: ${pool.buyIn}</span>}
                        </div>
                        {pool.description && (
                          <p className="mt-3 text-gray-600 dark:text-gray-300">
                            {pool.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <svg
                          className="w-8 h-8 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  No Pools Available
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto">
                  No pools have been created yet. Create a pool first to start
                  making picks.
                </p>
                <Link
                  href="/pools"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Create Your First Pool
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
