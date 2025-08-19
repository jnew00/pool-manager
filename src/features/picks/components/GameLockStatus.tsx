'use client'

interface GameLockStatusProps {
  gameId: string
  deadline: Date
  isLocked: boolean
  timeRemaining?: number
  variant?: 'default' | 'minimal'
  lockType?: string
}

export function GameLockStatus({
  gameId,
  deadline,
  isLocked,
  timeRemaining,
  variant = 'default',
  lockType,
}: GameLockStatusProps) {
  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const getLockTypeDisplay = (type?: string): string => {
    switch (type) {
      case 'game_time':
        return 'Game time'
      case '1_hour_before':
        return '1 hour before'
      case '2_hours_before':
        return '2 hours before'
      case 'weekly_thursday_8pm':
        return 'Weekly deadline'
      case 'weekly_sunday_1pm':
        return 'Weekly deadline'
      default:
        return 'Deadline'
    }
  }

  const getStatusColor = (): string => {
    if (isLocked) return 'text-red-600 bg-red-50 border-red-200'
    if (timeRemaining && timeRemaining < 15 * 60 * 1000) {
      // Less than 15 minutes
      return 'text-orange-600 bg-orange-50 border-orange-200'
    }
    return 'text-green-600 bg-green-50 border-green-200'
  }

  const getIcon = () => {
    if (isLocked) {
      return (
        <svg
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-label="Locked"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
      )
    } else {
      return (
        <svg
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-label="Unlocked"
        >
          <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
        </svg>
      )
    }
  }

  const getStatusText = (): string => {
    if (isLocked) {
      return 'Picks are locked'
    }

    if (timeRemaining) {
      if (timeRemaining < 15 * 60 * 1000) {
        // Less than 15 minutes
        return 'Picks close soon'
      }
      return 'Picks close in'
    }

    return 'Picks open'
  }

  if (variant === 'minimal') {
    return (
      <div
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor()}`}
      >
        {getIcon()}
        {timeRemaining && !isLocked && (
          <span>{formatTimeRemaining(timeRemaining)}</span>
        )}
        {isLocked && <span>Locked</span>}
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium border ${getStatusColor()}`}
    >
      {getIcon()}
      <div className="flex flex-col">
        <span className="font-semibold">
          {getStatusText()}
          {timeRemaining && !isLocked && (
            <span className="ml-1 font-mono">
              {formatTimeRemaining(timeRemaining)}
            </span>
          )}
        </span>
        {lockType && (
          <span className="text-xs opacity-75">
            {getLockTypeDisplay(lockType)} • {deadline.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  )
}
