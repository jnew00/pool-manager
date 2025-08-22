'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Zap,
  TrendingUp,
  Shield,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Brain,
  Cloud,
  Star,
  ChevronRight,
  RefreshCw,
  Sparkles,
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

interface Recommendation {
  teamId: string
  teamAbbr: string
  gameId: string
  opponent: string
  compositeScore: number
  confidence: number
  winProbability: number
  publicPickPercentage: number
  evScore: number
  futureValueScore: number
  reasoning: string
  narrativeFactors?: {
    momentum?: string
    injuries?: string
    primetime?: string
    revenge?: string
    lookahead?: string
    historical?: string
  }
  weatherImpact?: {
    risk: 'LOW' | 'MEDIUM' | 'HIGH'
    description: string
  }
  llmAdjustment?: {
    originalScore: number
    adjustedScore: number
    reasoning: string
  }
  finalConfidence: number
}

interface WeekOverview {
  difficulty: 'EASY' | 'MODERATE' | 'DIFFICULT' | 'CRITICAL'
  bestValue: string
  safestPick: string
  contrarianPlay: string
  weatherConcerns: string[]
}

interface RecommendationPanelProps {
  poolId: string
  entryId?: string
  week: number
  strategy?: 'CONSERVATIVE' | 'BALANCED' | 'CONTRARIAN' | 'RISK_SEEKING'
  onStrategyChange?: (
    strategy: 'CONSERVATIVE' | 'BALANCED' | 'CONTRARIAN' | 'RISK_SEEKING'
  ) => void
  usedTeams?: Set<string>
  onPickSelect?: (teamId: string, gameId: string) => void
  canPick?: boolean
}

