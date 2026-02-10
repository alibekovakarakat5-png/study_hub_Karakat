import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FlaskConical,
  GraduationCap,
  MapPin,
  Pencil,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { universities } from '@/data/universities'
import { cn, formatDateShort, minutesToHumanReadable } from '@/lib/utils'
import { SUBJECT_NAMES, SUBJECT_COLORS } from '@/types'
import type { Subject, University, Specialty } from '@/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TASK_TYPE_META: Record<
  string,
  { label: string; color: string; icon: typeof BookOpen }
> = {
  lesson: { label: 'Теория', color: 'bg-blue-100 text-blue-700', icon: BookOpen },
  practice: { label: 'Практика', color: 'bg-amber-100 text-amber-700', icon: Pencil },
  test: { label: 'Тест', color: 'bg-purple-100 text-purple-700', icon: FlaskConical },
  review: { label: 'Повторение', color: 'bg-green-100 text-green-700', icon: Target },
}

const DEMAND_BADGES: Record<string, { label: string; color: string }> = {
  high: { label: 'Высокий спрос', color: 'bg-green-100 text-green-700' },
  medium: { label: 'Средний спрос', color: 'bg-amber-100 text-amber-700' },
  low: { label: 'Низкий спрос', color: 'bg-gray-100 text-gray-600' },
}

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}

// ---------------------------------------------------------------------------
// Plan Creation Mode
// ---------------------------------------------------------------------------

