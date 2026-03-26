import { Router } from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { signToken, verifyToken } from '../middleware/auth'
import { tg } from '../lib/telegram'
import { sanitizeString } from '../lib/sanitize'
import { sendPasswordResetEmail } from '../lib/email'
import type { Role } from '@prisma/client'

const router = Router()

// ── Schemas ───────────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  name:     z.string().min(2).max(80),
  email:    z.string().email(),
  password: z.string().min(6).max(100),
  role:     z.enum(['student', 'parent', 'teacher', 'employer']).default('student'),
  grade:    z.number().int().min(9).max(11).optional(),
  city:     z.string().max(80).optional(),
})

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

// ── Strip passwordHash before returning user ──────────────────────────────────

function safeUser(u: { passwordHash: string; telegramChatId?: string | null; [key: string]: unknown }) {
  const { passwordHash: _, telegramChatId, ...rest } = u
  return { ...rest, telegramLinked: !!telegramChatId }
}

// ── POST /api/auth/register ───────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const data = parsed.data
  const name  = sanitizeString(data.name)
  const email = data.email
  const password = data.password
  const role  = data.role
  const grade = data.grade
  const city  = data.city ? sanitizeString(data.city) : data.city

  // Check if email already taken
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) {
    res.status(409).json({ error: 'Пользователь с таким email уже существует' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role as Role,
      grade:  grade ?? null,
      city:   city ?? null,
      lastActiveDate: new Date().toISOString(),
    },
  })

  // Generate referral code
  const referralCode = crypto.randomBytes(3).toString('hex').toUpperCase()
  await prisma.user.update({
    where: { id: user.id },
    data: { referralCode },
  })

  const token = signToken({ userId: user.id, role: user.role, email: user.email })

  // Notify developer
  tg.newUser(user.name, user.email, user.role, user.city)

  res.status(201).json({ user: safeUser({ ...user, referralCode }), token })
})

// ── POST /api/auth/login ──────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) {
    res.status(401).json({ error: 'Неверный email или пароль' })
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Неверный email или пароль' })
    return
  }

  // Update lastActiveDate
  await prisma.user.update({
    where: { id: user.id },
    data:  { lastActiveDate: new Date().toISOString() },
  })

  const token = signToken({ userId: user.id, role: user.role, email: user.email })

  res.json({ user: safeUser(user), token })
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

router.get('/me', verifyToken, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' })
    return
  }
  res.json({ user: safeUser(user) })
})

// ── POST /api/auth/forgot-password ──────────────────────────────────────────
const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

router.post('/forgot-password', async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректный email' })
    return
  }

  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    })

    await sendPasswordResetEmail(email, resetToken, user.name)
  }

  // Always return ok (don't reveal if email exists)
  res.json({ ok: true })
})

// ── POST /api/auth/reset-password ───────────────────────────────────────────
const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6).max(100),
})

router.post('/reset-password', async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректные данные' })
    return
  }

  const { token, password } = parsed.data

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExp: { gt: new Date() },
    },
  })

  if (!user) {
    res.status(400).json({ error: 'Ссылка недействительна или истекла' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExp: null,
    },
  })

  res.json({ ok: true })
})

export default router
