'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Upload, Edit2, Save, X, FileText, Download, Globe } from 'lucide-react'

interface SpreadData {
  id: string
  gameId: string
  homeTeam: string
  awayTeam: string
  spread?: number
  total?: number
  moneylineHome?: number
  moneylineAway?: number
  source: string
  isUserProvided: boolean
  capturedAt: string
}

interface Game {
  id: string
  homeTeam: { nflAbbr: string; name: string }
  awayTeam: { nflAbbr: string; name: string }
  kickoff: string
  venue?: string
}

interface SpreadManagerProps {
  poolId: string
  season: number
  week: number
  onSpreadUpdate?: () => void
}

export function SpreadManager({ poolId, season, week, onSpreadUpdate }: SpreadManagerProps) {
  const [games, setGames] = useState<Game[]>([])
  const [espnSpreads, setEspnSpreads] = useState<SpreadData[]>([])
  const [uploadedSpreads, setUploadedSpreads] = useState<SpreadData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCsvUpload, setShowCsvUpload] = useState(false)
  const [uploadingCsv, setUploadingCsv] = useState(false)
  const [showNumber1PoolScraper, setShowNumber1PoolScraper] = useState(false)
  const [scrapingNumber1Pool, setScrapingNumber1Pool] = useState(false)
  const [number1PoolGames, setNumber1PoolGames] = useState<any[]>([])
  const [lastNumber1PoolUrl, setLastNumber1PoolUrl] = useState<string>('')
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    spread: '',
    total: '',
    moneylineHome: '',
    moneylineAway: ''
  })

  useEffect(() => {
    fetchData()
  }, [poolId, season, week])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch games for this week
      const gamesResponse = await fetch(`/api/games?season=${season}&week=${week}`)
      const gamesData = await gamesResponse.json()
      
      
      if (!gamesResponse.ok) {
        throw new Error(gamesData.error || 'Failed to fetch games')
      }

      setGames(gamesData.games || [])

      // Fetch ESPN general lines (poolId: null)
      const espnResponse = await fetch(`/api/lines?season=${season}&week=${week}`)
      if (espnResponse.ok) {
        const espnData = await espnResponse.json()
        setEspnSpreads(espnData.lines?.filter((line: any) => line.poolId === null) || [])
      } else {
        setEspnSpreads([])
      }

      // Fetch pool-specific uploaded spreads
      const uploadsResponse = await fetch(
        `/api/pools/${poolId}/spreads?season=${season}&week=${week}`
      )
      
      if (uploadsResponse.ok) {
        const uploadsData = await uploadsResponse.json()
        setUploadedSpreads(uploadsData.spreads || [])
      } else {
        setUploadedSpreads([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (gameId: string) => {
    const spread = uploadedSpreads.find(s => s.gameId === gameId)
    if (spread) {
      setEditForm({
        spread: spread.spread?.toString() || '',
        total: spread.total?.toString() || '',
        moneylineHome: spread.moneylineHome?.toString() || '',
        moneylineAway: spread.moneylineAway?.toString() || ''
      })
    } else {
      setEditForm({
        spread: '',
        total: '',
        moneylineHome: '',
        moneylineAway: ''
      })
    }
    setEditingId(gameId)
  }

  const handleSave = async (gameId: string) => {
    try {
      setError(null)
      
      const spreadData = {
        gameId,
        poolId,
        spread: editForm.spread ? parseFloat(editForm.spread) : null,
        total: editForm.total ? parseFloat(editForm.total) : null,
        moneylineHome: editForm.moneylineHome ? parseInt(editForm.moneylineHome) : null,
        moneylineAway: editForm.moneylineAway ? parseInt(editForm.moneylineAway) : null,
        source: 'user_provided',
        isUserProvided: true
      }

      const response = await fetch(`/api/pools/${poolId}/spreads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spreadData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save spread')
      }

      await fetchData()
      setEditingId(null)
      onSpreadUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save spread')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({
      spread: '',
      total: '',
      moneylineHome: '',
      moneylineAway: ''
    })
  }

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingCsv(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('poolId', poolId)
      formData.append('season', season.toString())
      formData.append('week', week.toString())

      const response = await fetch(`/api/pools/${poolId}/spreads/upload`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload CSV')
      }

      alert(`Successfully uploaded ${result.count} spreads`)
      await fetchData()
      setShowCsvUpload(false)
      onSpreadUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload CSV')
    } finally {
      setUploadingCsv(false)
      // Reset file input
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const generateNumber1PoolScript = () => {
    if (!number1PoolGames.length) {
      alert('No Number1Pool games data available. Please import spreads first.')
      return
    }

    // Generate JavaScript code to auto-fill the Number1Pool website
    const script = `
// Auto-fill script for Number1Pool website
// Generated from PoolManager - ${new Date().toLocaleString()}

console.log('Starting Number1Pool auto-fill...');

const games = ${JSON.stringify(number1PoolGames, null, 2)};

// Map to find select elements by game number
const gameSelects = {};

// Find all select elements that match the pattern for weekly picks
document.querySelectorAll('select[name^="Game_"]').forEach(select => {
  const match = select.name.match(/Game_(\\d+)/);
  if (match) {
    const gameNum = parseInt(match[1]);
    gameSelects[gameNum] = select;
  }
});

console.log('Found select elements for games:', Object.keys(gameSelects));

// Auto-fill based on games data (sorted by Number1Pool order)
games.forEach((game, index) => {
  const gameNumber = game.sortOrder || (index + 1);
  const select = gameSelects[gameNumber];

  if (select) {
    // 1 = Favorite (left column), 2 = Underdog (right column)
    // For ATS pools, typically pick the favorite
    const pickValue = '1'; // Pick favorite by default

    console.log(\`Setting Game \${gameNumber}: \${game.favorite} (Favorite) vs \${game.underdog} (Underdog) - Picking: \${pickValue}\`);

    select.value = pickValue;

    // Trigger change event
    const event = new Event('change', { bubbles: true });
    select.dispatchEvent(event);
  } else {
    console.warn(\`No select found for game \${gameNumber}\`);
  }
});

console.log('Auto-fill complete! Review your picks before submitting.');
    `.trim()

    // Copy to clipboard and show instructions
    navigator.clipboard.writeText(script).then(() => {
      alert(\`Auto-fill script copied to clipboard!

Instructions:
1. Open the Number1Pool website in a new tab: \${lastNumber1PoolUrl}
2. Open browser developer tools (F12)
3. Go to the Console tab
4. Paste the script and press Enter
5. Review the auto-filled picks (all favorites selected by default)
6. Modify any picks you want to change
7. Submit your picks

Note: This auto-fills with FAVORITES (1) by default. You can manually change any to UNDERDOGS (2) as needed.\`)
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err)
      alert('Failed to copy script to clipboard. Please copy manually from the console.')
      console.log('Auto-fill script:', script)
    })
  }

  const handleNumber1PoolScrape = async (url: string) => {
    setScrapingNumber1Pool(true)
    setError(null)

    try {
      const response = await fetch('/api/upload/number1pool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url,
          poolId 
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to scrape Number1Pool')
      }

      // Store the Number1Pool games data for auto-fill functionality
      console.log('Number1Pool API result:', result)
      if (result.number1poolGames && result.number1poolGames.length > 0) {
        console.log('Setting Number1Pool games:', result.number1poolGames)
        setNumber1PoolGames(result.number1poolGames)
        setLastNumber1PoolUrl(url)
      } else {
        console.log('No number1poolGames in result or empty array')
      }

      // Now save the scraped spreads to the pool
      if (result.spreads && result.spreads.length > 0) {
        const savePromises = result.spreads.map(async (spread: any) => {
          // Find the game for these teams
          const game = games.find(g => 
            (g.homeTeam.nflAbbr === spread.homeTeam && g.awayTeam.nflAbbr === spread.awayTeam) ||
            (g.awayTeam.nflAbbr === spread.homeTeam && g.homeTeam.nflAbbr === spread.awayTeam)
          )
          
          if (game) {
            const spreadData = {
              gameId: game.id,
              poolId,
              spread: spread.spread,
              source: 'number1pool',
              isUserProvided: true
            }

            return fetch(`/api/pools/${poolId}/spreads`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(spreadData),
            })
          }
        })

        await Promise.all(savePromises.filter(Boolean))
      }

      alert(`Successfully scraped and saved ${result.spreadsCount} spreads from Number1Pool`)
      await fetchData()
      setShowNumber1PoolScraper(false)
      onSpreadUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape Number1Pool')
    } finally {
      setScrapingNumber1Pool(false)
    }
  }

  const exportToCsv = () => {
    const headers = ['Away Team', 'Home Team', 'ESPN Spread', 'Uploaded Spread', 'ESPN Total', 'Uploaded Total', 'ESPN ML Home', 'Uploaded ML Home', 'ESPN ML Away', 'Uploaded ML Away']
    const csvData = [
      headers.join(','),
      ...games.map(game => {
        const espnSpread = espnSpreads.find(s => s.gameId === game.id)
        const uploadedSpread = uploadedSpreads.find(s => s.gameId === game.id)
        return [
          game.awayTeam.nflAbbr,
          game.homeTeam.nflAbbr,
          espnSpread?.spread || '',
          uploadedSpread?.spread || '',
          espnSpread?.total || '',
          uploadedSpread?.total || '',
          espnSpread?.moneylineHome || '',
          uploadedSpread?.moneylineHome || '',
          espnSpread?.moneylineAway || '',
          uploadedSpread?.moneylineAway || ''
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spreads_week_${week}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }


  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Spread Management - Week {week}
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading spread data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Spread Management - Week {week}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload CSV files or edit spreads inline for this pool
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportToCsv}
            className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => setShowNumber1PoolScraper(!showNumber1PoolScraper)}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <Globe className="w-4 h-4 mr-2" />
            Number1Pool
          </button>
          <button
            onClick={() => setShowCsvUpload(!showCsvUpload)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* CSV Upload Panel */}
      {showCsvUpload && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Upload Spreads CSV
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Upload a CSV file with columns: Away Team, Home Team, Spread, Total, ML Home, ML Away
              </p>
            </div>
            <button
              onClick={() => setShowCsvUpload(false)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              disabled={uploadingCsv}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300"
            />
            {uploadingCsv && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </div>
          
          <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
            <p>Expected CSV format:</p>
            <code className="bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded">
              Away Team,Home Team,Spread,Total,ML Home,ML Away
            </code>
          </div>
        </div>
      )}

      {/* Number1Pool Scraper Panel */}
      {showNumber1PoolScraper && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                Import from Number1Pool
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Enter your Number1Pool weekly picks URL to automatically import spreads
              </p>
            </div>
            <button
              onClick={() => setShowNumber1PoolScraper(false)}
              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="number1pool-url" className="block text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                Number1Pool Weekly Picks URL
              </label>
              <input
                id="number1pool-url"
                type="url"
                placeholder="https://number1pool.com/picks_weekly.php?user=YourUser&verify=..."
                className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const url = (e.target as HTMLInputElement).value
                    if (url.trim()) {
                      handleNumber1PoolScrape(url.trim())
                    }
                  }
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-green-600 dark:text-green-400">
                <p>Example URL format:</p>
                <code className="bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded text-xs">
                  https://number1pool.com/picks_weekly.php?user=GatorBait&verify=970622f774ee22dcef22f41487b87fa3
                </code>
              </div>
              
              {scrapingNumber1Pool && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                  <span className="text-sm text-green-600 dark:text-green-400">Scraping spreads...</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  const input = document.getElementById('number1pool-url') as HTMLInputElement
                  const url = input?.value?.trim()
                  if (url) {
                    handleNumber1PoolScrape(url)
                  }
                }}
                disabled={scrapingNumber1Pool}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors"
              >
                {scrapingNumber1Pool ? 'Importing...' : 'Import Spreads'}
              </button>

              {/* Debug: Always show this section for now */}
              <div className="border-t border-green-200 dark:border-green-600 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Auto-fill Number1Pool ({number1PoolGames.length} games imported)
                  </span>
                </div>
                {number1PoolGames.length > 0 ? (
                  <>
                    <button
                      onClick={generateNumber1PoolScript}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Generate Auto-Fill Script</span>
                    </button>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Generates script to auto-fill picks on Number1Pool website (defaults to all favorites)
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Import spreads first to enable auto-fill functionality
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spreads Table */}
      {games.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Matchup
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kickoff
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    ESPN Spread
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Uploaded Spread
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    ESPN Total
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Uploaded Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {games.map((game) => {
                  const espnSpread = espnSpreads.find(s => s.gameId === game.id)
                  const uploadedSpread = uploadedSpreads.find(s => s.gameId === game.id)
                  const isEditing = editingId === game.id
                  
                  return (
                    <tr key={game.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {game.awayTeam.nflAbbr} @ {game.homeTeam.nflAbbr}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {game.venue}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(game.kickoff).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      
                      {/* ESPN Spread */}
                      <td className="px-3 py-4 whitespace-nowrap text-center border-r border-gray-200 dark:border-gray-600">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {espnSpread?.spread ? (espnSpread.spread > 0 ? `+${espnSpread.spread}` : espnSpread.spread) : '-'}
                        </span>
                      </td>
                      
                      {/* Uploaded Spread (Editable) */}
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editForm.spread}
                            onChange={(e) => setEditForm({...editForm, spread: e.target.value})}
                            className="w-20 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="-3.5"
                          />
                        ) : (
                          <span className={`text-sm font-medium ${uploadedSpread?.spread ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                            {uploadedSpread?.spread ? (uploadedSpread.spread > 0 ? `+${uploadedSpread.spread}` : uploadedSpread.spread) : '-'}
                          </span>
                        )}
                      </td>
                      
                      {/* ESPN Total */}
                      <td className="px-3 py-4 whitespace-nowrap text-center border-r border-gray-200 dark:border-gray-600">
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          {espnSpread?.total || '-'}
                        </span>
                      </td>
                      
                      {/* Uploaded Total (Editable) */}
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editForm.total}
                            onChange={(e) => setEditForm({...editForm, total: e.target.value})}
                            className="w-20 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="47.5"
                          />
                        ) : (
                          <span className={`text-sm ${uploadedSpread?.total ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                            {uploadedSpread?.total || '-'}
                          </span>
                        )}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {isEditing ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSave(game.id)}
                              className="inline-flex items-center px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium transition-colors"
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(game.id)}
                            className="inline-flex items-center px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition-colors"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>No games found for Week {week}</p>
          <p className="text-sm mt-1">
            Use "Update Odds & Weather" to fetch game schedule first
          </p>
        </div>
      )}
    </div>
  )
}