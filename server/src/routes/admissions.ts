// ── Admissions route ──────────────────────────────────────────────────────────
// GET  /api/admissions/deadlines?entryId=X   — public, upcoming deadlines
// POST /api/admissions/deadlines             — admin: create/update deadline
// PUT  /api/admissions/verify                — admin: mark all as verified (bulk)
// GET  /api/admissions/stale                 — admin: list entries not verified in 90+ days

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'

const router = Router()

const STALE_DAYS = 90

// ── GET /api/admissions/deadlines ─────────────────────────────────────────────

router.get('/deadlines', async (req, res) => {
  const entryId = req.query.entryId as string | undefined

  const deadlines = await prisma.admissionDeadline.findMany({
    where: {
      active: true,
      date: { gte: new Date() },
      ...(entryId ? { entryId } : {}),
    },
    orderBy: { date: 'asc' },
  })

  res.json({ deadlines })
})

// ── GET /api/admissions/stale — admin: entries not verified recently ───────────

router.get('/stale', verifyToken, requireRole('admin'), async (_req, res) => {
  const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000)

  const stale = await prisma.admissionDeadline.findMany({
    where: {
      active: true,
      date: { gte: new Date() },
      verifiedAt: { lt: cutoff },
    },
    orderBy: { verifiedAt: 'asc' },
  })

  res.json({ stale, cutoffDate: cutoff.toISOString() })
})

// ── POST /api/admissions/deadlines — admin: upsert a deadline ─────────────────

const DeadlineSchema = z.object({
  entryId:   z.string().min(1),
  label:     z.string().min(1),
  date:      z.string().datetime(),
  type:      z.enum(['application', 'documents', 'exam', 'results', 'scholarship']),
  sourceUrl: z.string().url(),
})

router.post('/deadlines', verifyToken, requireRole('admin'), async (req, res) => {
  const parsed = DeadlineSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  // Check if same entryId + label exists — update it
  const existing = await prisma.admissionDeadline.findFirst({
    where: { entryId: parsed.data.entryId, label: parsed.data.label },
  })

  const newDate = new Date(parsed.data.date)

  if (existing) {
    const dateChanged = existing.date.getTime() !== newDate.getTime()
    const deadline = await prisma.admissionDeadline.update({
      where: { id: existing.id },
      data: {
        date:        newDate,
        sourceUrl:   parsed.data.sourceUrl,
        verifiedAt:  new Date(),
        changedFrom: dateChanged ? existing.date : existing.changedFrom,
      },
    })
    res.json({ deadline, updated: true, dateChanged })
    return
  }

  const deadline = await prisma.admissionDeadline.create({
    data: {
      ...parsed.data,
      date:      newDate,
      verifiedAt: new Date(),
    },
  })

  res.status(201).json({ deadline, updated: false })
})

// ── PUT /api/admissions/verify/:id — admin: mark as verified now ──────────────

router.put('/verify/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const id = req.params['id'] as string
  try {
    const deadline = await prisma.admissionDeadline.update({
      where: { id },
      data: { verifiedAt: new Date() },
    })
    res.json({ deadline })
  } catch {
    res.status(404).json({ error: 'Дедлайн не найден' })
  }
})

// ── DELETE /api/admissions/deadlines/:id — admin ──────────────────────────────

router.delete('/deadlines/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const id = req.params['id'] as string
  try {
    await prisma.admissionDeadline.delete({ where: { id } })
    res.json({ ok: true })
  } catch {
    res.status(404).json({ error: 'Дедлайн не найден' })
  }
})

export default router
