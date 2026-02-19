import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  Trophy,
  DollarSign,
  Sparkles,
  ClipboardList,
  Calendar,
  CheckCircle2,
  Circle,
  FileText,
  PenTool,
  Users,
  FolderOpen,
  Lightbulb,
  BookOpen,
  ExternalLink,
  Filter,
  Globe,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InternationalUniversity, ApplicationChecklist, ChecklistItem } from '@/types'

// ── Animation helpers ────────────────────────────────────────────────────────

const fadeIn = {
  initial: { opacity: 0, y: 16 } as const,
  animate: { opacity: 1, y: 0 } as const,
  exit: { opacity: 0, y: -8 } as const,
  transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.04 } },
}

// ── Types ────────────────────────────────────────────────────────────────────

type TabId = 'selector' | 'applications' | 'deadlines'
type CountryFilter = 'all' | 'kz' | 'usa' | 'uk' | 'europe' | 'asia'
type ProgramFilter = 'all' | 'cs' | 'engineering' | 'business' | 'medicine' | 'law' | 'science'
type BudgetFilter = 'all' | 'free' | 'low' | 'medium' | 'high'
type KanbanStatus = 'not-started' | 'in-progress' | 'submitted' | 'accepted' | 'rejected'

interface Deadline {
  id: string
  universityName: string
  what: string
  date: string
  flag: string
}

// ── Static data ──────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: 'selector', label: 'Подбор вуза' },
  { id: 'applications', label: 'Мои заявки' },
  { id: 'deadlines', label: 'Дедлайны' },
]

const COUNTRY_FILTERS: { value: CountryFilter; label: string }[] = [
  { value: 'all', label: 'Все страны' },
  { value: 'kz', label: 'Казахстан' },
  { value: 'usa', label: 'США' },
  { value: 'uk', label: 'Великобритания' },
  { value: 'europe', label: 'Европа' },
  { value: 'asia', label: 'Азия' },
]

const PROGRAM_FILTERS: { value: ProgramFilter; label: string }[] = [
  { value: 'all', label: 'Все программы' },
  { value: 'cs', label: 'IT / CS' },
  { value: 'engineering', label: 'Инженерия' },
  { value: 'business', label: 'Бизнес' },
  { value: 'medicine', label: 'Медицина' },
  { value: 'law', label: 'Право' },
  { value: 'science', label: 'Наука' },
]

const BUDGET_FILTERS: { value: BudgetFilter; label: string }[] = [
  { value: 'all', label: 'Любой бюджет' },
  { value: 'free', label: 'Бесплатно / Грант' },
  { value: 'low', label: 'До $10 000' },
  { value: 'medium', label: '$10 000 — $30 000' },
  { value: 'high', label: 'Свыше $30 000' },
]

const COUNTRY_MAP: Record<string, CountryFilter> = {
  'Казахстан': 'kz',
  'США': 'usa',
  'Великобритания': 'uk',
  'Швейцария': 'europe',
  'Германия': 'europe',
  'Сингапур': 'asia',
  'Южная Корея': 'asia',
}

function budgetCategory(tuition: string): BudgetFilter {
  if (tuition.includes('Грант') || tuition.includes('Бесплатно') || tuition.includes('0')) return 'free'
  const numMatch = tuition.match(/[\d\s]+/g)
  if (!numMatch) return 'low'
  const num = parseInt(numMatch.join('').replace(/\s/g, ''), 10)
  if (num <= 10000) return 'low'
  if (num <= 30000) return 'medium'
  return 'high'
}

function programMatches(programs: string[], filter: ProgramFilter): boolean {
  if (filter === 'all') return true
  const lower = programs.map(p => p.toLowerCase())
  const mapping: Record<ProgramFilter, string[]> = {
    all: [],
    cs: ['computer', 'информатик', 'software', 'data', 'it', 'информацион', 'вычислит'],
    engineering: ['engineer', 'инженер', 'нефтегаз', 'архитектур', 'petroleum', 'mechanical', 'electrical'],
    business: ['business', 'бизнес', 'финанс', 'экономик', 'менеджмент', 'маркетинг', 'finance', 'management', 'marketing', 'accounting', 'учёт'],
    medicine: ['медицин', 'medicine', 'биомед', 'biomed', 'pharma', 'фармац'],
    law: ['право', 'law', 'юрис', 'legal'],
    science: ['physics', 'физик', 'химия', 'chemistry', 'biology', 'биолог', 'math', 'математик', 'science', 'наук'],
  }
  return lower.some(prog => mapping[filter].some(kw => prog.includes(kw)))
}

