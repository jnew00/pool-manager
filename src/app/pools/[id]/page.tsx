'use client'

import React from 'react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import Swal from 'sweetalert2'
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
import { WeeklyPickScreen } from '@/features/picks/components/WeeklyPickScreen'
import type { ModelOutput } from '@/lib/models/types'
import { getCurrentNFLWeek } from '@/lib/utils/nfl-week'

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
  lines?: Array<{
    id: string
    spread: string
    total: string
    source: string
  }>
}

export default function PoolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const poolId = params?.id as string

  const [pool, setPool] = useState<Pool | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedWeek, setSelectedWeek] = useState(() => getCurrentNFLWeek())
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
  const [number1PoolGames, setNumber1PoolGames] = useState<any[]>([])
  const [lastNumber1PoolUrl, setLastNumber1PoolUrl] = useState<string>('')
  const [userEntry, setUserEntry] = useState<any>(null)
  const [showPickEntry, setShowPickEntry] = useState(false)
  const [userPicks, setUserPicks] = useState<Map<string, { teamId: string; confidence: number }>>(new Map())
  const [pendingPicks, setPendingPicks] = useState<Map<string, { teamId: string; confidence: number }>>(new Map())
  const [isSavingPicks, setIsSavingPicks] = useState(false)

  // Generate or get a consistent user ID
  const userId = typeof window !== 'undefined'
    ? localStorage.getItem('userId') || (() => {
        const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('userId', id)
        return id
      })()
    : 'user-default'

  useEffect(() => {
    if (poolId) {
      fetchPool()
      fetchOrCreateUserEntry()
    }
  }, [poolId])

  useEffect(() => {
    if (pool) {
      fetchGames()
      fetchRecommendations(customWeights)
      if (pool.type === 'ATS') {
        fetchSpreadsData()
      }
      // Try to create entry again now that pool is loaded
      if (!userEntry) {
        fetchOrCreateUserEntry()
      }
    }
  }, [pool, selectedWeek])

  // Load existing picks when entry is available
  useEffect(() => {
    if (userEntry) {
      loadUserPicks()
    }
  }, [userEntry, selectedWeek])

  const loadUserPicks = async () => {
    if (!userEntry) return

    try {
      const response = await fetch(`/api/picks?entryId=${userEntry.id}`)
      const data = await response.json()

      if (response.ok && data.data) {
        const picksMap = new Map()
        data.data.forEach((pick: any) => {
          picksMap.set(pick.gameId, {
            teamId: pick.teamId,
            confidence: pick.confidence
          })
        })
        setUserPicks(picksMap)
      }
    } catch (err) {
      console.error('Error loading user picks:', err)
    }
  }

  // Auto-populate pending picks when AI recommendations change
  useEffect(() => {
    if (!recommendations?.recommendations) return

    const newPendingPicks = new Map<string, { teamId: string; confidence: number }>()

    for (const rec of recommendations.recommendations) {
      const gameId = rec.game.id
      const recommendedTeamId = rec.recommendation.pick === 'HOME'
        ? rec.game.homeTeam.id
        : rec.game.awayTeam.id

      // Check if user has already saved a pick for this game
      const existingSavedPick = userPicks.get(gameId)
      if (existingSavedPick) {
        // Keep the saved pick
        newPendingPicks.set(gameId, existingSavedPick)
      } else {
        // Use AI recommendation
        newPendingPicks.set(gameId, {
          teamId: recommendedTeamId,
          confidence: rec.recommendation.confidence || 50
        })
      }
    }

    setPendingPicks(newPendingPicks)
  }, [recommendations, userPicks])

  const handleWeightsChange = (newWeights: any) => {
    console.log('[PoolDetail] Weights changed, fetching fresh recommendations:', newWeights)
    setCustomWeights(newWeights)
    // Immediately fetch new recommendations with updated weights
    if (pool) {
      fetchRecommendations(newWeights)
    }
  }

  const handleNumber1PoolScrape = async (url: string) => {
    if (!pool) return
    
    try {
      setUploadingImage(true) // Reuse this loading state
      setError(null)

      const response = await fetch('/api/upload/number1pool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url,
          poolId: pool.id,
          season: pool.season,
          week: selectedWeek
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to scrape Number1Pool')
      }

      console.log(`[Number1Pool Frontend] API returned:`, result);

      // Store Number1Pool games for Chrome extension
      if (result.number1poolGames && result.number1poolGames.length > 0) {
        setNumber1PoolGames(result.number1poolGames)
        setLastNumber1PoolUrl(url)
        console.log('Stored Number1Pool games for extension:', result.number1poolGames)

        // Trigger localStorage storage with the freshly imported games
        if (recommendations?.recommendations) {
          // Call storage directly with the new games (don't wait for state update)
          storeRecommendationsForExtension(recommendations.recommendations, result.number1poolGames);
        }
      }

      // Show success toast
      Swal.fire({
        icon: 'success',
        title: 'Import Successful!',
        html: `
          <div class="text-left">
            <p class="mb-2">✅ <strong>${result.spreadsCount}</strong> spreads imported</p>
            <p class="mb-2">✅ <strong>${result.matchedCount}</strong> matched to games</p>
            ${result.unmatchedCount > 0 ? `<p class="text-orange-600">⚠️ <strong>${result.unmatchedCount}</strong> could not be matched</p>` : ''}
          </div>
        `,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      fetchSpreadsData() // Refresh the spreads data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to scrape Number1Pool'
      setError(errorMsg)
      Swal.fire({
        icon: 'error',
        title: 'Import Failed',
        text: errorMsg,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setUploadingImage(false)
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

      // Success toast
      Swal.fire({
        icon: 'success',
        title: 'Spreads Saved!',
        text: `Successfully saved ${matchedSpreads.length} spreads`,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      // Close modal and refresh
      setShowEditableSpreads(false)
      setEditableSpreads(null)

      // Refresh data
      fetchGames()
      fetchRecommendations(customWeights)
      fetchSpreadsData()

    } catch (error) {
      console.error('Error saving spreads:', error)
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: 'Failed to save spreads. Please try again.',
        confirmButtonColor: '#ef4444'
      });
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
      Swal.fire({
        icon: 'error',
        title: 'Load Failed',
        text: 'Failed to load existing spreads for editing',
        confirmButtonColor: '#ef4444'
      });
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

  const fetchOrCreateUserEntry = async () => {
    try {
      // First, try to get existing entries for this user
      const response = await fetch(`/api/entries?poolId=${poolId}&userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data.length > 0) {
          setUserEntry(data.data[0]) // Use first entry
          return
        }
      }

      // If no entry exists, wait for pool to be loaded then create one
      if (!pool) {
        console.log('[PoolDetail] Waiting for pool to load before creating entry')
        return
      }

      // If no entry exists, create one
      const createResponse = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId,
          userId,
          name: `Entry ${Date.now()}`,
          season: pool.season
        })
      })

      if (createResponse.ok) {
        const createData = await createResponse.json()
        setUserEntry(createData.data)
        console.log('[PoolDetail] Created new entry:', createData.data.id)
      } else {
        const errorData = await createResponse.json()
        console.error('[PoolDetail] Failed to create entry:', errorData)
      }
    } catch (err) {
      console.error('[PoolDetail] Failed to fetch/create entry:', err)
    }
  }

  const fetchGames = async () => {
    try {
      const url = `/api/games?season=${pool?.season}&week=${selectedWeek}&poolId=${poolId}`
      console.log('[PoolDetail] fetchGames called:', url)
      const response = await fetch(url)
      const data = await response.json()
      console.log('[PoolDetail] fetchGames response:', {
        ok: response.ok,
        status: response.status,
        gamesCount: data.data?.length || 0
      })

      if (response.ok) {
        setGames(data.data || [])
        console.log('[PoolDetail] Games state set to:', data.data?.length || 0, 'games')
      } else {
        setGames([])
        console.log('[PoolDetail] Response not OK, games set to empty')
      }
    } catch (err) {
      console.error('[PoolDetail] Failed to fetch games:', err)
      setGames([])
    }
  }

  // Helper function to store recommendations in localStorage for Chrome extension
  const storeRecommendationsForExtension = (recommendations: any[], n1pGames: any[], showToast = true) => {
    if (!recommendations || recommendations.length === 0 || n1pGames.length === 0) {
      console.log('[storeRecs] Skipping storage - missing data:', {
        recommendationsCount: recommendations?.length || 0,
        n1pGamesCount: n1pGames.length
      });
      return;
    }

    console.log('[storeRecs] Storing recommendations for extension:', {
      recommendationsCount: recommendations.length,
      n1pGamesCount: n1pGames.length
    });

    // DEBUG: Log all recommendation matchups
    console.log('[storeRecs] All recommendation matchups:', recommendations.map((rec: any) => ({
      home: rec.game?.homeTeam?.nflAbbr || rec.game?.homeTeam?.name,
      away: rec.game?.awayTeam?.nflAbbr || rec.game?.awayTeam?.name
    })));

    const atsOuData: any[] = [];
    const pointsPlusData: any[] = [];

    // Helper to check if abbreviation matches team name
    // "LAR" matches "Los Angeles Rams" (L-A-R from first letters)
    // "SF" matches "San Francisco 49ers" (S-F from first letters)
    const abbrMatchesTeam = (abbr: string, teamName: string) => {
      if (!abbr || !teamName) return false;
      const upper = teamName.toUpperCase();
      const words = upper.split(/\s+/).filter(w => w.length > 0);

      // Check if abbr matches first letters of words
      if (words.length >= abbr.length) {
        const initials = words.slice(0, abbr.length).map(w => w[0]).join('');
        if (initials === abbr) return true;
      }

      // Also check if any single word equals or contains the abbreviation
      return words.some(word => word === abbr || word.includes(abbr));
    };

    n1pGames.forEach((game, index) => {
      // Find AI recommendation for this game
      // Normalize team names for matching: lowercase, remove spaces/punctuation
      const normalizeTeam = (team: string) =>
        team?.toLowerCase().replace(/[^a-z]/g, '') || '';

      const n1pHomeNorm = normalizeTeam(game.homeTeam);
      const n1pAwayNorm = normalizeTeam(game.awayTeam);

      // DEBUG: Log first game matching attempt
      if (index === 0) {
        console.log('[storeRecs] First N1P game:', {
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          homeNorm: n1pHomeNorm,
          awayNorm: n1pAwayNorm
        });
        console.log('[storeRecs] First recommendation:', {
          homeTeam: recommendations[0]?.game?.homeTeam,
          awayTeam: recommendations[0]?.game?.awayTeam,
          homeNorm: normalizeTeam(recommendations[0]?.game?.homeTeam?.name || recommendations[0]?.game?.homeTeam?.nflAbbr || ''),
          awayNorm: normalizeTeam(recommendations[0]?.game?.awayTeam?.name || recommendations[0]?.game?.awayTeam?.nflAbbr || '')
        });
      }

      const gameRec = recommendations.find((rec: any) => {
        // Use nflAbbr (LAR, SF, etc.) - these are 2-3 letter abbreviations
        const recHomeAbbr = rec.game?.homeTeam?.nflAbbr || '';
        const recAwayAbbr = rec.game?.awayTeam?.nflAbbr || '';

        // For Number1Pool, extract team abbreviation or city name
        // "LOS ANGELES RAMS" -> check if contains "LAR" or "RAMS" or "LOS"
        // "San Francisco 49ers" -> check if contains "SF" or "49ERS" or "SAN"

        const homeMatch = recHomeAbbr && abbrMatchesTeam(recHomeAbbr, game.homeTeam);
        const awayMatch = recAwayAbbr && abbrMatchesTeam(recAwayAbbr, game.awayTeam);

        const matched = homeMatch && awayMatch;

        // DEBUG: Log matching attempts for first game
        if (index === 0) {
          console.log('[storeRecs] Matching attempt:', {
            n1pHome: game.homeTeam,
            n1pAway: game.awayTeam,
            recHome: recHomeAbbr,
            recAway: recAwayAbbr,
            homeMatch,
            awayMatch,
            matched
          });
        }

        return matched;
      });

      // Convert AI pick to extension format for SPREAD pick
      let recommendation = null;
      let recommendedTeam = null;

      if (gameRec?.recommendation?.pick) {
        recommendedTeam = gameRec.recommendation.team;
        if (recommendedTeam === game.favorite) {
          recommendation = '1';
        } else if (recommendedTeam === game.underdog) {
          recommendation = '2';
        }
      } else if (game.aiPick) {
        if (game.aiPick === 'HOME') {
          recommendedTeam = game.homeTeam;
          const normalizedHome = game.homeTeam?.toLowerCase().replace(/[^a-z]/g, '') || '';
          const normalizedFav = game.favorite?.toLowerCase().replace(/[^a-z]/g, '') || '';

          if (normalizedHome.includes(normalizedFav.split(' ')[0]) || normalizedFav.includes(normalizedHome.split(' ')[0])) {
            recommendation = '1';
          } else {
            recommendation = '2';
          }
        } else if (game.aiPick === 'AWAY') {
          recommendedTeam = game.awayTeam;
          const normalizedAway = game.awayTeam?.toLowerCase().replace(/[^a-z]/g, '') || '';
          const normalizedFav = game.favorite?.toLowerCase().replace(/[^a-z]/g, '') || '';

          if (normalizedAway.includes(normalizedFav.split(' ')[0]) || normalizedFav.includes(normalizedAway.split(' ')[0])) {
            recommendation = '1';
          } else {
            recommendation = '2';
          }
        }
      }

      // Extract only the fields we need as strings
      const favoriteStr = String(game.favorite || '');
      const underdogStr = String(game.underdog || '');
      const homeTeamStr = String(game.homeTeam || '');
      const awayTeamStr = String(game.awayTeam || '');
      const spreadNum = Number(game.spread) || 0;
      const totalNum = Number(game.total) || null;

      // Add spread pick to ATS/O-U data
      atsOuData.push({
        favorite: favoriteStr,
        underdog: underdogStr,
        spread: spreadNum,
        homeTeam: homeTeamStr,
        awayTeam: awayTeamStr,
        pickType: 'SPREAD',
        aiPick: gameRec?.recommendation?.pick || game.aiPick || null,
        confidence: gameRec?.recommendation?.confidence || game.confidence || null,
        recommendedTeam: recommendedTeam,
        recommendation: recommendation,
        sortOrder: game.sortOrder || (index + 1)
      });

      // Add over/under pick if total is available
      const overUnderPred = gameRec?.recommendation?.tieBreakerData?.overUnderPrediction;
      if (totalNum && overUnderPred) {
        atsOuData.push({
          favorite: favoriteStr,
          underdog: underdogStr,
          spread: spreadNum,
          total: totalNum,
          homeTeam: homeTeamStr,
          awayTeam: awayTeamStr,
          pickType: 'OVER_UNDER',
          aiPick: overUnderPred.recommendation,
          confidence: overUnderPred.confidence,
          recommendedTeam: overUnderPred.recommendation,
          recommendation: overUnderPred.recommendation === 'OVER' ? 'OVER' : 'UNDER',
          sortOrder: game.sortOrder || (index + 1)
        });
      }

      // Add Points Plus pick (uses same recommendation as spread pick)
      pointsPlusData.push({
        favorite: favoriteStr,
        underdog: underdogStr,
        spread: spreadNum,
        homeTeam: homeTeamStr,
        awayTeam: awayTeamStr,
        pickType: 'POINTS_PLUS',
        aiPick: gameRec?.recommendation?.pick || game.aiPick || null,
        confidence: gameRec?.recommendation?.confidence || game.confidence || null,
        recommendedTeam: recommendedTeam,
        recommendation: recommendation,
        sortOrder: game.sortOrder || (index + 1)
      });
    });

    // Store ATS/O-U picks separately from Points Plus picks
    localStorage.removeItem('poolmanagerExtensionData_ATS');

    localStorage.setItem('poolmanagerExtensionData_ATS', JSON.stringify({
      games: atsOuData,
      lastUpdate: Date.now(),
      week: selectedWeek,
      poolId: pool?.id
    }));

    // IMPORTANT: Don't overwrite Points Plus data from ATS page
    // Points Plus should only be set from the Points Plus page where user makes selections
    // Only store PP data if we're on an ATS pool (not overwriting manual PP selections)
    // Actually, let's NOT store PP data here at all - it should only come from PP page
    // localStorage.setItem('poolmanagerExtensionData_PP', JSON.stringify({
    //   games: pointsPlusData,
    //   lastUpdate: Date.now(),
    //   week: selectedWeek,
    //   poolId: pool?.id
    // }));

    console.log('[storeRecs] Stored extension data:', {
      atsCount: atsOuData.length
    });

    // Show a brief success toast notification (only for ATS pool automatic storage)
    if (showToast && pool?.type === 'ATS') {
      Swal.fire({
        icon: 'success',
        title: 'ATS Picks Saved!',
        text: `${atsOuData.length} ATS/O-U picks saved for extension`,
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  };

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

        // Add cache-busting timestamp when custom weights are used
        url += `&_t=${Date.now()}`
      }

      console.log('[PoolDetail] Fetching recommendations from:', url)
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        console.log('[PoolDetail] Received recommendations:', data.data?.recommendations?.length, 'games')
        setRecommendations(data.data)

        // Store AI recommendations in localStorage for Chrome extension
        if (data.data?.recommendations) {
          storeRecommendationsForExtension(data.data.recommendations, number1PoolGames);
        }
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

        // Check if Number1Pool spreads exist and auto-populate number1PoolGames
        const number1PoolSpreads = (uploadedData.spreads || []).filter((spread: any) =>
          spread.source === 'number1pool-scraper'
        )

        if (number1PoolSpreads.length > 0) {
          console.log(`[PoolManager] Found ${number1PoolSpreads.length} existing Number1Pool spreads`)

          // Convert spreads back to Number1Pool game format for the extension
          const reconstructedGames = number1PoolSpreads.map((spread: any, index: number) => ({
            week: index + 1, // Use index as week number
            day: 'TBD',
            time: 'TBD',
            favorite: spread.spread_for_home < 0 ? spread.home_team : spread.away_team,
            underdog: spread.spread_for_home < 0 ? spread.away_team : spread.home_team,
            spread: Math.abs(spread.spread_for_home),
            homeTeam: spread.home_team,
            awayTeam: spread.away_team,
            homeSpread: spread.spread_for_home,
            sortOrder: index + 1
          }))

          setNumber1PoolGames(reconstructedGames)
          console.log('Auto-populated Number1Pool games from existing spreads:', reconstructedGames)
        }
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

        const warningsHtml = errors && errors.length > 0
          ? `<div class="mt-2 text-left text-sm text-orange-600"><strong>Warnings:</strong><ul class="list-disc ml-4">${errors.map((e: string) =>
              `<li>${e}</li>`
            ).join('')}</ul></div>`
          : '';

        Swal.fire({
          icon: errors && errors.length > 0 ? 'warning' : 'success',
          title: 'Data Updated!',
          html: `
            <div class="text-left">
              <p>✅ <strong>${gamesFetched}</strong> games processed</p>
              <p>✅ <strong>${oddsCreated}</strong> odds entries created</p>
              <p>✅ <strong>${weatherUpdated}</strong> games updated with weather</p>
              ${warningsHtml}
            </div>
          `,
          confirmButtonColor: '#10b981'
        });

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

      // Show success toast with details
      const unmatchedHtml = result.data.unmatched && result.data.unmatched.length > 0
        ? `<div class="mt-2 text-left text-sm"><strong>Unmatched:</strong><ul class="list-disc ml-4">${result.data.unmatched.map((s: any) =>
            `<li>${s.away_team} @ ${s.home_team} (${s.spread_for_home})</li>`
          ).join('')}</ul></div>`
        : '';

      Swal.fire({
        icon: 'success',
        title: 'Image Processed!',
        html: `
          <div class="text-left">
            <p>✅ <strong>${spreadsExtracted}</strong> spreads extracted</p>
            <p>✅ <strong>${gamesMatched}</strong> matched to games</p>
            ${gamesUnmatched > 0 ? `<p class="text-orange-600">⚠️ <strong>${gamesUnmatched}</strong> unmatched</p>` : ''}
            <p class="text-sm text-gray-600 mt-2">OCR: ${result.data.ocrConfidence.toFixed(1)}% | ${result.data.llmProvider}</p>
            ${unmatchedHtml}
          </div>
        `,
        confirmButtonColor: '#10b981'
      });

      // Refresh games list, recommendations, and spreads data
      fetchGames()
      fetchRecommendations(customWeights)
      fetchSpreadsData()
    } catch (err) {
      console.error('[Image Upload] Error occurred:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image'
      setError(`Image upload failed: ${errorMessage}`)
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: errorMessage,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setUploadingImage(false)
      setShowImageUpload(false)
    }
  }

  const weeks = Array.from({ length: 18 }, (_, i) => i + 1) // NFL weeks 1-18

  // Helper function to calculate tiebreaker data
  const calculateTiebreakerData = () => {
    if (!recommendations?.recommendations || recommendations.recommendations.length === 0) {
      return {
        mondayNightTotal: null,
        weeklyTotal: null,
        mondayNightGame: null,
      }
    }

    let weeklyTotal = 0
    let mondayNightTotal = null
    let mondayNightGame = null

    recommendations.recommendations.forEach((rec: any) => {
      const tieBreakerData = rec.recommendation?.tieBreakerData
      if (tieBreakerData?.overUnderPrediction?.prediction) {
        const gameTotal = tieBreakerData.overUnderPrediction.prediction
        weeklyTotal += gameTotal

        // Check if this is Monday Night Football
        const gameDate = new Date(rec.game.kickoff)
        const dayOfWeek = gameDate.getDay() // 0=Sunday, 1=Monday
        if (dayOfWeek === 1) { // Monday
          mondayNightTotal = gameTotal
          mondayNightGame = `${rec.game.awayTeam.nflAbbr} @ ${rec.game.homeTeam.nflAbbr}`
        }
      }
    })

    return {
      mondayNightTotal,
      weeklyTotal: weeklyTotal > 0 ? Math.round(weeklyTotal) : null,
      mondayNightGame,
    }
  }

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
              number1PoolGames={number1PoolGames}
              recommendations={recommendations}
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

                    {/* Compact Number1Pool Scraper */}
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={async () => {
                          const { value: url } = await Swal.fire({
                            title: 'Import from Number1Pool',
                            input: 'text',
                            inputLabel: 'Enter your Number1Pool weekly picks URL',
                            inputValue: lastNumber1PoolUrl || 'https://number1pool.com/picks_weekly.php?user=GatorBait&verify=970622f774ee22dcef22f41487b87fa3',
                            showCancelButton: true,
                            confirmButtonColor: '#10b981',
                            cancelButtonColor: '#6b7280',
                            confirmButtonText: 'Import',
                            inputValidator: (value) => {
                              if (!value) {
                                return 'Please enter a URL'
                              }
                              if (!value.includes('number1pool.com')) {
                                return 'Please enter a valid Number1Pool URL'
                              }
                            }
                          })
                          if (url?.trim()) {
                            handleNumber1PoolScrape(url.trim())
                          }
                        }}
                        disabled={uploadingImage}
                        className={`px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors ${
                          uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingImage ? 'Importing...' : 'Number1Pool'}
                      </button>


                      {/* AI Picks button removed - storage now happens automatically on Number1Pool import and AI weight changes */}
                    </div>

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

                // Create sortable data - expand games with both spread and total into 2 rows
                const sortableGames = games.flatMap((game: any) => {
                  const rec = gameRecommendations.get(game.id)
                  const uploadedSpread = gameUploadedSpreads.get(game.id)

                  const hasSpread = game.lines && game.lines[0]?.spread !== null && game.lines[0]?.spread !== undefined
                  const hasTotal = game.lines && game.lines[0]?.total !== null && game.lines[0]?.total !== undefined

                  const rows = []

                  // For SU pools, show all games regardless of lines
                  if (pool?.type === 'SU') {
                    rows.push({
                      ...game,
                      pickType: 'SU',
                      recommendation: rec,
                      confidence: rec?.recommendation.confidence || 0,
                      spread: null,
                      uploadedSpread: null,
                      strength: rec?.recommendation.strength || null,
                      pickedTeam:
                        rec?.recommendation.pick === 'HOME'
                          ? game.homeTeam.nflAbbr
                          : game.awayTeam.nflAbbr,
                      weather: null,
                    })
                    return rows
                  }

                  // If game has spread, add spread row (for ATS/POINTS_PLUS)
                  if (hasSpread) {
                    rows.push({
                      ...game,
                      pickType: 'SPREAD',
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
                    })
                  }

                  // If game has total, add over/under row
                  if (hasTotal) {
                    // Extract over/under prediction from tieBreakerData
                    const overUnderPred = rec?.recommendation?.tieBreakerData?.overUnderPrediction
                    const ouConfidence = overUnderPred?.confidence || 50
                    const ouRecommendation = overUnderPred?.recommendation || 'OVER'

                    rows.push({
                      ...game,
                      pickType: 'OVER_UNDER',
                      recommendation: rec,
                      confidence: ouConfidence,
                      spread: null, // Over/under doesn't have spread
                      uploadedSpread: null,
                      total: game.lines[0].total,
                      strength: ouConfidence > 60 ? 'Strong' : ouConfidence > 50 ? 'Moderate' : 'Weak',
                      pickedTeam: ouRecommendation,
                      overUnderPrediction: overUnderPred,
                      weather: null,
                    })
                  }

                  return rows
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
                          <React.Fragment key={`${game.id}-${game.pickType || 'SPREAD'}`}>
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
                                  {/* ESPN Spread/Total Column */}
                                  <td className="py-4 px-4">
                                    {game.pickType === 'OVER_UNDER' ? (
                                      // Show total for over/under rows
                                      rec?.line?.total ? (
                                        <div className="text-sm">
                                          <div className="font-bold text-orange-600 dark:text-orange-400">
                                            O/U {Number(rec.line.total).toFixed(1)}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Total
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                          No line
                                        </div>
                                      )
                                    ) : (
                                      // Show spread for spread rows
                                      rec?.line?.spread ? (
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
                                      )
                                    )}
                                  </td>

                                  {/* Uploaded Spread/Total Column */}
                                  <td className="py-4 px-4">
                                    {game.pickType === 'OVER_UNDER' ? (
                                      // Show total for over/under rows
                                      game.total ? (
                                        <div className="text-sm">
                                          <div className="font-bold text-green-600 dark:text-green-400">
                                            O/U {Number(game.total).toFixed(1)}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Total
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                          -
                                        </div>
                                      )
                                    ) : (
                                      // Show spread for spread rows
                                      game.uploadedSpread !== null ? (
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
                                      )
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
                                  (() => {
                                    const recommendedTeamId = rec.recommendation.pick === 'HOME' ? game.homeTeam.id : game.awayTeam.id
                                    const pickedTeamId = pendingPicks.get(game.id)?.teamId || recommendedTeamId
                                    const confidence = rec.recommendation.confidence || 50
                                    const isLocked = userPicks.has(game.id)

                                    const handleTeamClick = (teamId: string) => {
                                      const newPicks = new Map(pendingPicks)
                                      newPicks.set(game.id, { teamId, confidence })
                                      setPendingPicks(newPicks)
                                    }

                                    return (
                                      <div className="flex items-center justify-end gap-2">
                                        {/* Away Team Button */}
                                        <button
                                          onClick={() => handleTeamClick(game.awayTeam.id)}
                                          disabled={isLocked}
                                          className={`px-3 py-2 rounded-lg font-bold text-sm transition-all relative ${
                                            isLocked ? 'opacity-60 cursor-not-allowed' : ''
                                          } ${
                                            pickedTeamId === game.awayTeam.id
                                              ? 'bg-purple-600 text-white shadow-lg scale-105 ring-2 ring-purple-400'
                                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300'
                                          }`}
                                        >
                                          {pickedTeamId === game.awayTeam.id && recommendedTeamId === game.awayTeam.id && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                                              ✓
                                            </span>
                                          )}
                                          {game.awayTeam.nflAbbr}
                                        </button>

                                        <span className="text-gray-400 dark:text-gray-600 font-medium">@</span>

                                        {/* Home Team Button */}
                                        <button
                                          onClick={() => handleTeamClick(game.homeTeam.id)}
                                          disabled={isLocked}
                                          className={`px-3 py-2 rounded-lg font-bold text-sm transition-all relative ${
                                            isLocked ? 'opacity-60 cursor-not-allowed' : ''
                                          } ${
                                            pickedTeamId === game.homeTeam.id
                                              ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-400'
                                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
                                          }`}
                                        >
                                          {pickedTeamId === game.homeTeam.id && recommendedTeamId === game.homeTeam.id && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                                              ✓
                                            </span>
                                          )}
                                          {game.homeTeam.nflAbbr}
                                        </button>
                                      </div>
                                    )
                                  })()
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
                                          pickType={game.pickType || 'SPREAD'}
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

            {/* Tiebreaker Section */}
            {pool && (pool.type === 'ATS' || pool.type === 'SU') && recommendations && recommendations.recommendations.length > 0 && (() => {
              const tiebreakerData = calculateTiebreakerData()
              
              if (!tiebreakerData.weeklyTotal) {
                return null
              }

              return (
                <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Tiebreaker Predictions
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Monday Night Game Total */}
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Monday Night Football
                        </h3>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {tiebreakerData.mondayNightTotal ? 
                          `${tiebreakerData.mondayNightTotal.toFixed(1)} pts` : 
                          'No Monday game'}
                      </div>
                      {tiebreakerData.mondayNightGame && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {tiebreakerData.mondayNightGame}
                        </div>
                      )}
                    </div>

                    {/* Weekly Total */}
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Weekly Total Points
                        </h3>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {tiebreakerData.weeklyTotal.toFixed(1)} pts
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        All games combined
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Predictions based on AI analysis of team performance, weather, injuries, and betting lines
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Lock In Picks Button */}
        {pool && pool.type === 'SU' && userEntry && recommendations?.recommendations && pendingPicks.size > 0 && (
          <div className="mt-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Ready to Lock In?
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {pendingPicks.size} pick{pendingPicks.size !== 1 ? 's' : ''} selected • {userPicks.size} already locked
                </p>
              </div>
              <button
                onClick={async () => {
                  const result = await Swal.fire({
                    title: 'Lock In Your Picks?',
                    text: `Save ${pendingPicks.size} pick(s) for Week ${selectedWeek}. This cannot be undone.`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#10b981',
                    cancelButtonColor: '#6b7280',
                    confirmButtonText: 'Yes, Lock In!',
                    cancelButtonText: 'Cancel'
                  })

                  if (!result.isConfirmed) {
                    return
                  }

                  setIsSavingPicks(true)
                  try {
                    // Convert pending picks to API format
                    const picks = Array.from(pendingPicks.entries()).map(([gameId, pick]) => ({
                      gameId,
                      teamId: pick.teamId,
                      confidence: pick.confidence,
                    }))

                    const response = await fetch('/api/picks', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        entryId: userEntry.id,
                        picks,
                      }),
                    })

                    if (!response.ok) {
                      const errorData = await response.json()
                      throw new Error(errorData.error || 'Failed to save picks')
                    }

                    // Update saved picks
                    setUserPicks(new Map(pendingPicks))

                    Swal.fire({
                      icon: 'success',
                      title: 'Picks Locked In!',
                      text: `Successfully saved ${picks.length} pick(s)`,
                      timer: 2000,
                      showConfirmButton: false
                    })
                  } catch (error) {
                    Swal.fire({
                      icon: 'error',
                      title: 'Failed to Save Picks',
                      text: error instanceof Error ? error.message : 'Please try again',
                      confirmButtonColor: '#ef4444'
                    })
                  } finally {
                    setIsSavingPicks(false)
                  }
                }}
                disabled={isSavingPicks || pendingPicks.size === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSavingPicks ? 'Locking In...' : `Lock In ${pendingPicks.size} Picks`}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
