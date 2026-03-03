import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Headphones, PenLine, Mic, Globe, Star, ChevronDown,
  ChevronRight, ExternalLink, Send, Bot, Lightbulb, Clock,
  CheckCircle2, BarChart3, BookMarked, Youtube, Smartphone,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  IELTS_SECTIONS, TASK1_TYPES, ESSAY_TYPES, READING_QUESTION_TYPES,
  SPEAKING_CUE_CARDS, VOCAB_TOPICS, IELTS_MATERIALS, BAND_DESCRIPTORS,
  type IeltsSkill,
} from '@/data/ieltsContent'
import { findMentorAnswer, IELTS_QUICK_QUESTIONS } from '@/data/mentorKnowledge'
import { useStore } from '@/store/useStore'
import { useRobotStore } from '@/store/useRobotStore'
import { useContentStore } from '@/store/useContentStore'

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | IeltsSkill | 'vocabulary' | 'materials' | 'chat'

// ── Helpers ───────────────────────────────────────────────────────────────────

const SKILL_CONFIG: Record<IeltsSkill, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  listening: { icon: Headphones, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', label: 'Listening' },
  reading:   { icon: BookOpen,   color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',     label: 'Reading' },
  writing:   { icon: PenLine,    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Writing' },
  speaking:  { icon: Mic,        color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',   label: 'Speaking' },
}

const MATERIAL_ICON: Record<string, React.ElementType> = {
  book: BookMarked,
  website: Globe,
  app: Smartphone,
  youtube: Youtube,
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BandScoreBar({ band, label, description }: { band: number; label: string; description: string }) {
  const pct = ((band - 4) / 5) * 100
  const color = band >= 8 ? 'bg-emerald-500' : band >= 7 ? 'bg-blue-500' : band >= 6 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-white">Band {band} — <span className="text-white/70">{label}</span></span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-white/50 text-xs">{description}</p>
    </div>
  )
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-white font-medium text-sm">{title}</span>
        <ChevronDown className={cn('w-4 h-4 text-white/40 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Chat message ──────────────────────────────────────────────────────────────

interface ChatMsg { role: 'user' | 'mentor'; text: string }

function MentorChat({ studentName }: { studentName: string }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'mentor', text: `Привет, ${studentName || 'студент'}! Я твой IELTS-ментор. Задавай любой вопрос об экзамене — по Writing, Reading, Speaking или Listening. Или выбери быстрый вопрос ниже.` },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const { speak } = useRobotStore()

  const send = (text: string) => {
    if (!text.trim()) return
    const userMsg: ChatMsg = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const answer = findMentorAnswer(text, studentName)
      const responseText = answer?.text ?? 'Хороший вопрос! Для более точного ответа уточни тему: Writing, Reading, Speaking или Listening — и какой именно аспект.'
      const mentorMsg: ChatMsg = { role: 'mentor', text: responseText }
      setMessages(prev => [...prev, mentorMsg])
      setIsTyping(false)
      speak(responseText.slice(0, 120))
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }, 800 + Math.random() * 600)
  }

  return (
    <div className="flex flex-col h-full max-h-[620px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-2', msg.role === 'user' && 'flex-row-reverse')}>
            {msg.role === 'mentor' && (
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={cn(
              'rounded-2xl px-3.5 py-2.5 text-sm max-w-[85%] whitespace-pre-line leading-relaxed',
              msg.role === 'mentor'
                ? 'bg-white/10 text-white rounded-tl-sm'
                : 'bg-blue-600 text-white rounded-tr-sm ml-auto',
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
              {[0, 0.15, 0.3].map((delay, i) => (
                <span key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick questions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {IELTS_QUICK_QUESTIONS.slice(0, 4).map(q => (
          <button
            key={q}
            type="button"
            onClick={() => send(q)}
            className="text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-2.5 py-1 rounded-full transition-colors border border-white/10"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); send(input) }} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Задай вопрос по IELTS..."
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-blue-400/60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* What is IELTS */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Что такое IELTS?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-semibold mb-3">
              <Globe className="w-4 h-4" /> IELTS Academic
            </div>
            <p className="text-white/70 text-sm">Для поступления в университеты Великобритании, Австралии, Канады и других стран. Необходим абитуриентам и аспирантам.</p>
            <ul className="text-white/60 text-xs space-y-1 mt-2">
              <li>• Требование большинства UK-университетов: 6.5–7.0</li>
              <li>• Канада (студенческая виза): 6.0–6.5</li>
              <li>• Австралия (PR): 6.0+</li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-3">
              <Globe className="w-4 h-4" /> IELTS General Training
            </div>
            <p className="text-white/70 text-sm">Для рабочей визы, иммиграции, или программ обучения не связанных с университетом. Task 1 — письмо вместо графика.</p>
            <ul className="text-white/60 text-xs space-y-1 mt-2">
              <li>• Великобритания (work visa): 5.0–7.0 в зависимости от профессии</li>
              <li>• Канада Express Entry: 6.0+</li>
              <li>• Австралия skilled visa: 6.0+</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Test Structure */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Структура экзамена</h2>
        <div className="space-y-3">
          {IELTS_SECTIONS.sort((a, b) => a.order - b.order).map(section => {
            const cfg = SKILL_CONFIG[section.skill]
            const Icon = cfg.icon
            return (
              <div key={section.skill} className={cn('border rounded-2xl p-4', cfg.bg)}>
                <div className="flex items-start gap-3">
                  <div className={cn('p-2 rounded-lg bg-black/20 shrink-0')}>
                    <Icon className={cn('w-5 h-5', cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className="text-white font-semibold">{cfg.label}</span>
                      <span className="text-white/50 text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{section.duration}</span>
                      <span className="text-white/50 text-xs">{section.questions} вопросов</span>
                    </div>
                    <p className="text-white/70 text-sm mb-3">{section.description}</p>
                    <div className="space-y-1">
                      {section.tips.slice(0, 3).map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                          <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0 mt-0.5" />
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Band Scores */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Шкала баллов (Band Score)</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          {[9, 8, 7, 6.5, 6, 5.5, 5].map(band => {
            const desc = BAND_DESCRIPTORS[band]
            if (!desc) return null
            return (
              <BandScoreBar
                key={band}
                band={band}
                label={desc.label}
                description={desc.typical}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Writing Tab ───────────────────────────────────────────────────────────────

function WritingTab() {
  const [task, setTask] = useState<'task1' | 'task2'>('task2')
  const [selectedType, setSelectedType] = useState(ESSAY_TYPES[0].id)

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(['task2', 'task1'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTask(t)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              task === t ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white/60 hover:text-white',
            )}
          >
            {t === 'task1' ? 'Task 1 — Графики' : 'Task 2 — Эссе'}{t === 'task2' && ' ★'}
          </button>
        ))}
      </div>

      {task === 'task2' ? (
        <div className="space-y-5">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
              <Star className="w-4 h-4" /> Task 2 важнее!
            </div>
            <p className="text-white/70 text-sm">Task 2 стоит вдвое больше Task 1. Потрать 40 минут на Task 2 и 20 минут на Task 1. Всегда начинай с планирования (5 минут).</p>
          </div>

          {/* Essay type selector */}
          <div>
            <p className="text-white/60 text-sm mb-2">Тип эссе:</p>
            <div className="flex flex-wrap gap-2">
              {ESSAY_TYPES.map(et => (
                <button
                  key={et.id}
                  type="button"
                  onClick={() => setSelectedType(et.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    selectedType === et.id ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white/60 hover:text-white',
                  )}
                >
                  {et.name}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const et = ESSAY_TYPES.find(e => e.id === selectedType)!
            return (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-white/50 text-xs mb-1">Сигнальные фразы в задании:</p>
                  <p className="text-white/80 text-sm italic">"{et.signal}"</p>
                </div>

                <Accordion title="Структура эссе" defaultOpen>
                  <ol className="space-y-2">
                    {et.structure.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-white/70">
                        <span className="text-emerald-400 font-bold shrink-0">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </Accordion>

                <Accordion title="Шаблон (Band 6.5)">
                  <pre className="text-white/70 text-xs whitespace-pre-wrap leading-relaxed font-sans">{et.template}</pre>
                </Accordion>

                <Accordion title="Советы для Band 7+">
                  <ul className="space-y-2">
                    {et.bandSevenTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </Accordion>
              </div>
            )
          })()}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-white/60 text-sm mb-3">150+ слов · 20 минут · Описание, НЕ мнение</p>
            <div className="flex flex-wrap gap-2">
              {TASK1_TYPES.map(t1 => (
                <span key={t1.id} className="text-xs bg-white/10 text-white/70 px-2.5 py-1 rounded-full">{t1.name}</span>
              ))}
            </div>
          </div>
          {TASK1_TYPES.map(t1 => (
            <Accordion key={t1.id} title={t1.name}>
              <div className="space-y-3">
                <p className="text-white/70 text-sm">{t1.description}</p>
                <div>
                  <p className="text-white/50 text-xs mb-1.5">Ключевые глаголы:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {t1.keyVerbs.map(v => (
                      <code key={v} className="text-xs bg-white/10 text-emerald-300 px-2 py-0.5 rounded">{v}</code>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-white/50 text-xs mb-1.5">Шаблон введения:</p>
                  <p className="text-white/70 text-sm italic bg-white/5 rounded-lg px-3 py-2">"{t1.modelOpening}"</p>
                </div>
                <ol className="space-y-1">
                  {t1.structure.map((s, i) => (
                    <li key={i} className="text-xs text-white/60 flex gap-2">
                      <span className="text-emerald-400">{i + 1}.</span>{s}
                    </li>
                  ))}
                </ol>
              </div>
            </Accordion>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Reading Tab ───────────────────────────────────────────────────────────────

function ReadingTab() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
        <p className="text-white font-semibold mb-1">Ключевая стратегия</p>
        <p className="text-white/70 text-sm">20 минут на каждый текст = строго. Читай ВОПРОСЫ перед текстом. Никогда не оставляй вопрос без ответа — штрафа за ошибку нет.</p>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Типы вопросов</h3>
        <div className="space-y-3">
          {READING_QUESTION_TYPES.map(qtype => (
            <Accordion key={qtype.id} title={qtype.name}>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-white/70 text-sm">{qtype.strategy}</p>
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <span className="text-xs font-semibold text-red-400 shrink-0 mt-0.5">⚠ Ловушка:</span>
                  <p className="text-white/60 text-sm">{qtype.trap}</p>
                </div>
              </div>
            </Accordion>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Порядок работы с текстом</h3>
        <div className="space-y-2">
          {[
            { step: '1', time: '2 мин', action: 'Просмотри вопросы — узнай, что искать' },
            { step: '2', time: '3 мин', action: 'Бегло прочитай текст (заголовки + первые предложения абзацев)' },
            { step: '3', time: '12 мин', action: 'Отвечай на вопросы — сканируй конкретные факты' },
            { step: '4', time: '3 мин', action: 'Проверь ответы, заполни пропущенные (никогда не оставляй пустым!)' },
          ].map(({ step, time, action }) => (
            <div key={step} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{step}</span>
              <span className="text-white/50 text-xs shrink-0 w-14">{time}</span>
              <span className="text-white/70 text-sm">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Listening Tab ─────────────────────────────────────────────────────────────

function ListeningTab() {
  const section = IELTS_SECTIONS.find(s => s.skill === 'listening')!
  return (
    <div className="space-y-6">
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4">
        <p className="text-white font-semibold mb-1">Главное правило</p>
        <p className="text-white/70 text-sm">Читай вопросы ДО аудио. Предсказывай тип ответа (число, имя, прилагательное). Ответы идут строго по порядку.</p>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Четыре секции</h3>
        <div className="space-y-3">
          {[
            { n: 1, title: 'Section 1', desc: 'Разговор двух людей в повседневной ситуации (бронирование, регистрация).', difficulty: 'Лёгкая', color: 'text-green-400' },
            { n: 2, title: 'Section 2', desc: 'Монолог о повседневной теме (экскурсия, местные услуги).', difficulty: 'Средняя', color: 'text-blue-400' },
            { n: 3, title: 'Section 3', desc: 'Дискуссия 2–4 студентов об академической теме.', difficulty: 'Сложнее', color: 'text-amber-400' },
            { n: 4, title: 'Section 4', desc: 'Академический монолог (лекция). Самая сложная секция.', difficulty: 'Сложная', color: 'text-red-400' },
          ].map(({ n, title, desc, difficulty, color }) => (
            <div key={n} className="flex gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="w-8 h-8 rounded-full bg-violet-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{n}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium text-sm">{title}</span>
                  <span className={cn('text-xs', color)}>{difficulty}</span>
                </div>
                <p className="text-white/60 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Все советы</h3>
        <div className="space-y-2">
          {section.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-white/70">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Speaking Tab ──────────────────────────────────────────────────────────────

function SpeakingTab() {
  const [selectedCard, setSelectedCard] = useState(SPEAKING_CUE_CARDS[0].id)
  const card = SPEAKING_CUE_CARDS.find(c => c.id === selectedCard)!

  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
        <p className="text-white font-semibold mb-1">Не учи наизусть!</p>
        <p className="text-white/70 text-sm">Экзаменаторы моментально распознают заученные ответы. Говори естественно, используй конкретные примеры из жизни, расширяй каждый ответ.</p>
      </div>

      {/* Parts overview */}
      <div className="space-y-3">
        {[
          { part: 'Part 1', duration: '4–5 мин', desc: 'Вопросы о тебе: работа, хобби, место жительства. Отвечай 2–3 предложения + причина.', tip: 'Не монологи! Краткий чёткий ответ + пример.' },
          { part: 'Part 2', duration: '3–4 мин', desc: 'Cue card: 1 минута подготовки + 2 минуты монолога. Затронь все bullet points.', tip: 'В подготовку: записывай только ключевые слова, не предложения.' },
          { part: 'Part 3', duration: '4–5 мин', desc: 'Абстрактные вопросы: сравнения, мнения, прогнозы. Развивай каждый ответ по схеме PEEL.', tip: 'Чем больше ты говоришь, тем выше оценивается Fluency.' },
        ].map(({ part, duration, desc, tip }) => (
          <div key={part} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-amber-400 font-semibold text-sm">{part}</span>
              <span className="text-white/40 text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{duration}</span>
            </div>
            <p className="text-white/70 text-sm mb-2">{desc}</p>
            <div className="flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-white/50 text-xs">{tip}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cue card examples */}
      <div>
        <h3 className="text-white font-semibold mb-3">Примеры Cue Cards (Part 2)</h3>
        <div className="flex gap-2 flex-wrap mb-4">
          {SPEAKING_CUE_CARDS.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCard(c.id)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-lg transition-colors',
                selectedCard === c.id ? 'bg-amber-600 text-white' : 'bg-white/10 text-white/60 hover:text-white',
              )}
            >
              {c.topic}
            </button>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
          <div>
            <p className="text-amber-400 text-sm font-semibold mb-1">Describe:</p>
            <p className="text-white text-sm">{card.prompt}</p>
            <ul className="mt-2 space-y-1">
              {card.bulletPoints.map((bp, i) => (
                <li key={i} className="text-white/60 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {bp}
                </li>
              ))}
            </ul>
          </div>

          <Accordion title="Образец ответа (Band 7)">
            <p className="text-white/70 text-sm whitespace-pre-line leading-relaxed">{card.modelAnswer}</p>
          </Accordion>

          <Accordion title="Фразы Band 7+">
            <ul className="space-y-1.5">
              {card.bandSevenPhrases.map((phrase, i) => (
                <li key={i} className="text-sm">
                  <code className="text-amber-300 bg-white/5 px-2 py-0.5 rounded text-xs">{phrase}</code>
                </li>
              ))}
            </ul>
          </Accordion>
        </div>
      </div>
    </div>
  )
}

// ── Vocabulary Tab ────────────────────────────────────────────────────────────

function VocabularyTab() {
  const customWords = useContentStore(s => s.vocabWords)

  // Merge hardcoded topics with custom words (group by topicId/topicName)
  const allTopics = [...VOCAB_TOPICS]
  const customTopicIds = new Set(customWords.map(w => w.topicId))
  for (const tid of customTopicIds) {
    if (!allTopics.find(t => t.id === tid)) {
      const sample = customWords.find(w => w.topicId === tid)!
      allTopics.push({ id: tid, name: sample.topicName, words: [] })
    }
  }

  const [activeTopic, setActiveTopic] = useState(allTopics[0].id)

  const baseTopic = VOCAB_TOPICS.find(t => t.id === activeTopic)
  const customForTopic = customWords.filter(w => w.topicId === activeTopic)
  const allWords = [
    ...(baseTopic?.words ?? []),
    ...customForTopic.map(w => ({ word: w.word, definition: w.definition, example: w.example })),
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {allTopics.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTopic(t.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-colors',
              activeTopic === t.id ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60 hover:text-white',
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {allWords.map((word, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-600/40 text-blue-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <div>
                <p className="text-white font-semibold text-sm">{word.word}</p>
                <p className="text-white/50 text-xs mt-0.5">{word.definition}</p>
                <p className="text-white/70 text-sm mt-1.5 italic">"{word.example}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-2">
          <Lightbulb className="w-4 h-4" /> Как учить эффективно
        </div>
        <ul className="space-y-1 text-white/60 text-sm">
          <li>• Учи слово в контексте (целое предложение), не в изоляции</li>
          <li>• Используй новое слово в Writing или Speaking в тот же день</li>
          <li>• Группируй синонимы: big / significant / substantial / considerable</li>
          <li>• Записывай коллокации: "conduct research", "raise awareness", "tackle the issue"</li>
        </ul>
      </div>
    </div>
  )
}

// ── Materials Tab ─────────────────────────────────────────────────────────────

function MaterialsTab() {
  const customMaterials = useContentStore(s => s.materials)
  const types = ['book', 'website', 'youtube', 'app'] as const
  const typeLabels = { book: 'Книги', website: 'Сайты', youtube: 'YouTube', app: 'Приложения' }

  // Merge hardcoded + admin-added materials
  const allMaterials = [...IELTS_MATERIALS, ...customMaterials]

  return (
    <div className="space-y-6">
      {types.map(type => {
        const items = allMaterials.filter(m => m.type === type)
        if (items.length === 0) return null
        const Icon = MATERIAL_ICON[type]
        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4 text-white/60" />
              <h3 className="text-white font-semibold">{typeLabels[type]}</h3>
            </div>
            <div className="space-y-2">
              {items.map(mat => (
                <div key={mat.id} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-medium text-sm">{mat.title}</span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        mat.free ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400',
                      )}>
                        {mat.free ? 'Бесплатно' : 'Платно'}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">{mat.description}</p>
                  </div>
                  {mat.url && (
                    <a
                      href={mat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors shrink-0 mt-0.5"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Ielts() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const user = useStore(s => s.user)
  const navigate = useNavigate()

  const tabs: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
    { id: 'overview',   label: 'Обзор',       icon: BarChart3 },
    { id: 'writing',    label: 'Writing',      icon: PenLine },
    { id: 'reading',    label: 'Reading',      icon: BookOpen },
    { id: 'listening',  label: 'Listening',    icon: Headphones },
    { id: 'speaking',   label: 'Speaking',     icon: Mic },
    { id: 'vocabulary', label: 'Лексика',      icon: BookMarked },
    { id: 'materials',  label: 'Материалы',    icon: Globe },
    { id: 'chat',       label: 'AI Ментор',    icon: Bot },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            ← Назад
          </button>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold">IELTS Preparation</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-white/40 hidden sm:block">AI Ментор доступен в правом нижнем углу</span>
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className="flex items-center gap-1.5 text-xs bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Bot className="w-3.5 h-3.5" /> Спросить ментора
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-white/10 rounded-3xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl shrink-0">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  IELTS Academic Preparation
                </h1>
                <p className="text-white/60 text-sm md:text-base mb-4">
                  Полная база знаний: структура экзамена, шаблоны, стратегии и AI-ментор. Всё, что нужно для Band 7+.
                </p>
                <div className="flex flex-wrap gap-3">
                  {(Object.keys(SKILL_CONFIG) as IeltsSkill[]).map(skill => {
                    const cfg = SKILL_CONFIG[skill]
                    const Icon = cfg.icon
                    const section = IELTS_SECTIONS.find(s => s.skill === skill)!
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => setActiveTab(skill)}
                        className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors hover:bg-white/10', cfg.bg)}
                      >
                        <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
                        <span className="text-white/80">{cfg.label}</span>
                        <span className="text-white/40 text-xs">{section.duration}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab nav */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0',
                  activeTab === tab.id
                    ? 'bg-white/15 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.id === 'chat' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                )}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'overview'   && <OverviewTab />}
            {activeTab === 'writing'    && <WritingTab />}
            {activeTab === 'reading'    && <ReadingTab />}
            {activeTab === 'listening'  && <ListeningTab />}
            {activeTab === 'speaking'   && <SpeakingTab />}
            {activeTab === 'vocabulary' && <VocabularyTab />}
            {activeTab === 'materials'  && <MaterialsTab />}
            {activeTab === 'chat'       && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5" style={{ height: 680 }}>
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">AI IELTS Ментор</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-green-400 text-xs">Онлайн</span>
                    </div>
                  </div>
                </div>
                <div style={{ height: 'calc(100% - 64px)' }}>
                  <MentorChat studentName={user?.name ?? ''} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        {activeTab !== 'chat' && (
          <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">Есть вопрос по IELTS?</p>
              <p className="text-white/50 text-xs">Спроси AI-ментора — ответит по Writing, Reading, Speaking, стратегии</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shrink-0"
            >
              Спросить <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
