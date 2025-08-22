'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Trophy,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Pick {
  week: number
  teamId: string
  teamAbbr: string
  opponent: string
  result?: 'WIN' | 'LOSS' | 'PENDING'
  marginOfVictory?: number
  score?: string
  spread?: number
  actualSpread?: number
}

interface PickHistoryProps {
  poolId: string
  entry?: {
    id: string
    entryName: string
    isActive: boolean
    eliminatedWeek?: number
    strikes: number
    picks: Pick[]
  }
  currentWeek?: number
}

export default function PickHistory({
  poolId,
  entry,
  currentWeek = 1,
}: PickHistoryProps) {
  const getResultIcon = (result?: string) => {
    switch (result) {
      case 'WIN':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'LOSS':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getResultColor = (result?: string) => {
    switch (result) {
      case 'WIN':
        return 'bg-green-50 border-green-200'
      case 'LOSS':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-yellow-50 border-yellow-200'
    }
  }

  const getMOVBadge = (mov?: number) => {
    if (!mov) return null

    const color =
      mov >= 14
        ? 'bg-green-100 text-green-800'
        : mov >= 7
          ? 'bg-blue-100 text-blue-800'
          : mov >= 0
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'

    return (
      <Badge className={cn('text-xs', color)}>
        MOV: {mov > 0 ? '+' : ''}
        {mov}
      </Badge>
    )
  }

  const getSpreadComparison = (spread?: number, actualSpread?: number) => {
    if (!spread || actualSpread === undefined) return null

    const difference = actualSpread - spread
    const beat = actualSpread > 0

    return (
      <div className="flex items-center gap-1 text-xs">
        <span className="text-gray-500">Spread:</span>
        <span
          className={cn(
            'font-medium',
            beat ? 'text-green-600' : 'text-red-600'
          )}
        >
          {beat ? 'Beat' : 'Missed'} by {Math.abs(difference).toFixed(1)}
        </span>
      </div>
    )
  }

  // Default empty entry if not provided
  const defaultEntry = {
    id: '',
    entryName: 'No Entry Selected',
    isActive: true,
    strikes: 0,
    picks: [],
  }

  const activeEntry = entry || defaultEntry

  // Group picks by result
  const wins = activeEntry.picks.filter((p) => p.result === 'WIN').length
  const losses = activeEntry.picks.filter((p) => p.result === 'LOSS').length
  const pending = activeEntry.picks.filter((p) => p.result === 'PENDING').length
  const winRate =
    activeEntry.picks.length > 0
      ? ((wins / (wins + losses)) * 100).toFixed(0)
      : '0'

  // Calculate average MOV
  const avgMOV =
    activeEntry.picks
      .filter((p) => p.marginOfVictory !== undefined)
      .reduce((sum, p) => sum + (p.marginOfVictory || 0), 0) /
      activeEntry.picks.filter((p) => p.marginOfVictory !== undefined).length ||
    0

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Entry Summary</span>
            {!activeEntry.isActive && (
              <Badge variant="destructive">
                Eliminated Week {activeEntry.eliminatedWeek}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{wins}</div>
              <div className="text-sm text-gray-500">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{losses}</div>
              <div className="text-sm text-gray-500">Losses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {pending}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{winRate}%</div>
              <div className="text-sm text-gray-500">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{avgMOV.toFixed(1)}</div>
              <div className="text-sm text-gray-500">Avg MOV</div>
            </div>
          </div>

          {activeEntry.strikes > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">
                <strong>{activeEntry.strikes}</strong> strike
                {activeEntry.strikes > 1 ? 's' : ''} used
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Week by Week Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Pick Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: currentWeek }, (_, i) => i + 1).map(
              (week) => {
                const pick = activeEntry.picks.find((p) => p.week === week)

                if (!pick) {
                  return (
                    <div
                      key={week}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg opacity-50"
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
                        <span className="font-bold text-gray-500">{week}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-500">No pick made</span>
                      </div>
                    </div>
                  )
                }

                return (
                  <div
                    key={week}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-lg border',
                      getResultColor(pick.result)
                    )}
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full border-2">
                      <span className="font-bold">{week}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {getResultIcon(pick.result)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">
                              {pick.teamAbbr}
                            </span>
                            <span className="text-gray-500">vs</span>
                            <span className="text-gray-600">
                              {pick.opponent}
                            </span>
                            {pick.score && (
                              <Badge variant="outline" className="text-xs">
                                {pick.score}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            {getMOVBadge(pick.marginOfVictory)}
                            {getSpreadComparison(
                              pick.spread,
                              pick.actualSpread
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {week === currentWeek && pick.result === 'PENDING' && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Current Week
                      </Badge>
                    )}

                    {pick.result === 'LOSS' &&
                      week === activeEntry.eliminatedWeek && (
                        <Badge variant="destructive">Eliminated</Badge>
                      )}
                  </div>
                )
              }
            )}

            {/* Future Weeks Preview */}
            {activeEntry.isActive && currentWeek < 18 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>Upcoming Weeks</span>
                </div>
                <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
                  {Array.from(
                    { length: 18 - currentWeek },
                    (_, i) => currentWeek + i + 1
                  ).map((week) => (
                    <div
                      key={week}
                      className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg text-sm font-medium text-gray-600"
                    >
                      {week}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      {(wins >= 10 ||
        activeEntry.picks.some((p) => (p.marginOfVictory || 0) >= 20)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {wins >= 10 && (
                <Badge className="bg-green-100 text-green-800">
                  10+ Win Streak
                </Badge>
              )}
              {wins >= 15 && (
                <Badge className="bg-purple-100 text-purple-800">
                  Elite Survivor
                </Badge>
              )}
              {activeEntry.picks.some(
                (p) => (p.marginOfVictory || 0) >= 20
              ) && (
                <Badge className="bg-blue-100 text-blue-800">
                  Blowout Pick (20+ MOV)
                </Badge>
              )}
              {activeEntry.picks.filter((p) => (p.marginOfVictory || 0) >= 14)
                .length >= 5 && (
                <Badge className="bg-orange-100 text-orange-800">
                  Consistent Excellence
                </Badge>
              )}
              {!activeEntry.isActive && wins >= 12 && (
                <Badge className="bg-gray-100 text-gray-800">
                  Valiant Effort
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
