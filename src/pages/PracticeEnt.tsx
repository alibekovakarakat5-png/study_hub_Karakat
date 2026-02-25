import { useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  Circle,
  Flag,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trophy,
  AlertTriangle,
  BookOpen,
  Target,
  BarChart3,
  Sparkles,
  Timer,
  Eye,
  X,
} from 'lucide-react'
import { usePracticeEntStore } from '@/store/usePracticeEntStore'
import { examVariants, profileBanks } from '@/data/practiceEnt'
import { SUBJECT_NAMES, SUBJECT_COLORS } from '@/types'
import type { Subject } from '@/types'
import {
  ENT_BLOCK_NAMES,
  ENT_PROFILE_SUBJECT_PAIRS,
  ENT_TOTAL_MINUTES,
  ENT_TOTAL_QUESTIONS,
} from '@/types/practiceEnt'
import type { EntBlock, EntBlockResult } from '@/types/practiceEnt'

// ── Animation variants ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function getBlockLabel(block: EntBlock, s1?: Subject | null, s2?: Subject | null): string {
  if (block === 'profile1' && s1) return SUBJECT_NAMES[s1]
  if (block === 'profile2' && s2) return SUBJECT_NAMES[s2]
  return ENT_BLOCK_NAMES[block]
}

const BLOCK_COLORS: Record<EntBlock, string> = {
  mathLiteracy: '#2563eb',
  readingLiteracy: '#7c3aed',
  history: '#d97706',
  profile1: '#059669',
  profile2: '#dc2626',
}

// ── Select Phase ────────────────────────────────────────────────────────────

