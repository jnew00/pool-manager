import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NewsAnalysisService, getNewsAnalysisSummary } from '../news-analysis'
import type { NewsAnalysisInput, NewsSource, NewsFactor } from '../news-analysis'

// Mock fetch globally
global.fetch = vi.fn()
const mockFetch = vi.mocked(fetch)

describe('NewsAnalysisService', () => {
  let service: NewsAnalysisService
  let mockInput: NewsAnalysisInput

  beforeEach(() => {
    vi.clearAllMocks()
    service = new NewsAnalysisService()
    mockInput = {
      gameId: 'game-1',
      homeTeamId: 'team-home',
      awayTeamId: 'team-away', 
      homeTeamName: 'Kansas City Chiefs',
      awayTeamName: 'Buffalo Bills',
      kickoffTime: new Date('2024-12-15T18:00:00Z'),
      venue: 'Arrowhead Stadium',
      confidenceDifference: 3.5, // Close game
      currentHomeConfidence: 51.5,
      currentAwayConfidence: 48.0
    }
  })

  describe('analyzeGame', () => {
    it('should skip analysis when confidence difference is too large', async () => {
      const input = {
        ...mockInput,
        confidenceDifference: 15, // Too large
        currentHomeConfidence: 65,
        currentAwayConfidence: 50
      }

      const result = await service.analyzeGame(input)

      expect(result.analysisConfidence).toBe(0)
      expect(result.summary).toBe('Confidence difference (15) outside range 0-10')
      expect(result.keyFactors).toHaveLength(0)
    })

    it('should return empty result when no API keys are configured', async () => {
      // Service will warn about missing API keys but still function
      const result = await service.analyzeGame(mockInput)

      expect(result.analysisConfidence).toBe(0)
      expect(result.summary).toBe('No relevant news found')
      expect(result.sources).toHaveLength(0)
    })

    it('should handle news API errors gracefully', async () => {
      // Mock news API failure
      mockFetch.mockRejectedValue(new Error('News API error'))

      const result = await service.analyzeGame(mockInput)

      expect(result.analysisConfidence).toBe(0)
      expect(result.summary).toBe('No relevant news found')
    })

    it('should process news and extract factors when APIs are working', async () => {
      // Mock environment variables first
      const originalEnv = process.env
      process.env = {
        ...originalEnv,
        NEWS_API_KEY: 'test-news-key',
        OPENAI_API_KEY: 'test-openai-key'
      }

      // Create new service instance with API keys
      const serviceWithKeys = new NewsAnalysisService()

      // Mock successful news API response
      const mockNewsResponse = {
        articles: [
          {
            title: 'Kansas City Chiefs QB Patrick Mahomes questionable with ankle injury',
            description: 'Chiefs quarterback dealing with ankle issue ahead of Bills matchup',
            url: 'https://example.com/article1',
            publishedAt: '2024-12-14T10:00:00Z',
            source: { name: 'ESPN' }
          },
          {
            title: 'Buffalo Bills sign practice squad WR to active roster',
            description: 'Bills bolster receiving corps with promotion',
            url: 'https://example.com/article2', 
            publishedAt: '2024-12-13T15:30:00Z',
            source: { name: 'NFL.com' }
          }
        ]
      }

      // Mock successful LLM analysis response
      const mockLLMResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              factors: [
                {
                  type: 'INJURY_REPORT',
                  impact: -3.0,
                  confidence: 0.8,
                  description: 'Chiefs QB questionable with ankle injury',
                  source: 'ESPN'
                },
                {
                  type: 'ROSTER_DEPTH',
                  impact: 0.5,
                  confidence: 0.5,
                  description: 'Bills added WR depth from practice squad',
                  source: 'NFL.com'
                }
              ]
            })
          }
        }]
      }

      // Set up mocks
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockNewsResponse)
        } as Response)
        .mockResolvedValueOnce({
          ok: true, 
          json: () => Promise.resolve(mockNewsResponse)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLLMResponse)
        } as Response)

      const result = await serviceWithKeys.analyzeGame(mockInput)

      expect(result.analysisConfidence).toBeGreaterThan(0)
      expect(result.keyFactors).toHaveLength(2)
      expect(result.keyFactors[0].type).toBe('INJURY_REPORT')
      expect(result.keyFactors[0].impact).toBe(-3.0)
      expect(result.sources).toHaveLength(2)
      expect(result.recommendedTeam).toBe('AWAY') // Negative impact favors away team

      // Restore environment
      process.env = originalEnv
    })

    it('should handle malformed LLM responses gracefully', async () => {
      const originalEnv = process.env
      process.env = {
        ...originalEnv,
        NEWS_API_KEY: 'test-news-key',
        OPENAI_API_KEY: 'test-openai-key'
      }

      // Create new service instance with API keys
      const serviceWithKeys = new NewsAnalysisService()

      const mockNewsResponse = {
        articles: [{
          title: 'Chiefs injury update',
          description: 'Player injury news',
          url: 'https://example.com/article1',
          publishedAt: '2024-12-14T10:00:00Z',
          source: { name: 'ESPN' }
        }]
      }

      const mockLLMResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockNewsResponse)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockNewsResponse)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLLMResponse)
        } as Response)

      const result = await serviceWithKeys.analyzeGame(mockInput)

      expect(result.analysisConfidence).toBe(0)
      expect(result.keyFactors).toHaveLength(0)

      process.env = originalEnv
    })
  })

  describe('factor validation', () => {
    it('should normalize factor impacts to valid range', () => {
      const service = new NewsAnalysisService()
      const factors = [
        {
          type: 'INJURY_REPORT',
          impact: 10, // Too high
          confidence: 0.8,
          description: 'Major injury',
          source: 'ESPN'
        },
        {
          type: 'TEAM_MORALE', 
          impact: -7, // Too low
          confidence: 0.6,
          description: 'Team issues',
          source: 'NFL.com'
        }
      ]

      // Use private method through type assertion for testing
      const normalized = (service as any).validateAndNormalizeFactors(factors)

      expect(normalized[0].impact).toBe(5) // Capped at max
      expect(normalized[1].impact).toBe(-5) // Capped at min
    })

    it('should filter out factors with negligible impact', () => {
      const service = new NewsAnalysisService()
      const factors = [
        {
          type: 'INJURY_REPORT',
          impact: 2.0,
          confidence: 0.8,
          description: 'Significant factor',
          source: 'ESPN'
        },
        {
          type: 'WEATHER_CONCERN',
          impact: 0.05, // Too small
          confidence: 0.3,
          description: 'Negligible factor',
          source: 'Weather.com'
        }
      ]

      const normalized = (service as any).validateAndNormalizeFactors(factors)

      expect(normalized).toHaveLength(1)
      expect(normalized[0].description).toBe('Significant factor')
    })

    it('should handle invalid factor types', () => {
      const service = new NewsAnalysisService()
      const factors = [
        {
          type: 'INVALID_TYPE',
          impact: 2.0,
          confidence: 0.8,
          description: 'Unknown factor',
          source: 'ESPN'
        }
      ]

      const normalized = (service as any).validateAndNormalizeFactors(factors)

      expect(normalized[0].type).toBe('RECENT_PERFORMANCE') // Default type
    })
  })

  describe('news relevance scoring', () => {
    it('should score articles based on team mentions and keywords', () => {
      const service = new NewsAnalysisService()
      const article = {
        title: 'Chiefs quarterback Patrick Mahomes injured in practice',
        description: 'Kansas City Chiefs QB dealing with ankle injury ahead of playoff game',
        publishedAt: new Date().toISOString()
      }

      const score = (service as any).calculateRelevanceScore(article, 'Kansas City Chiefs')

      expect(score).toBeGreaterThan(0.5) // High relevance due to team name + injury keywords
    })

    it('should give higher scores to recent articles', () => {
      const service = new NewsAnalysisService()
      const recentArticle = {
        title: 'Chiefs injury update',
        description: 'Team news',
        publishedAt: new Date().toISOString()
      }

      const oldArticle = {
        title: 'Chiefs injury update',
        description: 'Team news', 
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      }

      const recentScore = (service as any).calculateRelevanceScore(recentArticle, 'Chiefs')
      const oldScore = (service as any).calculateRelevanceScore(oldArticle, 'Chiefs')

      expect(recentScore).toBeGreaterThan(oldScore)
    })

    it('should filter irrelevant articles', () => {
      const service = new NewsAnalysisService()
      
      const relevantArticle = {
        title: 'Chiefs player injured',
        description: 'Team injury news'
      }

      const irrelevantArticle = {
        title: 'General NFL news',
        description: 'League updates'
      }

      expect((service as any).isRelevantArticle(relevantArticle, 'Chiefs')).toBe(true)
      expect((service as any).isRelevantArticle(irrelevantArticle, 'Chiefs')).toBe(false)
    })
  })

  describe('recommendation calculation', () => {
    it('should recommend home team when factors favor home', () => {
      const service = new NewsAnalysisService()
      const factors: NewsFactor[] = [
        {
          type: 'INJURY_REPORT',
          impact: 3.0, // Positive impact favors home
          confidence: 0.8,
          description: 'Away team key player injured',
          source: 'ESPN'
        }
      ]

      const result = (service as any).calculateRecommendation(mockInput, factors)

      expect(result.recommendedTeam).toBe('HOME')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should recommend away team when factors favor away', () => {
      const service = new NewsAnalysisService()
      const factors: NewsFactor[] = [
        {
          type: 'INJURY_REPORT', 
          impact: -2.5, // Negative impact favors away
          confidence: 0.9,
          description: 'Home team QB questionable',
          source: 'ESPN'
        }
      ]

      const result = (service as any).calculateRecommendation(mockInput, factors)

      expect(result.recommendedTeam).toBe('AWAY')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should not recommend when impact is too small', () => {
      const service = new NewsAnalysisService()
      const factors: NewsFactor[] = [
        {
          type: 'ROSTER_DEPTH',
          impact: 0.5, // Too small for recommendation
          confidence: 0.6,
          description: 'Minor roster move',
          source: 'NFL.com'
        }
      ]

      const result = (service as any).calculateRecommendation(mockInput, factors)

      expect(result.recommendedTeam).toBeUndefined()
      expect(result.confidence).toBeLessThan(15)
    })

    it('should weight factors by confidence', () => {
      const service = new NewsAnalysisService()
      const factors: NewsFactor[] = [
        {
          type: 'INJURY_REPORT',
          impact: 2.0,
          confidence: 0.9, // High confidence
          description: 'Confirmed injury',
          source: 'ESPN'
        },
        {
          type: 'TEAM_MORALE',
          impact: -3.0,
          confidence: 0.2, // Low confidence
          description: 'Rumored team issues',
          source: 'Twitter'
        }
      ]

      const result = (service as any).calculateRecommendation(mockInput, factors)

      // High-confidence positive factor should outweigh low-confidence negative factor
      expect(result.recommendedTeam).toBe('HOME')
    })
  })
})

