import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  GraduationCap,
  Menu,
  X,
  Brain,
  Target,
  Route,
  Trophy,
  Bot,
  ClipboardList,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Sparkles,
  HelpCircle,
  Calendar,
  Eye,
  ArrowRight,
  Check,
  Star,
  ChevronRight,
  Zap,
  Shield,
  BarChart3,
  Send,
  Github,
  Instagram,
  MessageCircle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function useSectionInView(amount = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  return { ref, inView };
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
} satisfies import('framer-motion').Variants;

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
} satisfies import('framer-motion').Variants;

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as const },
  }),
} satisfies import('framer-motion').Variants;

// ---------------------------------------------------------------------------
// 1. Header / Nav
// ---------------------------------------------------------------------------

function Header({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { label: 'Возможности', href: '#features' },
    { label: 'Тарифы', href: '#pricing' },
    { label: 'О нас', href: '#about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-black/5' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-md shadow-primary-500/25 transition-transform group-hover:scale-105">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary-950">
              Study<span className="text-gradient">Hub</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={() => onNavigate('/auth')}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Войти
            </button>
            <button
              onClick={() => onNavigate('/diagnostic')}
              className="gradient-primary rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              Начать бесплатно
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass border-t border-white/20 lg:hidden"
        >
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-3">
              <button
                onClick={() => { setMobileOpen(false); onNavigate('/auth'); }}
                className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                Войти
              </button>
              <button
                onClick={() => { setMobileOpen(false); onNavigate('/diagnostic'); }}
                className="gradient-primary rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25"
              >
                Начать бесплатно
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}

// ---------------------------------------------------------------------------
// 2. Hero
// ---------------------------------------------------------------------------

function HeroSection({ onNavigate }: { onNavigate: (path: string) => void }) {
  const stats = [
    { value: '15,000+', label: 'учеников' },
    { value: '95%', label: 'поступивших' },
    { value: '50+', label: 'вузов' },
  ];

  return (
    <section className="gradient-hero relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-32">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-400/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-400/20 bg-primary-500/10 px-4 py-1.5 text-sm font-medium text-primary-300"
          >
            <Sparkles className="h-4 w-4" />
            <span>Платформа для подготовки к поступлению</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Поступи туда,{' '}
            <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              куда хочешь
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl"
          >
            AI-платформа, которая создаёт персональный маршрут подготовки к ЕНТ
            и помогает поступить в лучшие вузы Казахстана и мира.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <button
              onClick={() => onNavigate('/diagnostic')}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary-700 shadow-xl shadow-white/10 transition-all hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5 sm:w-auto"
            >
              Пройти диагностику бесплатно
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#how-it-works"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30 sm:w-auto"
            >
              Узнать больше
              <ChevronRight className="h-5 w-5" />
            </a>
          </motion.div>
        </div>

        {/* Floating stats */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 lg:mt-20">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 + i * 0.12 }}
              className="animate-float glass flex min-w-[160px] flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center shadow-xl backdrop-blur-md"
              style={{ animationDelay: `${i * 2}s` }}
            >
              <span className="text-3xl font-extrabold text-white">{s.value}</span>
              <span className="mt-1 text-sm text-slate-300">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3. Problem Section
// ---------------------------------------------------------------------------

function ProblemSection() {
  const { ref, inView } = useSectionInView();

  const problems = [
    {
      icon: HelpCircle,
      title: 'Не знаю куда поступать',
      description:
        'Сотни специальностей, десятки вузов — выбор кажется невозможным. Без чёткой информации легко ошибиться и потерять годы.',
      color: 'from-red-500 to-orange-500',
      bg: 'bg-red-50',
    },
    {
      icon: Calendar,
      title: 'Учусь хаотично без плана',
      description:
        'Без структурного подхода подготовка превращается в хаос. Пропуски тем, забытый материал, стресс перед экзаменом.',
      color: 'from-amber-500 to-yellow-500',
      bg: 'bg-amber-50',
    },
    {
      icon: Eye,
      title: 'Родители не видят прогресс',
      description:
        'Родители хотят помочь, но не понимают, что происходит. Нет прозрачности — нет доверия и поддержки.',
      color: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <section ref={ref} className="relative py-20 lg:py-28" id="about">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-600">
            Проблема
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Знакомые проблемы?
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Тысячи учеников и их родителей сталкиваются с этим каждый год
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={i + 1}
              className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
            >
              <div
                className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${p.bg}`}
              >
                <p.icon
                  className={`h-7 w-7 bg-gradient-to-br ${p.color} bg-clip-text`}
                  style={{ color: p.color.includes('red') ? '#ef4444' : p.color.includes('amber') ? '#f59e0b' : '#a855f7' }}
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-slate-500">{p.description}</p>
              {/* Decorative gradient blob */}
              <div
                className={`pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${p.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 4. How It Works
// ---------------------------------------------------------------------------

function HowItWorksSection() {
  const { ref, inView } = useSectionInView();

  const steps = [
    {
      icon: Brain,
      title: 'Пройди диагностику',
      description: 'AI-тест определит твой уровень знаний, сильные и слабые стороны за 15 минут.',
      color: 'from-primary-500 to-primary-600',
    },
    {
      icon: Target,
      title: 'Получи персональный план',
      description:
        'Алгоритм составит маршрут подготовки, адаптированный под твои цели и уровень.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Route,
      title: 'Учись по маршруту',
      description:
        'Следуй пошаговому плану с AI-ментором, который корректирует путь в реальном времени.',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: Trophy,
      title: 'Поступи в мечту',
      description:
        'Сдай ЕНТ на максимум и получи грант в вуз, о котором мечтал.',
      color: 'from-accent-500 to-accent-600',
    },
  ];

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="relative bg-gradient-to-b from-slate-50 to-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-600">
            Как это работает
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            4 шага к{' '}
            <span className="text-gradient">поступлению</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Простой и понятный путь от диагностики до зачисления
          </p>
        </motion.div>

        <div className="relative mt-16">
          {/* Connecting line (desktop) */}
          <div className="absolute top-24 right-0 left-0 hidden h-0.5 bg-gradient-to-r from-primary-200 via-purple-200 to-accent-200 lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                custom={i + 1}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step number badge */}
                <div className="relative z-10 mb-4">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} shadow-lg`}
                    style={{
                      boxShadow:
                        i === 0
                          ? '0 8px 30px rgba(59,130,246,.3)'
                          : i === 1
                          ? '0 8px 30px rgba(168,85,247,.3)'
                          : i === 2
                          ? '0 8px 30px rgba(236,72,153,.3)'
                          : '0 8px 30px rgba(34,197,94,.3)',
                    }}
                  >
                    <s.icon className="h-8 w-8 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700 shadow-md ring-2 ring-slate-100">
                    {i + 1}
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 5. Features
// ---------------------------------------------------------------------------

function FeaturesSection() {
  const { ref, inView } = useSectionInView();

  const features = [
    {
      icon: Bot,
      title: 'AI-ментор',
      description:
        'Персональный репетитор на базе ИИ, который ответит на любой вопрос и объяснит тему простым языком 24/7.',
      color: 'text-primary-600',
      bg: 'bg-primary-50',
      border: 'group-hover:border-primary-200',
    },
    {
      icon: ClipboardList,
      title: 'Персональный план',
      description:
        'Индивидуальный маршрут подготовки, который адаптируется к твоему темпу и прогрессу.',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'group-hover:border-purple-200',
    },
    {
      icon: Users,
      title: 'Родительская панель',
      description:
        'Прозрачная аналитика для родителей: прогресс, посещаемость, прогноз результата.',
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      border: 'group-hover:border-pink-200',
    },
    {
      icon: BookOpen,
      title: 'Банк заданий ЕНТ',
      description:
        'Тысячи заданий из реальных ЕНТ прошлых лет с подробными разборами и пояснениями.',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'group-hover:border-amber-200',
    },
    {
      icon: Award,
      title: 'Портфолио достижений',
      description:
        'Собирай свои результаты, сертификаты и достижения в одном месте для подачи в вуз.',
      color: 'text-accent-600',
      bg: 'bg-accent-50',
      border: 'group-hover:border-accent-200',
    },
    {
      icon: TrendingUp,
      title: 'Прогноз поступления',
      description:
        'AI-алгоритм рассчитает вероятность поступления в выбранные вузы на основе твоего прогресса.',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      border: 'group-hover:border-cyan-200',
    },
  ];

  return (
    <section ref={ref} id="features" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-600">
            Возможности
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Всё для{' '}
            <span className="text-gradient">успешного поступления</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Инструменты, которые делают подготовку эффективной и понятной
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={scaleIn}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={i}
              className={`group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 ${f.border}`}
            >
              <div
                className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${f.bg} transition-transform duration-300 group-hover:scale-110`}
              >
                <f.icon className={`h-7 w-7 ${f.color}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{f.title}</h3>
              <p className="mt-3 leading-relaxed text-slate-500">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 6. Social Proof
// ---------------------------------------------------------------------------

function SocialProofSection() {
  const { ref, inView } = useSectionInView();

  const testimonials = [
    {
      name: 'Айдана К.',
      role: 'Поступила в НУ, Астана',
      text: 'Благодаря Study Hub я подняла балл ЕНТ с 89 до 128 за 4 месяца. Персональный план и AI-ментор реально работают!',
      avatar: 'А',
      color: 'from-primary-500 to-purple-500',
    },
    {
      name: 'Дамир Т.',
      role: 'Поступил в КБТУ, Алматы',
      text: 'Раньше учился хаотично и терял мотивацию. Study Hub структурировал мою подготовку, и я поступил на грант.',
      avatar: 'Д',
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Гульнара М.',
      role: 'Мама ученицы',
      text: 'Наконец-то я вижу, как учится моя дочь. Родительская панель показывает всё: от посещаемости до прогноза. Очень удобно!',
      avatar: 'Г',
      color: 'from-pink-500 to-red-500',
    },
  ];

  const stats = [
    { value: '15,000+', label: 'учеников' },
    { value: '850+', label: 'поступивших' },
    { value: '50+', label: 'вузов' },
    { value: '4.9', label: 'рейтинг' },
  ];

  return (
    <section ref={ref} className="relative bg-gradient-to-b from-slate-50 to-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-600">
            Отзывы
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Нам доверяют{' '}
            <span className="text-gradient">тысячи учеников</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Истории успеха учеников и их родителей
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={i + 1}
              className="relative rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, si) => (
                  <Star
                    key={si}
                    className="h-5 w-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-base leading-relaxed text-slate-600">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-base font-bold text-white shadow-md`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          custom={4}
          className="mt-16 overflow-hidden rounded-3xl gradient-primary p-1 shadow-xl shadow-primary-500/20"
        >
          <div className="grid grid-cols-2 gap-px rounded-[22px] bg-white/5 md:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col items-center py-8 ${
                  i < stats.length - 1 ? 'md:border-r md:border-white/10' : ''
                }`}
              >
                <span className="text-3xl font-extrabold text-white lg:text-4xl">
                  {s.value}
                </span>
                <span className="mt-1 text-sm font-medium text-white/70">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 7. Pricing
// ---------------------------------------------------------------------------

function PricingSection({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { ref, inView } = useSectionInView();

  const plans = [
    {
      name: 'Бесплатный',
      price: '0 ₸',
      period: 'навсегда',
      description: 'Идеально для знакомства с платформой',
      features: [
        'Диагностика уровня знаний',
        'Базовый план подготовки',
        'Ограниченный банк тестов (20 заданий)',
        'Общий прогноз поступления',
        'Доступ к сообществу',
      ],
      cta: 'Начать бесплатно',
      popular: false,
    },
    {
      name: 'Премиум',
      price: '4,990 ₸',
      period: '/мес',
      description: 'Максимум возможностей для серьёзной подготовки',
      features: [
        'AI-ментор 24/7',
        'Родительская панель аналитики',
        'Безлимитный банк тестов ЕНТ',
        'Детальная аналитика прогресса',
        'Приоритетная поддержка',
        'Персональный план подготовки',
        'Портфолио достижений',
        'Подробный прогноз поступления',
      ],
      cta: 'Выбрать Премиум',
      popular: true,
    },
  ];

  return (
    <section ref={ref} id="pricing" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-accent-50 px-4 py-1.5 text-sm font-semibold text-accent-600">
            Тарифы
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Простые и{' '}
            <span className="text-gradient">прозрачные цены</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Начни бесплатно, перейди на Премиум когда будешь готов
          </p>
        </motion.div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-8 lg:grid-cols-2">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={scaleIn}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={i}
              className={`relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 hover:shadow-xl lg:p-10 ${
                plan.popular
                  ? 'border-primary-200 bg-white shadow-xl shadow-primary-500/10'
                  : 'border-slate-200 bg-white shadow-sm hover:shadow-slate-200/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="gradient-primary rounded-bl-2xl px-4 py-1.5 text-xs font-bold tracking-wide text-white uppercase">
                    Популярный
                  </div>
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold tracking-tight text-slate-900">
                  {plan.price}
                </span>
                <span className="text-lg text-slate-500">{plan.period}</span>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check
                      className={`mt-0.5 h-5 w-5 shrink-0 ${
                        plan.popular ? 'text-primary-600' : 'text-accent-500'
                      }`}
                    />
                    <span className="text-sm text-slate-600">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onNavigate('/diagnostic')}
                className={`mt-8 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                  plan.popular
                    ? 'gradient-primary text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 8. CTA Section
// ---------------------------------------------------------------------------

function CtaSection({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { ref, inView } = useSectionInView();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('/diagnostic');
  };

  return (
    <section ref={ref} className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="relative overflow-hidden rounded-[2rem] gradient-hero px-6 py-16 text-center shadow-2xl sm:px-12 lg:px-20 lg:py-24"
        >
          {/* Decorative elements */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
          </div>

          <div className="relative">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90"
            >
              <Zap className="h-4 w-4" />
              <span>Присоединяйся к 15,000+ ученикам</span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={1}
              className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Начни свой путь{' '}
              <span className="bg-gradient-to-r from-primary-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                сегодня
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={2}
              className="mx-auto mt-4 max-w-xl text-lg text-slate-300"
            >
              Пройди бесплатную диагностику и получи персональный план подготовки к ЕНТ за 15 минут
            </motion.p>

            <motion.form
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={3}
              onSubmit={handleSubmit}
              className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
                className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-base text-white placeholder-white/50 outline-none backdrop-blur-sm transition-colors focus:border-white/40 focus:bg-white/15"
              />
              <button
                type="submit"
                className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary-700 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-0.5"
              >
                Начать
                <Send className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.form>

            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={4}
              className="mt-6 flex items-center justify-center gap-6 text-sm text-white/60"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                Бесплатно
              </span>
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                Без обязательств
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 9. Footer
// ---------------------------------------------------------------------------

function Footer() {
  const links = {
    Платформа: ['Возможности', 'Тарифы', 'Банк заданий', 'AI-ментор'],
    Поддержка: ['Помощь', 'Контакты', 'FAQ', 'Блог'],
    Компания: ['О нас', 'Карьера', 'Партнёрам', 'Пресса'],
    Правовая: ['Конфиденциальность', 'Условия', 'Cookies'],
  };

  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2.5">
              <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-md shadow-primary-500/25">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary-950">
                Study<span className="text-gradient">Hub</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              AI-платформа для подготовки к ЕНТ и поступлению в лучшие вузы Казахстана и мира.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, MessageCircle, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-primary-50 hover:text-primary-600 hover:-translate-y-0.5"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
                {title}
              </h4>
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-slate-500 transition-colors hover:text-primary-600"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Study Hub. Все права защищены.
          </p>
          <p className="text-sm text-slate-400">
            Сделано с любовью в Казахстане
          </p>
        </div>
      </div>
    </footer>
  );
}

// ===========================================================================
// Landing Page (default export)
// ===========================================================================

export default function Landing() {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header onNavigate={handleNavigate} />
      <main>
        <HeroSection onNavigate={handleNavigate} />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <SocialProofSection />
        <PricingSection onNavigate={handleNavigate} />
        <CtaSection onNavigate={handleNavigate} />
      </main>
      <Footer />
    </div>
  );
}
