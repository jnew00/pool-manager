'use client'

import { useState } from 'react'

interface Pool {
  id: string
  name: string
  type: 'ATS' | 'SU' | 'POINTS_PLUS' | 'SURVIVOR'
  season: number
  buyIn: number
  maxEntries: number
  isActive: boolean
  description?: string
}

interface PoolSetupProps {
  onPoolCreated: (pool: Pool) => void
}

export function PoolSetup({ onPoolCreated }: PoolSetupProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'ATS' as const,
    season: new Date().getFullYear().toString(),
    buyIn: '0',
    maxEntries: '1',
    isActive: true,
    description: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Pool name is required'
    }

    const buyIn = parseFloat(formData.buyIn)
    if (isNaN(buyIn) || buyIn < 0) {
      newErrors.buyIn = 'Buy-in amount cannot be negative'
    }

    const maxEntries = parseInt(formData.maxEntries)
    if (isNaN(maxEntries) || maxEntries < 1) {
      newErrors.maxEntries = 'Max entries must be at least 1'
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
      const submitData = {
        name: formData.name,
        type: formData.type,
        season: parseInt(formData.season),
        buyIn: parseFloat(formData.buyIn),
        maxEntries: parseInt(formData.maxEntries),
        isActive: formData.isActive,
        description: formData.description,
      }

      const response = await fetch('/api/pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Handle API error response format
        const errorMessage =
          typeof errorData.error === 'string'
            ? errorData.error
            : errorData.error?.message || 'Failed to create pool'
        setErrors({ submit: errorMessage })
        return
      }

      const responseData = await response.json()
      // Extract the pool data from the API response
      onPoolCreated(responseData.data)
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-md mx-auto"
      role="form"
    >
      <div>
        <label
          htmlFor="pool-name"
          className="block text-sm font-medium text-gray-700"
        >
          Pool Name
        </label>
        <input
          type="text"
          id="pool-name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="pool-type"
          className="block text-sm font-medium text-gray-700"
        >
          Pool Type
        </label>
        <select
          id="pool-type"
          value={formData.type}
          onChange={(e) => handleInputChange('type', e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ATS">Against the Spread</option>
          <option value="SU">Straight Up</option>
          <option value="POINTS_PLUS">Points Plus</option>
          <option value="SURVIVOR">Survivor</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="season"
          className="block text-sm font-medium text-gray-700"
        >
          Season
        </label>
        <input
          type="number"
          id="season"
          value={formData.season}
          onChange={(e) => handleInputChange('season', e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label
          htmlFor="buy-in"
          className="block text-sm font-medium text-gray-700"
        >
          Buy-in Amount
        </label>
        <input
          type="number"
          id="buy-in"
          value={formData.buyIn}
          onChange={(e) => handleInputChange('buyIn', e.target.value)}
          step="0.01"
          min="0"
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.buyIn && (
          <p className="mt-1 text-sm text-red-600">{errors.buyIn}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="max-entries"
          className="block text-sm font-medium text-gray-700"
        >
          Max Entries
        </label>
        <input
          type="number"
          id="max-entries"
          value={formData.maxEntries}
          onChange={(e) => handleInputChange('maxEntries', e.target.value)}
          min="1"
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.maxEntries && (
          <p className="mt-1 text-sm text-red-600">{errors.maxEntries}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating Pool...' : 'Create Pool'}
      </button>
    </form>
  )
}
