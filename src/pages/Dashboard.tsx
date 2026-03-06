import { useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, FileText as FileTextIcon,
  LayoutDashboard,
  BookOpen,
  Bot,
  FolderOpen,
  Settings,
  LogOut,
  Flame,
  RefreshCw,
  Crown,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  Circle,
  ChevronRight,
  GraduationCap,
  Trophy,
  Lock,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  Zap,
  Calendar,
  BarChart3,
  MessageCircle,
  Timer,
  Globe,
  Award,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useStore } from '@/store/useStore'
import {
  SUBJECT_NAMES,
  SUBJECT_COLORS,
  type Subject,
  type StudyTask,
} from '@/types'
import {
  cn,
  formatDate,
} from '@/lib/utils'
import NotificationDropdown from '@/components/NotificationDropdown'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
}

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

// ---------------------------------------------------------------------------
// Nav config
// ---------------------------------------------------------------------------

interface NavItem {
  label: string
  icon: React.ElementType
  to: string
  disabled?: boolean
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
  { key: 'nav.portfolio',   icon: FolderOpen,      to: '/portfolio' },
  { key: 'nav.settings',    icon: Settings,        to: '#', disabled: true },
]

// ---------------------------------------------------------------------------
// Circular progress component
// ---------------------------------------------------------------------------

