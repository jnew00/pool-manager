'use client'

import { useState } from 'react'
import type { Pool } from '@/lib/types/database'

interface PoolConfigurationFormProps {
  pool?: Pool
  onSave: (pool: Pool) => void
  onCancel: () => void
}

interface PoolFormData {
  name: string
  type: string
  season: number
  buyIn: number
  maxEntries: number
  description: string
  isActive: boolean
  rules: {
    lockDeadline: string
    pushHandling: string
    minGames?: number
    requireEqualFavUnderdogs?: boolean
    allowPickEm?: boolean
    noRepeats?: boolean
    eliminationOnLoss?: boolean
  }
}

const poolTypeOptions = [
  { value: 'ATS', label: 'Against the Spread' },
  { value: 'SU', label: 'Straight Up' },
  { value: 'POINTS_PLUS', label: 'Points Plus' },
  { value: 'SURVIVOR', label: 'Survivor' },
]

const lockDeadlineOptions = [
  { value: 'game_time', label: 'Game Time' },
  { value: '1_hour_before', label: '1 Hour Before' },
  { value: '2_hours_before', label: '2 Hours Before' },
  { value: 'weekly_thursday_8pm', label: 'Thursday 8PM' },
  { value: 'weekly_sunday_1pm', label: 'Sunday 1PM' },
]

const pushHandlingOptions = [
  { value: 'half_point', label: 'Half Point (No Pushes)' },
  { value: 'win', label: 'Push Counts as Win' },
  { value: 'loss', label: 'Push Counts as Loss' },
  { value: 'void', label: 'Push Voids Pick' },
]

