'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar,
  Target,
  AlertTriangle,
  Save,
  RotateCcw,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Star,
  Lock,
  Check,
  X,
  Zap,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlannedPick {
  week: number
  teamId: string
  teamAbbr: string
  opponent: string
  winProbability: number
  futureValue: number
  isLocked: boolean
  notes?: string
}

interface WeekData {
  week: number
  games: Array<{
    gameId: string
    homeTeam: string
    awayTeam: string
    homeTeamId: string
    awayTeamId: string
    spread: number
    homeWinProbability: number
    awayWinProbability: number
  }>
  difficulty: 'EASY' | 'MODERATE' | 'DIFFICULT' | 'CRITICAL'
  byeTeams: string[]
}

interface SeasonPlannerProps {
  poolId: string
  entryId: string
  currentWeek: number
  usedTeams: Set<string>
  existingPicks: Array<{
    week: number
    teamId: string
    teamAbbr: string
    result?: 'WIN' | 'LOSS' | 'PENDING'
  }>
}

export default function SeasonPlanner({
  poolId,
  entryId,
  currentWeek,
  usedTeams,
  existingPicks,
}: SeasonPlannerProps) {
  const [plannedPicks, setPlannedPicks] = useState<PlannedPick[]>([])
  const [weekData, setWeekData] = useState<Record<number, WeekData>>({})
  const [selectedWeek, setSelectedWeek] = useState(currentWeek)
  const [draggedTeam, setDraggedTeam] = useState<{
    teamId: string
    teamAbbr: string
    fromWeek?: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOptimizer, setShowOptimizer] = useState(false)
  const [savedPlans, setSavedPlans] = useState<
    Array<{ id: string; name: string; date: Date }>
  >([])

  useEffect(() => {
    loadSeasonData()
    loadSavedPlans()
  }, [poolId])

  const loadSeasonData = async () => {
    try {
      const response = await fetch(`/api/survivor/season-data?poolId=${poolId}`)
      if (response.ok) {
        const data = await response.json()
        setWeekData(data.weeks)

        // Initialize planned picks from existing picks
        const planned = existingPicks.map((pick) => ({
          week: pick.week,
          teamId: pick.teamId,
          teamAbbr: pick.teamAbbr,
          opponent: '', // Would fetch from week data
          winProbability: 0,
          futureValue: 0,
          isLocked: pick.result !== 'PENDING',
          notes: '',
        }))
        setPlannedPicks(planned)
      }
    } catch (error) {
      console.error('Error loading season data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSavedPlans = async () => {
    try {
      const response = await fetch(`/api/survivor/plans?entryId=${entryId}`)
      if (response.ok) {
        const plans = await response.json()
        setSavedPlans(plans)
      }
    } catch (error) {
      console.error('Error loading saved plans:', error)
    }
  }

  const handleDragStart = (
    e: React.DragEvent,
    teamId: string,
    teamAbbr: string,
    fromWeek?: number
  ) => {
    setDraggedTeam({ teamId, teamAbbr, fromWeek })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, toWeek: number) => {
    e.preventDefault()

    if (!draggedTeam) return

    // Check if team is already used in another week
    const teamUsedWeek = plannedPicks.find(
      (p) => p.teamId === draggedTeam.teamId && p.week !== draggedTeam.fromWeek
    )

    if (teamUsedWeek && toWeek !== draggedTeam.fromWeek) {
      alert(
        `${draggedTeam.teamAbbr} is already planned for Week ${teamUsedWeek.week}`
      )
      return
    }

    // Remove from original week if moving
    if (draggedTeam.fromWeek) {
      setPlannedPicks((prev) =>
        prev.filter(
          (p) =>
            !(
              p.week === draggedTeam.fromWeek && p.teamId === draggedTeam.teamId
            )
        )
      )
    }

    // Add to new week
    const weekGames = weekData[toWeek]?.games || []
    const game = weekGames.find(
      (g) =>
        g.homeTeamId === draggedTeam.teamId ||
        g.awayTeamId === draggedTeam.teamId
    )

    if (game) {
      const isHome = game.homeTeamId === draggedTeam.teamId
      const newPick: PlannedPick = {
        week: toWeek,
        teamId: draggedTeam.teamId,
        teamAbbr: draggedTeam.teamAbbr,
        opponent: isHome ? game.awayTeam : game.homeTeam,
        winProbability: isHome
          ? game.homeWinProbability
          : game.awayWinProbability,
        futureValue: 3, // Would calculate from data
        isLocked: toWeek < currentWeek,
        notes: '',
      }

      setPlannedPicks((prev) => [
        ...prev.filter((p) => p.week !== toWeek),
        newPick,
      ])
    }

    setDraggedTeam(null)
  }

  const removePick = (week: number) => {
    setPlannedPicks((prev) => prev.filter((p) => p.week !== week))
  }

  const optimizePlan = async () => {
    setShowOptimizer(true)
    try {
      const response = await fetch('/api/survivor/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId,
          entryId,
          currentWeek,
          usedTeams: Array.from(usedTeams),
          existingPicks,
        }),
      })

      if (response.ok) {
        const optimized = await response.json()
        setPlannedPicks(optimized.picks)
      }
    } catch (error) {
      console.error('Error optimizing plan:', error)
    } finally {
      setShowOptimizer(false)
    }
  }

  const savePlan = async () => {
    const name = prompt('Enter a name for this plan:')
    if (!name) return

    try {
      const response = await fetch('/api/survivor/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId,
          name,
          picks: plannedPicks,
        }),
      })

      if (response.ok) {
        await loadSavedPlans()
        alert('Plan saved successfully!')
      }
    } catch (error) {
      console.error('Error saving plan:', error)
    }
  }

  const exportPlan = () => {
    const data = {
      entryId,
      poolId,
      created: new Date().toISOString(),
      picks: plannedPicks,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `survivor-plan-${entryId}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800'
      case 'MODERATE':
        return 'bg-blue-100 text-blue-800'
      case 'DIFFICULT':
        return 'bg-yellow-100 text-yellow-800'
      case 'CRITICAL':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUsedTeamsForPlanning = () => {
    const used = new Set(usedTeams)
    plannedPicks.forEach((pick) => used.add(pick.teamId))
    return used
  }

  const availableTeams = Object.values(weekData[selectedWeek]?.games || [])
    .flatMap((game) => [
      { id: game.homeTeamId, abbr: game.homeTeam, isHome: true },
      { id: game.awayTeamId, abbr: game.awayTeam, isHome: false },
    ])
    .filter((team) => !getUsedTeamsForPlanning().has(team.id))

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-18 gap-2">
              {Array(18)
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
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Season Planner
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={optimizePlan}
                disabled={showOptimizer}
              >
                <Zap className="h-4 w-4 mr-1" />
                Optimize
              </Button>
              <Button variant="outline" size="sm" onClick={savePlan}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={exportPlan}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPlannedPicks([])}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Drag teams from the available pool to plan your season. Locked
              weeks (before Week {currentWeek}) cannot be modified.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Season Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => {
              const pick = plannedPicks.find((p) => p.week === week)
              const data = weekData[week]
              const isPast = week < currentWeek
              const isCurrent = week === currentWeek

              return (
                <div
                  key={week}
                  className={cn(
                    'relative p-3 rounded-lg border-2 min-h-[120px] transition-all',
                    isPast && 'bg-gray-50 opacity-60',
                    isCurrent && 'border-blue-500 bg-blue-50',
                    !isPast &&
                      !isCurrent &&
                      'border-gray-200 hover:border-gray-400',
                    draggedTeam && !isPast && 'border-dashed'
                  )}
                  onDragOver={!isPast ? handleDragOver : undefined}
                  onDrop={!isPast ? (e) => handleDrop(e, week) : undefined}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">Week {week}</span>
                    {data && (
                      <Badge
                        className={cn(
                          'text-xs',
                          getDifficultyColor(data.difficulty)
                        )}
                      >
                        {data.difficulty?.[0]}
                      </Badge>
                    )}
                  </div>

                  {pick ? (
                    <div
                      className={cn(
                        'p-2 bg-white rounded border cursor-move',
                        pick.isLocked && 'cursor-not-allowed opacity-75'
                      )}
                      draggable={!pick.isLocked}
                      onDragStart={(e) =>
                        !pick.isLocked &&
                        handleDragStart(e, pick.teamId, pick.teamAbbr, week)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{pick.teamAbbr}</span>
                        {pick.isLocked ? (
                          <Lock className="h-3 w-3 text-gray-400" />
                        ) : (
                          <X
                            className="h-3 w-3 text-red-500 cursor-pointer hover:text-red-700"
                            onClick={() => removePick(week)}
                          />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        vs {pick.opponent}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium">
                          {(pick.winProbability * 100).toFixed(0)}%
                        </span>
                        <div className="flex">
                          {Array(Math.round(pick.futureValue))
                            .fill(0)
                            .map((_, i) => (
                              <Star
                                key={i}
                                className="h-2 w-2 fill-yellow-500 text-yellow-500"
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-16 border-2 border-dashed border-gray-300 rounded text-gray-400 text-xs">
                      {isPast ? (
                        <Lock className="h-4 w-4" />
                      ) : data?.byeTeams?.length > 0 ? (
                        <span>{data.byeTeams.length} byes</span>
                      ) : (
                        <span>Drop here</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Available Teams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Available Teams - Week {selectedWeek}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedWeek((prev) => Math.max(currentWeek, prev - 1))
                }
                disabled={selectedWeek <= currentWeek}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 font-medium">{selectedWeek}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedWeek((prev) => Math.min(18, prev + 1))
                }
                disabled={selectedWeek >= 18}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {availableTeams.map((team) => {
              const game = weekData[selectedWeek]?.games.find(
                (g) => g.homeTeamId === team.id || g.awayTeamId === team.id
              )
              const winProb = team.isHome
                ? game?.homeWinProbability
                : game?.awayWinProbability

              return (
                <div
                  key={team.id}
                  className="p-2 bg-white border rounded cursor-move hover:bg-gray-50 transition-colors"
                  draggable
                  onDragStart={(e) => handleDragStart(e, team.id, team.abbr)}
                >
                  <div className="font-semibold text-center">{team.abbr}</div>
                  {winProb && (
                    <div className="text-xs text-center text-gray-500 mt-1">
                      {(winProb * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {weekData[selectedWeek]?.byeTeams?.length > 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Teams on bye: {weekData[selectedWeek].byeTeams.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Path Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Path Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {plannedPicks.filter((p) => p.winProbability >= 0.65).length}
              </div>
              <div className="text-sm text-gray-500">Safe Picks (&gt;65%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {
                  plannedPicks.filter(
                    (p) => p.winProbability < 0.65 && p.winProbability >= 0.55
                  ).length
                }
              </div>
              <div className="text-sm text-gray-500">Moderate (55-65%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {plannedPicks.filter((p) => p.winProbability < 0.55).length}
              </div>
              <div className="text-sm text-gray-500">Risky (&lt;55%)</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div className="text-sm font-medium mb-1">
              Overall Path Probability
            </div>
            <div className="text-2xl font-bold">
              {(
                plannedPicks.reduce(
                  (acc, pick) => acc * pick.winProbability,
                  1
                ) * 100
              ).toFixed(2)}
              %
            </div>
            <div className="text-xs text-gray-500">
              Chance of surviving all {plannedPicks.length} planned weeks
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Plans */}
      {savedPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium">{plan.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(plan.date).toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      /* Load plan */
                    }}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Load
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
