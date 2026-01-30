'use client'

import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glow' | 'pink'
  hoverable?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-100 shadow-sm',
      glass: 'glass',
      glow: 'glass pink-glow',
      pink: 'bg-primary-500 text-white',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-6 animate-fadeIn',
          variants[variant],
          hoverable && 'transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-xl hover:border-primary-200 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card }
