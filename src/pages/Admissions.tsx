import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, ExternalLink, Search, Bell, BellOff,
  AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp,
  GraduationCap, Star, Briefcase, Globe, Filter, FileText,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  ALL_ENTRIES, CATEGORY_META, FUNDING_META,
  getDeadlineStatus, isDataStale, nearestDeadline,
  type AdmissionEntry, type Category,
} from '@/data/admissionsData'

// ── Days until deadline ───────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Deadline badge ────────────────────────────────────────────────────────────

function DeadlineBadge({ dateStr }: { dateStr: string }) {
  const status = getDeadlineStatus(dateStr)
  const days = daysUntil(dateStr)

  if (status === 'passed') {
    return <span className="text-xs text-slate-400 line-through">{formatDate(dateStr)}</span>
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
      status === 'soon' ? 'bg-red-100 text-red-700' : 'bg-amber-50 text-amber-700',
    )}>
      <Clock className="w-3 h-3" />
      {status === 'soon' ? `${days} дн.` : formatDate(dateStr)}
    </div>
  )
}

// ── Stale warning ─────────────────────────────────────────────────────────────

function StaleWarning({ verifiedAt, sourceUrl }: { verifiedAt: string; sourceUrl: string }) {
  if (!isDataStale(verifiedAt)) return null
  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 hover:bg-amber-100 transition-colors"
    >
      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
      Данные могут быть устаревшими — проверьте официальный сайт
      <ExternalLink className="w-3 h-3" />
    </a>
  )
}

// ── Entry card ────────────────────────────────────────────────────────────────

