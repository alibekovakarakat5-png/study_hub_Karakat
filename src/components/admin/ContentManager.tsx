import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  BookOpen,
  Plus,
  Trash2,
  Globe,
  Youtube,
  Smartphone,
  BookMarked,
  Bot,
  Languages,
  Calendar,
  Target,
  Award,
  Wand2,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import type { CustomMaterial, CustomQA, CustomVocabWord } from '@/store/useContentStore'
import type { AdmissionEntry } from '@/data/admissionsData'
import type { Program, UniversityProfile } from '@/data/admissionPlanData'
import { VOCAB_TOPICS } from '@/data/ieltsContent'
import type { AbroadUniversity } from '@/data/universityAdvisor'
import type { Scholarship } from '@/data/scholarships'
import { cn } from '@/lib/utils'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
} satisfies import('framer-motion').Variants

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

export default function ContentManager() {
  const {
    materials, addMaterial, deleteMaterial,
    qas, addQA, deleteQA,
    vocabWords, addVocabWord, deleteVocabWord,
    universities, addUniversity, deleteUniversity,
    scholarships, addScholarship, deleteScholarship,
    admissionEntries, addAdmissionEntry, deleteAdmissionEntry,
    programs, addProgram, deleteProgram,
    universityProfiles, addUniversityProfile, deleteUniversityProfile,
    syncFromServer,
  } = useContentStore()
  const [section, setSection] = useState<'materials' | 'qa' | 'vocab' | 'universities' | 'scholarships' | 'admissions' | 'programs' | 'uniProfiles'>('materials')

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

  // ── Admission entry form state ─────────────────────────────────────────
  const [admForm, setAdmForm] = useState({
    name: '', shortName: '', category: 'kz_university' as AdmissionEntry['category'],
    country: '', city: '', logo: '🎓', description: '', url: '',
    fundingType: 'grant' as AdmissionEntry['fundingType'], fundingNote: '',
    requirements: '', tags: '', deadlines: '',
    verifiedAt: new Date().toISOString().slice(0, 10), sourceUrl: '',
  })

  // ── Program form state ─────────────────────────────────────────────────
  const [progForm, setProgForm] = useState({
    name: '', field: 'it' as string, requiredSubjects: '', bonusSubjects: '',
  })

  // ── University profile form state ──────────────────────────────────────
  const [upForm, setUpForm] = useState({
    name: '', shortName: '', city: '', ranking: 1, logo: '🎓',
    tier: 2 as 1 | 2 | 3, url: '', strengths: '',
  })

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100'
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

  const sections = [
    { id: 'materials'    as const, label: 'Материалы IELTS', icon: Globe,      count: materials.length },
    { id: 'qa'           as const, label: 'Q&A Ментора',     icon: Bot,        count: qas.length },
    { id: 'vocab'        as const, label: 'Словарь',         icon: Languages,  count: vocabWords.length },
    { id: 'universities' as const, label: 'Университеты',    icon: GraduationCap, count: universities.length },
    { id: 'scholarships' as const, label: 'Стипендии',       icon: Award,      count: scholarships.length },
    { id: 'admissions'   as const, label: 'Поступление',     icon: Calendar,   count: admissionEntries.length },
    { id: 'programs'     as const, label: 'Специальности',   icon: BookOpen,   count: programs.length },
    { id: 'uniProfiles'  as const, label: 'Профили вузов',   icon: Target,     count: universityProfiles.length },
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

      {/* ── Admission Entries ──────────────────────────────────────────────── */}
      {section === 'admissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary-600" /> Добавить запись</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Название *</label>
                  <input className={inputCls} value={admForm.name} onChange={e => setAdmForm(f => ({ ...f, name: e.target.value }))} placeholder="Назарбаев Университет" />
                </div>
                <div>
                  <label className={labelCls}>Короткое имя</label>
                  <input className={inputCls} value={admForm.shortName} onChange={e => setAdmForm(f => ({ ...f, shortName: e.target.value }))} placeholder="NU" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Категория</label>
                  <select className={inputCls} value={admForm.category} onChange={e => setAdmForm(f => ({ ...f, category: e.target.value as AdmissionEntry['category'] }))}>
                    <option value="kz_university">Вузы KZ</option>
                    <option value="international">Зарубежные</option>
                    <option value="scholarship">Стипендии</option>
                    <option value="internship">Стажировки</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Страна *</label>
                  <input className={inputCls} value={admForm.country} onChange={e => setAdmForm(f => ({ ...f, country: e.target.value }))} placeholder="Казахстан" />
                </div>
                <div>
                  <label className={labelCls}>Город</label>
                  <input className={inputCls} value={admForm.city} onChange={e => setAdmForm(f => ({ ...f, city: e.target.value }))} placeholder="Астана" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Лого (эмодзи)</label>
                  <input className={inputCls} value={admForm.logo} onChange={e => setAdmForm(f => ({ ...f, logo: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Финансирование</label>
                  <select className={inputCls} value={admForm.fundingType} onChange={e => setAdmForm(f => ({ ...f, fundingType: e.target.value as AdmissionEntry['fundingType'] }))}>
                    <option value="free">Бесплатно</option>
                    <option value="grant">Грант</option>
                    <option value="paid">Платно</option>
                    <option value="partial">Частичное</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Проверено</label>
                  <input className={inputCls} type="date" value={admForm.verifiedAt} onChange={e => setAdmForm(f => ({ ...f, verifiedAt: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Описание *</label>
                <textarea className={cn(inputCls, 'h-16 resize-none')} value={admForm.description} onChange={e => setAdmForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Сайт (URL)</label>
                  <input className={inputCls} value={admForm.url} onChange={e => setAdmForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <label className={labelCls}>Источник (для проверки)</label>
                  <input className={inputCls} value={admForm.sourceUrl} onChange={e => setAdmForm(f => ({ ...f, sourceUrl: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className={labelCls}>Примечание к финансированию</label>
                <input className={inputCls} value={admForm.fundingNote} onChange={e => setAdmForm(f => ({ ...f, fundingNote: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Требования (каждое с новой строки)</label>
                <textarea className={cn(inputCls, 'h-20 resize-none')} value={admForm.requirements} onChange={e => setAdmForm(f => ({ ...f, requirements: e.target.value }))} placeholder="ЕНТ от 100&#10;IELTS 6.0+&#10;Мотивационное письмо" />
              </div>
              <div>
                <label className={labelCls}>Теги (через запятую)</label>
                <input className={inputCls} value={admForm.tags} onChange={e => setAdmForm(f => ({ ...f, tags: e.target.value }))} placeholder="грант, английский, астана" />
              </div>
              <div>
                <label className={labelCls}>Дедлайны (формат: YYYY-MM-DD | Название | тип, каждый с новой строки)</label>
                <textarea className={cn(inputCls, 'h-20 resize-none')} value={admForm.deadlines} onChange={e => setAdmForm(f => ({ ...f, deadlines: e.target.value }))} placeholder="2026-04-01 | Дедлайн подачи | application&#10;2026-05-15 | Результаты | results" />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!admForm.name.trim() || !admForm.country.trim()) return
                  const entry: AdmissionEntry = {
                    id: `adm_${Date.now()}`,
                    name: admForm.name,
                    shortName: admForm.shortName || undefined,
                    category: admForm.category,
                    country: admForm.country,
                    city: admForm.city || undefined,
                    logo: admForm.logo || undefined,
                    description: admForm.description,
                    url: admForm.url,
                    fundingType: admForm.fundingType,
                    fundingNote: admForm.fundingNote || undefined,
                    requirements: admForm.requirements.split('\n').map(s => s.trim()).filter(Boolean),
                    tags: admForm.tags.split(',').map(s => s.trim()).filter(Boolean),
                    deadlines: admForm.deadlines.split('\n').map(line => {
                      const [date, label, type] = line.split('|').map(s => s.trim())
                      if (!date || !label) return null
                      return { date, label, type: (type || 'application') as 'application' | 'documents' | 'exam' | 'results' | 'scholarship' }
                    }).filter(Boolean) as AdmissionEntry['deadlines'],
                    verifiedAt: admForm.verifiedAt,
                    sourceUrl: admForm.sourceUrl,
                  }
                  addAdmissionEntry(entry)
                  setAdmForm({ name: '', shortName: '', category: 'kz_university', country: '', city: '', logo: '🎓', description: '', url: '', fundingType: 'grant', fundingNote: '', requirements: '', tags: '', deadlines: '', verifiedAt: new Date().toISOString().slice(0, 10), sourceUrl: '' })
                }}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                Добавить запись
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Записи поступления ({admissionEntries.length})</h3>
            {admissionEntries.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Пока ничего. Запустите seed или добавьте вручную.</p>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {admissionEntries.map(e => (
                  <div key={e.id} className="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:border-slate-200">
                    <span className="text-xl shrink-0">{e.logo ?? '📋'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{e.name}</p>
                      <p className="text-xs text-slate-400">{e.country}{e.city ? ` · ${e.city}` : ''} · {e.category}</p>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        {e.tags?.slice(0, 3).map(t => (
                          <span key={t} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={() => deleteAdmissionEntry(e.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Programs ───────────────────────────────────────────────────────── */}
      {section === 'programs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary-600" /> Добавить специальность</h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Название *</label>
                <input className={inputCls} value={progForm.name} onChange={e => setProgForm(f => ({ ...f, name: e.target.value }))} placeholder="Информатика / CS" />
              </div>
              <div>
                <label className={labelCls}>Направление</label>
                <select className={inputCls} value={progForm.field} onChange={e => setProgForm(f => ({ ...f, field: e.target.value }))}>
                  <option value="it">IT / Программирование</option>
                  <option value="engineering">Инженерия</option>
                  <option value="medicine">Медицина</option>
                  <option value="business">Бизнес / Экономика</option>
                  <option value="law">Право</option>
                  <option value="social">Социальные науки</option>
                  <option value="natural_science">Естественные науки</option>
                  <option value="humanities">Гуманитарные науки</option>
                  <option value="education">Педагогика</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Обязательные предметы (через запятую)</label>
                <input className={inputCls} value={progForm.requiredSubjects} onChange={e => setProgForm(f => ({ ...f, requiredSubjects: e.target.value }))} placeholder="math, informatics" />
                <p className="text-xs text-slate-400 mt-0.5">Допустимые: math, physics, chemistry, biology, history, english, kazakh, russian, informatics, geography, literature</p>
              </div>
              <div>
                <label className={labelCls}>Бонусные предметы (через запятую)</label>
                <input className={inputCls} value={progForm.bonusSubjects} onChange={e => setProgForm(f => ({ ...f, bonusSubjects: e.target.value }))} placeholder="physics" />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!progForm.name.trim()) return
                  const prog: Program = {
                    id: `prog_${Date.now()}`,
                    name: progForm.name,
                    field: progForm.field as Program['field'],
                    requiredSubjects: progForm.requiredSubjects.split(',').map(s => s.trim()).filter(Boolean) as Program['requiredSubjects'],
                    bonusSubjects: progForm.bonusSubjects.split(',').map(s => s.trim()).filter(Boolean) as Program['bonusSubjects'],
                  }
                  addProgram(prog)
                  setProgForm({ name: '', field: 'it', requiredSubjects: '', bonusSubjects: '' })
                }}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                Добавить специальность
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Специальности ({programs.length})</h3>
            {programs.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Пока ничего. Запустите seed или добавьте вручную.</p>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {programs.map(p => (
                  <div key={p.id} className="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:border-slate-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.field} · предметы: {[...p.requiredSubjects, ...p.bonusSubjects].join(', ')}</p>
                    </div>
                    <button type="button" onClick={() => deleteProgram(p.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── University Profiles ─────────────────────────────────────────────── */}
      {section === 'uniProfiles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary-600" /> Добавить профиль вуза</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Название *</label>
                  <input className={inputCls} value={upForm.name} onChange={e => setUpForm(f => ({ ...f, name: e.target.value }))} placeholder="КазНУ им. аль-Фараби" />
                </div>
                <div>
                  <label className={labelCls}>Короткое имя *</label>
                  <input className={inputCls} value={upForm.shortName} onChange={e => setUpForm(f => ({ ...f, shortName: e.target.value }))} placeholder="КазНУ" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Город</label>
                  <input className={inputCls} value={upForm.city} onChange={e => setUpForm(f => ({ ...f, city: e.target.value }))} placeholder="Алматы" />
                </div>
                <div>
                  <label className={labelCls}>Рейтинг (№)</label>
                  <input className={inputCls} type="number" min={1} value={upForm.ranking} onChange={e => setUpForm(f => ({ ...f, ranking: +e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Уровень</label>
                  <select className={inputCls} value={upForm.tier} onChange={e => setUpForm(f => ({ ...f, tier: +e.target.value as 1 | 2 | 3 }))}>
                    <option value={1}>Элитный (1)</option>
                    <option value={2}>Сильный (2)</option>
                    <option value={3}>Доступный (3)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Лого (эмодзи)</label>
                  <input className={inputCls} value={upForm.logo} onChange={e => setUpForm(f => ({ ...f, logo: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Сайт</label>
                  <input className={inputCls} value={upForm.url} onChange={e => setUpForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className={labelCls}>Сильные направления (через запятую)</label>
                <input className={inputCls} value={upForm.strengths} onChange={e => setUpForm(f => ({ ...f, strengths: e.target.value }))} placeholder="it, engineering, medicine" />
                <p className="text-xs text-slate-400 mt-0.5">Допустимые: it, engineering, medicine, business, law, social, natural_science, humanities, education</p>
              </div>
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">Требования (minEnt, grantEnt и т.д.) пока настраиваются в БД вручную. В будущем добавим расширенный редактор.</p>
              <button
                type="button"
                onClick={() => {
                  if (!upForm.name.trim() || !upForm.shortName.trim()) return
                  const profile: UniversityProfile = {
                    id: `uni_${Date.now()}`,
                    name: upForm.name,
                    shortName: upForm.shortName,
                    city: upForm.city,
                    ranking: upForm.ranking,
                    logo: upForm.logo,
                    tier: upForm.tier,
                    url: upForm.url,
                    strengths: upForm.strengths.split(',').map(s => s.trim()).filter(Boolean) as UniversityProfile['strengths'],
                    requirements: [],
                  }
                  addUniversityProfile(profile)
                  setUpForm({ name: '', shortName: '', city: '', ranking: 1, logo: '🎓', tier: 2, url: '', strengths: '' })
                }}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                Добавить профиль вуза
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Профили вузов ({universityProfiles.length})</h3>
            {universityProfiles.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Пока ничего. Запустите seed или добавьте вручную.</p>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {universityProfiles.map(u => (
                  <div key={u.id} className="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:border-slate-200">
                    <span className="text-xl shrink-0">{u.logo}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{u.shortName}</p>
                      <p className="text-xs text-slate-400">{u.city} · Тир {u.tier} · #{u.ranking}</p>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        {u.strengths?.slice(0, 4).map(s => (
                          <span key={s} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={() => deleteUniversityProfile(u.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
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
