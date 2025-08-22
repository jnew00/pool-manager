/**
 * LLM News/Injury Analysis Service
 * Analyzes news articles, injury reports, and team context for tie-breaking weak picks
 */

export interface NewsAnalysisResult {
  gameId: string
  analysisConfidence: number // 0-100, how confident the analysis is
  recommendedTeam?: 'HOME' | 'AWAY'
  keyFactors: NewsFactor[]
  summary: string
  sources: NewsSource[]
  lastUpdated: Date
}

export interface NewsFactor {
  type: NewsFactorType
  impact: number // -5 to +5, negative favors away team, positive favors home team
  confidence: number // 0-1, how confident we are in this factor
  description: string
  source: string
}

export type NewsFactorType =
  | 'INJURY_REPORT'
  | 'WEATHER_CONCERN'
  | 'TEAM_MORALE'
  | 'COACHING_CHANGE'
  | 'SUSPENSION'
  | 'TRADE_IMPACT'
  | 'PLAYOFF_IMPLICATIONS'
  | 'TRAVEL_FATIGUE'
  | 'ROSTER_DEPTH'
  | 'RECENT_PERFORMANCE'

export interface NewsSource {
  url: string
  title: string
  publishedAt: Date
  source: string
  relevanceScore: number // 0-1
}

export interface NewsAnalysisInput {
  gameId: string
  homeTeamId: string
  awayTeamId: string
  homeTeamName: string
  awayTeamName: string
  kickoffTime: Date
  venue?: string
  confidenceDifference: number // How close the original confidence scores were
  currentHomeConfidence: number
  currentAwayConfidence: number
}

export interface NewsAnalysisConfig {
  llmProvider: 'openai' | 'deepseek' | 'anthropic' | 'custom'
  apiKey?: string
  apiEndpoint?: string
  model?: string
  maxTokens?: number
  temperature?: number
  enabled?: boolean
  useMockData?: boolean
  confidenceRangeMin?: number // Minimum confidence difference from 50% to trigger analysis
  confidenceRangeMax?: number // Maximum confidence difference from 50% to trigger analysis
}

/**
 * Main service class for analyzing news and injury reports
 */
export class NewsAnalysisService {
  private config: NewsAnalysisConfig
  private newsApiKey: string

  constructor(config?: Partial<NewsAnalysisConfig>) {
    // Default configuration
    this.config = {
      llmProvider: 'openai',
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.3,
      enabled: true,
      useMockData: process.env.USE_MOCK_NEWS_DATA === 'true',
      confidenceRangeMin: 0, // Games 40-60% confidence (50% ± 10)
      confidenceRangeMax: 10,
      ...config,
    }

    // Set API key based on provider
    if (!this.config.apiKey) {
      switch (this.config.llmProvider) {
        case 'openai':
          this.config.apiKey = process.env.OPENAI_API_KEY || ''
          break
        case 'deepseek':
          this.config.apiKey = process.env.DEEPSEEK_API_KEY || ''
          this.config.apiEndpoint =
            this.config.apiEndpoint ||
            'https://api.deepseek.com/v1/chat/completions'
          this.config.model = this.config.model || 'deepseek-chat'
          break
        case 'anthropic':
          this.config.apiKey = process.env.ANTHROPIC_API_KEY || ''
          this.config.apiEndpoint =
            this.config.apiEndpoint || 'https://api.anthropic.com/v1/messages'
          this.config.model = this.config.model || 'claude-3-haiku-20240307'
          break
        case 'custom':
          this.config.apiKey = process.env.CUSTOM_LLM_API_KEY || ''
          break
      }
    }

    this.newsApiKey = process.env.NEWS_API_KEY || ''

    if (!this.config.apiKey) {
      console.warn(
        `[News Analysis] ${this.config.llmProvider.toUpperCase()} API key not configured`
      )
    }

    if (!this.newsApiKey) {
      console.warn('[News Analysis] News API key not configured')
    }

    console.log(
      `[News Analysis] Service initialized with provider: ${this.config.llmProvider}, enabled: ${this.config.enabled}, hasNewsApiKey: ${!!this.newsApiKey}, hasLLMKey: ${!!this.config.apiKey}`
    )
  }

