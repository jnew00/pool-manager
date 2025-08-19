import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EntryDetailView } from '../EntryDetailView'

// Mock entry detail data
const mockEntryDetail = {
  entry: {
    id: 'entry-123',
    poolId: 'pool-456',
    season: 2024,
  },
  standing: {
    entryId: 'entry-123',
    rank: 3,
    wins: 12,
    losses: 6,
    pushes: 2,
    voids: 1,
    totalPicks: 21,
    totalPoints: 12.5,
    winPercentage: 0.667,
  },
  picks: [
    {
      id: 'pick-1',
      gameId: 'game-1',
      teamId: 'team-home',
      confidence: 75,
      outcome: 'WIN' as const,
      points: 1.0,
      week: 1,
      game: {
        homeTeam: { nflAbbr: 'KC', name: 'Kansas City Chiefs' },
        awayTeam: { nflAbbr: 'BUF', name: 'Buffalo Bills' },
        kickoff: new Date('2024-09-10T20:20:00Z'),
      },
      team: { nflAbbr: 'KC', name: 'Kansas City Chiefs' },
      grade: {
        outcome: 'WIN' as const,
        points: 1.0,
      },
    },
    {
      id: 'pick-2',
      gameId: 'game-2',
      teamId: 'team-away',
      confidence: 90,
      outcome: 'LOSS' as const,
      points: 0.0,
      week: 1,
      game: {
        homeTeam: { nflAbbr: 'LAR', name: 'Los Angeles Rams' },
        awayTeam: { nflAbbr: 'SF', name: 'San Francisco 49ers' },
        kickoff: new Date('2024-09-10T21:15:00Z'),
      },
      team: { nflAbbr: 'SF', name: 'San Francisco 49ers' },
      grade: {
        outcome: 'LOSS' as const,
        points: 0.0,
      },
    },
    {
      id: 'pick-3',
      gameId: 'game-3',
      teamId: 'team-home',
      confidence: 80,
      outcome: 'PUSH' as const,
      points: 0.5,
      week: 2,
      game: {
        homeTeam: { nflAbbr: 'DAL', name: 'Dallas Cowboys' },
        awayTeam: { nflAbbr: 'NYG', name: 'New York Giants' },
        kickoff: new Date('2024-09-17T20:20:00Z'),
      },
      team: { nflAbbr: 'DAL', name: 'Dallas Cowboys' },
      grade: {
        outcome: 'PUSH' as const,
        points: 0.5,
      },
    },
  ],
  weeklyResults: [
    {
      week: 1,
      wins: 1,
      losses: 1,
      pushes: 0,
      voids: 0,
      totalPoints: 1.0,
    },
    {
      week: 2,
      wins: 0,
      losses: 0,
      pushes: 1,
      voids: 0,
      totalPoints: 0.5,
    },
  ],
}

const mockSurvivorDetail = {
  ...mockEntryDetail,
  standing: {
    ...mockEntryDetail.standing,
    isEliminated: true,
    eliminatedWeek: 3,
  },
}

