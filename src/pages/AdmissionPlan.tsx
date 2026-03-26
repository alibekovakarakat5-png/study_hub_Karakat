import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { useContentStore } from '@/store/useContentStore'
import {
  PROGRAMS as HARDCODED_PROGRAMS, UNIVERSITIES as HARDCODED_UNIVERSITIES,
  FIELD_LABELS, SUBJECT_LABELS,
  calcChance, calcSubjectGaps, buildRecommendations, estimateWeeks,
  type StudyField, type Program, type UniversityProfile,
  type UniversityChance, type ChanceLevel,
} from '@/data/admissionPlanData'
import {
  ChevronRight, ChevronLeft, Target, TrendingUp,
  AlertCircle, CheckCircle2, Clock, BookOpen, Star,
  BarChart3, MapPin, ExternalLink, RefreshCw,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ManualScores {
  total: number
  [key: string]: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function chanceBg(level: ChanceLevel): string {
  switch (level) {
    case 'high':       return 'bg-emerald-50 border-emerald-200'
    case 'medium':     return 'bg-blue-50 border-blue-200'
    case 'low':        return 'bg-amber-50 border-amber-200'
    case 'reach':      return 'bg-orange-50 border-orange-200'
    case 'impossible': return 'bg-red-50 border-red-200'
  }
}

function chanceColor(level: ChanceLevel): string {
  switch (level) {
    case 'high':       return 'text-emerald-700'
    case 'medium':     return 'text-blue-700'
    case 'low':        return 'text-amber-700'
    case 'reach':      return 'text-orange-700'
    case 'impossible': return 'text-red-700'
  }
}

function chanceLabel(level: ChanceLevel): string {
  switch (level) {
    case 'high':       return 'Высокие шансы'
    case 'medium':     return 'Хорошие шансы'
    case 'low':        return 'Можно попробовать'
    case 'reach':      return 'Только платно'
    case 'impossible': return 'Не хватает баллов'
  }
}

function barColor(pct: number): string {
  if (pct >= 70) return 'bg-emerald-500'
  if (pct >= 40) return 'bg-blue-500'
  if (pct >= 15) return 'bg-amber-500'
  return 'bg-red-400'
}

function priorityBadge(p: 'critical' | 'high' | 'medium') {
  const map = {
    critical: 'bg-red-100 text-red-700',
    high:     'bg-orange-100 text-orange-700',
    medium:   'bg-yellow-100 text-yellow-700',
  }
  const labels = { critical: 'Критично', high: 'Важно', medium: 'Желательно' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[p]}`}>{labels[p]}</span>
}

// ── Chance Bar ────────────────────────────────────────────────────────────────

function ChanceBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor(pct)}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ── University Chance Card ────────────────────────────────────────────────────

function UniversityCard({ chance }: { chance: UniversityChance }) {
  const [open, setOpen] = useState(false)
  const { university: uni, requirement: req, chanceGrant, chancePaid, level, gap, subjectGaps, recommendations, timeToReady } = chance

  return (
    <motion.div
      layout
      className={`border rounded-2xl overflow-hidden ${chanceBg(level)}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{uni.logo}</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{uni.shortName}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${chanceBg(level)} ${chanceColor(level)}`}>
                  {chanceLabel(level)}
                </span>
                {uni.tier === 1 && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Топ-вуз</span>}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />{uni.city}
              </div>
            </div>
          </div>
          <div className="text-right">
            {gap <= 0
              ? <div className="text-emerald-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />+{Math.abs(gap)} запаса</div>
              : <div className="text-red-600 font-bold text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />−{gap} до гранта</div>
            }
          </div>
        </div>

        {/* Chance bars */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <ChanceBar label="Шанс на грант" pct={chanceGrant} />
          <ChanceBar label="Шанс (платно)" pct={chancePaid} />
        </div>

        {/* Meta */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          <span>Грант ЕНТ: <strong>{req.grantEnt}</strong></span>
          <span>Мин. ЕНТ: <strong>{req.minEnt}</strong></span>
          <span>Мест (грант): <strong>{req.grantPlaces}</strong></span>
          {req.ieltsMin && <span>IELTS: <strong>{req.ieltsMin}+</strong></span>}
          {req.hasInterview && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">+ Собеседование</span>}
          {timeToReady > 0 && (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /><strong>{timeToReady} нед.</strong> подготовки</span>
          )}
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 bg-white/50 hover:bg-white/80 transition text-sm text-gray-600 flex items-center justify-center gap-1"
      >
        {open ? 'Скрыть детали' : 'Детали и рекомендации'}
        <ChevronRight className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {/* Details */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Subject gaps */}
              {subjectGaps.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" /> Пробелы по предметам
                  </h4>
                  <div className="space-y-2">
                    {subjectGaps.map(gap => (
                      <div key={gap.subject}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center gap-2">
                            {SUBJECT_LABELS[gap.subject]}
                            {priorityBadge(gap.priority)}
                          </span>
                          <span className="text-gray-500">{gap.currentPct}% → {gap.targetPct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${gap.currentPct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Target className="w-4 h-4" /> Рекомендации
                  </h4>
                  <ul className="space-y-1.5">
                    {recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Link */}
              <a
                href={uni.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
              >
                Официальный сайт <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Manual Score Input ────────────────────────────────────────────────────────

function ManualScoreInput({
  program,
  scores,
  onChange,
}: {
  program: Program
  scores: ManualScores
  onChange: (s: ManualScores) => void
}) {
  const subjects = [...program.requiredSubjects, ...program.bonusSubjects]

  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Общий балл ЕНТ (из 140)</label>
        <input
          type="number"
          min={0}
          max={140}
          value={scores.total || ''}
          onChange={e => onChange({ ...scores, total: +e.target.value })}
          placeholder="Например: 98"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-2">Необязательно: результаты по предметам (%)</p>
        <div className="grid grid-cols-2 gap-2">
          {subjects.map(subj => (
            <div key={subj}>
              <label className="text-xs text-gray-600 block mb-0.5">{SUBJECT_LABELS[subj]}</label>
              <input
                type="number"
                min={0}
                max={100}
                value={scores[subj] || ''}
                onChange={e => onChange({ ...scores, [subj]: +e.target.value })}
                placeholder="%"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Roadmap Timeline ──────────────────────────────────────────────────────────

function RoadmapTimeline({ chances }: { chances: UniversityChance[] }) {
  const maxWeeks = Math.max(...chances.map(c => c.timeToReady), 0)
  if (maxWeeks === 0) return null

  const phases = [
    { weeks: [1, 8],  label: 'Диагностика и база', color: 'bg-blue-500', desc: 'Пройди все диагностические тесты, выяви слабые темы' },
    { weeks: [9, 20], label: 'Интенсив по слабым темам', color: 'bg-indigo-500', desc: 'Фокус на критичных предметах, ежедневные тренировки' },
    { weeks: [21, 28],label: 'Пробные экзамены', color: 'bg-purple-500', desc: 'Симуляции ЕНТ, разбор ошибок, работа над временем' },
    { weeks: [29, 36],label: 'Финальная подготовка', color: 'bg-rose-500', desc: 'Повторение, мотивационное письмо, документы' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-600" />
        Дорожная карта ({maxWeeks} недель)
      </h3>
      <div className="space-y-3">
        {phases.filter(p => p.weeks[0] <= maxWeeks).map(phase => (
          <div key={phase.label} className="flex gap-3 items-start">
            <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${phase.color}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900">{phase.label}</span>
                <span className="text-xs text-gray-400">нед. {phase.weeks[0]}–{Math.min(phase.weeks[1], maxWeeks)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{phase.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AdmissionPlan() {
  const { diagnosticResult } = useStore()
  const { programs: dbPrograms, universityProfiles: dbUniversities, syncFromServer } = useContentStore()

  useEffect(() => { syncFromServer() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Merge: DB entries override hardcoded by id
  const PROGRAMS = useMemo(() => {
    if (dbPrograms.length === 0) return HARDCODED_PROGRAMS
    const dbIds = new Set(dbPrograms.map(p => p.id))
    return [...dbPrograms, ...HARDCODED_PROGRAMS.filter(p => !dbIds.has(p.id))]
  }, [dbPrograms])

  const UNIVERSITIES = useMemo(() => {
    if (dbUniversities.length === 0) return HARDCODED_UNIVERSITIES
    const dbIds = new Set(dbUniversities.map(u => u.id))
    return [...dbUniversities, ...HARDCODED_UNIVERSITIES.filter(u => !dbIds.has(u.id))]
  }, [dbUniversities])

  // Local versions of lookup functions using merged data
  const getProgramsByField = (field: StudyField) => PROGRAMS.filter(p => p.field === field)
  const getUniversitiesByProgram = (programId: string) => UNIVERSITIES.filter(u => u.requirements.some(r => r.programId === programId))

  const [step, setStep] = useState<'field' | 'program' | 'results'>('field')
  const [selectedField, setSelectedField] = useState<StudyField | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [manualScores, setManualScores] = useState<ManualScores>({ total: 0 })
  const [sortBy, setSortBy] = useState<'chance' | 'tier'>('chance')

  const hasDiagnostic = !!diagnosticResult

  // Build subject scores from diagnostic or manual input
  function getSubjectScores(): { subject: import('@/types').Subject; percentage: number }[] {
    if (hasDiagnostic) {
      return diagnosticResult!.subjects.map(s => ({ subject: s.subject, percentage: s.percentage }))
    }
    if (!selectedProgram) return []
    const subjects = [...selectedProgram.requiredSubjects, ...selectedProgram.bonusSubjects]
    return subjects
      .filter(s => manualScores[s] !== undefined)
      .map(s => ({ subject: s, percentage: manualScores[s] }))
  }

  function getEntScore(): number {
    if (hasDiagnostic) return diagnosticResult!.overallScore
    return manualScores.total || 0
  }

  function buildChances(): UniversityChance[] {
    if (!selectedProgram) return []
    const entScore = getEntScore()
    const subjectScores = getSubjectScores()
    const unis = getUniversitiesByProgram(selectedProgram.id)

    return unis.map(uni => {
      const req = uni.requirements.find(r => r.programId === selectedProgram.id)!
      const { grant, paid, level } = calcChance(entScore, req)
      const subjectGaps = calcSubjectGaps(subjectScores, selectedProgram)
      const gap = req.grantEnt - entScore
      const recs = buildRecommendations(gap, req, subjectGaps)
      const timeToReady = estimateWeeks(Math.max(0, gap))

      return {
        university: uni,
        requirement: req,
        program: selectedProgram,
        entScore,
        chanceGrant: grant,
        chancePaid: paid,
        level,
        gap,
        subjectGaps,
        recommendations: recs,
        timeToReady,
      } satisfies UniversityChance
    })
  }

  const chances = step === 'results' ? buildChances() : []

  const sortedChances = [...chances].sort((a, b) => {
    if (sortBy === 'chance') return b.chanceGrant - a.chanceGrant
    return a.university.tier - b.university.tier
  })

  function handleFieldSelect(field: StudyField) {
    setSelectedField(field)
    setSelectedProgram(null)
    setStep('program')
  }

  function handleProgramSelect(program: Program) {
    setSelectedProgram(program)
    if (hasDiagnostic) {
      setStep('results')
    } else {
      setStep('results') // show with manual input
    }
  }

  function reset() {
    setStep('field')
    setSelectedField(null)
    setSelectedProgram(null)
    setManualScores({ total: 0 })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            Персональный план поступления
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Расчёт шансов на грант и дорожная карта подготовки
          </p>

          {/* Diagnostic banner */}
          {hasDiagnostic ? (
            <div className="mt-3 flex items-center gap-2 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Используем результаты диагностики — общий балл <strong>{diagnosticResult!.overallScore}</strong> из {diagnosticResult!.maxScore}
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 text-sm bg-amber-50 text-amber-700 border border-amber-200 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Диагностика не пройдена — введи баллы вручную
            </div>
          )}
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          {(['field', 'program', 'results'] as const).map((s, i) => {
            const labels = ['Направление', 'Специальность', 'Результат']
            const done = step === 'results' || (step === 'program' && i === 0)
            const active = step === s
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-4 h-4 text-gray-300" />}
                <span className={`font-medium ${active ? 'text-indigo-600' : done ? 'text-gray-400' : 'text-gray-300'}`}>
                  {labels[i]}
                </span>
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 1: Field ───────────────────────────────────────────────── */}
          {step === 'field' && (
            <motion.div key="field" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-indigo-500" />
                Выбери направление
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(Object.keys(FIELD_LABELS) as StudyField[]).map(field => {
                  const { label, emoji } = FIELD_LABELS[field]
                  const programCount = getProgramsByField(field).length
                  return (
                    <button
                      key={field}
                      onClick={() => handleFieldSelect(field)}
                      className="group text-left p-4 bg-white rounded-2xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                    >
                      <div className="text-2xl mb-2">{emoji}</div>
                      <div className="font-medium text-gray-800 text-sm leading-tight">{label}</div>
                      <div className="text-xs text-gray-400 mt-1">{programCount} специальностей</div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Program ─────────────────────────────────────────────── */}
          {step === 'program' && selectedField && (
            <motion.div key="program" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setStep('field')} className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                  <ChevronLeft className="w-4 h-4" /> Назад
                </button>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-600">{FIELD_LABELS[selectedField].emoji} {FIELD_LABELS[selectedField].label}</span>
              </div>

              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Выбери специальность
              </h2>

              <div className="grid gap-3">
                {getProgramsByField(selectedField).map(prog => {
                  const uniCount = getUniversitiesByProgram(prog.id).length
                  const subjects = [...prog.requiredSubjects, ...prog.bonusSubjects]
                  return (
                    <button
                      key={prog.id}
                      onClick={() => handleProgramSelect(prog)}
                      className="text-left p-4 bg-white rounded-2xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-gray-800">{prog.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Предметы: {subjects.map(s => SUBJECT_LABELS[s]).join(', ')}
                          </div>
                        </div>
                        <span className="shrink-0 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                          {uniCount} вузов
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Results ─────────────────────────────────────────────── */}
          {step === 'results' && selectedProgram && (
            <motion.div key="results" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setStep('program')} className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                  <ChevronLeft className="w-4 h-4" /> Назад
                </button>
                <button onClick={reset} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                  <RefreshCw className="w-3.5 h-3.5" /> Начать заново
                </button>
              </div>

              <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                {selectedProgram.name}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {FIELD_LABELS[selectedProgram.field].emoji} {FIELD_LABELS[selectedProgram.field].label}
              </p>

              {/* Manual score input if no diagnostic */}
              {!hasDiagnostic && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2 text-sm">Введи свои баллы ЕНТ</h3>
                  <ManualScoreInput
                    program={selectedProgram}
                    scores={manualScores}
                    onChange={setManualScores}
                  />
                  {!manualScores.total && (
                    <p className="text-xs text-amber-600 mt-2">Введи общий балл ЕНТ для расчёта шансов</p>
                  )}
                </div>
              )}

              {/* Sort */}
              {chances.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500">Сортировка:</span>
                    {(['chance', 'tier'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setSortBy(s)}
                        className={`text-xs px-3 py-1 rounded-full transition ${sortBy === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {s === 'chance' ? 'По шансам' : 'По рейтингу'}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {sortedChances.map(chance => (
                      <UniversityCard key={chance.university.id} chance={chance} />
                    ))}
                  </div>

                  <div className="mt-6">
                    <RoadmapTimeline chances={sortedChances} />
                  </div>

                  {/* Summary stats */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { label: 'Вузов доступно', value: chances.filter(c => c.level !== 'impossible').length, color: 'text-emerald-600' },
                      { label: 'На грант (шанс >50%)', value: chances.filter(c => c.chanceGrant > 50).length, color: 'text-indigo-600' },
                      { label: 'Элитных вузов', value: chances.filter(c => c.university.tier === 1).length, color: 'text-purple-600' },
                    ].map(s => (
                      <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Empty state if no score entered yet */}
              {!hasDiagnostic && !manualScores.total && (
                <div className="text-center py-12 text-gray-400">
                  <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Введи баллы ЕНТ выше, чтобы увидеть расчёт</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