const UNIVERSITIES: InternationalUniversity[] = [
  {
    id: 'nu',
    name: 'Назарбаев Университет',
    country: 'Казахстан',
    city: 'Астана',
    ranking: 1,
    acceptanceRate: 15,
    tuition: 'Грант (полное покрытие)',
    scholarships: true,
    deadlines: [{ type: 'Early', date: '2026-11-01' }, { type: 'Regular', date: '2027-03-01' }],
    requirements: ['IELTS 6.5+', 'SAT 1200+', 'Аттестат с отличием', 'Мотивационное письмо', '2 рекомендации'],
    programs: ['Computer Science', 'Engineering', 'Business Administration', 'Mathematics', 'Biology'],
  },
  {
    id: 'kaznu',
    name: 'КазНУ им. аль-Фараби',
    country: 'Казахстан',
    city: 'Алматы',
    ranking: 150,
    acceptanceRate: 35,
    tuition: 'Грант или ~800 000 ₸/год',
    scholarships: true,
    deadlines: [{ type: 'ЕНТ', date: '2026-06-20' }, { type: 'Документы', date: '2026-07-15' }],
    requirements: ['ЕНТ 70+', 'Аттестат', 'Медицинская справка', 'Фото 3x4'],
    programs: ['Информационные системы', 'Медицина', 'Юриспруденция', 'Экономика', 'Физика'],
  },
  {
    id: 'kbtu',
    name: 'КБТУ',
    country: 'Казахстан',
    city: 'Алматы',
    ranking: 3,
    acceptanceRate: 25,
    tuition: '~2 200 000 ₸/год (гранты доступны)',
    scholarships: true,
    deadlines: [{ type: 'Regular', date: '2026-07-01' }],
    requirements: ['IELTS 5.5+', 'ЕНТ / Внутренний экзамен', 'Аттестат', 'Мотивационное письмо'],
    programs: ['Software Engineering', 'Data Science', 'Petroleum Engineering', 'Finance'],
  },
  {
    id: 'kimep',
    name: 'KIMEP University',
    country: 'Казахстан',
    city: 'Алматы',
    ranking: 5,
    acceptanceRate: 30,
    tuition: '~2 800 000 ₸/год',
    scholarships: true,
    deadlines: [{ type: 'Regular', date: '2026-07-15' }],
    requirements: ['IELTS 5.5+', 'Внутренний тест / SAT', 'Аттестат', 'Эссе'],
    programs: ['Финансы и учёт', 'Право', 'Маркетинг', 'Менеджмент'],
  },
  {
    id: 'sdu',
    name: 'SDU University',
    country: 'Казахстан',
    city: 'Алматы',
    ranking: 7,
    acceptanceRate: 28,
    tuition: '~1 600 000 ₸/год',
    scholarships: true,
    deadlines: [{ type: 'Regular', date: '2026-07-10' }],
    requirements: ['ЕНТ / Внутренний экзамен', 'Аттестат', 'IELTS 5.0+'],
    programs: ['Information Systems', 'Business Analytics', 'Law', 'Education'],
  },
  {
    id: 'mit',
    name: 'MIT',
    country: 'США',
    city: 'Кембридж, MA',
    ranking: 1,
    acceptanceRate: 4,
    tuition: '$57 590/год',
    scholarships: true,
    deadlines: [{ type: 'Early Action', date: '2026-11-01' }, { type: 'Regular', date: '2027-01-05' }],
    requirements: ['SAT 1550+ / ACT 35+', 'TOEFL 100+', 'GPA 3.9+', '2 рекомендации', 'Эссе', 'Интервью'],
    programs: ['Computer Science', 'Electrical Engineering', 'Mathematics', 'Physics', 'Mechanical Engineering'],
  },
  {
    id: 'stanford',
    name: 'Stanford University',
    country: 'США',
    city: 'Стэнфорд, CA',
    ranking: 2,
    acceptanceRate: 4,
    tuition: '$56 169/год',
    scholarships: true,
    deadlines: [{ type: 'REA', date: '2026-11-01' }, { type: 'Regular', date: '2027-01-05' }],
    requirements: ['SAT 1520+ / ACT 34+', 'TOEFL 100+', 'GPA 3.9+', 'Эссе', '2 рекомендации'],
    programs: ['Computer Science', 'Engineering', 'Business', 'Artificial Intelligence', 'Биомедицина'],
  },
  {
    id: 'harvard',
    name: 'Harvard University',
    country: 'США',
    city: 'Кембридж, MA',
    ranking: 3,
    acceptanceRate: 3,
    tuition: '$54 768/год',
    scholarships: true,
    deadlines: [{ type: 'REA', date: '2026-11-01' }, { type: 'Regular', date: '2027-01-01' }],
    requirements: ['SAT 1540+ / ACT 34+', 'TOEFL 100+', 'GPA 3.9+', 'Эссе', '2 рекомендации', 'Интервью'],
    programs: ['Computer Science', 'Economics', 'Law', 'Medicine', 'Political Science'],
  },
  {
    id: 'oxford',
    name: 'University of Oxford',
    country: 'Великобритания',
    city: 'Оксфорд',
    ranking: 1,
    acceptanceRate: 15,
    tuition: '£37 510/год',
    scholarships: true,
    deadlines: [{ type: 'UCAS', date: '2026-10-15' }],
    requirements: ['IELTS 7.0+', 'A-levels AAA+ / IB 39+', 'Personal Statement', 'Интервью', 'Вступительный тест'],
    programs: ['Computer Science', 'PPE', 'Mathematics', 'Law', 'Medicine'],
  },
  {
    id: 'cambridge',
    name: 'University of Cambridge',
    country: 'Великобритания',
    city: 'Кембридж',
    ranking: 2,
    acceptanceRate: 18,
    tuition: '£35 517/год',
    scholarships: true,
    deadlines: [{ type: 'UCAS', date: '2026-10-15' }],
    requirements: ['IELTS 7.0+', 'A-levels A*AA+ / IB 40+', 'Personal Statement', 'Интервью', 'Вступительный экзамен'],
    programs: ['Computer Science', 'Engineering', 'Natural Sciences', 'Mathematics', 'Economics'],
  },
  {
    id: 'ucl',
    name: 'UCL (University College London)',
    country: 'Великобритания',
    city: 'Лондон',
    ranking: 8,
    acceptanceRate: 25,
    tuition: '£28 500/год',
    scholarships: true,
    deadlines: [{ type: 'UCAS', date: '2027-01-31' }],
    requirements: ['IELTS 6.5+', 'A-levels AAB+ / IB 36+', 'Personal Statement', '1 рекомендация'],
    programs: ['Computer Science', 'Architecture', 'Economics', 'Law', 'Medicine'],
  },
  {
    id: 'eth',
    name: 'ETH Zurich',
    country: 'Швейцария',
    city: 'Цюрих',
    ranking: 7,
    acceptanceRate: 27,
    tuition: 'CHF 1 460/год',
    scholarships: true,
    deadlines: [{ type: 'Regular', date: '2026-12-15' }],
    requirements: ['Вступительный экзамен', 'Аттестат (высокий GPA)', 'Знание немецкого/английского', 'Мотивационное письмо'],
    programs: ['Computer Science', 'Electrical Engineering', 'Physics', 'Mathematics', 'Architecture'],
  },
  {
    id: 'tum',
    name: 'TU Munich',
    country: 'Германия',
    city: 'Мюнхен',
    ranking: 37,
    acceptanceRate: 22,
    tuition: '€0 (бесплатное обучение)',
    scholarships: true,
    deadlines: [{ type: 'Winter', date: '2026-07-15' }, { type: 'Summer', date: '2027-01-15' }],
    requirements: ['TestAS / Uni-Assist', 'Аттестат', 'Знание немецкого B2+ / английского C1', 'Мотивационное письмо'],
    programs: ['Informatics', 'Mechanical Engineering', 'Electrical Engineering', 'Management & Technology'],
  },
  {
    id: 'nus',
    name: 'NUS (National University of Singapore)',
    country: 'Сингапур',
    city: 'Сингапур',
    ranking: 8,
    acceptanceRate: 10,
    tuition: 'SGD 17 550/год',
    scholarships: true,
    deadlines: [{ type: 'Regular', date: '2027-02-28' }],
    requirements: ['SAT 1400+ / A-levels', 'IELTS 6.5+', 'Аттестат', 'Эссе', 'Интервью (для стипендии)'],
    programs: ['Computer Science', 'Business Analytics', 'Data Science', 'Engineering', 'Medicine'],
  },
  {
    id: 'kaist',
    name: 'KAIST',
    country: 'Южная Корея',
    city: 'Тэджон',
    ranking: 42,
    acceptanceRate: 20,
    tuition: 'Бесплатно (полный грант для иностранцев)',
    scholarships: true,
    deadlines: [{ type: 'Spring', date: '2026-09-30' }, { type: 'Fall', date: '2027-03-31' }],
    requirements: ['SAT 1350+ / ACT 30+', 'TOEFL 80+ / IELTS 6.5+', 'Аттестат', 'Рекомендации', 'Эссе'],
    programs: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Bio Engineering', 'Industrial Design'],
  },
]

