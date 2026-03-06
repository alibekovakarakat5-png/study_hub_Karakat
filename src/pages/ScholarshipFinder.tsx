import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Search, Filter, ChevronDown, ChevronUp,
  Globe, CheckCircle2, ExternalLink, Star, X, Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SCHOLARSHIPS,
  SCHOLARSHIP_COUNTRIES,
  SCHOLARSHIP_LEVELS,
  COVERAGE_LABELS,
  COVERAGE_COLORS,
  type Scholarship,
} from '@/data/scholarships'
import { useContentStore } from '@/store/useContentStore'

// ─────────────────────────────────────────────────────────────────────────────

export default function ScholarshipFinder() {
  const navigate = useNavigate()
  const customScholarships = useContentStore(s => s.scholarships)
  const syncFromServer = useContentStore(s => s.syncFromServer)

  useEffect(() => { syncFromServer() }, [syncFromServer])

  // Merge hardcoded + admin-added scholarships (custom overrides if same id)
  const allScholarships = useMemo(() => {
    const customIds = new Set(customScholarships.map(s => s.id))
    const base = SCHOLARSHIPS.filter(s => !customIds.has(s.id))
    return [...base, ...customScholarships]
  }, [customScholarships])

  const [search,    setSearch]    = useState('')
  const [country,   setCountry]   = useState('Все страны')
  const [level,     setLevel]     = useState<string>('')
  const [coverage,  setCoverage]  = useState<string>('')
  const [expanded,  setExpanded]  = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allScholarships.filter(s => {
      if (q && !s.name.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q) && !s.nameShort.toLowerCase().includes(q)) return false
      if (country && country !== 'Все страны' && s.country !== country) return false
      if (level && !s.level.includes(level as Scholarship['level'][number])) return false
      if (coverage && s.coverage !== coverage) return false
      return true
    })
  }, [search, country, level, coverage])

  const activeFilters = [
    country !== 'Все страны' ? country : null,
    level ? SCHOLARSHIP_LEVELS.find(l => l.id === level)?.label : null,
    coverage ? COVERAGE_LABELS[coverage as Scholarship['coverage']] : null,
  ].filter(Boolean) as string[]

  function clearFilters() {
    setSearch('')
    setCountry('Все страны')
    setLevel('')
    setCoverage('')
  }

  const toggle = (id: string) => setExpanded(v => (v === id ? null : id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800 leading-none">Scholarship Finder</h1>
              <p className="text-xs text-gray-500">{allScholarships.length} стипендий для казахстанцев</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Search + filter toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию, стране..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
              showFilters || activeFilters.length > 0
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 text-gray-600 hover:border-emerald-300 bg-white',
            )}
          >
            <Filter className="w-4 h-4" />
            Фильтры
            {activeFilters.length > 0 && (
              <span className="bg-emerald-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                {/* Country */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Страна обучения</label>
                  <div className="flex flex-wrap gap-2">
                    {SCHOLARSHIP_COUNTRIES.map(c => (
                      <button
                        key={c}
                        onClick={() => setCountry(c === 'Любая страна' ? 'Все страны' : c)}
                        className={cn(
                          'px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
                          country === c || (c === 'Любая страна' && country === 'Все страны')
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 text-gray-600 hover:border-emerald-300',
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Уровень обучения</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setLevel('')}
                      className={cn(
                        'px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
                        !level ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-emerald-300',
                      )}
                    >
                      Любой
                    </button>
                    {SCHOLARSHIP_LEVELS.map(l => (
                      <button
                        key={l.id}
                        onClick={() => setLevel(v => v === l.id ? '' : l.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
                          level === l.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-emerald-300',
                        )}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coverage */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Покрытие</label>
                  <div className="flex flex-wrap gap-2">
                    {(['', 'full', 'partial', 'tuition'] as const).map(c => (
                      <button
                        key={c}
                        onClick={() => setCoverage(v => v === c ? '' : c)}
                        className={cn(
                          'px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
                          coverage === c ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-emerald-300',
                        )}
                      >
                        {c === '' ? 'Любое' : COVERAGE_LABELS[c]}
                      </button>
                    ))}
                  </div>
                </div>

                {activeFilters.length > 0 && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors">
                    <X className="w-3.5 h-3.5" /> Сбросить все фильтры
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.map(f => (
              <span key={f} className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-gray-500">
          {filtered.length === allScholarships.length
            ? `Все ${filtered.length} стипендии`
            : `Найдено: ${filtered.length} из ${allScholarships.length}`}
        </p>

        {/* Scholarship cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Award className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Ничего не найдено</p>
            <p className="text-sm">Попробуйте изменить фильтры</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s, idx) => {
              const isOpen = expanded === s.id
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.2 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Card header */}
                  <button
                    className="w-full flex items-start gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
                    onClick={() => toggle(s.id)}
                  >
                    {/* Flag */}
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0 border border-gray-100">
                      {s.flag}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2">
                        <p className="text-sm font-bold text-gray-900 leading-snug">{s.name}</p>
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full shrink-0', COVERAGE_COLORS[s.coverage])}>
                          {COVERAGE_LABELS[s.coverage]}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-0.5">{s.provider}</p>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-md">
                          {s.flag} {s.country}
                        </span>
                        {s.level.map(l => (
                          <span key={l} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-md">
                            {l === 'bachelor' ? 'Бакалавр' : l === 'master' ? 'Магистр' : l === 'phd' ? 'PhD' : 'Любой'}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{s.coverageLabel}</p>
                    </div>

                    <div className="shrink-0 mt-1">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                          {/* Description */}
                          <p className="text-sm text-gray-700 leading-relaxed">{s.description}</p>

                          {/* Key info grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-amber-50 rounded-xl p-3">
                              <p className="text-xs font-semibold text-amber-700 mb-0.5">Дедлайн подачи</p>
                              <p className="text-sm text-amber-900 font-medium">{s.deadline}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-3">
                              <p className="text-xs font-semibold text-emerald-700 mb-0.5">Покрытие</p>
                              <p className="text-sm text-emerald-900 font-medium">{s.coverageLabel}</p>
                            </div>
                          </div>

                          {/* Requirements */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Требования</p>
                            <ul className="space-y-1.5">
                              {s.requirements.map(r => (
                                <li key={r} className="flex items-start gap-2 text-sm text-gray-700">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5">
                            {s.tags.map(t => (
                              <span key={t} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-md">
                                {t}
                              </span>
                            ))}
                          </div>

                          {/* Official site link */}
                          <a
                            href={s.officialSite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors group"
                          >
                            <Globe className="w-4 h-4" />
                            Официальный сайт
                            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white text-center">
          <Star className="w-7 h-7 mx-auto mb-2 opacity-80" />
          <p className="font-bold">Подберите университет под стипендию</p>
          <p className="text-sm text-white/80 mt-1 mb-4">AI Advisor найдёт вузы с наилучшим шансом поступления</p>
          <button
            onClick={() => navigate('/university-advisor')}
            className="bg-white text-emerald-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm"
          >
            Открыть University Advisor
          </button>
        </div>
      </div>
    </div>
  )
}
