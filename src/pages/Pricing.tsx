import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Check,
  Crown,
  Bot,
  BarChart3,
  Users,
  BookOpen,
  ClipboardCheck,
  Shield,
  Sparkles,
  Star,
  Zap,
  Loader2,
  X,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Smartphone,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import { openWhatsApp, buildPricingMessage } from '@/lib/whatsapp'
import { plansApi, billingApi } from '@/lib/api'
import type { DBPlan, KaspiPaymentResponse } from '@/lib/api'

// ── Fallback plans builder (shown when server is offline) ─────────────────────

function buildFallbackPlans(t: (key: string) => string): DBPlan[] {
  return [
    {
      id: 'free',
      name: t('pricing.plan_free_name'),
      description: t('pricing.plan_free_desc'),
      price: 0,
      period: 'forever',
      isActive: true,
      isPopular: false,
      badge: null,
      order: 0,
      createdAt: '',
      updatedAt: '',
      features: [
        { text: t('pricing.feat_diagnostic'), included: true },
        { text: t('pricing.feat_basic_plan'), included: true },
        { text: t('pricing.feat_1_ent'), included: true },
        { text: t('pricing.feat_portfolio'), included: true },
        { text: t('pricing.feat_ai_mentor_5'), included: true },
        { text: t('pricing.feat_parent_panel'), included: false },
        { text: t('pricing.feat_full_bank'), included: false },
        { text: t('pricing.feat_unlimited_ent'), included: false },
        { text: t('pricing.feat_analytics'), included: false },
        { text: t('pricing.feat_priority_support'), included: false },
      ],
    },
    {
      id: 'premium',
      name: t('pricing.plan_premium_name'),
      description: t('pricing.plan_premium_desc'),
      price: 4990,
      period: 'month',
      isActive: true,
      isPopular: true,
      badge: null,
      order: 1,
      createdAt: '',
      updatedAt: '',
      features: [
        { text: t('pricing.feat_diagnostic'), included: true },
        { text: t('pricing.feat_extended_plan'), included: true },
        { text: t('pricing.feat_unlimited_ent'), included: true },
        { text: t('pricing.feat_portfolio'), included: true },
        { text: t('pricing.feat_ai_mentor_unlimited'), included: true },
        { text: t('pricing.feat_parent_panel'), included: true },
        { text: t('pricing.feat_full_bank_5000'), included: true },
        { text: t('pricing.feat_analytics_detailed'), included: true },
        { text: t('pricing.feat_weekly_reports'), included: true },
        { text: t('pricing.feat_priority_support'), included: true },
      ],
    },
    {
      id: 'annual',
      name: t('pricing.plan_annual_name'),
      description: t('pricing.plan_annual_desc'),
      price: 39990,
      period: 'year',
      isActive: true,
      isPopular: false,
      badge: t('pricing.badge_value'),
      order: 2,
      createdAt: '',
      updatedAt: '',
      features: [
        { text: t('pricing.feat_all_premium'), included: true },
        { text: t('pricing.feat_annual_savings'), included: true },
        { text: t('pricing.feat_early_access'), included: true },
        { text: t('pricing.feat_personal_curator'), included: true },
        { text: t('pricing.feat_webinars'), included: true },
        { text: t('pricing.feat_guarantee'), included: true },
      ],
    },
  ]
}

function formatPrice(plan: DBPlan, t: (key: string) => string): { price: string; period: string } {
  if (plan.price === 0) return { price: '0 ₸', period: t('pricing.period_forever') }
  const p = plan.price.toLocaleString('ru-RU')
  const period = plan.period === 'month' ? t('pricing.period_month') : plan.period === 'year' ? t('pricing.period_year') : ''
  return { price: `${p} ₸`, period }
}

function getCta(plan: DBPlan, t: (key: string) => string): string {
  if (plan.price === 0) return t('pricing.cta_current_plan')
  if (plan.period === 'year') return t('pricing.cta_annual')
  return t('pricing.cta_connect')
}

// ── KaspiPay Modal ─────────────────────────────────────────────────────────────

type PaymentStep = 'idle' | 'loading' | 'pay' | 'checking' | 'success' | 'error'

