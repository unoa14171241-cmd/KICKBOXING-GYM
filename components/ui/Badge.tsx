'use client'

import { cn, getStatusColor, getStatusLabel } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export function Badge({ className, status, variant, children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-dark-600/50 text-dark-200 border-dark-500',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        status ? getStatusColor(status) : variant ? variantStyles[variant] : variantStyles.default,
        className
      )}
      {...props}
    >
      {status ? getStatusLabel(status) : children}
    </span>
  )
}
