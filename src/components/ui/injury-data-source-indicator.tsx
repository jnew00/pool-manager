import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react'

interface InjuryDataSourceIndicatorProps {
  dataSource: 'MYSPORTSFEEDS' | 'ESPN' | 'NONE' | 'REAL' | 'UNAVAILABLE'
  message?: string
  className?: string
}

export function InjuryDataSourceIndicator({
  dataSource,
  message,
  className = '',
}: InjuryDataSourceIndicatorProps) {
  const getIndicatorProps = () => {
    switch (dataSource) {
      case 'MYSPORTSFEEDS':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          text: 'Premium Data',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          title: 'Using MySportsFeeds premium injury data',
        }
      case 'ESPN':
        return {
          variant: 'secondary' as const,
          icon: Wifi,
          text: 'Free Data',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          title: 'Using ESPN free injury data (fallback)',
        }
      case 'REAL':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          text: 'Live Data',
          color: 'bg-green-100 text-green-800 border-green-200',
          title: 'Using real injury data',
        }
      case 'UNAVAILABLE':
      case 'NONE':
        return {
          variant: 'destructive' as const,
          icon: WifiOff,
          text: 'No Data',
          color: 'bg-red-100 text-red-800 border-red-200',
          title: 'Injury data not available',
        }
      default:
        return {
          variant: 'outline' as const,
          icon: AlertCircle,
          text: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          title: 'Unknown data source',
        }
    }
  }

  const { icon: Icon, text, color, title } = getIndicatorProps()

  return (
    <div className={`inline-flex items-center gap-1 ${className}`} title={title}>
      <Badge
        className={`${color} flex items-center gap-1 text-xs px-2 py-1 border`}
      >
        <Icon className="w-3 h-3" />
        {text}
      </Badge>
      {message && (
        <span className="text-xs text-gray-500 ml-1" title={message}>
          ({message})
        </span>
      )}
    </div>
  )
}