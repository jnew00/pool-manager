'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Check,
  X,
  TrendingUp,
  Star,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTeamLogoUrl } from '@/lib/utils/team-logos'

// Team logo utility function (use centralized function)
const getTeamLogo = (teamAbbr: string) => {
  return getTeamLogoUrl(teamAbbr)
}

// Team logo component with fallback
const TeamLogo = ({
  teamAbbr,
  teamName,
  size = 'w-8 h-8',
}: {
  teamAbbr: string
  teamName?: string
  size?: string
}) => (
  <img
    src={getTeamLogo(teamAbbr)}
    alt={teamName || teamAbbr}
    className={`${size} object-contain`}
    onError={(e) => {
      const target = e.target as HTMLImageElement
      target.style.display = 'none'
      const parent = target.parentElement
      if (parent && !parent.querySelector('.fallback-text')) {
        const fallback = document.createElement('span')
        fallback.className = 'fallback-text text-xs font-bold text-gray-600'
        fallback.textContent = teamAbbr
        parent.appendChild(fallback)
      }
    }}
  />
)

interface Team {
  id: string
  abbr: string
  name: string
  conference: 'AFC' | 'NFC'
  division: string
  currentRecord: string
  available: boolean
  gameId: string
  opponent: string
  isHome: boolean
  kickoff: string
  spread?: number | null
  moneyline?: number | null
  winProbability?: number
  publicPickPercentage?: number
  expectedValue?: number
  futureValue?: number
  gameStatus: string
}

interface TeamSelectorProps {
  week: number
  usedTeams: Set<string>
  onSelect: (teamId: string, gameId: string) => void
  poolId: string
  strategy?: 'CONSERVATIVE' | 'BALANCED' | 'CONTRARIAN' | 'RISK_SEEKING'
  onStrategyChange?: (
    strategy: 'CONSERVATIVE' | 'BALANCED' | 'CONTRARIAN' | 'RISK_SEEKING'
  ) => void
  recommendations?: {
    primaryPick?: { teamAbbr: string; teamId: string }
    secondaryPicks?: Array<{ teamAbbr: string; teamId: string }>
    contrarian?: { teamAbbr: string; teamId: string }
  }
}

const NFL_DIVISIONS = {
  AFC: {
    East: ['BUF', 'MIA', 'NE', 'NYJ'],
    North: ['BAL', 'CIN', 'CLE', 'PIT'],
    South: ['HOU', 'IND', 'JAX', 'TEN'],
    West: ['DEN', 'KC', 'LV', 'LAC'],
  },
  NFC: {
    East: ['DAL', 'NYG', 'PHI', 'WAS'],
    North: ['CHI', 'DET', 'GB', 'MIN'],
    South: ['ATL', 'CAR', 'NO', 'TB'],
    West: ['ARI', 'LAR', 'SF', 'SEA'],
  },
}

