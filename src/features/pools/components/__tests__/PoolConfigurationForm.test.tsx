import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PoolConfigurationForm } from '../PoolConfigurationForm'
import type { Pool } from '@/lib/types/database'

// Mock the API calls
global.fetch = vi.fn()

const mockPool: Pool = {
  id: 'pool-1',
  name: 'Test Pool',
  type: 'ATS',
  season: 2024,
  buyIn: 50,
  maxEntries: 10,
  isActive: true,
  description: 'Test pool description',
  rules: {
    lockDeadline: 'game_time',
    pushHandling: 'half_point',
    minGames: 4,
    requireEqualFavUnderdogs: false,
    allowPickEm: true,
  },
}

describe('PoolConfigurationForm', () => {
  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockPool }),
    } as Response)
  })

  it('renders pool configuration form with existing values', () => {
    render(
      <PoolConfigurationForm
        pool={mockPool}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByDisplayValue('Test Pool')).toBeInTheDocument()
    expect(
      screen.getByDisplayValue('Test pool description')
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue('50')).toBeInTheDocument()
    expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: /lock deadline/i })
    ).toHaveValue('game_time')
    expect(
      screen.getByRole('combobox', { name: /push handling/i })
    ).toHaveValue('half_point')

    // Check that pool type is properly set (even though disabled)
    const typeSelect = screen.getByRole('combobox', { name: /pool type/i })
    expect(typeSelect).toHaveValue('ATS')
    expect(typeSelect).toBeDisabled()
  })

  it('renders form for creating new pool', () => {
    render(
      <PoolConfigurationForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    expect(
      screen.getByRole('heading', { name: /create new pool/i })
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/pool name/i)).toHaveValue('')
    expect(screen.getByLabelText(/buy-in amount/i)).toHaveValue(0)
    expect(screen.getByRole('combobox', { name: /pool type/i })).toHaveValue('')
  })

  it('handles form submission for existing pool', async () => {
    const user = userEvent.setup()

    render(
      <PoolConfigurationForm
        pool={mockPool}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    // Verify initial values are loaded correctly
    expect(screen.getByDisplayValue('Test Pool')).toBeInTheDocument()

    // Update pool name
    const nameInput = screen.getByLabelText(/pool name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Pool Name')

    // Update buy-in
    const buyInInput = screen.getByLabelText(/buy-in amount/i)
    await user.clear(buyInInput)
    await user.type(buyInInput, '75')

    // Submit form using fireEvent.submit directly
    const form = screen.getByRole('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })

    expect(mockOnSave).toHaveBeenCalled()
  })

  it('handles form submission for new pool', async () => {
    const user = userEvent.setup()

    render(
      <PoolConfigurationForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    // Fill in required fields
    await user.type(screen.getByLabelText(/pool name/i), 'New Pool')
    await user.selectOptions(
      screen.getByRole('combobox', { name: /pool type/i }),
      'SURVIVOR'
    )

    // Set the season field
    const seasonInput = screen.getByLabelText(/season/i)
    fireEvent.change(seasonInput, { target: { value: '2024' } })

    await user.type(screen.getByLabelText(/buy-in amount/i), '100')

    // Set the max entries field
    const maxEntriesInput = screen.getByLabelText(/max entries/i)
    fireEvent.change(maxEntriesInput, { target: { value: '1' } })

    // Submit form
    const form = screen.getByRole('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Pool',
          type: 'SURVIVOR',
          season: 2024,
          buyIn: 100,
          maxEntries: 1,
          description: '',
          isActive: true,
          rules: {
            lockDeadline: 'game_time',
            pushHandling: 'half_point',
            minGames: 4,
            requireEqualFavUnderdogs: false,
            allowPickEm: true,
            noRepeats: true,
            eliminationOnLoss: true,
          },
        }),
      })
    })

    expect(mockOnSave).toHaveBeenCalled()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()

    render(
      <PoolConfigurationForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    // Try to submit without filling required fields
    const form = screen.getByRole('form')
    fireEvent.submit(form)

    expect(screen.getByText(/pool name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/pool type is required/i)).toBeInTheDocument()
    // Note: Season has a default value so no validation error expected
    expect(fetch).not.toHaveBeenCalled()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('shows pool type specific rule options', async () => {
    const user = userEvent.setup()

    render(
      <PoolConfigurationForm onSave={mockOnSave} onCancel={mockOnCancel} />
    )

    // Select ATS pool type
    await user.selectOptions(
      screen.getByRole('combobox', { name: /pool type/i }),
      'ATS'
    )

    expect(screen.getByLabelText(/push handling/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/allow pick'em games/i)).toBeInTheDocument()

    // Select Points Plus pool type
    await user.selectOptions(
      screen.getByRole('combobox', { name: /pool type/i }),
      'POINTS_PLUS'
    )

    expect(screen.getByLabelText(/minimum games required/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/require equal favorites and underdogs/i)
    ).toBeInTheDocument()

    // Select Survivor pool type
    await user.selectOptions(
      screen.getByRole('combobox', { name: /pool type/i }),
      'SURVIVOR'
    )

    expect(screen.getByLabelText(/elimination on loss/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/no repeat picks/i)).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({ success: false, error: 'Validation failed' }),
    } as Response)

    render(
      <PoolConfigurationForm
        pool={mockPool}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    const form = screen.getByRole('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText(/validation failed/i)).toBeInTheDocument()
    })

    expect(mockOnSave).not.toHaveBeenCalled()
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
                json: () => Promise.resolve({ success: true, data: mockPool }),
              } as Response),
            100
          )
        )
    )

    render(
      <PoolConfigurationForm
        pool={mockPool}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    const form = screen.getByRole('form')
    fireEvent.submit(form)

    expect(screen.getByText(/saving/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <PoolConfigurationForm
        pool={mockPool}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('shows different deadline options for lock deadline', async () => {
    const user = userEvent.setup()

    render(
      <PoolConfigurationForm
        pool={mockPool}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    const lockDeadlineSelect = screen.getByRole('combobox', {
      name: /lock deadline/i,
    })

    expect(
      screen.getByRole('option', { name: /game time/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: /1 hour before/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: /2 hours before/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: /thursday 8pm/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: /sunday 1pm/i })
    ).toBeInTheDocument()
  })

  it('toggles advanced settings visibility', async () => {
    const user = userEvent.setup()

    render(
      <PoolConfigurationForm
        pool={mockPool}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    // Advanced settings should be hidden by default
    expect(
      screen.queryByText(/advanced pool settings/i)
    ).not.toBeInTheDocument()

    // Click to show advanced settings
    await user.click(
      screen.getByRole('button', { name: /show advanced settings/i })
    )

    expect(screen.getByText(/advanced pool settings/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/pool active/i)).toBeInTheDocument()

    // Click to hide advanced settings
    await user.click(
      screen.getByRole('button', { name: /hide advanced settings/i })
    )

    expect(
      screen.queryByText(/advanced pool settings/i)
    ).not.toBeInTheDocument()
  })
})
