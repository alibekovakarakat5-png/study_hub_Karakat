import { forwardRef, useState, type ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  size?: AvatarSize
  name?: string
  src?: string
  className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

const bgColors = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function getColorFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return bgColors[Math.abs(hash) % bgColors.length]
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = 'md', name, src, alt, className, ...props }, ref) => {
    const [imageError, setImageError] = useState(false)
    const showImage = src && !imageError
    const initials = name ? getInitials(name) : '?'
    const bgColor = name ? getColorFromName(name) : 'bg-gray-400'

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden',
          'ring-2 ring-white',
          sizeStyles[size],
          !showImage && bgColor,
          className,
        )}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt ?? name ?? 'Avatar'}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
            {...props}
          />
        ) : (
          <span className="font-semibold text-white select-none">{initials}</span>
        )}
      </div>
    )
  },
)

Avatar.displayName = 'Avatar'

export default Avatar
