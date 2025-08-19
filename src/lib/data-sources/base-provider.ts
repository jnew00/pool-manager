import type {
  DataProvider,
  ProviderConfig,
  ApiResponse,
  DataSourceError,
} from './types'

/**
 * Base class for all data providers with common functionality
 */
export abstract class BaseDataProvider implements DataProvider {
  public readonly name: string
  public readonly config: ProviderConfig

  constructor(name: string, config: ProviderConfig) {
    this.name = name
    this.config = config
  }

  /**
   * Health check implementation - can be overridden
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/health', 'GET')
      return response.success
    } catch {
      return false
    }
  }

  /**
   * Rate limit status - can be overridden
   */
  async getRateLimitStatus(): Promise<{
    remaining: number
    resetAt: Date
  } | null> {
    // Default implementation returns null - override if provider supports rate limit headers
    return null
  }

  /**
   * Common HTTP request method with error handling
   */
  protected async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    headers: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`
    const timeout = this.config.timeout || 10000

    // Add API key if provided
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PoolManager/1.0',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error: DataSourceError = {
          provider: this.name,
          endpoint,
          message: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date(),
          retryable: response.status >= 500 || response.status === 429,
        }

        return {
          success: false,
          error,
          rateLimitRemaining: this.parseRateLimitHeader(response, 'remaining'),
          rateLimitReset: this.parseRateLimitHeader(response, 'reset'),
        }
      }

      const data = await response.json()

      return {
        success: true,
        data,
        rateLimitRemaining: this.parseRateLimitHeader(response, 'remaining'),
        rateLimitReset: this.parseRateLimitHeader(response, 'reset'),
      }
    } catch (error) {
      clearTimeout(timeoutId)

      const dataSourceError: DataSourceError = {
        provider: this.name,
        endpoint,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        retryable: true,
      }

      return {
        success: false,
        error: dataSourceError,
      }
    }
  }

  /**
   * Parse rate limit headers from response
   */
  private parseRateLimitHeader(
    response: Response,
    type: 'remaining' | 'reset'
  ): number | Date | undefined {
    if (type === 'remaining') {
      const remaining =
        response.headers.get('X-RateLimit-Remaining') ||
        response.headers.get('X-Rate-Limit-Remaining')
      return remaining ? parseInt(remaining, 10) : undefined
    }

    if (type === 'reset') {
      const reset =
        response.headers.get('X-RateLimit-Reset') ||
        response.headers.get('X-Rate-Limit-Reset')
      return reset ? new Date(parseInt(reset, 10) * 1000) : undefined
    }
  }

  /**
   * Retry logic with exponential backoff
   */
  protected async withRetry<T>(
    operation: () => Promise<ApiResponse<T>>,
    maxRetries: number = this.config.retries || 3
  ): Promise<ApiResponse<T>> {
    let lastError: DataSourceError | undefined

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await operation()

      if (result.success || !result.error?.retryable) {
        return result
      }

      lastError = result.error

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    return {
      success: false,
      error: lastError!,
    }
  }
}
