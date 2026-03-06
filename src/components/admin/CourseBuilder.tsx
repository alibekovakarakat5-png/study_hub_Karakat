// ── CourseBuilder ─────────────────────────────────────────────────────────────
// Full-featured course creation tool for admins/tutors.
// Structure: Course → Modules → Lessons → Blocks
// Block types: text, video, image, quiz, flashcard

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, ChevronDown, ChevronRight, GraduationCap,
  BookOpen, Video, Image as ImageIcon, HelpCircle, Layers,
  Save, Globe, Lock, Edit3, ArrowLeft, Check, Grip,
  Bot, Lightbulb, Play, X, Eye, EyeOff, RefreshCw,
  AlignLeft, ListChecks, CreditCard, Youtube,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TextBlock   { id: string; type: 'text'; content: string }
export interface VideoBlock  { id: string; type: 'video'; url: string; title?: string }
export interface ImageBlock  { id: string; type: 'image'; url: string; caption?: string }
export interface QuizQuestion { question: string; options: string[]; correct: number; explanation?: string }
export interface QuizBlock   { id: string; type: 'quiz'; questions: QuizQuestion[] }
export interface FlashCard   { front: string; back: string }
export interface FlashcardBlock { id: string; type: 'flashcard'; cards: FlashCard[] }
export type LessonBlock = TextBlock | VideoBlock | ImageBlock | QuizBlock | FlashcardBlock

