import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameProjection } from '../GameProjection'
import type { ModelOutput } from '@/lib/models/types'

const mockProjection: ModelOutput = {
  gameId: 'game-1',
  confidence: 75.5,
  recommendedPick: 'HOME',
  factors: {
    gameId: 'game-1',
    homeTeamId: 'home-1',
    awayTeamId: 'away-1',
    marketProb: 0.52,
    homeElo: 1600,
    awayElo: 1450,
    eloProb: 0.58,
    homeAdvantage: 3.2,
    restAdvantage: 0.5,
    weatherPenalty: 1.2,
    injuryPenalty: 0.8,
    rawConfidence: 0.755,
    adjustedConfidence: 75.5,
    recommendedPick: 'HOME',
    factorBreakdown: [
      {
        factor: 'Market Probability',
        value: 0.52,
        weight: 0.5,
        contribution: 0.26,
        description: 'Implied probability from betting lines',
      },
      {
        factor: 'Elo Rating',
        value: 0.58,
        weight: 0.3,
        contribution: 0.174,
        description: 'Team strength based on historical performance',
      },
      {
        factor: 'Home Advantage',
        value: 3.2,
        weight: 0.07,
        contribution: 0.056,
        description: 'Home field advantage and venue factors',
      },
    ],
  },
  calculatedAt: new Date('2024-01-15T12:00:00Z'),
  modelVersion: '1.0.0',
}

const mockGameDetails = {
  homeTeam: { name: 'Kansas City Chiefs', nflAbbr: 'KC' },
  awayTeam: { name: 'Buffalo Bills', nflAbbr: 'BUF' },
  kickoffTime: new Date('2024-01-15T18:00:00Z'),
  venue: 'Arrowhead Stadium',
}

describe('GameProjection', () => {
  it('renders game teams and basic info', () => {
    render(
      <GameProjection
        projection={mockProjection}
        gameDetails={mockGameDetails}
      />
    )

    expect(screen.getByText('Kansas City Chiefs')).toBeInTheDocument()
    expect(screen.getByText('Buffalo Bills')).toBeInTheDocument()
    expect(screen.getByText('KC')).toBeInTheDocument()
    expect(screen.getByText('BUF')).toBeInTheDocument()
    expect(screen.getByText('Arrowhead Stadium')).toBeInTheDocument()
  })

  it('displays confidence score and recommendation', () => {
    render(
      <GameProjection
        projection={mockProjection}
        gameDetails={mockGameDetails}
      />
    )

    expect(screen.getByText('75.5%')).toBeInTheDocument()
    expect(screen.getByText('Recommended: KC')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument() // Confidence level
  })

  it('shows factor summary in collapsed state', () => {
    render(
      <GameProjection
        projection={mockProjection}
        gameDetails={mockGameDetails}
      />
    )

    expect(screen.getByText('52.0%')).toBeInTheDocument() // Market probability
    expect(screen.getByText('Home +150')).toBeInTheDocument() // Elo advantage
    expect(screen.getByText('+3.2 pts')).toBeInTheDocument() // Home advantage
  })

  it('expands to show detailed factor breakdown', () => {
    render(
      <GameProjection
        projection={mockProjection}
        gameDetails={mockGameDetails}
      />
    )

    const showDetailsButton = screen.getByText('Show Factor Breakdown')
    fireEvent.click(showDetailsButton)

    expect(screen.getByText('Factor Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Market Probability')).toBeInTheDocument()
    expect(screen.getByText('Elo Rating')).toBeInTheDocument()
    expect(screen.getByText('Home Advantage')).toBeInTheDocument()

    // Check for factor descriptions
    expect(
      screen.getByText('Implied probability from betting lines')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Team strength based on historical performance')
    ).toBeInTheDocument()
  })

  it('collapses details when clicked again', () => {
    render(
      <GameProjection
        projection={mockProjection}
        gameDetails={mockGameDetails}
      />
    )

    const showDetailsButton = screen.getByText('Show Factor Breakdown')
    fireEvent.click(showDetailsButton)

    const hideDetailsButton = screen.getByText('Hide Details')
    fireEvent.click(hideDetailsButton)

    expect(screen.queryByText('Factor Breakdown')).not.toBeInTheDocument()
    expect(screen.getByText('Show Factor Breakdown')).toBeInTheDocument()
  })

  it('handles away team recommendation correctly', () => {
    const awayProjection = {
      ...mockProjection,
      recommendedPick: 'AWAY' as const,
    }

    render(
      <GameProjection
        projection={awayProjection}
        gameDetails={mockGameDetails}
      />
    )

    expect(screen.getByText('Recommended: BUF')).toBeInTheDocument()
  })

  it('displays different confidence levels correctly', () => {
    const highConfidenceProjection = {
      ...mockProjection,
      confidence: 92.5,
    }

    render(
      <GameProjection
        projection={highConfidenceProjection}
        gameDetails={mockGameDetails}
      />
    )

    expect(screen.getByText('92.5%')).toBeInTheDocument()
    expect(screen.getByText('Very High')).toBeInTheDocument()
  })

  it('handles games without venue', () => {
    const gameDetailsWithoutVenue = {
      ...mockGameDetails,
      venue: undefined,
    }

    render(
      <GameProjection
        projection={mockProjection}
        gameDetails={gameDetailsWithoutVenue}
      />
    )

    expect(screen.queryByText('Arrowhead Stadium')).not.toBeInTheDocument()
    expect(screen.getByText('Kansas City Chiefs')).toBeInTheDocument()
  })

  it('formats dates and times correctly', () => {
    render(
      <GameProjection
        projection={mockProjection}
        gameDetails={mockGameDetails}
      />
    )

    // Should show formatted date and time
    expect(
      screen.getByText(mockGameDetails.kickoffTime.toLocaleDateString())
    ).toBeInTheDocument()
    expect(
      screen.getByText(mockGameDetails.kickoffTime.toLocaleTimeString())
    ).toBeInTheDocument()
  })

  it('shows model version and calculation time in details', () => {
    render(
      <GameProjection
        projection={mockProjection}
        gameDetails={mockGameDetails}
      />
    )

    const showDetailsButton = screen.getByText('Show Factor Breakdown')
    fireEvent.click(showDetailsButton)

    expect(screen.getByText('Model Version: 1.0.0')).toBeInTheDocument()
    expect(screen.getByText(/Calculated:/)).toBeInTheDocument()
    expect(screen.getByText(/Raw Confidence: 75.50%/)).toBeInTheDocument()
  })
})
