import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut,
  Search,
  MapPin,
  GraduationCap,
  Briefcase,
  Users,
  BarChart3,
  Eye,
  FileText,
  TrendingUp,
  Star,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  X,
  Building2,
  Mail,
  ExternalLink,
  SlidersHorizontal,
  UserCheck,
  ArrowUpDown,
} from 'lucide-react'

import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal, { ModalFooter } from '@/components/ui/Modal'
import Input, { Textarea } from '@/components/ui/Input'

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
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
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
} satisfies import('framer-motion').Variants

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.01,
    y: -2,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
}

// ── Types ───────────────────────────────────────────────────────────────────

interface Candidate {
  id: string
  name: string
  title: string
  city: string
  skills: string[]
  score: number
  university: string
  isOpenToWork: boolean
  matchPercentage: number
}

interface Vacancy {
  id: string
  title: string
  city: string
  salary: string
  applications: number
  status: 'active' | 'paused' | 'closed'
  postedDate: string
}

interface VacancyForm {
  title: string
  city: string
  salary: string
  description: string
  requirements: string
}

// ── Mock data ───────────────────────────────────────────────────────────────

const mockCandidates: Candidate[] = [
  { id: '1', name: 'Айдана Мухамедова', title: 'Студентка НУ, 3 курс', city: 'Астана', skills: ['Python', 'Data Science', 'SQL'], score: 92, university: 'Назарбаев Университет', isOpenToWork: true, matchPercentage: 95 },
  { id: '2', name: 'Арман Касымов', title: '11 класс, Олимпиадник', city: 'Алматы', skills: ['Математика', 'Физика', 'C++'], score: 88, university: 'Цель: КБТУ', isOpenToWork: true, matchPercentage: 87 },
  { id: '3', name: 'Диана Сериккызы', title: 'Frontend Developer (стажёр)', city: 'Алматы', skills: ['React', 'TypeScript', 'Figma'], score: 85, university: 'КазНУ', isOpenToWork: false, matchPercentage: 82 },
  { id: '4', name: 'Нурсултан Абаев', title: 'Студент 2 курса КБТУ', city: 'Алматы', skills: ['Java', 'Spring', 'PostgreSQL'], score: 79, university: 'КБТУ', isOpenToWork: true, matchPercentage: 78 },
  { id: '5', name: 'Камила Жунусова', title: 'Маркетолог, выпускница KIMEP', city: 'Алматы', skills: ['Marketing', 'SMM', 'Analytics'], score: 83, university: 'KIMEP', isOpenToWork: true, matchPercentage: 75 },
  { id: '6', name: 'Бекзат Оспанов', title: 'Data Analyst Intern', city: 'Астана', skills: ['Python', 'Excel', 'Power BI'], score: 76, university: 'ЕНУ', isOpenToWork: true, matchPercentage: 71 },
  { id: '7', name: 'Мадина Тулешова', title: '11 класс, медицинское направление', city: 'Шымкент', skills: ['Биология', 'Химия', 'Английский'], score: 91, university: 'Цель: КазНМУ', isOpenToWork: false, matchPercentage: 68 },
  { id: '8', name: 'Ерлан Жуматов', title: 'UX/UI Designer Junior', city: 'Алматы', skills: ['Figma', 'Adobe XD', 'UI/UX'], score: 80, university: 'КазНУ', isOpenToWork: true, matchPercentage: 65 },
]

const initialVacancies: Vacancy[] = [
  { id: 'v1', title: 'Junior Python Developer (стажировка)', city: 'Алматы', salary: '150 000 – 200 000 ₸', applications: 12, status: 'active', postedDate: '2026-01-28' },
  { id: 'v2', title: 'Marketing Intern', city: 'Астана', salary: 'Неоплачиваемая', applications: 8, status: 'active', postedDate: '2026-02-01' },
  { id: 'v3', title: 'Data Analyst', city: 'Алматы', salary: '250 000 – 350 000 ₸', applications: 23, status: 'active', postedDate: '2026-01-15' },
]

