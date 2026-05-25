// ── AI Chat — student-facing Skylla mentor in browser ───────────────────────
//
// Wraps growthAI.askSkylla() in an authenticated HTTP route with per-user
// rate limiting. Replaces the in-app pattern-matching mentor in Mentor.tsx
// and RobotWidget.tsx.
//
// Mounted at /api/ai/chat (shares /api/ai prefix with aiTest.ts).

import { Router } from 'express'
import { z } from 'zod'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import { verifyToken } from '../middleware/auth'
import { askSkylla } from '../lib/growthAI'
import { prisma } from '../lib/prisma'

const router = Router()

// ── Per-user rate limit ──────────────────────────────────────────────────────
// 30 requests / hour per authenticated user. Prevents one student from
// burning Groq quota for the whole platform. Groq free tier = 30 req/min
// platform-wide, so this is generous enough for normal use, tight enough
// for abuse.
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  // Key by userId so rate limits are per-student, not per-IP (a center
  // behind one NAT must not throttle all its students). Falls back to the
  // safe IP key helper (handles IPv4 / IPv6 normalization).
  keyGenerator: (req) => req.user?.userId ?? ipKeyGenerator(req.ip ?? ''),
  message: { error: 'Слишком много вопросов за час, попробуй позже 🙏' },
})

// ── Schema ────────────────────────────────────────────────────────────────────

const ChatSchema = z.object({
  message: z.string().min(1).max(2000),
})

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────

router.post('/chat', verifyToken, chatLimiter, async (req, res) => {
  if (!process.env.GROQ_API_KEY) {
    res.status(503).json({ error: 'AI временно недоступен (нет ключа Groq)' })
    return
  }

  const parsed = ChatSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Неверные данные' })
    return
  }

  const userId = String(req.user!.userId)
  const { message } = parsed.data

  // Look up user name for personalized greeting
  let userName = 'друг'
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    })
    if (user?.name) userName = user.name.split(' ')[0]!
  } catch {
    /* fall back to default */
  }

  try {
    const started = Date.now()
    const reply = await askSkylla(message, userName)
    const ms = Date.now() - started

    res.json({ reply, ms })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    console.error('[ai/chat] askSkylla failed:', msg)
    res.status(502).json({ error: 'AI не смог ответить — попробуй ещё раз 🙏' })
  }
})

export default router
