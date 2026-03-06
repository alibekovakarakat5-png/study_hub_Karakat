import { useEffect, useRef, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Flame, Volume2, VolumeX, ChevronRight, Mic, MicOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { useCuratorStore } from '@/store/useCuratorStore'
import { usePracticeEntStore } from '@/store/usePracticeEntStore'
import {
  useRobotStore,
  POMODORO_WORK_SECONDS,
  POMODORO_BREAK_SECONDS,
} from '@/store/useRobotStore'
import {
  buildStudentContext,
  buildContextualGreeting,
  buildIdleMessage,
  subjectSummary,
  getHolidayGreeting,
  getRandomIdleFact,
  evaluateStudentSpeech,
} from '@/lib/robotContext'
import { curatorContent } from '@/data/curatorContent'
import { findMentorAnswer, getPageHint } from '@/data/mentorKnowledge'
import { useLocation } from 'react-router-dom'
import type { CuratorLevel } from '@/types/curator'
import RobotFace from './RobotFace'
import Robot3DFace from './Robot3DFace'
import type { RobotMood } from '@/store/useRobotStore'

// ── 3D scene URL ──────────────────────────────────────────────────────────────
// 1. Go to https://spline.design, create your robot scene
// 2. Export → "Viewer link" (or "Code export" → copy the .splinecode URL)
// 3. Paste the URL here — the widget will switch from 2D SVG to 3D automatically.
// Leave empty to keep the 2D fallback.
const SPLINE_SCENE_URL = ''

// ── Constants ─────────────────────────────────────────────────────────────────

const IDLE_THRESHOLD_MS = 5 * 60 * 1000

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function deriveMood(
  curatorPhase: string,
  latestScore: number | null,
  lastActivityAt: number,
): RobotMood {
  if (Date.now() - lastActivityAt >= IDLE_THRESHOLD_MS) return 'sleeping'
  if (curatorPhase === 'module') return 'thinking'
  if (latestScore !== null) {
    if (latestScore > 80) return 'excited'
    if (latestScore >= 70) return 'happy'
    return 'encouraging'
  }
  return 'idle'
}

function streakLabel(n: number): string {
  if (n === 1) return 'день'
  if (n < 5)  return 'дня'
  return 'дней'
}

const levelPillClass: Record<CuratorLevel, string> = {
  beginner:     'bg-amber-500/30 text-amber-200',
  intermediate: 'bg-blue-500/30  text-blue-200',
  advanced:     'bg-green-500/30  text-green-200',
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RobotWidget() {
  const navigate = useNavigate()
  const location = useLocation()

  // ── Store subscriptions ──────────────────────────────────────────────────
  const user             = useStore(s => s.user)
  const isAuth           = useStore(s => s.isAuthenticated)
  const hasTakenDiag     = useStore(s => s.hasTakenDiagnostic)

  const goalType         = useCuratorStore(s => s.goalType)
  const selectedSubjects = useCuratorStore(s => s.selectedSubjects)
  const subjectLevels    = useCuratorStore(s => s.subjectLevels)
  const diagnosticScores = useCuratorStore(s => s.diagnosticScores)
  const plan             = useCuratorStore(s => s.plan)
  const curatorPhase     = useCuratorStore(s => s.phase)
  const activeModuleId   = useCuratorStore(s => s.activeModuleId)
  const moduleProgress   = useCuratorStore(s => s.moduleProgress)

  const currentResult    = usePracticeEntStore(s => s.currentResult)

  const {
    isExpanded, toggleExpanded,
    mood, setMood, message, setMessage,
    lastActivityAt, recordActivity,
    isMuted, toggleMute, speak, stopSpeaking,
    robotName, setRobotName,
    lastGreetedDate, setLastGreetedDate,
    isListening, startListening, stopListening,
    pomodoroPhase, secondsRemaining, timerRunning,
    startTimer, pauseTimer, resetTimer, tickTimer,
  } = useRobotStore()

  // Local state for the naming input
  const [namingInput, setNamingInput] = useState('')

  // Text chat input
  const [chatInput, setChatInput] = useState('')

  const streak = user?.streak ?? 0

  // ── Voice dialog ─────────────────────────────────────────────────────────
  // Derive the active topic's keyPoints + first practice question for evaluation
  const activeTopicContent = useMemo(() => {
    if (!activeModuleId) return null
    return curatorContent.find(t =>
      // activeModuleId format: "subject-topicSlug" or match by topic name
      activeModuleId.toLowerCase().includes(t.topic.toLowerCase().split(' ')[0].toLowerCase()) ||
      t.topic.toLowerCase().includes(activeModuleId.toLowerCase())
    ) ?? null
  }, [activeModuleId])

  const isOnIelts = location.pathname === '/ielts'

  const handleMentorReply = (text: string) => {
    const mentorAnswer = findMentorAnswer(text, user?.name)
    if (mentorAnswer) {
      const newMood = mentorAnswer.mood ?? 'happy'
      setMood(newMood, mentorAnswer.text)
      speak(mentorAnswer.text)
      return true
    }
    return false
  }

  const handleVoiceDialog = () => {
    if (isListening) { stopListening(); return }

    const prompt = isOnIelts
      ? 'Слушаю! Задай вопрос по IELTS или назови тему.'
      : 'Слушаю! Объясни мне эту тему своими словами.'
    setMood('thinking', prompt)
    speak(prompt)

    // Small delay to let TTS start before mic opens
    setTimeout(() => {
      startListening(
        (transcript) => {
          // 1. Check mentor knowledge base first (IELTS, ENT, general)
          if (handleMentorReply(transcript)) return

          // 2. Fall back to curator topic evaluation (if in a module)
          const keyPoints = activeTopicContent?.theory.keyPoints ?? []
          const topicName = activeTopicContent?.topic ?? 'этой темы'
          const practiceText = activeTopicContent?.practice[0]?.text
          const result = evaluateStudentSpeech(transcript, keyPoints, topicName, practiceText)
          const fullResponse = `${result.feedback} ${result.followUp}`
          const newMood = result.mentionedCount === result.totalCount
            ? 'excited'
            : result.mentionedCount > 0
              ? 'happy'
              : 'encouraging'
          setMood(newMood, result.feedback)
          speak(fullResponse)
        },
      )
    }, 1200)
  }

  const handleChatSubmit = () => {
    const q = chatInput.trim()
    if (!q) return
    setChatInput('')
    const found = handleMentorReply(q)
    if (!found) {
      const fallback = 'Хм, не нашёл ответа на это. Попробуй спросить про IELTS, ЕНТ, Writing, Speaking или конкретную тему.'
      setMood('thinking', fallback)
    }
  }

  // ── Build student context ─────────────────────────────────────────────────
  const latestScore: number | null = (() => {
    if (currentResult) return currentResult.percentage
    const scores = Object.values(moduleProgress)
      .map(p => p.testScore)
      .filter((s): s is number => s !== undefined)
    return scores.length > 0 ? scores[scores.length - 1] : null
  })()

  const ctx = useMemo(() => {
    if (!user) return null
    return buildStudentContext({
      name: user.name,
      streak,
      goalType,
      selectedSubjects,
      subjectLevels,
      diagnosticScores,
      planCompleted: plan?.completedModules ?? 0,
      planTotal: plan?.totalModules ?? 0,
      latestEntScore: currentResult?.totalScore ?? null,
      latestEntPercentage: currentResult?.percentage ?? null,
      hasTakenDiagnostic: hasTakenDiag,
      createdAt: user.createdAt,
    })
  }, [
    user, streak, goalType, selectedSubjects, subjectLevels,
    diagnosticScores, plan, currentResult, hasTakenDiag,
  ])

  // ── Greeting on login (once per day) ─────────────────────────────────────
  useEffect(() => {
    if (!isAuth || !ctx) return

    const today = new Date().toDateString()
    if (lastGreetedDate === today) return

    // Holiday overrides normal greeting
    const holidayGreeting = getHolidayGreeting(robotName)
    const greetingText = holidayGreeting ?? buildContextualGreeting(ctx)

    const timer = setTimeout(() => {
      setMood('happy', greetingText)
      speak(greetingText)
      setLastGreetedDate(today)
      // Auto-open for new users OR when robot has no name yet
      if ((ctx.isNewUser || robotName === null) && !isExpanded) toggleExpanded()
    }, 1000)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, user?.id])

  // ── Page-aware hint (fires when pathname changes) ─────────────────────────
  const prevPathRef = useRef<string>('')
  useEffect(() => {
    if (!isAuth || prevPathRef.current === location.pathname) return
    prevPathRef.current = location.pathname
    const hint = getPageHint(location.pathname)
    if (!hint) return
    const timer = setTimeout(() => {
      setMood('happy', hint)
      if (isExpanded) speak(hint)
    }, 1500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isAuth])

  // ── Mood derivation ───────────────────────────────────────────────────────
  const prevMoodRef = useRef<RobotMood>(mood)

  useEffect(() => {
    const next = deriveMood(curatorPhase, latestScore, lastActivityAt)
    if (next === prevMoodRef.current) return
    prevMoodRef.current = next

    // When going idle, use context-aware message
    const customMsg = next === 'idle' && ctx ? buildIdleMessage(ctx) : undefined
    setMood(next, customMsg)
  }, [curatorPhase, latestScore, lastActivityAt, setMood, ctx])

  // Record activity when entering a module
  useEffect(() => {
    if (curatorPhase === 'module') recordActivity()
  }, [curatorPhase, recordActivity])

  // Speak on mood change (skip sleeping/idle to avoid constant chatter)
  const prevMoodSpeakRef = useRef<RobotMood | null>(null)
  useEffect(() => {
    if (prevMoodSpeakRef.current === null) {
      prevMoodSpeakRef.current = mood
      return
    }
    if (prevMoodSpeakRef.current === mood) return
    prevMoodSpeakRef.current = mood
    if (mood !== 'sleeping' && mood !== 'idle') speak(message)
  }, [mood, message, speak])

  // Update idle message: rotate fact every 45s, or show context-aware hint
  useEffect(() => {
    if (mood !== 'idle' || !ctx) return
    // If onboarding not done, use context hint; otherwise rotate facts
    const hasOnboarding = !ctx.hasTakenDiagnostic || !ctx.hasActivePlan ||
      (ctx.planProgress?.completed ?? 0) === 0
    const msg = hasOnboarding ? buildIdleMessage(ctx) : getRandomIdleFact()
    if (msg !== message) setMessage(msg)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, mood])

  // Rotate fact every 45s while idle
  useEffect(() => {
    const id = setInterval(() => {
      const s = useRobotStore.getState()
      if (s.mood !== 'idle') return
      s.setMessage(getRandomIdleFact())
    }, 45_000)
    return () => clearInterval(id)
  }, [])

  // Stop speaking on close
  useEffect(() => {
    if (!isExpanded) stopSpeaking()
  }, [isExpanded, stopSpeaking])

  // ── Pomodoro interval ─────────────────────────────────────────────────────
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(tickTimer, 1000)
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }
  }, [timerRunning, tickTimer])

  // ── Idleness polling ──────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const state = useRobotStore.getState()
      if (Date.now() - state.lastActivityAt >= IDLE_THRESHOLD_MS && prevMoodRef.current !== 'sleeping') {
        prevMoodRef.current = 'sleeping'
        state.setMood('sleeping')
      }
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!isAuth) return null

  // ── Onboarding step (derived, no persist needed) ──────────────────────────
  // Shows a CTA button in the widget guiding the student through the funnel
  const onboardingStep: 0 | 1 | 2 | 'done' = (() => {
    if (!ctx) return 'done'
    if (!ctx.hasTakenDiagnostic) return 0
    if (!ctx.hasActivePlan) return 1
    if ((ctx.planProgress?.completed ?? 0) === 0) return 2
    return 'done'
  })()

  const onboardingCTA: { label: string; path: string; emoji: string } | null = (() => {
    if (onboardingStep === 0) return { label: 'Пройти диагностику', path: '/diagnostic', emoji: '📋' }
    if (onboardingStep === 1) return { label: 'Создать план обучения', path: '/curator',   emoji: '📚' }
    if (onboardingStep === 2) return { label: 'Начать первый модуль', path: '/curator',    emoji: '🚀' }
    return null
  })()

  // ── Derived display values ────────────────────────────────────────────────
  const phaseLabel = pomodoroPhase === 'work' ? 'Фокус' : pomodoroPhase === 'break' ? 'Перерыв' : 'Помодоро'
  const timerMax   = pomodoroPhase === 'break' ? POMODORO_BREAK_SECONDS : POMODORO_WORK_SECONDS
  const timerPct   = pomodoroPhase === 'idle' ? 0 : ((timerMax - secondsRemaining) / timerMax) * 100

  // Subjects to show (max 3, only those with a known level)
  const subjectsToShow = (ctx?.subjects ?? []).slice(0, 3)

  // Plan progress percentage
  const planPct = ctx?.planProgress
    ? Math.round((ctx.planProgress.completed / ctx.planProgress.total) * 100)
    : null

  // ── Framer Motion variants ────────────────────────────────────────────────
  const widgetVariants = {
    collapsed: { width: 56, height: 56, borderRadius: '9999px', transition: { type: 'spring' as const, damping: 22, stiffness: 300 } },
    expanded:  { width: 220, borderRadius: '1rem',              transition: { type: 'spring' as const, damping: 22, stiffness: 300 } },
  }
  const contentVariants = {
    hidden:  { opacity: 0, y: 6, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { delay: 0.08, type: 'spring' as const, damping: 22, stiffness: 280 } },
    exit:    { opacity: 0, y: 6, scale: 0.96, transition: { duration: 0.1 } },
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <motion.div
        layout
        animate={isExpanded ? 'expanded' : 'collapsed'}
        variants={widgetVariants}
        initial="collapsed"
        className={cn(
          'overflow-hidden cursor-pointer select-none shadow-2xl shadow-blue-900/40',
          'bg-gradient-to-br from-blue-600 to-violet-700',
          !isExpanded && 'flex items-center justify-center animate-robot-bounce',
        )}
        onClick={!isExpanded ? toggleExpanded : undefined}
        role="button"
        aria-label={isExpanded ? 'Робот-помощник' : 'Открыть помощника'}
        aria-expanded={isExpanded}
      >
        {/* Collapsed: face only */}
        {!isExpanded && (
          SPLINE_SCENE_URL
            ? <Robot3DFace mood={mood} size={40} sceneUrl={SPLINE_SCENE_URL} />
            : <RobotFace mood={mood} size={40} />
        )}

        {/* Expanded: full widget */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="content"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center gap-2.5 p-3 w-full"
            >
              {/* Top row: mute + robot name + close */}
              <div className="flex items-center justify-between w-full">
                <button type="button" onClick={toggleMute} className="text-white/50 hover:text-white transition-colors p-0.5" aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}>
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                {robotName && (
                  <span className="text-white/60 text-[10px] font-medium tracking-wide">
                    {robotName}
                  </span>
                )}
                <button type="button" onClick={toggleExpanded} className="text-white/50 hover:text-white text-xs transition-colors" aria-label="Свернуть">✕</button>
              </div>

              {/* Face */}
              {SPLINE_SCENE_URL
                ? <Robot3DFace mood={mood} size={72} sceneUrl={SPLINE_SCENE_URL} />
                : <RobotFace mood={mood} size={72} />
              }

              {/* Speech bubble — clickable to replay */}
              <div className="relative w-full">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '8px solid rgba(255,255,255,0.12)' }} />
                <button
                  type="button"
                  onClick={() => speak(message)}
                  className="w-full text-white text-xs text-center font-medium bg-white/10 hover:bg-white/15 rounded-xl px-3 py-2 border border-white/20 transition-colors leading-relaxed"
                  title="Нажми, чтобы повторить"
                >
                  {isMuted && <span className="opacity-50 mr-1">🔇</span>}
                  {message}
                </button>
              </div>

              {/* ── Text chat input ── */}
              <div className="flex gap-1.5 w-full">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleChatSubmit() }}
                  placeholder="Задай вопрос..."
                  className="flex-1 min-w-0 bg-white/15 text-white placeholder:text-white/40 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:bg-white/20 border border-white/20"
                />
                <button
                  type="button"
                  onClick={handleChatSubmit}
                  className="shrink-0 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  →
                </button>
              </div>

              {/* ── Voice dialog — shown in module or on IELTS page ── */}
              {(curatorPhase === 'module' || isOnIelts) && (
                <button
                  type="button"
                  onClick={handleVoiceDialog}
                  title={isListening ? 'Остановить' : isOnIelts ? 'Задай вопрос голосом' : 'Объясни тему голосом'}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all w-full justify-center',
                    isListening
                      ? 'bg-red-500/80 hover:bg-red-500 text-white animate-pulse'
                      : 'bg-white/20 hover:bg-white/30 text-white',
                  )}
                >
                  {isListening
                    ? <><MicOff className="w-3.5 h-3.5" />Слушаю...</>
                    : <><Mic className="w-3.5 h-3.5" />{isOnIelts ? 'Вопрос голосом' : 'Объясни голосом'}</>}
                </button>
              )}

              {/* ── Naming prompt (shown once until robot is named) ── */}
              {robotName === null && (
                <div className="w-full flex flex-col gap-1.5">
                  <p className="text-white/70 text-[10px] text-center">Как меня назвать? 🤖</p>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={namingInput}
                      onChange={e => setNamingInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && namingInput.trim()) {
                          setRobotName(namingInput)
                          const msg = `Меня зовут ${namingInput.trim()}! Приятно познакомиться 🤝`
                          setMood('excited', msg)
                          speak(msg)
                        }
                      }}
                      placeholder="Введи имя..."
                      maxLength={12}
                      className="flex-1 min-w-0 bg-white/15 text-white placeholder:text-white/40 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:bg-white/20 border border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!namingInput.trim()) return
                        setRobotName(namingInput)
                        const msg = `Меня зовут ${namingInput.trim()}! Приятно познакомиться 🤝`
                        setMood('excited', msg)
                        speak(msg)
                      }}
                      className="shrink-0 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}

              {/* ── Onboarding CTA ── */}
              {onboardingCTA && (
                <button
                  type="button"
                  onClick={() => { navigate(onboardingCTA.path); if (!isExpanded) toggleExpanded() }}
                  className="w-full flex items-center justify-between bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-xl px-3 py-2.5 transition-colors"
                >
                  <span className="text-white text-xs font-semibold">
                    {onboardingCTA.emoji} {onboardingCTA.label}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/70 shrink-0" />
                </button>
              )}

              {/* ── Student context section ── */}
              {ctx && (ctx.subjects.length > 0 || ctx.planProgress || ctx.latestEntScore !== null) && (
                <>
                  <div className="w-full h-px bg-white/15" />

                  {/* Subjects with level badges */}
                  {subjectsToShow.length > 0 && (
                    <div className="w-full flex flex-col gap-1">
                      {subjectsToShow.map(subject => {
                        const level = ctx.subjectLevels[subject] ?? 'intermediate'
                        return (
                          <div key={subject} className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full w-full text-center', levelPillClass[level])}>
                            {subjectSummary(subject, level)}
                          </div>
                        )
                      })}
                      {ctx.subjects.length > 3 && (
                        <div className="text-white/40 text-[9px] text-center">+{ctx.subjects.length - 3} предмет(а)</div>
                      )}
                    </div>
                  )}

                  {/* Plan progress */}
                  {ctx.planProgress && (
                    <div className="w-full">
                      <div className="flex justify-between text-white/60 text-[10px] mb-1">
                        <span>Учебный план</span>
                        <span>{ctx.planProgress.completed}/{ctx.planProgress.total} модулей</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400/80 rounded-full transition-all duration-500" style={{ width: `${planPct}%` }} />
                      </div>
                    </div>
                  )}

                  {/* ENT score if available */}
                  {ctx.latestEntScore !== null && (
                    <div className="flex items-center justify-between w-full text-xs">
                      <span className="text-white/60">Пробный ЕНТ</span>
                      <span className={cn('font-bold', ctx.latestEntPercentage && ctx.latestEntPercentage >= 70 ? 'text-green-300' : 'text-amber-300')}>
                        {ctx.latestEntScore} б.
                      </span>
                    </div>
                  )}

                  {/* Weak topics hint */}
                  {ctx.weakTopics.length > 0 && (
                    <button
                      type="button"
                      onClick={() => navigate('/curator')}
                      className="w-full flex items-center justify-between text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      <span>⚠ Слабые темы: {ctx.weakTopics[0].topics[0]}</span>
                      <ChevronRight className="w-3 h-3 shrink-0" />
                    </button>
                  )}
                </>
              )}

              <div className="w-full h-px bg-white/15" />

              {/* Streak */}
              <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>{streak} {streakLabel(streak)}</span>
              </div>

              {/* Pomodoro */}
              <div className="w-full flex flex-col items-center gap-2">
                <span className="text-white/60 text-[10px] uppercase tracking-wider">{phaseLabel}</span>
                <span className="text-white text-2xl font-mono font-bold tabular-nums">{formatSeconds(secondsRemaining)}</span>
                <div className="flex items-center gap-2">
                  {timerRunning ? (
                    <button type="button" onClick={pauseTimer} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 hover:bg-white/30 text-white transition-colors">
                      <Pause className="w-3 h-3" />Пауза
                    </button>
                  ) : (
                    <button type="button" onClick={startTimer} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 hover:bg-white/30 text-white transition-colors">
                      <Play className="w-3 h-3" />Старт
                    </button>
                  )}
                  <button type="button" onClick={resetTimer} className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/20 transition-colors" aria-label="Сбросить">
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/70 rounded-full transition-all duration-1000" style={{ width: `${timerPct}%` }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
