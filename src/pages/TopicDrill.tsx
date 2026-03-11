import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, CheckCircle2, XCircle, Zap, RotateCcw, Trophy, Target } from 'lucide-react'
import { examVariants, profileBanks } from '@/data/practiceEnt'
import type { EntQuestion } from '@/types/practiceEnt'
import { cn } from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

const SUBJECT_LABELS: Record<string, string> = {
  math: 'Математика',
  physics: 'Физика',
  chemistry: 'Химия',
  biology: 'Биология',
  english: 'Английский',
  geography: 'География',
  informatics: 'Информатика',
  history: 'История КЗ',
  mathLiteracy: 'Мат. грамотность',
  readingLiteracy: 'Чтение',
}

function getAllQuestions(subject: string): EntQuestion[] {
  // Try profile banks
  const bank = profileBanks.find(b => b.subject === subject)
  if (bank) return bank.questions

  // Try mandatory blocks
  const variant = examVariants[0]
  if (!variant) return []
  if (subject === 'mathLiteracy') return variant.mandatory.mathLiteracy
  if (subject === 'readingLiteracy') return variant.mandatory.readingLiteracy
  if (subject === 'history') return variant.mandatory.history

  return []
}

function getTopics(questions: EntQuestion[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const q of questions) {
    if (!seen.has(q.topic)) { seen.add(q.topic); result.push(q.topic) }
  }
  return result
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const DRILL_COUNT = 10
const SECONDS_PER_QUESTION = 45

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SelectPhase({
  subject,
  topics,
  onStart,
}: {
  subject: string
  topics: string[]
  onStart: (topic: string | null) => void
}) {
  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } }, hidden: {} }} className="space-y-4">
      <motion.div variants={fadeUp} className="text-center space-y-1">
        <h1 className="text-white text-2xl font-bold">🎯 Тренировка по теме</h1>
        <p className="text-white/60 text-sm">{SUBJECT_LABELS[subject] ?? subject} — {DRILL_COUNT} вопросов, {SECONDS_PER_QUESTION}с на каждый</p>
      </motion.div>

      <motion.button
        variants={fadeUp}
        type="button"
        onClick={() => onStart(null)}
        className="w-full flex items-center justify-between bg-blue-600/80 hover:bg-blue-600 text-white rounded-2xl px-5 py-4 transition-colors"
      >
        <div className="text-left">
          <p className="font-bold">Случайные темы</p>
          <p className="text-white/70 text-xs mt-0.5">Все темы вперемешку</p>
        </div>
        <Zap className="w-5 h-5" />
      </motion.button>

      {topics.map((topic, i) => (
        <motion.button
          key={topic}
          variants={fadeUp}
          type="button"
          onClick={() => onStart(topic)}
          className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl px-5 py-4 transition-colors text-left"
        >
          <div>
            <p className="font-semibold text-sm">{topic}</p>
            <p className="text-white/40 text-xs mt-0.5">Тема {i + 1}</p>
          </div>
          <ChevronRight />
        </motion.button>
      ))}
    </motion.div>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/40 shrink-0">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function QuestionPhase({
  question,
  index,
  total,
  secondsLeft,
  onAnswer,
}: {
  question: EntQuestion
  index: number
  total: number
  secondsLeft: number
  onAnswer: (i: number) => void
}) {
  const LABELS = ['A', 'B', 'C', 'D']
  const urgency = secondsLeft <= 10

  return (
    <motion.div key={question.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
      {/* Progress + timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">{index + 1} / {total}</span>
          <span className="text-white/40 text-xs">• {question.topic}</span>
        </div>
        <div className={cn('flex items-center gap-1.5 text-sm font-mono font-bold', urgency ? 'text-red-400 animate-pulse' : 'text-white/70')}>
          <Clock className="w-3.5 h-3.5" />
          {secondsLeft}с
        </div>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000', urgency ? 'bg-red-400' : 'bg-blue-400')}
          style={{ width: `${(secondsLeft / SECONDS_PER_QUESTION) * 100}%` }}
        />
      </div>
      {/* Question */}
      <p className="text-white text-base font-medium leading-relaxed">{question.text}</p>
      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onAnswer(i)}
            className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/12 border border-white/10 hover:border-white/25 rounded-2xl px-4 py-3 text-left transition-all group"
          >
            <span className="shrink-0 w-7 h-7 rounded-full bg-white/10 group-hover:bg-blue-500/40 flex items-center justify-center text-white/70 text-xs font-bold transition-colors">
              {LABELS[i]}
            </span>
            <span className="text-white/90 text-sm">{opt}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

interface DrillAnswer {
  question: EntQuestion
  selected: number | null  // null = timeout
  isCorrect: boolean
}

function ResultPhase({
  answers,
  onRetry,
  onNewTopic,
}: {
  answers: DrillAnswer[]
  onRetry: () => void
  onNewTopic: () => void
}) {
  const correct = answers.filter(a => a.isCorrect).length
  const total = answers.length
  const pct = Math.round((correct / total) * 100)
  const [showErrors, setShowErrors] = useState(false)

  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '💪'
  const label = pct >= 80 ? 'Отлично!' : pct >= 60 ? 'Хорошо!' : 'Продолжай!'

  const wrong = answers.filter(a => !a.isCorrect)

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }} className="space-y-5">
      {/* Score */}
      <motion.div variants={fadeUp} className="text-center space-y-2">
        <div className="text-5xl">{emoji}</div>
        <h2 className="text-white text-2xl font-bold">{label}</h2>
        <p className="text-white/60 text-sm">Правильных: {correct} из {total} ({pct}%)</p>
      </motion.div>

      {/* Bar */}
      <motion.div variants={fadeUp} className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" style={{ width: `${pct}%` }} />
      </motion.div>

      {/* Mini stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        {[
          { icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, label: 'Верно', value: correct, color: 'text-green-300' },
          { icon: <XCircle className="w-4 h-4 text-red-400" />, label: 'Ошибки', value: total - correct, color: 'text-red-300' },
          { icon: <Trophy className="w-4 h-4 text-amber-400" />, label: 'Результат', value: `${pct}%`, color: 'text-amber-300' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <div className="flex justify-center mb-1">{s.icon}</div>
            <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
            <p className="text-white/50 text-[10px]">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Error review */}
      {wrong.length > 0 && (
        <motion.div variants={fadeUp}>
          <button
            type="button"
            onClick={() => setShowErrors(s => !s)}
            className="w-full flex items-center justify-between bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors hover:bg-red-500/15"
          >
            <span>🔍 Работа над ошибками ({wrong.length})</span>
            <span>{showErrors ? '▲' : '▼'}</span>
          </button>
          {showErrors && (
            <div className="mt-2 space-y-3">
              {wrong.map((a, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                  <p className="text-white text-sm font-medium">{a.question.text}</p>
                  {a.selected !== null && (
                    <p className="text-red-300 text-xs">Твой ответ: {a.question.options[a.selected]}</p>
                  )}
                  {a.selected === null && (
                    <p className="text-red-300 text-xs">Время вышло — не ответил</p>
                  )}
                  <p className="text-green-300 text-xs">✅ Верно: {a.question.options[a.question.correctAnswer]}</p>
                  {a.question.explanation && (
                    <p className="text-white/60 text-xs">{a.question.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <motion.div variants={fadeUp} className="flex gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600/80 hover:bg-blue-600 text-white font-semibold py-3.5 rounded-2xl transition-colors"
        >
          <RotateCcw className="w-4 h-4" />Ещё раз
        </button>
        <button
          type="button"
          onClick={onNewTopic}
          className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold py-3.5 rounded-2xl transition-colors"
        >
          <Target className="w-4 h-4" />Другая тема
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Phase = 'select' | 'drill' | 'results'

export default function TopicDrill() {
  const [searchParams] = useSearchParams()
  const subjectParam = searchParams.get('subject') ?? 'math'

  const [subject, setSubject] = useState(subjectParam)
  const [phase, setPhase] = useState<Phase>('select')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [questions, setQuestions] = useState<EntQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION)
  const [answers, setAnswers] = useState<DrillAnswer[]>([])

  const allQuestions = getAllQuestions(subject)
  const topics = getTopics(allQuestions)

  const startDrill = useCallback((topic: string | null) => {
    const pool = topic ? allQuestions.filter(q => q.topic === topic) : allQuestions
    const picked = shuffle(pool).slice(0, DRILL_COUNT)
    setSelectedTopic(topic)
    setQuestions(picked)
    setCurrentIndex(0)
    setAnswers([])
    setSecondsLeft(SECONDS_PER_QUESTION)
    setPhase('drill')
  }, [allQuestions])

  const handleAnswer = useCallback((selected: number | null) => {
    if (!questions[currentIndex]) return
    const q = questions[currentIndex]
    const isCorrect = selected === q.correctAnswer
    setAnswers(prev => [...prev, { question: q, selected, isCorrect }])

    if (currentIndex + 1 >= questions.length) {
      setPhase('results')
    } else {
      setCurrentIndex(i => i + 1)
      setSecondsLeft(SECONDS_PER_QUESTION)
    }
  }, [questions, currentIndex])

  // Timer
  useEffect(() => {
    if (phase !== 'drill') return
    if (secondsLeft <= 0) { handleAnswer(null); return }
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearInterval(id)
  }, [phase, secondsLeft, handleAnswer])

  const subjectKeys = Object.keys(SUBJECT_LABELS)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          {phase !== 'select' ? (
            <button type="button" onClick={() => setPhase('select')} className="p-2 rounded-xl hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>
          ) : (
            <Link to="/ent-theory" className="p-2 rounded-xl hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </Link>
          )}
          <div>
            <h1 className="text-white font-bold">Тренировка по теме</h1>
            <p className="text-white/50 text-xs">{SUBJECT_LABELS[subject] ?? subject}</p>
          </div>
        </div>

        {/* Subject switcher (only in select phase) */}
        {phase === 'select' && (
          <div className="max-w-xl mx-auto px-4 pb-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {subjectKeys.filter(k => getAllQuestions(k).length > 0).map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSubject(k)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
                    subject === k
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/15',
                  )}
                >
                  {SUBJECT_LABELS[k]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {phase === 'select' && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SelectPhase subject={subject} topics={topics} onStart={startDrill} />
            </motion.div>
          )}

          {phase === 'drill' && questions[currentIndex] && (
            <QuestionPhase
              key={currentIndex}
              question={questions[currentIndex]}
              index={currentIndex}
              total={questions.length}
              secondsLeft={secondsLeft}
              onAnswer={handleAnswer}
            />
          )}

          {phase === 'results' && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ResultPhase
                answers={answers}
                onRetry={() => startDrill(selectedTopic)}
                onNewTopic={() => setPhase('select')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
