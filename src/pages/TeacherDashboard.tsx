import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell,
} from 'recharts'
import {
  LogOut, BookOpen, Users, Star, Plus, Trash2, TrendingUp, Award,
  GraduationCap, CheckCircle2, Banknote, BarChart3, Eye, Layers,
  Copy, ClipboardList, FlaskConical, ChevronRight, X, AlertCircle,
  Loader2, Check, Clock, Brain, UserPlus, FileText, LayoutGrid,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import {
  classesApi, assignmentsApi, aiTestApi, coursesApi, smartAssignmentApi, scheduleApi,
  type DBClass, type DBAssignment, type DBSubmission,
  type AITestVariant, type AssignmentStats, type DBCourse,
  type ClassAnalysis, type ClassScheduleItem,
} from '@/lib/api'

// ── Animation variants ────────────────────────────────────────────────────────

const fadeIn = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
} satisfies import('framer-motion').Variants

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
} satisfies import('framer-motion').Variants

// ── Mock analytics data (kept for analytics/earnings tabs) ───────────────────

const enrollmentData = [
  { month: 'Сен', students: 12 }, { month: 'Окт', students: 24 },
  { month: 'Ноя', students: 38 }, { month: 'Дек', students: 51 },
  { month: 'Янв', students: 68 }, { month: 'Фев', students: 89 },
]
const monthlyEarnings = [
  { month: 'Сен', earnings: 42000 }, { month: 'Окт', earnings: 68000 },
  { month: 'Ноя', earnings: 95000 }, { month: 'Дек', earnings: 124000 },
  { month: 'Янв', earnings: 158000 }, { month: 'Фев', earnings: 189000 },
]
const ratingDistribution = [
  { stars: '5★', count: 65, fill: '#16a34a' }, { stars: '4★', count: 20, fill: '#22c55e' },
  { stars: '3★', count: 10, fill: '#facc15' }, { stars: '2★', count: 3,  fill: '#f97316' },
  { stars: '1★', count: 2,  fill: '#ef4444' },
]

// ── Tab types ─────────────────────────────────────────────────────────────────

type TabId = 'classes' | 'test-builder' | 'smart-hw' | 'assignments' | 'schedule' | 'progress' | 'courses' | 'analytics' | 'earnings'

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'classes',      label: 'Мои классы',       icon: LayoutGrid   },
  { id: 'test-builder', label: 'Конструктор тестов', icon: Brain       },
  { id: 'smart-hw',     label: 'Умное ДЗ',          icon: FlaskConical },
  { id: 'assignments',  label: 'Задания',           icon: ClipboardList },
  { id: 'schedule',     label: 'Расписание',        icon: Clock        },
  { id: 'progress',     label: 'Прогресс',          icon: TrendingUp   },
  { id: 'courses',      label: 'Курсы',             icon: BookOpen     },
  { id: 'analytics',    label: 'Аналитика',         icon: BarChart3    },
  { id: 'earnings',     label: 'Доход',             icon: Banknote     },
]

