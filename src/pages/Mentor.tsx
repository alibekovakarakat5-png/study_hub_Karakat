import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Bot,
  SendHorizontal,
  Trash2,
  Sparkles,
  BookOpen,
  HelpCircle,
  CalendarDays,
  Heart,
  AlertCircle,
  X,
  Crown,
  MessageSquare,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useRobotStore } from '@/store/useRobotStore'
import { cn, generateId } from '@/lib/utils'
import { SUBJECT_NAMES } from '@/types'
import type { Subject, DiagnosticResult, StudyPlan, User } from '@/types'
import { curatorContent } from '@/data/curatorContent'
import type { TopicContent } from '@/types/curator'

// ---------------------------------------------------------------------------
// Simulated AI response generator
// ---------------------------------------------------------------------------

interface MentorContext {
  diagnosticResult: DiagnosticResult | null
  studyPlan: StudyPlan | null
  user: User | null
}

// Find topic from curator content by matching keywords in user message
function findTopicFromMessage(msg: string): TopicContent | null {
  const lower = msg.toLowerCase()
  // Try exact topic match first
  for (const topic of curatorContent) {
    if (lower.includes(topic.topic.toLowerCase())) return topic
  }
  // Try keyword fragments (at least 4 chars)
  const words = lower.split(/\s+/).filter(w => w.length >= 4)
  for (const word of words) {
    for (const topic of curatorContent) {
      if (topic.topic.toLowerCase().includes(word)) return topic
      for (const section of topic.theory.sections) {
        if (section.heading.toLowerCase().includes(word)) return topic
      }
    }
  }
  // Try subject name match
  const subjectKeywords: Record<string, Subject> = {
    'матем': 'math', 'алгебр': 'math', 'геометр': 'math', 'тригон': 'math',
    'физик': 'physics', 'механ': 'physics', 'оптик': 'physics',
    'хими': 'chemistry', 'реакц': 'chemistry', 'органи': 'chemistry',
    'биолог': 'biology', 'клетк': 'biology', 'генет': 'biology',
    'истори': 'history', 'казах': 'history',
    'информат': 'informatics', 'програм': 'informatics',
    'географ': 'geography',
  }
  for (const [keyword, subject] of Object.entries(subjectKeywords)) {
    if (lower.includes(keyword)) {
      const subjectTopics = curatorContent.filter(t => t.subject === subject)
      if (subjectTopics.length > 0) return subjectTopics[0]
    }
  }
  return null
}

function formatTheoryResponse(topic: TopicContent, name: string): string {
  const sections = topic.theory.sections.slice(0, 3)
  let response = `${name}, вот материал по теме **${topic.topic}** (${SUBJECT_NAMES[topic.subject]}):\n\n`
  for (const section of sections) {
    response += `**${section.heading}**\n${section.content}\n\n`
  }
  if (topic.theory.keyPoints.length > 0) {
    response += `**Ключевые моменты:**\n`
    for (const point of topic.theory.keyPoints.slice(0, 4)) {
      response += `- ${point}\n`
    }
    response += '\n'
  }
  if (topic.theory.formulas && topic.theory.formulas.length > 0) {
    response += `**Формулы:**\n`
    for (const f of topic.theory.formulas.slice(0, 3)) {
      response += `- ${f}\n`
    }
    response += '\n'
  }
  response += `Хочешь попрактиковаться? Напиши «задача по ${topic.topic.toLowerCase()}»!`
  return response
}

function formatPracticeResponse(topic: TopicContent, name: string): string {
  const q = topic.practice[Math.floor(Math.random() * topic.practice.length)]
  let response = `${name}, вот задача по теме **${topic.topic}**:\n\n`
  response += `**${q.text}**\n\n`
  q.options.forEach((opt, i) => {
    response += `${String.fromCharCode(65 + i)}) ${opt}\n`
  })
  response += `\n*Подумай и выбери вариант. Если хочешь подсказку, напиши «подсказка».*\n`
  response += `\n||Правильный ответ: ${String.fromCharCode(65 + q.correctAnswer)}. ${q.explanation}||`
  return response
}

