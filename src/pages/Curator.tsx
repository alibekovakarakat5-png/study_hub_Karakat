import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Globe, ArrowLeft, ArrowRight, Check, ChevronRight,
  BookOpen, Brain, Target, Trophy, Lock, Unlock, Star, Sparkles,
  BarChart3, Clock, Lightbulb, ChevronDown, ChevronUp,
  RotateCcw, Play, CheckCircle2, XCircle, HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUBJECT_NAMES, SUBJECT_COLORS } from '@/types'
import type { Subject } from '@/types'
import {
  CURATOR_LEVEL_NAMES, CURATOR_LEVEL_EMOJI, CURATOR_LEVEL_DESCRIPTIONS,
} from '@/types/curator'
import type { CuratorLevel, CuratorPhase } from '@/types/curator'
import { useCuratorStore } from '@/store/useCuratorStore'
import { curatorContent, ENT_MANDATORY_SUBJECTS } from '@/data/curatorContent'

// ── Animation Variants ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: 'spring' as const, stiffness: 200, damping: 25 } },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const slideIn = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, type: 'spring' as const, stiffness: 300, damping: 30 } },
  exit: { opacity: 0, x: -60, transition: { duration: 0.2 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, type: 'spring' as const, stiffness: 300, damping: 25 } },
}

// ── Subject icons (emoji-based) ─────────────────────────────────────────────

const SUBJECT_ICONS: Record<string, string> = {
  math: '📐', physics: '⚛️', chemistry: '🧪', biology: '🧬',
  history: '🏛️', english: '🇬🇧', kazakh: '🇰🇿', russian: '📖',
  informatics: '💻', geography: '🌍', literature: '📚',
}

// ── Level colors ────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<CuratorLevel, { bg: string; border: string; text: string; ring: string }> = {
  beginner: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-400' },
  intermediate: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', ring: 'ring-blue-400' },
  advanced: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', ring: 'ring-purple-400' },
}

// ── Phase 1: Goal Selection ─────────────────────────────────────────────────

