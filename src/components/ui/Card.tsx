import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type CardVariant = 'default' | 'glass' | 'gradient'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

const variantStyles: Record<CardVariant, string> = {
  default: [
    'bg-white',
    'border border-gray-200',
    'shadow-sm',
    'hover:shadow-md',
  ].join(' '),
  glass: [
    'bg-white/60',
    'backdrop-blur-xl',
    'border border-white/40',
    'shadow-lg shadow-black/5',
  ].join(' '),
  gradient: [
    'bg-gradient-to-br from-blue-50 via-white to-purple-50',
    'border border-blue-100/60',
    'shadow-sm',
  ].join(' '),
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-b border-gray-100', className)}
      {...props}
    >
      {children}
    </div>
  ),
)
CardHeader.displayName = 'CardHeader'

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  ),
)
CardBody.displayName = 'CardBody'

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-t border-gray-100', className)}
      {...props}
    >
      {children}
    </div>
  ),
)
CardFooter.displayName = 'CardFooter'

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl transition-shadow duration-200',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)

Card.displayName = 'Card'

export default Card
