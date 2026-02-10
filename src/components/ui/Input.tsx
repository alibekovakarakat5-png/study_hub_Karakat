import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  fullWidth?: boolean
}

const baseInputStyles = [
  'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900',
  'placeholder:text-gray-400',
  'transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-0',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
].join(' ')

const normalBorder = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
const errorBorder = 'border-red-400 focus:border-red-500 focus:ring-red-500/20'

const Label = ({
  htmlFor,
  children,
  className,
}: {
  htmlFor: string
  children: ReactNode
  className?: string
}) => (
  <label
    htmlFor={htmlFor}
    className={cn('block text-sm font-medium text-gray-700 mb-1.5', className)}
  >
    {children}
  </label>
)

const ErrorMessage = ({ children }: { children: ReactNode }) => (
  <p className="mt-1.5 text-xs text-red-600">{children}</p>
)

const HintMessage = ({ children }: { children: ReactNode }) => (
  <p className="mt-1.5 text-xs text-gray-500">{children}</p>
)

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      fullWidth = true,
      className,
      id: externalId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const id = externalId ?? generatedId

    return (
      <div className={cn(fullWidth ? 'w-full' : 'inline-block')}>
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              baseInputStyles,
              error ? errorBorder : normalBorder,
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              className,
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
              {icon}
            </div>
          )}
        </div>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {!error && hint && <HintMessage>{hint}</HintMessage>}
      </div>
    )
  },
)

Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = true,
      className,
      id: externalId,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const id = externalId ?? generatedId

    return (
      <div className={cn(fullWidth ? 'w-full' : 'inline-block')}>
        {label && <Label htmlFor={id}>{label}</Label>}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          className={cn(
            baseInputStyles,
            'resize-y min-h-[80px]',
            error ? errorBorder : normalBorder,
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {!error && hint && <HintMessage>{hint}</HintMessage>}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'

export default Input
