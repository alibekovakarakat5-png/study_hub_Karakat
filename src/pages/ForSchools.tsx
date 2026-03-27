// ── ForSchools — B2B Landing Page for Educational Centers ─────────────────────
// Route: /for-schools   (public, no auth required)

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Brain, BarChart3, Users, BookOpen, TrendingUp,
  CheckCircle, MessageCircle, Shield,
  Building2, ArrowRight, Menu, X
} from 'lucide-react'
import { openWhatsApp } from '@/lib/whatsapp'
import { PageMeta } from '@/components/PageMeta'

// ── Animation Variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
}

// ── Types ────────────────────────────────────────────────────────────────────

interface StatCounterProps { value: number; suffix: string; label: string }
interface FeatureCardProps { icon: React.ReactNode; title: string; description: string }
interface PainCardProps    { emoji: string; title: string; description: string }

// ── Animated counter ─────────────────────────────────────────────────────────

function StatCounter({ value, suffix, label }: StatCounterProps) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = value / 40
    const timer = setInterval(() => {
      start = Math.min(start + step, value)
      setCount(Math.floor(start))
      if (start >= value) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [value])
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-white">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-indigo-300 text-sm mt-1">{label}</div>
    </div>
  )
}

// ── Feature Card ──────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:border-indigo-500/50 group"
    >
      <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center mb-4 text-indigo-400 group-hover:bg-indigo-600/30 transition-all">
        {icon}
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}

// ── Pain Card ────────────────────────────────────────────────────────────────

