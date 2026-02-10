import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Flame,
  FolderOpen,
  GraduationCap,
  Mail,
  Pencil,
  Share2,
  Sparkles,
  Star,
  Target,
  Trophy,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { SUBJECT_NAMES, SUBJECT_COLORS } from '@/types'
import type { Achievement, DiagnosticResult } from '@/types'
import { cn, formatDate, minutesToHumanReadable } from '@/lib/utils'

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 240, damping: 26 },
  },
}

const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.25 } },
}

// ─── Mock Data for External Profile ──────────────────────────────────────────

const MOCK_PROFILE = {
  id: 'mock-user-001',
  name: 'Арман Сериков',
  email: 'arman.serikov@mail.kz',
  grade: 11,
  city: 'Астана',
  targetUniversity: 'Назарбаев Университет',
  targetSpecialty: 'Computer Science',
  isPremium: true,
  streak: 34,
  totalStudyMinutes: 8460,
  bio: 'Увлечённый программист и математик. Готовлюсь к поступлению в Назарбаев Университет на Computer Science. Участник республиканских олимпиад по информатике и математике.',
  isOpenToWork: true,
  createdAt: '2025-09-01T00:00:00.000Z',
}

const MOCK_DIAGNOSTIC: DiagnosticResult = {
  id: 'diag-mock-001',
  userId: 'mock-user-001',
  date: '2026-01-15T00:00:00.000Z',
  subjects: [
    { subject: 'math', score: 23, maxScore: 25, percentage: 92, level: 'high', weakTopics: ['Логарифмы'], strongTopics: ['Алгебра', 'Геометрия', 'Функции', 'Тригонометрия'] },
    { subject: 'physics', score: 17, maxScore: 20, percentage: 85, level: 'high', weakTopics: ['Оптика'], strongTopics: ['Механика', 'Электричество', 'Термодинамика'] },
    { subject: 'informatics', score: 14, maxScore: 15, percentage: 93, level: 'high', weakTopics: [], strongTopics: ['Алгоритмы', 'Программирование', 'Базы данных'] },
    { subject: 'english', score: 16, maxScore: 20, percentage: 80, level: 'high', weakTopics: ['Writing'], strongTopics: ['Grammar', 'Reading', 'Vocabulary'] },
    { subject: 'history', score: 14, maxScore: 20, percentage: 70, level: 'medium', weakTopics: ['Новое время'], strongTopics: ['Древний период', 'Независимость'] },
  ],
  overallScore: 84,
  maxScore: 100,
  percentile: 92,
  predictedUniversities: [],
}

const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-test', title: 'Первый шаг', description: 'Пройди диагностический тест', icon: '🎯', category: 'score', unlockedAt: '2025-09-15T00:00:00.000Z' },
  { id: 'streak-3', title: '3 дня подряд', description: 'Занимайся 3 дня подряд', icon: '🔥', category: 'streak', unlockedAt: '2025-09-18T00:00:00.000Z' },
  { id: 'streak-7', title: 'Неделя силы', description: 'Занимайся 7 дней подряд', icon: '💪', category: 'streak', unlockedAt: '2025-09-22T00:00:00.000Z' },
  { id: 'streak-30', title: 'Месяц дисциплины', description: '30 дней без перерыва', icon: '🏆', category: 'streak', unlockedAt: '2025-10-15T00:00:00.000Z' },
  { id: 'score-80', title: 'Отличник', description: 'Набери 80%+ на тесте', icon: '⭐', category: 'score', unlockedAt: '2025-09-15T00:00:00.000Z' },
  { id: 'tasks-10', title: 'Трудяга', description: 'Выполни 10 заданий', icon: '📚', category: 'practice', unlockedAt: '2025-09-25T00:00:00.000Z' },
  { id: 'tasks-50', title: 'Марафонец', description: 'Выполни 50 заданий', icon: '🏃', category: 'practice', unlockedAt: '2025-11-01T00:00:00.000Z' },
  { id: 'plan-created', title: 'Стратег', description: 'Создай учебный план', icon: '🗺️', category: 'practice', unlockedAt: '2025-09-16T00:00:00.000Z' },
]

