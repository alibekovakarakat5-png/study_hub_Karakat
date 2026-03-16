import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'

const router = Router()

// ── Helper: parse course with full structure ──────────────────────────────────

async function fetchCourseWithStructure(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })
}

// ── GET /api/courses ──────────────────────────────────────────────────────────
// Admin sees all; authenticated users see published + enrolled; public sees published

router.get('/', async (req, res) => {
  let isAdmin = false
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      const jwt = await import('jsonwebtoken')
      const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET ?? 'dev-secret-change-in-production') as { role: string }
      isAdmin = payload.role === 'admin'
    } catch { /* not authenticated */ }
  }

  const courses = await prisma.course.findMany({
    where: isAdmin ? undefined : { isPublished: true },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: { orderBy: { order: 'asc' }, select: { id: true, title: true, duration: true, order: true } },
        },
      },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json({ courses })
})

// ── GET /api/courses/:id ──────────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
  const course = await fetchCourseWithStructure(String(req.params['id']))
  if (!course) { res.status(404).json({ error: 'Курс не найден' }); return }
  res.json({ course })
})

// ── POST /api/courses — create (admin only) ───────────────────────────────────

router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  const { title, description, subject, level, price, coverColor } = req.body as {
    title: string; description: string; subject: string
    level: string; price: number; coverColor: string
  }

  if (!title?.trim()) { res.status(400).json({ error: 'Название обязательно' }); return }

  const course = await prisma.course.create({
    data: {
      title: title.trim(),
      description: description?.trim() ?? '',
      subject: subject ?? 'ent',
      level: level ?? 'beginner',
      price: price ?? 0,
      coverColor: coverColor ?? '#2563eb',
    },
  })

  res.status(201).json({ course })
})

// ── PUT /api/courses/:id — update metadata + full structure (admin only) ──────
// Accepts { title, description, subject, level, price, coverColor, isPublished, modules }
// modules is the full nested structure; we do a full replace

router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const courseId = String(req.params['id'])
  const { title, description, subject, level, price, coverColor, isPublished, modules } = req.body as {
    title?: string; description?: string; subject?: string; level?: string
    price?: number; coverColor?: string; isPublished?: boolean
    modules?: Array<{
      id?: string; title: string; order: number
      lessons: Array<{
        id?: string; title: string; duration?: number; order: number; blocks: unknown[]
      }>
    }>
  }

  const existing = await prisma.course.findUnique({ where: { id: courseId } })
  if (!existing) { res.status(404).json({ error: 'Курс не найден' }); return }

  // Update course metadata
  await prisma.course.update({
    where: { id: courseId },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(subject !== undefined && { subject }),
      ...(level !== undefined && { level }),
      ...(price !== undefined && { price }),
      ...(coverColor !== undefined && { coverColor }),
      ...(isPublished !== undefined && { isPublished }),
    },
  })

  // If modules provided: full replace (delete old, recreate)
  if (modules !== undefined) {
    // Delete existing modules (cascade deletes lessons)
    await prisma.courseModule.deleteMany({ where: { courseId } })

    // Recreate modules + lessons in order
    for (const mod of modules) {
      const newMod = await prisma.courseModule.create({
        data: { courseId, title: mod.title.trim(), order: mod.order },
      })
      for (const lesson of mod.lessons) {
        await prisma.lesson.create({
          data: {
            moduleId: newMod.id,
            title: lesson.title.trim(),
            duration: lesson.duration ?? null,
            order: lesson.order,
            blocks: lesson.blocks as object[],
          },
        })
      }
    }
  }

  const updated = await fetchCourseWithStructure(courseId)
  res.json({ course: updated })
})

// ── DELETE /api/courses/:id (admin only) ──────────────────────────────────────

router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const courseId = String(req.params['id'])
  await prisma.course.delete({ where: { id: courseId } })
  res.json({ ok: true })
})

// ── POST /api/courses/:id/enroll (authenticated) ─────────────────────────────

router.post('/:id/enroll', verifyToken, async (req, res) => {
  const userId = req.user!.userId
  const courseId = String(req.params['id'])

  const existing = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId } },
  })
  if (existing) { res.json({ enrolled: true, alreadyEnrolled: true }); return }

  await prisma.courseEnrollment.create({ data: { courseId, userId } })
  res.json({ enrolled: true })
})

// ── GET /api/courses/:id/progress (authenticated) ────────────────────────────

router.get('/:id/progress', verifyToken, async (req, res) => {
  const userId = req.user!.userId
  const courseId = String(req.params['id'])

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId } },
  })
  if (!enrollment) { res.json({ enrolled: false, completedLessonIds: [] }); return }

  // Get all lessons in this course
  const modules = await prisma.courseModule.findMany({
    where: { courseId },
    include: { lessons: { select: { id: true } } },
  })
  const lessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id))

  // Get completions
  const completions = await prisma.lessonCompletion.findMany({
    where: { userId, lessonId: { in: lessonIds } },
    select: { lessonId: true, quizScore: true, completedAt: true },
  })

  res.json({
    enrolled: true,
    completedLessonIds: completions.map((c) => c.lessonId),
    completions,
  })
})

// ── POST /api/courses/lessons/:lessonId/complete (authenticated) ──────────────

router.post('/lessons/:lessonId/complete', verifyToken, async (req, res) => {
  const userId = req.user!.userId
  const lessonId = String(req.params['lessonId'])
  const { quizScore } = req.body as { quizScore?: number }

  await prisma.lessonCompletion.upsert({
    where: { lessonId_userId: { lessonId, userId } },
    create: { lessonId, userId, quizScore: quizScore ?? null },
    update: { quizScore: quizScore ?? null, completedAt: new Date() },
  })

  res.json({ ok: true })
})

export default router
