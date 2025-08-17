import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DataPreview } from './DataPreview'
import type { ValidationResult, GameData } from '../lib/upload-validator'

describe('DataPreview', () => {
  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  const validGameData: GameData = {
    season: 2024,
    week: 1,
    date: '2024-09-08',
    time: '13:00',
    away_team: 'BUF',
    home_team: 'LAR',
    spread: '-2.5',
    total: '47.5'
  }

  const invalidGameData: GameData = {
    season: 2024,
    week: 1,
    date: 'invalid-date',
    time: '13:00',
    away_team: 'INVALID',
    home_team: 'LAR',
    spread: 'not-a-number',
    total: '47.5'
  }

  const validationResults: ValidationResult[] = [
    { valid: true, errors: [], warnings: [] },
    { 
      valid: false, 
      errors: ['Invalid date format. Expected YYYY-MM-DD', 'Invalid away team: INVALID', 'Spread must be a number'], 
      warnings: [] 
    }
  ]

  beforeEach(() => {
    mockOnConfirm.mockClear()
    mockOnCancel.mockClear()
  })

  it('should render data preview with games table', () => {
    render(
      <DataPreview
        games={[validGameData]}
        validationResults={[validationResults[0]]}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText(/data preview/i)).toBeInTheDocument()
    expect(screen.getByText('BUF')).toBeInTheDocument()
    expect(screen.getByText('LAR')).toBeInTheDocument()
    expect(screen.getByText('-2.5')).toBeInTheDocument()
  })

  it('should show validation summary', () => {
    render(
      <DataPreview
        games={[validGameData, invalidGameData]}
        validationResults={validationResults}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    // Check for the summary labels and that they exist
    expect(screen.getByText('Total Games')).toBeInTheDocument()
    expect(screen.getByText('Valid')).toBeInTheDocument()
    expect(screen.getByText('Invalid')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // Total count
  })

  it('should highlight invalid rows with error styling', () => {
    render(
      <DataPreview
        games={[validGameData, invalidGameData]}
        validationResults={validationResults}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    // Check for error indicators
    expect(screen.getByText('INVALID')).toBeInTheDocument()
    expect(screen.getByText('not-a-number')).toBeInTheDocument()
  })

  it('should show error details when row is clicked', () => {
    render(
      <DataPreview
        games={[invalidGameData]}
        validationResults={[validationResults[1]]}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    // Click on the invalid row to see details
    const invalidRow = screen.getByText('INVALID').closest('tr')
    fireEvent.click(invalidRow!)

    expect(screen.getByText(/invalid date format/i)).toBeInTheDocument()
    expect(screen.getByText(/invalid away team/i)).toBeInTheDocument()
    expect(screen.getByText(/spread must be a number/i)).toBeInTheDocument()
  })

  it('should call onConfirm when import button is clicked', () => {
    render(
      <DataPreview
        games={[validGameData]}
        validationResults={[validationResults[0]]}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const importButton = screen.getByText(/import data/i)
    fireEvent.click(importButton)

    expect(mockOnConfirm).toHaveBeenCalledWith([validGameData])
  })

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <DataPreview
        games={[validGameData]}
        validationResults={[validationResults[0]]}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByText(/cancel/i)
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should disable import button when all games are invalid', () => {
    render(
      <DataPreview
        games={[invalidGameData]}
        validationResults={[validationResults[1]]}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const importButton = screen.getByText(/import data/i)
    expect(importButton).toBeDisabled()
  })

  it('should allow import of only valid games when mixed validity', () => {
    render(
      <DataPreview
        games={[validGameData, invalidGameData]}
        validationResults={validationResults}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const importButton = screen.getByText(/import valid data/i)
    fireEvent.click(importButton)

    expect(mockOnConfirm).toHaveBeenCalledWith([validGameData])
  })

  it('should show pagination for large datasets', () => {
    const manyGames = Array(25).fill(validGameData).map((game, index) => ({
      ...game,
      away_team: `T${index.toString().padStart(2, '0')}`,
      home_team: 'LAR'
    }))
    const manyResults = Array(25).fill(validationResults[0])

    render(
      <DataPreview
        games={manyGames}
        validationResults={manyResults}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    // Should show pagination when more than 20 items
    expect(screen.getByText(/page 1/i)).toBeInTheDocument()
    expect(screen.getByText(/next/i)).toBeInTheDocument()
  })

  it('should filter to show only invalid games', () => {
    render(
      <DataPreview
        games={[validGameData, invalidGameData]}
        validationResults={validationResults}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const showInvalidButton = screen.getByText(/show invalid only/i)
    fireEvent.click(showInvalidButton)

    // Should only show the invalid game
    expect(screen.queryByText('BUF')).not.toBeInTheDocument()
    expect(screen.getByText('INVALID')).toBeInTheDocument()
  })
})