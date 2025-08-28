'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import MultiEntryManager from '@/features/survivor/components/MultiEntryManager'
import TeamSelector from '@/features/survivor/components/TeamSelector'
import RecommendationPanel from '@/features/survivor/components/RecommendationPanel'
import SurvivorStats from '@/features/survivor/components/SurvivorStats'
import PickHistory from '@/features/survivor/components/PickHistory'
import WeekMatchupGrid from '@/features/survivor/components/WeekMatchupGrid'
import {
  Shield,
  Users,
  BarChart3,
  History,
  Calendar,
  TrendingUp,
  Settings,
  AlertTriangle,
} from 'lucide-react'
import { getTeamLogoUrl } from '@/lib/utils/team-logos'

interface SurvivorPoolData {
  id: string
  name: string
  type: string
  season: number
  rules?: {
    strikesAllowed?: number
    buybackAvailable?: boolean
    maxEntriesPerUser?: number
    publicPicks?: boolean
  }
}

export default function SurvivorPoolPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const poolId = params.id as string
  const [poolData, setPoolData] = useState<SurvivorPoolData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [selectedEntryId, setSelectedEntryId] = useState<string>(
    searchParams.get('entryId') || 'cmekvk7ae001xp1lgboidndoo'
  )
  const [currentTab, setCurrentTab] = useState<string>(() => {
    // Initialize with URL params if available, otherwise default to 'entries'
    const tab = searchParams.get('tab')
    return tab || 'entries'
  })
  const [selectedStrategy, setSelectedStrategy] = useState<
    'CONSERVATIVE' | 'BALANCED' | 'CONTRARIAN' | 'RISK_SEEKING'
  >('BALANCED')
  const [currentEntry, setCurrentEntry] = useState<any>(null)
  const [existingPick, setExistingPick] = useState<any>(null)
  const [poolSettings, setPoolSettings] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any>(null)

  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        const [poolResponse, settingsResponse] = await Promise.all([
          fetch(`/api/pools/${poolId}`),
          fetch(`/api/survivor/pools/${poolId}/settings`),
        ])

        if (!poolResponse.ok) {
          throw new Error('Failed to fetch pool data')
        }

        const poolData = await poolResponse.json()
        setPoolData(poolData.data)

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          setPoolSettings(settingsData.settings)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPoolData()
  }, [poolId])

  // Update tab and entry selection when URL changes
  useEffect(() => {
    const entryId = searchParams.get('entryId')
    const tab = searchParams.get('tab')

    if (entryId) {
      setSelectedEntryId(entryId)
    }

    if (tab) {
      setCurrentTab(tab)
    }
    // Remove automatic tab switching - let user choose tab explicitly
  }, [searchParams])

  // Fetch current entry data and existing picks
  useEffect(() => {
    const fetchEntryData = async () => {
      if (!selectedEntryId || !poolId) return

      try {
        // Fetch entry details
        const entriesResponse = await fetch(
          `/api/survivor/pools/${poolId}/entries`
        )
        if (entriesResponse.ok) {
          const entries = await entriesResponse.json()
          const entry = entries.find((e: any) => e.id === selectedEntryId)
          setCurrentEntry(entry)
        }

        // Fetch existing picks for current week
        const picksResponse = await fetch(
          `/api/survivor/pools/${poolId}/entries/${selectedEntryId}/picks`
        )
        if (picksResponse.ok) {
          const data = await picksResponse.json()
          const currentWeekPick = data.picks.find(
            (p: any) => p.week === currentWeek
          )
          setExistingPick(currentWeekPick)
        }
      } catch (error) {
        console.error('Error fetching entry data:', error)
      }
    }

    fetchEntryData()
  }, [selectedEntryId, poolId, currentWeek])

  // Fetch recommendations when strategy or entry changes
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!selectedEntryId || !poolId) return

      try {
        const response = await fetch(
          `/api/survivor/recommendations?poolId=${poolId}&entryId=${selectedEntryId}&week=${currentWeek}&strategy=${selectedStrategy}`
        )
        if (response.ok) {
          const data = await response.json()
          setRecommendations(data)
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      }
    }

    fetchRecommendations()
  }, [selectedEntryId, poolId, currentWeek, selectedStrategy])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="ml-4 text-lg text-gray-600">
          Loading survivor pool...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>Failed to load pool data: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800">
      {/* Main PoolManager Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4">
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

      <div className="container mx-auto p-4 space-y-6 w-full max-w-none">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/picks"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Picks
          </Link>
        </div>
        {/* Main Interface */}
        <Tabs
          value={currentTab}
          onValueChange={(value) => {
            setCurrentTab(value)
          }}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger
              value="entries"
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Entries</span>
            </TabsTrigger>
            <TabsTrigger value="picks" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Make Picks</span>
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="flex items-center space-x-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Recommendations</span>
            </TabsTrigger>
            <TabsTrigger
              value="matchups"
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Matchups</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Stats</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center space-x-2"
            >
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="space-y-4">
            <MultiEntryManager
              poolId={poolId}
              userId="test-user"
              currentWeek={currentWeek}
              maxEntries={
                poolSettings?.maxEntriesPerUser ||
                poolData?.rules?.maxEntriesPerUser ||
                3
              }
              onPickApplied={async (entryId: string) => {
                // Refresh the current entry data if a pick was applied to the selected entry
                if (entryId === selectedEntryId) {
                  try {
                    // Fetch entry details
                    const entriesResponse = await fetch(
                      `/api/survivor/pools/${poolId}/entries`
                    )
                    if (entriesResponse.ok) {
                      const entries = await entriesResponse.json()
                      const entry = entries.find(
                        (e: any) => e.id === selectedEntryId
                      )
                      setCurrentEntry(entry)
                    }

                    // Fetch existing picks for current week
                    const picksResponse = await fetch(
                      `/api/survivor/pools/${poolId}/entries/${selectedEntryId}/picks`
                    )
                    if (picksResponse.ok) {
                      const data = await picksResponse.json()
                      const currentWeekPick = data.picks.find(
                        (p: any) => p.week === currentWeek
                      )
                      setExistingPick(currentWeekPick)
                    }
                  } catch (error) {
                    console.error('Error refreshing entry data:', error)
                  }
                }
              }}
              onViewEntry={(entryId: string) => {
                setSelectedEntryId(entryId)
                setCurrentTab('picks')
              }}
            />
          </TabsContent>

          <TabsContent value="picks" className="space-y-4">
            {/* Entry Information Header */}
            {currentEntry && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <span>
                        Making Picks for:{' '}
                        {currentEntry.entryUrl ? (
                          <a
                            href={currentEntry.entryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          >
                            {currentEntry.entryName}
                          </a>
                        ) : (
                          currentEntry.entryName
                        )}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          currentEntry.isActive ? 'default' : 'destructive'
                        }
                      >
                        {currentEntry.isActive
                          ? `${currentEntry.strikes} Strikes`
                          : 'Eliminated'}
                      </Badge>
                      {currentEntry.isActive && (
                        <Badge variant="outline">
                          {currentEntry.usedTeams?.length || 0} Teams Used
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                {existingPick && (
                  <CardContent className="pt-0">
                    <div className="bg-green-100 border-2 border-green-300 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 flex items-center justify-center">
                            <img
                              src={getTeamLogoUrl(
                                existingPick.team?.nflAbbr ||
                                  existingPick.teamAbbr
                              )}
                              alt={
                                existingPick.team?.name || existingPick.teamAbbr
                              }
                              className="w-12 h-12 object-contain"
                              onError={(e) => {
                                // Fallback to text if logo fails to load
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  parent.innerHTML = `<span class="text-green-800 font-bold text-lg">${existingPick.team?.nflAbbr || existingPick.teamAbbr}</span>`
                                }
                              }}
                            />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-green-800">
                              Current Pick:{' '}
                              {existingPick.team?.name || existingPick.teamAbbr}
                            </div>
                            <div className="text-sm text-green-600">
                              {existingPick.team?.nflAbbr ||
                                existingPick.teamAbbr}{' '}
                              • Week {currentWeek} •{' '}
                              {existingPick.result === 'PENDING'
                                ? 'Can update until game starts'
                                : existingPick.result}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-green-200 text-green-800 border-green-300"
                        >
                          Selected
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            <TeamSelector
              week={currentWeek}
              usedTeams={new Set(currentEntry?.usedTeams || [])}
              recommendations={recommendations}
              onSelect={async (teamId, gameId) => {
                try {

                  // If there's an existing pick, we need to use PUT to update it
                  const method = existingPick ? 'PUT' : 'POST'
                  const response = await fetch(
                    `/api/survivor/pools/${poolId}/entries/${selectedEntryId}/picks`,
                    {
                      method,
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        teamId,
                        gameId,
                        week: currentWeek,
                        ...(existingPick ? { pickId: existingPick.id } : {}),
                      }),
                    }
                  )

                  const result = await response.json()

                  if (response.ok) {
                    // Refresh pick data without leaving the picks tab
                    const picksResponse = await fetch(
                      `/api/survivor/pools/${poolId}/entries/${selectedEntryId}/picks`
                    )
                    if (picksResponse.ok) {
                      const data = await picksResponse.json()
                      const currentWeekPick = data.picks.find(
                        (p: any) => p.week === currentWeek
                      )
                      setExistingPick(currentWeekPick)
                    }
                  } else {
                    console.error('Pick submission failed:', result.error)
                    if (
                      result.error.includes('already submitted') &&
                      result.existingPick
                    ) {
                      alert(
                        `You already picked ${result.existingPick.teamName} for Week ${result.existingPick.week}. Click on a different team to update your pick.`
                      )
                    } else {
                      alert(`Failed to submit pick: ${result.error}`)
                    }
                  }
                } catch (error) {
                  console.error('Error submitting pick:', error)
                  alert(
                    'An error occurred while submitting your pick. Please try again.'
                  )
                }
              }}
              poolId={poolId}
            />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <RecommendationPanel
              poolId={poolId}
              week={currentWeek}
              entryId={selectedEntryId || undefined}
              strategy={selectedStrategy}
              onStrategyChange={setSelectedStrategy}
              canPick={true}
              onPickSelect={async (teamId, gameId) => {
                try {

                  // If there's an existing pick, we need to use PUT to update it
                  const method = existingPick ? 'PUT' : 'POST'
                  const response = await fetch(
                    `/api/survivor/pools/${poolId}/entries/${selectedEntryId}/picks`,
                    {
                      method,
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        teamId,
                        gameId,
                        week: currentWeek,
                        ...(existingPick ? { pickId: existingPick.id } : {}),
                      }),
                    }
                  )

                  const result = await response.json()

                  if (response.ok) {
                    // Refresh pick data and switch to picks tab to show the result
                    const picksResponse = await fetch(
                      `/api/survivor/pools/${poolId}/entries/${selectedEntryId}/picks`
                    )
                    if (picksResponse.ok) {
                      const data = await picksResponse.json()
                      const currentWeekPick = data.picks.find(
                        (p: any) => p.week === currentWeek
                      )
                      setExistingPick(currentWeekPick)
                    }
                    // Switch to picks tab to show the submitted pick
                    setCurrentTab('picks')
                  } else {
                    console.error(
                      'Recommendation pick submission failed:',
                      result.error
                    )
                    if (
                      result.error.includes('already submitted') &&
                      result.existingPick
                    ) {
                      alert(
                        `You already picked ${result.existingPick.teamName} for Week ${result.existingPick.week}. This will update your existing pick.`
                      )
                    } else {
                      alert(`Failed to submit pick: ${result.error}`)
                    }
                  }
                } catch (error) {
                  console.error('Error submitting recommendation pick:', error)
                  alert(
                    'An error occurred while submitting your pick. Please try again.'
                  )
                }
              }}
            />
          </TabsContent>

          <TabsContent value="matchups" className="space-y-4">
            <WeekMatchupGrid
              week={currentWeek}
              poolId={poolId}
              usedTeams={new Set(currentEntry?.usedTeams || [])}
              onPickSelect={(teamId, gameId) => {
              }}
              selectedEntry={currentEntry}
              canPick={false}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <SurvivorStats poolId={poolId} currentWeek={currentWeek} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <PickHistory poolId={poolId} currentWeek={currentWeek} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
