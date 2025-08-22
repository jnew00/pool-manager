import React from 'react'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive'
  children: React.ReactNode
}

export function Alert({
  children,
  className = '',
  variant = 'default',
  ...props
}: AlertProps) {
  const variants = {
    default:
      'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    destructive:
      'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  }

  return (
    <div
      className={`relative w-full rounded-lg border p-4 ${variants[variant]} ${className}`}
      role="alert"
      {...props}
    >
      {children}
    </div>
  )
}

export function AlertDescription({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`text-sm text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </div>
  )
}
