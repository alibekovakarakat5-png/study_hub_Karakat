import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Code2,
  Palette,
  Briefcase,
  Heart,
  Wrench,
  FlaskConical,
  Scale,
  Music,
  Dumbbell,
  Languages,
  Calculator,
  Cpu,
  GraduationCap,
  Globe2,
  Building2,
  Compass,
  Rocket,
  Lightbulb,
  TrendingUp,
  Star,
  Zap,
  MapPin,
  BookOpen,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { OnboardingStep, OnboardingProfile, CareerPath } from '@/types'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

// ─── Constants ──────────────────────────────────────────────────────────────

const STEPS: OnboardingStep[] = ['welcome', 'about', 'interests', 'subjects', 'goals', 'dream', 'result']

const STEP_GRADIENTS: Record<OnboardingStep, string> = {
  welcome: 'from-blue-600/10 via-indigo-500/5 to-purple-600/10',
  about: 'from-emerald-500/10 via-teal-500/5 to-cyan-600/10',
  interests: 'from-violet-500/10 via-purple-500/5 to-fuchsia-600/10',
  subjects: 'from-sky-500/10 via-blue-500/5 to-indigo-500/10',
  goals: 'from-amber-500/10 via-orange-500/5 to-red-500/10',
  dream: 'from-rose-500/10 via-pink-500/5 to-purple-500/10',
  result: 'from-emerald-500/10 via-blue-500/5 to-indigo-600/10',
}

const SUBJECT_CARDS = [
  { id: 'math', label: 'Математика', emoji: '📐' },
  { id: 'physics', label: 'Физика', emoji: '⚡' },
  { id: 'chemistry', label: 'Химия', emoji: '🧪' },
  { id: 'biology', label: 'Биология', emoji: '🧬' },
  { id: 'history', label: 'История Казахстана', emoji: '🏛️' },
  { id: 'english', label: 'Английский язык', emoji: '🇬🇧' },
  { id: 'kazakh', label: 'Казахский язык', emoji: '🇰🇿' },
  { id: 'russian', label: 'Русский язык', emoji: '📖' },
  { id: 'informatics', label: 'Информатика', emoji: '💻' },
  { id: 'geography', label: 'География', emoji: '🌍' },
  { id: 'literature', label: 'Литература', emoji: '📚' },
]

const LEVEL_KEYS = ['level_unknown', 'level_weak', 'level_medium', 'level_good', 'level_excellent']
const LEVEL_COLORS = ['bg-gray-300', 'bg-red-400', 'bg-amber-400', 'bg-blue-500', 'bg-emerald-500']

const KZ_CITIES = [
  'Алматы',
  'Астана',
  'Шымкент',
  'Караганда',
  'Актобе',
  'Тараз',
  'Павлодар',
  'Усть-Каменогорск',
  'Семей',
  'Атырау',
  'Костанай',
  'Кызылорда',
  'Уральск',
  'Петропавловск',
  'Актау',
  'Темиртау',
  'Туркестан',
  'Талдыкорган',
  'Экибастуз',
  'Рудный',
]

const INTEREST_CARDS = [
  { id: 'programming', label: 'Программирование', icon: Code2, color: 'bg-blue-500', lightBg: 'bg-blue-50', ring: 'ring-blue-500' },
  { id: 'design', label: 'Дизайн', icon: Palette, color: 'bg-pink-500', lightBg: 'bg-pink-50', ring: 'ring-pink-500' },
  { id: 'business', label: 'Бизнес', icon: Briefcase, color: 'bg-amber-500', lightBg: 'bg-amber-50', ring: 'ring-amber-500' },
  { id: 'medicine', label: 'Медицина', icon: Heart, color: 'bg-red-500', lightBg: 'bg-red-50', ring: 'ring-red-500' },
  { id: 'engineering', label: 'Инженерия', icon: Wrench, color: 'bg-slate-600', lightBg: 'bg-slate-50', ring: 'ring-slate-600' },
  { id: 'science', label: 'Наука', icon: FlaskConical, color: 'bg-green-500', lightBg: 'bg-green-50', ring: 'ring-green-500' },
  { id: 'law', label: 'Право', icon: Scale, color: 'bg-indigo-500', lightBg: 'bg-indigo-50', ring: 'ring-indigo-500' },
  { id: 'creative', label: 'Творчество', icon: Music, color: 'bg-purple-500', lightBg: 'bg-purple-50', ring: 'ring-purple-500' },
  { id: 'sport', label: 'Спорт', icon: Dumbbell, color: 'bg-orange-500', lightBg: 'bg-orange-50', ring: 'ring-orange-500' },
  { id: 'languages', label: 'Языки', icon: Languages, color: 'bg-cyan-500', lightBg: 'bg-cyan-50', ring: 'ring-cyan-500' },
  { id: 'math', label: 'Математика', icon: Calculator, color: 'bg-teal-500', lightBg: 'bg-teal-50', ring: 'ring-teal-500' },
  { id: 'robotics', label: 'Робототехника', icon: Cpu, color: 'bg-violet-500', lightBg: 'bg-violet-50', ring: 'ring-violet-500' },
]