describe('EntryDetailView', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders entry overview with standing information', () => {
    render(
      <EntryDetailView
        entryDetail={mockEntryDetail}
        poolType="ATS"
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Entry Details')).toBeInTheDocument()
    expect(screen.getByText('entry-123')).toBeInTheDocument()
    expect(screen.getByText('Rank: 3')).toBeInTheDocument()
    expect(screen.getByText('12-6')).toBeInTheDocument() // W-L record
    expect(screen.getByText('66.7%')).toBeInTheDocument() // Win percentage
    expect(screen.getByText('12.5')).toBeInTheDocument() // Total points
  })

  it('displays weekly performance chart', () => {
    render(
      <EntryDetailView
        entryDetail={mockEntryDetail}
        poolType="ATS"
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Weekly Performance')).toBeInTheDocument()

    // Check weekly stats in performance section
    expect(screen.getByText('1-1')).toBeInTheDocument() // Week 1 record
    expect(screen.getByText('0-0-1')).toBeInTheDocument() // Week 2 record (with push)

    // Check that both weekly point totals exist (they appear in multiple places)
    const pointsElements = screen.getAllByText('1.0 pts')
    expect(pointsElements.length).toBeGreaterThan(0)
    const pushPointsElements = screen.getAllByText('0.5 pts')
    expect(pushPointsElements.length).toBeGreaterThan(0)
  })

  it('shows detailed pick history', () => {
    render(
      <EntryDetailView
        entryDetail={mockEntryDetail}
        poolType="ATS"
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Pick History')).toBeInTheDocument()

    // Check game details (format is away @ home)
    expect(screen.getByText('BUF @ KC')).toBeInTheDocument()
    expect(screen.getByText('SF @ LAR')).toBeInTheDocument()
    expect(screen.getByText('NYG @ DAL')).toBeInTheDocument()

    // Check outcomes
    expect(screen.getByText('WIN')).toBeInTheDocument()
    expect(screen.getByText('LOSS')).toBeInTheDocument()
    expect(screen.getByText('PUSH')).toBeInTheDocument()

    // Check confidence levels in pick details
    expect(screen.getByText('Picked: KC • Confidence: 75%')).toBeInTheDocument()
    expect(screen.getByText('Picked: SF • Confidence: 90%')).toBeInTheDocument()
    expect(
      screen.getByText('Picked: DAL • Confidence: 80%')
    ).toBeInTheDocument()
  })

  it('groups picks by week in chronological order', () => {
    render(
      <EntryDetailView
        entryDetail={mockEntryDetail}
        poolType="ATS"
        onClose={mockOnClose}
      />
    )

    // Look for week headers in the pick history section (h4 elements)
    const weekHeaders = screen.getAllByRole('heading', { level: 4 })
    expect(weekHeaders).toHaveLength(2)
    expect(weekHeaders[0]).toHaveTextContent('Week 1')
    expect(weekHeaders[1]).toHaveTextContent('Week 2')
  })

  it('shows survivor elimination status', () => {
    render(
      <EntryDetailView
        entryDetail={mockSurvivorDetail}
        poolType="SURVIVOR"
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Eliminated')).toBeInTheDocument()
    expect(screen.getByText('Week 3')).toBeInTheDocument()
  })

  it('filters picks by week when week filter is applied', async () => {
    render(
      <EntryDetailView
        entryDetail={mockEntryDetail}
        poolType="ATS"
        onClose={mockOnClose}
      />
    )

    // Click week filter
    const weekFilter = screen.getByRole('combobox', { name: /filter by week/i })
    fireEvent.change(weekFilter, { target: { value: '1' } })

    // Should only show Week 1 picks (away @ home format)
    expect(screen.getByText('BUF @ KC')).toBeInTheDocument()
    expect(screen.getByText('SF @ LAR')).toBeInTheDocument()
    expect(screen.queryByText('NYG @ DAL')).not.toBeInTheDocument()
  })

  it('filters picks by outcome when outcome filter is applied', async () => {
    render(
      <EntryDetailView
        entryDetail={mockEntryDetail}
        poolType="ATS"
        onClose={mockOnClose}
      />
    )

    // Click outcome filter
    const outcomeFilter = screen.getByRole('combobox', {
      name: /filter by outcome/i,
    })
    fireEvent.change(outcomeFilter, { target: { value: 'WIN' } })

    // Should only show winning picks (away @ home format)
    expect(screen.getByText('BUF @ KC')).toBeInTheDocument()
    expect(screen.queryByText('SF @ LAR')).not.toBeInTheDocument()
    expect(screen.queryByText('NYG @ DAL')).not.toBeInTheDocument()
  })

  it('shows loading state when loading', () => {
    render(
      <EntryDetailView
        entryDetail={null}
        poolType="ATS"
        onClose={mockOnClose}
        isLoading={true}
      />
    )

    expect(screen.getByText('Loading entry details...')).toBeInTheDocument()
  })

  it('shows error state when error occurs', () => {
    render(
      <EntryDetailView
        entryDetail={null}
        poolType="ATS"
        onClose={mockOnClose}
        error="Failed to load entry details"
      />
    )

    expect(screen.getByText('Failed to load entry details')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    render(
      <EntryDetailView
        entryDetail={mockEntryDetail}
        poolType="ATS"
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('displays statistics summary', () => {
    render(
      <EntryDetailView
        entryDetail={mockEntryDetail}
        poolType="ATS"
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Statistics')).toBeInTheDocument()
    expect(screen.getByText('Total Picks: 21')).toBeInTheDocument()
    expect(screen.getByText('Wins: 12')).toBeInTheDocument()
    expect(screen.getByText('Losses: 6')).toBeInTheDocument()
    expect(screen.getByText('Pushes: 2')).toBeInTheDocument()
    expect(screen.getByText('Voids: 1')).toBeInTheDocument()
  })
})
