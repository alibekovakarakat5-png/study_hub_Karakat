import { useState, useEffect, Component } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  LogOut,
  Crown,
  BarChart3,
  MapPin,
  Calendar,
  Shield,
  Settings,
  Bell,
  Search,
  ChevronDown,
  ArrowUpRight,
  Plus,
  Trash2,
  Edit3,
  Globe,
  Youtube,
  Smartphone,
  BookMarked,
  Bot,
  Languages,
  MessageCircle,
  RefreshCw,
  UserCheck,
  Clock,
  Target,
  Filter,
  ChevronUp,
  Download,
  Award,
  Wand2,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useContentStore } from '@/store/useContentStore'
import { getToken } from '@/lib/api'
import CourseBuilderComponent from '@/components/admin/CourseBuilder'
import type { CourseData } from '@/components/admin/CourseBuilder'
import BillingPanel from '@/components/admin/BillingPanel'
import type { CustomMaterial, CustomQA, CustomVocabWord } from '@/store/useContentStore'
import { VOCAB_TOPICS } from '@/data/ieltsContent'
import type { AbroadUniversity } from '@/data/universityAdvisor'
import type { Scholarship } from '@/data/scholarships'
import { cn } from '@/lib/utils'
import { adminApi } from '@/lib/api'
import type { AdminUser, AdminStats } from '@/lib/api'

const PIE_COLORS = ['#2563eb', '#7c3aed', '#16a34a', '#d97706', '#dc2626', '#6b7280']

// ── Error Boundary ────────────────────────────────────────────────────────────

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-medium mb-2">Ошибка рендеринга</p>
          <p className="text-sm text-red-400 mb-4 font-mono">{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Повторить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
} satisfies import('framer-motion').Variants

// ── Content Manager (IELTS materials, Q&A, Vocabulary) ───────────────────────

const MATERIAL_TYPE_ICONS: Record<string, React.ElementType> = {
  book: BookMarked, website: Globe, youtube: Youtube, app: Smartphone,
}

// ── Smart paste parsers ───────────────────────────────────────────────────────

