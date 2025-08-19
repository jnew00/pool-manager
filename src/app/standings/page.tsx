'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  StandingsTable,
  StandingEntry,
} from '@/features/standings/components/StandingsTable'
import type { Pool } from '@/lib/types/database'

export default function StandingsPage() {
  const [pools, setPools] = useState<Pool[]>([])
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null)
  const [standings, setStandings] = useState<StandingEntry[]>([])
  const [isLoadingPools, setIsLoadingPools] = useState(true)
  const [isLoadingStandings, setIsLoadingStandings] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterText, setFilterText] = useState('')

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

  const loadStandings = async (poolId: string) => {
    try {
      setIsLoadingStandings(true)
      setError(null)

      const response = await fetch(`/api/standings?poolId=${poolId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load standings')
      }

      setStandings(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load standings')
      setStandings([])
    } finally {
      setIsLoadingStandings(false)
    }
  }

  useEffect(() => {
    loadPools()
  }, [])

  const handlePoolSelect = (pool: Pool) => {
    setSelectedPool(pool)
    setStandings([])
    loadStandings(pool.id)
  }

  const handleBackToPoolSelection = () => {
    setSelectedPool(null)
    setStandings([])
    setFilterText('')
  }

  const handleEntryClick = (entryId: string) => {
    // Could navigate to entry details page in the future
    console.log('Entry clicked:', entryId)
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
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  Picks
                </Link>
                <Link
                  href="/standings"
                  className="text-blue-600 dark:text-blue-400 transition-colors font-medium"
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
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Picks
              </Link>
              <Link
                href="/standings"
                className="text-blue-600 dark:text-blue-400 transition-colors font-medium"
              >
                Standings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {selectedPool ? (
          // Show Standings for Selected Pool
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                {selectedPool.name} Standings
              </h1>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium">
                  {selectedPool.type}
                </span>
                <span>Season: {selectedPool.season}</span>
              </div>
            </div>

            {/* Search/Filter */}
            <div className="mb-6 max-w-md mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center mb-8">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                  Failed to load standings
                </h3>
                <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
                <button
                  onClick={() => loadStandings(selectedPool.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden">
                <StandingsTable
                  standings={standings}
                  poolType={selectedPool.type}
                  onEntryClick={handleEntryClick}
                  isLoading={isLoadingStandings}
                  filterText={filterText}
                />
              </div>
            )}
          </div>
        ) : (
          // Show Pool Selection
          <div>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
                Pool Standings
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                View rankings and results for your pools
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
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 font-medium">
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
                          className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  No Pools Available
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto">
                  No pools have been created yet. Create a pool first to view
                  standings.
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
