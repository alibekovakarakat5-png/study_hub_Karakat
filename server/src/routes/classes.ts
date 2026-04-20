// ── Classes Routes ────────────────────────────────────────────────────────────

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'

const router = Router()

// ── Helpers ───────────────────────────────────────────────────────────────────

const INVITE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

async function generateUniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)]
    }
    const existing = await prisma.class.findUnique({ where: { inviteCode: code } })
    if (!existing) return code
  }
  throw new Error('Failed to generate unique invite code')
}

// ── POST /api/classes/join  (MUST be before /:id) ─────────────────────────────

router.post('/join', verifyToken, async (req, res) => {
  const { inviteCode } = req.body as { inviteCode?: string }
  if (!inviteCode || typeof inviteCode !== 'string') {
    res.status(400).json({ error: 'inviteCode обязателен' }); return
  }

  const cls = await prisma.class.findUnique({
    where:   { inviteCode: inviteCode.toUpperCase().trim() },
    include: { teacher: { select: { id: true, name: true } } },
  })
  if (!cls) { res.status(404).json({ error: 'Класс не найден — проверьте код' }); return }

  const userId = String(req.user!.userId)
  const existing = await prisma.classMembership.findUnique({
    where: { classId_studentId: { classId: cls.id, studentId: userId } },
  })
  if (existing) { res.status(409).json({ error: 'Вы уже в этом классе' }); return }

  await prisma.classMembership.create({ data: { classId: cls.id, studentId: userId } })
  res.json({ ok: true, class: cls })
})

// ── GET /api/classes/my-schedule  (MUST be before /:id) ───────────────────────
// Teacher's full weekly timetable across all their classes

router.get('/my-schedule', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const userId = String(req.user!.userId)

  const classes = await prisma.class.findMany({
    where: { teacherId: userId },
    include: {
      schedules: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
    },
  })

  const timetable = classes.flatMap(cls =>
    cls.schedules.map(s => ({
      ...s,
      className: cls.name,
      subject: cls.subject,
      classId: cls.id,
    }))
  ).sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))

  res.json({ timetable })
})

// ── POST /api/classes ─────────────────────────────────────────────────────────

const CreateClassSchema = z.object({
  name:        z.string().min(1).max(100),
  subject:     z.string().min(1).max(50),
  description: z.string().max(500).optional(),
})

router.post('/', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const parsed = CreateClassSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Неверные данные' }); return
  }

  const teacherId = String(req.user!.userId)

  // Derive orgId: owned org first, otherwise first joined org.
  const ownedOrg = await prisma.organization.findFirst({
    where: { ownerId: teacherId },
    select: { id: true },
  })
  const membership = ownedOrg
    ? null
    : await prisma.orgMembership.findFirst({
        where:   { userId: teacherId },
        orderBy: { joinedAt: 'asc' },
        select:  { orgId: true },
      })
  const orgId = ownedOrg?.id ?? membership?.orgId ?? null

  const inviteCode = await generateUniqueInviteCode()
  const cls = await prisma.class.create({
    data: { ...parsed.data, teacherId, orgId, inviteCode },
    include: { _count: { select: { members: true, assignments: true } } },
  })

  res.status(201).json({ class: cls })
})

// ── GET /api/classes ──────────────────────────────────────────────────────────

router.get('/', verifyToken, async (req, res) => {
  const userId    = String(req.user!.userId)
  const role      = String(req.user!.role)
  const isTeacher = role === 'teacher' || role === 'admin'

  if (isTeacher) {
    const classes = await prisma.class.findMany({
      where:   { teacherId: userId },
      include: { _count: { select: { members: true, assignments: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ classes }); return
  }

  // Student: sees joined classes with their assignments + own submissions
  const classes = await prisma.class.findMany({
    where:   { members: { some: { studentId: userId } } },
    include: {
      teacher:     { select: { id: true, name: true } },
      _count:      { select: { members: true, assignments: true } },
      assignments: {
        include:  { submissions: { where: { studentId: userId } } },
        orderBy:  { dueDate: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ classes })
})

// ── GET /api/classes/:id ──────────────────────────────────────────────────────

router.get('/:id', verifyToken, async (req, res) => {
  const id     = String(req.params['id'])
  const userId = String(req.user!.userId)

  const cls = await prisma.class.findUnique({
    where:   { id },
    include: {
      teacher:     { select: { id: true, name: true, email: true } },
      members:     { include: { student: { select: { id: true, name: true, email: true, grade: true } } }, orderBy: { joinedAt: 'asc' } },
      assignments: { include: { _count: { select: { submissions: true } } }, orderBy: { createdAt: 'desc' } },
    },
  })
  if (!cls) { res.status(404).json({ error: 'Класс не найден' }); return }

  const c = cls as typeof cls & { members: Array<{ studentId: string }> }
  const isOwner  = c.teacherId === userId
  const isMember = c.members.some((m: { studentId: string }) => m.studentId === userId)
  if (!isOwner && !isMember) {
    res.status(403).json({ error: 'Нет доступа к этому классу' }); return
  }

  res.json({ class: cls })
})

// ── DELETE /api/classes/:id ───────────────────────────────────────────────────

router.delete('/:id', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const id     = String(req.params['id'])
  const userId = String(req.user!.userId)

  const cls = await prisma.class.findUnique({ where: { id } })
  if (!cls) { res.status(404).json({ error: 'Класс не найден' }); return }
  if (cls.teacherId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав' }); return
  }

  await prisma.class.delete({ where: { id } })
  res.json({ ok: true })
})

// ── DELETE /api/classes/:id/members/:studentId ────────────────────────────────

router.delete('/:id/members/:studentId', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const id        = String(req.params['id'])
  const studentId = String(req.params['studentId'])
  const userId    = String(req.user!.userId)

  const cls = await prisma.class.findUnique({ where: { id } })
  if (!cls) { res.status(404).json({ error: 'Класс не найден' }); return }
  if (cls.teacherId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав' }); return
  }

  await prisma.classMembership.deleteMany({ where: { classId: id, studentId } })
  res.json({ ok: true })
})

// ── POST /api/classes/:id/schedule ────────────────────────────────────────────

const ScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime:   z.string().regex(/^\d{2}:\d{2}$/),
  room:      z.string().max(50).optional(),
})

router.post('/:id/schedule', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const id     = String(req.params['id'])
  const userId = String(req.user!.userId)

  const parsed = ScheduleSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Неверные данные' }); return
  }

  const cls = await prisma.class.findUnique({ where: { id } })
  if (!cls) { res.status(404).json({ error: 'Класс не найден' }); return }
  if (cls.teacherId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав' }); return
  }

  const schedule = await prisma.classSchedule.create({
    data: { classId: id, ...parsed.data },
  })

  res.status(201).json({ schedule })
})

// ── GET /api/classes/:id/schedule ─────────────────────────────────────────────

router.get('/:id/schedule', verifyToken, async (req, res) => {
  const id = String(req.params['id'])

  const schedules = await prisma.classSchedule.findMany({
    where:   { classId: id },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  })

  res.json({ schedules })
})

// ── DELETE /api/classes/:id/schedule/:scheduleId ──────────────────────────────

router.delete('/:id/schedule/:scheduleId', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const id         = String(req.params['id'])
  const scheduleId = String(req.params['scheduleId'])
  const userId     = String(req.user!.userId)

  const cls = await prisma.class.findUnique({ where: { id } })
  if (!cls) { res.status(404).json({ error: 'Класс не найден' }); return }
  if (cls.teacherId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав' }); return
  }

  await prisma.classSchedule.delete({ where: { id: scheduleId } })
  res.json({ ok: true })
})

export default router
