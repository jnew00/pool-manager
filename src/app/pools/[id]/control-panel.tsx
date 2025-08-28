'use client'

import { useState, useCallback } from 'react'
import { defaultModelWeights } from '@/lib/models/confidence-engine'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import {
  Shield,
  Zap,
  Scale,
  BarChart3,
  CloudRain,
  Target,
  Activity,
  Trophy,
  Settings,
  Plane,
} from 'lucide-react'

// Preset weight configurations for different betting strategies
const presetConfigurations = {
  conservative: {
    name: 'Conservative',
    description: 'Trust market data heavily, minimal risk-taking',
    icon: Shield,
    weights: {
      marketProbWeight: 0.6, // Trust Vegas lines heavily
      eloWeight: 0.25,
      lineValueWeight: 0.05, // Minimal arbitrage chasing
      homeAdvWeight: 0.05,
      restWeight: 0.02,
      divisionalWeight: 0.015, // Minimal rivalry impact
      revengeGameWeight: 0.01, // Minimal revenge motivation
      travelScheduleWeight: 0.005, // Minimal travel impact
      weatherPenaltyWeight: 0.02,
      injuryPenaltyWeight: 0.01,
      kElo: 24,
      windThresholdMph: 15,
      precipProbThreshold: 0.3,
      qbOutPenalty: 12,
      olClusterPenalty: 3,
      dbClusterPenalty: 3,
    },
  },
  aggressive: {
    name: 'Aggressive',
    description: 'Chase arbitrage opportunities, contrarian plays',
    icon: Zap,
    weights: {
      marketProbWeight: 0.2, // Fade the public
      eloWeight: 0.15,
      lineValueWeight: 0.35, // Heavy arbitrage emphasis
      homeAdvWeight: 0.08, // Higher situational advantages
      restWeight: 0.04, // 2x rest advantage
      divisionalWeight: 0.12, // High rivalry impact - contrarian on division games
      revengeGameWeight: 0.08, // High revenge motivation - emotional angles
      travelScheduleWeight: 0.015, // Moderate travel impact
      weatherPenaltyWeight: 0.02,
      injuryPenaltyWeight: 0.01,
      kElo: 24,
      windThresholdMph: 12, // More sensitive to weather
      precipProbThreshold: 0.25,
      qbOutPenalty: 15, // Higher injury penalties
      olClusterPenalty: 4,
      dbClusterPenalty: 4,
    },
  },
  balanced: {
    name: 'Balanced',
    description: 'Balanced approach using all factors equally',
    icon: Scale,
    weights: { ...defaultModelWeights },
  },
  dataDriven: {
    name: 'Data-Driven',
    description: 'Heavy emphasis on statistical models and Elo ratings',
    icon: BarChart3,
    weights: {
      marketProbWeight: 0.25,
      eloWeight: 0.45, // Heavy emphasis on Elo
      lineValueWeight: 0.15,
      homeAdvWeight: 0.03,
      restWeight: 0.01,
      divisionalWeight: 0.08, // Medium rivalry impact based on data
      revengeGameWeight: 0.04, // Medium revenge factor - data shows impact
      travelScheduleWeight: 0.008, // Low travel weight - focus on data
      weatherPenaltyWeight: 0.005, // Minimal environmental factors
      injuryPenaltyWeight: 0.005,
      kElo: 32, // More volatile Elo adjustments
      windThresholdMph: 20, // Less sensitive to weather
      precipProbThreshold: 0.4,
      qbOutPenalty: 8, // Lower injury penalties
      olClusterPenalty: 2,
      dbClusterPenalty: 2,
    },
  },
  situational: {
    name: 'Situational',
    description: 'Emphasize environmental and game conditions',
    icon: CloudRain,
    weights: {
      marketProbWeight: 0.25,
      eloWeight: 0.15,
      lineValueWeight: 0.15,
      homeAdvWeight: 0.1, // Double home advantage
      restWeight: 0.08, // 4x rest factor
      divisionalWeight: 0.15, // High rivalry impact - key situational factor
      revengeGameWeight: 0.1, // High revenge motivation - key emotional factor
      travelScheduleWeight: 0.02, // High travel impact - key situational factor
      weatherPenaltyWeight: 0.05, // 2.5x weather impact
      injuryPenaltyWeight: 0.02, // 2x injury impact
      kElo: 24,
      windThresholdMph: 10, // Very sensitive to weather
      precipProbThreshold: 0.2,
      qbOutPenalty: 18, // High injury penalties
      olClusterPenalty: 5,
      dbClusterPenalty: 5,
    },
  },
}

