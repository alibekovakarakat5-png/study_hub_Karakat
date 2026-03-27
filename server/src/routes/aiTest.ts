// ── AI Test Generation Route ──────────────────────────────────────────────────
//
// POST /api/ai/generate-test   → teacher generates 3 test variants (teacher/admin only)

import { Router } from 'express'
import { z } from 'zod'
import { verifyToken, requireRole } from '../middleware/auth'
import { generateTest } from '../lib/growthAI'

const router = Router()

const GenerateTestSchema = z.object({
  topic:         z.string().min(3).max(200),
  subject:       z.string().min(1),
  difficulty:    z.enum(['easy', 'medium', 'hard']),
  questionCount: z.number().int().min(5).max(20),
})

router.post('/generate-test', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const parsed = GenerateTestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Неверные данные' }); return
  }

  try {
    const result = await generateTest(parsed.data)
    res.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Ошибка генерации теста'
    // 422 = AI returned bad response (retryable by user), 503 = config issue
    const status = msg.includes('GROQ_API_KEY') ? 503 : 422
    res.status(status).json({ error: msg })
  }
})

export default router
