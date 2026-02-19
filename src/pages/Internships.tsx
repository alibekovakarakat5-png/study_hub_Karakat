import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Rocket,
  Search,
  MapPin,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Briefcase,
  DollarSign,
  Calendar,
  Send,
  BookmarkCheck,
  MessageSquare,
  Award,
  XCircle,
  Target,
  AlertTriangle,
  CheckCircle2,
  FileText,
  PenLine,
  HelpCircle,
  Lightbulb,
  GraduationCap,
  Star,
  TrendingUp,
  Building2,
  Globe,
  Monitor,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { Internship, InternshipApplication, InternshipApplicationStatus } from '@/types'
import { cn } from '@/lib/utils'

// ── Animation variants ──────────────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariant = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 22, stiffness: 260 },
  },
}

// ── Company color map ────────────────────────────────────────────────────────

const COMPANY_COLORS: Record<string, string> = {
  'Kaspi.kz': '#E42313',
  'Kolesa Group': '#FF6600',
  'Halyk Bank': '#00A859',
  'Freedom Finance': '#1E3A5F',
  'Beeline KZ': '#FFD300',
  'Air Astana': '#004B87',
  'Technodom': '#E30613',
  'EPAM Kazakhstan': '#39A5DC',
  'BTS Digital': '#6C3AE0',
  'DAR': '#FF4444',
  'Chocofamily': '#FF6B9D',
  'Google DSC': '#4285F4',
}

// ── Hardcoded internships ────────────────────────────────────────────────────

