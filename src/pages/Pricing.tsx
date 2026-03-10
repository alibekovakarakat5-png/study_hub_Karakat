import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import { openWhatsApp, buildPricingMessage } from '@/lib/whatsapp'
import { plansApi } from '@/lib/api'
import type { DBPlan } from '@/lib/api'

// ── Fallback plans (shown when server is offline) ─────────────────────────────

const FALLBACK_PLANS: DBPlan[] = [
  {
    id: 'free',
    name: 'Бесплатный',
    description: 'Начни свой путь к поступлению',
    price: 0,
    period: 'forever',
    isActive: true,
    isPopular: false,
    badge: null,
    order: 0,
    createdAt: '',
    updatedAt: '',
    features: [
      { text: 'Диагностический тест', included: true },
      { text: 'Базовый учебный план', included: true },
      { text: '1 пробный ЕНТ в месяц', included: true },
      { text: 'Портфолио достижений', included: true },
      { text: 'AI Ментор (5 сообщений/день)', included: true },
      { text: 'Родительская панель', included: false },
      { text: 'Полный банк заданий', included: false },
      { text: 'Безлимитные пробные ЕНТ', included: false },
      { text: 'Детальная аналитика', included: false },
      { text: 'Приоритетная поддержка', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Премиум',
    description: 'Максимальные шансы на поступление',
    price: 4990,
    period: 'month',
    isActive: true,
    isPopular: true,
    badge: null,
    order: 1,
    createdAt: '',
    updatedAt: '',
    features: [
      { text: 'Диагностический тест', included: true },
      { text: 'Расширенный учебный план', included: true },
      { text: 'Безлимитные пробные ЕНТ', included: true },
      { text: 'Портфолио достижений', included: true },
      { text: 'AI Ментор (безлимит)', included: true },
      { text: 'Родительская панель', included: true },
      { text: 'Полный банк заданий (5000+)', included: true },
      { text: 'Детальная аналитика прогресса', included: true },
      { text: 'Еженедельные отчёты', included: true },
      { text: 'Приоритетная поддержка', included: true },
    ],
  },
  {
    id: 'annual',
    name: 'Премиум Годовой',
    description: 'Экономия 33% — лучшая инвестиция',
    price: 39990,
    period: 'year',
    isActive: true,
    isPopular: false,
    badge: 'Выгодно',
    order: 2,
    createdAt: '',
    updatedAt: '',
    features: [
      { text: 'Всё из Премиум', included: true },
      { text: 'Экономия 19 890 ₸ в год', included: true },
      { text: 'Ранний доступ к фичам', included: true },
      { text: 'Персональный куратор', included: true },
      { text: 'Доступ к вебинарам', included: true },
      { text: 'Гарантия результата', included: true },
    ],
  },
]

function formatPrice(plan: DBPlan): { price: string; period: string } {
  if (plan.price === 0) return { price: '0 ₸', period: 'навсегда' }
  const p = plan.price.toLocaleString('ru-RU')
  const period = plan.period === 'month' ? '/месяц' : plan.period === 'year' ? '/год' : ''
  return { price: `${p} ₸`, period }
}

function getCta(plan: DBPlan): string {
  if (plan.price === 0) return 'Текущий план'
  if (plan.period === 'year') return 'Выбрать годовой'
  return `Подключить ${plan.name}`
}

const testimonials = [
  {
    name: 'Айдана М.',
    role: 'Поступила в НУ, 2025',
    text: 'Благодаря Study Hub я точно знала свои слабые места и целенаправленно готовилась. Набрала 128 баллов на ЕНТ!',
    rating: 5,
  },
  {
    name: 'Арман К.',
    role: 'Родитель',
    text: 'Наконец-то вижу, чем занимается мой сын. Родительская панель — это именно то, что нужно каждому родителю.',
    rating: 5,
  },
  {
    name: 'Диана С.',
    role: '11 класс, Астана',
    text: 'AI-ментор объясняет лучше моего репетитора! И план подготовки помог мне организовать своё время.',
    rating: 5,
  },
]

export default function Pricing() {
  const navigate = useNavigate()
  const { user } = useStore()
  const [plans, setPlans] = useState<DBPlan[]>(FALLBACK_PLANS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    plansApi.list()
      .then(({ plans: data }) => {
        if (data.length > 0) setPlans(data)
      })
      .catch(() => {/* keep fallback */})
      .finally(() => setLoading(false))
  }, [])

  const handleSubscribe = (plan: DBPlan) => {
    if (plan.price === 0) return
    const { price, period } = formatPrice(plan)
    openWhatsApp(buildPricingMessage(`${plan.name} — ${price}${period}`))
  }

  const premiumPlan = plans.find(p => p.price > 0 && p.period === 'month') ?? plans[1]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="gradient-hero text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>

          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Crown className="w-12 h-12 mx-auto mb-4 text-amber-400" />
              <h1 className="text-4xl md:text-5xl font-bold">Инвестируй в своё будущее</h1>
              <p className="text-xl text-white/70 mt-4 max-w-2xl mx-auto">
                Выбери план, который приведёт тебя к мечте. Отмена в любой момент.
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
              const { price, period } = formatPrice(plan)
              const cta = getCta(plan)
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
                      Самый популярный
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
                      disabled={plan.price === 0 && (!user || !user.isPremium)}
                      className={cn(
                        'w-full mt-6 py-3 rounded-xl font-medium transition-all text-sm',
                        plan.isPopular
                          ? 'gradient-primary text-white hover:shadow-lg hover:shadow-primary-200'
                          : plan.price === 0
                            ? 'bg-slate-100 text-slate-500 cursor-default'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                      )}
                    >
                      {cta}
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
          Что даёт Премиум?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Bot, title: 'AI Ментор без лимитов', desc: 'Персональный репетитор 24/7, который знает твои слабые места и помогает именно с тем, что нужно.' },
            { icon: Users, title: 'Родительская панель', desc: 'Родители видят прогресс в реальном времени. Никаких сюрпризов перед ЕНТ.' },
            { icon: BookOpen, title: '5000+ заданий', desc: 'Полный банк заданий по всем предметам ЕНТ с подробными разборами.' },
            { icon: BarChart3, title: 'Детальная аналитика', desc: 'Точно видишь, какие темы тянут вниз и сколько времени нужно на каждую.' },
            { icon: ClipboardCheck, title: 'Безлимитные тесты', desc: 'Пробные ЕНТ каждую неделю с анализом ошибок и рекомендациями.' },
            { icon: Shield, title: 'Гарантия результата', desc: 'Если ты следуешь плану и не видишь роста за 30 дней — вернём деньги.' },
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
            Что говорят наши ученики
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-12">Частые вопросы</h2>
        <div className="space-y-4">
          {[
            { q: 'Могу ли я отменить подписку?', a: 'Да, в любой момент. Без скрытых условий.' },
            { q: 'Как работает гарантия возврата?', a: 'Если вы следуете плану 30 дней и не видите улучшений в результатах тестов — мы вернём полную стоимость.' },
            { q: 'Подходит ли платформа для 9-10 классов?', a: 'Да! Раннее начало подготовки — лучшая стратегия. Мы адаптируем план под ваш класс.' },
            { q: 'Как оплатить?', a: 'Принимаем Kaspi, банковские карты, Halyk Bank. Оплата безопасна и мгновенна.' },
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
          <h2 className="text-3xl font-bold">Начни прямо сейчас</h2>
          <p className="text-white/70 mt-3">
            Каждый день без подготовки — это упущенная возможность. Не жди — действуй.
          </p>
          {premiumPlan && (
            <button
              onClick={() => handleSubscribe(premiumPlan)}
              className="mt-8 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:shadow-xl transition-all text-lg"
            >
              {getCta(premiumPlan)} — {formatPrice(premiumPlan).price}{formatPrice(premiumPlan).period}
            </button>
          )}
          <p className="text-sm text-white/50 mt-3">Отмена в любой момент · 30 дней гарантии</p>
        </div>
      </div>
    </div>
  )
}
