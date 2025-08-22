'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Zap,
  Target,
  Users,
  BarChart3,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RiskAssessment {
  overallRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  riskScore: number // 0-100
  survivalProbability: number
  factors: {
    teamStrength: {
      score: number
      description: string
    }
    publicAlignment: {
      score: number
      description: string
    }
    weatherImpact: {
      score: number
      description: string
    }
    injuryRisk: {
      score: number
      description: string
    }
    divisionRival: {
      score: number
      description: string
    }
    travelFatigue: {
      score: number
      description: string
    }
  }
  comparison: {
    vsField: number // Percentile vs all entries
    vsTopPerformers: number // Percentile vs top 10%
    expectedEliminations: number
  }
  recommendations: string[]
}

interface RiskMeterProps {
  poolId: string
  entryId: string
  week: number
  selectedTeam?: {
    id: string
    abbr: string
    opponent: string
    winProbability: number
    publicPickPercentage: number
  }
}

export default function RiskMeter({
  poolId,
  entryId,
  week,
  selectedTeam,
}: RiskMeterProps) {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null)
  const [loading, setLoading] = useState(false)
  const [historicalRisk, setHistoricalRisk] = useState<
    Array<{
      week: number
      risk: number
      survived: boolean
    }>
  >([])

  useEffect(() => {
    if (selectedTeam) {
      assessRisk()
    }
  }, [selectedTeam, week])

  useEffect(() => {
    loadHistoricalRisk()
  }, [entryId])

  const assessRisk = async () => {
    if (!selectedTeam) return

    setLoading(true)
    try {
      const response = await fetch('/api/survivor/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId,
          entryId,
          week,
          teamId: selectedTeam.id,
          teamAbbr: selectedTeam.abbr,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAssessment(data)
      }
    } catch (error) {
      console.error('Error assessing risk:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHistoricalRisk = async () => {
    try {
      const response = await fetch(
        `/api/survivor/risk-history?entryId=${entryId}`
      )
      if (response.ok) {
        const data = await response.json()
        setHistoricalRisk(data)
      }
    } catch (error) {
      console.error('Error loading risk history:', error)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'text-green-600'
      case 'MODERATE':
        return 'text-yellow-600'
      case 'HIGH':
        return 'text-orange-600'
      case 'CRITICAL':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getRiskBgColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'bg-green-100'
      case 'MODERATE':
        return 'bg-yellow-100'
      case 'HIGH':
        return 'bg-orange-100'
      case 'CRITICAL':
        return 'bg-red-100'
      default:
        return 'bg-gray-100'
    }
  }

  const getFactorIcon = (factor: string) => {
    switch (factor) {
      case 'teamStrength':
        return <Shield className="h-4 w-4" />
      case 'publicAlignment':
        return <Users className="h-4 w-4" />
      case 'weatherImpact':
        return <Activity className="h-4 w-4" />
      case 'injuryRisk':
        return <AlertTriangle className="h-4 w-4" />
      case 'divisionRival':
        return <Target className="h-4 w-4" />
      case 'travelFatigue':
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-green-500'
    if (value >= 60) return 'bg-yellow-500'
    if (value >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Mock assessment if no team selected
  const mockAssessment: RiskAssessment = {
    overallRisk: 'MODERATE',
    riskScore: 35,
    survivalProbability: 0.65,
    factors: {
      teamStrength: {
        score: 75,
        description: 'Strong favorite with good matchup',
      },
      publicAlignment: {
        score: 45,
        description: 'Moderately popular pick (25% ownership)',
      },
      weatherImpact: {
        score: 90,
        description: 'Perfect conditions expected',
      },
      injuryRisk: {
        score: 80,
        description: 'No significant injuries reported',
      },
      divisionRival: {
        score: 70,
        description: 'Non-division opponent',
      },
      travelFatigue: {
        score: 85,
        description: 'Home game, no travel concerns',
      },
    },
    comparison: {
      vsField: 72,
      vsTopPerformers: 65,
      expectedEliminations: 25,
    },
    recommendations: [
      'Consider a less popular pick for differentiation',
      'Save stronger teams for difficult weeks ahead',
      'Weather conditions favor taking calculated risks',
    ],
  }

  const currentAssessment = assessment || (selectedTeam ? mockAssessment : null)

  if (!selectedTeam && !currentAssessment) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Select a team to see risk assessment</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded" />
            <div className="space-y-2">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded" />
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Risk Meter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Risk Assessment
              {selectedTeam && (
                <Badge variant="outline">{selectedTeam.abbr}</Badge>
              )}
            </span>
            <Badge
              className={cn(
                'text-lg px-3 py-1',
                getRiskBgColor(currentAssessment!.overallRisk)
              )}
            >
              <span className={getRiskColor(currentAssessment!.overallRisk)}>
                {currentAssessment!.overallRisk}
              </span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Risk Score Visualization */}
          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm text-gray-500">Risk Level</span>
              <span className="text-2xl font-bold">
                {currentAssessment!.riskScore}%
              </span>
            </div>
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute inset-0 flex">
                <div className="w-1/4 bg-green-400" />
                <div className="w-1/4 bg-yellow-400" />
                <div className="w-1/4 bg-orange-400" />
                <div className="w-1/4 bg-red-400" />
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-1 h-10 bg-black"
                style={{ left: `${currentAssessment!.riskScore}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
              <span>Critical</span>
            </div>
          </div>

          {/* Survival Probability */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {(currentAssessment!.survivalProbability * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Survival Probability</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">
                {currentAssessment!.comparison.expectedEliminations}
              </div>
              <div className="text-sm text-gray-500">Expected Eliminations</div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Risk Factors</h4>
            {Object.entries(currentAssessment!.factors).map(([key, factor]) => (
              <div key={key} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded">
                  {getFactorIcon(key)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-medium">{factor.score}%</span>
                  </div>
                  <Progress
                    value={factor.score}
                    className="h-2"
                    style={
                      {
                        backgroundColor: '#e5e7eb',
                        '--progress-color':
                          factor.score >= 70
                            ? '#10b981'
                            : factor.score >= 40
                              ? '#f59e0b'
                              : '#ef4444',
                      } as any
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {factor.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Field Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">vs All Entries</span>
                <span className="text-sm font-medium">
                  Better than {currentAssessment!.comparison.vsField}%
                </span>
              </div>
              <Progress
                value={currentAssessment!.comparison.vsField}
                className="h-3"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">vs Top 10%</span>
                <span className="text-sm font-medium">
                  Better than {currentAssessment!.comparison.vsTopPerformers}%
                </span>
              </div>
              <Progress
                value={currentAssessment!.comparison.vsTopPerformers}
                className="h-3"
              />
            </div>
          </div>

          <Alert className="mt-4">
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Your pick ranks in the top{' '}
              {100 - currentAssessment!.comparison.vsField}% of all entries this
              week
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Historical Risk Trend */}
      {historicalRisk.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {historicalRisk.slice(-5).map((history) => (
                <div
                  key={history.week}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm">Week {history.week}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div
                        className={cn(
                          'w-16 h-2 rounded-full',
                          history.risk < 30
                            ? 'bg-green-400'
                            : history.risk < 60
                              ? 'bg-yellow-400'
                              : history.risk < 80
                                ? 'bg-orange-400'
                                : 'bg-red-400'
                        )}
                      />
                      <span className="text-sm font-medium">
                        {history.risk}%
                      </span>
                    </div>
                    {history.survived ? (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Survived
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Eliminated
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {currentAssessment!.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Strategic Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentAssessment!.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span className="text-sm text-gray-600">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