export interface LessonData {
  id: string; title: string; duration?: number; order: number; blocks: LessonBlock[]
}
export interface ModuleData {
  id: string; title: string; order: number; lessons: LessonData[]
}
export interface CourseData {
  id: string; title: string; description: string; subject: string
  level: string; price: number; coverColor: string; isPublished: boolean
  modules: ModuleData[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { value: 'ielts',   label: 'IELTS', color: '#2563eb' },
  { value: 'ent',     label: 'ЕНТ',   color: '#7c3aed' },
  { value: 'math',    label: 'Математика', color: '#16a34a' },
  { value: 'physics', label: 'Физика',     color: '#d97706' },
  { value: 'history', label: 'История',    color: '#dc2626' },
  { value: 'english', label: 'Английский', color: '#0891b2' },
]

const LEVELS = [
  { value: 'beginner',     label: 'Начальный' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced',     label: 'Продвинутый' },
]

const COVER_COLORS = [
  '#2563eb', '#7c3aed', '#16a34a', '#d97706', '#dc2626', '#0891b2',
  '#be185d', '#065f46', '#92400e', '#1e3a5f',
]

// ── Robot suggestions per subject ─────────────────────────────────────────────

const ROBOT_TIPS: Record<string, string[]> = {
  ielts: [
    'Добавь Task 1 и Task 2 примеры в текстовый блок',
    'Создай Quiz с вопросами True/False/Not Given',
    'Добавь Flashcard со словарём для Band 7+',
    'Вставь видео с разбором Speaking Part 2',
    'Используй 150-250 слов для объяснения стратегии',
  ],
  ent: [
    'Добавь Quiz с 5 тестовыми вопросами по теме',
    'Вставь формулы в текстовый блок (поддерживает Unicode)',
    'Создай Flashcard с ключевыми датами/терминами',
    'Добавь видео-объяснение сложного правила',
    'Структурируй урок: Теория → Примеры → Тест',
  ],
  math: [
    'Шаг за шагом: формула → разбор → задача → решение',
    'Добавь Quiz с 3-4 задачами разной сложности',
    'Flashcard: термин ↔ формула — лучший способ запомнить',
  ],
  default: [
    'Структура урока: Введение (2 мин) → Теория → Практика → Тест',
    'Quiz из 5 вопросов повышает усвоение материала на 50%',
    'Flashcard — лучший инструмент для запоминания терминов',
    'Добавляй видео — студенты лучше воспринимают визуальный контент',
  ],
}

function getRobotTips(subject: string): string[] {
  return ROBOT_TIPS[subject] ?? ROBOT_TIPS['default']!
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid(): string { return `b_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }
function lid(): string { return `l_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }
function mid(): string { return `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }

function newLesson(order: number): LessonData {
  return { id: lid(), title: 'Новый урок', order, blocks: [] }
}
function newModule(order: number): ModuleData {
  return { id: mid(), title: 'Новый модуль', order, lessons: [newLesson(0)] }
}

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return m ? m[1]! : null
}

// ── Input / Label helpers ─────────────────────────────────────────────────────

const inp  = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors'
const lbl  = 'block text-xs font-semibold text-slate-600 mb-1'

// ═══════════════════════════════════════════════════════════════════════════════
// Block Editors
// ═══════════════════════════════════════════════════════════════════════════════

function TextBlockEditor({ block, onChange, onDelete }: {
  block: TextBlock; onChange: (b: TextBlock) => void; onDelete: () => void
}) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-slate-50 px-3 py-2 border-b border-slate-200">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <AlignLeft className="w-3.5 h-3.5 text-blue-500" /> Текст / Теория
        </span>
        <button type="button" onClick={onDelete} className="text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <textarea
        value={block.content}
        onChange={e => onChange({ ...block, content: e.target.value })}
        rows={6}
        placeholder="Введи теоретический материал урока. Поддерживаются **жирный**, _курсив_, списки (- пункт)..."
        className="w-full px-3 py-2.5 text-sm text-slate-700 outline-none resize-y font-mono leading-relaxed"
      />
    </div>
  )
}

function VideoBlockEditor({ block, onChange, onDelete }: {
  block: VideoBlock; onChange: (b: VideoBlock) => void; onDelete: () => void
}) {
  const ytId = block.url ? extractYoutubeId(block.url) : null

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-slate-50 px-3 py-2 border-b border-slate-200">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <Youtube className="w-3.5 h-3.5 text-red-500" /> Видео (YouTube)
        </span>
        <button type="button" onClick={onDelete} className="text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-3 space-y-2">
        <div>
          <label className={lbl}>Заголовок (опционально)</label>
          <input className={inp} placeholder="Разбор Task 1: линейный график" value={block.title ?? ''}
            onChange={e => onChange({ ...block, title: e.target.value })} />
        </div>
        <div>
          <label className={lbl}>YouTube ссылка *</label>
          <input className={inp} placeholder="https://youtube.com/watch?v=..." value={block.url}
            onChange={e => onChange({ ...block, url: e.target.value })} />
        </div>
        {ytId && (
          <div className="rounded-lg overflow-hidden aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              className="w-full h-full"
              allowFullScreen
              title={block.title ?? 'video'}
            />
          </div>
        )}
        {block.url && !ytId && (
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            Введи корректную YouTube ссылку для предпросмотра
          </p>
        )}
      </div>
    </div>
  )
}

function ImageBlockEditor({ block, onChange, onDelete }: {
  block: ImageBlock; onChange: (b: ImageBlock) => void; onDelete: () => void
}) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-slate-50 px-3 py-2 border-b border-slate-200">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> Изображение
        </span>
        <button type="button" onClick={onDelete} className="text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-3 space-y-2">
        <div>
          <label className={lbl}>URL изображения *</label>
          <input className={inp} placeholder="https://..." value={block.url}
            onChange={e => onChange({ ...block, url: e.target.value })} />
        </div>
        <div>
          <label className={lbl}>Подпись</label>
          <input className={inp} placeholder="Рис. 1 — Структура эссе Task 2" value={block.caption ?? ''}
            onChange={e => onChange({ ...block, caption: e.target.value })} />
        </div>
        {block.url && (
          <img src={block.url} alt={block.caption ?? ''} className="rounded-lg max-h-56 object-cover w-full" />
        )}
      </div>
    </div>
  )
}

function QuizBlockEditor({ block, onChange, onDelete }: {
  block: QuizBlock; onChange: (b: QuizBlock) => void; onDelete: () => void
}) {
  const setQuestion = (qi: number, q: Partial<QuizQuestion>) => {
    const questions = block.questions.map((old, i) => i === qi ? { ...old, ...q } : old)
    onChange({ ...block, questions })
  }
  const addQuestion = () => {
    onChange({ ...block, questions: [...block.questions, { question: '', options: ['', '', '', ''], correct: 0 }] })
  }
  const deleteQuestion = (qi: number) => {
    onChange({ ...block, questions: block.questions.filter((_, i) => i !== qi) })
  }
  const setOption = (qi: number, oi: number, value: string) => {
    const q = block.questions[qi]!
    const options = q.options.map((o, i) => i === oi ? value : o)
    setQuestion(qi, { options })
  }
  const addOption = (qi: number) => {
    const q = block.questions[qi]!
    setQuestion(qi, { options: [...q.options, ''] })
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-slate-50 px-3 py-2 border-b border-slate-200">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <ListChecks className="w-3.5 h-3.5 text-purple-500" /> Тест / Quiz ({block.questions.length} вопр.)
        </span>
        <button type="button" onClick={onDelete} className="text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-3 space-y-4">
        {block.questions.map((q, qi) => (
          <div key={qi} className="border border-slate-100 rounded-xl p-3 bg-slate-50 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xs font-bold text-slate-400 mt-2.5 shrink-0">Q{qi + 1}</span>
              <div className="flex-1 space-y-2">
                <input className={inp} placeholder="Текст вопроса..." value={q.question}
                  onChange={e => setQuestion(qi, { question: e.target.value })} />
                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuestion(qi, { correct: oi })}
                        className={cn(
                          'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors',
                          q.correct === oi ? 'border-green-500 bg-green-500' : 'border-slate-300 hover:border-green-300'
                        )}
                      >
                        {q.correct === oi && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <span className="text-xs text-slate-500 shrink-0 w-4">{String.fromCharCode(65 + oi)})</span>
                      <input
                        className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-blue-400"
                        placeholder={`Вариант ${String.fromCharCode(65 + oi)}`}
                        value={opt}
                        onChange={e => setOption(qi, oi, e.target.value)}
                      />
                    </div>
                  ))}
                  {q.options.length < 5 && (
                    <button type="button" onClick={() => addOption(qi)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-7">
                      <Plus className="w-3 h-3" /> Вариант
                    </button>
                  )}
                </div>
                <input className={inp} placeholder="Объяснение правильного ответа (опционально)"
                  value={q.explanation ?? ''}
                  onChange={e => setQuestion(qi, { explanation: e.target.value })} />
              </div>
              <button type="button" onClick={() => deleteQuestion(qi)}
                className="text-slate-300 hover:text-red-400 transition-colors mt-1 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addQuestion}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-purple-300 hover:text-purple-600 transition-colors">
          <Plus className="w-4 h-4" /> Добавить вопрос
        </button>
      </div>
    </div>
  )
}

function FlashcardBlockEditor({ block, onChange, onDelete }: {
  block: FlashcardBlock; onChange: (b: FlashcardBlock) => void; onDelete: () => void
}) {
  const setCard = (ci: number, card: Partial<FlashCard>) => {
    const cards = block.cards.map((old, i) => i === ci ? { ...old, ...card } : old)
    onChange({ ...block, cards })
  }
  const addCard = () => onChange({ ...block, cards: [...block.cards, { front: '', back: '' }] })
  const delCard = (ci: number) => onChange({ ...block, cards: block.cards.filter((_, i) => i !== ci) })

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-slate-50 px-3 py-2 border-b border-slate-200">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <CreditCard className="w-3.5 h-3.5 text-amber-500" /> Карточки ({block.cards.length} шт.)
        </span>
        <button type="button" onClick={onDelete} className="text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-1">
          <span>Лицо (вопрос/термин)</span><span>Оборот (ответ/перевод)</span>
        </div>
        {block.cards.map((card, ci) => (
          <div key={ci} className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0 w-5 text-center">{ci + 1}</span>
            <input className={cn(inp, 'flex-1')} placeholder="term / question" value={card.front}
              onChange={e => setCard(ci, { front: e.target.value })} />
            <span className="text-slate-300 shrink-0">↔</span>
            <input className={cn(inp, 'flex-1')} placeholder="translation / answer" value={card.back}
              onChange={e => setCard(ci, { back: e.target.value })} />
            <button type="button" onClick={() => delCard(ci)}
              className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={addCard}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-amber-300 hover:text-amber-600 transition-colors">
          <Plus className="w-4 h-4" /> Добавить карточку
        </button>
      </div>
    </div>
  )
}

// ── Block dispatcher ──────────────────────────────────────────────────────────

function BlockEditor({ block, onChange, onDelete }: {
  block: LessonBlock; onChange: (b: LessonBlock) => void; onDelete: () => void
}) {
  if (block.type === 'text')      return <TextBlockEditor    block={block} onChange={onChange as (b: TextBlock) => void}      onDelete={onDelete} />
  if (block.type === 'video')     return <VideoBlockEditor   block={block} onChange={onChange as (b: VideoBlock) => void}     onDelete={onDelete} />
  if (block.type === 'image')     return <ImageBlockEditor   block={block} onChange={onChange as (b: ImageBlock) => void}     onDelete={onDelete} />
  if (block.type === 'quiz')      return <QuizBlockEditor    block={block} onChange={onChange as (b: QuizBlock) => void}      onDelete={onDelete} />
  if (block.type === 'flashcard') return <FlashcardBlockEditor block={block} onChange={onChange as (b: FlashcardBlock) => void} onDelete={onDelete} />
  return null
}

// ═══════════════════════════════════════════════════════════════════════════════
// Lesson Editor Panel
// ═══════════════════════════════════════════════════════════════════════════════

function LessonEditor({ lesson, subject, onChange }: {
  lesson: LessonData
  subject: string
  onChange: (l: LessonData) => void
}) {
  const addBlock = (type: LessonBlock['type']) => {
    let newBlock: LessonBlock
    if (type === 'text')      newBlock = { id: uid(), type: 'text', content: '' }
    else if (type === 'video') newBlock = { id: uid(), type: 'video', url: '', title: '' }
    else if (type === 'image') newBlock = { id: uid(), type: 'image', url: '', caption: '' }
    else if (type === 'quiz')  newBlock = { id: uid(), type: 'quiz', questions: [{ question: '', options: ['', '', '', ''], correct: 0 }] }
    else                       newBlock = { id: uid(), type: 'flashcard', cards: [{ front: '', back: '' }] }
    onChange({ ...lesson, blocks: [...lesson.blocks, newBlock] })
  }

  const updateBlock = (idx: number, b: LessonBlock) => {
    const blocks = lesson.blocks.map((old, i) => i === idx ? b : old)
    onChange({ ...lesson, blocks })
  }

  const deleteBlock = (idx: number) => {
    onChange({ ...lesson, blocks: lesson.blocks.filter((_, i) => i !== idx) })
  }

  const BLOCK_TYPES: { type: LessonBlock['type']; label: string; icon: React.ElementType; color: string }[] = [
    { type: 'text',      label: 'Текст',    icon: AlignLeft,   color: 'hover:bg-blue-50   hover:text-blue-600   hover:border-blue-300' },
    { type: 'video',     label: 'Видео',    icon: Youtube,     color: 'hover:bg-red-50    hover:text-red-600    hover:border-red-300' },
    { type: 'image',     label: 'Фото',     icon: ImageIcon,   color: 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300' },
    { type: 'quiz',      label: 'Тест',     icon: ListChecks,  color: 'hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300' },
    { type: 'flashcard', label: 'Карточки', icon: CreditCard,  color: 'hover:bg-amber-50  hover:text-amber-600  hover:border-amber-300' },
  ]

  return (
    <div className="space-y-4">
      {/* Lesson meta */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className={lbl}>Название урока *</label>
          <input className={inp} value={lesson.title}
            onChange={e => onChange({ ...lesson, title: e.target.value })} />
        </div>
        <div>
          <label className={lbl}>Длительность (мин)</label>
          <input className={inp} type="number" min={1} max={300} value={lesson.duration ?? ''}
            placeholder="15"
            onChange={e => onChange({ ...lesson, duration: parseInt(e.target.value) || undefined })} />
        </div>
      </div>

      {/* Add block buttons */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Добавить блок</p>
        <div className="flex flex-wrap gap-2">
          {BLOCK_TYPES.map(({ type, label, icon: Icon, color }) => (
            <button key={type} type="button" onClick={() => addBlock(type)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 transition-all',
                color
              )}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Blocks */}
      <AnimatePresence>
        {lesson.blocks.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="border-2 border-dashed border-slate-200 rounded-xl py-12 text-center">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Нет блоков. Добавь первый блок выше.</p>
          </motion.div>
        )}
        {lesson.blocks.map((block, idx) => (
          <motion.div key={block.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <BlockEditor
              block={block}
              onChange={b => updateBlock(idx, b)}
              onDelete={() => deleteBlock(idx)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Course Info Editor
// ═══════════════════════════════════════════════════════════════════════════════

function CourseInfoEditor({ course, onChange }: { course: CourseData; onChange: (c: CourseData) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className={lbl}>Название курса *</label>
        <input className={cn(inp, 'text-base font-medium')} placeholder="Полный курс подготовки к IELTS Band 7+"
          value={course.title} onChange={e => onChange({ ...course, title: e.target.value })} />
      </div>
      <div>
        <label className={lbl}>Описание</label>
        <textarea className={cn(inp, 'h-24 resize-none')} placeholder="Что студент узнает и сможет делать после прохождения курса..."
          value={course.description} onChange={e => onChange({ ...course, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Предмет</label>
          <select className={inp} value={course.subject} onChange={e => onChange({ ...course, subject: e.target.value })}>
            {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Уровень</label>
          <select className={inp} value={course.level} onChange={e => onChange({ ...course, level: e.target.value })}>
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={lbl}>Цена (0 = бесплатно)</label>
        <input className={inp} type="number" min={0} step={500}
          value={course.price} onChange={e => onChange({ ...course, price: parseInt(e.target.value) || 0 })} />
      </div>
      <div>
        <label className={lbl}>Цвет обложки</label>
        <div className="flex items-center gap-3 flex-wrap">
          {COVER_COLORS.map(color => (
            <button key={color} type="button"
              onClick={() => onChange({ ...course, coverColor: color })}
              style={{ backgroundColor: color }}
              className={cn(
                'w-8 h-8 rounded-full transition-all',
                course.coverColor === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
              )}
            />
          ))}
          <input type="color" value={course.coverColor}
            onChange={e => onChange({ ...course, coverColor: e.target.value })}
            className="w-8 h-8 rounded-full cursor-pointer border-none outline-none" />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Robot Assistant Panel
// ═══════════════════════════════════════════════════════════════════════════════

function RobotPanel({ subject, onTip }: { subject: string; onTip: (tip: string) => void }) {
  const [visible, setVisible] = useState(true)
  const tips = getRobotTips(subject)
  const [tipIdx, setTipIdx] = useState(0)

  if (!visible) {
    return (
      <button type="button" onClick={() => setVisible(true)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm text-blue-600 font-medium transition-colors">
        <Bot className="w-4 h-4" />
        Советы ИИ-помощника
      </button>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 to-violet-700 rounded-xl p-4 text-white space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Bot className="w-4 h-4" />
          ИИ-помощник
        </div>
        <button type="button" onClick={() => setVisible(false)} className="text-white/60 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white/15 rounded-xl p-3 text-sm leading-relaxed">
        <Lightbulb className="w-4 h-4 mb-1.5 text-yellow-300" />
        {tips[tipIdx % tips.length]}
      </div>

      <div className="flex items-center gap-2">
        <button type="button"
          onClick={() => setTipIdx(i => (i + 1) % tips.length)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 text-xs font-semibold transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          Следующий совет
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-[11px] text-white/60 font-semibold uppercase tracking-wide">Быстрые шаблоны Quiz</p>
        {[
          'Верно / Неверно / Не указано (IELTS)',
          'Выбери правильный ответ (4 варианта)',
          'Заполни пропуск в предложении',
        ].map(template => (
          <button key={template} type="button"
            onClick={() => onTip(template)}
            className="w-full text-left text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-colors truncate">
            + {template}
          </button>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main CourseBuilder
// ═══════════════════════════════════════════════════════════════════════════════

interface Props {
  initialCourse?: CourseData
  onSave: (course: CourseData) => Promise<void>
  onBack: () => void
  isSaving: boolean
}

function emptyCourse(): CourseData {
  return {
    id: '', title: '', description: '', subject: 'ielts', level: 'beginner',
    price: 0, coverColor: '#2563eb', isPublished: false, modules: [newModule(0)],
  }
}

export default function CourseBuilder({ initialCourse, onSave, onBack, isSaving }: Props) {
  const [course, setCourse] = useState<CourseData>(initialCourse ?? emptyCourse)
  const [view, setView] = useState<'info' | 'curriculum'>('info')
  const [selectedLesson, setSelectedLesson] = useState<{ moduleIdx: number; lessonIdx: number } | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(initialCourse?.modules.map(m => m.id) ?? [course.modules[0]?.id ?? ''])
  )
  const [saved, setSaved] = useState(false)

  const subjectColor = SUBJECTS.find(s => s.value === course.subject)?.color ?? '#2563eb'

  // ── Module / Lesson helpers ─────────────────────────────────────────────────

  const addModule = () => {
    const mod = newModule(course.modules.length)
    const modules = [...course.modules, mod]
    setCourse(c => ({ ...c, modules }))
    setExpandedModules(s => new Set([...s, mod.id]))
    setSelectedLesson({ moduleIdx: modules.length - 1, lessonIdx: 0 })
    setView('curriculum')
  }

  const updateModule = (mIdx: number, partial: Partial<ModuleData>) => {
    setCourse(c => ({
      ...c,
      modules: c.modules.map((m, i) => i === mIdx ? { ...m, ...partial } : m),
    }))
  }

  const deleteModule = (mIdx: number) => {
    const modules = course.modules.filter((_, i) => i !== mIdx)
    setCourse(c => ({ ...c, modules }))
    if (selectedLesson?.moduleIdx === mIdx) setSelectedLesson(null)
  }

  const addLesson = (mIdx: number) => {
    const lessons = [...course.modules[mIdx]!.lessons, newLesson(course.modules[mIdx]!.lessons.length)]
    updateModule(mIdx, { lessons })
    setSelectedLesson({ moduleIdx: mIdx, lessonIdx: lessons.length - 1 })
    setView('curriculum')
  }

  const updateLesson = (mIdx: number, lIdx: number, lesson: LessonData) => {
    const lessons = course.modules[mIdx]!.lessons.map((l, i) => i === lIdx ? lesson : l)
    updateModule(mIdx, { lessons })
  }

  const deleteLesson = (mIdx: number, lIdx: number) => {
    const lessons = course.modules[mIdx]!.lessons.filter((_, i) => i !== lIdx)
    updateModule(mIdx, { lessons })
    if (selectedLesson?.moduleIdx === mIdx && selectedLesson.lessonIdx === lIdx) setSelectedLesson(null)
  }

  const toggleModule = (id: string) => {
    setExpandedModules(s => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const handleSave = async () => {
    await onSave(course)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTogglePublish = () => {
    setCourse(c => ({ ...c, isPublished: !c.isPublished }))
  }

  // Active lesson data
  const activeLesson = selectedLesson
    ? course.modules[selectedLesson.moduleIdx]?.lessons[selectedLesson.lessonIdx] ?? null
    : null

  // Total lesson count
  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4 sticky top-0 z-20">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>

        {/* Color indicator + title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: subjectColor }} />
          <input
            value={course.title || ''}
            onChange={e => setCourse(c => ({ ...c, title: e.target.value }))}
            placeholder="Название курса..."
            className="flex-1 min-w-0 font-semibold text-slate-800 bg-transparent outline-none text-sm truncate"
          />
          <span className="text-xs text-slate-400 shrink-0">{totalLessons} ур.</span>
        </div>

        {/* View toggle */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button type="button" onClick={() => setView('info')}
            className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              view === 'info' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700')}>
            Настройки
          </button>
          <button type="button" onClick={() => setView('curriculum')}
            className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              view === 'curriculum' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700')}>
            Учебный план
          </button>
        </div>

        {/* Publish toggle */}
        <button type="button" onClick={handleTogglePublish}
          className={cn(
            'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
            course.isPublished
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}>
          {course.isPublished ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          {course.isPublished ? 'Опубликован' : 'Черновик'}
        </button>

        {/* Save */}
        <button type="button" onClick={handleSave} disabled={isSaving}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
            saved ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60'
          )}>
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Сохранение...' : saved ? 'Сохранено!' : 'Сохранить'}
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Structure Sidebar ── */}
        <div className={cn(
          'bg-white border-r border-slate-200 flex flex-col overflow-hidden',
          view === 'curriculum' ? 'w-72 shrink-0' : 'hidden sm:flex w-64 shrink-0'
        )}>
          {/* Sidebar header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Структура курса</span>
            <button type="button" onClick={addModule}
              className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
              <Plus className="w-3.5 h-3.5" /> Модуль
            </button>
          </div>

          {/* Course info nav item */}
          <button type="button" onClick={() => { setView('info'); setSelectedLesson(null) }}
            className={cn(
              'flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors',
              view === 'info' && !selectedLesson
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            )}>
            <Edit3 className="w-3.5 h-3.5 shrink-0" />
            Информация о курсе
          </button>

          <div className="flex-1 overflow-y-auto py-1">
            {course.modules.map((mod, mIdx) => (
              <div key={mod.id}>
                {/* Module row */}
                <div className="flex items-center group px-2 py-1">
                  <button type="button"
                    onClick={() => toggleModule(mod.id)}
                    className="flex items-center gap-1.5 flex-1 min-w-0 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    {expandedModules.has(mod.id)
                      ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 truncate">{mod.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-auto">{mod.lessons.length}</span>
                  </button>
                  <button type="button" onClick={() => deleteModule(mIdx)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-400 transition-all shrink-0">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Module title inline edit */}
                {expandedModules.has(mod.id) && (
                  <div className="px-9 pb-1">
                    <input
                      className="w-full text-xs border border-slate-100 rounded px-2 py-1 outline-none focus:border-blue-300 bg-slate-50"
                      value={mod.title}
                      onChange={e => updateModule(mIdx, { title: e.target.value })}
                      placeholder="Название модуля"
                    />
                  </div>
                )}

                {/* Lessons */}
                {expandedModules.has(mod.id) && mod.lessons.map((lesson, lIdx) => (
                  <div key={lesson.id} className="flex items-center group pl-9 pr-2">
                    <button type="button"
                      onClick={() => { setSelectedLesson({ moduleIdx: mIdx, lessonIdx: lIdx }); setView('curriculum') }}
                      className={cn(
                        'flex items-center gap-1.5 flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs transition-colors',
                        selectedLesson?.moduleIdx === mIdx && selectedLesson.lessonIdx === lIdx
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}>
                      <Play className="w-3 h-3 shrink-0" />
                      <span className="truncate">{lesson.title}</span>
                      {lesson.duration && <span className="text-[10px] text-slate-400 shrink-0 ml-auto">{lesson.duration}м</span>}
                    </button>
                    <button type="button" onClick={() => deleteLesson(mIdx, lIdx)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-400 transition-all shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add lesson button */}
                {expandedModules.has(mod.id) && (
                  <button type="button" onClick={() => addLesson(mIdx)}
                    className="flex items-center gap-1.5 pl-9 pr-3 py-1.5 text-xs text-slate-400 hover:text-blue-600 transition-colors w-full">
                    <Plus className="w-3 h-3" />
                    Добавить урок
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Center: Editor ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-6">
            {/* Course info view */}
            {(view === 'info' || !selectedLesson) && (
              <motion.div key="info" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: subjectColor }}>
                    {SUBJECTS.find(s => s.value === course.subject)?.label.charAt(0) ?? 'C'}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-lg">Информация о курсе</h2>
                    <p className="text-sm text-slate-500">Заполни, чтобы студенты могли найти курс</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <CourseInfoEditor course={course} onChange={setCourse} />
                </div>
                {course.modules.length === 0 && (
                  <button type="button" onClick={addModule}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors font-medium">
                    <Plus className="w-5 h-5" />
                    Добавить первый модуль
                  </button>
                )}
              </motion.div>
            )}

            {/* Lesson editor view */}
            {view === 'curriculum' && activeLesson && selectedLesson && (
              <motion.div key={`${selectedLesson.moduleIdx}-${selectedLesson.lessonIdx}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      Модуль {selectedLesson.moduleIdx + 1} · Урок {selectedLesson.lessonIdx + 1}
                    </p>
                    <h2 className="font-bold text-slate-800 text-lg">{activeLesson.title || 'Без названия'}</h2>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <LessonEditor
                    lesson={activeLesson}
                    subject={course.subject}
                    onChange={l => updateLesson(selectedLesson.moduleIdx, selectedLesson.lessonIdx, l)}
                  />
                </div>
              </motion.div>
            )}

            {/* Empty state when curriculum open but no lesson selected */}
            {view === 'curriculum' && !activeLesson && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <GraduationCap className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Выбери урок в боковой панели</p>
                <p className="text-sm text-slate-400 mt-1">или добавь новый модуль</p>
                <button type="button" onClick={addModule}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" /> Новый модуль
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Robot Panel ── */}
        <div className="hidden xl:flex flex-col w-64 shrink-0 border-l border-slate-200 bg-white overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ИИ-помощник</span>
          </div>
          <div className="p-4 space-y-4">
            <RobotPanel
              subject={course.subject}
              onTip={(tip) => {
                // When tutor clicks a template tip, add a quiz block to active lesson
                if (!activeLesson || !selectedLesson) return
                const newBlock: QuizBlock = {
                  id: uid(), type: 'quiz',
                  questions: [{ question: `(${tip}) — введи вопрос`, options: ['', '', '', ''], correct: 0 }],
                }
                updateLesson(selectedLesson.moduleIdx, selectedLesson.lessonIdx, {
                  ...activeLesson,
                  blocks: [...activeLesson.blocks, newBlock],
                })
              }}
            />

            {/* Stats */}
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Статистика курса</p>
              <div className="space-y-1">
                {[
                  { label: 'Модулей', value: course.modules.length },
                  { label: 'Уроков', value: totalLessons },
                  {
                    label: 'Блоков',
                    value: course.modules.flatMap(m => m.lessons).flatMap(l => l.blocks).length
                  },
                  {
                    label: 'Quiz вопросов',
                    value: course.modules.flatMap(m => m.lessons)
                      .flatMap(l => l.blocks)
                      .filter(b => b.type === 'quiz')
                      .reduce((s, b) => s + (b as QuizBlock).questions.length, 0)
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
