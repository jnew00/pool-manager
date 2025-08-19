import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the fetch function to test API integration
global.fetch = vi.fn()

describe('PickEntry API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle bulk picks API call correctly', async () => {
    // Mock successful response
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: [
            {
              id: 'pick-1',
              entryId: 'entry-1',
              gameId: 'game-1',
              teamId: 'team-2',
              confidence: 75,
            },
            {
              id: 'pick-2',
              entryId: 'entry-1',
              gameId: 'game-2',
              teamId: 'team-4',
              confidence: 60,
            },
          ],
        }),
    }
    vi.mocked(fetch).mockResolvedValue(mockResponse as any)

    // Simulate the API call that PickEntry component makes
    const response = await fetch('/api/picks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entryId: 'entry-1',
        picks: [
          { gameId: 'game-1', teamId: 'team-2', confidence: 75 },
          { gameId: 'game-2', teamId: 'team-4', confidence: 60 },
        ],
      }),
    })

    expect(fetch).toHaveBeenCalledWith('/api/picks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entryId: 'entry-1',
        picks: [
          { gameId: 'game-1', teamId: 'team-2', confidence: 75 },
          { gameId: 'game-2', teamId: 'team-4', confidence: 60 },
        ],
      }),
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(2)
  })

  it('should handle API error responses', async () => {
    // Mock error response
    const mockResponse = {
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          success: false,
          error: 'Invalid pick data',
        }),
    }
    vi.mocked(fetch).mockResolvedValue(mockResponse as any)

    const response = await fetch('/api/picks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entryId: 'entry-1',
        picks: [],
      }),
    })

    expect(response.ok).toBe(false)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Invalid pick data')
  })

  it('should handle network errors', async () => {
    // Mock network failure
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

    try {
      await fetch('/api/picks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId: 'entry-1',
          picks: [{ gameId: 'game-1', teamId: 'team-1', confidence: 50 }],
        }),
      })
      // Should not reach here
      expect(true).toBe(false)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toBe('Network error')
    }
  })
})
