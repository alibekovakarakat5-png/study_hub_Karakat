import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { signToken, verifyToken } from '../middleware/auth'
import type { Role } from '@prisma/client'

const router = Router()

// ── Schemas ───────────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  name:     z.string().min(2).max(80),
  email:    z.string().email(),
  password: z.string().min(6).max(100),
  role:     z.enum(['student', 'parent', 'teacher', 'employer', 'admin']).default('student'),
  grade:    z.number().int().min(9).max(11).optional(),
  city:     z.string().max(80).optional(),
})

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

// ── Strip passwordHash before returning user ──────────────────────────────────

function safeUser(u: { passwordHash: string; [key: string]: unknown }) {
  const { passwordHash: _, ...rest } = u
  return rest
}

// ── POST /api/auth/register ───────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { name, email, password, role, grade, city } = parsed.data

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

  const token = signToken({ userId: user.id, role: user.role, email: user.email })

  res.status(201).json({ user: safeUser(user), token })
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

export default router