const GOAL_CARDS = [
  { id: 'ent', label: 'Сдать ЕНТ на максимум', icon: GraduationCap, emoji: '🎯' },
  { id: 'abroad', label: 'Поступить в зарубежный вуз', icon: Globe2, emoji: '🌍' },
  { id: 'internship', label: 'Найти стажировку', icon: Building2, emoji: '💼' },
  { id: 'profession', label: 'Определиться с профессией', icon: Compass, emoji: '🧭' },
  { id: 'career', label: 'Построить карьеру', icon: TrendingUp, emoji: '📈' },
  { id: 'startup', label: 'Запустить стартап', icon: Rocket, emoji: '🚀' },
]

const POPULAR_PROFESSIONS = [
  'Frontend-разработчик',
  'Data Scientist',
  'UX/UI-дизайнер',
  'Врач',
  'Инженер',
  'Юрист',
  'Маркетолог',
  'Архитектор',
  'Предприниматель',
  'Финансовый аналитик',
  'DevOps-инженер',
  'Product Manager',
  'Биотехнолог',
  'Кибербезопасность',
  'AI-инженер',
]

const GRADE_OPTIONS = [
  { value: 9, key: 'grade_9' },
  { value: 10, key: 'grade_10' },
  { value: 11, key: 'grade_11' },
  { value: 12, key: 'grade_student' },
  { value: 13, key: 'grade_graduate' },
]

const EN_POPULAR_PROFESSIONS = [
  'Frontend Developer',
  'Data Scientist',
  'UX/UI Designer',
  'Doctor',
  'Engineer',
  'Lawyer',
  'Marketer',
  'Architect',
  'Entrepreneur',
  'Financial Analyst',
  'DevOps Engineer',
  'Product Manager',
  'Biotechnologist',
  'Cybersecurity Specialist',
  'AI Engineer',
]

// ─── Animation Variants ─────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 400 : -400,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 400 : -400,
    opacity: 0,
    scale: 0.96,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  }),
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(99, 102, 241, 0.3)',
      '0 0 40px rgba(99, 102, 241, 0.5)',
      '0 0 20px rgba(99, 102, 241, 0.3)',
    ],
    transition: { duration: 2, repeat: Infinity },
  },
}

// ─── Helper: Generate Career Paths Based on Selections ──────────────────────

