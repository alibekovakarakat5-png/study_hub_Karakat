import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { verifyToken } from '../middleware/auth'

const router = Router()

// ── GET /api/referral/my — get my referral info ─────────────────────────────
router.get('/my', verifyToken, async (req, res) => {
  const userId = req.user!.userId

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  })

  const referralCount = await prisma.user.count({
    where: { referredBy: userId },
  })

  res.json({
    referralCode: user?.referralCode ?? null,
    referralCount,
    referralLink: user?.referralCode
      ? `${process.env.FRONTEND_URL ?? 'https://studyhub.kz'}/auth?ref=${user.referralCode}`
      : null,
  })
})

// ── POST /api/referral/apply — apply a referral code ────────────────────────
const applySchema = z.object({
  code: z.string().min(1).max(20),
})

router.post('/apply', verifyToken, async (req, res) => {
  const parsed = applySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректный код' })
    return
  }

  const userId = req.user!.userId
  const { code } = parsed.data

  // Find referrer
  const referrer = await prisma.user.findUnique({
    where: { referralCode: code.toUpperCase() },
  })

  if (!referrer) {
    res.status(404).json({ error: 'Промокод не найден' })
    return
  }

  // Can't refer yourself
  if (referrer.id === userId) {
    res.status(400).json({ error: 'Нельзя использовать свой собственный код' })
    return
  }

  // Check if already referred
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { referredBy: true },
  })

  if (currentUser?.referredBy) {
    res.status(400).json({ error: 'Вы уже использовали промокод' })
    return
  }

  // Apply referral
  await prisma.user.update({
    where: { id: userId },
    data: { referredBy: referrer.id },
  })

  // Give referrer 1 month Premium
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 days

  // Check if referrer already has an active subscription
  const existingSub = await prisma.subscription.findFirst({
    where: {
      userId: referrer.id,
      status: 'active',
      expiresAt: { gt: now },
    },
  })

  if (existingSub) {
    // Extend existing subscription by 30 days
    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        expiresAt: new Date(existingSub.expiresAt.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    })
  } else {
    // Find the first active plan for subscription
    const plan = await prisma.plan.findFirst({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    if (plan) {
      await prisma.subscription.create({
        data: {
          userId: referrer.id,
          planId: plan.id,
          status: 'active',
          startsAt: now,
          expiresAt,
          notes: 'Реферальный бонус — 1 месяц бесплатно',
        },
      })
    }
  }

  // Set referrer as premium
  await prisma.user.update({
    where: { id: referrer.id },
    data: { isPremium: true },
  })

  res.json({ ok: true, message: 'Промокод применён! Ваш друг получил 1 месяц Premium.' })
})

export default router
