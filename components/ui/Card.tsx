'use client'

import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glow'
  hoverable?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-dark-800/50 border border-dark-700',
      glass: 'glass',
      glow: 'glass fire-glow',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-6 animate-fadeIn',
          variants[variant],
          hoverable && 'transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-2xl cursor-pointer',
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