function GoalSelection() {
  const { setGoal, setPhase } = useCuratorStore()
  const navigate = useNavigate()

  const handleSelect = (goal: 'ent' | 'ielts') => {
    setGoal(goal)
    setPhase('subjects')
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="mx-auto max-w-4xl px-4 py-12">
      <motion.button
        variants={fadeUp}
        onClick={() => navigate('/dashboard')}
        className="mb-8 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к дашборду
      </motion.button>

      <motion.div variants={fadeUp} className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700">
          <Sparkles className="h-4 w-4" />
          Цифровой куратор
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900">
          К чему ты готовишься?
        </h1>
        <p className="mx-auto max-w-xl text-lg text-slate-500">
          Выбери свою цель, и мы построим персональный план обучения с теорией, практикой и тестами
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2">
        <motion.button
          variants={fadeUp}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelect('ent')}
          className="group relative overflow-hidden rounded-3xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 text-left transition-all hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-100/50 transition-transform group-hover:scale-150" />
          <div className="relative">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-slate-900">ЕНТ</h3>
            <p className="mb-4 text-slate-500">
              Единое национальное тестирование — твой путь в лучшие вузы Казахстана
            </p>
            <div className="flex flex-wrap gap-2">
              {['Математика', 'Физика', 'История', 'Английский'].map(s => (
                <span key={s} className="rounded-full bg-blue-100/80 px-3 py-1 text-xs font-medium text-blue-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </motion.button>

        <motion.button
          variants={fadeUp}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelect('ielts')}
          className="group relative overflow-hidden rounded-3xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 text-left transition-all hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/50"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-100/50 transition-transform group-hover:scale-150" />
          <div className="relative">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
              <Globe className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-slate-900">IELTS</h3>
            <p className="mb-4 text-slate-500">
              Международный экзамен по английскому языку для учёбы за рубежом
            </p>
            <div className="flex flex-wrap gap-2">
              {['Reading', 'Writing', 'Listening', 'Speaking'].map(s => (
                <span key={s} className="rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-medium text-emerald-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </motion.button>
      </div>
    </motion.div>
  )
}

// ── Phase 2: Subject Selection + Self Assessment ────────────────────────────

function SubjectSelection() {
  const {
    goalType, selectedSubjects, subjectLevels,
    toggleSubject, setSubjectLevel, setPhase,
  } = useCuratorStore()

  // Auto-select mandatory on mount
  useEffect(() => {
    if (goalType === 'ent') {
      for (const subj of ENT_MANDATORY_SUBJECTS) {
        if (!selectedSubjects.includes(subj as Subject)) {
          toggleSubject(subj as Subject)
        }
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const allSubjects: Subject[] = [
    'math', 'physics', 'chemistry', 'biology', 'history',
    'english', 'kazakh', 'russian', 'informatics', 'geography', 'literature',
  ]

  const canProceed = selectedSubjects.length >= 3 &&
    selectedSubjects.every(s => subjectLevels[s])

  const [showDiagnosticPrompt, setShowDiagnosticPrompt] = useState(false)

  const handleProceed = () => {
    setShowDiagnosticPrompt(true)
  }

  const handleStartDiagnostic = () => {
    setPhase('diagnostic')
  }

  const handleSkipDiagnostic = () => {
    setPhase('results')
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="mx-auto max-w-5xl px-4 py-12">
      <motion.button
        variants={fadeUp}
        onClick={() => setPhase('goal')}
        className="mb-8 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к выбору цели
      </motion.button>

      <motion.div variants={fadeUp} className="mb-8 text-center">
        <h2 className="mb-3 text-3xl font-bold text-slate-900">
          {goalType === 'ent' ? 'Выбери предметы для ЕНТ' : 'Разделы IELTS'}
        </h2>
        <p className="mx-auto max-w-lg text-slate-500">
          Выбери предметы и оцени свой примерный уровень — мы составим план именно под тебя
        </p>
      </motion.div>

      {/* Progress indicator */}
      <motion.div variants={fadeUp} className="mb-8 flex items-center justify-center gap-3">
        <div className={cn(
          'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
          selectedSubjects.length >= 3
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-500'
        )}>
          <Check className="h-4 w-4" />
          {selectedSubjects.length} предметов выбрано
          {selectedSubjects.length < 3 && <span className="text-xs">(минимум 3)</span>}
        </div>
      </motion.div>

      {/* Subject grid */}
      <motion.div variants={stagger} className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {allSubjects.map(subject => {
          const isSelected = selectedSubjects.includes(subject)
          const isMandatory = (ENT_MANDATORY_SUBJECTS as readonly string[]).includes(subject) && goalType === 'ent'
          const color = SUBJECT_COLORS[subject]
          const level = subjectLevels[subject]

          return (
            <motion.div key={subject} variants={fadeUp}>
              <button
                onClick={() => toggleSubject(subject)}
                className={cn(
                  'group relative w-full rounded-2xl border-2 p-4 text-left transition-all',
                  isSelected
                    ? 'border-transparent shadow-md'
                    : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
                )}
                style={isSelected ? {
                  borderColor: color + '40',
                  backgroundColor: color + '08',
                } : undefined}
              >
                {isMandatory && (
                  <span className="absolute -top-2 right-3 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    Обязательный
                  </span>
                )}

                <div className="mb-2 text-2xl">{SUBJECT_ICONS[subject]}</div>
                <div className="text-sm font-semibold text-slate-800">{SUBJECT_NAMES[subject]}</div>

                {isSelected && (
                  <div className="absolute right-3 top-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </button>

              {/* Level selector (shown when selected) */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 flex gap-1.5 rounded-xl bg-slate-50 p-1.5">
                      {(['beginner', 'intermediate', 'advanced'] as CuratorLevel[]).map(l => (
                        <button
                          key={l}
                          onClick={(e) => { e.stopPropagation(); setSubjectLevel(subject, l) }}
                          className={cn(
                            'flex-1 rounded-lg px-2 py-1.5 text-center text-[11px] font-medium transition-all',
                            level === l
                              ? `${LEVEL_COLORS[l].bg} ${LEVEL_COLORS[l].text} shadow-sm`
                              : 'text-slate-400 hover:text-slate-600'
                          )}
                        >
                          <span className="block text-sm">{CURATOR_LEVEL_EMOJI[l]}</span>
                          {CURATOR_LEVEL_NAMES[l]}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Level legend */}
      <motion.div variants={fadeUp} className="mb-8 flex flex-wrap justify-center gap-4">
        {(['beginner', 'intermediate', 'advanced'] as CuratorLevel[]).map(l => (
          <div key={l} className="flex items-center gap-2 text-sm text-slate-500">
            <span>{CURATOR_LEVEL_EMOJI[l]}</span>
            <span className="font-medium">{CURATOR_LEVEL_NAMES[l]}</span>
            <span className="text-slate-400">— {CURATOR_LEVEL_DESCRIPTIONS[l]}</span>
          </div>
        ))}
      </motion.div>

      {/* Diagnostic prompt or proceed button */}
      <AnimatePresence mode="wait">
        {!showDiagnosticPrompt ? (
          <motion.div key="proceed" variants={fadeUp} className="text-center">
            <button
              onClick={handleProceed}
              disabled={!canProceed}
              className={cn(
                'inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-lg font-semibold transition-all',
                canProceed
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700 hover:shadow-xl'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              Продолжить
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="diagnostic-prompt"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-xl"
          >
            <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-6 text-center">
              <div className="mb-3 text-3xl">💡</div>
              <h3 className="mb-2 text-lg font-bold text-slate-800">
                Хочешь точнее определить свой уровень?
              </h3>
              <p className="mb-5 text-sm text-slate-500">
                Короткий мини-тест (3-5 вопросов на предмет) поможет нам составить более точный план. Это займёт около 5 минут.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={handleStartDiagnostic}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-700 hover:shadow-lg"
                >
                  <Brain className="h-4 w-4" />
                  Пройти мини-тест
                </button>
                <button
                  onClick={handleSkipDiagnostic}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-slate-600 shadow-sm border border-slate-200 transition-all hover:bg-slate-50"
                >
                  Пропустить и начать
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Phase 3: Diagnostic (Optional) ──────────────────────────────────────────

function DiagnosticPhase() {
  const {
    selectedSubjects, diagnosticAnswers,
    submitDiagnosticAnswer, completeDiagnostic, setPhase,
  } = useCuratorStore()

  // Build question list from curator content
  const questions = useMemo(() => {
    const qs: { id: string; text: string; options: string[]; correctAnswer: number; subject: Subject; topic: string }[] = []
    for (const subj of selectedSubjects) {
      const subjectContent = curatorContent.filter(t => t.subject === subj)
      // Take first 1-2 test questions per topic (up to 5 per subject)
      let count = 0
      for (const topic of subjectContent) {
        for (const q of topic.test) {
          if (count >= 5) break
          qs.push({ ...q, subject: topic.subject, topic: topic.topic })
          count++
        }
        if (count >= 5) break
      }
    }
    return qs
  }, [selectedSubjects])

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  const currentQ = questions[currentIdx]
  const progress = ((currentIdx + 1) / questions.length) * 100

  const handleSelect = (answerIdx: number) => {
    setSelectedAnswer(answerIdx)
  }

  const handleNext = () => {
    if (selectedAnswer === null || !currentQ) return
    submitDiagnosticAnswer(currentQ.id, selectedAnswer)

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1)
      setSelectedAnswer(null)
    } else {
      completeDiagnostic()
    }
  }

  if (!currentQ) {
    completeDiagnostic()
    return null
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-2xl px-4 py-12">
      <button
        onClick={() => setPhase('subjects')}
        className="mb-8 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к предметам
      </button>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-500">Вопрос {currentIdx + 1} из {questions.length}</span>
          <span className="font-medium text-primary-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Subject badge */}
      <div className="mb-4 flex items-center gap-2">
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: SUBJECT_COLORS[currentQ.subject] }}
        >
          {SUBJECT_NAMES[currentQ.subject]}
        </span>
        <span className="text-xs text-slate-400">{currentQ.topic}</span>
      </div>

      {/* Encouraging message */}
      <div className="mb-6 text-sm text-slate-400">
        {currentIdx === 0 && 'Начнём! Не переживай, это просто проверка уровня 🙌'}
        {currentIdx > 0 && currentIdx < questions.length - 1 && `Отлично! Осталось ${questions.length - currentIdx - 1} вопросов`}
        {currentIdx === questions.length - 1 && 'Последний вопрос! 🎯'}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-lg font-medium text-slate-800">{currentQ.text}</p>
          </div>

          <div className="space-y-3">
            {currentQ.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={cn(
                  'w-full rounded-xl border-2 p-4 text-left transition-all',
                  selectedAnswer === idx
                    ? 'border-primary-400 bg-primary-50 shadow-sm'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                    selectedAnswer === idx
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  )}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={cn(
                    'text-sm',
                    selectedAnswer === idx ? 'font-medium text-primary-700' : 'text-slate-700'
                  )}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all',
            selectedAnswer !== null
              ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          )}
        >
          {currentIdx === questions.length - 1 ? 'Завершить' : 'Далее'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// ── Phase 4: Results ────────────────────────────────────────────────────────

function ResultsPhase() {
  const {
    diagnosticTaken, diagnosticScores, selectedSubjects,
    subjectLevels, generatePlan, setPhase,
  } = useCuratorStore()

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="mx-auto max-w-3xl px-4 py-12">
      <motion.button
        variants={fadeUp}
        onClick={() => setPhase('subjects')}
        className="mb-8 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к предметам
      </motion.button>

      <motion.div variants={fadeUp} className="mb-10 text-center">
        <div className="mb-4 text-5xl">
          {diagnosticTaken ? '🎯' : '🚀'}
        </div>
        <h2 className="mb-3 text-3xl font-bold text-slate-900">
          {diagnosticTaken ? 'Результаты диагностики' : 'Всё готово для старта!'}
        </h2>
        <p className="text-slate-500">
          {diagnosticTaken
            ? 'Вот как мы оцениваем твой текущий уровень по каждому предмету'
            : 'На основе твоей самооценки мы составим персональный план обучения'}
        </p>
      </motion.div>

      {/* Subject cards */}
      <motion.div variants={stagger} className="mb-8 space-y-3">
        {selectedSubjects.map(subject => {
          const diagScore = diagnosticScores.find(s => s.subject === subject)
          const selfLevel = subjectLevels[subject] || 'intermediate'
          const finalLevel = diagScore ? diagScore.level : selfLevel
          const colors = LEVEL_COLORS[finalLevel]

          return (
            <motion.div
              key={subject}
              variants={fadeUp}
              className={cn('rounded-2xl border p-5', colors.border, colors.bg)}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">{SUBJECT_ICONS[subject]}</div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{SUBJECT_NAMES[subject]}</span>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', colors.text, colors.bg)}>
                      {CURATOR_LEVEL_EMOJI[finalLevel]} {CURATOR_LEVEL_NAMES[finalLevel]}
                    </span>
                  </div>

                  {diagScore && (
                    <div className="flex items-center gap-3">
                      {/* Score bar */}
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/60">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: SUBJECT_COLORS[subject] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(diagScore.score / diagScore.maxScore) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        {diagScore.score}/{diagScore.maxScore}
                      </span>
                    </div>
                  )}

                  {/* Show comparison if diagnostic was taken */}
                  {diagScore && selfLevel !== diagScore.level && (
                    <p className="mt-1 text-xs text-slate-500">
                      Ты оценил себя как «{CURATOR_LEVEL_NAMES[selfLevel]}» →
                      тест показал «{CURATOR_LEVEL_NAMES[diagScore.level]}»
                      {diagScore.level === 'advanced' && ' 🎉'}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Encouragement */}
      <motion.div variants={fadeUp} className="mb-8 rounded-2xl bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100 p-5 text-center">
        <p className="text-sm text-primary-700">
          {diagnosticTaken
            ? '✨ Отлично! Мы учли результаты теста и составим план, уделяя больше внимания слабым темам'
            : '✨ Ты всегда можешь пройти диагностику позже — план будет скорректирован'}
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div variants={fadeUp} className="text-center">
        <button
          onClick={generatePlan}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary-200 transition-all hover:bg-primary-700 hover:shadow-xl"
        >
          <Sparkles className="h-5 w-5" />
          Получить план обучения
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── Phase 5: Plan View ──────────────────────────────────────────────────────

function PlanView() {
  const { plan, openModule, setPhase, moduleProgress } = useCuratorStore()
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1)

  if (!plan) return null

  const completedModules = plan.weeks
    .flatMap(w => w.modules)
    .filter(m => m.status === 'completed').length
  const totalModules = plan.totalModules
  const progressPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
              <Target className="h-3.5 w-3.5" />
              {plan.goalType === 'ent' ? 'Подготовка к ЕНТ' : 'Подготовка к IELTS'}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Твой план обучения</h2>
          </div>
          <button
            onClick={() => setPhase('progress')}
            className="flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-2.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
          >
            <BarChart3 className="h-4 w-4" />
            Мой прогресс
          </button>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div variants={fadeUp} className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{plan.weeks.length}</div>
          <div className="text-xs text-blue-500">Недель</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-700">{completedModules}/{totalModules}</div>
          <div className="text-xs text-emerald-500">Модулей</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 p-4 text-center">
          <div className="text-2xl font-bold text-purple-700">{progressPct}%</div>
          <div className="text-xs text-purple-500">Прогресс</div>
        </div>
      </motion.div>

      {/* Overall progress bar */}
      <motion.div variants={fadeUp} className="mb-8">
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Weeks */}
      <motion.div variants={stagger} className="space-y-3">
        {plan.weeks.map(week => {
          const isExpanded = expandedWeek === week.weekNumber
          const weekCompleted = week.modules.every(m => m.status === 'completed')
          const weekModulesCompleted = week.modules.filter(m => m.status === 'completed').length

          return (
            <motion.div key={week.weekNumber} variants={fadeUp}>
              <button
                onClick={() => setExpandedWeek(isExpanded ? null : week.weekNumber)}
                className={cn(
                  'w-full rounded-2xl border-2 p-4 text-left transition-all',
                  !week.unlocked && 'opacity-60',
                  weekCompleted
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : week.unlocked
                      ? 'border-primary-100 bg-white hover:border-primary-200 hover:shadow-sm'
                      : 'border-slate-100 bg-slate-50'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold',
                    weekCompleted
                      ? 'bg-emerald-100 text-emerald-600'
                      : week.unlocked
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-slate-100 text-slate-400'
                  )}>
                    {weekCompleted ? <Check className="h-5 w-5" /> : week.unlocked ? week.weekNumber : <Lock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">Неделя {week.weekNumber}</span>
                      {weekCompleted && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                          Завершено
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-slate-500">{week.theme}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {weekModulesCompleted}/{week.modules.length}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>
              </button>

              {/* Expanded modules */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-2 pl-14">
                      {week.modules.map(mod => {
                        const progress = moduleProgress[mod.id]
                        const isCompleted = mod.status === 'completed'
                        const isAvailable = mod.status === 'available' || mod.status === 'in-progress'

                        return (
                          <button
                            key={mod.id}
                            onClick={() => isAvailable && openModule(mod.id)}
                            disabled={!isAvailable}
                            className={cn(
                              'w-full rounded-xl border p-3.5 text-left transition-all',
                              isCompleted
                                ? 'border-emerald-200 bg-emerald-50'
                                : isAvailable
                                  ? 'border-slate-200 bg-white hover:border-primary-200 hover:shadow-sm cursor-pointer'
                                  : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                                style={isAvailable || isCompleted ? {
                                  backgroundColor: SUBJECT_COLORS[mod.subject] + '15',
                                  color: SUBJECT_COLORS[mod.subject],
                                } : undefined}
                              >
                                {isCompleted ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
                                  isAvailable ? <Play className="h-4 w-4" /> :
                                    <Lock className="h-3.5 w-3.5 text-slate-300" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-700">{mod.topic}</div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <span>{SUBJECT_NAMES[mod.subject]}</span>
                                  {isCompleted && progress?.testScore !== undefined && (
                                    <span className="text-emerald-500 font-medium">Тест: {progress.testScore}%</span>
                                  )}
                                </div>
                              </div>
                              {isAvailable && <ChevronRight className="h-4 w-4 text-slate-300" />}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}

// ── Phase 6: Module Viewer ──────────────────────────────────────────────────

function ModuleViewer() {
  const {
    plan, activeModuleId, closeModule, moduleProgress, submitPracticeAnswer, submitModuleTest,
    directModule, directModuleInitialTab, closeDirectModule,
  } = useCuratorStore()

  const isDirectMode = !!directModule
  const [activeTab, setActiveTab] = useState<'theory' | 'practice' | 'test'>(
    directModule ? directModuleInitialTab : 'theory'
  )
  const [practiceIdx, setPracticeIdx] = useState(0)
  const [showPracticeResult, setShowPracticeResult] = useState(false)
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({})
  const [testSubmitted, setTestSubmitted] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const mod = useMemo(() => {
    if (directModule) return directModule
    if (!plan || !activeModuleId) return null
    return plan.weeks.flatMap(w => w.modules).find(m => m.id === activeModuleId) || null
  }, [plan, activeModuleId, directModule])

  const moduleId = mod?.id
  const progress = moduleId ? moduleProgress[moduleId] : undefined

  if (!mod) return null

  const handleBack = () => {
    if (isDirectMode) closeDirectModule()
    else closeModule()
  }

  const currentPractice = mod.practice[practiceIdx]
  const practiceAnswer = progress?.practiceAnswers[currentPractice?.id]
  const allPracticeAnswered = mod.practice.every(p => progress?.practiceAnswers[p.id] !== undefined)

  const tabs = [
    { id: 'theory' as const, label: 'Теория', icon: BookOpen },
    { id: 'practice' as const, label: 'Практика', icon: Brain },
    { id: 'test' as const, label: 'Тест', icon: Target },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isDirectMode ? 'Назад' : 'Назад к плану'}
        </button>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: SUBJECT_COLORS[mod.subject] }}
        >
          {SUBJECT_NAMES[mod.subject]}
        </span>
      </div>

      <h2 className="mb-6 text-2xl font-bold text-slate-900">{mod.topic}</h2>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Theory Tab ─── */}
        {activeTab === 'theory' && (
          <motion.div key="theory" {...slideIn}>
            <div className="space-y-6">
              {mod.theory.sections.map((section, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-6">
                  <h3 className="mb-3 text-lg font-semibold text-slate-800">{section.heading}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{section.content}</p>
                </div>
              ))}

              {/* Key points */}
              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-800">
                  <Lightbulb className="h-4 w-4" />
                  Ключевые моменты
                </div>
                <ul className="space-y-2">
                  {mod.theory.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-amber-700">
                      <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Formulas */}
              {mod.theory.formulas && mod.theory.formulas.length > 0 && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                  <div className="mb-3 text-sm font-semibold text-blue-800">Формулы</div>
                  <div className="flex flex-wrap gap-2">
                    {mod.theory.formulas.map((f, idx) => (
                      <code key={idx} className="rounded-lg bg-white px-3 py-1.5 text-sm font-mono text-blue-700 border border-blue-100">
                        {f}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setActiveTab('practice')}
                className="w-full rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Перейти к практике →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Practice Tab ─── */}
        {activeTab === 'practice' && (
          <motion.div key="practice" {...slideIn}>
            {/* Progress dots */}
            <div className="mb-6 flex items-center justify-center gap-2">
              {mod.practice.map((p, idx) => {
                const answered = progress?.practiceAnswers[p.id] !== undefined
                const correct = answered && progress?.practiceAnswers[p.id] === p.correctAnswer
                return (
                  <button
                    key={idx}
                    onClick={() => { setPracticeIdx(idx); setShowPracticeResult(false); setShowHint(false) }}
                    className={cn(
                      'h-3 w-3 rounded-full transition-all',
                      idx === practiceIdx && 'ring-2 ring-offset-2',
                      answered
                        ? correct ? 'bg-emerald-400 ring-emerald-400' : 'bg-red-400 ring-red-400'
                        : idx === practiceIdx ? 'bg-primary-400 ring-primary-400' : 'bg-slate-200'
                    )}
                  />
                )
              })}
            </div>

            {currentPractice && (
              <div>
                <div className="mb-4 text-xs text-slate-400">
                  Вопрос {practiceIdx + 1} из {mod.practice.length}
                </div>

                <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5">
                  <p className="text-base font-medium text-slate-800">{currentPractice.text}</p>
                </div>

                <div className="mb-4 space-y-2.5">
                  {currentPractice.options.map((option, idx) => {
                    const isAnswered = practiceAnswer !== undefined || showPracticeResult
                    const isSelected = practiceAnswer === idx
                    const isCorrect = idx === currentPractice.correctAnswer

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (practiceAnswer !== undefined) return
                          submitPracticeAnswer(mod.id, currentPractice.id, idx)
                          setShowPracticeResult(true)
                        }}
                        disabled={practiceAnswer !== undefined}
                        className={cn(
                          'w-full rounded-xl border-2 p-3.5 text-left transition-all',
                          isAnswered && isCorrect && 'border-emerald-300 bg-emerald-50',
                          isAnswered && isSelected && !isCorrect && 'border-red-300 bg-red-50',
                          !isAnswered && 'border-slate-100 hover:border-slate-200',
                          !isAnswered && 'cursor-pointer'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                            isAnswered && isCorrect && 'bg-emerald-500 text-white',
                            isAnswered && isSelected && !isCorrect && 'bg-red-500 text-white',
                            !isAnswered && 'bg-slate-100 text-slate-500'
                          )}>
                            {isAnswered && isCorrect ? <Check className="h-3.5 w-3.5" /> :
                              isAnswered && isSelected && !isCorrect ? <XCircle className="h-3.5 w-3.5" /> :
                                String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-sm text-slate-700">{option}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Hint */}
                {practiceAnswer === undefined && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="mb-4 flex items-center gap-2 text-xs text-amber-600 hover:text-amber-700"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    {showHint ? 'Скрыть подсказку' : 'Показать подсказку'}
                  </button>
                )}
                <AnimatePresence>
                  {showHint && practiceAnswer === undefined && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-4 overflow-hidden rounded-xl bg-amber-50 border border-amber-100 p-3"
                    >
                      <p className="text-xs text-amber-700">💡 {currentPractice.hint}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Explanation after answer */}
                {practiceAnswer !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-xl bg-blue-50 border border-blue-100 p-4"
                  >
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">Объяснение:</span> {currentPractice.explanation}
                    </p>
                  </motion.div>
                )}

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={() => { setPracticeIdx(Math.max(0, practiceIdx - 1)); setShowPracticeResult(false); setShowHint(false) }}
                    disabled={practiceIdx === 0}
                    className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                  >
                    ← Назад
                  </button>

                  {practiceIdx < mod.practice.length - 1 ? (
                    <button
                      onClick={() => { setPracticeIdx(practiceIdx + 1); setShowPracticeResult(false); setShowHint(false) }}
                      className="rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100"
                    >
                      Далее →
                    </button>
                  ) : allPracticeAnswered ? (
                    <button
                      onClick={() => setActiveTab('test')}
                      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                    >
                      Перейти к тесту →
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Test Tab ─── */}
        {activeTab === 'test' && (
          <motion.div key="test" {...slideIn}>
            {!testSubmitted ? (
              <div>
                <div className="mb-6 rounded-2xl border border-purple-100 bg-purple-50/50 p-4 text-center">
                  <p className="text-sm text-purple-700">
                    📝 Ответь на все вопросы и нажми «Завершить тест». Проходной балл — 70%.
                  </p>
                </div>

                <div className="space-y-4">
                  {mod.test.map((q, qIdx) => (
                    <div key={q.id} className="rounded-2xl border border-slate-100 bg-white p-5">
                      <p className="mb-3 text-sm font-medium text-slate-800">
                        {qIdx + 1}. {q.text}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => setTestAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                            className={cn(
                              'w-full rounded-lg border p-3 text-left text-sm transition-all',
                              testAnswers[q.id] === optIdx
                                ? 'border-primary-400 bg-primary-50 text-primary-700'
                                : 'border-slate-100 text-slate-600 hover:border-slate-200'
                            )}
                          >
                            <span className="mr-2 font-medium">{String.fromCharCode(65 + optIdx)}.</span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    submitModuleTest(mod.id, testAnswers)
                    setTestSubmitted(true)
                  }}
                  disabled={Object.keys(testAnswers).length < mod.test.length}
                  className={cn(
                    'mt-6 w-full rounded-xl py-3.5 text-sm font-semibold transition-all',
                    Object.keys(testAnswers).length >= mod.test.length
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  )}
                >
                  Завершить тест ({Object.keys(testAnswers).length}/{mod.test.length} отвечено)
                </button>
              </div>
            ) : (
              /* Test Results */
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                {(() => {
                  const testProgress = moduleProgress[mod.id]
                  const score = testProgress?.testScore ?? 0
                  const passed = score >= 70

                  return (
                    <div className="text-center">
                      <div className="mb-6 text-6xl">{passed ? '🎉' : '💪'}</div>
                      <h3 className="mb-2 text-2xl font-bold text-slate-900">
                        {passed ? 'Отлично! Модуль пройден!' : 'Попробуй ещё раз'}
                      </h3>
                      <p className="mb-6 text-slate-500">
                        {passed
                          ? `Ты набрал ${score}% — это достойный результат!`
                          : `Ты набрал ${score}%. Нужно минимум 70% для прохождения. Повтори теорию и попробуй снова.`}
                      </p>

                      {/* Score ring */}
                      <div className="mb-8 flex justify-center">
                        <div className={cn(
                          'flex h-24 w-24 items-center justify-center rounded-full border-4',
                          passed ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'
                        )}>
                          <span className={cn('text-2xl font-bold', passed ? 'text-emerald-600' : 'text-amber-600')}>
                            {score}%
                          </span>
                        </div>
                      </div>

                      {/* Question review */}
                      <div className="mb-8 space-y-3 text-left">
                        {mod.test.map((q, idx) => {
                          const userAns = testAnswers[q.id]
                          const correct = userAns === q.correctAnswer
                          return (
                            <div key={q.id} className={cn(
                              'rounded-xl border p-4',
                              correct ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'
                            )}>
                              <div className="mb-1 flex items-center gap-2">
                                {correct
                                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                  : <XCircle className="h-4 w-4 text-red-500" />}
                                <span className="text-sm font-medium text-slate-700">{idx + 1}. {q.text}</span>
                              </div>
                              {!correct && (
                                <p className="ml-6 text-xs text-slate-500">
                                  Правильный ответ: {q.options[q.correctAnswer]}. {q.explanation}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        {passed ? (
                          <button
                            onClick={handleBack}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
                          >
                            <ArrowRight className="h-4 w-4" />
                            {isDirectMode ? 'Готово' : 'Вернуться к плану'}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => { setActiveTab('theory'); setTestSubmitted(false); setTestAnswers({}) }}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Повторить теорию
                            </button>
                            <button
                              onClick={() => { setTestSubmitted(false); setTestAnswers({}) }}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                              Пересдать тест
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Phase 7: Progress Dashboard ─────────────────────────────────────────────

function ProgressDashboard() {
  const { plan, moduleProgress, setPhase } = useCuratorStore()

  if (!plan) return null

  const allModules = plan.weeks.flatMap(w => w.modules)
  const completed = allModules.filter(m => m.status === 'completed')
  const progressPct = allModules.length > 0 ? Math.round((completed.length / allModules.length) * 100) : 0

  // Per-subject stats
  const subjectStats = plan.subjects.map(subject => {
    const subjectModules = allModules.filter(m => m.subject === subject)
    const subjectCompleted = subjectModules.filter(m => m.status === 'completed')
    const avgScore = subjectCompleted.length > 0
      ? Math.round(subjectCompleted.reduce((sum, m) => sum + (moduleProgress[m.id]?.testScore ?? 0), 0) / subjectCompleted.length)
      : 0
    return {
      subject,
      total: subjectModules.length,
      completed: subjectCompleted.length,
      avgScore,
      pct: subjectModules.length > 0 ? Math.round((subjectCompleted.length / subjectModules.length) * 100) : 0,
    }
  })

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="mx-auto max-w-3xl px-4 py-12">
      <motion.button
        variants={fadeUp}
        onClick={() => setPhase('plan')}
        className="mb-8 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к плану
      </motion.button>

      <motion.div variants={fadeUp} className="mb-10 text-center">
        <h2 className="mb-2 text-3xl font-bold text-slate-900">Мой прогресс</h2>
        <p className="text-slate-500">Общая картина твоего обучения</p>
      </motion.div>

      {/* Big progress ring */}
      <motion.div variants={fadeUp} className="mb-10 flex justify-center">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <svg className="absolute inset-0" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <motion.circle
              cx="80" cy="80" r="70" fill="none"
              stroke="url(#progressGradient)" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 70}
              initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - progressPct / 100) }}
              transition={{ duration: 1.5, delay: 0.3 }}
              transform="rotate(-90 80 80)"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">{progressPct}%</div>
            <div className="text-xs text-slate-500">пройдено</div>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={fadeUp} className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-100 p-4 text-center shadow-sm">
          <Trophy className="mx-auto mb-2 h-6 w-6 text-amber-500" />
          <div className="text-xl font-bold text-slate-800">{completed.length}</div>
          <div className="text-xs text-slate-500">Модулей пройдено</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-4 text-center shadow-sm">
          <BookOpen className="mx-auto mb-2 h-6 w-6 text-blue-500" />
          <div className="text-xl font-bold text-slate-800">{allModules.length - completed.length}</div>
          <div className="text-xs text-slate-500">Осталось</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-4 text-center shadow-sm">
          <Clock className="mx-auto mb-2 h-6 w-6 text-emerald-500" />
          <div className="text-xl font-bold text-slate-800">{plan.weeks.length}</div>
          <div className="text-xs text-slate-500">Недель в плане</div>
        </div>
      </motion.div>

      {/* Per-subject progress */}
      <motion.div variants={fadeUp} className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Прогресс по предметам</h3>
        <div className="space-y-3">
          {subjectStats.map(stat => (
            <div key={stat.subject} className="rounded-xl border border-slate-100 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{SUBJECT_ICONS[stat.subject]}</span>
                  <span className="text-sm font-semibold text-slate-700">{SUBJECT_NAMES[stat.subject]}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{stat.completed}/{stat.total} модулей</span>
                  {stat.avgScore > 0 && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-600">
                      avg {stat.avgScore}%
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: SUBJECT_COLORS[stat.subject] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div variants={fadeUp} className="text-center">
        <button
          onClick={() => setPhase('plan')}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition-all hover:bg-primary-700"
        >
          <Play className="h-4 w-4" />
          Продолжить обучение
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── Main Curator Page ───────────────────────────────────────────────────────

export default function Curator() {
  const { phase } = useCuratorStore()

  const phaseComponents: Record<CuratorPhase, React.ReactNode> = {
    goal: <GoalSelection />,
    subjects: <SubjectSelection />,
    diagnostic: <DiagnosticPhase />,
    results: <ResultsPhase />,
    plan: <PlanView />,
    module: <ModuleViewer />,
    progress: <ProgressDashboard />,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {phaseComponents[phase]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