export function PoolConfigurationForm({
  pool,
  onSave,
  onCancel,
}: PoolConfigurationFormProps) {
  const [formData, setFormData] = useState<PoolFormData>(() => ({
    name: pool?.name || '',
    type: pool?.type || '',
    season: pool?.season || new Date().getFullYear(),
    buyIn: pool?.buyIn || 0,
    maxEntries: pool?.maxEntries || 1,
    description: pool?.description || '',
    isActive: pool?.isActive ?? true,
    rules: {
      lockDeadline: (pool?.rules as any)?.lockDeadline || 'game_time',
      pushHandling: (pool?.rules as any)?.pushHandling || 'half_point',
      minGames: (pool?.rules as any)?.minGames || 4,
      requireEqualFavUnderdogs:
        (pool?.rules as any)?.requireEqualFavUnderdogs || false,
      allowPickEm: (pool?.rules as any)?.allowPickEm ?? true,
      noRepeats: (pool?.rules as any)?.noRepeats ?? true,
      eliminationOnLoss: (pool?.rules as any)?.eliminationOnLoss ?? true,
    },
  }))

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Pool name is required'
    }

    // Only validate type for new pools (when pool prop is not provided)
    if (!pool && !formData.type) {
      newErrors.type = 'Pool type is required'
    }

    // Only validate season for new pools
    if (
      !pool &&
      (!formData.season || formData.season < 2020 || formData.season > 2030)
    ) {
      newErrors.season = 'Season is required and must be between 2020-2030'
    }

    if (formData.buyIn < 0) {
      newErrors.buyIn = 'Buy-in amount cannot be negative'
    }

    if (formData.maxEntries < 1) {
      newErrors.maxEntries = 'Maximum entries must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const url = pool ? `/api/pools/${pool.id}` : '/api/pools'
      const method = pool ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ submit: data.error || 'Failed to save pool configuration' })
        return
      }

      onSave(data.data)
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const updateRuleData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        [field]: value,
      },
    }))
  }

  const getPoolTypeSpecificRules = () => {
    switch (formData.type) {
      case 'ATS':
        return (
          <>
            <div>
              <label
                htmlFor="pushHandling"
                className="block text-sm font-medium text-gray-700"
              >
                Push Handling
              </label>
              <select
                id="pushHandling"
                value={formData.rules.pushHandling}
                onChange={(e) => updateRuleData('pushHandling', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {pushHandlingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="allowPickEm"
                type="checkbox"
                checked={formData.rules.allowPickEm || false}
                onChange={(e) =>
                  updateRuleData('allowPickEm', e.target.checked)
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="allowPickEm"
                className="ml-2 block text-sm text-gray-700"
              >
                Allow Pick&apos;em Games
              </label>
            </div>
          </>
        )

      case 'POINTS_PLUS':
        return (
          <>
            <div>
              <label
                htmlFor="minGames"
                className="block text-sm font-medium text-gray-700"
              >
                Minimum Games Required
              </label>
              <input
                id="minGames"
                type="number"
                min="1"
                max="16"
                value={formData.rules.minGames || 4}
                onChange={(e) =>
                  updateRuleData('minGames', parseInt(e.target.value))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                id="requireEqualFavUnderdogs"
                type="checkbox"
                checked={formData.rules.requireEqualFavUnderdogs || false}
                onChange={(e) =>
                  updateRuleData('requireEqualFavUnderdogs', e.target.checked)
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="requireEqualFavUnderdogs"
                className="ml-2 block text-sm text-gray-700"
              >
                Require Equal Favorites and Underdogs
              </label>
            </div>
          </>
        )

      case 'SURVIVOR':
        return (
          <>
            <div className="flex items-center">
              <input
                id="eliminationOnLoss"
                type="checkbox"
                checked={formData.rules.eliminationOnLoss ?? true}
                onChange={(e) =>
                  updateRuleData('eliminationOnLoss', e.target.checked)
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="eliminationOnLoss"
                className="ml-2 block text-sm text-gray-700"
              >
                Elimination on Loss
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="noRepeats"
                type="checkbox"
                checked={formData.rules.noRepeats ?? true}
                onChange={(e) => updateRuleData('noRepeats', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="noRepeats"
                className="ml-2 block text-sm text-gray-700"
              >
                No Repeat Picks
              </label>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {pool ? 'Edit Pool Configuration' : 'Create New Pool'}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {pool
            ? 'Update the settings and rules for this pool'
            : 'Configure the basic settings and rules for your new pool'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" role="form">
        {/* Basic Pool Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Pool Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Pool Type *
            </label>
            <select
              id="type"
              required={!pool} // Only require for new pools
              value={formData.type}
              onChange={(e) => updateFormData('type', e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.type ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={!!pool} // Disable type changes for existing pools
            >
              <option value="">Select pool type</option>
              {poolTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="season"
              className="block text-sm font-medium text-gray-700"
            >
              Season *
            </label>
            <input
              id="season"
              type="number"
              required={!pool} // Only require for new pools
              min="2020"
              max="2030"
              value={formData.season}
              onChange={(e) =>
                updateFormData('season', parseInt(e.target.value))
              }
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.season ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.season && (
              <p className="mt-1 text-sm text-red-600">{errors.season}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="buyIn"
              className="block text-sm font-medium text-gray-700"
            >
              Buy-in Amount ($)
            </label>
            <input
              id="buyIn"
              type="number"
              min="0"
              step="0.01"
              value={formData.buyIn}
              onChange={(e) =>
                updateFormData('buyIn', parseFloat(e.target.value) || 0)
              }
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.buyIn ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.buyIn && (
              <p className="mt-1 text-sm text-red-600">{errors.buyIn}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="maxEntries"
              className="block text-sm font-medium text-gray-700"
            >
              Max Entries per User
            </label>
            <input
              id="maxEntries"
              type="number"
              min="1"
              value={formData.maxEntries}
              onChange={(e) =>
                updateFormData('maxEntries', parseInt(e.target.value) || 1)
              }
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.maxEntries ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.maxEntries && (
              <p className="mt-1 text-sm text-red-600">{errors.maxEntries}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="lockDeadline"
              className="block text-sm font-medium text-gray-700"
            >
              Lock Deadline
            </label>
            <select
              id="lockDeadline"
              value={formData.rules.lockDeadline}
              onChange={(e) => updateRuleData('lockDeadline', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {lockDeadlineOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Optional description for the pool..."
          />
        </div>

        {/* Pool Type Specific Rules */}
        {formData.type && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {formData.type} Pool Rules
            </h3>
            <div className="space-y-4">{getPoolTypeSpecificRules()}</div>
          </div>
        )}

        {/* Advanced Settings */}
        <div className="border-t pt-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
            <svg
              className={`ml-1 h-4 w-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Advanced Pool Settings
              </h3>

              <div className="flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => updateFormData('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Pool Active
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? 'Saving...'
              : pool
                ? 'Save Configuration'
                : 'Create Pool'}
          </button>
        </div>
      </form>
    </div>
  )
}
