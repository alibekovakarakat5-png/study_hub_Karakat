import { Router } from 'express'
import path from 'path'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'
import { sanitizeObject } from '../lib/sanitize'
import { lessonsFromText } from '../lib/lessonsFromText'
import { tagLessonTopics } from '../lib/topicTagger'
import { extractText } from '../lib/textExtractor'
import { UPLOADS_DIR } from '../lib/upload'
import type { Request } from 'express'
import type { JwtPayload } from '../middleware/auth'

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
  // ── Rich IELTS practice content (added 2026-05-06) ──
  'ielts_reading_passage',
  'ielts_writing_task',
  'ielts_speaking_part1',
  'ielts_speaking_part2',
  'ielts_speaking_part3',
  'ielts_listening_section',
  'ielts_vocab_set',
  // ── ENT subject course lessons (biology, history, chemistry, etc) ──
  'ent_lesson',
] as const

const ContentSchema = z.object({
  type: z.enum(VALID_TYPES),
  data: z.record(z.unknown()),
  active: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
  // Optional org scope. If a teacher in an org POSTs without orgId, server
  // forces it to their primary org. Admin can create global (null) or any.
  orgId: z.string().optional(),
})

// ── Pagination helper ──────────────────────────────────────────────────────────

function parsePagination(query: Record<string, unknown>) {
  const page  = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50))
  return { skip: (page - 1) * limit, take: limit, page, limit }
}

// ── Decode token if present, but don't require it ────────────────────────────
//
// Used by public GET so anonymous users still see global content while
// authenticated users also see their orgs' content.

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'

