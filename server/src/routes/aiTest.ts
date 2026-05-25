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
import { generateTest, generateLesson } from '../lib/growthAI'
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

// ── POST /api/ai/generate-lesson ─────────────────────────────────────────────
// Teacher describes a topic → AI generates one full lesson (theory + quiz).
//
// CACHE: looked up in AILessonCache by (subject, difficulty, quizCount, topicKey)
// where topicKey is a normalized form of the topic. On hit we return the cached
// lesson and increment hitCount; on miss we call Groq, store, return. This way
// the same topic across teachers stops burning tokens.
//
// Pass `forceFresh: true` to skip cache (e.g. for regenerate button).

// Normalize topic for cache lookups: lowercase, strip punctuation/extra spaces,
// dedupe & sort meaningful words → stable hash-friendly key.
function normalizeTopic(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')   // drop punctuation
    .split(/\s+/)
    .filter(w => w.length > 1)             // drop single-letter/empty
    .sort()
    .join(' ')
    .slice(0, 240)                          // cap length for index
}

const GenerateLessonSchema = z.object({
  topic:      z.string().min(3).max(200),
  subject:    z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  quizCount:  z.number().int().min(3).max(10).default(5),
  forceFresh: z.boolean().optional().default(false),
})

router.post('/generate-lesson', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const parsed = GenerateLessonSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Неверные данные' }); return
  }

  const userId = String(req.user!.userId)
  const { topic, subject, difficulty, quizCount, forceFresh } = parsed.data
  const topicKey = normalizeTopic(topic)

  // ── 1. Try cache ─────────────────────────────────────────────────────────
  if (!forceFresh && topicKey.length > 0) {
    const hit = await prisma.aILessonCache.findUnique({
      where: { subject_difficulty_quizCount_topicKey: { subject, difficulty, quizCount, topicKey } },
    })
    if (hit) {
      await prisma.aILessonCache.update({
        where: { id: hit.id },
        data:  { hitCount: { increment: 1 }, lastHitAt: new Date() },
      })
      res.json({
        lesson:    hit.lesson,
        cached:    true,
        hitCount:  hit.hitCount + 1,
        firstSeen: hit.createdAt,
      })
      return
    }
  }

  // ── 2. Generate via Groq ─────────────────────────────────────────────────
  try {
    const { lesson } = await generateLesson({ topic, subject, difficulty, quizCount })

    // ── 3. Cache (best-effort — don't fail request if cache write breaks) ──
    if (topicKey.length > 0) {
      try {
        await prisma.aILessonCache.upsert({
          where:  { subject_difficulty_quizCount_topicKey: { subject, difficulty, quizCount, topicKey } },
          create: {
            subject, difficulty, quizCount, topicKey,
            topicOriginal: topic,
            lesson:        lesson as unknown as object,
            createdBy:     userId,
          },
          update: {
            // If two teachers raced — keep first, just bump hit
            hitCount:  { increment: 1 },
            lastHitAt: new Date(),
          },
        })
      } catch { /* swallow — cache is non-critical */ }
    }

    res.json({ lesson, cached: false })
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Ошибка генерации' })
  }
})

// ── GET /api/ai/lesson-cache/stats — admin-style overview ────────────────────

router.get('/lesson-cache/stats', verifyToken, requireRole('teacher', 'admin'), async (_req, res) => {
  const [total, topHits] = await Promise.all([
    prisma.aILessonCache.count(),
    prisma.aILessonCache.findMany({
      orderBy: { hitCount: 'desc' },
      take: 10,
      select: { topicOriginal: true, subject: true, difficulty: true, hitCount: true, createdAt: true },
    }),
  ])
  const totalHits = await prisma.aILessonCache.aggregate({ _sum: { hitCount: true } })
  const totalGenerations = total
  const totalReuses = (totalHits._sum.hitCount ?? 0) - total // first save counts as 1
  res.json({
    totalCached:        total,
    totalReuses:        Math.max(0, totalReuses),
    tokensSavedEst:     Math.max(0, totalReuses) * 4000, // rough: ~4k tokens per lesson
    topReused:          topHits,
  })
})

export default router
