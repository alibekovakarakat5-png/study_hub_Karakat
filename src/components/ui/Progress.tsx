import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
}

function getProgressColor(percentage: number): string {
  if (percentage >= 75) return 'bg-green-500'
  if (percentage >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

function getCircularColor(percentage: number): string {
  if (percentage >= 75) return 'stroke-green-500'
  if (percentage >= 50) return 'stroke-amber-500'
  return 'stroke-red-500'
}

const heightStyles: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      showLabel = false,
      size = 'md',
      animated = true,
      className,
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))
    const colorClass = getProgressColor(percentage)

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showLabel && (
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-700">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div
          className={cn(
            'w-full overflow-hidden rounded-full bg-gray-100',
            heightStyles[size],
          )}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={cn(
              'h-full rounded-full',
              colorClass,
              animated && 'transition-all duration-500 ease-out',
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  },
)

Progress.displayName = 'Progress'

export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      value,
      max = 100,
      size = 48,
      strokeWidth = 4,
      showLabel = true,
      className,
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference
    const colorClass = getCircularColor(percentage)

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-100"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(colorClass, 'transition-all duration-500 ease-out')}
          />
        </svg>
        {showLabel && (
          <span
            className="absolute text-center font-semibold text-gray-700"
            style={{ fontSize: size * 0.24 }}
          >
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    )
  },
)

CircularProgress.displayName = 'CircularProgress'

export default Progress