const INTERNSHIPS: Internship[] = [
  {
    id: 'int-1',
    title: 'Frontend Intern',
    company: 'Kaspi.kz',
    city: 'Алматы',
    type: 'office',
    duration: '3 месяца',
    isPaid: true,
    salary: '250 000 ₸/мес',
    description: 'Разработка интерфейсов для Kaspi.kz экосистемы',
    requirements: ['React', 'TypeScript', 'HTML/CSS'],
    skills: ['React', 'TypeScript', 'Git', 'Figma'],
    deadline: '2026-03-15',
    applicants: 142,
    matchPercentage: 85,
  },
  {
    id: 'int-2',
    title: 'Data Analyst Intern',
    company: 'Kolesa Group',
    city: 'Алматы',
    type: 'hybrid',
    duration: '4 месяца',
    isPaid: true,
    salary: '200 000 ₸/мес',
    description: 'Анализ данных маркетплейса Kolesa',
    requirements: ['Python', 'SQL', 'Excel'],
    skills: ['Python', 'SQL', 'Tableau', 'Excel'],
    deadline: '2026-03-20',
    applicants: 98,
    matchPercentage: 62,
  },
  {
    id: 'int-3',
    title: 'IT Intern',
    company: 'Halyk Bank',
    city: 'Астана',
    type: 'office',
    duration: '3 месяца',
    isPaid: true,
    salary: '180 000 ₸/мес',
    description: 'Поддержка IT-инфраструктуры и внутренних систем',
    requirements: ['Сети', 'Linux', 'SQL'],
    skills: ['Linux', 'SQL', 'Networking', 'Docker'],
    deadline: '2026-04-01',
    applicants: 76,
    matchPercentage: 48,
  },
  {
    id: 'int-4',
    title: 'Backend Intern',
    company: 'Freedom Finance',
    city: 'Алматы',
    type: 'office',
    duration: '6 месяцев',
    isPaid: true,
    salary: '220 000 ₸/мес',
    description: 'Разработка микросервисов для торговой платформы',
    requirements: ['Java/Kotlin', 'REST API', 'PostgreSQL'],
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'REST API'],
    deadline: '2026-03-25',
    applicants: 113,
    matchPercentage: 55,
  },
  {
    id: 'int-5',
    title: 'UX/UI Design Intern',
    company: 'Beeline KZ',
    city: 'Remote',
    type: 'remote',
    duration: '3 месяца',
    isPaid: false,
    description: 'Проектирование мобильных интерфейсов',
    requirements: ['Figma', 'UX Research', 'Прототипирование'],
    skills: ['Figma', 'UX Research', 'UI Design', 'Prototyping'],
    deadline: '2026-04-10',
    applicants: 87,
    matchPercentage: 35,
  },
  {
    id: 'int-6',
    title: 'Marketing Intern',
    company: 'Air Astana',
    city: 'Астана',
    type: 'office',
    duration: '4 месяца',
    isPaid: true,
    salary: '150 000 ₸/мес',
    description: 'Поддержка маркетинговых кампаний и SMM',
    requirements: ['SMM', 'Копирайтинг', 'Canva'],
    skills: ['SMM', 'Копирайтинг', 'Canva', 'Analytics'],
    deadline: '2026-03-30',
    applicants: 64,
    matchPercentage: 42,
  },
  {
    id: 'int-7',
    title: 'Product Manager Intern',
    company: 'Technodom',
    city: 'Алматы',
    type: 'hybrid',
    duration: '3 месяца',
    isPaid: true,
    salary: '200 000 ₸/мес',
    description: 'Управление продуктом в e-commerce',
    requirements: ['Аналитика', 'Jira', 'A/B тесты'],
    skills: ['Jira', 'Analytics', 'A/B Testing', 'SQL'],
    deadline: '2026-04-05',
    applicants: 53,
    matchPercentage: 58,
  },
  {
    id: 'int-8',
    title: 'QA Intern',
    company: 'EPAM Kazakhstan',
    city: 'Remote',
    type: 'remote',
    duration: '6 месяцев',
    isPaid: true,
    salary: '300 000 ₸/мес',
    description: 'Тестирование ПО для международных проектов',
    requirements: ['Тестирование', 'SQL', 'Agile'],
    skills: ['Manual Testing', 'SQL', 'Postman', 'Agile'],
    deadline: '2026-03-18',
    applicants: 129,
    matchPercentage: 72,
  },
  {
    id: 'int-9',
    title: 'Mobile Developer Intern',
    company: 'BTS Digital',
    city: 'Астана',
    type: 'office',
    duration: '4 месяца',
    isPaid: true,
    salary: '280 000 ₸/мес',
    description: 'Разработка мобильных приложений на Flutter',
    requirements: ['Flutter/Dart', 'Git', 'REST API'],
    skills: ['Flutter', 'Dart', 'Firebase', 'Git'],
    deadline: '2026-04-15',
    applicants: 91,
    matchPercentage: 67,
  },
  {
    id: 'int-10',
    title: 'Full Stack Intern',
    company: 'DAR',
    city: 'Алматы',
    type: 'hybrid',
    duration: '6 месяцев',
    isPaid: true,
    salary: '250 000 ₸/мес',
    description: 'Разработка веб-приложений для финтех-продуктов',
    requirements: ['React', 'Node.js', 'PostgreSQL'],
    skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    deadline: '2026-03-28',
    applicants: 108,
    matchPercentage: 78,
  },
  {
    id: 'int-11',
    title: 'Data Science Intern',
    company: 'Chocofamily',
    city: 'Алматы',
    type: 'office',
    duration: '3 месяца',
    isPaid: true,
    salary: '230 000 ₸/мес',
    description: 'ML-модели для рекомендательной системы',
    requirements: ['Python', 'ML', 'Pandas'],
    skills: ['Python', 'Pandas', 'Scikit-learn', 'SQL'],
    deadline: '2026-04-08',
    applicants: 74,
    matchPercentage: 51,
  },
  {
    id: 'int-12',
    title: 'Open Source Intern',
    company: 'Google DSC',
    city: 'Remote',
    type: 'remote',
    duration: '3 месяца',
    isPaid: false,
    description: 'Вклад в open-source проекты Google',
    requirements: ['Git', 'Любой язык', 'Английский B2+'],
    skills: ['Git', 'Open Source', 'English', 'Programming'],
    deadline: '2026-05-01',
    applicants: 203,
    matchPercentage: 90,
  },
]

// ── Demo applications ────────────────────────────────────────────────────────

interface ApplicationWithDetails extends InternshipApplication {
  company: string
  role: string
  companyColor: string
  timeline: { date: string; event: string }[]
}

