import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap, Globe, ArrowLeft, ArrowRight, Search,
  MapPin, DollarSign, BookOpen, ChevronDown, ChevronUp,
  CheckCircle2, Star, Sparkles, Trophy, RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ABROAD_UNIVERSITIES,
  calculateMatchScore,
  matchLabel,
  ADVISOR_COUNTRIES,
  ADVISOR_SPECIALTIES,
  BUDGET_PRESETS,
  type AdvisorInputs,
} from '@/data/universityAdvisor'
import { useContentStore } from '@/store/useContentStore'
import { useStore } from '@/store/useStore'
import { usePracticeEntStore } from '@/store/usePracticeEntStore'
import { estimateEntScore } from '@/lib/recommendations'

// ── Step types ────────────────────────────────────────────────────────────────

type Step = 'scores' | 'budget' | 'preferences' | 'results'

const STEPS: Step[] = ['scores', 'budget', 'preferences', 'results']

const STEP_LABELS: Record<Step, string> = {
  scores:      'Ваши баллы',
  budget:      'Бюджет',
  preferences: 'Предпочтения',
  results:     'Результаты',
}

// ── Country flag map ──────────────────────────────────────────────────────────

const FLAG: Record<string, string> = {
  'Казахстан':      '🇰🇿',
  'Россия':         '🇷🇺',
  'Германия':       '🇩🇪',
  'Великобритания': '🇬🇧',
  'Турция':         '🇹🇷',
  'Венгрия':        '🇭🇺',
  'Китай':          '🇨🇳',
  'Южная Корея':    '🇰🇷',
  'ОАЭ':            '🇦🇪',
}

