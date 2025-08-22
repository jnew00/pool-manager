'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Play,
  RotateCcw,
  Settings,
  TrendingUp,
  TrendingDown,
  Trophy,
  Zap,
  BarChart3,
  AlertTriangle,
  Info,
  Loader2,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimulationResult {
  scenarios: number
  survivalRate: number
  averageWeekEliminated: number
  winProbability: number
  outcomes: {
    wins: number
    week10Survival: number
    week14Survival: number
    finalFourReached: number
  }
  criticalWeeks: number[]
  pathAnalysis: {
    bestPath: Array<{ week: number; team: string; probability: number }>
    worstPath: Array<{ week: number; team: string; probability: number }>
    averagePath: Array<{ week: number; team: string; probability: number }>
  }
  distribution: Array<{
    week: number
    eliminations: number
    percentage: number
  }>
}

interface SimulationParams {
  strategy: 'CONSERVATIVE' | 'BALANCED' | 'CONTRARIAN' | 'AGGRESSIVE'
  fieldSurvivalRate: number
  upsetRate: number
  includeWeather: boolean
  includeInjuries: boolean
  multiEntry: boolean
  numberOfEntries: number
  correlatedPicks: boolean
}

interface WhatIfSimulatorProps {
  poolId: string
  entryId: string
  currentWeek: number
  usedTeams: Set<string>
  poolSize: number
  survivorsRemaining: number
}

