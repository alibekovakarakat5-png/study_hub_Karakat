import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, Sparkles } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { usePracticeEntStore } from '@/store/usePracticeEntStore'
import { generateRecommendations, type Recommendation } from '@/lib/recommendations'

const TYPE_COLORS: Record<string, string> = {
  study:      'bg-blue-50 border-blue-200 text-blue-700',
  practice:   'bg-purple-50 border-purple-200 text-purple-700',
  university: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  portfolio:  'bg-amber-50 border-amber-200 text-amber-700',
  career:     'bg-pink-50 border-pink-200 text-pink-700',
  challenge:  'bg-orange-50 border-orange-200 text-orange-700',
  ielts:      'bg-cyan-50 border-cyan-200 text-cyan-700',
}

const PRIORITY_DOT: Record<string, string> = {
  high:   'bg-red-400',
  medium: 'bg-amber-400',
  low:    'bg-gray-300',
}

function RecCard({ rec, index }: { rec: Recommendation; index: number }) {
  const colorClass = TYPE_COLORS[rec.type] ?? TYPE_COLORS.study

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link
        to={rec.href}
        className={`group flex items-start gap-4 rounded-xl border p-4 transition-all hover:shadow-md ${colorClass}`}
      >
        <div className="mt-0.5 text-2xl">{rec.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{rec.title}</span>
            {rec.badge && (
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-gray-600 border border-current/20">
                {rec.badge}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-gray-600 leading-snug">{rec.description}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-current opacity-80 group-hover:opacity-100">
            {rec.cta} <ChevronRight className="h-3 w-3" />
          </span>
        </div>
        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${PRIORITY_DOT[rec.priority]}`} />
      </Link>
    </motion.div>
  )
}

export default function RecommendationsWidget() {
  const [expanded, setExpanded] = useState(false)
  const { user, diagnosticResult, studyPlan } = useStore()
  const { history: entHistory } = usePracticeEntStore()

  const recs = useMemo(
    () => generateRecommendations({ user, diagnostic: diagnosticResult, entHistory, studyPlan }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.streak, user?.lastActiveDate, diagnosticResult?.id, entHistory.length, studyPlan?.id],
  )

  if (recs.length === 0) return null

  const visible = expanded ? recs : recs.slice(0, 3)
  const highPriorityCount = recs.filter(r => r.priority === 'high').length

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h2 className="font-bold text-gray-900">Умные рекомендации</h2>
          {highPriorityCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
              {highPriorityCount}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{recs.length} подсказок</span>
      </div>

      {/* Cards */}
      <div className="space-y-2 p-4">
        <AnimatePresence initial={false}>
          {visible.map((rec, i) => (
            <RecCard key={rec.id} rec={rec} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {/* Expand / collapse */}
      {recs.length > 3 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex w-full items-center justify-center gap-1 border-t border-gray-100 py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {expanded ? 'Свернуть' : `Ещё ${recs.length - 3} рекомендации`}
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  )
}
