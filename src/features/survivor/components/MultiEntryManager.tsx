'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Users,
  Copy,
  Shuffle,
  GitBranch,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  Check,
  X,
  Plus,
  Eye,
  Lock,
  Unlock,
  BarChart3,
  Target,
  Info,
  Settings,
  Cog,
  Settings2,
  Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Entry {
  id: string
  entryName: string
  entryUrl?: string
  userId: string | null
  isActive: boolean
  eliminatedWeek?: number
  strikes: number
  currentPick?: {
    week: number
    teamId: string
    teamAbbr: string
    winProbability: number
  }
  usedTeams: string[]
  strategy: 'CONSERVATIVE' | 'BALANCED' | 'CONTRARIAN' | 'AGGRESSIVE'
  survivalProbability: number
  settings?: {
    // Strategy settings
    riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH'
    diversificationStrategy: 'BLOCK' | 'CORRELATED' | 'HEDGE' | 'CUSTOM'
    minWinProbability: number
    maxPublicPercentage: number
    autoPickEnabled: boolean
    lockPicksEarly: boolean
    preferredDivisions: string[]
    avoidTeams: string[]
    // Pool rule settings
    strikesAllowed: number
    buybackAvailable: boolean
    buybackCost: number
    buybackDeadline: number // week number
    tiebreakers: ('STRIKES' | 'USED_TEAMS' | 'PICK_ORDER' | 'RANDOM')[]
    allowStrategyChange: boolean
    pickDeadline: string // "KICKOFF" | "WEEK_START" | "THURSDAY"
    maxEntriesPerUser: number
    publicPicks: boolean
    latePickPenalty: number
  }
}

interface DiversificationStrategy {
  type: 'BLOCK' | 'CORRELATED' | 'HEDGE' | 'CUSTOM'
  description: string
  entries: Array<{
    entryId: string
    week: number
    teamId: string
    teamAbbr: string
    winProbability?: number
    reasoning?: string
  }>
}

interface DiversificationRecommendation {
  teamId: string
  teamAbbr: string
  winProbability: number
  reasoning: string
  strategyType: 'BLOCK' | 'HEDGE'
}

interface MultiEntryManagerProps {
  poolId: string
  userId: string
  currentWeek: number
  maxEntries: number
  onPickApplied?: (entryId: string) => void
  onViewEntry?: (entryId: string) => void
}