  /**
   * Analyze news and injury factors for a close game
   */
  async analyzeGame(input: NewsAnalysisInput): Promise<NewsAnalysisResult> {
    try {
      console.log(
        `[News Analysis] Starting analysis for ${input.homeTeamName} vs ${input.awayTeamName} using ${this.config.llmProvider}`
      )

      // Check if service is enabled
      if (!this.config.enabled) {
        return this.createEmptyResult(
          input,
          'News analysis disabled in configuration'
        )
      }

      // Only perform analysis if confidence difference is within configured range
      if (
        Math.abs(input.confidenceDifference) <
          this.config.confidenceRangeMin! ||
        Math.abs(input.confidenceDifference) > this.config.confidenceRangeMax!
      ) {
        return this.createEmptyResult(
          input,
          `Confidence difference (${Math.abs(input.confidenceDifference)}) outside range ${this.config.confidenceRangeMin}-${this.config.confidenceRangeMax}`
        )
      }

      // Fetch recent news for both teams
      console.log(
        `[News Analysis] Fetching news for ${input.homeTeamName} vs ${input.awayTeamName}`
      )
      const [homeNews, awayNews] = await Promise.all([
        this.fetchTeamNews(input.homeTeamName, input.kickoffTime),
        this.fetchTeamNews(input.awayTeamName, input.kickoffTime),
      ])

      console.log(
        `[News Analysis] Found ${homeNews.length} articles for ${input.homeTeamName}, ${awayNews.length} articles for ${input.awayTeamName}`
      )

      // Combine and analyze all news sources
      const allNews = [...homeNews, ...awayNews]
      if (allNews.length === 0) {
        console.log(`[News Analysis] No relevant news found for either team`)
        return this.createEmptyResult(input, 'No relevant news found')
      }

      // Extract key factors using LLM analysis
      const factors = await this.extractNewsFactors(input, allNews)

      // Calculate overall recommendation
      const analysis = this.calculateRecommendation(input, factors)

      return {
        gameId: input.gameId,
        analysisConfidence: analysis.confidence,
        recommendedTeam: analysis.recommendedTeam,
        keyFactors: factors,
        summary: analysis.summary,
        sources: allNews,
        lastUpdated: new Date(),
      }
    } catch (error) {
      console.error('[News Analysis] Error analyzing game:', error)
      return this.createEmptyResult(
        input,
        `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Fetch recent news for a specific team
   */
  private async fetchTeamNews(
    teamName: string,
    gameDate: Date
  ): Promise<NewsSource[]> {
    // Use mock data if configured
    if (this.config.useMockData) {
      return this.getMockNewsData(teamName, gameDate)
    }

    if (!this.newsApiKey) {
      console.warn(
        '[News Analysis] News API key not configured, skipping news fetch'
      )
      return []
    }

    try {
      // Search for team news from the past 3 days
      const threeDaysAgo = new Date(gameDate)
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      const query = `"${teamName}" NFL injury OR suspension OR trade OR roster`
      const response = await fetch(
        `https://newsapi.org/v2/everything?` +
          `q=${encodeURIComponent(query)}&` +
          `from=${threeDaysAgo.toISOString().split('T')[0]}&` +
          `to=${gameDate.toISOString().split('T')[0]}&` +
          `language=en&` +
          `sortBy=relevancy&` +
          `pageSize=10&` +
          `apiKey=${this.newsApiKey}`
      )

      if (!response.ok) {
        console.warn(
          `[News Analysis] News API request failed: ${response.status}`
        )
        return []
      }

      const data = await response.json()

      return (data.articles || [])
        .filter((article: any) => this.isRelevantArticle(article, teamName))
        .map((article: any) => ({
          url: article.url,
          title: article.title,
          publishedAt: new Date(article.publishedAt),
          source: article.source.name,
          relevanceScore: this.calculateRelevanceScore(article, teamName),
        }))
        .sort(
          (a: NewsSource, b: NewsSource) => b.relevanceScore - a.relevanceScore
        )
        .slice(0, 5) // Keep top 5 most relevant articles per team
    } catch (error) {
      console.warn('[News Analysis] Failed to fetch team news:', error)
      return []
    }
  }

  /**
   * Use LLM to extract key factors from news articles
   */
  private async extractNewsFactors(
    input: NewsAnalysisInput,
    news: NewsSource[]
  ): Promise<NewsFactor[]> {
    // Use mock data if configured
    if (this.config.useMockData) {
      return this.getMockFactorsFromNews(news)
    }

    if (!this.config.apiKey || news.length === 0) {
      if (!this.config.apiKey) {
        console.warn(
          `[News Analysis] ${this.config.llmProvider.toUpperCase()} API key not configured, skipping LLM analysis`
        )
      }
      return []
    }

    try {
      const prompt = this.buildAnalysisPrompt(input, news)

      // Call appropriate provider
      switch (this.config.llmProvider) {
        case 'anthropic':
          return this.callAnthropicAPI(prompt)
        case 'deepseek':
          return this.callDeepSeekAPI(prompt)
        case 'custom':
          return this.callCustomAPI(prompt)
        case 'openai':
        default:
          return this.callOpenAIAPI(prompt)
      }
    } catch (error) {
      console.warn('[News Analysis] Failed to extract factors:', error)
      return []
    }
  }