function generateMentorResponse(userMessage: string, context: MentorContext): string {
  const { diagnosticResult, studyPlan, user } = context
  const name = user?.name || 'друг'
  const lowerMsg = userMessage.toLowerCase()

  const weakTopics =
    diagnosticResult?.subjects
      .filter((s) => s.weakTopics.length > 0)
      .flatMap((s) => s.weakTopics) ?? []

  const weakSubjects =
    diagnosticResult?.subjects
      .filter((s) => s.level === 'low' || s.level === 'medium')
      .map((s) => SUBJECT_NAMES[s.subject]) ?? []

  const targetUni = studyPlan?.targetUniversity || user?.targetUniversity || null
  const targetSpec = studyPlan?.targetSpecialty || user?.targetSpecialty || null

  // ---- Keywords: explain topic (now with REAL content) ----
  if (lowerMsg.includes('объясни') || lowerMsg.includes('тема') || lowerMsg.includes('расскаж') || lowerMsg.includes('теори')) {
    const topic = findTopicFromMessage(lowerMsg)
    if (topic) return formatTheoryResponse(topic, name)

    // Fallback — suggest available topics
    const subjects = [...new Set(curatorContent.map(t => SUBJECT_NAMES[t.subject]))]
    return `${name}, я могу объяснить темы по этим предметам: ${subjects.join(', ')}.\n\nНапример, напиши:\n- «Объясни тригонометрию»\n- «Тема логарифмы»\n- «Расскажи про оптику»\n\nВ моей базе ${curatorContent.length} тем — просто назови нужную!`
  }

  // ---- Keywords: problem help (now with REAL questions) ----
  if (lowerMsg.includes('задач') || lowerMsg.includes('помоги') || lowerMsg.includes('практик')) {
    const topic = findTopicFromMessage(lowerMsg)
    if (topic && topic.practice.length > 0) return formatPracticeResponse(topic, name)

    // Fallback — pick from weak topics or random
    if (weakTopics.length > 0) {
      const weakTopic = curatorContent.find(t =>
        weakTopics.some(wt => t.topic.toLowerCase().includes(wt.toLowerCase()))
      )
      if (weakTopic && weakTopic.practice.length > 0) return formatPracticeResponse(weakTopic, name)
    }

    const randomTopic = curatorContent[Math.floor(Math.random() * curatorContent.length)]
    if (randomTopic.practice.length > 0) return formatPracticeResponse(randomTopic, name)

    return `${name}, напиши тему задачи. Например: «задача по тригонометрии» или «практика физика».`
  }

  // ---- Keywords: study plan ----
  if (lowerMsg.includes('план')) {
    const subjects = weakSubjects.length > 0 ? weakSubjects : ['Математика', 'Физика']
    return `${name}, вот твой рекомендованный план на сегодня:\n\n**План занятий на сегодня:**\n\n🕐 **09:00–09:45** — ${subjects[0] || 'Математика'}: теория (45 мин)\n   Повторение ключевых формул и определений\n\n🕐 **10:00–10:45** — ${subjects[0] || 'Математика'}: практика (45 мин)\n   Решение 10-15 задач по теме\n\n🕐 **11:00–11:30** — Перерыв и отдых\n\n🕐 **11:30–12:15** — ${subjects[1] || subjects[0] || 'Физика'}: теория (45 мин)\n\n🕐 **12:30–13:15** — ${subjects[1] || subjects[0] || 'Физика'}: практика (45 мин)\n\n🕐 **14:00–14:30** — Повторение пройденного, работа над ошибками\n\n${targetUni ? `Помни, твоя цель — ${targetUni}${targetSpec ? ` (${targetSpec})` : ''}. Каждый день приближает тебя к мечте!` : 'Регулярные занятия — ключ к высокому баллу на ЕНТ!'}\n\nХочешь, скорректирую план под твой график?`
  }

  // ---- Keywords: motivation ----
  if (lowerMsg.includes('мотив')) {
    const motivationalMessages = [
      `${name}, помни: каждый великий путь начинается с первого шага. Ты уже на пути к своей цели!`,
      `Знаешь, что отличает успешных студентов? Не талант, а постоянство. И ты уже проявляешь его, занимаясь каждый день.`,
      `${name}, представь себя через год — ты уже студент${targetUni ? ` ${targetUni}` : ''}, и всё благодаря тому, что не сдался(лась) сегодня.`,
    ]

    const randomMotivation = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]

    return `${randomMotivation}\n\n**Советы для продуктивной учёбы:**\n\n1. **Метод помидора** — 25 минут учёбы, 5 минут отдыха. Повтори 4 раза, затем длинный перерыв.\n2. **Не зубри — понимай.** Объясни тему другу или запиши своими словами.\n3. **Высыпайся!** Мозг обрабатывает информацию во сне. 7-8 часов — минимум.\n4. **Награждай себя** за достижения, даже маленькие.\n\n${user?.streak && user.streak > 0 ? `Кстати, твоя серия занятий: ${user.streak} дней подряд! Не прерывай её!` : 'Начни серию ежедневных занятий — это мощный мотиватор!'}\n\nТы справишься! Я верю в тебя.`
  }

  // ---- Keywords: error analysis ----
  if (lowerMsg.includes('ошибк') || lowerMsg.includes('разбор')) {
    if (diagnosticResult && diagnosticResult.subjects.length > 0) {
      const weakOnes = diagnosticResult.subjects.filter(
        (s) => s.weakTopics.length > 0
      )
      if (weakOnes.length > 0) {
        const analysis = weakOnes
          .map(
            (s) =>
              `- **${SUBJECT_NAMES[s.subject]}** (${s.percentage}%): слабые темы — ${s.weakTopics.join(', ')}`
          )
          .join('\n')

        return `${name}, давай разберём твои результаты диагностики.\n\n**Анализ слабых мест:**\n\n${analysis}\n\n**Рекомендации:**\n\n1. Начни с предмета, где самый низкий процент — именно там ты получишь максимальный прирост.\n2. По каждой слабой теме: сначала повтори теорию, затем реши минимум 20 задач.\n3. Через неделю пройди повторный тест, чтобы отследить прогресс.\n\nОбщий балл: ${diagnosticResult.overallScore}/${diagnosticResult.maxScore} (${Math.round((diagnosticResult.overallScore / diagnosticResult.maxScore) * 100)}%)\n\nХочешь, разберём конкретную тему подробнее?`
      }
    }

    return `${name}, чтобы сделать качественный разбор ошибок, мне нужны данные твоей диагностики. Пройди диагностический тест, и я смогу точно определить твои слабые места и составить план работы над ошибками.\n\nПока могу дать общий совет: веди тетрадь ошибок. Записывай каждую ошибку, правильное решение и правило, которое нужно запомнить. Раз в неделю перечитывай её.`
  }

  // ---- Default (now shows real topic suggestions) ----
  const sampleTopics = curatorContent
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(t => `«${t.topic}»`)
    .join(', ')

  return `Привет, ${name}! Я твой AI-ментор и готов помочь тебе с подготовкой${targetSpec ? ` по направлению "${targetSpec}"` : ' к ЕНТ'}.\n\nВот чем я могу помочь:\n\n- **Объяснить тему** — напиши «Объясни [тема]», например: ${sampleTopics}\n- **Дать задачу** — напиши «Задача по [тема]» для тренировки\n- **Составить план** на сегодня\n- **Мотивация** и советы по учёбе\n- **Разбор ошибок** по результатам диагностики\n\nУ меня ${curatorContent.length} тем с теорией и задачами. Просто напиши вопрос!`
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FREE_MESSAGE_LIMIT = 5

