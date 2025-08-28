'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Pencil, X, Check } from 'lucide-react'

interface SpreadData {
  gameId?: string
  homeTeam: string
  awayTeam: string
  spread: number | null
  matched: boolean
}

interface EditableSpreadProps {
  spreads: SpreadData[]
  onSave: (spreads: SpreadData[]) => Promise<void>
  onCancel: () => void
}

export function EditableSpreadsTable({ spreads: initialSpreads, onSave, onCancel }: EditableSpreadProps) {
  const [spreads, setSpreads] = useState(initialSpreads)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditValue(spreads[index].spread?.toString() || '')
  }

  const handleSaveEdit = (index: number) => {
    const newSpreads = [...spreads]
    newSpreads[index] = {
      ...newSpreads[index],
      spread: editValue ? parseFloat(editValue) : null
    }
    setSpreads(newSpreads)
    setEditingIndex(null)
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditValue('')
  }

  const handleSwapTeams = (index: number) => {
    const newSpreads = [...spreads]
    const spread = newSpreads[index]
    newSpreads[index] = {
      ...spread,
      homeTeam: spread.awayTeam,
      awayTeam: spread.homeTeam,
      spread: spread.spread ? -spread.spread : null
    }
    setSpreads(newSpreads)
  }

  const handleRemove = (index: number) => {
    setSpreads(spreads.filter((_, i) => i !== index))
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      await onSave(spreads)
    } finally {
      setIsSaving(false)
    }
  }

  const matchedCount = spreads.filter(s => s.matched).length
  const unmatchedCount = spreads.filter(s => !s.matched).length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Review Uploaded Spreads
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <span className="text-green-600 dark:text-green-400 font-medium">
              {matchedCount} matched
            </span>
            {unmatchedCount > 0 && (
              <span className="text-red-600 dark:text-red-400 font-medium ml-3">
                {unmatchedCount} need attention
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSaving || unmatchedCount === spreads.length}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : `Save ${matchedCount} Spreads`}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Away Team
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                @
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Home Team
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Spread
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {spreads.map((spread, index) => (
              <tr key={index} className={!spread.matched ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                <td className="px-4 py-3 whitespace-nowrap">
                  {spread.matched ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {spread.awayTeam}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                  @
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {spread.homeTeam}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {editingIndex === index ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(index)}
                        className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span className={`font-medium ${spread.spread && spread.spread > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {spread.spread ? (spread.spread > 0 ? '+' : '') + spread.spread : 'N/A'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editingIndex !== index && (
                      <>
                        <button
                          onClick={() => handleEdit(index)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Edit spread"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSwapTeams(index)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Swap home/away"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemove(index)}
                          className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                          title="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {spreads.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No spreads to display
        </div>
      )}
    </div>
  )
}