const CITIES = ['Все', 'Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Павлодар', 'Атырау'] as const
const ALL_SKILLS = ['Python', 'JavaScript', 'Math', 'English', 'Data Science', 'Design', 'Marketing', 'Finance'] as const
const STATUSES = ['Все', 'Ищет стажировку', 'Ищет работу'] as const
const SORT_OPTIONS = ['По рейтингу', 'По релевантности'] as const

// ── Skill chip color map ────────────────────────────────────────────────────

const skillColorMap: Record<string, string> = {
  Python: 'bg-blue-100 text-blue-700',
  JavaScript: 'bg-yellow-100 text-yellow-800',
  React: 'bg-cyan-100 text-cyan-700',
  TypeScript: 'bg-blue-100 text-blue-800',
  SQL: 'bg-orange-100 text-orange-700',
  'Data Science': 'bg-purple-100 text-purple-700',
  Figma: 'bg-pink-100 text-pink-700',
  'Adobe XD': 'bg-pink-100 text-pink-700',
  'UI/UX': 'bg-rose-100 text-rose-700',
  Java: 'bg-red-100 text-red-700',
  Spring: 'bg-green-100 text-green-700',
  PostgreSQL: 'bg-indigo-100 text-indigo-700',
  Marketing: 'bg-emerald-100 text-emerald-700',
  SMM: 'bg-teal-100 text-teal-700',
  Analytics: 'bg-violet-100 text-violet-700',
  Excel: 'bg-green-100 text-green-800',
  'Power BI': 'bg-amber-100 text-amber-700',
  'C++': 'bg-slate-100 text-slate-700',
  Math: 'bg-indigo-100 text-indigo-700',
  English: 'bg-sky-100 text-sky-700',
  Design: 'bg-fuchsia-100 text-fuchsia-700',
  Finance: 'bg-lime-100 text-lime-800',
  default: 'bg-gray-100 text-gray-700',
}

function getSkillColor(skill: string): string {
  return skillColorMap[skill] ?? skillColorMap.default
}

// ── Score badge ─────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-emerald-100 text-emerald-700 ring-emerald-500/20'
      : score >= 60
        ? 'bg-amber-100 text-amber-700 ring-amber-500/20'
        : 'bg-red-100 text-red-700 ring-red-500/20'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset',
        color,
      )}
    >
      <Star className="w-3 h-3" />
      {score}
    </span>
  )
}

// ── Match bar ───────────────────────────────────────────────────────────────

function MatchBar({ percentage }: { percentage: number }) {
  const barColor =
    percentage >= 80
      ? 'from-emerald-500 to-green-400'
      : percentage >= 60
        ? 'from-amber-500 to-yellow-400'
        : 'from-red-500 to-orange-400'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Совпадение</span>
        <span className="font-semibold text-gray-700">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full bg-gradient-to-r', barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
    </div>
  )
}

