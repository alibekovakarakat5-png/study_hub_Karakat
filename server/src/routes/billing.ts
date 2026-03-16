import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'
import { tg } from '../lib/telegram'

const router = Router()

// ── Schemas ───────────────────────────────────────────────────────────────────

const SubscriptionSchema = z.object({
  userId:    z.string(),
  planId:    z.string(),
  status:    z.enum(['active', 'expired', 'cancelled', 'trial']).default('active'),
  startsAt:  z.string().datetime().optional(),
  expiresAt: z.string().datetime(),
  notes:     z.string().max(500).optional(),
})

const PaymentSchema = z.object({
  userId:         z.string(),
  subscriptionId: z.string().optional(),
  amount:         z.number().int().min(0),
  method:         z.enum(['kaspi', 'transfer', 'cash', 'manual']),
  status:         z.enum(['pending', 'success', 'failed', 'refunded']).default('success'),
  reference:      z.string().max(200).optional(),
  notes:          z.string().max(500).optional(),
})

// ── GET /api/billing/subscriptions — admin: list all ──────────────────────

router.get('/subscriptions', verifyToken, requireRole('admin'), async (req, res) => {
  const { status, userId } = req.query as Record<string, string>

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (userId) where.userId = userId

  const subscriptions = await prisma.subscription.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      plan: { select: { id: true, name: true, period: true } },
      payments: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ subscriptions })
})

// ── GET /api/billing/my — current user's active subscription ──────────────

router.get('/my', verifyToken, async (req, res) => {
  const subscription = await prisma.subscription.findFirst({
    where:   { userId: req.user!.userId, status: 'active' },
    include: { plan: true },
    orderBy: { expiresAt: 'desc' },
  })
  res.json({ subscription })
})

// ── POST /api/billing/subscriptions — admin: create subscription ──────────

router.post('/subscriptions', verifyToken, requireRole('admin'), async (req, res) => {
  const parsed = SubscriptionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { userId, planId, status, expiresAt, notes } = parsed.data
  const startsAt = parsed.data.startsAt ? new Date(parsed.data.startsAt) : new Date()

  // Validate that user and plan exist
  const [user, plan] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    prisma.plan.findUnique({ where: { id: planId }, select: { id: true } }),
  ])
  if (!user) { res.status(404).json({ error: 'Пользователь не найден' }); return }
  if (!plan) { res.status(404).json({ error: 'Тарифный план не найден' }); return }

  // Activate isPremium on User
  await prisma.user.update({ where: { id: userId }, data: { isPremium: true } })

  const subscription = await prisma.subscription.create({
    data: { userId, planId, status, startsAt, expiresAt: new Date(expiresAt), notes },
    include: {
      user: { select: { name: true, email: true } },
      plan: { select: { name: true } },
    },
  })

  // Telegram notify
  tg.newSubscription(
    subscription.user.name,
    subscription.plan.name,
    new Date(expiresAt).toLocaleDateString('ru-KZ')
  )

  res.status(201).json({ subscription })
})

// ── PUT /api/billing/subscriptions/:id — admin: update status ────────────

router.put('/subscriptions/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const { status, notes, expiresAt } = req.body as {
    status?: string
    notes?: string
    expiresAt?: string
  }

  const subId = String(req.params.id)

  try {
    // Fetch current userId before update
    const existing = await prisma.subscription.findUniqueOrThrow({ where: { id: subId }, select: { userId: true } })

    const subscription = await prisma.subscription.update({
      where: { id: subId },
      data: {
        ...(status    ? { status } : {}),
        ...(notes     ? { notes }  : {}),
        ...(expiresAt ? { expiresAt: new Date(expiresAt) } : {}),
      },
    })

    // If cancelling, check if user has other active subs
    if (status === 'cancelled' || status === 'expired') {
      const active = await prisma.subscription.count({
        where: { userId: existing.userId, status: 'active' },
      })
      if (active === 0) {
        await prisma.user.update({
          where: { id: existing.userId },
          data:  { isPremium: false },
        })
      }
    }

    res.json({ subscription })
  } catch {
    res.status(404).json({ error: 'Подписка не найдена' })
  }
})

// ── GET /api/billing/payments — admin: list all payments ──────────────────

router.get('/payments', verifyToken, requireRole('admin'), async (req, res) => {
  const { status, userId } = req.query as Record<string, string>

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (userId) where.userId = userId

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        subscription: { include: { plan: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.payment.aggregate({
      where: { status: 'success' },
      _sum: { amount: true },
    }),
  ])

  res.json({ payments, totalRevenue: total._sum.amount ?? 0 })
})

// ── POST /api/billing/payments — admin: record manual payment ─────────────

router.post('/payments', verifyToken, requireRole('admin'), async (req, res) => {
  const parsed = PaymentSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  // Validate user exists
  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId }, select: { id: true } })
  if (!user) { res.status(404).json({ error: 'Пользователь не найден' }); return }

  if (parsed.data.subscriptionId) {
    const sub = await prisma.subscription.findUnique({ where: { id: parsed.data.subscriptionId }, select: { id: true } })
    if (!sub) { res.status(404).json({ error: 'Подписка не найдена' }); return }
  }

  const payment = await prisma.payment.create({
    data: parsed.data,
    include: {
      user: { select: { name: true, email: true } },
      subscription: { include: { plan: { select: { name: true } } } },
    },
  })

  if (parsed.data.status === 'success') {
    tg.newPayment(
      payment.user.name,
      parsed.data.amount,
      parsed.data.method,
      payment.subscription?.plan?.name
    )
  }

  res.status(201).json({ payment })
})

// ── GET /api/billing/stats — admin: revenue summary ──────────────────────

router.get('/stats', verifyToken, requireRole('admin'), async (_req, res) => {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalRevenue, monthRevenue, activeSubscriptions, totalSubscriptions] = await Promise.all([
    prisma.payment.aggregate({ where: { status: 'success' }, _sum: { amount: true } }),
    prisma.payment.aggregate({
      where: { status: 'success', createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.subscription.count({ where: { status: 'active' } }),
    prisma.subscription.count(),
  ])

  res.json({
    totalRevenue:       totalRevenue._sum.amount       ?? 0,
    monthRevenue:       monthRevenue._sum.amount        ?? 0,
    activeSubscriptions,
    totalSubscriptions,
  })
})

export default router