const MOCK_EDUCATION = [
  {
    institution: 'НИШ ФМН г. Астана',
    degree: 'Ученик 11 класса',
    year: '2023 — настоящее время',
    description: 'Физико-математическое направление. GPA: 4.8/5.0. Член научного общества.',
    achievements: ['Призёр городской олимпиады по математике', 'Участник республиканской олимпиады по информатике'],
  },
  {
    institution: 'Назарбаев Университет',
    degree: 'Computer Science (цель)',
    year: '2026',
    description: 'Целевой университет. Минимальный проходной балл — 80. Текущая готовность — 84%.',
    achievements: [],
  },
]

const MOCK_EXPERIENCE = [
  {
    company: 'Study Hub',
    role: 'Активный ученик',
    period: 'Сентябрь 2025 — настоящее время',
    description: 'Прошёл диагностику, создал персональный учебный план, выполнил 50+ заданий. Регулярно занимается по расписанию.',
  },
  {
    company: 'Олимпиадная подготовка',
    role: 'Участник и призёр',
    period: 'Октябрь 2024 — Март 2025',
    description: 'Интенсивная подготовка к республиканским олимпиадам по математике и информатике. Решение задач повышенной сложности.',
  },
  {
    company: 'Летняя IT-школа Astana Hub',
    role: 'Стажёр-разработчик',
    period: 'Июнь — Август 2025',
    description: 'Разработка веб-приложения на React. Командная работа по методологии Agile. Презентация проекта перед экспертами.',
  },
]

const MOCK_COURSES = [
  { title: 'Диагностический тест Study Hub', provider: 'Study Hub', date: '2026-01-15', score: '84%' },
  { title: 'Учебный план подготовки к ЕНТ', provider: 'Study Hub', date: '2026-01-16', score: 'В процессе' },
  { title: 'Алгоритмы и структуры данных', provider: 'Stepik', date: '2025-12-20', score: '95%' },
  { title: 'Web Development Fundamentals', provider: 'Coursera', date: '2025-08-10', score: '91%' },
]

const MOCK_PROJECTS = [
  {
    title: 'Учебный план подготовки к ЕНТ',
    description: 'Персональный 16-недельный план подготовки к ЕНТ с фокусом на математику, физику и информатику. Адаптивный план с учётом слабых тем.',
    skills: ['Планирование', 'Самодисциплина', 'Аналитика'],
    link: '#',
  },
  {
    title: 'Олимпиада по математике — Призёр',
    description: 'Участие в городской олимпиаде по математике. Решение задач по алгебре, геометрии, комбинаторике и теории чисел. Третье место.',
    skills: ['Математика', 'Логика', 'Решение задач'],
    link: '#',
  },
  {
    title: 'Веб-приложение «Трекер привычек»',
    description: 'Pet-проект на React + TypeScript. Приложение для отслеживания ежедневных привычек с визуализацией прогресса и статистикой.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Zustand'],
    link: '#',
  },
]

// Generate mock activity data for the last 12 weeks
function generateActivityData(): number[][] {
  const weeks: number[][] = []
  for (let w = 0; w < 12; w++) {
    const days: number[] = []
    for (let d = 0; d < 7; d++) {
      // More recent weeks tend to have more activity
      const baseProbability = 0.3 + (w / 12) * 0.5
      const isActive = Math.random() < baseProbability
      days.push(isActive ? Math.floor(Math.random() * 4) + 1 : 0)
    }
    weeks.push(days)
  }
  return weeks
}

const ACTIVITY_DATA = generateActivityData()

// ─── Section Edit Button ─────────────────────────────────────────────────────

function EditButton({ label }: { label: string }) {
  return (
    <button
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 transition-all duration-200"
      title={`Редактировать: ${label}`}
    >
      <Pencil className="w-3 h-3" />
      Редактировать
    </button>
  )
}

// ─── Hero Section ────────────────────────────────────────────────────────────

