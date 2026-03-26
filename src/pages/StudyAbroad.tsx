import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, GraduationCap, Award, Clock, DollarSign, Languages,
  FileText, ChevronLeft, ExternalLink, Search, X, MapPin,
  BookOpen, ArrowRight, MessageCircle, Building2, Loader2,
  AlertCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useStudyAbroadCountries } from '@/hooks/useStudyAbroad'
import { openWhatsApp } from '@/lib/whatsapp'
import type { StudyAbroadCountry } from '@/lib/api'

// ── Region filters ───────────────────────────────────────────────────────────

const REGION_FILTERS = [
  { id: 'all',          label: 'Все' },
  { id: 'Европа',       label: 'Европа' },
  { id: 'Азия',         label: 'Азия' },
  { id: 'Ближний Восток', label: 'Ближний Восток' },
  { id: 'Северная Америка', label: 'Северная Америка' },
] as const

type RegionFilter = typeof REGION_FILTERS[number]['id']

// ── Detail tabs ──────────────────────────────────────────────────────────────

const DETAIL_TABS = [
  { id: 'requirements', label: 'Требования',   icon: FileText },
  { id: 'universities', label: 'Университеты', icon: Building2 },
  { id: 'scholarships', label: 'Стипендии',    icon: Award },
  { id: 'timeline',     label: 'Таймлайн',     icon: Clock },
  { id: 'costs',        label: 'Расходы',      icon: DollarSign },
  { id: 'language',     label: 'Язык',         icon: Languages },
] as const

type DetailTab = typeof DETAIL_TABS[number]['id']

// ── Skeleton loader ──────────────────────────────────────────────────────────

function CountryCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-200 rounded-xl" />
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded-lg w-32 mb-2" />
          <div className="h-3 bg-slate-100 rounded-lg w-20" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-8 bg-slate-100 rounded-lg flex-1" />
        <div className="h-8 bg-slate-100 rounded-lg flex-1" />
      </div>
    </div>
  )
}

// ── Country card ─────────────────────────────────────────────────────────────

function CountryCard({
  country,
  onSelect,
}: {
  country: StudyAbroadCountry
  onSelect: (c: StudyAbroadCountry) => void
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect(country)}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all text-left w-full overflow-hidden group"
    >
      {/* Top gradient accent */}
      <div className="h-1.5 bg-gradient-to-r from-primary-500 via-purple-500 to-indigo-500" />

      <div className="p-5">
        {/* Flag + name + region */}
        <div className="flex items-start gap-3 mb-4">
          <span className="text-4xl leading-none shrink-0">{country.flagEmoji}</span>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-primary-700 transition-colors">
              {country.nameRu}
            </h3>
            <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-slate-500 bg-slate-50 rounded-full px-2.5 py-0.5">
              <MapPin className="w-3 h-3" />
              {country.region}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
            <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-blue-600 font-medium">{country.universities.length}</p>
              <p className="text-[10px] text-blue-400">
                {country.universities.length === 1 ? 'университет' : 'университетов'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2">
            <Award className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs text-amber-600 font-medium">{country.scholarships.length}</p>
              <p className="text-[10px] text-amber-400">
                {country.scholarships.length === 1 ? 'стипендия' : 'стипендий'}
              </p>
            </div>
          </div>
        </div>

        {/* Arrow hint */}
        <div className="flex items-center justify-end mt-3 text-xs text-slate-400 group-hover:text-primary-500 transition-colors">
          Подробнее <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </div>
      </div>
    </motion.button>
  )
}

// ── Detail modal / panel ─────────────────────────────────────────────────────