const DEMO_APPLICATIONS: ApplicationWithDetails[] = [
  {
    id: 'app-1',
    internshipId: 'int-1',
    status: 'interview',
    appliedAt: '2026-02-05',
    notes: 'Прошёл первый этап. Техническое интервью назначено на 25 февраля.',
    company: 'Kaspi.kz',
    role: 'Frontend Intern',
    companyColor: COMPANY_COLORS['Kaspi.kz'],
    timeline: [
      { date: '05.02.2026', event: 'Отправлен отклик' },
      { date: '10.02.2026', event: 'Просмотрено HR' },
      { date: '14.02.2026', event: 'Приглашение на интервью' },
    ],
  },
  {
    id: 'app-2',
    internshipId: 'int-10',
    status: 'applied',
    appliedAt: '2026-02-12',
    notes: 'Ожидаю ответ. Отправил портфолио с проектами.',
    company: 'DAR',
    role: 'Full Stack Intern',
    companyColor: COMPANY_COLORS['DAR'],
    timeline: [
      { date: '12.02.2026', event: 'Отправлен отклик' },
    ],
  },
  {
    id: 'app-3',
    internshipId: 'int-8',
    status: 'offer',
    appliedAt: '2026-01-20',
    notes: 'Получил оффер! Зарплата 300K тенге. Нужно ответить до 1 марта.',
    company: 'EPAM Kazakhstan',
    role: 'QA Intern',
    companyColor: COMPANY_COLORS['EPAM Kazakhstan'],
    timeline: [
      { date: '20.01.2026', event: 'Отправлен отклик' },
      { date: '25.01.2026', event: 'Тестовое задание' },
      { date: '02.02.2026', event: 'Техническое интервью' },
      { date: '10.02.2026', event: 'Финальное интервью' },
      { date: '15.02.2026', event: 'Оффер!' },
    ],
  },
  {
    id: 'app-4',
    internshipId: 'int-5',
    status: 'rejected',
    appliedAt: '2026-01-15',
    notes: 'Отказ — не хватило опыта в UX Research.',
    company: 'Beeline KZ',
    role: 'UX/UI Design Intern',
    companyColor: COMPANY_COLORS['Beeline KZ'],
    timeline: [
      { date: '15.01.2026', event: 'Отправлен отклик' },
      { date: '22.01.2026', event: 'Просмотрено HR' },
      { date: '28.01.2026', event: 'Отказ' },
    ],
  },
]

// ── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<InternshipApplicationStatus, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: typeof Send
}> = {
  saved: {
    label: 'Сохранено',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: BookmarkCheck,
  },
  applied: {
    label: 'Отправлено',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Send,
  },
  interview: {
    label: 'Интервью',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: MessageSquare,
  },
  offer: {
    label: 'Оффер',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: Award,
  },
  rejected: {
    label: 'Отказ',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: XCircle,
  },
}

// ── FAQ data ─────────────────────────────────────────────────────────────────

const INTERVIEW_FAQ = [
  {
    question: 'Расскажите о себе',
    answer: 'Начните с образования, затем расскажите о навыках и проектах. Упомяните, почему вас интересует эта стажировка. Будьте кратки — 1-2 минуты. Пример: "Я студент 3 курса КБТУ, изучаю Computer Science. Увлекаюсь фронтенд-разработкой, создал несколько проектов на React. Хочу применить знания на практике в вашей компании."',
    tips: ['Подготовьте короткую версию (30 сек) и полную (2 мин)', 'Не рассказывайте всю биографию — фокус на релевантном опыте'],
  },
  {
    question: 'Почему вы хотите работать именно у нас?',
    answer: 'Изучите компанию заранее. Упомяните конкретные продукты, технологии или ценности. Покажите, что вы не отправляете одинаковый отклик всем. Пример: "Kaspi.kz — лидер финтеха в Казахстане. Меня впечатляет ваш подход к UX и скорость внедрения фич. Я хочу учиться у лучших и расти вместе с командой."',
    tips: ['Изучите продукты компании перед интервью', 'Упомяните конкретные факты, а не общие фразы'],
  },
  {
    question: 'Какие ваши сильные и слабые стороны?',
    answer: 'Сильные стороны привяжите к требованиям вакансии. Слабые стороны формулируйте как зоны роста, покажите, что работаете над ними. Пример: "Моя сильная сторона — быстро осваиваю новые технологии, за месяц выучил React. Зона роста — публичные выступления, поэтому записался на курс ораторского мастерства."',
    tips: ['Не говорите "перфекционизм" — это клише', 'Покажите реальный прогресс в слабых сторонах'],
  },
  {
    question: 'Расскажите о проекте, которым гордитесь',
    answer: 'Используйте формулу STAR: Situation, Task, Action, Result. Опишите проблему, вашу роль, что конкретно сделали и каков результат. Даже учебный проект подойдёт. Пример: "В рамках хакатона создал приложение для трекинга привычек. Я отвечал за фронтенд на React. За 48 часов реализовал 5 экранов. Наша команда заняла 2 место."',
    tips: ['Подготовьте 2-3 проекта для разных ситуаций', 'Называйте конкретные цифры и результаты'],
  },
  {
    question: 'Как вы справляетесь с трудностями и дедлайнами?',
    answer: 'Приведите конкретный пример из учёбы или проектов. Покажите системный подход. Пример: "Когда на хакатоне сломался API за 4 часа до дедлайна, я быстро создал mock-данные и сфокусировался на демо-части. Это научило меня приоритизировать задачи и не паниковать."',
    tips: ['Покажите, что вы проактивны, а не ждёте помощи', 'Используйте конкретные примеры, а не абстрактные ответы'],
  },
  {
    question: 'Какие у вас ожидания от стажировки?',
    answer: 'Покажите, что хотите учиться и приносить пользу. Будьте реалистичны. Пример: "Хочу получить опыт работы в команде, освоить production-процессы — код-ревью, CI/CD, Agile. Надеюсь, что по итогам стажировки смогу внести реальный вклад в продукт."',
    tips: ['Не фокусируйтесь только на зарплате', 'Покажите, что вы инвестируете в долгосрочный рост'],
  },
]

