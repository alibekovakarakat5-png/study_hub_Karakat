import type { Subject } from '@/types'

// ── Goal & Phase ────────────────────────────────────────────────────────────

export type CuratorGoalType = 'ent' | 'ielts'
export type IeltsType = 'academic' | 'general'
export type CuratorPhase = 'goal' | 'subjects' | 'diagnostic' | 'results' | 'plan' | 'module' | 'progress'
export type CuratorLevel = 'beginner' | 'intermediate' | 'advanced'

export type ContentLanguage = 'ru' | 'kk' | 'en'

export const CURATOR_LEVEL_NAMES: Record<CuratorLevel, string> = {
  beginner: 'Начинающий',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
}

export const CURATOR_LEVEL_NAMES_KK: Record<CuratorLevel, string> = {
  beginner: 'Бастауыш',
  intermediate: 'Орта',
  advanced: 'Жоғары',
}

export const CURATOR_LEVEL_EMOJI: Record<CuratorLevel, string> = {
  beginner: '🌱',
  intermediate: '📚',
  advanced: '🚀',
}

export const CURATOR_LEVEL_DESCRIPTIONS: Record<CuratorLevel, string> = {
  beginner: 'Только начинаю изучать',
  intermediate: 'Знаю основы, но есть пробелы',
  advanced: 'Уверенно владею материалом',
}

// ── Diagnostic ──────────────────────────────────────────────────────────────

export interface CuratorDiagnosticScore {
  subject: Subject
  score: number
  maxScore: number
  level: CuratorLevel
  weakTopics: string[]
}

// ── Study Plan ──────────────────────────────────────────────────────────────

export interface CuratorPlan {
  id: string
  goalType: CuratorGoalType
  subjects: Subject[]
  weeks: CuratorWeek[]
  totalModules: number
  completedModules: number
  startDate: string
}

export interface CuratorWeek {
  weekNumber: number
  theme: string
  modules: CuratorModule[]
  unlocked: boolean
}

export interface CuratorModule {
  id: string
  subject: Subject
  topic: string
  weekNumber: number
  order: number
  theory: TheoryBlock
  practice: PracticeQuestion[]
  test: TestQuestion[]
  status: 'locked' | 'available' | 'in-progress' | 'completed'
  score?: number
}

// ── Module Content ──────────────────────────────────────────────────────────

export interface TheoryBlock {
  title: string
  sections: TheorySection[]
  keyPoints: string[]
  formulas?: string[]
}

export interface TheorySection {
  heading: string
  content: string
}

export interface PracticeQuestion {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  hint: string
  explanation: string
  answered?: boolean
  userAnswer?: number
}

export interface TestQuestion {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation: string
  userAnswer?: number
}

// ── Content Template (for data file) ────────────────────────────────────────

export interface TopicContent {
  subject: Subject
  topic: string
  level: CuratorLevel
  language?: ContentLanguage  // default 'ru' for backward compat
  theory: TheoryBlock
  practice: PracticeQuestion[]
  test: TestQuestion[]
}

// ── Module Progress (stored in store) ───────────────────────────────────────

export interface ModuleProgress {
  practiceAnswers: Record<string, number>
  testAnswers: Record<string, number>
  testScore?: number
  testPassed?: boolean
  practiceCompleted?: boolean
}
