import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  LLMNormalizerService,
  createLLMNormalizerService,
} from '../llm-normalizer.service'

// Mock OpenAI
const mockOpenAI = {
  chat: {
    completions: {
      create: vi.fn(),
    },
  },
}

// Mock Anthropic
const mockAnthropic = {
  messages: {
    create: vi.fn(),
  },
}

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => mockOpenAI),
}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => mockAnthropic),
}))

describe('LLMNormalizerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('disabled provider', () => {
    it('should return error when provider is disabled', async () => {
      const service = new LLMNormalizerService({ provider: 'disabled' })

      const result = await service.normalizeText('some text', 2025, 1)

      expect(result).toEqual({
        rows: [],
        success: false,
        error: 'LLM normalization is disabled',
      })
    })
  })

  describe('OpenAI provider', () => {
    it('should normalize text successfully with OpenAI', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                rows: [
                  {
                    season: 2025,
                    week: 1,
                    kickoff_et: '2025-09-07T13:00:00-04:00',
                    home_team: 'NE',
                    away_team: 'NYJ',
                    fav_team_abbr: 'NE',
                    spread_for_home: 6.5,
                    total: 42.5,
                    moneyline_home: -280,
                    moneyline_away: 220,
                    is_pickem: false,
                    source_label: 'ESPN',
                    issues: [],
                  },
                ],
              }),
            },
          },
        ],
        usage: {
          total_tokens: 150,
        },
      }

      mockOpenAI.chat.completions.create.mockResolvedValueOnce(mockResponse)

      const service = new LLMNormalizerService({
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4o-mini',
      })

      const result = await service.normalizeText('NE -6.5 at NYJ', 2025, 1)

      expect(result.success).toBe(true)
      expect(result.rows).toHaveLength(1)
      expect(result.rows[0].home_team).toBe('NE')
      expect(result.rows[0].away_team).toBe('NYJ')
      expect(result.provider).toBe('openai')
      expect(result.tokensUsed).toBe(150)
    })

    it('should handle OpenAI API errors', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(
        new Error('API Error')
      )

      const service = new LLMNormalizerService({
        provider: 'openai',
        apiKey: 'test-key',
      })

      const result = await service.normalizeText('some text', 2025, 1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('API Error')
      expect(result.provider).toBe('openai')
    })

    it('should handle empty response from OpenAI', async () => {
      const mockResponse = {
        choices: [],
        usage: { total_tokens: 0 },
      }

      mockOpenAI.chat.completions.create.mockResolvedValueOnce(mockResponse)

      const service = new LLMNormalizerService({
        provider: 'openai',
        apiKey: 'test-key',
      })

      const result = await service.normalizeText('some text', 2025, 1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('No response from OpenAI')
    })
  })

  describe('Anthropic provider', () => {
    it('should normalize text successfully with Anthropic', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              rows: [
                {
                  season: 2025,
                  week: 1,
                  kickoff_et: '2025-09-07T13:00:00-04:00',
                  home_team: 'BAL',
                  away_team: 'CIN',
                  fav_team_abbr: 'BAL',
                  spread_for_home: 3.5,
                  total: 48.0,
                  moneyline_home: -150,
                  moneyline_away: 130,
                  is_pickem: false,
                  source_label: 'DraftKings',
                  issues: [],
                },
              ],
            }),
          },
        ],
        usage: {
          input_tokens: 100,
          output_tokens: 50,
        },
      }

      mockAnthropic.messages.create.mockResolvedValueOnce(mockResponse)

      const service = new LLMNormalizerService({
        provider: 'anthropic',
        apiKey: 'test-key',
        model: 'claude-3-haiku-20240307',
      })

      const result = await service.normalizeText('BAL -3.5 vs CIN', 2025, 1)

      expect(result.success).toBe(true)
      expect(result.rows).toHaveLength(1)
      expect(result.rows[0].home_team).toBe('BAL')
      expect(result.rows[0].away_team).toBe('CIN')
      expect(result.provider).toBe('anthropic')
      expect(result.tokensUsed).toBe(150) // 100 + 50
    })

    it('should handle Anthropic API errors', async () => {
      mockAnthropic.messages.create.mockRejectedValueOnce(
        new Error('Rate limit exceeded')
      )

      const service = new LLMNormalizerService({
        provider: 'anthropic',
        apiKey: 'test-key',
      })

      const result = await service.normalizeText('some text', 2025, 1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Rate limit exceeded')
      expect(result.provider).toBe('anthropic')
    })
  })

  describe('configuration errors', () => {
    it('should handle missing API key for OpenAI', async () => {
      const service = new LLMNormalizerService({
        provider: 'openai',
        // no apiKey provided
      })

      const result = await service.normalizeText('some text', 2025, 1)

      expect(result.success).toBe(false)
      expect(result.error).toContain('not properly configured')
    })

    it('should handle missing API key for Anthropic', async () => {
      const service = new LLMNormalizerService({
        provider: 'anthropic',
        // no apiKey provided
      })

      const result = await service.normalizeText('some text', 2025, 1)

      expect(result.success).toBe(false)
      expect(result.error).toContain('not properly configured')
    })
  })
})

describe('createLLMNormalizerService', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should create service with environment variables', () => {
    process.env.LLM_NORMALIZER_PROVIDER = 'openai'
    process.env.OPENAI_API_KEY = 'test-key'
    process.env.OPENAI_MODEL = 'gpt-4o'
    process.env.LLM_MAX_TOKENS = '1500'

    const service = createLLMNormalizerService()

    expect(service).toBeInstanceOf(LLMNormalizerService)
  })

  it('should default to disabled provider when not configured', () => {
    delete process.env.LLM_NORMALIZER_PROVIDER

    const service = createLLMNormalizerService()

    expect(service).toBeInstanceOf(LLMNormalizerService)
  })
})
