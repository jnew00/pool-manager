import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProfileSelector } from './ProfileSelector'
import type { MappingProfile } from '@/lib/types/database'
import type { ColumnMapping } from '../lib/csv-parser'

// Mock the mapping profile service
const mockProfiles: MappingProfile[] = [
  {
    id: '1',
    name: 'ESPN Standard',
    columnMap: { date: 'Date', away_team: 'Away', home_team: 'Home' },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2', 
    name: 'Yahoo Sports',
    columnMap: { date: 'Game Date', away_team: 'Visitor', home_team: 'Home' },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const mockMappingProfileService = {
  getAllProfiles: vi.fn().mockResolvedValue(mockProfiles),
  createProfile: vi.fn(),
  deleteProfile: vi.fn().mockResolvedValue(true),
  updateProfile: vi.fn()
}

vi.mock('../services/mapping-profile.service', () => ({
  MappingProfileService: vi.fn(() => mockMappingProfileService)
}))

describe('ProfileSelector', () => {
  const mockOnSelect = vi.fn()
  const mockOnSave = vi.fn()

  beforeEach(() => {
    mockOnSelect.mockClear()
    mockOnSave.mockClear()
    mockMappingProfileService.getAllProfiles.mockClear()
    mockMappingProfileService.createProfile.mockClear()
    mockMappingProfileService.deleteProfile.mockClear()
  })

  it('should render profile selector with load and save options', async () => {
    render(
      <ProfileSelector 
        onSelect={mockOnSelect}
        onSave={mockOnSave}
        currentMapping={{}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/mapping profiles/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/load profile/i)).toBeInTheDocument()
    expect(screen.getByText(/save current mapping/i)).toBeInTheDocument()
  })

  it('should load and display available profiles', async () => {
    render(
      <ProfileSelector 
        onSelect={mockOnSelect}
        onSave={mockOnSave}
        currentMapping={{}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('ESPN Standard')).toBeInTheDocument()
      expect(screen.getByText('Yahoo Sports')).toBeInTheDocument()
    })

    expect(mockMappingProfileService.getAllProfiles).toHaveBeenCalled()
  })

  it('should call onSelect when profile is selected', async () => {
    render(
      <ProfileSelector 
        onSelect={mockOnSelect}
        onSave={mockOnSave}
        currentMapping={{}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('ESPN Standard')).toBeInTheDocument()
    })

    // Click the ESPN profile
    const espnProfile = screen.getByText('ESPN Standard')
    fireEvent.click(espnProfile)

    expect(mockOnSelect).toHaveBeenCalledWith(mockProfiles[0].columnMap)
  })

  it('should show save dialog when save button is clicked', async () => {
    const currentMapping: ColumnMapping = {
      date: 'Date',
      away_team: 'Away'
    }

    render(
      <ProfileSelector 
        onSelect={mockOnSelect}
        onSave={mockOnSave}
        currentMapping={currentMapping}
      />
    )

    const saveButton = screen.getByText(/save current mapping/i)
    fireEvent.click(saveButton)

    expect(screen.getByText(/save mapping profile/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/profile name/i)).toBeInTheDocument()
  })

  it('should save new profile with provided name', async () => {
    const currentMapping: ColumnMapping = {
      date: 'Date',
      away_team: 'Away'
    }

    const newProfile = {
      id: '3',
      name: 'My Custom Profile',
      columnMap: currentMapping,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    mockMappingProfileService.createProfile.mockResolvedValue(newProfile)

    render(
      <ProfileSelector 
        onSelect={mockOnSelect}
        onSave={mockOnSave}
        currentMapping={currentMapping}
      />
    )

    // Open save dialog
    const saveButton = screen.getByText(/save current mapping/i)
    fireEvent.click(saveButton)

    // Enter profile name
    const nameInput = screen.getByPlaceholderText(/profile name/i)
    fireEvent.change(nameInput, { target: { value: 'My Custom Profile' } })

    // Click save (the one in the dialog, not the main button)
    const confirmSaveButton = screen.getByText('Save')
    fireEvent.click(confirmSaveButton)

    await waitFor(() => {
      expect(mockMappingProfileService.createProfile).toHaveBeenCalledWith({
        name: 'My Custom Profile',
        columnMap: currentMapping
      })
    })

    expect(mockOnSave).toHaveBeenCalledWith(newProfile)
  })

  it('should show delete confirmation when delete button is clicked', async () => {
    render(
      <ProfileSelector 
        onSelect={mockOnSelect}
        onSave={mockOnSave}
        currentMapping={{}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('ESPN Standard')).toBeInTheDocument()
    })

    // Find and click delete button for ESPN profile
    const deleteButtons = screen.getAllByText('×')
    fireEvent.click(deleteButtons[0])

    expect(screen.getByText(/delete profile/i)).toBeInTheDocument()
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
  })

  it('should delete profile when confirmed', async () => {
    render(
      <ProfileSelector 
        onSelect={mockOnSelect}
        onSave={mockOnSave}
        currentMapping={{}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('ESPN Standard')).toBeInTheDocument()
    })

    // Click delete button
    const deleteButtons = screen.getAllByText('×')
    fireEvent.click(deleteButtons[0])

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockMappingProfileService.deleteProfile).toHaveBeenCalledWith('1')
    })
  })

  it('should show empty state when no profiles exist', async () => {
    mockMappingProfileService.getAllProfiles.mockResolvedValue([])

    render(
      <ProfileSelector 
        onSelect={mockOnSelect}
        onSave={mockOnSave}
        currentMapping={{}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/no saved profiles/i)).toBeInTheDocument()
    })
  })

  it('should disable save button when current mapping is empty', () => {
    render(
      <ProfileSelector 
        onSelect={mockOnSelect}
        onSave={mockOnSave}
        currentMapping={{}}
      />
    )

    const saveButton = screen.getByText(/save current mapping/i)
    expect(saveButton).toBeDisabled()
  })
})