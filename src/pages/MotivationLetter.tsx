import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Check, Copy, Download, Lightbulb,
  AlertCircle, ChevronDown, ChevronUp, FileText, Sparkles, RefreshCw,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  FIELDS, LETTER_STEPS, FIELD_TIPS, FIELD_EXAMPLES,
  LETTER_STRUCTURE, SUBMISSION_CHECKLIST,
  type LetterField,
} from '@/data/motivationLetterData'

// ── Word count helper ─────────────────────────────────────────────────────────

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ── Step progress bar ─────────────────────────────────────────────────────────

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-all duration-500',
            i < current ? 'bg-primary-600' : i === current ? 'bg-primary-300' : 'bg-slate-200',
          )}
        />
      ))}
    </div>
  )
}

// ── Hint box ─────────────────────────────────────────────────────────────────

function HintBox({ hints, mistakes, openers }: { hints: string[]; mistakes: string[]; openers: string[] }) {
  const [tab, setTab] = useState<'hints' | 'mistakes' | 'openers'>('hints')
  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="flex border-b border-slate-100">
        {(['hints', 'mistakes', 'openers'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2.5 text-xs font-semibold transition-colors',
              tab === t ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {t === 'hints' ? '💡 Советы' : t === 'mistakes' ? '🚫 Ошибки' : '✍️ Начало'}
          </button>
        ))}
      </div>
      <div className="p-4 space-y-2">
        {tab === 'hints' && hints.map((h, i) => (
          <div key={i} className="flex gap-2 text-xs text-slate-600">
            <span className="text-primary-500 font-bold shrink-0">→</span>
            <span>{h}</span>
          </div>
        ))}
        {tab === 'mistakes' && mistakes.map((m, i) => (
          <div key={i} className="flex gap-2 text-xs text-red-600 bg-red-50 rounded-lg p-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{m}</span>
          </div>
        ))}
        {tab === 'openers' && openers.map((o, i) => (
          <button
            key={i}
            className="w-full text-left text-xs text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg px-3 py-2 transition-colors"
            onClick={() => navigator.clipboard.writeText(o)}
          >
            "{o}" <span className="text-primary-400 ml-1">↗</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Letter preview ────────────────────────────────────────────────────────────

function LetterPreview({ steps, values, field }: {
  steps: typeof LETTER_STEPS
  values: Record<string, string>
  field: LetterField
}) {
  const [copied, setCopied] = useState(false)
  const fullText = steps.map(s => values[s.id] || '').filter(Boolean).join('\n\n')

  const copy = () => {
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const blob = new Blob([fullText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `motivation-letter-${field}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">Предпросмотр письма</span>
          <span className="text-xs text-slate-400">({wordCount(fullText)} слов)</span>
        </div>
        <div className="flex gap-2">
          <button onClick={copy} className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-primary-300 transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Скопировано' : 'Копировать'}
          </button>
          <button onClick={download} className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Скачать
          </button>
        </div>
      </div>
      <div className="p-6 max-h-96 overflow-y-auto">
        {fullText ? (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-serif">
            {fullText}
          </div>
        ) : (
          <p className="text-slate-400 text-sm text-center py-8">Начните заполнять шаги — письмо появится здесь</p>
        )}
      </div>
    </div>
  )
}

// ── Checklist ─────────────────────────────────────────────────────────────────

function Checklist({ values }: { values: Record<string, string> }) {
  const totalWords = Object.values(values).reduce((acc, v) => acc + wordCount(v), 0)
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
      <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <Check className="w-4 h-4 text-green-500" />
        Чеклист перед отправкой
      </h4>
      <div className="space-y-2">
        {SUBMISSION_CHECKLIST.map((item) => {
          const done = item.id === 'length'
            ? totalWords >= 500 && totalWords <= 800
            : Boolean(values[item.id])
          return (
            <div key={item.id} className="flex items-center gap-2">
              <div className={cn('w-4 h-4 rounded-full flex items-center justify-center shrink-0', done ? 'bg-green-500' : 'bg-slate-100')}>
                {done && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className={cn('text-xs', done ? 'text-slate-700' : 'text-slate-400')}>{item.text}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">Всего слов</span>
        <span className={cn(
          'text-xs font-bold',
          totalWords < 500 ? 'text-amber-500' : totalWords <= 800 ? 'text-green-600' : 'text-red-500',
        )}>
          {totalWords} / 500–800
        </span>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MotivationLetter() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'field' | 'build' | 'review'>('field')
  const [field, setField] = useState<LetterField | null>(null)
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [showTips, setShowTips] = useState(false)
  const [showExamples, setShowExamples] = useState(false)

  const currentStep = LETTER_STEPS[step]
  const currentValue = values[currentStep?.id] ?? ''
  const wc = wordCount(currentValue)
  const wcOk = wc >= currentStep?.minWords && wc <= currentStep?.maxWords

  const fieldMeta = useMemo(() => FIELDS.find(f => f.id === field), [field])

  // ── Field selection phase ─────────────────────────────────────────────────

  if (phase === 'field') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50/30 p-4 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Назад
          </button>

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 text-sm font-semibold text-primary-700 mb-4">
              <Sparkles className="w-4 h-4" />
              Мотивационное письмо
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Выберите вашу область</h1>
            <p className="text-slate-500 text-base max-w-xl mx-auto">
              Каждая область имеет свои стандарты и ожидания. Выберите — и получите советы, примеры и шаблоны именно для вашей специальности.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {FIELDS.map((f) => (
              <button
                key={f.id}
                onClick={() => setField(f.id)}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all hover:-translate-y-0.5',
                  field === f.id
                    ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
                    : 'border-slate-100 bg-white hover:border-primary-200 hover:shadow-md',
                )}
              >
                <span className="text-2xl">{f.emoji}</span>
                <span className="text-sm font-semibold text-slate-700">{f.label}</span>
              </button>
            ))}
          </div>

          {field && (
            <div className="text-center">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setPhase('build')}
                className="inline-flex items-center gap-2 gradient-primary rounded-2xl px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary-500/25 hover:-translate-y-0.5 transition-all"
              >
                Начать письмо
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Build phase ───────────────────────────────────────────────────────────

  if (phase === 'build') {
    return (
      <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => { setPhase('field'); setStep(0) }} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{fieldMeta?.emoji}</span>
                <span className="text-sm font-medium text-slate-600">{fieldMeta?.label}</span>
                <span className="text-slate-300">·</span>
                <span className="text-sm text-slate-500">Шаг {step + 1} из {LETTER_STEPS.length}</span>
              </div>
              <StepBar current={step + 1} total={LETTER_STEPS.length} />
            </div>
            <button
              onClick={() => setPhase('review')}
              className="flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Предпросмотр
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: editor */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-1">{currentStep.title}</h2>
                <p className="text-sm text-slate-500 mb-4">{currentStep.subtitle}</p>

                <textarea
                  value={currentValue}
                  onChange={(e) => setValues(v => ({ ...v, [currentStep.id]: e.target.value }))}
                  placeholder={currentStep.placeholder}
                  rows={8}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none transition-colors"
                />

                {/* Word count */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', wc < currentStep.minWords ? 'bg-amber-400' : wcOk ? 'bg-green-500' : 'bg-red-400')} />
                    <span className="text-xs text-slate-500">
                      {wc} слов · цель: {currentStep.minWords}–{currentStep.maxWords}
                    </span>
                  </div>
                  {currentValue && (
                    <button
                      onClick={() => setValues(v => ({ ...v, [currentStep.id]: '' }))}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Очистить
                    </button>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setStep(s => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Назад
                  </button>

                  {step < LETTER_STEPS.length - 1 ? (
                    <button
                      onClick={() => setStep(s => s + 1)}
                      className="flex items-center gap-2 gradient-primary rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-500/20 hover:-translate-y-0.5 transition-all"
                    >
                      Далее <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setPhase('review')}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5"
                    >
                      <Check className="w-4 h-4" /> Готово — просмотр
                    </button>
                  )}
                </div>
              </div>

              {/* Field-specific tips */}
              {field && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <button
                    onClick={() => setShowTips(v => !v)}
                    className="flex items-center justify-between w-full"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      Советы для {fieldMeta?.label}
                    </div>
                    {showTips ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />}
                  </button>
                  <AnimatePresence>
                    {showTips && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-2">
                          {FIELD_TIPS[field].map((tip, i) => (
                            <div key={i} className="flex gap-2 text-xs text-amber-800">
                              <span className="font-bold shrink-0">✦</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Right: hints + examples */}
            <div className="lg:col-span-2 space-y-4">
              <HintBox
                hints={currentStep.hints}
                mistakes={currentStep.mistakes}
                openers={currentStep.exampleOpeners}
              />

              {/* Real examples */}
              {field && step === 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <button
                    onClick={() => setShowExamples(v => !v)}
                    className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-700">📖 Примеры реальных писем</span>
                    {showExamples ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  <AnimatePresence>
                    {showExamples && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3">
                          {FIELD_EXAMPLES[field].map((ex, i) => (
                            <div key={i} className="rounded-xl bg-slate-50 p-3">
                              <p className="text-xs font-semibold text-primary-700 mb-1">{ex.university}</p>
                              <p className="text-xs text-slate-600 italic">"{ex.opener}"</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Step list */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Структура письма</h4>
                <div className="space-y-2">
                  {LETTER_STEPS.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setStep(i)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors',
                        i === step ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-50 text-slate-600',
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
                        wordCount(values[s.id] ?? '') >= s.minWords
                          ? 'bg-green-500 text-white'
                          : i === step
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-200 text-slate-500',
                      )}>
                        {wordCount(values[s.id] ?? '') >= s.minWords ? <Check className="w-3 h-3" /> : i + 1}
                      </div>
                      <span className="text-xs font-medium truncate">{s.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Review phase ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setPhase('build')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Редактировать
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Ваше мотивационное письмо</h1>
            <p className="text-sm text-slate-500">{fieldMeta?.emoji} {fieldMeta?.label}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LetterPreview steps={LETTER_STEPS} values={values} field={field!} />

            {/* Structure tips */}
            <div className="mt-4 bg-white rounded-2xl border border-slate-100 p-5">
              <h4 className="text-sm font-bold text-slate-800 mb-3">📐 Структура: что должно быть</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-green-700 mb-2">✅ Должно быть</p>
                  {LETTER_STRUCTURE.dos.map((d, i) => (
                    <p key={i} className="text-xs text-slate-600 mb-1">• {d}</p>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-700 mb-2">❌ Не делайте</p>
                  {LETTER_STRUCTURE.donts.map((d, i) => (
                    <p key={i} className="text-xs text-slate-600 mb-1">• {d}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Checklist values={values} />

            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-primary-900 mb-2">💡 Идеальное письмо</h4>
              <div className="space-y-1.5 text-xs text-primary-800">
                <p>📏 Длина: <strong>{LETTER_STRUCTURE.idealLength}</strong></p>
                <p>📝 Абзацев: <strong>{LETTER_STRUCTURE.paragraphs}</strong></p>
                <p>🎯 Тон: <strong>{LETTER_STRUCTURE.tone}</strong></p>
              </div>
            </div>

            <button
              onClick={() => { setPhase('field'); setStep(0); setValues({}); setField(null) }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Начать заново
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
