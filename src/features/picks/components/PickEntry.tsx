'use client'

import { useState } from 'react'
import type { GameWithTeams } from '@/server/services/game.service'
import type { Pool } from '@/lib/types/database'

interface PickData {
  gameId: string
  teamId?: string
  overUnderPick?: 'OVER' | 'UNDER'
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
  const [picks, setPicks] = useState<Record<string, PickData>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleTeamSelection = (gameId: string, teamId: string) => {
    if (pool.type === 'SURVIVOR') {
      // For survivor, only one pick allowed per week
      setPicks({ [gameId]: { gameId, teamId, confidence: 100 } })
    } else {
      // For other pools, allow multiple picks
      setPicks((prev) => ({
        ...prev,
        [gameId]: {
          gameId,
          teamId,
          overUnderPick: undefined, // Clear over/under if selecting team
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
    setPicks((prev) => ({
      ...prev,
      [gameId]: {
        gameId,
        teamId: undefined, // Clear team selection if selecting over/under
        overUnderPick: choice,
        confidence: prev[gameId]?.confidence || 50,
      },
    }))
    // Clear errors when user makes a selection
    if (errors.submit) {
      setErrors({})
    }
  }

  const handleConfidenceChange = (gameId: string, confidence: number) => {
    setPicks((prev) => ({
      ...prev,
      [gameId]: { ...prev[gameId], confidence },
    }))
  }

  const validatePicks = () => {
    const newErrors: Record<string, string> = {}
    const pickCount = Object.keys(picks).length

    if (pickCount === 0) {
      newErrors.submit = 'Please make at least one pick'
    }

    if (pool.type === 'SURVIVOR' && pickCount > 1) {
      newErrors.submit = 'Only one pick allowed for Survivor pools'
    }

    if (pool.type === 'POINTS_PLUS') {
      if (pickCount < 4) {
        newErrors.submit = 'Points Plus pools require at least 4 picks'
      } else {
        // Check for equal favorites and underdogs (placeholder for now)
        // This would require spread data which we don't have in this component yet
        // For now, just ensure we have at least 4 picks
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
      const response = await fetch('/api/picks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId,
          picks: Object.values(picks),
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
        return 'Pick against the spread'
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
    return picks[gameId]?.teamId === teamId
  }

  const isOverUnderSelected = (gameId: string, choice: 'OVER' | 'UNDER') => {
    return picks[gameId]?.overUnderPick === choice
  }

  const isOverUnderGame = (game: GameWithTeams) => {
    // A game is over/under only if it has a total line but no teams can be picked
    // For now, we'll check if the game has lines with total
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

            <div className="space-y-3">
              {isOverUnderGame(game) && pool.type === 'ATS' ? (
                // Over/Under Options
                <>
                  {game.lines && game.lines[0]?.total && (
                    <div className="mb-2 text-sm font-medium text-gray-700">
                      Total: {Number(game.lines[0].total).toFixed(1)}
                    </div>
                  )}
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`game-${game.id}`}
                      checked={isOverUnderSelected(game.id, 'OVER')}
                      onChange={() => handleOverUnderSelection(game.id, 'OVER')}
                      aria-label="Over"
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-900">
                      Over {game.lines && game.lines[0]?.total ? Number(game.lines[0].total).toFixed(1) : ''}
                    </span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`game-${game.id}`}
                      checked={isOverUnderSelected(game.id, 'UNDER')}
                      onChange={() => handleOverUnderSelection(game.id, 'UNDER')}
                      aria-label="Under"
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-900">
                      Under {game.lines && game.lines[0]?.total ? Number(game.lines[0].total).toFixed(1) : ''}
                    </span>
                  </label>
                </>
              ) : (
                // Team Selection Options
                <>
                  {/* Away Team Option */}
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type={pool.type === 'SURVIVOR' ? 'radio' : 'radio'}
                      name={
                        pool.type === 'SURVIVOR'
                          ? 'survivor-pick'
                          : `game-${game.id}`
                      }
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
                      type={pool.type === 'SURVIVOR' ? 'radio' : 'radio'}
                      name={
                        pool.type === 'SURVIVOR'
                          ? 'survivor-pick'
                          : `game-${game.id}`
                      }
                      checked={isTeamSelected(game.id, game.homeTeamId)}
                      onChange={() => handleTeamSelection(game.id, game.homeTeamId)}
                      aria-label={game.homeTeam.name}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-900">
                      {game.homeTeam.name} ({game.homeTeam.nflAbbr})
                    </span>
                  </label>
                </>
              )}

              {/* Confidence Slider (only for non-Survivor pools) */}
              {pool.type !== 'SURVIVOR' && picks[game.id] && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confidence for{' '}
                    {picks[game.id].overUnderPick
                      ? picks[game.id].overUnderPick
                      : picks[game.id].teamId === game.awayTeamId
                        ? game.awayTeam.name
                        : game.homeTeam.name}
                    : {picks[game.id].confidence}%
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={picks[game.id].confidence}
                    onChange={(e) =>
                      handleConfidenceChange(game.id, parseInt(e.target.value))
                    }
                    aria-label={`Confidence for ${picks[game.id].overUnderPick || (picks[game.id].teamId === game.awayTeamId ? game.awayTeam.name : game.homeTeam.name)}`}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
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