// ── Skill gap data ──────────────────────────────────────────────────────────

const USER_SKILLS = ['React', 'TypeScript', 'Git', 'HTML/CSS', 'JavaScript', 'Python']
const REQUIRED_SKILLS = ['React', 'TypeScript', 'Git', 'Node.js', 'SQL', 'Docker', 'Python', 'Figma', 'Agile', 'REST API']
const SKILL_COURSES: Record<string, string> = {
  'Node.js': 'Node.js для начинающих — Stepik',
  'SQL': 'Интерактивный тренажёр SQL — Stepik',
  'Docker': 'Docker: от нуля до продакшена — YouTube',
  'Figma': 'Figma для разработчиков — Udemy',
  'Agile': 'Agile и Scrum на практике — Coursera',
  'REST API': 'REST API Design — freeCodeCamp',
}

// ── Helper: days until deadline ──────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// ── Type badge icons ─────────────────────────────────────────────────────────

function getTypeIcon(type: Internship['type']) {
  switch (type) {
    case 'remote': return Globe
    case 'office': return Building2
    case 'hybrid': return Monitor
  }
}

function getTypeLabel(type: Internship['type']) {
  switch (type) {
    case 'remote': return 'Удалённо'
    case 'office': return 'Офис'
    case 'hybrid': return 'Гибрид'
  }
}

// ── Resume checklist ─────────────────────────────────────────────────────────

