'use client'

import { useState } from 'react'
import type { PoolType } from '@/lib/types/database'

export interface StandingEntry {
  entryId: string
  rank: number
  wins: number
  losses: number
  pushes: number
  voids: number
  totalPicks: number
  totalPoints: number
  winPercentage: number
  isEliminated?: boolean
  eliminatedWeek?: number
}

interface StandingsTableProps {
  standings: StandingEntry[]
  poolType: PoolType
  onEntryClick: (entryId: string) => void
  currentUserEntryId?: string
  isLoading?: boolean
  filterText?: string
}

type SortField = 'rank' | 'wins' | 'losses' | 'winPercentage' | 'totalPoints'
type SortDirection = 'asc' | 'desc'

export function StandingsTable({
  standings,
  poolType,
  onEntryClick,
  currentUserEntryId,
  isLoading = false,
  filterText = '',
}: StandingsTableProps) {
  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Filter standings based on filter text
  const filteredStandings = standings.filter((entry) =>
    entry.entryId.toLowerCase().includes(filterText.toLowerCase())
  )

  // Sort standings
  const sortedStandings = [...filteredStandings].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }
    return 0
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection(field === 'rank' ? 'asc' : 'desc') // Rank ascending by default, others descending
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const formatPoints = (value: number) => {
    return value.toFixed(1)
  }

  const getSurvivorStatus = (entry: StandingEntry) => {
    if (entry.isEliminated) {
      return `Eliminated (Week ${entry.eliminatedWeek})`
    }
    return 'Active'
  }

  const hasAnyPushes = standings.some((s) => s.pushes > 0)
  const hasAnyVoids = standings.some((s) => s.voids > 0)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading standings...</div>
      </div>
    )
  }

  if (sortedStandings.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">
          {filterText
            ? 'No entries match your filter'
            : 'No standings available'}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('rank')}
            >
              Rank {getSortIcon('rank')}
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
              Entry
            </th>
            <th
              className="px-4 py-2 text-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('wins')}
            >
              W {getSortIcon('wins')}
            </th>
            <th
              className="px-4 py-2 text-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('losses')}
            >
              L {getSortIcon('losses')}
            </th>
            {hasAnyPushes && (
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                P
              </th>
            )}
            {hasAnyVoids && (
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                V
              </th>
            )}
            <th
              className="px-4 py-2 text-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('winPercentage')}
            >
              Win % {getSortIcon('winPercentage')}
            </th>
            <th
              className="px-4 py-2 text-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('totalPoints')}
            >
              Points {getSortIcon('totalPoints')}
            </th>
            {poolType === 'SURVIVOR' && (
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                Status
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedStandings.map((entry) => (
            <tr
              key={entry.entryId}
              className={`
                cursor-pointer hover:bg-gray-50 transition-colors
                ${currentUserEntryId === entry.entryId ? 'bg-blue-50' : ''}
                ${entry.isEliminated ? 'opacity-60' : ''}
              `}
              onClick={() => onEntryClick(entry.entryId)}
            >
              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                {entry.rank}
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">
                {entry.entryId}
                {currentUserEntryId === entry.entryId && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    You
                  </span>
                )}
              </td>
              <td className="px-4 py-2 text-center text-sm text-gray-900">
                {entry.wins}
              </td>
              <td className="px-4 py-2 text-center text-sm text-gray-900">
                {entry.losses}
              </td>
              {hasAnyPushes && (
                <td className="px-4 py-2 text-center text-sm text-gray-500">
                  {entry.pushes}
                </td>
              )}
              {hasAnyVoids && (
                <td className="px-4 py-2 text-center text-sm text-gray-500">
                  {entry.voids}
                </td>
              )}
              <td className="px-4 py-2 text-center text-sm text-gray-900">
                {formatPercentage(entry.winPercentage)}
              </td>
              <td className="px-4 py-2 text-center text-sm text-gray-900">
                {formatPoints(entry.totalPoints)}
              </td>
              {poolType === 'SURVIVOR' && (
                <td className="px-4 py-2 text-center text-sm">
                  <span
                    className={`
                    px-2 py-1 rounded text-xs font-medium
                    ${
                      entry.isEliminated
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }
                  `}
                  >
                    {getSurvivorStatus(entry)}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
