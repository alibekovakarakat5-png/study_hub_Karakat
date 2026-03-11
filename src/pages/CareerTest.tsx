import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Share2, Lock, CheckCircle, ChevronRight, TrendingUp, Zap } from 'lucide-react'
import {
  CAREER_TEST_QUESTIONS,
  PERSONALITY_TYPES,
  calculateResult,
  type TestAnswer,
  type PersonalityAxis,
} from '@/data/careerTestData'
import { cn } from '@/lib/utils'

const AXES: PersonalityAxis[] = ['tech', 'creative', 'analyst', 'leader', 'helper', 'maker']
const AXIS_LABELS: Record<PersonalityAxis, string> = {
  tech: 'Технологии', creative: 'Творчество', analyst: 'Аналитика',
  leader: 'Лидерство', helper: 'Помощь людям', maker: 'Инженерия',
}

// ── Intro screen ───────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-8 py-8"
    >
      <div className="space-y-4">
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          className="text-7xl"
        >
          🔮
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
          Кем ты станешь?
        </h1>
        <p className="text-white/70 text-lg max-w-sm mx-auto leading-relaxed">
          12 вопросов — и ты узнаешь свой профессиональный тип и топ-3 профессии будущего
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {['🤖 Tech Builder', '🎨 Creative', '📊 Analyst', '🚀 Leader', '❤️ Helper', '⚙️ Maker'].map((t) => (
          <span key={t} className="bg-white/10 text-white/80 text-sm px-3 py-1.5 rounded-full border border-white/20">
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 text-white/60 text-sm">
        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Бесплатно</span>
        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> 3 минуты</span>
        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Без регистрации</span>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-50 font-bold px-10 py-4 rounded-2xl text-lg shadow-xl transition-all hover:-translate-y-0.5"
      >
        Узнать свой тип <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  )
}

// ── Question screen ────────────────────────────────────────────────────────────

function QuestionScreen({
  question,
  questionNumber,
  total,
  selected,
  onSelect,
}: {
  question: typeof CAREER_TEST_QUESTIONS[0]
  questionNumber: number
  total: number
  selected: TestAnswer | null
  onSelect: (a: TestAnswer) => void
}) {
  const progress = ((questionNumber - 1) / total) * 100

  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="space-y-6"
    >
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-white/50 text-xs">
          <span>Вопрос {questionNumber} из {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: `${((questionNumber - 2) / total) * 100}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="text-center space-y-2 py-2">
        <div className="text-5xl">{question.emoji}</div>
        <h2 className="text-white font-bold text-xl sm:text-2xl leading-snug">
          {question.question}
        </h2>
      </div>

      {/* Answers */}
      <div className="space-y-3">
        {question.answers.map((answer, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => onSelect(answer)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={cn(
              'w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all',
              selected === answer
                ? 'bg-white text-slate-900 border-white scale-[1.02] shadow-lg'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40',
            )}
          >
            <span className="text-2xl shrink-0">{answer.emoji}</span>
            <span className="font-medium text-sm sm:text-base leading-snug">{answer.text}</span>
            {selected === answer && (
              <CheckCircle className="w-5 h-5 ml-auto shrink-0 text-green-500" />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// ── Loading screen ─────────────────────────────────────────────────────────────

function LoadingScreen() {
  const phrases = [
    'Анализируем твои ответы...',
    'Строим профиль личности...',
    'Подбираем профессии...',
    'Почти готово...',
  ]
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => Math.min(i + 1, phrases.length - 1)), 800)
    return () => clearInterval(t)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 space-y-8"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-full border-4 border-white/20 border-t-white"
        />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">🧠</div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-white/80 text-lg font-medium"
        >
          {phrases[idx]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  )
}

// ── Result screen ──────────────────────────────────────────────────────────────

function ResultScreen({
  result,
}: {
  result: ReturnType<typeof calculateResult>
}) {
  const { primary, secondary, scores, topPercent } = result
  const navigate = useNavigate()
  const [shared, setShared] = useState(false)

  const handleShare = () => {
    const text = `🔮 Прошёл тест на карьерный тип!\n\nМой результат: ${primary.emoji} ${primary.title} — ${primary.subtitle}\n\nТоп профессии:\n${primary.professions.map(p => `${p.emoji} ${p.title}`).join('\n')}\n\nУзнай свой тип → skylla.netlify.app/career-test`
    if (navigator.share) {
      navigator.share({ title: 'Мой карьерный тип', text })
    } else {
      navigator.clipboard.writeText(text).then(() => setShared(true))
      setTimeout(() => setShared(false), 2500)
    }
  }

  const maxScore = Math.max(...Object.values(scores))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Primary type card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className={`bg-gradient-to-br ${primary.gradient} rounded-3xl p-6 text-white text-center space-y-3`}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-6xl"
        >
          {primary.emoji}
        </motion.div>
        <div>
          <p className="text-white/70 text-sm font-semibold uppercase tracking-wider">Твой тип</p>
          <h2 className="text-3xl font-extrabold">{primary.title}</h2>
          <p className="text-white/80 text-base">{primary.subtitle}</p>
        </div>
        <div className="flex justify-center gap-2 flex-wrap">
          {primary.traits.map((t) => (
            <span key={t} className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {t}
            </span>
          ))}
        </div>
        <p className="text-white/75 text-sm leading-relaxed max-w-sm mx-auto">
          {primary.description}
        </p>
      </motion.div>

      {/* Score bars */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Твой профиль</p>
        {AXES.map((axis) => (
          <div key={axis} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">{PERSONALITY_TYPES[axis].emoji} {AXIS_LABELS[axis]}</span>
              <span className="text-white/50 text-xs">{scores[axis]}pts</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: PERSONALITY_TYPES[axis].color }}
                initial={{ width: 0 }}
                animate={{ width: maxScore > 0 ? `${(scores[axis] / maxScore) * 100}%` : '0%' }}
                transition={{ duration: 0.6, delay: 0.1 * AXES.indexOf(axis) }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Top professions — first one visible, rest blurred */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-white/60" />
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Твои профессии</p>
        </div>

        {/* First profession — fully visible */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center gap-4"
        >
          <span className="text-3xl">{primary.professions[0].emoji}</span>
          <div className="flex-1">
            <p className="text-white font-bold">{primary.professions[0].title}</p>
            <p className="text-green-400 text-sm font-semibold">{primary.professions[0].salary}</p>
          </div>
          <span className="text-xs font-bold bg-green-500/20 text-green-300 px-2.5 py-1 rounded-full">
            {primary.professions[0].demand}
          </span>
        </motion.div>

        {/* Second profession — secondary type */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4"
        >
          <span className="text-3xl">{secondary.professions[0].emoji}</span>
          <div className="flex-1">
            <p className="text-white/70 font-semibold">{secondary.professions[0].title}</p>
            <p className="text-white/40 text-xs">Дополнительный тип: {secondary.emoji} {secondary.title}</p>
          </div>
        </motion.div>

        {/* Remaining professions — locked behind registration */}
        <div className="relative">
          <div className="space-y-3 blur-sm pointer-events-none select-none">
            {[...primary.professions.slice(1), secondary.professions[1]].map((p, i) => (
              <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center gap-4">
                <span className="text-3xl">{p.emoji}</span>
                <div className="flex-1">
                  <p className="text-white font-bold">{p.title}</p>
                  <p className="text-green-400 text-sm">{p.salary}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-slate-950/90 via-slate-950/70 to-transparent rounded-2xl">
            <div className="text-center space-y-3 px-4">
              <Lock className="w-8 h-8 text-white/60 mx-auto" />
              <p className="text-white font-bold text-base">+5 профессий заблокированы</p>
              <p className="text-white/60 text-sm">Зарегистрируйся бесплатно чтобы увидеть полный список, зарплаты и карьерный план</p>
              <Link
                to="/auth?from=career"
                className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-50 font-bold px-6 py-3 rounded-xl text-sm shadow-lg transition-all"
              >
                Разблокировать результаты <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary type teaser */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4"
      >
        <div className="text-3xl">{secondary.emoji}</div>
        <div className="flex-1">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Вторичный тип</p>
          <p className="text-white font-semibold">{secondary.title}</p>
          <p className="text-white/50 text-sm">{secondary.subtitle}</p>
        </div>
        <Link
          to="/auth?from=career"
          className="shrink-0 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
        >
          Подробнее →
        </Link>
      </motion.div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3.5 rounded-2xl text-sm transition-all"
        >
          <Share2 className="w-4 h-4" />
          {shared ? 'Скопировано!' : 'Поделиться'}
        </button>
        <Link
          to="/auth?from=career"
          className="flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-50 font-bold py-3.5 rounded-2xl text-sm transition-all"
        >
          <Zap className="w-4 h-4" />
          Мой план карьеры
        </Link>
      </div>

      {/* Retake */}
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="w-full text-white/40 hover:text-white/70 text-sm transition-colors py-2"
      >
        Пройти тест заново
      </button>
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

type Stage = 'intro' | 'test' | 'loading' | 'result'

export default function CareerTest() {
  const [stage, setStage] = useState<Stage>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<(TestAnswer | null)[]>(
    new Array(CAREER_TEST_QUESTIONS.length).fill(null)
  )
  const [selected, setSelected] = useState<TestAnswer | null>(null)
  const [result, setResult] = useState<ReturnType<typeof calculateResult> | null>(null)

  const totalQ = CAREER_TEST_QUESTIONS.length

  const handleSelect = (answer: TestAnswer) => {
    setSelected(answer)
    // Auto-advance after short delay
    setTimeout(() => {
      const newAnswers = [...answers]
      newAnswers[currentQ] = answer
      setAnswers(newAnswers)

      if (currentQ < totalQ - 1) {
        setCurrentQ(q => q + 1)
        setSelected(null)
      } else {
        setStage('loading')
        setTimeout(() => {
          setResult(calculateResult(newAnswers))
          setStage('result')
        }, 3200)
      }
    }, 350)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/40 to-slate-900">
      {/* Nav */}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">Study<span className="text-violet-400">Hub</span></span>
          </Link>
          <span className="text-white/60 text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-full">
            🔮 Тест профессий
          </span>
          {stage === 'test' && (
            <span className="text-white/50 text-xs">{currentQ + 1}/{totalQ}</span>
          )}
          {stage !== 'test' && <div className="w-12" />}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {stage === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <IntroScreen onStart={() => setStage('test')} />
            </motion.div>
          )}

          {stage === 'test' && (
            <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnimatePresence mode="wait">
                <QuestionScreen
                  key={currentQ}
                  question={CAREER_TEST_QUESTIONS[currentQ]}
                  questionNumber={currentQ + 1}
                  total={totalQ}
                  selected={selected}
                  onSelect={handleSelect}
                />
              </AnimatePresence>
            </motion.div>
          )}

          {stage === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingScreen />
            </motion.div>
          )}

          {stage === 'result' && result && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ResultScreen result={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
