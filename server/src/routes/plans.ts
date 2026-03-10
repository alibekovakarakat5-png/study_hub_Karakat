import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'

const router = Router()

const PlanSchema = z.object({
  name:        z.string().min(1).max(100),
  description: z.string().max(300).default(''),
  price:       z.number().int().min(0),
  period:      z.enum(['month', 'year', 'forever']),
  features:    z.array(z.object({ text: z.string(), included: z.boolean() })).default([]),
  isActive:    z.boolean().default(true),
  isPopular:   z.boolean().default(false),
  badge:       z.string().max(50).optional(),
  order:       z.number().int().default(0),
})

// ── GET /api/plans — public: active plans sorted by order ──────────────────

router.get('/', async (_req, res) => {
  const plans = await prisma.plan.findMany({
    where:   { isActive: true },
    orderBy: { order: 'asc' },
  })
  res.json({ plans })
})

// ── GET /api/plans/all — admin: all plans ──────────────────────────────────

router.get('/all', verifyToken, requireRole('admin'), async (_req, res) => {
  const plans = await prisma.plan.findMany({ orderBy: { order: 'asc' } })
  res.json({ plans })
})

// ── POST /api/plans — admin: create plan ──────────────────────────────────

router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  const parsed = PlanSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }
  const plan = await prisma.plan.create({ data: parsed.data })
  res.status(201).json({ plan })
})

// ── PUT /api/plans/:id — admin: update plan ───────────────────────────────

router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const parsed = PlanSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }
  try {
    const plan = await prisma.plan.update({
      where: { id: String(req.params.id) },
      data:  parsed.data,
    })
    res.json({ plan })
  } catch {
    res.status(404).json({ error: 'Тариф не найден' })
  }
})

// ── DELETE /api/plans/:id — admin: deactivate plan ────────────────────────

router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await prisma.plan.update({
      where: { id: String(req.params.id) },
      data:  { isActive: false },
    })
    res.json({ ok: true })
  } catch {
    res.status(404).json({ error: 'Тариф не найден' })
  }
})

export default router
