import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Subject } from '@/types'
import type {
  CuratorGoalType,
  IeltsType,
  CuratorPhase,
  CuratorLevel,
  CuratorPlan,
  CuratorWeek,
  CuratorModule,
  CuratorDiagnosticScore,
  ModuleProgress,
} from '@/types/curator'
import { curatorContent, ENT_MANDATORY_SUBJECTS } from '@/data/curatorContent'
import { generateId } from '@/lib/utils'

// ── Store Interface ─────────────────────────────────────────────────────────

interface CuratorState {
  // Navigation
  phase: CuratorPhase
  setPhase: (phase: CuratorPhase) => void

  // Goal
  goalType: CuratorGoalType | null
  ieltsType: IeltsType | null
  setGoal: (type: CuratorGoalType) => void
  setIeltsType: (type: IeltsType) => void

  // Subjects & Levels
  selectedSubjects: Subject[]
  subjectLevels: Partial<Record<Subject, CuratorLevel>>
  toggleSubject: (subject: Subject) => void
  setSubjectLevel: (subject: Subject, level: CuratorLevel) => void

  // Diagnostic (optional)
  diagnosticTaken: boolean
  diagnosticAnswers: Record<string, number>
  diagnosticScores: CuratorDiagnosticScore[]
  submitDiagnosticAnswer: (questionId: string, answer: number) => void
  completeDiagnostic: () => void
  skipDiagnostic: () => void

  // Plan
  plan: CuratorPlan | null
  generatePlan: () => void
  activeModuleId: string | null
  openModule: (moduleId: string) => void
  closeModule: () => void

  // Module Progress
  moduleProgress: Record<string, ModuleProgress>
  submitPracticeAnswer: (moduleId: string, questionId: string, answer: number) => void
  submitModuleTest: (moduleId: string, answers: Record<string, number>) => void

  // Reset
  resetCurator: () => void
}

// ── Helper: determine level from score ──────────────────────────────────────