export default function TeamSelector({
  week,
  usedTeams,
  onSelect,
  poolId,
  strategy = 'BALANCED',
  onStrategyChange,
  recommendations,
}: TeamSelectorProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [sortBy, setSortBy] = useState<
    | 'winProbability'
    | 'publicPickPercentage'
    | 'expectedValue'
    | 'futureValue'
    | 'default'
  >('default')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchTeams()
  }, [week, poolId])

  const fetchTeams = async () => {
    try {
      const response = await fetch(
        `/api/survivor/teams?week=${week}&poolId=${poolId}`
      )
      if (response.ok) {
        const data = await response.json()
        const teamsWithAvailability = data.map((team: any) => ({
          ...team,
          available: !usedTeams.has(team.id),
        }))
        setTeams(teamsWithAvailability)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTeams = teams
    .filter(
      (team) =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.abbr.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Always sort available teams first
      if (a.available !== b.available) return a.available ? -1 : 1

      if (sortBy === 'default') {
        // Default sort by win probability desc
        return (b.winProbability || 0) - (a.winProbability || 0)
      }

      let aValue: number = 0
      let bValue: number = 0

      switch (sortBy) {
        case 'winProbability':
          aValue = a.winProbability || 0
          bValue = b.winProbability || 0
          break
        case 'publicPickPercentage':
          aValue = a.publicPickPercentage || 0
          bValue = b.publicPickPercentage || 0
          break
        case 'expectedValue':
          aValue = a.expectedValue || 0
          bValue = b.expectedValue || 0
          break
        case 'futureValue':
          aValue = a.futureValue || 0
          bValue = b.futureValue || 0
          break
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

  const getTeamColor = (team: Team) => {
    if (!team.available) return 'bg-gray-100 opacity-50'
    if (team.winProbability && team.winProbability >= 0.7)
      return 'bg-green-50 hover:bg-green-100'
    if (team.winProbability && team.winProbability >= 0.6)
      return 'bg-blue-50 hover:bg-blue-100'
    return 'bg-white hover:bg-gray-50'
  }

  const handleTeamClick = (team: Team) => {
    if (!team.available) return
    setSelectedTeam(team === selectedTeam ? null : team)
  }

  const confirmSelection = () => {
    if (selectedTeam) {
      onSelect(selectedTeam.id, selectedTeam.gameId)
      setSelectedTeam(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="grid grid-cols-4 gap-4">
              {Array(32)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded" />
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Select Your Team - Week {week}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {/* Sorting Controls */}
        {viewMode === 'list' && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Button
              variant={sortBy === 'winProbability' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (sortBy === 'winProbability') {
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                } else {
                  setSortBy('winProbability')
                  setSortOrder('desc')
                }
              }}
              className="flex items-center gap-1"
            >
              Win %
              {sortBy === 'winProbability' &&
                (sortOrder === 'desc' ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <ArrowUp className="h-3 w-3" />
                ))}
            </Button>
            <Button
              variant={
                sortBy === 'publicPickPercentage' ? 'default' : 'outline'
              }
              size="sm"
              onClick={() => {
                if (sortBy === 'publicPickPercentage') {
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                } else {
                  setSortBy('publicPickPercentage')
                  setSortOrder('asc')
                }
              }}
              className="flex items-center gap-1"
            >
              Public %
              {sortBy === 'publicPickPercentage' &&
                (sortOrder === 'desc' ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <ArrowUp className="h-3 w-3" />
                ))}
            </Button>
            <Button
              variant={sortBy === 'expectedValue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (sortBy === 'expectedValue') {
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                } else {
                  setSortBy('expectedValue')
                  setSortOrder('desc')
                }
              }}
              className="flex items-center gap-1"
            >
              EV
              {sortBy === 'expectedValue' &&
                (sortOrder === 'desc' ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <ArrowUp className="h-3 w-3" />
                ))}
            </Button>
            <Button
              variant={sortBy === 'futureValue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (sortBy === 'futureValue') {
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                } else {
                  setSortBy('futureValue')
                  setSortOrder('desc')
                }
              }}
              className="flex items-center gap-1"
            >
              Future
              {sortBy === 'futureValue' &&
                (sortOrder === 'desc' ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <ArrowUp className="h-3 w-3" />
                ))}
            </Button>
            <Button
              variant={sortBy === 'default' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('default')}
              className="flex items-center gap-1"
            >
              <ArrowUpDown className="h-3 w-3" />
              Default
            </Button>
          </div>
        )}

        {/* Quick Recommendations */}
        {recommendations && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-gray-600">Top Picks:</span>
            {recommendations.primaryPick && (
              <Badge
                variant="default"
                className="cursor-pointer hover:bg-blue-600 flex items-center gap-2 px-3 py-2"
                onClick={() => {
                  const team = teams.find(
                    (t) => t.abbr === recommendations.primaryPick?.teamAbbr
                  )
                  if (team?.available) {
                    handleTeamClick(team)
                  }
                }}
              >
                <TeamLogo
                  teamAbbr={recommendations.primaryPick.teamAbbr}
                  size="w-5 h-5"
                />
                {recommendations.primaryPick.teamAbbr} (Primary)
              </Badge>
            )}
            {recommendations.contrarian && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 flex items-center gap-2 px-3 py-2"
                onClick={() => {
                  const team = teams.find(
                    (t) => t.abbr === recommendations.contrarian?.teamAbbr
                  )
                  if (team?.available) {
                    handleTeamClick(team)
                  }
                }}
              >
                <TeamLogo
                  teamAbbr={recommendations.contrarian.teamAbbr}
                  size="w-5 h-5"
                />
                {recommendations.contrarian.teamAbbr} (Contrarian)
              </Badge>
            )}
            {recommendations.secondaryPicks?.slice(0, 2).map((pick, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200 flex items-center gap-2 px-3 py-2"
                onClick={() => {
                  const team = teams.find((t) => t.abbr === pick.teamAbbr)
                  if (team?.available) {
                    handleTeamClick(team)
                  }
                }}
              >
                <TeamLogo teamAbbr={pick.teamAbbr} size="w-5 h-5" />
                {pick.teamAbbr}
              </Badge>
            ))}
          </div>
        )}

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {selectedTeam && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <span className="font-medium">Selected: </span>
              <span className="font-bold">{selectedTeam.name}</span>
              {selectedTeam.winProbability && (
                <span className="ml-2 text-sm text-gray-600">
                  ({(selectedTeam.winProbability * 100).toFixed(0)}% win
                  probability)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={confirmSelection} size="sm">
                Confirm Selection
              </Button>
              <Button
                onClick={() => setSelectedTeam(null)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {viewMode === 'grid' ? (
          Object.entries(NFL_DIVISIONS).map(([conference, divisions]) => (
            <div key={conference}>
              <h3 className="font-semibold text-lg mb-3">{conference}</h3>
              {Object.entries(divisions).map(([division, teamAbbrs]) => (
                <div key={division} className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    {conference} {division}
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {teamAbbrs.map((abbr) => {
                      const team = teams.find((t) => t.abbr === abbr)
                      if (!team) return null

                      return (
                        <div
                          key={team.id}
                          onClick={() => handleTeamClick(team)}
                          className={cn(
                            'p-3 rounded-lg border-2 cursor-pointer transition-all',
                            getTeamColor(team),
                            !team.available && 'cursor-not-allowed',
                            selectedTeam?.id === team.id && 'border-blue-500',
                            team.available &&
                              selectedTeam?.id !== team.id &&
                              'border-gray-200'
                          )}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className="flex items-center justify-between w-full">
                              <span className="font-bold text-lg">
                                {team.abbr}
                              </span>
                              {!team.available && (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                              {team.available &&
                                selectedTeam?.id === team.id && (
                                  <Check className="h-4 w-4 text-blue-500" />
                                )}
                            </div>
                            <div className="w-12 h-12 flex items-center justify-center">
                              <TeamLogo
                                teamAbbr={team.abbr}
                                teamName={team.name}
                                size="w-10 h-10"
                              />
                            </div>
                            <div className="text-xs text-gray-600 text-center">
                              {team.currentRecord}
                            </div>
                            {team.winProbability && team.available && (
                              <div className="text-xs">
                                <span
                                  className={cn(
                                    'font-medium',
                                    team.winProbability >= 0.7 &&
                                      'text-green-600',
                                    team.winProbability >= 0.6 &&
                                      team.winProbability < 0.7 &&
                                      'text-blue-600',
                                    team.winProbability < 0.6 &&
                                      'text-yellow-600'
                                  )}
                                >
                                  {(team.winProbability * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="space-y-2">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                onClick={() => handleTeamClick(team)}
                className={cn(
                  'p-4 rounded-lg border-2 cursor-pointer transition-all',
                  getTeamColor(team),
                  !team.available && 'cursor-not-allowed',
                  selectedTeam?.id === team.id && 'border-blue-500',
                  team.available &&
                    selectedTeam?.id !== team.id &&
                    'border-gray-200'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <TeamLogo
                        teamAbbr={team.abbr}
                        teamName={team.name}
                        size="w-10 h-10"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{team.abbr}</span>
                        <span className="text-gray-600">{team.name}</span>
                        {!team.available && (
                          <Badge variant="destructive" className="text-xs">
                            Used
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {team.conference} {team.division} • {team.currentRecord}
                      </div>
                    </div>
                  </div>

                  {team.available && (
                    <div className="flex items-center gap-4 text-sm">
                      {team.winProbability && (
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Win %</div>
                          <div
                            className={cn(
                              'font-bold',
                              team.winProbability >= 0.7 && 'text-green-600',
                              team.winProbability >= 0.6 &&
                                team.winProbability < 0.7 &&
                                'text-blue-600',
                              team.winProbability < 0.6 && 'text-yellow-600'
                            )}
                          >
                            {(team.winProbability * 100).toFixed(0)}%
                          </div>
                        </div>
                      )}
                      {team.publicPickPercentage !== undefined && (
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Public</div>
                          <div className="font-medium flex items-center gap-1">
                            {team.publicPickPercentage}%
                            {team.publicPickPercentage > 20 && (
                              <TrendingUp className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      )}
                      {team.expectedValue !== undefined && (
                        <div className="text-center">
                          <div className="text-xs text-gray-500">EV</div>
                          <Badge
                            className={cn(
                              'text-xs',
                              team.expectedValue >= 1.5 &&
                                'bg-green-100 text-green-800',
                              team.expectedValue >= 1.0 &&
                                team.expectedValue < 1.5 &&
                                'bg-blue-100 text-blue-800',
                              team.expectedValue < 1.0 &&
                                'bg-yellow-100 text-yellow-800'
                            )}
                          >
                            {team.expectedValue.toFixed(2)}
                          </Badge>
                        </div>
                      )}
                      {team.futureValue !== undefined && (
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Future</div>
                          <div className="flex">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    'h-3 w-3',
                                    i < Math.round(team.futureValue)
                                      ? 'fill-yellow-500 text-yellow-500'
                                      : 'text-gray-300'
                                  )}
                                />
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">
                {teams.filter((t) => t.available).length}
              </span>{' '}
              teams available
            </div>
            <div>
              <span className="font-medium">
                {teams.filter((t) => !t.available).length}
              </span>{' '}
              teams used
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