function KaspiPayModal({ paymentData, onClose, onSuccess }: {
  paymentData: KaspiPaymentResponse
  onClose: () => void
  onSuccess: () => void
}) {
  const { t } = useTranslation()
  const [step, setStep] = useState<PaymentStep>('pay')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startPolling = useCallback(() => {
    setStep('checking')
    pollRef.current = setInterval(async () => {
      try {
        const { status } = await billingApi.kaspiStatus(paymentData.orderId)
        if (status === 'success') {
          if (pollRef.current) clearInterval(pollRef.current)
          setStep('success')
          setTimeout(onSuccess, 1500)
        } else if (status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current)
          setStep('error')
        }
      } catch {
        // keep polling
      }
    }, 3000)
  }, [paymentData.orderId, onSuccess])

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  const handleOpenKaspi = () => {
    window.open(paymentData.payLink, '_blank')
    startPolling()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>

        {step === 'pay' && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t('pricing.kaspi_title')}</h3>
            <p className="text-sm text-gray-500">
              {t('pricing.kaspi_plan_label')}: <b>{paymentData.planName}</b>
            </p>
            <div className="rounded-xl bg-gray-50 py-4 text-3xl font-bold text-gray-900">
              {paymentData.amount.toLocaleString('ru-RU')} ₸
            </div>

            {/* QR code placeholder — in production, render actual QR from paymentData.qrData */}
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center gap-2">
              <QrCode className="w-12 h-12 text-gray-300" />
              <p className="text-xs text-gray-400">{t('pricing.kaspi_qr_hint')}</p>
              <p className="text-xs text-gray-400">{t('pricing.kaspi_or_button')}</p>
            </div>

            <button
              onClick={handleOpenKaspi}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 font-semibold text-white transition-colors hover:bg-red-600"
            >
              <ExternalLink className="w-4 h-4" />
              {t('pricing.kaspi_open')}
            </button>
            <p className="text-xs text-gray-400">
              {t('pricing.kaspi_auto_update')}
            </p>
          </div>
        )}

        {step === 'checking' && (
          <div className="text-center space-y-4 py-4">
            <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
            <h3 className="text-lg font-bold text-gray-900">{t('pricing.kaspi_waiting')}</h3>
            <p className="text-sm text-gray-500">
              {t('pricing.kaspi_waiting_desc')}
            </p>
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              {t('common.cancel')}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t('pricing.kaspi_success_title')}</h3>
            <p className="text-sm text-gray-500">{t('pricing.kaspi_success_desc')}</p>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t('pricing.kaspi_error_title')}</h3>
            <p className="text-sm text-gray-500">{t('pricing.kaspi_error_desc')}</p>
            <button
              onClick={() => setStep('pay')}
              className="rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              {t('pricing.kaspi_retry')}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function Pricing() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const { user, updateUser } = useStore()
  const FALLBACK_PLANS = buildFallbackPlans(t)
  const [plans, setPlans] = useState<DBPlan[]>(FALLBACK_PLANS)
  const [loading, setLoading] = useState(true)
  const [paymentData, setPaymentData] = useState<KaspiPaymentResponse | null>(null)
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null)

  // Show success toast if redirected from Kaspi
  const [showSuccess, setShowSuccess] = useState(false)
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 4000)
    }
  }, [searchParams])

  useEffect(() => {
    plansApi.list()
      .then(({ plans: data }) => {
        if (data.length > 0) setPlans(data)
      })
      .catch(() => {/* keep fallback */})
      .finally(() => setLoading(false))
  }, [])

  const handleSubscribe = async (plan: DBPlan) => {
    if (plan.price === 0) return
    if (!user) {
      navigate('/auth')
      return
    }

    setPaymentLoading(plan.id)
    try {
      // Try KaspiPay first
      const data = await billingApi.kaspiCreate(plan.id)
      setPaymentData(data)
    } catch {
      // KaspiPay not configured — fallback to WhatsApp
      const { price, period } = formatPrice(plan, t)
      openWhatsApp(buildPricingMessage(`${plan.name} — ${price}${period}`))
    } finally {
      setPaymentLoading(null)
    }
  }

  const handlePaymentSuccess = useCallback(() => {
    setPaymentData(null)
    setShowSuccess(true)
    updateUser({ isPremium: true })
    setTimeout(() => setShowSuccess(false), 4000)
  }, [updateUser])

  const premiumPlan = plans.find(p => p.price > 0 && p.period === 'month') ?? plans[1]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-white shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">{t('pricing.premium_activated')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="gradient-hero text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </button>

          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Crown className="w-12 h-12 mx-auto mb-4 text-amber-400" />
              <h1 className="text-4xl md:text-5xl font-bold">{t('pricing.page_title')}</h1>
              <p className="text-xl text-white/70 mt-4 max-w-2xl mx-auto">
                {t('pricing.page_subtitle')}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => {
              const { price, period } = formatPrice(plan, t)
              const cta = getCta(plan, t)
              const isLoading = paymentLoading === plan.id
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'bg-white rounded-2xl shadow-sm overflow-hidden relative',
                    plan.isPopular && 'ring-2 ring-primary-500 shadow-lg shadow-primary-100 scale-105 z-10'
                  )}
                >
                  {plan.isPopular && (
                    <div className="gradient-primary text-white text-center py-2 text-sm font-medium flex items-center justify-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      {t('pricing.most_popular')}
                    </div>
                  )}
                  {plan.badge && !plan.isPopular && (
                    <div className="bg-accent-500 text-white text-center py-2 text-sm font-medium">
                      {plan.badge}
                    </div>
                  )}

                  <div className="p-8">
                    <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{plan.description}</p>

                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900">{price}</span>
                      <span className="text-slate-500">{period}</span>
                    </div>

                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={(plan.price === 0) || isLoading || (user?.isPremium ?? false)}
                      className={cn(
                        'w-full mt-6 py-3 rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-2',
                        plan.isPopular
                          ? 'gradient-primary text-white hover:shadow-lg hover:shadow-primary-200'
                          : plan.price === 0
                            ? 'bg-slate-100 text-slate-500 cursor-default'
                            : 'bg-slate-900 text-white hover:bg-slate-800',
                        (isLoading || (user?.isPremium && plan.price > 0)) && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {t('pricing.connecting')}</>
                      ) : user?.isPremium && plan.price > 0 ? (
                        <><Check className="w-4 h-4" /> {t('pricing.active')}</>
                      ) : (
                        cta
                      )}
                    </button>

                    <ul className="mt-8 space-y-3">
                      {(plan.features as { text: string; included: boolean }[]).map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          {feature.included ? (
                            <Check className="w-4 h-4 text-accent-500 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />
                          )}
                          <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Features Detail */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-12">
          {t('pricing.features_title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Bot, title: t('pricing.feature1_title'), desc: t('pricing.feature1_desc') },
            { icon: Users, title: t('pricing.feature2_title'), desc: t('pricing.feature2_desc') },
            { icon: BookOpen, title: t('pricing.feature3_title'), desc: t('pricing.feature3_desc') },
            { icon: BarChart3, title: t('pricing.feature4_title'), desc: t('pricing.feature4_desc') },
            { icon: ClipboardCheck, title: t('pricing.feature5_title'), desc: t('pricing.feature5_desc') },
            { icon: Shield, title: t('pricing.feature6_title'), desc: t('pricing.feature6_desc') },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-100 flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="font-semibold text-slate-800">{feature.title}</h3>
              <p className="text-sm text-slate-500 mt-2">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-12">
            {t('pricing.testimonials_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: t('pricing.testimonial1_name'), role: t('pricing.testimonial1_role'), text: t('pricing.testimonial1_text'), rating: 5 },
              { name: t('pricing.testimonial2_name'), role: t('pricing.testimonial2_role'), text: t('pricing.testimonial2_text'), rating: 5 },
              { name: t('pricing.testimonial3_name'), role: t('pricing.testimonial3_role'), text: t('pricing.testimonial3_text'), rating: 5 },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">"{testimonial.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-12">{t('pricing.faq_title')}</h2>
        <div className="space-y-4">
          {[
            { q: t('pricing.faq1_q'), a: t('pricing.faq1_a') },
            { q: t('pricing.faq2_q'), a: t('pricing.faq2_a') },
            { q: t('pricing.faq3_q'), a: t('pricing.faq3_a') },
            { q: t('pricing.faq4_q'), a: t('pricing.faq4_a') },
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800">{faq.q}</h3>
              <p className="text-sm text-slate-500 mt-2">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="gradient-hero text-white py-16">
        <div className="text-center max-w-2xl mx-auto px-4">
          <Zap className="w-12 h-12 mx-auto mb-4 text-amber-400" />
          <h2 className="text-3xl font-bold">{t('pricing.final_cta_title')}</h2>
          <p className="text-white/70 mt-3">
            {t('pricing.final_cta_subtitle')}
          </p>
          {premiumPlan && (
            <button
              onClick={() => handleSubscribe(premiumPlan)}
              disabled={user?.isPremium}
              className="mt-8 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:shadow-xl transition-all text-lg disabled:opacity-60"
            >
              {user?.isPremium
                ? t('pricing.premium_already_active')
                : `${getCta(premiumPlan, t)} — ${formatPrice(premiumPlan, t).price}${formatPrice(premiumPlan, t).period}`
              }
            </button>
          )}
          <p className="text-sm text-white/50 mt-3">{t('pricing.final_cta_note')}</p>
        </div>
      </div>

      {/* KaspiPay Modal */}
      <AnimatePresence>
        {paymentData && (
          <KaspiPayModal
            paymentData={paymentData}
            onClose={() => setPaymentData(null)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
