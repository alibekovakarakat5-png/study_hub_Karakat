import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot,
} from 'recharts'
import { TrendingUp, Target, FileCheck2, Trophy } from 'lucide-react'
import { analyticsApi, type StudentAnalytics } from '@/lib/api'

// Student progress analytics: score-over-time (diagnostics + ENT mock attempts)
// plus activity stats. Lives on the student Dashboard.

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export default function ProgressAnalytics() {
  const [data, setData]       = useState<StudentAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsApi.me().then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const hasTimeline = data.timeline.length > 0
  const chartData = data.timeline.map((p, i) => ({
    idx: i,
    name: fmtDate(p.date),
    percentage: p.percentage,
    type: p.type,
    label: p.label,
  }))

  // Trend: compare last vs first timeline point
  const trend = hasTimeline && data.timeline.length >= 2
    ? data.timeline[data.timeline.length - 1]!.percentage - data.timeline[0]!.percentage
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Динамика прогресса</h3>
        </div>
        {trend !== null && (
          <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
            trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% с начала
          </span>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Target className="w-4 h-4 text-blue-500" />} label="Диагностик" value={data.activity.diagnosticsCount} />
        <StatCard icon={<FileCheck2 className="w-4 h-4 text-orange-500" />} label="Пробных ЕНТ" value={data.activity.entCount} />
        <StatCard icon={<Trophy className="w-4 h-4 text-amber-500" />} label="Лучший ЕНТ" value={data.activity.bestEnt !== null ? `${data.activity.bestEnt}%` : '—'} />
        <StatCard icon={<FileCheck2 className="w-4 h-4 text-green-500" />} label="Ср. балл ДЗ" value={data.activity.avgAssignmentScore !== null ? `${data.activity.avgAssignmentScore}%` : '—'} />
      </div>

      {/* Timeline chart */}
      {hasTimeline ? (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={11} tickLine={false} axisLine={false} width={44} />
              <Tooltip
                formatter={((v: number, _n: unknown, item: { payload?: { label?: string } }) => [`${v}%`, item?.payload?.label ?? 'Балл']) as never}
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
              />
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#scoreGrad)"
                dot={(props) => {
                  const { cx, cy, payload, index } = props as { cx: number; cy: number; payload: { type: string }; index: number }
                  return <Dot key={index} cx={cx} cy={cy} r={4} fill={payload.type === 'ent' ? '#f97316' : '#3b82f6'} stroke="#fff" strokeWidth={2} />
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-40 flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-10 h-10 text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">Пройди диагностику или пробный ЕНТ —<br />здесь появится график твоего роста</p>
        </div>
      )}

      {hasTimeline && (
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Диагностика</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Пробный ЕНТ</span>
        </div>
      )}
    </motion.div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
