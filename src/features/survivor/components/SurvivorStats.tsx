'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Trophy,
  Target,
  BarChart3,
  Activity,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PoolStats {
  totalEntries: number
  survivorsRemaining: number
  eliminatedThisWeek: number
  survivalRate: number
  averageStrikes: number
  mostPopularPick: {
    team: string
    percentage: number
  }
  leastPopularPick: {
    team: string
    percentage: number
  }
  biggestUpset?: {
    team: string
    winProbability: number
    week: number
  }
  weeklyEliminations: Array<{
    week: number
    eliminated: number
    survivalRate: number
  }>
  teamUsageRates: Array<{
    team: string
    usageCount: number
    percentage: number
  }>
  projectedWinner: {
    weeks: number
    probability: number
  }
}

interface SurvivorStatsProps {
  poolId: string
  currentWeek?: number
  entries?: any[]
}

export default function SurvivorStats({
  poolId,
  currentWeek = 1,
  entries = [],
}: SurvivorStatsProps) {
  const [stats, setStats] = useState<PoolStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [poolId, currentWeek])

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `/api/survivor/stats?poolId=${poolId}&week=${currentWeek}`
      )
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-32 bg-gray-100" />
            </Card>
          ))}
      </div>
    )
  }

  const activeEntries = entries.filter((e) => e.isActive)
  const myBestEntry = activeEntries.reduce((best, entry) => {
    const wins = entry.picks.filter((p: any) => p.result === 'WIN').length
    const bestWins =
      best?.picks?.filter((p: any) => p.result === 'WIN').length || 0
    return wins > bestWins ? entry : best
  }, activeEntries[0])

  const getSurvivalTrend = () => {
    if (stats.weeklyEliminations.length < 2) return null
    const recent = stats.weeklyEliminations[stats.weeklyEliminations.length - 1]
    const previous =
      stats.weeklyEliminations[stats.weeklyEliminations.length - 2]
    return recent.survivalRate - previous.survivalRate
  }

  const survivalTrend = getSurvivalTrend()

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Pool Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.survivorsRemaining} / {stats.totalEntries}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {(stats.survivalRate * 100).toFixed(1)}% survival rate
            </p>
            <Progress value={stats.survivalRate * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Week {currentWeek} Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{stats.eliminatedThisWeek}
            </div>
            <p className="text-xs text-gray-500 mt-1">Eliminated this week</p>
            {survivalTrend !== null && (
              <div className="flex items-center gap-1 mt-2">
                {survivalTrend >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs">
                  {Math.abs(survivalTrend * 100).toFixed(1)}% vs last week
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Projected End
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Week {stats.projectedWinner.weeks}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {(stats.projectedWinner.probability * 100).toFixed(0)}% confidence
            </p>
            <Badge variant="outline" className="mt-2 text-xs">
              ~
              {Math.ceil(
                stats.survivorsRemaining *
                  Math.pow(
                    stats.survivalRate,
                    stats.projectedWinner.weeks - currentWeek
                  )
              )}{' '}
              winners
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Your Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myBestEntry ? (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {activeEntries.length} Active
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Best:{' '}
                  {
                    myBestEntry.picks.filter((p: any) => p.result === 'WIN')
                      .length
                  }{' '}
                  wins
                </p>
                <Badge className="mt-2 text-xs bg-green-100 text-green-800">
                  Top{' '}
                  {Math.round(
                    (activeEntries.length / stats.survivorsRemaining) * 100
                  )}
                  %
                </Badge>
              </>
            ) : (
              <div className="text-gray-500">No active entries</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Picks This Week */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Week {currentWeek} Pick Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-green-600">Most Popular</Badge>
                <span className="font-semibold">
                  {stats.mostPopularPick.team}
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">
                  {stats.mostPopularPick.percentage}%
                </div>
                <div className="text-xs text-gray-500">of entries</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-600">Contrarian</Badge>
                <span className="font-semibold">
                  {stats.leastPopularPick.team}
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">
                  {stats.leastPopularPick.percentage}%
                </div>
                <div className="text-xs text-gray-500">of entries</div>
              </div>
            </div>

            {stats.biggestUpset && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="destructive">Biggest Upset</Badge>
                  <span className="font-semibold">
                    {stats.biggestUpset.team}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {(stats.biggestUpset.winProbability * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">win probability</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Survival Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Survival Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.weeklyEliminations.map((week) => {
              const barWidth = week.survivalRate * 100
              const isCurrentWeek = week.week === currentWeek

              return (
                <div
                  key={week.week}
                  className={cn(
                    'flex items-center gap-3',
                    isCurrentWeek && 'font-semibold'
                  )}
                >
                  <div className="w-12 text-sm">Wk {week.week}</div>
                  <div className="flex-1">
                    <div className="relative h-6 bg-gray-100 rounded overflow-hidden">
                      <div
                        className={cn(
                          'absolute left-0 top-0 h-full transition-all',
                          isCurrentWeek ? 'bg-blue-500' : 'bg-gray-400'
                        )}
                        style={{ width: `${barWidth}%` }}
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-white mix-blend-difference">
                        {barWidth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-right text-gray-500">
                    -{week.eliminated}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Usage Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Most Used Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.teamUsageRates.slice(0, 12).map((team) => (
              <div
                key={team.team}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="font-medium">{team.team}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold">{team.usageCount}</div>
                  <div className="text-xs text-gray-500">
                    {team.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Survival Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Survival Projections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((weeksAhead) => {
              const targetWeek = currentWeek + weeksAhead
              if (targetWeek > 18) return null

              const projected = Math.floor(
                stats.survivorsRemaining *
                  Math.pow(stats.survivalRate, weeksAhead)
              )
              const percentage = (
                (projected / stats.totalEntries) *
                100
              ).toFixed(1)

              return (
                <div
                  key={targetWeek}
                  className="flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium">Week {targetWeek}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      (+{weeksAhead} week{weeksAhead > 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{projected}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              )
            })}

            <div className="pt-3 mt-3 border-t">
              <div className="flex items-center justify-between font-semibold">
                <span>Expected Winners</span>
                <span className="text-lg">
                  {Math.max(
                    1,
                    Math.ceil(
                      stats.survivorsRemaining *
                        Math.pow(stats.survivalRate, 18 - currentWeek)
                    )
                  )}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on current {(stats.survivalRate * 100).toFixed(1)}% weekly
                survival rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
