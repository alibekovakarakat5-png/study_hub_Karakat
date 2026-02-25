import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Subject } from '@/types'
import type {
  EntBlock,
  EntAnswer,
  EntExamResult,
  EntBlockResult,
  EntSessionPhase,
  EntQuestion,
} from '@/types/practiceEnt'
import { ENT_BLOCK_QUESTION_COUNT, ENT_TOTAL_MINUTES } from '@/types/practiceEnt'
import { examVariants } from '@/data/practiceEnt'
import { profileBanks } from '@/data/practiceEnt'

// ── Helpers ─────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickQuestions(questions: EntQuestion[], count: number): EntQuestion[] {
  if (questions.length <= count) return [...questions]
  return shuffleArray(questions).slice(0, count)
}

// ── Types ───────────────────────────────────────────────────────────────────

interface AssembledExam {
  variantId: string
  variantTitle: string
  blocks: {
    block: EntBlock
    subject?: Subject
    questions: EntQuestion[]
  }[]
}

interface PracticeEntState {
  // ── Session config
  phase: EntSessionPhase
  selectedVariantId: string | null
  profileSubject1: Subject | null
  profileSubject2: Subject | null

  // ── Active exam
  exam: AssembledExam | null
  answers: Record<string, EntAnswer>  // keyed by questionId
  currentBlockIndex: number
  currentQuestionIndex: number
  timerStartedAt: number | null       // timestamp ms
  timerPausedAt: number | null
  timeRemainingSeconds: number        // countdown from 240*60

  // ── Results
  currentResult: EntExamResult | null
  history: EntExamResult[]

  // ── Actions
  setPhase: (phase: EntSessionPhase) => void
  selectVariant: (variantId: string) => void
  setProfileSubjects: (s1: Subject, s2: Subject) => void
  startExam: () => void
  setAnswer: (questionId: string, answer: number) => void
  toggleFlag: (questionId: string) => void
  navigateTo: (blockIndex: number, questionIndex: number) => void
  nextQuestion: () => void
  prevQuestion: () => void
  tick: () => void                    // called every second by timer
  finishExam: () => void
  reviewQuestion: (blockIndex: number, questionIndex: number) => void
  resetSession: () => void
}

// ── Store ───────────────────────────────────────────────────────────────────