export default function MultiEntryManager({
  poolId,
  userId,
  currentWeek,
  maxEntries,
  onPickApplied,
  onViewEntry,
}: MultiEntryManagerProps) {
  const router = useRouter()
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set())
  const [diversificationStrategy, setDiversificationStrategy] =
    useState<DiversificationStrategy | null>(null)
  const [entryRecommendations, setEntryRecommendations] = useState<
    Record<string, DiversificationRecommendation>
  >({})
  const [showComparison, setShowComparison] = useState(true)
  const [loading, setLoading] = useState(true)
  const [bulkAction, setBulkAction] = useState<
    'copy' | 'diversify' | 'lock' | null
  >(null)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [entrySettings, setEntrySettings] = useState({
    // Strategy settings
    riskTolerance: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    diversificationStrategy: 'BLOCK' as
      | 'BLOCK'
      | 'CORRELATED'
      | 'HEDGE'
      | 'CUSTOM',
    minWinProbability: 0.6,
    maxPublicPercentage: 30,
    autoPickEnabled: false,
    lockPicksEarly: false,
    preferredDivisions: [] as string[],
    avoidTeams: [] as string[],
    // Pool rule settings
    strikesAllowed: 1,
    buybackAvailable: false,
    buybackCost: 0,
    buybackDeadline: 10,
    tiebreakers: ['STRIKES', 'USED_TEAMS', 'PICK_ORDER'] as (
      | 'STRIKES'
      | 'USED_TEAMS'
      | 'PICK_ORDER'
      | 'RANDOM'
    )[],
    allowStrategyChange: true,
    pickDeadline: 'KICKOFF' as string,
    maxEntriesPerUser: 3,
    publicPicks: false,
    latePickPenalty: 0,
  })

  useEffect(() => {
    fetchEntries()
  }, [poolId, userId])

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/survivor/pools/${poolId}/entries`)
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewEntry = async () => {
    try {
      const response = await fetch(`/api/survivor/pools/${poolId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Entry ${entries.length + 1}`,
        }),
      })

      if (response.ok) {
        await fetchEntries()
      }
    } catch (error) {
      console.error('Error creating entry:', error)
    }
  }

  const toggleEntrySelection = (entryId: string) => {
    setSelectedEntries((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(entryId)) {
        newSet.delete(entryId)
      } else {
        newSet.add(entryId)
      }
      return newSet
    })
  }

  const selectAllActive = () => {
    const activeEntries = entries.filter((e) => e.isActive).map((e) => e.id)
    setSelectedEntries(new Set(activeEntries))
  }

  const clearSelection = () => {
    setSelectedEntries(new Set())
  }

  const applyDiversification = async (
    strategy: 'BLOCK' | 'CORRELATED' | 'HEDGE'
  ) => {
    if (selectedEntries.size < 2) {
      alert('Select at least 2 entries for diversification')
      return
    }

    try {
      const response = await fetch('/api/survivor/diversify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId,
          entryIds: Array.from(selectedEntries),
          week: currentWeek,
          strategy,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Convert API response to entry recommendations
        const recommendations: Record<string, DiversificationRecommendation> =
          {}
        console.log('Raw diversification API response:', data)

        data.entries.forEach((entry: any) => {
          console.log('Processing entry:', entry)
          recommendations[entry.entryId] = {
            teamId: entry.teamId,
            teamAbbr: entry.teamAbbr,
            winProbability: entry.winProbability || 0.5,
            reasoning:
              entry.reasoning ||
              `${strategy.toLowerCase()} strategy recommendation`,
            strategyType: strategy as 'BLOCK' | 'HEDGE',
          }
        })

        console.log('Final recommendations state:', recommendations)
        setEntryRecommendations(recommendations)
        setDiversificationStrategy(data)
      }
    } catch (error) {
      console.error('Error applying diversification:', error)
    }
  }

  const copyPicksToSelected = async (sourceEntryId: string) => {
    if (selectedEntries.size === 0) {
      alert('Select target entries first')
      return
    }

    try {
      const response = await fetch('/api/survivor/copy-picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceEntryId,
          targetEntryIds: Array.from(selectedEntries).filter(
            (id) => id !== sourceEntryId
          ),
          week: currentWeek,
        }),
      })

      if (response.ok) {
        await fetchEntries()
        alert('Picks copied successfully')
      }
    } catch (error) {
      console.error('Error copying picks:', error)
    }
  }

  const openEntrySettings = (entry: Entry) => {
    setEditingEntry(entry)
    if (entry.settings) {
      setEntrySettings({
        // Strategy settings
        riskTolerance: entry.settings.riskTolerance,
        diversificationStrategy: entry.settings.diversificationStrategy,
        minWinProbability: entry.settings.minWinProbability,
        maxPublicPercentage: entry.settings.maxPublicPercentage,
        autoPickEnabled: entry.settings.autoPickEnabled,
        lockPicksEarly: entry.settings.lockPicksEarly,
        preferredDivisions: entry.settings.preferredDivisions,
        avoidTeams: entry.settings.avoidTeams,
        // Pool rule settings
        strikesAllowed: entry.settings.strikesAllowed,
        buybackAvailable: entry.settings.buybackAvailable,
        buybackCost: entry.settings.buybackCost,
        buybackDeadline: entry.settings.buybackDeadline,
        tiebreakers: entry.settings.tiebreakers,
        allowStrategyChange: entry.settings.allowStrategyChange,
        pickDeadline: entry.settings.pickDeadline,
        maxEntriesPerUser: entry.settings.maxEntriesPerUser,
        publicPicks: entry.settings.publicPicks,
        latePickPenalty: entry.settings.latePickPenalty,
      })
    } else {
      // Reset to defaults
      setEntrySettings({
        // Strategy settings
        riskTolerance: 'MEDIUM',
        diversificationStrategy: 'BLOCK',
        minWinProbability: 0.6,
        maxPublicPercentage: 30,
        autoPickEnabled: false,
        lockPicksEarly: false,
        preferredDivisions: [],
        avoidTeams: [],
        // Pool rule settings
        strikesAllowed: 1,
        buybackAvailable: false,
        buybackCost: 0,
        buybackDeadline: 10,
        tiebreakers: ['STRIKES', 'USED_TEAMS', 'PICK_ORDER'],
        allowStrategyChange: true,
        pickDeadline: 'KICKOFF',
        maxEntriesPerUser: 3,
        publicPicks: false,
        latePickPenalty: 0,
      })
    }
  }

  const saveEntrySettings = async () => {
    if (!editingEntry) return

    try {
      // Update basic entry info (name and URL)
      const entryUpdateResponse = await fetch(
        `/api/survivor/pools/${poolId}/entries/${editingEntry.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entryName: editingEntry.entryName,
            entryUrl: editingEntry.entryUrl,
          }),
        }
      )

      if (!entryUpdateResponse.ok) {
        throw new Error('Failed to update entry info')
      }

      // Update entry settings (pool-specific settings)
      const settingsResponse = await fetch(
        `/api/survivor/pools/${poolId}/entries/${editingEntry.id}/settings`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entrySettings),
        }
      )

      // Always refresh entries and close modal after successful entry update
      await fetchEntries()
      setEditingEntry(null)
    } catch (error) {
      console.error('Error saving entry settings:', error)
      alert('Failed to save entry: ' + error.message)
      // Close modal even on error so user isn't stuck
      setEditingEntry(null)
    }
  }

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'CONSERVATIVE':
        return <Shield className="h-4 w-4" />
      case 'BALANCED':
        return <Target className="h-4 w-4" />
      case 'CONTRARIAN':
        return <TrendingUp className="h-4 w-4" />
      case 'AGGRESSIVE':
        return <Zap className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'CONSERVATIVE':
        return 'bg-green-100 text-green-800'
      case 'BALANCED':
        return 'bg-blue-100 text-blue-800'
      case 'CONTRARIAN':
        return 'bg-purple-100 text-purple-800'
      case 'AGGRESSIVE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate diversity score
  const calculateDiversityScore = () => {
    const activeEntries = entries.filter((e) => e.isActive)
    if (activeEntries.length < 2) return 100

    const currentPicks = activeEntries
      .filter((e) => e.currentPick)
      .map((e) => e.currentPick!.teamId)

    const uniquePicks = new Set(currentPicks).size
    return Math.round((uniquePicks / currentPicks.length) * 100)
  }

  const diversityScore = calculateDiversityScore()

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="space-y-3">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded" />
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Multi-Entry Manager
              <Badge variant="outline">
                {entries.filter((e) => e.isActive).length} / {entries.length}{' '}
                Active
              </Badge>
            </span>
            <div className="flex gap-2">
              <Button onClick={createNewEntry} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Entry
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold">{entries.length}</div>
              <div className="text-xs text-gray-500">Total Entries</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {entries.filter((e) => e.isActive).length}
              </div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">
                {entries.filter((e) => !e.isActive).length}
              </div>
              <div className="text-xs text-gray-500">Eliminated</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {diversityScore}%
              </div>
              <div className="text-xs text-gray-500">Diversity Score</div>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedEntries.size} selected
              </span>
              {selectedEntries.size > 0 && (
                <>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    Clear
                  </Button>
                  <Button variant="ghost" size="sm" onClick={selectAllActive}>
                    Select All Active
                  </Button>
                </>
              )}
            </div>
            {selectedEntries.size > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyDiversification('BLOCK')}
                >
                  <GitBranch className="h-4 w-4 mr-1" />
                  Block Diversify
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyDiversification('HEDGE')}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Hedge
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkAction('lock')}
                >
                  <Lock className="h-4 w-4 mr-1" />
                  Lock Picks
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Entry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {entries.map((entry) => (
          <Card
            key={entry.id}
            className={cn(
              'relative overflow-hidden transition-all',
              selectedEntries.has(entry.id) && 'ring-2 ring-blue-500',
              !entry.isActive && 'opacity-60'
            )}
          >
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedEntries.has(entry.id)}
                    onChange={() => toggleEntrySelection(entry.id)}
                    className="h-4 w-4"
                    disabled={!entry.isActive}
                  />
                  {entry.entryUrl ? (
                    <a
                      href={entry.entryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {entry.entryName}
                    </a>
                  ) : (
                    <span className="font-semibold">{entry.entryName}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEntrySettings(entry)}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <Settings2 className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  </Button>
                  {entry.isActive ? (
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      Eliminated W{entry.eliminatedWeek}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 px-3 py-2">
              {/* Current Week Pick */}
              {entry.currentPick ? (
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      Week {currentWeek} Pick
                    </span>
                    <Badge
                      className={cn(
                        'text-xs',
                        getStrategyColor(entry.strategy)
                      )}
                    >
                      {getStrategyIcon(entry.strategy)}
                      <span className="ml-1">{entry.strategy}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      {entry.currentPick.teamAbbr}
                    </span>
                    <span className="text-sm text-gray-600">
                      {(entry.currentPick.winProbability * 100).toFixed(0)}% win
                    </span>
                  </div>
                </div>
              ) : entry.isActive ? (
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mb-1" />
                  <p className="text-sm text-yellow-800">
                    No pick for Week {currentWeek}
                  </p>
                </div>
              ) : null}

              {/* Diversification Recommendation */}
              {entryRecommendations[entry.id] &&
                selectedEntries.has(entry.id) && (
                  <div className="p-2 bg-purple-50 border-2 border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-800">
                        {entryRecommendations[entry.id].strategyType}{' '}
                        Recommendation
                      </span>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Strategy
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-purple-900">
                          → {entryRecommendations[entry.id].teamAbbr}
                        </span>
                        <span className="text-sm text-purple-700">
                          {(
                            entryRecommendations[entry.id].winProbability * 100
                          ).toFixed(0)}
                          % win
                        </span>
                      </div>
                      <p className="text-xs text-purple-600">
                        {entryRecommendations[entry.id].reasoning}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          className="flex-1 h-7 text-xs bg-purple-600 hover:bg-purple-700"
                          onClick={async () => {
                            console.log('=== APPLY BUTTON CLICKED ===')

                            // Apply this recommendation as the actual pick
                            const recommendation =
                              entryRecommendations[entry.id]
                            console.log(
                              'Step 1: Recommendation data:',
                              recommendation
                            )

                            if (!recommendation) {
                              console.error(
                                'ERROR: No recommendation found for entry:',
                                entry.id
                              )
                              alert(
                                'No recommendation found. Please try selecting entries and applying a strategy first.'
                              )
                              return
                            }

                            if (!recommendation.teamId) {
                              console.error(
                                'ERROR: Recommendation missing teamId:',
                                recommendation
                              )
                              alert(
                                'Invalid recommendation data. Please try applying the strategy again.'
                              )
                              return
                            }

                            try {
                              console.log('Step 2: Starting game fetch...')
                              console.log('Current week:', currentWeek)
                              console.log('Pool ID:', poolId)
                              console.log('Entry ID:', entry.id)

                              // Find the game for this team
                              console.log(
                                'Step 3: Fetching games for week:',
                                currentWeek
                              )
                              const gamesResponse = await fetch(
                                `/api/games?week=${currentWeek}`
                              )
                              console.log(
                                'Step 4: Games response status:',
                                gamesResponse.status
                              )

                              if (!gamesResponse.ok) {
                                console.error(
                                  'Games API failed with status:',
                                  gamesResponse.status
                                )
                                const errorText = await gamesResponse.text()
                                console.error(
                                  'Games API error text:',
                                  errorText
                                )
                                throw new Error(
                                  `Failed to fetch games: ${gamesResponse.status}`
                                )
                              }

                              const gamesData = await gamesResponse.json()
                              console.log(
                                'Step 5: Games response structure:',
                                gamesData
                              )

                              // Extract games array from response structure
                              const games = gamesData.data || gamesData
                              console.log(
                                'Step 6: Games array extracted:',
                                games.length,
                                'games'
                              )
                              console.log(
                                'Step 7: Looking for team ID:',
                                recommendation.teamId
                              )

                              // Debug: log all games and team IDs
                              console.log('Step 8: All games with team IDs:')
                              games.forEach((g: any, index: number) => {
                                console.log(
                                  `  Game ${index}: ${g.homeTeamId} vs ${g.awayTeamId} (ID: ${g.id})`
                                )
                              })

                              const game = games.find(
                                (g: any) =>
                                  g.homeTeamId === recommendation.teamId ||
                                  g.awayTeamId === recommendation.teamId
                              )

                              console.log('Step 9: Found game:', game)

                              if (!game) {
                                console.error(
                                  'ERROR: No game found for team:',
                                  recommendation.teamId
                                )
                                console.error(
                                  'Available team IDs:',
                                  games.flatMap((g: any) => [
                                    g.homeTeamId,
                                    g.awayTeamId,
                                  ])
                                )
                                alert(
                                  `Could not find game for recommended team ${recommendation.teamAbbr}`
                                )
                                return
                              }

                              // Submit the pick
                              const pickData = {
                                teamId: recommendation.teamId,
                                gameId: game.id,
                                week: currentWeek,
                              }
                              console.log(
                                'Step 10: Submitting pick with data:',
                                pickData
                              )

                              const pickSubmissionUrl = `/api/survivor/pools/${poolId}/entries/${entry.id}/picks`
                              console.log(
                                'Step 11: Pick submission URL:',
                                pickSubmissionUrl
                              )

                              // Check if this entry already has a pick for this week
                              const existingPick = entry.picks?.find(
                                (p: any) => p.week === currentWeek
                              )
                              const method = existingPick ? 'PUT' : 'POST'
                              const requestBody = existingPick
                                ? { ...pickData, pickId: existingPick.id }
                                : pickData

                              console.log(
                                'Step 11.5: Using method:',
                                method,
                                'for existing pick:',
                                !!existingPick
                              )

                              const response = await fetch(pickSubmissionUrl, {
                                method,
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(requestBody),
                              })

                              console.log(
                                'Step 12: Pick submission response status:',
                                response.status
                              )
                              console.log(
                                'Step 13: Pick submission response ok:',
                                response.ok
                              )

                              if (response.ok) {
                                console.log(
                                  'Step 14: Pick submitted successfully'
                                )
                                const result = await response.json()
                                console.log(
                                  'Step 15: Pick submission result:',
                                  result
                                )

                                // Remove this recommendation and refresh entries
                                const newRecs = { ...entryRecommendations }
                                delete newRecs[entry.id]
                                setEntryRecommendations(newRecs)

                                console.log('Step 16: Refreshing entries...')
                                await fetchEntries()
                                console.log(
                                  'Step 17: Entries refreshed successfully'
                                )

                                // Notify parent component that a pick was applied
                                if (onPickApplied) {
                                  console.log(
                                    'Step 18: Notifying parent of pick applied for entry:',
                                    entry.id
                                  )
                                  onPickApplied(entry.id)
                                }

                                alert(
                                  `Successfully applied ${recommendation.teamAbbr} pick for ${entry.entryName}!`
                                )
                              } else {
                                console.log(
                                  'Step 14-ERROR: Pick submission failed'
                                )
                                const error = await response.json()
                                console.error(
                                  'Pick submission failed with error:',
                                  error
                                )
                                alert(`Failed to apply pick: ${error.error}`)
                              }
                            } catch (error) {
                              console.error('=== APPLY BUTTON ERROR ===')
                              console.error('Error type:', typeof error)
                              console.error(
                                'Error message:',
                                error instanceof Error
                                  ? error.message
                                  : String(error)
                              )
                              console.error(
                                'Error stack:',
                                error instanceof Error
                                  ? error.stack
                                  : 'No stack available'
                              )
                              console.error('Full error object:', error)
                              alert(
                                'Failed to apply recommendation. Please try again.'
                              )
                            }

                            console.log('=== APPLY BUTTON COMPLETED ===')
                          }}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Apply
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
                          onClick={() => {
                            const newRecs = { ...entryRecommendations }
                            delete newRecs[entry.id]
                            setEntryRecommendations(newRecs)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

              {/* Entry Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-sm font-semibold">{entry.strikes}</div>
                  <div className="text-xs text-gray-500">Strikes</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {entry.usedTeams.length}
                  </div>
                  <div className="text-xs text-gray-500">Used</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {(entry.survivalProbability * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">Survival</div>
                </div>
              </div>

              {/* Actions */}
              {entry.isActive && (
                <div className="flex gap-1 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      console.log('=== Make Picks Button Clicked ===')
                      console.log('Entry ID:', entry.id)
                      console.log('onViewEntry callback exists:', !!onViewEntry)

                      if (onViewEntry) {
                        console.log('Calling onViewEntry callback...')
                        onViewEntry(entry.id)
                        console.log('onViewEntry callback completed')
                      } else {
                        console.log(
                          'No onViewEntry callback, using router.push fallback'
                        )
                        router.push(
                          `/survivor/${poolId}?entryId=${entry.id}&tab=picks`
                        )
                      }
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Make Picks
                  </Button>
                  {selectedEntries.size > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyPicksToSelected(entry.id)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison View */}
      {showComparison && entries.filter((e) => e.isActive).length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Entry Comparison - Week {currentWeek}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Entry</th>
                    <th className="text-center p-2">Pick</th>
                    <th className="text-center p-2">Win %</th>
                    <th className="text-center p-2">Strategy</th>
                    <th className="text-center p-2">Strikes</th>
                    <th className="text-center p-2">Teams Used</th>
                    <th className="text-center p-2">Survival %</th>
                  </tr>
                </thead>
                <tbody>
                  {entries
                    .filter((e) => e.isActive)
                    .map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">
                          {entry.entryUrl ? (
                            <a
                              href={entry.entryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            >
                              {entry.entryName}
                            </a>
                          ) : (
                            entry.entryName
                          )}
                        </td>
                        <td className="text-center p-2">
                          {entry.currentPick ? (
                            <Badge>{entry.currentPick.teamAbbr}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="text-center p-2">
                          {entry.currentPick ? (
                            <span
                              className={cn(
                                'font-medium',
                                entry.currentPick.winProbability >= 0.7 &&
                                  'text-green-600',
                                entry.currentPick.winProbability >= 0.6 &&
                                  entry.currentPick.winProbability < 0.7 &&
                                  'text-blue-600',
                                entry.currentPick.winProbability < 0.6 &&
                                  'text-yellow-600'
                              )}
                            >
                              {(entry.currentPick.winProbability * 100).toFixed(
                                0
                              )}
                              %
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="text-center p-2">
                          <Badge
                            className={cn(
                              'text-xs',
                              getStrategyColor(entry.strategy)
                            )}
                          >
                            {entry.strategy.slice(0, 3)}
                          </Badge>
                        </td>
                        <td className="text-center p-2">{entry.strikes}</td>
                        <td className="text-center p-2">
                          {entry.usedTeams.length}
                        </td>
                        <td className="text-center p-2">
                          <span
                            className={cn(
                              'font-medium',
                              entry.survivalProbability >= 0.7 &&
                                'text-green-600',
                              entry.survivalProbability >= 0.5 &&
                                entry.survivalProbability < 0.7 &&
                                'text-blue-600',
                              entry.survivalProbability < 0.5 &&
                                'text-yellow-600'
                            )}
                          >
                            {(entry.survivalProbability * 100).toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Overlap Analysis */}
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">Pick Overlap Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <div className="text-sm text-gray-500">Unique Picks</div>
                  <div className="font-semibold">
                    {
                      new Set(
                        entries
                          .filter((e) => e.currentPick)
                          .map((e) => e.currentPick!.teamId)
                      ).size
                    }
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Most Popular</div>
                  <div className="font-semibold">
                    {(() => {
                      const picks = entries
                        .filter((e) => e.currentPick)
                        .map((e) => e.currentPick!.teamAbbr)
                      const counts = picks.reduce(
                        (acc, pick) => {
                          acc[pick] = (acc[pick] || 0) + 1
                          return acc
                        },
                        {} as Record<string, number>
                      )
                      const max = Math.max(...Object.values(counts))
                      return (
                        Object.entries(counts).find(
                          ([_, count]) => count === max
                        )?.[0] || '-'
                      )
                    })()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Diversity Score</div>
                  <div className="font-semibold">{diversityScore}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Risk Level</div>
                  <div className="font-semibold">
                    <Badge
                      className={cn(
                        diversityScore >= 75
                          ? 'bg-green-100 text-green-800'
                          : diversityScore >= 50
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      )}
                    >
                      {diversityScore >= 75
                        ? 'LOW'
                        : diversityScore >= 50
                          ? 'MEDIUM'
                          : 'HIGH'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diversification Summary - Only show if recommendations are active */}
      {Object.keys(entryRecommendations).length > 0 && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shuffle className="h-5 w-5 text-purple-600" />
                <span className="text-purple-900">
                  Diversification Recommendations Active
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEntryRecommendations({})
                  setDiversificationStrategy(null)
                }}
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-700 mb-2">
              {diversificationStrategy?.description ||
                'Strategy recommendations are now shown on individual entry cards.'}
            </p>
            <div className="text-xs text-purple-600">
              Click "Apply" on any recommendation to navigate to that entry's
              pick page with the suggested team pre-selected.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategy Guide */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Diversification Strategies:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              • <strong>Block:</strong> Different teams across all entries each
              week
            </li>
            <li>
              • <strong>Correlated:</strong> Similar high-probability picks for
              safety
            </li>
            <li>
              • <strong>Hedge:</strong> Mix of safe and contrarian picks
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Entry Settings Modal */}
      <Dialog
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Entry Settings - {editingEntry?.entryName}
            </DialogTitle>
            <DialogDescription>
              Configure the strategy and preferences for this entry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Strategy Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Strategy Configuration</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="strategy">Entry Strategy</Label>
                  <Select
                    value={editingEntry?.strategy || 'BALANCED'}
                    onValueChange={(value) => {
                      if (editingEntry) {
                        setEditingEntry({
                          ...editingEntry,
                          strategy: value as
                            | 'CONSERVATIVE'
                            | 'BALANCED'
                            | 'CONTRARIAN'
                            | 'AGGRESSIVE',
                        })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONSERVATIVE">Conservative</SelectItem>
                      <SelectItem value="BALANCED">Balanced</SelectItem>
                      <SelectItem value="CONTRARIAN">Contrarian</SelectItem>
                      <SelectItem value="AGGRESSIVE">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                  <Select
                    value={entrySettings.riskTolerance}
                    onValueChange={(value) =>
                      setEntrySettings({
                        ...entrySettings,
                        riskTolerance: value as 'LOW' | 'MEDIUM' | 'HIGH',
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low Risk</SelectItem>
                      <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                      <SelectItem value="HIGH">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diversificationStrategy">
                  Diversification Strategy
                </Label>
                <Select
                  value={entrySettings.diversificationStrategy}
                  onValueChange={(value) =>
                    setEntrySettings({
                      ...entrySettings,
                      diversificationStrategy: value as
                        | 'BLOCK'
                        | 'CORRELATED'
                        | 'HEDGE'
                        | 'CUSTOM',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BLOCK">
                      Block Strategy - Different teams each week
                    </SelectItem>
                    <SelectItem value="CORRELATED">
                      Correlated - Similar high-probability picks
                    </SelectItem>
                    <SelectItem value="HEDGE">
                      Hedge - Mix of safe and contrarian picks
                    </SelectItem>
                    <SelectItem value="CUSTOM">Custom Strategy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pick Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pick Preferences</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minWinProbability">
                    Minimum Win Probability (
                    {(entrySettings.minWinProbability * 100).toFixed(0)}%)
                  </Label>
                  <input
                    type="range"
                    min="0.4"
                    max="0.9"
                    step="0.05"
                    value={entrySettings.minWinProbability}
                    onChange={(e) =>
                      setEntrySettings({
                        ...entrySettings,
                        minWinProbability: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPublicPercentage">
                    Maximum Public Pick % ({entrySettings.maxPublicPercentage}%)
                  </Label>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="5"
                    value={entrySettings.maxPublicPercentage}
                    onChange={(e) =>
                      setEntrySettings({
                        ...entrySettings,
                        maxPublicPercentage: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Automation Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Automation Settings</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoPickEnabled">Auto-Pick Enabled</Label>
                    <p className="text-sm text-gray-500">
                      Automatically make picks based on strategy
                    </p>
                  </div>
                  <Switch
                    id="autoPickEnabled"
                    checked={entrySettings.autoPickEnabled}
                    onCheckedChange={(checked) =>
                      setEntrySettings({
                        ...entrySettings,
                        autoPickEnabled: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lockPicksEarly">Lock Picks Early</Label>
                    <p className="text-sm text-gray-500">
                      Lock in picks as soon as they meet criteria
                    </p>
                  </div>
                  <Switch
                    id="lockPicksEarly"
                    checked={entrySettings.lockPicksEarly}
                    onCheckedChange={(checked) =>
                      setEntrySettings({
                        ...entrySettings,
                        lockPicksEarly: checked,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Pool Rules Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pool Rules</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="strikesAllowed">Strikes Allowed</Label>
                  <Input
                    id="strikesAllowed"
                    type="number"
                    min="0"
                    max="5"
                    value={entrySettings.strikesAllowed}
                    onChange={(e) =>
                      setEntrySettings({
                        ...entrySettings,
                        strikesAllowed: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxEntriesPerUser">
                    Max Entries Per User
                  </Label>
                  <Input
                    id="maxEntriesPerUser"
                    type="number"
                    min="1"
                    max="20"
                    value={entrySettings.maxEntriesPerUser}
                    onChange={(e) =>
                      setEntrySettings({
                        ...entrySettings,
                        maxEntriesPerUser: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="buybackAvailable">Buyback Available</Label>
                    <p className="text-sm text-gray-500">
                      Allow users to buy back in after elimination
                    </p>
                  </div>
                  <Switch
                    id="buybackAvailable"
                    checked={entrySettings.buybackAvailable}
                    onCheckedChange={(checked) =>
                      setEntrySettings({
                        ...entrySettings,
                        buybackAvailable: checked,
                      })
                    }
                  />
                </div>

                {entrySettings.buybackAvailable && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="buybackCost">Buyback Cost ($)</Label>
                      <Input
                        id="buybackCost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={entrySettings.buybackCost}
                        onChange={(e) =>
                          setEntrySettings({
                            ...entrySettings,
                            buybackCost: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buybackDeadline">
                        Buyback Deadline (Week)
                      </Label>
                      <Input
                        id="buybackDeadline"
                        type="number"
                        min="1"
                        max="18"
                        value={entrySettings.buybackDeadline}
                        onChange={(e) =>
                          setEntrySettings({
                            ...entrySettings,
                            buybackDeadline: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="publicPicks">Public Picks</Label>
                    <p className="text-sm text-gray-500">
                      Make all picks visible to other players
                    </p>
                  </div>
                  <Switch
                    id="publicPicks"
                    checked={entrySettings.publicPicks}
                    onCheckedChange={(checked) =>
                      setEntrySettings({
                        ...entrySettings,
                        publicPicks: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowStrategyChange">
                      Allow Strategy Changes
                    </Label>
                    <p className="text-sm text-gray-500">
                      Allow strategy changes after initial setup
                    </p>
                  </div>
                  <Switch
                    id="allowStrategyChange"
                    checked={entrySettings.allowStrategyChange}
                    onCheckedChange={(checked) =>
                      setEntrySettings({
                        ...entrySettings,
                        allowStrategyChange: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickDeadline">Pick Deadline</Label>
                <Select
                  value={entrySettings.pickDeadline}
                  onValueChange={(value) =>
                    setEntrySettings({
                      ...entrySettings,
                      pickDeadline: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KICKOFF">Game Kickoff</SelectItem>
                    <SelectItem value="WEEK_START">Start of Week</SelectItem>
                    <SelectItem value="THURSDAY">Thursday Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="latePickPenalty">Late Pick Penalty ($)</Label>
                <Input
                  id="latePickPenalty"
                  type="number"
                  min="0"
                  step="0.01"
                  value={entrySettings.latePickPenalty}
                  onChange={(e) =>
                    setEntrySettings({
                      ...entrySettings,
                      latePickPenalty: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* Tiebreaker Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tiebreaker Rules</h3>
              <p className="text-sm text-gray-500">
                Select tiebreaker criteria in order of priority
              </p>

              <div className="space-y-2">
                {entrySettings.tiebreakers.map((tiebreaker, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <Select
                      value={tiebreaker}
                      onValueChange={(value) => {
                        const newTiebreakers = [...entrySettings.tiebreakers]
                        newTiebreakers[index] = value as
                          | 'STRIKES'
                          | 'USED_TEAMS'
                          | 'PICK_ORDER'
                          | 'RANDOM'
                        setEntrySettings({
                          ...entrySettings,
                          tiebreakers: newTiebreakers,
                        })
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STRIKES">Fewest Strikes</SelectItem>
                        <SelectItem value="USED_TEAMS">
                          Most Teams Used
                        </SelectItem>
                        <SelectItem value="PICK_ORDER">
                          Pick Order (First In)
                        </SelectItem>
                        <SelectItem value="RANDOM">Random</SelectItem>
                      </SelectContent>
                    </Select>
                    {entrySettings.tiebreakers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newTiebreakers =
                            entrySettings.tiebreakers.filter(
                              (_, i) => i !== index
                            )
                          setEntrySettings({
                            ...entrySettings,
                            tiebreakers: newTiebreakers,
                          })
                        }}
                        className="p-1 h-6 w-6"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}

                {entrySettings.tiebreakers.length < 4 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const availableOptions = [
                        'STRIKES',
                        'USED_TEAMS',
                        'PICK_ORDER',
                        'RANDOM',
                      ].filter(
                        (option) =>
                          !entrySettings.tiebreakers.includes(option as any)
                      )
                      if (availableOptions.length > 0) {
                        setEntrySettings({
                          ...entrySettings,
                          tiebreakers: [
                            ...entrySettings.tiebreakers,
                            availableOptions[0] as any,
                          ],
                        })
                      }
                    }}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Tiebreaker
                  </Button>
                )}
              </div>
            </div>

            {/* Entry Name */}
            <div className="space-y-2">
              <Label htmlFor="entryName">Entry Name</Label>
              <Input
                id="entryName"
                value={editingEntry?.entryName || ''}
                onChange={(e) => {
                  if (editingEntry) {
                    setEditingEntry({
                      ...editingEntry,
                      entryName: e.target.value,
                    })
                  }
                }}
                placeholder="Enter entry name"
              />
            </div>

            {/* Entry URL */}
            <div className="space-y-2">
              <Label htmlFor="entryUrl">Entry URL (optional)</Label>
              <Input
                id="entryUrl"
                type="url"
                value={editingEntry?.entryUrl || ''}
                onChange={(e) => {
                  if (editingEntry) {
                    setEditingEntry({
                      ...editingEntry,
                      entryUrl: e.target.value,
                    })
                  }
                }}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button onClick={saveEntrySettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
