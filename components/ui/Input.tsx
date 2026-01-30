'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-dark-300 mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'w-full bg-dark-800/50 border rounded-xl px-4 py-3 text-white',
            'placeholder:text-dark-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            'transition-all duration-200',
            error ? 'border-red-500 focus:border-red-500' : 'border-dark-600 focus:border-primary-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