export const usePracticeEntStore = create<PracticeEntState>()(
  persist(
    (set, get) => ({
      // ── Initial state
      phase: 'select',
      selectedVariantId: null,
      profileSubject1: null,
      profileSubject2: null,
      exam: null,
      answers: {},
      currentBlockIndex: 0,
      currentQuestionIndex: 0,
      timerStartedAt: null,
      timerPausedAt: null,
      timeRemainingSeconds: ENT_TOTAL_MINUTES * 60,
      currentResult: null,
      history: [],

      // ── Actions
      setPhase: (phase) => set({ phase }),

      selectVariant: (variantId) => set({ selectedVariantId: variantId }),

      setProfileSubjects: (s1, s2) => set({ profileSubject1: s1, profileSubject2: s2 }),

      startExam: () => {
        const { selectedVariantId, profileSubject1, profileSubject2 } = get()
        if (!selectedVariantId || !profileSubject1 || !profileSubject2) return

        const variant = examVariants.find(v => v.id === selectedVariantId)
        if (!variant) return

        const bank1 = profileBanks.find(b => b.subject === profileSubject1)
        const bank2 = profileBanks.find(b => b.subject === profileSubject2)
        if (!bank1 || !bank2) return

        const profile1Questions = pickQuestions(bank1.questions, ENT_BLOCK_QUESTION_COUNT.profile1)
        const profile2Questions = pickQuestions(bank2.questions, ENT_BLOCK_QUESTION_COUNT.profile2)

        const assembled: AssembledExam = {
          variantId: variant.id,
          variantTitle: variant.title,
          blocks: [
            { block: 'mathLiteracy', questions: variant.mandatory.mathLiteracy },
            { block: 'readingLiteracy', questions: variant.mandatory.readingLiteracy },
            { block: 'history', questions: variant.mandatory.history },
            { block: 'profile1', subject: profileSubject1, questions: profile1Questions },
            { block: 'profile2', subject: profileSubject2, questions: profile2Questions },
          ],
        }

        // Initialize answers
        const answers: Record<string, EntAnswer> = {}
        for (const block of assembled.blocks) {
          for (const q of block.questions) {
            answers[q.id] = {
              questionId: q.id,
              block: block.block,
              selectedAnswer: null,
              flagged: false,
            }
          }
        }

        set({
          exam: assembled,
          answers,
          currentBlockIndex: 0,
          currentQuestionIndex: 0,
          timerStartedAt: Date.now(),
          timerPausedAt: null,
          timeRemainingSeconds: ENT_TOTAL_MINUTES * 60,
          phase: 'exam',
          currentResult: null,
        })
      },

      setAnswer: (questionId, answer) => {
        const { answers } = get()
        const existing = answers[questionId]
        if (!existing) return
        set({
          answers: {
            ...answers,
            [questionId]: { ...existing, selectedAnswer: answer },
          },
        })
      },

      toggleFlag: (questionId) => {
        const { answers } = get()
        const existing = answers[questionId]
        if (!existing) return
        set({
          answers: {
            ...answers,
            [questionId]: { ...existing, flagged: !existing.flagged },
          },
        })
      },

      navigateTo: (blockIndex, questionIndex) => {
        set({ currentBlockIndex: blockIndex, currentQuestionIndex: questionIndex })
      },

      nextQuestion: () => {
        const { exam, currentBlockIndex, currentQuestionIndex } = get()
        if (!exam) return

        const currentBlock = exam.blocks[currentBlockIndex]
        if (currentQuestionIndex < currentBlock.questions.length - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 })
        } else if (currentBlockIndex < exam.blocks.length - 1) {
          set({ currentBlockIndex: currentBlockIndex + 1, currentQuestionIndex: 0 })
        }
      },

      prevQuestion: () => {
        const { exam, currentBlockIndex, currentQuestionIndex } = get()
        if (!exam) return

        if (currentQuestionIndex > 0) {
          set({ currentQuestionIndex: currentQuestionIndex - 1 })
        } else if (currentBlockIndex > 0) {
          const prevBlock = exam.blocks[currentBlockIndex - 1]
          set({
            currentBlockIndex: currentBlockIndex - 1,
            currentQuestionIndex: prevBlock.questions.length - 1,
          })
        }
      },

      tick: () => {
        const { timeRemainingSeconds, phase } = get()
        if (phase !== 'exam') return
        if (timeRemainingSeconds <= 0) {
          get().finishExam()
          return
        }
        set({ timeRemainingSeconds: timeRemainingSeconds - 1 })
      },

      finishExam: () => {
        const { exam, answers, timerStartedAt } = get()
        if (!exam) return

        const timeSpent = timerStartedAt
          ? Math.round((Date.now() - timerStartedAt) / 60000)
          : 0

        // Score each block
        const blockResults: EntBlockResult[] = exam.blocks.map(block => {
          const byDifficulty = {
            easy: { total: 0, correct: 0 },
            medium: { total: 0, correct: 0 },
            hard: { total: 0, correct: 0 },
          }
          const topicMap = new Map<string, { total: number; correct: number }>()
          let correct = 0

          for (const q of block.questions) {
            const ans = answers[q.id]
            const isCorrect = ans?.selectedAnswer === q.correctAnswer

            if (isCorrect) correct++

            // By difficulty
            byDifficulty[q.difficulty].total++
            if (isCorrect) byDifficulty[q.difficulty].correct++

            // By topic
            const topicEntry = topicMap.get(q.topic) ?? { total: 0, correct: 0 }
            topicEntry.total++
            if (isCorrect) topicEntry.correct++
            topicMap.set(q.topic, topicEntry)

            // Mark answer correctness
            if (ans) ans.isCorrect = isCorrect
          }

          const total = block.questions.length
          return {
            block: block.block,
            subject: block.subject,
            totalQuestions: total,
            correctAnswers: correct,
            score: correct,
            maxScore: total,
            percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
            byDifficulty,
            byTopic: Array.from(topicMap.entries()).map(([topic, data]) => ({
              topic,
              ...data,
            })),
          }
        })

        const totalCorrect = blockResults.reduce((s, b) => s + b.correctAnswers, 0)
        const totalQuestions = blockResults.reduce((s, b) => s + b.totalQuestions, 0)

        const result: EntExamResult = {
          id: `result-${Date.now()}`,
          variantId: exam.variantId,
          variantTitle: exam.variantTitle,
          profileSubject1: get().profileSubject1!,
          profileSubject2: get().profileSubject2!,
          date: new Date().toISOString(),
          timeSpentMinutes: timeSpent,
          blocks: blockResults,
          totalScore: totalCorrect,
          maxScore: totalQuestions,
          percentage: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
          totalCorrect,
          totalQuestions,
        }

        set(state => ({
          phase: 'results',
          currentResult: result,
          answers: { ...state.answers },
          history: [result, ...state.history].slice(0, 20), // keep last 20
        }))
      },

      reviewQuestion: (blockIndex, questionIndex) => {
        set({
          phase: 'review',
          currentBlockIndex: blockIndex,
          currentQuestionIndex: questionIndex,
        })
      },

      resetSession: () =>
        set({
          phase: 'select',
          selectedVariantId: null,
          profileSubject1: null,
          profileSubject2: null,
          exam: null,
          answers: {},
          currentBlockIndex: 0,
          currentQuestionIndex: 0,
          timerStartedAt: null,
          timerPausedAt: null,
          timeRemainingSeconds: ENT_TOTAL_MINUTES * 60,
          currentResult: null,
        }),
    }),
    {
      name: 'studyhub-practice-ent',
      partialize: (state) => ({
        history: state.history,
      }),
    },
  ),
)