function generateCareerPaths(
  interests: string[],
  goals: string[],
  dreamProfession: string
): CareerPath[] {
  const allPaths: CareerPath[] = [
    {
      id: 'software-engineer',
      title: 'Программная инженерия',
      description: 'Разработка программного обеспечения, веб и мобильных приложений. Высокий спрос в Казахстане и за рубежом.',
      icon: '💻',
      matchPercentage: 0,
      relatedProfessions: ['Frontend-разработчик', 'Backend-разработчик', 'Full-stack инженер', 'DevOps'],
      requiredSkills: ['JavaScript', 'Python', 'Алгоритмы', 'Базы данных'],
      avgSalary: '800 000 — 2 500 000 ₸',
      demand: 'very-high',
    },
    {
      id: 'data-science',
      title: 'Data Science и AI',
      description: 'Анализ данных, машинное обучение и искусственный интеллект. Одна из самых перспективных областей.',
      icon: '🤖',
      matchPercentage: 0,
      relatedProfessions: ['Data Scientist', 'ML-инженер', 'AI-инженер', 'Аналитик данных'],
      requiredSkills: ['Python', 'Математика', 'Статистика', 'Machine Learning'],
      avgSalary: '900 000 — 3 000 000 ₸',
      demand: 'very-high',
    },
    {
      id: 'ux-design',
      title: 'UX/UI Дизайн',
      description: 'Проектирование пользовательских интерфейсов и опыта. Творческая работа на стыке технологий и дизайна.',
      icon: '🎨',
      matchPercentage: 0,
      relatedProfessions: ['UX-дизайнер', 'UI-дизайнер', 'Product Designer', 'Графический дизайнер'],
      requiredSkills: ['Figma', 'Прототипирование', 'Исследования', 'Визуальный дизайн'],
      avgSalary: '500 000 — 1 500 000 ₸',
      demand: 'high',
    },
    {
      id: 'medicine',
      title: 'Медицина и здравоохранение',
      description: 'Лечение и профилактика заболеваний. Стабильная и уважаемая профессия с высоким социальным значением.',
      icon: '⚕️',
      matchPercentage: 0,
      relatedProfessions: ['Врач', 'Хирург', 'Фармацевт', 'Биотехнолог'],
      requiredSkills: ['Биология', 'Химия', 'Анатомия', 'Эмпатия'],
      avgSalary: '400 000 — 2 000 000 ₸',
      demand: 'high',
    },
    {
      id: 'business-management',
      title: 'Бизнес и менеджмент',
      description: 'Управление проектами, стратегическое планирование и предпринимательство. Путь к лидерству.',
      icon: '📊',
      matchPercentage: 0,
      relatedProfessions: ['Product Manager', 'Предприниматель', 'Бизнес-аналитик', 'Маркетолог'],
      requiredSkills: ['Лидерство', 'Аналитика', 'Коммуникация', 'Стратегия'],
      avgSalary: '600 000 — 2 500 000 ₸',
      demand: 'high',
    },
    {
      id: 'engineering',
      title: 'Инженерия и робототехника',
      description: 'Проектирование и создание механизмов, роботов и систем. Фундамент технологического прогресса.',
      icon: '⚙️',
      matchPercentage: 0,
      relatedProfessions: ['Инженер-механик', 'Робототехник', 'Инженер-электроник', 'Конструктор'],
      requiredSkills: ['Физика', 'Математика', 'CAD-системы', 'Программирование'],
      avgSalary: '500 000 — 1 800 000 ₸',
      demand: 'high',
    },
    {
      id: 'law',
      title: 'Юриспруденция',
      description: 'Правовая система, защита интересов и консалтинг. Престижная профессия с широкими возможностями.',
      icon: '⚖️',
      matchPercentage: 0,
      relatedProfessions: ['Юрист', 'Адвокат', 'Нотариус', 'Корпоративный юрист'],
      requiredSkills: ['Аналитическое мышление', 'Ораторство', 'Законодательство', 'Логика'],
      avgSalary: '400 000 — 2 000 000 ₸',
      demand: 'medium',
    },
    {
      id: 'finance',
      title: 'Финансы и аналитика',
      description: 'Управление финансами, инвестиции и финансовый анализ. Ключевая роль в любой организации.',
      icon: '💰',
      matchPercentage: 0,
      relatedProfessions: ['Финансовый аналитик', 'Инвестиционный банкир', 'Аудитор', 'CFO'],
      requiredSkills: ['Математика', 'Excel', 'Финансовый анализ', 'Статистика'],
      avgSalary: '500 000 — 2 200 000 ₸',
      demand: 'high',
    },
    {
      id: 'cybersecurity',
      title: 'Кибербезопасность',
      description: 'Защита информации и цифровых систем. Растущая потребность во всём мире.',
      icon: '🛡️',
      matchPercentage: 0,
      relatedProfessions: ['Специалист по ИБ', 'Пентестер', 'SOC-аналитик', 'Security Engineer'],
      requiredSkills: ['Сети', 'Linux', 'Криптография', 'Программирование'],
      avgSalary: '700 000 — 2 500 000 ₸',
      demand: 'very-high',
    },
    {
      id: 'creative-arts',
      title: 'Креативные индустрии',
      description: 'Музыка, кинематограф, контент, блогинг. Мир творчества и самовыражения.',
      icon: '🎬',
      matchPercentage: 0,
      relatedProfessions: ['Контент-мейкер', 'Режиссёр', 'Музыкант', 'Копирайтер'],
      requiredSkills: ['Креативность', 'Сторителлинг', 'Видеомонтаж', 'Маркетинг'],
      avgSalary: '300 000 — 1 500 000 ₸',
      demand: 'medium',
    },
  ]

  // Scoring logic based on user selections
  const interestScores: Record<string, string[]> = {
    programming: ['software-engineer', 'data-science', 'cybersecurity'],
    design: ['ux-design', 'creative-arts'],
    business: ['business-management', 'finance'],
    medicine: ['medicine'],
    engineering: ['engineering'],
    science: ['data-science', 'medicine', 'engineering'],
    law: ['law'],
    creative: ['ux-design', 'creative-arts'],
    sport: ['medicine'],
    languages: ['law', 'business-management', 'creative-arts'],
    math: ['data-science', 'finance', 'engineering'],
    robotics: ['engineering', 'software-engineer'],
  }

  const goalScores: Record<string, string[]> = {
    ent: ['medicine', 'law', 'engineering'],
    abroad: ['software-engineer', 'data-science', 'business-management'],
    internship: ['software-engineer', 'ux-design', 'business-management'],
    profession: ['software-engineer', 'data-science', 'medicine'],
    career: ['business-management', 'finance', 'software-engineer'],
    startup: ['business-management', 'software-engineer', 'ux-design'],
  }

  const dreamScores: Record<string, string[]> = {
    'frontend': ['software-engineer', 'ux-design'],
    'data scientist': ['data-science'],
    'ux': ['ux-design'],
    'ui': ['ux-design'],
    'дизайн': ['ux-design', 'creative-arts'],
    'врач': ['medicine'],
    'инженер': ['engineering'],
    'юрист': ['law'],
    'маркетолог': ['business-management', 'creative-arts'],
    'архитектор': ['engineering', 'ux-design'],
    'предприниматель': ['business-management'],
    'финанс': ['finance'],
    'devops': ['software-engineer', 'cybersecurity'],
    'product': ['business-management', 'ux-design'],
    'биотехнолог': ['medicine', 'engineering'],
    'кибербезопасность': ['cybersecurity'],
    'ai': ['data-science'],
    'робот': ['engineering'],
  }

  // Calculate scores
  const pathScoreMap = new Map<string, number>()
  allPaths.forEach(p => pathScoreMap.set(p.id, 10))

  interests.forEach(interest => {
    const related = interestScores[interest]
    if (related) {
      related.forEach((pathId, idx) => {
        pathScoreMap.set(pathId, (pathScoreMap.get(pathId) ?? 0) + (30 - idx * 5))
      })
    }
  })

  goals.forEach(goal => {
    const related = goalScores[goal]
    if (related) {
      related.forEach((pathId, idx) => {
        pathScoreMap.set(pathId, (pathScoreMap.get(pathId) ?? 0) + (20 - idx * 4))
      })
    }
  })

  const dreamLower = dreamProfession.toLowerCase()
  Object.entries(dreamScores).forEach(([keyword, pathIds]) => {
    if (dreamLower.includes(keyword)) {
      pathIds.forEach((pathId, idx) => {
        pathScoreMap.set(pathId, (pathScoreMap.get(pathId) ?? 0) + (25 - idx * 5))
      })
    }
  })

  // Normalize to percentages and assign
  const maxScore = Math.max(...pathScoreMap.values(), 1)

  const scoredPaths = allPaths.map(p => ({
    ...p,
    matchPercentage: Math.min(98, Math.max(42, Math.round(((pathScoreMap.get(p.id) ?? 0) / maxScore) * 98))),
  }))

  scoredPaths.sort((a, b) => b.matchPercentage - a.matchPercentage)

  return scoredPaths.slice(0, 3)
}

