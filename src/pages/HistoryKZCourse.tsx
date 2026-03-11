import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, CheckCircle2, BookOpen, Trophy,
  Clock, Flame, Lock, ChevronRight, RotateCcw, Star,
} from 'lucide-react'
import { HISTORY_KZ_COURSE } from '@/data/historyKZCourse'
import type { Module, Lesson, QuizQ } from '@/data/historyKZCourse'
import { cn } from '@/lib/utils'

// ── Storage ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'studyhub-history-kz-progress'

interface Progress {
  completedLessons: string[]   // lesson ids
  quizScores: Record<string, number> // lessonId → score %
}

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { completedLessons: [], quizScores: {} }
  } catch {
    return { completedLessons: [], quizScores: {} }
  }
}

function saveProgress(p: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const allLessons = HISTORY_KZ_COURSE.flatMap(m => m.lessons)
const totalLessons = allLessons.length

function lessonModule(lessonId: string): Module | undefined {
  return HISTORY_KZ_COURSE.find(m => m.lessons.some(l => l.id === lessonId))
}

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
}

// ── Quiz component ────────────────────────────────────────────────────────────

function QuizBlock({
  questions,
  onComplete,
}: {
  questions: QuizQ[]
  onComplete: (score: number) => void
}) {
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[idx]!
  const LABELS = ['A', 'B', 'C', 'D']

  const choose = (i: number) => {
    if (revealed) return
    setSelected(i)
  }

  const confirm = () => {
    if (selected === null) return
    const isRight = selected === q.correct
    if (isRight) setCorrect(c => c + 1)
    setRevealed(true)
  }

  const next = () => {
    if (idx + 1 >= questions.length) {
      const pct = Math.round(((correct + (selected === q.correct ? 1 : 0)) / questions.length) * 100)
      setDone(true)
      onComplete(pct)
    } else {
      setIdx(i => i + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  if (done) {
    const finalScore = Math.round((correct / questions.length) * 100)
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3">
        <div className="text-4xl">{finalScore >= 80 ? '🏆' : finalScore >= 60 ? '👍' : '💪'}</div>
        <p className="text-slate-800 font-bold text-lg">Тест завершён!</p>
        <p className="text-slate-600">
          Верных ответов: {correct} / {questions.length} ({finalScore}%)
        </p>
      </div>
    )
  }

  return (
    <div className="bg-violet-50 border border-violet-100 rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 flex items-center justify-between">
        <span className="text-white font-semibold text-sm flex items-center gap-2">
          <Star className="w-4 h-4" />Тест · Вопрос {idx + 1} из {questions.length}
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full',
                i < idx ? 'bg-white/70' : i === idx ? 'bg-white' : 'bg-white/30'
              )}
            />
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="font-semibold text-slate-800 leading-snug">{q.q}</p>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            const isCorrect = revealed && i === q.correct
            const isWrong   = revealed && selected === i && i !== q.correct
            const isChosen  = selected === i && !revealed
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium text-left transition-all',
                  isCorrect ? 'border-green-500 bg-green-50 text-green-800' :
                  isWrong   ? 'border-red-400 bg-red-50 text-red-800' :
                  isChosen  ? 'border-violet-500 bg-violet-50 text-violet-800' :
                  revealed  ? 'border-slate-200 bg-white text-slate-400' :
                  'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/50'
                )}
              >
                <span className={cn(
                  'shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                  isCorrect ? 'bg-green-500 text-white' :
                  isWrong   ? 'bg-red-400 text-white' :
                  isChosen  ? 'bg-violet-500 text-white' :
                  'bg-slate-100 text-slate-500',
                )}>
                  {isCorrect ? '✓' : isWrong ? '✗' : LABELS[i]}
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        {revealed && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600">
            💡 {q.explanation}
          </div>
        )}

        <div className="flex justify-end">
          {!revealed ? (
            <button
              type="button"
              onClick={confirm}
              disabled={selected === null}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors"
            >
              Проверить
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors"
            >
              {idx + 1 >= questions.length ? 'Завершить тест' : 'Следующий'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Lesson view ───────────────────────────────────────────────────────────────

function LessonView({
  lesson,
  mod,
  progress,
  onComplete,
  onNext,
  onPrev,
  prevLesson,
  nextLesson,
}: {
  lesson: Lesson
  mod: Module
  progress: Progress
  onComplete: (lessonId: string, score: number) => void
  onNext: () => void
  onPrev: () => void
  prevLesson: Lesson | null
  nextLesson: Lesson | null
}) {
  const [quizDone, setQuizDone] = useState(false)
  const isComplete = progress.completedLessons.includes(lesson.id)
  const score = progress.quizScores[lesson.id]

  const handleQuizComplete = useCallback((pct: number) => {
    setQuizDone(true)
    onComplete(lesson.id, pct)
  }, [lesson.id, onComplete])

  // Simple markdown renderer
  const renderTheory = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-slate-800 mt-6 mb-2">{line.slice(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold text-slate-700 mt-4 mb-1.5">{line.slice(4)}</h3>
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-slate-800 mt-2">{line.slice(2, -2)}</p>
        if (line.startsWith('- ')) return <li key={i} className="text-slate-700 ml-4 list-disc">{line.slice(2)}</li>
        if (line.startsWith('| ')) return null // skip table rows (rendered below)
        if (line.trim() === '') return <div key={i} className="h-2" />
        // Inline bold
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i} className="text-slate-700 leading-relaxed">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
          </p>
        )
      })
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } }, hidden: {} }} className="space-y-6">
      {/* Breadcrumb */}
      <motion.div variants={fade} className="flex items-center gap-2 text-sm text-slate-500">
        <span style={{ color: mod.color }}>{mod.emoji} {mod.title}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">{lesson.title}</span>
      </motion.div>

      {/* Lesson header */}
      <motion.div variants={fade} className="rounded-2xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${mod.color}, ${mod.color}cc)` }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm mb-1">{mod.title}</p>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 text-sm shrink-0">
            <Clock className="w-3.5 h-3.5" />
            {lesson.duration} мин
          </div>
        </div>
        {isComplete && (
          <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
            <CheckCircle2 className="w-4 h-4 text-green-300" />
            Пройден {score !== undefined ? `· ${score}%` : ''}
          </div>
        )}
      </motion.div>

      {/* Theory */}
      <motion.div variants={fade} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4">
          <BookOpen className="w-3.5 h-3.5" />Теория
        </div>
        <div className="space-y-1">{renderTheory(lesson.theory)}</div>
      </motion.div>

      {/* Key dates */}
      {lesson.keyDates && lesson.keyDates.length > 0 && (
        <motion.div variants={fade} className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <p className="font-bold text-amber-800 text-sm flex items-center gap-2">⚡ Ключевые даты</p>
          {lesson.keyDates.map((kd, i) => (
            <div key={i} className="flex gap-3">
              <span className="font-mono text-amber-700 font-bold text-sm shrink-0 w-32">{kd.date}</span>
              <span className="text-amber-900 text-sm">{kd.event}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Key figures */}
      {lesson.keyFigures && lesson.keyFigures.length > 0 && (
        <motion.div variants={fade} className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
          <p className="font-bold text-blue-800 text-sm flex items-center gap-2">👤 Ключевые личности</p>
          {lesson.keyFigures.map((kf, i) => (
            <div key={i} className="flex gap-3">
              <span className="font-semibold text-blue-800 text-sm shrink-0 min-w-0 basis-40">{kf.name}</span>
              <span className="text-blue-700 text-sm">{kf.role}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Quiz */}
      <motion.div variants={fade}>
        <p className="font-bold text-slate-700 text-sm flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-violet-500" />
          Проверь себя
        </p>
        {isComplete && !quizDone ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
            <p className="text-green-800 font-semibold">Урок пройден! Результат: {score}%</p>
            <button
              type="button"
              onClick={() => setQuizDone(false)}
              className="flex items-center gap-1.5 mx-auto text-green-700 hover:text-green-900 text-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />Пройти снова
            </button>
          </div>
        ) : (
          <QuizBlock questions={lesson.quiz} onComplete={handleQuizComplete} />
        )}
      </motion.div>

      {/* Navigation */}
      <motion.div variants={fade} className="flex items-center justify-between pt-2 pb-8">
        <button
          type="button"
          onClick={onPrev}
          disabled={!prevLesson}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-medium rounded-xl transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {prevLesson ? prevLesson.title : 'Нет'}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!nextLesson}
          className="flex items-center gap-2 px-4 py-2.5 text-white font-semibold rounded-xl transition-colors text-sm"
          style={{ background: mod.color, opacity: nextLesson ? 1 : 0.4 }}
        >
          {nextLesson ? nextLesson.title : 'Конец'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({
  progress,
  activeId,
  onSelect,
}: {
  progress: Progress
  activeId: string | null
  onSelect: (id: string) => void
}) {
  const [openModules, setOpenModules] = useState<Set<string>>(new Set([HISTORY_KZ_COURSE[0].id]))

  const toggleModule = (id: string) => {
    setOpenModules(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  let lessonCounter = 0

  return (
    <div className="space-y-1">
      {HISTORY_KZ_COURSE.map(mod => {
        const modCompleted = mod.lessons.filter(l => progress.completedLessons.includes(l.id)).length
        const isOpen = openModules.has(mod.id)

        return (
          <div key={mod.id} className="rounded-xl overflow-hidden border border-slate-100">
            <button
              type="button"
              onClick={() => toggleModule(mod.id)}
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-xl">{mod.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{mod.title}</p>
                <p className="text-xs text-slate-400">{modCompleted}/{mod.lessons.length} уроков</p>
              </div>
              <ChevronRight className={cn('w-3.5 h-3.5 text-slate-400 transition-transform shrink-0', isOpen && 'rotate-90')} />
            </button>
            {isOpen && (
              <div className="border-t border-slate-100 bg-slate-50">
                {mod.lessons.map(lesson => {
                  lessonCounter++
                  const isDone = progress.completedLessons.includes(lesson.id)
                  const isActive = lesson.id === activeId
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => onSelect(lesson.id)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors border-b border-slate-100 last:border-0',
                        isActive ? 'bg-blue-50' : 'hover:bg-white',
                      )}
                    >
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                        isDone ? 'bg-green-100 text-green-600' :
                        isActive ? 'text-white' : 'bg-slate-200 text-slate-500',
                      )} style={isActive && !isDone ? { background: mod.color } : {}}>
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : lessonCounter}
                      </div>
                      <span className={cn('text-xs font-medium truncate', isActive ? 'text-blue-700' : 'text-slate-600')}>
                        {lesson.title}
                      </span>
                      {isDone && (
                        <span className="ml-auto text-[10px] text-green-500 shrink-0">
                          {progress.quizScores[lesson.id]}%
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Certificate ───────────────────────────────────────────────────────────────

function Certificate({ onReset }: { onReset: () => void }) {
  const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center space-y-6 border-4 border-amber-300"
      >
        <div className="text-6xl">🏆</div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Сертификат об окончании</h1>
          <p className="text-slate-500 text-sm mt-1">StudyHub — Образовательная платформа</p>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
          <p className="text-slate-600 text-sm">Настоящим подтверждается, что</p>
          <p className="text-slate-800 font-bold text-xl mt-1">Вы успешно прошли курс</p>
          <p className="text-amber-700 font-bold text-lg mt-2">«История Казахстана — полный курс ЕНТ»</p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-500">
            <span>🏛️ 7 модулей</span>
            <span>📚 {totalLessons} уроков</span>
            <span>⭐ ~100 вопросов</span>
          </div>
        </div>
        <p className="text-slate-400 text-sm">{today}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 px-4 py-3 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors"
          >
            🖨️ Распечатать
          </button>
          <Link
            to="/practice-ent"
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-center"
          >
            Пробный ЕНТ →
          </Link>
        </div>
        <button type="button" onClick={onReset} className="text-slate-400 hover:text-slate-600 text-xs underline">
          Начать заново
        </button>
      </motion.div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HistoryKZCourse() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [activeLessonId, setActiveLessonId] = useState<string>(allLessons[0]!.id)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showCert, setShowCert] = useState(false)

  const completedCount = progress.completedLessons.length
  const pct = Math.round((completedCount / totalLessons) * 100)
  const allDone = completedCount >= totalLessons

  useEffect(() => { if (allDone) setShowCert(true) }, [allDone])

  const handleComplete = useCallback((lessonId: string, score: number) => {
    setProgress(prev => {
      const next: Progress = {
        completedLessons: prev.completedLessons.includes(lessonId)
          ? prev.completedLessons
          : [...prev.completedLessons, lessonId],
        quizScores: { ...prev.quizScores, [lessonId]: score },
      }
      saveProgress(next)
      return next
    })
  }, [])

  const activeIdx = allLessons.findIndex(l => l.id === activeLessonId)
  const activeLesson = allLessons[activeIdx] ?? allLessons[0]!
  const prevLesson = activeIdx > 0 ? allLessons[activeIdx - 1] ?? null : null
  const nextLesson = activeIdx < allLessons.length - 1 ? allLessons[activeIdx + 1] ?? null : null
  const activeMod = lessonModule(activeLesson.id) ?? HISTORY_KZ_COURSE[0]!

  const resetProgress = () => {
    const fresh: Progress = { completedLessons: [], quizScores: {} }
    saveProgress(fresh)
    setProgress(fresh)
    setShowCert(false)
    setActiveLessonId(allLessons[0]!.id)
  }

  if (showCert) return <Certificate onReset={resetProgress} />

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/courses" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-slate-800 text-sm truncate">🏛️ История Казахстана — ЕНТ</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 max-w-40 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-slate-500">{completedCount}/{totalLessons} уроков</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(s => !s)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <BookOpen className="w-5 h-5 text-slate-500" />
          </button>
          {allDone && (
            <button
              type="button"
              onClick={() => setShowCert(true)}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold px-3 py-1.5 rounded-xl transition-colors"
            >
              <Trophy className="w-4 h-4" />Сертификат
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar — overlay on mobile, inline on lg+ */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Mobile overlay backdrop */}
              <div
                className="fixed inset-0 z-20 bg-black/40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                className="fixed top-0 left-0 h-full z-30 w-72 bg-slate-50 overflow-y-auto pt-16 px-3 pb-6 shadow-xl lg:static lg:shadow-none lg:z-auto lg:h-auto lg:w-auto lg:pt-0 lg:px-0 lg:overflow-visible shrink-0"
              >
                <div className="w-64 space-y-4">
                  {/* Stats */}
                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-4 h-4" />
                      <span className="font-bold text-sm">Прогресс курса</span>
                    </div>
                    <div className="text-3xl font-bold">{pct}%</div>
                    <div className="text-white/80 text-xs mt-1">{completedCount} из {totalLessons} уроков пройдено</div>
                    <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <Sidebar progress={progress} activeId={activeLessonId} onSelect={(id) => { setActiveLessonId(id); setSidebarOpen(false) }} />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Lesson content */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeLessonId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LessonView
                lesson={activeLesson}
                mod={activeMod}
                progress={progress}
                onComplete={handleComplete}
                onNext={() => nextLesson && setActiveLessonId(nextLesson.id)}
                onPrev={() => prevLesson && setActiveLessonId(prevLesson.id)}
                prevLesson={prevLesson}
                nextLesson={nextLesson}
              />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