const QUICK_ACTIONS = [
  { label: 'Объясни тему', icon: BookOpen, message: 'Объясни тему логарифмы' },
  { label: 'Помоги с задачей', icon: HelpCircle, message: 'Помоги с задачей' },
  { label: 'Составь план на сегодня', icon: CalendarDays, message: 'Составь план на сегодня' },
  { label: 'Мотивация', icon: Heart, message: 'Дай мотивацию на учёбу' },
  { label: 'Разбор ошибок', icon: AlertCircle, message: 'Разбор моих ошибок' },
] as const

// ---------------------------------------------------------------------------
// Typing indicator component
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-start gap-3 px-4 py-2"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-purple-600">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm border border-gray-100">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block h-2 w-2 rounded-full bg-gray-400"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Premium gate modal
// ---------------------------------------------------------------------------

function PremiumModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/50">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Безлимитный доступ к AI-ментору
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Ты использовал(а) {FREE_MESSAGE_LIMIT} бесплатных сообщений. Подключи
            Премиум, чтобы получить неограниченный доступ к AI-ментору и другие
            преимущества.
          </p>
        </div>

        <div className="mb-6 space-y-3">
          {[
            'Безлимитные сообщения AI-ментору',
            'Персонализированные планы обучения',
            'Расширенная аналитика прогресса',
            'Приоритетная поддержка',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3 text-sm text-gray-700">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-100">
                <Sparkles className="h-3 w-3 text-accent-600" />
              </div>
              {feature}
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/pricing')}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-200/50 transition-all hover:shadow-xl"
        >
          <Crown className="h-4 w-4" />
          Подключить Премиум
        </motion.button>

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-xl px-6 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
        >
          Может быть позже
        </button>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Message bubble component
// ---------------------------------------------------------------------------

function MessageBubble({
  role,
  content,
  timestamp,
}: {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}) {
  const isUser = role === 'user'
  const formattedTime = new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Render markdown-ish content (bold with **)
  function renderContent(text: string) {
    const lines = text.split('\n')
    return lines.map((line, lineIdx) => {
      // Process bold markers
      const parts = line.split(/(\*\*.*?\*\*)/g)
      const rendered = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIdx} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          )
        }
        return <span key={partIdx}>{part}</span>
      })
      return (
        <span key={lineIdx}>
          {rendered}
          {lineIdx < lines.length - 1 && <br />}
        </span>
      )
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className={cn('flex items-end gap-2 px-4', isUser ? 'justify-end' : 'justify-start')}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-purple-600 shadow-sm">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}

      <div className={cn('flex max-w-[75%] flex-col', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
            isUser
              ? 'rounded-br-sm bg-primary-600 text-white'
              : 'rounded-tl-sm border border-gray-100 bg-white text-gray-800'
          )}
        >
          {renderContent(content)}
        </div>
        <span className="mt-1 px-1 text-[11px] text-gray-400">{formattedTime}</span>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main Mentor page
// ---------------------------------------------------------------------------

export default function Mentor() {
  const navigate = useNavigate()
  const { user, chatMessages, addChatMessage, clearChat, diagnosticResult, studyPlan } = useStore()

  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [sessionMessageCount, setSessionMessageCount] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const MAX_CHARS = 500

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, isThinking, scrollToBottom])

  // Add welcome message if chat is empty
  useEffect(() => {
    if (chatMessages.length === 0) {
      const welcomeMessage = generateMentorResponse('', {
        diagnosticResult,
        studyPlan,
        user,
      })
      addChatMessage({
        id: generateId(),
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date().toISOString(),
      })
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const maxHeight = 4 * 24 // ~4 lines
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
    }
  }, [inputValue])

  // Send message
  const sendMessage = useCallback(
    (messageText?: string) => {
      const text = (messageText ?? inputValue).trim()
      if (!text || isThinking) return

      // Premium gate check
      const isPremium = user?.isPremium ?? false
      if (!isPremium && sessionMessageCount >= FREE_MESSAGE_LIMIT) {
        setShowPremiumModal(true)
        return
      }

      // Add user message
      const userMsg = {
        id: generateId(),
        role: 'user' as const,
        content: text,
        timestamp: new Date().toISOString(),
      }
      addChatMessage(userMsg)
      setInputValue('')
      setSessionMessageCount((prev) => prev + 1)

      // Simulate AI thinking — robot reacts
      setIsThinking(true)
      useRobotStore.getState().setMood('thinking')
      const delay = 1000 + Math.random() * 1500

      setTimeout(() => {
        const response = generateMentorResponse(text, {
          diagnosticResult,
          studyPlan,
          user,
        })
        addChatMessage({
          id: generateId(),
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString(),
        })
        setIsThinking(false)

        // Robot reacts: speaks first ~180 chars stripped of markdown
        const robot = useRobotStore.getState()
        robot.setMood('happy', '📖 Проверь мой ответ!')
        const spoken = response
          .replace(/\*\*?(.+?)\*\*?/g, '$1')
          .replace(/`(.+?)`/g, '$1')
          .replace(/#+\s/g, '')
          .slice(0, 180)
        robot.speak(spoken)
      }, delay)
    },
    [inputValue, isThinking, user, sessionMessageCount, addChatMessage, diagnosticResult, studyPlan]
  )

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Handle quick action click
  const handleQuickAction = (message: string) => {
    sendMessage(message)
  }

  // Handle clear chat
  const handleClearChat = () => {
    clearChat()
    setSessionMessageCount(0)
    // Add welcome message after clearing
    setTimeout(() => {
      const welcomeMessage = generateMentorResponse('', {
        diagnosticResult,
        studyPlan,
        user,
      })
      addChatMessage({
        id: generateId(),
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date().toISOString(),
      })
    }, 100)
  }

  const userMessageCount = chatMessages.filter((m) => m.role === 'user').length
  const targetContext = user?.targetSpecialty || 'ЕНТ подготовка'

  return (
    <div className="flex h-[100dvh] bg-gray-50">
      {/* ------- Left sidebar ------- */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
        {/* Back link */}
        <div className="border-b border-gray-100 px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад к дашборду
          </button>
        </div>

        {/* Chat info */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Чат
              </span>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-sm text-gray-600">
                Сообщений:{' '}
                <span className="font-semibold text-gray-900">{chatMessages.length}</span>
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Ваших:{' '}
                <span className="font-semibold text-gray-900">{userMessageCount}</span>
              </p>
              {!user?.isPremium && (
                <p className="mt-1 text-xs text-gray-400">
                  Лимит: {sessionMessageCount}/{FREE_MESSAGE_LIMIT} сообщений
                </p>
              )}
            </div>
          </div>

          {/* Clear chat button */}
          <button
            onClick={handleClearChat}
            className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Очистить чат
          </button>

          {/* Quick action buttons */}
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Быстрые действия
              </span>
            </div>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.message)}
                    disabled={isThinking}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-gray-600 transition-all hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {action.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Premium badge in sidebar */}
        {!user?.isPremium && (
          <div className="border-t border-gray-100 p-4">
            <button
              onClick={() => navigate('/pricing')}
              className="flex w-full items-center gap-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 px-4 py-3 text-left transition-all hover:shadow-md"
            >
              <Crown className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs font-semibold text-amber-700">Получить Премиум</p>
                <p className="text-[11px] text-amber-600/70">Безлимитный AI-ментор</p>
              </div>
            </button>
          </div>
        )}
      </aside>

      {/* ------- Main chat area ------- */}
      <div className="flex flex-1 flex-col">
        {/* Chat header */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile back button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {/* Avatar */}
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-purple-600 shadow-md shadow-primary-200/40">
                <Bot className="h-5 w-5 text-white" />
              </div>
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            </div>

            <div>
              <h1 className="text-sm font-semibold text-gray-900">AI Ментор</h1>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                  Онлайн
                </span>
              </div>
            </div>
          </div>

          {/* Context badge */}
          <div className="flex items-center gap-2">
            {/* Clear chat — mobile only */}
            <button
              onClick={handleClearChat}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 lg:hidden"
              aria-label="Очистить чат"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            {/* Context badge — desktop only */}
            <span className="hidden items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-200/50 sm:inline-flex">
              <BookOpen className="h-3 w-3" />
              {user?.grade || 11} класс, {targetContext}
            </span>
          </div>
        </header>

        {/* Messages area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white"
        >
          <div className="mx-auto max-w-3xl space-y-4 py-6">
            <AnimatePresence initial={false}>
              {chatMessages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
              ))}
            </AnimatePresence>

            <AnimatePresence>{isThinking && <TypingIndicator />}</AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick action chips (above input on mobile, visible when few messages) */}
        {chatMessages.length <= 2 && (
          <div className="border-t border-gray-100 bg-white px-4 py-2 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleQuickAction(action.message)}
                    disabled={isThinking}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {action.label}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick action chips above input (desktop, when few messages) */}
        {chatMessages.length <= 2 && (
          <div className="hidden border-t border-gray-100 bg-white px-4 py-2 lg:block">
            <div className="mx-auto flex max-w-3xl flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleQuickAction(action.message)}
                    disabled={isThinking}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-600 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {action.label}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-3 rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2 transition-colors focus-within:border-primary-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-100">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setInputValue(e.target.value)
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Напишите сообщение..."
                rows={1}
                className="max-h-[96px] flex-1 resize-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              />

              <div className="flex items-center gap-2 pb-0.5">
                {inputValue.length > 0 && (
                  <span
                    className={cn(
                      'text-[11px] tabular-nums',
                      inputValue.length > MAX_CHARS * 0.9
                        ? 'text-red-500'
                        : 'text-gray-400'
                    )}
                  >
                    {inputValue.length}/{MAX_CHARS}
                  </span>
                )}

                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => sendMessage()}
                  disabled={!inputValue.trim() || isThinking}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full transition-all',
                    inputValue.trim() && !isThinking
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-200/50 hover:bg-primary-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <SendHorizontal className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            <p className="mt-1.5 text-center text-[11px] text-gray-400">
              Enter — отправить, Shift+Enter — новая строка
            </p>
          </div>
        </div>
      </div>

      {/* Premium modal */}
      <AnimatePresence>
        {showPremiumModal && (
          <PremiumModal onClose={() => setShowPremiumModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
