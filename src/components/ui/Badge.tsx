import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor
  size?: BadgeSize
  icon?: ReactNode
  children: ReactNode
}

const colorStyles: Record<BadgeColor, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  green: 'bg-green-50 text-green-700 ring-green-600/20',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  gray: 'bg-gray-50 text-gray-600 ring-gray-500/20',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ color = 'gray', size = 'md', icon, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full ring-1 ring-inset',
        colorStyles[color],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  ),
)

Badge.displayName = 'Badge'

export default Badge