const FLAG_MAP: Record<string, string> = {
  'Казахстан': '\u{1F1F0}\u{1F1FF}',
  'США': '\u{1F1FA}\u{1F1F8}',
  'Великобритания': '\u{1F1EC}\u{1F1E7}',
  'Швейцария': '\u{1F1E8}\u{1F1ED}',
  'Германия': '\u{1F1E9}\u{1F1EA}',
  'Сингапур': '\u{1F1F8}\u{1F1EC}',
  'Южная Корея': '\u{1F1F0}\u{1F1F7}',
}

// ── Demo applications ────────────────────────────────────────────────────────

const DEMO_APPLICATIONS: ApplicationChecklist[] = [
  {
    id: 'app-1',
    universityId: 'nu',
    universityName: 'Назарбаев Университет',
    status: 'in-progress',
    deadline: '2027-03-01',
    items: [
      { id: 'a1-1', title: 'Аттестат (копия)', completed: true, category: 'document' },
      { id: 'a1-2', title: 'Паспорт (копия)', completed: true, category: 'document' },
      { id: 'a1-3', title: 'Фото 3x4', completed: true, category: 'document' },
      { id: 'a1-4', title: 'IELTS 6.5+', completed: true, category: 'test' },
      { id: 'a1-5', title: 'SAT', completed: false, category: 'test' },
      { id: 'a1-6', title: 'Motivation Letter', completed: false, category: 'essay' },
      { id: 'a1-7', title: 'Personal Statement', completed: false, category: 'essay' },
      { id: 'a1-8', title: 'Рекомендация от учителя математики', completed: true, category: 'recommendation' },
      { id: 'a1-9', title: 'Рекомендация от куратора', completed: false, category: 'recommendation' },
    ],
  },
  {
    id: 'app-2',
    universityId: 'mit',
    universityName: 'MIT',
    status: 'not-started',
    deadline: '2027-01-05',
    items: [
      { id: 'a2-1', title: 'Аттестат (перевод)', completed: false, category: 'document' },
      { id: 'a2-2', title: 'Паспорт', completed: false, category: 'document' },
      { id: 'a2-3', title: 'TOEFL 100+', completed: false, category: 'test' },
      { id: 'a2-4', title: 'SAT 1550+', completed: false, category: 'test' },
      { id: 'a2-5', title: 'Эссе (5 штук)', completed: false, category: 'essay' },
      { id: 'a2-6', title: '2 рекомендации', completed: false, category: 'recommendation' },
      { id: 'a2-7', title: 'Портфолио проектов', completed: false, category: 'other' },
      { id: 'a2-8', title: 'Интервью', completed: false, category: 'other' },
    ],
  },
  {
    id: 'app-3',
    universityId: 'kbtu',
    universityName: 'КБТУ',
    status: 'submitted',
    deadline: '2026-07-01',
    items: [
      { id: 'a3-1', title: 'Аттестат', completed: true, category: 'document' },
      { id: 'a3-2', title: 'Паспорт', completed: true, category: 'document' },
      { id: 'a3-3', title: 'Фото 3x4', completed: true, category: 'document' },
      { id: 'a3-4', title: 'IELTS 5.5+', completed: true, category: 'test' },
      { id: 'a3-5', title: 'Внутренний экзамен', completed: true, category: 'test' },
      { id: 'a3-6', title: 'Мотивационное письмо', completed: true, category: 'essay' },
    ],
  },
]

