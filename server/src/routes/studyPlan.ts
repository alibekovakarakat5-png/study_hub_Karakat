import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { verifyToken } from '../middleware/auth'

const router = Router()

// ── POST /api/study-plans — create a new plan (deactivates old ones) ──────────

const CreatePlanSchema = z.object({
  goalType:     z.string().min(1),
  totalModules: z.number().int().min(1),
  weeks:        z.array(z.unknown()), // full weeks array as JSON
})

router.post('/', verifyToken, async (req, res) => {
  const parsed = CreatePlanSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const userId = req.user!.userId

  // Deactivate all previous plans
  await prisma.studyPlan.updateMany({
    where: { userId, isActive: true },
    data:  { isActive: false },
  })

  const plan = await prisma.studyPlan.create({
    data: {
      userId,
      goalType:     parsed.data.goalType,
      totalModules: parsed.data.totalModules,
      weeks:        parsed.data.weeks as Prisma.InputJsonArray,
      isActive:     true,
    },
  })

  res.status(201).json({ plan })
})

// ── GET /api/study-plans/active — get the active plan ────────────────────────

router.get('/active', verifyToken, async (req, res) => {
  const plan = await prisma.studyPlan.findFirst({
    where:   { userId: req.user!.userId, isActive: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ plan: plan ?? null })
})

// ── PUT /api/study-plans/:id/progress — update completedModules ───────────────

router.put('/:id/progress', verifyToken, async (req, res) => {
  const { completedModules } = z.object({ completedModules: z.number().int().min(0) }).parse(req.body)

  const planId = String(req.params['id'])
  const plan = await prisma.studyPlan.findUnique({ where: { id: planId } })
  if (!plan || plan.userId !== req.user!.userId) {
    res.status(404).json({ error: 'План не найден' })
    return
  }

  const updated = await prisma.studyPlan.update({
    where: { id: planId },
    data:  { completedModules },
  })

  res.json({ plan: updated })
})

// ── PUT /api/study-plans/:id/weeks — sync full weeks array (task completion) ──

router.put('/:id/weeks', verifyToken, async (req, res) => {
  const parsed = z.object({
    weeks:            z.array(z.unknown()),
    completedModules: z.number().int().min(0),
  }).safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const planId = String(req.params['id'])
  const plan = await prisma.studyPlan.findUnique({ where: { id: planId } })
  if (!plan || plan.userId !== req.user!.userId) {
    res.status(404).json({ error: 'План не найден' })
    return
  }

  const updated = await prisma.studyPlan.update({
    where: { id: planId },
    data: {
      weeks:            parsed.data.weeks as Prisma.InputJsonArray,
      completedModules: parsed.data.completedModules,
    },
  })

  res.json({ plan: updated })
})

export default router
