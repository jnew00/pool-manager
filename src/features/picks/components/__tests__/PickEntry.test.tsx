import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PickEntry } from '../PickEntry'
import type { GameWithTeams } from '@/server/services/game.service'
import type { Pool } from '@/lib/types/database'

// Mock game data
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

const mockATSPool: Pool = {
  id: 'pool-1',
  name: 'ATS Pool',
  type: 'ATS',
  season: 2024,
  buyIn: 50,
  maxEntries: 10,
  isActive: true,
  description: 'Against the spread pool',
  rules: null,
}

const mockSurvivorPool: Pool = {
  id: 'pool-2',
  name: 'Survivor Pool',
  type: 'SURVIVOR',
  season: 2024,
  buyIn: 100,
  maxEntries: 1,
  isActive: true,
  description: 'Survivor pool',
  rules: null,
}

const mockPointsPlusPool: Pool = {
  id: 'pool-3',
  name: 'Points Plus Pool',
  type: 'POINTS_PLUS',
  season: 2024,
  buyIn: 75,
  maxEntries: 5,
  isActive: true,
  description: 'Points Plus pool',
  rules: null,
}

// Mock the API fetch
global.fetch = vi.fn()

describe('PickEntry', () => {
  const mockOnPicksSubmitted = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    } as Response)
  })

  it('renders game list for ATS pool', () => {
    render(
      <PickEntry
        pool={mockATSPool}
        games={mockGames}
        entryId="entry-1"
        onPicksSubmitted={mockOnPicksSubmitted}
      />
    )

    expect(screen.getByText(/week 1 picks/i)).toBeInTheDocument()
    expect(
      screen.getByText('Buffalo Bills @ New York Jets')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Green Bay Packers @ Chicago Bears')
    ).toBeInTheDocument()
  })

  it('allows selecting team and confidence for ATS pool', async () => {
    const user = userEvent.setup()
    render(
      <PickEntry
        pool={mockATSPool}
        games={mockGames}
        entryId="entry-1"
        onPicksSubmitted={mockOnPicksSubmitted}
      />
    )

    // Select BUF team for first game
    await user.click(screen.getByLabelText(/buffalo bills/i))

    // Set confidence level
    const confidenceSlider = screen.getByLabelText(
      /confidence for buffalo bills/i
    )
    fireEvent.change(confidenceSlider, { target: { value: '75' } })

    expect(confidenceSlider).toHaveValue('75')
  })

  it('validates required picks for ATS pool before submission', async () => {
    const user = userEvent.setup()
    render(
      <PickEntry
        pool={mockATSPool}
        games={mockGames}
        entryId="entry-1"
        onPicksSubmitted={mockOnPicksSubmitted}
      />
    )

    // Try to submit without making any picks
    await user.click(screen.getByRole('button', { name: /submit picks/i }))

    expect(
      screen.getByText(/please make at least one pick/i)
    ).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('submits picks for ATS pool with valid data', async () => {
    const user = userEvent.setup()
    render(
      <PickEntry
        pool={mockATSPool}
        games={mockGames}
        entryId="entry-1"
        onPicksSubmitted={mockOnPicksSubmitted}
      />
    )

    // Make picks for both games
    await user.click(screen.getByLabelText(/buffalo bills/i))
    fireEvent.change(screen.getByLabelText(/confidence for buffalo bills/i), {
      target: { value: '75' },
    })

    await user.click(screen.getByLabelText(/green bay packers/i))
    fireEvent.change(
      screen.getByLabelText(/confidence for green bay packers/i),
      { target: { value: '60' } }
    )

    // Submit picks
    await user.click(screen.getByRole('button', { name: /submit picks/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/picks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId: 'entry-1',
          picks: [
            {
              gameId: 'game-1',
              teamId: 'team-2',
              confidence: 75,
            },
            {
              gameId: 'game-2',
              teamId: 'team-4',
              confidence: 60,
            },
          ],
        }),
      })
    })

    expect(mockOnPicksSubmitted).toHaveBeenCalled()
  })

  it('enforces single pick per week for Survivor pool', () => {
    render(
      <PickEntry
        pool={mockSurvivorPool}
        games={mockGames}
        entryId="entry-1"
        onPicksSubmitted={mockOnPicksSubmitted}
      />
    )

    expect(
      screen.getByText(/select one team to survive this week/i)
    ).toBeInTheDocument()
  })

  it('allows only one selection for Survivor pool', async () => {
    const user = userEvent.setup()
    render(
      <PickEntry
        pool={mockSurvivorPool}
        games={mockGames}
        entryId="entry-1"
        onPicksSubmitted={mockOnPicksSubmitted}
      />
    )

    // Select first team
    await user.click(screen.getByLabelText(/buffalo bills/i))

    // Try to select second team - should replace first selection
    await user.click(screen.getByLabelText(/green bay packers/i))

    // Only the second selection should be active
    expect(screen.getByLabelText(/buffalo bills/i)).not.toBeChecked()
    expect(screen.getByLabelText(/green bay packers/i)).toBeChecked()
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()

    // Mock slow API response
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ success: true }),
              } as Response),
            100
          )
        )
    )

    render(
      <PickEntry
        pool={mockATSPool}
        games={mockGames}
        entryId="entry-1"
        onPicksSubmitted={mockOnPicksSubmitted}
      />
    )

    // Make a pick
    await user.click(screen.getByLabelText(/buffalo bills/i))

    // Submit
    await user.click(screen.getByRole('button', { name: /submit picks/i }))

    expect(screen.getByText(/submitting picks/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /submitting picks/i })
    ).toBeDisabled()
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          error: 'Invalid pick data',
        }),
    } as Response)

    render(
      <PickEntry
        pool={mockATSPool}
        games={mockGames}
        entryId="entry-1"
        onPicksSubmitted={mockOnPicksSubmitted}
      />
    )

    // Make a pick and submit
    await user.click(screen.getByLabelText(/buffalo bills/i))
    await user.click(screen.getByRole('button', { name: /submit picks/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid pick data/i)).toBeInTheDocument()
    })

    expect(mockOnPicksSubmitted).not.toHaveBeenCalled()
  })

  it('validates minimum picks for Points Plus pool', async () => {
    const user = userEvent.setup()
    render(
      <PickEntry
        pool={mockPointsPlusPool}
        games={mockGames}
        entryId="entry-1"
        onPicksSubmitted={mockOnPicksSubmitted}
      />
    )

    expect(
      screen.getByText(
        /pick at least 4 games with equal favorites and underdogs/i
      )
    ).toBeInTheDocument()

    // Try to submit with only 2 picks
    await user.click(screen.getByLabelText(/buffalo bills/i))
    await user.click(screen.getByLabelText(/green bay packers/i))
    await user.click(screen.getByRole('button', { name: /submit picks/i }))

    expect(
      screen.getByText(/points plus pools require at least 4 picks/i)
    ).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows appropriate instructions for different pool types', () => {
    const { rerender } = render(
      <PickEntry
        pool={mockATSPool}
        games={mockGames}
        entryId="entry-1"
        onPicksSubmitted={mockOnPicksSubmitted}
      />
    )
    expect(screen.getByText(/pick against the spread/i)).toBeInTheDocument()

    rerender(
      <PickEntry
        pool={mockSurvivorPool}
        games={mockGames}
        entryId="entry-1"
        onPicksSubmitted={mockOnPicksSubmitted}
      />
    )
    expect(
      screen.getByText(/select one team to survive this week/i)
    ).toBeInTheDocument()

    rerender(
      <PickEntry
        pool={mockPointsPlusPool}
        games={mockGames}
        entryId="entry-1"
        onPicksSubmitted={mockOnPicksSubmitted}
      />
    )
    expect(
      screen.getByText(
        /pick at least 4 games with equal favorites and underdogs/i
      )
    ).toBeInTheDocument()
  })
})