interface ControlPanelProps {
  poolId: string
  onWeightsChange: (weights: any) => void
}

export default function ControlPanel({
  poolId,
  onWeightsChange,
}: ControlPanelProps) {
  const [weights, setWeights] = useState(defaultModelWeights)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentPreset, setCurrentPreset] = useState<string>('balanced')

  const applyPreset = useCallback(
    (presetKey: string) => {
      const preset =
        presetConfigurations[presetKey as keyof typeof presetConfigurations]
      if (preset) {
        setWeights(preset.weights)
        setCurrentPreset(presetKey)
        onWeightsChange(preset.weights)
      }
    },
    [onWeightsChange]
  )

  const handleWeightChange = useCallback(
    (key: string, value: number) => {
      const newWeights = { ...weights, [key]: value }
      setWeights(newWeights)
      setCurrentPreset('custom') // Mark as custom when manually adjusted
      onWeightsChange(newWeights)
    },
    [weights, onWeightsChange]
  )

  const resetToDefaults = useCallback(() => {
    applyPreset('balanced')
  }, [applyPreset])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Model Controls
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Adjust confidence factors in real-time
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {Object.entries(presetConfigurations).map(([key, preset]) => (
            <Tippy
              key={key}
              content={preset.description}
              placement="bottom"
              delay={[300, 100]}
              arrow={true}
              theme="light"
            >
              <div>
                <button
                  onClick={() => applyPreset(key)}
                  className={`w-full p-3 rounded-lg border text-left transition-all duration-200 hover:shadow-md ${
                    currentPreset === key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <preset.icon className="w-4 h-4 text-current" />
                    <span className="font-medium text-sm">{preset.name}</span>
                  </div>
                </button>
              </div>
            </Tippy>
          ))}
        </div>
        {currentPreset === 'custom' && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Settings className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                Custom configuration - manually adjusted from preset
              </p>
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          <div className="mt-4 space-y-6">
            {/* Primary Factors */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Primary Factors
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Market Probability Weight */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Market Probability:{' '}
                    {(weights.marketProbWeight * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={weights.marketProbWeight}
                    onChange={(e) =>
                      handleWeightChange(
                        'marketProbWeight',
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Weight given to betting line probabilities
                  </p>
                </div>

                {/* Elo Rating Weight */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Elo Rating: {(weights.eloWeight * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={weights.eloWeight}
                    onChange={(e) =>
                      handleWeightChange(
                        'eloWeight',
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Team strength based on historical performance
                  </p>
                </div>

                {/* Line Value Weight - PROMINENT */}
                <div className="space-y-2 border-2 border-green-200 dark:border-green-800 rounded-lg p-3 bg-green-50 dark:bg-green-950">
                  <div className="flex items-center space-x-1 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <label className="block text-sm font-medium text-green-800 dark:text-green-200">
                      Line Value (Arbitrage):{' '}
                      {(weights.lineValueWeight * 100).toFixed(0)}%
                    </label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={weights.lineValueWeight}
                    onChange={(e) =>
                      handleWeightChange(
                        'lineValueWeight',
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-green-200 dark:bg-green-700 rounded-lg appearance-none cursor-pointer slider-green"
                  />
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-green-600" />
                    <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                      Pool spreads vs current Vegas lines
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Situational Factors */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Situational Factors
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Home Advantage: {(weights.homeAdvWeight * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.2"
                    step="0.005"
                    value={weights.homeAdvWeight}
                    onChange={(e) =>
                      handleWeightChange(
                        'homeAdvWeight',
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rest Advantage: {(weights.restWeight * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.1"
                    step="0.005"
                    value={weights.restWeight}
                    onChange={(e) =>
                      handleWeightChange(
                        'restWeight',
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Divisional Rivalry Factor */}
                <div className="space-y-2 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-3 bg-orange-50 dark:bg-orange-950">
                  <div className="flex items-center space-x-1 mb-2">
                    <Trophy className="w-4 h-4 text-orange-600" />
                    <label className="block text-sm font-medium text-orange-800 dark:text-orange-200">
                      Division Rivalry:{' '}
                      {(weights.divisionalWeight * 100).toFixed(0)}%
                    </label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.25"
                    step="0.005"
                    value={weights.divisionalWeight}
                    onChange={(e) =>
                      handleWeightChange(
                        'divisionalWeight',
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-orange-200 dark:bg-orange-700 rounded-lg appearance-none cursor-pointer slider-orange"
                  />
                  <div className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-orange-600" />
                    <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                      AFC/NFC same division effects
                    </p>
                  </div>
                </div>

                {/* NEW: Revenge Game Factor */}
                <div className="space-y-2 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-3 bg-purple-50 dark:bg-purple-950">
                  <div className="flex items-center space-x-1 mb-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <label className="block text-sm font-medium text-purple-800 dark:text-purple-200">
                      Revenge Game:{' '}
                      {(weights.revengeGameWeight * 100).toFixed(0)}%
                    </label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.15"
                    step="0.005"
                    value={weights.revengeGameWeight}
                    onChange={(e) =>
                      handleWeightChange(
                        'revengeGameWeight',
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-purple-200 dark:bg-purple-700 rounded-lg appearance-none cursor-pointer slider-purple"
                  />
                  <div className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-purple-600" />
                    <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                      Previous season loss motivation
                    </p>
                  </div>
                </div>

                {/* Travel/Scheduling Factor */}
                <div className="space-y-2 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-3 bg-blue-50 dark:bg-blue-950">
                  <div className="flex items-center space-x-1 mb-2">
                    <Plane className="w-4 h-4 text-blue-600" />
                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200">
                      Travel/Schedule:{' '}
                      {(weights.travelScheduleWeight * 100).toFixed(0)}%
                    </label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.05"
                    step="0.002"
                    value={weights.travelScheduleWeight}
                    onChange={(e) =>
                      handleWeightChange(
                        'travelScheduleWeight',
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-blue-200 dark:bg-blue-700 rounded-lg appearance-none cursor-pointer slider-blue"
                  />
                  <div className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-blue-600" />
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      Distance, time zones, short weeks
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Weather Impact:{' '}
                    {(weights.weatherPenaltyWeight * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.1"
                    step="0.005"
                    value={weights.weatherPenaltyWeight}
                    onChange={(e) =>
                      handleWeightChange(
                        'weatherPenaltyWeight',
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Injury Impact:{' '}
                    {(weights.injuryPenaltyWeight * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.05"
                    step="0.005"
                    value={weights.injuryPenaltyWeight}
                    onChange={(e) =>
                      handleWeightChange(
                        'injuryPenaltyWeight',
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>

            {/* Environmental Thresholds */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Environmental Thresholds
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Wind Threshold: {weights.windThresholdMph} mph
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="1"
                    value={weights.windThresholdMph}
                    onChange={(e) =>
                      handleWeightChange(
                        'windThresholdMph',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Precipitation Threshold:{' '}
                    {(weights.precipProbThreshold * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={weights.precipProbThreshold}
                    onChange={(e) =>
                      handleWeightChange(
                        'precipProbThreshold',
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    QB Injury Penalty: {weights.qbOutPenalty} pts
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={weights.qbOutPenalty}
                    onChange={(e) =>
                      handleWeightChange(
                        'qbOutPenalty',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Weight:{' '}
                {(
                  weights.marketProbWeight +
                  weights.eloWeight +
                  weights.lineValueWeight +
                  weights.homeAdvWeight +
                  weights.restWeight +
                  weights.divisionalWeight +
                  weights.revengeGameWeight +
                  weights.travelScheduleWeight +
                  weights.weatherPenaltyWeight +
                  weights.injuryPenaltyWeight
                ).toFixed(2)}
              </div>
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Reset to Balanced
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider-green::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider-orange::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider-purple::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider-blue::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider-green::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider-orange::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider-purple::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider-blue::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}
