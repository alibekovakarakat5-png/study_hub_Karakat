import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  GraduationCap,
  Crown,
  MapPin,
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  UserCheck,
  Clock,
  Target,
  Filter,
  Download,
  MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminApi } from '@/lib/api'
import type { AdminUser } from '@/lib/api'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
} satisfies import('framer-motion').Variants

// ── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<AdminUser['role'], string> = {
  student:  'Ученик',
  parent:   'Родитель',
  teacher:  'Учитель',
  employer: 'Работодатель',
  admin:    'Админ',
}

const ROLE_COLORS: Record<AdminUser['role'], string> = {
  student:  'bg-blue-100 text-blue-700',
  parent:   'bg-purple-100 text-purple-700',
  teacher:  'bg-emerald-100 text-emerald-700',
  employer: 'bg-amber-100 text-amber-700',
  admin:    'bg-red-100 text-red-700',
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m} мин`
  const h = Math.floor(m / 60)
  return `${h} ч ${m % 60} мин`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function topN<T extends string | null>(arr: T[], n = 5): { name: string; count: number }[] {
  const freq: Record<string, number> = {}
  for (const v of arr) {
    const key = v ?? 'Не указано'
    freq[key] = (freq[key] ?? 0) + 1
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }))
}

function buildWhatsAppMessage(u: AdminUser): string {
  const lines = [
    `Привет, ${u.name.split(' ')[0]}! 👋`,
    `Я из команды StudyHub — вижу, что ты недавно зарегистрировался на платформе.`,
    ``,
    u.grade ? `📚 ${u.grade}-класс, ${u.city ?? 'Казахстан'}` : `📍 ${u.city ?? 'Казахстан'}`,
    u.targetUniversity ? `🎯 Целевой вуз: ${u.targetUniversity}` : '',
    u.targetSpecialty ? `📖 Специальность: ${u.targetSpecialty}` : '',
    ``,
    `Хочу лично помочь с подготовкой! Есть минута?`,
  ].filter(Boolean).join('\n')
  return `https://wa.me/?text=${encodeURIComponent(lines)}`
}

function MiniBar({ count, max }: { count: number; max: number }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${max > 0 ? (count / max) * 100 : 0}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 tabular-nums w-6 text-right">{count}</span>
    </div>
  )
}

// ── LeadsPanel ───────────────────────────────────────────────────────────────

