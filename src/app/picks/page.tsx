'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import type { Pool } from '@/lib/types/database'

type PoolCompletion = {
  poolId: string
  isCompleted: boolean
  completedAt?: Date
}

type SurvivorEntry = {
  id: string
  name: string
  isActive: boolean
  eliminatedWeek?: number
  strikes: number
  survivalProbability: number
  currentPick?: {
    teamName: string
    teamAbbr: string
    week: number
  }
}

export default function PicksPage() {
  const [pools, setPools] = useState<Pool[]>([])
  const [survivorEntries, setSurvivorEntries] = useState<Record<string, SurvivorEntry[]>>({})
  const [completions, setCompletions] = useState<PoolCompletion[]>([])
  const [isLoadingPools, setIsLoadingPools] = useState(true)
  const [isLoadingSurvivorEntries, setIsLoadingSurvivorEntries] = useState(false)
  const [isLoadingCompletions, setIsLoadingCompletions] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Generate or get a consistent user ID (could be from auth system in the future)
  const userId = typeof window !== 'undefined' 
    ? localStorage.getItem('userId') || (() => {
        const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('userId', id)
        return id
      })()
    : 'user-default'

  // Calculate current NFL week based on Tuesday rollover
  const calculateCurrentWeek = () => {
    const seasonStart = new Date(2025, 8, 2) // Sept 2, 2025 (Tuesday before Week 1)
    const now = new Date()
    
    // If before season start, return week 1
    if (now < seasonStart) return 1
    
    // Calculate days since season start
    const daysSinceStart = Math.floor((now.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24))
    
    // Each week starts on Tuesday (every 7 days)
    const weekNumber = Math.floor(daysSinceStart / 7) + 1
    
    // Cap at week 18 (regular season)
    return Math.min(weekNumber, 18)
  }

  const currentSeason = new Date().getFullYear()
  const currentWeek = calculateCurrentWeek()

  const loadPools = async () => {
    try {
      setIsLoadingPools(true)
      setError(null)

      const response = await fetch('/api/pools')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load pools')
      }

      const poolsData = data.data || []
      setPools(poolsData)

      // Load survivor entries for survivor pools
      await loadSurvivorEntries(poolsData.filter((pool: Pool) => pool.type === 'SURVIVOR'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pools')
    } finally {
      setIsLoadingPools(false)
    }
  }

  const loadSurvivorEntries = async (survivorPools: Pool[]) => {
    if (survivorPools.length === 0) return

    try {
      setIsLoadingSurvivorEntries(true)
      const entriesMap: Record<string, SurvivorEntry[]> = {}

      for (const pool of survivorPools) {
        try {
          const response = await fetch(`/api/survivor/entries?poolId=${pool.id}&userId=user-123&includeCurrentPick=true&week=${currentWeek}`)
          if (response.ok) {
            const data = await response.json()
            entriesMap[pool.id] = data || []
          } else {
            entriesMap[pool.id] = []
          }
        } catch (err) {
          entriesMap[pool.id] = []
        }
      }

      setSurvivorEntries(entriesMap)
    } catch (err) {
    } finally {
      setIsLoadingSurvivorEntries(false)
    }
  }

  // Load completion status from database
  const loadCompletions = async () => {
    try {
      setIsLoadingCompletions(true)
      const response = await fetch(
        `/api/completions?userId=${userId}&week=${currentWeek}&season=${currentSeason}`
      )
      if (response.ok) {
        const data = await response.json()
        const completionsData = data.data || []
        setCompletions(completionsData.map((c: any) => ({
          poolId: c.poolId,
          isCompleted: c.isCompleted,
          completedAt: c.completedAt ? new Date(c.completedAt) : undefined
        })))
      }
    } catch (err) {
    } finally {
      setIsLoadingCompletions(false)
    }
  }

  // Save completion status to database
  const saveCompletion = async (poolId: string, isCompleted: boolean) => {
    try {
      await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId,
          userId,
          week: currentWeek,
          season: currentSeason,
          isCompleted
        })
      })
    } catch (err) {
    }
  }

  const togglePoolCompletion = async (poolId: string, isCompleted: boolean) => {
    const existingIndex = completions.findIndex(c => c.poolId === poolId)
    const newCompletions = [...completions]

    if (existingIndex >= 0) {
      newCompletions[existingIndex] = {
        poolId,
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined
      }
    } else {
      newCompletions.push({
        poolId,
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined
      })
    }

    // Update local state immediately for responsiveness
    setCompletions(newCompletions)
    
    // Save to database
    await saveCompletion(poolId, isCompleted)
  }

  const isPoolCompleted = (poolId: string) => {
    const completion = completions.find(c => c.poolId === poolId)
    return completion?.isCompleted || false
  }

  useEffect(() => {
    loadPools()
  }, [])

  useEffect(() => {
    if (userId) {
      loadCompletions()
    }
  }, [userId, currentWeek, currentSeason])

  const getPoolUrl = (pool: Pool) => {
    if (pool.type === 'SURVIVOR') {
      return `/survivor/${pool.id}`
    }
    return `/pools/${pool.id}`
  }

  const renderSurvivorEntries = (pool: Pool) => {
    const entries = survivorEntries[pool.id] || []
    
    if (isLoadingSurvivorEntries) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <div className="animate-pulse">Loading entries...</div>
        </div>
      )
    }

    if (entries.length === 0) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          No entries found
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Survivor Entries
        </h4>
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between text-sm py-1">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                entry.isActive 
                  ? entry.survivalProbability > 0.7 
                    ? 'bg-green-500' 
                    : entry.survivalProbability > 0.3 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                  : 'bg-gray-400'
              }`} />
              <div className="flex-grow min-w-0">
                <span className={`font-medium ${
                  entry.isActive 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-red-500 dark:text-red-400 line-through'
                }`}>
                  {entry.name || 'Unnamed Entry'}
                </span>
                {!entry.isActive && entry.eliminatedWeek && (
                  <div className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                    Eliminated Week {entry.eliminatedWeek}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {entry.currentPick ? (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                  {entry.currentPick.teamAbbr}
                </span>
              ) : entry.isActive ? (
                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                  No Pick
                </span>
              ) : null}
              {entry.isActive && (
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                  {Math.round(entry.survivalProbability * 100)}%
                </span>
              )}
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                {entry.strikes} strikes
              </span>
            </div>
          </div>
        ))}
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
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  {/* Pool/Water waves */}
                  <path d="M2 18c1.5-1.5 3-1.5 4.5 0S9 19.5 10.5 18s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <path d="M2 15c1.5-1.5 3-1.5 4.5 0S9 16.5 10.5 15s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  {/* Chart/Management bars */}
                  <rect x="4" y="8" width="2" height="6" rx="1" />
                  <rect x="8" y="5" width="2" height="9" rx="1" />
                  <rect x="12" y="6" width="2" height="8" rx="1" />
                  <rect x="16" y="3" width="2" height="11" rx="1" />
                </svg>
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
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {isLoadingPools || isLoadingCompletions ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading pools...</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
               Week {currentWeek}
              </h1>
 
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
              <div className="max-w-4xl mx-auto">
                {/* Progress Summary */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Progress Summary
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {completions.filter(c => c.isCompleted).length} of {pools.length} pools completed
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-20 h-20">
                        <svg className="transform -rotate-90 w-full h-full">
                          <circle
                            cx="40"
                            cy="40"
                            r="30"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            className="text-gray-300 dark:text-gray-600"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="30"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 30}`}
                            strokeDashoffset={`${2 * Math.PI * 30 * (1 - completions.filter(c => c.isCompleted).length / pools.length)}`}
                            className="text-blue-600 dark:text-blue-400"
                          />
                        </svg>
                      </div>
                      <span className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round((completions.filter(c => c.isCompleted).length / pools.length) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pool Checklist */}
                <div className="space-y-2">
                  {pools.map((pool) => {
                    const isCompleted = isPoolCompleted(pool.id)
                    const completion = completions.find(c => c.poolId === pool.id)
                    
                    return (
                      <div
                        key={pool.id}
                        className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border transition-all duration-200 ${
                          isCompleted 
                            ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20' 
                            : 'border-gray-200/50 dark:border-gray-700/50 hover:shadow-md'
                        }`}
                      >
                        <div className="px-4 py-3">
                          <div className="flex items-center">
                            {/* Checkbox */}
                            <button
                              onClick={() => togglePoolCompletion(pool.id, !isCompleted)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mr-3 flex-shrink-0 ${
                                isCompleted
                                  ? 'bg-green-600 border-green-600 text-white'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400'
                              }`}
                            >
                              {isCompleted && (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>

                            {/* Pool Name */}
                            <div className={`flex-grow flex items-center space-x-3 ${isCompleted ? 'opacity-75' : ''}`}>
                              {pool.url ? (
                                <a
                                  href={pool.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`font-semibold ${
                                    isCompleted 
                                      ? 'text-green-800 dark:text-green-200 line-through hover:text-green-900 dark:hover:text-green-100' 
                                      : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
                                  } transition-colors`}
                                >
                                  {pool.name}
                                </a>
                              ) : (
                                <span className={`font-semibold ${
                                  isCompleted 
                                    ? 'text-green-800 dark:text-green-200 line-through' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {pool.name}
                                </span>
                              )}
                              
                              {/* Pool Type Badge */}
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                pool.type === 'SURVIVOR' 
                                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                                  : pool.type === 'POINTS_PLUS'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                                  : pool.type === 'ATS'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                              }`}>
                                {pool.type === 'POINTS_PLUS' ? 'PTS+' : pool.type}
                              </span>
                            </div>

                            {/* Link to Pool */}
                            <Link
                              href={getPoolUrl(pool)}
                              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                                isCompleted
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                              }`}
                            >
                              {isCompleted ? 'Review' : 'Make Picks'}
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>

                          {/* Survivor Entries Sub-listing */}
                          {pool.type === 'SURVIVOR' && (
                            <div className="ml-8 mt-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                              {renderSurvivorEntries(pool)}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Actions */}
                <div className="mt-12 text-center">
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={loadPools}
                      className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                    <Link
                      href="/pools"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create New Pool
                    </Link>
                  </div>
                </div>
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