describe('getNewsAnalysisSummary', () => {
  it('should return summary for empty results', () => {
    const emptyResult = {
      gameId: 'game-1',
      analysisConfidence: 0,
      keyFactors: [],
      summary: 'No relevant news found',
      sources: [],
      lastUpdated: new Date()
    }

    const summary = getNewsAnalysisSummary(emptyResult)
    expect(summary).toBe('No relevant news found')
  })

  it('should format summary with recommendation', () => {
    const result = {
      gameId: 'game-1',
      analysisConfidence: 65,
      recommendedTeam: 'AWAY' as const,
      keyFactors: [{
        type: 'INJURY_REPORT' as const,
        impact: -2.0,
        confidence: 0.8,
        description: 'QB questionable',
        source: 'ESPN'
      }],
      summary: 'Key injury concerns for home team',
      sources: [],
      lastUpdated: new Date()
    }

    const summary = getNewsAnalysisSummary(result)
    expect(summary).toContain('Slight edge to away team')
    expect(summary).toContain('Key injury concerns')
    expect(summary).toContain('65% confidence')
  })

  it('should handle no recommendation case', () => {
    const result = {
      gameId: 'game-1', 
      analysisConfidence: 25,
      keyFactors: [{
        type: 'ROSTER_DEPTH' as const,
        impact: 0.5,
        confidence: 0.4,
        description: 'Minor roster move',
        source: 'NFL.com'
      }],
      summary: 'Minor factors identified',
      sources: [],
      lastUpdated: new Date()
    }

    const summary = getNewsAnalysisSummary(result)
    expect(summary).toContain('No clear advantage')
    expect(summary).toContain('Minor factors identified')
    expect(summary).toContain('25% confidence')
  })
})