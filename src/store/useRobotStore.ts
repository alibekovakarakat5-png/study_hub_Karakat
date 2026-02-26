import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Types ────────────────────────────────────────────────────────────────────

export type RobotMood =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'thinking'
  | 'sleeping'
  | 'encouraging'

export type PomodoroPhase = 'work' | 'break' | 'idle'

export const ROBOT_MESSAGES: Record<RobotMood, string[]> = {
  idle:        ['Готов учиться?', 'Нажми на меня!', 'Жду тебя 🤓'],
  happy:       ['Молодец!', 'Так держать! 🎯', 'Отлично!'],
  excited:     ['УРАА! 🎉', 'Ты звезда!', 'Невероятно!'],
  thinking:    ['Думаем вместе...', 'Интересная задача!', 'Хмм...'],
  sleeping:    ['Zzz...', '*дремлет*', '...'],
  encouraging: ['Не сдавайся!', 'Почти готово!', 'Ты справишься! 💪'],
}

// ── Constants ────────────────────────────────────────────────────────────────

export const POMODORO_WORK_SECONDS  = 25 * 60  // 1500
export const POMODORO_BREAK_SECONDS =  5 * 60  //  300

// ── Speech helper ─────────────────────────────────────────────────────────────

function getVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  // Prefer Russian voice, fall back to any available
  return (
    voices.find(v => v.lang === 'ru-RU') ||
    voices.find(v => v.lang.startsWith('ru')) ||
    voices[0] ||
    null
  )
}

// ── State interface ───────────────────────────────────────────────────────────

interface RobotState {
  // Widget UI
  isExpanded: boolean
  toggleExpanded: () => void

  // Mood & message
  mood: RobotMood
  message: string
  setMood: (mood: RobotMood, customMessage?: string) => void
  setMessage: (message: string) => void

  // Activity tracking
  lastActivityAt: number
  recordActivity: () => void

  // Voice
  isMuted: boolean
  toggleMute: () => void
  speak: (text: string) => void
  stopSpeaking: () => void

  // Robot name — set by student, persisted
  robotName: string | null
  setRobotName: (name: string) => void

  // Greeting — persisted: tracks if we already greeted today
  lastGreetedDate: string | null
  setLastGreetedDate: (date: string) => void

  // Pomodoro timer
  pomodoroPhase: PomodoroPhase
  secondsRemaining: number
  timerRunning: boolean
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  tickTimer: () => void
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useRobotStore = create<RobotState>()(
  persist(
    (set, get) => ({
      // Widget UI
      isExpanded: false,
      toggleExpanded: () => set(s => ({ isExpanded: !s.isExpanded })),

      // Mood & message — setMood atomically picks a random message
      mood: 'idle',
      message: ROBOT_MESSAGES.idle[0],

      setMood: (mood, customMessage) => {
        const msgs = ROBOT_MESSAGES[mood]
        const message = customMessage ?? msgs[Math.floor(Math.random() * msgs.length)]
        set({ mood, message })
      },

      setMessage: (message) => set({ message }),

      // Activity tracking
      lastActivityAt: Date.now(),
      recordActivity: () => set({ lastActivityAt: Date.now() }),

      // ── Voice ──────────────────────────────────────────────────────────────
      isMuted: false,
      toggleMute: () => {
        const muting = !get().isMuted
        if (muting) window.speechSynthesis?.cancel()
        set({ isMuted: muting })
      },

      speak: (text) => {
        if (get().isMuted) return
        if (!('speechSynthesis' in window)) return

        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang  = 'ru-RU'
        utterance.rate  = 0.92
        utterance.pitch = 1.05

        // Try to set a Russian voice — voices may not be loaded yet on first call
        const voice = getVoice()
        if (voice) utterance.voice = voice

        // If voices weren't loaded, wait for voiceschanged and retry once
        if (!voice && window.speechSynthesis.getVoices().length === 0) {
          const onVoicesChanged = () => {
            window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
            if (!get().isMuted) {
              const retryUtterance = new SpeechSynthesisUtterance(text)
              retryUtterance.lang  = 'ru-RU'
              retryUtterance.rate  = 0.92
              retryUtterance.pitch = 1.05
              const v = getVoice()
              if (v) retryUtterance.voice = v
              window.speechSynthesis.speak(retryUtterance)
            }
          }
          window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
          return
        }

        window.speechSynthesis.speak(utterance)
      },

      stopSpeaking: () => {
        window.speechSynthesis?.cancel()
      },

      // ── Robot name ─────────────────────────────────────────────────────────
      robotName: null,
      setRobotName: (name) => set({ robotName: name.trim() || null }),

      // ── Greeting ───────────────────────────────────────────────────────────
      lastGreetedDate: null,
      setLastGreetedDate: (date) => set({ lastGreetedDate: date }),

      // ── Pomodoro ───────────────────────────────────────────────────────────
      pomodoroPhase: 'idle',
      secondsRemaining: POMODORO_WORK_SECONDS,
      timerRunning: false,

      startTimer: () => {
        const { pomodoroPhase } = get()
        set({
          timerRunning: true,
          pomodoroPhase: pomodoroPhase === 'idle' ? 'work' : pomodoroPhase,
          secondsRemaining:
            pomodoroPhase === 'idle' ? POMODORO_WORK_SECONDS : get().secondsRemaining,
        })
      },

      pauseTimer: () => set({ timerRunning: false }),

      resetTimer: () =>
        set({
          timerRunning: false,
          pomodoroPhase: 'idle',
          secondsRemaining: POMODORO_WORK_SECONDS,
        }),

      tickTimer: () => {
        const { secondsRemaining, pomodoroPhase, timerRunning } = get()
        if (!timerRunning) return

        if (secondsRemaining > 0) {
          set({ secondsRemaining: secondsRemaining - 1 })
          return
        }

        // Timer expired — switch phases
        if (pomodoroPhase === 'work') {
          set({
            pomodoroPhase: 'break',
            secondsRemaining: POMODORO_BREAK_SECONDS,
            timerRunning: true,
          })
          get().speak('Время работы вышло! Сделай перерыв 5 минут.')
        } else {
          set({
            pomodoroPhase: 'idle',
            secondsRemaining: POMODORO_WORK_SECONDS,
            timerRunning: false,
          })
          get().speak('Перерыв закончился. Готов к новому раунду?')
        }
      },
    }),
    {
      name: 'studyhub-robot',
      partialize: (state) => ({
        isMuted: state.isMuted,
        lastGreetedDate: state.lastGreetedDate,
        robotName: state.robotName,
      }),
    }
  )
)
