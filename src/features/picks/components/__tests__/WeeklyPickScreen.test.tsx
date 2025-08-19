import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WeeklyPickScreen } from '../WeeklyPickScreen'
import type { GameWithTeams } from '@/server/services/game.service'
import type { Pool, Entry } from '@/lib/types/database'

// Mock the API calls
global.fetch = vi.fn()

const mockGames: GameWithTeams[] = [
  {
    id: 'game-1',
    season: 2024,
    week: 1,
    kickoff: new Date('2024-09-08T13:00:00Z'),
    status: 'SCHEDULED',
    homeTeamId: 'team-1',
    awayTeamId: 'team-2',
    venue: 'MetLife Stadium',
    lat: null,
    lon: null,
    apiRefs: null,
    homeTeam: {
      id: 'team-1',
      nflAbbr: 'NYJ',
      name: 'New York Jets',
    },
    awayTeam: {
      id: 'team-2',
      nflAbbr: 'BUF',
      name: 'Buffalo Bills',
    },
  },
  {
    id: 'game-2',
    season: 2024,
    week: 1,
    kickoff: new Date('2024-09-08T16:00:00Z'),
    status: 'SCHEDULED',
    homeTeamId: 'team-3',
    awayTeamId: 'team-4',
    venue: 'Soldier Field',
    lat: null,
    lon: null,
    apiRefs: null,
    homeTeam: {
      id: 'team-3',
      nflAbbr: 'CHI',
      name: 'Chicago Bears',
    },
    awayTeam: {
      id: 'team-4',
      nflAbbr: 'GB',
      name: 'Green Bay Packers',
    },
  },
]

const mockPool: Pool = {
  id: 'pool-1',
  name: 'Test ATS Pool',
  type: 'ATS',
  season: 2024,
  buyIn: 50,
  maxEntries: 10,
  isActive: true,
  description: 'Test pool',
  rules: null,
}

const mockEntry: Entry = {
  id: 'entry-1',
  poolId: 'pool-1',
  userId: 'user-1',
  name: 'Test Entry',
  season: 2024,
  isPaid: true,
  isActive: true,
}

describe('WeeklyPickScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful responses by default
    vi.mocked(fetch).mockImplementation((url) => {
      if (url === '/api/games?season=2024&week=1') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockGames }),
        } as Response)
      }
      if (url === '/api/picks?entryId=entry-1') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [] }),
        } as Response)
      }
      if (url === '/api/picks' && arguments[1]?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as Response)
      }
      return Promise.reject(new Error('Unexpected fetch call'))
    })
  })

  it('renders weekly pick screen with loading state', async () => {
    // Mock slow API response for games
    vi.mocked(fetch).mockImplementation((url) => {
      if (url === '/api/games?season=2024&week=1') {
        return new Promise(() => {}) // Never resolves
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response)
    })

    render(
      <WeeklyPickScreen
        pool={mockPool}
        entry={mockEntry}
        season={2024}
        week={1}
      />
    )

    expect(screen.getByText(/loading games/i)).toBeInTheDocument()
  })

  it('renders games and pick entry interface after loading', async () => {
    render(
      <WeeklyPickScreen
        pool={mockPool}
        entry={mockEntry}
        season={2024}
        week={1}
      />
    )

    // Wait for games to load - looking for the H1 heading, not the duplicate H2
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /week 1 picks/i })
      ).toBeInTheDocument()
    })

    expect(
      screen.getByText('Buffalo Bills @ New York Jets')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Green Bay Packers @ Chicago Bears')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /submit picks/i })
    ).toBeInTheDocument()
  })

  it('handles API error when loading games', async () => {
    vi.mocked(fetch).mockImplementation((url) => {
      if (url === '/api/games?season=2024&week=1') {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () =>
            Promise.resolve({ success: false, error: 'Server error' }),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response)
    })

    render(
      <WeeklyPickScreen
        pool={mockPool}
        entry={mockEntry}
        season={2024}
        week={1}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/failed to load games/i)).toBeInTheDocument()
    })
  })

  it('displays existing picks when entry has previous picks', async () => {
    const existingPicks = [
      {
        id: 'pick-1',
        entryId: 'entry-1',
        gameId: 'game-1',
        teamId: 'team-2',
        confidence: 75,
        isCorrect: null,
        points: null,
        createdAt: '2024-09-01T00:00:00Z',
      },
    ]

    vi.mocked(fetch).mockImplementation((url) => {
      if (url === '/api/games?season=2024&week=1') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockGames }),
        } as Response)
      }
      if (url === '/api/picks?entryId=entry-1') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: existingPicks }),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response)
    })

    render(
      <WeeklyPickScreen
        pool={mockPool}
        entry={mockEntry}
        season={2024}
        week={1}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /week 1 picks/i })
      ).toBeInTheDocument()
    })

    // Should show existing picks indicator
    expect(
      screen.getByText(/you have existing picks for this week/i)
    ).toBeInTheDocument()
  })

  it('handles different pool types correctly', async () => {
    const survivorPool = { ...mockPool, type: 'SURVIVOR' as const }

    render(
      <WeeklyPickScreen
        pool={survivorPool}
        entry={mockEntry}
        season={2024}
        week={1}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText(/select one team to survive this week/i)
      ).toBeInTheDocument()
    })
  })

  it('shows week navigation and pool information', async () => {
    render(
      <WeeklyPickScreen
        pool={mockPool}
        entry={mockEntry}
        season={2024}
        week={1}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /week 1 picks/i })
      ).toBeInTheDocument()
    })

    expect(screen.getByText(mockPool.name)).toBeInTheDocument()
    expect(screen.getByText(mockEntry.name)).toBeInTheDocument()
  })

  it('refreshes picks after successful submission', async () => {
    const user = userEvent.setup()

    render(
      <WeeklyPickScreen
        pool={mockPool}
        entry={mockEntry}
        season={2024}
        week={1}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /week 1 picks/i })
      ).toBeInTheDocument()
    })

    // Make a pick and submit
    await user.click(screen.getByLabelText(/buffalo bills/i))
    await user.click(screen.getByRole('button', { name: /submit picks/i }))

    // Should call API to refresh picks after submission
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/picks?entryId=entry-1')
    })
  })

  it('handles empty games list gracefully', async () => {
    vi.mocked(fetch).mockImplementation((url) => {
      if (url === '/api/games?season=2024&week=1') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [] }),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response)
    })

    render(
      <WeeklyPickScreen
        pool={mockPool}
        entry={mockEntry}
        season={2024}
        week={1}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText(/no games available for week 1/i)
      ).toBeInTheDocument()
    })
  })
})