function scoreToLevel(score: number, maxScore: number): CuratorLevel {
  const pct = (score / maxScore) * 100
  if (pct >= 70) return 'advanced'
  if (pct >= 40) return 'intermediate'
  return 'beginner'
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useCuratorStore = create<CuratorState>()(
  persist(
    (set, get) => ({
      // ── Navigation ──────────────────────────────────────────────────────
      phase: 'goal',
      setPhase: (phase) => set({ phase }),

      // ── Goal ────────────────────────────────────────────────────────────
      goalType: null,
      ieltsType: null,
      setGoal: (type) => set({ goalType: type }),
      setIeltsType: (type) => set({ ieltsType: type }),

      // ── Subjects & Levels ───────────────────────────────────────────────
      selectedSubjects: [],
      subjectLevels: {},

      toggleSubject: (subject) => {
        const current = get().selectedSubjects
        const mandatory = ENT_MANDATORY_SUBJECTS as readonly string[]
        // Can't deselect mandatory subjects
        if (mandatory.includes(subject) && current.includes(subject)) return

        if (current.includes(subject)) {
          const updated = current.filter(s => s !== subject)
          const levels = { ...get().subjectLevels }
          delete levels[subject]
          set({ selectedSubjects: updated, subjectLevels: levels })
        } else {
          set({
            selectedSubjects: [...current, subject],
            subjectLevels: { ...get().subjectLevels, [subject]: 'intermediate' },
          })
        }
      },

      setSubjectLevel: (subject, level) => {
        set({ subjectLevels: { ...get().subjectLevels, [subject]: level } })
      },

      // ── Diagnostic ──────────────────────────────────────────────────────
      diagnosticTaken: false,
      diagnosticAnswers: {},
      diagnosticScores: [],

      submitDiagnosticAnswer: (questionId, answer) => {
        set({ diagnosticAnswers: { ...get().diagnosticAnswers, [questionId]: answer } })
      },

      completeDiagnostic: () => {
        const { selectedSubjects, diagnosticAnswers } = get()
        const allContent = curatorContent

        const scores: CuratorDiagnosticScore[] = selectedSubjects.map(subject => {
          const subjectContent = allContent.filter(t => t.subject === subject)
          const allQuestions = subjectContent.flatMap(t => t.test)
          let score = 0
          let maxScore = 0

          for (const q of allQuestions) {
            maxScore++
            if (diagnosticAnswers[q.id] === q.correctAnswer) score++
          }

          if (maxScore === 0) maxScore = 1

          return {
            subject,
            score,
            maxScore,
            level: scoreToLevel(score, maxScore),
            weakTopics: subjectContent
              .filter(t => {
                const tQuestions = t.test
                const tCorrect = tQuestions.filter(q => diagnosticAnswers[q.id] === q.correctAnswer).length
                return tCorrect / (tQuestions.length || 1) < 0.5
              })
              .map(t => t.topic),
          }
        })

        // Update subject levels based on diagnostic
        const newLevels: Partial<Record<Subject, CuratorLevel>> = { ...get().subjectLevels }
        for (const s of scores) {
          newLevels[s.subject] = s.level
        }

        set({
          diagnosticTaken: true,
          diagnosticScores: scores,
          subjectLevels: newLevels,
          phase: 'results',
        })
      },

      skipDiagnostic: () => {
        set({ diagnosticTaken: false, phase: 'results' })
      },

      // ── Plan Generation ─────────────────────────────────────────────────
      plan: null,
      activeModuleId: null,

      generatePlan: () => {
        const { selectedSubjects, subjectLevels, goalType } = get()

        // Sort subjects: weakest first (beginner → intermediate → advanced)
        const levelOrder: Record<CuratorLevel, number> = { beginner: 0, intermediate: 1, advanced: 2 }
        const sorted = [...selectedSubjects].sort((a, b) => {
          const la = subjectLevels[a] || 'intermediate'
          const lb = subjectLevels[b] || 'intermediate'
          return levelOrder[la] - levelOrder[lb]
        })

        // Allocate weeks per subject based on level
        const weekAllocation: Record<string, number> = {}
        for (const subj of sorted) {
          const level = subjectLevels[subj] || 'intermediate'
          if (level === 'beginner') weekAllocation[subj] = 3
          else if (level === 'intermediate') weekAllocation[subj] = 2
          else weekAllocation[subj] = 1
        }

        const totalWeeks = Object.values(weekAllocation).reduce((a, b) => a + b, 0)
        const adjustedTotal = Math.max(8, Math.min(12, totalWeeks))

        // Build weeks with modules
        const weeks: CuratorWeek[] = []
        let weekNum = 1
        let moduleCount = 0

        for (const subject of sorted) {
          const level = subjectLevels[subject] || 'intermediate'
          const subjectTopics = curatorContent.filter(t => t.subject === subject)

          // Filter topics by level appropriateness
          const appropriateTopics = subjectTopics.filter(t => {
            if (level === 'beginner') return true // all topics
            if (level === 'intermediate') return t.level !== 'beginner' || subjectTopics.length <= 2
            return t.level === 'advanced' || subjectTopics.length <= 1
          })

          const topicsToUse = appropriateTopics.length > 0 ? appropriateTopics : subjectTopics

          // Create weeks for this subject
          const weeksForSubject = weekAllocation[subject] || 1
          const topicsPerWeek = Math.ceil(topicsToUse.length / weeksForSubject)

          for (let w = 0; w < weeksForSubject && weekNum <= adjustedTotal; w++) {
            const startIdx = w * topicsPerWeek
            const weekTopics = topicsToUse.slice(startIdx, startIdx + topicsPerWeek)

            if (weekTopics.length === 0) continue

            const modules: CuratorModule[] = weekTopics.map((topic, idx) => {
              moduleCount++
              return {
                id: `module-${subject}-${weekNum}-${idx}`,
                subject: topic.subject,
                topic: topic.topic,
                weekNumber: weekNum,
                order: idx,
                theory: topic.theory,
                practice: topic.practice.map(p => ({ ...p, answered: false, userAnswer: undefined })),
                test: topic.test.map(t => ({ ...t, userAnswer: undefined })),
                status: weekNum === 1 ? 'available' : 'locked',
              }
            })

            const startDate = new Date()
            startDate.setDate(startDate.getDate() + (weekNum - 1) * 7)
            const endDate = new Date(startDate)
            endDate.setDate(endDate.getDate() + 6)

            weeks.push({
              weekNumber: weekNum,
              theme: `${weekTopics.map(t => t.topic).join(', ')}`,
              modules,
              unlocked: weekNum === 1,
            })

            weekNum++
          }
        }

        const plan: CuratorPlan = {
          id: generateId(),
          goalType: goalType || 'ent',
          subjects: selectedSubjects,
          weeks,
          totalModules: moduleCount,
          completedModules: 0,
          startDate: new Date().toISOString(),
        }

        set({ plan, phase: 'plan' })
      },

      openModule: (moduleId) => {
        set({ activeModuleId: moduleId, phase: 'module' })
      },

      closeModule: () => {
        set({ activeModuleId: null, phase: 'plan' })
      },

      // ── Module Progress ─────────────────────────────────────────────────
      moduleProgress: {},

      submitPracticeAnswer: (moduleId, questionId, answer) => {
        const current = get().moduleProgress[moduleId] || {
          practiceAnswers: {},
          testAnswers: {},
        }

        const updatedProgress: ModuleProgress = {
          ...current,
          practiceAnswers: { ...current.practiceAnswers, [questionId]: answer },
        }

        // Check if all practice questions answered
        const plan = get().plan
        if (plan) {
          const mod = plan.weeks
            .flatMap(w => w.modules)
            .find(m => m.id === moduleId)
          if (mod) {
            const totalPractice = mod.practice.length
            const answeredCount = Object.keys(updatedProgress.practiceAnswers).length
            if (answeredCount >= totalPractice) {
              updatedProgress.practiceCompleted = true
            }
          }
        }

        set({
          moduleProgress: { ...get().moduleProgress, [moduleId]: updatedProgress },
        })
      },

      submitModuleTest: (moduleId, answers) => {
        const plan = get().plan
        if (!plan) return

        const mod = plan.weeks
          .flatMap(w => w.modules)
          .find(m => m.id === moduleId)
        if (!mod) return

        // Score the test
        let correct = 0
        for (const q of mod.test) {
          if (answers[q.id] === q.correctAnswer) correct++
        }
        const score = Math.round((correct / mod.test.length) * 100)
        const passed = score >= 70

        // Update progress
        const progress: ModuleProgress = {
          ...get().moduleProgress[moduleId],
          testAnswers: answers,
          testScore: score,
          testPassed: passed,
        }

        // Update module status in plan
        const updatedWeeks = plan.weeks.map(week => ({
          ...week,
          modules: week.modules.map(m => {
            if (m.id === moduleId) {
              return { ...m, status: passed ? 'completed' as const : 'in-progress' as const, score }
            }
            return m
          }),
        }))

        // Count completed modules
        const completedModules = updatedWeeks
          .flatMap(w => w.modules)
          .filter(m => m.status === 'completed').length

        // Unlock next week if all modules in current week are completed
        const moduleWeek = updatedWeeks.find(w => w.modules.some(m => m.id === moduleId))
        if (moduleWeek && passed) {
          const allCompleted = moduleWeek.modules.every(m => m.status === 'completed')
          if (allCompleted) {
            const nextWeekIdx = updatedWeeks.findIndex(w => w.weekNumber === moduleWeek.weekNumber + 1)
            if (nextWeekIdx !== -1) {
              updatedWeeks[nextWeekIdx] = {
                ...updatedWeeks[nextWeekIdx],
                unlocked: true,
                modules: updatedWeeks[nextWeekIdx].modules.map(m => ({
                  ...m,
                  status: m.status === 'locked' ? 'available' as const : m.status,
                })),
              }
            }
          }
        }

        set({
          moduleProgress: { ...get().moduleProgress, [moduleId]: progress },
          plan: { ...plan, weeks: updatedWeeks, completedModules },
        })
      },

      // ── Reset ───────────────────────────────────────────────────────────
      resetCurator: () => {
        set({
          phase: 'goal',
          goalType: null,
          ieltsType: null,
          selectedSubjects: [],
          subjectLevels: {},
          diagnosticTaken: false,
          diagnosticAnswers: {},
          diagnosticScores: [],
          plan: null,
          activeModuleId: null,
          moduleProgress: {},
        })
      },
    }),
    {
      name: 'studyhub-curator',
      partialize: (state) => ({
        phase: state.phase,
        goalType: state.goalType,
        ieltsType: state.ieltsType,
        selectedSubjects: state.selectedSubjects,
        subjectLevels: state.subjectLevels,
        diagnosticTaken: state.diagnosticTaken,
        diagnosticScores: state.diagnosticScores,
        plan: state.plan,
        moduleProgress: state.moduleProgress,
      }),
    }
  )
)