// ── Demo deadlines ───────────────────────────────────────────────────────────

const DEMO_DEADLINES: Deadline[] = [
  { id: 'd1', universityName: 'КБТУ', what: 'Подача документов', date: '2026-07-01', flag: '\u{1F1F0}\u{1F1FF}' },
  { id: 'd2', universityName: 'КазНУ', what: 'Результаты ЕНТ', date: '2026-06-20', flag: '\u{1F1F0}\u{1F1FF}' },
  { id: 'd3', universityName: 'SDU', what: 'Крайний срок заявки', date: '2026-07-10', flag: '\u{1F1F0}\u{1F1FF}' },
  { id: 'd4', universityName: 'TU Munich', what: 'Зимний семестр — заявка', date: '2026-07-15', flag: '\u{1F1E9}\u{1F1EA}' },
  { id: 'd5', universityName: 'KAIST', what: 'Весенний набор', date: '2026-09-30', flag: '\u{1F1F0}\u{1F1F7}' },
  { id: 'd6', universityName: 'Oxford', what: 'UCAS дедлайн', date: '2026-10-15', flag: '\u{1F1EC}\u{1F1E7}' },
  { id: 'd7', universityName: 'MIT', what: 'Early Action', date: '2026-11-01', flag: '\u{1F1FA}\u{1F1F8}' },
  { id: 'd8', universityName: 'Назарбаев Университет', what: 'Early Application', date: '2026-11-01', flag: '\u{1F1F0}\u{1F1FF}' },
  { id: 'd9', universityName: 'ETH Zurich', what: 'Регулярный дедлайн', date: '2026-12-15', flag: '\u{1F1E8}\u{1F1ED}' },
  { id: 'd10', universityName: 'Harvard', what: 'Regular Decision', date: '2027-01-01', flag: '\u{1F1FA}\u{1F1F8}' },
  { id: 'd11', universityName: 'Stanford', what: 'Regular Decision', date: '2027-01-05', flag: '\u{1F1FA}\u{1F1F8}' },
  { id: 'd12', universityName: 'NUS', what: 'Регулярный набор', date: '2027-02-28', flag: '\u{1F1F8}\u{1F1EC}' },
]