function CountryDetail({
  country,
  onClose,
}: {
  country: StudyAbroadCountry
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>('requirements')

  const handleWhatsApp = () => {
    openWhatsApp([
      '🌍 Запрос — обучение за рубежом — Study Hub',
      '',
      `🏳️ Страна: ${country.nameRu}`,
      '',
      'Привет! Хочу узнать подробнее о возможностях обучения в этой стране.',
    ].join('\n'))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 pt-8 pb-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-auto overflow-hidden"
      >
        {/* Modal header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-xl bg-white/10 hover:bg-white/20 p-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{country.flagEmoji}</span>
            <div>
              <h2 className="text-xl font-bold">{country.nameRu}</h2>
              <p className="text-white/60 text-sm mt-0.5">{country.nameEn}</p>
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-white/80 bg-white/10 rounded-full px-3 py-1">
                <MapPin className="w-3 h-3" />
                {country.region}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1">
            {DETAIL_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors',
                  activeTab === id
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/60',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'requirements' && <RequirementsTab country={country} />}
              {activeTab === 'universities' && <UniversitiesTab country={country} />}
              {activeTab === 'scholarships' && <ScholarshipsTab country={country} />}
              {activeTab === 'timeline' && <TimelineTab country={country} />}
              {activeTab === 'costs' && <CostsTab country={country} />}
              {activeTab === 'language' && <LanguageTab country={country} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA footer */}
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl px-6 py-3 transition-all shadow-sm hover:shadow-md"
          >
            <MessageCircle className="w-5 h-5" />
            Связаться с ментором
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Tab: Requirements ────────────────────────────────────────────────────────

function RequirementsTab({ country }: { country: StudyAbroadCountry }) {
  const { requirements } = country
  return (
    <div className="space-y-5">
      {/* Visa */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
        <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4" /> Виза
        </h4>
        <p className="text-sm text-blue-800">{requirements.visa}</p>
      </div>

      {/* Language */}
      <div className="rounded-xl bg-purple-50 border border-purple-100 p-4">
        <h4 className="text-sm font-bold text-purple-900 flex items-center gap-2 mb-2">
          <Languages className="w-4 h-4" /> Язык обучения
        </h4>
        <p className="text-sm text-purple-800">{requirements.language}</p>
      </div>

      {/* Documents */}
      <div>
        <h4 className="text-sm font-bold text-slate-800 mb-3">Необходимые документы</h4>
        <div className="space-y-2">
          {requirements.documents.map((doc, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
              <span className="text-primary-500 font-bold text-sm mt-0.5">{i + 1}.</span>
              <span className="text-sm text-slate-700">{doc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Other */}
      {requirements.other && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
          <h4 className="text-sm font-bold text-amber-900 mb-1">Дополнительно</h4>
          <p className="text-sm text-amber-800">{requirements.other}</p>
        </div>
      )}
    </div>
  )
}

// ── Tab: Universities ────────────────────────────────────────────────────────

function UniversitiesTab({ country }: { country: StudyAbroadCountry }) {
  if (country.universities.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Нет данных об университетах</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {country.universities.map((uni, i) => (
        <div key={i} className="rounded-xl border border-slate-100 bg-white p-4 hover:border-primary-200 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-sm">{uni.name}</h4>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {uni.city}
                </span>
                {uni.qs && (
                  <span className="text-xs font-semibold text-primary-600 bg-primary-50 rounded-full px-2 py-0.5">
                    QS #{uni.qs}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-slate-400">Стоимость</p>
              <p className="text-sm font-bold text-slate-800">
                {typeof uni.tuitionUSD === 'number' ? `$${uni.tuitionUSD.toLocaleString()}/год` : uni.tuitionUSD}
              </p>
            </div>
          </div>

          {/* Programs */}
          {uni.programs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {uni.programs.map((prog, j) => (
                <span key={j} className="text-[10px] font-medium bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">
                  {prog}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Tab: Scholarships ────────────────────────────────────────────────────────

function ScholarshipsTab({ country }: { country: StudyAbroadCountry }) {
  if (country.scholarships.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Award className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Нет данных о стипендиях</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {country.scholarships.map((sch, i) => (
        <div key={i} className="rounded-xl border border-slate-100 bg-white p-4 hover:border-amber-200 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                {sch.name}
              </h4>
              <p className="text-xs text-slate-600 mt-1.5">{sch.coverage}</p>
            </div>
            {sch.url && (
              <a
                href={sch.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 font-semibold transition-colors"
              >
                Сайт <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500">Дедлайн:</span>
            <span className="text-xs font-semibold text-slate-700">{sch.deadline}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Tab: Timeline ────────────────────────────────────────────────────────────

function TimelineTab({ country }: { country: StudyAbroadCountry }) {
  if (country.timeline.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Нет данных о таймлайне</p>
      </div>
    )
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-300 via-purple-300 to-indigo-300 rounded-full" />

      <div className="space-y-4">
        {country.timeline.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative"
          >
            {/* Dot */}
            <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-primary-400 shadow-sm" />

            <div className="rounded-xl bg-slate-50 p-3 hover:bg-slate-100 transition-colors">
              <p className="text-xs font-bold text-primary-700 uppercase tracking-wide">{step.month}</p>
              <p className="text-sm text-slate-700 mt-1">{step.action}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Costs ───────────────────────────────────────────────────────────────

function CostsTab({ country }: { country: StudyAbroadCountry }) {
  const { costs } = country
  const items = [
    { label: 'Стоимость обучения', value: costs.tuitionUSD, icon: GraduationCap, color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { label: 'Проживание',         value: costs.livingUSD,   icon: Building2,     color: 'bg-green-50 text-green-700 border-green-100' },
    { label: 'Страховка',          value: costs.insuranceUSD, icon: FileText,      color: 'bg-purple-50 text-purple-700 border-purple-100' },
  ]

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 mb-4">Примерные расходы в год (в USD)</p>

      {items.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className={cn('rounded-xl border p-4 flex items-center gap-4', color)}>
          <div className="rounded-lg bg-white p-2.5 shadow-sm shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium opacity-80">{label}</p>
            <p className="text-lg font-bold mt-0.5">{value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Tab: Language ─────────────────────────────────────────────────────────────

function LanguageTab({ country }: { country: StudyAbroadCountry }) {
  const { languageReqs } = country

  return (
    <div className="space-y-5">
      {/* Primary language */}
      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
        <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-1">
          <Languages className="w-4 h-4" /> Основной язык
        </h4>
        <p className="text-sm text-indigo-800">{languageReqs.primary}</p>
      </div>

      {/* Required tests */}
      <div>
        <h4 className="text-sm font-bold text-slate-800 mb-3">Требуемые тесты</h4>
        <div className="flex flex-wrap gap-2">
          {languageReqs.tests.map((test, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary-500" />
              {test}
            </span>
          ))}
        </div>
      </div>

      {/* Recommended courses */}
      {languageReqs.courses && (
        <div className="rounded-xl bg-green-50 border border-green-100 p-4">
          <h4 className="text-sm font-bold text-green-900 mb-1">Рекомендуемые курсы</h4>
          <p className="text-sm text-green-800">{languageReqs.courses}</p>
        </div>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function StudyAbroad() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { countries, loading, error } = useStudyAbroadCountries()

  const [region, setRegion] = useState<RegionFilter>('all')
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<StudyAbroadCountry | null>(null)

  const filtered = useMemo(() => {
    return countries.filter(c => {
      if (!c.isActive) return false
      if (region !== 'all' && c.region !== region) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          c.nameRu.toLowerCase().includes(q) ||
          c.nameEn.toLowerCase().includes(q) ||
          c.nameKk.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [countries, region, search])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950">
        {/* Background decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> {t('back', 'Назад')}
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-white/10 p-2.5">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Поступление за рубеж
              </h1>
            </div>
            <p className="text-base sm:text-lg text-white/60 max-w-2xl leading-relaxed">
              Исследуйте возможности обучения в лучших университетах мира.
              Подробная информация о требованиях, стипендиях и расходах для казахстанских студентов.
            </p>
          </motion.div>

          {/* Stats row */}
          {!loading && countries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-wrap gap-6 mt-8"
            >
              <div className="flex items-center gap-2 text-white/80">
                <Globe className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-medium">
                  {countries.filter(c => c.isActive).length} стран
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">
                  {countries.reduce((sum, c) => sum + c.universities.length, 0)} университетов
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">
                  {countries.reduce((sum, c) => sum + c.scholarships.length, 0)} стипендий
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Region tabs */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
              {REGION_FILTERS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setRegion(id)}
                  className={cn(
                    'rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors shrink-0',
                    region === id
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск страны..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Loading state */}
        {loading && (
          <div>
            <div className="flex items-center gap-2 mb-6 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Загрузка стран...</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CountryCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <p className="text-slate-700 font-medium mb-1">Не удалось загрузить данные</p>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <Globe className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">
              {countries.length === 0 ? 'Нет доступных стран' : 'Ничего не найдено'}
            </p>
            {(search || region !== 'all') && (
              <button
                onClick={() => { setSearch(''); setRegion('all') }}
                className="mt-3 text-sm text-primary-600 hover:underline"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        )}

        {/* Country grid */}
        {!loading && !error && filtered.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map(c => (
                <CountryCard
                  key={c.id}
                  country={c}
                  onSelect={setSelectedCountry}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Detail modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedCountry && (
          <CountryDetail
            country={selectedCountry}
            onClose={() => setSelectedCountry(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
