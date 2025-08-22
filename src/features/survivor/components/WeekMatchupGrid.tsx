'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Star,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Home,
  Plane,
  Lock,
  CheckCircle,
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

interface Game {
  id: string
  homeTeam: {
    id: string
    abbr: string
    name: string
    record: string
  }
  awayTeam: {
    id: string
    abbr: string
    name: string
    record: string
  }
  spread: number
  homeWinProbability: number
  awayWinProbability: number
  homePublicPick: number
  awayPublicPick: number
  homeEV: number
  awayEV: number
  homeFutureValue: number
  awayFutureValue: number
  weather?: {
    condition: string
    risk: 'LOW' | 'MEDIUM' | 'HIGH'
  }
  time: string
  tv: string
}

interface WeekMatchupGridProps {
  week: number
  poolId: string
  usedTeams: Set<string>
  onPickSelect: (teamId: string, gameId: string) => void
  selectedEntry: any
  canPick: boolean
}

export default function WeekMatchupGrid({
  week,
  poolId,
  usedTeams,
  onPickSelect,
  selectedEntry,
  canPick,
}: WeekMatchupGridProps) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPick, setSelectedPick] = useState<{
    teamId: string
    gameId: string
  } | null>(null)

  useEffect(() => {
    if (poolId) {
      fetchGames()
    }
  }, [week, poolId])

  const fetchGames = async () => {
    if (!poolId) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        `/api/survivor/games?week=${week}&poolId=${poolId}`
      )
      if (response.ok) {
        const data = await response.json()
        setGames(data.games)
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch games:', errorData)
      }
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWinProbabilityColor = (probability: number) => {
    if (probability >= 0.7) return 'text-green-600'
    if (probability >= 0.6) return 'text-blue-600'
    if (probability >= 0.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEVColor = (ev: number) => {
    if (ev >= 1.5) return 'bg-green-100 text-green-800'
    if (ev >= 1.0) return 'bg-blue-100 text-blue-800'
    if (ev >= 0.7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getFutureValueStars = (value: number) => {
    const stars = Math.round(value)
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3 w-3',
            i < stars ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
          )}
        />
      ))
  }

  const getWeatherIcon = (condition?: string) => {
    switch (condition) {
      case 'RAIN':
        return <CloudRain className="h-4 w-4 text-blue-500" />
      case 'SNOW':
        return <CloudSnow className="h-4 w-4 text-blue-300" />
      case 'WIND':
        return <Wind className="h-4 w-4 text-gray-500" />
      case 'DOME':
        return <Home className="h-4 w-4 text-green-500" />
      default:
        return <Cloud className="h-4 w-4 text-gray-400" />
    }
  }

  const handlePickClick = (teamId: string, gameId: string) => {
    if (!canPick) return

    if (selectedPick?.teamId === teamId) {
      // Deselect if clicking same team
      setSelectedPick(null)
    } else {
      setSelectedPick({ teamId, gameId })
    }
  }

  const confirmPick = () => {
    if (selectedPick) {
      onPickSelect(selectedPick.teamId, selectedPick.gameId)
      setSelectedPick(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48 bg-gray-100" />
            </Card>
          ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedPick && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            You've selected{' '}
            <strong>
              {games.find(
                (g) =>
                  g.homeTeam.id === selectedPick.teamId ||
                  g.awayTeam.id === selectedPick.teamId
              )?.homeTeam.id === selectedPick.teamId
                ? games.find((g) => g.id === selectedPick.gameId)?.homeTeam.abbr
                : games.find((g) => g.id === selectedPick.gameId)?.awayTeam
                    .abbr}
            </strong>{' '}
            for Week {week}
          </div>
          <div className="flex gap-2">
            <Button onClick={confirmPick} size="sm">
              Confirm Pick
            </Button>
            <Button
              onClick={() => setSelectedPick(null)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => {
          const homeUsed = usedTeams.has(game.homeTeam.id)
          const awayUsed = usedTeams.has(game.awayTeam.id)
          const homeSelected = selectedPick?.teamId === game.homeTeam.id
          const awaySelected = selectedPick?.teamId === game.awayTeam.id

          return (
            <Card key={game.id} className="overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 flex items-center justify-between text-sm">
                <span className="font-medium">{game.time}</span>
                <div className="flex items-center gap-2">
                  {game.weather && getWeatherIcon(game.weather.condition)}
                  {game.weather?.risk === 'HIGH' && (
                    <Badge variant="destructive" className="text-xs">
                      High Risk
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {game.tv}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Away Team */}
                <div
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all cursor-pointer',
                    awayUsed && 'opacity-50 cursor-not-allowed',
                    awaySelected && 'border-blue-500 bg-blue-50',
                    !awayUsed &&
                      !awaySelected &&
                      canPick &&
                      'hover:border-gray-400',
                    !awayUsed && !awaySelected && !canPick && 'cursor-default'
                  )}
                  onClick={() =>
                    !awayUsed && handlePickClick(game.awayTeam.id, game.id)
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 text-gray-400" />
                        <TeamLogo
                          teamAbbr={game.awayTeam.abbr}
                          teamName={game.awayTeam.name}
                          size="w-6 h-6"
                        />
                      </div>
                      <span className="font-semibold">
                        {game.awayTeam.abbr}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({game.awayTeam.record})
                      </span>
                      {awayUsed && <Lock className="h-4 w-4 text-red-500" />}
                      {awaySelected && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'font-medium',
                        getWinProbabilityColor(game.awayWinProbability)
                      )}
                    >
                      {(game.awayWinProbability * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col">
                      <span className="text-gray-500">Public</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {game.awayPublicPick}%
                        </span>
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">EV</span>
                      <Badge
                        className={cn('text-xs px-1', getEVColor(game.awayEV))}
                      >
                        {game.awayEV.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Future</span>
                      <div className="flex">
                        {getFutureValueStars(game.awayFutureValue)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-xs text-gray-500">
                  {game.spread > 0
                    ? `${game.awayTeam.abbr} -${Math.abs(game.spread)}`
                    : game.spread < 0
                      ? `${game.homeTeam.abbr} -${Math.abs(game.spread)}`
                      : 'PICK'}
                </div>

                {/* Home Team */}
                <div
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all cursor-pointer',
                    homeUsed && 'opacity-50 cursor-not-allowed',
                    homeSelected && 'border-blue-500 bg-blue-50',
                    !homeUsed &&
                      !homeSelected &&
                      canPick &&
                      'hover:border-gray-400',
                    !homeUsed && !homeSelected && !canPick && 'cursor-default'
                  )}
                  onClick={() =>
                    !homeUsed && handlePickClick(game.homeTeam.id, game.id)
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-400" />
                        <TeamLogo
                          teamAbbr={game.homeTeam.abbr}
                          teamName={game.homeTeam.name}
                          size="w-6 h-6"
                        />
                      </div>
                      <span className="font-semibold">
                        {game.homeTeam.abbr}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({game.homeTeam.record})
                      </span>
                      {homeUsed && <Lock className="h-4 w-4 text-red-500" />}
                      {homeSelected && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'font-medium',
                        getWinProbabilityColor(game.homeWinProbability)
                      )}
                    >
                      {(game.homeWinProbability * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col">
                      <span className="text-gray-500">Public</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {game.homePublicPick}%
                        </span>
                        {game.homePublicPick > game.awayPublicPick ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">EV</span>
                      <Badge
                        className={cn('text-xs px-1', getEVColor(game.homeEV))}
                      >
                        {game.homeEV.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Future</span>
                      <div className="flex">
                        {getFutureValueStars(game.homeFutureValue)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
