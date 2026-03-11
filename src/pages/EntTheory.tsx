import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronRight, BookOpen, Lightbulb, Zap, Target } from 'lucide-react'
import { ENT_THEORY } from '@/data/entTheory'
import type { TheoryTopic, SubjectTheory } from '@/data/entTheory'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
}

// ── Topic card ────────────────────────────────────────────────────────────────

function TopicCard({ topic, color }: { topic: TheoryTopic; color: string }) {
  const [open, setOpen] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set())

  const toggleAnswer = (i: number) => {
    setRevealedAnswers(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i); else next.add(i)
      return next
    })
  }

  return (
    <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-white font-semibold text-sm">{topic.title}</span>
          <span className="text-white/40 text-xs">{topic.examples.length} примеров</span>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-white/40 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-white/10">
              {/* Theory paragraphs */}
              <div className="pt-4 space-y-2">
                <div className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />Теория
                </div>
                {topic.theory.map((p, i) => (
                  <p key={i} className="text-white/80 text-sm leading-relaxed">{p}</p>
                ))}
              </div>

              {/* Formulas */}
              {topic.formulas && topic.formulas.length > 0 && (
                <div className="bg-white/8 border border-white/15 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5" />Формулы
                  </div>
                  {topic.formulas.map((f, i) => (
                    <div key={i} className="font-mono text-sm text-amber-200 bg-black/30 rounded-lg px-3 py-1.5 border border-amber-500/20">
                      {f}
                    </div>
                  ))}
                </div>
              )}

              {/* Key points */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-green-300 text-xs font-semibold uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5" />Запомни
                </div>
                {topic.keyPoints.map((kp, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                    <span>{kp}</span>
                  </div>
                ))}
              </div>

              {/* Tips */}
              {topic.tips && topic.tips.length > 0 && (
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-2 text-violet-300 text-xs font-semibold">
                    <Lightbulb className="w-3.5 h-3.5" />Лайфхак ЕНТ
                  </div>
                  {topic.tips.map((tip, i) => (
                    <p key={i} className="text-violet-200 text-xs leading-relaxed">{tip}</p>
                  ))}
                </div>
              )}

              {/* Examples toggle */}
              <button
                type="button"
                onClick={() => setShowExamples(s => !s)}
                className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors"
              >
                <ChevronRight className={cn('w-4 h-4 transition-transform', showExamples && 'rotate-90')} />
                {showExamples ? 'Скрыть' : 'Показать'} примеры ({topic.examples.length})
              </button>

              {showExamples && (
                <div className="space-y-3">
                  {topic.examples.map((ex, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                      <p className="text-white text-sm font-medium">{ex.question}</p>
                      {ex.hint && (
                        <p className="text-white/50 text-xs italic">{ex.hint}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleAnswer(i)}
                        className={cn(
                          'w-full text-left text-sm rounded-lg px-3 py-2 transition-all',
                          revealedAnswers.has(i)
                            ? 'bg-green-500/15 border border-green-500/30 text-green-200'
                            : 'bg-white/10 border border-white/20 text-white/50 hover:bg-white/15',
                        )}
                      >
                        {revealedAnswers.has(i) ? `✅ ${ex.answer}` : '👆 Показать ответ'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Subject panel ─────────────────────────────────────────────────────────────

function SubjectPanel({ subject }: { subject: SubjectTheory }) {
  return (
    <motion.div variants={fadeUp} className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{subject.icon}</span>
        <div>
          <h2 className="text-white font-bold text-lg">{subject.name}</h2>
          <p className="text-white/50 text-xs">{subject.topics.length} тем</p>
        </div>
        <Link
          to={`/topic-drill?subject=${subject.subject}`}
          className="ml-auto flex items-center gap-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
        >
          <Zap className="w-3 h-3" />Тренировка
        </Link>
      </div>
      <div className="space-y-2">
        {subject.topics.map(t => (
          <TopicCard key={t.id} topic={t} color={subject.color} />
        ))}
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EntTheory() {
  const [activeSubject, setActiveSubject] = useState<string>(ENT_THEORY[0].subject)

  const current = ENT_THEORY.find(s => s.subject === activeSubject) ?? ENT_THEORY[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/dashboard" className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Теория ЕНТ</h1>
            <p className="text-white/50 text-xs">Формулы, ключевые даты, примеры</p>
          </div>
          <Link
            to="/practice-ent"
            className="ml-auto flex items-center gap-2 bg-blue-600/80 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Пробный ЕНТ
          </Link>
        </div>

        {/* Subject tabs */}
        <div className="max-w-3xl mx-auto px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {ENT_THEORY.map(s => (
              <button
                key={s.subject}
                type="button"
                onClick={() => setActiveSubject(s.subject)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
                  activeSubject === s.subject
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-white/10 text-white/60 hover:bg-white/15',
                )}
                style={activeSubject === s.subject ? { background: s.color } : {}}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubject}
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
          >
            <SubjectPanel subject={current} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
