import { useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ArrowLeft,
  Star,
  Users,
  BookOpen,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  GraduationCap,
  TrendingUp,
  Award,
  Sparkles,
  SlidersHorizontal,
  Tag,
  Play,
} from 'lucide-react'
import { courses } from '@/data/courses'
import {
  type Course,
  type CourseCategory,
  CATEGORY_NAMES,
  SUBJECT_COLORS,
  SUBJECT_NAMES,
} from '@/types'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LEVEL_LABELS: Record<Course['level'], string> = {
  beginner: 'Начальный',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
}

const LEVEL_COLORS: Record<Course['level'], string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700',
}

type SortOption = 'popular' | 'newest' | 'rating' | 'price-asc' | 'price-desc'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Популярные' },
  { value: 'newest', label: 'Новые' },
  { value: 'rating', label: 'Рейтинг' },
  { value: 'price-asc', label: 'Цена (по возрастанию)' },
  { value: 'price-desc', label: 'Цена (по убыванию)' },
]

type PriceFilter = 'all' | 'free' | 'paid'

const CATEGORY_ICONS: Record<CourseCategory, string> = {
  'ent-prep': '🎯',
  programming: '💻',
  languages: '🌍',
  science: '🔬',
  business: '📊',
  design: '🎨',
  'personal-growth': '🌱',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(price: number): string {
  if (price === 0) return 'Бесплатно'
  return `${price.toLocaleString('ru-RU')} ₸`
}

function getSubjectGradient(subject: Course['subject']): string {
  const color = SUBJECT_COLORS[subject]
  return `linear-gradient(135deg, ${color} 0%, ${color}cc 50%, ${color}99 100%)`
}

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
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

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// ---------------------------------------------------------------------------
// Star Rating component
// ---------------------------------------------------------------------------

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.min(1, Math.max(0, rating - i))
          return (
            <div key={i} className="relative w-3.5 h-3.5">
              <Star className="w-3.5 h-3.5 text-slate-200" />
              {fill > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </div>
              )}
            </div>
          )
        })}
      </div>
      <span className="text-sm font-semibold text-slate-700">{rating.toFixed(1)}</span>
      <span className="text-xs text-slate-400">({count.toLocaleString('ru-RU')})</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Course Card component
// ---------------------------------------------------------------------------

