import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts'
import {
  LogOut,
  BookOpen,
  Users,
  Star,
  DollarSign,
  Plus,
  Edit3,
  Trash2,
  TrendingUp,
  Award,
  GraduationCap,
  ChevronDown,
  CheckCircle2,
  Banknote,
  BarChart3,
  Eye,
  Tag,
  Layers,
  ArrowUpRight,
  Wallet,
  CreditCard,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { courses } from '@/data/courses'
import { cn } from '@/lib/utils'
import { SUBJECT_NAMES, CATEGORY_NAMES } from '@/types'
import type { Subject, CourseCategory } from '@/types'

// ── Animation variants ──────────────────────────────────────────────────────

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
} satisfies import('framer-motion').Variants

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

// ── Mock analytics data ─────────────────────────────────────────────────────

const enrollmentData = [
  { month: 'Сен', students: 120 },
  { month: 'Окт', students: 245 },
  { month: 'Ноя', students: 380 },
  { month: 'Дек', students: 510 },
  { month: 'Янв', students: 680 },
  { month: 'Фев', students: 890 },
]

const ratingDistribution = [
  { stars: '5 звёзд', count: 65, fill: '#16a34a' },
  { stars: '4 звезды', count: 20, fill: '#22c55e' },
  { stars: '3 звезды', count: 10, fill: '#facc15' },
  { stars: '2 звезды', count: 3, fill: '#f97316' },
  { stars: '1 звезда', count: 2, fill: '#ef4444' },
]

const monthlyEarnings = [
  { month: 'Сен', earnings: 420000 },
  { month: 'Окт', earnings: 680000 },
  { month: 'Ноя', earnings: 950000 },
  { month: 'Дек', earnings: 1240000 },
  { month: 'Янв', earnings: 1580000 },
  { month: 'Фев', earnings: 1890000 },
]

// ── Tab types ───────────────────────────────────────────────────────────────

type TabId = 'courses' | 'create' | 'analytics' | 'earnings'

const TABS: { id: TabId; label: string }[] = [
  { id: 'courses', label: 'Мои курсы' },
  { id: 'create', label: 'Создать курс' },
  { id: 'analytics', label: 'Аналитика' },
  { id: 'earnings', label: 'Доход' },
]

// ── Level labels ────────────────────────────────────────────────────────────

const LEVEL_NAMES: Record<string, string> = {
  beginner: 'Начальный',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
}

