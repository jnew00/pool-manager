import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameLockStatus } from '../GameLockStatus'

// Mock the fetch function
global.fetch = vi.fn()

describe('GameLockStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders lock status for unlocked game with time remaining', () => {
    const futureDeadline = new Date(Date.now() + 3600000) // 1 hour from now

    render(
      <GameLockStatus
        gameId="game-1"
        deadline={futureDeadline}
        isLocked={false}
        timeRemaining={3600000}
      />
    )

    expect(screen.getByText(/picks close in/i)).toBeInTheDocument()
    expect(screen.getByText(/1h 0m/)).toBeInTheDocument()
    expect(screen.getByLabelText(/unlocked/i)).toBeInTheDocument()
  })

  it('renders locked status for past deadline', () => {
    const pastDeadline = new Date(Date.now() - 3600000) // 1 hour ago

    render(
      <GameLockStatus gameId="game-1" deadline={pastDeadline} isLocked={true} />
    )

    expect(screen.getByText(/picks are locked/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/locked/i)).toBeInTheDocument()
  })

  it('shows warning when deadline is very close', () => {
    const closeDeadline = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now

    render(
      <GameLockStatus
        gameId="game-1"
        deadline={closeDeadline}
        isLocked={false}
        timeRemaining={5 * 60 * 1000}
      />
    )

    expect(screen.getByText(/picks close soon/i)).toBeInTheDocument()
    expect(screen.getByText(/5m 0s/)).toBeInTheDocument()
  })

  it('formats time remaining correctly', () => {
    const deadline = new Date(Date.now() + 7385000) // 2h 3m 5s from now

    render(
      <GameLockStatus
        gameId="game-1"
        deadline={deadline}
        isLocked={false}
        timeRemaining={7385000}
      />
    )

    expect(screen.getByText(/2h 3m/)).toBeInTheDocument()
  })

  it('shows seconds when less than 1 minute remaining', () => {
    const deadline = new Date(Date.now() + 45000) // 45 seconds from now

    render(
      <GameLockStatus
        gameId="game-1"
        deadline={deadline}
        isLocked={false}
        timeRemaining={45000}
      />
    )

    expect(screen.getByText(/45s/)).toBeInTheDocument()
  })

  it('renders with minimal variant', () => {
    const futureDeadline = new Date(Date.now() + 3600000)

    render(
      <GameLockStatus
        gameId="game-1"
        deadline={futureDeadline}
        isLocked={false}
        timeRemaining={3600000}
        variant="minimal"
      />
    )

    // Minimal variant should just show the time and icon
    expect(screen.getByText(/1h 0m/)).toBeInTheDocument()
    expect(screen.queryByText(/picks close in/i)).not.toBeInTheDocument()
  })

  it('handles different lock types', () => {
    const deadline = new Date(Date.now() + 3600000)

    const { rerender } = render(
      <GameLockStatus
        gameId="game-1"
        deadline={deadline}
        isLocked={false}
        timeRemaining={3600000}
        lockType="game_time"
      />
    )

    expect(screen.getByText(/game time/i)).toBeInTheDocument()

    rerender(
      <GameLockStatus
        gameId="game-1"
        deadline={deadline}
        isLocked={false}
        timeRemaining={3600000}
        lockType="1_hour_before"
      />
    )

    expect(screen.getByText(/1 hour before/i)).toBeInTheDocument()

    rerender(
      <GameLockStatus
        gameId="game-1"
        deadline={deadline}
        isLocked={false}
        timeRemaining={3600000}
        lockType="weekly_thursday_8pm"
      />
    )

    expect(screen.getByText(/weekly deadline/i)).toBeInTheDocument()
  })
})
