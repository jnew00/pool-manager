import React, { useState, useMemo } from 'react'
import type { GameData, ValidationResult } from '../lib/upload-validator'
import { UploadValidator } from '../lib/upload-validator'

interface DataPreviewProps {
  games: GameData[]
  validationResults: ValidationResult[]
  onConfirm: (validGames: GameData[]) => void
  onCancel: () => void
  className?: string
}

type FilterType = 'all' | 'valid' | 'invalid'

export function DataPreview({
  games,
  validationResults,
  onConfirm,
  onCancel,
  className,
}: DataPreviewProps) {
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<FilterType>('all')

  const itemsPerPage = 20
  const validator = new UploadValidator()

  // Generate summary
  const summary = useMemo(() => {
    return validator.getSummary(validationResults)
  }, [validationResults])

  // Filter games based on current filter
  const filteredData = useMemo(() => {
    const gameResults = games.map((game, index) => ({
      game,
      validation: validationResults[index],
      originalIndex: index,
    }))

    switch (filter) {
      case 'valid':
        return gameResults.filter((item) => item.validation.valid)
      case 'invalid':
        return gameResults.filter((item) => !item.validation.valid)
      default:
        return gameResults
    }
  }, [games, validationResults, filter])

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const validGames = games.filter((_, index) => validationResults[index].valid)
  const hasValidGames = validGames.length > 0

  const handleRowClick = (index: number) => {
    setSelectedRowIndex(selectedRowIndex === index ? null : index)
  }

  const handleConfirm = () => {
    onConfirm(validGames)
  }

  const getImportButtonText = () => {
    if (summary.valid === 0) return 'Import Data'
    if (summary.invalid === 0) return 'Import Data'
    return 'Import Valid Data'
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold">Data Preview</h2>
          <p className="text-gray-600 mt-1">
            Review your data before importing. Click on rows to see validation
            details.
          </p>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {summary.total}
              </div>
              <div className="text-sm text-gray-600">Total Games</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {summary.valid}
              </div>
              <div className="text-sm text-gray-600">Valid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {summary.invalid}
              </div>
              <div className="text-sm text-gray-600">Invalid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {summary.warnings}
              </div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Show All
          </button>
          <button
            onClick={() => setFilter('valid')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'valid'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Show Valid Only
          </button>
          <button
            onClick={() => setFilter('invalid')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'invalid'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Show Invalid Only
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Away
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Home
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Spread
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(
                ({ game, validation, originalIndex }, displayIndex) => (
                  <React.Fragment key={originalIndex}>
                    <tr
                      onClick={() => handleRowClick(originalIndex)}
                      className={`
                      cursor-pointer border-t border-gray-200 hover:bg-gray-50
                      ${!validation.valid ? 'bg-red-50' : ''}
                      ${selectedRowIndex === originalIndex ? 'bg-blue-50' : ''}
                    `}
                    >
                      <td className="px-4 py-3">
                        {validation.valid ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{game.date}</td>
                      <td className="px-4 py-3 text-sm">{game.time}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {game.away_team}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {game.home_team}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {game.spread || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">{game.total || '-'}</td>
                    </tr>

                    {/* Error Details Row */}
                    {selectedRowIndex === originalIndex &&
                      !validation.valid && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-3 bg-red-100 border-t border-red-200"
                          >
                            <div className="space-y-1">
                              <div className="font-medium text-red-800">
                                Validation Errors:
                              </div>
                              {validation.errors.map((error, errorIndex) => (
                                <div
                                  key={errorIndex}
                                  className="text-sm text-red-700"
                                >
                                  • {error}
                                </div>
                              ))}
                              {validation.warnings.length > 0 && (
                                <>
                                  <div className="font-medium text-yellow-800 mt-2">
                                    Warnings:
                                  </div>
                                  {validation.warnings.map(
                                    (warning, warningIndex) => (
                                      <div
                                        key={warningIndex}
                                        className="text-sm text-yellow-700"
                                      >
                                        • {warning}
                                      </div>
                                    )
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                  </React.Fragment>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({filteredData.length} games)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasValidGames}
            className={`
              px-6 py-2 rounded-md font-medium
              ${
                hasValidGames
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {getImportButtonText()} ({validGames.length})
          </button>
        </div>
      </div>
    </div>
  )
}