export default function RecommendationPanel({
  poolId,
  entryId = 'default-entry',
  week,
  strategy = 'BALANCED',
  onStrategyChange,
  usedTeams = new Set(),
  onPickSelect = () => {},
  canPick = false,
}: RecommendationPanelProps) {
  const [recommendations, setRecommendations] = useState<{
    primaryPick: Recommendation
    alternativePicks: Recommendation[]
    avoidList: Array<{ teamAbbr: string; reason: string }>
    weekOverview: WeekOverview
    strategicInsights: string[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [poolId, entryId, week, strategy])

  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/survivor/recommendations?poolId=${poolId}&entryId=${entryId}&week=${week}&strategy=${strategy}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch recommendations')
      }

      const data = await response.json()
      setRecommendations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800'
      case 'MODERATE':
        return 'bg-blue-100 text-blue-800'
      case 'DIFFICULT':
        return 'bg-yellow-100 text-yellow-800'
      case 'CRITICAL':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-blue-600'
    if (confidence >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'CONSERVATIVE':
        return <Shield className="h-4 w-4" />
      case 'BALANCED':
        return <Target className="h-4 w-4" />
      case 'CONTRARIAN':
        return <TrendingUp className="h-4 w-4" />
      case 'RISK_SEEKING':
        return <Zap className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Analyzing matchups and generating recommendations...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!recommendations) {
    return null
  }

  const {
    primaryPick,
    alternativePicks,
    avoidList,
    weekOverview,
    strategicInsights,
  } = recommendations

  if (!primaryPick) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No recommendations available for this week. Check back later or try a
          different strategy.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Strategy Selector */}
      {onStrategyChange && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recommendation Strategy</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Strategy:</span>
                <Select
                  value={strategy}
                  onValueChange={(value) => onStrategyChange(value as any)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONSERVATIVE">Conservative</SelectItem>
                    <SelectItem value="BALANCED">Balanced</SelectItem>
                    <SelectItem value="CONTRARIAN">Contrarian</SelectItem>
                    <SelectItem value="RISK_SEEKING">Risk Seeking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Week Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Week {week} Overview</span>
            <Badge
              className={cn(
                'text-xs',
                getDifficultyColor(weekOverview.difficulty)
              )}
            >
              {weekOverview.difficulty}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500">Best Value</div>
              <div className="font-semibold">{weekOverview.bestValue}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Safest Pick</div>
              <div className="font-semibold">{weekOverview.safestPick}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Contrarian</div>
              <div className="font-semibold">{weekOverview.contrarianPlay}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Weather Risk</div>
              <div className="font-semibold">
                {weekOverview.weatherConcerns.length || 'None'}
              </div>
            </div>
          </div>

          {weekOverview.weatherConcerns.length > 0 && (
            <Alert className="mt-2">
              <Cloud className="h-4 w-4" />
              <AlertDescription>
                Weather concerns: {weekOverview.weatherConcerns.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Primary Recommendation */}
      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Primary Recommendation
            <Badge className="ml-auto">{strategy}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <TeamLogo teamAbbr={primaryPick.teamAbbr} size="w-10 h-10" />
                  <span className="text-2xl font-bold">
                    {primaryPick.teamAbbr}
                  </span>
                  <span className="text-gray-500">vs</span>
                  <span className="text-lg">{primaryPick.opponent}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className={cn(
                      'text-xs',
                      getConfidenceColor(primaryPick.finalConfidence)
                    )}
                  >
                    {primaryPick.finalConfidence}% Confidence
                  </Badge>
                  {primaryPick.llmAdjustment && (
                    <Badge variant="outline" className="text-xs">
                      AI Adjusted
                    </Badge>
                  )}
                </div>
              </div>
              {canPick && (
                <Button
                  onClick={() =>
                    onPickSelect(primaryPick.teamId, primaryPick.gameId)
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Select This Pick
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500">Win Prob</div>
                <div
                  className={cn(
                    'font-bold',
                    getConfidenceColor(primaryPick.winProbability * 100)
                  )}
                >
                  {(primaryPick.winProbability * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Public %</div>
                <div className="font-medium">
                  {primaryPick.publicPickPercentage}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">EV Score</div>
                <Badge
                  className={cn(
                    'text-xs',
                    (primaryPick.evScore || 0) >= 1.5
                      ? 'bg-green-100 text-green-800'
                      : (primaryPick.evScore || 0) >= 1.0
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                  )}
                >
                  {primaryPick.evScore?.toFixed(2) || '0.00'}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-gray-500">Future</div>
                <div className="flex">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-3 w-3',
                          i < Math.round(primaryPick.futureValueScore)
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-gray-300'
                        )}
                      />
                    ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg">
              <div className="text-sm font-medium mb-1">Reasoning</div>
              <p className="text-sm text-gray-600">{primaryPick.reasoning}</p>
            </div>

            {Object.keys(primaryPick.narrativeFactors || {}).length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Key Factors</div>
                {Object.entries(primaryPick.narrativeFactors || {}).map(
                  ([key, value]) =>
                    value && (
                      <div key={key} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-gray-600">{value}</span>
                      </div>
                    )
                )}
              </div>
            )}

            {primaryPick.weatherImpact && (
              <Alert
                className={cn(
                  primaryPick.weatherImpact.risk === 'HIGH' &&
                    'border-red-200 bg-red-50',
                  primaryPick.weatherImpact.risk === 'MEDIUM' &&
                    'border-yellow-200 bg-yellow-50'
                )}
              >
                <Cloud className="h-4 w-4" />
                <AlertDescription>
                  {primaryPick.weatherImpact.description}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alternative Picks */}
      {alternativePicks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alternative Picks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alternativePicks.map((pick, index) => (
                <div
                  key={pick.teamId}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 2}</Badge>
                        <TeamLogo teamAbbr={pick.teamAbbr} size="w-6 h-6" />
                        <span className="font-semibold">{pick.teamAbbr}</span>
                        <span className="text-gray-500">
                          vs {pick.opponent}
                        </span>
                        <Badge
                          className={cn(
                            'text-xs ml-auto',
                            getConfidenceColor(pick.finalConfidence)
                          )}
                        >
                          {pick.finalConfidence}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>
                          Win: {(pick.winProbability * 100).toFixed(1)}%
                        </span>
                        <span>Public: {pick.publicPickPercentage}%</span>
                        <span>EV: {pick.evScore?.toFixed(2) || '0.00'}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {pick.reasoning}
                      </p>
                    </div>
                    {canPick && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPickSelect(pick.teamId, pick.gameId)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams to Avoid */}
      {avoidList.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Teams to Avoid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {avoidList.map((item) => (
                <div key={item.teamAbbr} className="flex items-center gap-3">
                  <Badge variant="destructive">{item.teamAbbr}</Badge>
                  <span className="text-sm text-gray-600">{item.reason}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategic Insights */}
      {strategicInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Strategic Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strategicInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={fetchRecommendations}
        variant="outline"
        className="w-full"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh Recommendations
      </Button>
    </div>
  )
}
