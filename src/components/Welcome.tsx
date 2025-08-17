import React from 'react'
import { cn } from '@/lib/utils'

export interface WelcomeProps {
  className?: string
}

export function Welcome({ className }: WelcomeProps) {
  return (
    <div className={cn('text-center space-y-4', className)}>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
        Welcome to PoolManager
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Your NFL pool management system
      </p>
    </div>
  )
}