function HeroSection({
  profile,
  diagnosticResult,
  achievements,
  isOwnProfile,
}: {
  profile: {
    name: string
    email: string
    grade: number
    city: string
    targetUniversity?: string
    targetSpecialty?: string
    isPremium: boolean
    streak: number
    totalStudyMinutes: number
    bio?: string
    isOpenToWork?: boolean
    createdAt: string
  }
  diagnosticResult: DiagnosticResult | null
  achievements: Achievement[]
  isOwnProfile: boolean
}) {
  const overallPercentage =
    diagnosticResult && diagnosticResult.maxScore > 0
      ? Math.round((diagnosticResult.overallScore / diagnosticResult.maxScore) * 100)
      : 0

  const unlockedCount = achievements.filter(a => a.unlockedAt).length
  const studyHours = Math.round(profile.totalStudyMinutes / 60)

  const initials = profile.name
    .split(' ')
    .map(w => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <section className="relative overflow-hidden gradient-hero text-white">
      {/* Decorative orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-10">
        {/* Back button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к дашборду
        </Link>

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            className="relative shrink-0"
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl sm:text-5xl font-bold shadow-2xl shadow-purple-500/30 ring-4 ring-white/10">
              {initials}
            </div>
            {profile.isPremium && (
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex-1 min-w-0"
          >
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {profile.name}
              </h1>
              {isOwnProfile && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/70 border border-white/10">
                  Это ваш профиль
                </span>
              )}
            </div>

            <p className="text-white/60 text-base sm:text-lg mt-1">
              Студент {profile.grade} класса · {profile.city}
              {profile.targetUniversity && (
                <span className="text-white/40"> · Цель: {profile.targetUniversity}</span>
              )}
            </p>

            {/* Open-to-work badge */}
            {profile.isOpenToWork && (
              <div className="inline-flex items-center gap-2 mt-3 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-sm font-medium text-emerald-300">
                  Открыт к стажировке
                </span>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <p className="text-white/50 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Contact buttons */}
            <div className="flex flex-wrap gap-2.5 mt-5">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium transition-all duration-200 backdrop-blur-sm"
              >
                <Mail className="w-4 h-4" />
                Написать
              </a>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium transition-all duration-200 backdrop-blur-sm"
              >
                <Share2 className="w-4 h-4" />
                Поделиться
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium transition-all duration-200 backdrop-blur-sm">
                <Download className="w-4 h-4" />
                Скачать PDF
              </button>
              {isOwnProfile && <EditButton label="Профиль" />}
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8"
        >
          {[
            {
              label: 'Study Hub Score',
              value: overallPercentage > 0 ? `${overallPercentage}%` : '--',
              icon: Target,
              color: 'from-blue-400 to-blue-600',
            },
            {
              label: 'Серия дней',
              value: `${profile.streak}`,
              icon: Flame,
              color: 'from-orange-400 to-red-500',
            },
            {
              label: 'Часы учёбы',
              value: `${studyHours}`,
              icon: Clock,
              color: 'from-emerald-400 to-teal-600',
            },
            {
              label: 'Достижения',
              value: `${unlockedCount}`,
              icon: Trophy,
              color: 'from-amber-400 to-orange-500',
            },
          ].map(stat => (
            <div
              key={stat.label}
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm"
            >
              <div className={cn('flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br shrink-0', stat.color)}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs text-white/40 truncate">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Skills Section ──────────────────────────────────────────────────────────

function SkillsSection({
  diagnosticResult,
  isOwnProfile,
}: {
  diagnosticResult: DiagnosticResult | null
  isOwnProfile: boolean
}) {
  const extraSkills = [
    { name: 'Критическое мышление', level: 78 },
    { name: 'Командная работа', level: 72 },
    { name: 'Самоорганизация', level: 88 },
  ]

  const subjectSkills = diagnosticResult
    ? diagnosticResult.subjects.map(s => ({
        name: SUBJECT_NAMES[s.subject],
        level: s.percentage,
        color: SUBJECT_COLORS[s.subject],
        subject: s.subject,
      }))
    : []

  const allSkills = [
    ...subjectSkills.map(s => ({ name: s.name, level: s.level, color: s.color })),
    ...extraSkills.map(s => ({ name: s.name, level: s.level, color: '#6366f1' })),
  ].sort((a, b) => b.level - a.level)

  return (
    <motion.section variants={sectionVariants} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Навыки и компетенции</h2>
            <p className="text-sm text-gray-500">Оценка на основе диагностики и активности</p>
          </div>
        </div>
        {isOwnProfile && <EditButton label="Навыки" />}
      </div>

      {allSkills.length > 0 ? (
        <div className="space-y-4">
          {allSkills.map((skill, index) => (
            <div key={skill.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                <span
                  className={cn(
                    'text-sm font-bold',
                    skill.level >= 80 ? 'text-emerald-600' : skill.level >= 60 ? 'text-amber-600' : 'text-red-500'
                  )}
                >
                  {skill.level}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: skill.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.08, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
          <Zap className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Навыки появятся после прохождения диагностики</p>
        </div>
      )}
    </motion.section>
  )
}

// ─── Education Section ───────────────────────────────────────────────────────

function EducationSection({
  education,
  isOwnProfile,
}: {
  education: typeof MOCK_EDUCATION
  isOwnProfile: boolean
}) {
  return (
    <motion.section variants={sectionVariants} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Образование</h2>
            <p className="text-sm text-gray-500">Текущее и планируемое обучение</p>
          </div>
        </div>
        {isOwnProfile && <EditButton label="Образование" />}
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-blue-300 via-purple-300 to-transparent" />

        <div className="space-y-6">
          {education.map((item, index) => (
            <div key={index} className="relative flex gap-5 pl-1">
              {/* Timeline dot */}
              <div
                className={cn(
                  'relative z-10 flex items-center justify-center w-10 h-10 rounded-xl shrink-0 shadow-sm',
                  index === 0
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                    : 'bg-gray-100 border border-gray-200'
                )}
              >
                <GraduationCap className={cn('w-5 h-5', index === 0 ? 'text-white' : 'text-gray-500')} />
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h3 className="text-base font-semibold text-gray-900">{item.institution}</h3>
                  {index === 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
                      Текущее
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{item.degree}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.year}
                </p>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.description}</p>
                {item.achievements.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {item.achievements.map((ach, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60"
                      >
                        <Award className="w-3 h-3" />
                        {ach}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

// ─── Experience Section ──────────────────────────────────────────────────────

function ExperienceSection({
  experience,
  isOwnProfile,
}: {
  experience: typeof MOCK_EXPERIENCE
  isOwnProfile: boolean
}) {
  if (experience.length === 0) return null

  return (
    <motion.section variants={sectionVariants} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Опыт</h2>
            <p className="text-sm text-gray-500">Проекты, стажировки и активности</p>
          </div>
        </div>
        {isOwnProfile && <EditButton label="Опыт" />}
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-emerald-300 via-green-200 to-transparent" />

        <div className="space-y-6">
          {experience.map((item, index) => (
            <div key={index} className="relative flex gap-5 pl-1">
              <div
                className={cn(
                  'relative z-10 flex items-center justify-center w-10 h-10 rounded-xl shrink-0 shadow-sm',
                  index === 0
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                    : 'bg-gray-100 border border-gray-200'
                )}
              >
                <Briefcase className={cn('w-5 h-5', index === 0 ? 'text-white' : 'text-gray-500')} />
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <h3 className="text-base font-semibold text-gray-900">{item.role}</h3>
                <p className="text-sm font-medium text-gray-600">{item.company}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.period}
                </p>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

// ─── Achievements Section ────────────────────────────────────────────────────

function AchievementsGrid({
  achievements,
  isOwnProfile,
}: {
  achievements: Achievement[]
  isOwnProfile: boolean
}) {
  const sorted = useMemo(
    () =>
      [...achievements].sort((a, b) => {
        if (a.unlockedAt && !b.unlockedAt) return -1
        if (!a.unlockedAt && b.unlockedAt) return 1
        return 0
      }),
    [achievements]
  )

  const unlockedCount = sorted.filter(a => a.unlockedAt).length

  return (
    <motion.section variants={sectionVariants} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Достижения</h2>
            <p className="text-sm text-gray-500">
              {unlockedCount} из {achievements.length} открыто
            </p>
          </div>
        </div>
        {isOwnProfile && <EditButton label="Достижения" />}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {sorted.map(ach => {
          const isUnlocked = !!ach.unlockedAt
          return (
            <motion.div
              key={ach.id}
              variants={cardHover}
              initial="rest"
              whileHover="hover"
              className={cn(
                'relative flex flex-col items-center text-center p-4 rounded-xl border transition-all duration-200 cursor-default',
                isUnlocked
                  ? 'bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-amber-200/60 shadow-sm'
                  : 'bg-gray-50 border-gray-200 opacity-40'
              )}
            >
              {isUnlocked && (
                <div className="absolute inset-0 rounded-xl bg-amber-400/5 pointer-events-none" />
              )}
              <span className="text-3xl mb-2 relative">{ach.icon}</span>
              <p className={cn('text-xs font-semibold leading-tight', isUnlocked ? 'text-gray-900' : 'text-gray-400')}>
                {ach.title}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{ach.description}</p>
              {isUnlocked && ach.unlockedAt && (
                <p className="text-[10px] text-amber-600 font-medium mt-1.5">
                  {formatDate(ach.unlockedAt)}
                </p>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}

// ─── Courses & Certificates Section ──────────────────────────────────────────

function CoursesSection({
  courses,
  isOwnProfile,
}: {
  courses: typeof MOCK_COURSES
  isOwnProfile: boolean
}) {
  return (
    <motion.section variants={sectionVariants} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Курсы и сертификаты</h2>
            <p className="text-sm text-gray-500">{courses.length} завершённых курсов</p>
          </div>
        </div>
        {isOwnProfile && <EditButton label="Курсы" />}
      </div>

      <div className="space-y-3">
        {courses.map((course, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 border border-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-gray-200 shadow-sm shrink-0">
              {course.score === 'В процессе' ? (
                <TrendingUp className="w-5 h-5 text-blue-500" />
              ) : (
                <Star className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">{course.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {course.provider} · {formatDate(course.date)}
              </p>
            </div>
            <span
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-bold shrink-0',
                course.score === 'В процессе'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-emerald-100 text-emerald-700'
              )}
            >
              {course.score}
            </span>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

// ─── Activity Graph ──────────────────────────────────────────────────────────

function ActivityGraph({
  activityData,
  isOwnProfile,
}: {
  activityData: number[][]
  isOwnProfile: boolean
}) {
  const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  const getColor = (level: number): string => {
    if (level === 0) return 'bg-gray-100'
    if (level === 1) return 'bg-emerald-200'
    if (level === 2) return 'bg-emerald-400'
    if (level === 3) return 'bg-emerald-500'
    return 'bg-emerald-600'
  }

  const totalActiveDays = activityData.flat().filter(v => v > 0).length
  const totalDays = activityData.flat().length

  return (
    <motion.section variants={sectionVariants} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Активность</h2>
            <p className="text-sm text-gray-500">
              {totalActiveDays} активных дней из {totalDays} за 12 недель
            </p>
          </div>
        </div>
        {isOwnProfile && <EditButton label="Активность" />}
      </div>

      <div className="overflow-x-auto -mx-2 px-2 pb-2">
        <div className="inline-flex flex-col gap-1.5 min-w-fit">
          {/* Day labels + grid */}
          {dayLabels.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 w-5 text-right shrink-0">{day}</span>
              <div className="flex gap-1">
                {activityData.map((week, weekIndex) => (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      'w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-sm transition-colors duration-200',
                      getColor(week[dayIndex] || 0)
                    )}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (weekIndex * 7 + dayIndex) * 0.003, duration: 0.2 }}
                    title={`Неделя ${weekIndex + 1}, ${day}: уровень ${week[dayIndex] || 0}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 text-xs text-gray-400">
          <span>Меньше</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={cn('w-3.5 h-3.5 rounded-sm', getColor(level))}
              />
            ))}
          </div>
          <span>Больше</span>
        </div>
      </div>
    </motion.section>
  )
}

// ─── Portfolio Projects Section ──────────────────────────────────────────────

function ProjectsSection({
  projects,
  isOwnProfile,
}: {
  projects: typeof MOCK_PROJECTS
  isOwnProfile: boolean
}) {
  return (
    <motion.section variants={sectionVariants} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Проекты</h2>
            <p className="text-sm text-gray-500">{projects.length} проектов в портфолио</p>
          </div>
        </div>
        {isOwnProfile && <EditButton label="Проекты" />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            variants={cardHover}
            initial="rest"
            whileHover="hover"
            className="group relative flex flex-col p-5 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 hover:border-purple-200 hover:shadow-md transition-all duration-200"
          >
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-100/40 to-transparent rounded-xl pointer-events-none" />

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-100 border border-purple-200/60">
                <FolderOpen className="w-4 h-4 text-purple-600" />
              </div>
              <a
                href={project.link}
                className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mb-1.5 leading-tight">
              {project.title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-3">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {project.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

// ─── Profile Footer ──────────────────────────────────────────────────────────

function ProfileFooter() {
  return (
    <motion.footer
      variants={sectionVariants}
      className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-10 text-center overflow-hidden relative"
    >
      {/* Decorative */}
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Study Hub
          </span>
        </div>

        <p className="text-white/50 text-sm mb-5 max-w-md mx-auto">
          Этот профиль создан на Study Hub — платформе подготовки к ЕНТ и построения учебного портфолио.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <Sparkles className="w-4 h-4" />
          Создай свой профиль бесплатно
        </Link>

        <p className="text-white/30 text-xs mt-6">
          studyhub.kz/profile · Портфолио ученика нового поколения
        </p>
      </div>
    </motion.footer>
  )
}

// ─── Main PublicProfile Page ─────────────────────────────────────────────────

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>()
  const { user, diagnosticResult, achievements, studyPlan } = useStore()

  // Determine if viewing own profile
  const isOwnProfile = !id || (user && id === user.id)

  // Build the profile data to display
  const profileData = useMemo(() => {
    if (isOwnProfile && user) {
      return {
        profile: {
          name: user.name,
          email: user.email,
          grade: user.grade,
          city: user.city,
          targetUniversity: user.targetUniversity,
          targetSpecialty: user.targetSpecialty,
          isPremium: user.isPremium,
          streak: user.streak,
          totalStudyMinutes: user.totalStudyMinutes,
          bio: 'Готовлюсь к поступлению. Активно изучаю предметы ЕНТ на Study Hub. Стремлюсь к высоким результатам и постоянному самосовершенствованию.',
          isOpenToWork: false,
          createdAt: user.createdAt,
        },
        diagnostic: diagnosticResult,
        achievementsList: achievements,
        education: user.targetUniversity
          ? [
              {
                institution: `Школа · ${user.city}`,
                degree: `Ученик ${user.grade} класса`,
                year: '2023 — настоящее время',
                description: 'Общеобразовательная школа. Подготовка к ЕНТ.',
                achievements: [] as string[],
              },
              {
                institution: user.targetUniversity,
                degree: `${user.targetSpecialty || 'Выбранная специальность'} (цель)`,
                year: '2026',
                description: 'Целевой университет для поступления.',
                achievements: [] as string[],
              },
            ]
          : [
              {
                institution: `Школа · ${user.city}`,
                degree: `Ученик ${user.grade} класса`,
                year: '2023 — настоящее время',
                description: 'Общеобразовательная школа. Подготовка к ЕНТ.',
                achievements: [] as string[],
              },
            ],
        experience: [
          {
            company: 'Study Hub',
            role: 'Активный ученик',
            period: 'Текущее',
            description: diagnosticResult
              ? `Пройдена диагностика (${Math.round((diagnosticResult.overallScore / diagnosticResult.maxScore) * 100)}%). ${studyPlan ? `Создан учебный план (${studyPlan.overallProgress}% выполнено).` : 'Учебный план в процессе создания.'}`
              : 'Зарегистрирован на платформе. Начинает подготовку к ЕНТ.',
          },
        ],
        courses: [
          ...(diagnosticResult
            ? [{ title: 'Диагностический тест Study Hub', provider: 'Study Hub', date: diagnosticResult.date, score: `${Math.round((diagnosticResult.overallScore / diagnosticResult.maxScore) * 100)}%` }]
            : []),
          ...(studyPlan
            ? [{ title: `Учебный план: ${studyPlan.targetUniversity}`, provider: 'Study Hub', date: studyPlan.weeks[0]?.startDate || new Date().toISOString(), score: 'В процессе' }]
            : []),
        ],
        projects: [
          ...(studyPlan
            ? [{
                title: `Учебный план подготовки к ЕНТ`,
                description: `Персональный ${studyPlan.weeks.length}-недельный план подготовки. Цель: ${studyPlan.targetUniversity}, ${studyPlan.targetSpecialty}.`,
                skills: ['Планирование', 'Самодисциплина', 'ЕНТ'],
                link: '#',
              }]
            : []),
          {
            title: 'Профиль на Study Hub',
            description: 'Публичный портфолио-профиль с результатами диагностики, достижениями и учебной активностью.',
            skills: ['Портфолио', 'Саморефлексия'],
            link: '#',
          },
        ],
        activityData: ACTIVITY_DATA,
      }
    }

    // Mock external profile
    return {
      profile: {
        name: MOCK_PROFILE.name,
        email: MOCK_PROFILE.email,
        grade: MOCK_PROFILE.grade,
        city: MOCK_PROFILE.city,
        targetUniversity: MOCK_PROFILE.targetUniversity,
        targetSpecialty: MOCK_PROFILE.targetSpecialty,
        isPremium: MOCK_PROFILE.isPremium,
        streak: MOCK_PROFILE.streak,
        totalStudyMinutes: MOCK_PROFILE.totalStudyMinutes,
        bio: MOCK_PROFILE.bio,
        isOpenToWork: MOCK_PROFILE.isOpenToWork,
        createdAt: MOCK_PROFILE.createdAt,
      },
      diagnostic: MOCK_DIAGNOSTIC,
      achievementsList: MOCK_ACHIEVEMENTS,
      education: MOCK_EDUCATION,
      experience: MOCK_EXPERIENCE,
      courses: MOCK_COURSES,
      projects: MOCK_PROJECTS,
      activityData: ACTIVITY_DATA,
    }
  }, [isOwnProfile, user, diagnosticResult, achievements, studyPlan, id])

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Hero */}
      <HeroSection
        profile={profileData.profile}
        diagnosticResult={profileData.diagnostic}
        achievements={profileData.achievementsList}
        isOwnProfile={!!isOwnProfile}
      />

      {/* Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Two-column layout for Skills + Education on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkillsSection
              diagnosticResult={profileData.diagnostic}
              isOwnProfile={!!isOwnProfile}
            />
            <EducationSection
              education={profileData.education}
              isOwnProfile={!!isOwnProfile}
            />
          </div>

          {/* Experience */}
          <ExperienceSection
            experience={profileData.experience}
            isOwnProfile={!!isOwnProfile}
          />

          {/* Achievements */}
          <AchievementsGrid
            achievements={profileData.achievementsList}
            isOwnProfile={!!isOwnProfile}
          />

          {/* Courses & Activity side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CoursesSection
              courses={profileData.courses}
              isOwnProfile={!!isOwnProfile}
            />
            <ActivityGraph
              activityData={profileData.activityData}
              isOwnProfile={!!isOwnProfile}
            />
          </div>

          {/* Portfolio Projects */}
          <ProjectsSection
            projects={profileData.projects}
            isOwnProfile={!!isOwnProfile}
          />

          {/* Footer CTA */}
          <ProfileFooter />
        </motion.div>
      </main>
    </div>
  )
}