function CircularProgress({
  value,
  max,
  size = 72,
  strokeWidth = 6,
  color = '#2563eb',
  children,
}: {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  color?: string
  children?: React.ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percentage = max > 0 ? Math.min(value / max, 1) : 0
  const dashOffset = circumference * (1 - percentage)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Level badge
// ---------------------------------------------------------------------------

function LevelBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
  const { t } = useTranslation()
  const config = {
    low: { label: t('dashboard.level_low'), className: 'bg-red-100 text-red-700' },
    medium: { label: t('dashboard.level_medium'), className: 'bg-amber-100 text-amber-700' },
    high: { label: t('dashboard.level_high'), className: 'bg-emerald-100 text-emerald-700' },
  }
  const c = config[level]
  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', c.className)}>
      {c.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Probability badge
// ---------------------------------------------------------------------------

function ProbabilityBadge({ probability }: { probability: number }) {
  const cls =
    probability >= 75
      ? 'bg-emerald-100 text-emerald-700'
      : probability >= 40
        ? 'bg-amber-100 text-amber-700'
        : 'bg-red-100 text-red-700'
  return (
    <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-bold', cls)}>
      {probability}%
    </span>
  )
}

// ---------------------------------------------------------------------------
// Subject badge
// ---------------------------------------------------------------------------

function SubjectBadge({ subject }: { subject: Subject }) {
  return (
    <span
      className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium text-white"
      style={{ backgroundColor: SUBJECT_COLORS[subject] }}
    >
      {SUBJECT_NAMES[subject]}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Task type icon
// ---------------------------------------------------------------------------

function TaskTypeIcon({ type }: { type: StudyTask['type'] }) {
  const config = {
    lesson: { icon: BookOpen, color: 'text-blue-500' },
    practice: { icon: Target, color: 'text-purple-500' },
    test: { icon: BarChart3, color: 'text-orange-500' },
    review: { icon: TrendingUp, color: 'text-green-500' },
  }
  const c = config[type]
  const Icon = c.icon
  return <Icon className={cn('w-4 h-4', c.color)} />
}

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------

function Sidebar() {
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
          return (
            <Link
              key={item.to}
              to={item.disabled ? '#' : item.to}
              onClick={() => {
                if (sidebarOpen) toggleSidebar()
              }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm'
                  : item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-blue-600')} />
              {t(item.key)}
              {item.disabled && (
                <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md font-normal">
                  Soon
                </span>
              )}
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

// ---------------------------------------------------------------------------
// No diagnostic CTA
// ---------------------------------------------------------------------------

function NoDiagnosticCTA() {
  const { t } = useTranslation()
  return (
    <motion.div
      variants={cardVariants}
      className="col-span-full sm:col-span-1 xl:col-span-3"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 shrink-0">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {t('dashboard.no_diagnostic_title')}
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              {t('dashboard.no_diagnostic_subtitle')}
            </p>
            <Link
              to="/diagnostic"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all duration-200"
            >
              {t('dashboard.take_diagnostic')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Quick stat card
// ---------------------------------------------------------------------------

function QuickStatCard({
  title,
  icon: Icon,
  iconBg,
  children,
}: {
  title: string
  icon: React.ElementType
  iconBg: string
  children: React.ReactNode
}) {
  return (
    <motion.div variants={cardVariants}>
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-xl',
              iconBg,
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
        {children}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Score by subject chart
// ---------------------------------------------------------------------------

function ScoreBySubjectSection() {
  const { diagnosticResult } = useStore()
  const { t } = useTranslation()
  if (!diagnosticResult) return null

  const data = diagnosticResult.subjects.map((s) => ({
    name: SUBJECT_NAMES[s.subject],
    subject: s.subject,
    percentage: s.percentage,
    score: s.score,
    maxScore: s.maxScore,
    level: s.level,
    fill: SUBJECT_COLORS[s.subject],
  }))

  return (
    <motion.div variants={cardVariants} className="col-span-full xl:col-span-8">
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t('dashboard.subject_scores_title')}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{t('dashboard.diagnostic_test_label')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/diagnostic" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              {t('dashboard.retake_label')} <RefreshCw className="w-4 h-4" />
            </Link>
            <Link to="/diagnostic" className="text-sm text-gray-400 hover:text-gray-500 font-medium flex items-center gap-1">
              {t('dashboard.learn_more_label')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
              barCategoryGap="20%"
            >
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, t('dashboard.result_label')]}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              <Bar dataKey="percentage" radius={[0, 6, 6, 0]} barSize={20}>
                {data.map((entry) => (
                  <Cell key={entry.subject} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Level badges row */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
          {diagnosticResult.subjects.map((s) => (
            <div key={s.subject} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: SUBJECT_COLORS[s.subject] }}
              />
              <span className="text-xs text-gray-600">{SUBJECT_NAMES[s.subject]}</span>
              <LevelBadge level={s.level} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// This week's tasks
// ---------------------------------------------------------------------------

function WeeklyTasksSection() {
  const { studyPlan, toggleTask } = useStore()
  const { t } = useTranslation()

  if (!studyPlan) {
    return (
      <motion.div variants={cardVariants} className="col-span-full xl:col-span-4">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 h-full flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t('dashboard.weekly_tasks_title')}</h3>
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-gray-600 mb-1 font-medium">{t('dashboard.no_plan_title')}</p>
            <p className="text-sm text-gray-400 mb-5 max-w-[240px]">
              {t('dashboard.no_plan_subtitle')}
            </p>
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              {t('dashboard.create_plan_btn')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  const currentWeekData = studyPlan.weeks.find(
    (w) => w.weekNumber === studyPlan.currentWeek,
  )

  if (!currentWeekData) return null

  const completedCount = currentWeekData.tasks.filter((t) => t.completed).length
  const totalCount = currentWeekData.tasks.length
  const weekProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Show up to 6 tasks
  const displayTasks = currentWeekData.tasks.slice(0, 6)

  return (
    <motion.div variants={cardVariants} className="col-span-full xl:col-span-4">
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t('dashboard.weekly_tasks_title')}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {t('dashboard.week_label')} {studyPlan.currentWeek}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{completedCount}/{totalCount}</p>
            <p className="text-xs text-gray-400">{t('dashboard.done_label')}</p>
          </div>
        </div>

        {/* Week progress bar */}
        <div className="mb-4">
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${weekProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Task list */}
        <div className="flex-1 space-y-2 overflow-y-auto">
          {displayTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(studyPlan.currentWeek, task.id)}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-200',
                task.completed
                  ? 'bg-gray-50'
                  : 'hover:bg-gray-50',
              )}
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <SubjectBadge subject={task.subject} />
                  <TaskTypeIcon type={task.type} />
                </div>
                <p
                  className={cn(
                    'text-sm truncate',
                    task.completed
                      ? 'text-gray-400 line-through'
                      : 'text-gray-700 font-medium',
                  )}
                >
                  {task.title}
                </p>
              </div>
              <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.duration}{t('common.minutes')}
              </span>
            </button>
          ))}
        </div>

        {totalCount > 6 && (
          <Link
            to="/plan"
            className="mt-3 pt-3 border-t border-gray-100 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1"
          >
            {t('dashboard.all_tasks_btn', { count: totalCount - 6 })}
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// University predictions
// ---------------------------------------------------------------------------

function UniversityPredictionsSection() {
  const { diagnosticResult } = useStore()
  const { t } = useTranslation()
  if (
    !diagnosticResult ||
    !diagnosticResult.predictedUniversities ||
    diagnosticResult.predictedUniversities.length === 0
  )
    return null

  const topPredictions = diagnosticResult.predictedUniversities.slice(0, 5)

  return (
    <motion.div variants={cardVariants} className="col-span-full xl:col-span-6">
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t('dashboard.admission_forecast_title')}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{t('dashboard.based_on_diagnostic')}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50">
            <GraduationCap className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="space-y-3">
          {topPredictions.map((pred, index) => (
            <div
              key={`${pred.university.id}-${pred.specialty.id}`}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-sm font-bold text-gray-500 shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {pred.university.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{pred.specialty.name}</p>
              </div>
              <ProbabilityBadge probability={pred.probability} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Achievements grid
// ---------------------------------------------------------------------------

function AchievementsSection() {
  const { achievements } = useStore()
  const { t } = useTranslation()

  const sorted = useMemo(() => {
    return [...achievements].sort((a, b) => {
      if (a.unlockedAt && !b.unlockedAt) return -1
      if (!a.unlockedAt && b.unlockedAt) return 1
      return 0
    })
  }, [achievements])

  return (
    <motion.div variants={cardVariants} className="col-span-full xl:col-span-6">
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t('dashboard.achievements_title')}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {t('dashboard.achievements_unlocked', {
                unlocked: achievements.filter((a) => a.unlockedAt).length,
                total: achievements.length,
              })}
            </p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sorted.map((ach) => {
            const isUnlocked = !!ach.unlockedAt
            return (
              <div
                key={ach.id}
                className={cn(
                  'relative flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200',
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-amber-200/60 shadow-sm'
                    : 'bg-gray-50 border-gray-200 opacity-50',
                )}
              >
                {/* Glow effect for unlocked */}
                {isUnlocked && (
                  <div className="absolute inset-0 rounded-xl bg-amber-400/10 animate-pulse pointer-events-none" />
                )}

                <div className="relative text-2xl mb-1.5">
                  {isUnlocked ? ach.icon : <Lock className="w-6 h-6 text-gray-400 mx-auto" />}
                </div>
                <p
                  className={cn(
                    'text-xs font-semibold leading-tight mb-0.5',
                    isUnlocked ? 'text-gray-900' : 'text-gray-400',
                  )}
                >
                  {t(`store.achieve_${ach.id.replace(/-/g, '_')}_title`, { defaultValue: ach.title })}
                </p>
                {isUnlocked && ach.unlockedAt && (
                  <p className="text-[10px] text-gray-400">
                    {formatDate(ach.unlockedAt)}
                  </p>
                )}
                {!isUnlocked && (
                  <p className="text-[10px] text-gray-400 leading-tight">
                    {t(`store.achieve_${ach.id.replace(/-/g, '_')}_desc`, { defaultValue: ach.description })}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const {
    user,
    diagnosticResult,
    studyPlan,
    hasTakenDiagnostic,
    sidebarOpen,
    toggleSidebar,
  } = useStore()
  const { t } = useTranslation()

  const hour = new Date().getHours()
  const greetingKey =
    hour < 6 ? 'dashboard.greeting_night'
    : hour < 12 ? 'dashboard.greeting_morning'
    : hour < 18 ? 'dashboard.greeting_day'
    : 'dashboard.greeting_evening'

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} ${t('common.minutes')}`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (m === 0) return `${h}${t('common.hours')}`
    return `${h}${t('common.hours')} ${m}${t('common.minutes')}`
  }

  const overallPercentage =
    diagnosticResult && diagnosticResult.maxScore > 0
      ? Math.round((diagnosticResult.overallScore / diagnosticResult.maxScore) * 100)
      : 0

  return (
    <div className="min-h-screen bg-gray-50/80">
      <Sidebar />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl hover:bg-gray-100 lg:hidden transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {t(greetingKey)}, {user?.name || t('dashboard.student_default')}!
                </h1>
                {user?.targetUniversity && (
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {t('dashboard.goal_label')}: {user.targetUniversity}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Streak */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200/60">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-700">
                  {user?.streak || 0}
                </span>
              </div>

              {/* Notification bell */}
              <NotificationDropdown />

              {/* Premium badge */}
              {user?.isPremium && (
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200/60">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700">PRO</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-5"
          >
            {/* ----- If no diagnostic, show CTA ----- */}
            {/* ----- Quick Stats (always visible) ----- */}

            {/* Overall score — show if diagnostic done, otherwise show CTA */}
            {hasTakenDiagnostic ? (
              <div className="sm:col-span-1 xl:col-span-3">
                <QuickStatCard
                  title={t('dashboard.overall_score')}
                  icon={Target}
                  iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
                >
                  <div className="flex items-center gap-4">
                    <CircularProgress
                      value={diagnosticResult?.overallScore || 0}
                      max={diagnosticResult?.maxScore || 1}
                      size={68}
                      strokeWidth={6}
                      color="#2563eb"
                    >
                      <span className="text-sm font-bold text-gray-900">
                        {overallPercentage}%
                      </span>
                    </CircularProgress>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {diagnosticResult?.overallScore || 0}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t('dashboard.out_of', { max: diagnosticResult?.maxScore || 0 })}
                      </p>
                    </div>
                  </div>
                </QuickStatCard>
              </div>
            ) : (
              <NoDiagnosticCTA />
            )}

            {/* Plan progress */}
            <div className="sm:col-span-1 xl:col-span-3">
              <QuickStatCard
                title={t('dashboard.plan_progress')}
                icon={TrendingUp}
                iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
              >
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {studyPlan?.overallProgress || 0}%
                </p>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${studyPlan?.overallProgress || 0}%`,
                    }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </QuickStatCard>
            </div>

            {/* Streak */}
            <div className="sm:col-span-1 xl:col-span-3">
              <QuickStatCard
                title={t('dashboard.streak_title')}
                icon={Zap}
                iconBg="bg-gradient-to-br from-orange-500 to-amber-500"
              >
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl font-bold text-gray-900">
                    {user?.streak || 0}
                  </p>
                  <span className="text-sm text-gray-500">{t('dashboard.days_label')}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-full h-2 rounded-full',
                        i < (user?.streak || 0) % 7 || ((user?.streak || 0) >= 7 && (user?.streak || 0) % 7 === 0 && (user?.streak || 0) > 0)
                          ? 'bg-gradient-to-r from-orange-400 to-amber-400'
                          : 'bg-gray-100',
                      )}
                    />
                  ))}
                </div>
              </QuickStatCard>
            </div>

            {/* Study time */}
            <div className="sm:col-span-1 xl:col-span-3">
              <QuickStatCard
                title={t('dashboard.study_time')}
                icon={Clock}
                iconBg="bg-gradient-to-br from-emerald-500 to-green-600"
              >
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(user?.totalStudyMinutes || 0)}
                </p>
                <p className="text-xs text-gray-400 mt-1">{t('dashboard.total_time_label')}</p>
              </QuickStatCard>
            </div>

            {/* Score by subject chart — only if diagnostic done */}
            {hasTakenDiagnostic && <ScoreBySubjectSection />}

            {/* "Start Here" guide for new users */}
            {!hasTakenDiagnostic && (
              <motion.div variants={cardVariants} className="sm:col-span-2 xl:col-span-12">
                <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                  <h3 className="mb-1 text-lg font-bold text-gray-900">{t('dashboard.start_here_title')}</h3>
                  <p className="mb-5 text-sm text-gray-500">{t('dashboard.start_here_subtitle')}</p>
                  <div className="space-y-3">
                    <Link to="/diagnostic" className="flex items-center gap-4 rounded-xl border border-blue-200 bg-white p-4 transition-all hover:shadow-md hover:border-blue-300">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">1</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{t('dashboard.step1_title')}</p>
                        <p className="text-xs text-gray-500">{t('dashboard.step1_subtitle')}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-blue-500" />
                    </Link>
                    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white/60 p-4 opacity-60">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-300 text-sm font-bold text-white">2</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-700">{t('dashboard.step2_title')}</p>
                        <p className="text-xs text-gray-400">{t('dashboard.step2_subtitle')}</p>
                      </div>
                      <Lock className="h-4 w-4 text-gray-300" />
                    </div>
                    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white/60 p-4 opacity-60">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-300 text-sm font-bold text-white">3</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-700">{t('dashboard.step3_title')}</p>
                        <p className="text-xs text-gray-400">{t('dashboard.step3_subtitle')}</p>
                      </div>
                      <Lock className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Digital Curator CTA */}
            <motion.div variants={cardVariants} className="sm:col-span-2 xl:col-span-12">
              <Link to="/curator">
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 text-white transition-all hover:shadow-xl hover:shadow-purple-200">
                  <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 transition-transform group-hover:scale-150" />
                  <div className="relative flex items-center gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-bold">{t('dashboard.curator_title')}</h3>
                      <p className="text-sm text-white/70">{t('dashboard.curator_subtitle')}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white/60 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Practice ENT CTA */}
            <motion.div variants={cardVariants} className="sm:col-span-2 xl:col-span-12">
              <Link to="/practice-ent">
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 p-6 text-white transition-all hover:shadow-xl hover:shadow-orange-200">
                  <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 transition-transform group-hover:scale-150" />
                  <div className="relative flex items-center gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                      <Target className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-bold">{t('dashboard.practice_ent_title')}</h3>
                      <p className="text-sm text-white/70">{t('dashboard.practice_ent_subtitle')}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white/60 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Share with parents */}
            <motion.div variants={cardVariants} className="sm:col-span-2 xl:col-span-12">
              <div className="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-500/10">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{t('dashboard.parent_report_title')}</h3>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {t('dashboard.parent_report_subtitle')}
                    </p>
                    {user && (
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {user.streak} {t('dashboard.days_in_row')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3 text-blue-500" />
                          {formatDuration(user.totalStudyMinutes)} {t('dashboard.total_label')}
                        </span>
                        {hasTakenDiagnostic && diagnosticResult && (
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-purple-500" />
                            {t('dashboard.diagnostic_score_label')}: {Math.round((diagnosticResult.overallScore / diagnosticResult.maxScore) * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const name = user?.name || t('dashboard.student_default')
                      const streak = user?.streak ?? 0
                      const studyTime = formatDuration(user?.totalStudyMinutes ?? 0)
                      const diagLine = diagnosticResult
                        ? `${t('dashboard.wa_diagnostic')}: ${Math.round((diagnosticResult.overallScore / diagnosticResult.maxScore) * 100)}%\n`
                        : ''
                      const weak = diagnosticResult?.subjects
                        .filter(s => s.level === 'low' || s.level === 'medium')
                        .map(s => SUBJECT_NAMES[s.subject])
                        .join(', ')
                      const msg = `${t('dashboard.wa_report_title')}\n\n👤 ${name}\n` +
                        diagLine +
                        (weak ? `${t('dashboard.wa_needs_work')}: ${weak}\n` : '') +
                        `${t('dashboard.wa_streak')}: ${streak} ${t('dashboard.days_label')}\n` +
                        `${t('dashboard.wa_total_time')}: ${studyTime}\n\n` +
                        t('dashboard.wa_platform')
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
                    }}
                    className="flex shrink-0 items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t('dashboard.send_whatsapp')}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Weekly tasks */}
            <WeeklyTasksSection />

            {/* University predictions — only if diagnostic done */}
            {hasTakenDiagnostic && <UniversityPredictionsSection />}

            {/* Achievements */}
            <AchievementsSection />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
