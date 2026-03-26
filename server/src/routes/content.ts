import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'
import { sanitizeObject } from '../lib/sanitize'

const router = Router()

const VALID_TYPES = [
  // ── Original types ──
  'ielts_material',
  'mentor_qa',
  'vocab_word',
  'ent_question',
  'curator_topic',
  'university_entry',
  'scholarship_entry',
  'admission_entry',
  'program_entry',
  'university_profile',
  // ── New content types (DB-driven) ──
  'ielts_section',
  'ielts_band_descriptor',
  'ielts_cue_card',
  'diagnostic_question',
  'ent_exam_variant',
  'ent_profile_bank',
  'curator_content',
  'ent_theory_topic',
  'career_test_question',
  'cambridge_passage',
  'cambridge_question_bank',
] as const

const ContentSchema = z.object({
  type: z.enum(VALID_TYPES),
  data: z.record(z.unknown()),
  active: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
})

// ── Pagination helper ──────────────────────────────────────────────────────────

function parsePagination(query: Record<string, unknown>) {
  const page  = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50))
  return { skip: (page - 1) * limit, take: limit, page, limit }
}

// ── GET /api/content?type=...&page=1&limit=50 — public: list active content ──

router.get('/', async (req, res) => {
  const type = req.query.type as string | undefined
  const { skip, take, page, limit } = parsePagination(req.query as Record<string, unknown>)

  const where = { active: true, ...(type ? { type } : {}) }

  const [items, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      skip,
      take,
    }),
    prisma.content.count({ where }),
  ])

  res.json({ items, total, page, limit, pages: Math.ceil(total / limit) })
})

// ── GET /api/content/all?type=...&page=1&limit=50 — admin: all content ────────

router.get('/all', verifyToken, requireRole('admin'), async (req, res) => {
  const type = req.query.type as string | undefined
  const { skip, take, page, limit } = parsePagination(req.query as Record<string, unknown>)

  const where = type ? { type } : {}

  const [items, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: [{ type: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
      skip,
      take,
    }),
    prisma.content.count({ where }),
  ])

  res.json({ items, total, page, limit, pages: Math.ceil(total / limit) })
})

// ── POST /api/content — admin: create new content item ────────────────────────

router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  const parsed = ContentSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { data: rawData, ...rest } = parsed.data
  const sanitizedData = sanitizeObject(rawData as Record<string, unknown>)
  const item = await prisma.content.create({
    data: { ...rest, data: sanitizedData as Prisma.InputJsonValue },
  })
  res.status(201).json({ item })
})

// ── PUT /api/content/:id — admin: update content item ─────────────────────────

router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const id = req.params['id'] as string
  const parsed = ContentSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { data: rawData, ...rest } = parsed.data

  const existing = await prisma.content.findUnique({ where: { id } })
  if (!existing) { res.status(404).json({ error: 'Контент не найден' }); return }

  const sanitizedUpdate = rawData !== undefined
    ? { data: sanitizeObject(rawData as Record<string, unknown>) as Prisma.InputJsonValue }
    : {}

  const item = await prisma.content.update({
    where: { id },
    data: { ...rest, ...sanitizedUpdate },
  })
  res.json({ item })
})

// ── DELETE /api/content/:id — admin: delete content item ──────────────────────

router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const id = req.params['id'] as string
  try {
    await prisma.content.delete({ where: { id } })
    res.json({ ok: true })
  } catch {
    res.status(404).json({ error: 'Контент не найден' })
  }
})

export default router