// ── Stat card (analytics) ───────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  change: string
  color: string
}) {
  const colorMap: Record<string, { bg: string; iconBg: string; iconColor: string; valueColor: string }> = {
    blue: { bg: 'bg-blue-50 border-blue-100', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', valueColor: 'text-blue-700' },
    green: { bg: 'bg-emerald-50 border-emerald-100', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', valueColor: 'text-emerald-700' },
    purple: { bg: 'bg-purple-50 border-purple-100', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', valueColor: 'text-purple-700' },
    amber: { bg: 'bg-amber-50 border-amber-100', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', valueColor: 'text-amber-700' },
  }

  const c = colorMap[color] ?? colorMap.blue

  return (
    <motion.div variants={scaleIn}>
      <div className={cn('rounded-2xl border p-5 flex items-start gap-4', c.bg)}>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', c.iconBg)}>
          <Icon className={cn('w-5 h-5', c.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-0.5">{label}</p>
          <p className={cn('text-2xl font-bold', c.valueColor)}>{value}</p>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            {change}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Candidate Card ──────────────────────────────────────────────────────────

function CandidateCard({ candidate, index }: { candidate: Candidate; index: number }) {
  const navigate = useNavigate()

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.05 }}
      whileHover="hover"
    >
      <motion.div variants={cardHover}>
        <Card variant="default" className="h-full flex flex-col overflow-hidden">
          <CardBody className="p-5 flex flex-col flex-1 gap-3">
            {/* Top row: avatar, name, score */}
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                <span className="text-lg font-bold text-white">
                  {candidate.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-gray-900 truncate">
                    {candidate.name}
                  </h3>
                  <ScoreBadge score={candidate.score} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{candidate.title}</p>
              </div>
            </div>

            {/* Location & university */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {candidate.city}
              </span>
              <span className="inline-flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                {candidate.university}
              </span>
            </div>

            {/* Open to work badge */}
            {candidate.isOpenToWork && (
              <div className="flex">
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ring-emerald-500/20">
                  <UserCheck className="w-3 h-3" />
                  Открыт к работе
                </span>
              </div>
            )}

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className={cn(
                    'px-2 py-0.5 rounded-md text-[11px] font-medium',
                    getSkillColor(skill),
                  )}
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Match bar */}
            <MatchBar percentage={candidate.matchPercentage} />

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-1">
              <Button
                variant="primary"
                size="sm"
                className="flex-1 text-xs"
                icon={<ExternalLink className="w-3.5 h-3.5" />}
                onClick={() => navigate(`/profile/${candidate.id}`)}
              >
                Посмотреть профиль
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="text-xs"
                icon={<Mail className="w-3.5 h-3.5" />}
              >
                Связаться
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function EmployerDashboard() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)

  // Tab state
  const [activeTab, setActiveTab] = useState<'talent' | 'vacancies' | 'analytics'>('talent')

  // Talent search state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>('Все')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('Все')
  const [sortBy, setSortBy] = useState<string>('По рейтингу')

  // Vacancies state
  const [vacancies, setVacancies] = useState<Vacancy[]>(initialVacancies)
  const [showVacancyModal, setShowVacancyModal] = useState(false)
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null)
  const [vacancyForm, setVacancyForm] = useState<VacancyForm>({
    title: '',
    city: 'Алматы',
    salary: '',
    description: '',
    requirements: '',
  })

  // ── Skill toggle ──────────────────────────────────────────────────────

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    )
  }

  // ── Filtered & sorted candidates ──────────────────────────────────────

  const filteredCandidates = useMemo(() => {
    let result = [...mockCandidates]

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.university.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q)),
      )
    }

    // City filter
    if (selectedCity !== 'Все') {
      result = result.filter((c) => c.city === selectedCity)
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      result = result.filter((c) =>
        selectedSkills.some((skill) =>
          c.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase())),
        ),
      )
    }

    // Status filter
    if (selectedStatus === 'Ищет стажировку' || selectedStatus === 'Ищет работу') {
      result = result.filter((c) => c.isOpenToWork)
    }

    // Sort
    if (sortBy === 'По рейтингу') {
      result.sort((a, b) => b.score - a.score)
    } else {
      result.sort((a, b) => b.matchPercentage - a.matchPercentage)
    }

    return result
  }, [searchQuery, selectedCity, selectedSkills, selectedStatus, sortBy])

  // ── Vacancy actions ───────────────────────────────────────────────────

  const handleOpenCreateVacancy = () => {
    setEditingVacancy(null)
    setVacancyForm({ title: '', city: 'Алматы', salary: '', description: '', requirements: '' })
    setShowVacancyModal(true)
  }

  const handleOpenEditVacancy = (vacancy: Vacancy) => {
    setEditingVacancy(vacancy)
    setVacancyForm({
      title: vacancy.title,
      city: vacancy.city,
      salary: vacancy.salary,
      description: '',
      requirements: '',
    })
    setShowVacancyModal(true)
  }

  const handleSaveVacancy = () => {
    if (!vacancyForm.title.trim()) return

    if (editingVacancy) {
      setVacancies((prev) =>
        prev.map((v) =>
          v.id === editingVacancy.id
            ? { ...v, title: vacancyForm.title, city: vacancyForm.city, salary: vacancyForm.salary || 'Не указана' }
            : v,
        ),
      )
    } else {
      const newVacancy: Vacancy = {
        id: `v${Date.now()}`,
        title: vacancyForm.title,
        city: vacancyForm.city,
        salary: vacancyForm.salary || 'Не указана',
        applications: 0,
        status: 'active',
        postedDate: new Date().toISOString().slice(0, 10),
      }
      setVacancies((prev) => [newVacancy, ...prev])
    }

    setShowVacancyModal(false)
    setEditingVacancy(null)
  }

  const handleDeleteVacancy = (id: string) => {
    setVacancies((prev) => prev.filter((v) => v.id !== id))
  }

  // ── Logout ────────────────────────────────────────────────────────────

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  // ── Guard: no user ────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card variant="glass" className="p-8 max-w-md text-center">
          <CardBody>
            <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Сессия истекла</h2>
            <p className="text-gray-500 mb-6">Пожалуйста, войдите заново.</p>
            <Button onClick={() => navigate('/auth')} fullWidth>
              Войти
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  // ── Tab config ────────────────────────────────────────────────────────

  const tabs = [
    { key: 'talent' as const, label: 'Поиск талантов', icon: Users },
    { key: 'vacancies' as const, label: 'Мои вакансии', icon: Briefcase },
    { key: 'analytics' as const, label: 'Аналитика', icon: BarChart3 },
  ]

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  {user.name}
                </h1>
              </div>
              <Badge color="purple" size="sm" icon={<Briefcase className="w-3 h-3" />}>
                Панель работодателя
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-gray-500">
                {user.email}
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

      {/* ── Tab navigation ─────────────────────────────────────────────── */}
      <div className="sticky top-16 z-20 bg-white/70 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-0" role="tablist">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="employer-tab-indicator"
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-blue-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {/* ────────────────────────────────────────────────────────────
              TAB 1: Talent Search
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'talent' && (
            <motion.div
              key="talent"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="space-y-5"
            >
              {/* Search bar */}
              <motion.div variants={itemVariants}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск по навыкам, городу, вузу..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      'w-full pl-12 pr-4 py-3.5 text-sm text-gray-900 bg-white rounded-2xl',
                      'border border-gray-200 shadow-sm',
                      'placeholder:text-gray-400',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
                      'transition-all duration-200',
                    )}
                  />
                </div>
              </motion.div>

              {/* Filters row */}
              <motion.div variants={itemVariants}>
                <Card variant="default" className="overflow-visible">
                  <CardBody className="p-4 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                      Фильтры
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* City dropdown */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          Город
                        </label>
                        <div className="relative">
                          <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className={cn(
                              'w-full appearance-none rounded-xl border border-gray-300 bg-white',
                              'px-3 py-2 pr-8 text-sm text-gray-700',
                              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
                              'transition-colors duration-200 cursor-pointer',
                            )}
                          >
                            {CITIES.map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Status dropdown */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                          <UserCheck className="w-3 h-3 inline mr-1" />
                          Статус
                        </label>
                        <div className="relative">
                          <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className={cn(
                              'w-full appearance-none rounded-xl border border-gray-300 bg-white',
                              'px-3 py-2 pr-8 text-sm text-gray-700',
                              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
                              'transition-colors duration-200 cursor-pointer',
                            )}
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Sort dropdown */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                          <ArrowUpDown className="w-3 h-3 inline mr-1" />
                          Сортировка
                        </label>
                        <div className="relative">
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className={cn(
                              'w-full appearance-none rounded-xl border border-gray-300 bg-white',
                              'px-3 py-2 pr-8 text-sm text-gray-700',
                              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
                              'transition-colors duration-200 cursor-pointer',
                            )}
                          >
                            {SORT_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Results count */}
                      <div className="flex items-end">
                        <div className="w-full rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-center">
                          <p className="text-xs text-blue-500">Найдено</p>
                          <p className="text-lg font-bold text-blue-700">{filteredCandidates.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Skills multi-select chips */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        Навыки
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ALL_SKILLS.map((skill) => {
                          const isSelected = selectedSkills.includes(skill)
                          return (
                            <button
                              key={skill}
                              onClick={() => toggleSkill(skill)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                                'border focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600',
                              )}
                            >
                              {skill}
                              {isSelected && <X className="w-3 h-3 ml-1.5 inline" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Candidate grid */}
              {filteredCandidates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCandidates.map((candidate, index) => (
                    <CandidateCard key={candidate.id} candidate={candidate} index={index} />
                  ))}
                </div>
              ) : (
                <motion.div variants={itemVariants}>
                  <Card variant="default" className="py-16 text-center">
                    <CardBody>
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-1">Кандидаты не найдены</h3>
                      <p className="text-sm text-gray-400">
                        Попробуйте изменить фильтры или поисковый запрос.
                      </p>
                    </CardBody>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ────────────────────────────────────────────────────────────
              TAB 2: My Vacancies
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'vacancies' && (
            <motion.div
              key="vacancies"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="space-y-5"
            >
              {/* Header row */}
              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Мои вакансии</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {vacancies.length} {vacancies.length === 1 ? 'вакансия' : vacancies.length < 5 ? 'вакансии' : 'вакансий'} опубликовано
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleOpenCreateVacancy}
                >
                  Добавить вакансию
                </Button>
              </motion.div>

              {/* Vacancy list */}
              <div className="space-y-3">
                {vacancies.map((vacancy, index) => (
                  <motion.div
                    key={vacancy.id}
                    variants={itemVariants}
                    custom={index}
                  >
                    <Card variant="default" className="overflow-hidden">
                      <CardBody className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {/* Left: Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <h3 className="text-sm font-bold text-gray-900">{vacancy.title}</h3>
                              <Badge
                                color={vacancy.status === 'active' ? 'green' : vacancy.status === 'paused' ? 'yellow' : 'gray'}
                                size="sm"
                              >
                                {vacancy.status === 'active' ? 'Активна' : vacancy.status === 'paused' ? 'На паузе' : 'Закрыта'}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {vacancy.city}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {vacancy.salary}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {vacancy.applications} {vacancy.applications === 1 ? 'отклик' : vacancy.applications < 5 ? 'отклика' : 'откликов'}
                              </span>
                              <span className="text-gray-400">
                                Опубликовано: {new Date(vacancy.postedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<Eye className="w-3.5 h-3.5" />}
                            >
                              <span className="hidden sm:inline">Отклики</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Pencil className="w-3.5 h-3.5" />}
                              onClick={() => handleOpenEditVacancy(vacancy)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
                              onClick={() => handleDeleteVacancy(vacancy.id)}
                            />
                          </div>
                        </div>

                        {/* Applications progress bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                            <span>Отклики</span>
                            <span>{vacancy.applications} / 50</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((vacancy.applications / 50) * 100, 100)}%` }}
                              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {vacancies.length === 0 && (
                <motion.div variants={itemVariants}>
                  <Card variant="default" className="py-16 text-center">
                    <CardBody>
                      <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-1">Нет вакансий</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Создайте первую вакансию, чтобы начать получать отклики.
                      </p>
                      <Button
                        variant="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={handleOpenCreateVacancy}
                      >
                        Добавить вакансию
                      </Button>
                    </CardBody>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ────────────────────────────────────────────────────────────
              TAB 3: Analytics
             ──────────────────────────────────────────────────────────── */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="space-y-6"
            >
              {/* Stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={Eye}
                  label="Просмотры за месяц"
                  value="1 240"
                  change="+18% за неделю"
                  color="blue"
                />
                <StatCard
                  icon={Users}
                  label="Просмотры профилей"
                  value="890"
                  change="+12% за неделю"
                  color="green"
                />
                <StatCard
                  icon={FileText}
                  label="Получено откликов"
                  value={43}
                  change="+7 за последнюю неделю"
                  color="purple"
                />
                <StatCard
                  icon={Star}
                  label="Средний балл кандидатов"
                  value={82}
                  change="Выше среднего по платформе"
                  color="amber"
                />
              </div>

              {/* Detailed analytics cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Applications by vacancy */}
                <motion.div variants={itemVariants}>
                  <Card variant="default">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-gray-900">Отклики по вакансиям</h3>
                      </div>
                    </CardHeader>
                    <CardBody className="p-5 space-y-4">
                      {initialVacancies.map((vacancy) => (
                        <div key={vacancy.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 font-medium truncate pr-4">{vacancy.title}</span>
                            <span className="text-gray-500 flex-shrink-0">{vacancy.applications}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${(vacancy.applications / 30) * 100}%` }}
                              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                            />
                          </div>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                </motion.div>

                {/* Candidate skill distribution */}
                <motion.div variants={itemVariants}>
                  <Card variant="default">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <h3 className="font-bold text-gray-900">Популярные навыки кандидатов</h3>
                      </div>
                    </CardHeader>
                    <CardBody className="p-5 space-y-3">
                      {[
                        { skill: 'Python', count: 156, pct: 92 },
                        { skill: 'JavaScript', count: 134, pct: 79 },
                        { skill: 'Data Science', count: 98, pct: 58 },
                        { skill: 'Marketing', count: 87, pct: 51 },
                        { skill: 'Design', count: 76, pct: 45 },
                        { skill: 'Finance', count: 65, pct: 38 },
                      ].map((item, i) => (
                        <div key={item.skill} className="flex items-center gap-3">
                          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md w-24 text-center', getSkillColor(item.skill))}>
                            {item.skill}
                          </span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${item.pct}%` }}
                              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.08 }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">{item.count}</span>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                </motion.div>
              </div>

              {/* Monthly trends */}
              <motion.div variants={itemVariants}>
                <Card variant="default">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-gray-900">Динамика за последние 6 месяцев</h3>
                    </div>
                  </CardHeader>
                  <CardBody className="p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        { month: 'Сен', views: 620, apps: 18 },
                        { month: 'Окт', views: 780, apps: 24 },
                        { month: 'Ноя', views: 890, apps: 29 },
                        { month: 'Дек', views: 1020, apps: 35 },
                        { month: 'Янв', views: 1150, apps: 39 },
                        { month: 'Фев', views: 1240, apps: 43 },
                      ].map((item, i) => (
                        <motion.div
                          key={item.month}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                          className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"
                        >
                          <p className="text-xs text-gray-400 font-medium mb-2">{item.month}</p>
                          <p className="text-lg font-bold text-gray-900">{item.views.toLocaleString()}</p>
                          <p className="text-[11px] text-gray-400">просмотров</p>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-sm font-bold text-purple-600">{item.apps}</p>
                            <p className="text-[11px] text-gray-400">откликов</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Vacancy Modal ──────────────────────────────────────────────── */}
      <Modal
        open={showVacancyModal}
        onClose={() => { setShowVacancyModal(false); setEditingVacancy(null) }}
        title={editingVacancy ? 'Редактировать вакансию' : 'Новая вакансия'}
        description={editingVacancy ? 'Измените информацию о вакансии.' : 'Заполните информацию о новой вакансии.'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Название вакансии"
            placeholder="Например: Junior Python Developer"
            value={vacancyForm.title}
            onChange={(e) => setVacancyForm((f) => ({ ...f, title: e.target.value }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Город</label>
              <div className="relative">
                <select
                  value={vacancyForm.city}
                  onChange={(e) => setVacancyForm((f) => ({ ...f, city: e.target.value }))}
                  className={cn(
                    'w-full appearance-none rounded-xl border border-gray-300 bg-white',
                    'px-4 py-2.5 pr-8 text-sm text-gray-700',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                    'transition-colors duration-200',
                  )}
                >
                  {CITIES.filter((c) => c !== 'Все').map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <Input
              label="Зарплата"
              placeholder="Например: 200 000 – 300 000 ₸"
              value={vacancyForm.salary}
              onChange={(e) => setVacancyForm((f) => ({ ...f, salary: e.target.value }))}
            />
          </div>

          <Textarea
            label="Описание"
            placeholder="Опишите обязанности и условия работы..."
            value={vacancyForm.description}
            onChange={(e) => setVacancyForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
          />

          <Textarea
            label="Требования"
            placeholder="Укажите необходимые навыки и требования..."
            value={vacancyForm.requirements}
            onChange={(e) => setVacancyForm((f) => ({ ...f, requirements: e.target.value }))}
            rows={3}
          />
        </div>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => { setShowVacancyModal(false); setEditingVacancy(null) }}
          >
            Отмена
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveVacancy}
            disabled={!vacancyForm.title.trim()}
          >
            {editingVacancy ? 'Сохранить' : 'Опубликовать'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