function tryDecodeUser(req: Request): JwtPayload | null {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  const token = header.slice(7)
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

// ── Helper: which org IDs is this user a member of (or owner of)? ───────────

async function getUserOrgIds(userId: string): Promise<string[]> {
  const memberships = await prisma.orgMembership.findMany({
    where: { userId },
    select: { orgId: true },
  })
  return memberships.map((m) => m.orgId)
}

// ── Build the where filter for visible content ──────────────────────────────
//
// Visibility rules:
//   - Anonymous: only orgId IS NULL (global/platform content)
//   - Authenticated, no orgs: only orgId IS NULL
//   - Authenticated, in orgs A/B: orgId IS NULL OR orgId IN [A, B]
//   - Admin: everything (no scope filter)

async function buildScopeWhere(
  user: JwtPayload | null,
): Promise<Prisma.ContentWhereInput> {
  if (user?.role === 'admin') return {}
  if (!user) return { orgId: null }
  const orgIds = await getUserOrgIds(user.userId)
  if (orgIds.length === 0) return { orgId: null }
  return { OR: [{ orgId: null }, { orgId: { in: orgIds } }] }
}

// ── GET /api/content?type=...&page=1&limit=50 — public: list active content ──

router.get('/', async (req, res) => {
  const type = req.query.type as string | undefined
  const { skip, take, page, limit } = parsePagination(req.query as Record<string, unknown>)

  const user = tryDecodeUser(req)
  const scope = await buildScopeWhere(user)

  const where: Prisma.ContentWhereInput = {
    active: true,
    ...(type ? { type } : {}),
    ...scope,
  }

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

// ── GET /api/content/all?type=...&page=1&limit=50 — admin/teacher: all ────────

router.get('/all', verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
  const type = req.query.type as string | undefined
  const { skip, take, page, limit } = parsePagination(req.query as Record<string, unknown>)

  const scope = await buildScopeWhere(req.user!)

  const where: Prisma.ContentWhereInput = {
    ...(type ? { type } : {}),
    ...scope,
  }

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

// ── POST /api/content — admin/teacher: create new content item ────────────────

router.post('/', verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
  const parsed = ContentSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const userId = req.user!.userId
  const isAdmin = req.user!.role === 'admin'

  // ── Determine final orgId ────────────────────────────────────────────────
  // Non-admin teacher: server forces orgId to their primary org. They cannot
  // create global content (orgId=null) or content in another org.
  // Admin: respects whatever orgId they pass (or null for global).
  let finalOrgId: string | null = null
  if (isAdmin) {
    finalOrgId = parsed.data.orgId ?? null
    // If admin specifies an orgId, verify org exists
    if (finalOrgId) {
      const org = await prisma.organization.findUnique({ where: { id: finalOrgId }, select: { id: true } })
      if (!org) { res.status(404).json({ error: 'Организация не найдена' }); return }
    }
  } else {
    // Teacher: must be in an org. Find their primary (owned, else first joined).
    const owned = await prisma.organization.findFirst({
      where: { ownerId: userId },
      select: { id: true },
    })
    if (owned) {
      finalOrgId = owned.id
    } else {
      const membership = await prisma.orgMembership.findFirst({
        where: { userId },
        orderBy: { joinedAt: 'asc' },
        select: { orgId: true },
      })
      if (!membership) {
        res.status(403).json({ error: 'Только администратор может создавать глобальный контент. Создайте организацию или присоединитесь к ней.' })
        return
      }
      finalOrgId = membership.orgId
    }
    // Ignore any orgId passed by client — security.
  }

  const { data: rawData, type, active, order } = parsed.data
  const sanitizedData = sanitizeObject(rawData as Record<string, unknown>)
  const item = await prisma.content.create({
    data: {
      type,
      active: active ?? true,
      order: order ?? 0,
      orgId: finalOrgId,
      data: sanitizedData as Prisma.InputJsonValue,
    },
  })
  res.status(201).json({ item })
})

// ── PUT /api/content/:id — admin/teacher: update content item ─────────────────

router.put('/:id', verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
  const id = req.params['id'] as string
  const parsed = ContentSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const existing = await prisma.content.findUnique({ where: { id } })
  if (!existing) { res.status(404).json({ error: 'Контент не найден' }); return }

  // ── Authorise ────────────────────────────────────────────────────────────
  const userId = req.user!.userId
  const isAdmin = req.user!.role === 'admin'
  if (!isAdmin) {
    if (existing.orgId === null) {
      res.status(403).json({ error: 'Глобальный контент редактирует только администратор' })
      return
    }
    const userOrgs = await getUserOrgIds(userId)
    if (!userOrgs.includes(existing.orgId)) {
      res.status(403).json({ error: 'Нет прав редактировать этот контент' })
      return
    }
  }

  // Non-admin cannot move content between orgs.
  const { data: rawData, orgId, ...rest } = parsed.data
  const updateData: Prisma.ContentUpdateInput = { ...rest }

  if (rawData !== undefined) {
    updateData.data = sanitizeObject(rawData as Record<string, unknown>) as Prisma.InputJsonValue
  }
  if (isAdmin && orgId !== undefined) {
    // Admin can re-scope (including to global by passing empty string)
    updateData.org = orgId ? { connect: { id: orgId } } : { disconnect: true }
  }

  const item = await prisma.content.update({ where: { id }, data: updateData })
  res.json({ item })
})

// ── DELETE /api/content/:id — admin/teacher: delete content item ──────────────

router.delete('/:id', verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
  const id = req.params['id'] as string
  const existing = await prisma.content.findUnique({ where: { id } })
  if (!existing) { res.status(404).json({ error: 'Контент не найден' }); return }

  const userId = req.user!.userId
  const isAdmin = req.user!.role === 'admin'
  if (!isAdmin) {
    if (existing.orgId === null) {
      res.status(403).json({ error: 'Глобальный контент удаляет только администратор' })
      return
    }
    const userOrgs = await getUserOrgIds(userId)
    if (!userOrgs.includes(existing.orgId)) {
      res.status(403).json({ error: 'Нет прав удалять этот контент' })
      return
    }
  }

  await prisma.content.delete({ where: { id } })
  res.json({ ok: true })
})

// ── POST /api/content/from-text — generate lessons from text and save ─────────
//
// Reads either an uploaded file (uploadId) or raw `text`, asks Groq to turn
// it into structured lessons, and inserts each lesson as an `ent_lesson`
// Content row scoped to the caller's org. Returns the created items so the
// UI can preview them.

const FromTextSchema = z.object({
  uploadId: z.string().optional(),
  text: z.string().min(100).optional(),
  subject: z.string().max(50).optional(),
  materialName: z.string().max(120).optional(),
}).refine(
  (v) => Boolean(v.uploadId || v.text),
  { message: 'Нужно передать uploadId или text' },
)

router.post('/from-text', verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
  const parsed = FromTextSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Неверные данные' })
    return
  }

  const userId = req.user!.userId
  const isAdmin = req.user!.role === 'admin'

  // ── Resolve target orgId (must be in an org unless admin) ───────────────────
  let targetOrgId: string | null = null
  if (!isAdmin) {
    const owned = await prisma.organization.findFirst({ where: { ownerId: userId }, select: { id: true } })
    if (owned) {
      targetOrgId = owned.id
    } else {
      const m = await prisma.orgMembership.findFirst({
        where: { userId },
        orderBy: { joinedAt: 'asc' },
        select: { orgId: true },
      })
      if (!m) {
        res.status(403).json({ error: 'Создавать материалы может только участник организации' })
        return
      }
      targetOrgId = m.orgId
    }
  }

  // ── Resolve text source ─────────────────────────────────────────────────────
  let sourceText: string
  if (parsed.data.uploadId) {
    const file = await prisma.uploadedFile.findUnique({ where: { id: parsed.data.uploadId } })
    if (!file) { res.status(404).json({ error: 'Загруженный файл не найден' }); return }
    if (file.uploadedBy !== userId && !isAdmin) {
      res.status(403).json({ error: 'Нет доступа к этому файлу' }); return
    }
    try {
      const filePath = path.join(UPLOADS_DIR, file.storagePath)
      const extracted = await extractText(filePath)
      sourceText = extracted.text
    } catch (err) {
      res.status(500).json({ error: `Ошибка извлечения текста: ${err instanceof Error ? err.message : 'unknown'}` })
      return
    }
  } else {
    sourceText = parsed.data.text!
  }

  if (sourceText.trim().length < 100) {
    res.status(400).json({ error: 'Текст слишком короткий — минимум 100 символов' })
    return
  }

  // ── Generate lessons via Groq ───────────────────────────────────────────────
  let lessons: Awaited<ReturnType<typeof lessonsFromText>>
  try {
    lessons = await lessonsFromText(sourceText, {
      subject: parsed.data.subject,
      materialName: parsed.data.materialName,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    res.status(502).json({ error: `Не удалось сгенерировать уроки: ${msg}` })
    return
  }
  if (lessons.length === 0) {
    res.status(502).json({ error: 'Получен пустой набор уроков' })
    return
  }

  // ── Insert each lesson as a Content row scoped to the org ──────────────────
  const sanitizedSubject = parsed.data.subject?.toLowerCase().trim() || 'general'
  const safeMaterial = parsed.data.materialName?.trim() || 'Материал'
  const baseTimestamp = Date.now()

  // Auto-tag each lesson with taxonomy topic IDs. Best-effort: if the tagger
  // fails (Groq down, network blip), we save the lesson with topics=[] and
  // the smart-assignment matcher simply won't pick it up — no hard failure.
  const taggedLessons = await Promise.all(
    lessons.map(async (lesson) => ({
      ...lesson,
      topics: await tagLessonTopics(lesson.theory, sanitizedSubject),
    })),
  )

  const created = await prisma.$transaction(
    taggedLessons.map((lesson, idx) => prisma.content.create({
      data: {
        type: 'ent_lesson',
        active: true,
        order: idx,
        orgId: targetOrgId,
        data: {
          subject: sanitizedSubject,
          moduleId: `mat-${baseTimestamp}`,
          moduleTitle: safeMaterial,
          moduleEmoji: '📘',
          moduleColor: '#3b82f6',
          lessonId: `mat-${baseTimestamp}-${idx + 1}`,
          title: lesson.title,
          duration: lesson.duration,
          theory: lesson.theory,
          keyFormulas: lesson.keyFormulas ?? [],
          quiz: lesson.quiz,
          topics: lesson.topics,
          sourceMaterial: safeMaterial,
          uploadedBy: userId,
        } as unknown as Prisma.InputJsonValue,
      },
    })),
  )

  res.status(201).json({
    items: created,
    stats: {
      lessons: created.length,
      totalQuiz: lessons.reduce((sum, l) => sum + l.quiz.length, 0),
    },
  })
})

export default router
