import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LogOut,
  Flame,
  Clock,
  CalendarDays,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Crown,
  BookOpen,
  Brain,
  BarChart3,
  ChevronRight,
  Star,
  Target,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  FileText,
  MessageCircle,
  Trophy,
  Timer,
  Layers,
  CheckSquare,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

import { useStore } from '@/store/useStore'
import { useCuratorStore } from '@/store/useCuratorStore'
import { usePracticeEntStore } from '@/store/usePracticeEntStore'
import { SUBJECT_NAMES, SUBJECT_COLORS, type SubjectScore, type Subject } from '@/types'
import { cn, getGreeting, minutesToHumanReadable, getScoreBgColor, formatDate } from '@/lib/utils'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
} satisfies import('framer-motion').Variants

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
} satisfies import('framer-motion').Variants

// ── Mock weekly activity data ───────────────────────────────────────────────

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const STUDY_MINUTES_DATA = [45, 60, 30, 90, 75, 120, 55]
const TASKS_COMPLETED_DATA = [3, 4, 2, 6, 5, 8, 4]

const weeklyActivityData = DAYS_OF_WEEK.map((day, i) => ({
  day,
  minutes: STUDY_MINUTES_DATA[i],
  tasks: TASKS_COMPLETED_DATA[i],
}))

// ── Circular Progress Component ─────────────────────────────────────────────

