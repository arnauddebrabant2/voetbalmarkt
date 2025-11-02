import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full bg-green-100 text-green-800 px-3 py-1 text-sm font-medium shadow-sm',
        className
      )}
      {...props}
    />
  )
}
