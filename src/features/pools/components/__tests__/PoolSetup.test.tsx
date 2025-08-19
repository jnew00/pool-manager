import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PoolSetup } from '../PoolSetup'

// Mock the API fetch
global.fetch = vi.fn()

describe('PoolSetup', () => {
  const mockOnPoolCreated = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'pool-1',
          name: 'Test Pool',
          type: 'ATS',
          season: 2024,
          buyIn: 50,
          maxEntries: 10,
          isActive: true,
        }),
    } as Response)
  })

  it('renders pool setup form', () => {
    render(<PoolSetup onPoolCreated={mockOnPoolCreated} />)

    expect(screen.getByLabelText(/pool name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/pool type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/season/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/buy-in amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/max entries/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create pool/i })
    ).toBeInTheDocument()
  })

  it('shows all pool type options', () => {
    render(<PoolSetup onPoolCreated={mockOnPoolCreated} />)

    const poolTypeSelect = screen.getByLabelText(/pool type/i)
    expect(poolTypeSelect).toBeInTheDocument()

    // Check that all pool types are available
    expect(
      screen.getByRole('option', { name: /against the spread/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: /straight up/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: /points plus/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: /survivor/i })
    ).toBeInTheDocument()
  })

  it('defaults to current season', () => {
    render(<PoolSetup onPoolCreated={mockOnPoolCreated} />)

    const seasonInput = screen.getByLabelText(/season/i) as HTMLInputElement
    expect(seasonInput.value).toBe(new Date().getFullYear().toString())
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<PoolSetup onPoolCreated={mockOnPoolCreated} />)

    // Fill out form - fill required field first
    const nameInput = screen.getByLabelText(/pool name/i)
    await user.type(nameInput, 'Test Pool')

    // Fill numerical inputs by setting values directly
    const buyInInput = screen.getByLabelText(/buy-in amount/i)
    await user.clear(buyInInput)
    await user.type(buyInInput, '50')

    const maxEntriesInput = screen.getByLabelText(/max entries/i)
    await user.clear(maxEntriesInput)
    await user.type(maxEntriesInput, '10')

    // Wait for any state updates to complete
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Submit form via form element instead of button click
    fireEvent.submit(screen.getByRole('form'))

    await waitFor(
      () => {
        expect(fetch).toHaveBeenCalledWith('/api/pools', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test Pool',
            type: 'ATS',
            season: new Date().getFullYear(),
            buyIn: 50,
            maxEntries: 10,
            isActive: true,
            description: '',
          }),
        })
      },
      { timeout: 3000 }
    )

    await waitFor(() => {
      expect(mockOnPoolCreated).toHaveBeenCalledWith({
        id: 'pool-1',
        name: 'Test Pool',
        type: 'ATS',
        season: 2024,
        buyIn: 50,
        maxEntries: 10,
        isActive: true,
      })
    })
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<PoolSetup onPoolCreated={mockOnPoolCreated} />)

    // Clear the pool name to make it empty
    await user.clear(screen.getByLabelText(/pool name/i))

    // Submit without filling required fields
    await user.click(screen.getByRole('button', { name: /create pool/i }))

    expect(screen.getByText(/pool name is required/i)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
    expect(mockOnPoolCreated).not.toHaveBeenCalled()
  })

  it('validates buy-in amount is not negative', async () => {
    render(<PoolSetup onPoolCreated={mockOnPoolCreated} />)

    fireEvent.change(screen.getByLabelText(/pool name/i), {
      target: { value: 'Test Pool' },
    })
    fireEvent.change(screen.getByLabelText(/buy-in amount/i), {
      target: { value: '-10' },
    })

    fireEvent.submit(screen.getByRole('form'))

    await waitFor(() => {
      expect(
        screen.getByText(/buy-in amount cannot be negative/i)
      ).toBeInTheDocument()
    })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('validates max entries is at least 1', async () => {
    render(<PoolSetup onPoolCreated={mockOnPoolCreated} />)

    fireEvent.change(screen.getByLabelText(/pool name/i), {
      target: { value: 'Test Pool' },
    })
    fireEvent.change(screen.getByLabelText(/max entries/i), {
      target: { value: '0' },
    })

    fireEvent.submit(screen.getByRole('form'))

    await waitFor(() => {
      expect(
        screen.getByText(/max entries must be at least 1/i)
      ).toBeInTheDocument()
    })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          error: 'Pool name already exists',
        }),
    } as Response)

    render(<PoolSetup onPoolCreated={mockOnPoolCreated} />)

    await user.type(screen.getByLabelText(/pool name/i), 'Duplicate Pool')
    await user.click(screen.getByRole('button', { name: /create pool/i }))

    await waitFor(() => {
      expect(screen.getByText(/pool name already exists/i)).toBeInTheDocument()
    })

    expect(mockOnPoolCreated).not.toHaveBeenCalled()
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
                json: () => Promise.resolve({ id: 'pool-1' }),
              } as Response),
            100
          )
        )
    )

    render(<PoolSetup onPoolCreated={mockOnPoolCreated} />)

    await user.type(screen.getByLabelText(/pool name/i), 'Test Pool')
    await user.click(screen.getByRole('button', { name: /create pool/i }))

    expect(screen.getByText(/creating pool/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /creating pool/i })
    ).toBeDisabled()
  })

  it('includes description field', async () => {
    const user = userEvent.setup()
    render(<PoolSetup onPoolCreated={mockOnPoolCreated} />)

    const descriptionField = screen.getByLabelText(/description/i)
    expect(descriptionField).toBeInTheDocument()

    await user.type(descriptionField, 'This is a test pool')
    await user.type(screen.getByLabelText(/pool name/i), 'Test Pool')
    await user.click(screen.getByRole('button', { name: /create pool/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"description":"This is a test pool"'),
      })
    })
  })
})