function EntryCard({
  entry,
  tracked,
  onToggleTrack,
}: {
  entry: AdmissionEntry
  tracked: boolean
  onToggleTrack: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const nearest = nearestDeadline(entry)
  const catMeta = CATEGORY_META[entry.category]
  const fundMeta = FUNDING_META[entry.fundingType]

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="text-3xl shrink-0">{entry.logo}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">{entry.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', catMeta.color)}>
                    {catMeta.emoji} {catMeta.label}
                  </span>
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', fundMeta.color)}>
                    {fundMeta.label}
                  </span>
                  <span className="text-xs text-slate-400">{entry.country}{entry.city ? `, ${entry.city}` : ''}</span>
                </div>
              </div>
              <button
                onClick={() => onToggleTrack(entry.id)}
                className={cn(
                  'shrink-0 rounded-xl p-2 transition-colors',
                  tracked ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400 hover:text-primary-500',
                )}
                title={tracked ? 'Убрать из отслеживания' : 'Отслеживать дедлайны'}
              >
                {tracked ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">{entry.description}</p>

            {/* Nearest deadline */}
            {nearest && (
              <div className="flex items-center gap-2 mt-3">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-500">{nearest.label}:</span>
                <DeadlineBadge dateStr={nearest.date} />
              </div>
            )}
          </div>
        </div>

        <StaleWarning verifiedAt={entry.verifiedAt} sourceUrl={entry.sourceUrl} />
      </div>

      {/* Expandable details */}
      <div className="border-t border-slate-50">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center justify-between w-full px-5 py-3 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600"
        >
          <span>Все дедлайны и требования</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-5 pb-5 space-y-4"
          >
            {/* All deadlines */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Дедлайны</p>
              <div className="space-y-2">
                {entry.deadlines.map((d, i) => {
                  const status = getDeadlineStatus(d.date)
                  return (
                    <div key={i} className={cn(
                      'flex items-center justify-between rounded-xl px-3 py-2',
                      status === 'passed' ? 'bg-slate-50 opacity-50' : status === 'soon' ? 'bg-red-50' : 'bg-slate-50',
                    )}>
                      <div className="flex items-center gap-2">
                        {status === 'passed'
                          ? <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                          : status === 'soon'
                            ? <Clock className="w-3.5 h-3.5 text-red-500" />
                            : <Calendar className="w-3.5 h-3.5 text-primary-500" />
                        }
                        <span className={cn('text-xs font-medium', status === 'passed' ? 'text-slate-400' : 'text-slate-700')}>
                          {d.label}
                        </span>
                      </div>
                      <span className={cn('text-xs', status === 'passed' ? 'text-slate-400 line-through' : 'text-slate-600 font-semibold')}>
                        {formatDate(d.date)}
                        {status !== 'passed' && daysUntil(d.date) >= 0 && (
                          <span className={cn('ml-2', status === 'soon' ? 'text-red-600' : 'text-slate-400')}>
                            ({daysUntil(d.date)} дн.)
                          </span>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Требования</p>
              <div className="space-y-1.5">
                {entry.requirements.map((r, i) => (
                  <div key={i} className="flex gap-2 text-xs text-slate-700">
                    <span className="text-primary-500 font-bold shrink-0 mt-0.5">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Funding note */}
            {entry.fundingNote && (
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                <p className="text-xs font-semibold text-amber-800 mb-1">💰 Финансирование</p>
                <p className="text-xs text-amber-700">{entry.fundingNote}</p>
              </div>
            )}

            {/* Tags + link */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">{tag}</span>
                ))}
              </div>
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors"
              >
                Официальный сайт <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ── Tracked sidebar ───────────────────────────────────────────────────────────

function TrackedSidebar({ tracked, entries }: { tracked: Set<string>; entries: AdmissionEntry[] }) {
  const trackedEntries = entries.filter(e => tracked.has(e.id))
  const allDeadlines = trackedEntries
    .flatMap(e => e.deadlines.map(d => ({ ...d, entryName: e.shortName ?? e.name, entryId: e.id })))
    .filter(d => getDeadlineStatus(d.date) !== 'passed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10)

  if (trackedEntries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
        <Bell className="w-8 h-8 text-slate-200 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Нет отслеживаемых</p>
        <p className="text-xs text-slate-400 mt-1">Нажмите 🔔 на карточке чтобы отслеживать дедлайны</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-50 bg-primary-50">
        <h3 className="text-sm font-bold text-primary-900 flex items-center gap-2">
          <Bell className="w-4 h-4" /> Мои дедлайны ({trackedEntries.length})
        </h3>
      </div>
      <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
        {allDeadlines.map((d, i) => {
          const days = daysUntil(d.date)
          const status = getDeadlineStatus(d.date)
          return (
            <div key={i} className={cn(
              'rounded-xl p-3',
              status === 'soon' ? 'bg-red-50 border border-red-100' : 'bg-slate-50',
            )}>
              <p className="text-xs font-semibold text-slate-800 truncate">{d.entryName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{d.label}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-slate-400">{formatDate(d.date)}</span>
                <span className={cn('text-xs font-bold', status === 'soon' ? 'text-red-600' : 'text-slate-600')}>
                  {days} дн.
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const CATEGORY_FILTERS: { id: Category | 'all'; label: string; icon: React.ElementType }[] = [
  { id: 'all',           label: 'Всё',              icon: Globe },
  { id: 'kz_university', label: 'Вузы KZ',           icon: GraduationCap },
  { id: 'international', label: 'Зарубежные',        icon: Globe },
  { id: 'scholarship',   label: 'Стипендии',         icon: Star },
  { id: 'internship',    label: 'Стажировки',        icon: Briefcase },
]

export default function Admissions() {
  const navigate = useNavigate()
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')
  const [tracked, setTracked] = useState<Set<string>>(new Set())
  const [showTrackedOnly, setShowTrackedOnly] = useState(false)

  const toggleTrack = (id: string) => {
    setTracked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = useMemo(() => {
    return ALL_ENTRIES.filter(e => {
      if (category !== 'all' && e.category !== category) return false
      if (showTrackedOnly && !tracked.has(e.id)) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.tags.some(t => t.toLowerCase().includes(q)) ||
          e.country.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [category, search, showTrackedOnly, tracked])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-slate-600 transition-colors">
              ← Назад
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Поступление и стажировки</h1>
              <p className="text-sm text-slate-500">Дедлайны, требования, стипендии — всё актуальное в одном месте</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => navigate('/motivation-letter')}
                className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Написать письмо
              </button>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORY_FILTERS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors shrink-0',
                  category === id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Search + filter bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Поиск по названию, стране, тегу..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <button
                onClick={() => setShowTrackedOnly(v => !v)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                  showTrackedOnly
                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300',
                )}
              >
                <Filter className="w-4 h-4" />
                {tracked.size > 0 ? `Мои (${tracked.size})` : 'Мои'}
              </button>
            </div>

            {/* Stale data notice */}
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
              <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Данные проверяются командой StudyHub. Если видите предупреждение об устаревших данных — переходите на официальный сайт для актуальных дат.
              </p>
            </div>

            {/* Cards */}
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Globe className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Ничего не найдено</p>
                <button onClick={() => { setSearch(''); setCategory('all'); setShowTrackedOnly(false) }} className="mt-3 text-sm text-primary-600 hover:underline">
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(entry => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    tracked={tracked.has(entry.id)}
                    onToggleTrack={toggleTrack}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <TrackedSidebar tracked={tracked} entries={ALL_ENTRIES} />

            {/* Quick tips */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <h4 className="text-sm font-bold text-slate-800 mb-3">💡 Советы</h4>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex gap-2">
                  <span className="text-amber-500 font-bold shrink-0">1.</span>
                  <span>Подавайте заявку в 3–5 мест параллельно — это норма</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-amber-500 font-bold shrink-0">2.</span>
                  <span>Дедлайн стипендий часто раньше дедлайна поступления</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-amber-500 font-bold shrink-0">3.</span>
                  <span>Готовьте документы за 3–4 месяца до дедлайна</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-amber-500 font-bold shrink-0">4.</span>
                  <span>Рекомендательные письма запрашивайте за 1–2 месяца заранее</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-amber-500 font-bold shrink-0">5.</span>
                  <span>IELTS/TOEFL результаты действуют 2 года</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/motivation-letter')}
              className="w-full bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-4 text-left hover:opacity-90 transition-opacity"
            >
              <FileText className="w-5 h-5 text-white mb-2" />
              <p className="text-sm font-bold text-white">Написать мотивационное письмо</p>
              <p className="text-xs text-white/70 mt-1">Пошаговый конструктор с примерами</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
