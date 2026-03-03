import { Router } from 'express'
import { z } from 'zod'
import type { DiagnosticResult } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { verifyToken } from '../middleware/auth'

const router = Router()

// ── POST /api/diagnostic/results — save/update a subject result ───────────────

const SubjectResultSchema = z.object({
  subject: z.string().min(1),
  scores:  z.object({
    score:        z.number(),
    maxScore:     z.number(),
    percentage:   z.number(),
    level:        z.string(),
    weakTopics:   z.array(z.string()),
    strongTopics: z.array(z.string()),
  }),
})

router.post('/results', verifyToken, async (req, res) => {
  const parsed = SubjectResultSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { subject, scores } = parsed.data
  const userId = req.user!.userId

  // Always create a new entry (history)
  const result = await prisma.diagnosticResult.create({
    data: { userId, subject, scores },
  })

  res.status(201).json({ result })
})

// ── POST /api/diagnostic/results/batch — save full diagnostic (all subjects) ──

const BatchSchema = z.object({
  subjects: z.array(SubjectResultSchema),
})

router.post('/results/batch', verifyToken, async (req, res) => {
  const parsed = BatchSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const userId = req.user!.userId
  const results = await prisma.$transaction(
    parsed.data.subjects.map(({ subject, scores }) =>
      prisma.diagnosticResult.create({ data: { userId, subject, scores } })
    )
  )

  res.status(201).json({ results })
})

// ── GET /api/diagnostic/results — all results for current user ────────────────

router.get('/results', verifyToken, async (req, res) => {
  const results = await prisma.diagnosticResult.findMany({
    where:   { userId: req.user!.userId },
    orderBy: { takenAt: 'desc' },
  })
  res.json({ results })
})

// ── GET /api/diagnostic/results/latest — latest result per subject ────────────

router.get('/results/latest', verifyToken, async (req, res) => {
  // Get the most recent diagnostic result per subject
  const all = await prisma.diagnosticResult.findMany({
    where:   { userId: req.user!.userId },
    orderBy: { takenAt: 'desc' },
  })

  // Deduplicate: first occurrence per subject is the latest
  const seen = new Set<string>()
  const latest = all.filter((r: DiagnosticResult) => {
    if (seen.has(r.subject)) return false
    seen.add(r.subject)
    return true
  })

  res.json({ results: latest })
})

export default router
