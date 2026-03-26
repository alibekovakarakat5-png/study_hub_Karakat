import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  X,
  Trophy,
  Flame,
  ChevronRight,
  RotateCcw,
  Zap,
  Share2,
} from 'lucide-react'
import { usePracticeEntStore } from '@/store/usePracticeEntStore'
import { useStore } from '@/store/useStore'
import { api } from '@/lib/api'
import { profileBanks, examVariants } from '@/data/practiceEnt'
import type { EntQuestion } from '@/types/practiceEnt'
import { SUBJECT_NAMES } from '@/types'
import ShareResultCard from '@/components/share/ShareResultCard'
import type { DailyChallengeShareData } from '@/components/share/ShareResultCard'

// ── Constants ────────────────────────────────────────────────────────────────

const CHALLENGE_COUNT = 10

// ── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface ChallengeQuestion extends EntQuestion {
  subjectLabel: string
}

function buildChallengeQuestions(history: ReturnType<typeof usePracticeEntStore.getState>['history']): ChallengeQuestion[] {
  // Collect weak topics from last 3 results (< 60%)
  const weakTopics = new Map<string, number>() // topicKey → fail count

  history.slice(0, 3).forEach(result => {
    result.blocks.forEach(block => {
      block.byTopic?.forEach(t => {
        const pct = t.total > 0 ? (t.correct / t.total) * 100 : 0
        if (pct < 60) {
          const key = t.topic.toLowerCase()
          weakTopics.set(key, (weakTopics.get(key) ?? 0) + 1)
        }
      })
    })
  })

  // Sort topics by fail count descending
  const sortedWeakTopics = Array.from(weakTopics.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic)

  // Gather questions matching weak topics
  const weakQuestions: ChallengeQuestion[] = []
  const allQuestions: ChallengeQuestion[] = []

  for (const bank of profileBanks) {
    const subjectLabel = SUBJECT_NAMES[bank.subject] ?? bank.subject
    for (const q of bank.questions) {
      const enriched: ChallengeQuestion = { ...q, subjectLabel }
      allQuestions.push(enriched)
      if (sortedWeakTopics.some(wt => q.topic.toLowerCase().includes(wt) || wt.includes(q.topic.toLowerCase()))) {
        weakQuestions.push(enriched)
      }
    }
  }

  // Also grab mandatory questions from variant 1 history (mathLiteracy, history)
  const variant = examVariants[0]
  if (variant) {
    for (const q of variant.mandatory.mathLiteracy) {
      allQuestions.push({ ...q, subjectLabel: 'Математическая грамотность' })
    }
    for (const q of variant.mandatory.history) {
      allQuestions.push({ ...q, subjectLabel: 'История Казахстана' })
    }
    for (const q of variant.mandatory.readingLiteracy) {
      allQuestions.push({ ...q, subjectLabel: 'Грамотность чтения' })
    }
  }

  // Build final list: prioritise weak-topic questions
  const pool = weakQuestions.length >= CHALLENGE_COUNT
    ? shuffle(weakQuestions)
    : [...shuffle(weakQuestions), ...shuffle(allQuestions.filter(q => !weakQuestions.includes(q)))]

  // Deduplicate by id
  const seen = new Set<string>()
  const unique: ChallengeQuestion[] = []
  for (const q of pool) {
    if (!seen.has(q.id)) {
      seen.add(q.id)
      unique.push(q)
    }
    if (unique.length >= CHALLENGE_COUNT) break
  }

  return unique
}

// ── Component ────────────────────────────────────────────────────────────────

