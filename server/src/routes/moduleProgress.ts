import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { verifyToken } from '../middleware/auth'

export function createModuleProgressRouter(db = prisma, auth = verifyToken) {
const router = Router()

// ── PUT /api/module-progress/:moduleId — upsert module progress ───────────────

const ProgressSchema = z.object({
  answers:   z.record(z.unknown()).optional(),
  testScore: z.number().int().min(0).max(100).optional(),
  completed: z.boolean().optional(),
})

router.put('/:moduleId', auth, async (req, res) => {
  const parsed = ProgressSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const userId   = req.user!.userId
  const moduleId = String(req.params['moduleId'])
  if (moduleId.startsWith('skylla-v1-') || moduleId.startsWith('owner-review-v1-')) {
    res.status(400).json({ error: 'Используйте учебный кабинет для этих записей.' })
    return
  }

  const data: Prisma.ModuleProgressUncheckedCreateInput = {
    userId,
    moduleId,
    ...(parsed.data.answers   !== undefined && { answers:   parsed.data.answers as Prisma.InputJsonValue }),
    ...(parsed.data.testScore !== undefined && { testScore: parsed.data.testScore }),
    ...(parsed.data.completed !== undefined && { completed: parsed.data.completed }),
  }

  const progress = await db.moduleProgress.upsert({
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

router.get('/', auth, async (req, res) => {
  const progresses = await db.moduleProgress.findMany({
    where:   { userId: req.user!.userId, NOT: [{ moduleId: { startsWith: 'skylla-v1-' } }, { moduleId: { startsWith: 'owner-review-v1-' } }] },
    orderBy: { updatedAt: 'desc' },
  })
  res.json({ progresses })
})

// ── GET /api/module-progress/:moduleId — single module ───────────────────────

router.get('/:moduleId', auth, async (req, res) => {
  if (String(req.params.moduleId).startsWith('owner-review-v1-')) { res.status(403).json({ error: 'Служебная запись.' }); return }
  const progress = await db.moduleProgress.findUnique({
    where: {
      userId_moduleId: {
        userId:   req.user!.userId,
        moduleId: String(req.params['moduleId']),
      },
    },
  })
  res.json({ progress: progress ?? null })
})

return router
}
export default createModuleProgressRouter()
