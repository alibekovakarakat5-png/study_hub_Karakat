import type { Subject } from '@/types'

// ── ENT Exam Structure (2025-2026 Format) ───────────────────────────────────
// Block 1 (Mandatory): Math Literacy (15q), Reading Literacy (15q), History (20q)
// Block 2 (Profile):   Profile Subject 1 (35q), Profile Subject 2 (35q)
// Total: 120 questions, 240 minutes, max ~140 points

export type EntBlock = 'mathLiteracy' | 'readingLiteracy' | 'history' | 'profile1' | 'profile2'

export const ENT_BLOCK_NAMES: Record<EntBlock, string> = {
  mathLiteracy: 'Математическая грамотность',
  readingLiteracy: 'Грамотность чтения',
  history: 'История Казахстана',
  profile1: 'Профильный предмет 1',
  profile2: 'Профильный предмет 2',
}

export const ENT_BLOCK_QUESTION_COUNT: Record<EntBlock, number> = {
  mathLiteracy: 15,
  readingLiteracy: 15,
  history: 20,
  profile1: 35,
  profile2: 35,
}

export const ENT_TOTAL_QUESTIONS = 120
export const ENT_TOTAL_MINUTES = 240

// ── Profile Subjects Available for ENT ──────────────────────────────────────

export const ENT_PROFILE_SUBJECTS: Subject[] = [
  'math', 'physics', 'chemistry', 'biology', 'english', 'geography',
  'informatics', 'literature', 'russian', 'kazakh',
]

export const ENT_PROFILE_SUBJECT_PAIRS: { label: string; subjects: [Subject, Subject] }[] = [
  { label: 'Математика + Физика', subjects: ['math', 'physics'] },
  { label: 'Математика + Информатика', subjects: ['math', 'informatics'] },
  { label: 'Химия + Биология', subjects: ['chemistry', 'biology'] },
  { label: 'Физика + Химия', subjects: ['physics', 'chemistry'] },
  { label: 'Биология + География', subjects: ['biology', 'geography'] },
  { label: 'Английский язык + География', subjects: ['english', 'geography'] },
  { label: 'История + География', subjects: ['history', 'geography'] },
]

// ── Question Types ──────────────────────────────────────────────────────────

export interface EntQuestion {
  id: string
  text: string
  options: string[]        // exactly 4 options (A, B, C, D)
  correctAnswer: number    // 0-3
  explanation: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
}

// ── Exam Variant ────────────────────────────────────────────────────────────

export interface EntExamVariant {
  id: string
  title: string           // "Пробный ЕНТ 2025 — Вариант 1"
  year: number
  variant: number
  description: string
  mandatory: {
    mathLiteracy: EntQuestion[]    // 15 questions
    readingLiteracy: EntQuestion[] // 15 questions
    history: EntQuestion[]         // 20 questions
  }
}

// Profile question banks — separate per subject, used across variants
export interface ProfileQuestionBank {
  subject: Subject
  questions: EntQuestion[]  // 35+ questions per subject
}

// ── Test Session ────────────────────────────────────────────────────────────

export type EntSessionPhase = 'select' | 'exam' | 'review' | 'results'

export interface EntSessionConfig {
  variantId: string
  profileSubject1: Subject
  profileSubject2: Subject
}

export interface EntAnswer {
  questionId: string
  block: EntBlock
  selectedAnswer: number | null
  isCorrect?: boolean
  flagged: boolean
}

export interface EntBlockResult {
  block: EntBlock
  subject?: Subject           // for profile blocks
  totalQuestions: number
  correctAnswers: number
  score: number
  maxScore: number
  percentage: number
  byDifficulty: {
    easy: { total: number; correct: number }
    medium: { total: number; correct: number }
    hard: { total: number; correct: number }
  }
  byTopic: { topic: string; total: number; correct: number }[]
}

export interface EntExamResult {
  id: string
  variantId: string
  variantTitle: string
  profileSubject1: Subject
  profileSubject2: Subject
  date: string
  timeSpentMinutes: number
  blocks: EntBlockResult[]
  totalScore: number
  maxScore: number
  percentage: number
  totalCorrect: number
  totalQuestions: number
}
