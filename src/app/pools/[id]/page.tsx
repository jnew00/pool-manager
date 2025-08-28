'use client'

import React from 'react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import {
  Building2,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
  Wind,
  CloudFog,
  CloudDrizzle,
  Thermometer,
  Droplets,
  Eye,
} from 'lucide-react'
import ControlPanel from './control-panel'
import { GameProjection } from '@/features/projections/components/GameProjection'
import { PointsPlusStrategyAdvisor } from '@/features/pools/components/PointsPlusStrategyAdvisor'
import { EditableSpreadsTable } from '@/components/spreads/EditableSpreadsTable'
import type { ModelOutput } from '@/lib/models/types'

interface Pool {
  id: string
  name: string
  type: 'ATS' | 'SU' | 'POINTS_PLUS' | 'SURVIVOR'
  season: number
  buyIn: number
  maxEntries: number
  isActive: boolean
  description?: string
}

interface Game {
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
  venue?: string
}

export default function PoolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const poolId = params?.id as string

  const [pool, setPool] = useState<Pool | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [fetchingExternalData, setFetchingExternalData] = useState(false)
  const [sortField, setSortField] = useState<string>('confidence')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [customWeights, setCustomWeights] = useState<any>(null)
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null)
  const [uploadedSpreads, setUploadedSpreads] = useState<any[]>([])
  const [espnSpreads, setEspnSpreads] = useState<any[]>([])
  const [loadingUploadedSpreads, setLoadingUploadedSpreads] = useState(false)
  const [editableSpreads, setEditableSpreads] = useState<any[] | null>(null)
  const [showEditableSpreads, setShowEditableSpreads] = useState(false)

  useEffect(() => {
    if (poolId) {
      fetchPool()
    }
  }, [poolId])

  useEffect(() => {
    if (pool) {
      fetchGames()
      fetchRecommendations(customWeights)
      if (pool.type === 'ATS') {
        fetchSpreadsData()
      }
    }
  }, [pool, selectedWeek])

  const handleWeightsChange = (newWeights: any) => {
    setCustomWeights(newWeights)
    // Immediately fetch new recommendations with updated weights
    if (pool) {
      fetchRecommendations(newWeights)
    }
  }

  const handleSaveEditedSpreads = async (spreads: any[]) => {
    if (!pool) return
    
    try {
      // Filter only matched spreads for saving
      const matchedSpreads = spreads.filter(s => s.matched)
      
      // Create lines for matched games
      const response = await fetch('/api/lines/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId: pool.id,
          spreads: matchedSpreads,
          source: 'Pool Upload'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save spreads')
      }
      
      const result = await response.json()
      
      // Success message
      alert(`Successfully saved ${matchedSpreads.length} spreads!`)
      
      // Close modal and refresh
      setShowEditableSpreads(false)
      setEditableSpreads(null)
      
      // Refresh data
      fetchGames()
      fetchRecommendations(customWeights)
      fetchSpreadsData()
      
    } catch (error) {
      console.error('Error saving spreads:', error)
      alert('Failed to save spreads. Please try again.')
    }
  }

  const handleCancelEditSpreads = () => {
    setShowEditableSpreads(false)
    setEditableSpreads(null)
  }

  const handleEditExistingSpreads = async () => {
    if (!pool) return

    try {
      
      // Fetch all games for the current week to get complete game information
      const gamesResponse = await fetch(`/api/games?season=${pool.season}&week=${selectedWeek}`)
      const gamesData = await gamesResponse.json()
      const allGames = gamesData.data || []

      // Create a map of gameId to full game info
      const gameMap = new Map()
      allGames.forEach((game: any) => {
        gameMap.set(game.id, game)
      })

      // Convert uploaded spreads to editable format
      const editableSpreadData = uploadedSpreads.map((spread: any) => {
        const game = gameMap.get(spread.gameId)
        if (!game) {
          // If we can't find the game, create a minimal representation
          return {
            gameId: spread.gameId,
            homeTeam: 'Unknown',
            awayTeam: 'Unknown', 
            spread: spread.spread,
            matched: false
          }
        }

        return {
          gameId: spread.gameId,
          homeTeam: game.homeTeam.nflAbbr,
          awayTeam: game.awayTeam.nflAbbr,
          spread: spread.spread,
          matched: true
        }
      })

      
      setEditableSpreads(editableSpreadData)
      setShowEditableSpreads(true)

    } catch (error) {
      console.error('[Edit Spreads] Error loading existing spreads:', error)
      alert('Failed to load existing spreads for editing')
    }
  }

  const fetchPool = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/pools/${poolId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch pool')
      }
      const data = await response.json()

      // Check if it's a Survivor pool and redirect
      if (data.data?.type === 'SURVIVOR') {
        // Use window.location for a hard redirect to avoid webpack issues
        window.location.href = `/survivor/${poolId}`
        return
      }

      setPool(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pool')
    } finally {
      setLoading(false)
    }
  }

  const fetchGames = async () => {
    try {
      const response = await fetch(
        `/api/games?season=${pool?.season}&week=${selectedWeek}`
      )
      if (response.ok) {
        const data = await response.json()
        setGames(data.data || [])
      } else {
        setGames([])
      }
    } catch (err) {
      console.error('Failed to fetch games:', err)
      setGames([])
    }
  }

  const fetchRecommendations = async (weights?: any) => {
    if (!pool) return

    try {
      setLoadingRecommendations(true)

      let url = `/api/recommendations?poolId=${pool.id}&season=${pool.season}&week=${selectedWeek}`

      // Add custom weights if provided
      if (weights) {
        const weightParams = new URLSearchParams()
        Object.keys(weights).forEach((key) => {
          weightParams.append(`weights.${key}`, weights[key].toString())
        })
        url += '&' + weightParams.toString()
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.data)
      } else {
        setRecommendations(null)
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err)
      setRecommendations(null)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const fetchSpreadsData = async () => {
    if (!pool) return

    try {
      setLoadingUploadedSpreads(true)
      
      // Fetch ESPN spreads (general lines)
      const espnResponse = await fetch(`/api/lines?season=${pool.season}&week=${selectedWeek}`)
      if (espnResponse.ok) {
        const espnData = await espnResponse.json()
        setEspnSpreads(espnData.lines || [])
      }

      // Fetch pool-specific spreads (uploaded)
      const uploadedResponse = await fetch(`/api/pools/${pool.id}/spreads?season=${pool.season}&week=${selectedWeek}`)
      if (uploadedResponse.ok) {
        const uploadedData = await uploadedResponse.json()
        setUploadedSpreads(uploadedData.spreads || [])
      }
    } catch (err) {
      console.error('Failed to fetch spreads data:', err)
    } finally {
      setLoadingUploadedSpreads(false)
    }
  }

  const handleFetchExternalData = async () => {
    if (!pool) return

    setFetchingExternalData(true)
    setError(null)

    try {
      const response = await fetch('/api/data-sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          season: pool.season,
          week: selectedWeek,
          dataTypes: ['odds', 'weather'],
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch external data')
      }

      if (result.success) {
        const { gamesFetched, oddsCreated, weatherUpdated, errors } =
          result.data

        let successMessage = [
          `Processed ${gamesFetched} games`,
          `Created ${oddsCreated} new odds entries`,
          `Updated ${weatherUpdated} games with weather data`,
        ].join('\n')

        if (errors && errors.length > 0) {
          successMessage += '\n\nWarnings:\n' + errors.join('\n')
        }

        alert(successMessage)

        // Refresh recommendations with new data
        fetchRecommendations(customWeights)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch external data'
      )
    } finally {
      setFetchingExternalData(false)
    }
  }

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file || !pool) return


    setUploadingImage(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('season', pool.season.toString())
      formData.append('week', selectedWeek.toString())
      formData.append('poolId', pool.id)

      
      const response = await fetch('/api/upload/spreads', {
        method: 'POST',
        body: formData,
      })

      
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process image')
      }

      if (!result.success && result.extractedText) {
        setError(`${result.error}\n\nExtracted text:\n${result.extractedText}`)
        return
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to process image')
      }

      // Process the spread upload results
      const spreadsExtracted = result.data.spreadsExtracted || 0
      const gamesMatched = result.data.gamesMatched || 0
      const linesCreated = result.data.linesCreated || 0
      const gamesUnmatched = result.data.gamesUnmatched || 0

      
      // Show editable spreads for review instead of immediate save
      if (result.data.matches || result.data.unmatched) {
        const allSpreads = [
          ...(result.data.matches || []).map((m: any) => ({
            gameId: m.gameId,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            spread: m.spread,
            matched: true
          })),
          ...(result.data.unmatched || []).map((u: any) => ({
            homeTeam: u.home_team,
            awayTeam: u.away_team,
            spread: u.spread_for_home,
            matched: false
          }))
        ]
        
        setEditableSpreads(allSpreads)
        setShowEditableSpreads(true)
        return
      }

      // Log unmatched spreads for debugging
      if (result.data.unmatched && result.data.unmatched.length > 0) {
      }

      // Show success message with details
      const successMessage = [
        `Successfully processed ${spreadsExtracted} spreads`,
        `Provider: ${result.data.llmProvider}`,
        `OCR Confidence: ${result.data.ocrConfidence.toFixed(1)}%`,
        `Matched ${gamesMatched} spreads to existing games`,
        ...(linesCreated > 0
          ? [`Created ${linesCreated} betting lines for this pool`]
          : []),
        ...(gamesUnmatched > 0
          ? [`${gamesUnmatched} spreads could not be matched to games`]
          : []),
        ...(result.data.estimatedCostUSD
          ? [`Cost: $${result.data.estimatedCostUSD.toFixed(4)}`]
          : []),
        ...(result.data.unmatched && result.data.unmatched.length > 0
          ? ['', 'Unmatched spreads:'].concat(
              result.data.unmatched.map((spread: any) => 
                `  ${spread.away_team} @ ${spread.home_team} (${spread.spread_for_home})`
              )
            )
          : [])
      ].join('\n')

      alert(successMessage)

      // Refresh games list, recommendations, and spreads data
      fetchGames()
      fetchRecommendations(customWeights)
      fetchSpreadsData()
    } catch (err) {
      console.error('[Image Upload] Error occurred:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image'
      setError(`Image upload failed: ${errorMessage}`)
      alert(`Error uploading image: ${errorMessage}`)
    } finally {
      setUploadingImage(false)
      setShowImageUpload(false)
    }
  }

  const weeks = Array.from({ length: 18 }, (_, i) => i + 1) // NFL weeks 1-18

  // Helper function to transform recommendation to ModelOutput format
  const transformRecommendationToModelOutput = (
    game: Game,
    rec: any
  ): ModelOutput | null => {
    if (!rec) return null

    const factors = rec.recommendation.factors || {}

    return {
      gameId: game.id,
      confidence: rec.recommendation.confidence || 0,
      recommendedPick: rec.recommendation.pick || 'HOME',
      factors: {
        gameId: game.id,
        homeTeamId: game.homeTeam.id,
        awayTeamId: game.awayTeam.id,
        marketProb: factors.marketProb || 0.5,
        homeElo: factors.homeElo || 1500,
        awayElo: factors.awayElo || 1500,
        eloProb: factors.eloProb || 0.5,
        homeAdvantage: factors.homeAdvantage || 3.0,
        restAdvantage: factors.restAdvantage || 0,
        weatherPenalty: factors.weatherPenalty || 0,
        injuryPenalty: factors.injuryPenalty || 0,
        divisionalFactor: factors.divisionalFactor || 0,
        revengeGameFactor: factors.revengeGameFactor || 0,
        recentFormFactor: factors.recentFormFactor || 0,
        playoffImplicationsFactor: factors.playoffImplicationsFactor || 0,
        lineValue: factors.lineValue || 0,
        rawConfidence: factors.rawConfidence || 0.5,
        adjustedConfidence: rec.recommendation.confidence || 50,
        recommendedPick: rec.recommendation.pick || 'HOME',
        factorBreakdown: factors.factorBreakdown || [],
        newsAnalysis: factors.newsAnalysis || null,
      },
      tieBreakerData: rec.recommendation.tieBreakerData || null,
      modelVersion: rec.recommendation.modelVersion || '1.0.0',
      calculatedAt: new Date(),
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !pool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <Link
            href="/picks"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            ← Back to Picks
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Pool/Water waves */}
                  <path
                    d="M2 18c1.5-1.5 3-1.5 4.5 0S9 19.5 10.5 18 13 16.5 14.5 18 17 19.5 18.5 18 21 16.5 22.5 18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M2 21c1.5-1.5 3-1.5 4.5 0S9 22.5 10.5 21 13 19.5 14.5 21 17 22.5 18.5 21 21 19.5 22.5 21"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Chart/Management bars */}
                  <rect x="4" y="8" width="2" height="6" rx="1" />
                  <rect x="8" y="5" width="2" height="9" rx="1" />
                  <rect x="12" y="3" width="2" height="11" rx="1" />
                  <rect x="16" y="6" width="2" height="8" rx="1" />
                  <rect x="20" y="4" width="2" height="10" rx="1" />
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Editable Spreads Modal */}
        {showEditableSpreads && editableSpreads && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <EditableSpreadsTable
                spreads={editableSpreads}
                onSave={handleSaveEditedSpreads}
                onCancel={handleCancelEditSpreads}
              />
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/picks"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Picks
          </Link>
        </div>

        {/* Pool Header */}
        {pool && (
          <div className="mb-6">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {pool.name}
                  </h1>
                  <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-300">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full font-medium text-xs">
                      {pool.type}
                    </span>
                    <span>S{pool.season}</span>
                    <span>${pool.buyIn}</span>
                    <span>{pool.maxEntries} max</span>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pool.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {pool.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              {pool.description && (
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                  {pool.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-800 dark:text-red-200 whitespace-pre-line">
              {error}
            </p>
          </div>
        )}

        {/* File Upload Modal */}
        {showImageUpload && (
          <div className="mb-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="p-4 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-blue-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Upload Week {selectedWeek} Pool Spreads
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Upload an image containing betting spreads for this pool.
                  The system will match them to existing games and create
                  pool-specific betting lines.
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImage ? 'Processing...' : 'Choose Image'}
                  </label>
                  <button
                    onClick={() => setShowImageUpload(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Supported formats: PNG, JPG, JPEG (max 10MB)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Control Panel or Points Plus Strategy or Spread Management */}
        {pool && pool.type === 'POINTS_PLUS' ? (
          <div className="mb-8">
            <PointsPlusStrategyAdvisor
              poolId={pool.id}
              week={selectedWeek}
              season={pool.season}
            />
          </div>
        ) : pool ? (
          <div className="mb-8">
            <ControlPanel
              poolId={pool.id}
              onWeightsChange={handleWeightsChange}
            />
          </div>
        ) : null}

        {/* No Games Message */}
        {games.length === 0 && pool?.type !== 'POINTS_PLUS' && (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Games & AI Recommendations
                </h2>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {weeks.map((week) => (
                    <option key={week} value={week}>
                      Week {week}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleFetchExternalData}
                  disabled={fetchingExternalData}
                  className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetchingExternalData ? 'Fetching...' : 'Fetch Games'}
                </button>
              </div>
            </div>
            
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600"
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
              <p className="text-gray-500 dark:text-gray-400 font-medium">No games found for Week {selectedWeek}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Use "Fetch Games" to load ESPN game schedule
              </p>
            </div>
          </div>
        )}

        {/* Sortable Games & Recommendations Table */}
        {games.length > 0 && pool?.type !== 'POINTS_PLUS' && (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Games & AI Recommendations
                </h2>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {weeks.map((week) => (
                    <option key={week} value={week}>
                      Week {week}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleFetchExternalData}
                  disabled={fetchingExternalData || games.length === 0}
                  className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetchingExternalData ? 'Fetching...' : 'Update Data'}
                </button>
                {pool?.type === 'ATS' && (
                  <>
                    {/* Compact CSV Upload */}
                    <input
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload" 
                      className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      CSV
                    </label>

                    {/* Compact Image Upload */}
                    <button
                      onClick={() => setShowImageUpload(true)}
                      disabled={uploadingImage}
                      className={`px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                        uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingImage ? 'Processing...' : 'Upload'}
                    </button>

                    {/* Compact Edit Spreads */}
                    <button
                      onClick={handleEditExistingSpreads}
                      disabled={uploadedSpreads.length === 0}
                      className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Edit ({uploadedSpreads.length})
                    </button>
                  </>
                )}
                {loadingRecommendations && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
                {loadingUploadedSpreads && (
                  <div className="text-xs text-gray-500">Loading spreads...</div>
                )}
              </div>
            </div>

            {/* Sortable Table */}
            <div className="overflow-x-auto">
              {(() => {
                // Combine games with recommendations
                const gameRecommendations = new Map()
                if (recommendations && recommendations.recommendations) {
                  recommendations.recommendations.forEach((rec: any) => {
                    gameRecommendations.set(rec.game.id, rec)
                  })
                }

                // Create maps for uploaded spreads 
                const gameUploadedSpreads = new Map()
                uploadedSpreads.forEach((spread: any) => {
                  gameUploadedSpreads.set(spread.gameId, spread)
                })

                // Create sortable data
                const sortableGames = games.map((game: any) => {
                  const rec = gameRecommendations.get(game.id)
                  const uploadedSpread = gameUploadedSpreads.get(game.id)
                  return {
                    ...game,
                    recommendation: rec,
                    confidence: rec?.recommendation.confidence || 0,
                    spread: rec?.line?.spread || null,
                    uploadedSpread: uploadedSpread?.spread || null,
                    strength: rec?.recommendation.strength || null,
                    pickedTeam:
                      rec?.recommendation.pick === 'HOME'
                        ? game.homeTeam.nflAbbr
                        : game.awayTeam.nflAbbr,
                    weather: null, // TODO: Add weather data
                  }
                })

                // Sort games using state from component level
                const sortedGames = [...sortableGames].sort((a, b) => {
                  let aVal, bVal

                  switch (sortField) {
                    case 'confidence':
                      aVal = a.confidence
                      bVal = b.confidence
                      break
                    case 'kickoff':
                      aVal = new Date(a.kickoff).getTime()
                      bVal = new Date(b.kickoff).getTime()
                      break
                    case 'spread':
                      aVal = a.spread || 0
                      bVal = b.spread || 0
                      break
                    case 'matchup':
                      aVal = `${a.awayTeam.nflAbbr} @ ${a.homeTeam.nflAbbr}`
                      bVal = `${b.awayTeam.nflAbbr} @ ${b.homeTeam.nflAbbr}`
                      break
                    default:
                      aVal = a.confidence
                      bVal = b.confidence
                  }

                  if (sortDirection === 'asc') {
                    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
                  } else {
                    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
                  }
                })

                const handleSort = (field: string) => {
                  if (sortField === field) {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                  } else {
                    setSortField(field)
                    setSortDirection(field === 'confidence' ? 'desc' : 'asc')
                  }
                }

                const SortIcon = ({ field }: { field: string }) => {
                  if (sortField !== field) {
                    return <span className="text-gray-300">↕</span>
                  }
                  return (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )
                }

                return (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th
                          className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          onClick={() => handleSort('matchup')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Matchup</span>
                            <SortIcon field="matchup" />
                          </div>
                        </th>
                        <th
                          className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          onClick={() => handleSort('kickoff')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Date/Time</span>
                            <SortIcon field="kickoff" />
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Weather
                        </th>
                        {pool?.type !== 'SU' && (
                          <>
                            <th
                              className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              onClick={() => handleSort('spread')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>ESPN Spread</span>
                                <SortIcon field="spread" />
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                              <span className="text-green-600 dark:text-green-400">Uploaded Spread</span>
                            </th>
                          </>
                        )}
                        <th
                          className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          onClick={() => handleSort('confidence')}
                        >
                          <div className="flex items-center justify-center space-x-1">
                            <span>Confidence</span>
                            <SortIcon field="confidence" />
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Strength
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          AI Pick
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedGames.map((game: any) => {
                        const rec = game.recommendation

                        // Weather icon logic
                        const getWeatherIcon = () => {
                          // Known domed/retractable roof stadiums
                          const domedStadiums = [
                            'AT&T Stadium',
                            'Mercedes-Benz Stadium',
                            'U.S. Bank Stadium',
                            'Lucas Oil Stadium',
                            'Allegiant Stadium',
                            'SoFi Stadium',
                            'Caesars Superdome',
                            'State Farm Stadium',
                            'Ford Field',
                          ]
                          const isDome = domedStadiums.some(
                            (stadium) =>
                              game.venue?.includes(stadium.split(' ')[0]) ||
                              game.venue?.includes(stadium)
                          )

                          if (isDome) {
                            return (
                              <Tippy
                                content={
                                  <div className="text-center">
                                    <div className="font-semibold">
                                      Domed Stadium
                                    </div>
                                    <div className="text-sm text-gray-300">
                                      {game.venue}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      Weather conditions don&apos;t affect
                                      gameplay
                                    </div>
                                  </div>
                                }
                                theme="dark"
                                arrow={true}
                              >
                                <Building2 className="w-6 h-6 text-gray-600 cursor-help hover:text-gray-500 transition-colors" />
                              </Tippy>
                            )
                          }

                          // Check for actual weather data in apiRefs
                          const weatherData = (game as any).apiRefs?.weather
                          if (weatherData && weatherData.conditions) {
                            const condition =
                              weatherData.conditions.toLowerCase()
                            const temp = weatherData.temperature
                              ? `${Math.round(weatherData.temperature)}°F`
                              : ''
                            const humidity = weatherData.humidity
                              ? `${Math.round(weatherData.humidity * 100)}%`
                              : ''
                            const windSpeed = weatherData.windSpeed
                              ? `${weatherData.windSpeed} mph`
                              : ''
                            const windDir = weatherData.windDirection || ''
                            const precipChance = weatherData.precipitationChance
                              ? `${Math.round(weatherData.precipitationChance * 100)}%`
                              : ''

                            // Weather condition to icon mapping
                            let WeatherIcon = Cloud // default
                            let iconColor = 'text-gray-500'

                            if (
                              condition.includes('rain') ||
                              condition.includes('shower')
                            ) {
                              WeatherIcon = CloudRain
                              iconColor = 'text-blue-500'
                            } else if (condition.includes('drizzle')) {
                              WeatherIcon = CloudDrizzle
                              iconColor = 'text-blue-400'
                            } else if (
                              condition.includes('snow') ||
                              condition.includes('blizzard')
                            ) {
                              WeatherIcon = CloudSnow
                              iconColor = 'text-blue-200'
                            } else if (
                              condition.includes('thunder') ||
                              condition.includes('storm')
                            ) {
                              WeatherIcon = Zap
                              iconColor = 'text-yellow-500'
                            } else if (
                              condition.includes('fog') ||
                              condition.includes('mist')
                            ) {
                              WeatherIcon = CloudFog
                              iconColor = 'text-gray-400'
                            } else if (condition.includes('wind')) {
                              WeatherIcon = Wind
                              iconColor = 'text-gray-600'
                            } else if (condition.includes('cloud')) {
                              WeatherIcon = Cloud
                              iconColor = 'text-gray-500'
                            } else if (
                              condition.includes('clear') ||
                              condition.includes('sun')
                            ) {
                              WeatherIcon = Sun
                              iconColor = 'text-yellow-500'
                            }

                            return (
                              <Tippy
                                content={
                                  <div className="text-center max-w-xs">
                                    <div className="font-semibold text-white capitalize mb-1">
                                      {condition}
                                    </div>
                                    <div className="text-sm text-gray-200 mb-2">
                                      {game.venue}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      {temp && (
                                        <div className="flex items-center space-x-1">
                                          <Thermometer className="w-3 h-3 text-orange-400" />
                                          <div>
                                            <span className="text-blue-300">
                                              Temperature:
                                            </span>
                                            <br />
                                            <span className="font-medium">
                                              {temp}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      {precipChance && (
                                        <div className="flex items-center space-x-1">
                                          <Droplets className="w-3 h-3 text-blue-400" />
                                          <div>
                                            <span className="text-blue-300">
                                              Rain Chance:
                                            </span>
                                            <br />
                                            <span className="font-medium">
                                              {precipChance}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      {windSpeed && (
                                        <div className="flex items-center space-x-1">
                                          <Wind className="w-3 h-3 text-gray-400" />
                                          <div>
                                            <span className="text-blue-300">
                                              Wind:
                                            </span>
                                            <br />
                                            <span className="font-medium">
                                              {windSpeed} {windDir}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      {humidity && (
                                        <div className="flex items-center space-x-1">
                                          <Eye className="w-3 h-3 text-teal-400" />
                                          <div>
                                            <span className="text-blue-300">
                                              Humidity:
                                            </span>
                                            <br />
                                            <span className="font-medium">
                                              {humidity}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    {weatherData.source && (
                                      <div className="text-xs text-gray-400 mt-2">
                                        Source: {weatherData.source}
                                      </div>
                                    )}
                                  </div>
                                }
                                theme="dark"
                                arrow={true}
                                maxWidth={300}
                              >
                                <WeatherIcon
                                  className={`w-6 h-6 cursor-help hover:scale-110 transition-all ${iconColor}`}
                                />
                              </Tippy>
                            )
                          }

                          // Default outdoor weather (no data available)
                          return (
                            <Tippy
                              content={
                                <div className="text-center">
                                  <div className="font-semibold">
                                    Outdoor Stadium
                                  </div>
                                  <div className="text-sm text-gray-300">
                                    {game.venue}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    Weather data not available
                                    <br />
                                    (Game too far in advance for forecast)
                                  </div>
                                </div>
                              }
                              theme="dark"
                              arrow={true}
                            >
                              <Cloud className="w-6 h-6 text-gray-500 cursor-help hover:text-gray-400 transition-colors" />
                            </Tippy>
                          )
                        }

                        return (
                          <React.Fragment key={game.id}>
                            <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      <span
                                        className={
                                          rec &&
                                          rec.recommendation.pick === 'AWAY'
                                            ? 'font-bold text-purple-600 dark:text-purple-400'
                                            : ''
                                        }
                                      >
                                        {game.awayTeam.nflAbbr}
                                      </span>
                                      {' @ '}
                                      <span
                                        className={
                                          rec &&
                                          rec.recommendation.pick === 'HOME'
                                            ? 'font-bold text-blue-600 dark:text-blue-400'
                                            : ''
                                        }
                                      >
                                        {game.homeTeam.nflAbbr}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {game.awayTeam.name} at{' '}
                                      {game.homeTeam.name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {new Date(game.kickoff).toLocaleDateString(
                                    'en-US',
                                    {
                                      month: 'short',
                                      day: 'numeric',
                                      weekday: 'short',
                                    }
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(game.kickoff).toLocaleTimeString(
                                    [],
                                    {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )}{' '}
                                  ET
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                {getWeatherIcon()}
                              </td>
                              {pool?.type !== 'SU' && (
                                <>
                                  {/* ESPN Spread Column */}
                                  <td className="py-4 px-4">
                                    {rec?.line?.spread ? (
                                      <div className="text-sm">
                                        {rec.line.spread < 0 ? (
                                          // Home team favored (negative spread means home is favored)
                                          <div>
                                            <div className="font-bold text-blue-600 dark:text-blue-400">
                                              {game.homeTeam.nflAbbr}{' '}
                                              {rec.line.spread}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                              {game.awayTeam.nflAbbr} +
                                              {Math.abs(rec.line.spread)}
                                            </div>
                                          </div>
                                        ) : (
                                          // Away team favored (positive spread means away is favored)
                                          <div>
                                            <div className="font-bold text-purple-600 dark:text-purple-400">
                                              {game.awayTeam.nflAbbr} -
                                              {rec.line.spread}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                              {game.homeTeam.nflAbbr} +
                                              {rec.line.spread}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-gray-400 dark:text-gray-500">
                                        No line
                                      </div>
                                    )}
                                  </td>

                                  {/* Uploaded Spread Column */}
                                  <td className="py-4 px-4">
                                    {game.uploadedSpread !== null ? (
                                      <div className="text-sm">
                                        {game.uploadedSpread < 0 ? (
                                          // Home team favored (negative spread means home is favored)
                                          <div>
                                            <div className="font-bold text-green-600 dark:text-green-400">
                                              {game.homeTeam.nflAbbr}{' '}
                                              {game.uploadedSpread}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                              {game.awayTeam.nflAbbr} +
                                              {Math.abs(game.uploadedSpread)}
                                            </div>
                                          </div>
                                        ) : (
                                          // Away team favored (positive spread means away is favored)
                                          <div>
                                            <div className="font-bold text-green-600 dark:text-green-400">
                                              {game.awayTeam.nflAbbr} -
                                              {game.uploadedSpread}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                              {game.homeTeam.nflAbbr} +
                                              {game.uploadedSpread}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-gray-400 dark:text-gray-500">
                                        -
                                      </div>
                                    )}
                                  </td>
                                </>
                              )}
                              <td className="py-4 px-4 text-center">
                                {rec ? (
                                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {typeof rec.recommendation.confidence ===
                                    'number'
                                      ? rec.recommendation.confidence.toFixed(1)
                                      : '0.0'}
                                    %
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400 dark:text-gray-500">
                                    -
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4 text-center">
                                {rec ? (
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      rec.recommendation.strength === 'Strong'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                        : rec.recommendation.strength ===
                                            'Moderate'
                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                                  >
                                    {rec.recommendation.strength}
                                  </span>
                                ) : (
                                  <div className="text-xs text-gray-400 dark:text-gray-500">
                                    -
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4 text-right">
                                {rec ? (
                                  <span
                                    className={`px-4 py-2 rounded-lg text-lg font-bold ${
                                      rec.recommendation.pick === 'HOME'
                                        ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-300'
                                    }`}
                                  >
                                    {game.pickedTeam}
                                  </span>
                                ) : (
                                  <div className="text-xs text-gray-400 dark:text-gray-500 text-right">
                                    {pool?.type === 'SU'
                                      ? 'Ready'
                                      : 'Upload spreads'}
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <button
                                  onClick={() =>
                                    setExpandedGameId(
                                      expandedGameId === game.id
                                        ? null
                                        : game.id
                                    )
                                  }
                                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                  {expandedGameId === game.id ? 'Hide' : 'Show'}
                                </button>
                              </td>
                            </tr>
                            {/* Expanded GameProjection Row */}
                            {expandedGameId === game.id && rec && (
                              <tr key={`${game.id}-expanded`}>
                                <td
                                  colSpan={pool?.type === 'SU' ? 7 : 8}
                                  className="py-0 px-4 bg-gray-50 dark:bg-gray-800/50"
                                >
                                  <div className="py-4">
                                    {(() => {
                                      const projection =
                                        transformRecommendationToModelOutput(
                                          game,
                                          rec
                                        )
                                      if (!projection) return null

                                      return (
                                        <GameProjection
                                          projection={projection}
                                          gameDetails={{
                                            homeTeam: {
                                              name: game.homeTeam.name,
                                              nflAbbr: game.homeTeam.nflAbbr,
                                            },
                                            awayTeam: {
                                              name: game.awayTeam.name,
                                              nflAbbr: game.awayTeam.nflAbbr,
                                            },
                                            kickoffTime: new Date(game.kickoff),
                                            venue: game.venue,
                                          }}
                                        />
                                      )
                                    })()}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                )
              })()}
            </div>

            {/* No Data State */}
            {(!recommendations ||
              recommendations.recommendations.length === 0) && (
              <div className="text-center py-8 mt-6 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <p className="font-medium">No AI recommendations yet</p>
                <p className="text-sm mt-1">
                  {pool?.type === 'SU'
                    ? 'Fetch odds & weather data to get straight-up AI pick suggestions'
                    : 'Upload pool spreads to get AI-powered pick suggestions with confidence ratings'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