const SUBJECTS: { value: string; label: string }[] = [
  { value: 'math',        label: 'Математика' },
  { value: 'physics',     label: 'Физика' },
  { value: 'chemistry',   label: 'Химия' },
  { value: 'history',     label: 'История КЗ' },
  { value: 'english',     label: 'Английский' },
  { value: 'biology',     label: 'Биология' },
  { value: 'geography',   label: 'География' },
  { value: 'informatics', label: 'Информатика' },
  { value: 'kazakh',      label: 'Казахский' },
  { value: 'russian',     label: 'Русский' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function subjectLabel(s: string) {
  return SUBJECTS.find(x => x.value === s)?.label ?? s
}
function typeColor(type: string) {
  if (type === 'test')     return 'bg-orange-100 text-orange-700'
  if (type === 'reading')  return 'bg-green-100 text-green-700'
  return 'bg-blue-100 text-blue-700'
}
function typeLabel(type: string) {
  if (type === 'test')    return 'Тест'
  if (type === 'reading') return 'Чтение'
  return 'Д/З'
}
function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
function isDueSoon(d: string | null) {
  if (!d) return false
  return new Date(d).getTime() - Date.now() < 24 * 60 * 60 * 1000
}

function ChartTooltip({ active, payload, label, suffix }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string; suffix: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="text-gray-500 text-xs mb-0.5">{label}</p>
      <p className="font-semibold text-gray-900">{payload[0].value.toLocaleString('ru-RU')} {suffix}</p>
    </div>
  )
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
  if (!open) return null
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Classes Tab ───────────────────────────────────────────────────────────────

function ClassesTab({ userId }: { userId: string }) {
  const [classes, setClasses]           = useState<DBClass[]>([])
  const [loading, setLoading]           = useState(true)
  const [showCreate, setShowCreate]     = useState(false)
  const [selectedClass, setSelected]    = useState<DBClass | null>(null)
  const [createForm, setCreateForm]     = useState({ name: '', subject: 'math', description: '' })
  const [creating, setCreating]         = useState(false)
  const [copied, setCopied]             = useState(false)
  const [error, setError]               = useState('')

  const load = useCallback(async () => {
    try {
      const data = await classesApi.list()
      setClasses(data.classes)
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  async function handleCreate() {
    if (!createForm.name.trim()) { setError('Введите название класса'); return }
    setCreating(true); setError('')
    try {
      const res = await classesApi.create(createForm)
      setClasses(prev => [res.class, ...prev])
      setShowCreate(false)
      setCreateForm({ name: '', subject: 'math', description: '' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    }
    setCreating(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить класс? Все задания и участники будут удалены.')) return
    try {
      await classesApi.delete(id)
      setClasses(prev => prev.filter(c => c.id !== id))
      if (selectedClass?.id === id) setSelected(null)
    } catch { /* ignore */ }
  }

  async function handleRemoveMember(classId: string, studentId: string) {
    try {
      await classesApi.removeMember(classId, studentId)
      setSelected(prev => prev ? {
        ...prev,
        members: prev.members?.filter(m => m.student.id !== studentId) ?? []
      } : null)
    } catch { /* ignore */ }
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Load full class detail when selected
  async function selectClass(cls: DBClass) {
    try {
      const res = await classesApi.get(cls.id)
      setSelected(res.class)
    } catch {
      setSelected(cls)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Мои классы</h2>
          <p className="text-sm text-gray-500 mt-0.5">{classes.length} {classes.length === 1 ? 'класс' : 'классов'}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Создать класс
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Нет классов</p>
          <p className="text-sm text-gray-400 mt-1">Создайте первый класс и пригласите учеников</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Создать класс
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => (
            <motion.div key={cls.id} variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer p-5"
              onClick={() => void selectClass(cls)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{cls.name}</h3>
                  <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {subjectLabel(cls.subject)}
                  </span>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); void handleDelete(cls.id) }}
                  className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{cls._count?.members ?? 0} учеников</span>
                <span className="flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5" />{cls._count?.assignments ?? 0} заданий</span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                <span className="font-mono text-sm font-bold text-slate-700 tracking-widest">{cls.inviteCode}</span>
                <button
                  onClick={e => { e.stopPropagation(); void copyCode(cls.inviteCode) }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Скопировано' : 'Копировать'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create class modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); setError('') }} title="Создать класс">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название класса</label>
            <input
              value={createForm.name}
              onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Например: 11А Математика"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Предмет</label>
            <select
              value={createForm.subject}
              onChange={e => setCreateForm(p => ({ ...p, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание (необязательно)</label>
            <textarea
              value={createForm.description}
              onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Класс для подготовки к ЕНТ..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</p>}
          <button
            onClick={() => void handleCreate()}
            disabled={creating}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {creating ? 'Создаю...' : 'Создать класс'}
          </button>
        </div>
      </Modal>

      {/* Class detail modal */}
      <Modal open={!!selectedClass} onClose={() => setSelected(null)} title={selectedClass?.name ?? ''}>
        {selectedClass && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Код приглашения</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-slate-800 tracking-[0.2em]">
                  {selectedClass.inviteCode}
                </span>
                <button
                  onClick={() => void copyCode(selectedClass.inviteCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Скопировано!' : 'Копировать'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Отправьте этот код ученикам — они вводят его при входе</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Ученики ({selectedClass.members?.length ?? 0})
              </h4>
              {!selectedClass.members?.length ? (
                <p className="text-sm text-gray-400 text-center py-4">Пока нет учеников. Поделитесь кодом!</p>
              ) : (
                <div className="space-y-2">
                  {selectedClass.members?.map(m => (
                    <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {m.student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{m.student.name}</p>
                          <p className="text-xs text-gray-400">{m.student.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => void handleRemoveMember(selectedClass.id, m.student.id)}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedClass.assignments && selectedClass.assignments.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-orange-500" />
                  Задания ({selectedClass.assignments.length})
                </h4>
                <div className="space-y-2">
                  {selectedClass.assignments?.map(a => (
                    <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50">
                      <div>
                        <span className={cn('text-xs px-1.5 py-0.5 rounded mr-2 font-medium', typeColor(a.type))}>
                          {typeLabel(a.type)}
                        </span>
                        <span className="text-sm text-gray-700">{a.title}</span>
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(a.dueDate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

// ── Test Builder Tab ──────────────────────────────────────────────────────────

function TestBuilderTab() {
  const [stage, setStage]                   = useState<1 | 2 | 3>(1)
  const [form, setForm]                     = useState({
    topic: '', subject: 'math', difficulty: 'medium' as 'easy' | 'medium' | 'hard', questionCount: 10,
  })
  const [variants, setVariants]             = useState<AITestVariant[]>([])
  const [selected, setSelected]             = useState<AITestVariant | null>(null)
  const [generating, setGenerating]         = useState(false)
  const [genError, setGenError]             = useState('')
  const [classes, setClasses]               = useState<DBClass[]>([])
  const [assignForm, setAssignForm]         = useState({ classId: '', title: '', dueDate: '' })
  const [assigning, setAssigning]           = useState(false)
  const [assignDone, setAssignDone]         = useState(false)

  useEffect(() => {
    classesApi.list().then(r => setClasses(r.classes)).catch(() => {})
  }, [])

  async function handleGenerate() {
    if (!form.topic.trim()) { setGenError('Введите тему теста'); return }
    setGenerating(true); setGenError('')
    try {
      const res = await aiTestApi.generate(form)
      setVariants(res.variants)
      setStage(2)
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Ошибка генерации')
    }
    setGenerating(false)
  }

  function handleSelectVariant(v: AITestVariant) {
    setSelected(v)
    setAssignForm(p => ({ ...p, title: `${form.topic} — Вариант ${v.variantIndex}` }))
    setStage(3)
  }

  async function handleAssign() {
    if (!assignForm.classId || !selected) return
    setAssigning(true)
    try {
      await assignmentsApi.create({
        classId:     assignForm.classId,
        title:       assignForm.title || `${form.topic} — Вариант ${selected.variantIndex}`,
        type:        'test',
        content:     { questions: selected.questions },
        dueDate:     assignForm.dueDate || undefined,
      })
      setAssignDone(true)
      setTimeout(() => {
        setStage(1); setVariants([]); setSelected(null); setAssignDone(false)
        setForm({ topic: '', subject: 'math', difficulty: 'medium', questionCount: 10 })
      }, 2000)
    } catch { /* ignore */ }
    setAssigning(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Конструктор тестов</h2>
        <p className="text-sm text-gray-500 mt-0.5">Skylla AI генерирует 3 варианта теста по вашей теме</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: 'Настройка' },
          { n: 2, label: 'Выбор варианта' },
          { n: 3, label: 'Назначить классу' },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
              stage >= s.n ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
            )}>{s.n}</div>
            <span className={cn('text-sm hidden sm:block', stage >= s.n ? 'text-gray-900 font-medium' : 'text-gray-400')}>{s.label}</span>
            {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      {/* Stage 1 — Form */}
      {stage === 1 && (
        <motion.div variants={fadeIn} initial="hidden" animate="visible"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Тема теста</label>
            <input
              value={form.topic}
              onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
              placeholder="Например: Квадратные уравнения, Великая Отечественная война..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Предмет</label>
              <select
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Сложность</label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button key={d}
                    onClick={() => setForm(p => ({ ...p, difficulty: d }))}
                    className={cn(
                      'py-2 rounded-xl text-xs font-medium border transition-colors',
                      form.difficulty === d
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    )}
                  >
                    {d === 'easy' ? 'Лёгкий' : d === 'medium' ? 'Средний' : 'Сложный'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Вопросов в каждом варианте: <span className="text-blue-600 font-bold">{form.questionCount}</span>
            </label>
            <input
              type="range" min={5} max={20} step={1}
              value={form.questionCount}
              onChange={e => setForm(p => ({ ...p, questionCount: +e.target.value }))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>5</span><span>20</span></div>
          </div>
          {genError && (
            <p className="text-red-500 text-sm flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{genError}</p>
          )}
          <button
            onClick={() => void handleGenerate()}
            disabled={generating}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Skylla генерирует 3 варианта...</>
            ) : (
              <><Brain className="w-4 h-4" />Сгенерировать 3 варианта</>
            )}
          </button>
        </motion.div>
      )}

      {/* Stage 2 — Pick variant */}
      {stage === 2 && (
        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
          <p className="text-sm text-gray-500">Выберите один из вариантов для назначения классу:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {variants.map(v => (
              <div key={v.variantIndex}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 cursor-pointer"
                onClick={() => handleSelectVariant(v)}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900">Вариант {v.variantIndex}</span>
                  <span className="text-xs text-gray-400">{v.questions.length} вопросов</span>
                </div>
                <div className="space-y-2 mb-4">
                  {v.questions.slice(0, 3).map((q, i) => (
                    <p key={q.id} className="text-xs text-gray-600 line-clamp-2">
                      <span className="font-medium text-gray-700">{i + 1}.</span> {q.text}
                    </p>
                  ))}
                  {v.questions.length > 3 && (
                    <p className="text-xs text-gray-400">...ещё {v.questions.length - 3} вопросов</p>
                  )}
                </div>
                <button className="w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  Выбрать этот вариант
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => setStage(1)} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Сгенерировать заново
          </button>
        </motion.div>
      )}

      {/* Stage 3 — Assign */}
      {stage === 3 && selected && (
        <motion.div variants={fadeIn} initial="hidden" animate="visible"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
        >
          {assignDone ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">Задание назначено!</p>
              <p className="text-sm text-gray-500 mt-1">Ученики увидят его в своём дашборде</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-800">
                ✓ Выбран Вариант {selected.variantIndex} ({selected.questions.length} вопросов)
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Название задания</label>
                <input
                  value={assignForm.title}
                  onChange={e => setAssignForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Класс</label>
                <select
                  value={assignForm.classId}
                  onChange={e => setAssignForm(p => ({ ...p, classId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                >
                  <option value="">Выберите класс...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Срок сдачи (необязательно)</label>
                <input
                  type="datetime-local"
                  value={assignForm.dueDate}
                  onChange={e => setAssignForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStage(2)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm">
                  ← Назад
                </button>
                <button
                  onClick={() => void handleAssign()}
                  disabled={!assignForm.classId || assigning}
                  className="flex-2 flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {assigning ? 'Назначаю...' : 'Назначить классу'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  )
}

// ── Assignments Tab ───────────────────────────────────────────────────────────

function AssignmentsTab() {
  const [classes, setClasses]                   = useState<DBClass[]>([])
  const [assignments, setAssignments]           = useState<DBAssignment[]>([])
  const [loading, setLoading]                   = useState(true)
  const [showCreate, setShowCreate]             = useState(false)
  const [selectedAssignment, setSelectedA]      = useState<DBAssignment | null>(null)
  const [results, setResults]                   = useState<{ submissions: DBSubmission[]; stats: AssignmentStats } | null>(null)
  const [loadingResults, setLoadingResults]     = useState(false)
  const [createForm, setCreateForm]             = useState({
    classId: '', title: '', description: '', type: 'homework' as 'homework' | 'reading',
    text: '', dueDate: '',
  })
  const [creating, setCreating]                 = useState(false)
  const [createError, setCreateError]           = useState('')

  useEffect(() => {
    Promise.all([classesApi.list()]).then(([cls]) => {
      setClasses(cls.classes)
      // Gather all assignments from all classes
      const all: DBAssignment[] = []
      cls.classes.forEach(c => {
        c.assignments?.forEach(a => all.push({ ...a, class: { id: c.id, name: c.name } } as unknown as DBAssignment))
      })
      setAssignments(all)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function handleCreate() {
    if (!createForm.classId || !createForm.title.trim() || !createForm.text.trim()) {
      setCreateError('Заполните все обязательные поля'); return
    }
    setCreating(true); setCreateError('')
    try {
      const res = await assignmentsApi.create({
        classId:     createForm.classId,
        title:       createForm.title,
        description: createForm.description,
        type:        createForm.type,
        content:     { text: createForm.text },
        dueDate:     createForm.dueDate || undefined,
      })
      const cls = classes.find(c => c.id === createForm.classId)
      setAssignments(prev => [{ ...res.assignment, class: cls ? { id: cls.id, name: cls.name } : undefined } as DBAssignment, ...prev])
      setShowCreate(false)
      setCreateForm({ classId: '', title: '', description: '', type: 'homework', text: '', dueDate: '' })
    } catch (e) { setCreateError(e instanceof Error ? e.message : 'Ошибка') }
    setCreating(false)
  }

  async function openResults(a: DBAssignment) {
    setSelectedA(a); setLoadingResults(true); setResults(null)
    try {
      const res = await assignmentsApi.results(a.id)
      setResults({ submissions: res.submissions, stats: res.stats })
    } catch { /* ignore */ }
    setLoadingResults(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить задание?')) return
    await assignmentsApi.delete(id).catch(() => {})
    setAssignments(prev => prev.filter(a => a.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Задания</h2>
          <p className="text-sm text-gray-500 mt-0.5">Домашние работы и материалы для чтения</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Новое задание
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Нет заданий</p>
          <p className="text-sm text-gray-400 mt-1">Создайте задание или сгенерируйте тест через Конструктор</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Задание</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Класс</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Срок</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assignments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', typeColor(a.type))}>
                        {typeLabel(a.type)}
                      </span>
                      <span className="font-medium text-gray-800 truncate max-w-[200px]">{a.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-500">
                    {(a as unknown as { class?: { name: string } }).class?.name ?? '—'}
                  </td>
                  <td className={cn('px-4 py-3 hidden md:table-cell', isDueSoon(a.dueDate) ? 'text-red-500 font-medium' : 'text-gray-400')}>
                    {formatDate(a.dueDate)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => void openResults(a)}
                        className="px-2.5 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Результаты
                      </button>
                      <button onClick={() => void handleDelete(a.id)}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create assignment modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); setCreateError('') }} title="Новое задание">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Класс *</label>
            <select value={createForm.classId} onChange={e => setCreateForm(p => ({ ...p, classId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="">Выберите класс...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
            <div className="grid grid-cols-2 gap-2">
              {(['homework', 'reading'] as const).map(t => (
                <button key={t} onClick={() => setCreateForm(p => ({ ...p, type: t }))}
                  className={cn('py-2 rounded-xl text-sm font-medium border transition-colors',
                    createForm.type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  )}
                >{t === 'homework' ? '📝 Домашняя работа' : '📖 Чтение'}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input value={createForm.title} onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Например: ДЗ по теме Квадратные уравнения"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Текст задания *</label>
            <textarea value={createForm.text} onChange={e => setCreateForm(p => ({ ...p, text: e.target.value }))}
              placeholder="Опишите задание, прикрепите текст для чтения..." rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Срок сдачи</label>
            <input type="datetime-local" value={createForm.dueDate} onChange={e => setCreateForm(p => ({ ...p, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          {createError && <p className="text-red-500 text-sm flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{createError}</p>}
          <button onClick={() => void handleCreate()} disabled={creating}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {creating ? 'Создаю...' : 'Создать задание'}
          </button>
        </div>
      </Modal>

      {/* Results modal */}
      <Modal open={!!selectedAssignment} onClose={() => { setSelectedA(null); setResults(null) }} title={selectedAssignment?.title ?? 'Результаты'}>
        {loadingResults ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : results ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{results.stats.submitted}</p>
                <p className="text-xs text-blue-600 mt-0.5">Сдали</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-gray-700">{results.stats.totalMembers}</p>
                <p className="text-xs text-gray-500 mt-0.5">Всего</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{results.stats.avgScore ?? '—'}%</p>
                <p className="text-xs text-green-600 mt-0.5">Средний балл</p>
              </div>
            </div>
            {results.submissions.length === 0 ? (
              <p className="text-center text-gray-400 py-6">Ещё никто не сдал</p>
            ) : (
              <div className="space-y-2">
                {results.submissions.map(s => (
                  <div key={s.id} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {s.student?.name.charAt(0) ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{s.student?.name ?? 'Ученик'}</p>
                        <p className="text-xs text-gray-400">{new Date(s.submittedAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <span className={cn('text-sm font-bold px-2 py-0.5 rounded-lg',
                      s.score === null ? 'bg-gray-100 text-gray-500' :
                      s.score >= 80 ? 'bg-green-100 text-green-700' :
                      s.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-600'
                    )}>
                      {s.score !== null ? `${s.score}%` : 'Не проверено'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

// ── Progress Tab ──────────────────────────────────────────────────────────────

function ProgressTab() {
  const [classes, setClasses]       = useState<DBClass[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [detail, setDetail]         = useState<DBClass | null>(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    classesApi.list().then(r => { setClasses(r.classes); if (r.classes.length) setSelectedId(r.classes[0]!.id) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    classesApi.get(selectedId).then(r => setDetail(r.class)).catch(() => {})
  }, [selectedId])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>

  if (classes.length === 0) return (
    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 font-medium">Создайте класс, чтобы видеть прогресс учеников</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900">Прогресс учеников</h2>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {detail && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {!detail.members?.length ? (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Нет учеников. Поделитесь кодом: <span className="font-mono font-bold text-blue-600">{detail.inviteCode}</span></p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Ученик</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Сдано</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Вступил</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {detail.members?.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {m.student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{m.student.name}</p>
                          <p className="text-xs text-gray-400">{m.student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">— / {detail.assignments?.length ?? 0}</span>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell text-gray-400 text-xs">
                      {new Date(m.joinedAt).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

// ── Courses Tab ───────────────────────────────────────────────────────────────

function CoursesTab() {
  const [courseList, setCourseList] = useState<DBCourse[]>([])

  useEffect(() => {
    coursesApi.list().then(r => setCourseList(r.courses)).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Мои курсы</h2>
      {courseList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Курсы создаются через панель администратора</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courseList.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', c.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                {c.isPublished ? 'Опубликован' : 'Черновик'}
              </span>
              <h3 className="font-bold text-gray-900 mt-2 mb-1">{c.title}</h3>
              <p className="text-xs text-gray-400">{c.subject} · {c.level}</p>
              <p className="text-sm font-semibold text-blue-700 mt-2">{c.price > 0 ? `${c.price.toLocaleString('ru-RU')} ₸` : 'Бесплатно'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Smart Homework Tab ────────────────────────────────────────────────────────

function SmartHomeworkTab() {
  const [classes, setClasses] = useState<DBClass[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [analysis, setAnalysis] = useState<ClassAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<{ questionsGenerated: number; weakTopicsUsed: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    classesApi.list().then(r => setClasses(r.classes)).catch(() => {})
  }, [])

  const handleAnalyze = async () => {
    if (!selectedClass) return
    setLoading(true)
    setError(null)
    setAnalysis(null)
    setResult(null)
    try {
      const data = await smartAssignmentApi.analyze(selectedClass)
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!analysis) return
    setGenerating(true)
    setError(null)
    try {
      const res = await smartAssignmentApi.generate({
        classId: analysis.classId,
        subject: analysis.subject,
        questionCount: 10,
      })
      setResult(res.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Умное домашнее задание</h2>
      <p className="text-sm text-gray-500">Система анализирует слабые темы учеников и автоматически подбирает задания</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Выберите класс</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">— Выбрать —</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.subject})</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!selectedClass || loading}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
            Анализировать
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      {analysis && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Анализ класса: {analysis.className}</h3>
            <span className="text-sm text-gray-500">{analysis.students.length} учеников</span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {analysis.students.map(s => (
              <div key={s.studentId} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.studentName}</p>
                  {s.weakTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {s.weakTopics.slice(0, 5).map(t => (
                        <span key={t} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                  {s.weakTopics.length === 0 && s.diagnosticCount === 0 && (
                    <p className="text-xs text-gray-400 mt-1">Нет данных диагностики</p>
                  )}
                </div>
                <span className="text-xs text-gray-400">{s.diagnosticCount} диагн.</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Сгенерировать ДЗ по слабым темам
          </button>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-green-700 text-sm">
          ✅ Создано задание из {result.questionsGenerated} вопросов по темам: {result.weakTopicsUsed.join(', ') || 'общие'}
        </div>
      )}
    </div>
  )
}

// ── Schedule Tab ──────────────────────────────────────────────────────────────

const DAY_NAMES = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const CLASS_COLORS = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700']

function ScheduleTab() {
  const [classes, setClasses] = useState<DBClass[]>([])
  const [timetable, setTimetable] = useState<ClassScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ classId: '', dayOfWeek: 1, startTime: '09:00', endTime: '10:30', room: '' })

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [cls, sched] = await Promise.all([classesApi.list(), scheduleApi.myTimetable()])
      setClasses(cls.classes)
      setTimetable(sched.timetable)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!addForm.classId) return
    try {
      await scheduleApi.add(addForm.classId, {
        dayOfWeek: addForm.dayOfWeek,
        startTime: addForm.startTime,
        endTime: addForm.endTime,
        room: addForm.room || undefined,
      })
      setShowAdd(false)
      load()
    } catch {}
  }

  const handleRemove = async (classId: string, scheduleId: string) => {
    await scheduleApi.remove(classId, scheduleId)
    load()
  }

  // Group by day
  const byDay = new Map<number, ClassScheduleItem[]>()
  for (const item of timetable) {
    if (!byDay.has(item.dayOfWeek)) byDay.set(item.dayOfWeek, [])
    byDay.get(item.dayOfWeek)!.push(item)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Расписание занятий</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
      ) : timetable.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Расписание пока пустое</p>
          <p className="text-sm text-gray-400 mt-1">Добавьте занятия, нажав кнопку выше</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map(day => (
            <div key={day} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 text-center">{DAY_NAMES[day]}</h3>
              <div className="space-y-2">
                {(byDay.get(day) ?? []).map((item, idx) => (
                  <div key={item.id} className={`rounded-xl p-2 text-xs ${CLASS_COLORS[idx % CLASS_COLORS.length]}`}>
                    <p className="font-medium">{item.className}</p>
                    <p>{item.startTime}–{item.endTime}</p>
                    {item.room && <p className="opacity-70">{item.room}</p>}
                    <button onClick={() => handleRemove(item.classId, item.id)} className="text-red-500 hover:text-red-700 mt-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add schedule modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Добавить занятие</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Класс</label>
                <select value={addForm.classId} onChange={e => setAddForm(p => ({ ...p, classId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mt-1">
                  <option value="">Выбрать</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">День</label>
                <select value={addForm.dayOfWeek} onChange={e => setAddForm(p => ({ ...p, dayOfWeek: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mt-1">
                  {[1,2,3,4,5,6].map(d => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Начало</label>
                  <input type="time" value={addForm.startTime} onChange={e => setAddForm(p => ({ ...p, startTime: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Конец</label>
                  <input type="time" value={addForm.endTime} onChange={e => setAddForm(p => ({ ...p, endTime: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Кабинет (опционально)</label>
                <input value={addForm.room} onChange={e => setAddForm(p => ({ ...p, room: e.target.value }))}
                  placeholder="Каб. 201" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Отмена</button>
              <button onClick={handleAdd} disabled={!addForm.classId}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useStore()
  const [activeTab, setActiveTab] = useState<TabId>('classes')

  if (!user) { navigate('/auth'); return null }

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900">Study Hub</h1>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium hidden sm:block">
                  Панель преподавателя
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Stats bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-500" />Преподаватель</span>
            <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-blue-500" />StudyHub Platform</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {activeTab === 'classes'      && <ClassesTab userId={user.id} />}
          {activeTab === 'test-builder' && <TestBuilderTab />}
          {activeTab === 'assignments'  && <AssignmentsTab />}
          {activeTab === 'progress'     && <ProgressTab />}
          {activeTab === 'courses'      && <CoursesTab />}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Аналитика</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Рост учеников</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={enrollmentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<ChartTooltip suffix="уч." />} />
                      <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Распределение оценок</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={ratingDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="stars" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<ChartTooltip suffix="%" />} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {ratingDistribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'smart-hw' && <SmartHomeworkTab />}

          {activeTab === 'schedule' && <ScheduleTab />}

          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Доход</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Всего заработано', value: '1 890 000 ₸', icon: Banknote, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'В этом месяце',    value: '189 000 ₸',   icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Транзакций',        value: '47',           icon: FileText, color: 'text-blue-600',   bg: 'bg-blue-50' },
                ].map((card, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', card.bg)}>
                      <card.icon className={cn('w-5 h-5', card.color)} />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Доход по месяцам</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltip suffix="₸" />} />
                    <Line type="monotone" dataKey="earnings" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