  /**
   * Call OpenAI API for news analysis
   */
  private async callOpenAIAPI(prompt: string): Promise<NewsFactor[]> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert NFL analyst who identifies key factors from news that could impact game outcomes. Respond only with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    })

    if (!response.ok) {
      console.warn(
        `[News Analysis] OpenAI API request failed: ${response.status}`
      )
      return []
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return []
    }

    const analysis = JSON.parse(content)
    return this.validateAndNormalizeFactors(analysis.factors || [])
  }

  /**
   * Call DeepSeek API for news analysis
   */
  private async callDeepSeekAPI(prompt: string): Promise<NewsFactor[]> {
    const response = await fetch(
      this.config.apiEndpoint || 'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert NFL analyst who identifies key factors from news that could impact game outcomes. Respond only with valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      }
    )

    if (!response.ok) {
      console.warn(
        `[News Analysis] DeepSeek API request failed: ${response.status}`
      )
      return []
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return []
    }

    const analysis = JSON.parse(content)
    return this.validateAndNormalizeFactors(analysis.factors || [])
  }

  /**
   * Call Anthropic API for news analysis
   */
  private async callAnthropicAPI(prompt: string): Promise<NewsFactor[]> {
    const response = await fetch(
      this.config.apiEndpoint || 'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'x-api-key': this.config.apiKey!,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          system:
            'You are an expert NFL analyst who identifies key factors from news that could impact game outcomes. Respond only with valid JSON.',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      console.warn(
        `[News Analysis] Anthropic API request failed: ${response.status}`
      )
      return []
    }

    const data = await response.json()
    const content = data.content?.[0]?.text

    if (!content) {
      return []
    }

    const analysis = JSON.parse(content)
    return this.validateAndNormalizeFactors(analysis.factors || [])
  }

  /**
   * Call custom API for news analysis
   */
  private async callCustomAPI(prompt: string): Promise<NewsFactor[]> {
    if (!this.config.apiEndpoint) {
      console.warn('[News Analysis] Custom API endpoint not configured')
      return []
    }

    const response = await fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert NFL analyst who identifies key factors from news that could impact game outcomes. Respond only with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    })

    if (!response.ok) {
      console.warn(
        `[News Analysis] Custom API request failed: ${response.status}`
      )
      return []
    }

    const data = await response.json()
    const content =
      data.choices?.[0]?.message?.content || data.content?.[0]?.text

    if (!content) {
      return []
    }

    const analysis = JSON.parse(content)
    return this.validateAndNormalizeFactors(analysis.factors || [])
  }

  /**
   * Build the prompt for LLM analysis
   */
  private buildAnalysisPrompt(
    input: NewsAnalysisInput,
    news: NewsSource[]
  ): string {
    const newsText = news
      .map(
        (n) =>
          `"${n.title}" (${n.source}, ${n.publishedAt.toLocaleDateString()})`
      )
      .join('\n')

    return `
Analyze these NFL news headlines for ${input.homeTeamName} (HOME) vs ${input.awayTeamName} (AWAY) on ${input.kickoffTime.toLocaleDateString()}:

${newsText}

Current confidence scores are very close:
- ${input.homeTeamName}: ${input.currentHomeConfidence}%
- ${input.awayTeamName}: ${input.currentAwayConfidence}%

Extract key factors that could tip the balance. Focus on:
- Key player injuries or returns
- Suspensions or disciplinary issues  
- Recent trades or roster changes
- Coaching changes or team morale
- Weather-related concerns
- Travel or scheduling advantages

Respond with JSON in this format:
{
  "factors": [
    {
      "type": "INJURY_REPORT",
      "impact": -2.5,
      "confidence": 0.8,
      "description": "QB questionable with ankle injury",
      "source": "ESPN"
    }
  ]
}

Impact scale: -5 (strongly favors away) to +5 (strongly favors home)
Confidence: 0-1 (how certain you are about this factor)
Types: INJURY_REPORT, SUSPENSION, TEAM_MORALE, COACHING_CHANGE, TRADE_IMPACT, WEATHER_CONCERN, TRAVEL_FATIGUE, ROSTER_DEPTH, RECENT_PERFORMANCE, PLAYOFF_IMPLICATIONS
`
  }

  /**
   * Calculate final recommendation based on extracted factors
   */
  private calculateRecommendation(
    input: NewsAnalysisInput,
    factors: NewsFactor[]
  ): {
    confidence: number
    recommendedTeam?: 'HOME' | 'AWAY'
    summary: string
  } {
    if (factors.length === 0) {
      return {
        confidence: 0,
        summary: 'No significant factors found in news analysis',
      }
    }

    // Calculate weighted impact score
    let totalImpact = 0
    let totalWeight = 0

    for (const factor of factors) {
      const weight = factor.confidence
      totalImpact += factor.impact * weight
      totalWeight += weight
    }

    const averageImpact = totalWeight > 0 ? totalImpact / totalWeight : 0
    const confidence = Math.min(80, Math.abs(averageImpact) * 15) // Max 80% confidence

    // Only make recommendation if impact is significant
    let recommendedTeam: 'HOME' | 'AWAY' | undefined
    if (Math.abs(averageImpact) >= 1.0) {
      recommendedTeam = averageImpact > 0 ? 'HOME' : 'AWAY'
    }

    // Build summary
    const topFactors = factors
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
      .slice(0, 3)

    const summary =
      topFactors.length > 0
        ? `Key factors: ${topFactors.map((f) => f.description).join('; ')}`
        : 'No significant factors identified'

    return {
      confidence: Math.round(confidence),
      recommendedTeam,
      summary,
    }
  }

  /**
   * Validate and normalize factors from LLM response
   */
  private validateAndNormalizeFactors(factors: any[]): NewsFactor[] {
    const validTypes: NewsFactorType[] = [
      'INJURY_REPORT',
      'WEATHER_CONCERN',
      'TEAM_MORALE',
      'COACHING_CHANGE',
      'SUSPENSION',
      'TRADE_IMPACT',
      'PLAYOFF_IMPLICATIONS',
      'TRAVEL_FATIGUE',
      'ROSTER_DEPTH',
      'RECENT_PERFORMANCE',
    ]

    return factors
      .filter((f) => f && typeof f === 'object')
      .map((f) => ({
        type: validTypes.includes(f.type) ? f.type : 'RECENT_PERFORMANCE',
        impact: Math.max(-5, Math.min(5, Number(f.impact) || 0)),
        confidence: Math.max(0, Math.min(1, Number(f.confidence) || 0)),
        description: String(f.description || 'Unknown factor'),
        source: String(f.source || 'Unknown source'),
      }))
      .filter((f) => Math.abs(f.impact) > 0.1) // Filter out negligible impacts
  }

  /**
   * Check if article is relevant to the team
   */
  private isRelevantArticle(article: any, teamName: string): boolean {
    if (!article.title || !article.description) {
      return false
    }

    const text = `${article.title} ${article.description}`.toLowerCase()
    const team = teamName.toLowerCase()

    // Must mention team name and be about relevant topics
    return (
      text.includes(team) &&
      (text.includes('injury') ||
        text.includes('injured') ||
        text.includes('questionable') ||
        text.includes('doubtful') ||
        text.includes('out') ||
        text.includes('suspended') ||
        text.includes('trade') ||
        text.includes('roster') ||
        text.includes('coach') ||
        text.includes('weather') ||
        text.includes('playoff'))
    )
  }

  /**
   * Calculate relevance score for news article
   */
  private calculateRelevanceScore(article: any, teamName: string): number {
    let score = 0
    const text = `${article.title} ${article.description}`.toLowerCase()
    const team = teamName.toLowerCase()

    // Team name frequency
    const teamMentions = (text.match(new RegExp(team, 'g')) || []).length
    score += teamMentions * 0.3

    // High-impact keywords
    const highImpactWords = [
      'injury',
      'injured',
      'suspended',
      'out',
      'questionable',
      'doubtful',
    ]
    score += highImpactWords.filter((word) => text.includes(word)).length * 0.2

    // Medium-impact keywords
    const mediumImpactWords = ['trade', 'roster', 'coach', 'playoff', 'weather']
    score +=
      mediumImpactWords.filter((word) => text.includes(word)).length * 0.1

    // Recency bonus (more recent = higher score)
    const hoursAgo =
      (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60)
    if (hoursAgo < 24) score += 0.2
    else if (hoursAgo < 48) score += 0.1

    return Math.min(1, score)
  }

  /**
   * Create empty result for cases where analysis isn't needed or possible
   */
  private createEmptyResult(
    input: NewsAnalysisInput,
    reason: string
  ): NewsAnalysisResult {
    return {
      gameId: input.gameId,
      analysisConfidence: 0,
      keyFactors: [],
      summary: reason,
      sources: [],
      lastUpdated: new Date(),
    }
  }

  /**
   * Generate mock news data for testing (deterministic to avoid hydration issues)
   */
  private getMockNewsData(teamName: string, gameDate: Date): NewsSource[] {
    const mockNewsTemplates = [
      {
        titleTemplate:
          '{team} quarterback listed as questionable with ankle injury',
        type: 'INJURY_REPORT',
        impact: -2.5,
        confidence: 0.8,
        source: 'ESPN',
      },
      {
        titleTemplate:
          '{team} star wide receiver cleared to play after hamstring concern',
        type: 'INJURY_REPORT',
        impact: 1.5,
        confidence: 0.7,
        source: 'NFL.com',
      },
      {
        titleTemplate: '{team} defensive coordinator suspended for one game',
        type: 'SUSPENSION',
        impact: -1.8,
        confidence: 0.9,
        source: 'The Athletic',
      },
      {
        titleTemplate:
          '{team} acquire veteran linebacker in trade deadline deal',
        type: 'TRADE_IMPACT',
        impact: 1.2,
        confidence: 0.6,
        source: 'NFL Network',
      },
    ]

    // Use deterministic selection based on team name hash to avoid hydration issues
    const teamHash = teamName.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)

    const numArticles = Math.abs(teamHash % 3) + 1 // 1-3 articles
    const startIndex = Math.abs(teamHash % mockNewsTemplates.length)

    const selectedTemplates = []
    for (let i = 0; i < numArticles; i++) {
      const index = (startIndex + i) % mockNewsTemplates.length
      selectedTemplates.push(mockNewsTemplates[index])
    }

    return selectedTemplates.map((template, index) => ({
      url: `https://mock-news-api.com/${teamName.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
      title: template.titleTemplate.replace('{team}', teamName),
      publishedAt: new Date(
        gameDate.getTime() - (index + 1) * 24 * 60 * 60 * 1000
      ), // Deterministic time
      source: template.source,
      relevanceScore: 0.8, // Fixed relevance score
    }))
  }

  /**
   * Generate mock factors from news articles for testing (deterministic)
   */
  private getMockFactorsFromNews(news: NewsSource[]): NewsFactor[] {
    const factorTypes: NewsFactorType[] = [
      'INJURY_REPORT',
      'SUSPENSION',
      'TEAM_MORALE',
      'COACHING_CHANGE',
      'TRADE_IMPACT',
      'WEATHER_CONCERN',
      'TRAVEL_FATIGUE',
      'ROSTER_DEPTH',
    ]

    return news
      .slice(0, 3)
      .map((article, index) => {
        // Use deterministic values based on article title hash to avoid hydration issues
        const titleHash = article.title.split('').reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0)
          return a & a
        }, 0)

        const factorType =
          factorTypes[Math.abs(titleHash + index) % factorTypes.length]
        const impact = ((Math.abs(titleHash % 100) - 50) / 100) * 6 // -3 to +3 range, deterministic
        const confidence = 0.6 + Math.abs(titleHash % 40) / 100 // 0.6-1.0 range, deterministic

        let description = article.title.substring(0, 60) + '...'

        // Adjust description based on factor type
        if (factorType === 'INJURY_REPORT') {
          description = article.title.includes('questionable')
            ? 'Key player questionable with injury'
            : 'Player injury concern reported'
        } else if (factorType === 'SUSPENSION') {
          description = 'Staff member suspended for violation'
        } else if (factorType === 'TRADE_IMPACT') {
          description = 'Recent roster move impacts team depth'
        }

        return {
          type: factorType,
          impact: Math.round(impact * 10) / 10, // Round to 1 decimal
          confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
          description,
          source: article.source,
        }
      })
      .filter((factor) => Math.abs(factor.impact) > 1.0) // Ensure significant factors
  }
}

/**
 * Get a human-readable summary of news factors
 */
export function getNewsAnalysisSummary(result: NewsAnalysisResult): string {
  if (result.analysisConfidence === 0 || result.keyFactors.length === 0) {
    return result.summary
  }

  const recommendation = result.recommendedTeam
    ? `Slight edge to ${result.recommendedTeam === 'HOME' ? 'home' : 'away'} team. `
    : 'No clear advantage. '

  return `${recommendation}${result.summary} (${result.analysisConfidence}% confidence)`
}
