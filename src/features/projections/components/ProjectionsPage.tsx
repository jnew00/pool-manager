'use client'

import { useState } from 'react'
import { ProjectionsList } from './ProjectionsList'

export function ProjectionsPage() {
  const [selectedWeek, setSelectedWeek] = useState(() => {
    // Calculate current NFL week (rough approximation)
    const now = new Date()
    const nflStart = new Date(now.getFullYear(), 8, 1) // September 1st
    const diffTime = now.getTime() - nflStart.getTime()
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
    return Math.max(1, Math.min(18, diffWeeks))
  })

  const [selectedSeason] = useState(new Date().getFullYear())

  // Generate week options
  const weekOptions = Array.from({ length: 18 }, (_, i) => i + 1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Game Projections
            </h1>
            <p className="mt-2 text-gray-600">
              AI-powered predictions with factor breakdowns
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="week-select"
                className="text-sm font-medium text-gray-700"
              >
                Week:
              </label>
              <select
                id="week-select"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {weekOptions.map((week) => (
                  <option key={week} value={week}>
                    Week {week}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-500">{selectedSeason} Season</div>
          </div>
        </div>

        {/* Model Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Predictive Model v1.0
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>
                  Our deterministic model combines market data (50%), team
                  ratings (30%), situational factors (20%) to generate
                  confidence scores. Higher scores indicate stronger prediction
                  confidence.
                </p>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                <strong>Factors:</strong> Market probability • Elo ratings •
                Home advantage • Rest differential • Weather impact • Injury
                adjustments
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projections List */}
      <ProjectionsList
        week={selectedWeek}
        season={selectedSeason}
        className="mb-8"
      />

      {/* Footer Info */}
      <div className="border-t pt-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">How to Use</h4>
            <ul className="space-y-1">
              <li>• Higher confidence = stronger prediction</li>
              <li>• Click "Show Details" for factor breakdown</li>
              <li>• Use filters to find specific game types</li>
              <li>• Projections update with latest data</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Confidence Levels
            </h4>
            <ul className="space-y-1">
              <li>
                • <span className="text-green-600 font-medium">85%+</span> Very
                High
              </li>
              <li>
                • <span className="text-blue-600 font-medium">70-84%</span> High
              </li>
              <li>
                • <span className="text-yellow-600 font-medium">60-69%</span>{' '}
                Moderate
              </li>
              <li>
                • <span className="text-orange-600 font-medium">55-59%</span>{' '}
                Low
              </li>
              <li>
                • <span className="text-red-600 font-medium">&lt;55%</span> Very
                Low
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Disclaimers</h4>
            <ul className="space-y-1">
              <li>• For entertainment purposes only</li>
              <li>• Past performance ≠ future results</li>
              <li>• Consider multiple factors when betting</li>
              <li>• Model accuracy varies by situation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
