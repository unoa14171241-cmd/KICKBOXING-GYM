'use client'

import { cn, getStatusColor, getStatusLabel } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export function Badge({ className, status, variant, children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-600 border-gray-200',
    success: 'bg-green-50 text-green-600 border-green-200',
    warning: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    danger: 'bg-red-50 text-red-600 border-red-200',
    info: 'bg-blue-50 text-blue-600 border-blue-200',
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