function parseUniversityText(text: string): Partial<AbroadUniversity> {
  const line = (patterns: RegExp[]): string => {
    for (const p of patterns) { const m = text.match(p); if (m) return m[1]?.trim() ?? '' }
    return ''
  }
  const num = (patterns: RegExp[]): number => {
    for (const p of patterns) { const m = text.match(p); if (m) return parseInt(m[1]?.replace(/[,\s]/g, '') ?? '0') }
    return 0
  }
  const arr = (patterns: RegExp[]): string[] => {
    const v = line(patterns)
    return v ? v.split(/[,;]\s*/).map(s => s.trim()).filter(Boolean) : []
  }

  const name    = line([/(?:name|university|вуз|название)[:\s]+(.+)/i, /^(.+university.+)$/im])
  const country = line([/(?:country|страна)[:\s]+(.+)/i])
  const city    = line([/(?:city|город|сити)[:\s]+(.+)/i])
  const qs      = num([/(?:qs|ranking|рейтинг|rank)[^:\d]*[:\s#]*(\d+)/i])
  const tuition = num([/(?:tuition|обучени[ея]|плата за обучение)[^:\d]*[:\s]+([\d,]+)/i])
  const living  = num([/(?:living|проживани[ея]|стоимость жизни)[^:\d]*[:\s]+([\d,]+)/i])
  const ielts   = parseFloat(line([/(?:ielts|айлтс)[^:\d]*[:\s]+([\d.]+)/i])) || undefined
  const langRaw = line([/(?:language|язык обучения|язык)[:\s]+(.+)/i])
  const langMap: Record<string, AbroadUniversity['language']> = {
    english: 'en', английский: 'en', eng: 'en',
    russian: 'ru', русский: 'ru', рус: 'ru',
    german: 'de', немецкий: 'de',
    kazakh: 'kk', казахский: 'kk',
  }
  const language = langMap[langRaw.toLowerCase()] ?? 'en'

  return {
    name:         name || undefined,
    country:      country || undefined,
    city:         city || undefined,
    qs2025:       qs || undefined,
    tuitionUSD:   tuition,
    livingUSD:    living,
    minIELTS:     ielts,
    language,
    specialties:  arr([/(?:specialt(?:y|ies)|специальност[ьи]|направлени[яе])[:\s]+(.+)/i]),
    scholarships: arr([/(?:scholarships?|стипендии|стипендия)[:\s]+(.+)/i]),
    description:  line([/(?:description|описание)[:\s]+(.+)/i]),
    pros:         arr([/(?:pros?|плюсы|преимущества)[:\s]+(.+)/i]),
    cons:         arr([/(?:cons?|минусы|недостатки)[:\s]+(.+)/i]),
    tag:          line([/(?:tag|тег|highlight|фишка)[:\s]+(.+)/i]) || undefined,
  }
}

function parseScholarshipText(text: string): Partial<Scholarship> {
  const line = (patterns: RegExp[]): string => {
    for (const p of patterns) { const m = text.match(p); if (m) return m[1]?.trim() ?? '' }
    return ''
  }
  const arr = (patterns: RegExp[]): string[] => {
    const v = line(patterns)
    return v ? v.split(/[,;]\n?|\n/).map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean) : []
  }

  const levelRaw = line([/(?:level|уровень)[:\s]+(.+)/i])
  const levels: Scholarship['level'] = []
  if (/bachelor|бакалавр/i.test(levelRaw || text)) levels.push('bachelor')
  if (/master|магистр/i.test(levelRaw || text))    levels.push('master')
  if (/phd|докторант/i.test(levelRaw || text))     levels.push('phd')

  const covRaw = line([/(?:coverage|покрытие)[:\s]+(.+)/i])
  const coverage: Scholarship['coverage'] =
    /full|полн/i.test(covRaw)    ? 'full'    :
    /partial|частичн/i.test(covRaw) ? 'partial' : 'tuition'

  const urlMatch = text.match(/https?:\/\/[^\s,)"']+/)

  return {
    name:          line([/(?:name|название|scholarship)[:\s]+(.+)/i]) || undefined,
    nameShort:     line([/(?:short name|короткое|аббревиатура)[:\s]+(.+)/i]) || undefined,
    provider:      line([/(?:provider|организация|орган)[:\s]+(.+)/i]) || undefined,
    country:       line([/(?:country|страна)[:\s]+(.+)/i]) || undefined,
    flag:          line([/(?:flag|флаг|emoji)[:\s]+(.+)/i]) || '🌍',
    level:         levels.length ? levels : ['bachelor', 'master'],
    coverage,
    coverageLabel: line([/(?:coverage label|что покрывает|покрывает)[:\s]+(.+)/i]) || covRaw,
    deadline:      line([/(?:deadline|дедлайн|срок подачи)[:\s]+(.+)/i]) || undefined,
    requirements:  arr([/(?:requirements?|требования)[:\s]+([\s\S]+?)(?=\n[A-ZА-Я]|\n\n|$)/i]),
    description:   line([/(?:description|описание)[:\s]+(.+)/i]) || undefined,
    officialSite:  urlMatch?.[0] ?? '',
    tags:          arr([/(?:tags?|теги)[:\s]+(.+)/i]),
    fields:        arr([/(?:fields?|области|направлени[яе])[:\s]+(.+)/i]),
  } as Partial<Scholarship>
}

// ── ContentManager ────────────────────────────────────────────────────────────

function ContentManager() {
  const {
    materials, addMaterial, deleteMaterial,
    qas, addQA, deleteQA,
    vocabWords, addVocabWord, deleteVocabWord,
    universities, addUniversity, deleteUniversity,
    scholarships, addScholarship, deleteScholarship,
    syncFromServer,
  } = useContentStore()
  const [section, setSection] = useState<'materials' | 'qa' | 'vocab' | 'universities' | 'scholarships'>('materials')

  useEffect(() => { syncFromServer() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Material form state ──────────────────────────────────────────────────
  const [mForm, setMForm] = useState<Omit<CustomMaterial, 'id' | 'createdAt'>>({
    title: '', type: 'book', description: '', skill: 'all', level: 'all', free: true, url: '',
  })

  // ── Q&A form state ───────────────────────────────────────────────────────
  const [qaForm, setQaForm] = useState<Omit<CustomQA, 'id' | 'createdAt'>>({
    keywords: '', answer: '', followUp: '', mood: 'thinking',
  })

  // ── Vocab form state ─────────────────────────────────────────────────────
  const [vForm, setVForm] = useState<Omit<CustomVocabWord, 'id' | 'createdAt'>>({
    topicId: VOCAB_TOPICS[0].id, topicName: VOCAB_TOPICS[0].name, word: '', definition: '', example: '',
  })

  // ── University smart paste state ─────────────────────────────────────────
  const [uPasteMode, setUPasteMode] = useState(false)
  const [uPasteText, setUPasteText] = useState('')
  const [uForm, setUForm] = useState<Partial<AbroadUniversity>>({
    name: '', country: '', city: '', tuitionUSD: 0, livingUSD: 0,
    language: 'en', specialties: [], scholarships: [], description: '', pros: [], cons: [],
  })

  // ── Scholarship smart paste state ────────────────────────────────────────
  const [sPasteMode, setSPasteMode] = useState(false)
  const [sPasteText, setSPasteText] = useState('')
  const [sForm, setSForm] = useState<Partial<Scholarship>>({
    name: '', nameShort: '', provider: '', country: '', flag: '🌍',
    level: ['bachelor', 'master'], coverage: 'full', coverageLabel: '',
    deadline: '', requirements: [], description: '', officialSite: '', tags: [], fields: [],
  })

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100'
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

  const sections = [
    { id: 'materials'    as const, label: 'Материалы IELTS', icon: Globe,      count: materials.length },
    { id: 'qa'           as const, label: 'Q&A Ментора',     icon: Bot,        count: qas.length },
    { id: 'vocab'        as const, label: 'Словарь',         icon: Languages,  count: vocabWords.length },
    { id: 'universities' as const, label: 'Университеты',    icon: GraduationCap, count: universities.length },
    { id: 'scholarships' as const, label: 'Стипендии',       icon: Award,      count: scholarships.length },
  ]

  function applyUPaste() {
    const parsed = parseUniversityText(uPasteText)
    setUForm(f => ({ ...f, ...parsed }))
    setUPasteMode(false)
  }

  function applySPaste() {
    const parsed = parseScholarshipText(sPasteText)
    setSForm(f => ({ ...f, ...parsed }))
    setSPasteMode(false)
  }

  function saveUniversity() {
    if (!uForm.name?.trim() || !uForm.country?.trim()) return
    const entry: AbroadUniversity = {
      id: `adm_${Date.now()}`,
      name: uForm.name ?? '',
      country: uForm.country ?? '',
      city: uForm.city ?? '',
      qs2025: uForm.qs2025 || undefined,
      tuitionUSD: uForm.tuitionUSD ?? 0,
      livingUSD: uForm.livingUSD ?? 0,
      minIELTS: uForm.minIELTS || undefined,
      language: uForm.language ?? 'en',
      specialties: uForm.specialties ?? [],
      scholarships: uForm.scholarships ?? [],
      description: uForm.description ?? '',
      pros: uForm.pros ?? [],
      cons: uForm.cons ?? [],
      tag: uForm.tag,
    }
    addUniversity(entry)
    setUForm({ name: '', country: '', city: '', tuitionUSD: 0, livingUSD: 0, language: 'en', specialties: [], scholarships: [], description: '', pros: [], cons: [] })
    setUPasteText('')
  }

  function saveScholarship() {
    if (!sForm.name?.trim() || !sForm.country?.trim()) return
    const entry: Scholarship = {
      id: `sch_${Date.now()}`,
      name: sForm.name ?? '',
      nameShort: sForm.nameShort ?? sForm.name ?? '',
      provider: sForm.provider ?? '',
      country: sForm.country ?? '',
      flag: sForm.flag ?? '🌍',
      level: sForm.level ?? ['bachelor', 'master'],
      fields: sForm.fields ?? [],
      coverage: sForm.coverage ?? 'full',
      coverageLabel: sForm.coverageLabel ?? '',
      deadline: sForm.deadline ?? '',
      requirements: sForm.requirements ?? [],
      description: sForm.description ?? '',
      officialSite: sForm.officialSite ?? '',
      tags: sForm.tags ?? [],
    }
    addScholarship(entry)
    setSForm({ name: '', nameShort: '', provider: '', country: '', flag: '🌍', level: ['bachelor', 'master'], coverage: 'full', coverageLabel: '', deadline: '', requirements: [], description: '', officialSite: '', tags: [], fields: [] })
    setSPasteText('')
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {sections.map(s => {
          const Icon = s.icon
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                section === s.id ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200',
              )}
            >
              <Icon className="w-4 h-4" />
              {s.label}
              <span className={cn('text-xs px-1.5 py-0.5 rounded-full', section === s.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')}>
                {s.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Materials ────────────────────────────────────────────────────────── */}
      {section === 'materials' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary-600" /> Добавить материал</h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Название *</label>
                <input className={inputCls} placeholder="Cambridge IELTS 19 Academic" value={mForm.title} onChange={e => setMForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Тип</label>
                  <select className={inputCls} value={mForm.type} onChange={e => setMForm(f => ({ ...f, type: e.target.value as CustomMaterial['type'] }))}>
                    <option value="book">Книга</option>
                    <option value="website">Сайт</option>
                    <option value="youtube">YouTube</option>
                    <option value="app">Приложение</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Навык</label>
                  <select className={inputCls} value={mForm.skill} onChange={e => setMForm(f => ({ ...f, skill: e.target.value as CustomMaterial['skill'] }))}>
                    <option value="all">Все</option>
                    <option value="reading">Reading</option>
                    <option value="writing">Writing</option>
                    <option value="listening">Listening</option>
                    <option value="speaking">Speaking</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Описание *</label>
                <textarea className={cn(inputCls, 'h-20 resize-none')} placeholder="Краткое описание материала" value={mForm.description} onChange={e => setMForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>URL (необязательно)</label>
                <input className={inputCls} placeholder="https://..." value={mForm.url ?? ''} onChange={e => setMForm(f => ({ ...f, url: e.target.value }))} />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                  <input type="checkbox" checked={mForm.free} onChange={e => setMForm(f => ({ ...f, free: e.target.checked }))} className="w-4 h-4 rounded accent-primary-600" />
                  Бесплатно
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!mForm.title.trim() || !mForm.description.trim()) return
                  addMaterial(mForm)
                  setMForm({ title: '', type: 'book', description: '', skill: 'all', level: 'all', free: true, url: '' })
                }}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                Добавить
              </button>
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Добавленные материалы ({materials.length})</h3>
            {materials.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Пока ничего нет. Добавьте первый материал.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {materials.map(m => {
                  const Icon = MATERIAL_TYPE_ICONS[m.type] ?? Globe
                  return (
                    <div key={m.id} className="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:border-slate-200">
                      <Icon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{m.title}</p>
                        <p className="text-xs text-slate-400 truncate">{m.description}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{m.skill}</span>
                          <span className={cn('text-xs px-1.5 py-0.5 rounded', m.free ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600')}>
                            {m.free ? 'free' : 'paid'}
                          </span>
                        </div>
                      </div>
                      <button type="button" onClick={() => deleteMaterial(m.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Q&A ──────────────────────────────────────────────────────────────── */}
      {section === 'qa' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2"><Plus className="w-4 h-4 text-primary-600" /> Добавить Q&A для ментора</h3>
            <p className="text-xs text-slate-400 mb-4">Когда студент спросит что-то с этими ключевыми словами — робот ответит этим текстом.</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Ключевые слова * (через запятую)</label>
                <input className={inputCls} placeholder="task 2, эссе, структура эссе" value={qaForm.keywords} onChange={e => setQaForm(f => ({ ...f, keywords: e.target.value }))} />
                <p className="text-xs text-slate-400 mt-1">Если вопрос содержит хотя бы одно слово — сработает этот ответ</p>
              </div>
              <div>
                <label className={labelCls}>Ответ ментора *</label>
                <textarea className={cn(inputCls, 'h-32 resize-none')} placeholder="Подробный ответ, который увидит студент..." value={qaForm.answer} onChange={e => setQaForm(f => ({ ...f, answer: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Следующий вопрос (необязательно)</label>
                <input className={inputCls} placeholder="Хочешь разберём подробнее?" value={qaForm.followUp ?? ''} onChange={e => setQaForm(f => ({ ...f, followUp: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Настроение робота</label>
                <select className={inputCls} value={qaForm.mood} onChange={e => setQaForm(f => ({ ...f, mood: e.target.value as CustomQA['mood'] }))}>
                  <option value="thinking">Thinking (задумчивый)</option>
                  <option value="happy">Happy (радостный)</option>
                  <option value="excited">Excited (восторженный)</option>
                  <option value="encouraging">Encouraging (подбадривающий)</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!qaForm.keywords.trim() || !qaForm.answer.trim()) return
                  addQA(qaForm)
                  setQaForm({ keywords: '', answer: '', followUp: '', mood: 'thinking' })
                }}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                Добавить
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Добавленные Q&A ({qas.length})</h3>
            {qas.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Пока ничего. Добавьте первый ответ для ментора.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {qas.map(q => (
                  <div key={q.id} className="p-3 border border-slate-100 rounded-xl hover:border-slate-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {q.keywords.split(',').map(kw => (
                            <span key={kw} className="text-xs bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded">{kw.trim()}</span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">{q.answer}</p>
                      </div>
                      <button type="button" onClick={() => deleteQA(q.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Vocabulary ───────────────────────────────────────────────────────── */}
      {section === 'vocab' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary-600" /> Добавить слово в словарь</h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Тема</label>
                <select className={inputCls} value={vForm.topicId} onChange={e => {
                  const topic = VOCAB_TOPICS.find(t => t.id === e.target.value)
                  setVForm(f => ({ ...f, topicId: e.target.value, topicName: topic?.name ?? e.target.value }))
                }}>
                  {VOCAB_TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  <option value="custom">Новая тема...</option>
                </select>
              </div>
              {vForm.topicId === 'custom' && (
                <div>
                  <label className={labelCls}>Название новой темы *</label>
                  <input className={inputCls} placeholder="Society" value={vForm.topicName} onChange={e => setVForm(f => ({ ...f, topicName: e.target.value }))} />
                </div>
              )}
              <div>
                <label className={labelCls}>Слово / фраза *</label>
                <input className={inputCls} placeholder="carbon footprint" value={vForm.word} onChange={e => setVForm(f => ({ ...f, word: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Определение *</label>
                <input className={inputCls} placeholder="Total greenhouse gas emissions..." value={vForm.definition} onChange={e => setVForm(f => ({ ...f, definition: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Пример предложения *</label>
                <input className={inputCls} placeholder="You can reduce your carbon footprint by..." value={vForm.example} onChange={e => setVForm(f => ({ ...f, example: e.target.value }))} />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!vForm.word.trim() || !vForm.definition.trim() || !vForm.example.trim()) return
                  addVocabWord(vForm)
                  setVForm(f => ({ ...f, word: '', definition: '', example: '' }))
                }}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                Добавить
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Добавленные слова ({vocabWords.length})</h3>
            {vocabWords.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Пока ничего. Добавьте первое слово.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {vocabWords.map(w => (
                  <div key={w.id} className="flex items-start gap-3 p-3 border border-slate-100 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-slate-800">{w.word}</p>
                        <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{w.topicName}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{w.definition}</p>
                    </div>
                    <button type="button" onClick={() => deleteVocabWord(w.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Universities ─────────────────────────────────────────────────────── */}
      {section === 'universities' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary-600" /> Добавить университет
              </h3>
              <button
                type="button"
                onClick={() => setUPasteMode(v => !v)}
                className={cn(
                  'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors',
                  uPasteMode ? 'bg-violet-50 border-violet-300 text-violet-700' : 'border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600',
                )}
              >
                <Wand2 className="w-3.5 h-3.5" /> Умная вставка
              </button>
            </div>

            {uPasteMode && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Вставьте любой текст об университете — система сама извлечёт поля.
                  Используйте метки: <code className="bg-slate-100 px-1 rounded">Name:</code> <code className="bg-slate-100 px-1 rounded">Country:</code> <code className="bg-slate-100 px-1 rounded">QS:</code> <code className="bg-slate-100 px-1 rounded">Tuition:</code> <code className="bg-slate-100 px-1 rounded">IELTS:</code> и т.д.
                </p>
                <textarea
                  className={cn(inputCls, 'h-36 resize-none font-mono text-xs')}
                  placeholder={'Name: TU Munich\nCountry: Germany\nCity: Munich\nQS: 37\nTuition: 0\nLiving: 12000\nIELTS: 6.5\nLanguage: English\nSpecialties: IT, Engineering\nDescription: ...\nPros: Free tuition, Top research\nCons: Competitive, German required'}
                  value={uPasteText}
                  onChange={e => setUPasteText(e.target.value)}
                />
                <button
                  type="button"
                  onClick={applyUPaste}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-4 h-4" /> Разобрать текст
                </button>
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Название *</label>
                  <input className={inputCls} placeholder="TU Munich" value={uForm.name ?? ''} onChange={e => setUForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Страна *</label>
                  <input className={inputCls} placeholder="Германия" value={uForm.country ?? ''} onChange={e => setUForm(f => ({ ...f, country: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Город</label>
                  <input className={inputCls} placeholder="Мюнхен" value={uForm.city ?? ''} onChange={e => setUForm(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>QS 2025</label>
                  <input type="number" className={inputCls} placeholder="37" value={uForm.qs2025 ?? ''} onChange={e => setUForm(f => ({ ...f, qs2025: parseInt(e.target.value) || undefined }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Обучение (USD/год)</label>
                  <input type="number" className={inputCls} placeholder="0" value={uForm.tuitionUSD ?? 0} onChange={e => setUForm(f => ({ ...f, tuitionUSD: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className={labelCls}>Проживание (USD/год)</label>
                  <input type="number" className={inputCls} placeholder="12000" value={uForm.livingUSD ?? 0} onChange={e => setUForm(f => ({ ...f, livingUSD: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Мин. IELTS</label>
                  <input type="number" step="0.5" className={inputCls} placeholder="6.5" value={uForm.minIELTS ?? ''} onChange={e => setUForm(f => ({ ...f, minIELTS: parseFloat(e.target.value) || undefined }))} />
                </div>
                <div>
                  <label className={labelCls}>Язык обучения</label>
                  <select className={inputCls} value={uForm.language ?? 'en'} onChange={e => setUForm(f => ({ ...f, language: e.target.value as AbroadUniversity['language'] }))}>
                    <option value="en">Английский</option>
                    <option value="ru">Русский</option>
                    <option value="de">Немецкий</option>
                    <option value="kk">Казахский</option>
                    <option value="multi">Несколько</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Специальности (через запятую)</label>
                <input className={inputCls} placeholder="IT, Engineering, Business" value={(uForm.specialties ?? []).join(', ')} onChange={e => setUForm(f => ({ ...f, specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
              </div>
              <div>
                <label className={labelCls}>Описание</label>
                <textarea className={cn(inputCls, 'h-16 resize-none')} value={uForm.description ?? ''} onChange={e => setUForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Плюсы (через запятую)</label>
                <input className={inputCls} placeholder="Бесплатное обучение, Топ рейтинг" value={(uForm.pros ?? []).join(', ')} onChange={e => setUForm(f => ({ ...f, pros: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
              </div>
              <div>
                <label className={labelCls}>Минусы (через запятую)</label>
                <input className={inputCls} placeholder="Высокий конкурс" value={(uForm.cons ?? []).join(', ')} onChange={e => setUForm(f => ({ ...f, cons: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
              </div>
              <div>
                <label className={labelCls}>Тег (необязательно)</label>
                <input className={inputCls} placeholder="Бесплатно" value={uForm.tag ?? ''} onChange={e => setUForm(f => ({ ...f, tag: e.target.value || undefined }))} />
              </div>
              <button
                type="button"
                onClick={saveUniversity}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                Добавить университет
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Добавленные вузы ({universities.length})</h3>
            {universities.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Пока ничего. Добавьте первый университет.</p>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {universities.map(u => (
                  <div key={u.id} className="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:border-slate-200">
                    <GraduationCap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.city}, {u.country}{u.qs2025 ? ` · QS ${u.qs2025}` : ''}</p>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                          {u.tuitionUSD === 0 ? 'Бесплатно' : `$${u.tuitionUSD.toLocaleString()}/год`}
                        </span>
                        {u.tag && <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">{u.tag}</span>}
                      </div>
                    </div>
                    <button type="button" onClick={() => deleteUniversity(u.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Scholarships ─────────────────────────────────────────────────────── */}
      {section === 'scholarships' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary-600" /> Добавить стипендию
              </h3>
              <button
                type="button"
                onClick={() => setSPasteMode(v => !v)}
                className={cn(
                  'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors',
                  sPasteMode ? 'bg-violet-50 border-violet-300 text-violet-700' : 'border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600',
                )}
              >
                <Wand2 className="w-3.5 h-3.5" /> Умная вставка
              </button>
            </div>

            {sPasteMode && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Вставьте текст о стипендии — система сама разберёт поля.
                  Используйте: <code className="bg-slate-100 px-1 rounded">Name:</code> <code className="bg-slate-100 px-1 rounded">Country:</code> <code className="bg-slate-100 px-1 rounded">Coverage:</code> <code className="bg-slate-100 px-1 rounded">Deadline:</code> и т.д.
                </p>
                <textarea
                  className={cn(inputCls, 'h-36 resize-none font-mono text-xs')}
                  placeholder={'Name: DAAD Scholarship\nProvider: German Academic Exchange\nCountry: Germany\nFlag: 🇩🇪\nLevel: Master, PhD\nCoverage: Full\nCoverage Label: €850/month + travel\nDeadline: November 15\nDescription: ...\nRequirements:\n- Bachelor degree\n- German B2\nhttps://www.daad.de'}
                  value={sPasteText}
                  onChange={e => setSPasteText(e.target.value)}
                />
                <button
                  type="button"
                  onClick={applySPaste}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-4 h-4" /> Разобрать текст
                </button>
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Название *</label>
                  <input className={inputCls} placeholder="DAAD Scholarship" value={sForm.name ?? ''} onChange={e => setSForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Аббревиатура</label>
                  <input className={inputCls} placeholder="DAAD" value={sForm.nameShort ?? ''} onChange={e => setSForm(f => ({ ...f, nameShort: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Страна *</label>
                  <input className={inputCls} placeholder="Германия" value={sForm.country ?? ''} onChange={e => setSForm(f => ({ ...f, country: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Флаг (emoji)</label>
                  <input className={inputCls} placeholder="🇩🇪" value={sForm.flag ?? ''} onChange={e => setSForm(f => ({ ...f, flag: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Организация</label>
                <input className={inputCls} placeholder="German Academic Exchange Service" value={sForm.provider ?? ''} onChange={e => setSForm(f => ({ ...f, provider: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Покрытие</label>
                <select className={inputCls} value={sForm.coverage ?? 'full'} onChange={e => setSForm(f => ({ ...f, coverage: e.target.value as Scholarship['coverage'] }))}>
                  <option value="full">Полное (full)</option>
                  <option value="partial">Частичное (partial)</option>
                  <option value="tuition">Только обучение (tuition)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Описание покрытия</label>
                <input className={inputCls} placeholder="Обучение + €850/мес + переезд" value={sForm.coverageLabel ?? ''} onChange={e => setSForm(f => ({ ...f, coverageLabel: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Дедлайн подачи</label>
                <input className={inputCls} placeholder="1 ноября" value={sForm.deadline ?? ''} onChange={e => setSForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Официальный сайт</label>
                <input className={inputCls} placeholder="https://..." value={sForm.officialSite ?? ''} onChange={e => setSForm(f => ({ ...f, officialSite: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Требования (каждое с новой строки)</label>
                <textarea className={cn(inputCls, 'h-20 resize-none')} placeholder={'Диплом бакалавра\nIELTS 6.5+\nМотивационное письмо'} value={(sForm.requirements ?? []).join('\n')} onChange={e => setSForm(f => ({ ...f, requirements: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))} />
              </div>
              <div>
                <label className={labelCls}>Описание</label>
                <textarea className={cn(inputCls, 'h-16 resize-none')} value={sForm.description ?? ''} onChange={e => setSForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <button
                type="button"
                onClick={saveScholarship}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                Добавить стипендию
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Добавленные стипендии ({scholarships.length})</h3>
            {scholarships.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Пока ничего. Добавьте первую стипендию.</p>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {scholarships.map(s => (
                  <div key={s.id} className="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:border-slate-200">
                    <span className="text-xl shrink-0">{s.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.country} · {s.provider}</p>
                      <div className="flex gap-1.5 mt-1">
                        <span className={cn('text-xs px-1.5 py-0.5 rounded', s.coverage === 'full' ? 'bg-green-50 text-green-600' : s.coverage === 'partial' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600')}>
                          {s.coverage === 'full' ? 'Полное' : s.coverage === 'partial' ? 'Частичное' : 'Обучение'}
                        </span>
                        {s.deadline && <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{s.deadline}</span>}
                      </div>
                    </div>
                    <button type="button" onClick={() => deleteScholarship(s.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ── Leads Panel (реальные данные из БД) ───────────────────────────────────────

const ROLE_LABELS: Record<AdminUser['role'], string> = {
  student:  'Ученик',
  parent:   'Родитель',
  teacher:  'Учитель',
  employer: 'Работодатель',
  admin:    'Админ',
}

const ROLE_COLORS: Record<AdminUser['role'], string> = {
  student:  'bg-blue-100 text-blue-700',
  parent:   'bg-purple-100 text-purple-700',
  teacher:  'bg-emerald-100 text-emerald-700',
  employer: 'bg-amber-100 text-amber-700',
  admin:    'bg-red-100 text-red-700',
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m} мин`
  const h = Math.floor(m / 60)
  return `${h} ч ${m % 60} мин`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function topN<T extends string | null>(arr: T[], n = 5): { name: string; count: number }[] {
  const freq: Record<string, number> = {}
  for (const v of arr) {
    const key = v ?? 'Не указано'
    freq[key] = (freq[key] ?? 0) + 1
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }))
}

function buildWhatsAppMessage(u: AdminUser): string {
  const lines = [
    `Привет, ${u.name.split(' ')[0]}! 👋`,
    `Я из команды StudyHub — вижу, что ты недавно зарегистрировался на платформе.`,
    ``,
    u.grade ? `📚 ${u.grade}-класс, ${u.city ?? 'Казахстан'}` : `📍 ${u.city ?? 'Казахстан'}`,
    u.targetUniversity ? `🎯 Целевой вуз: ${u.targetUniversity}` : '',
    u.targetSpecialty ? `📖 Специальность: ${u.targetSpecialty}` : '',
    ``,
    `Хочу лично помочь с подготовкой! Есть минута?`,
  ].filter(Boolean).join('\n')
  return `https://wa.me/?text=${encodeURIComponent(lines)}`
}

function MiniBar({ count, max }: { count: number; max: number }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${max > 0 ? (count / max) * 100 : 0}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 tabular-nums w-6 text-right">{count}</span>
    </div>
  )
}

function LeadsPanel() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<AdminUser['role'] | 'all'>('all')
  const [sortField, setSortField] = useState<'createdAt' | 'streak' | 'totalStudyMinutes'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { users: data } = await adminApi.listUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Analytics ──────────────────────────────────────────────────────────────

  const students   = users.filter(u => u.role === 'student')
  const parents    = users.filter(u => u.role === 'parent')

  const byGrade = [9, 10, 11].map(g => ({
    grade: `${g} класс`,
    count: students.filter(u => u.grade === g).length,
  }))
  byGrade.push({ grade: 'Не указан', count: students.filter(u => !u.grade).length })

  const byRole = (Object.keys(ROLE_LABELS) as AdminUser['role'][])
    .map(r => ({ role: ROLE_LABELS[r], count: users.filter(u => u.role === r).length }))
    .filter(r => r.count > 0)

  const topCities       = topN(users.map(u => u.city))
  const topUniversities = topN(students.map(u => u.targetUniversity))
  const topSpecialties  = topN(students.map(u => u.targetSpecialty))
  const maxCity         = Math.max(...topCities.map(c => c.count), 1)
  const maxUni          = Math.max(...topUniversities.map(u => u.count), 1)
  const maxSpec         = Math.max(...topSpecialties.map(s => s.count), 1)

  // ── Filtered/sorted table ──────────────────────────────────────────────────

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase()
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !(u.city ?? '').toLowerCase().includes(q)) return false
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      return true
    })
    .sort((a, b) => {
      const va = a[sortField] ?? ''
      const vb = b[sortField] ?? ''
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortDir === 'desc' ? -cmp : cmp
    })

  const SortBtn = ({ field, label }: { field: typeof sortField; label: string }) => (
    <button
      onClick={() => { if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(field); setSortDir('desc') } }}
      className="flex items-center gap-1 text-xs font-medium text-slate-500 uppercase tracking-wider hover:text-slate-800 transition-colors"
    >
      {label}
      {sortField === field ? (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : null}
    </button>
  )

  // ── Export CSV ─────────────────────────────────────────────────────────────

  const exportCsv = () => {
    const headers = ['Имя', 'Email', 'Роль', 'Класс', 'Город', 'Вуз', 'Специальность', 'Стрик', 'Минут', 'Дата регистрации']
    const rows = filtered.map(u => [
      u.name, u.email, ROLE_LABELS[u.role], u.grade ?? '', u.city ?? '',
      u.targetUniversity ?? '', u.targetSpecialty ?? '',
      u.streak, u.totalStudyMinutes, formatDate(u.createdAt),
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `studyhub-leads-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
      <RefreshCw className="w-5 h-5 animate-spin" />
      Загрузка пользователей из БД...
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <p className="text-red-600 font-medium mb-2">Ошибка загрузки</p>
      <p className="text-sm text-red-400 mb-4">{error}</p>
      <button onClick={load} className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
        Повторить
      </button>
    </div>
  )

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Всего лидов',    value: users.length,    icon: Users,     color: 'bg-blue-500' },
          { label: 'Учеников',       value: students.length, icon: GraduationCap, color: 'bg-indigo-500' },
          { label: 'Родителей',      value: parents.length,  icon: UserCheck, color: 'bg-purple-500' },
          { label: 'Premium',        value: users.filter(u => u.isPremium).length, icon: Crown, color: 'bg-amber-500' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Analytics charts ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* По классу */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-500" /> По классу
          </h4>
          <div className="space-y-3">
            {byGrade.map(({ grade, count }) => (
              <div key={grade} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-20 shrink-0">{grade}</span>
                <MiniBar count={count} max={Math.max(...byGrade.map(b => b.count), 1)} />
              </div>
            ))}
          </div>
        </div>

        {/* По роли */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" /> По роли
          </h4>
          <div className="space-y-3">
            {byRole.map(({ role, count }) => (
              <div key={role} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-20 shrink-0">{role}</span>
                <MiniBar count={count} max={Math.max(...byRole.map(b => b.count), 1)} />
              </div>
            ))}
          </div>
        </div>

        {/* По городу */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" /> По городу (топ-5)
          </h4>
          <div className="space-y-3">
            {topCities.map(({ name, count }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-24 shrink-0 truncate">{name}</span>
                <MiniBar count={count} max={maxCity} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Целевые вузы */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" /> Целевые вузы (топ-5)
          </h4>
          {topUniversities.length === 0 ? (
            <p className="text-slate-400 text-sm">Пока никто не указал вуз</p>
          ) : (
            <div className="space-y-3">
              {topUniversities.map(({ name, count }, i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                  )}>{i + 1}</span>
                  <span className="text-sm text-slate-700 flex-1 truncate">{name}</span>
                  <MiniBar count={count} max={maxUni} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Целевые специальности */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-rose-500" /> Специальности (топ-5)
          </h4>
          {topSpecialties.length === 0 ? (
            <p className="text-slate-400 text-sm">Пока никто не указал специальность</p>
          ) : (
            <div className="space-y-3">
              {topSpecialties.map(({ name, count }, i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    i === 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                  )}>{i + 1}</span>
                  <span className="text-sm text-slate-700 flex-1 truncate">{name}</span>
                  <MiniBar count={count} max={maxSpec} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── User table ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <h3 className="font-semibold text-slate-800 mr-auto">Все пользователи ({filtered.length})</h3>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по имени, email, городу..."
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          {/* Role filter */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as AdminUser['role'] | 'all')}
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 appearance-none"
            >
              <option value="all">Все роли</option>
              {(Object.keys(ROLE_LABELS) as AdminUser['role'][]).map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <button onClick={load} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors" title="Обновить">
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-5 py-3 text-left"><span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Пользователь</span></th>
                <th className="px-5 py-3 text-left"><span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Роль / Класс</span></th>
                <th className="px-5 py-3 text-left"><span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Город</span></th>
                <th className="px-5 py-3 text-left"><span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Вуз / Специальность</span></th>
                <th className="px-5 py-3 text-left"><SortBtn field="streak" label="Стрик" /></th>
                <th className="px-5 py-3 text-left"><SortBtn field="totalStudyMinutes" label="Время" /></th>
                <th className="px-5 py-3 text-left"><SortBtn field="createdAt" label="Дата" /></th>
                <th className="px-5 py-3 text-left"><span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Связь</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">Нет пользователей по фильтру</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  {/* Пользователь */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate max-w-[140px]">{u.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[140px]">{u.email}</p>
                      </div>
                      {u.isPremium && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    </div>
                  </td>

                  {/* Роль / Класс */}
                  <td className="px-5 py-3">
                    <span className={cn('text-xs px-2 py-1 rounded-full font-medium', ROLE_COLORS[u.role])}>
                      {ROLE_LABELS[u.role]}
                    </span>
                    {u.grade && <span className="ml-1.5 text-xs text-slate-400">{u.grade} кл.</span>}
                  </td>

                  {/* Город */}
                  <td className="px-5 py-3 text-sm text-slate-600">{u.city ?? <span className="text-slate-300">—</span>}</td>

                  {/* Вуз / Специальность */}
                  <td className="px-5 py-3 max-w-[180px]">
                    {u.targetUniversity ? (
                      <p className="text-xs font-medium text-slate-700 truncate">{u.targetUniversity}</p>
                    ) : null}
                    {u.targetSpecialty ? (
                      <p className="text-xs text-slate-400 truncate">{u.targetSpecialty}</p>
                    ) : null}
                    {!u.targetUniversity && !u.targetSpecialty && <span className="text-slate-300 text-xs">—</span>}
                  </td>

                  {/* Стрик */}
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-sm">
                      {u.streak > 0 ? <span className="text-orange-500">🔥</span> : null}
                      <span className={u.streak > 0 ? 'font-medium text-slate-800' : 'text-slate-300'}>{u.streak}д</span>
                    </span>
                  </td>

                  {/* Время */}
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {formatMinutes(u.totalStudyMinutes)}
                    </span>
                  </td>

                  {/* Дата */}
                  <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDate(u.createdAt)}</td>

                  {/* Связь */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {/* WhatsApp — только если знаем что-то о пользователе */}
                      <a
                        href={buildWhatsAppMessage(u)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                        title="Написать в WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WA
                      </a>
                      <a
                        href={`mailto:${u.email}`}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg transition-colors"
                        title="Email"
                      >
                        @
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

// ── Course Manager (wrapper around CourseBuilder) ─────────────────────────────

function CourseManager() {
  const [courses, setCourses] = useState<CourseData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCourse, setEditingCourse] = useState<CourseData | null | 'new'>()
  const [isSaving, setIsSaving] = useState(false)

  const authHeader = () => ({ Authorization: `Bearer ${getToken() ?? ''}` })

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/courses', { headers: authHeader() })
      const data = await res.json()
      setCourses((data.courses ?? []) as CourseData[])
    } catch { /* offline */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCourses() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (course: CourseData) => {
    setIsSaving(true)
    try {
      const isNew = !course.id
      const url    = isNew ? '/api/courses' : `/api/courses/${course.id}`
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(course),
      })
      const data = await res.json()
      if (data.course) {
        if (isNew) setEditingCourse(data.course as CourseData)
        await fetchCourses()
      }
    } catch { /* offline */ }
    finally { setIsSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить курс? Это действие необратимо.')) return
    await fetch(`/api/courses/${id}`, { method: 'DELETE', headers: authHeader() })
    await fetchCourses()
  }

  // Builder view
  if (editingCourse) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50">
        <CourseBuilderComponent
          initialCourse={editingCourse === 'new' ? undefined : editingCourse}
          onSave={handleSave}
          onBack={() => { setEditingCourse(undefined); fetchCourses() }}
          isSaving={isSaving}
        />
      </div>
    )
  }

  // Course list view
  const SUBJECT_LABELS: Record<string, string> = {
    ielts: 'IELTS', ent: 'ЕНТ', math: 'Математика',
    physics: 'Физика', history: 'История', english: 'Английский',
  }
  const LEVEL_LABELS: Record<string, string> = {
    beginner: 'Начальный', intermediate: 'Средний', advanced: 'Продвинутый',
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Курсы</h3>
          <p className="text-sm text-slate-500">{courses.length} курсов создано</p>
        </div>
        <button
          type="button"
          onClick={() => setEditingCourse('new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Создать курс
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium mb-1">Курсов пока нет</p>
          <p className="text-slate-400 text-sm mb-4">Создай первый курс и начни обучать студентов</p>
          <button type="button" onClick={() => setEditingCourse('new')}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
            + Создать первый курс
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map(course => {
            const totalLessons = (course.modules ?? []).reduce(
              (s, m) => s + (m.lessons?.length ?? 0), 0
            )
            return (
              <div key={course.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Cover */}
                <div className="h-2 w-full" style={{ backgroundColor: course.coverColor ?? '#2563eb' }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{course.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {SUBJECT_LABELS[course.subject] ?? course.subject} · {LEVEL_LABELS[course.level] ?? course.level}
                      </p>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium shrink-0',
                      course.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}>
                      {course.isPublished ? 'Опубл.' : 'Черновик'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{course.description || 'Без описания'}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                    <span>{course.modules?.length ?? 0} модулей</span>
                    <span>·</span>
                    <span>{totalLessons} уроков</span>
                    <span>·</span>
                    <span>{course.price === 0 ? 'Бесплатно' : `${course.price.toLocaleString('ru-RU')} ₸`}</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEditingCourse(course)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold hover:bg-primary-100 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" /> Редактировать
                    </button>
                    <button type="button" onClick={() => handleDelete(course.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

const EMPTY_STATS: AdminStats = {
  totalUsers: 0, premiumUsers: 0, activeToday: 0,
  totalEntResults: 0, totalStudyPlans: 0,
  usersByRole: [], usersByGrade: [], usersByCity: [],
  topUniversities: [], topSpecialties: [], registrationsByDay: [],
}

export default function Admin() {
  const navigate = useNavigate()
  const { user, logout } = useStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'revenue' | 'content' | 'courses' | 'billing'>('overview')
  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats()
      .then(data => setStats({ ...EMPTY_STATS, ...data }))
      .catch(() => {/* server may be offline, show zeros */})
      .finally(() => setStatsLoading(false))
  }, [])

  if (!user || user.role !== 'admin') {
    navigate('/auth')
    return null
  }

  const total    = stats.totalUsers    ?? 0
  const active   = stats.activeToday   ?? 0
  const premium  = stats.premiumUsers  ?? 0
  const entTests = stats.totalEntResults ?? 0
  const plans    = stats.totalStudyPlans ?? 0

  const statCards = [
    { title: 'Всего пользователей', value: statsLoading ? '—' : total.toLocaleString('ru-RU'),   icon: Users,      color: 'bg-blue-500' },
    { title: 'Активных сегодня',    value: statsLoading ? '—' : active.toLocaleString('ru-RU'),  icon: Activity,   color: 'bg-green-500' },
    { title: 'Премиум подписки',    value: statsLoading ? '—' : premium.toLocaleString('ru-RU'), icon: Crown,      color: 'bg-purple-500' },
    { title: 'Доход',               value: '0 ₸',                                                icon: DollarSign, color: 'bg-amber-500' },
  ]

  const secondaryStats = [
    { title: 'ЕНТ тестов пройдено', value: statsLoading ? '—' : entTests.toLocaleString('ru-RU'), icon: ClipboardCheck },
    { title: 'Планов создано',       value: statsLoading ? '—' : plans.toLocaleString('ru-RU'),   icon: BookOpen },
    { title: 'Конверсия в Premium',  value: total > 0 ? `${((premium / total) * 100).toFixed(1)}%` : '0%', icon: TrendingUp },
    { title: 'Подписчиков Premium',  value: statsLoading ? '—' : premium.toLocaleString('ru-RU'), icon: GraduationCap },
  ]

  const tabs = [
    { id: 'overview' as const, label: 'Обзор' },
    { id: 'users' as const, label: 'Лиды / Пользователи' },
    { id: 'revenue' as const, label: 'Доходы' },
    { id: 'content' as const, label: 'Контент' },
    { id: 'courses' as const, label: 'Курсы' },
    { id: 'billing' as const, label: '💳 Биллинг' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-800">Study Hub</span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">ADMIN</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('users')}
                className="relative hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-500 transition-colors"
                title="Перейти к поиску пользователей"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Поиск пользователей</span>
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors" title="Уведомлений нет">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">Администратор</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Выйти"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            {/* Main Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white', card.color)}>
                      <card.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{card.title}</p>
                </motion.div>
              ))}
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {secondaryStats.map(stat => (
                <div key={stat.title} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Registrations Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-slate-800">Регистрации</h3>
                    <p className="text-sm text-slate-500">За последние 7 дней</p>
                  </div>
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.registrationsByDay.length ? stats.registrationsByDay : []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Users by role chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-slate-800">По ролям</h3>
                    <p className="text-sm text-slate-500">Распределение пользователей</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                </div>
                {stats.usersByRole.length === 0 ? (
                  <div className="flex items-center justify-center h-[240px] text-slate-400 text-sm">Нет данных</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={stats.usersByRole}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="role" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Users by City */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800">По городам</h3>
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                {stats.usersByCity.length === 0 ? (
                  <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">Нет данных</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={stats.usersByCity} dataKey="count" nameKey="city" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                          {stats.usersByCity.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} пользователей`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {stats.usersByCity.map((item, i) => (
                        <div key={item.city} className="flex items-center gap-2 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-slate-600 truncate">{item.city}</span>
                          <span className="text-slate-400 ml-auto">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Top Universities */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800">Целевые вузы</h3>
                  <GraduationCap className="w-5 h-5 text-slate-400" />
                </div>
                {stats.topUniversities.length === 0 ? (
                  <p className="text-slate-400 text-sm">Пока никто не указал вуз</p>
                ) : (
                  <div className="space-y-4">
                    {stats.topUniversities.map((uni, i) => (
                      <div key={uni.name} className="flex items-center gap-3">
                        <span className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                          i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                        )}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{uni.name}</p>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                            <div className="bg-primary-500 h-1.5 rounded-full"
                              style={{ width: `${(uni.count / stats.topUniversities[0].count) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-sm text-slate-500 tabular-nums">{uni.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800">Быстрые действия</h3>
                  <Settings className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Добавить вопросы ЕНТ', desc: 'Перейти в управление контентом', color: 'bg-blue-100', onClick: () => setActiveTab('content') },
                    { label: 'Добавить словарь / Q&A', desc: 'Перейти в управление контентом', color: 'bg-purple-100', onClick: () => setActiveTab('content') },
                    { label: 'Экспорт пользователей', desc: 'CSV-выгрузка всех лидов', color: 'bg-amber-100', onClick: () => setActiveTab('users') },
                    { label: 'Статистика доходов', desc: 'Конверсия и Premium-динамика', color: 'bg-green-100', onClick: () => setActiveTab('revenue') },
                    { label: 'Рассылка / Push', desc: 'Скоро — не реализовано', color: 'bg-slate-100', onClick: undefined },
                  ].map(action => (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      disabled={!action.onClick}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left',
                        action.onClick ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-40 cursor-not-allowed',
                      )}
                    >
                      <div className={cn('w-2 h-2 rounded-full', action.color)} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{action.label}</p>
                        <p className="text-xs text-slate-400">{action.desc}</p>
                      </div>
                      {action.onClick && <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && <ErrorBoundary><LeadsPanel /></ErrorBoundary>}

        {activeTab === 'revenue' && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">Общий доход</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">0 ₸</p>
                <p className="text-sm text-slate-400 mt-1">Оплаты ещё не подключены</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">Подписчиков Premium</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.premiumUsers.toLocaleString('ru-RU')}</p>
                <p className="text-sm text-slate-500 mt-1">из {stats.totalUsers} пользователей</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">Конверсия Free → Premium</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {stats.totalUsers > 0 ? `${((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}%` : '0%'}
                </p>
                <p className="text-sm text-slate-400 mt-1">Реальные данные из БД</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-2">Динамика регистраций</h3>
              <p className="text-sm text-slate-400 mb-6">За последние 7 дней</p>
              {stats.registrationsByDay.length === 0 ? (
                <div className="flex items-center justify-center h-[350px] text-slate-400 text-sm">
                  Нет данных за последние 7 дней
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.registrationsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip formatter={(value) => [`${value} регистраций`, '']} />
                    <Bar dataKey="count" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'content' && (
          <ContentManager />
        )}

        {activeTab === 'courses' && (
          <CourseManager />
        )}

        {activeTab === 'billing' && (
          <ErrorBoundary><BillingPanel /></ErrorBoundary>
        )}
      </div>
    </div>
  )
}
