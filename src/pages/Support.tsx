import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import { openWhatsApp, buildSupportMessage } from '@/lib/whatsapp'
import {
  GraduationCap,
  Heart,
  Shield,
  ArrowLeft,
  Send,
  Check,
  Sparkles,
  Users,
  BookOpen,
  Globe,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
} satisfies import('framer-motion').Variants

function useSectionInView(amount = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount })
  return { ref, inView }
}

export default function Support() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { ref: heroRef, inView: heroInView } = useSectionInView(0.3)
  const { ref: formRef, inView: formInView } = useSectionInView(0.2)
  const { ref: valuesRef, inView: valuesInView } = useSectionInView(0.2)

  const [form, setForm] = useState({
    name: '',
    age: '',
    city: '',
    email: '',
    story: '',
    goals: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Partial<typeof form> = {}
    if (!form.name.trim()) newErrors.name = t('support.error_name')
    if (!form.story.trim()) newErrors.story = t('support.error_story')
    if (!form.goals.trim()) newErrors.goals = t('support.error_goals')
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    openWhatsApp(buildSupportMessage(form))
    setSubmitted(true)
  }

  const values = [
    {
      icon: Sparkles,
      title: t('support.value1_title'),
      description: t('support.value1_desc'),
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: Shield,
      title: t('support.value2_title'),
      description: t('support.value2_desc'),
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Users,
      title: t('support.value3_title'),
      description: t('support.value3_desc'),
      color: 'bg-primary-50 text-primary-600',
    },
    {
      icon: BookOpen,
      title: t('support.value4_title'),
      description: t('support.value4_desc'),
      color: 'bg-emerald-50 text-emerald-600',
    },
  ]

  const supportCategories = [
    { icon: '🎯', text: t('support.cat1') },
    { icon: '🏠', text: t('support.cat2') },
    { icon: '🌍', text: t('support.cat3') },
    { icon: '💙', text: t('support.cat4') },
    { icon: '👨‍👩‍👧‍👦', text: t('support.cat5') },
    { icon: '📚', text: t('support.cat6') },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-600 transition-colors hover:text-primary-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">{t('support.back_home')}</span>
            </button>
            <a href="/" className="flex items-center gap-2.5">
              <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-md shadow-primary-500/25">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary-950">
                Study<span className="text-gradient">Hub</span>
              </span>
            </a>
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-rose-100/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-amber-100/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={heroInView ? 'visible' : 'hidden'}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-100 px-5 py-2 text-sm font-semibold text-rose-600"
          >
            <Heart className="h-4 w-4" />
            Study Hub Support Program
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate={heroInView ? 'visible' : 'hidden'}
            custom={1}
            className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            {t('support.hero_title')}{' '}
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
              {t('support.hero_title_highlight')}
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={heroInView ? 'visible' : 'hidden'}
            custom={2}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500 sm:text-xl"
          >
            {t('support.hero_desc')}
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={heroInView ? 'visible' : 'hidden'}
            custom={3}
            className="mt-10 flex flex-wrap justify-center gap-6"
          >
            {[
              { value: '200+', label: t('support.stat1_label') },
              { value: '100%', label: t('support.stat2_label') },
              { value: '0 ₸', label: t('support.stat3_label') },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Who we support */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {t('support.who_title')}
            </h2>
            <p className="mt-3 text-base text-slate-500">
              {t('support.who_subtitle')}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {supportCategories.map((cat) => (
              <div
                key={cat.text}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <span className="text-2xl shrink-0">{cat.icon}</span>
                <span className="text-sm font-medium text-slate-700">{cat.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our values */}
      <section ref={valuesRef} className="py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {t('support.how_it_works_title')}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                initial="hidden"
                animate={valuesInView ? 'visible' : 'hidden'}
                custom={i}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
              >
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${v.color}`}>
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section ref={formRef} className="bg-gradient-to-b from-slate-50 to-white py-16 lg:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={formInView ? 'visible' : 'hidden'}
            className="text-center mb-10"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-100 px-4 py-1.5 text-sm font-semibold text-rose-600">
              <Globe className="h-4 w-4" />
              {t('support.form_badge')}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {t('support.form_title')}
            </h2>
            <p className="mt-3 text-base text-slate-500">
              {t('support.form_subtitle')}
            </p>
          </motion.div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-emerald-100 bg-emerald-50 p-10 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{t('support.submitted_title')}</h3>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                {t('support.submitted_desc')}
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-8 inline-flex items-center gap-2 rounded-2xl gradient-primary px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                {t('support.back_home')}
              </button>
            </motion.div>
          ) : (
            <motion.form
              variants={fadeUp}
              initial="hidden"
              animate={formInView ? 'visible' : 'hidden'}
              custom={1}
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 lg:p-10"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">{t('support.field_name')}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors(prev => ({ ...prev, name: '' })) }}
                    placeholder={t('support.placeholder_name')}
                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 ${errors.name ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-primary-400'}`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">{t('support.field_age')}</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={25}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder={t('support.placeholder_age')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">{t('support.field_city')}</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder={t('support.placeholder_city')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t('support.placeholder_email')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  {t('support.field_story')}
                </label>
                <textarea
                  rows={4}
                  value={form.story}
                  onChange={(e) => { setForm({ ...form, story: e.target.value }); setErrors(prev => ({ ...prev, story: '' })) }}
                  placeholder={t('support.placeholder_story')}
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none ${errors.story ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-primary-400'}`}
                />
                {errors.story && <p className="mt-1 text-xs text-red-500">{errors.story}</p>}
              </div>

              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  {t('support.field_goals')}
                </label>
                <textarea
                  rows={3}
                  value={form.goals}
                  onChange={(e) => { setForm({ ...form, goals: e.target.value }); setErrors(prev => ({ ...prev, goals: '' })) }}
                  placeholder={t('support.placeholder_goals')}
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none ${errors.goals ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-primary-400'}`}
                />
                {errors.goals && <p className="mt-1 text-xs text-red-500">{errors.goals}</p>}
              </div>

              <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-100 p-4">
                <Shield className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed text-slate-500">
                  {t('support.privacy_note')}
                </p>
              </div>

              <button
                type="submit"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:shadow-xl hover:shadow-rose-500/30 hover:-translate-y-0.5"
              >
                <Send className="h-5 w-5" />
                {t('support.submit')}
              </button>
            </motion.form>
          )}
        </div>
      </section>

      {/* Footer note */}
      <section className="border-t border-slate-100 bg-slate-50 py-10">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="text-sm leading-relaxed text-slate-500">
            {t('support.footer_note')}
          </p>
          <p className="mt-4 text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Study Hub. {t('landing.footer_copyright')}
          </p>
        </div>
      </section>
    </div>
  )
}