export default function LeadsPanel() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<AdminUser['role'] | 'all'>('all')
  const [sortField, setSortField] = useState<'createdAt' | 'streak' | 'totalStudyMinutes'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { users: data } = await adminApi.listUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Analytics ──────────────────────────────────────────────────────────────

  const students   = users.filter(u => u.role === 'student')
  const parents    = users.filter(u => u.role === 'parent')

  const byGrade = [9, 10, 11].map(g => ({
    grade: `${g} класс`,
    count: students.filter(u => u.grade === g).length,
  }))
  byGrade.push({ grade: 'Не указан', count: students.filter(u => !u.grade).length })

  const byRole = (Object.keys(ROLE_LABELS) as AdminUser['role'][])
    .map(r => ({ role: ROLE_LABELS[r], count: users.filter(u => u.role === r).length }))
    .filter(r => r.count > 0)

  const topCities       = topN(users.map(u => u.city))
  const topUniversities = topN(students.map(u => u.targetUniversity))
  const topSpecialties  = topN(students.map(u => u.targetSpecialty))
  const maxCity         = Math.max(...topCities.map(c => c.count), 1)
  const maxUni          = Math.max(...topUniversities.map(u => u.count), 1)
  const maxSpec         = Math.max(...topSpecialties.map(s => s.count), 1)

  // ── Filtered/sorted table ──────────────────────────────────────────────────

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase()
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !(u.city ?? '').toLowerCase().includes(q)) return false
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      return true
    })
    .sort((a, b) => {
      const va = a[sortField] ?? ''
      const vb = b[sortField] ?? ''
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortDir === 'desc' ? -cmp : cmp
    })

  const SortBtn = ({ field, label }: { field: typeof sortField; label: string }) => (
    <button
      onClick={() => { if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(field); setSortDir('desc') } }}
      className="flex items-center gap-1 text-xs font-medium text-slate-500 uppercase tracking-wider hover:text-slate-800 transition-colors"
    >
      {label}
      {sortField === field ? (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : null}
    </button>
  )

  // ── Export CSV ─────────────────────────────────────────────────────────────

  const exportCsv = () => {
    const headers = ['Имя', 'Email', 'Роль', 'Класс', 'Город', 'Вуз', 'Специальность', 'Стрик', 'Минут', 'Дата регистрации']
    const rows = filtered.map(u => [
      u.name, u.email, ROLE_LABELS[u.role], u.grade ?? '', u.city ?? '',
      u.targetUniversity ?? '', u.targetSpecialty ?? '',
      u.streak, u.totalStudyMinutes, formatDate(u.createdAt),
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `studyhub-leads-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
      <RefreshCw className="w-5 h-5 animate-spin" />
      Загрузка пользователей из БД...
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <p className="text-red-600 font-medium mb-2">Ошибка загрузки</p>
      <p className="text-sm text-red-400 mb-4">{error}</p>
      <button onClick={load} className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
        Повторить
      </button>
    </div>
  )

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Всего лидов',    value: users.length,    icon: Users,     color: 'bg-blue-500' },
          { label: 'Учеников',       value: students.length, icon: GraduationCap, color: 'bg-indigo-500' },
          { label: 'Родителей',      value: parents.length,  icon: UserCheck, color: 'bg-purple-500' },
          { label: 'Premium',        value: users.filter(u => u.isPremium).length, icon: Crown, color: 'bg-amber-500' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Analytics charts ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* По классу */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-500" /> По классу
          </h4>
          <div className="space-y-3">
            {byGrade.map(({ grade, count }) => (
              <div key={grade} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-20 shrink-0">{grade}</span>
                <MiniBar count={count} max={Math.max(...byGrade.map(b => b.count), 1)} />
              </div>
            ))}
          </div>
        </div>

        {/* По роли */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" /> По роли
          </h4>
          <div className="space-y-3">
            {byRole.map(({ role, count }) => (
              <div key={role} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-20 shrink-0">{role}</span>
                <MiniBar count={count} max={Math.max(...byRole.map(b => b.count), 1)} />
              </div>
            ))}
          </div>
        </div>

        {/* По городу */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" /> По городу (топ-5)
          </h4>
          <div className="space-y-3">
            {topCities.map(({ name, count }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-24 shrink-0 truncate">{name}</span>
                <MiniBar count={count} max={maxCity} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Целевые вузы */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" /> Целевые вузы (топ-5)
          </h4>
          {topUniversities.length === 0 ? (
            <p className="text-slate-400 text-sm">Пока никто не указал вуз</p>
          ) : (
            <div className="space-y-3">
              {topUniversities.map(({ name, count }, i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                  )}>{i + 1}</span>
                  <span className="text-sm text-slate-700 flex-1 truncate">{name}</span>
                  <MiniBar count={count} max={maxUni} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Целевые специальности */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-rose-500" /> Специальности (топ-5)
          </h4>
          {topSpecialties.length === 0 ? (
            <p className="text-slate-400 text-sm">Пока никто не указал специальность</p>
          ) : (
            <div className="space-y-3">
              {topSpecialties.map(({ name, count }, i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    i === 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                  )}>{i + 1}</span>
                  <span className="text-sm text-slate-700 flex-1 truncate">{name}</span>
                  <MiniBar count={count} max={maxSpec} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── User table ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <h3 className="font-semibold text-slate-800 mr-auto">Все пользователи ({filtered.length})</h3>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по имени, email, городу..."
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          {/* Role filter */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as AdminUser['role'] | 'all')}
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 appearance-none"
            >
              <option value="all">Все роли</option>
              {(Object.keys(ROLE_LABELS) as AdminUser['role'][]).map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <button onClick={load} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors" title="Обновить">
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-5 py-3 text-left"><span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Пользователь</span></th>
                <th className="px-5 py-3 text-left"><span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Роль / Класс</span></th>
                <th className="px-5 py-3 text-left"><span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Город</span></th>
                <th className="px-5 py-3 text-left"><span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Вуз / Специальность</span></th>
                <th className="px-5 py-3 text-left"><SortBtn field="streak" label="Стрик" /></th>
                <th className="px-5 py-3 text-left"><SortBtn field="totalStudyMinutes" label="Время" /></th>
                <th className="px-5 py-3 text-left"><SortBtn field="createdAt" label="Дата" /></th>
                <th className="px-5 py-3 text-left"><span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Связь</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">Нет пользователей по фильтру</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  {/* Пользователь */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate max-w-[140px]">{u.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[140px]">{u.email}</p>
                      </div>
                      {u.isPremium && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    </div>
                  </td>

                  {/* Роль / Класс */}
                  <td className="px-5 py-3">
                    <span className={cn('text-xs px-2 py-1 rounded-full font-medium', ROLE_COLORS[u.role])}>
                      {ROLE_LABELS[u.role]}
                    </span>
                    {u.grade && <span className="ml-1.5 text-xs text-slate-400">{u.grade} кл.</span>}
                  </td>

                  {/* Город */}
                  <td className="px-5 py-3 text-sm text-slate-600">{u.city ?? <span className="text-slate-300">—</span>}</td>

                  {/* Вуз / Специальность */}
                  <td className="px-5 py-3 max-w-[180px]">
                    {u.targetUniversity ? (
                      <p className="text-xs font-medium text-slate-700 truncate">{u.targetUniversity}</p>
                    ) : null}
                    {u.targetSpecialty ? (
                      <p className="text-xs text-slate-400 truncate">{u.targetSpecialty}</p>
                    ) : null}
                    {!u.targetUniversity && !u.targetSpecialty && <span className="text-slate-300 text-xs">—</span>}
                  </td>

                  {/* Стрик */}
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-sm">
                      {u.streak > 0 ? <span className="text-orange-500">🔥</span> : null}
                      <span className={u.streak > 0 ? 'font-medium text-slate-800' : 'text-slate-300'}>{u.streak}д</span>
                    </span>
                  </td>

                  {/* Время */}
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {formatMinutes(u.totalStudyMinutes)}
                    </span>
                  </td>

                  {/* Дата */}
                  <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDate(u.createdAt)}</td>

                  {/* Связь */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={buildWhatsAppMessage(u)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                        title="Написать в WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WA
                      </a>
                      <a
                        href={`mailto:${u.email}`}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg transition-colors"
                        title="Email"
                      >
                        @
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
