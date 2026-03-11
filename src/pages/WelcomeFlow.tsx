import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { useStore } from '@/store/useStore'

// ── Types ──────────────────────────────────────────────────────────────────────

type Goal = 'ent' | 'ielts' | 'abroad' | 'career' | 'startup'
type Commitment = '15' | '30' | '60' | '120'

const GOALS: { id: Goal; emoji: string; title: string; subtitle: string; to: string }[] = [
  { id: 'ent',     emoji: '🎯', title: 'ЕНТ',              subtitle: 'Набрать 120+ баллов',        to: '/diagnostic' },
  { id: 'ielts',   emoji: '🌍', title: 'IELTS',             subtitle: 'Поступить за рубеж',         to: '/ielts' },
  { id: 'abroad',  emoji: '🏛️', title: 'Поступление',       subtitle: 'В зарубежный университет',  to: '/admissions' },
  { id: 'career',  emoji: '💼', title: 'Карьера',           subtitle: 'Портфолио и первая работа', to: '/career-tracker' },
  { id: 'startup', emoji: '🚀', title: 'Стартап',           subtitle: 'Запустить свой проект',     to: '/startup-lab' },
]

const COMMITMENTS: { id: Commitment; label: string; sublabel: string; emoji: string }[] = [
  { id: '15',  label: '15 минут',  sublabel: 'Поддерживающий режим', emoji: '🌱' },
  { id: '30',  label: '30 минут',  sublabel: 'Стандартный темп',     emoji: '⚡' },
  { id: '60',  label: '1 час',     sublabel: 'Интенсивный рост',     emoji: '🔥' },
  { id: '120', label: '2+ часа',   sublabel: 'Режим турбо',          emoji: '🚀' },
]

// ── Animations ─────────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const } },
  exit:  (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.25 } }),
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function WelcomeFlow() {
  const navigate    = useNavigate()
  const [params]    = useSearchParams()
  const { user }    = useStore()

  const defaultTo = params.get('to') ?? '/dashboard'

  const [step,       setStep]       = useState<0 | 1 | 2>(0)
  const [dir,        setDir]        = useState(1)
  const [goal,       setGoal]       = useState<Goal | null>(null)
  const [commitment, setCommitment] = useState<Commitment | null>(null)
  const [finalDest,  setFinalDest]  = useState(defaultTo)
  const [countdown,  setCountdown]  = useState(3)

  // Step 2 — auto countdown + redirect
  useEffect(() => {
    if (step !== 2) return
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); navigate(finalDest, { replace: true }); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [step, finalDest, navigate])

  function goToStep(n: 0 | 1 | 2, direction: number) {
    setDir(direction)
    setStep(n)
  }

  function pickGoal(g: Goal) {
    setGoal(g)
    // Destination from goal overrides ?to= param only if no source was provided
    const dest = GOALS.find(x => x.id === g)?.to ?? defaultTo
    // If defaultTo is already a specific page (not /dashboard), keep it
    if (defaultTo === '/dashboard') setFinalDest(dest)
    goToStep(1, 1)
  }

  function pickCommitment(c: Commitment) {
    setCommitment(c)
    // Save to localStorage for future use (study plan, notifications, etc.)
    localStorage.setItem('studyhub-commitment-min', c)
    goToStep(2, 1)
  }

  function skip() {
    navigate(finalDest, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4 py-8">

      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-10">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ width: i === step ? 24 : 8, opacity: i <= step ? 1 : 0.35 }}
            transition={{ duration: 0.3 }}
            className={`h-2 rounded-full ${i <= step ? 'bg-violet-400' : 'bg-slate-600'}`}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative overflow-hidden">
        <AnimatePresence custom={dir} mode="wait">

          {/* ── Step 0: Goal selection ─────────────────────────────────────── */}
          {step === 0 && (
            <motion.div
              key="step0"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center text-center"
            >
              <div className="text-5xl mb-4">👋</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                {user?.name ? `Привет, ${user.name.split(' ')[0]}!` : 'Привет!'}
              </h1>
              <p className="text-slate-400 mb-8 text-sm sm:text-base">
                Расскажи, какая у тебя главная цель — настроим платформу под тебя
              </p>

              <div className="w-full space-y-3">
                {GOALS.map((g, i) => (
                  <motion.button
                    key={g.id}
                    onClick={() => pickGoal(g.id)}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.07 } }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 hover:border-violet-400/50 px-5 py-4 transition-all text-left"
                  >
                    <span className="text-3xl">{g.emoji}</span>
                    <div>
                      <div className="font-bold text-white text-base">{g.title}</div>
                      <div className="text-slate-400 text-sm">{g.subtitle}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 ml-auto flex-shrink-0" />
                  </motion.button>
                ))}
              </div>

              <button
                onClick={skip}
                className="mt-6 text-slate-500 text-sm hover:text-slate-400 transition-colors"
              >
                Пропустить →
              </button>
            </motion.div>
          )}

          {/* ── Step 1: Commitment ────────────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center text-center"
            >
              <div className="text-5xl mb-4">⏰</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                Сколько времени в день?
              </h1>
              <p className="text-slate-400 mb-8 text-sm sm:text-base">
                Будем присылать план под твой ритм. Можно изменить в любой момент.
              </p>

              <div className="w-full grid grid-cols-2 gap-3">
                {COMMITMENTS.map((c, i) => (
                  <motion.button
                    key={c.id}
                    onClick={() => pickCommitment(c.id)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.07 } }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex flex-col items-center rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 hover:border-violet-400/50 px-4 py-5 transition-all"
                  >
                    <span className="text-3xl mb-2">{c.emoji}</span>
                    <div className="font-bold text-white text-base">{c.label}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{c.sublabel}</div>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={skip}
                className="mt-6 text-slate-500 text-sm hover:text-slate-400 transition-colors"
              >
                Пропустить →
              </button>
            </motion.div>
          )}

          {/* ── Step 2: Success ───────────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20, delay: 0.1 } }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(139,92,246,0.5)]"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                  Всё готово! 🎉
                </h1>
                <p className="text-slate-400 mb-2 text-sm sm:text-base">
                  Твой персональный план создан.{' '}
                  {commitment && (
                    <span className="text-violet-300 font-semibold">
                      {COMMITMENTS.find(c => c.id === commitment)?.label} в день
                    </span>
                  )}
                  {commitment && ' — отличный ритм!'}
                </p>
                {goal && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    Цель: {GOALS.find(g => g.id === goal)?.title}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.6 } }}
                className="mt-10 w-full"
              >
                <button
                  onClick={() => navigate(finalDest, { replace: true })}
                  className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold py-4 text-base hover:opacity-90 transition-opacity"
                >
                  Начать сейчас
                </button>
                <p className="mt-3 text-slate-500 text-sm">
                  Автоматический переход через {countdown} сек...
                </p>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
