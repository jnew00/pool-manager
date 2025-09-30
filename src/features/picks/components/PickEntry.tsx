'use client'

import { useState } from 'react'
import type { GameWithTeams } from '@/server/services/game.service'
import type { Pool } from '@/lib/types/database'

interface SpreadPickData {
  gameId: string
  teamId: string
  confidence: number
}

interface OverUnderPickData {
  gameId: string
  overUnderPick: 'OVER' | 'UNDER'
  confidence: number
}

interface PickEntryProps {
  pool: Pool
  games: GameWithTeams[]
  entryId: string
  onPicksSubmitted: () => void
  showHeader?: boolean
}

export function PickEntry({
  pool,
  games,
  entryId,
  onPicksSubmitted,
  showHeader = true,
}: PickEntryProps) {
  const [spreadPicks, setSpreadPicks] = useState<Record<string, SpreadPickData>>({})
  const [overUnderPicks, setOverUnderPicks] = useState<Record<string, OverUnderPickData>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleTeamSelection = (gameId: string, teamId: string) => {
    if (pool.type === 'SURVIVOR') {
      // For survivor, only one pick allowed per week
      setSpreadPicks({ [gameId]: { gameId, teamId, confidence: 100 } })
    } else {
      // For other pools, allow multiple picks
      setSpreadPicks((prev) => ({
        ...prev,
        [gameId]: {
          gameId,
          teamId,
          confidence: prev[gameId]?.confidence || 50,
        },
      }))
    }
    // Clear errors when user makes a selection
    if (errors.submit) {
      setErrors({})
    }
  }

  const handleOverUnderSelection = (gameId: string, choice: 'OVER' | 'UNDER') => {
    setOverUnderPicks((prev) => ({
      ...prev,
      [gameId]: {
        gameId,
        overUnderPick: choice,
        confidence: prev[gameId]?.confidence || 50,
      },
    }))
    // Clear errors when user makes a selection
    if (errors.submit) {
      setErrors({})
    }
  }

  const handleSpreadConfidenceChange = (gameId: string, confidence: number) => {
    setSpreadPicks((prev) => ({
      ...prev,
      [gameId]: { ...prev[gameId], confidence },
    }))
  }

  const handleOverUnderConfidenceChange = (gameId: string, confidence: number) => {
    setOverUnderPicks((prev) => ({
      ...prev,
      [gameId]: { ...prev[gameId], confidence },
    }))
  }

  const validatePicks = () => {
    const newErrors: Record<string, string> = {}
    const spreadPickCount = Object.keys(spreadPicks).length
    const overUnderPickCount = Object.keys(overUnderPicks).length
    const totalPicks = spreadPickCount + overUnderPickCount

    if (totalPicks === 0) {
      newErrors.submit = 'Please make at least one pick'
    }

    if (pool.type === 'SURVIVOR' && spreadPickCount > 1) {
      newErrors.submit = 'Only one pick allowed for Survivor pools'
    }

    if (pool.type === 'POINTS_PLUS') {
      if (spreadPickCount < 4) {
        newErrors.submit = 'Points Plus pools require at least 4 picks'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePicks()) {
      return
    }

    setIsLoading(true)
    try {
      // Combine spread picks and over/under picks into single array
      const allPicks = [
        ...Object.values(spreadPicks).map(pick => ({
          gameId: pick.gameId,
          teamId: pick.teamId,
          overUnderPick: null,
          confidence: pick.confidence,
        })),
        ...Object.values(overUnderPicks).map(pick => ({
          gameId: pick.gameId,
          teamId: null,
          overUnderPick: pick.overUnderPick,
          confidence: pick.confidence,
        })),
      ]

      const response = await fetch('/api/picks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId,
          picks: allPicks,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || 'Failed to submit picks' })
        return
      }

      onPicksSubmitted()
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const getInstructions = () => {
    switch (pool.type) {
      case 'SURVIVOR':
        return 'Select one team to survive this week'
      case 'ATS':
        return 'Pick against the spread (and over/under for select games)'
      case 'SU':
        return 'Pick straight up winners'
      case 'POINTS_PLUS':
        return 'Pick at least 4 games with equal favorites and underdogs'
      default:
        return 'Make your picks'
    }
  }

  const formatGameDisplay = (game: GameWithTeams) => {
    return `${game.awayTeam.name} @ ${game.homeTeam.name}`
  }

  const isTeamSelected = (gameId: string, teamId: string) => {
    return spreadPicks[gameId]?.teamId === teamId
  }

  const isOverUnderSelected = (gameId: string, choice: 'OVER' | 'UNDER') => {
    return overUnderPicks[gameId]?.overUnderPick === choice
  }

  const hasSpread = (game: GameWithTeams) => {
    return game.lines && game.lines.length > 0 && game.lines[0].spread !== null
  }

  const hasOverUnder = (game: GameWithTeams) => {
    return game.lines && game.lines.length > 0 && game.lines[0].total !== null
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-4xl mx-auto"
      role="form"
    >
      {showHeader && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Week {games[0]?.week} Picks
          </h2>
          <p className="text-gray-600 mt-1">{getInstructions()}</p>
        </div>
      )}

      {!showHeader && (
        <div>
          <p className="text-gray-600">{getInstructions()}</p>
        </div>
      )}

      <div className="space-y-4">
        {games.map((game) => (
          <div key={game.id} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-3">
              <h3 className="font-medium text-gray-900">
                {formatGameDisplay(game)}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(game.kickoff).toLocaleDateString()}{' '}
                {new Date(game.kickoff).toLocaleTimeString()}
              </p>
            </div>

            {/* Spread Pick Section */}
            {hasSpread(game) && pool.type !== 'SURVIVOR' && (
              <div className="space-y-3 mb-4">
                <h4 className="text-sm font-semibold text-gray-700">Spread Pick</h4>

                {/* Away Team Option */}
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`spread-${game.id}`}
                    checked={isTeamSelected(game.id, game.awayTeamId)}
                    onChange={() => handleTeamSelection(game.id, game.awayTeamId)}
                    aria-label={game.awayTeam.name}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">
                    {game.awayTeam.name} ({game.awayTeam.nflAbbr})
                    {game.lines && game.lines[0]?.spread &&
                      ` ${Number(game.lines[0].spread) > 0 ? '+' : ''}${Number(game.lines[0].spread).toFixed(1)}`
                    }
                  </span>
                </label>

                {/* Home Team Option */}
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`spread-${game.id}`}
                    checked={isTeamSelected(game.id, game.homeTeamId)}
                    onChange={() => handleTeamSelection(game.id, game.homeTeamId)}
                    aria-label={game.homeTeam.name}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">
                    {game.homeTeam.name} ({game.homeTeam.nflAbbr})
                    {game.lines && game.lines[0]?.spread &&
                      ` ${Number(game.lines[0].spread) < 0 ? '' : '+'}${-Number(game.lines[0].spread).toFixed(1)}`
                    }
                  </span>
                </label>

                {/* Confidence Slider for Spread Pick */}
                {spreadPicks[game.id] && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confidence: {spreadPicks[game.id].confidence}%
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={spreadPicks[game.id].confidence}
                      onChange={(e) =>
                        handleSpreadConfidenceChange(game.id, parseInt(e.target.value))
                      }
                      aria-label="Spread pick confidence"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Survivor Pick Section */}
            {pool.type === 'SURVIVOR' && (
              <div className="space-y-3">
                {/* Away Team Option */}
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="survivor-pick"
                    checked={isTeamSelected(game.id, game.awayTeamId)}
                    onChange={() => handleTeamSelection(game.id, game.awayTeamId)}
                    aria-label={game.awayTeam.name}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">
                    {game.awayTeam.name} ({game.awayTeam.nflAbbr})
                  </span>
                </label>

                {/* Home Team Option */}
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="survivor-pick"
                    checked={isTeamSelected(game.id, game.homeTeamId)}
                    onChange={() => handleTeamSelection(game.id, game.homeTeamId)}
                    aria-label={game.homeTeam.name}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">
                    {game.homeTeam.name} ({game.homeTeam.nflAbbr})
                  </span>
                </label>
              </div>
            )}

            {/* Over/Under Pick Section */}
            {hasOverUnder(game) && pool.type === 'ATS' && (
              <div className="space-y-3 border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-700">
                  Over/Under Pick
                  {game.lines && game.lines[0]?.total &&
                    ` (Total: ${Number(game.lines[0].total).toFixed(1)})`
                  }
                </h4>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`overunder-${game.id}`}
                    checked={isOverUnderSelected(game.id, 'OVER')}
                    onChange={() => handleOverUnderSelection(game.id, 'OVER')}
                    aria-label="Over"
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-gray-900">
                    Over {game.lines && game.lines[0]?.total ? Number(game.lines[0].total).toFixed(1) : ''}
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`overunder-${game.id}`}
                    checked={isOverUnderSelected(game.id, 'UNDER')}
                    onChange={() => handleOverUnderSelection(game.id, 'UNDER')}
                    aria-label="Under"
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-gray-900">
                    Under {game.lines && game.lines[0]?.total ? Number(game.lines[0].total).toFixed(1) : ''}
                  </span>
                </label>

                {/* Confidence Slider for Over/Under Pick */}
                {overUnderPicks[game.id] && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confidence: {overUnderPicks[game.id].confidence}%
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={overUnderPicks[game.id].confidence}
                      onChange={(e) =>
                        handleOverUnderConfidenceChange(game.id, parseInt(e.target.value))
                      }
                      aria-label="Over/under pick confidence"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pick Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-800">
          Total picks: {Object.keys(spreadPicks).length + Object.keys(overUnderPicks).length}
          {' '}({Object.keys(spreadPicks).length} spread, {Object.keys(overUnderPicks).length} over/under)
        </p>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Submitting Picks...' : 'Submit Picks'}
      </button>
    </form>
  )
}
