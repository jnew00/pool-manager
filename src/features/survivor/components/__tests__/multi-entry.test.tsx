import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MultiEntryManager from '../MultiEntryManager'

// Mock fetch
global.fetch = vi.fn()

describe('MultiEntryManager', () => {
  const mockProps = {
    poolId: 'pool-123',
    userId: 'user-456',
    currentWeek: 8,
    maxEntries: 5,
  }

  const mockEntries = [
    {
      id: 'entry-1',
      name: 'Entry 1',
      isActive: true,
      strikes: 0,
      currentPick: {
        week: 8,
        teamId: 'KC',
        teamAbbr: 'KC',
        winProbability: 0.75,
      },
      usedTeams: ['BUF', 'DAL', 'SF'],
      strategy: 'BALANCED',
      survivalProbability: 0.82,
    },
    {
      id: 'entry-2',
      name: 'Entry 2',
      isActive: true,
      strikes: 1,
      currentPick: {
        week: 8,
        teamId: 'PHI',
        teamAbbr: 'PHI',
        winProbability: 0.68,
      },
      usedTeams: ['KC', 'MIA', 'BAL'],
      strategy: 'CONTRARIAN',
      survivalProbability: 0.65,
    },
    {
      id: 'entry-3',
      name: 'Entry 3',
      isActive: false,
      eliminatedWeek: 6,
      strikes: 2,
      usedTeams: ['GB', 'LAR'],
      strategy: 'AGGRESSIVE',
      survivalProbability: 0,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockEntries,
    })
  })

  it('renders multi-entry manager with entries', async () => {
    render(<MultiEntryManager {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('Multi-Entry Manager')).toBeInTheDocument()
      expect(screen.getByText('2 / 3 Active')).toBeInTheDocument()
    })

    // Check entry cards are displayed
    expect(screen.getByText('Entry 1')).toBeInTheDocument()
    expect(screen.getByText('Entry 2')).toBeInTheDocument()
    expect(screen.getByText('Entry 3')).toBeInTheDocument()

    // Check active/eliminated status
    expect(screen.getAllByText('Active')).toHaveLength(2)
    expect(screen.getByText('Eliminated W6')).toBeInTheDocument()
  })

  it('calculates diversity score correctly', async () => {
    render(<MultiEntryManager {...mockProps} />)

    await waitFor(() => {
      // With 2 active entries having different picks (KC and PHI)
      // Diversity score should be 100%
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  it('creates new entry when button clicked', async () => {
    render(<MultiEntryManager {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('New Entry')).toBeInTheDocument()
    })

    const newEntryBtn = screen.getByText('New Entry').closest('button')
    fireEvent.click(newEntryBtn!)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/survivor/entries',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            poolId: 'pool-123',
            userId: 'user-456',
            name: 'Entry 4',
          }),
        })
      )
    })
  })

  it('selects and deselects entries', async () => {
    render(<MultiEntryManager {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('Entry 1')).toBeInTheDocument()
    })

    // Find checkboxes
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(3)

    // Click first checkbox
    fireEvent.click(checkboxes[0])

    await waitFor(() => {
      expect(screen.getByText('1 selected')).toBeInTheDocument()
    })

    // Click second checkbox
    fireEvent.click(checkboxes[1])

    await waitFor(() => {
      expect(screen.getByText('2 selected')).toBeInTheDocument()
    })

    // Clear selection
    const clearBtn = screen.getByText('Clear')
    fireEvent.click(clearBtn)

    await waitFor(() => {
      expect(screen.getByText('0 selected')).toBeInTheDocument()
    })
  })

  it('applies block diversification strategy', async () => {
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/survivor/diversify')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            type: 'BLOCK',
            description: 'Each entry picks a different team',
            entries: [
              { entryId: 'entry-1', week: 8, teamId: 'KC', teamAbbr: 'KC' },
              { entryId: 'entry-2', week: 8, teamId: 'BUF', teamAbbr: 'BUF' },
            ],
          }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => mockEntries,
      })
    })

    render(<MultiEntryManager {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('Entry 1')).toBeInTheDocument()
    })

    // Select entries
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])

    // Apply diversification
    const blockBtn = screen.getByText('Block Diversify')
    fireEvent.click(blockBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/survivor/diversify',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('BLOCK'),
        })
      )
    })

    // Check diversification result displayed
    await waitFor(() => {
      expect(screen.getByText('Diversification Applied')).toBeInTheDocument()
      expect(screen.getByText('Entry 1 → KC')).toBeInTheDocument()
      expect(screen.getByText('Entry 2 → BUF')).toBeInTheDocument()
    })
  })

  it('shows comparison view when toggled', async () => {
    render(<MultiEntryManager {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('Show Comparison')).toBeInTheDocument()
    })

    const compareBtn = screen.getByText('Show Comparison')
    fireEvent.click(compareBtn)

    await waitFor(() => {
      expect(screen.getByText('Entry Comparison - Week 8')).toBeInTheDocument()
      expect(screen.getByText('Pick Overlap Analysis')).toBeInTheDocument()
    })

    // Check comparison table headers
    expect(screen.getByText('Win %')).toBeInTheDocument()
    expect(screen.getByText('Strategy')).toBeInTheDocument()
    expect(screen.getByText('Strikes')).toBeInTheDocument()
    expect(screen.getByText('Teams Used')).toBeInTheDocument()
    expect(screen.getByText('Survival %')).toBeInTheDocument()
  })

  it('copies picks from one entry to others', async () => {
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/survivor/copy-picks')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            copiedTo: ['entry-2'],
            failed: [],
            pick: {
              week: 8,
              teamId: 'KC',
              teamAbbr: 'KC',
              teamName: 'Kansas City Chiefs',
            },
          }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => mockEntries,
      })
    })

    render(<MultiEntryManager {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('Entry 1')).toBeInTheDocument()
    })

    // Select target entry
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1]) // Select Entry 2

    // Find and click copy button for Entry 1
    const copyButtons = screen.getAllByText('Copy')
    fireEvent.click(copyButtons[0])

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/survivor/copy-picks',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('entry-1'),
        })
      )
    })
  })

  it('prevents selecting eliminated entries', async () => {
    render(<MultiEntryManager {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('Entry 3')).toBeInTheDocument()
    })

    // Third checkbox should be disabled (eliminated entry)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[2]).toBeDisabled()
  })

  it('displays quick stats correctly', async () => {
    render(<MultiEntryManager {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument() // Total entries
      expect(screen.getByText('2')).toBeInTheDocument() // Active entries
      expect(screen.getByText('1')).toBeInTheDocument() // Eliminated entries
      expect(screen.getByText('100%')).toBeInTheDocument() // Diversity score
    })
  })
})