function CircularProgress({
  percentage,
  size = 160,
  strokeWidth = 12,
  color = '#2563eb',
  bgColor = '#e5e7eb',
  children,
}: {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  children?: React.ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
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
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}

// ── Subject Progress Bar ────────────────────────────────────────────────────

function SubjectProgressBar({ subjectScore }: { subjectScore: SubjectScore }) {
  const subjectName = SUBJECT_NAMES[subjectScore.subject]
  const color = SUBJECT_COLORS[subjectScore.subject]

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{subjectName}</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">
            {subjectScore.score}/{subjectScore.maxScore}
          </span>
          <span
            className={cn(
              'font-semibold text-xs px-2 py-0.5 rounded-full',
              getScoreBgColor(subjectScore.percentage),
            )}
          >
            {subjectScore.percentage}%
          </span>
        </div>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${subjectScore.percentage}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        />
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {subjectScore.weakTopics.map((topic) => (
          <span key={topic} className="inline-flex items-center gap-0.5 text-[11px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
            <AlertTriangle className="w-2.5 h-2.5" />
            {topic}
          </span>
        ))}
        {subjectScore.strongTopics.map((topic) => (
          <span key={topic} className="inline-flex items-center gap-0.5 text-[11px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
            <CheckCircle2 className="w-2.5 h-2.5" />
            {topic}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Custom Recharts Tooltip ─────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean
  payload?: Array<{ value: number; color: string }>
  label?: string
  unit: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="text-gray-500 text-xs mb-0.5">{label}</p>
      <p className="font-semibold" style={{ color: payload[0].color }}>
        {payload[0].value} {unit}
      </p>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

// ── ENT target date (June 1 of current year) ────────────────────────────────
function getDaysUntilEnt(): number {
  const now = new Date()
  const ent = new Date(now.getFullYear(), 5, 1) // June 1
  if (ent < now) ent.setFullYear(ent.getFullYear() + 1)
  return Math.ceil((ent.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export default function ParentDashboard() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const childData = useStore((s) => s.childData)
  const logout = useStore((s) => s.logout)

  // Curator & ENT data (shared localStorage)
  const curatorPlan = useCuratorStore((s) => s.plan)
  const moduleProgress = useCuratorStore((s) => s.moduleProgress)
  const entHistory = usePracticeEntStore((s) => s.history)

  // Derived data
  const diagnosticResult = childData?.diagnosticResult ?? null
  const studyPlan = childData?.studyPlan ?? null
  const weeklyReport = childData?.weeklyReport ?? null
  const child = childData?.user ?? null

  const daysUntilEnt = getDaysUntilEnt()

  const overallPercentage = diagnosticResult
    ? Math.round((diagnosticResult.overallScore / diagnosticResult.maxScore) * 100)
    : 0

  const sortedSubjects = useMemo(() => {
    if (!diagnosticResult) return []
    return [...diagnosticResult.subjects].sort((a, b) => a.percentage - b.percentage)
  }, [diagnosticResult])

  const weakestSubject = sortedSubjects.length > 0 ? sortedSubjects[0] : null
  const strongestSubject = sortedSubjects.length > 0 ? sortedSubjects[sortedSubjects.length - 1] : null

  const totalStudyMinutesWeek = STUDY_MINUTES_DATA.reduce((sum, v) => sum + v, 0)
  const totalTasksWeek = TASKS_COMPLETED_DATA.reduce((sum, v) => sum + v, 0)

  // Study plan progress
  const planProgress = studyPlan?.overallProgress ?? 0
  const currentWeek = studyPlan?.currentWeek ?? 0
  const currentWeekData = studyPlan?.weeks.find((w) => w.weekNumber === currentWeek)
  const currentWeekTotal = currentWeekData?.tasks.length ?? 0
  const currentWeekCompleted = currentWeekData?.tasks.filter((t) => t.completed).length ?? 0
  const currentWeekRate = currentWeekTotal > 0 ? Math.round((currentWeekCompleted / currentWeekTotal) * 100) : 0

  // Curator progress stats
  const curatorStats = useMemo(() => {
    if (!curatorPlan) return null
    const allModules = curatorPlan.weeks.flatMap(w => w.modules)
    const completed = allModules.filter(m => m.status === 'completed').length
    const inProgress = allModules.filter(m => m.status === 'in-progress').length
    const avgScore = completed > 0
      ? Math.round(allModules.filter(m => m.status === 'completed')
          .reduce((sum, m) => sum + (moduleProgress[m.id]?.testScore ?? 0), 0) / completed)
      : 0
    return { total: allModules.length, completed, inProgress, avgScore }
  }, [curatorPlan, moduleProgress])

  // Latest 3 ENT attempts
  const recentEntResults = useMemo(() => entHistory.slice(0, 3), [entHistory])

  // WhatsApp share
  const handleShareWhatsApp = () => {
    const name = child?.name || 'Ученик'
    const grade = child?.grade || 11
    const diagPct = diagnosticResult
      ? Math.round((diagnosticResult.overallScore / diagnosticResult.maxScore) * 100)
      : null
    const weakSubjects = diagnosticResult?.subjects
      .filter(s => s.level === 'low' || s.level === 'medium')
      .map(s => SUBJECT_NAMES[s.subject])
      .join(', ') || '—'
    const strongSubjects = diagnosticResult?.subjects
      .filter(s => s.level === 'high')
      .map(s => SUBJECT_NAMES[s.subject])
      .join(', ') || '—'
    const streak = weeklyReport?.streak ?? child?.streak ?? 0
    const studyTime = minutesToHumanReadable(weeklyReport?.studyMinutes ?? child?.totalStudyMinutes ?? 0)
    const lastEnt = recentEntResults[0]
    const entLine = lastEnt
      ? `🎯 Последний пробный ЕНТ: ${lastEnt.totalCorrect}/${lastEnt.totalQuestions} (${lastEnt.percentage}%)\n`
      : ''
    const curatorLine = curatorStats
      ? `📖 Куратор: ${curatorStats.completed}/${curatorStats.total} модулей выполнено\n`
      : ''

    const msg = `📊 Отчёт по подготовке к ЕНТ\n\n` +
      `👤 ${name}, ${grade} класс\n` +
      `📅 До ЕНТ: ${daysUntilEnt} дней\n\n` +
      (diagPct !== null ? `✅ Диагностика: ${diagPct}%\n` : '') +
      `💪 Сильные предметы: ${strongSubjects}\n` +
      `⚠️ Нужно подтянуть: ${weakSubjects}\n\n` +
      entLine +
      curatorLine +
      `🔥 Серия занятий: ${streak} дней\n` +
      `⏱ Время за неделю: ${studyTime}\n\n` +
      `Платформа: Study Hub`

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  // ── Guard: no user ──────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card variant="glass" className="p-8 max-w-md text-center">
          <CardBody>
            <GraduationCap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Сессия истекла</h2>
            <p className="text-gray-500 mb-6">Пожалуйста, войдите заново, чтобы увидеть данные.</p>
            <Button onClick={() => navigate('/auth')} fullWidth>
              Войти
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  Study Hub
                  <span className="text-gray-400 font-normal"> — Панель родителя</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm text-gray-600">
                {getGreeting()}, <span className="font-medium text-gray-900">{user.name}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon={<LogOut className="w-4 h-4" />}
                onClick={handleLogout}
              >
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* ── Child Overview Card ──────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Card variant="gradient" className="overflow-hidden">
              <CardBody className="p-6 sm:p-8">
                {child ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Avatar / Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-3xl font-bold text-white">
                          {child.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{child.name}</h2>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          {child.grade} класс
                        </span>
                        <span className="text-gray-300">|</span>
                        <span>{child.city}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                      <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-lg font-bold text-orange-600">
                            {weeklyReport?.streak ?? child.streak}
                          </p>
                          <p className="text-[11px] text-orange-400 font-medium">дней подряд</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-lg font-bold text-blue-600">
                            {minutesToHumanReadable(weeklyReport?.studyMinutes ?? child.totalStudyMinutes)}
                          </p>
                          <p className="text-[11px] text-blue-400 font-medium">за неделю</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                        <CalendarDays className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="text-sm font-bold text-purple-600">
                            {formatDate(child.lastActiveDate)}
                          </p>
                          <p className="text-[11px] text-purple-400 font-medium">последняя активность</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        <Timer className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="text-lg font-bold text-red-600">{daysUntilEnt}</p>
                          <p className="text-[11px] text-red-400 font-medium">дней до ЕНТ</p>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp share */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleShareWhatsApp}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-green-200 transition-all hover:bg-green-600 hover:shadow-md"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Отправить отчёт в WhatsApp
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Данные ребёнка ещё не загружены.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Ребёнок должен зарегистрироваться и привязать аккаунт.
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* ── Diagnostic Results ───────────────────────────────────── */}
          {diagnosticResult && (
            <motion.div variants={itemVariants}>
              <Card variant="default">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Результаты диагностики</h3>
                    <Badge color="blue" size="sm">
                      {formatDate(diagnosticResult.date)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Overall Score - Circular */}
                    <motion.div
                      variants={scaleIn}
                      className="flex flex-col items-center justify-center"
                    >
                      <CircularProgress
                        percentage={overallPercentage}
                        size={180}
                        strokeWidth={14}
                        color={
                          overallPercentage >= 75
                            ? '#16a34a'
                            : overallPercentage >= 50
                              ? '#d97706'
                              : '#dc2626'
                        }
                        bgColor="#f1f5f9"
                      >
                        <span className="text-4xl font-bold text-gray-900">{overallPercentage}%</span>
                        <span className="text-xs text-gray-400 mt-0.5">общий балл</span>
                      </CircularProgress>
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                          {diagnosticResult.overallScore} из {diagnosticResult.maxScore} баллов
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Лучше чем {diagnosticResult.percentile}% учеников
                        </p>
                      </div>
                    </motion.div>

                    {/* Subject Breakdown */}
                    <div className="lg:col-span-2 space-y-5">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        По предметам
                      </h4>
                      <div className="space-y-4">
                        {sortedSubjects.map((subjectScore) => (
                          <SubjectProgressBar key={subjectScore.subject} subjectScore={subjectScore} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommendation message */}
                  {weakestSubject && (
                    <motion.div
                      variants={itemVariants}
                      className="mt-8 bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3"
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Рекомендация</p>
                        <p className="text-sm text-amber-700 mt-0.5">
                          Вашему ребёнку стоит усилить{' '}
                          <strong>{SUBJECT_NAMES[weakestSubject.subject]}</strong>
                          {weakestSubject.weakTopics.length > 0 && (
                            <>
                              , особенно темы:{' '}
                              {weakestSubject.weakTopics.join(', ')}
                            </>
                          )}
                          . Текущий результат — {weakestSubject.percentage}%, что ниже целевого уровня.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* ── Weekly Activity Charts ──────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Study minutes line chart */}
              <Card variant="default">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-gray-900">Время занятий</h3>
                    </div>
                    <Badge color="blue" size="sm">
                      {minutesToHumanReadable(totalStudyMinutesWeek)} за неделю
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody className="p-4 sm:p-6">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyActivityData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                        <defs>
                          <linearGradient id="minutesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#94a3b8' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#94a3b8' }}
                          unit=" мин"
                        />
                        <Tooltip content={<CustomTooltip unit="мин" />} />
                        <Area
                          type="monotone"
                          dataKey="minutes"
                          stroke="#3b82f6"
                          strokeWidth={2.5}
                          fill="url(#minutesGradient)"
                          dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              {/* Tasks completed bar chart */}
              <Card variant="default">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      <h3 className="font-bold text-gray-900">Задания выполнены</h3>
                    </div>
                    <Badge color="purple" size="sm">
                      {totalTasksWeek} заданий за неделю
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody className="p-4 sm:p-6">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyActivityData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#a78bfa" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#94a3b8' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#94a3b8' }}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip unit="заданий" />} />
                        <Bar
                          dataKey="tasks"
                          fill="url(#barGradient)"
                          radius={[6, 6, 0, 0]}
                          barSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>
            </div>
          </motion.div>

          {/* ── Weekly Progress Report ────────────────────────────── */}
          {weeklyReport && (
            <motion.div variants={itemVariants}>
              <Card variant="default">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-gray-900">Еженедельный отчёт</h3>
                  </div>
                </CardHeader>
                <CardBody className="p-6 sm:p-8 space-y-8">
                  {/* ── Summary stats row ─────────────────────────────── */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div
                      variants={scaleIn}
                      className="bg-blue-50/70 border border-blue-100 rounded-xl p-5 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Время за неделю</p>
                        <p className="text-xl font-bold text-blue-600">
                          {minutesToHumanReadable(weeklyReport.studyMinutes)}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={scaleIn}
                      className="bg-green-50/70 border border-green-100 rounded-xl p-5 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Заданий выполнено</p>
                        <p className="text-xl font-bold text-green-600">
                          {weeklyReport.tasksCompleted}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={scaleIn}
                      className="bg-orange-50/70 border border-orange-100 rounded-xl p-5 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Flame className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Текущая серия</p>
                        <p className="text-xl font-bold text-orange-600">
                          {weeklyReport.streak} дней
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* ── Subject trend comparison ──────────────────────── */}
                  {weeklyReport.subjectTrends && weeklyReport.subjectTrends.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Динамика по предметам
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {weeklyReport.subjectTrends.map((trend) => {
                          const improved = trend.currentScore >= trend.prevScore
                          const diff = trend.currentScore - trend.prevScore
                          return (
                            <motion.div
                              key={trend.subject}
                              variants={scaleIn}
                              className="bg-white border border-gray-100 rounded-xl p-4 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-800 text-sm">
                                  {trend.subject}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-gray-400">{trend.prevScore}%</span>
                                  {improved ? (
                                    <ArrowUp className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <ArrowDown className="w-4 h-4 text-red-500" />
                                  )}
                                  <span
                                    className={cn(
                                      'text-sm font-semibold',
                                      improved ? 'text-green-600' : 'text-red-600',
                                    )}
                                  >
                                    {trend.currentScore}%
                                  </span>
                                  <Badge
                                    color={improved ? 'green' : 'red'}
                                    size="sm"
                                  >
                                    {diff > 0 ? '+' : ''}{diff}%
                                  </Badge>
                                </div>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                  className={cn(
                                    'h-full rounded-full',
                                    improved
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                      : 'bg-gradient-to-r from-red-400 to-red-500',
                                  )}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${trend.currentScore}%` }}
                                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const, delay: 0.4 }}
                                />
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Overall diagnostic comparison ────────────────── */}
                  {weeklyReport.prevDiagnosticScore != null && diagnosticResult && (
                    (() => {
                      const currentDiagPercent = Math.round(
                        (diagnosticResult.overallScore / diagnosticResult.maxScore) * 100,
                      )
                      const diagDiff = currentDiagPercent - weeklyReport.prevDiagnosticScore
                      const diagImproved = diagDiff >= 0

                      return (
                        <motion.div variants={itemVariants} className="space-y-4">
                          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            Сравнение диагностики
                          </h4>
                          <div
                            className={cn(
                              'rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4',
                              diagImproved
                                ? 'bg-green-50/70 border border-green-100'
                                : 'bg-red-50/70 border border-red-100',
                            )}
                          >
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Предыдущий результат:</span>
                                <span className="font-bold text-gray-700">
                                  {weeklyReport.prevDiagnosticScore}%
                                </span>
                              </div>
                              <div className="hidden sm:block">
                                {diagImproved ? (
                                  <ArrowUp className="w-5 h-5 text-green-500" />
                                ) : (
                                  <ArrowDown className="w-5 h-5 text-red-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Текущий результат:</span>
                                <span
                                  className={cn(
                                    'font-bold',
                                    diagImproved ? 'text-green-600' : 'text-red-600',
                                  )}
                                >
                                  {currentDiagPercent}%
                                </span>
                              </div>
                              <Badge color={diagImproved ? 'green' : 'red'} size="sm">
                                {diagDiff > 0 ? '+' : ''}{diagDiff}%
                              </Badge>
                            </div>

                            <div className="flex items-start gap-2 sm:max-w-xs">
                              <Sparkles
                                className={cn(
                                  'w-4 h-4 flex-shrink-0 mt-0.5',
                                  diagImproved ? 'text-green-500' : 'text-red-400',
                                )}
                              />
                              <p className="text-sm text-gray-600">
                                {diagImproved
                                  ? diagDiff >= 10
                                    ? 'Отличный прогресс! Так держать, результаты заметно улучшились.'
                                    : 'Хорошая динамика! Продолжайте заниматься для ещё лучших результатов.'
                                  : 'Результат немного снизился. Рекомендуем уделить больше внимания слабым темам.'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })()
                  )}
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* ── Study Plan Progress ──────────────────────────────────── */}
          {studyPlan && (
            <motion.div variants={itemVariants}>
              <Card variant="default">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-bold text-gray-900">Учебный план</h3>
                    <Badge color="green" size="sm">
                      {studyPlan.targetUniversity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Overall progress */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">Общий прогресс</span>
                        <span className="font-bold text-green-600">{planProgress}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${planProgress}%` }}
                          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        Цель: {studyPlan.targetSpecialty}
                      </p>
                    </div>

                    {/* Current week */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          Неделя {currentWeek} из {studyPlan.weeks.length}
                        </span>
                        <span className="font-bold text-blue-600">{currentWeekRate}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${currentWeekRate}%` }}
                          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        {currentWeekCompleted} из {currentWeekTotal} заданий выполнено
                      </p>
                    </div>

                    {/* Completion rate visual */}
                    <div className="flex items-center justify-center">
                      <CircularProgress
                        percentage={currentWeekRate}
                        size={100}
                        strokeWidth={8}
                        color="#2563eb"
                        bgColor="#e5e7eb"
                      >
                        <span className="text-xl font-bold text-gray-900">{currentWeekRate}%</span>
                        <span className="text-[10px] text-gray-400">на этой неделе</span>
                      </CircularProgress>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* ── Curator Progress ─────────────────────────────────── */}
          {curatorStats && (
            <motion.div variants={itemVariants}>
              <Card variant="default">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-gray-900">Цифровой куратор</h3>
                    <Badge color="blue" size="sm">{curatorPlan?.goalType === 'ielts' ? 'IELTS' : 'ЕНТ'}</Badge>
                  </div>
                </CardHeader>
                <CardBody className="p-6 sm:p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-center">
                      <p className="text-2xl font-bold text-indigo-600">{curatorStats.completed}</p>
                      <p className="text-xs text-indigo-400 mt-0.5">выполнено</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-center">
                      <p className="text-2xl font-bold text-amber-600">{curatorStats.inProgress}</p>
                      <p className="text-xs text-amber-400 mt-0.5">в процессе</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center">
                      <p className="text-2xl font-bold text-gray-600">{curatorStats.total}</p>
                      <p className="text-xs text-gray-400 mt-0.5">всего модулей</p>
                    </div>
                    <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{curatorStats.avgScore}%</p>
                      <p className="text-xs text-green-400 mt-0.5">средний балл</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-600">Общий прогресс куратора</span>
                      <span className="font-bold text-indigo-600">
                        {curatorStats.total > 0 ? Math.round((curatorStats.completed / curatorStats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${curatorStats.total > 0 ? Math.round((curatorStats.completed / curatorStats.total) * 100) : 0}%` }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* ── Practice ENT Results ──────────────────────────────── */}
          {recentEntResults.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card variant="default">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-bold text-gray-900">Пробные ЕНТ</h3>
                    <Badge color="yellow" size="sm">последние {recentEntResults.length}</Badge>
                  </div>
                </CardHeader>
                <CardBody className="p-6 sm:p-8 space-y-3">
                  {recentEntResults.map((result, i) => {
                    const pct = result.percentage
                    const color = pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'
                    const bgColor = pct >= 70 ? 'bg-green-50 border-green-100' : pct >= 50 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'
                    return (
                      <div key={result.id} className={`flex items-center gap-4 rounded-xl border p-4 ${bgColor}`}>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/60 text-sm font-bold text-gray-600">
                          #{i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{result.variantTitle}</p>
                          <p className="text-xs text-gray-400">
                            {SUBJECT_NAMES[result.profileSubject1]} + {SUBJECT_NAMES[result.profileSubject2]}
                            &nbsp;·&nbsp;{new Date(result.date).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xl font-bold ${color}`}>{result.totalCorrect}/{result.totalQuestions}</p>
                          <p className="text-xs text-gray-400">{pct}%</p>
                        </div>
                      </div>
                    )
                  })}
                  {recentEntResults.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-4">
                      Пробные ЕНТ ещё не сдавались
                    </p>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* ── Recommendations Panel ───────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Card variant="default">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-gray-900">Что делать дальше</h3>
                </div>
              </CardHeader>
              <CardBody className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Weak subject recommendation */}
                  {weakestSubject && (
                    <motion.div
                      variants={scaleIn}
                      className="bg-red-50/70 border border-red-100 rounded-xl p-5 flex flex-col gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-red-500" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">Требует внимания</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Ребёнку нужно больше практики по{' '}
                        <strong className="text-red-600">
                          {SUBJECT_NAMES[weakestSubject.subject]}
                        </strong>
                        . Текущий уровень — {weakestSubject.percentage}%.
                      </p>
                      <div className="mt-auto pt-2">
                        <Badge color="red" size="sm">
                          {weakestSubject.percentage}% — нужно подтянуть
                        </Badge>
                      </div>
                    </motion.div>
                  )}

                  {/* Strong subject praise */}
                  {strongestSubject && (
                    <motion.div
                      variants={scaleIn}
                      className="bg-green-50/70 border border-green-100 rounded-xl p-5 flex flex-col gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <Star className="w-5 h-5 text-green-500" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">Отличный результат</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Отличный прогресс по{' '}
                        <strong className="text-green-600">
                          {SUBJECT_NAMES[strongestSubject.subject]}
                        </strong>
                        ! Продолжайте в том же духе.
                      </p>
                      <div className="mt-auto pt-2">
                        <Badge color="green" size="sm">
                          {strongestSubject.percentage}% — молодец!
                        </Badge>
                      </div>
                    </motion.div>
                  )}

                  {/* AI mentor suggestion */}
                  <motion.div
                    variants={scaleIn}
                    className="bg-purple-50/70 border border-purple-100 rounded-xl p-5 flex flex-col gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-purple-500" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">AI-ментор</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Рекомендуем AI-ментора для персональных объяснений сложных тем и индивидуального подхода к обучению.
                    </p>
                    <div className="mt-auto pt-2">
                      <Badge color="purple" size="sm">
                        Персональный подход
                      </Badge>
                    </div>
                  </motion.div>
                </div>

                {/* No diagnostic fallback recommendations */}
                {!diagnosticResult && (
                  <div className="text-center py-6">
                    <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      Рекомендации появятся после прохождения диагностического теста.
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Попросите ребёнка пройти тест для персональных рекомендаций.
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* ── Premium Upsell ──────────────────────────────────────── */}
          {!user.isPremium && (
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border-0 shadow-xl shadow-blue-500/10">
                <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-1 rounded-2xl">
                  <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-[14px] p-6 sm:p-8 overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Crown className="w-6 h-6 text-amber-400" />
                          <h3 className="text-xl font-bold text-white">
                            Получите полный доступ к аналитике
                          </h3>
                        </div>
                        <p className="text-blue-200 text-sm mb-5 max-w-lg leading-relaxed">
                          Откройте все возможности Study Hub для максимального контроля за прогрессом вашего ребёнка.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/10">
                            <BarChart3 className="w-4 h-4 text-blue-300 flex-shrink-0" />
                            <span className="text-sm text-blue-100">Детальная аналитика</span>
                          </div>
                          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/10">
                            <Brain className="w-4 h-4 text-purple-300 flex-shrink-0" />
                            <span className="text-sm text-purple-100">AI-ментор</span>
                          </div>
                          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/10">
                            <ShieldCheck className="w-4 h-4 text-green-300 flex-shrink-0" />
                            <span className="text-sm text-green-100">Еженедельные отчёты</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <button
                          onClick={() => navigate('/pricing')}
                          className={cn(
                            'group relative w-full md:w-auto',
                            'bg-gradient-to-r from-amber-400 to-orange-400',
                            'hover:from-amber-300 hover:to-orange-300',
                            'text-gray-900 font-bold',
                            'px-6 py-4 rounded-xl',
                            'shadow-lg shadow-amber-500/30',
                            'transition-all duration-200',
                            'hover:shadow-xl hover:shadow-amber-500/40',
                            'active:scale-[0.98]',
                            'flex items-center justify-center gap-2',
                          )}
                        >
                          <Crown className="w-5 h-5" />
                          <span className="flex flex-col items-start">
                            <span className="text-sm leading-tight">Подключить Премиум</span>
                            <span className="text-xs font-semibold opacity-80">4 990 &#8376;/мес</span>
                          </span>
                          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── Footer note ────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="text-center py-4">
            <p className="text-xs text-gray-400">
              Данные обновляются автоматически. Последнее обновление:{' '}
              {formatDate(new Date().toISOString())}
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