const LANGUAGE_LABEL: Record<string, string> = {
  en:    'English',
  ru:    'Русский',
  de:    'Deutsch',
  kk:    'Казахский',
  multi: 'Многоязычный',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100'

// ─────────────────────────────────────────────────────────────────────────────

export default function UniversityAdvisor() {
  const navigate = useNavigate()
  const customUniversities = useContentStore(s => s.universities)
  const { diagnosticResult } = useStore()
  const { history: entHistory } = usePracticeEntStore()

  // Pre-fill scores from actual user data
  const prefillEntScore = useMemo(
    () => estimateEntScore(diagnosticResult, entHistory),
    [diagnosticResult, entHistory],
  )

  const [step, setStep]     = useState<Step>('scores')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [inputs, setInputs] = useState<AdvisorInputs>({
    ielts:     0,
    entScore:  prefillEntScore,
    budgetUSD: 15000,
    countries: [],
    specialty: '',
  })

  const stepIndex  = STEPS.indexOf(step)
  const canProceed = step !== 'results'

  function next() {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1])
  }
  function prev() {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1])
  }
  function reset() {
    setStep('scores')
    setExpanded(null)
    setInputs({ ielts: 0, entScore: 0, budgetUSD: 15000, countries: [], specialty: '' })
  }

  // Merge hardcoded + admin-added universities
  const allUniversities = useMemo(() => {
    const customIds = new Set(customUniversities.map(u => u.id))
    const base = ABROAD_UNIVERSITIES.filter(u => !customIds.has(u.id))
    return [...base, ...customUniversities]
  }, [customUniversities])

  // Compute results
  const results = allUniversities
    .map(uni => ({ uni, score: calculateMatchScore(uni, inputs) }))
    .sort((a, b) => b.score - a.score)

  const toggle = (id: string) => setExpanded(v => (v === id ? null : id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800 leading-none">AI University Advisor</h1>
              <p className="text-xs text-gray-500">Подбор университетов</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex-1 ml-4">
            <div className="flex gap-1">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-all duration-300',
                    i <= stepIndex ? 'bg-primary-500' : 'bg-gray-200',
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">{STEP_LABELS[step]}</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* ── Step 1: Scores ─────────────────────────────────────────────── */}
          {step === 'scores' && (
            <motion.div
              key="scores"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ваши академические баллы</h2>
                <p className="text-gray-500 mt-1 text-sm">Если ещё не сдавали — оставьте 0</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
                {/* IELTS */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    IELTS Overall Band
                    <span className="ml-2 text-xs font-normal text-gray-400">(0 = не сдавал)</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[0, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0].map(v => (
                      <button
                        key={v}
                        onClick={() => setInputs(p => ({ ...p, ielts: v }))}
                        className={cn(
                          'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                          inputs.ielts === v
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-primary-300',
                        )}
                      >
                        {v === 0 ? 'Не сдавал' : v}
                      </button>
                    ))}
                  </div>
                  <input
                    type="range" min={0} max={9} step={0.5}
                    value={inputs.ielts}
                    onChange={e => setInputs(p => ({ ...p, ielts: parseFloat(e.target.value) }))}
                    className="w-full mt-3 accent-primary-500"
                  />
                </div>

                {/* ENT */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm font-semibold text-gray-700">
                      Балл ЕНТ
                      <span className="ml-2 text-xs font-normal text-gray-400">(0–140, 0 = не сдавал)</span>
                    </label>
                    {prefillEntScore > 0 && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        ✓ Из твоих результатов
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      type="number" min={0} max={140}
                      value={inputs.entScore || ''}
                      onChange={e => setInputs(p => ({ ...p, entScore: parseInt(e.target.value) || 0 }))}
                      placeholder="Например, 95"
                      className={inputCls + ' max-w-[160px]'}
                    />
                    {inputs.entScore > 0 && (
                      <span className={cn(
                        'text-sm font-medium px-2.5 py-1 rounded-lg',
                        inputs.entScore >= 100 ? 'bg-emerald-100 text-emerald-700'
                          : inputs.entScore >= 80 ? 'bg-blue-100 text-blue-700'
                          : inputs.entScore >= 60 ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-600',
                      )}>
                        {inputs.entScore >= 100 ? 'Отлично' : inputs.entScore >= 80 ? 'Хорошо' : inputs.entScore >= 60 ? 'Средний' : 'Низкий'}
                      </span>
                    )}
                  </div>
                  <input
                    type="range" min={0} max={140} step={1}
                    value={inputs.entScore}
                    onChange={e => setInputs(p => ({ ...p, entScore: parseInt(e.target.value) }))}
                    className="w-full mt-3 accent-primary-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={next}
                  className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-semibold shadow-lg shadow-primary-200 hover:opacity-90 transition-opacity"
                >
                  Далее <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Budget ─────────────────────────────────────────────── */}
          {step === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Годовой бюджет</h2>
                <p className="text-gray-500 mt-1 text-sm">Сколько вы готовы тратить в год (обучение + проживание)</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BUDGET_PRESETS.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setInputs(prev => ({ ...prev, budgetUSD: p.value }))}
                      className={cn(
                        'p-3 rounded-xl border text-sm font-medium text-left transition-all',
                        inputs.budgetUSD === p.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-700 hover:border-primary-300',
                      )}
                    >
                      <DollarSign className="w-4 h-4 mb-1 opacity-60" />
                      {p.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Или введите точную сумму (USD/год)
                  </label>
                  <input
                    type="number" min={1000} step={500}
                    value={inputs.budgetUSD === 999999 ? '' : inputs.budgetUSD}
                    onChange={e => setInputs(p => ({ ...p, budgetUSD: parseInt(e.target.value) || 0 }))}
                    placeholder="Например, 15000"
                    className={inputCls + ' max-w-[200px]'}
                  />
                </div>

                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                  <p className="font-medium mb-1">💡 Совет</p>
                  <p>Германия и Казахстан — почти бесплатное обучение ($0–700/год).<br />
                  Стипендии (DAAD, CSC, Türkiye) полностью покрывают расходы.</p>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={prev} className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Назад
                </button>
                <button onClick={next} className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-semibold shadow-lg shadow-primary-200 hover:opacity-90 transition-opacity">
                  Далее <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Preferences ────────────────────────────────────────── */}
          {step === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Предпочтения</h2>
                <p className="text-gray-500 mt-1 text-sm">Необязательно — но поможет точнее подобрать</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
                {/* Countries */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Предпочитаемые страны
                    <span className="ml-2 text-xs font-normal text-gray-400">(не выбрано = все)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ADVISOR_COUNTRIES.map(c => {
                      const selected = inputs.countries.includes(c)
                      return (
                        <button
                          key={c}
                          onClick={() =>
                            setInputs(p => ({
                              ...p,
                              countries: selected
                                ? p.countries.filter(x => x !== c)
                                : [...p.countries, c],
                            }))
                          }
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all',
                            selected
                              ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                              : 'border-gray-200 text-gray-600 hover:border-primary-300',
                          )}
                        >
                          {FLAG[c]} {c}
                          {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Specialty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Специальность</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setInputs(p => ({ ...p, specialty: '' }))}
                      className={cn(
                        'px-3 py-2 rounded-xl border text-sm text-left transition-all',
                        !inputs.specialty
                          ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-primary-300',
                      )}
                    >
                      Любая
                    </button>
                    {ADVISOR_SPECIALTIES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setInputs(p => ({ ...p, specialty: p.specialty === s.id ? '' : s.id }))}
                        className={cn(
                          'px-3 py-2 rounded-xl border text-sm text-left transition-all',
                          inputs.specialty === s.id
                            ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                            : 'border-gray-200 text-gray-600 hover:border-primary-300',
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={prev} className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Назад
                </button>
                <button
                  onClick={next}
                  className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-semibold shadow-lg shadow-primary-200 hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="w-4 h-4" /> Подобрать университеты
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Results ────────────────────────────────────────────── */}
          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Summary bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Результаты подбора</h2>
                  <p className="text-gray-500 mt-0.5 text-sm">{results.length} университетов отранжировано по совместимости</p>
                </div>
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Начать заново
                </button>
              </div>

              {/* Summary chips */}
              <div className="flex flex-wrap gap-2">
                {inputs.ielts > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    IELTS {inputs.ielts}
                  </span>
                )}
                {inputs.entScore > 0 && (
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    ЕНТ {inputs.entScore}
                  </span>
                )}
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  ${inputs.budgetUSD === 999999 ? '∞' : inputs.budgetUSD.toLocaleString()}/год
                </span>
                {inputs.countries.length > 0 && inputs.countries.map(c => (
                  <span key={c} className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                    {FLAG[c]} {c}
                  </span>
                ))}
                {inputs.specialty && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {ADVISOR_SPECIALTIES.find(s => s.id === inputs.specialty)?.label}
                  </span>
                )}
              </div>

              {/* University cards */}
              <div className="space-y-3">
                {results.map(({ uni, score }, idx) => {
                  const match  = matchLabel(score)
                  const isOpen = expanded === uni.id

                  return (
                    <motion.div
                      key={uni.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.25 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      {/* Card header */}
                      <button
                        className="w-full flex items-start gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
                        onClick={() => toggle(uni.id)}
                      >
                        {/* Rank */}
                        <div className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold',
                          idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-100 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500',
                        )}>
                          {idx === 0 ? <Trophy className="w-4 h-4" /> : idx + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            <span className="text-base font-semibold text-gray-900 leading-snug">
                              {FLAG[uni.country]} {uni.name}
                            </span>
                            {uni.tag && (
                              <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full shrink-0">
                                {uni.tag}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {uni.city}, {uni.country}
                            </span>
                            {uni.qs2025 && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Star className="w-3 h-3" /> QS #{uni.qs2025}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Globe className="w-3 h-3" /> {LANGUAGE_LABEL[uni.language]}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {uni.tuitionUSD === 0 ? 'Бесплатно' : `$${uni.tuitionUSD.toLocaleString()}/год`}
                            </span>
                          </div>

                          {/* Match bar */}
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ delay: 0.1 + idx * 0.04, duration: 0.5, ease: 'easeOut' }}
                                className={cn('h-full rounded-full', match.bar)}
                              />
                            </div>
                            <span className={cn(
                              'text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap',
                              match.color,
                            )}>
                              {score}% · {match.label}
                            </span>
                          </div>
                        </div>

                        {/* Expand icon */}
                        <div className="shrink-0 mt-1">
                          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </button>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                              <p className="text-sm text-gray-600">{uni.description}</p>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Плюсы</p>
                                  <ul className="space-y-1">
                                    {uni.pros.map(p => (
                                      <li key={p} className="text-xs text-gray-700 flex items-start gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> {p}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Минусы</p>
                                  <ul className="space-y-1">
                                    {uni.cons.map(c => (
                                      <li key={c} className="text-xs text-gray-700 flex items-start gap-1.5">
                                        <span className="text-red-400 shrink-0">—</span> {c}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {/* Requirements */}
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                {uni.minIELTS && (
                                  <div className="bg-blue-50 rounded-xl p-3">
                                    <p className="font-semibold text-blue-700 mb-0.5">IELTS мин.</p>
                                    <p className="text-blue-900 text-base font-bold">{uni.minIELTS}</p>
                                    {inputs.ielts > 0 && (
                                      <p className={cn(
                                        'text-xs mt-1',
                                        inputs.ielts >= uni.minIELTS ? 'text-emerald-600' : 'text-red-500',
                                      )}>
                                        {inputs.ielts >= uni.minIELTS ? '✓ У вас есть' : `✗ Нужно ещё +${(uni.minIELTS - inputs.ielts).toFixed(1)}`}
                                      </p>
                                    )}
                                  </div>
                                )}
                                <div className="bg-purple-50 rounded-xl p-3">
                                  <p className="font-semibold text-purple-700 mb-0.5">Обучение/год</p>
                                  <p className="text-purple-900 font-bold">
                                    {uni.tuitionUSD === 0 ? 'Бесплатно' : `$${uni.tuitionUSD.toLocaleString()}`}
                                  </p>
                                </div>
                                <div className="bg-amber-50 rounded-xl p-3">
                                  <p className="font-semibold text-amber-700 mb-0.5">Жизнь/год</p>
                                  <p className="text-amber-900 font-bold">${uni.livingUSD.toLocaleString()}</p>
                                </div>
                              </div>

                              {/* Scholarships */}
                              {uni.scholarships.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Доступные стипендии
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {uni.scholarships.map(s => (
                                      <span key={s} className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Specialties */}
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                  Специальности
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {uni.specialties.map(s => (
                                    <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-md">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-6 text-white text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <p className="font-bold text-lg">Найдите стипендию для поступления</p>
                <p className="text-sm text-white/80 mt-1 mb-4">Многие из этих вузов покрываются стипендиями полностью</p>
                <button
                  onClick={() => navigate('/scholarship-finder')}
                  className="bg-white text-primary-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm"
                >
                  <Search className="w-4 h-4 inline mr-1.5" />
                  Найти стипендию
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