function SelectPhase() {
  const { selectedVariantId, selectVariant, profileSubject1, profileSubject2, setProfileSubjects, startExam, history } = usePracticeEntStore()

  const availableSubjects = useMemo(
    () => profileBanks.map(b => b.subject),
    [],
  )

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <motion.div variants={fadeUp} className="text-center">
        <Link to="/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Назад
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Пробный ЕНТ</span>
        </h1>
        <p className="mt-2 text-gray-500">{ENT_TOTAL_QUESTIONS} вопросов &middot; {ENT_TOTAL_MINUTES} минут &middot; Формат реального экзамена</p>
      </motion.div>

      {/* Variant select */}
      <motion.div variants={fadeUp} className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">1. Выберите вариант</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {examVariants.map(v => (
            <button
              key={v.id}
              onClick={() => selectVariant(v.id)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${selectedVariantId === v.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className="font-semibold text-gray-900">{v.title}</div>
              <div className="mt-1 text-sm text-gray-500">{v.description}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Profile subjects */}
      <motion.div variants={fadeUp} className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">2. Профильные предметы</h2>
        <p className="text-sm text-gray-500">Выберите пару или укажите вручную</p>

        {/* Quick pairs */}
        <div className="flex flex-wrap gap-2">
          {ENT_PROFILE_SUBJECT_PAIRS.filter(p => availableSubjects.includes(p.subjects[0]) && availableSubjects.includes(p.subjects[1])).map(pair => (
            <button
              key={pair.label}
              onClick={() => setProfileSubjects(pair.subjects[0], pair.subjects[1])}
              className={`rounded-full border px-3 py-1.5 text-sm transition-all ${profileSubject1 === pair.subjects[0] && profileSubject2 === pair.subjects[1] ? 'border-blue-500 bg-blue-100 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {pair.label}
            </button>
          ))}
        </div>

        {/* Manual select */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">Профильный 1</label>
            <select
              value={profileSubject1 ?? ''}
              onChange={e => {
                const s = e.target.value as Subject
                setProfileSubjects(s, profileSubject2 ?? (availableSubjects.find(x => x !== s) ?? 'physics'))
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Выберите...</option>
              {availableSubjects.map(s => (
                <option key={s} value={s} disabled={s === profileSubject2}>{SUBJECT_NAMES[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">Профильный 2</label>
            <select
              value={profileSubject2 ?? ''}
              onChange={e => {
                const s = e.target.value as Subject
                setProfileSubjects(profileSubject1 ?? (availableSubjects.find(x => x !== s) ?? 'math'), s)
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Выберите...</option>
              {availableSubjects.map(s => (
                <option key={s} value={s} disabled={s === profileSubject1}>{SUBJECT_NAMES[s]}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Start button */}
      <motion.div variants={fadeUp} className="pt-2">
        <button
          onClick={startExam}
          disabled={!selectedVariantId || !profileSubject1 || !profileSubject2}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Timer className="mr-2 inline h-5 w-5" />
          Начать экзамен
        </button>
      </motion.div>

      {/* History */}
      {history.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">История попыток</h2>
          <div className="space-y-2">
            {history.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
                <div>
                  <div className="font-medium text-gray-800">{r.variantTitle}</div>
                  <div className="text-sm text-gray-500">
                    {SUBJECT_NAMES[r.profileSubject1]} + {SUBJECT_NAMES[r.profileSubject2]} &middot; {new Date(r.date).toLocaleDateString('ru-RU')}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${r.percentage >= 70 ? 'text-emerald-600' : r.percentage >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                    {r.totalCorrect}/{r.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-500">{r.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Exam Phase ──────────────────────────────────────────────────────────────

function ExamPhase() {
  const {
    exam, answers, currentBlockIndex, currentQuestionIndex,
    timeRemainingSeconds, tick, setAnswer, toggleFlag, nextQuestion, prevQuestion,
    navigateTo, finishExam, profileSubject1, profileSubject2,
  } = usePracticeEntStore()

  // Timer
  useEffect(() => {
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [tick])

  const confirmFinish = useCallback(() => {
    const unanswered = Object.values(answers).filter(a => a.selectedAnswer === null).length
    if (unanswered > 0) {
      if (!window.confirm(`У вас ${unanswered} неотвеченных вопросов. Завершить экзамен?`)) return
    }
    finishExam()
  }, [answers, finishExam])

  if (!exam) return null

  const currentBlock = exam.blocks[currentBlockIndex]
  const currentQuestion = currentBlock.questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestion.id]

  const totalAnswered = Object.values(answers).filter(a => a.selectedAnswer !== null).length
  const totalFlagged = Object.values(answers).filter(a => a.flagged).length
  const totalQ = Object.values(answers).length

  const isUrgent = timeRemainingSeconds < 600 // < 10 min

  // Global question index
  let globalIndex = 0
  for (let b = 0; b < currentBlockIndex; b++) globalIndex += exam.blocks[b].questions.length
  globalIndex += currentQuestionIndex

  return (
    <div className="mx-auto flex max-w-6xl gap-4">
      {/* Main question area */}
      <div className="flex-1 space-y-4">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-gray-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium" style={{ color: BLOCK_COLORS[currentBlock.block] }}>
              {getBlockLabel(currentBlock.block, profileSubject1, profileSubject2)}
            </span>
            <span className="text-sm text-gray-500">
              Вопрос {currentQuestionIndex + 1}/{currentBlock.questions.length}
            </span>
          </div>
          <div className={`flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-mono font-bold ${isUrgent ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
            <Clock className="h-4 w-4" />
            {formatTime(timeRemainingSeconds)}
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">#{globalIndex + 1} из {totalQ}</span>
              <button
                onClick={() => toggleFlag(currentQuestion.id)}
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors ${currentAnswer.flagged ? 'bg-amber-100 text-amber-600' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <Flag className="h-3.5 w-3.5" />
                {currentAnswer.flagged ? 'Помечен' : 'Пометить'}
              </button>
            </div>

            <p className="mb-6 text-lg leading-relaxed text-gray-900 whitespace-pre-line">{currentQuestion.text}</p>

            <div className="space-y-3">
              {currentQuestion.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i)
                const isSelected = currentAnswer.selectedAnswer === i
                return (
                  <button
                    key={i}
                    onClick={() => setAnswer(currentQuestion.id, i)}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {letter}
                    </span>
                    <span className="text-gray-800">{opt}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={prevQuestion} disabled={currentBlockIndex === 0 && currentQuestionIndex === 0} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" /> Назад
          </button>

          {currentBlockIndex === exam.blocks.length - 1 && currentQuestionIndex === currentBlock.questions.length - 1 ? (
            <button onClick={confirmFinish} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Завершить
            </button>
          ) : (
            <button onClick={nextQuestion} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
              Далее <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Side panel — question map */}
      <div className="hidden w-72 shrink-0 space-y-4 lg:block">
        <div className="sticky top-0 space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Отвечено: <b className="text-gray-800">{totalAnswered}/{totalQ}</b></span>
            {totalFlagged > 0 && <span className="text-amber-500"><Flag className="mr-1 inline h-3.5 w-3.5" />{totalFlagged}</span>}
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${(totalAnswered / totalQ) * 100}%` }} />
          </div>

          {/* Blocks */}
          {exam.blocks.map((block, bi) => (
            <div key={bi}>
              <div className="mb-1.5 text-xs font-semibold text-gray-400 uppercase">
                {getBlockLabel(block.block, profileSubject1, profileSubject2)}
              </div>
              <div className="flex flex-wrap gap-1">
                {block.questions.map((q, qi) => {
                  const a = answers[q.id]
                  const isActive = bi === currentBlockIndex && qi === currentQuestionIndex
                  const isAnswered = a?.selectedAnswer !== null
                  const isFlagged = a?.flagged
                  return (
                    <button
                      key={q.id}
                      onClick={() => navigateTo(bi, qi)}
                      className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition-all
                        ${isActive ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                        ${isAnswered ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                        ${isFlagged && !isAnswered ? 'bg-amber-100 text-amber-600' : ''}
                        ${isFlagged && isAnswered ? 'bg-blue-500 text-white ring-2 ring-amber-400' : ''}
                      `}
                    >
                      {qi + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <button onClick={confirmFinish} className="mt-2 w-full rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100">
            Завершить экзамен
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Results Phase ───────────────────────────────────────────────────────────

function ResultsPhase() {
  const { currentResult, resetSession, reviewQuestion, profileSubject1, profileSubject2 } = usePracticeEntStore()

  if (!currentResult) return null

  const r = currentResult
  const passed = r.percentage >= 50

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="text-center">
        <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {passed ? <Trophy className="h-10 w-10 text-emerald-600" /> : <AlertTriangle className="h-10 w-10 text-red-500" />}
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{r.variantTitle}</h1>
        <p className="mt-1 text-gray-500">
          {SUBJECT_NAMES[r.profileSubject1]} + {SUBJECT_NAMES[r.profileSubject2]} &middot; {new Date(r.date).toLocaleDateString('ru-RU')}
        </p>
      </motion.div>

      {/* Score card */}
      <motion.div variants={fadeUp} className={`rounded-2xl p-6 text-center text-white ${passed ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
        <div className="text-5xl font-bold">{r.totalCorrect} / {r.totalQuestions}</div>
        <div className="mt-1 text-lg opacity-80">{r.percentage}% правильных</div>
        <div className="mt-2 text-sm opacity-60">Время: {r.timeSpentMinutes} мин из {ENT_TOTAL_MINUTES}</div>
      </motion.div>

      {/* Block results */}
      <motion.div variants={fadeUp} className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Результаты по блокам</h2>
        {r.blocks.map((block, bi) => (
          <BlockResultCard key={bi} block={block} blockIndex={bi} s1={profileSubject1} s2={profileSubject2} onReview={reviewQuestion} />
        ))}
      </motion.div>

      {/* Actions */}
      <motion.div variants={fadeUp} className="flex gap-3">
        <button onClick={resetSession} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50">
          <RotateCcw className="h-4 w-4" /> Новая попытка
        </button>
        <Link to="/dashboard" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700">
          На главную <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </motion.div>
  )
}

function BlockResultCard({ block, blockIndex, s1, s2, onReview }: { block: EntBlockResult; blockIndex: number; s1: Subject | null; s2: Subject | null; onReview: (bi: number, qi: number) => void }) {
  const pct = block.percentage
  const color = pct >= 70 ? 'emerald' : pct >= 50 ? 'amber' : 'red'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium text-gray-800">{getBlockLabel(block.block, s1, s2)}</div>
        <div className={`text-lg font-bold text-${color}-600`}>{block.correctAnswers}/{block.totalQuestions}</div>
      </div>
      {/* Bar */}
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full bg-${color}-500 transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>{pct}%</span>
        <button onClick={() => onReview(blockIndex, 0)} className="flex items-center gap-1 text-blue-500 hover:text-blue-700">
          <Eye className="h-3 w-3" /> Просмотреть
        </button>
      </div>
    </div>
  )
}

// ── Review Phase ────────────────────────────────────────────────────────────

function ReviewPhase() {
  const { exam, answers, currentBlockIndex, currentQuestionIndex, navigateTo, setPhase, profileSubject1, profileSubject2 } = usePracticeEntStore()

  if (!exam) return null

  const block = exam.blocks[currentBlockIndex]
  const question = block.questions[currentQuestionIndex]
  const answer = answers[question.id]

  const isCorrect = answer.selectedAnswer === question.correctAnswer
  const wasAnswered = answer.selectedAnswer !== null

  const goNext = () => {
    if (currentQuestionIndex < block.questions.length - 1) {
      navigateTo(currentBlockIndex, currentQuestionIndex + 1)
    } else if (currentBlockIndex < exam.blocks.length - 1) {
      navigateTo(currentBlockIndex + 1, 0)
    }
  }

  const goPrev = () => {
    if (currentQuestionIndex > 0) {
      navigateTo(currentBlockIndex, currentQuestionIndex - 1)
    } else if (currentBlockIndex > 0) {
      const prevBlock = exam.blocks[currentBlockIndex - 1]
      navigateTo(currentBlockIndex - 1, prevBlock.questions.length - 1)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
        <span className="text-sm font-medium" style={{ color: BLOCK_COLORS[block.block] }}>
          {getBlockLabel(block.block, profileSubject1, profileSubject2)} — Вопрос {currentQuestionIndex + 1}/{block.questions.length}
        </span>
        <button onClick={() => setPhase('results')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4" /> К результатам
        </button>
      </div>

      {/* Question with answer */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="mb-6 text-lg leading-relaxed text-gray-900 whitespace-pre-line">{question.text}</p>

        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i)
            const isUserAnswer = answer.selectedAnswer === i
            const isCorrectAnswer = question.correctAnswer === i

            let classes = 'border-gray-200 bg-white'
            if (isCorrectAnswer) classes = 'border-emerald-500 bg-emerald-50'
            if (isUserAnswer && !isCorrectAnswer) classes = 'border-red-500 bg-red-50'

            return (
              <div key={i} className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 ${classes}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isCorrectAnswer ? 'bg-emerald-500 text-white' : isUserAnswer ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {letter}
                </span>
                <span className="flex-1 text-gray-800">{opt}</span>
                {isCorrectAnswer && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {isUserAnswer && !isCorrectAnswer && <X className="h-5 w-5 text-red-500" />}
              </div>
            )
          })}
        </div>

        {/* Explanation */}
        <div className={`mt-4 rounded-lg p-4 ${isCorrect ? 'bg-emerald-50' : wasAnswered ? 'bg-red-50' : 'bg-gray-50'}`}>
          <div className="mb-1 text-sm font-semibold text-gray-700">
            {isCorrect ? 'Правильно!' : wasAnswered ? 'Неправильно' : 'Без ответа'}
          </div>
          <p className="text-sm text-gray-600">{question.explanation}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={goPrev} disabled={currentBlockIndex === 0 && currentQuestionIndex === 0} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" /> Назад
        </button>
        <button onClick={goNext} disabled={currentBlockIndex === exam.blocks.length - 1 && currentQuestionIndex === block.questions.length - 1} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-30">
          Далее <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function PracticeEnt() {
  const { phase } = usePracticeEntStore()

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      {phase === 'select' && <SelectPhase />}
      {phase === 'exam' && <ExamPhase />}
      {phase === 'results' && <ResultsPhase />}
      {phase === 'review' && <ReviewPhase />}
    </div>
  )
}
