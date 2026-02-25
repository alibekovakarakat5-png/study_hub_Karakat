import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  GraduationCap,
  Menu,
  X,
  Brain,
  Target,
  Trophy,
  Bot,
  Sparkles,
  ArrowRight,
  Check,
  Star,
  ChevronRight,
  Zap,
  MessageCircle,
  Play,
  Compass,
  BookOpen,
  Send,
  Briefcase,
  MapPin,
  Heart,
  Shield,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Shared animation helpers
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as const },
  }),
} satisfies import('framer-motion').Variants;

const slideFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
} satisfies import('framer-motion').Variants;

const slideFromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
} satisfies import('framer-motion').Variants;

// ---------------------------------------------------------------------------
// Animated counter hook
// ---------------------------------------------------------------------------

function useCounter(target: number, inView: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return count;
}

// ---------------------------------------------------------------------------
// Typing effect hook
// ---------------------------------------------------------------------------

function useTypingEffect(text: string, inView: boolean, speed = 50) {
  const [displayed, setDisplayed] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [inView, text, speed]);

  return displayed;
}

// ---------------------------------------------------------------------------
// SVG Progress Ring
// ---------------------------------------------------------------------------

function ProgressRing({ progress, size = 48, strokeWidth = 4 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#ringGradient)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000"
      />
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 1. HEADER (sticky, glassmorphism)
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
    { label: 'Как это работает', href: '#how-it-works' },
    { label: 'Возможности', href: '#features' },
    { label: 'Отзывы', href: '#testimonials' },
    { label: 'Цены', href: '#pricing' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/20'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-md shadow-primary-500/25 transition-transform group-hover:scale-105">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${scrolled ? 'text-primary-950' : 'text-white'}`}>
              Study<span className="text-gradient">Hub</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-slate-600 hover:bg-primary-50 hover:text-primary-700'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={() => onNavigate('/auth')}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
                scrolled
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
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
            className={`rounded-lg p-2 transition-colors lg:hidden ${
              scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'
            }`}
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
          className="bg-white/95 backdrop-blur-xl border-t border-slate-100 lg:hidden"
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
// 2. HERO SECTION with product mockup
// ---------------------------------------------------------------------------

function HeroSection({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <section className="gradient-hero relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/3 h-[300px] w-[300px] rounded-full bg-pink-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left side — text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-400/20 bg-primary-500/10 px-4 py-1.5 text-sm font-medium text-primary-300"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI-навигатор для учеников Казахстана</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Твой путь от школы{' '}
              <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                до мечты
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300 sm:text-xl"
            >
              AI-платформа, которая поможет выбрать профессию, подготовиться к ЕНТ
              и поступить в вуз мечты.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <button
                onClick={() => onNavigate('/diagnostic')}
                className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary-700 shadow-xl shadow-white/10 transition-all hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5"
              >
                Начать бесплатно
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#features"
                className="group flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30"
              >
                <Play className="h-5 w-5" />
                Смотреть демо
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="mt-10 flex items-center gap-4"
            >
              {/* Avatar stack */}
              <div className="flex -space-x-3">
                {['bg-gradient-to-br from-primary-400 to-purple-500',
                  'bg-gradient-to-br from-pink-400 to-rose-500',
                  'bg-gradient-to-br from-amber-400 to-orange-500',
                  'bg-gradient-to-br from-emerald-400 to-teal-500',
                ].map((bg, i) => (
                  <div
                    key={i}
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${bg} text-xs font-bold text-white ring-2 ring-slate-900`}
                  >
                    {['А', 'Д', 'М', 'К'][i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">15,000+ учеников уже с нами</p>
                <div className="mt-0.5 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right side — Phone mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <div className="relative flex justify-center">
              {/* Phone frame */}
              <div className="relative w-[260px] rounded-[2.5rem] border-[6px] border-slate-700 bg-slate-900 p-3 shadow-2xl shadow-black/50">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-slate-700" />
                {/* Screen */}
                <div className="rounded-[2rem] bg-gradient-to-b from-slate-800 to-slate-900 p-4 pt-8">
                  {/* Mini header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-white">Study Hub</span>
                    </div>
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">А</div>
                  </div>

                  {/* Greeting */}
                  <p className="text-[11px] text-slate-400">Привет, Айдана!</p>
                  <p className="text-sm font-bold text-white mt-0.5">Твой прогресс</p>

                  {/* Progress bar */}
                  <div className="mt-3 rounded-xl bg-slate-700/50 p-3">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-300">Общий балл</span>
                      <span className="font-bold text-primary-400">76%</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-slate-700">
                      <div className="h-full w-[76%] rounded-full bg-gradient-to-r from-primary-500 to-purple-500" />
                    </div>
                  </div>

                  {/* Subject list */}
                  <div className="mt-3 space-y-2">
                    {[
                      { name: 'Математика', score: '87%', color: 'from-blue-500 to-cyan-500' },
                      { name: 'Физика', score: '72%', color: 'from-purple-500 to-pink-500' },
                      { name: 'История КЗ', score: '91%', color: 'from-emerald-500 to-teal-500' },
                    ].map((s) => (
                      <div key={s.name} className="flex items-center justify-between rounded-lg bg-slate-700/30 px-3 py-2">
                        <span className="text-[10px] text-slate-300">{s.name}</span>
                        <span className={`text-[10px] font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.score}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI tip */}
                  <div className="mt-3 rounded-xl bg-primary-500/10 border border-primary-500/20 p-2.5">
                    <div className="flex items-start gap-2">
                      <Bot className="h-3.5 w-3.5 text-primary-400 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-primary-300 leading-relaxed">Советую повторить логарифмы перед тестом</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card: Score */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-8 top-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-3 shadow-xl lg:-left-16"
              >
                <div className="flex items-center gap-2.5">
                  <ProgressRing progress={87} size={40} strokeWidth={3} />
                  <div>
                    <p className="text-[10px] text-slate-400">Математика</p>
                    <p className="text-sm font-bold text-white">87%</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating card: Streak */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -right-6 top-28 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2.5 shadow-xl lg:-right-14"
              >
                <p className="text-lg">🔥</p>
                <p className="text-xs font-bold text-white">12 дней подряд</p>
              </motion.div>

              {/* Floating card: Achievement */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -left-4 bottom-24 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2.5 shadow-xl lg:-left-12"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <p className="text-xs font-bold text-white">Отличник</p>
                </div>
              </motion.div>

              {/* Floating card: AI message */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute -right-4 bottom-16 rounded-2xl bg-gradient-to-r from-primary-500/20 to-purple-500/20 backdrop-blur-xl border border-primary-400/20 px-3 py-2 shadow-xl lg:-right-10"
              >
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary-400" />
                  <p className="text-[10px] text-primary-300 max-w-[120px]">Советую повторить логарифмы</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3. LIVE STATS BAR
// ---------------------------------------------------------------------------

function LiveStatsBar() {
  const { ref, inView } = useSectionInView(0.5);

  const diagnostics = useCounter(1500, inView);
  const students = useCounter(500, inView);
  const plans = useCounter(200, inView);
  const social = useCounter(20, inView);

  const stats = [
    { value: `${diagnostics.toLocaleString()}+`, label: 'диагностик пройдено' },
    { value: `${students}+`, label: 'учеников на платных тарифах' },
    { value: `${plans}+`, label: 'персональных планов' },
    { value: `${social}%`, label: 'поддержано через соц. программу' },
  ];

  return (
    <section ref={ref} className="relative -mt-1 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-px md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={i}
              className="flex flex-col items-center py-8 lg:py-10"
            >
              <span className="text-3xl font-extrabold text-white lg:text-4xl">
                {s.value}
              </span>
              <span className="mt-1 text-sm font-medium text-white/70">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 4. PROBLEM → SOLUTION SECTION
// ---------------------------------------------------------------------------

function ProblemSolutionSection() {
  const { ref, inView } = useSectionInView();

  const pairs = [
    {
      problem: 'Не знаю кем стать',
      solution: 'AI определит твои сильные стороны и подберёт профессию',
    },
    {
      problem: 'Не понимаю как готовиться к ЕНТ',
      solution: 'Персональный план подготовки, адаптированный под тебя',
    },
    {
      problem: 'Родители переживают, а я не знаю что делать',
      solution: 'Родители видят прогресс в реальном времени',
    },
  ];

  return (
    <section ref={ref} className="relative py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Мы знаем, каково это
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            И у нас есть решение для каждой проблемы
          </p>
        </motion.div>

        <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-16 items-start">
          {/* Arrow between columns (visible on lg) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex pointer-events-none z-10">
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight className="h-10 w-10 text-primary-400/40" />
            </motion.div>
          </div>

          {/* Problems */}
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-600">
              Знакомо?
            </div>
            <div className="space-y-4">
              {pairs.map((p, i) => (
                <motion.div
                  key={p.problem}
                  variants={fadeUp}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                  custom={i + 1}
                  className="flex items-start gap-4 rounded-2xl border border-red-100 bg-red-50/50 p-5 transition-all hover:shadow-md"
                >
                  <span className="text-2xl shrink-0">😟</span>
                  <p className="text-base font-medium text-slate-700">{p.problem}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Solutions */}
          <motion.div
            variants={slideFromRight}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-600">
              Study Hub решает
            </div>
            <div className="space-y-4">
              {pairs.map((p, i) => (
                <motion.div
                  key={p.solution}
                  variants={fadeUp}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                  custom={i + 1.5}
                  className="flex items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 transition-all hover:shadow-md"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 mt-0.5">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-base font-medium text-slate-700">{p.solution}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 5. PRODUCT SHOWCASE SECTION
// ---------------------------------------------------------------------------

function ProductShowcaseSection() {
  const { ref, inView } = useSectionInView(0.1);

  return (
    <section ref={ref} id="features" className="relative py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <span className="mb-3 inline-block rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-600">
            Возможности
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Вся экосистема{' '}
            <span className="text-gradient">в одном месте</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Три мощных инструмента, которые ведут тебя от школы до карьеры
          </p>
        </motion.div>

        {/* Card 1: Умная диагностика — laptop mockup */}
        <ShowcaseCard1 inView={inView} />

        {/* Card 2: AI-ментор — phone mockup (right) */}
        <ShowcaseCard2 inView={inView} />

        {/* Card 3: Карьерный навигатор — wide mockup */}
        <ShowcaseCard3 inView={inView} />
      </div>
    </section>
  );
}

function ShowcaseCard1({ inView }: { inView: boolean }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={1}
      className="mb-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:mb-16"
    >
      <div className="grid lg:grid-cols-2">
        {/* Laptop mockup */}
        <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 p-8 lg:p-12 flex items-center justify-center">
          {/* Floating badge */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-6 right-6 rounded-full bg-primary-500 px-3 py-1 text-[10px] font-bold text-white shadow-lg z-10"
          >
            AI-адаптивный
          </motion.div>

          {/* Laptop frame */}
          <div className="w-full max-w-sm">
            <div className="rounded-t-xl border-[3px] border-slate-300 border-b-0 bg-slate-800 p-3">
              {/* Browser bar */}
              <div className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-1.5 mb-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 text-center text-[9px] text-slate-400">studyhub.kz/test</div>
              </div>

              {/* Test interface */}
              <div className="rounded-lg bg-white p-4">
                {/* Progress */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                  <span>Вопрос 12 из 30</span>
                  <span className="font-bold text-primary-600">40%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 mb-4">
                  <div className="h-full w-[40%] rounded-full bg-gradient-to-r from-primary-500 to-purple-500" />
                </div>

                {/* Question */}
                <p className="text-xs font-semibold text-slate-800 mb-3">
                  Решите уравнение: log₂(x+3) = 5
                </p>

                {/* Options */}
                {['x = 29', 'x = 32', 'x = 13', 'x = 28'].map((opt, i) => (
                  <div
                    key={opt}
                    className={`mb-2 rounded-lg border px-3 py-2 text-[10px] transition-colors ${
                      i === 0
                        ? 'border-primary-300 bg-primary-50 text-primary-700 font-medium'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>
            {/* Laptop base */}
            <div className="h-3 rounded-b-xl bg-slate-300 mx-[-2px]" />
            <div className="mx-auto h-1 w-1/3 rounded-b-lg bg-slate-400" />
          </div>
        </div>

        {/* Description */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
            <Brain className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 lg:text-3xl">Умная диагностика</h3>
          <p className="mt-3 text-base text-slate-500 leading-relaxed">
            AI-тест, который адаптируется к твоему уровню в реальном времени.
            Сложнее, если справляешься. Проще, если нужно закрепить базу.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Определяет сильные и слабые стороны за 15 минут',
              'Адаптируется к уровню — каждый вопрос подобран под тебя',
              'Детальный отчёт по каждой теме',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function ShowcaseCard2({ inView }: { inView: boolean }) {
  const aiMessage = useTypingEffect('Привет! Я вижу, что тебе сложно с логарифмами. Давай разберём пошагово?', inView, 35);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={2}
      className="mb-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:mb-16"
    >
      <div className="grid lg:grid-cols-2">
        {/* Description (left on lg) */}
        <div className="p-8 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50">
            <Bot className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 lg:text-3xl">AI-ментор</h3>
          <p className="mt-3 text-base text-slate-500 leading-relaxed">
            Персональный помощник, который доступен 24/7. Спроси что угодно —
            он объяснит простым языком и поможет разобраться.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Объясняет любую тему простым языком',
              'Помогает с домашними заданиями',
              'Мотивирует и следит за прогрессом',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Phone mockup (right on lg) */}
        <div className="relative bg-gradient-to-br from-purple-50 to-slate-50 p-8 lg:p-12 flex items-center justify-center order-1 lg:order-2">
          {/* Floating badge */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-6 left-6 rounded-full bg-purple-500 px-3 py-1 text-[10px] font-bold text-white shadow-lg z-10"
          >
            24/7 доступ
          </motion.div>

          {/* Phone frame */}
          <div className="w-[240px] rounded-[2.5rem] border-[6px] border-slate-700 bg-slate-900 p-3 shadow-2xl">
            <div className="absolute top-[18px] left-1/2 h-5 w-20 -translate-x-1/2 rounded-b-xl bg-slate-700 z-10" />
            <div className="rounded-[2rem] bg-gradient-to-b from-slate-800 to-slate-900 p-4 pt-6">
              {/* Chat header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/50">
                <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">AI-ментор</p>
                  <p className="text-[9px] text-emerald-400">онлайн</p>
                </div>
              </div>

              {/* Chat bubbles */}
              <div className="space-y-3">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary-500 px-3 py-2">
                    <p className="text-[10px] text-white">Не понимаю логарифмы, помоги!</p>
                  </div>
                </div>

                {/* AI response with typing */}
                <div className="flex justify-start">
                  <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-slate-700 px-3 py-2">
                    <p className="text-[10px] text-slate-200 leading-relaxed">
                      {aiMessage}
                      <span className="inline-block w-0.5 h-2.5 bg-primary-400 ml-0.5 animate-pulse" />
                    </p>
                  </div>
                </div>

                {/* User follow-up */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary-500 px-3 py-2">
                    <p className="text-[10px] text-white">Да, давай!</p>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-700/50 px-3 py-2">
                <p className="flex-1 text-[10px] text-slate-500">Напиши сообщение...</p>
                <Send className="h-3.5 w-3.5 text-primary-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ShowcaseCard3({ inView }: { inView: boolean }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={3}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
    >
      <div className="grid lg:grid-cols-2">
        {/* Wide mockup */}
        <div className="relative bg-gradient-to-br from-emerald-50 to-slate-50 p-8 lg:p-12 flex items-center justify-center">
          {/* Floating badge */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-6 right-6 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold text-white shadow-lg z-10"
          >
            От школы до работы
          </motion.div>

          {/* Career path timeline */}
          <div className="w-full max-w-sm">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold text-slate-800 mb-6 text-center">Твой карьерный путь</p>
              <div className="space-y-0">
                {[
                  { icon: BookOpen, label: '11 класс', sub: 'Подготовка к ЕНТ', color: 'bg-primary-500', active: true },
                  { icon: GraduationCap, label: 'Университет', sub: 'IT / Computer Science', color: 'bg-purple-500', active: false },
                  { icon: Briefcase, label: 'Карьера', sub: 'Software Engineer', color: 'bg-emerald-500', active: false },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.color} ${step.active ? 'shadow-lg' : 'opacity-60'}`}>
                        <step.icon className="h-5 w-5 text-white" />
                      </div>
                      {i < 2 && (
                        <div className="w-0.5 h-8 bg-slate-200 my-1" />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className={`text-sm font-bold ${step.active ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                      <p className="text-[11px] text-slate-400">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
            <Compass className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 lg:text-3xl">Карьерный навигатор</h3>
          <p className="mt-3 text-base text-slate-500 leading-relaxed">
            Не просто подготовка к ЕНТ — мы помогаем выстроить путь
            от школы до работы мечты.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Подбор профессии на основе твоих интересов и способностей',
              'Рекомендации по вузам и специальностям',
              'Пошаговый план от текущего момента до трудоустройства',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 6. HOW IT WORKS (4 steps)
// ---------------------------------------------------------------------------

function HowItWorksSection() {
  const { ref, inView } = useSectionInView();

  const steps = [
    {
      icon: Target,
      title: 'Пройди онбординг',
      description: 'Расскажи о себе, своих целях и интересах за 5 минут.',
      color: 'from-primary-500 to-primary-600',
      shadow: 'rgba(59,130,246,.3)',
    },
    {
      icon: MapPin,
      title: 'Цифровой куратор',
      description: 'AI составит персональный план подготовки к ЕНТ/IELTS с теорией и практикой.',
      color: 'from-purple-500 to-purple-600',
      shadow: 'rgba(168,85,247,.3)',
    },
    {
      icon: Bot,
      title: 'Учись с AI-ментором',
      description: 'Занимайся по плану с персональным AI-помощником 24/7.',
      color: 'from-pink-500 to-pink-600',
      shadow: 'rgba(236,72,153,.3)',
    },
    {
      icon: Trophy,
      title: 'Достигни цели',
      description: 'Сдай ЕНТ на максимум и поступи в вуз мечты.',
      color: 'from-accent-500 to-accent-600',
      shadow: 'rgba(34,197,94,.3)',
    },
  ];

  return (
    <section ref={ref} id="how-it-works" className="relative bg-white py-20 lg:py-28">
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
            <span className="text-gradient">твоей мечте</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Простой и понятный путь от первого шага до результата
          </p>
        </motion.div>

        <div className="relative mt-16">
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
                {/* Arrow connector between steps (desktop) */}
                {i < steps.length - 1 && (
                  <div className="absolute top-8 -right-3 z-20 hidden -translate-y-1/2 lg:flex items-center" style={{ right: '-1.25rem' }}>
                    <div className="flex items-center gap-0.5">
                      <div className="h-0.5 w-4 rounded-full bg-gradient-to-r from-slate-300 to-slate-200" />
                      <ChevronRight className="h-5 w-5 text-slate-300" />
                    </div>
                  </div>
                )}

                {/* Step icon */}
                <div className="relative z-10 mb-4">
                  <motion.div
                    animate={inView ? { scale: [0.8, 1.05, 1] } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] as const }}
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} shadow-lg`}
                    style={{ boxShadow: `0 8px 30px ${s.shadow}` }}
                  >
                    <s.icon className="h-8 w-8 text-white" />
                  </motion.div>
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
// 7. SOCIAL PROOF / TESTIMONIALS
// ---------------------------------------------------------------------------

function TestimonialsSection() {
  const { ref, inView } = useSectionInView();

  const testimonials = [
    {
      name: 'Айгерим',
      role: 'Ученица 11 класса, Алматы',
      text: 'Подняла баллы с 67 до 89 за 2 месяца. AI-ментор объясняет лучше, чем репетитор — и доступен в любое время!',
      avatar: 'А',
      color: 'from-primary-500 to-purple-500',
    },
    {
      name: 'Дамир',
      role: 'Ученик 10 класса, Астана',
      text: 'Наконец-то понял кем хочу стать! Карьерный навигатор показал, что мне подходит IT, и теперь у меня есть чёткий план.',
      avatar: 'Д',
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Анара',
      role: 'Мама ученика, Караганда',
      text: 'Теперь вижу прогресс ребёнка каждый день. Наконец спокойна — знаю, что подготовка идёт по плану.',
      avatar: 'А',
      color: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <section ref={ref} id="testimonials" className="relative bg-gradient-to-b from-slate-50 to-white py-20 lg:py-28">
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
            Реальные истории учеников и их родителей
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              variants={scaleIn}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={i}
              className="relative rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
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
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 8. PRICING SECTION
// ---------------------------------------------------------------------------

function PricingSection({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { ref, inView } = useSectionInView();

  const plans = [
    {
      name: 'Free',
      price: '0 ₸',
      period: 'навсегда',
      description: 'Социальный + демо доступ для знакомства',
      features: [
        'Диагностика уровня знаний',
        'Ограниченный банк тестов',
        'Общий план подготовки',
        'Базовый прогноз поступления',
      ],
      cta: 'Начать бесплатно',
      popular: false,
      hasSocialNote: true,
    },
    {
      name: 'Growth',
      price: '4 990 ₸',
      period: '/мес',
      description: 'Для серьёзной подготовки к ЕНТ',
      features: [
        'AI-план подготовки',
        'Полный банк тестов',
        'Детальная аналитика прогресса',
        'Родительская панель',
        'Портфолио достижений',
        'AI-ментор 24/7',
      ],
      cta: 'Выбрать Growth',
      popular: true,
      hasSocialNote: false,
    },
    {
      name: 'Pro / Career',
      price: '9 990 ₸',
      period: '/мес',
      description: 'Полная экосистема: от ЕНТ до карьеры',
      features: [
        'Всё из тарифа Growth',
        'Карьерный навигатор',
        'Рекомендации по вузам',
        'Подробный прогноз поступления',
        'Индивидуальные рекомендации',
        'Приоритетная поддержка',
      ],
      cta: 'Выбрать Pro',
      popular: false,
      hasSocialNote: false,
    },
  ];

  return (
    <section ref={ref} id="pricing" className="relative py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-accent-50 px-4 py-1.5 text-sm font-semibold text-accent-600">
            Цены
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Простые и{' '}
            <span className="text-gradient">прозрачные цены</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Начни бесплатно, перейди на платный тариф когда будешь готов
          </p>
        </motion.div>

        <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={scaleIn}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={i}
              className={`relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'border-primary-200 bg-white shadow-xl shadow-primary-500/10 scale-[1.02] lg:scale-105'
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
                <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                  {plan.price}
                </span>
                <span className="text-base text-slate-500">{plan.period}</span>
              </div>

              <ul className="mt-8 space-y-3">
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

              {plan.hasSocialNote && (
                <button
                  onClick={() => onNavigate('/support')}
                  className="mt-6 flex w-full items-start gap-2 rounded-xl bg-rose-50/80 border border-rose-100 px-3.5 py-2.5 text-left transition-colors hover:bg-rose-50"
                >
                  <Heart className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-rose-600 leading-relaxed">
                    Доступна <span className="font-semibold underline decoration-rose-300">программа бесплатного расширенного доступа</span> по заявке
                  </p>
                </button>
              )}

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

        {/* Social Support Program */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          custom={4}
          className="mx-auto mt-16 max-w-4xl"
        >
          <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-amber-50/50 to-orange-50/30 p-8 lg:p-10">
            {/* Decorative */}
            <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-rose-200/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-amber-200/20 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr,auto] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-100/80 px-4 py-1.5">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span className="text-sm font-semibold text-rose-700">Study Hub Support Program</span>
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900 lg:text-3xl">
                  Доступ к знаниям{' '}
                  <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
                    для каждого
                  </span>
                </h3>

                <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                  Мы считаем, что качественное образование должно быть доступным.
                  Подай заявку и расскажи, почему тебе это важно — мы рассмотрим
                  каждую заявку индивидуально и конфиденциально.
                </p>

                {/* Impact stats */}
                <div className="mt-6 flex flex-wrap gap-6">
                  {[
                    { value: '200+', label: 'учеников поддержано' },
                    { value: '20%', label: 'через социальную программу' },
                    { value: '0 ₸', label: 'полный доступ' },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
                      <p className="text-xs text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <span>Без справок и документов. Просто расскажи о себе.</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 lg:items-start">
                <button
                  onClick={() => onNavigate('/support')}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:shadow-xl hover:shadow-rose-500/30 hover:-translate-y-0.5"
                >
                  Хочу бесплатный доступ
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 9. FINAL CTA
// ---------------------------------------------------------------------------

function FinalCtaSection({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { ref, inView } = useSectionInView();

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
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute top-10 right-10 h-20 w-20 rounded-full border border-white/5"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-10 left-10 h-16 w-16 rounded-xl border border-white/5 rotate-45"
            />
          </div>

          <div className="relative">
            <motion.div
              variants={fadeUp}
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
                прямо сейчас
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={2}
              className="mx-auto mt-4 max-w-xl text-lg text-slate-300"
            >
              Бесплатная диагностика за 15 минут покажет твой уровень и создаст персональный план
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={3}
              className="mt-10"
            >
              <button
                onClick={() => onNavigate('/diagnostic')}
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-5 text-lg font-bold text-primary-700 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-0.5"
              >
                Начать бесплатно
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 10. FOOTER
// ---------------------------------------------------------------------------

function Footer() {
  const links = {
    Платформа: ['Возможности', 'Тарифы', 'AI-ментор', 'Диагностика'],
    Поддержка: ['Помощь', 'Контакты', 'FAQ', 'Блог'],
    Компания: ['О нас', 'Карьера', 'Партнёрам', 'Пресса'],
  };

  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-5">
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
              AI-платформа, которая ведёт учеников от школы до карьеры мечты.
              Подготовка к ЕНТ, выбор профессии, поступление в вуз.
            </p>

            {/* Social links */}
            <div className="mt-6 flex gap-3">
              {/* WhatsApp */}
              <a
                href="https://wa.me/77075884651"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-100 hover:-translate-y-0.5"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              {/* Telegram */}
              <a
                href="https://t.me/studyhub_kz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-all hover:bg-sky-100 hover:-translate-y-0.5"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>

            {/* Phone number */}
            <a
              href="tel:+77075884651"
              className="mt-4 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-primary-600"
            >
              <MessageCircle className="h-4 w-4" />
              +7 707 588 46 51
            </a>

            {/* App badges */}
            <div className="mt-6">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Скоро в приложении</p>
              <div className="flex gap-2.5">
                {/* App Store badge */}
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                  <svg className="h-6 w-6 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div>
                    <p className="text-[9px] text-slate-400 leading-none">Скоро в</p>
                    <p className="text-xs font-bold text-slate-700 leading-tight">App Store</p>
                  </div>
                </div>
                {/* Google Play badge */}
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                  <svg className="h-6 w-6 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <div>
                    <p className="text-[9px] text-slate-400 leading-none">Скоро в</p>
                    <p className="text-xs font-bold text-slate-700 leading-tight">Google Play</p>
                  </div>
                </div>
              </div>
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
            Made with ❤️ in Kazakhstan
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

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Header onNavigate={handleNavigate} />
      <main>
        <HeroSection onNavigate={handleNavigate} />
        <LiveStatsBar />
        <ProblemSolutionSection />
        <ProductShowcaseSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection onNavigate={handleNavigate} />
        <FinalCtaSection onNavigate={handleNavigate} />
      </main>
      <Footer />
    </div>
  );
}
