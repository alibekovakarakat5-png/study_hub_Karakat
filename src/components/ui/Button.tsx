import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  children?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-gradient-to-r from-blue-600 to-purple-600',
    'text-white',
    'shadow-md shadow-blue-500/25',
    'hover:from-blue-700 hover:to-purple-700',
    'hover:shadow-lg hover:shadow-blue-500/30',
    'active:from-blue-800 active:to-purple-800',
    'focus-visible:ring-blue-500',
  ].join(' '),
  secondary: [
    'border border-gray-300',
    'bg-white',
    'text-gray-700',
    'hover:bg-gray-50 hover:border-gray-400',
    'active:bg-gray-100',
    'focus-visible:ring-gray-400',
  ].join(' '),
  ghost: [
    'bg-transparent',
    'text-gray-600',
    'hover:bg-gray-100 hover:text-gray-900',
    'active:bg-gray-200',
    'focus-visible:ring-gray-400',
  ].join(' '),
  danger: [
    'bg-red-600',
    'text-white',
    'shadow-md shadow-red-500/25',
    'hover:bg-red-700',
    'hover:shadow-lg hover:shadow-red-500/30',
    'active:bg-red-800',
    'focus-visible:ring-red-500',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
}

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  sm: 'p-1.5 rounded-lg',
  md: 'p-2 rounded-xl',
  lg: 'p-3 rounded-xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading
    const isIconOnly = icon && !children

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          'select-none',
          variantStyles[variant],
          isIconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2
              className={cn(
                'animate-spin',
                size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4',
              )}
            />
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="shrink-0">{icon}</span>
            )}
            {children && <span>{children}</span>}
            {icon && iconPosition === 'right' && (
              <span className="shrink-0">{icon}</span>
            )}
          </>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'

export default Button
