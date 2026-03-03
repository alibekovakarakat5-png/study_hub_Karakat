import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { verifyToken } from '../middleware/auth'

const router = Router()

// ── POST /api/ent-results — save an ENT exam result ──────────────────────────

const EntResultSchema = z.object({
  totalScore:   z.number().int().min(0),
  percentage:   z.number().min(0).max(100),
  blockResults: z.array(z.unknown()),  // per-block breakdown
})

router.post('/', verifyToken, async (req, res) => {
  const parsed = EntResultSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const result = await prisma.entResult.create({
    data: {
      userId:      req.user!.userId,
      totalScore:  parsed.data.totalScore,
      percentage:  parsed.data.percentage,
      blockResults:parsed.data.blockResults as Prisma.InputJsonArray,
    },
  })

  res.status(201).json({ result })
})

// ── GET /api/ent-results — last 20 results for current user ──────────────────

router.get('/', verifyToken, async (req, res) => {
  const results = await prisma.entResult.findMany({
    where:   { userId: req.user!.userId },
    orderBy: { takenAt: 'desc' },
    take:    20,
  })
  res.json({ results })
})

export default router