// ── Kanban config ────────────────────────────────────────────────────────────

const KANBAN_COLUMNS: { status: KanbanStatus; label: string; color: string; bgColor: string }[] = [
  { status: 'not-started', label: 'Не начато', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  { status: 'in-progress', label: 'В процессе', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { status: 'submitted', label: 'Отправлено', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { status: 'accepted', label: 'Принят', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { status: 'rejected', label: 'Отказ', color: 'text-red-600', bgColor: 'bg-red-100' },
]

const CATEGORY_ICONS_MAP: Record<ChecklistItem['category'], typeof FileText> = {
  document: FolderOpen,
  test: ClipboardList,
  essay: PenTool,
  recommendation: Users,
  other: FileText,
}

const CATEGORY_LABELS: Record<ChecklistItem['category'], string> = {
  document: 'Документы',
  test: 'Тесты',
  essay: 'Эссе',
  recommendation: 'Рекомендации',
  other: 'Другое',
}

// ── Essay tips ───────────────────────────────────────────────────────────────

const ESSAY_TIPS = [
  'Начните с личной истории, которая показывает вашу мотивацию',
  'Покажите связь между вашим прошлым опытом и будущими целями',
  'Будьте конкретны: цифры, названия проектов, результаты',
  'Покажите, почему именно этот университет подходит вам',
  'Попросите 2-3 человека проверить ваше эссе перед отправкой',
]

const ESSAY_STRUCTURE = [
  { section: 'Введение (Hook)', desc: 'Начните с запоминающейся истории или факта' },
  { section: 'Контекст', desc: 'Объясните вашу ситуацию, интересы и бэкграунд' },
  { section: 'Основная часть', desc: 'Расскажите о достижениях, проектах, вызовах' },
  { section: 'Почему этот вуз?', desc: 'Конкретные программы, профессора, ресурсы' },
  { section: 'Заключение', desc: 'Свяжите всё воедино, покажите видение будущего' },
]

const ESSAY_OPENINGS = [
  '"Когда мне было 14, я написал свою первую программу — калькулятор на Python. Он не работал. Но в тот момент я понял, что хочу посвятить жизнь технологиям..."',
  '"В степях Казахстана, где я вырос, доступ к знаниям был ограничен. Но именно это ограничение стало моим самым сильным мотиватором..."',
  '"На олимпиаде по математике я занял последнее место. Через год — первое. Эта трансформация научила меня главному: успех — это процесс, а не событие..."',
]

// ── Utility ──────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function urgencyColor(days: number): string {
  if (days < 0) return 'text-slate-400'
  if (days < 7) return 'text-red-600'
  if (days < 30) return 'text-amber-600'
  return 'text-emerald-600'
}

function urgencyBg(days: number): string {
  if (days < 0) return 'bg-slate-50 border-slate-200'
  if (days < 7) return 'bg-red-50 border-red-200'
  if (days < 30) return 'bg-amber-50 border-amber-200'
  return 'bg-emerald-50 border-emerald-200'
}

function urgencyDot(days: number): string {
  if (days < 0) return 'bg-slate-300'
  if (days < 7) return 'bg-red-500'
  if (days < 30) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function formatDeadlineDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function progressPercent(items: ChecklistItem[]): number {
  if (items.length === 0) return 0
  return Math.round((items.filter(i => i.completed).length / items.length) * 100)
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Admission() {
  const [activeTab, setActiveTab] = useState<TabId>('selector')

  // Tab 1 state
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('all')
  const [programFilter, setProgramFilter] = useState<ProgramFilter>('all')
  const [budgetFilter, setBudgetFilter] = useState<BudgetFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Tab 2 state
  const [applications, setApplications] = useState<ApplicationChecklist[]>(DEMO_APPLICATIONS)
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null)

  // Filtered universities
  const filtered = useMemo(() => {
    return UNIVERSITIES.filter(u => {
      const q = search.toLowerCase()
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.city.toLowerCase().includes(q) || u.programs.some(p => p.toLowerCase().includes(q))
      const matchesCountry = countryFilter === 'all' || COUNTRY_MAP[u.country] === countryFilter
      const matchesProgram = programMatches(u.programs, programFilter)
      const matchesBudget = budgetFilter === 'all' || budgetCategory(u.tuition) === budgetFilter
      return matchesSearch && matchesCountry && matchesProgram && matchesBudget
    })
  }, [search, countryFilter, programFilter, budgetFilter])

  // Sorted deadlines
  const sortedDeadlines = useMemo(() => {
    return [...DEMO_DEADLINES].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [])

  // Toggle checklist item
  function toggleChecklistItem(appId: string, itemId: string) {
    setApplications(prev =>
      prev.map(app => {
        if (app.id !== appId) return app
        const updatedItems = app.items.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        )
        const completedCount = updatedItems.filter(i => i.completed).length
        const total = updatedItems.length
        let newStatus = app.status
        if (completedCount === 0) newStatus = 'not-started'
        else if (completedCount < total) newStatus = 'in-progress'
        return { ...app, items: updatedItems, status: newStatus }
      })
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
          <motion.div {...fadeIn}>
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="w-8 h-8" />
              <h1 className="text-3xl sm:text-4xl font-bold">Поступление</h1>
            </div>
            <p className="text-white/70 text-lg max-w-xl">
              Твой путь в лучшие вузы мира
            </p>
          </motion.div>

          {/* ── Pill tabs ──────────────────────────────────────────────────── */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-white text-indigo-700 shadow-lg'
                    : 'bg-white/15 text-white hover:bg-white/25'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'selector' && (
            <motion.div key="selector" {...fadeIn}>
              {/* ── Search + Filters ──────────────────────────────────────── */}
              <div className="mb-6 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Поиск вуза, города или программы..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors',
                      showFilters
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <Filter className="w-4 h-4" />
                    Фильтры
                    {(countryFilter !== 'all' || programFilter !== 'all' || budgetFilter !== 'all') && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-slate-200">
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-1 block">Страна</label>
                          <select
                            value={countryFilter}
                            onChange={e => setCountryFilter(e.target.value as CountryFilter)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {COUNTRY_FILTERS.map(cf => (
                              <option key={cf.value} value={cf.value}>{cf.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-1 block">Программа</label>
                          <select
                            value={programFilter}
                            onChange={e => setProgramFilter(e.target.value as ProgramFilter)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {PROGRAM_FILTERS.map(pf => (
                              <option key={pf.value} value={pf.value}>{pf.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-1 block">Бюджет</label>
                          <select
                            value={budgetFilter}
                            onChange={e => setBudgetFilter(e.target.value as BudgetFilter)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {BUDGET_FILTERS.map(bf => (
                              <option key={bf.value} value={bf.value}>{bf.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-sm text-slate-500">
                  Найдено: {filtered.length} {filtered.length === 1 ? 'вуз' : filtered.length < 5 ? 'вуза' : 'вузов'}
                </p>
              </div>

              {/* ── University grid ───────────────────────────────────────── */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {filtered.map(uni => {
                  const isExpanded = expandedId === uni.id
                  const flag = FLAG_MAP[uni.country] || ''
                  return (
                    <motion.div
                      key={uni.id}
                      variants={fadeIn}
                      layout
                      className={cn(
                        'bg-white rounded-2xl border border-slate-200 overflow-hidden transition-shadow',
                        isExpanded ? 'shadow-lg ring-2 ring-indigo-200 md:col-span-2 lg:col-span-3' : 'hover:shadow-md'
                      )}
                    >
                      {/* Card header gradient */}
                      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500" />

                      <div className="p-5">
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 text-base leading-tight">
                              {flag} {uni.name}
                            </h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                              {uni.city}, {uni.country}
                            </p>
                          </div>
                          {/* Ranking badge */}
                          <div className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                            <Trophy className="w-3.5 h-3.5" />
                            #{uni.ranking}
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex flex-wrap gap-3 mb-3 text-xs">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Globe className="w-3.5 h-3.5 text-indigo-500" />
                            Приём: {uni.acceptanceRate}%
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                            {uni.tuition}
                          </span>
                          {uni.scholarships && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                              <Sparkles className="w-3 h-3" />
                              Стипендии
                            </span>
                          )}
                        </div>

                        {/* Program tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {(isExpanded ? uni.programs : uni.programs.slice(0, 3)).map(prog => (
                            <span
                              key={prog}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs"
                            >
                              {prog}
                            </span>
                          ))}
                          {!isExpanded && uni.programs.length > 3 && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-xs">
                              +{uni.programs.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Expand button */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : uni.id)}
                          className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          {isExpanded ? 'Свернуть' : 'Подробнее'}
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Requirements */}
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                                    <ClipboardList className="w-4 h-4 text-indigo-500" />
                                    Требования
                                  </h4>
                                  <ul className="space-y-1">
                                    {uni.requirements.map(req => (
                                      <li key={req} className="text-xs text-slate-600 flex items-start gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                                        {req}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Deadlines */}
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-amber-500" />
                                    Дедлайны
                                  </h4>
                                  <ul className="space-y-1.5">
                                    {uni.deadlines.map(dl => (
                                      <li key={dl.type} className="text-xs text-slate-600 flex justify-between">
                                        <span className="font-medium">{dl.type}</span>
                                        <span>{formatDeadlineDate(dl.date)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* All programs */}
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                                    <BookOpen className="w-4 h-4 text-emerald-500" />
                                    Программы
                                  </h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {uni.programs.map(prog => (
                                      <span
                                        key={prog}
                                        className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs"
                                      >
                                        {prog}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Link placeholder */}
                              <div className="mt-4 flex items-center gap-2">
                                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                                  <ExternalLink className="w-4 h-4" />
                                  Перейти на сайт вуза
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-lg font-medium">Ничего не найдено</p>
                  <p className="text-slate-400 text-sm mt-1">Попробуйте изменить фильтры или поисковый запрос</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* Tab 2: My Applications (Kanban)                                   */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'applications' && (
            <motion.div key="applications" {...fadeIn}>
              <h2 className="text-xl font-bold text-slate-800 mb-5">Мои заявки</h2>

              {/* Kanban board */}
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
                {KANBAN_COLUMNS.map(col => {
                  const colApps = applications.filter(a => a.status === col.status)
                  return (
                    <div key={col.status} className="flex-shrink-0 w-72">
                      {/* Column header */}
                      <div className={cn('px-3 py-2 rounded-t-xl font-semibold text-sm flex items-center justify-between', col.bgColor, col.color)}>
                        <span>{col.label}</span>
                        <span className="text-xs opacity-60">{colApps.length}</span>
                      </div>

                      {/* Column body */}
                      <div className="bg-slate-50 rounded-b-xl border border-t-0 border-slate-200 p-2 min-h-[200px] space-y-2">
                        {colApps.map(app => {
                          const pct = progressPercent(app.items)
                          const isOpen = expandedAppId === app.id
                          const days = daysUntil(app.deadline)
                          return (
                            <motion.div
                              key={app.id}
                              layout
                              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                            >
                              <button
                                onClick={() => setExpandedAppId(isOpen ? null : app.id)}
                                className="w-full text-left p-3"
                              >
                                <p className="font-semibold text-sm text-slate-800">{app.universityName}</p>
                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Дедлайн: {formatDeadlineDate(app.deadline)}
                                </p>
                                <p className={cn('text-xs mt-0.5', urgencyColor(days))}>
                                  {days < 0 ? 'Просрочено' : `${days} дн. осталось`}
                                </p>

                                {/* Progress bar */}
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-500">Прогресс</span>
                                    <span className="font-medium text-slate-700">{pct}%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              </button>

                              {/* Expanded checklist */}
                              <AnimatePresence>
                                {isOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-3 pb-3 pt-1 border-t border-slate-100">
                                      {(['document', 'test', 'essay', 'recommendation', 'other'] as const).map(cat => {
                                        const catItems = app.items.filter(i => i.category === cat)
                                        if (catItems.length === 0) return null
                                        const CatIcon = CATEGORY_ICONS_MAP[cat]
                                        return (
                                          <div key={cat} className="mt-2">
                                            <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-1">
                                              <CatIcon className="w-3 h-3" />
                                              {CATEGORY_LABELS[cat]}
                                            </p>
                                            <ul className="space-y-1">
                                              {catItems.map(item => (
                                                <li key={item.id}>
                                                  <label className="flex items-center gap-2 text-xs cursor-pointer group">
                                                    <button
                                                      onClick={e => {
                                                        e.stopPropagation()
                                                        toggleChecklistItem(app.id, item.id)
                                                      }}
                                                      className="flex-shrink-0"
                                                    >
                                                      {item.completed ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                      ) : (
                                                        <Circle className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                                      )}
                                                    </button>
                                                    <span className={cn(
                                                      'transition-colors',
                                                      item.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                                                    )}>
                                                      {item.title}
                                                    </span>
                                                  </label>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )
                        })}

                        {colApps.length === 0 && (
                          <div className="text-center py-8 text-xs text-slate-400">
                            Пусто
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* Tab 3: Deadlines & Calendar                                       */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'deadlines' && (
            <motion.div key="deadlines" {...fadeIn}>
              <h2 className="text-xl font-bold text-slate-800 mb-5">Дедлайны и календарь</h2>

              {/* Timeline */}
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 hidden sm:block" />

                <div className="space-y-3">
                  {sortedDeadlines.map((dl, idx) => {
                    const days = daysUntil(dl.date)
                    return (
                      <motion.div
                        key={dl.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: 'spring' as const, stiffness: 260, damping: 24, delay: idx * 0.04 }}
                        className="flex items-start gap-4"
                      >
                        {/* Dot */}
                        <div className="relative z-10 flex-shrink-0 hidden sm:flex items-center justify-center w-8 h-8">
                          <div className={cn('w-3 h-3 rounded-full ring-4 ring-white', urgencyDot(days))} />
                        </div>

                        {/* Card */}
                        <div className={cn(
                          'flex-1 p-4 rounded-xl border transition-shadow hover:shadow-md',
                          urgencyBg(days)
                        )}>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">
                                {dl.flag} {dl.universityName}
                              </p>
                              <p className="text-xs text-slate-600 mt-0.5">{dl.what}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-medium text-slate-700">
                                {formatDeadlineDate(dl.date)}
                              </p>
                              <p className={cn('text-xs font-bold', urgencyColor(days))}>
                                {days < 0 ? 'Просрочено' : days === 0 ? 'Сегодня!' : `${days} дн.`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* ── Essay Helper Section ──────────────────────────────────── */}
              <div className="mt-12">
                <div className="flex items-center gap-2 mb-5">
                  <PenTool className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-slate-800">Эссе-помощник</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Tips */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Советы по написанию
                    </h3>
                    <ul className="space-y-2">
                      {ESSAY_TIPS.map((tip, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Structure template */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-indigo-500" />
                      Структура мотивационного письма
                    </h3>
                    <ol className="space-y-2.5">
                      {ESSAY_STRUCTURE.map((item, i) => (
                        <li key={i} className="text-xs">
                          <p className="font-semibold text-slate-700">{i + 1}. {item.section}</p>
                          <p className="text-slate-500 mt-0.5">{item.desc}</p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Example openings */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-500" />
                      Примеры начала эссе
                    </h3>
                    <div className="space-y-3">
                      {ESSAY_OPENINGS.map((opening, i) => (
                        <blockquote
                          key={i}
                          className="text-xs text-slate-600 italic border-l-2 border-indigo-300 pl-3"
                        >
                          {opening}
                        </blockquote>
                      ))}
                    </div>

                    <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all relative overflow-hidden">
                      <Sparkles className="w-4 h-4" />
                      Проверить эссе с AI
                      <span className="absolute top-1 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/20">
                        Скоро
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