const RESUME_CHECKLIST = [
  { text: 'Контактная информация (телефон, email, город)', checked: true },
  { text: 'Фото (профессиональное, на светлом фоне)', checked: false },
  { text: 'Краткое описание (2-3 предложения о себе)', checked: true },
  { text: 'Образование (университет, специальность, GPA)', checked: true },
  { text: 'Навыки (технические и soft skills)', checked: true },
  { text: 'Проекты (с описанием и ссылками)', checked: false },
  { text: 'Опыт (стажировки, волонтёрство, фриланс)', checked: false },
  { text: 'Языки (казахский, русский, английский — уровни)', checked: true },
  { text: 'Сертификаты и курсы', checked: false },
  { text: 'Формат PDF, не более 1 страницы', checked: true },
]

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function Internships() {
  const { user } = useStore()

  // Tab state
  const [activeTab, setActiveTab] = useState<'catalog' | 'applications' | 'preparation'>('catalog')

  // Catalog filters
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [paidFilter, setPaidFilter] = useState<'all' | 'paid' | 'unpaid'>('all')

  // Applications state
  const [expandedApp, setExpandedApp] = useState<string | null>(null)

  // Preparation state
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  // ── Filter logic ────────────────────────────────────────────────────────

  const filteredInternships = INTERNSHIPS.filter((intern) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        intern.title.toLowerCase().includes(q) ||
        intern.company.toLowerCase().includes(q) ||
        intern.skills.some((s) => s.toLowerCase().includes(q))
      if (!matchesSearch) return false
    }
    if (cityFilter !== 'all' && intern.city !== cityFilter) return false
    if (typeFilter !== 'all' && intern.type !== typeFilter) return false
    if (paidFilter === 'paid' && !intern.isPaid) return false
    if (paidFilter === 'unpaid' && intern.isPaid) return false
    return true
  })

  // ── Application stats ──────────────────────────────────────────────────

  const totalApps = DEMO_APPLICATIONS.length
  const interviewCount = DEMO_APPLICATIONS.filter((a) => a.status === 'interview').length
  const offerCount = DEMO_APPLICATIONS.filter((a) => a.status === 'offer').length
  const responseRate = Math.round(
    (DEMO_APPLICATIONS.filter((a) => a.status !== 'applied' && a.status !== 'saved').length / totalApps) * 100
  )

  // ── Kanban columns ────────────────────────────────────────────────────

  const kanbanColumns: { status: InternshipApplicationStatus; label: string; headerColor: string }[] = [
    { status: 'saved', label: 'Сохранено', headerColor: 'bg-gray-500' },
    { status: 'applied', label: 'Отправлено', headerColor: 'bg-blue-500' },
    { status: 'interview', label: 'Интервью', headerColor: 'bg-amber-500' },
    { status: 'offer', label: 'Оффер', headerColor: 'bg-green-500' },
    { status: 'rejected', label: 'Отказ', headerColor: 'bg-red-500' },
  ]

  // ── Tab config ─────────────────────────────────────────────────────────

  const tabs = [
    { id: 'catalog' as const, label: 'Каталог стажировок', icon: Briefcase },
    { id: 'applications' as const, label: 'Мои отклики', icon: Send },
    { id: 'preparation' as const, label: 'Подготовка', icon: GraduationCap },
  ]

  // ── Match color helper ─────────────────────────────────────────────────

  function getMatchColor(pct: number) {
    if (pct >= 70) return 'bg-green-500'
    if (pct >= 40) return 'bg-amber-500'
    return 'bg-red-500'
  }

  function getMatchTextColor(pct: number) {
    if (pct >= 70) return 'text-green-600'
    if (pct >= 40) return 'text-amber-600'
    return 'text-red-600'
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div {...fadeInUp} className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Стажировки</h1>
              <p className="text-white/80 text-sm mt-0.5">Первый шаг в карьеру</p>
            </div>
          </motion.div>
          {user && (
            <p className="text-white/70 text-sm mt-2">
              {user.name}, здесь ты найдёшь стажировки от лучших компаний Казахстана
            </p>
          )}
        </div>
      </div>

      {/* ── Tab pills ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 -mt-5">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-1.5 inline-flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 1: CATALOG                                                */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'catalog' && (
            <motion.div
              key="catalog"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Filter bar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Поиск по компании, должности или навыку..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-colors"
                    />
                  </div>

                  {/* City filter */}
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                  >
                    <option value="all">Все города</option>
                    <option value="Алматы">Алматы</option>
                    <option value="Астана">Астана</option>
                    <option value="Remote">Remote</option>
                  </select>

                  {/* Type filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                  >
                    <option value="all">Все форматы</option>
                    <option value="office">Офис</option>
                    <option value="remote">Удалённо</option>
                    <option value="hybrid">Гибрид</option>
                  </select>

                  {/* Paid toggle */}
                  <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                    {(['all', 'paid', 'unpaid'] as const).map((val) => (
                      <button
                        key={val}
                        onClick={() => setPaidFilter(val)}
                        className={cn(
                          'px-3 py-2.5 text-sm font-medium transition-colors',
                          paidFilter === val
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        )}
                      >
                        {val === 'all' ? 'Все' : val === 'paid' ? 'Оплач.' : 'Неоплач.'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  Найдено: {filteredInternships.length} стажировок
                </div>
              </div>

              {/* Internship grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {filteredInternships.map((intern) => {
                  const companyColor = COMPANY_COLORS[intern.company] || '#6366f1'
                  const TypeIcon = getTypeIcon(intern.type)
                  const remaining = daysUntil(intern.deadline)

                  return (
                    <motion.div
                      key={intern.id}
                      variants={cardVariant}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
                    >
                      {/* Accent top bar */}
                      <div className="h-1.5" style={{ backgroundColor: companyColor }} />

                      <div className="p-5">
                        {/* Company row */}
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ backgroundColor: companyColor }}
                          >
                            {intern.company.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                              {intern.title}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">{intern.company}</p>
                          </div>
                        </div>

                        {/* Location + type + duration */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {intern.city}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">
                            <TypeIcon className="w-3 h-3" />
                            {getTypeLabel(intern.type)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {intern.duration}
                          </span>
                        </div>

                        {/* Paid badge */}
                        <div className="mb-3">
                          {intern.isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium ring-1 ring-inset ring-green-600/20">
                              <DollarSign className="w-3 h-3" />
                              {intern.salary}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-medium ring-1 ring-inset ring-gray-500/20">
                              Неоплачиваемая
                            </span>
                          )}
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {intern.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Match percentage */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Совпадение</span>
                            <span className={cn('text-xs font-semibold', getMatchTextColor(intern.matchPercentage))}>
                              {intern.matchPercentage}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all duration-700', getMatchColor(intern.matchPercentage))}
                              style={{ width: `${intern.matchPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Deadline + applicants */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {remaining > 0 ? (
                              <span>
                                {remaining} {remaining === 1 ? 'день' : remaining < 5 ? 'дня' : 'дней'}
                              </span>
                            ) : (
                              <span className="text-red-500">Дедлайн прошёл</span>
                            )}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {intern.applicants} откликов
                          </span>
                        </div>

                        {/* Apply button */}
                        <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-medium hover:from-orange-600 hover:to-rose-600 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]">
                          Откликнуться
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>

              {filteredInternships.length === 0 && (
                <div className="text-center py-16">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600">Стажировки не найдены</h3>
                  <p className="text-sm text-gray-400 mt-1">Попробуйте изменить фильтры</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: MY APPLICATIONS                                        */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'applications' && (
            <motion.div
              key="applications"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Всего откликов', value: totalApps, icon: Send, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Процент ответов', value: `${responseRate}%`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
                  { label: 'Интервью', value: interviewCount, icon: MessageSquare, color: 'text-amber-600 bg-amber-50' },
                  { label: 'Офферы', value: offerCount, icon: Star, color: 'text-purple-600 bg-purple-50' },
                ].map((stat) => {
                  const StatIcon = stat.icon
                  return (
                    <motion.div
                      key={stat.label}
                      {...fadeInUp}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.color)}>
                          <StatIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Kanban board */}
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-[900px]">
                  {kanbanColumns.map((col) => {
                    const colApps = DEMO_APPLICATIONS.filter((a) => a.status === col.status)
                    return (
                      <div key={col.status} className="flex-1 min-w-[200px]">
                        {/* Column header */}
                        <div className={cn('rounded-t-xl px-4 py-2.5 text-white text-sm font-semibold flex items-center justify-between', col.headerColor)}>
                          <span>{col.label}</span>
                          <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
                            {colApps.length}
                          </span>
                        </div>

                        {/* Column body */}
                        <div className="bg-gray-50 rounded-b-xl p-3 min-h-[300px] space-y-3 border border-t-0 border-gray-200">
                          {colApps.map((app) => {
                            const config = STATUS_CONFIG[app.status]
                            const isExpanded = expandedApp === app.id

                            return (
                              <motion.div
                                key={app.id}
                                layout
                                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                              >
                                <div className="p-3">
                                  {/* Company logo circle */}
                                  <div className="flex items-center gap-2.5 mb-2">
                                    <div
                                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                                      style={{ backgroundColor: app.companyColor }}
                                    >
                                      {app.company.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{app.role}</p>
                                      <p className="text-xs text-gray-500 truncate">{app.company}</p>
                                    </div>
                                  </div>

                                  {/* Status badge */}
                                  <div className="flex items-center justify-between">
                                    <span className={cn(
                                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                                      config.bgColor, config.color
                                    )}>
                                      <config.icon className="w-3 h-3" />
                                      {config.label}
                                    </span>
                                    <span className="text-xs text-gray-400">{app.appliedAt}</span>
                                  </div>

                                  {/* Expand indicator */}
                                  <div className="flex justify-center mt-2">
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-gray-300" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-300" />
                                    )}
                                  </div>
                                </div>

                                {/* Expanded content */}
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-3 pb-3 border-t border-gray-100 pt-3">
                                        {/* Notes */}
                                        {app.notes && (
                                          <div className="mb-3">
                                            <p className="text-xs font-medium text-gray-600 mb-1">Заметки:</p>
                                            <p className="text-xs text-gray-500 leading-relaxed">{app.notes}</p>
                                          </div>
                                        )}

                                        {/* Timeline */}
                                        <p className="text-xs font-medium text-gray-600 mb-2">Хронология:</p>
                                        <div className="space-y-2">
                                          {app.timeline.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-2">
                                              <div className="mt-1 w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                                              <div>
                                                <p className="text-xs text-gray-400">{item.date}</p>
                                                <p className="text-xs text-gray-700">{item.event}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            )
                          })}

                          {colApps.length === 0 && (
                            <div className="text-center py-8 text-gray-300">
                              <p className="text-xs">Пусто</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 3: PREPARATION                                            */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'preparation' && (
            <motion.div
              key="preparation"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* ── Section 1: Skill Gap Analysis ──────────────────────── */}
              <motion.section {...fadeInUp}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Навыки для стажировки</h2>
                      <p className="text-sm text-gray-500">Анализ навыков: что есть и чего не хватает</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Your skills */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Ваши навыки
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {USER_SKILLS.map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium ring-1 ring-inset ring-green-600/20"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Required skills */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Требуемые навыки
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {REQUIRED_SKILLS.map((skill) => {
                            const hasSkill = USER_SKILLS.includes(skill)
                            return (
                              <span
                                key={skill}
                                className={cn(
                                  'px-3 py-1.5 rounded-lg text-sm font-medium ring-1 ring-inset',
                                  hasSkill
                                    ? 'bg-green-50 text-green-700 ring-green-600/20'
                                    : 'bg-red-50 text-red-700 ring-red-600/20'
                                )}
                              >
                                {skill}
                                {!hasSkill && ' (не хватает)'}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Missing skills with recommendations */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Рекомендованные курсы для прокачки
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(SKILL_COURSES).map(([skill, course]) => (
                          <div
                            key={skill}
                            className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100"
                          >
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                                {skill}
                              </span>
                              <span className="text-sm text-gray-700">{course}</span>
                            </div>
                            <button className="text-xs text-orange-600 font-medium hover:text-orange-700">
                              Начать
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* ── Section 2: Resume Checklist ────────────────────────── */}
              <motion.section {...fadeInUp}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Идеальное резюме стажёра</h2>
                      <p className="text-sm text-gray-500">Чеклист, советы и шаблон для KZ рынка</p>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Checklist */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Обязательные элементы резюме:</h3>
                      <div className="space-y-2">
                        {RESUME_CHECKLIST.map((item, idx) => (
                          <label
                            key={idx}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors',
                              item.checked
                                ? 'bg-green-50/50 border-green-200'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            )}
                          >
                            <div className={cn(
                              'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0',
                              item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'
                            )}>
                              {item.checked && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              )}
                            </div>
                            <span className={cn(
                              'text-sm',
                              item.checked ? 'text-gray-700' : 'text-gray-500'
                            )}>
                              {item.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* KZ Market Tips */}
                    <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Советы для KZ рынка
                      </h3>
                      <ul className="space-y-1.5 text-sm text-blue-700">
                        <li>- Указывайте знание казахского языка — это преимущество</li>
                        <li>- Для Kaspi, Kolesa, BTS — технические проекты на GitHub обязательны</li>
                        <li>- Для банков (Halyk, Freedom) — упомяните финтех-интерес</li>
                        <li>- LinkedIn профиль на английском повышает шансы в EPAM, Google DSC</li>
                        <li>- Участие в хакатонах ценится больше, чем средний балл</li>
                      </ul>
                    </div>

                    {/* Template structure */}
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3">Шаблон структуры резюме:</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">1</span>
                          <span>Имя, контакты, город, ссылки (GitHub, LinkedIn)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                          <span>Краткое описание (2-3 предложения: кто вы и что ищете)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                          <span>Образование (университет, специальность, год, GPA)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">4</span>
                          <span>Проекты (2-3 проекта с описанием и технологиями)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">5</span>
                          <span>Навыки (технические и языки программирования)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">6</span>
                          <span>Языки (казахский, русский, английский — с уровнями)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* ── Section 3: Cover Letter ────────────────────────────── */}
              <motion.section {...fadeInUp}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                      <PenLine className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Сопроводительное письмо</h2>
                      <p className="text-sm text-gray-500">Шаблон и примеры для стажировок</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Template */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Шаблон:</h3>
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 font-mono text-sm text-gray-600 leading-relaxed whitespace-pre-line">
{`Здравствуйте, [Имя HR / Команда]!

Меня зовут [Ваше имя], я [курс] курса [университет], специальность [специальность].

Пишу вам, потому что [почему вас заинтересовала именно эта компания — 1-2 предложения].

В рамках учёбы и самостоятельных проектов я [описание опыта и навыков — 2-3 предложения]. Например, [конкретный проект или достижение].

Я хочу пройти стажировку в [компания], чтобы [чему хотите научиться и какой вклад можете внести].

Буду рад(а) обсудить мою кандидатуру на интервью.

С уважением,
[Имя]
[Телефон] | [Email] | [GitHub/LinkedIn]`}
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                      <h3 className="text-sm font-semibold text-rose-800 mb-2">Советы:</h3>
                      <ul className="space-y-1 text-sm text-rose-700">
                        <li>- Не копируйте один текст для всех — адаптируйте под каждую компанию</li>
                        <li>- Письмо должно быть не длиннее 200 слов</li>
                        <li>- Покажите, что изучили компанию (продукты, ценности, технологии)</li>
                        <li>- Приложите ссылки на проекты и GitHub</li>
                        <li>- Пишите на русском, если вакансия на русском</li>
                      </ul>
                    </div>

                    {/* Example 1: Tech */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">Tech</span>
                        Пример: стажировка в IT-компании
                      </h3>
                      <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
{`Здравствуйте, команда Kaspi.kz!

Меня зовут Алия Нурланова, я студентка 3 курса КБТУ, специальность "Информационные системы".

Я слежу за развитием Kaspi Super App и впечатлена тем, как вы объединяете финансы, маркетплейс и доставку в одном приложении.

За время учёбы я освоила React, TypeScript и работу с REST API. Мой последний проект — веб-приложение для трекинга финансов, которое я разработала с нуля за 2 недели (github.com/aliya/fintrack). Также я участвовала в хакатоне HackNU, где наша команда заняла 3 место.

Хочу пройти стажировку в Kaspi, чтобы поработать с production-кодом, изучить best practices крупных проектов и внести вклад в продукт, которым пользуются миллионы.

С уважением,
Алия Нурланова
+7 707 123 4567 | aliya@email.com | github.com/aliya`}
                      </div>
                    </div>

                    {/* Example 2: Business */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">Business</span>
                        Пример: стажировка в маркетинге
                      </h3>
                      <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
{`Здравствуйте, HR-команда Air Astana!

Меня зовут Дамир Сейтказин, я студент 2 курса Назарбаев Университета, направление "Маркетинг и коммуникации".

Air Astana — бренд, которым гордится весь Казахстан. Меня вдохновляет ваш подход к маркетингу: от рекламных кампаний до партнёрств с международными брендами.

Я веду студенческий медиа-аккаунт в Instagram (5K подписчиков), организовывал SMM для университетских мероприятий и прошёл курс Google Digital Marketing. Владею Canva, основами таргетированной рекламы и аналитикой в Meta Business Suite.

Хочу применить свои навыки в вашей маркетинговой команде, научиться работать с крупным брендом и помочь с digital-кампаниями.

С уважением,
Дамир Сейтказин
+7 701 987 6543 | damir@email.com | linkedin.com/in/damir`}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* ── Section 4: Interview FAQ ───────────────────────────── */}
              <motion.section {...fadeInUp}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Частые вопросы на интервью для стажёров</h2>
                      <p className="text-sm text-gray-500">6 вопросов с разбором и советами</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    {INTERVIEW_FAQ.map((faq, idx) => {
                      const isOpen = expandedFaq === faq.question

                      return (
                        <div
                          key={idx}
                          className={cn(
                            'rounded-xl border transition-colors',
                            isOpen ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                          )}
                        >
                          <button
                            onClick={() => setExpandedFaq(isOpen ? null : faq.question)}
                            className="w-full flex items-center justify-between p-4 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 text-sm font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-sm font-medium text-gray-800">{faq.question}</span>
                            </div>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                            )}
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 space-y-3">
                                  {/* Answer */}
                                  <div className="p-3 rounded-lg bg-white border border-gray-100">
                                    <p className="text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
                                  </div>

                                  {/* Tips */}
                                  <div>
                                    <p className="text-xs font-semibold text-orange-600 mb-1.5 flex items-center gap-1">
                                      <Lightbulb className="w-3.5 h-3.5" />
                                      Советы:
                                    </p>
                                    <ul className="space-y-1">
                                      {faq.tips.map((tip, tipIdx) => (
                                        <li key={tipIdx} className="flex items-start gap-2 text-xs text-gray-600">
                                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                                          {tip}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
