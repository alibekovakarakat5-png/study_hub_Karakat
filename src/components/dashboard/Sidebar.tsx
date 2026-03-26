import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  FileText as FileTextIcon,
  LayoutDashboard,
  BookOpen,
  Bot,
  FolderOpen,
  Settings,
  LogOut,
  Crown,
  Target,
  GraduationCap,
  X,
  ChevronRight,
  Globe,
  Award,
  Plane,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

const sidebarVariants = {
  open: {
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
  closed: {
    x: '-100%',
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
}

const NAV_KEYS: { key: string; icon: React.ElementType; to: string; disabled?: boolean }[] = [
  { key: 'nav.dashboard',   icon: LayoutDashboard, to: '/dashboard' },
  { key: 'nav.study_plan',  icon: BookOpen,        to: '/plan' },
  { key: 'nav.ai_mentor',   icon: Bot,             to: '/mentor' },
  { key: 'nav.ielts',              icon: GraduationCap,   to: '/ielts' },
  { key: 'nav.admissions',        icon: Building2,       to: '/admissions' },
  { key: 'nav.motivation_letter', icon: FileTextIcon,    to: '/motivation-letter' },
  { key: 'nav.admission_plan',    icon: Target,          to: '/admission-plan' },
  { key: 'nav.university_advisor',   icon: Globe,   to: '/university-advisor' },
  { key: 'nav.scholarship_finder',  icon: Award,   to: '/scholarship-finder' },
  { key: 'nav.study_abroad',       icon: Plane,   to: '/study-abroad' },
  { key: 'nav.portfolio',   icon: FolderOpen,      to: '/portfolio' },
  { key: 'nav.settings',    icon: Settings,        to: '/settings' },
]

export default function Sidebar() {
  const { user, sidebarOpen, toggleSidebar, logout } = useStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Study Hub
        </span>
        {/* Close button on mobile */}
        <button
          onClick={toggleSidebar}
          className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 lg:hidden"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_KEYS.map((item) => {
          const isActive = location.pathname === item.to
          const Icon = item.icon
          if (item.disabled) {
            return (
              <div
                key={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 cursor-not-allowed"
              >
                <Icon className="w-5 h-5 shrink-0" />
                {t(item.key)}
                <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md font-normal">
                  Soon
                </span>
              </div>
            )
          }
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => {
                if (sidebarOpen) toggleSidebar()
              }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-blue-600')} />
              {t(item.key)}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-gray-100" />

      {/* Premium CTA */}
      {user && !user.isPremium && (
        <div className="px-3 py-3">
          <Link
            to="/pricing"
            onClick={() => {
              if (sidebarOpen) toggleSidebar()
            }}
            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">
                {t('dashboard.upgrade_premium')}
              </p>
              <p className="text-xs text-amber-600/80 truncate">
                {t('dashboard.unlock_features')}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}

      {/* Logout + Language */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-1">
        <LanguageSwitcher className="w-full justify-center mb-1" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
