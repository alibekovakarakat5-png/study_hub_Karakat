// ── CourseLesson — Student Lesson Player ──────────────────────────────────────
// Displays a lesson's blocks in reading mode with interactive Quiz + Flashcard.
// Tracks completion and sends it to the backend.

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Check, X, BookOpen, Play,
  ChevronDown, ChevronRight, Flame, Bot, RefreshCw,
  Clock, CircleCheck, GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { getToken } from '@/lib/api'
import type { LessonBlock, QuizQuestion, FlashCard, CourseData, ModuleData, LessonData } from '@/components/admin/CourseBuilder'

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return m ? m[1]! : null
}

// Simple markdown-like renderer for text blocks
function renderText(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc pl-5 space-y-1">$1</ul>')
    .replace(/\n/g, '<br />')
}

// ── Block Renderers ───────────────────────────────────────────────────────────

function TextBlockView({ content }: { content: string }) {
  return (
    <div
      className="prose prose-slate max-w-none text-slate-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: renderText(content) }}
    />
  )
}

function VideoBlockView({ url, title }: { url: string; title?: string }) {
  const ytId = extractYoutubeId(url)
  if (!ytId) return <p className="text-sm text-slate-400">Некорректная ссылка на видео</p>
  return (
    <div className="space-y-2">
      {title && <p className="font-semibold text-slate-800">{title}</p>}
      <div className="rounded-xl overflow-hidden aspect-video bg-black shadow-lg">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          className="w-full h-full"
          allowFullScreen
          title={title ?? 'lesson video'}
        />
      </div>
    </div>
  )
}

function ImageBlockView({ url, caption }: { url: string; caption?: string }) {
  return (
    <figure className="space-y-2">
      <img src={url} alt={caption ?? ''} className="rounded-xl w-full object-cover shadow-sm max-h-80" />
      {caption && <figcaption className="text-xs text-center text-slate-400">{caption}</figcaption>}
    </figure>
  )
}

// ── Interactive Quiz ──────────────────────────────────────────────────────────