export default function DailyChallenge() {
  const { history } = usePracticeEntStore()
  const { user, updateUser } = useStore()

  const questions = useMemo(() => buildChallengeQuestions(history), [])

  const [answers, setAnswers] = useState<Record<string, number | null>>({})
  const [submitted, setSubmitted] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showShare, setShowShare] = useState(false)

  const current = questions[currentIdx]

  // ── Submit
  function handleSubmit() {
    if (submitted) return
    setSubmitted(true)

    const correct = questions.filter(q => answers[q.id] === q.correctAnswer).length

    // Save to DB + update streak
    if (user) {
      api.post('/ent-results', {
        totalScore: correct,
        percentage: Math.round((correct / questions.length) * 100),
        blockResults: [],
      }).catch(() => {})

      const today = new Date().toDateString()
      const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate).toDateString() : null
      if (lastActive !== today) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const wasYesterday = lastActive === yesterday.toDateString()
        const newStreak = wasYesterday ? (user.streak ?? 0) + 1 : 1
        const newLastActive = new Date().toISOString()
        api.put('/users/me', { streak: newStreak, lastActiveDate: newLastActive }).catch(() => {})
        updateUser({ streak: newStreak, lastActiveDate: newLastActive })
      }
    }
  }

  // ── No questions fallback
  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md text-center">
          <Zap className="mx-auto mb-4 h-16 w-16 text-amber-400" />
          <h2 className="text-2xl font-bold text-gray-900">Вопросы загружаются...</h2>
          <p className="mt-2 text-gray-500">Сначала пройди пробный ЕНТ — мы подберём задания по твоим слабым темам.</p>
          <Link to="/practice-ent" className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
            Пробный ЕНТ
          </Link>
        </div>
      </div>
    )
  }

  const correctCount = submitted
    ? questions.filter(q => answers[q.id] === q.correctAnswer).length
    : 0

  // ── Results screen
  if (submitted && currentIdx >= questions.length) {
    const pct = Math.round((correctCount / questions.length) * 100)
    const dailyShareData: DailyChallengeShareData = {
      type: 'daily',
      date: new Date().toISOString(),
      correctCount,
      totalQuestions: questions.length,
      percentage: pct,
      streak: user?.streak ?? 0,
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center"
        >
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${pct >= 70 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
            {pct >= 70 ? <Trophy className="h-10 w-10 text-emerald-600" /> : <Flame className="h-10 w-10 text-amber-500" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Челлендж завершён!</h2>
          <p className="mt-1 text-gray-500">Правильных ответов: <span className="font-bold text-gray-800">{correctCount} / {questions.length}</span></p>

          <div className={`mt-4 rounded-xl px-6 py-4 text-4xl font-bold ${pct >= 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {pct}%
          </div>

          {user && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-orange-500">
              <Flame className="h-4 w-4" />
              Серия: <b>{user.streak} дней</b>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-100"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setAnswers({}); setSubmitted(false); setCurrentIdx(0) }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" /> Заново
            </button>
            <Link to="/dashboard" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700">
              На главную
            </Link>
          </div>

          {showShare && <ShareResultCard data={dailyShareData} onClose={() => setShowShare(false)} />}
        </motion.div>
      </div>
    )
  }

  // ── Question screen
  const isAnswered = answers[current.id] !== undefined && answers[current.id] !== null
  const isLastQuestion = currentIdx === questions.length - 1

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> Назад
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium text-orange-500">
            <Flame className="h-4 w-4" />
            {user?.streak ?? 0} дней подряд
          </div>
        </div>

        {/* Title + Progress */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <Zap className="mr-2 inline h-6 w-6 text-amber-400" />
            Ежедневный челлендж
          </h1>
          <p className="mt-1 text-sm text-gray-500">10 вопросов по твоим слабым темам</p>
        </div>

        {/* Progress bar */}
        <div>
          <div className="mb-1 flex justify-between text-xs text-gray-400">
            <span>Вопрос {currentIdx + 1} из {questions.length}</span>
            {submitted && <span>{correctCount} правильных</span>}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.18 }}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-1 text-xs font-semibold uppercase text-gray-400">{current.subjectLabel} · {current.topic}</div>
            <p className="mb-6 text-lg leading-relaxed text-gray-900 whitespace-pre-line">{current.text}</p>

            <div className="space-y-3">
              {current.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i)
                const isSelected = answers[current.id] === i
                const isCorrect = i === current.correctAnswer
                const showResult = submitted

                let cls = 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                if (showResult) {
                  if (isCorrect) cls = 'border-emerald-500 bg-emerald-50'
                  else if (isSelected && !isCorrect) cls = 'border-red-500 bg-red-50'
                } else if (isSelected) {
                  cls = 'border-blue-500 bg-blue-50'
                }

                return (
                  <button
                    key={i}
                    disabled={submitted}
                    onClick={() => setAnswers(prev => ({ ...prev, [current.id]: i }))}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all disabled:cursor-default ${cls}`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold
                      ${showResult && isCorrect ? 'bg-emerald-500 text-white'
                        : showResult && isSelected ? 'bg-red-500 text-white'
                        : isSelected ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-500'}`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 text-gray-800">{opt}</span>
                    {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                    {showResult && isSelected && !isCorrect && <X className="h-5 w-5 text-red-500" />}
                  </button>
                )
              })}
            </div>

            {/* Explanation — shown after submit */}
            {submitted && (
              <div className={`mt-4 rounded-lg p-4 ${answers[current.id] === current.correctAnswer ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <p className="text-sm font-semibold text-gray-700">
                  {answers[current.id] === current.correctAnswer ? 'Правильно!' : 'Неправильно'}
                </p>
                <p className="mt-1 text-sm text-gray-600">{current.explanation}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Action button */}
        <div className="flex justify-end">
          {!submitted ? (
            isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < questions.length}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white shadow-md transition-all hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="h-5 w-5" /> Завершить
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(i => i + 1)}
                disabled={!isAnswered}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Далее <ChevronRight className="h-5 w-5" />
              </button>
            )
          ) : (
            isLastQuestion ? (
              <button
                onClick={() => setCurrentIdx(questions.length)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-md hover:bg-blue-700"
              >
                Результаты <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(i => i + 1)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-md hover:bg-blue-700"
              >
                Далее <ChevronRight className="h-5 w-5" />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
