import React from 'react'
import { cn } from '@/lib/utils'

export interface WelcomeProps {
  className?: string
}

export function Welcome({ className }: WelcomeProps) {
  return (
    <div className={cn('text-center space-y-6 max-w-4xl mx-auto', className)}>
      <div className="space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
          Welcome to PoolManager
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-light">
          Your premium NFL pool management system
        </p>
      </div>
      <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Real-time scoring</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>AI-powered picks</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span>Advanced analytics</span>
        </div>
      </div>
    </div>
  )
}