// ─── Demand Badge ───────────────────────────────────────────────────────────

function DemandBadge({ demand }: { demand: CareerPath['demand'] }) {
  const { t } = useTranslation()
  const config = {
    'very-high': { key: 'demand_very_high', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    high: { key: 'demand_high', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    medium: { key: 'demand_medium', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    low: { key: 'demand_low', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  }
  const c = config[demand]
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border', c.cls)}>
      <Zap className="w-3 h-3" />
      {t(`onboarding.${c.key}`)}
    </span>
  )
}

// ─── Progress Bar ───────────────────────────────────────────────────────────

function StepProgressBar({ currentIndex, total }: { currentIndex: number; total: number }) {
  const { t } = useTranslation()
  const progress = ((currentIndex + 1) / total) * 100

  return (
    <div className="w-full px-6 pt-6 pb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">
          {t('onboarding.step')} {currentIndex + 1} {t('onboarding.of')} {total}
        </span>
        <span className="text-sm font-semibold text-indigo-600">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  )
}

// ─── Step 1: Welcome ────────────────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation()
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Animated illustration */}
      <motion.div
        variants={staggerItem}
        className="relative mb-8"
      >
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-6xl shadow-2xl"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: [0.45, 0, 0.55, 1] as const }}
        >
          🧭
        </motion.div>
        <motion.div
          className="absolute -top-2 -right-2 text-3xl"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          ✨
        </motion.div>
        <motion.div
          className="absolute -bottom-1 -left-3 text-2xl"
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
        >
          🎓
        </motion.div>
      </motion.div>

      <motion.h1
        variants={staggerItem}
        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-4"
      >
        {t('onboarding.welcome_title')}
      </motion.h1>

      <motion.p
        variants={staggerItem}
        className="text-lg md:text-xl text-gray-600 max-w-lg mb-3"
      >
        {t('onboarding.welcome_subtitle')}
      </motion.p>

      <motion.div
        variants={staggerItem}
        className="flex flex-wrap justify-center gap-3 mb-10"
      >
        {[
          { emoji: '🎯', key: 'welcome_step1' },
          { emoji: '🗺️', key: 'welcome_step2' },
          { emoji: '🚀', key: 'welcome_step3' },
        ].map(item => (
          <div
            key={item.key}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-gray-100"
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="text-sm font-medium text-gray-700">{t(`onboarding.${item.key}`)}</span>
          </div>
        ))}
      </motion.div>

      <motion.button
        variants={staggerItem}
        onClick={onNext}
        className="group relative px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.span
          className="absolute inset-0 rounded-2xl"
          {...pulseGlow}
        />
        <span className="relative flex items-center gap-2">
          {t('onboarding.welcome_start')}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </span>
      </motion.button>
    </motion.div>
  )
}

