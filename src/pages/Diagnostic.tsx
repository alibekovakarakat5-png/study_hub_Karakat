import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trophy,
  Target,
  BarChart3,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Brain,
  Atom,
  FlaskConical,
  Leaf,
  Landmark,
  Languages,
  Globe2,
  Monitor,
  Map,
  BookMarked,
  AlertCircle,
  TrendingUp,
  Award,
  Play,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { diagnosticQuestions, shuffleArray } from '@/data/questions'
import { universities } from '@/data/universities'
import type {
  Subject,
  Question,
  DiagnosticResult,
  SubjectScore,
  UniversityPrediction,
} from '@/types'
import { SUBJECT_NAMES, SUBJECT_COLORS } from '@/types'
import { generateId } from '@/lib/utils'

// ─── Subject Icons Map ───────────────────────────────────────────────────────

const SUBJECT_ICONS: Record<Subject, React.ReactNode> = {
  math: <Brain className="w-6 h-6" />,
  physics: <Atom className="w-6 h-6" />,
  chemistry: <FlaskConical className="w-6 h-6" />,
  biology: <Leaf className="w-6 h-6" />,
  history: <Landmark className="w-6 h-6" />,
  english: <Languages className="w-6 h-6" />,
  kazakh: <Globe2 className="w-6 h-6" />,
  russian: <BookMarked className="w-6 h-6" />,
  informatics: <Monitor className="w-6 h-6" />,
  geography: <Map className="w-6 h-6" />,
  literature: <BookOpen className="w-6 h-6" />,
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = 'selection' | 'test' | 'results'

interface AnswerRecord {
  questionId: string
  selectedAnswer: number
  isCorrect: boolean
}

// ─── Circular Progress Component ────────────────────────────────────────────

function CircularProgress({
  percentage,
  size = 160,
  strokeWidth = 12,
  color = '#2563eb',
  label,
  sublabel,
}: {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  sublabel?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold text-gray-800"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {label ?? `${Math.round(percentage)}%`}
        </motion.span>
        {sublabel && (
          <span className="text-sm text-gray-500 mt-0.5">{sublabel}</span>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function Diagnostic() {
  const navigate = useNavigate()
  const { user, setDiagnosticResult, diagnosticHistory, diagnosticResult: previousResult } = useStore()

  // Phase state
  const [phase, setPhase] = useState<Phase>('selection')

  // Phase 1: Subject Selection
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([])

  // Phase 2: Test
  const [testQuestions, setTestQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Phase 3: Results
  const [result, setResult] = useState<DiagnosticResult | null>(null)

  // ── Available subjects with question counts ────────────────────────────────

  const availableSubjects = useMemo(() => {
    const subjectCounts: Partial<Record<Subject, number>> = {}
    for (const q of diagnosticQuestions) {
      subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1
    }
    return (Object.entries(subjectCounts) as [Subject, number][]).map(([subject, count]) => ({
      subject,
      count,
    }))
  }, [])

  // ── Toggle subject selection ───────────────────────────────────────────────

  const toggleSubject = useCallback((subject: Subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    )
  }, [])

  // ── Start test ─────────────────────────────────────────────────────────────

  const startTest = useCallback(() => {
    const questions = shuffleArray(
      diagnosticQuestions.filter((q) => selectedSubjects.includes(q.subject))
    )
    setTestQuestions(questions)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setAnswers([])
    setElapsedSeconds(0)
    setPhase('test')
  }, [selectedSubjects])

  // ── Timer ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (phase === 'test') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase])

  // ── Format timer ───────────────────────────────────────────────────────────

  const formattedTime = useMemo(() => {
    const m = Math.floor(elapsedSeconds / 60)
    const s = elapsedSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }, [elapsedSeconds])

  // ── Handle answer selection ────────────────────────────────────────────────

  const handleSelectAnswer = useCallback((index: number) => {
    setSelectedAnswer(index)
  }, [])

  // ── Compute results ────────────────────────────────────────────────────────

  const computeResults = useCallback(
    (allAnswers: AnswerRecord[]) => {
      // Group answers by subject
      const subjectAnswersObj: Partial<Record<Subject, AnswerRecord[]>> = {}
      for (const answer of allAnswers) {
        const question = testQuestions.find((q) => q.id === answer.questionId)
        if (!question) continue
        const existing = subjectAnswersObj[question.subject] || []
        existing.push(answer)
        subjectAnswersObj[question.subject] = existing
      }

      // Compute SubjectScore for each subject
      const subjectScores: SubjectScore[] = []
      let totalScore = 0
      let totalMax = 0

      for (const [subject, subjectAns] of Object.entries(subjectAnswersObj) as [Subject, AnswerRecord[]][]) {
        if (!subjectAns) continue
        const maxScore = subjectAns.length
        const score = subjectAns.filter((a: AnswerRecord) => a.isCorrect).length
        const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
        const level: 'low' | 'medium' | 'high' =
          percentage >= 75 ? 'high' : percentage >= 50 ? 'medium' : 'low'

        // Determine topics
        const topicResults: Record<string, { correct: number; total: number }> = {}
        for (const ans of subjectAns) {
          const q = testQuestions.find((tq) => tq.id === ans.questionId)
          if (!q) continue
          const existing = topicResults[q.topic] || { correct: 0, total: 0 }
          existing.total += 1
          if (ans.isCorrect) existing.correct += 1
          topicResults[q.topic] = existing
        }

        const weakTopics: string[] = []
        const strongTopics: string[] = []
        for (const [topic, result] of Object.entries(topicResults)) {
          const topicPct = result.total > 0 ? (result.correct / result.total) * 100 : 0
          if (topicPct >= 70) {
            strongTopics.push(topic)
          } else {
            weakTopics.push(topic)
          }
        }

        subjectScores.push({
          subject,
          score,
          maxScore,
          percentage,
          level,
          weakTopics,
          strongTopics,
        })

        totalScore += score
        totalMax += maxScore
      }

      const overallPercentage =
        totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0

      // Simulate percentile from overall percentage
      const percentile = Math.min(
        99,
        Math.max(1, Math.round(overallPercentage * 0.95 + Math.random() * 5))
      )

      // University predictions
      const testedSubjects = Object.keys(subjectAnswersObj) as Subject[]
      const predictions: UniversityPrediction[] = []

      for (const uni of universities) {
        for (const spec of uni.specialties) {
          // Check if student tested relevant subjects
          const relevantSubjects = spec.subjects.filter((s) =>
            testedSubjects.includes(s)
          )
          if (relevantSubjects.length === 0) continue

          // Compute average score for relevant subjects
          let relevantScore = 0
          let relevantMax = 0
          for (const sub of relevantSubjects) {
            const subScore = subjectScores.find((ss) => ss.subject === sub)
            if (subScore) {
              relevantScore += subScore.score
              relevantMax += subScore.maxScore
            }
          }

          const studentPct =
            relevantMax > 0 ? (relevantScore / relevantMax) * 100 : 0
          const requiredPct = spec.minScore

          // Calculate probability
          let probability: number
          const ratio = studentPct / requiredPct
          if (ratio >= 1) {
            probability = Math.min(98, 75 + (ratio - 1) * 100)
          } else if (ratio >= 0.85) {
            probability = 40 + (ratio - 0.85) * (35 / 0.15)
          } else if (ratio >= 0.6) {
            probability = 10 + (ratio - 0.6) * (30 / 0.25)
          } else {
            probability = Math.max(2, ratio * 16)
          }

          probability = Math.round(probability)

          const scoreGap =
            studentPct >= requiredPct
              ? 0
              : Math.round(requiredPct - studentPct)

          predictions.push({
            university: uni,
            specialty: spec,
            probability,
            scoreGap,
          })
        }
      }

      // Sort by probability desc
      predictions.sort((a, b) => b.probability - a.probability)

      const diagnosticResult: DiagnosticResult = {
        id: generateId(),
        userId: user?.id || 'anonymous',
        date: new Date().toISOString(),
        subjects: subjectScores,
        overallScore: totalScore,
        maxScore: totalMax,
        percentile,
        predictedUniversities: predictions,
      }

      setResult(diagnosticResult)
      setDiagnosticResult(diagnosticResult)
      if (timerRef.current) clearInterval(timerRef.current)
      setPhase('results')
    },
    [testQuestions, user, setDiagnosticResult]
  )

  // ── Handle next question / finish ──────────────────────────────────────────

  const handleNext = useCallback(() => {
    if (selectedAnswer === null) return

    const currentQ = testQuestions[currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQ.correctAnswer
    const newAnswers = [
      ...answers,
      {
        questionId: currentQ.id,
        selectedAnswer,
        isCorrect,
      },
    ]
    setAnswers(newAnswers)

    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1)
      setSelectedAnswer(null)
    } else {
      computeResults(newAnswers)
    }
  }, [selectedAnswer, testQuestions, currentQuestionIndex, answers, computeResults])

  // ── Get probability color ──────────────────────────────────────────────────

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-emerald-600'
    if (probability >= 40) return 'text-amber-600'
    return 'text-red-500'
  }

  const getProbabilityBg = (probability: number) => {
    if (probability >= 75) return 'bg-emerald-50 border-emerald-200'
    if (probability >= 40) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }

  const getLevelBadge = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            <TrendingUp className="w-3 h-3" /> Высокий
          </span>
        )
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <BarChart3 className="w-3 h-3" /> Средний
          </span>
        )
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            <AlertCircle className="w-3 h-3" /> Низкий
          </span>
        )
    }
  }

  // ── Animation variants ─────────────────────────────────────────────────────

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  const questionVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  }

  // ── Render Phase 1: Subject Selection ──────────────────────────────────────

  const renderSelection = () => (
    <motion.div
      key="selection"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 mb-4">
          <Target className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Диагностика знаний
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Выбери предметы для оценки (минимум 2). Мы определим твой уровень и
          подскажем, куда ты можешь поступить.
        </p>
      </motion.div>

      {/* Subject Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
      >
        {availableSubjects.map(({ subject, count }) => {
          const isSelected = selectedSubjects.includes(subject)
          const color = SUBJECT_COLORS[subject]

          return (
            <motion.button
              key={subject}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleSubject(subject)}
              className={`relative flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-100'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Checkbox */}
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {isSelected && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 text-white"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                )}
              </div>

              {/* Icon */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: `${color}18`,
                  color: color,
                }}
              >
                {SUBJECT_ICONS[subject]}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {SUBJECT_NAMES[subject]}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {count} {count === 1 ? 'вопрос' : count < 5 ? 'вопроса' : 'вопросов'}
                </p>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary-500" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </motion.div>

      {/* Selected count and start button */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white rounded-xl border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              Выбрано:{' '}
              <span className="text-primary-600">{selectedSubjects.length}</span>{' '}
              {selectedSubjects.length === 1
                ? 'предмет'
                : selectedSubjects.length < 5
                  ? 'предмета'
                  : 'предметов'}
            </p>
            <p className="text-sm text-gray-500">
              {selectedSubjects.length < 2
                ? 'Выберите минимум 2 предмета'
                : `${diagnosticQuestions.filter((q) => selectedSubjects.includes(q.subject)).length} вопросов в тесте`}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={selectedSubjects.length >= 2 ? { scale: 1.03 } : {}}
          whileTap={selectedSubjects.length >= 2 ? { scale: 0.97 } : {}}
          disabled={selectedSubjects.length < 2}
          onClick={startTest}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all ${
            selectedSubjects.length >= 2
              ? 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <Play className="w-5 h-5" />
          Начать тест
        </motion.button>
      </motion.div>
    </motion.div>
  )

  // ── Render Phase 2: Test ───────────────────────────────────────────────────

  const renderTest = () => {
    if (testQuestions.length === 0) return null
    const currentQ = testQuestions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100
    const isLast = currentQuestionIndex === testQuestions.length - 1
    const subjectColor = SUBJECT_COLORS[currentQ.subject]

    return (
      <motion.div
        key="test"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-3xl mx-auto"
      >
        {/* Top bar: progress, timer, counter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ backgroundColor: subjectColor }}
              >
                {SUBJECT_ICONS[currentQ.subject] &&
                  <span className="w-3.5 h-3.5 [&>svg]:w-3.5 [&>svg]:h-3.5">{SUBJECT_ICONS[currentQ.subject]}</span>}
                {SUBJECT_NAMES[currentQ.subject]}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {currentQ.topic}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="font-mono font-medium">{formattedTime}</span>
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {currentQuestionIndex + 1}{' '}
                <span className="text-gray-400 font-normal">из</span>{' '}
                {testQuestions.length}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: subjectColor }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            variants={questionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Question text */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
              <p className="text-lg font-semibold text-gray-900 leading-relaxed">
                {currentQ.text}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx
                const letters = ['A', 'B', 'C', 'D']

                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectAnswer(idx)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-100'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {letters[idx]}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? 'text-primary-700' : 'text-gray-700'
                      }`}
                    >
                      {option}
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <CheckCircle2 className="w-5 h-5 text-primary-500" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Next button */}
            <div className="flex justify-end">
              <motion.button
                whileHover={selectedAnswer !== null ? { scale: 1.03 } : {}}
                whileTap={selectedAnswer !== null ? { scale: 0.97 } : {}}
                disabled={selectedAnswer === null}
                onClick={handleNext}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all ${
                  selectedAnswer !== null
                    ? isLast
                      ? 'bg-accent-600 hover:bg-accent-700 shadow-lg shadow-accent-200'
                      : 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isLast ? (
                  <>
                    <Trophy className="w-5 h-5" />
                    Завершить тест
                  </>
                ) : (
                  <>
                    Следующий вопрос
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    )
  }

  // ── Render Phase 3: Results ────────────────────────────────────────────────

  const renderResults = () => {
    if (!result) return null

    const overallPercentage =
      result.maxScore > 0
        ? Math.round((result.overallScore / result.maxScore) * 100)
        : 0

    const overallColor =
      overallPercentage >= 75
        ? '#16a34a'
        : overallPercentage >= 50
          ? '#d97706'
          : '#dc2626'

    // Top 10 predictions
    const topPredictions = result.predictedUniversities.slice(0, 10)

    return (
      <motion.div
        key="results"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring' as const, stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-100 text-accent-600 mb-4"
          >
            <Award className="w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Результаты диагностики
          </h1>
          <p className="text-gray-500">
            Тест завершен за{' '}
            <span className="font-semibold text-gray-700">{formattedTime}</span>
          </p>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <CircularProgress
              percentage={overallPercentage}
              color={overallColor}
              size={180}
              strokeWidth={14}
              sublabel={`${result.overallScore} из ${result.maxScore}`}
            />

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Общий результат
              </h2>
              <p className="text-gray-500 mb-4">
                Вы ответили правильно на{' '}
                <span className="font-semibold text-gray-800">
                  {result.overallScore}
                </span>{' '}
                из{' '}
                <span className="font-semibold text-gray-800">
                  {result.maxScore}
                </span>{' '}
                вопросов
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50 border border-primary-200">
                  <BarChart3 className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-semibold text-primary-700">
                    Перцентиль: {result.percentile}%
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-600">
                    Время: {formattedTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-600">
                    {result.subjects.length}{' '}
                    {result.subjects.length === 1
                      ? 'предмет'
                      : result.subjects.length < 5
                        ? 'предмета'
                        : 'предметов'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Comparison with previous diagnostic */}
        {previousResult && diagnosticHistory.length > 0 && (() => {
          const lastPrev = diagnosticHistory[diagnosticHistory.length - 1]
          const prevPct = lastPrev.maxScore > 0
            ? Math.round((lastPrev.overallScore / lastPrev.maxScore) * 100)
            : 0
          const diff = overallPercentage - prevPct

          return (
            <motion.div
              variants={itemVariants}
              className="mb-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary-600" />
                Сравнение с прошлым результатом
              </h2>

              {/* Overall comparison */}
              <div className="flex items-center gap-6 mb-6 p-4 rounded-xl bg-gray-50">
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-400 mb-1">Было</p>
                  <p className="text-2xl font-bold text-gray-400">{prevPct}%</p>
                </div>
                <div className="flex items-center justify-center">
                  {diff > 0 ? (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm font-bold">+{diff}%</span>
                    </div>
                  ) : diff < 0 ? (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-100 text-red-600">
                      <ArrowDownRight className="w-4 h-4" />
                      <span className="text-sm font-bold">{diff}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-500">
                      <Minus className="w-4 h-4" />
                      <span className="text-sm font-bold">0%</span>
                    </div>
                  )}
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-400 mb-1">Стало</p>
                  <p className="text-2xl font-bold text-gray-900">{overallPercentage}%</p>
                </div>
              </div>

              {/* Per-subject comparison */}
              <div className="space-y-3">
                {result.subjects.map((current) => {
                  const prev = lastPrev.subjects.find(s => s.subject === current.subject)
                  const subDiff = prev ? current.percentage - prev.percentage : 0
                  return (
                    <div key={current.subject} className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: SUBJECT_COLORS[current.subject] }}
                      />
                      <span className="text-sm font-medium text-gray-700 w-32 truncate">
                        {SUBJECT_NAMES[current.subject]}
                      </span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: SUBJECT_COLORS[current.subject] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${current.percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-12 text-right">
                        {current.percentage}%
                      </span>
                      {prev && subDiff !== 0 && (
                        <span className={`text-xs font-semibold w-12 text-right ${subDiff > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {subDiff > 0 ? '+' : ''}{subDiff}%
                        </span>
                      )}
                      {prev && subDiff === 0 && (
                        <span className="text-xs text-gray-400 w-12 text-right">—</span>
                      )}
                      {!prev && <span className="text-xs text-gray-300 w-12 text-right">new</span>}
                    </div>
                  )
                })}
              </div>

              {diff > 0 && (
                <div className="mt-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200/60 text-sm text-emerald-700">
                  Отличный прогресс! Вы улучшили свой результат на <strong>{diff}%</strong>. Продолжайте в том же духе!
                </div>
              )}
              {diff < 0 && (
                <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-sm text-amber-700">
                  Не переживайте! Результат может колебаться. Сфокусируйтесь на слабых темах и повторите через неделю.
                </div>
              )}
            </motion.div>
          )
        })()}

        {/* Subject Breakdown */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Результаты по предметам
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.subjects.map((subScore, idx) => (
              <motion.div
                key={subScore.subject}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${SUBJECT_COLORS[subScore.subject]}18`,
                        color: SUBJECT_COLORS[subScore.subject],
                      }}
                    >
                      {SUBJECT_ICONS[subScore.subject]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {SUBJECT_NAMES[subScore.subject]}
                      </p>
                      <p className="text-xs text-gray-400">
                        {subScore.score} из {subScore.maxScore} правильно
                      </p>
                    </div>
                  </div>
                  {getLevelBadge(subScore.level)}
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Результат</span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: SUBJECT_COLORS[subScore.subject] }}
                    >
                      {subScore.percentage}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: SUBJECT_COLORS[subScore.subject],
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${subScore.percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + idx * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Topics */}
                <div className="space-y-2">
                  {subScore.strongTopics.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {subScore.strongTopics.map((topic) => (
                        <span
                          key={topic}
                          className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                  {subScore.weakTopics.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      {subScore.weakTopics.map((topic) => (
                        <span
                          key={topic}
                          className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-600 border border-red-200"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* University Predictions */}
        {topPredictions.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary-600" />
              Прогноз поступления
            </h2>

            <div className="space-y-3">
              {topPredictions.map((pred, idx) => (
                <motion.div
                  key={`${pred.university.id}-${pred.specialty.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.08 }}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border ${getProbabilityBg(
                    pred.probability
                  )}`}
                >
                  {/* Probability circle */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                        pred.probability >= 75
                          ? 'border-emerald-300 bg-emerald-100'
                          : pred.probability >= 40
                            ? 'border-amber-300 bg-amber-100'
                            : 'border-red-300 bg-red-100'
                      }`}
                    >
                      <span
                        className={`text-lg font-bold ${getProbabilityColor(
                          pred.probability
                        )}`}
                      >
                        {pred.probability}%
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      {pred.university.name}
                    </p>
                    <p className="text-sm text-gray-600">{pred.specialty.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        Мин. балл: {pred.specialty.minScore}%
                      </span>
                      {pred.scoreGap > 0 && (
                        <span className="text-xs text-red-500 font-medium">
                          Не хватает ~{pred.scoreGap}%
                        </span>
                      )}
                      {pred.scoreGap === 0 && (
                        <span className="text-xs text-emerald-600 font-medium">
                          Балл достаточен
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {pred.specialty.avgSalary}/мес
                      </span>
                    </div>
                  </div>

                  {/* Demand badge */}
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        pred.specialty.demand === 'high'
                          ? 'bg-emerald-100 text-emerald-700'
                          : pred.specialty.demand === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {pred.specialty.demand === 'high'
                        ? 'Высокий спрос'
                        : pred.specialty.demand === 'medium'
                          ? 'Средний спрос'
                          : 'Низкий спрос'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 mt-10"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/plan')}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            <Target className="w-5 h-5" />
            Создать учебный план
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setPhase('selection')
              setResult(null)
              setSelectedSubjects([])
              setAnswers([])
              setCurrentQuestionIndex(0)
              setSelectedAnswer(null)
              setElapsedSeconds(0)
            }}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-primary-700 bg-primary-50 border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-100 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Пройти повторно
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <BarChart3 className="w-5 h-5" />
            Перейти в дашборд
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  // ── Main Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <AnimatePresence mode="wait">
        {phase === 'selection' && renderSelection()}
        {phase === 'test' && renderTest()}
        {phase === 'results' && renderResults()}
      </AnimatePresence>
    </div>
  )
}