function PainCard({ emoji, title, description }: PainCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-red-950/30 border border-red-900/30 rounded-2xl p-6"
    >
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="text-red-300 font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────

function Header() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDemo = () => {
    openWhatsApp(
      'Здравствуйте! Я директор учебного центра и хочу узнать о возможностях StudyHub для нашего центра. Можем ли мы провести демонстрацию?'
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-white font-bold text-lg">StudyHub</span>
            <span className="ml-1 text-xs bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-full px-2 py-0.5">для бизнеса</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-white text-sm transition-colors">Возможности</a>
            <a href="#how-it-works" className="text-slate-400 hover:text-white text-sm transition-colors">Как работает</a>
            <a href="#pricing" className="text-slate-400 hover:text-white text-sm transition-colors">Тарифы</a>
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Войти
            </button>
            <button
              onClick={handleDemo}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <MessageCircle size={15} />
              Записаться на демо
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-white/5 mt-2 pt-4 flex flex-col gap-4">
            <a href="#features" className="text-slate-400 hover:text-white text-sm">Возможности</a>
            <a href="#how-it-works" className="text-slate-400 hover:text-white text-sm">Как работает</a>
            <a href="#pricing" className="text-slate-400 hover:text-white text-sm">Тарифы</a>
            <button
              onClick={() => navigate('/auth')}
              className="text-left text-slate-400 hover:text-white text-sm"
            >
              Войти
            </button>
            <button
              onClick={handleDemo}
              className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-xl"
            >
              <MessageCircle size={15} />
              Записаться на демо
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ForSchools() {
  const navigate = useNavigate()

  const handleDemo = () => {
    openWhatsApp(
      'Здравствуйте! Я директор учебного центра и хочу узнать о возможностях StudyHub для нашего центра. Можем ли мы провести демонстрацию?'
    )
  }

  const features = [
    {
      icon: <LayoutGrid size={22} />,
      title: 'Система классов',
      description: 'Учитель создаёт класс и получает 6-значный код. Ученики заходят по коду — без регистрации вручную, без Excel-таблиц.',
    },
    {
      icon: <BarChart3 size={22} />,
      title: 'Аналитика центра',
      description: 'Видите прогресс каждого ученика в реальном времени. Сравнивайте учителей по среднему баллу и активности.',
    },
    {
      icon: <Brain size={22} />,
      title: 'AI-генератор тестов',
      description: 'Skylla AI создаёт 3 варианта теста за 30 секунд по любой теме. Учителю не нужно тратить часы на составление вопросов.',
    },
    {
      icon: <Shield size={22} />,
      title: 'Контроль учителей',
      description: 'Мгновенно видите кто активен, а кто пропускает. Зелёный — работает, красный — "пропускает уроки".',
    },
  ]

  const pains = [
    {
      emoji: '📊',
      title: 'Excel-таблицы с успеваемостью',
      description: 'Учителя присылают отчёты в разных форматах, вы тратите часы на сводку. Никакой автоматизации.',
    },
    {
      emoji: '🤷',
      title: 'Не знаете, какой учитель слабее',
      description: 'Средний балл у разных учителей отличается, но вы об этом узнаёте только в конце месяца — или никогда.',
    },
    {
      emoji: '👻',
      title: 'Ученики теряются между учителями',
      description: 'Один учитель уволился — вся история ученика исчезает. Нет единой платформы для центра.',
    },
  ]

  const steps = [
    {
      number: '01',
      title: 'Создаёте организацию',
      description: 'Регистрируетесь как директор, создаёте учебный центр и получаете код для приглашения учителей.',
    },
    {
      number: '02',
      title: 'Приглашаете учителей',
      description: 'Делитесь кодом с педагогами. Они регистрируются и вступают в вашу организацию за 30 секунд.',
    },
    {
      number: '03',
      title: 'Учителя набирают учеников',
      description: 'Каждый учитель создаёт классы и приглашает учеников по уникальному коду класса. Ученик скачивает приложение.',
    },
    {
      number: '04',
      title: 'Вы видите всё в дашборде',
      description: 'Прогресс каждого ученика, активность учителей, средние баллы и тренды — в одном месте.',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageMeta
        title="StudyHub для учебных центров — управляйте всем в одном месте"
        description="Платформа для управления учебными центрами: классы, задания, AI-тесты, аналитика учителей и учеников."
      />

      <Header />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-bold leading-tight mb-6"
          >
            Управляйте учебным центром
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              в одной платформе
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Один учитель получает код → целый класс автоматически в системе.
            Вы видите прогресс каждого ученика и активность каждого учителя в реальном времени.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={() => navigate('/auth?role=teacher')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all hover:scale-105 shadow-lg shadow-indigo-600/25"
            >
              Начать бесплатно
              <ArrowRight size={20} />
            </button>
            <button
              onClick={handleDemo}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all"
            >
              <MessageCircle size={20} className="text-green-400" />
              Получить демо
            </button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-3 gap-8 max-w-lg mx-auto border-t border-white/10 pt-10"
          >
            <StatCounter value={500}   suffix="+"  label="учителей" />
            <StatCounter value={10000} suffix="+"  label="учеников" />
            <StatCounter value={30}    suffix=" с" label="AI-тест" />
          </motion.div>
        </div>
      </section>

      {/* ── Pain Section ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.div variants={fadeUp} className="inline-block bg-red-950/50 border border-red-900/30 text-red-400 text-sm px-4 py-1.5 rounded-full mb-4">
              Знакомо?
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
              Как вы сейчас управляете центром?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg max-w-xl mx-auto">
              Большинство учебных центров работают вот так — и теряют время, деньги и учеников.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {pains.map((p) => <PainCard key={p.title} {...p} />)}
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.div variants={fadeUp} className="inline-block bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-sm px-4 py-1.5 rounded-full mb-4">
              Возможности
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
              Всё что нужно для управления центром
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg max-w-xl mx-auto">
              Один инструмент вместо Excel, WhatsApp-чатов и разрозненных сервисов.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {features.map((f) => <FeatureCard key={f.title} {...f} />)}
          </motion.div>
        </div>
      </section>

      {/* ── Student in the App — self-management value ────────────────────── */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left: text */}
            <div>
              <motion.div variants={fadeUp} className="inline-block bg-purple-600/20 border border-purple-500/30 text-purple-400 text-sm px-4 py-1.5 rounded-full mb-4">
                Ученик в приложении
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-5">
                Каждый ученик видит<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  всё своё расписание и домашку
                </span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-400 text-lg leading-relaxed mb-8">
                Ученик скачивает приложение → видит домашние задания от учителя,
                личный учебный план, прогресс по темам и поддержку от Skylla AI.
                Всё в одном месте.
              </motion.p>
              <motion.div variants={stagger} className="space-y-4">
                {[
                  { emoji: '📚', text: 'Домашние задания и тесты от учителя прямо в приложении' },
                  { emoji: '📅', text: 'Личный учебный план — ученик видит что учить и когда' },
                  { emoji: '🤖', text: 'Skylla AI отвечает на вопросы 24/7 — меньше нагрузка на учителя' },
                  { emoji: '📊', text: 'Ученик сам видит свой прогресс и слабые темы' },
                ].map((item) => (
                  <motion.div key={item.text} variants={fadeUp} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{item.emoji}</span>
                    <p className="text-slate-300 text-sm leading-relaxed">{item.text}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right: savings card */}
            <motion.div variants={fadeUp} className="space-y-4">
              {/* Savings highlight */}
              <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-2xl p-6">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-white font-bold text-xl mb-2">Экономьте на менеджерах</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Обычно центры держат отдельного менеджера только для того,
                  чтобы слать домашки в WhatsApp и отвечать на одни и те же вопросы.
                  С StudyHub это делает сам ученик и AI-робот.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-950/30 border border-red-900/20 rounded-xl p-3 text-center">
                    <div className="text-slate-500 text-xs mb-1 line-through">Раньше</div>
                    <div className="text-red-400 font-semibold text-sm">Менеджер в WhatsApp</div>
                    <div className="text-slate-500 text-xs mt-1">~150,000 тг/мес</div>
                  </div>
                  <div className="bg-green-950/30 border border-green-900/20 rounded-xl p-3 text-center">
                    <div className="text-slate-500 text-xs mb-1">Сейчас</div>
                    <div className="text-green-400 font-semibold text-sm">Skylla AI + Платформа</div>
                    <div className="text-slate-500 text-xs mt-1">0 тг/мес (бесплатно)</div>
                  </div>
                </div>
              </div>

              {/* Real-time proof */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-400" />
                  Прогресс учеников с доказательствами
                </h3>
                <div className="space-y-3">
                  {[
                    { student: 'Айдана К.', action: 'сдала тест «Квадратные уравнения»', score: '87%', time: '2 мин назад', color: 'text-green-400' },
                    { student: 'Нурлан Б.', action: 'выполнил домашнее задание', score: '✓', time: '15 мин назад', color: 'text-blue-400' },
                    { student: 'Дарига М.', action: 'задала вопрос Skylla AI', score: '→', time: '23 мин назад', color: 'text-purple-400' },
                  ].map((item) => (
                    <div key={item.student} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-indigo-600/30 rounded-full flex items-center justify-center text-xs text-indigo-300 font-medium flex-shrink-0">
                        {item.student[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-white text-xs font-medium">{item.student}</span>
                        <span className="text-slate-500 text-xs"> {item.action}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-xs font-bold ${item.color}`}>{item.score}</span>
                        <span className="text-slate-600 text-xs">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-slate-500 text-xs">Вы видите это в реальном времени в дашборде центра</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Skylla AI highlight ────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-indigo-600/20 border border-indigo-500/20 rounded-3xl p-8 sm:p-10"
          >
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="text-7xl flex-shrink-0">🤖</div>
              <div>
                <div className="inline-block bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs px-3 py-1 rounded-full mb-3">
                  Skylla AI — эксклюзивная фишка
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  AI-робот отвечает ученикам вместо менеджера
                </h3>
                <p className="text-slate-400 leading-relaxed mb-4">
                  Ученик не понял тему — задаёт вопрос Skylla AI прямо в приложении.
                  Получает объяснение с примерами мгновенно, в 3 часа ночи, без доплаты.
                  Учителю не нужно отвечать в WhatsApp — AI берёт это на себя.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Объясняет темы ЕНТ', 'Разбирает ошибки в тесте', 'Помогает с домашкой', 'Отвечает 24/7', 'На казахском и русском'].map((tag) => (
                    <span key={tag} className="text-xs bg-indigo-600/20 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.div variants={fadeUp} className="inline-block bg-purple-600/20 border border-purple-500/30 text-purple-400 text-sm px-4 py-1.5 rounded-full mb-4">
              Как это работает
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
              Запустите центр за 10 минут
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="flex gap-5 p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-indigo-500/30 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center">
                  <span className="text-indigo-400 font-bold text-sm">{step.number}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.div variants={fadeUp} className="inline-block bg-green-600/20 border border-green-500/30 text-green-400 text-sm px-4 py-1.5 rounded-full mb-4">
              Тарифы
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
              Прозрачные цены без скрытых платежей
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-center gap-2 mb-2">
                <School size={22} className="text-slate-400" />
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Базовый</span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">Бесплатно</div>
              <div className="text-slate-500 text-sm mb-8">до 5 учителей</div>
              <ul className="space-y-3 mb-8">
                {[
                  'До 5 учителей в центре',
                  'Неограниченные классы',
                  'AI-генерация тестов (10/мес)',
                  'Дашборд директора',
                  'Прогресс учеников',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/auth?role=teacher')}
                className="w-full border border-white/20 hover:border-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors hover:bg-white/5"
              >
                Начать бесплатно
              </button>
            </motion.div>

            {/* Pro tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                ПОПУЛЯРНЫЙ
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={22} className="text-indigo-400" />
                <span className="text-indigo-400 text-sm font-medium uppercase tracking-wider">Центр</span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">По запросу</div>
              <div className="text-slate-500 text-sm mb-8">безлимит учителей</div>
              <ul className="space-y-3 mb-8">
                {[
                  'Неограниченно учителей',
                  'Приоритет Skylla AI (безлимит)',
                  'Расширенная аналитика',
                  'Экспорт отчётов в PDF',
                  'Выделенный менеджер',
                  'Интеграция с вашим сайтом',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                    <CheckCircle size={16} className="text-indigo-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleDemo}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                <MessageCircle size={16} />
                Связаться с нами
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-950 to-indigo-950/20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-3xl p-12"
          >
            <div className="text-5xl mb-6">🚀</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Готовы запустить дашборд центра?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Регистрация занимает 2 минуты. Первые 5 учителей — бесплатно навсегда.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/auth?role=teacher')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-indigo-600/25"
              >
                Начать бесплатно
                <ArrowRight size={18} />
              </button>
              <button
                onClick={handleDemo}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <MessageCircle size={18} className="text-green-400" />
                Нужна демо? Напишите нам
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-slate-400 text-sm">StudyHub © 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Для студентов
            </a>
            <a href="/pricing" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Цены
            </a>
            <a href="/support" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Поддержка
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
