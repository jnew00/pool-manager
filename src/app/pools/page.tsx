'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { PoolSetup } from '@/features/pools/components/PoolSetup'
import { PoolEdit } from '@/features/pools/components/PoolEdit'

interface Pool {
  id: string
  name: string
  type: 'ATS' | 'SU' | 'POINTS_PLUS' | 'SURVIVOR'
  season: number
  buyIn: number
  maxEntries: number
  isActive: boolean
  description?: string
  url?: string
}

export default function PoolsPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdPool, setCreatedPool] = useState<Pool | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingPool, setEditingPool] = useState<Pool | null>(null)
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPools()
  }, [])

  const fetchPools = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pools')
      if (!response.ok) {
        throw new Error('Failed to fetch pools')
      }
      const data = await response.json()
      setPools(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pools')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePool = async (poolId: string, poolName: string) => {
    if (!confirm(`Are you sure you want to delete "${poolName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/pools/${poolId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete pool')
      }

      // Refresh the pools list
      await fetchPools()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pool')
    }
  }

  const handleEditPool = (pool: Pool) => {
    setEditingPool(pool)
    setShowEditForm(true)
    setShowCreateForm(false)
    setShowSuccess(false)
  }

  const handlePoolCreated = (pool: Pool) => {
    setCreatedPool(pool)
    setShowSuccess(true)
    setShowCreateForm(false)
    fetchPools() // Refresh the list
  }

  const handlePoolUpdated = (pool: Pool) => {
    setEditingPool(null)
    setShowEditForm(false)
    fetchPools() // Refresh the list
  }

  const handleCreateAnother = () => {
    setShowSuccess(false)
    setCreatedPool(null)
    setShowCreateForm(true)
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
                className="text-blue-600 dark:text-blue-400 transition-colors font-medium"
              >
                Pools
              </Link>
              <Link
                href="/picks"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Picks
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">


        {showSuccess && createdPool ? (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Pool Created Successfully!
              </h2>
              <div className="max-w-md mx-auto mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {createdPool.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Type: {createdPool.type}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Season: {createdPool.season}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Buy-in: ${createdPool.buyIn}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowSuccess(false)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  View All Pools
                </button>
                <Link
                  href={`/pools/${createdPool.id}`}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Manage Pool
                </Link>
              </div>
            </div>
          </div>
        ) : showEditForm && editingPool ? (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Pool: {editingPool.name}
              </h2>
              <button
                onClick={() => {
                  setShowEditForm(false)
                  setEditingPool(null)
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <PoolEdit 
              pool={editingPool} 
              onPoolUpdated={handlePoolUpdated}
              onCancel={() => {
                setShowEditForm(false)
                setEditingPool(null)
              }}
            />
          </div>
        ) : showCreateForm ? (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Pool
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <PoolSetup onPoolCreated={handlePoolCreated} />
          </div>
        ) : (
          <>
            {/* Existing Pools */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Pools
                </h2>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create New Pool
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              ) : pools.length === 0 ? (
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Pools Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Create your first NFL pool to get started
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Create Your First Pool
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pools.map((pool) => (
                    <div
                      key={pool.id}
                      className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          {pool.url ? (
                            <a
                              href={pool.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            >
                              {pool.name}
                            </a>
                          ) : (
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {pool.name}
                            </h3>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {pool.type} Pool
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              pool.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {pool.isActive ? 'Active' : 'Inactive'}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              handleEditPool(pool)
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Edit pool"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              handleDeletePool(pool.id, pool.name)
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete pool"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                        <div className="flex justify-between">
                          <span>Season:</span>
                          <span className="font-medium">{pool.season}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Buy-in:</span>
                          <span className="font-medium">${pool.buyIn}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Entries:</span>
                          <span className="font-medium">{pool.maxEntries}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <Link
                          href={`/pools/${pool.id}`}
                          className="group flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                          <span className="text-sm font-medium">
                            Manage Pool
                          </span>
                          <svg
                            className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
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
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
