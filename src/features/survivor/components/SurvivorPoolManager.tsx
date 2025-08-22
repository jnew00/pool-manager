'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Settings,
  Users,
  UserPlus,
  XCircle,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Trophy,
  Shield,
  DollarSign,
  Clock,
  Zap,
} from 'lucide-react'

export interface SurvivorEntry {
  id: string
  entryName: string
  userId: string | null
  isActive: boolean
  strikes: number
  eliminatedWeek: number | null
  picks?: Array<{
    week: number
    teamId: string
    teamAbbr: string
    result: 'WIN' | 'LOSS' | 'PENDING' | null
  }>
}

interface PoolSettings {
  maxStrikes: number
  allowLatePicks: boolean
  multiEntry: boolean
  maxEntriesPerUser: number
  buybackEnabled: boolean
  buybackCost: number
  buybackDeadlineWeek: number
  tiebreakerMethod: 'MARGIN_OF_VICTORY' | 'HIGHEST_SEED' | 'RANDOM'
  publicPicksEnabled: boolean
  publicPicksDelay: number // hours after kickoff
}

interface SurvivorPoolManagerProps {
  poolId: string
  isAdmin?: boolean
}

export default function SurvivorPoolManager({
  poolId,
  isAdmin = false,
}: SurvivorPoolManagerProps) {
  const [entries, setEntries] = useState<SurvivorEntry[]>([])
  const [poolSettings, setPoolSettings] = useState<PoolSettings>({
    maxStrikes: 1,
    allowLatePicks: false,
    multiEntry: true,
    maxEntriesPerUser: 3,
    buybackEnabled: false,
    buybackCost: 100,
    buybackDeadlineWeek: 6,
    tiebreakerMethod: 'MARGIN_OF_VICTORY',
    publicPicksEnabled: true,
    publicPicksDelay: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<SurvivorEntry | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [newEntryName, setNewEntryName] = useState('')

  useEffect(() => {
    fetchEntries()
    fetchPoolSettings()
  }, [poolId])

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/survivor/pools/${poolId}/entries`)
      if (response.ok) {
        const data = await response.json()
        setEntries(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPoolSettings = async () => {
    try {
      const response = await fetch(`/api/survivor/pools/${poolId}/settings`)
      if (response.ok) {
        const data = await response.json()
        setPoolSettings(data.settings || poolSettings)
      }
    } catch (error) {
      console.error('Failed to fetch pool settings:', error)
    }
  }

  const createEntry = async () => {
    if (!newEntryName.trim()) return

    try {
      const response = await fetch(`/api/survivor/pools/${poolId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newEntryName }),
      })

      if (response.ok) {
        await fetchEntries()
        setNewEntryName('')
        setShowCreateDialog(false)
      }
    } catch (error) {
      console.error('Failed to create entry:', error)
    }
  }

  const eliminateEntry = async (entryId: string, week: number) => {
    if (!confirm('Are you sure you want to eliminate this entry?')) return

    try {
      const response = await fetch(
        `/api/survivor/pools/${poolId}/entries/${entryId}/eliminate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ week }),
        }
      )

      if (response.ok) {
        await fetchEntries()
      }
    } catch (error) {
      console.error('Failed to eliminate entry:', error)
    }
  }

  const reinstateEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to reinstate this entry?')) return

    try {
      const response = await fetch(
        `/api/survivor/pools/${poolId}/entries/${entryId}/reinstate`,
        {
          method: 'POST',
        }
      )

      if (response.ok) {
        await fetchEntries()
      }
    } catch (error) {
      console.error('Failed to reinstate entry:', error)
    }
  }

  const updatePoolSettings = async () => {
    try {
      const response = await fetch(`/api/survivor/pools/${poolId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poolSettings),
      })

      if (response.ok) {
        setShowSettingsDialog(false)
      }
    } catch (error) {
      console.error('Failed to update pool settings:', error)
    }
  }

  const activeEntries = entries.filter((e) => e.isActive)
  const eliminatedEntries = entries.filter((e) => !e.isActive)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading pool management...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pool Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Pool Management
            </span>
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettingsDialog(true)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Button>
                <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add Entry
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{entries.length}</div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activeEntries.length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {eliminatedEntries.length}
              </div>
              <div className="text-sm text-gray-600">Eliminated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activeEntries.length > 0
                  ? `${((activeEntries.length / entries.length) * 100).toFixed(1)}%`
                  : '0%'}
              </div>
              <div className="text-sm text-gray-600">Survival Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Active Entries ({activeEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entry Name</TableHead>
                <TableHead>Strikes</TableHead>
                <TableHead>Picks Made</TableHead>
                <TableHead>Last Pick</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {entry.entryName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={entry.strikes > 0 ? 'destructive' : 'default'}
                    >
                      {entry.strikes} / {poolSettings.maxStrikes}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.picks?.length || 0}</TableCell>
                  <TableCell>
                    {entry.picks && entry.picks.length > 0
                      ? `Week ${entry.picks[entry.picks.length - 1].week}: ${
                          entry.picks[entry.picks.length - 1].teamAbbr
                        }`
                      : 'None'}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            eliminateEntry(entry.id, entry.picks.length + 1)
                          }
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {activeEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No active entries
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Eliminated Entries */}
      {eliminatedEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Eliminated Entries ({eliminatedEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entry Name</TableHead>
                  <TableHead>Eliminated Week</TableHead>
                  <TableHead>Final Strikes</TableHead>
                  <TableHead>Weeks Survived</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {eliminatedEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.entryName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        Week {entry.eliminatedWeek}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.strikes}</TableCell>
                    <TableCell>{entry.picks.length}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => reinstateEntry(entry.id)}
                        >
                          Reinstate
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Entry Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Entry</DialogTitle>
            <DialogDescription>
              Add a new entry to the survivor pool
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="entryName">Entry Name</Label>
              <Input
                id="entryName"
                value={newEntryName}
                onChange={(e) => setNewEntryName(e.target.value)}
                placeholder="Enter entry name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={createEntry}>Create Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pool Settings</DialogTitle>
            <DialogDescription>
              Configure survivor pool rules and options
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxStrikes">Max Strikes Allowed</Label>
                <Select
                  value={poolSettings.maxStrikes.toString()}
                  onValueChange={(value) =>
                    setPoolSettings({
                      ...poolSettings,
                      maxStrikes: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 (Single Elimination)</SelectItem>
                    <SelectItem value="1">1 Strike</SelectItem>
                    <SelectItem value="2">2 Strikes</SelectItem>
                    <SelectItem value="3">3 Strikes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxEntries">Max Entries Per User</Label>
                <Input
                  id="maxEntries"
                  type="number"
                  value={poolSettings.maxEntriesPerUser}
                  onChange={(e) =>
                    setPoolSettings({
                      ...poolSettings,
                      maxEntriesPerUser: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowLate">Allow Late Picks</Label>
                  <p className="text-sm text-gray-500">
                    Allow picks after games start
                  </p>
                </div>
                <Switch
                  id="allowLate"
                  checked={poolSettings.allowLatePicks}
                  onCheckedChange={(checked) =>
                    setPoolSettings({
                      ...poolSettings,
                      allowLatePicks: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="multiEntry">Multi-Entry</Label>
                  <p className="text-sm text-gray-500">
                    Allow multiple entries per user
                  </p>
                </div>
                <Switch
                  id="multiEntry"
                  checked={poolSettings.multiEntry}
                  onCheckedChange={(checked) =>
                    setPoolSettings({ ...poolSettings, multiEntry: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="buyback">Enable Buyback</Label>
                  <p className="text-sm text-gray-500">
                    Allow eliminated entries to buy back in
                  </p>
                </div>
                <Switch
                  id="buyback"
                  checked={poolSettings.buybackEnabled}
                  onCheckedChange={(checked) =>
                    setPoolSettings({
                      ...poolSettings,
                      buybackEnabled: checked,
                    })
                  }
                />
              </div>

              {poolSettings.buybackEnabled && (
                <div className="grid grid-cols-2 gap-4 pl-8">
                  <div>
                    <Label htmlFor="buybackCost">Buyback Cost ($)</Label>
                    <Input
                      id="buybackCost"
                      type="number"
                      value={poolSettings.buybackCost}
                      onChange={(e) =>
                        setPoolSettings({
                          ...poolSettings,
                          buybackCost: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="buybackDeadline">
                      Buyback Deadline (Week)
                    </Label>
                    <Input
                      id="buybackDeadline"
                      type="number"
                      value={poolSettings.buybackDeadlineWeek}
                      onChange={(e) =>
                        setPoolSettings({
                          ...poolSettings,
                          buybackDeadlineWeek: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="publicPicks">Public Picks</Label>
                  <p className="text-sm text-gray-500">
                    Show other entries' picks
                  </p>
                </div>
                <Switch
                  id="publicPicks"
                  checked={poolSettings.publicPicksEnabled}
                  onCheckedChange={(checked) =>
                    setPoolSettings({
                      ...poolSettings,
                      publicPicksEnabled: checked,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tiebreaker">Tiebreaker Method</Label>
              <Select
                value={poolSettings.tiebreakerMethod}
                onValueChange={(value: any) =>
                  setPoolSettings({ ...poolSettings, tiebreakerMethod: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MARGIN_OF_VICTORY">
                    Margin of Victory
                  </SelectItem>
                  <SelectItem value="HIGHEST_SEED">Highest Seed</SelectItem>
                  <SelectItem value="RANDOM">Random Draw</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={updatePoolSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Entry Details Dialog */}
      <Dialog
        open={!!selectedEntry}
        onOpenChange={() => setSelectedEntry(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Entry Details: {selectedEntry?.entryName}
            </DialogTitle>
            <DialogDescription>
              View complete pick history and entry statistics
            </DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-4">
              {/* Entry Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedEntry.isActive ? 'Active' : 'Eliminated'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedEntry.strikes}
                  </div>
                  <div className="text-sm text-gray-600">Strikes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedEntry.picks?.filter((p) => p.result === 'WIN')
                      .length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {selectedEntry.eliminatedWeek || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Eliminated Week</div>
                </div>
              </div>

              {/* Pick History */}
              {selectedEntry.picks && selectedEntry.picks.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Pick History</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedEntry.picks.map((pick, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Week {pick.week}</Badge>
                          <span className="font-medium">{pick.teamAbbr}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {pick.result === 'WIN' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {pick.result === 'LOSS' && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          {pick.result === 'PENDING' && (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <Badge
                            variant={
                              pick.result === 'WIN'
                                ? 'default'
                                : pick.result === 'LOSS'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {pick.result || 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Navigate to the entry's pick page
                    window.location.href = `/survivor/${poolId}?entryId=${selectedEntry.id}`
                  }}
                >
                  View Picks
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedEntry(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
