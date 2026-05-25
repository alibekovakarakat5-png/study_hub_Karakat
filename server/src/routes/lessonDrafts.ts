// ── Teacher Lesson Drafts — personal AI lesson library ──────────────────────
//
// GET    /api/ai/drafts          → list teacher's drafts (newest first)
// POST   /api/ai/drafts          → save current lesson as draft
// GET    /api/ai/drafts/:id      → fetch full lesson body
// PATCH  /api/ai/drafts/:id      → edit (title, theory, quiz, etc.)
// DELETE /api/ai/drafts/:id      → permanently remove

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'

const router = Router()

const LessonShape = z.object({
  title:       z.string(),
  theory:      z.string(),
  keyFormulas: z.array(z.object({ formula: z.string(), name: z.string() })).optional(),
  quiz:        z.array(z.object({
    id:            z.string(),
    text:          z.string(),
    options:       z.array(z.string()),
    correctAnswer: z.number().int(),
    explanation:   z.string().optional(),
  })),
})

const CreateSchema = z.object({
  title:      z.string().min(1).max(200),
  topic:      z.string().min(1).max(1000),    // allow detailed multi-section topics
  subject:    z.string().min(1).max(50),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  lesson:     LessonShape,
})

const UpdateSchema = z.object({
  title:  z.string().min(1).max(200).optional(),
  lesson: LessonShape.optional(),
  publishedAssignmentId: z.string().nullable().optional(),
})

// ── GET /api/ai/drafts ───────────────────────────────────────────────────────

router.get('/', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const teacherId = String(req.user!.userId)
  const drafts = await prisma.teacherLessonDraft.findMany({
    where:  { teacherId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, topic: true, subject: true, difficulty: true,
      publishedAssignmentId: true, createdAt: true, updatedAt: true,
    },
  })
  res.json({ drafts })
})

// ── POST /api/ai/drafts ──────────────────────────────────────────────────────

router.post('/', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Неверные данные' }); return
  }
  const teacherId = String(req.user!.userId)
  const draft = await prisma.teacherLessonDraft.create({
    data: {
      teacherId,
      title:      parsed.data.title,
      topic:      parsed.data.topic,
      subject:    parsed.data.subject,
      difficulty: parsed.data.difficulty,
      lesson:     parsed.data.lesson as unknown as object,
    },
  })
  res.status(201).json({ draft })
})

// ── GET /api/ai/drafts/:id ───────────────────────────────────────────────────

router.get('/:id', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const id = String(req.params['id'])
  const teacherId = String(req.user!.userId)
  const draft = await prisma.teacherLessonDraft.findUnique({ where: { id } })
  if (!draft) { res.status(404).json({ error: 'Черновик не найден' }); return }
  if (draft.teacherId !== teacherId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав' }); return
  }
  res.json({ draft })
})

// ── PATCH /api/ai/drafts/:id ─────────────────────────────────────────────────

router.patch('/:id', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const id = String(req.params['id'])
  const teacherId = String(req.user!.userId)
  const parsed = UpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Неверные данные' }); return
  }
  const existing = await prisma.teacherLessonDraft.findUnique({ where: { id } })
  if (!existing) { res.status(404).json({ error: 'Черновик не найден' }); return }
  if (existing.teacherId !== teacherId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав' }); return
  }
  const data: Record<string, unknown> = {}
  if (parsed.data.title) data.title = parsed.data.title
  if (parsed.data.lesson) data.lesson = parsed.data.lesson as unknown as object
  if (parsed.data.publishedAssignmentId !== undefined) data.publishedAssignmentId = parsed.data.publishedAssignmentId
  const draft = await prisma.teacherLessonDraft.update({ where: { id }, data })
  res.json({ draft })
})

// ── DELETE /api/ai/drafts/:id ────────────────────────────────────────────────

router.delete('/:id', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const id = String(req.params['id'])
  const teacherId = String(req.user!.userId)
  const existing = await prisma.teacherLessonDraft.findUnique({ where: { id } })
  if (!existing) { res.status(404).json({ error: 'Черновик не найден' }); return }
  if (existing.teacherId !== teacherId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав' }); return
  }
  await prisma.teacherLessonDraft.delete({ where: { id } })
  res.json({ ok: true })
})

export default router
