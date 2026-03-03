import { useState, useEffect } from 'react'
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
  ArrowDownRight,
  Plus,
  Trash2,
  Globe,
  Youtube,
  Smartphone,
  BookMarked,
  Bot,
  Languages,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { PLATFORM_STATS } from '@/store/useStore'
import { useContentStore } from '@/store/useContentStore'
import type { CustomMaterial, CustomQA, CustomVocabWord } from '@/store/useContentStore'
import { VOCAB_TOPICS } from '@/data/ieltsContent'
import { cn } from '@/lib/utils'

const PIE_COLORS = ['#2563eb', '#7c3aed', '#16a34a', '#d97706', '#dc2626', '#6b7280']

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

function ContentManager() {
  const { materials, addMaterial, deleteMaterial, qas, addQA, deleteQA, vocabWords, addVocabWord, deleteVocabWord, syncFromServer } = useContentStore()
  const [section, setSection] = useState<'materials' | 'qa' | 'vocab'>('materials')

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

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100'
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

  const sections = [
    { id: 'materials' as const, label: 'Материалы IELTS', icon: Globe, count: materials.length },
    { id: 'qa' as const, label: 'Q&A Ментора', icon: Bot, count: qas.length },
    { id: 'vocab' as const, label: 'Словарь', icon: Languages, count: vocabWords.length },
  ]

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      {/* Section tabs */}
      <div className="flex gap-3">
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
    </motion.div>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const { user, logout } = useStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'revenue' | 'content'>('overview')

  if (!user || user.role !== 'admin') {
    navigate('/auth')
    return null
  }

  const stats = PLATFORM_STATS

  const statCards = [
    {
      title: 'Всего пользователей',
      value: stats.totalUsers.toLocaleString('ru-RU'),
      change: '+12.5%',
      trend: 'up' as const,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Активных сегодня',
      value: stats.activeToday.toLocaleString('ru-RU'),
      change: '+8.3%',
      trend: 'up' as const,
      icon: Activity,
      color: 'bg-green-500',
    },
    {
      title: 'Премиум подписки',
      value: stats.premiumUsers.toLocaleString('ru-RU'),
      change: '+23.1%',
      trend: 'up' as const,
      icon: Crown,
      color: 'bg-purple-500',
    },
    {
      title: 'Доход',
      value: stats.totalRevenue,
      change: '+31.4%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'bg-amber-500',
    },
  ]

  const secondaryStats = [
    { title: 'Средний балл', value: `${stats.avgScore}%`, icon: GraduationCap },
    { title: 'Тестов пройдено', value: stats.testsCompleted.toLocaleString('ru-RU'), icon: ClipboardCheck },
    { title: 'Планов создано', value: stats.plansCreated.toLocaleString('ru-RU'), icon: BookOpen },
    { title: 'Retention D7', value: `${stats.retentionRate}%`, icon: TrendingUp },
  ]

  // Mock recent users
  const recentUsers = [
    { name: 'Айдана Мухамедова', email: 'aidana@mail.kz', role: 'student', city: 'Алматы', date: '10.02.2026', premium: true },
    { name: 'Арман Касымов', email: 'arman@mail.kz', role: 'student', city: 'Астана', date: '10.02.2026', premium: false },
    { name: 'Дина Сериккызы', email: 'dina@mail.kz', role: 'parent', city: 'Шымкент', date: '09.02.2026', premium: true },
    { name: 'Нурсултан Абаев', email: 'nursultan@mail.kz', role: 'student', city: 'Караганда', date: '09.02.2026', premium: false },
    { name: 'Жанна Ибрагимова', email: 'zhanna@mail.kz', role: 'parent', city: 'Алматы', date: '09.02.2026', premium: true },
    { name: 'Бекзат Оспанов', email: 'bekzat@mail.kz', role: 'student', city: 'Актобе', date: '08.02.2026', premium: false },
    { name: 'Мадина Тулешова', email: 'madina@mail.kz', role: 'student', city: 'Астана', date: '08.02.2026', premium: true },
    { name: 'Ерлан Жуматов', email: 'erlan@mail.kz', role: 'student', city: 'Алматы', date: '08.02.2026', premium: false },
  ]

  const tabs = [
    { id: 'overview' as const, label: 'Обзор' },
    { id: 'users' as const, label: 'Пользователи' },
    { id: 'revenue' as const, label: 'Доходы' },
    { id: 'content' as const, label: 'Контент' },
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
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Поиск пользователей..."
                  className="pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
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
                    <span className={cn(
                      'flex items-center gap-1 text-sm font-medium',
                      card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {card.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {card.change}
                    </span>
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
                  <BarChart data={stats.registrationsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-slate-800">Доход</h3>
                    <p className="text-sm text-slate-500">По месяцам</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={stats.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₸`, 'Доход']} />
                    <Line type="monotone" dataKey="amount" stroke="#7c3aed" strokeWidth={3} dot={{ r: 5, fill: '#7c3aed' }} />
                  </LineChart>
                </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.usersByCity}
                      dataKey="count"
                      nameKey="city"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                    >
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
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-slate-600">{item.city}</span>
                      <span className="text-slate-400 ml-auto">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Universities */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800">Целевые вузы</h3>
                  <GraduationCap className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-4">
                  {stats.topUniversities.map((uni, i) => (
                    <div key={uni.name} className="flex items-center gap-3">
                      <span className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      )}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{uni.name}</p>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-primary-500 h-1.5 rounded-full"
                            style={{ width: `${(uni.applicants / stats.topUniversities[0].applicants) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-slate-500 tabular-nums">{uni.applicants}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800">Быстрые действия</h3>
                  <Settings className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Добавить вопросы ЕНТ', desc: 'Загрузить новый банк вопросов', color: 'bg-blue-100 text-blue-700' },
                    { label: 'Добавить университет', desc: 'Расширить базу вузов', color: 'bg-purple-100 text-purple-700' },
                    { label: 'Рассылка ученикам', desc: 'Push-уведомление', color: 'bg-green-100 text-green-700' },
                    { label: 'Экспорт отчёта', desc: 'Скачать данные в CSV', color: 'bg-amber-100 text-amber-700' },
                    { label: 'Управление тарифами', desc: 'Изменить цены подписки', color: 'bg-red-100 text-red-700' },
                  ].map(action => (
                    <button
                      key={action.label}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className={cn('w-2 h-2 rounded-full', action.color.split(' ')[0])} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{action.label}</p>
                        <p className="text-xs text-slate-400">{action.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Последние регистрации</h3>
                <span className="text-sm text-slate-500">{stats.totalUsers.toLocaleString('ru-RU')} пользователей</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Пользователь</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Роль</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Город</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Дата</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentUsers.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{u.name}</p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'text-xs px-2 py-1 rounded-full font-medium',
                            u.role === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          )}>
                            {u.role === 'student' ? 'Ученик' : 'Родитель'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{u.city}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{u.date}</td>
                        <td className="px-6 py-4">
                          {u.premium ? (
                            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                              <Crown className="w-3 h-3" /> Premium
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Free</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'revenue' && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">Общий доход</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalRevenue}</p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" /> +31.4% к прошлому месяцу
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">Подписчиков Premium</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.premiumUsers.toLocaleString('ru-RU')}</p>
                <p className="text-sm text-slate-500 mt-1">ARPU: 4 990 ₸/мес</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">Конверсия Free → Premium</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">13.3%</p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" /> +2.1% к прошлому месяцу
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-6">Динамика дохода</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M ₸`} />
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₸`, 'Доход']} />
                  <Bar dataKey="amount" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeTab === 'content' && (
          <ContentManager />
        )}
      </div>
    </div>
  )
}
