import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ColumnMapper } from './ColumnMapper'
import type { ColumnMapping } from '../lib/csv-parser'

describe('ColumnMapper', () => {
  const mockOnMappingChange = vi.fn()
  const csvHeaders = ['Date', 'Time', 'Away', 'Home', 'Spread', 'Total']
  const targetFields = [
    { key: 'date', label: 'Date', required: true },
    { key: 'time', label: 'Time', required: false },
    { key: 'away_team', label: 'Away Team', required: true },
    { key: 'home_team', label: 'Home Team', required: true },
    { key: 'spread', label: 'Spread', required: false },
    { key: 'total', label: 'Total', required: false },
  ]

  beforeEach(() => {
    mockOnMappingChange.mockClear()
  })

  it('should render target fields and dropdowns', () => {
    render(
      <ColumnMapper 
        csvHeaders={csvHeaders}
        targetFields={targetFields}
        onMappingChange={mockOnMappingChange}
      />
    )

    // Check all target fields are rendered as labels
    expect(screen.getByLabelText(/Date/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Away Team/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Home Team/)).toBeInTheDocument()

    // Check required indicators
    expect(screen.getAllByText('*')).toHaveLength(3) // 3 required fields
  })

  it('should show CSV headers in dropdowns', () => {
    render(
      <ColumnMapper 
        csvHeaders={csvHeaders}
        targetFields={targetFields}
        onMappingChange={mockOnMappingChange}
      />
    )

    // Check that dropdowns contain options for CSV headers
    const firstSelect = screen.getAllByRole('combobox')[0]
    
    // Check options are present (they should be in DOM even if not visible)
    expect(firstSelect).toContainHTML('<option value="Date">Date</option>')
    expect(firstSelect).toContainHTML('<option value="Away">Away</option>')
    expect(firstSelect).toContainHTML('<option value="Home">Home</option>')
  })

  it('should call onMappingChange when mapping is updated', () => {
    render(
      <ColumnMapper 
        csvHeaders={csvHeaders}
        targetFields={targetFields}
        onMappingChange={mockOnMappingChange}
      />
    )

    // Select mapping for date field
    const dateSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(dateSelect, { target: { value: 'Date' } })

    expect(mockOnMappingChange).toHaveBeenCalledWith({
      date: 'Date'
    })
  })

  it('should apply initial mapping when provided', () => {
    const initialMapping: ColumnMapping = {
      date: 'Date',
      away_team: 'Away',
      home_team: 'Home'
    }

    render(
      <ColumnMapper 
        csvHeaders={csvHeaders}
        targetFields={targetFields}
        onMappingChange={mockOnMappingChange}
        initialMapping={initialMapping}
      />
    )

    // Check that selects have the initial values
    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[]
    expect(selects[0].value).toBe('Date') // date field
    expect(selects[2].value).toBe('Away') // away_team field
    expect(selects[3].value).toBe('Home') // home_team field
  })

  it('should auto-detect mappings when enabled', () => {
    render(
      <ColumnMapper 
        csvHeaders={csvHeaders}
        targetFields={targetFields}
        onMappingChange={mockOnMappingChange}
        autoDetect={true}
      />
    )

    // Should auto-detect exact matches
    expect(mockOnMappingChange).toHaveBeenCalledWith(
      expect.objectContaining({
        date: 'Date',
        total: 'Total'
      })
    )
  })

  it('should show validation status for required fields', () => {
    render(
      <ColumnMapper 
        csvHeaders={csvHeaders}
        targetFields={targetFields}
        onMappingChange={mockOnMappingChange}
      />
    )

    // Should show error indicators for unmapped required fields (red borders)
    const dateSelect = screen.getByLabelText(/Date/)
    const awayTeamSelect = screen.getByLabelText(/Away Team/)
    const homeTeamSelect = screen.getByLabelText(/Home Team/)
    
    expect(dateSelect).toHaveClass('border-red-300')
    expect(awayTeamSelect).toHaveClass('border-red-300')
    expect(homeTeamSelect).toHaveClass('border-red-300')
  })

  it('should reset mapping when reset button is clicked', () => {
    const initialMapping: ColumnMapping = {
      date: 'Date',
      away_team: 'Away'
    }

    render(
      <ColumnMapper 
        csvHeaders={csvHeaders}
        targetFields={targetFields}
        onMappingChange={mockOnMappingChange}
        initialMapping={initialMapping}
      />
    )

    // Click reset button
    const resetButton = screen.getByText(/reset/i)
    fireEvent.click(resetButton)

    expect(mockOnMappingChange).toHaveBeenCalledWith({})
  })
})