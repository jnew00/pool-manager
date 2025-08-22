'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Zap,
  Info,
} from 'lucide-react'
import type {
  PointsPlusWeekStrategy,
  PointsPlusStrategyConfig,
  PointsPlusGameAnalysis,
} from '@/lib/models/points-plus-strategy'

interface PointsPlusStrategyAdvisorProps {
  poolId: string
  week: number
  season: number
  onPicksSelected?: (picks: { gameId: string; teamId: string }[]) => void
}

export function PointsPlusStrategyAdvisor({
  poolId,
  week,
  season,
  onPicksSelected,
}: PointsPlusStrategyAdvisorProps) {
  const [strategy, setStrategy] = useState<PointsPlusWeekStrategy | null>(null)
  const [config, setConfig] = useState<PointsPlusStrategyConfig>({
    mode: 'balanced',
    pickCount: 'optimal',
    favoriteThreshold: -7,
    underdogThreshold: 10,
    avoidDivisional: false,
    avoidPrimeTime: false,
    homeFieldWeight: 0.3,
    recentFormWeight: 0.4,
    weatherImpactThreshold: 15,
    // Advanced strategy factors based on research
    favorKeyNumbers: true,
    homeUnderdogBonus: 0.15,
    blowoutAvoidance: true,
    closeGameFocus: true,
    motivationalFactors: true,
  })
  const [selectedFavorites, setSelectedFavorites] = useState<Set<string>>(
    new Set()
  )
  const [selectedUnderdogs, setSelectedUnderdogs] = useState<Set<string>>(
    new Set()
  )
  const [loading, setLoading] = useState(false)
  const [configLoading, setConfigLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUserSelections, setHasUserSelections] = useState(false)
  const [previousExpectedPoints, setPreviousExpectedPoints] = useState<
    number | null
  >(null)

  // Debounce config changes to prevent rapid API calls
  const [configDebounced, setConfigDebounced] = useState(config)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setConfigDebounced(config)
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [config])

  useEffect(() => {
    loadStrategy()
  }, [poolId, week, season, configDebounced])

  // Auto-apply recommendations when strategy is loaded or when user changes strategy
  useEffect(() => {
    if (strategy && !hasUserSelections) {
      const newFavorites = new Set<string>()
      const newUnderdogs = new Set<string>()

      strategy.recommendations.favorites.forEach((g) =>
        newFavorites.add(g.gameId)
      )
      strategy.recommendations.underdogs.forEach((g) =>
        newUnderdogs.add(g.gameId)
      )

      setSelectedFavorites(newFavorites)
      setSelectedUnderdogs(newUnderdogs)
    }
  }, [strategy, hasUserSelections])

  const loadStrategy = useCallback(async () => {
    // Show different loading states based on context
    const isConfigChange = strategy !== null
    if (isConfigChange) {
      setConfigLoading(true)
      // Store the current expected points before loading new strategy
      if (strategy?.recommendations?.totalExpectedPoints != null) {
        setPreviousExpectedPoints(strategy.recommendations.totalExpectedPoints)
        console.log(
          `[Strategy Change] Storing previous expected points: ${strategy.recommendations.totalExpectedPoints}`
        )
      }
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const response = await fetch('/api/pools/points-plus-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId,
          week,
          season,
          config: configDebounced,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to load strategy analysis')
      }

      const data = await response.json()
      console.log(
        `[Strategy Change] New expected points: ${data.data?.recommendations?.totalExpectedPoints}`
      )
      setStrategy(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load strategy')
    } finally {
      setLoading(false)
      setConfigLoading(false)
    }
  }, [poolId, week, season, configDebounced, strategy])

  const handleStrategyModeChange = useCallback(
    (mode: PointsPlusStrategyConfig['mode']) => {
      const newConfig = { ...config, mode }

      // Adjust thresholds based on mode
      switch (mode) {
        case 'conservative':
          newConfig.favoriteThreshold = -10
          newConfig.underdogThreshold = 7
          newConfig.pickCount = 'minimum'
          break
        case 'aggressive':
          newConfig.favoriteThreshold = -4
          newConfig.underdogThreshold = 14
          newConfig.pickCount = 'maximum'
          break
        case 'balanced':
          newConfig.favoriteThreshold = -7
          newConfig.underdogThreshold = 10
          newConfig.pickCount = 'optimal'
          break
      }

      // Reset user selections flag when strategy changes - user wants new recommendations
      setHasUserSelections(false)
      setConfig(newConfig)
    },
    [config]
  )

  const toggleFavorite = useCallback(
    (game: PointsPlusGameAnalysis) => {
      const newFavorites = new Set(selectedFavorites)
      const newUnderdogs = new Set(selectedUnderdogs)

      if (newFavorites.has(game.gameId)) {
        // Deselecting this favorite
        newFavorites.delete(game.gameId)
      } else {
        // Selecting this favorite - must remove from underdogs if present
        newFavorites.add(game.gameId)
        if (newUnderdogs.has(game.gameId)) {
          newUnderdogs.delete(game.gameId)
          setSelectedUnderdogs(newUnderdogs)
        }
      }
      setSelectedFavorites(newFavorites)
      setHasUserSelections(true) // Mark that user has made manual selections
    },
    [selectedFavorites, selectedUnderdogs]
  )

  const toggleUnderdog = useCallback(
    (game: PointsPlusGameAnalysis) => {
      const newFavorites = new Set(selectedFavorites)
      const newUnderdogs = new Set(selectedUnderdogs)

      if (newUnderdogs.has(game.gameId)) {
        // Deselecting this underdog
        newUnderdogs.delete(game.gameId)
      } else {
        // Selecting this underdog - must remove from favorites if present
        newUnderdogs.add(game.gameId)
        if (newFavorites.has(game.gameId)) {
          newFavorites.delete(game.gameId)
          setSelectedFavorites(newFavorites)
        }
      }
      setSelectedUnderdogs(newUnderdogs)
      setHasUserSelections(true) // Mark that user has made manual selections
    },
    [selectedFavorites, selectedUnderdogs]
  )

  const submitPicks = () => {
    if (!strategy || !onPicksSelected) return

    const picks: { gameId: string; teamId: string }[] = []

    // Add favorite picks
    selectedFavorites.forEach((gameId) => {
      const game = strategy.availableGames.find((g) => g.gameId === gameId)
      if (game) {
        picks.push({ gameId, teamId: game.favorite.teamId })
      }
    })

    // Add underdog picks
    selectedUnderdogs.forEach((gameId) => {
      const game = strategy.availableGames.find((g) => g.gameId === gameId)
      if (game) {
        picks.push({ gameId, teamId: game.underdog.teamId })
      }
    })

    onPicksSelected(picks)
  }

  const getRiskBadgeColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
    }
  }

  // Memoize computed values to prevent unnecessary re-calculations
  // These must be called before any early returns to follow Rules of Hooks
  const favoriteCount = useMemo(
    () => selectedFavorites.size,
    [selectedFavorites]
  )
  const underdogCount = useMemo(
    () => selectedUnderdogs.size,
    [selectedUnderdogs]
  )
  const isBalanced = useMemo(
    () => favoriteCount === underdogCount,
    [favoriteCount, underdogCount]
  )
  const hasMinimum = useMemo(
    () =>
      favoriteCount >= 2 &&
      underdogCount >= 2 &&
      favoriteCount + underdogCount >= 4,
    [favoriteCount, underdogCount]
  )

  // Calculate expected points based on current user selections
  const currentExpectedPoints = useMemo(() => {
    if (!strategy) return 0

    let expected = 0

    // Calculate expected points for selected favorites
    selectedFavorites.forEach((gameId) => {
      const game = strategy.availableGames.find((g) => g.gameId === gameId)
      if (game) {
        const confidence = game.favorite.confidence ?? 50
        const expectedMargin = game.favorite.expectedMargin ?? 0
        const contribution = (confidence / 100) * expectedMargin
        if (isFinite(contribution)) {
          expected += contribution
        }
      }
    })

    // Calculate expected points for selected underdogs
    selectedUnderdogs.forEach((gameId) => {
      const game = strategy.availableGames.find((g) => g.gameId === gameId)
      if (game) {
        const upsetChance = (game.underdog.upsetPotential ?? 25) / 100
        const spread = game.underdog.spread ?? 0
        const winPoints = spread
        const lossPoints = -spread
        const contribution =
          upsetChance * winPoints + (1 - upsetChance) * lossPoints
        if (isFinite(contribution)) {
          expected += contribution
        }
      }
    })

    const result = Math.round(expected * 10) / 10
    return isFinite(result) ? result : 0
  }, [strategy, selectedFavorites, selectedUnderdogs])

  const getRecommendationIcon = (
    rec: PointsPlusGameAnalysis['recommendation']
  ) => {
    if (rec.includes('strong')) return <Zap className="w-4 h-4" />
    if (rec.includes('lean')) return <Target className="w-4 h-4" />
    return <AlertCircle className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  if (!strategy) return null

  return (
    <div className="space-y-6">
      {/* Strategy Configuration */}
      <div
        className={`bg-white rounded-lg shadow p-4 transition-opacity duration-300 ${configLoading ? 'opacity-75' : 'opacity-100'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Strategy Configuration</h3>
          {configLoading && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Updating strategy...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <button
            onClick={() => handleStrategyModeChange('conservative')}
            disabled={configLoading}
            className={`p-3 rounded-lg border-2 transition-colors ${
              config.mode === 'conservative'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${configLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Shield className="w-5 h-5 mb-1 mx-auto" />
            <div className="font-medium text-sm">Conservative</div>
            <div className="text-xs text-gray-600">
              Big favorites, small dogs
            </div>
          </button>

          <button
            onClick={() => handleStrategyModeChange('balanced')}
            disabled={configLoading}
            className={`p-3 rounded-lg border-2 transition-colors ${
              config.mode === 'balanced'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${configLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Target className="w-5 h-5 mb-1 mx-auto" />
            <div className="font-medium text-sm">Balanced</div>
            <div className="text-xs text-gray-600">Mix of value picks</div>
          </button>

          <button
            onClick={() => handleStrategyModeChange('aggressive')}
            disabled={configLoading}
            className={`p-3 rounded-lg border-2 transition-colors ${
              config.mode === 'aggressive'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${configLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Zap className="w-5 h-5 mb-1 mx-auto" />
            <div className="font-medium text-sm">Aggressive</div>
            <div className="text-xs text-gray-600">More games, wider range</div>
          </button>
        </div>

        {/* Advanced Settings and Debug Info on same line */}
        <div className="flex gap-4">
          <details className="flex-1">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              Advanced Settings
            </summary>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Favorite Threshold
                </label>
                <input
                  type="number"
                  value={config.favoriteThreshold}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      favoriteThreshold: Number(e.target.value),
                    })
                  }
                  className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Underdog Threshold
                </label>
                <input
                  type="number"
                  value={config.underdogThreshold}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      underdogThreshold: Number(e.target.value),
                    })
                  }
                  className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm"
                />
              </div>
            </div>
          </details>

          <details className="flex-1">
            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
              Configuration Details
            </summary>
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs space-y-1">
              <div>
                <strong>Mode:</strong> {config.mode}
              </div>
              <div>
                <strong>Pick Count Strategy:</strong> {config.pickCount}
              </div>
              <div>
                <strong>Favorite Threshold:</strong> {config.favoriteThreshold}
              </div>
              <div>
                <strong>Underdog Threshold:</strong> {config.underdogThreshold}
              </div>
              <div>
                <strong>Key Numbers Focus:</strong>{' '}
                {config.favorKeyNumbers ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Home Underdog Bonus:</strong>{' '}
                {(config.homeUnderdogBonus * 100).toFixed(1)}%
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Pick Status */}
      <div className="bg-white rounded-lg shadow p-1">
        <h3 className="text-lg font-semibold mb-2">Pick Status</h3>

        <div className="grid grid-cols-3 gap-3 mb-1">
          <div className="text-center">
            <div className="text-2xl font-bold">{favoriteCount}</div>
            <div className="text-sm text-gray-600">Favorites</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{underdogCount}</div>
            <div className="text-sm text-gray-600">Underdogs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {currentExpectedPoints > 0 ? '+' : ''}
              {currentExpectedPoints.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              Expected Points
              <br />
              <span className="text-xs text-gray-500">
                Original:{' '}
                {strategy.recommendations.totalExpectedPoints?.toFixed(1) ||
                  '0.0'}
              </span>
              {previousExpectedPoints != null &&
                Math.abs(currentExpectedPoints - previousExpectedPoints) >
                  0.05 && (
                  <span className="ml-1 text-xs text-blue-600">
                    <br />
                    (was {previousExpectedPoints > 0 ? '+' : ''}
                    {previousExpectedPoints.toFixed(1)})
                  </span>
                )}
            </div>
          </div>
        </div>

        {!isBalanced && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                Must have equal favorites ({favoriteCount}) and underdogs (
                {underdogCount})
              </span>
            </div>
          </div>
        )}

        {!hasMinimum && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                Minimum 4 picks required: at least 2 favorites and 2 underdogs
                (currently: {favoriteCount} favorites, {underdogCount}{' '}
                underdogs)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Game Analysis */}
      <div
        className={`bg-white rounded-lg shadow p-6 transition-all duration-300 ${configLoading ? 'opacity-75 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Game Analysis</h3>
          {configLoading && (
            <div className="text-sm text-gray-500">
              Recalculating recommendations...
            </div>
          )}
        </div>

        <div
          className={`space-y-4 transition-all duration-200 ${configLoading ? 'blur-sm' : 'blur-0'}`}
        >
          {strategy.availableGames.map((game) => (
            <div
              key={game.gameId}
              className="border rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {game.awayTeam.nflAbbr} @ {game.homeTeam.nflAbbr}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({game.spread > 0 ? '+' : ''}
                    {game.spread})
                  </span>
                  {getRecommendationIcon(game.recommendation)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    Value: {game.strategicValue}
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${game.strategicValue}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                {/* Favorite */}
                <div
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedFavorites.has(game.gameId)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleFavorite(game)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                      <span className="font-medium">
                        {game.favorite.team.nflAbbr}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${getRiskBadgeColor(game.favorite.riskLevel)}`}
                    >
                      {game.favorite.riskLevel} risk
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Spread: {game.favorite.spread}
                  </div>
                  <div className="text-sm text-gray-600">
                    Confidence: {game.favorite.confidence?.toFixed(0) || '50'}%
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    Expected: +
                    {game.favorite.expectedMargin?.toFixed(1) || '0.0'} pts
                  </div>
                </div>

                {/* Underdog */}
                <div
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedUnderdogs.has(game.gameId)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleUnderdog(game)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <TrendingDown className="w-4 h-4 mr-1 text-red-600" />
                      <span className="font-medium">
                        {game.underdog.team.nflAbbr}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${getRiskBadgeColor(game.underdog.riskLevel)}`}
                    >
                      {game.underdog.riskLevel} risk
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Spread: +{game.underdog.spread}
                  </div>
                  <div className="text-sm text-gray-600">
                    Upset Chance:{' '}
                    {game.underdog.upsetPotential?.toFixed(0) || '25'}%
                  </div>
                  <div className="text-sm font-medium">
                    <span className="text-green-600">
                      Win: +{game.underdog.spread}
                    </span>
                    <span className="mx-1">/</span>
                    <span className="text-red-600">
                      Loss: -{game.underdog.spread}
                    </span>
                  </div>
                </div>
              </div>

              {game.notes.length > 0 && (
                <div className="text-sm text-gray-600 italic mt-2">
                  <strong>Analysis:</strong> {game.notes.join(' • ')}
                </div>
              )}

              {/* Detailed factor breakdown */}
              <details className="mt-2">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  Show detailed analysis factors
                </summary>
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs space-y-1">
                  <div>
                    <strong>Strategic Value:</strong> {game.strategicValue}/100
                  </div>
                  <div>
                    <strong>Spread:</strong> {game.spread > 0 ? '+' : ''}
                    {game.spread}
                  </div>
                  <div>
                    <strong>Total:</strong> {game.total}
                  </div>
                  <div>
                    <strong>Recommendation:</strong>{' '}
                    {game.recommendation.replace('_', ' ')}
                  </div>
                  <div className="border-t pt-1 mt-1">
                    <strong>Favorite Analysis:</strong>
                    <div className="ml-2">
                      • Confidence: {game.favorite.confidence?.toFixed(0)}% •
                      Expected Margin: +
                      {game.favorite.expectedMargin?.toFixed(1)} pts • Risk
                      Level: {game.favorite.riskLevel}
                    </div>
                  </div>
                  <div className="border-t pt-1">
                    <strong>Underdog Analysis:</strong>
                    <div className="ml-2">
                      • Upset Potential:{' '}
                      {game.underdog.upsetPotential?.toFixed(0)}% • Expected
                      Cover: {game.underdog.expectedCover?.toFixed(0)}% • Risk
                      Level: {game.underdog.riskLevel}
                    </div>
                  </div>
                  {game.confidenceEngineFactors && (
                    <div className="border-t pt-1">
                      <strong>Advanced Factors:</strong>
                      <div className="ml-2 text-xs">
                        {game.confidenceEngineFactors.eloContribution !=
                          null && (
                          <div>
                            • Elo Rating Impact:{' '}
                            {(
                              game.confidenceEngineFactors.eloContribution * 100
                            ).toFixed(1)}
                            %
                          </div>
                        )}
                        {game.confidenceEngineFactors.divisionalFactor !=
                          null &&
                          Math.abs(
                            game.confidenceEngineFactors.divisionalFactor
                          ) > 0.01 && (
                            <div>
                              • Divisional Factor:{' '}
                              {(
                                game.confidenceEngineFactors.divisionalFactor *
                                100
                              ).toFixed(1)}
                              %
                            </div>
                          )}
                        {game.confidenceEngineFactors.revengeGameFactor !=
                          null &&
                          Math.abs(
                            game.confidenceEngineFactors.revengeGameFactor
                          ) > 0.01 && (
                            <div>
                              • Revenge Game:{' '}
                              {(
                                game.confidenceEngineFactors.revengeGameFactor *
                                100
                              ).toFixed(1)}
                              %
                            </div>
                          )}
                        {game.confidenceEngineFactors.recentFormFactor !=
                          null &&
                          Math.abs(
                            game.confidenceEngineFactors.recentFormFactor
                          ) > 0.01 && (
                            <div>
                              • Recent Form:{' '}
                              {(
                                game.confidenceEngineFactors.recentFormFactor *
                                100
                              ).toFixed(1)}
                              %
                            </div>
                          )}
                        {game.confidenceEngineFactors
                          .playoffImplicationsFactor != null &&
                          Math.abs(
                            game.confidenceEngineFactors
                              .playoffImplicationsFactor
                          ) > 0.01 && (
                            <div>
                              • Playoff Stakes:{' '}
                              {(
                                game.confidenceEngineFactors
                                  .playoffImplicationsFactor * 100
                              ).toFixed(1)}
                              %
                            </div>
                          )}
                        {game.confidenceEngineFactors.homeAdvantage != null && (
                          <div>
                            • Home Field:{' '}
                            {(
                              game.confidenceEngineFactors.homeAdvantage * 100
                            ).toFixed(1)}
                            %
                          </div>
                        )}
                        {game.confidenceEngineFactors.lineValue != null &&
                          Math.abs(game.confidenceEngineFactors.lineValue) >
                            0.01 && (
                            <div>
                              • Line Value:{' '}
                              {(
                                game.confidenceEngineFactors.lineValue * 100
                              ).toFixed(1)}
                              %
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      {onPicksSelected && (
        <div className="flex justify-end">
          <button
            onClick={submitPicks}
            disabled={!isBalanced || !hasMinimum}
            className={`px-6 py-3 rounded-lg font-medium ${
              isBalanced && hasMinimum
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit {favoriteCount + underdogCount} Picks
          </button>
        </div>
      )}
    </div>
  )
}
