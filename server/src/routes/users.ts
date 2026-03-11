import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
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
  email:            z.string().email().optional(),
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

// ── POST /api/users/me/password — change password ────────────────────────────

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(6, 'Минимум 6 символов'),
})

router.post('/me/password', verifyToken, async (req, res) => {
  const parsed = ChangePasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' })
    return
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)
  if (!valid) {
    res.status(400).json({ error: 'Неверный текущий пароль' })
    return
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })

  res.json({ ok: true })
})

// ── GET /api/users/:id/public — public profile, no auth ──────────────────────

router.get('/:id/public', async (req, res) => {
  const userId = String(req.params['id'])

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, grade: true, city: true,
      targetUniversity: true, targetSpecialty: true,
      isPremium: true, streak: true, totalStudyMinutes: true,
      createdAt: true,
      diagnosticResults: { orderBy: { takenAt: 'desc' } },
    },
  })

  if (!user) {
    res.status(404).json({ error: 'Профиль не найден' })
    return
  }

  const { diagnosticResults, ...publicUser } = user

  // Group the most recent session (rows taken within 60 s of each other)
  let latestDiagnostic = null
  if (diagnosticResults.length > 0) {
    const latestTime = diagnosticResults[0].takenAt.getTime()
    const session = diagnosticResults.filter(
      r => Math.abs(r.takenAt.getTime() - latestTime) < 60_000,
    )

    const subjects = session.map(r => {
      const scores = r.scores as Record<string, unknown>
      return { subject: r.subject, ...scores }
    })

    const overallScore = session.reduce((s, r) => s + (((r.scores as Record<string, unknown>).score as number) ?? 0), 0)
    const maxScore     = session.reduce((s, r) => s + (((r.scores as Record<string, unknown>).maxScore as number) ?? 0), 0)

    latestDiagnostic = {
      id: session[0].id,
      userId,
      date: session[0].takenAt.toISOString(),
      subjects,
      overallScore,
      maxScore,
      percentile: maxScore > 0 ? Math.round((overallScore / maxScore) * 100) : 0,
      predictedUniversities: [],
    }
  }

  res.json({ user: publicUser, latestDiagnostic })
})

// ── GET /api/users — list all users (admin only) ─────────────────────────────

router.get('/', verifyToken, requireRole('admin'), async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      grade: true, city: true, isPremium: true,
      streak: true, totalStudyMinutes: true,
      targetUniversity: true, targetSpecialty: true,
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
