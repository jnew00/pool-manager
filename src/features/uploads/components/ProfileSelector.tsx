import React, { useState, useEffect } from 'react'
import type { MappingProfile } from '@/lib/types/database'
import type { ColumnMapping } from '../lib/csv-parser'
import { MappingProfileService } from '../services/mapping-profile.service'

interface ProfileSelectorProps {
  onSelect: (mapping: ColumnMapping) => void
  onSave?: (profile: MappingProfile) => void
  currentMapping: ColumnMapping
  className?: string
}

export function ProfileSelector({
  onSelect,
  onSave,
  currentMapping,
  className,
}: ProfileSelectorProps) {
  const [profiles, setProfiles] = useState<MappingProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProfileForDelete, setSelectedProfileForDelete] =
    useState<MappingProfile | null>(null)
  const [saveProfileName, setSaveProfileName] = useState('')
  const [saving, setSaving] = useState(false)

  const service = new MappingProfileService()

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      setLoading(true)
      const loadedProfiles = await service.getAllProfiles()
      setProfiles(loadedProfiles)
    } catch (error) {
      console.error('Failed to load profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProfile = (profile: MappingProfile) => {
    onSelect(profile.columnMap as ColumnMapping)
  }

  const handleSaveProfile = async () => {
    if (!saveProfileName.trim()) return

    try {
      setSaving(true)
      const newProfile = await service.createProfile({
        name: saveProfileName.trim(),
        columnMap: currentMapping,
      })

      await loadProfiles() // Refresh the list
      setShowSaveDialog(false)
      setSaveProfileName('')

      onSave?.(newProfile)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProfile = async () => {
    if (!selectedProfileForDelete) return

    try {
      await service.deleteProfile(selectedProfileForDelete.id)
      await loadProfiles() // Refresh the list
      setShowDeleteDialog(false)
      setSelectedProfileForDelete(null)
    } catch (error) {
      console.error('Failed to delete profile:', error)
    }
  }

  const openDeleteDialog = (profile: MappingProfile) => {
    setSelectedProfileForDelete(profile)
    setShowDeleteDialog(true)
  }

  const hasCurrentMapping = Object.keys(currentMapping).length > 0

  return (
    <div className={className}>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Mapping Profiles</h3>

        {/* Save Current Mapping */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={!hasCurrentMapping}
            className={`
              px-4 py-2 text-sm font-medium rounded-md
              ${
                hasCurrentMapping
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Save Current Mapping
          </button>
        </div>

        {/* Load Profile Section */}
        <div>
          <h4 className="text-md font-medium mb-2">Load Profile</h4>

          {loading ? (
            <div className="text-gray-500">Loading profiles...</div>
          ) : profiles.length === 0 ? (
            <div className="text-gray-500">No saved profiles yet.</div>
          ) : (
            <div className="space-y-2">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleSelectProfile(profile)}
                  >
                    <div className="font-medium">{profile.name}</div>
                    <div className="text-sm text-gray-500">
                      {Object.keys(profile.columnMap as object).length} field
                      mappings
                    </div>
                  </div>

                  <button
                    onClick={() => openDeleteDialog(profile)}
                    className="ml-2 w-6 h-6 text-red-500 hover:text-red-700 hover:bg-red-50 rounded flex items-center justify-center"
                    title="Delete profile"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-medium mb-4">Save Mapping Profile</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={saveProfileName}
                  onChange={(e) => setSaveProfileName(e.target.value)}
                  placeholder="Enter profile name..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                  autoFocus
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={!saveProfileName.trim() || saving}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false)
                    setSaveProfileName('')
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedProfileForDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-medium mb-4">Delete Profile</h3>

            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete the profile &quot;
                {selectedProfileForDelete.name}&quot;? This action cannot be
                undone.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteProfile}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setSelectedProfileForDelete(null)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