// ── Custom tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
  suffix,
}: {
  active?: boolean
  payload?: Array<{ value: number; color: string }>
  label?: string
  suffix: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="text-gray-500 text-xs mb-0.5">{label}</p>
      <p className="font-semibold text-gray-900">
        {payload[0].value.toLocaleString('ru-RU')} {suffix}
      </p>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useStore()

  const [activeTab, setActiveTab] = useState<TabId>('courses')
  const [showToast, setShowToast] = useState(false)

  // Form state for creating course
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '' as Subject | '',
    category: '' as CourseCategory | '',
    level: '' as 'beginner' | 'intermediate' | 'advanced' | '',
    price: '',
    lessons: '',
    duration: '',
    tags: '',
  })

  // Guard: no user or not teacher
  if (!user) {
    navigate('/auth')
    return null
  }

  // Demo: teacher's courses = first 3 courses from data
  const teacherCourses = courses.slice(0, 3)

  // Stats calculations
  const totalStudents = teacherCourses.reduce((sum, c) => sum + c.studentsCount, 0)
  const averageRating =
    teacherCourses.length > 0
      ? teacherCourses.reduce((sum, c) => sum + c.rating, 0) / teacherCourses.length
      : 0
  const totalEarnings = teacherCourses.reduce(
    (sum, c) => sum + c.studentsCount * c.price * 0.7,
    0,
  )

  const formatTenge = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₸'
  }

  // Stats cards config
  const statCards = [
    {
      title: 'Мои курсы',
      value: teacherCourses.length.toString(),
      icon: BookOpen,
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      lightText: 'text-blue-600',
      change: '+1 в этом месяце',
    },
    {
      title: 'Всего учеников',
      value: totalStudents.toLocaleString('ru-RU'),
      icon: Users,
      color: 'bg-green-500',
      lightBg: 'bg-green-50',
      lightText: 'text-green-600',
      change: '+12.3%',
    },
    {
      title: 'Средний рейтинг',
      value: averageRating.toFixed(1),
      icon: Star,
      color: 'bg-amber-500',
      lightBg: 'bg-amber-50',
      lightText: 'text-amber-600',
      change: 'Отлично',
    },
    {
      title: 'Заработок',
      value: formatTenge(totalEarnings),
      icon: DollarSign,
      color: 'bg-purple-500',
      lightBg: 'bg-purple-50',
      lightText: 'text-purple-600',
      change: '70% от продаж',
    },
  ]

  // Best course for analytics
  const bestCourse = useMemo(() => {
    return [...teacherCourses].sort((a, b) => b.studentsCount * b.price - a.studentsCount * a.price)[0]
  }, [teacherCourses])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handlePublish = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
    // Reset form
    setFormData({
      title: '',
      description: '',
      subject: '',
      category: '',
      level: '',
      price: '',
      lessons: '',
      duration: '',
      tags: '',
    })
  }

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* ── Success Toast ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -40, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-green-500/30 flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Курс успешно опубликован!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900">Study Hub</h1>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                  Панель преподавателя
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative py-3 px-4 text-sm font-medium whitespace-nowrap transition-colors',
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* ── Stats Cards (always visible) ───────────────────────────── */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-white', card.color)}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <span className={cn('text-xs font-medium px-2 py-1 rounded-full', card.lightBg, card.lightText)}>
                    {card.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.title}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Tab Content ────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {/* ── TAB: My Courses ──────────────────────────────────────── */}
            {activeTab === 'courses' && (
              <motion.div
                key="courses"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Мои курсы</h2>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Новый курс
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {teacherCourses.map((course, i) => {
                    const revenue = course.studentsCount * course.price * 0.7
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Course thumbnail placeholder */}
                        <div className="h-36 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 relative">
                          <div className="absolute inset-0 bg-black/10" />
                          <div className="absolute top-3 right-3">
                            <span className="bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                              Активен
                            </span>
                          </div>
                          <div className="absolute bottom-3 left-4">
                            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-lg">
                              {LEVEL_NAMES[course.level]}
                            </span>
                          </div>
                        </div>

                        {/* Course info */}
                        <div className="p-5">
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">
                            {course.title}
                          </h3>

                          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {course.studentsCount.toLocaleString('ru-RU')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              {course.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5" />
                              {course.lessons} уроков
                            </span>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-xs text-gray-400">Доход</p>
                              <p className="text-lg font-bold text-green-600">
                                {formatTenge(revenue)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400">Цена</p>
                              <p className="text-sm font-semibold text-gray-700">
                                {course.price === 0 ? 'Бесплатно' : formatTenge(course.price)}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                              <Edit3 className="w-3.5 h-3.5" />
                              Редактировать
                            </button>
                            <button className="flex items-center justify-center gap-1.5 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button className="flex items-center justify-center gap-1.5 bg-gray-50 text-gray-500 hover:bg-gray-100 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* ── TAB: Create Course ───────────────────────────────────── */}
            {activeTab === 'create' && (
              <motion.div
                key="create"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
              >
                <div className="max-w-3xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Создание нового курса</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Заполните информацию о курсе и опубликуйте его для учеников
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Название курса
                      </label>
                      <input
                        type="text"
                        placeholder="Например: Математика ЕНТ — полный курс"
                        value={formData.title}
                        onChange={e => updateForm('title', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Описание курса
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Подробно опишите, чему научатся ученики..."
                        value={formData.description}
                        onChange={e => updateForm('description', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-y min-h-[100px]"
                      />
                    </div>

                    {/* Subject + Category row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Предмет
                        </label>
                        <div className="relative">
                          <select
                            value={formData.subject}
                            onChange={e => updateForm('subject', e.target.value)}
                            className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                          >
                            <option value="">Выберите предмет</option>
                            {(Object.entries(SUBJECT_NAMES) as [Subject, string][]).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Категория
                        </label>
                        <div className="relative">
                          <select
                            value={formData.category}
                            onChange={e => updateForm('category', e.target.value)}
                            className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                          >
                            <option value="">Выберите категорию</option>
                            {(Object.entries(CATEGORY_NAMES) as [CourseCategory, string][]).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Level + Price row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Уровень
                        </label>
                        <div className="relative">
                          <select
                            value={formData.level}
                            onChange={e => updateForm('level', e.target.value)}
                            className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                          >
                            <option value="">Выберите уровень</option>
                            <option value="beginner">Начальный</option>
                            <option value="intermediate">Средний</option>
                            <option value="advanced">Продвинутый</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Цена (тенге)
                        </label>
                        <input
                          type="number"
                          placeholder="0 = бесплатно"
                          value={formData.price}
                          onChange={e => updateForm('price', e.target.value)}
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Lessons + Duration row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Количество уроков
                        </label>
                        <input
                          type="number"
                          placeholder="Например: 30"
                          value={formData.lessons}
                          onChange={e => updateForm('lessons', e.target.value)}
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Длительность
                        </label>
                        <input
                          type="text"
                          placeholder="Например: 15 часов"
                          value={formData.duration}
                          onChange={e => updateForm('duration', e.target.value)}
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Теги
                      </label>
                      <div className="relative">
                        <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="ЕНТ, Математика, Алгебра (через запятую)"
                          value={formData.tags}
                          onChange={e => updateForm('tags', e.target.value)}
                          className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                      <button
                        onClick={handlePublish}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 hover:from-blue-700 hover:to-purple-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Опубликовать курс
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TAB: Analytics ────────────────────────────────────────── */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Line chart - enrollment */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-semibold text-gray-800">Динамика записей</h3>
                        <p className="text-sm text-gray-500">Новые ученики по месяцам</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={enrollmentData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                        <defs>
                          <linearGradient id="enrollGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#94a3b8' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#94a3b8' }}
                        />
                        <Tooltip content={<ChartTooltip suffix="учеников" />} />
                        <Line
                          type="monotone"
                          dataKey="students"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 7, fill: '#1d4ed8', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bar chart - rating distribution */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-semibold text-gray-800">Распределение оценок</h3>
                        <p className="text-sm text-gray-500">Процент отзывов по звёздам</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-500" />
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={ratingDistribution} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="stars"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#94a3b8' }}
                          unit="%"
                        />
                        <Tooltip content={<ChartTooltip suffix="%" />} />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                          {ratingDistribution.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top performing course */}
                {bestCourse && (
                  <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-2 mb-5">
                      <Award className="w-5 h-5 text-amber-500" />
                      <h3 className="font-semibold text-gray-800">Лучший курс по доходу</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="w-full sm:w-48 h-28 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                        <Award className="w-12 h-12 text-white/90" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{bestCourse.title}</h4>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{bestCourse.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <Users className="w-4 h-4 text-blue-500" />
                            {bestCourse.studentsCount.toLocaleString('ru-RU')} учеников
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            {bestCourse.rating} ({bestCourse.reviewCount} отзывов)
                          </span>
                          <span className="flex items-center gap-1.5 font-semibold text-green-600">
                            <DollarSign className="w-4 h-4" />
                            {formatTenge(bestCourse.studentsCount * bestCourse.price * 0.7)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── TAB: Earnings ─────────────────────────────────────────── */}
            {activeTab === 'earnings' && (
              <motion.div
                key="earnings"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Top earnings cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total earnings */}
                  <div className="md:col-span-2 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -translate-y-1/4 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-5 h-5 text-green-200" />
                        <span className="text-green-100 text-sm font-medium">Общий заработок</span>
                      </div>
                      <p className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
                        {formatTenge(totalEarnings)}
                      </p>
                      <div className="flex items-center gap-2 text-green-100">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="text-sm">+24.5% к прошлому месяцу</span>
                      </div>
                    </div>
                  </div>

                  {/* Revenue split explanation */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                        <Banknote className="w-5 h-5 text-purple-500" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">Распределение дохода</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Вы получаете <span className="font-bold text-purple-600">70% от продаж</span> каждого курса. Платформа удерживает 30% за обслуживание, маркетинг и поддержку.
                      </p>
                    </div>
                    {/* Visual split */}
                    <div>
                      <div className="flex rounded-full overflow-hidden h-3 mb-2">
                        <div className="bg-purple-500 w-[70%]" />
                        <div className="bg-gray-200 w-[30%]" />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-purple-600 font-medium">Вы: 70%</span>
                        <span className="text-gray-400">Платформа: 30%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly earnings chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-gray-800">Доход по месяцам</h3>
                      <p className="text-sm text-gray-500">Ваша доля (70%) за последние 6 месяцев</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyEarnings} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                      <defs>
                        <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                      />
                      <Tooltip
                        formatter={(value) => [formatTenge(value as number), 'Доход']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Bar dataKey="earnings" fill="url(#earningsGradient)" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Breakdown per course */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Доход по курсам</h3>
                  <div className="space-y-3">
                    {teacherCourses.map(course => {
                      const revenue = course.studentsCount * course.price * 0.7
                      const percentage = totalEarnings > 0 ? (revenue / totalEarnings) * 100 : 0
                      return (
                        <div key={course.id} className="flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{course.title}</p>
                            <p className="text-xs text-gray-400">
                              {course.studentsCount.toLocaleString('ru-RU')} учеников x {formatTenge(course.price)} x 70%
                            </p>
                          </div>
                          <div className="w-32 hidden sm:block">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-sm font-bold text-green-600 whitespace-nowrap">
                            {formatTenge(revenue)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Withdraw button */}
                <div className="flex justify-center">
                  <button className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-green-500/25 hover:shadow-lg hover:shadow-green-500/30 hover:from-green-700 hover:to-emerald-700 transition-all active:scale-[0.98]">
                    <CreditCard className="w-5 h-5" />
                    Вывести средства
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  )
}