function PlanCreation() {
  const generateStudyPlan = useStore((s) => s.generateStudyPlan)

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [selectedUni, setSelectedUni] = useState<University | null>(null)
  const [selectedSpec, setSelectedSpec] = useState<Specialty | null>(null)
  const [searchUni, setSearchUni] = useState('')

  const filteredUnis = useMemo(
    () =>
      universities.filter(
        (u) =>
          u.name.toLowerCase().includes(searchUni.toLowerCase()) ||
          u.city.toLowerCase().includes(searchUni.toLowerCase()),
      ),
    [searchUni],
  )

  function goNext() {
    setDirection(1)
    setStep((s) => s + 1)
  }

  function goBack() {
    setDirection(-1)
    setStep((s) => s - 1)
  }

  function handleSelectUni(uni: University) {
    setSelectedUni(uni)
    setSelectedSpec(null)
    goNext()
  }

  function handleSelectSpec(spec: Specialty) {
    setSelectedSpec(spec)
    goNext()
  }

  function handleCreate() {
    if (selectedUni && selectedSpec) {
      generateStudyPlan(selectedUni.id, selectedSpec.id)
    }
  }

  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + 16 * 7)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Back link */}
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Link>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Создай свой учебный план
          </h1>
          <p className="mt-2 text-gray-500">
            Выбери цель — мы составим персональный план подготовки к ЕНТ
          </p>
        </motion.div>

        {/* Stepper */}
        <div className="mb-10 flex items-center justify-center gap-2">
          {['Университет', 'Специальность', 'Подтверждение'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  i < step
                    ? 'bg-green-500 text-white'
                    : i === step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500',
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:inline',
                  i === step ? 'text-gray-900' : 'text-gray-400',
                )}
              >
                {label}
              </span>
              {i < 2 && (
                <div className="mx-2 h-px w-8 bg-gray-300 sm:w-12" />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="step-0"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Поиск по названию или городу..."
                  value={searchUni}
                  onChange={(e) => setSearchUni(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredUnis.map((uni) => (
                  <motion.button
                    key={uni.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectUni(uni)}
                    className={cn(
                      'group relative rounded-2xl border bg-white p-5 text-left shadow-sm transition-all hover:shadow-lg',
                      selectedUni?.id === uni.id
                        ? 'border-blue-400 ring-2 ring-blue-100'
                        : 'border-gray-200',
                    )}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        #{uni.ranking}
                      </span>
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {uni.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {uni.city}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                      <span>{uni.specialties.length} специальностей</span>
                      <span className="text-gray-300">|</span>
                      <span>от {uni.minScore} баллов</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {filteredUnis.length === 0 && (
                <div className="py-16 text-center text-gray-400">
                  Университеты не найдены
                </div>
              )}
            </motion.div>
          )}

          {step === 1 && selectedUni && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <button
                onClick={goBack}
                className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Другой университет
              </button>

              <div className="mb-6 rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-900">
                  {selectedUni.name}
                </p>
                <p className="text-xs text-blue-600">{selectedUni.city}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {selectedUni.specialties.map((spec) => {
                  const demandBadge = DEMAND_BADGES[spec.demand]
                  return (
                    <motion.button
                      key={spec.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectSpec(spec)}
                      className={cn(
                        'group relative rounded-2xl border bg-white p-5 text-left shadow-sm transition-all hover:shadow-lg',
                        selectedSpec?.id === spec.id
                          ? 'border-blue-400 ring-2 ring-blue-100'
                          : 'border-gray-200',
                      )}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {spec.name}
                        </h3>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                            demandBadge.color,
                          )}
                        >
                          {demandBadge.label}
                        </span>
                      </div>

                      <p className="mb-3 text-xs text-gray-400">
                        Код: {spec.code}
                      </p>

                      {/* Subjects */}
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {spec.subjects.map((subj) => (
                          <span
                            key={subj}
                            className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: SUBJECT_COLORS[subj] }}
                            />
                            {SUBJECT_NAMES[subj]}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          Мин. балл:{' '}
                          <span className="font-semibold text-gray-800">
                            {spec.minScore}
                          </span>
                        </span>
                        <span className="text-gray-500">
                          Зарплата:{' '}
                          <span className="font-semibold text-gray-800">
                            {spec.avgSalary}
                          </span>
                        </span>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && selectedUni && selectedSpec && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <button
                onClick={goBack}
                className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Другая специальность
              </button>

              <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                {/* Header gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white">
                  <div className="mb-1 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 opacity-80" />
                    <span className="text-sm opacity-80">Твоя цель</span>
                  </div>
                  <h2 className="text-lg font-bold">{selectedUni.name}</h2>
                  <p className="text-sm opacity-90">{selectedSpec.name}</p>
                </div>

                <div className="divide-y divide-gray-100 px-6">
                  {/* Required subjects */}
                  <div className="py-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                      Предметы ЕНТ
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSpec.subjects.map((subj) => (
                        <span
                          key={subj}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: SUBJECT_COLORS[subj] }}
                          />
                          {SUBJECT_NAMES[subj]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 py-4">
                    <div>
                      <p className="text-xs text-gray-400">Мин. балл</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedSpec.minScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Длительность</p>
                      <p className="text-lg font-bold text-gray-900">
                        16 недель
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Целевая дата</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatDateShort(targetDate.toISOString())}
                      </p>
                    </div>
                  </div>

                  {/* Salary / Demand */}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-xs text-gray-400">Ср. зарплата</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedSpec.avgSalary}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium',
                        DEMAND_BADGES[selectedSpec.demand].color,
                      )}
                    >
                      {DEMAND_BADGES[selectedSpec.demand].label}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCreate}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-shadow hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    <Sparkles className="h-4 w-4" />
                    Создать план
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Plan View Mode
// ---------------------------------------------------------------------------

function PlanView() {
  const studyPlan = useStore((s) => s.studyPlan)!
  const toggleTask = useStore((s) => s.toggleTask)
  const diagnosticResult = useStore((s) => s.diagnosticResult)

  const [selectedWeekNum, setSelectedWeekNum] = useState(studyPlan.currentWeek)
  const weekScrollRef = useRef<HTMLDivElement>(null)

  const selectedWeek = studyPlan.weeks.find((w) => w.weekNumber === selectedWeekNum)!

  // Scroll to current week pill on mount
  useEffect(() => {
    if (weekScrollRef.current) {
      const activeBtn = weekScrollRef.current.querySelector('[data-active="true"]')
      if (activeBtn) {
        activeBtn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [])

  // Computed stats
  const totalTasks = studyPlan.weeks.flatMap((w) => w.tasks).length
  const completedTasks = studyPlan.weeks
    .flatMap((w) => w.tasks)
    .filter((t) => t.completed).length

  const totalRemainingMinutes = studyPlan.weeks
    .flatMap((w) => w.tasks)
    .filter((t) => !t.completed)
    .reduce((sum, t) => sum + t.duration, 0)

  const daysLeft = daysUntil(studyPlan.targetDate)

  // Week progress
  const weekCompletedTasks = selectedWeek.tasks.filter((t) => t.completed).length
  const weekTotalTasks = selectedWeek.tasks.length
  const weekProgress =
    weekTotalTasks > 0 ? Math.round((weekCompletedTasks / weekTotalTasks) * 100) : 0

  // Weak subjects from diagnostic
  const weakSubjects = useMemo(() => {
    if (!diagnosticResult) return []
    return diagnosticResult.subjects
      .filter((s) => s.level === 'low' || s.level === 'medium')
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3)
  }, [diagnosticResult])

  // Week scroll arrows
  function scrollWeeks(dir: 'left' | 'right') {
    if (weekScrollRef.current) {
      weekScrollRef.current.scrollBy({
        left: dir === 'left' ? -200 : 200,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Back link */}
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Link>

        {/* Plan header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-400">
                <GraduationCap className="h-4 w-4" />
                Учебный план
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {studyPlan.targetUniversity}
              </h1>
              <p className="text-sm text-gray-500">{studyPlan.targetSpecialty}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-xs text-gray-400">Целевая дата</p>
                <p className="font-semibold text-gray-900">
                  {formatDateShort(studyPlan.targetDate)}
                </p>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-xs text-gray-400">Прогресс</p>
                <p className="font-semibold text-blue-600">
                  {studyPlan.overallProgress}%
                </p>
              </div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mt-4">
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${studyPlan.overallProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Week pills navigation */}
        <div className="relative mb-6">
          <button
            onClick={() => scrollWeeks('left')}
            className="absolute -left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <div
            ref={weekScrollRef}
            className="scrollbar-none flex gap-2 overflow-x-auto px-8 py-1"
          >
            {studyPlan.weeks.map((week) => {
              const isActive = week.weekNumber === selectedWeekNum
              const isCurrent = week.weekNumber === studyPlan.currentWeek
              const isCompleted = week.completed
              return (
                <button
                  key={week.weekNumber}
                  data-active={isActive}
                  onClick={() => setSelectedWeekNum(week.weekNumber)}
                  className={cn(
                    'relative shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : isCompleted
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                  )}
                >
                  {week.weekNumber}
                  {isCurrent && !isActive && (
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
                  )}
                  {isCompleted && !isActive && (
                    <CheckCircle2 className="absolute -right-1 -top-1 h-4 w-4 text-green-500" />
                  )}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => scrollWeeks('right')}
            className="absolute -right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Main: selected week detail */}
          <motion.div
            key={selectedWeekNum}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Week dates & progress */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Неделя {selectedWeek.weekNumber}
                </h2>
                <p className="text-xs text-gray-500">
                  {formatDateShort(selectedWeek.startDate)} —{' '}
                  {formatDateShort(selectedWeek.endDate)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">
                  {weekCompletedTasks} / {weekTotalTasks}
                </p>
                <p className="text-xs text-gray-400">заданий выполнено</p>
              </div>
            </div>

            {/* Week progress bar */}
            <div className="mb-6 h-2 overflow-hidden rounded-full bg-gray-100">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${weekProgress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>

            {/* Task list */}
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {selectedWeek.tasks.map((task) => {
                  const meta = TASK_TYPE_META[task.type]
                  const TypeIcon = meta.icon
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'group flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-all',
                        task.completed
                          ? 'border-green-200 bg-green-50/50'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
                      )}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTask(selectedWeek.weekNumber, task.id)}
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all',
                          task.completed
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 hover:border-blue-400',
                        )}
                      >
                        <AnimatePresence>
                          {task.completed && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                              <Check className="h-3 w-3 text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>

                      {/* Subject color dot */}
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: SUBJECT_COLORS[task.subject] }}
                        title={SUBJECT_NAMES[task.subject]}
                      />

                      {/* Title */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'text-sm font-medium transition-colors',
                            task.completed
                              ? 'text-gray-400 line-through'
                              : 'text-gray-900',
                          )}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {SUBJECT_NAMES[task.subject]}
                        </p>
                      </div>

                      {/* Type badge */}
                      <span
                        className={cn(
                          'hidden items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium sm:inline-flex',
                          meta.color,
                        )}
                      >
                        <TypeIcon className="h-3 w-3" />
                        {meta.label}
                      </span>

                      {/* Duration */}
                      <span className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {minutesToHumanReadable(task.duration)}
                      </span>

                      {/* Completed indicator */}
                      {task.completed && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {selectedWeek.tasks.length === 0 && (
                <div className="py-12 text-center text-gray-400">
                  Нет заданий на эту неделю
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar stats */}
          <div className="space-y-4">
            {/* Overall stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Статистика
              </h3>
              <div className="space-y-4">
                {/* Tasks */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {completedTasks} / {totalTasks}
                    </p>
                    <p className="text-xs text-gray-400">Заданий выполнено</p>
                  </div>
                </div>

                {/* Time remaining */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {minutesToHumanReadable(totalRemainingMinutes)}
                    </p>
                    <p className="text-xs text-gray-400">Осталось учиться</p>
                  </div>
                </div>

                {/* Days until ENT */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                    <Calendar className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {daysLeft}
                    </p>
                    <p className="text-xs text-gray-400">Дней до ЕНТ</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Weak subjects */}
            {weakSubjects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  Фокус на предметах
                </h3>
                <p className="mb-3 text-xs text-gray-400">
                  На основе диагностического теста
                </p>
                <div className="space-y-3">
                  {weakSubjects.map((ss) => (
                    <div key={ss.subject}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: SUBJECT_COLORS[ss.subject],
                            }}
                          />
                          <span className="text-xs font-medium text-gray-700">
                            {SUBJECT_NAMES[ss.subject]}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            ss.level === 'low'
                              ? 'text-red-500'
                              : 'text-amber-500',
                          )}
                        >
                          {ss.percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            ss.level === 'low' ? 'bg-red-400' : 'bg-amber-400',
                          )}
                          style={{ width: `${ss.percentage}%` }}
                        />
                      </div>
                      {ss.weakTopics.length > 0 && (
                        <p className="mt-1 text-[11px] text-gray-400">
                          Слабые: {ss.weakTopics.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Motivation card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-5 text-white shadow-lg"
            >
              <div className="mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4 opacity-80" />
                <span className="text-sm font-semibold">Мотивация</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {studyPlan.overallProgress < 25
                  ? 'Каждый маленький шаг приближает тебя к мечте. Начни с одного задания!'
                  : studyPlan.overallProgress < 50
                    ? 'Отличный старт! Ты уже на верном пути. Продолжай в том же духе.'
                    : studyPlan.overallProgress < 75
                      ? 'Больше половины пути пройдено! Ты молодец, не сбавляй темп.'
                      : 'Финишная прямая! Осталось совсем немного до цели.'}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

export default function Plan() {
  const studyPlan = useStore((s) => s.studyPlan)

  return studyPlan ? <PlanView /> : <PlanCreation />
}
