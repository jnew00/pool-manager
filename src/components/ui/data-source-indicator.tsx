'use client'

import { Badge } from './badge'
import { Alert, AlertDescription } from './alert'
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'

export interface DataSourceStatus {
  available: boolean
  seasonActive: boolean
  currentWeek: number
  message: string
}

interface DataSourceIndicatorProps {
  status?: DataSourceStatus
  className?: string
  showDetails?: boolean
}

export function DataSourceIndicator({
  status,
  className = '',
  showDetails = true,
}: DataSourceIndicatorProps) {
  if (!status) {
    return (
      <Badge variant="outline" className={className}>
        <AlertTriangle className="h-3 w-3 mr-1" />
        Data Status Unknown
      </Badge>
    )
  }

  const { available, seasonActive, currentWeek, message } = status

  // Determine badge variant and icon
  let variant: 'default' | 'secondary' | 'destructive' | 'outline'
  let icon: React.ReactNode
  let text: string

  if (available && seasonActive) {
    variant = 'default'
    icon = <CheckCircle className="h-3 w-3 mr-1" />
    text = `Live Data - Week ${currentWeek}`
  } else if (available && !seasonActive && currentWeek > 18) {
    variant = 'secondary'
    icon = <Info className="h-3 w-3 mr-1" />
    text = 'Final Season Data'
  } else if (available && !seasonActive && currentWeek === 0) {
    variant = 'outline'
    icon = <AlertTriangle className="h-3 w-3 mr-1" />
    text = 'Preseason/Historical Data'
  } else {
    variant = 'destructive'
    icon = <XCircle className="h-3 w-3 mr-1" />
    text = 'Mock Data'
  }

  return (
    <div className={className}>
      <Badge variant={variant}>
        {icon}
        {text}
      </Badge>

      {showDetails && message && (
        <Alert className="mt-2">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default DataSourceIndicator