function CourseCard({
  course,
  onSelect,
  featured = false,
}: {
  course: Course
  onSelect: (c: Course) => void
  featured?: boolean
}) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onSelect(course)}
      className={cn(
        'group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow cursor-pointer overflow-hidden flex flex-col',
        featured ? 'min-w-[320px] w-[340px] shrink-0' : 'w-full'
      )}
    >
      {/* Top gradient bar */}
      <div
        className="h-2 w-full shrink-0"
        style={{ background: getSubjectGradient(course.subject) }}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Category + Featured badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {CATEGORY_NAMES[course.category]}
          </span>
          {course.featured && (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              Хит
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-800 leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
          {course.title}
        </h3>

        {/* Teacher */}
        <p className="text-sm text-slate-500 mt-1.5">{course.teacherName}</p>

        {/* Rating */}
        <div className="mt-3">
          <StarRating rating={course.rating} count={course.reviewCount} />
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {course.studentsCount.toLocaleString('ru-RU')}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {course.lessons} уроков
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.duration}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {course.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Spacer to push price to bottom */}
        <div className="flex-1" />

        {/* Price + Level */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <span
            className={cn(
              'text-lg font-bold',
              course.price === 0 ? 'text-accent-600' : 'text-slate-800'
            )}
          >
            {formatPrice(course.price)}
          </span>
          <span
            className={cn(
              'text-xs font-medium px-2.5 py-1 rounded-full',
              LEVEL_COLORS[course.level]
            )}
          >
            {LEVEL_LABELS[course.level]}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Course Detail Modal
// ---------------------------------------------------------------------------

function CourseModal({
  course,
  onClose,
}: {
  course: Course
  onClose: () => void
}) {
  const { isAuthenticated } = useStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div
          className="h-3 w-full rounded-t-3xl"
          style={{ background: getSubjectGradient(course.subject) }}
        />

        <div className="p-6 sm:p-8">
          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Featured badge */}
          {course.featured && (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full w-fit mb-4">
              <Sparkles className="w-4 h-4" />
              Рекомендуемый курс
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-800 leading-tight">{course.title}</h2>

          {/* Teacher + Subject */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: SUBJECT_COLORS[course.subject] }}
              >
                {course.teacherName.charAt(0)}
              </div>
              <span className="text-sm font-medium text-slate-700">{course.teacherName}</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
              {SUBJECT_NAMES[course.subject]}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
              {CATEGORY_NAMES[course.category]}
            </span>
          </div>

          {/* Rating row */}
          <div className="mt-4">
            <StarRating rating={course.rating} count={course.reviewCount} />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { icon: Users, label: 'Учеников', value: course.studentsCount.toLocaleString('ru-RU') },
              { icon: BookOpen, label: 'Уроков', value: String(course.lessons) },
              { icon: Clock, label: 'Длительность', value: course.duration },
              { icon: GraduationCap, label: 'Уровень', value: LEVEL_LABELS[course.level] },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-slate-50 rounded-xl p-3 text-center"
              >
                <stat.icon className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                <p className="text-sm font-semibold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mt-6">
            <h3 className="font-semibold text-slate-800 mb-2">О курсе</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{course.longDescription}</p>
          </div>

          {/* Tags */}
          <div className="mt-5 flex flex-wrap gap-2">
            {course.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 font-medium"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Price + CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 p-5 bg-slate-50 rounded-2xl">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-slate-500">Стоимость курса</p>
              <p
                className={cn(
                  'text-3xl font-bold mt-1',
                  course.price === 0 ? 'text-accent-600' : 'text-slate-800'
                )}
              >
                {formatPrice(course.price)}
              </p>
            </div>
            <button
              className={cn(
                'w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
                'gradient-primary text-white hover:shadow-lg hover:shadow-primary-200 active:scale-[0.98]'
              )}
            >
              <Play className="w-4 h-4" />
              {isAuthenticated ? 'Записаться на курс' : 'Войти и записаться'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Stats Bar
// ---------------------------------------------------------------------------

function StatsBar() {
  const stats = useMemo(() => {
    const uniqueTeachers = new Set(courses.map((c) => c.teacherId)).size
    const totalStudents = courses.reduce((sum, c) => sum + c.studentsCount, 0)
    const avgRating = courses.reduce((sum, c) => sum + c.rating, 0) / courses.length
    return { uniqueTeachers, totalStudents, avgRating }
  }, [])

  const items = [
    { icon: BookOpen, value: `${courses.length}+ курсов`, label: 'По всем направлениям' },
    { icon: GraduationCap, value: `${stats.uniqueTeachers} преподавателей`, label: 'Лучшие эксперты' },
    { icon: Users, value: `${(stats.totalStudents / 1000).toFixed(0)},000+ учеников`, label: 'Учатся прямо сейчас' },
    { icon: Star, value: `${stats.avgRating.toFixed(1)} средний рейтинг`, label: 'На основе отзывов' },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {items.map((item) => (
        <motion.div
          key={item.value}
          variants={cardVariants}
          className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
            <item.icon className="w-5 h-5 text-primary-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{item.value}</p>
            <p className="text-xs text-slate-400 truncate">{item.label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Featured Carousel
// ---------------------------------------------------------------------------

function FeaturedCarousel({ onSelect }: { onSelect: (c: Course) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const featured = useMemo(() => courses.filter((c) => c.featured), [])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 360
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  if (featured.length === 0) return null

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Рекомендуемые курсы
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Лучшие курсы, выбранные нашей командой</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow text-slate-500 hover:text-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {featured.map((course) => (
          <div key={course.id} className="snap-start">
            <CourseCard course={course} onSelect={onSelect} featured />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Sidebar Filters
// ---------------------------------------------------------------------------

function FiltersSidebar({
  selectedCategories,
  toggleCategory,
  selectedLevels,
  toggleLevel,
  priceFilter,
  setPriceFilter,
  sortBy,
  setSortBy,
  onClose,
  isMobile,
}: {
  selectedCategories: Set<CourseCategory>
  toggleCategory: (cat: CourseCategory) => void
  selectedLevels: Set<Course['level']>
  toggleLevel: (level: Course['level']) => void
  priceFilter: PriceFilter
  setPriceFilter: (f: PriceFilter) => void
  sortBy: SortOption
  setSortBy: (s: SortOption) => void
  onClose?: () => void
  isMobile: boolean
}) {
  const allCategories = Object.entries(CATEGORY_NAMES) as [CourseCategory, string][]
  const allLevels: Course['level'][] = ['beginner', 'intermediate', 'advanced']

  const sectionClass = 'mb-6'
  const sectionTitle = 'text-sm font-semibold text-slate-800 mb-3'

  return (
    <div className={cn('bg-white rounded-2xl shadow-sm p-5', isMobile && 'max-h-[80vh] overflow-y-auto')}>
      {/* Mobile close */}
      {isMobile && (
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Фильтры
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Sort */}
      <div className={sectionClass}>
        <h4 className={sectionTitle}>Сортировка</h4>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={cn(
                'w-full text-left text-sm px-3 py-2 rounded-lg transition-colors',
                sortBy === opt.value
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className={sectionClass}>
        <h4 className={sectionTitle}>Категория</h4>
        <div className="space-y-1.5">
          {allCategories.map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer hover:text-slate-800 transition-colors px-1 py-1"
            >
              <input
                type="checkbox"
                checked={selectedCategories.has(key)}
                onChange={() => toggleCategory(key)}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <span>{CATEGORY_ICONS[key]}</span>
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Level */}
      <div className={sectionClass}>
        <h4 className={sectionTitle}>Уровень</h4>
        <div className="space-y-1.5">
          {allLevels.map((level) => (
            <label
              key={level}
              className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer hover:text-slate-800 transition-colors px-1 py-1"
            >
              <input
                type="checkbox"
                checked={selectedLevels.has(level)}
                onChange={() => toggleLevel(level)}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  LEVEL_COLORS[level]
                )}
              >
                {LEVEL_LABELS[level]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className={sectionClass}>
        <h4 className={sectionTitle}>Цена</h4>
        <div className="space-y-1.5">
          {([
            { value: 'all', label: 'Все' },
            { value: 'free', label: 'Бесплатные' },
            { value: 'paid', label: 'Платные' },
          ] as { value: PriceFilter; label: string }[]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPriceFilter(opt.value)}
              className={cn(
                'w-full text-left text-sm px-3 py-2 rounded-lg transition-colors',
                priceFilter === opt.value
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          selectedCategories.clear()
          selectedLevels.clear()
          setPriceFilter('all')
          setSortBy('popular')
        }}
        className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-2 text-center"
      >
        Сбросить фильтры
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function Courses() {
  const { user } = useStore()

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<CourseCategory>>(new Set())
  const [selectedLevels, setSelectedLevels] = useState<Set<Course['level']>>(new Set())
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Modal
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  // Toggle helpers that cause re-render with new Set
  const toggleCategory = (cat: CourseCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const toggleLevel = (level: Course['level']) => {
    setSelectedLevels((prev) => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }

  // Filter + sort courses
  const filteredCourses = useMemo(() => {
    let result = [...courses]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.teacherName.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    // Categories
    if (selectedCategories.size > 0) {
      result = result.filter((c) => selectedCategories.has(c.category))
    }

    // Levels
    if (selectedLevels.size > 0) {
      result = result.filter((c) => selectedLevels.has(c.level))
    }

    // Price
    if (priceFilter === 'free') result = result.filter((c) => c.price === 0)
    if (priceFilter === 'paid') result = result.filter((c) => c.price > 0)

    // Sort
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.studentsCount - a.studentsCount)
        break
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
    }

    return result
  }, [searchQuery, selectedCategories, selectedLevels, priceFilter, sortBy])

  const activeFilterCount =
    selectedCategories.size + selectedLevels.size + (priceFilter !== 'all' ? 1 : 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
          {/* Back link */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться на главную
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl sm:text-4xl font-bold">Маркетплейс курсов</h1>
            <p className="text-white/60 mt-2 text-base sm:text-lg max-w-2xl">
              Найди идеальный курс для подготовки к ЕНТ, изучения программирования, языков и
              развития навыков от лучших преподавателей Казахстана
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 max-w-2xl"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск курсов, преподавателей, тем..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <StatsBar />

        {/* Featured carousel */}
        <div className="mt-8">
          <FeaturedCarousel onSelect={setSelectedCourse} />
        </div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mt-8 flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
              activeFilterCount > 0
                ? 'bg-primary-600 text-white'
                : 'bg-white text-slate-700 shadow-sm hover:shadow-md'
            )}
          >
            <Filter className="w-4 h-4" />
            Фильтры
            {activeFilterCount > 0 && (
              <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          <span className="text-sm text-slate-400">
            {filteredCourses.length} {filteredCourses.length === 1 ? 'курс' : 'курсов'}
          </span>
        </div>

        {/* Grid layout */}
        <div className="mt-6 flex gap-6">
          {/* Desktop sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-6">
              <FiltersSidebar
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                selectedLevels={selectedLevels}
                toggleLevel={toggleLevel}
                priceFilter={priceFilter}
                setPriceFilter={setPriceFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                isMobile={false}
              />
            </div>
          </div>

          {/* Course grid */}
          <div className="flex-1 min-w-0">
            {/* Desktop results count */}
            <div className="hidden lg:flex items-center justify-between mb-5">
              <p className="text-sm text-slate-500">
                Найдено{' '}
                <span className="font-semibold text-slate-700">{filteredCourses.length}</span>{' '}
                {filteredCourses.length === 1 ? 'курс' : 'курсов'}
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setSelectedCategories(new Set())
                    setSelectedLevels(new Set())
                    setPriceFilter('all')
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>

            {filteredCourses.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={`${searchQuery}-${Array.from(selectedCategories).join()}-${Array.from(selectedLevels).join()}-${priceFilter}-${sortBy}`}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} onSelect={setSelectedCourse} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-5">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Курсы не найдены</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                  Попробуйте изменить запрос или сбросить фильтры для отображения всех курсов
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategories(new Set())
                    setSelectedLevels(new Set())
                    setPriceFilter('all')
                    setSortBy('popular')
                  }}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Сбросить все фильтры
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ───────────────────────────────────────── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[90vw] max-w-80 lg:hidden"
            >
              <FiltersSidebar
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                selectedLevels={selectedLevels}
                toggleLevel={toggleLevel}
                priceFilter={priceFilter}
                setPriceFilter={setPriceFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onClose={() => setMobileFiltersOpen(false)}
                isMobile
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Course Detail Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedCourse && (
          <CourseModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
