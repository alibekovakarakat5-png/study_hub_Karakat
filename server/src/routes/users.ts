import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'

const router = Router()

function safeUser(u: { passwordHash: string; [key: string]: unknown }) {
  const { passwordHash: _, ...rest } = u
  return rest
}

// ── PUT /api/users/me — update own profile ────────────────────────────────────

const UpdateProfileSchema = z.object({
  name:             z.string().min(2).max(80).optional(),
  grade:            z.number().int().min(9).max(11).optional(),
  city:             z.string().max(80).optional(),
  targetUniversity: z.string().max(200).optional(),
  targetSpecialty:  z.string().max(200).optional(),
  streak:           z.number().int().min(0).optional(),
  totalStudyMinutes:z.number().int().min(0).optional(),
  lastActiveDate:   z.string().optional(),
})

router.put('/me', verifyToken, async (req, res) => {
  const parsed = UpdateProfileSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data:  parsed.data,
  })

  res.json({ user: safeUser(user) })
})

// ── GET /api/users — list all users (admin only) ─────────────────────────────

router.get('/', verifyToken, requireRole('admin'), async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      grade: true, city: true, isPremium: true,
      streak: true, totalStudyMinutes: true,
      createdAt: true, lastActiveDate: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ users })
})

// ── GET /api/users/:id/children — parent's children ──────────────────────────

router.get('/:id/children', verifyToken, requireRole('parent', 'admin'), async (req, res) => {
  // Parents can only see their own children
  const parentId = String(req.params['id'])
  if (req.user!.role === 'parent' && parentId !== req.user!.userId) {
    res.status(403).json({ error: 'Недостаточно прав' })
    return
  }

  const children = await prisma.user.findMany({
    where: { parentId },
    select: {
      id: true, name: true, email: true, role: true,
      grade: true, city: true, streak: true, totalStudyMinutes: true,
    },
  })
  res.json({ children })
})

export default router
