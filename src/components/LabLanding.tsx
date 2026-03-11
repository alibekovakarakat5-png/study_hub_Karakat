import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, CheckCircle, Star, Users, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { GraduationCap } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LabFeature {
  icon: string
  title: string
  description: string
}

export interface LabPain {
  icon: string
  text: string
}

export interface LabStep {
  number: string
  title: string
  description: string
}

export interface LabStat {
  value: string
  label: string
}

export interface LabConfig {
  /** URL source param e.g. "ent" → /auth?from=ent */
  source: string
  /** Badge label */
  badge: string
  /** Main hero headline — supports \n for line break */
  headline: string
  /** Sub headline */
  subline: string
  /** CTA button text */
  cta: string
  /** CTA destination (if already logged in or free page) */
  ctaTo?: string
  /** Gradient classes for the hero bg */
  heroBg: string
  /** Accent color classes for badges, highlights */
  accent: string
  /** Accent text color */
  accentText: string
  /** Accent border color */
  accentBorder: string
  /** Feature cards */
  features: LabFeature[]
  /** Pain points */
  pains: LabPain[]
  /** How it works steps */
  steps: LabStep[]
  /** Stats row */
  stats: LabStat[]
  /** Testimonials */
  testimonials: { name: string; city: string; text: string; score?: string }[]
  /** Hero emoji or icon */
  heroEmoji: string
  /** Section icon */
  SectionIcon: LucideIcon
}

// ── Animations ─────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.09 } }, hidden: {} }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Main template ──────────────────────────────────────────────────────────────

export default function LabLanding({ config }: { config: LabConfig }) {
  const { SectionIcon } = config

  // ── SEO: set page title + meta tags ────────────────────────────────────────
  useEffect(() => {
    const title = `${config.badge} — ${config.headline.replace('\n', ' ')} | StudyHub`
    document.title = title

    function setMeta(property: string, content: string) {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
        ?? document.querySelector<HTMLMetaElement>(`meta[name="${property}"]`)
      if (!el) {
        el = document.createElement('meta')
        const attr = property.startsWith('og:') || property.startsWith('twitter:') ? 'property' : 'name'
        el.setAttribute(attr, property)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    const description = config.subline
    setMeta('description', description)
    setMeta('og:title', title)
    setMeta('og:description', description)
    setMeta('og:type', 'website')
    setMeta('twitter:card', 'summary')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)

    return () => {
      document.title = 'StudyHub — AI платформа подготовки к ЕНТ и IELTS'
    }
  }, [config.badge, config.headline, config.subline])
  const authUrl = `/auth?from=${config.source}`

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-500/25">
              <GraduationCap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Study<span className="text-primary-600">Hub</span>
              <span className="ml-1.5 text-xs font-semibold text-slate-400">{config.badge}</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              to={authUrl}
              className="hidden sm:flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Войти
            </Link>
            <Link
              to={authUrl}
              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              {config.cta} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={`relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden ${config.heroBg}`}>
        {/* decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <Section>
            <motion.div variants={fadeUp} className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold mb-8 ${config.accent} ${config.accentBorder} ${config.accentText}`}>
              <SectionIcon className="w-4 h-4" />
              {config.badge}
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white mb-6 whitespace-pre-line">
              {config.headline}
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              {config.subline}
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={authUrl}
                className="flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-50 font-bold px-8 py-4 rounded-2xl text-base shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                {config.cta} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={authUrl}
                className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-8 py-4 rounded-2xl text-base border border-white/30 transition-all"
              >
                Посмотреть как это работает
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap justify-center gap-8 mt-14">
              {config.stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-extrabold text-white">{s.value}</div>
                  <div className="text-sm text-white/70 mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Звучит знакомо?</h2>
              <p className="text-slate-500 mt-3 text-base">Ты не один. Большинство начинают именно с этих проблем.</p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2">
              {config.pains.map((pain, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}
                  className="flex items-start gap-3 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <span className="text-2xl shrink-0">{pain.icon}</span>
                  <p className="text-slate-700 font-medium text-sm leading-relaxed">{pain.text}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Что ты получаешь на платформе
              </h2>
              <p className="text-slate-500 mt-3 text-base max-w-xl mx-auto">
                Всё что нужно — в одном месте. Никаких лишних сервисов.
              </p>
            </motion.div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {config.features.map((f, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}
                  className="group bg-slate-50 hover:bg-white border border-slate-200 hover:border-primary-200 hover:shadow-lg rounded-2xl p-6 transition-all">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="font-bold text-slate-800 mb-2 text-base">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Как это работает</h2>
            </motion.div>
            <div className="space-y-6">
              {config.steps.map((step, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}
                  className="flex gap-5 items-start bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-primary-600 text-white font-extrabold text-lg flex items-center justify-center">
                    {step.number}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-base">{step.title}</p>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">{step.description}</p>
                  </div>
                  {i < config.steps.length - 1 && (
                    <ChevronRight className="hidden sm:block ml-auto shrink-0 w-4 h-4 text-slate-300 self-center" />
                  )}
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Что говорят пользователи</h2>
            </motion.div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {config.testimonials.map((t, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                      <p className="text-slate-400 text-xs">{t.city}</p>
                    </div>
                    {t.score && (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {t.score}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className={`py-16 lg:py-20 ${config.heroBg}`}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Section>
            <motion.div variants={fadeUp} className="text-5xl mb-6">{config.heroEmoji}</motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Готов начать?
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/75 text-lg mb-8">
              Бесплатно. Без кредитной карты. Начни прямо сейчас.
            </motion.p>
            <motion.div variants={fadeUp} custom={3}>
              <Link
                to={authUrl}
                className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-50 font-bold px-10 py-4 rounded-2xl text-base shadow-lg transition-all hover:-translate-y-0.5"
              >
                {config.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} custom={4} className="flex items-center justify-center gap-6 mt-10">
              {[
                { icon: <CheckCircle className="w-4 h-4" />, text: 'Бесплатный старт' },
                { icon: <Users className="w-4 h-4" />, text: '10 000+ учеников' },
                { icon: <CheckCircle className="w-4 h-4" />, text: 'Без рекламы' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-white/80 text-sm">
                  {item.icon}{item.text}
                </div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary-600 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-semibold">StudyHub</span>
            <span>· {config.badge}</span>
          </div>
          <div className="flex gap-5">
            <Link to="/" className="hover:text-white transition-colors">Главная</Link>
            <Link to="/pricing" className="hover:text-white transition-colors">Тарифы</Link>
            <Link to="/support" className="hover:text-white transition-colors">Поддержка</Link>
          </div>
          <span>© {new Date().getFullYear()} StudyHub Kazakhstan</span>
        </div>
      </footer>
    </div>
  )
}
