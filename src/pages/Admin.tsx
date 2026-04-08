import { useState, useEffect, Component } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  LogOut,
  Crown,
  BarChart3,
  MapPin,
  Calendar,
  Shield,
  Settings,
  Bell,
  Search,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import { adminApi } from '@/lib/api'
import type { AdminStats } from '@/lib/api'
import LeadsPanel from '@/components/admin/LeadsPanel'
import CourseManager from '@/components/admin/CourseManager'
import ContentManager from '@/components/admin/ContentManager'
import BillingPanel from '@/components/admin/BillingPanel'
import BookUploader from '@/components/admin/BookUploader'

const PIE_COLORS = ['#2563eb', '#7c3aed', '#16a34a', '#d97706', '#dc2626', '#6b7280']

// ── Error Boundary ────────────────────────────────────────────────────────────

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-medium mb-2">Render error</p>
          <p className="text-sm text-red-400 mb-4 font-mono">{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
} satisfies import('framer-motion').Variants

const EMPTY_STATS: AdminStats = {
  totalUsers: 0, premiumUsers: 0, activeToday: 0,
  totalEntResults: 0, totalStudyPlans: 0,
  usersByRole: [], usersByGrade: [], usersByCity: [],
  topUniversities: [], topSpecialties: [], registrationsByDay: [],
}

export default function Admin() {
  const navigate = useNavigate()
  const { user, logout } = useStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'revenue' | 'content' | 'courses' | 'billing' | 'uploads'>(user?.role === 'teacher' ? 'courses' : 'overview')
  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats()
      .then(data => setStats({ ...EMPTY_STATS, ...data }))
      .catch(() => {/* server may be offline, show zeros */})
      .finally(() => setStatsLoading(false))
  }, [])

  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'

  if (!user || (!isAdmin && !isTeacher)) {
    navigate('/auth')
    return null
  }

  const total    = stats.totalUsers    ?? 0
  const active   = stats.activeToday   ?? 0
  const premium  = stats.premiumUsers  ?? 0
  const entTests = stats.totalEntResults ?? 0
  const plans    = stats.totalStudyPlans ?? 0

  const statCards = [
    { title: t('admin.total_users'),    value: statsLoading ? '—' : total.toLocaleString('ru-RU'),   icon: Users,      color: 'bg-blue-500' },
    { title: t('admin.active_today'),   value: statsLoading ? '—' : active.toLocaleString('ru-RU'),  icon: Activity,   color: 'bg-green-500' },
    { title: t('admin.premium_subs'),   value: statsLoading ? '—' : premium.toLocaleString('ru-RU'), icon: Crown,      color: 'bg-purple-500' },
    { title: t('admin.revenue'),        value: '0 ₸',                                                icon: DollarSign, color: 'bg-amber-500' },
  ]

  const secondaryStats = [
    { title: t('admin.ent_tests'),      value: statsLoading ? '—' : entTests.toLocaleString('ru-RU'), icon: ClipboardCheck },
    { title: t('admin.plans_created'),  value: statsLoading ? '—' : plans.toLocaleString('ru-RU'),   icon: BookOpen },
    { title: t('admin.conversion'),     value: total > 0 ? `${((premium / total) * 100).toFixed(1)}%` : '0%', icon: TrendingUp },
    { title: t('admin.premium_count'),  value: statsLoading ? '—' : premium.toLocaleString('ru-RU'), icon: GraduationCap },
  ]

  const allTabs = [
    { id: 'overview' as const, label: t('admin.tab_overview'), adminOnly: true },
    { id: 'users' as const, label: t('admin.tab_users'), adminOnly: true },
    { id: 'revenue' as const, label: t('admin.tab_revenue'), adminOnly: true },
    { id: 'content' as const, label: t('admin.tab_content'), adminOnly: false },
    { id: 'courses' as const, label: t('admin.tab_courses'), adminOnly: false },
    { id: 'uploads' as const, label: t('admin.tab_uploads'), adminOnly: false },
    { id: 'billing' as const, label: t('admin.tab_billing'), adminOnly: true },
  ]
  const tabs = isAdmin ? allTabs : allTabs.filter(tab => !tab.adminOnly)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-800">Study Hub</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', isAdmin ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')}>
                {isAdmin ? 'ADMIN' : 'TEACHER'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('users')}
                className="relative hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-500 transition-colors"
                title={t('admin.search_users_title')}
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>{t('admin.search_users')}</span>
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors" title={t('admin.no_notifications')}>
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{isAdmin ? t('admin.admin_role') : t('admin.teacher_role', 'Репетитор')}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title={t('nav.logout')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            {/* Main Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white', card.color)}>
                      <card.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{card.title}</p>
                </motion.div>
              ))}
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {secondaryStats.map(stat => (
                <div key={stat.title} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Registrations Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-slate-800">{t('admin.registrations')}</h3>
                    <p className="text-sm text-slate-500">{t('admin.last_7_days')}</p>
                  </div>
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.registrationsByDay.length ? stats.registrationsByDay : []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Users by role chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-slate-800">{t('admin.by_role')}</h3>
                    <p className="text-sm text-slate-500">{t('admin.user_distribution')}</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                </div>
                {stats.usersByRole.length === 0 ? (
                  <div className="flex items-center justify-center h-[240px] text-slate-400 text-sm">{t('admin.no_data')}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={stats.usersByRole}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="role" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Users by City */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800">{t('admin.by_city')}</h3>
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                {stats.usersByCity.length === 0 ? (
                  <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">{t('admin.no_data')}</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={stats.usersByCity} dataKey="count" nameKey="city" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                          {stats.usersByCity.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} ${t('admin.users_count')}`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {stats.usersByCity.map((item, i) => (
                        <div key={item.city} className="flex items-center gap-2 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-slate-600 truncate">{item.city}</span>
                          <span className="text-slate-400 ml-auto">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Top Universities */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800">{t('admin.target_universities')}</h3>
                  <GraduationCap className="w-5 h-5 text-slate-400" />
                </div>
                {stats.topUniversities.length === 0 ? (
                  <p className="text-slate-400 text-sm">{t('admin.no_universities')}</p>
                ) : (
                  <div className="space-y-4">
                    {stats.topUniversities.map((uni, i) => (
                      <div key={uni.name} className="flex items-center gap-3">
                        <span className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                          i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                        )}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{uni.name}</p>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                            <div className="bg-primary-500 h-1.5 rounded-full"
                              style={{ width: `${(uni.count / stats.topUniversities[0].count) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-sm text-slate-500 tabular-nums">{uni.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800">{t('admin.quick_actions')}</h3>
                  <Settings className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: t('admin.action_add_ent'), desc: t('admin.action_go_content'), color: 'bg-blue-100', onClick: () => setActiveTab('content') },
                    { label: t('admin.action_add_vocab'), desc: t('admin.action_go_content'), color: 'bg-purple-100', onClick: () => setActiveTab('content') },
                    { label: t('admin.action_export_users'), desc: t('admin.action_export_desc'), color: 'bg-amber-100', onClick: () => setActiveTab('users') },
                    { label: t('admin.action_revenue'), desc: t('admin.action_revenue_desc'), color: 'bg-green-100', onClick: () => setActiveTab('revenue') },
                    { label: t('admin.action_push'), desc: t('admin.action_push_desc'), color: 'bg-slate-100', onClick: undefined },
                  ].map(action => (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      disabled={!action.onClick}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left',
                        action.onClick ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-40 cursor-not-allowed',
                      )}
                    >
                      <div className={cn('w-2 h-2 rounded-full', action.color)} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{action.label}</p>
                        <p className="text-xs text-slate-400">{action.desc}</p>
                      </div>
                      {action.onClick && <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && <ErrorBoundary><LeadsPanel /></ErrorBoundary>}

        {activeTab === 'revenue' && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">{t('admin.total_revenue')}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">0 ₸</p>
                <p className="text-sm text-slate-400 mt-1">{t('admin.payments_not_connected')}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">{t('admin.premium_subscribers')}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.premiumUsers.toLocaleString('ru-RU')}</p>
                <p className="text-sm text-slate-500 mt-1">{t('admin.of_users', { total: stats.totalUsers })}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">{t('admin.conversion_rate')}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {stats.totalUsers > 0 ? `${((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}%` : '0%'}
                </p>
                <p className="text-sm text-slate-400 mt-1">{t('admin.real_db_data')}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-2">{t('admin.registration_dynamics')}</h3>
              <p className="text-sm text-slate-400 mb-6">{t('admin.last_7_days')}</p>
              {stats.registrationsByDay.length === 0 ? (
                <div className="flex items-center justify-center h-[350px] text-slate-400 text-sm">
                  {t('admin.no_data_7_days')}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.registrationsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip formatter={(value) => [`${value} ${t('admin.registrations_count')}`, '']} />
                    <Bar dataKey="count" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'content' && (
          <ContentManager role={isAdmin ? 'admin' : 'teacher'} />
        )}

        {activeTab === 'courses' && (
          <CourseManager />
        )}

        {activeTab === 'uploads' && (
          <ErrorBoundary><BookUploader /></ErrorBoundary>
        )}

        {activeTab === 'billing' && (
          <ErrorBoundary><BillingPanel /></ErrorBoundary>
        )}
      </div>
    </div>
  )
}
