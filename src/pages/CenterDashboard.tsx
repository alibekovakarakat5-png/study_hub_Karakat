// ── Center Dashboard — B2B Admin Dashboard for Educational Centers ─────────────

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Users, BookOpen, BarChart3, TrendingUp,
  Copy, Check, UserMinus, Plus, Building2, AlertCircle,
  Loader2, Search, X, RefreshCw, School, Upload, Clock,
  FileText, Download, ExternalLink, MessageCircle, Sparkles,
  Settings, Save
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  orgsApi, reportsApi,
  type DBOrganization,
  type OrgDashboard,
  type OrgTeacherStats,
  type OrgStudentStats,
  type OrgUpdatePayload,
} from '@/lib/api'
import { useStore } from '@/store/useStore'
import { PageMeta } from '@/components/PageMeta'
import Sidebar from '@/components/dashboard/Sidebar'
import { openWhatsApp, buildOrgActivationMessage } from '@/lib/whatsapp'

// ── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'overview' | 'teachers' | 'students' | 'analytics' | 'import' | 'reports' | 'settings'

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number | null) {
  if (score === null) return 'text-slate-500'
  if (score >= 70) return 'text-green-500'
  if (score >= 50) return 'text-yellow-500'
  return 'text-red-500'
}

function scoreText(score: number | null) {
  return score === null ? '—' : `${score}%`
}

function ActivityBadge({ days }: { days: number }) {
  if (days <= 7)   return <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/30 rounded-full px-2 py-0.5">Активен</span>
  if (days <= 14)  return <span className="text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 rounded-full px-2 py-0.5">Не активен</span>
  return                  <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">Пропускает</span>
}

function StatCard({ label, value, icon, sub }: { label: string; value: string | number; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
          {icon}
        </div>
        <span className="text-slate-500 text-sm">{label}</span>
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  )
}

// ── Create Org Modal ──────────────────────────────────────────────────────────

function CreateOrgModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (data: { name: string; type: string; city?: string }) => Promise<void>
}) {
  const [form, setForm] = useState({ name: '', type: 'tutoring_center', city: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Введите название центра'); return }
    setLoading(true)
    try {
      await onCreate({ name: form.name.trim(), type: form.type, city: form.city || undefined })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Создать организацию</h2>
            <p className="text-sm text-slate-500">Зарегистрируйте ваш учебный центр</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Название центра</label>
            <input
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Например: Центр «Алтын»"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Тип организации</label>
            <select
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="tutoring_center">Учебный центр</option>
              <option value="school">Школа</option>
              <option value="corporate">Корпоративное обучение</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Город <span className="text-slate-400">(необязательно)</span></label>
            <input
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Алматы"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-3">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-700 rounded-xl py-2.5 text-sm hover:bg-slate-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Создать
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({
  dashboard,
  onInvite,
}: {
  dashboard: OrgDashboard
  onInvite: () => void
}) {
  const { user } = useStore()
  const { stats, teachers } = dashboard

  const topTeachers = [...teachers]
    .sort((a, b) => (b.avgScore ?? -1) - (a.avgScore ?? -1))
    .slice(0, 3)

  const handleRequestActivation = () => {
    openWhatsApp(buildOrgActivationMessage({
      orgName:      dashboard.org.name,
      orgType:      dashboard.org.type,
      city:         dashboard.org.city ?? undefined,
      teacherCount: stats.totalTeachers,
      studentCount: stats.totalStudents,
      ownerName:    user?.name,
    }))
  }

  return (
    <div className="space-y-6">
      {/* Activation CTA — B2B billing by WhatsApp request */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Подключение центра
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">
              Активируйте полный доступ для вашего центра
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Стоимость зависит от количества учеников и учителей. Напишите нам — подберём условия под ваш центр.
            </p>
          </div>
          <button
            onClick={handleRequestActivation}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-3 rounded-xl text-sm transition-colors whitespace-nowrap shadow-sm"
          >
            <MessageCircle size={16} />
            Написать в WhatsApp
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Учителей"  value={stats.totalTeachers}    icon={<Users size={18} />} />
        <StatCard label="Учеников"  value={stats.totalStudents}     icon={<LayoutGrid size={18} />} />
        <StatCard label="Заданий"   value={stats.totalAssignments}  icon={<BookOpen size={18} />} />
        <StatCard
          label="Средний балл"
          value={stats.avgScore !== null ? `${stats.avgScore}%` : '—'}
          icon={<TrendingUp size={18} />}
          sub={stats.avgScore !== null ? (stats.avgScore >= 70 ? '🟢 Отлично' : stats.avgScore >= 50 ? '🟡 Средне' : '🔴 Низко') : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top teachers */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">🏆 Топ учителей по баллам</h3>
          {topTeachers.length === 0 ? (
            <p className="text-slate-400 text-sm">Нет данных — учителя ещё не добавлены</p>
          ) : (
            <div className="space-y-3">
              {topTeachers.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-700'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.studentCount} учеников · {t.classCount} классов</div>
                  </div>
                  <div className={`text-sm font-bold ${scoreColor(t.avgScore)}`}>
                    {scoreText(t.avgScore)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invite code */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 mb-2">Пригласить учителей</h3>
          <p className="text-sm text-slate-500 mb-4">
            Поделитесь кодом с учителями — они вступят в вашу организацию за 30 секунд.
          </p>
          <div className="bg-white rounded-xl p-4 border border-indigo-100 text-center mb-4">
            <div className="text-3xl font-mono font-bold text-indigo-600 tracking-widest">
              {dashboard.org.inviteCode}
            </div>
          </div>
          <button
            onClick={onInvite}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            <Copy size={15} />
            Скопировать код
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Teachers Tab ──────────────────────────────────────────────────────────────

function TeachersTab({
  teachers,
  onRemove,
  removing,
  onInvite,
}: {
  teachers: OrgTeacherStats[]
  onRemove: (id: string) => void
  removing: string | null
  onInvite: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{teachers.length} учителей в организации</h3>
        <button
          onClick={onInvite}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={15} />
          Пригласить учителя
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {teachers.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">Нет учителей. Пригласите первого!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Учитель</th>
                  <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Классов</th>
                  <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Учеников</th>
                  <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Заданий</th>
                  <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Ср. балл</th>
                  <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Активность</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 text-sm">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.email}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">{t.classCount}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">{t.studentCount}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">{t.assignmentCount}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold ${scoreColor(t.avgScore)}`}>
                        {scoreText(t.avgScore)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ActivityBadge days={t.lastActivityDays} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.orgRole !== 'owner' && (
                        <button
                          onClick={() => onRemove(t.id)}
                          disabled={removing === t.id}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="Исключить из организации"
                        >
                          {removing === t.id
                            ? <Loader2 size={16} className="animate-spin" />
                            : <UserMinus size={16} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Students Tab ──────────────────────────────────────────────────────────────

function StudentsTab({
  students,
  teachers,
}: {
  students: OrgStudentStats[]
  teachers: OrgTeacherStats[]
}) {
  const [search, setSearch] = useState('')
  const [filterTeacher, setFilterTeacher] = useState('all')

  const filtered = students.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
    const matchTeacher = filterTeacher === 'all' || s.teacherName === filterTeacher
    return matchSearch && matchTeacher
  })

  const teacherNames = [...new Set(students.map((s) => s.teacherName))]

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Поиск по имени или email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={filterTeacher}
          onChange={(e) => setFilterTeacher(e.target.value)}
        >
          <option value="all">Все учителя</option>
          {teacherNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            {filtered.length} учеников
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">Нет учеников</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Ученик</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Учитель</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Класс</th>
                  <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Сдано</th>
                  <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Ср. балл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 text-sm">{s.name}</div>
                      <div className="text-xs text-slate-400">{s.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.teacherName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.className}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">
                      {s.submissionCount}/{s.totalAssignments}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold ${scoreColor(s.avgScore)}`}>
                        {scoreText(s.avgScore)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────

function AnalyticsTab({ teachers }: { teachers: OrgTeacherStats[] }) {
  const scoreData = teachers
    .filter((t) => t.avgScore !== null)
    .map((t) => ({ name: t.name.split(' ')[0], score: t.avgScore }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

  const activityData = teachers.map((t) => ({
    name: t.name.split(' ')[0],
    задания: t.assignmentCount,
    ученики: t.studentCount,
  }))

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name?: string }>; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3">
        <p className="text-sm font-medium text-slate-900 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs text-slate-600">{p.name ?? 'Балл'}: <strong>{p.value}{p.name === undefined ? '%' : ''}</strong></p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Score comparison */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900 mb-1">Средний балл учеников по учителям</h3>
        <p className="text-sm text-slate-400 mb-5">Кто из учителей даёт лучший результат?</p>
        {scoreData.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">Нет данных о баллах</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Activity comparison */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900 mb-1">Активность учителей</h3>
        <p className="text-sm text-slate-400 mb-5">Количество заданий и учеников у каждого учителя</p>
        {activityData.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">Нет данных</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activityData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="задания" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ученики" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

// ── Invite Code Modal ────────────────────────────────────────────────────────

function InviteModal({ code, onClose }: { code: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Код для учителей</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Поделитесь этим кодом с учителями. Они введут его в своём аккаунте в разделе «Мои классы».
        </p>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center mb-4">
          <div className="text-4xl font-mono font-bold text-indigo-600 tracking-[0.3em]">{code}</div>
        </div>
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Скопировано!' : 'Скопировать код'}
        </button>
      </motion.div>
    </div>
  )
}

// ── Import Tab ───────────────────────────────────────────────────────────────

function ImportTab({ orgId, onImported }: { orgId: string; onImported: () => void }) {
  const [mode, setMode] = useState<'teachers' | 'students'>('students')
  const [csv, setCsv] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ created: number; errors: { row: number; message: string }[] } | null>(null)

  const handleImport = async () => {
    if (!csv.trim()) return
    setImporting(true)
    setResult(null)
    try {
      const res = mode === 'teachers'
        ? await orgsApi.importTeachers(orgId, csv)
        : await orgsApi.importStudents(orgId, csv)
      setResult({ created: res.created, errors: res.errors })
      if (res.created > 0) onImported()
    } catch (err) {
      setResult({ created: 0, errors: [{ row: 0, message: err instanceof Error ? err.message : 'Ошибка' }] })
    } finally {
      setImporting(false)
    }
  }

  const template = mode === 'teachers'
    ? 'name,email,password\nИванов Пётр,ivanov@mail.ru,pass123456\nСидорова Айгуль,sidorova@mail.ru,pass123456'
    : 'name,email,password,className\nАлиев Айдар,aliev@mail.ru,pass123456,Математика 11А\nНурланова Дана,nurlanova@mail.ru,pass123456,Физика 11Б'

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Массовый импорт</h2>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setMode('students'); setResult(null); setCsv('') }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === 'students' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Ученики
          </button>
          <button
            onClick={() => { setMode('teachers'); setResult(null); setCsv('') }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === 'teachers' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Учителя
          </button>
        </div>

        <div className="mb-3">
          <p className="text-sm text-slate-500 mb-2">
            {mode === 'teachers'
              ? 'Формат CSV: name, email, password (по строке на каждого)'
              : 'Формат CSV: name, email, password, className (имя класса для привязки)'}
          </p>
          <button
            onClick={() => setCsv(template)}
            className="text-xs text-indigo-600 hover:text-indigo-800 underline"
          >
            Вставить шаблон
          </button>
        </div>

        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={8}
          placeholder={template}
          className="w-full border border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
        />

        <button
          onClick={handleImport}
          disabled={importing || !csv.trim()}
          className="mt-3 flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {importing ? 'Импортируем...' : 'Импортировать'}
        </button>

        {result && (
          <div className="mt-4 space-y-2">
            {result.created > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-green-700 text-sm">
                ✅ Создано: {result.created} {mode === 'teachers' ? 'учителей' : 'учеников'}
              </div>
            )}
            {result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-700 text-sm">
                <p className="font-medium mb-1">Ошибки ({result.errors.length}):</p>
                {result.errors.slice(0, 10).map((e, i) => (
                  <p key={i} className="text-xs">Строка {e.row}: {e.message}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Reports Tab ──────────────────────────────────────────────────────────────

function ReportsTab({ orgId, students }: { orgId: string; students: OrgStudentStats[] }) {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Calculate ISO week
  const jan4 = new Date(now.getFullYear(), 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const startOfWeek1 = new Date(jan4)
  startOfWeek1.setDate(jan4.getDate() - dayOfWeek + 1)
  const weekNum = Math.ceil(((now.getTime() - startOfWeek1.getTime()) / (24 * 60 * 60 * 1000) + 1) / 7)
  const currentWeek = `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`

  const openReport = (url: string) => {
    // Open in new tab — reports return HTML that can be printed
    const token = localStorage.getItem('studyhub-token')
    window.open(`${url}&token=${token}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Отчёты организации</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => openReport(reportsApi.weeklyUrl(orgId, currentWeek))}
            className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Недельный отчёт</p>
              <p className="text-xs text-slate-500">{currentWeek}</p>
            </div>
            <ExternalLink size={14} className="ml-auto text-slate-400" />
          </button>

          <button
            onClick={() => openReport(reportsApi.monthlyUrl(orgId, currentMonth))}
            className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Месячный отчёт</p>
              <p className="text-xs text-slate-500">{currentMonth}</p>
            </div>
            <ExternalLink size={14} className="ml-auto text-slate-400" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Отчёты по ученикам</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {students.length === 0 ? (
            <p className="text-slate-400 text-sm">Нет учеников</p>
          ) : (
            students.map((s) => (
              <button
                key={s.id}
                onClick={() => openReport(reportsApi.studentUrl(orgId, s.id))}
                className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.className} · {s.teacherName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${scoreColor(s.avgScore)}`}>
                    {scoreText(s.avgScore)}
                  </span>
                  <ExternalLink size={14} className="text-slate-400" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ── Settings Tab ──────────────────────────────────────────────────────────────

type OrgForm = {
  name: string
  type: 'tutoring_center' | 'school' | 'corporate'
  city: string
  address: string
  bin: string
  logoUrl: string
  brandColor: string
  contactEmail: string
  contactPhone: string
  website: string
}

function SettingsTab({
  org,
  onSaved,
}: {
  org: DBOrganization
  onSaved: (org: DBOrganization) => void
}) {
  const initial: OrgForm = {
    name:         org.name,
    type:         (org.type as OrgForm['type']) ?? 'tutoring_center',
    city:         org.city         ?? '',
    address:      org.address      ?? '',
    bin:          org.bin          ?? '',
    logoUrl:      org.logoUrl      ?? '',
    brandColor:   org.brandColor   ?? '',
    contactEmail: org.contactEmail ?? '',
    contactPhone: org.contactPhone ?? '',
    website:      org.website      ?? '',
  }

  const [form, setForm]       = useState<OrgForm>(initial)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const dirty = (Object.keys(form) as (keyof OrgForm)[]).some((k) => form[k] !== initial[k])

  const update = <K extends keyof OrgForm>(k: K, v: OrgForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Название центра обязательно'); return }
    if (form.brandColor && !/^#[0-9a-fA-F]{6}$/.test(form.brandColor)) {
      setError('Цвет бренда — HEX, например #6366f1'); return
    }
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      setError('Неверный email'); return
    }

    setSaving(true)
    try {
      const payload: OrgUpdatePayload = {}
      ;(Object.keys(form) as (keyof OrgForm)[]).forEach((k) => {
        const v = form[k].trim?.() ?? form[k]
        if (v !== (initial[k] ?? '')) payload[k] = v as never
      })
      const { org: updated } = await orgsApi.update(org.id, payload)
      onSaved(updated)
      setSavedAt(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => { setForm(initial); setError(null) }

  const logoPreview = form.logoUrl || null

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">

      {/* ── Preview ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0"
            style={{ background: form.brandColor || '#eef2ff' }}
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt={form.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <Building2 size={26} className="text-white mix-blend-difference" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Предпросмотр бренда</p>
            <h3 className="font-semibold text-slate-900 truncate">{form.name || 'Название центра'}</h3>
            <p className="text-sm text-slate-500 truncate">
              {form.city}{form.city && form.contactPhone ? ' · ' : ''}{form.contactPhone}
            </p>
          </div>
        </div>
      </div>

      {/* ── Основное ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">Основное</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Название центра *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              maxLength={100}
              required
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Тип</label>
            <select
              value={form.type}
              onChange={(e) => update('type', e.target.value as OrgForm['type'])}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="tutoring_center">Учебный центр</option>
              <option value="school">Школа</option>
              <option value="corporate">Корпоративное обучение</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Город</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              maxLength={100}
              placeholder="Алматы"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* ── Контакты ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">Контакты</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email центра</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => update('contactEmail', e.target.value)}
              maxLength={200}
              placeholder="hello@center.kz"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">WhatsApp для родителей</label>
            <input
              type="tel"
              value={form.contactPhone}
              onChange={(e) => update('contactPhone', e.target.value)}
              maxLength={30}
              placeholder="+7 777 123 45 67"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Сайт</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => update('website', e.target.value)}
              maxLength={300}
              placeholder="https://center.kz"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* ── Реквизиты ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-1">Реквизиты</h3>
        <p className="text-xs text-slate-500 mb-4">Для счёт-фактур и договоров</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">БИН / ИИН</label>
            <input
              type="text"
              value={form.bin}
              onChange={(e) => update('bin', e.target.value)}
              maxLength={20}
              placeholder="123456789012"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Адрес</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              maxLength={300}
              placeholder="ул. Абая 10, офис 5"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* ── Брендинг ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-1">Брендинг</h3>
        <p className="text-xs text-slate-500 mb-4">Логотип и цвет для отчётов родителям</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">URL логотипа</label>
            <input
              type="url"
              value={form.logoUrl}
              onChange={(e) => update('logoUrl', e.target.value)}
              maxLength={500}
              placeholder="https://cdn.center.kz/logo.png"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Цвет бренда (HEX)</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={form.brandColor || '#6366f1'}
                onChange={(e) => update('brandColor', e.target.value)}
                className="h-11 w-14 rounded-xl border border-slate-200 cursor-pointer bg-white"
              />
              <input
                type="text"
                value={form.brandColor}
                onChange={(e) => update('brandColor', e.target.value)}
                maxLength={7}
                placeholder="#6366f1"
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="sticky bottom-0 flex items-center justify-between gap-3 bg-white/90 backdrop-blur border-t border-slate-100 py-4 -mx-6 px-6">
        <div className="text-xs text-slate-500">
          {savedAt && !dirty && (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <Check size={14} /> Сохранено
            </span>
          )}
          {dirty && <span>Есть несохранённые изменения</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={!dirty || saving}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Отменить
          </button>
          <button
            type="submit"
            disabled={!dirty || saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Сохранить
          </button>
        </div>
      </div>
    </form>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CenterDashboard() {
  const { user } = useStore()
  const navigate = useNavigate()

  const [loading, setLoading]                 = useState(true)
  const [dashboard, setDashboard]             = useState<OrgDashboard | null>(null)
  const [activeTab, setActiveTab]             = useState<TabId>('overview')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [removing, setRemoving]               = useState<string | null>(null)
  const [error, setError]                     = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { orgs } = await orgsApi.mine()
      if (orgs.length === 0) {
        setShowCreateModal(true)
        return
      }
      const data = await orgsApi.dashboard(orgs[0].id)
      setDashboard(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const handleCreateOrg = async (data: { name: string; type: string; city?: string }) => {
    const { org } = await orgsApi.create(data)
    setShowCreateModal(false)
    const dash = await orgsApi.dashboard(org.id)
    setDashboard(dash)
    setLoading(false)
  }

  const handleRemoveMember = async (userId: string) => {
    if (!dashboard) return
    if (!confirm('Исключить этого учителя из организации?')) return
    setRemoving(userId)
    try {
      await orgsApi.removeMember(dashboard.org.id, userId)
      await loadDashboard()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setRemoving(null)
    }
  }

  const isOwner = !!dashboard && !!user && dashboard.org.ownerId === user.id

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview',   label: 'Обзор',     icon: <LayoutGrid size={16} /> },
    { id: 'teachers',   label: 'Учителя',   icon: <Users size={16} /> },
    { id: 'students',   label: 'Ученики',   icon: <BookOpen size={16} /> },
    { id: 'analytics',  label: 'Аналитика', icon: <BarChart3 size={16} /> },
    { id: 'import',     label: 'Импорт',    icon: <Upload size={16} /> },
    { id: 'reports',    label: 'Отчёты',    icon: <FileText size={16} /> },
    ...(isOwner ? [{ id: 'settings' as TabId, label: 'Настройки', icon: <Settings size={16} /> }] : []),
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PageMeta title="Дашборд центра — StudyHub" description="Управление учебным центром" />
      <Sidebar />

      <main className="flex-1 min-w-0 p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {dashboard ? dashboard.org.name : 'Дашборд центра'}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {dashboard
                ? `${dashboard.org.type === 'tutoring_center' ? 'Учебный центр' : dashboard.org.type === 'school' ? 'Школа' : 'Корпоративное обучение'}${dashboard.org.city ? ` · ${dashboard.org.city}` : ''}`
                : 'Управление вашим учебным центром'}
            </p>
          </div>
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm border border-slate-200 rounded-xl px-3 py-2 hover:bg-white transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Обновить
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 text-red-700 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && !dashboard && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
          </div>
        )}

        {/* Dashboard content */}
        {dashboard && (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-2xl p-1 mb-6 shadow-sm overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <OverviewTab dashboard={dashboard} onInvite={() => setShowInviteModal(true)} />
              )}
              {activeTab === 'teachers' && (
                <TeachersTab
                  teachers={dashboard.teachers}
                  onRemove={handleRemoveMember}
                  removing={removing}
                  onInvite={() => setShowInviteModal(true)}
                />
              )}
              {activeTab === 'students' && (
                <StudentsTab students={dashboard.students} teachers={dashboard.teachers} />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsTab teachers={dashboard.teachers} />
              )}
              {activeTab === 'import' && (
                <ImportTab orgId={dashboard.org.id} onImported={loadDashboard} />
              )}
              {activeTab === 'reports' && (
                <ReportsTab orgId={dashboard.org.id} students={dashboard.students} />
              )}
              {activeTab === 'settings' && isOwner && (
                <SettingsTab
                  org={dashboard.org}
                  onSaved={(updated) => setDashboard({ ...dashboard, org: updated })}
                />
              )}
            </motion.div>
          </>
        )}
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateOrgModal
          onClose={() => { setShowCreateModal(false); navigate('/teacher') }}
          onCreate={handleCreateOrg}
        />
      )}
      {showInviteModal && dashboard && (
        <InviteModal code={dashboard.org.inviteCode} onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  )
}
