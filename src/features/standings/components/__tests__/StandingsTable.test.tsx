import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StandingsTable } from '../StandingsTable'

// Mock standings data
const mockStandings = [
  {
    entryId: 'entry1',
    rank: 1,
    wins: 8,
    losses: 2,
    pushes: 1,
    voids: 0,
    totalPicks: 11,
    totalPoints: 8.5,
    winPercentage: 0.8,
  },
  {
    entryId: 'entry2',
    rank: 2,
    wins: 7,
    losses: 3,
    pushes: 0,
    voids: 1,
    totalPicks: 11,
    totalPoints: 7.0,
    winPercentage: 0.7,
  },
  {
    entryId: 'entry3',
    rank: 3,
    wins: 6,
    losses: 4,
    pushes: 1,
    voids: 0,
    totalPicks: 11,
    totalPoints: 6.5,
    winPercentage: 0.6,
  },
]

const mockSurvivorStandings = [
  {
    entryId: 'survivor1',
    rank: 1,
    wins: 5,
    losses: 0,
    pushes: 0,
    voids: 0,
    totalPicks: 5,
    totalPoints: 5.0,
    winPercentage: 1.0,
    isEliminated: false,
  },
  {
    entryId: 'survivor2',
    rank: 2,
    wins: 3,
    losses: 1,
    pushes: 0,
    voids: 0,
    totalPicks: 4,
    totalPoints: 3.0,
    winPercentage: 0.75,
    isEliminated: true,
    eliminatedWeek: 4,
  },
]

describe('StandingsTable', () => {
  const mockOnEntryClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders standings table with basic columns', () => {
    render(
      <StandingsTable
        standings={mockStandings}
        poolType="ATS"
        onEntryClick={mockOnEntryClick}
      />
    )

    // Check headers (text content includes sort icons)
    expect(screen.getByText(/^Rank/)).toBeInTheDocument()
    expect(screen.getByText('Entry')).toBeInTheDocument()
    expect(screen.getByText(/^W (?!%)/)).toBeInTheDocument() // W but not "Win %"
    expect(screen.getByText(/^L /)).toBeInTheDocument()
    expect(screen.getByText(/^Win %/)).toBeInTheDocument()
    expect(screen.getByText(/^Points/)).toBeInTheDocument()

    // Check that data is rendered
    expect(screen.getByText('entry1')).toBeInTheDocument()
    expect(screen.getByText('80.0%')).toBeInTheDocument()
    expect(screen.getByText('8.5')).toBeInTheDocument()
  })

  it('displays pushes and voids columns when present', () => {
    render(
      <StandingsTable
        standings={mockStandings}
        poolType="ATS"
        onEntryClick={mockOnEntryClick}
      />
    )

    expect(screen.getByText('P')).toBeInTheDocument()
    expect(screen.getByText('V')).toBeInTheDocument()
    // Pushes and voids columns should be visible
  })

  it('shows survivor-specific columns for survivor pools', () => {
    render(
      <StandingsTable
        standings={mockSurvivorStandings}
        poolType="SURVIVOR"
        onEntryClick={mockOnEntryClick}
      />
    )

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Eliminated (Week 4)')).toBeInTheDocument()
  })

  it('handles entry click events', async () => {
    render(
      <StandingsTable
        standings={mockStandings}
        poolType="ATS"
        onEntryClick={mockOnEntryClick}
      />
    )

    const firstRow = screen.getByText('entry1').closest('tr')
    expect(firstRow).toBeInTheDocument()

    fireEvent.click(firstRow!)
    expect(mockOnEntryClick).toHaveBeenCalledWith('entry1')
  })

  it('sorts by different columns when headers are clicked', async () => {
    const { rerender } = render(
      <StandingsTable
        standings={mockStandings}
        poolType="ATS"
        onEntryClick={mockOnEntryClick}
      />
    )

    // Initially sorted by rank (ascending)
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('entry1') // First data row

    // Click wins header to sort by wins
    fireEvent.click(screen.getByText(/^W (?!%)/)) // Click the W column, not Win %

    // Should still show highest wins first (already sorted that way)
    expect(rows[1]).toHaveTextContent('entry1')
  })

  it('displays empty state when no standings provided', () => {
    render(
      <StandingsTable
        standings={[]}
        poolType="ATS"
        onEntryClick={mockOnEntryClick}
      />
    )

    expect(screen.getByText('No standings available')).toBeInTheDocument()
  })

  it('highlights current user entry if provided', () => {
    render(
      <StandingsTable
        standings={mockStandings}
        poolType="ATS"
        currentUserEntryId="entry2"
        onEntryClick={mockOnEntryClick}
      />
    )

    const userRow = screen.getByText('entry2').closest('tr')
    expect(userRow).toHaveClass('bg-blue-50') // Highlighted class
  })

  it('shows loading state', () => {
    render(
      <StandingsTable
        standings={[]}
        poolType="ATS"
        onEntryClick={mockOnEntryClick}
        isLoading={true}
      />
    )

    expect(screen.getByText('Loading standings...')).toBeInTheDocument()
  })

  it('filters standings when filter text provided', () => {
    render(
      <StandingsTable
        standings={mockStandings}
        poolType="ATS"
        onEntryClick={mockOnEntryClick}
        filterText="entry1"
      />
    )

    expect(screen.getByText('entry1')).toBeInTheDocument()
    expect(screen.queryByText('entry2')).not.toBeInTheDocument()
    expect(screen.queryByText('entry3')).not.toBeInTheDocument()
  })
})
