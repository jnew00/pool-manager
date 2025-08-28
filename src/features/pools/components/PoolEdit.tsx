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
  url?: string
}

interface PoolEditProps {
  pool: Pool
  onPoolUpdated: (pool: Pool) => void
  onCancel: () => void
}

export function PoolEdit({ pool, onPoolUpdated, onCancel }: PoolEditProps) {
  const [formData, setFormData] = useState({
    name: pool.name,
    buyIn: pool.buyIn.toString(),
    maxEntries: pool.maxEntries.toString(),
    isActive: pool.isActive,
    description: pool.description || '',
    url: pool.url || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Pool name is required'
    }

    if (formData.url && formData.url.trim()) {
      try {
        new URL(formData.url)
      } catch {
        newErrors.url = 'Please enter a valid URL'
      }
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
        buyIn: parseFloat(formData.buyIn),
        maxEntries: parseInt(formData.maxEntries),
        isActive: formData.isActive,
        description: formData.description || null,
        url: formData.url || null,
      }

      const response = await fetch(`/api/pools/${pool.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage =
          typeof errorData.error === 'string'
            ? errorData.error
            : errorData.error?.message || 'Failed to update pool'
        setErrors({ submit: errorMessage })
        return
      }

      const responseData = await response.json()
      onPoolUpdated(responseData.data)
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
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
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Pool Name
        </label>
        <input
          type="text"
          id="pool-name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="buy-in"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.buyIn && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.buyIn}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="max-entries"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Max Entries
        </label>
        <input
          type="number"
          id="max-entries"
          value={formData.maxEntries}
          onChange={(e) => handleInputChange('maxEntries', e.target.value)}
          min="1"
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.maxEntries && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maxEntries}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="pool-url"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Pool Website URL (Optional)
        </label>
        <input
          type="url"
          id="pool-url"
          value={formData.url}
          onChange={(e) => handleInputChange('url', e.target.value)}
          placeholder="https://example.com/pool"
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.url && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.url}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is-active"
          checked={formData.isActive}
          onChange={(e) => handleInputChange('isActive', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor="is-active"
          className="ml-2 block text-sm text-gray-900 dark:text-white"
        >
          Pool is active
        </label>
      </div>

      {errors.submit && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Updating Pool...' : 'Update Pool'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}