function QuizView({ questions, onScore }: { questions: QuizQuestion[]; onScore: (s: number) => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null))
  const [submitted, setSubmitted] = useState(false)
  const [qIdx, setQIdx] = useState(0)

  const current = questions[qIdx]!
  const selected = answers[qIdx]

  const choose = (oi: number) => {
    if (submitted) return
    setAnswers(a => a.map((v, i) => i === qIdx ? oi : v))
  }

  const submit = () => {
    if (answers.some(a => a === null)) return
    const correct = questions.filter((q, i) => answers[i] === q.correct).length
    onScore(Math.round((correct / questions.length) * 100))
    setSubmitted(true)
  }

  const reset = () => {
    setAnswers(questions.map(() => null))
    setSubmitted(false)
    setQIdx(0)
  }

  const isCorrect = (oi: number) => submitted && oi === current.correct
  const isWrong   = (oi: number) => submitted && answers[qIdx] === oi && oi !== current.correct

  return (
    <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-3 flex items-center justify-between">
        <span className="text-white font-semibold text-sm flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Тест · {questions.length} {questions.length === 1 ? 'вопрос' : 'вопросов'}
        </span>
        {submitted && (
          <span className="text-white/80 text-xs">
            {questions.filter((q, i) => answers[i] === q.correct).length} / {questions.length} верно
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Progress dots */}
        <div className="flex gap-1.5 mb-5">
          {questions.map((_, i) => (
            <button key={i} type="button" onClick={() => setQIdx(i)}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all',
                i === qIdx ? 'bg-purple-600' :
                submitted
                  ? answers[i] === questions[i]!.correct ? 'bg-green-400' : 'bg-red-400'
                  : answers[i] !== null ? 'bg-purple-300' : 'bg-slate-200'
              )}
            />
          ))}
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={qIdx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <p className="font-semibold text-slate-800 mb-4 leading-snug">
              <span className="text-slate-400 text-sm mr-2">Q{qIdx + 1}.</span>
              {current.question}
            </p>
            <div className="space-y-2.5">
              {current.options.map((opt, oi) => (
                <button key={oi} type="button" onClick={() => choose(oi)}
                  className={cn(
                    'w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all',
                    isCorrect(oi) ? 'border-green-500 bg-green-50 text-green-700' :
                    isWrong(oi)   ? 'border-red-400   bg-red-50   text-red-700' :
                    selected === oi ? 'border-purple-500 bg-purple-50 text-purple-700' :
                    'border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50/50'
                  )}>
                  <span className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                    isCorrect(oi) ? 'bg-green-500 text-white' :
                    isWrong(oi)   ? 'bg-red-400 text-white' :
                    selected === oi ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-500'
                  )}>
                    {isCorrect(oi) ? <Check className="w-3.5 h-3.5" /> :
                     isWrong(oi)   ? <X className="w-3.5 h-3.5" /> :
                     String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>

            {/* Explanation */}
            {submitted && current.explanation && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                <strong>Объяснение:</strong> {current.explanation}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          <button type="button" onClick={() => setQIdx(i => Math.max(0, i - 1))}
            disabled={qIdx === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-30">
            <ArrowLeft className="w-4 h-4" /> Назад
          </button>

          {!submitted ? (
            qIdx < questions.length - 1 ? (
              <button type="button" onClick={() => setQIdx(i => i + 1)}
                disabled={selected === null}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-40">
                Далее <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={submit}
                disabled={answers.some(a => a === null)}
                className="flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-40">
                <Check className="w-4 h-4" /> Завершить тест
              </button>
            )
          ) : (
            <button type="button" onClick={reset}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
              <RefreshCw className="w-4 h-4" /> Пройти снова
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Interactive Flashcards ────────────────────────────────────────────────────

function FlashcardView({ cards }: { cards: FlashCard[] }) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<Set<number>>(new Set())

  const card = cards[idx]!

  const mark = (isKnown: boolean) => {
    if (isKnown) setKnown(s => new Set([...s, idx]))
    setFlipped(false)
    setTimeout(() => setIdx(i => (i + 1) % cards.length), 200)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-orange-400" /> Карточки</span>
        <span>{idx + 1} / {cards.length} · {known.size} выучено</span>
      </div>

      {/* Progress */}
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${(known.size / cards.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped(f => !f)}
        className="cursor-pointer select-none"
        style={{ perspective: 1000 }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4, type: 'spring', damping: 20 }}
          style={{ transformStyle: 'preserve-3d', position: 'relative' }}
          className="w-full h-48"
        >
          {/* Front */}
          <div style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Термин / Вопрос</p>
            <p className="text-xl font-bold text-slate-800 text-center">{card.front}</p>
            <p className="text-xs text-slate-400 mt-4">Нажми, чтобы перевернуть</p>
          </div>

          {/* Back */}
          <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-violet-700 rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-blue-200 mb-2 uppercase tracking-wide">Ответ / Перевод</p>
            <p className="text-xl font-bold text-white text-center">{card.back}</p>
          </div>
        </motion.div>
      </div>

      {/* Know / Don't know */}
      {flipped && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex gap-3">
          <button type="button" onClick={() => mark(false)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors">
            <X className="w-4 h-4" /> Не знаю
          </button>
          <button type="button" onClick={() => mark(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-green-400 bg-green-50 text-green-700 font-semibold hover:bg-green-100 transition-colors">
            <Check className="w-4 h-4" /> Знаю!
          </button>
        </motion.div>
      )}
    </div>
  )
}

// ── Block Renderer (student view) ─────────────────────────────────────────────

function BlockView({ block, onQuizScore }: { block: LessonBlock; onQuizScore: (s: number) => void }) {
  if (block.type === 'text')      return <TextBlockView content={block.content} />
  if (block.type === 'video')     return <VideoBlockView url={block.url} title={block.title} />
  if (block.type === 'image')     return <ImageBlockView url={block.url} caption={block.caption} />
  if (block.type === 'quiz')      return <QuizView questions={block.questions} onScore={onQuizScore} />
  if (block.type === 'flashcard') return <FlashcardView cards={block.cards} />
  return null
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════════════════

export default function CourseLesson() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const navigate = useNavigate()
  const user = useStore(s => s.user)

  const [course, setCourse] = useState<CourseData | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  // Fetch course data
  useEffect(() => {
    if (!courseId) return
    fetch(`/api/courses/${courseId}`)
      .then(r => r.json())
      .then(d => {
        setCourse(d.course as CourseData)
        const mods: ModuleData[] = d.course?.modules ?? []
        // Auto-expand module containing current lesson
        const mod = mods.find(m => m.lessons.some((l: LessonData) => l.id === lessonId))
        if (mod) setExpandedModules(new Set([mod.id]))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [courseId, lessonId])

  // Fetch progress
  useEffect(() => {
    if (!courseId || !user) return
    const token = getToken()
    if (!token) return
    fetch(`/api/courses/${courseId}/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.completedLessonIds) setCompletedIds(new Set(d.completedLessonIds as string[]))
      })
      .catch(() => {})
  }, [courseId, user])

  // Find current lesson
  const allLessons = course?.modules.flatMap(m => m.lessons) ?? []
  const lesson = allLessons.find(l => l.id === lessonId) ?? null
  const lessonIdx = allLessons.findIndex(l => l.id === lessonId)
  const prevLesson = lessonIdx > 0 ? allLessons[lessonIdx - 1] : null
  const nextLesson = lessonIdx < allLessons.length - 1 ? allLessons[lessonIdx + 1] : null

  const isCompleted = lessonId ? completedIds.has(lessonId) : false

  const markComplete = async () => {
    if (!lessonId || completing) return
    const token = getToken()
    if (!token) return
    setCompleting(true)
    try {
      await fetch(`/api/courses/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quizScore }),
      })
      setCompletedIds(s => new Set([...s, lessonId]))
      setCompleted(true)
    } catch {/* offline */}
    finally { setCompleting(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Урок не найден</p>
        <Link to="/courses" className="text-blue-600 text-sm hover:underline">← Назад к курсам</Link>
      </div>
    )
  }

  const progressPct = allLessons.length > 0
    ? Math.round((completedIds.size / allLessons.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Sidebar (course nav) ── */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={cn(
          'fixed lg:sticky top-0 h-screen z-50 lg:z-auto w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
          {/* Course header */}
          <div className="px-4 py-4 border-b border-slate-100">
            <Link to="/courses" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors mb-3">
              <ArrowLeft className="w-3.5 h-3.5" /> К курсам
            </Link>
            <h2 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">{course.title}</h2>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Прогресс</span>
                <span>{completedIds.size} / {allLessons.length}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>

          {/* Module / Lesson nav */}
          <nav className="flex-1 overflow-y-auto py-2">
            {course.modules.map((mod) => (
              <div key={mod.id}>
                <button type="button"
                  onClick={() => setExpandedModules(s => {
                    const n = new Set(s); if (n.has(mod.id)) n.delete(mod.id); else n.add(mod.id); return n
                  })}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors">
                  {expandedModules.has(mod.id)
                    ? <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                    : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate flex-1 text-left">{mod.title}</span>
                </button>
                {expandedModules.has(mod.id) && mod.lessons.map(l => {
                  const done = completedIds.has(l.id)
                  const active = l.id === lessonId
                  return (
                    <Link key={l.id}
                      to={`/courses/${courseId}/lessons/${l.id}`}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 pl-9 pr-4 py-2 text-xs transition-colors',
                        active ? 'bg-blue-50 text-blue-700 font-semibold' :
                        done   ? 'text-slate-500 hover:bg-slate-50' :
                                 'text-slate-600 hover:bg-slate-50'
                      )}>
                      <span className={cn(
                        'w-4 h-4 rounded-full flex items-center justify-center shrink-0',
                        done   ? 'bg-green-500' :
                        active ? 'bg-blue-600' : 'border-2 border-slate-300'
                      )}>
                        {done && <Check className="w-2.5 h-2.5 text-white" />}
                        {active && !done && <Play className="w-2 h-2 text-white" />}
                      </span>
                      <span className="flex-1 truncate">{l.title}</span>
                      {l.duration && <span className="text-slate-400 shrink-0">{l.duration}м</span>}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>
        </aside>
      </>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button type="button" onClick={() => setSidebarOpen(s => !s)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
            <BookOpen className="w-4 h-4 text-slate-600" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 truncate">{course.title}</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{lesson.title}</p>
          </div>
          {lesson.duration && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 shrink-0">
              <Clock className="w-3.5 h-3.5" /> {lesson.duration} мин
            </span>
          )}
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium shrink-0">
              <CircleCheck className="w-4 h-4" /> Пройдено
            </span>
          )}
        </div>

        {/* Lesson content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">{lesson.title}</h1>
            {lesson.duration && (
              <p className="text-sm text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ~{lesson.duration} минут
              </p>
            )}
          </motion.div>

          {(lesson.blocks as LessonBlock[]).length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <GraduationCap className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p>В этом уроке пока нет контента</p>
            </div>
          )}

          {(lesson.blocks as LessonBlock[]).map((block, idx) => (
            <motion.div key={block.id ?? idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}>
              <BlockView block={block} onQuizScore={s => setQuizScore(s)} />
            </motion.div>
          ))}

          {/* Completion card */}
          {!isCompleted && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
              {completed ? (
                <div className="space-y-2">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7 text-green-600" />
                  </div>
                  <p className="font-bold text-slate-800 text-lg">Урок завершён!</p>
                  {quizScore !== null && (
                    <p className="text-sm text-slate-500">Результат теста: <strong>{quizScore}%</strong></p>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-slate-600 mb-4 text-sm">Изучил материал?</p>
                  <button type="button" onClick={markComplete} disabled={completing || !user}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto">
                    <CircleCheck className="w-5 h-5" />
                    {completing ? 'Сохраняем...' : 'Отметить как пройденный'}
                  </button>
                  {!user && <p className="text-xs text-slate-400 mt-2">Войди, чтобы сохранить прогресс</p>}
                </>
              )}
            </motion.div>
          )}

          {/* Prev / Next navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {prevLesson ? (
              <Link to={`/courses/${courseId}/lessons/${prevLesson.id}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-sm">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Предыдущий</span>
              </Link>
            ) : <div />}

            {nextLesson ? (
              <Link to={`/courses/${courseId}/lessons/${nextLesson.id}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                <span className="hidden sm:inline">Следующий урок</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link to="/courses"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm">
                <Check className="w-4 h-4" /> Завершить курс
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Robot companion */}
      <div className="hidden xl:flex flex-col w-56 shrink-0 border-l border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Помощник</p>
        </div>
        <div className="p-4">
          <div className="bg-gradient-to-br from-blue-600 to-violet-700 rounded-xl p-4 text-white">
            <Bot className="w-6 h-6 mb-2" />
            <p className="text-xs font-semibold mb-1.5">Застрял? Спроси!</p>
            <p className="text-[11px] text-white/70 leading-relaxed">
              Открой робота-помощника внизу справа и задай вопрос по теме урока.
            </p>
          </div>
          {progressPct === 100 && (
            <div className="mt-3 bg-green-50 rounded-xl p-3 border border-green-200">
              <p className="text-xs font-semibold text-green-700 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Курс завершён!
              </p>
              <p className="text-xs text-green-600 mt-1">Все уроки пройдены. Отличная работа!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
