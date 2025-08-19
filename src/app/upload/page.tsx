'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  FileUpload,
  ColumnMapper,
  DataPreview,
} from '@/features/uploads/components'
import {
  UploadValidator,
  CsvParser,
  type GameData,
  type ValidationResult,
} from '@/features/uploads/lib'

type UploadStep = 'upload' | 'mapping' | 'preview' | 'success'

interface ColumnMapping {
  [key: string]: string
}

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState<UploadStep>('upload')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [gameData, setGameData] = useState<GameData[]>([])
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requiredFields = [
    { key: 'date', label: 'Date', required: true },
    { key: 'time', label: 'Time', required: true },
    { key: 'away_team', label: 'Away Team', required: true },
    { key: 'home_team', label: 'Home Team', required: true },
    { key: 'spread', label: 'Spread', required: false },
    { key: 'total', label: 'Total', required: false },
  ]

  const handleFileUpload = async (files: File[]) => {
    setError(null)
    setIsProcessing(true)

    try {
      const file = files[0]
      setUploadedFiles(files)

      // Check file type
      const fileName = file.name.toLowerCase()
      const isCSV = fileName.endsWith('.csv')
      const isImage =
        fileName.endsWith('.png') ||
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.jpeg')

      if (isCSV) {
        // Handle CSV files
        const csvText = await file.text()
        const parser = new CsvParser()
        const headers = parser.parseHeaders(csvText)

        // Parse data with empty mapping to get raw rows
        const delimiter = parser.detectDelimiter(csvText)
        const lines = csvText.split('\n').filter((line) => line.trim())
        const dataRows = lines.slice(1).map((line) => {
          const values = line.split(delimiter)
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })
          return row
        })

        setCsvData(dataRows)
        setCsvHeaders(headers)
        setCurrentStep('mapping')
      } else if (isImage) {
        // Handle image files with OCR + LLM processing
        const formData = new FormData()
        formData.append('file', file)
        formData.append('season', new Date().getFullYear().toString())
        formData.append('week', '1') // Could be dynamic in the future

        const response = await fetch('/api/upload/ocr', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to process image')
        }

        // Handle case where OCR worked but LLM is disabled
        if (!result.success && result.extractedText) {
          setError(
            `${result.error}\n\nExtracted text:\n${result.extractedText}`
          )
          return
        }

        if (!result.success) {
          throw new Error(result.error || 'Failed to process image')
        }

        // Convert OCR result to our internal format
        const games = result.data.games.map((game: any) => ({
          season: game.season,
          week: game.week,
          date: game.kickoff_et.split('T')[0],
          time: game.kickoff_et.split('T')[1]?.substring(0, 5) || '',
          away_team: game.away_team,
          home_team: game.home_team,
          spread: game.spread_for_home?.toString() || '',
          total: game.total?.toString() || '',
        }))

        setGameData(games)

        // Create validation results (OCR + LLM should be quite accurate)
        const validator = new UploadValidator()
        const results = games.map((game) => validator.validateGameData(game))
        setValidationResults(results)

        // Show processing info to user
        const processingInfo = [
          `✓ OCR extracted text with ${result.data.ocrConfidence.toFixed(1)}% confidence`,
          `✓ LLM normalized ${games.length} games using ${result.data.llmProvider}`,
          ...(result.data.estimatedCostUSD
            ? [`✓ Estimated cost: $${result.data.estimatedCostUSD.toFixed(4)}`]
            : []),
        ].join('\n')

        console.log('Image processing completed:', processingInfo)
        setCurrentStep('preview')
      } else {
        throw new Error('Please upload a CSV file or image (PNG, JPG, JPEG)')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMappingComplete = (mapping: ColumnMapping) => {
    setError(null)
    setIsProcessing(true)

    try {
      setColumnMapping(mapping)

      // Transform CSV data to GameData format
      const games: GameData[] = csvData.map((row) => {
        const game: GameData = {
          date: row[mapping.date] || '',
          time: row[mapping.time] || '',
          away_team: row[mapping.away_team] || '',
          home_team: row[mapping.home_team] || '',
        }

        if (mapping.spread && row[mapping.spread]) {
          game.spread = parseFloat(row[mapping.spread])
        }

        if (mapping.total && row[mapping.total]) {
          game.total = parseFloat(row[mapping.total])
        }

        return game
      })

      // Validate the data
      const validator = new UploadValidator()
      const results = games.map((game) => validator.validateGame(game))

      setGameData(games)
      setValidationResults(results)
      setCurrentStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process data')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmImport = async (validGames: GameData[]) => {
    setError(null)
    setIsProcessing(true)

    try {
      // Submit to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          games: validGames,
          filename: uploadedFiles[0]?.name,
          kind: 'CSV',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import data')
      }

      setCurrentStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStartOver = () => {
    setCurrentStep('upload')
    setUploadedFiles([])
    setCsvData([])
    setCsvHeaders([])
    setColumnMapping({})
    setGameData([])
    setValidationResults([])
    setError(null)
  }

  const getStepNumber = (step: UploadStep): number => {
    switch (step) {
      case 'upload':
        return 1
      case 'mapping':
        return 2
      case 'preview':
        return 3
      case 'success':
        return 4
      default:
        return 1
    }
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {(['upload', 'mapping', 'preview', 'success'] as UploadStep[]).map(
          (step, index) => {
            const stepNumber = index + 1
            const currentStepNumber = getStepNumber(currentStep)
            const isActive = stepNumber === currentStepNumber
            const isCompleted = stepNumber < currentStepNumber
            const isDisabled = stepNumber > currentStepNumber

            return (
              <div key={step} className="flex items-center">
                <div
                  className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${isActive ? 'bg-blue-600 text-white' : ''}
                ${isCompleted ? 'bg-green-600 text-white' : ''}
                ${isDisabled ? 'bg-gray-300 text-gray-500' : ''}
              `}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>
                {index < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      stepNumber < currentStepNumber
                        ? 'bg-green-600'
                        : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            )
          }
        )}
      </div>
      <div className="flex justify-center mt-2">
        <div className="text-sm text-gray-600">
          Step {getStepNumber(currentStep)} of 4
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">PM</span>
              </div>
              <div>
                <Link
                  href="/"
                  className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600"
                >
                  PoolManager
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  NFL Pool System
                </p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/pools"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Pools
              </Link>
              <Link
                href="/picks"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Picks
              </Link>
              <Link
                href="/standings"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Standings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Data Upload
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Import games and odds data from CSV files or images
          </p>
        </div>

        {renderStepIndicator()}

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center py-8 mb-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Processing...
                  </p>
                </div>
              </div>
            )}

            {currentStep === 'upload' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Upload Your Data
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Select a CSV file or image containing game data, odds, or
                  other pool information. Images will be processed with OCR and
                  AI normalization.
                </p>
                <FileUpload onUpload={handleFileUpload} />
              </div>
            )}

            {currentStep === 'mapping' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Map Columns
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Tell us which columns in your CSV correspond to which data
                  fields.
                </p>
                <ColumnMapper
                  csvHeaders={csvHeaders}
                  targetFields={requiredFields}
                  onMappingChange={handleMappingComplete}
                  autoDetect={true}
                />
                <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                  <button
                    onClick={handleStartOver}
                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'preview' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Preview & Validate
                </h2>
                <DataPreview
                  games={gameData}
                  validationResults={validationResults}
                  onConfirm={handleConfirmImport}
                  onCancel={handleStartOver}
                />
              </div>
            )}

            {currentStep === 'success' && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Upload Complete!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto">
                  Your data has been successfully imported and is now available
                  in the system.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleStartOver}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Upload More Data
                  </button>
                  <Link
                    href="/pools"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Manage Pools
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