// ─── Step 2: About You ──────────────────────────────────────────────────────

function AboutStep({
  age,
  grade,
  city,
  onAgeChange,
  onGradeChange,
  onCityChange,
}: {
  age: number
  grade: number
  city: string
  onAgeChange: (v: number) => void
  onGradeChange: (v: number) => void
  onCityChange: (v: string) => void
}) {
  const user = useStore(s => s.user)
  const { t } = useTranslation()

  return (
    <motion.div
      className="flex flex-col items-center px-6 py-4 max-w-lg mx-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem} className="text-5xl mb-4">
        👋
      </motion.div>

      <motion.h2
        variants={staggerItem}
        className="text-3xl font-bold text-gray-900 mb-2 text-center"
      >
        {t('onboarding.about_title')}
      </motion.h2>

      {user?.name && (
        <motion.p
          variants={staggerItem}
          className="text-gray-500 mb-8 text-center"
        >
          {t('onboarding.about_subtitle', { name: user.name })}
        </motion.p>
      )}

      {/* Age Slider */}
      <motion.div
        variants={staggerItem}
        className="w-full bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-4"
      >
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {t('onboarding.about_age')}
        </label>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-indigo-600 min-w-[3ch] text-center">
            {age}
          </span>
          <input
            type="range"
            min={14}
            max={25}
            value={age}
            onChange={e => onAgeChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>14</span>
          <span>25</span>
        </div>
      </motion.div>

      {/* Grade */}
      <motion.div
        variants={staggerItem}
        className="w-full bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-4"
      >
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {t('onboarding.about_grade_label')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {GRADE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onGradeChange(opt.value)}
              className={cn(
                'px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200',
                grade === opt.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-white'
              )}
            >
              {t(`onboarding.${opt.key}`)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* City */}
      <motion.div
        variants={staggerItem}
        className="w-full bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          <MapPin className="w-4 h-4 inline-block mr-1 -mt-0.5" />
          {t('onboarding.about_city_label')}
        </label>
        <select
          value={city}
          onChange={e => onCityChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="">{t('onboarding.about_city_placeholder')}</option>
          {KZ_CITIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </motion.div>
    </motion.div>
  )
}

// ─── Step 3: Interests ──────────────────────────────────────────────────────

function InterestsStep({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (id: string) => void
}) {
  const { t } = useTranslation()
  return (
    <motion.div
      className="flex flex-col items-center px-6 py-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem} className="text-5xl mb-4">
        🌟
      </motion.div>

      <motion.h2
        variants={staggerItem}
        className="text-3xl font-bold text-gray-900 mb-2 text-center"
      >
        {t('onboarding.interests_title')}
      </motion.h2>

      <motion.p
        variants={staggerItem}
        className="text-gray-500 mb-8 text-center"
      >
        {t('onboarding.interests_subtitle')}
      </motion.p>

      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-2xl w-full"
      >
        {INTEREST_CARDS.map(card => {
          const isSelected = selected.includes(card.id)
          const Icon = card.icon
          return (
            <motion.button
              key={card.id}
              variants={staggerItem}
              onClick={() => onToggle(card.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
                isSelected
                  ? `${card.ring} ring-2 border-transparent bg-white shadow-lg`
                  : 'border-gray-200 bg-white/70 hover:border-gray-300 hover:shadow-md'
              )}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white', card.color)}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                {t(`onboarding.interest_${card.id}`)}
              </span>
            </motion.button>
          )
        })}
      </motion.div>

      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-sm text-indigo-600 font-medium"
        >
          {t('onboarding.interests_selected', { count: selected.length })}
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Step 4: Goals ──────────────────────────────────────────────────────────

function GoalsStep({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (id: string) => void
}) {
  const { t } = useTranslation()
  return (
    <motion.div
      className="flex flex-col items-center px-6 py-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem} className="text-5xl mb-4">
        🎯
      </motion.div>

      <motion.h2
        variants={staggerItem}
        className="text-3xl font-bold text-gray-900 mb-2 text-center"
      >
        {t('onboarding.goals_title')}
      </motion.h2>

      <motion.p
        variants={staggerItem}
        className="text-gray-500 mb-8 text-center"
      >
        {t('onboarding.goals_subtitle')}
      </motion.p>

      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl w-full"
      >
        {GOAL_CARDS.map(card => {
          const isSelected = selected.includes(card.id)
          const Icon = card.icon
          return (
            <motion.button
              key={card.id}
              variants={staggerItem}
              onClick={() => onToggle(card.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200',
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg ring-2 ring-indigo-500'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              )}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Icon className={cn('w-6 h-6', isSelected ? 'text-indigo-600' : 'text-gray-500')} />
              </div>
              <div>
                <span className="text-base font-semibold text-gray-800">{t(`onboarding.goal_${card.id}`)}</span>
                <span className="block text-2xl mt-0.5">{card.emoji}</span>
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </motion.div>
  )
}

// ─── Step 4b: Subjects Self-Assessment ──────────────────────────────────────

function SubjectsStep({
  subjectLevels,
  onLevelChange,
  onToggleWant,
}: {
  subjectLevels: Record<string, { level: number; want: boolean }>
  onLevelChange: (id: string, level: number) => void
  onToggleWant: (id: string) => void
}) {
  const { t } = useTranslation()
  return (
    <motion.div
      className="flex flex-col items-center px-6 py-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem} className="text-5xl mb-4">
        <BookOpen className="w-12 h-12 text-blue-500" />
      </motion.div>

      <motion.h2
        variants={staggerItem}
        className="text-3xl font-bold text-gray-900 mb-2 text-center"
      >
        {t('onboarding.subjects_title')}
      </motion.h2>

      <motion.p
        variants={staggerItem}
        className="text-gray-500 mb-6 text-center max-w-md"
      >
        {t('onboarding.subjects_subtitle')}
      </motion.p>

      <motion.div
        variants={staggerContainer}
        className="w-full max-w-2xl space-y-3"
      >
        {SUBJECT_CARDS.map(subj => {
          const data = subjectLevels[subj.id] || { level: 0, want: false }
          return (
            <motion.div
              key={subj.id}
              variants={staggerItem}
              className={cn(
                'flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200',
                data.want
                  ? 'border-blue-400 bg-blue-50/50'
                  : 'border-gray-100 bg-white'
              )}
            >
              {/* Emoji + Name */}
              <span className="text-xl sm:text-2xl flex-shrink-0">{subj.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-800 truncate">{t(`subjects.${subj.id}`)}</span>
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    LEVEL_COLORS[data.level],
                    data.level === 0 ? 'text-gray-600' : 'text-white'
                  )}>
                    {t(`onboarding.${LEVEL_KEYS[data.level]}`)}
                  </span>
                </div>
                {/* Level dots */}
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => onLevelChange(subj.id, lvl)}
                      className={cn(
                        'h-2 flex-1 rounded-full transition-all duration-200',
                        lvl <= data.level
                          ? LEVEL_COLORS[data.level]
                          : 'bg-gray-200'
                      )}
                    />
                  ))}
                </div>
              </div>
              {/* Want to study toggle */}
              <button
                onClick={() => onToggleWant(subj.id)}
                className={cn(
                  'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 border',
                  data.want
                    ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-400 hover:border-blue-300'
                )}
                title={t('onboarding.subjects_want_to_learn')}
              >
                {data.want ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Star className="w-4 h-4" />
                )}
              </button>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.p
        variants={staggerItem}
        className="mt-4 text-xs text-gray-400 text-center"
      >
        {t('onboarding.subjects_tip')}
      </motion.p>
    </motion.div>
  )
}

// ─── Step 5: Dream ──────────────────────────────────────────────────────────

function DreamStep({
  dreamText,
  selectedProfessions,
  onDreamChange,
  onToggleProfession,
}: {
  dreamText: string
  selectedProfessions: string[]
  onDreamChange: (v: string) => void
  onToggleProfession: (v: string) => void
}) {
  const { t, i18n } = useTranslation()
  const professions = i18n.language === 'en' ? EN_POPULAR_PROFESSIONS : POPULAR_PROFESSIONS
  return (
    <motion.div
      className="flex flex-col items-center px-6 py-4 max-w-lg mx-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem} className="text-5xl mb-4">
        💭
      </motion.div>

      <motion.h2
        variants={staggerItem}
        className="text-3xl font-bold text-gray-900 mb-2 text-center"
      >
        {t('onboarding.dream_title')}
      </motion.h2>

      <motion.p
        variants={staggerItem}
        className="text-gray-500 mb-8 text-center"
      >
        {t('onboarding.dream_subtitle')}
      </motion.p>

      <motion.div
        variants={staggerItem}
        className="w-full mb-6"
      >
        <div className="relative">
          <Lightbulb className="absolute left-4 top-4 w-5 h-5 text-amber-400" />
          <input
            type="text"
            value={dreamText}
            onChange={e => onDreamChange(e.target.value)}
            placeholder={t('onboarding.dream_placeholder')}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-800 placeholder-gray-400 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-lg"
          />
        </div>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="w-full"
      >
        <p className="text-sm font-medium text-gray-500 mb-3">{t('onboarding.dream_popular')}</p>
        <div className="flex flex-wrap gap-2">
          {professions.map(prof => {
            const isSelected = selectedProfessions.includes(prof)
            return (
              <motion.button
                key={prof}
                onClick={() => onToggleProfession(prof)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-200',
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                {isSelected && <Check className="w-3 h-3 inline-block mr-1 -mt-0.5" />}
                {prof}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      <motion.p
        variants={staggerItem}
        className="mt-8 text-sm text-gray-400 italic"
      >
        {t('onboarding.dream_optional_note')}
      </motion.p>
    </motion.div>
  )
}

// ─── Step 6: Result ─────────────────────────────────────────────────────────

function ResultStep({
  careerPaths,
  onComplete,
}: {
  careerPaths: CareerPath[]
  onComplete: () => void
}) {
  const { t } = useTranslation()
  return (
    <motion.div
      className="flex flex-col items-center px-6 py-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem} className="text-5xl mb-4">
        🎉
      </motion.div>

      <motion.h2
        variants={staggerItem}
        className="text-3xl font-bold text-gray-900 mb-2 text-center"
      >
        {t('onboarding.result_title')}
      </motion.h2>

      <motion.p
        variants={staggerItem}
        className="text-gray-500 mb-8 text-center max-w-md"
      >
        {t('onboarding.result_subtitle')}
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full mb-10">
        {careerPaths.map((path, idx) => (
          <motion.div
            key={path.id}
            custom={idx}
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className={cn(
              'relative bg-white rounded-2xl p-6 border-2 shadow-lg',
              idx === 0
                ? 'border-indigo-300 shadow-indigo-100'
                : 'border-gray-200'
            )}
          >
            {idx === 0 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                <Star className="w-3 h-3" />
                {t('onboarding.result_best_match')}
              </div>
            )}

            <div className="text-4xl mb-3">{path.icon}</div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{t(`onboarding.career_${path.id}_title`)}</h3>

            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{t(`onboarding.career_${path.id}_desc`)}</p>

            {/* Match Percentage Circle */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke={idx === 0 ? '#6366f1' : idx === 1 ? '#8b5cf6' : '#a78bfa'}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 18}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 18 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 18 * (1 - path.matchPercentage / 100) }}
                    transition={{ duration: 1.2, delay: idx * 0.2 + 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">
                  {path.matchPercentage}%
                </span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700">{t('onboarding.result_match')}</div>
                <DemandBadge demand={path.demand} />
              </div>
            </div>

            {/* Salary */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="font-medium">{path.avgSalary}</span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5">
              {path.requiredSkills.map(skill => (
                <span
                  key={skill}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        variants={fadeUp}
        custom={3}
        initial="hidden"
        animate="visible"
        onClick={onComplete}
        className="group px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          {t('onboarding.result_start')}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </span>
      </motion.button>
    </motion.div>
  )
}

// ─── Main Onboarding Component ──────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate()
  const completeOnboarding = useStore(s => s.completeOnboarding)
  const { t } = useTranslation()

  // Step tracking
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [direction, setDirection] = useState(1)
  const currentStep = STEPS[currentStepIdx]

  // Form state
  const [age, setAge] = useState(16)
  const [grade, setGrade] = useState(11)
  const [city, setCity] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [goals, setGoals] = useState<string[]>([])
  const [subjectLevels, setSubjectLevels] = useState<Record<string, { level: number; want: boolean }>>({})
  const [dreamText, setDreamText] = useState('')
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([])

  // Navigation
  const goNext = useCallback(() => {
    if (currentStepIdx < STEPS.length - 1) {
      setDirection(1)
      setCurrentStepIdx(prev => prev + 1)
    }
  }, [currentStepIdx])

  const goBack = useCallback(() => {
    if (currentStepIdx > 0) {
      setDirection(-1)
      setCurrentStepIdx(prev => prev - 1)
    }
  }, [currentStepIdx])

  // Toggle helpers
  const toggleInterest = useCallback((id: string) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }, [])

  const toggleGoal = useCallback((id: string) => {
    setGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }, [])

  const setSubjectLevel = useCallback((id: string, level: number) => {
    setSubjectLevels(prev => ({
      ...prev,
      [id]: { level, want: prev[id]?.want ?? false },
    }))
  }, [])

  const toggleSubjectWant = useCallback((id: string) => {
    setSubjectLevels(prev => ({
      ...prev,
      [id]: { level: prev[id]?.level ?? 0, want: !(prev[id]?.want ?? false) },
    }))
  }, [])

  const toggleProfession = useCallback((prof: string) => {
    setSelectedProfessions(prev =>
      prev.includes(prof) ? prev.filter(p => p !== prof) : [...prev, prof]
    )
  }, [])

  // Career paths for result step
  const careerPaths = useMemo(() => {
    const dreamInput = [dreamText, ...selectedProfessions].filter(Boolean).join(', ')
    return generateCareerPaths(interests, goals, dreamInput)
  }, [interests, goals, dreamText, selectedProfessions])

  // Complete onboarding
  const handleComplete = useCallback(() => {
    const profile: OnboardingProfile = {
      age,
      grade,
      city,
      interests,
      strengths: interests.slice(0, 3),
      subjectLevels: Object.entries(subjectLevels).map(([subject, data]) => ({
        subject,
        level: data.level,
        wantToStudy: data.want,
      })),
      dreamProfessions: [dreamText, ...selectedProfessions].filter(Boolean),
      goals,
      recommendedPaths: careerPaths,
    }
    completeOnboarding(profile)
    navigate('/dashboard')
  }, [age, grade, city, interests, subjectLevels, goals, dreamText, selectedProfessions, careerPaths, completeOnboarding, navigate])

  // Can proceed check
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 'welcome':
        return true
      case 'about':
        return age > 0 && grade > 0 && city.length > 0
      case 'interests':
        return interests.length > 0
      case 'subjects':
        return true // Optional — user can skip
      case 'goals':
        return goals.length > 0
      case 'dream':
        return true // Optional step
      case 'result':
        return true
      default:
        return true
    }
  }, [currentStep, age, grade, city, interests, goals])

  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-br',
      STEP_GRADIENTS[currentStep],
      'transition-all duration-700'
    )}>
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto min-h-screen flex flex-col">
        {/* Progress Bar */}
        <StepProgressBar currentIndex={currentStepIdx} total={STEPS.length} />

        {/* Back button */}
        {currentStepIdx > 0 && currentStep !== 'result' && (
          <div className="px-6 pt-2">
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={goBack}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('onboarding.back')}
            </motion.button>
          </div>
        )}

        {/* Step Content */}
        <div className="flex-1 flex items-center justify-center overflow-hidden py-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              {currentStep === 'welcome' && (
                <WelcomeStep onNext={goNext} />
              )}

              {currentStep === 'about' && (
                <AboutStep
                  age={age}
                  grade={grade}
                  city={city}
                  onAgeChange={setAge}
                  onGradeChange={setGrade}
                  onCityChange={setCity}
                />
              )}

              {currentStep === 'interests' && (
                <InterestsStep
                  selected={interests}
                  onToggle={toggleInterest}
                />
              )}

              {currentStep === 'subjects' && (
                <SubjectsStep
                  subjectLevels={subjectLevels}
                  onLevelChange={setSubjectLevel}
                  onToggleWant={toggleSubjectWant}
                />
              )}

              {currentStep === 'goals' && (
                <GoalsStep
                  selected={goals}
                  onToggle={toggleGoal}
                />
              )}

              {currentStep === 'dream' && (
                <DreamStep
                  dreamText={dreamText}
                  selectedProfessions={selectedProfessions}
                  onDreamChange={setDreamText}
                  onToggleProfession={toggleProfession}
                />
              )}

              {currentStep === 'result' && (
                <ResultStep
                  careerPaths={careerPaths}
                  onComplete={handleComplete}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation (not for welcome and result steps) */}
        {currentStep !== 'welcome' && currentStep !== 'result' && (
          <div className="px-6 pb-8 pt-2">
            <div className="flex justify-between items-center max-w-lg mx-auto">
              <div className="text-sm text-gray-400">
                {(currentStep === 'dream' || currentStep === 'subjects') && t('onboarding.optional_step')}
              </div>
              <motion.button
                onClick={goNext}
                disabled={!canProceed}
                whileHover={canProceed ? { scale: 1.02, y: -1 } : {}}
                whileTap={canProceed ? { scale: 0.98 } : {}}
                className={cn(
                  'flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-base transition-all duration-200',
                  canProceed
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                {t('onboarding.next')}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
