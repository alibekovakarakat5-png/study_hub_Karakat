import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'

const router = Router()

const VALID_TYPES = [
  'ielts_material',
  'mentor_qa',
  'vocab_word',
  'ent_question',
  'curator_topic',
] as const

const ContentSchema = z.object({
  type: z.enum(VALID_TYPES),
  data: z.record(z.unknown()),
  active: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
})

// ── GET /api/content?type=... — public: list active content by type ────────────

router.get('/', async (req, res) => {
  const type = req.query.type as string | undefined

  const items = await prisma.content.findMany({
    where: {
      active: true,
      ...(type ? { type } : {}),
    },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })

  res.json({ items })
})

// ── GET /api/content/all — admin: list all content (including inactive) ────────

router.get('/all', verifyToken, requireRole('admin'), async (req, res) => {
  const type = req.query.type as string | undefined

  const items = await prisma.content.findMany({
    where: type ? { type } : {},
    orderBy: [{ type: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
  })

  res.json({ items })
})

// ── POST /api/content — admin: create new content item ────────────────────────

router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  const parsed = ContentSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { data: rawData, ...rest } = parsed.data
  const item = await prisma.content.create({
    data: { ...rest, data: rawData as Prisma.InputJsonValue },
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

  try {
    const item = await prisma.content.update({
      where: { id },
      data: { ...rest, ...(rawData !== undefined ? { data: rawData as Prisma.InputJsonValue } : {}) },
    })
    res.json({ item })
  } catch {
    res.status(404).json({ error: 'Контент не найден' })
  }
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
