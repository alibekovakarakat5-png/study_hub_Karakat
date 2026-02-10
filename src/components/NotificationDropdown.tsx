import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  X,
  CheckCheck,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types'

// ── Icon & colour mapping per notification type ──────────────────────────────

const typeConfig: Record<
  NotificationType,
  { icon: typeof Bell; bg: string; text: string; ring: string }
> = {
  info: {
    icon: Bell,
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    ring: 'ring-blue-100',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    ring: 'ring-emerald-100',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    ring: 'ring-amber-100',
  },
  achievement: {
    icon: Trophy,
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    ring: 'ring-purple-100',
  },
}

// ── Animation variants ───────────────────────────────────────────────────────

const dropdownVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 24,
      stiffness: 360,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: { duration: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.25,
    },
  }),
}

// ── Single notification row ──────────────────────────────────────────────────

function NotificationItem({
  notification,
  index,
  onRead,
}: {
  notification: Notification
  index: number
  onRead: (id: string) => void
}) {
  const config = typeConfig[notification.type]
  const Icon = config.icon

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: ru,
  })

  return (
    <motion.button
      type="button"
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      onClick={() => {
        if (!notification.read) onRead(notification.id)
      }}
      className={cn(
        'group relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-gray-50/80',
        !notification.read && 'border-l-2 border-l-blue-500 bg-blue-50/30',
        notification.read && 'border-l-2 border-l-transparent',
      )}
    >
      {/* Type icon */}
      <div
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
          config.bg,
          config.text,
          config.ring,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm leading-snug',
              !notification.read
                ? 'font-semibold text-gray-900'
                : 'font-medium text-gray-700',
            )}
          >
            {notification.title}
          </p>

          {/* Unread dot */}
          {!notification.read && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          )}
        </div>

        <p className="mt-0.5 text-xs leading-relaxed text-gray-500 line-clamp-2">
          {notification.message}
        </p>

        <p className="mt-1 text-[11px] text-gray-400">{timeAgo}</p>
      </div>
    </motion.button>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { notifications, markNotificationRead, markAllNotificationsRead } =
    useStore()

  const unreadCount = notifications.filter((n) => !n.read).length

  // Close on outside click
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    },
    [],
  )

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }, [])

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleClickOutside, handleKeyDown])

  const toggle = () => setOpen((prev) => !prev)

  const handleMarkAllRead = () => {
    markAllNotificationsRead()
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={toggle}
        aria-label="Уведомления"
        aria-expanded={open}
        className={cn(
          'relative rounded-xl p-2 transition-colors',
          'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          open && 'bg-gray-100',
        )}
      >
        <Bell className="h-5 w-5 text-gray-500" />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'absolute right-0 top-full z-50 mt-2 origin-top-right',
              'rounded-2xl border border-gray-200 bg-white shadow-xl shadow-black/10',
              // Responsive width
              'w-[calc(100vw-2rem)] sm:w-[380px]',
              // On very small screens, shift left so it stays on-screen
              '-right-2 sm:right-0',
            )}
            role="menu"
            aria-label="Уведомления"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  Уведомления
                </h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {unreadCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium',
                      'text-blue-600 transition-colors hover:bg-blue-50',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                    )}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      Отметить все как прочитанные
                    </span>
                    <span className="sm:hidden">Прочитать все</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'rounded-lg p-1 text-gray-400 transition-colors',
                    'hover:bg-gray-100 hover:text-gray-600',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                  )}
                  aria-label="Закрыть уведомления"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-[60vh] overflow-y-auto overscroll-contain sm:max-h-[420px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Bell className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    Нет уведомлений
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Здесь будут появляться ваши уведомления
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notification, index) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      index={index}
                      onRead={markNotificationRead}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-2.5 text-center">
                <p className="text-xs text-gray-400">
                  {unreadCount > 0
                    ? `${unreadCount} непрочитанн${unreadCount === 1 ? 'ое' : unreadCount < 5 ? 'ых' : 'ых'}`
                    : 'Все прочитано'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationDropdown
