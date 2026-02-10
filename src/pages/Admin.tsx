import { useState } from 'react'
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
  LineChart,
  Line,
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
  ArrowDownRight,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { PLATFORM_STATS } from '@/store/useStore'
import { cn } from '@/lib/utils'

const PIE_COLORS = ['#2563eb', '#7c3aed', '#16a34a', '#d97706', '#dc2626', '#6b7280']

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
} satisfies import('framer-motion').Variants

export default function Admin() {
  const navigate = useNavigate()
  const { user, logout } = useStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'revenue' | 'content'>('overview')

  if (!user || user.role !== 'admin') {
    navigate('/auth')
    return null
  }

  const stats = PLATFORM_STATS

  const statCards = [
    {
      title: 'Всего пользователей',
      value: stats.totalUsers.toLocaleString('ru-RU'),
      change: '+12.5%',
      trend: 'up' as const,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Активных сегодня',
      value: stats.activeToday.toLocaleString('ru-RU'),
      change: '+8.3%',
      trend: 'up' as const,
      icon: Activity,
      color: 'bg-green-500',
    },
    {
      title: 'Премиум подписки',
      value: stats.premiumUsers.toLocaleString('ru-RU'),
      change: '+23.1%',
      trend: 'up' as const,
      icon: Crown,
      color: 'bg-purple-500',
    },
    {
      title: 'Доход',
      value: stats.totalRevenue,
      change: '+31.4%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'bg-amber-500',
    },
  ]

  const secondaryStats = [
    { title: 'Средний балл', value: `${stats.avgScore}%`, icon: GraduationCap },
    { title: 'Тестов пройдено', value: stats.testsCompleted.toLocaleString('ru-RU'), icon: ClipboardCheck },
    { title: 'Планов создано', value: stats.plansCreated.toLocaleString('ru-RU'), icon: BookOpen },
    { title: 'Retention D7', value: `${stats.retentionRate}%`, icon: TrendingUp },
  ]

  // Mock recent users
  const recentUsers = [
    { name: 'Айдана Мухамедова', email: 'aidana@mail.kz', role: 'student', city: 'Алматы', date: '10.02.2026', premium: true },
    { name: 'Арман Касымов', email: 'arman@mail.kz', role: 'student', city: 'Астана', date: '10.02.2026', premium: false },
    { name: 'Дина Сериккызы', email: 'dina@mail.kz', role: 'parent', city: 'Шымкент', date: '09.02.2026', premium: true },
    { name: 'Нурсултан Абаев', email: 'nursultan@mail.kz', role: 'student', city: 'Караганда', date: '09.02.2026', premium: false },
    { name: 'Жанна Ибрагимова', email: 'zhanna@mail.kz', role: 'parent', city: 'Алматы', date: '09.02.2026', premium: true },
    { name: 'Бекзат Оспанов', email: 'bekzat@mail.kz', role: 'student', city: 'Актобе', date: '08.02.2026', premium: false },
    { name: 'Мадина Тулешова', email: 'madina@mail.kz', role: 'student', city: 'Астана', date: '08.02.2026', premium: true },
    { name: 'Ерлан Жуматов', email: 'erlan@mail.kz', role: 'student', city: 'Алматы', date: '08.02.2026', premium: false },
  ]

  const tabs = [
    { id: 'overview' as const, label: 'Обзор' },
    { id: 'users' as const, label: 'Пользователи' },
    { id: 'revenue' as const, label: 'Доходы' },
    { id: 'content' as const, label: 'Контент' },
  ]

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
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">ADMIN</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Поиск пользователей..."
                  className="pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">Администратор</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Выйти"
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
                    <span className={cn(
                      'flex items-center gap-1 text-sm font-medium',
                      card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {card.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {card.change}
                    </span>
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
                    <h3 className="font-semibold text-slate-800">Регистрации</h3>
                    <p className="text-sm text-slate-500">За последние 7 дней</p>
                  </div>
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.registrationsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-slate-800">Доход</h3>
                    <p className="text-sm text-slate-500">По месяцам</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={stats.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₸`, 'Доход']} />
                    <Line type="monotone" dataKey="amount" stroke="#7c3aed" strokeWidth={3} dot={{ r: 5, fill: '#7c3aed' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Users by City */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800">По городам</h3>
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.usersByCity}
                      dataKey="count"
                      nameKey="city"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                    >
                      {stats.usersByCity.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} пользователей`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {stats.usersByCity.map((item, i) => (
                    <div key={item.city} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-slate-600">{item.city}</span>
                      <span className="text-slate-400 ml-auto">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Universities */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800">Целевые вузы</h3>
                  <GraduationCap className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-4">
                  {stats.topUniversities.map((uni, i) => (
                    <div key={uni.name} className="flex items-center gap-3">
                      <span className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      )}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{uni.name}</p>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-primary-500 h-1.5 rounded-full"
                            style={{ width: `${(uni.applicants / stats.topUniversities[0].applicants) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-slate-500 tabular-nums">{uni.applicants}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800">Быстрые действия</h3>
                  <Settings className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Добавить вопросы ЕНТ', desc: 'Загрузить новый банк вопросов', color: 'bg-blue-100 text-blue-700' },
                    { label: 'Добавить университет', desc: 'Расширить базу вузов', color: 'bg-purple-100 text-purple-700' },
                    { label: 'Рассылка ученикам', desc: 'Push-уведомление', color: 'bg-green-100 text-green-700' },
                    { label: 'Экспорт отчёта', desc: 'Скачать данные в CSV', color: 'bg-amber-100 text-amber-700' },
                    { label: 'Управление тарифами', desc: 'Изменить цены подписки', color: 'bg-red-100 text-red-700' },
                  ].map(action => (
                    <button
                      key={action.label}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className={cn('w-2 h-2 rounded-full', action.color.split(' ')[0])} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{action.label}</p>
                        <p className="text-xs text-slate-400">{action.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Последние регистрации</h3>
                <span className="text-sm text-slate-500">{stats.totalUsers.toLocaleString('ru-RU')} пользователей</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Пользователь</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Роль</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Город</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Дата</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentUsers.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{u.name}</p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'text-xs px-2 py-1 rounded-full font-medium',
                            u.role === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          )}>
                            {u.role === 'student' ? 'Ученик' : 'Родитель'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{u.city}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{u.date}</td>
                        <td className="px-6 py-4">
                          {u.premium ? (
                            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                              <Crown className="w-3 h-3" /> Premium
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Free</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'revenue' && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">Общий доход</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalRevenue}</p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" /> +31.4% к прошлому месяцу
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">Подписчиков Premium</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.premiumUsers.toLocaleString('ru-RU')}</p>
                <p className="text-sm text-slate-500 mt-1">ARPU: 4 990 ₸/мес</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-slate-500">Конверсия Free → Premium</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">13.3%</p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" /> +2.1% к прошлому месяцу
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-6">Динамика дохода</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M ₸`} />
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₸`, 'Доход']} />
                  <Bar dataKey="amount" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeTab === 'content' && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Вопросов в банке', value: '5,240', color: 'bg-blue-500' },
                { label: 'Предметов', value: '11', color: 'bg-green-500' },
                { label: 'Университетов', value: '6', color: 'bg-purple-500' },
                { label: 'Специальностей', value: '22', color: 'bg-amber-500' },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className={cn('w-3 h-3 rounded-full mb-3', item.color)} />
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Управление контентом</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Банк вопросов ЕНТ', desc: 'Добавление, редактирование, модерация вопросов', status: '5,240 вопросов' },
                  { title: 'База университетов', desc: 'Обновление данных о вузах и специальностях', status: '6 вузов, 22 специальности' },
                  { title: 'Учебные материалы', desc: 'Микро-уроки, видео, разборы', status: '320 материалов' },
                  { title: 'Промо-баннеры', desc: 'Управление баннерами на лендинге', status: '3 активных' },
                ].map(item => (
                  <div key={item.title} className="p-4 border border-slate-200 rounded-xl hover:border-primary-300 transition-colors cursor-pointer">
                    <h4 className="font-medium text-slate-800">{item.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                    <p className="text-xs text-primary-600 mt-2 font-medium">{item.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
