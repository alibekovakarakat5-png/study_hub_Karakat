import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Rocket, Lightbulb, Target, TrendingUp, Users, DollarSign,
  CheckCircle, Circle, ChevronDown, ChevronRight, ExternalLink, Zap,
  BarChart2, Globe, Award, RefreshCw,
} from 'lucide-react'
import {
  analyzeIdea, COMPLEXITY_LABELS, PROJECT_TYPE_LABELS,
  type AnalysisResult, type RoadmapStep,
} from '@/data/startupTemplates'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
}

// ── Roadmap step card ──────────────────────────────────────────────────────────

function StepCard({ step, index, isActive, onToggle }: {
  step: RoadmapStep
  index: number
  isActive: boolean
  onToggle: () => void
}) {
  return (
    <motion.div variants={fadeUp} className="relative">
      {/* Connector line */}
      {index < 6 && (
        <div className="absolute left-5 top-14 w-0.5 h-6 bg-white/10 z-0" />
      )}
      <div className={cn(
        'relative z-10 bg-white/5 border rounded-2xl overflow-hidden transition-all',
        isActive ? 'border-violet-500/40' : 'border-white/10',
      )}>
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors"
        >
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0',
            isActive ? 'bg-violet-500/20' : 'bg-white/8',
          )}>
            {step.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-xs font-bold">ЭТАП {step.phase}</span>
              <span className="text-white/30 text-xs">·</span>
              <span className="text-white/40 text-xs">{step.duration}</span>
            </div>
            <p className="text-white font-semibold text-sm">{step.title}</p>
          </div>
          <div className="shrink-0 text-xs font-medium text-white/40 bg-white/8 px-2.5 py-1 rounded-full">
            {step.deliverable}
          </div>
          <ChevronDown className={cn('w-4 h-4 text-white/40 shrink-0 transition-transform', isActive && 'rotate-180')} />
        </button>

        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-3 border-t border-white/10">
                <p className="text-white/60 text-sm pt-3">{step.description}</p>
                <div className="space-y-1.5">
                  {step.tasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <ChevronRight className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-2">
                  <p className="text-violet-300 text-xs font-semibold">Результат этапа</p>
                  <p className="text-violet-200 text-sm">{step.deliverable}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Workspace (after analysis) ─────────────────────────────────────────────────

function ProjectWorkspace({ result, idea, onReset }: {
  result: AnalysisResult
  idea: string
  onReset: () => void
}) {
  const [activeStep, setActiveStep] = useState<number | null>(0)
  const [activeTab, setActiveTab] = useState<'roadmap' | 'market' | 'invest'>('roadmap')
  const [checklist, setChecklist] = useState(result.checklist)

  const completedCount = checklist.filter(c => c.done).length
  const readiness = Math.round((completedCount / checklist.length) * 100)

  const toggleCheck = (i: number) => {
    setChecklist(prev => prev.map((c, idx) => idx === i ? { ...c, done: !c.done } : c))
  }

  const cmplx = COMPLEXITY_LABELS[result.complexity]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
      className="space-y-5"
    >
      {/* Project header */}
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-violet-500/15 to-blue-500/10 border border-violet-500/20 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl">{result.shortDescription.split(' ')[0]}</span>
              <span className="bg-violet-500/20 text-violet-300 text-xs font-bold px-2.5 py-1 rounded-full">
                {PROJECT_TYPE_LABELS[result.projectType]}
              </span>
              <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full bg-white/10', cmplx.color)}>
                {cmplx.label}
              </span>
            </div>
            <p className="text-white font-bold text-lg leading-snug line-clamp-2">{idea}</p>
            <p className="text-white/50 text-sm">{result.shortDescription.slice(result.shortDescription.indexOf(' ') + 1)}</p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/40 hover:text-white/70 shrink-0"
            title="Новая идея"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Investor readiness meter */}
      <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-white font-semibold text-sm">Investor Readiness</span>
          </div>
          <span className="text-amber-400 font-bold text-xl">{readiness}%</span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${readiness}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="space-y-2">
          {checklist.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleCheck(i)}
              className="w-full flex items-center gap-2.5 text-left hover:bg-white/5 rounded-lg px-2 py-1.5 transition-colors"
            >
              {item.done
                ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                : <Circle className="w-4 h-4 text-white/30 shrink-0" />
              }
              <span className={cn('text-sm', item.done ? 'text-white/70 line-through' : 'text-white/60')}>{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex gap-2">
        {([
          { id: 'roadmap', label: 'Roadmap', icon: <Rocket className="w-3.5 h-3.5" /> },
          { id: 'market', label: 'Рынок', icon: <BarChart2 className="w-3.5 h-3.5" /> },
          { id: 'invest', label: 'Инвесторы', icon: <Globe className="w-3.5 h-3.5" /> },
        ] as const).map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all',
              activeTab === tab.id
                ? 'bg-violet-600 text-white'
                : 'bg-white/8 text-white/50 hover:bg-white/12',
            )}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'roadmap' && (
          <motion.div key="roadmap" initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
            className="space-y-3"
          >
            {result.roadmap.map((step, i) => (
              <StepCard
                key={step.id}
                step={step}
                index={i}
                isActive={activeStep === i}
                onToggle={() => setActiveStep(activeStep === i ? null : i)}
              />
            ))}
          </motion.div>
        )}

        {activeTab === 'market' && (
          <motion.div key="market" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Market size */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-green-300 text-sm font-semibold">
                <TrendingUp className="w-4 h-4" />Объем рынка
              </div>
              <p className="text-white/80 text-sm">{result.marketSize}</p>
            </div>

            {/* Problem & audience */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-blue-300 text-sm font-semibold">
                  <Target className="w-4 h-4" />Целевая аудитория
                </div>
                <p className="text-white/70 text-sm">{result.targetAudience}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
                  <Lightbulb className="w-4 h-4" />Уникальное преимущество
                </div>
                <p className="text-white/70 text-sm">{result.uniqueAdvantage}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-violet-300 text-sm font-semibold">
                <Zap className="w-4 h-4" />Необходимые навыки
              </div>
              <div className="space-y-2">
                {result.skills.map((skill, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{skill.icon}</span>
                      <span className="text-white/70 text-sm">{skill.name}</span>
                    </div>
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', {
                      'bg-green-500/15 text-green-400': skill.level === 'basic',
                      'bg-amber-500/15 text-amber-400': skill.level === 'intermediate',
                      'bg-red-500/15 text-red-400': skill.level === 'advanced',
                    })}>
                      {skill.level === 'basic' ? 'Базовый' : skill.level === 'intermediate' ? 'Средний' : 'Продвинутый'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monetization */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-green-300 text-sm font-semibold">
                <DollarSign className="w-4 h-4" />Монетизация
              </div>
              <div className="flex flex-wrap gap-2">
                {result.monetization.map((m, i) => (
                  <span key={i} className="bg-green-500/10 border border-green-500/20 text-green-300 text-xs px-3 py-1.5 rounded-full">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Competitors */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-red-300 text-sm font-semibold">
                <Users className="w-4 h-4" />Конкуренты
              </div>
              <div className="flex flex-wrap gap-2">
                {result.competitors.map((c, i) => (
                  <span key={i} className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs px-3 py-1.5 rounded-full">
                    {c}
                  </span>
                ))}
              </div>
              <p className="text-white/40 text-xs">Конкуренция — это хорошо. Значит рынок существует.</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'invest' && (
          <motion.div key="invest" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
              <p className="text-amber-300 text-sm font-semibold">Акселераторы Казахстана</p>
              <p className="text-amber-200/70 text-xs mt-1">
                Подавай заявки после MVP и первых пользователей. Большинство дают от $10K до $50K + менторство.
              </p>
            </div>

            <div className="space-y-3">
              {result.accelerators.map((acc, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="text-2xl">{acc.flag}</div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{acc.name}</p>
                    <p className="text-white/50 text-xs">{acc.country} · {acc.focus}</p>
                  </div>
                  <a
                    href={acc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-semibold transition-colors"
                  >
                    Сайт <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

            {/* Additional generic accelerators */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <p className="text-white/60 text-sm font-semibold">Что нужно для подачи:</p>
              {[
                'Рабочий MVP или прототип',
                'Минимум 50-100 пользователей или первые продажи',
                'Pitch Deck (10 слайдов по шаблону Y Combinator)',
                'Описание команды (даже solo founder — нормально)',
                'Метрики: рост пользователей, retention, revenue',
              ].map((req, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
              <p className="text-blue-300 text-sm font-semibold mb-2">Гранты в Казахстане</p>
              <div className="space-y-2">
                {[
                  { name: 'QazInnovations', amount: 'до 50M тенге', focus: 'Инновационные проекты' },
                  { name: 'Digital Kazakhstan', amount: 'гранты на цифровизацию', focus: 'GovTech / Digital' },
                  { name: 'NATD', amount: 'до 150M тенге', focus: 'Технологические стартапы' },
                ].map((g, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-white/70">{g.name}</span>
                    <span className="text-green-400 text-xs font-semibold">{g.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Idea input screen ──────────────────────────────────────────────────────────

function IdeaInput({ onAnalyze }: { onAnalyze: (idea: string) => void }) {
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)

  const EXAMPLES = [
    'Приложение для поиска репетиторов в Казахстане',
    'AI помощник для бухгалтеров на русском языке',
    'Маркетплейс домашней еды от мам',
    'Платформа для фрилансеров из СНГ',
    'Онлайн-школа программирования для школьников',
  ]

  const handleSubmit = () => {
    if (!idea.trim() || idea.trim().length < 10) return
    setLoading(true)
    setTimeout(() => {
      onAnalyze(idea.trim())
      setLoading(false)
    }, 1800)
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
      className="space-y-6"
    >
      {/* Hero */}
      <motion.div variants={fadeUp} className="text-center space-y-3 py-4">
        <div className="text-5xl">🚀</div>
        <h2 className="text-white font-bold text-2xl">AI Co-Founder</h2>
        <p className="text-white/50 text-sm max-w-xs mx-auto">
          Напиши свою идею — получишь полный план реализации, анализ рынка и roadmap до инвестиций
        </p>
      </motion.div>

      {/* Textarea */}
      <motion.div variants={fadeUp} className="space-y-3">
        <textarea
          value={idea}
          onChange={e => setIdea(e.target.value)}
          placeholder="Опиши свою идею... Например: хочу создать приложение для поиска репетиторов по ЕНТ в Казахстане"
          rows={4}
          className="w-full bg-white/8 border border-white/15 rounded-2xl px-4 py-3 text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={idea.trim().length < 10 || loading}
          className={cn(
            'w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2',
            idea.trim().length >= 10 && !loading
              ? 'bg-violet-600 hover:bg-violet-500 text-white'
              : 'bg-white/10 text-white/30 cursor-not-allowed',
          )}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Анализирую идею...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />Анализировать идею
            </>
          )}
        </button>
      </motion.div>

      {/* Example ideas */}
      <motion.div variants={fadeUp} className="space-y-3">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Примеры идей</p>
        <div className="space-y-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdea(ex)}
              className="w-full text-left text-sm text-white/60 hover:text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-4 py-2.5 transition-all"
            >
              💡 {ex}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StartupLab() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [currentIdea, setCurrentIdea] = useState('')

  const handleAnalyze = (idea: string) => {
    setCurrentIdea(idea)
    setResult(analyzeIdea(idea))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/30 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/dashboard" className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight flex items-center gap-2">
              🚀 Startup Lab
            </h1>
            <p className="text-white/50 text-xs">Из идеи — в стартап</p>
          </div>
          {result && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-white/40 text-xs">Investor Ready</span>
              <span className="text-amber-400 font-bold text-sm">
                {Math.round((result.checklist.filter(c => c.done).length / result.checklist.length) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="workspace" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ProjectWorkspace
                result={result}
                idea={currentIdea}
                onReset={() => setResult(null)}
              />
            </motion.div>
          ) : (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <IdeaInput onAnalyze={handleAnalyze} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