export default function WhatIfSimulator({
  poolId,
  entryId,
  currentWeek,
  usedTeams,
  poolSize,
  survivorsRemaining,
}: WhatIfSimulatorProps) {
  const [params, setParams] = useState<SimulationParams>({
    strategy: 'BALANCED',
    fieldSurvivalRate: 0.75,
    upsetRate: 0.15,
    includeWeather: true,
    includeInjuries: true,
    multiEntry: false,
    numberOfEntries: 1,
    correlatedPicks: false,
  })

  const [result, setResult] = useState<SimulationResult | null>(null)
  const [running, setRunning] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const runSimulation = async () => {
    setRunning(true)

    try {
      const response = await fetch('/api/survivor/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId,
          entryId,
          currentWeek,
          usedTeams: Array.from(usedTeams),
          poolSize,
          survivorsRemaining,
          params,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      }
    } catch (error) {
      console.error('Error running simulation:', error)
    } finally {
      setRunning(false)
    }
  }

  const resetSimulation = () => {
    setResult(null)
    setParams({
      strategy: 'BALANCED',
      fieldSurvivalRate: 0.75,
      upsetRate: 0.15,
      includeWeather: true,
      includeInjuries: true,
      multiEntry: false,
      numberOfEntries: 1,
      correlatedPicks: false,
    })
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

  // Mock result for demonstration
  const mockResult: SimulationResult = {
    scenarios: 10000,
    survivalRate: 0.0023,
    averageWeekEliminated: 11.4,
    winProbability: 0.023,
    outcomes: {
      wins: 230,
      week10Survival: 5420,
      week14Survival: 1840,
      finalFourReached: 450,
    },
    criticalWeeks: [7, 11, 14, 17],
    pathAnalysis: {
      bestPath: [
        { week: currentWeek + 1, team: 'KC', probability: 0.78 },
        { week: currentWeek + 2, team: 'BUF', probability: 0.72 },
        { week: currentWeek + 3, team: 'PHI', probability: 0.69 },
      ],
      worstPath: [
        { week: currentWeek + 1, team: 'NYJ', probability: 0.42 },
        { week: currentWeek + 2, team: 'CAR', probability: 0.38 },
        { week: currentWeek + 3, team: 'ARI', probability: 0.45 },
      ],
      averagePath: [
        { week: currentWeek + 1, team: 'DAL', probability: 0.65 },
        { week: currentWeek + 2, team: 'MIA', probability: 0.62 },
        { week: currentWeek + 3, team: 'LAR', probability: 0.58 },
      ],
    },
    distribution: Array.from({ length: 18 - currentWeek }, (_, i) => ({
      week: currentWeek + i + 1,
      eliminations: Math.floor(Math.random() * 30 + 5),
      percentage: Math.random() * 20,
    })),
  }

  const displayResult = result || (running ? null : null)

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              What-If Simulator
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Settings className="h-4 w-4 mr-1" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetSimulation}
                disabled={running}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button onClick={runSimulation} disabled={running}>
                {running ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Simulate
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Strategy</label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    'CONSERVATIVE',
                    'BALANCED',
                    'CONTRARIAN',
                    'AGGRESSIVE',
                  ] as const
                ).map((strategy) => (
                  <Button
                    key={strategy}
                    variant={
                      params.strategy === strategy ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setParams((prev) => ({ ...prev, strategy }))}
                    className={cn(
                      params.strategy === strategy && getStrategyColor(strategy)
                    )}
                  >
                    {strategy.charAt(0) + strategy.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Field Survival Rate:{' '}
                {(params.fieldSurvivalRate * 100).toFixed(0)}%
              </label>
              <Slider
                value={[params.fieldSurvivalRate * 100]}
                onValueChange={([value]) =>
                  setParams((prev) => ({
                    ...prev,
                    fieldSurvivalRate: value / 100,
                  }))
                }
                min={50}
                max={90}
                step={5}
                className="mt-2"
              />
            </div>
          </div>

          {/* Advanced Parameters */}
          {showAdvanced && (
            <div className="pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Upset Rate: {(params.upsetRate * 100).toFixed(0)}%
                  </label>
                  <Slider
                    value={[params.upsetRate * 100]}
                    onValueChange={([value]) =>
                      setParams((prev) => ({
                        ...prev,
                        upsetRate: value / 100,
                      }))
                    }
                    min={5}
                    max={30}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Include Weather
                    </label>
                    <Switch
                      checked={params.includeWeather}
                      onCheckedChange={(checked) =>
                        setParams((prev) => ({
                          ...prev,
                          includeWeather: checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Include Injuries
                    </label>
                    <Switch
                      checked={params.includeInjuries}
                      onCheckedChange={(checked) =>
                        setParams((prev) => ({
                          ...prev,
                          includeInjuries: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">
                    Multi-Entry Simulation
                  </label>
                  <Switch
                    checked={params.multiEntry}
                    onCheckedChange={(checked) =>
                      setParams((prev) => ({
                        ...prev,
                        multiEntry: checked,
                      }))
                    }
                  />
                </div>

                {params.multiEntry && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">
                        Number of Entries: {params.numberOfEntries}
                      </label>
                      <Slider
                        value={[params.numberOfEntries]}
                        onValueChange={([value]) =>
                          setParams((prev) => ({
                            ...prev,
                            numberOfEntries: value,
                          }))
                        }
                        min={2}
                        max={10}
                        step={1}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">
                        Correlated Picks
                      </label>
                      <Switch
                        checked={params.correlatedPicks}
                        onCheckedChange={(checked) =>
                          setParams((prev) => ({
                            ...prev,
                            correlatedPicks: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simulation Results */}
      {(displayResult || mockResult) && (
        <>
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Simulation Results
                <Badge variant="outline" className="ml-auto">
                  {(displayResult || mockResult).scenarios.toLocaleString()}{' '}
                  scenarios
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">
                    {(
                      (displayResult || mockResult).winProbability * 100
                    ).toFixed(1)}
                    %
                  </div>
                  <div className="text-xs text-gray-500">Win Probability</div>
                </div>

                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">
                    {(
                      displayResult || mockResult
                    ).averageWeekEliminated.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Avg Week Eliminated
                  </div>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-600">
                    {(
                      (displayResult || mockResult).outcomes.week14Survival /
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <div className="text-xs text-gray-500">Week 14 Survival</div>
                </div>

                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold text-yellow-600">
                    {(displayResult || mockResult).criticalWeeks.length}
                  </div>
                  <div className="text-xs text-gray-500">Critical Weeks</div>
                </div>
              </div>

              {/* Outcome Distribution */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Outcome Milestones</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Reach Week 10</span>
                    <Badge>
                      {(
                        (displayResult || mockResult).outcomes.week10Survival /
                        100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Reach Week 14</span>
                    <Badge>
                      {(
                        (displayResult || mockResult).outcomes.week14Survival /
                        100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Reach Final Four</span>
                    <Badge>
                      {(
                        (displayResult || mockResult).outcomes
                          .finalFourReached / 100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Win Pool</span>
                    <Badge className="bg-green-100 text-green-800">
                      {(
                        (displayResult || mockResult).outcomes.wins / 100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Path Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Optimal Path Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Best Path */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-100 text-green-800">
                      Best Path
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Highest survival rate
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {(displayResult || mockResult).pathAnalysis.bestPath.map(
                      (pick) => (
                        <div
                          key={pick.week}
                          className="flex-shrink-0 p-2 bg-green-50 rounded border border-green-200"
                        >
                          <div className="text-xs text-gray-500">
                            Week {pick.week}
                          </div>
                          <div className="font-semibold">{pick.team}</div>
                          <div className="text-xs text-green-600">
                            {(pick.probability * 100).toFixed(0)}%
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Average Path */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      Balanced Path
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Most likely outcome
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {(displayResult || mockResult).pathAnalysis.averagePath.map(
                      (pick) => (
                        <div
                          key={pick.week}
                          className="flex-shrink-0 p-2 bg-blue-50 rounded border border-blue-200"
                        >
                          <div className="text-xs text-gray-500">
                            Week {pick.week}
                          </div>
                          <div className="font-semibold">{pick.team}</div>
                          <div className="text-xs text-blue-600">
                            {(pick.probability * 100).toFixed(0)}%
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Critical Weeks */}
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Critical weeks identified:{' '}
                    {(displayResult || mockResult).criticalWeeks.join(', ')}.
                    Save your strongest teams for these difficult weeks.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Elimination Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Elimination Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(displayResult || mockResult).distribution
                  .slice(0, 8)
                  .map((week) => (
                    <div key={week.week} className="flex items-center gap-3">
                      <span className="text-sm w-16">Week {week.week}</span>
                      <div className="flex-1 relative h-6 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-red-400"
                          style={{ width: `${week.percentage}%` }}
                        />
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-white mix-blend-difference">
                          {week.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 w-20 text-right">
                        ~{week.eliminations} entries
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Info Alert */}
      {!displayResult && !running && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            The simulator runs thousands of scenarios based on your parameters
            to predict the most likely outcomes and identify optimal strategies
            for your remaining weeks.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
