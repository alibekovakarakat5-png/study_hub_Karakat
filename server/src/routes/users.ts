import { Router } from 'express'
import crypto from 'crypto'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'

const router = Router()

function safeUser(u: { passwordHash: string; telegramChatId?: string | null; [key: string]: unknown }) {
  const { passwordHash: _, telegramChatId, ...rest } = u
  return { ...rest, telegramLinked: !!telegramChatId }
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

// ── POST /api/users/me/telegram-link — generate one-time 6-digit code ────────

router.post('/me/telegram-link', verifyToken, async (req, res) => {
  const userId = req.user!.userId

  // Generate a 6-char alphanumeric code
  const token = crypto.randomBytes(3).toString('hex').toUpperCase()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  await prisma.telegramLinkToken.upsert({
    where:  { userId },
    create: { userId, token, expiresAt },
    update: { token, expiresAt },
  })

  const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME ?? 'StudyHubKZBot'
  res.json({
    code:   token,
    botUrl: `https://t.me/${BOT_USERNAME}?start=${token}`,
    expiresAt: expiresAt.toISOString(),
  })
})

// ── DELETE /api/users/me/telegram-link — unlink Telegram ─────────────────────

router.delete('/me/telegram-link', verifyToken, async (req, res) => {
  await prisma.user.update({
    where: { id: req.user!.userId },
    data:  { telegramChatId: null },
  })
  res.json({ ok: true })
})

// ── POST /api/users/me/parent-link — generate code for parent to link via Telegram
router.post('/me/parent-link', verifyToken, async (req, res) => {
  const userId = req.user!.userId

  // Generate 6-digit numeric code
  const code = String(Math.floor(100000 + Math.random() * 900000))

  await prisma.user.update({
    where: { id: userId },
    data: { parentLinkCode: code },
  })

  const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME ?? 'StudyHubKZBot'
  res.json({
    code,
    instruction: `Родитель должен отправить этот код боту @${BOT_USERNAME} в Telegram`,
    botUrl: `https://t.me/${BOT_USERNAME}`,
  })
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

// ── POST /api/users/link-child — parent links a student by their 6-digit code ──
//
// The student generates the code via POST /me/parent-link (shown in Settings).
// Parent enters it here → we set the student's parentId and clear the code.

router.post('/link-child', verifyToken, requireRole('parent', 'admin'), async (req, res) => {
  const parsed = z.object({ code: z.string().trim().min(4).max(10) }).safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Введите код' }); return }

  const parentId = String(req.user!.userId)
  const code = parsed.data.code

  const child = await prisma.user.findUnique({ where: { parentLinkCode: code } })
  if (!child) { res.status(404).json({ error: 'Код не найден или устарел' }); return }
  if (child.role !== 'student') { res.status(400).json({ error: 'Код принадлежит не ученику' }); return }
  if (child.parentId && child.parentId !== parentId) {
    res.status(409).json({ error: 'Этот ученик уже привязан к другому родителю' }); return
  }

  const updated = await prisma.user.update({
    where: { id: child.id },
    data:  { parentId, parentLinkCode: null },   // consume the one-time code
    select: { id: true, name: true, email: true, grade: true, city: true },
  })
  res.json({ ok: true, child: updated })
})

// ── GET /api/users/child/:id/overview — full child snapshot for the parent ─────

router.get('/child/:id/overview', verifyToken, requireRole('parent', 'admin'), async (req, res) => {
  const childId  = String(req.params['id'])
  const parentId = String(req.user!.userId)

  const child = await prisma.user.findUnique({
    where: { id: childId },
    select: {
      id: true, name: true, email: true, grade: true, city: true,
      streak: true, totalStudyMinutes: true, lastActiveDate: true,
      parentId: true, isPremium: true,
    },
  })
  if (!child) { res.status(404).json({ error: 'Ученик не найден' }); return }
  if (req.user!.role === 'parent' && child.parentId !== parentId) {
    res.status(403).json({ error: 'Нет доступа к этому ученику' }); return
  }

  // Latest diagnostic session (rows within 60s of the newest one)
  const diagnostics = await prisma.diagnosticResult.findMany({
    where:   { userId: childId },
    orderBy: { takenAt: 'desc' },
    take:    20,
  })
  let latestDiagnostic: { subjects: unknown[]; takenAt: Date } | null = null
  if (diagnostics.length > 0) {
    const newest = diagnostics[0]!.takenAt.getTime()
    const session = diagnostics.filter(d => Math.abs(d.takenAt.getTime() - newest) < 60_000)
    latestDiagnostic = {
      takenAt:  session[0]!.takenAt,
      subjects: session.map(d => ({ subject: d.subject, ...(d.scores as Record<string, unknown>) })),
    }
  }

  // ENT mock exam history
  const entResults = await prisma.entResult.findMany({
    where:   { userId: childId },
    orderBy: { takenAt: 'desc' },
    take:    5,
    select:  { id: true, totalScore: true, percentage: true, takenAt: true },
  })

  // Assignment activity (submissions across all classes the child is in)
  const submissions = await prisma.assignmentSubmission.findMany({
    where:   { studentId: childId },
    orderBy: { submittedAt: 'desc' },
    take:    20,
    select:  { score: true, submittedAt: true, assignment: { select: { title: true } } },
  })
  const scored = submissions.map(s => s.score).filter((s): s is number => s !== null)
  const avgAssignmentScore = scored.length
    ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)
    : null

  res.json({
    child,
    latestDiagnostic,
    entResults,
    activity: {
      submissionsCount:   submissions.length,
      avgAssignmentScore,
      recentSubmissions:  submissions.slice(0, 5).map(s => ({
        title: s.assignment.title, score: s.score, submittedAt: s.submittedAt,
      })),
    },
  })
})

// ── POST /api/users/:id/reset-password — admin reset ─────────────────────
router.post('/:id/reset-password', verifyToken, requireRole('admin'), async (req, res) => {
  const userId = req.params['id'] as string
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' })
    return
  }

  const tempPassword = crypto.randomBytes(6).toString('base64url')
  const passwordHash = await bcrypt.hash(tempPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, resetToken: null, resetTokenExp: null },
  })

  res.json({ temporaryPassword: tempPassword })
})

export default router
