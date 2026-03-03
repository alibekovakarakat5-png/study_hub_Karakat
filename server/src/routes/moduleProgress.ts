import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { verifyToken } from '../middleware/auth'

const router = Router()

// ── PUT /api/module-progress/:moduleId — upsert module progress ───────────────

const ProgressSchema = z.object({
  answers:   z.record(z.unknown()).optional(),
  testScore: z.number().int().min(0).max(100).optional(),
  completed: z.boolean().optional(),
})

router.put('/:moduleId', verifyToken, async (req, res) => {
  const parsed = ProgressSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const userId   = req.user!.userId
  const moduleId = String(req.params['moduleId'])

  const data: Prisma.ModuleProgressUncheckedCreateInput = {
    userId,
    moduleId,
    ...(parsed.data.answers   !== undefined && { answers:   parsed.data.answers as Prisma.InputJsonValue }),
    ...(parsed.data.testScore !== undefined && { testScore: parsed.data.testScore }),
    ...(parsed.data.completed !== undefined && { completed: parsed.data.completed }),
  }

  const progress = await prisma.moduleProgress.upsert({
    where:  { userId_moduleId: { userId, moduleId } },
    create: data,
    update: {
      ...(parsed.data.answers   !== undefined && { answers:   parsed.data.answers as Prisma.InputJsonValue }),
      ...(parsed.data.testScore !== undefined && { testScore: parsed.data.testScore }),
      ...(parsed.data.completed !== undefined && { completed: parsed.data.completed }),
    },
  })

  res.json({ progress })
})

// ── GET /api/module-progress — all modules for current user ───────────────────

router.get('/', verifyToken, async (req, res) => {
  const progresses = await prisma.moduleProgress.findMany({
    where:   { userId: req.user!.userId },
    orderBy: { updatedAt: 'desc' },
  })
  res.json({ progresses })
})

// ── GET /api/module-progress/:moduleId — single module ───────────────────────

router.get('/:moduleId', verifyToken, async (req, res) => {
  const progress = await prisma.moduleProgress.findUnique({
    where: {
      userId_moduleId: {
        userId:   req.user!.userId,
        moduleId: String(req.params['moduleId']),
      },
    },
  })
  res.json({ progress: progress ?? null })
})

export default router
