// ── AI Test Generation Route ──────────────────────────────────────────────────
//
// POST /api/ai/generate-test → teacher generates 3 test variants.
//
// Now org-aware: when the teacher belongs to a center and the topic matches
// content already uploaded by that center, we replace variant 1 with their
// own quiz questions instead of asking Groq to invent new ones. Variants 2
// and 3 stay AI-generated for diversity. Falls back to pure-AI when there's
// no matching content. The frontend keeps its existing 3-variant shape.

import { Router } from 'express'
import { z } from 'zod'
import { verifyToken, requireRole } from '../middleware/auth'
import { generateTest } from '../lib/growthAI'
import { weakTopicsToIds } from '../lib/topicMatcher'
import { pickQuestionsFromContent } from '../lib/contentQuestionPicker'
import { prisma } from '../lib/prisma'

const router = Router()

const GenerateTestSchema = z.object({
  topic:         z.string().min(3).max(200),
  subject:       z.string().min(1),
  difficulty:    z.enum(['easy', 'medium', 'hard']),
  questionCount: z.number().int().min(5).max(20),
})

interface AITestQuestion {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

router.post('/generate-test', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const parsed = GenerateTestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Неверные данные' }); return
  }

  const userId = String(req.user!.userId)
  const { topic, subject, questionCount } = parsed.data

  // ── Resolve caller's primary org ──────────────────────────────────────────
  let userOrgId: string | null = null
  const owned = await prisma.organization.findFirst({ where: { ownerId: userId }, select: { id: true } })
  if (owned) {
    userOrgId = owned.id
  } else {
    const m = await prisma.orgMembership.findFirst({
      where: { userId },
      orderBy: { joinedAt: 'asc' },
      select: { orgId: true },
    })
    userOrgId = m?.orgId ?? null
  }

  // ── Try to pull a variant's worth of questions from Content (org first) ──
  const weakTopicIds = weakTopicsToIds([topic], subject)
  const fromContent = await pickQuestionsFromContent({
    subject,
    weakTopicIds,
    orgId: userOrgId,
    count: questionCount,
  })

  // ── Build the AI variants (always — for diversity) ───────────────────────
  let aiResult: Awaited<ReturnType<typeof generateTest>>
  try {
    aiResult = await generateTest(parsed.data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Ошибка генерации теста'
    const status = msg.includes('GROQ_API_KEY') ? 503 : 422
    res.status(status).json({ error: msg })
    return
  }

  // ── If we have a full variant of org content, replace variant 1 ──────────
  let fromOrg = 0
  let fromGlobal = 0
  let fromAI = 0
  const variants = aiResult.variants

  if (fromContent.length >= questionCount && variants.length > 0) {
    const orgQuestions: AITestQuestion[] = fromContent.slice(0, questionCount).map((q, i) => ({
      id: `org_q${i + 1}`,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation ?? '',
    }))
    variants[0] = {
      ...variants[0]!,
      variantIndex: 1,
      questions: orgQuestions,
      source: 'center-content',
    } as typeof variants[0]
    fromOrg    = fromContent.filter((q) => q.source === 'org').length
    fromGlobal = fromContent.filter((q) => q.source === 'global').length
    fromAI = (variants.length - 1) * questionCount
  } else {
    // All 3 variants stay AI-generated
    fromAI = variants.length * questionCount
  }

  res.json({
    variants,
    meta: {
      fromOrg,
      fromGlobal,
      fromAI,
      orgContentMatched: fromContent.length,
      weakTopicIds,
    },
  })
})

export default router
