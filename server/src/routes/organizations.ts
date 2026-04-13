// ── Organization Routes (B2B Center Management) ───────────────────────────────
//
// POST   /api/orgs            → create org (teacher/admin only)
// GET    /api/orgs/mine       → orgs I own or belong to (MUST be before /:id)
// POST   /api/orgs/join       → join org by invite code
// GET    /api/orgs/:id/dashboard → center analytics (owner only)
// DELETE /api/orgs/:id/members/:userId → remove teacher (owner only)

import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'

const router = Router()

// ── Helpers ───────────────────────────────────────────────────────────────────

const INVITE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

async function generateUniqueOrgCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)]
    }
    const existing = await prisma.organization.findUnique({ where: { inviteCode: code } })
    if (!existing) return code
  }
  throw new Error('Failed to generate unique org invite code')
}

// ── POST /api/orgs  ───────────────────────────────────────────────────────────

const CreateOrgSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(['tutoring_center', 'school', 'corporate']),
  city: z.string().max(100).optional(),
})

router.post('/', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const parsed = CreateOrgSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Неверные данные' }); return
  }

  const userId = String(req.user!.userId)

  // Check user doesn't already own an org (one org per director for MVP)
  const existing = await prisma.organization.findFirst({ where: { ownerId: userId } })
  if (existing) {
    res.status(409).json({ error: 'У вас уже есть организация', org: existing }); return
  }

  const inviteCode = await generateUniqueOrgCode()
  const org = await prisma.organization.create({
    data: {
      ...parsed.data,
      ownerId: userId,
      inviteCode,
      members: {
        create: { userId, role: 'owner' },
      },
    },
    include: { _count: { select: { members: true } } },
  })

  res.status(201).json({ org })
})

// ── GET /api/orgs/mine  (MUST be before /:id) ─────────────────────────────────

router.get('/mine', verifyToken, async (req, res) => {
  const userId = String(req.user!.userId)

  const memberships = await prisma.orgMembership.findMany({
    where: { userId },
    include: {
      org: { include: { _count: { select: { members: true } } } },
    },
    orderBy: { joinedAt: 'asc' },
  })

  const orgs = memberships.map((m) => ({ ...m.org, myRole: m.role }))
  res.json({ orgs })
})

// ── POST /api/orgs/join ───────────────────────────────────────────────────────

router.post('/join', verifyToken, async (req, res) => {
  const { inviteCode } = req.body as { inviteCode?: string }
  if (!inviteCode || typeof inviteCode !== 'string') {
    res.status(400).json({ error: 'inviteCode обязателен' }); return
  }

  const org = await prisma.organization.findUnique({
    where: { inviteCode: inviteCode.toUpperCase().trim() },
  })
  if (!org) { res.status(404).json({ error: 'Организация не найдена — проверьте код' }); return }

  const userId = String(req.user!.userId)
  const existing = await prisma.orgMembership.findUnique({
    where: { orgId_userId: { orgId: org.id, userId } },
  })
  if (existing) { res.status(409).json({ error: 'Вы уже в этой организации' }); return }

  await prisma.orgMembership.create({ data: { orgId: org.id, userId, role: 'teacher' } })
  res.json({ ok: true, org })
})

// ── GET /api/orgs/:id/dashboard ───────────────────────────────────────────────

router.get('/:id/dashboard', verifyToken, async (req, res) => {
  const orgId  = String(req.params['id'])
  const userId = String(req.user!.userId)

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { _count: { select: { members: true } } },
  })
  if (!org) { res.status(404).json({ error: 'Организация не найдена' }); return }
  if (org.ownerId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет доступа' }); return
  }

  // ── All teachers in org ────────────────────────────────────────────────────
  const memberships = await prisma.orgMembership.findMany({
    where: { orgId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: 'asc' },
  })

  const now = Date.now()

  // ── Build per-teacher stats ────────────────────────────────────────────────
  const teachers = await Promise.all(
    memberships.map(async (m) => {
      const teacherId = m.userId

      // All classes of this teacher
      const classes = await prisma.class.findMany({
        where: { teacherId },
        include: { _count: { select: { members: true, assignments: true } } },
        orderBy: { createdAt: 'desc' },
      })

      const classCount = classes.length

      // Total students across all classes (sum of members)
      const studentCount = classes.reduce((sum, c) => {
        const cc = c as typeof c & { _count: { members: number } }
        return sum + cc._count.members
      }, 0)

      // All assignments created by this teacher
      const assignments = await prisma.assignment.findMany({
        where: { teacherId },
        orderBy: { createdAt: 'desc' },
        take: 1, // only need latest for activity calculation
      })
      const assignmentCount = await prisma.assignment.count({ where: { teacherId } })

      // Avg score from all submissions to this teacher's assignments
      const scoreAgg = await prisma.assignmentSubmission.aggregate({
        where: {
          assignment: { teacherId },
          score:      { not: null },
        },
        _avg: { score: true },
      })
      const avgScore = scoreAgg._avg.score !== null
        ? Math.round(scoreAgg._avg.score)
        : null

      // Last activity: most recent class or assignment created
      const lastClassDate      = classes[0]?.createdAt ?? null
      const lastAssignmentDate = assignments[0]?.createdAt ?? null
      const lastDate = lastClassDate && lastAssignmentDate
        ? new Date(Math.max(lastClassDate.getTime(), lastAssignmentDate.getTime()))
        : lastClassDate ?? lastAssignmentDate ?? null

      const lastActivityDays = lastDate
        ? Math.floor((now - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999

      return {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        orgRole: m.role,
        classCount,
        studentCount,
        assignmentCount,
        avgScore,
        lastActivityDays,
      }
    })
  )

  // ── Build per-student stats ────────────────────────────────────────────────
  // Collect all class IDs owned by org members
  const allTeacherIds = memberships.map((m) => m.userId)

  const allClasses = await prisma.class.findMany({
    where: { teacherId: { in: allTeacherIds } },
    include: {
      teacher: { select: { id: true, name: true } },
      members: { include: { student: { select: { id: true, name: true, email: true } } } },
      _count:  { select: { assignments: true } },
    },
  })

  // Build student stats map
  const studentMap = new Map<string, {
    id: string; name: string; email: string
    teacherName: string; className: string
    submissionCount: number; totalAssignments: number; scoreSum: number; scoreCount: number
  }>()

  for (const cls of allClasses) {
    const c = cls as typeof cls & {
      teacher: { id: string; name: string }
      members: Array<{ student: { id: string; name: string; email: string } }>
      _count: { assignments: number }
    }

    const totalAssignments = c._count.assignments

    // Get submissions for this class
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignment: { classId: cls.id } },
      select: { studentId: true, score: true },
    })

    const subByStudent = new Map<string, { count: number; scoreSum: number; scoreCount: number }>()
    for (const sub of submissions) {
      const prev = subByStudent.get(sub.studentId) ?? { count: 0, scoreSum: 0, scoreCount: 0 }
      prev.count++
      if (sub.score !== null) { prev.scoreSum += sub.score; prev.scoreCount++ }
      subByStudent.set(sub.studentId, prev)
    }

    for (const mb of c.members) {
      const st = mb.student
      const sub = subByStudent.get(st.id) ?? { count: 0, scoreSum: 0, scoreCount: 0 }

      if (!studentMap.has(st.id)) {
        studentMap.set(st.id, {
          id: st.id, name: st.name, email: st.email,
          teacherName: c.teacher.name, className: cls.name,
          submissionCount: sub.count, totalAssignments,
          scoreSum: sub.scoreSum, scoreCount: sub.scoreCount,
        })
      } else {
        const prev = studentMap.get(st.id)!
        prev.submissionCount  += sub.count
        prev.totalAssignments += totalAssignments
        prev.scoreSum         += sub.scoreSum
        prev.scoreCount       += sub.scoreCount
      }
    }
  }

  const students = Array.from(studentMap.values()).map((s) => ({
    id: s.id, name: s.name, email: s.email,
    teacherName: s.teacherName, className: s.className,
    submissionCount: s.submissionCount,
    totalAssignments: s.totalAssignments,
    avgScore: s.scoreCount > 0 ? Math.round(s.scoreSum / s.scoreCount) : null,
  }))

  // ── Org-level aggregate stats ──────────────────────────────────────────────
  const totalTeachers    = memberships.length
  const totalStudents    = students.length
  const totalAssignments = teachers.reduce((s, t) => s + t.assignmentCount, 0)
  const scoredTeachers   = teachers.filter((t) => t.avgScore !== null)
  const avgScore = scoredTeachers.length > 0
    ? Math.round(scoredTeachers.reduce((s, t) => s + (t.avgScore ?? 0), 0) / scoredTeachers.length)
    : null

  res.json({
    org,
    stats: { totalTeachers, totalStudents, totalAssignments, avgScore },
    teachers,
    students,
  })
})

// ── DELETE /api/orgs/:id/members/:userId ──────────────────────────────────────

router.delete('/:id/members/:userId', verifyToken, async (req, res) => {
  const orgId    = String(req.params['id'])
  const memberId = String(req.params['userId'])
  const userId   = String(req.user!.userId)

  const org = await prisma.organization.findUnique({ where: { id: orgId } })
  if (!org) { res.status(404).json({ error: 'Организация не найдена' }); return }
  if (org.ownerId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав' }); return
  }
  if (memberId === org.ownerId) {
    res.status(400).json({ error: 'Нельзя удалить владельца организации' }); return
  }

  await prisma.orgMembership.deleteMany({ where: { orgId, userId: memberId } })
  res.json({ ok: true })
})

// ── POST /api/orgs/:id/import/teachers ────────────────────────────────────────
// CSV format: name,email,password (one per line, first line = header)

router.post('/:id/import/teachers', verifyToken, async (req, res) => {
  const orgId  = String(req.params['id'])
  const userId = String(req.user!.userId)

  const org = await prisma.organization.findUnique({ where: { id: orgId } })
  if (!org) { res.status(404).json({ error: 'Организация не найдена' }); return }
  if (org.ownerId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав' }); return
  }

  const { csv } = req.body as { csv?: string }
  if (!csv || typeof csv !== 'string') {
    res.status(400).json({ error: 'Поле csv обязательно (строка CSV)' }); return
  }

  const lines = csv.trim().split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) { res.status(400).json({ error: 'Минимум 1 строка данных + заголовок' }); return }

  const created: string[] = []
  const errors: { row: number; message: string }[] = []

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i]!.split(',').map(s => s.trim())
    const [name, email, password] = parts

    if (!name || !email || !password) {
      errors.push({ row: i + 1, message: 'Нужны 3 поля: name,email,password' }); continue
    }

    if (password.length < 6) {
      errors.push({ row: i + 1, message: 'Пароль мин. 6 символов' }); continue
    }

    try {
      const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
      if (existing) {
        // If user exists, just add to org
        const alreadyMember = await prisma.orgMembership.findUnique({
          where: { orgId_userId: { orgId, userId: existing.id } },
        })
        if (!alreadyMember) {
          await prisma.orgMembership.create({ data: { orgId, userId: existing.id, role: 'teacher' } })
        }
        created.push(existing.name)
        continue
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: { name, email: email.toLowerCase(), passwordHash, role: 'teacher' },
      })
      await prisma.orgMembership.create({ data: { orgId, userId: user.id, role: 'teacher' } })
      created.push(name)
    } catch (err) {
      errors.push({ row: i + 1, message: err instanceof Error ? err.message : 'Ошибка' })
    }
  }

  res.json({ created: created.length, createdNames: created, errors })
})

// ── POST /api/orgs/:id/import/students ────────────────────────────────────────
// CSV format: name,email,password,className (one per line, first line = header)

router.post('/:id/import/students', verifyToken, async (req, res) => {
  const orgId  = String(req.params['id'])
  const userId = String(req.user!.userId)

  const org = await prisma.organization.findUnique({ where: { id: orgId } })
  if (!org) { res.status(404).json({ error: 'Организация не найдена' }); return }
  if (org.ownerId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав' }); return
  }

  const { csv } = req.body as { csv?: string }
  if (!csv || typeof csv !== 'string') {
    res.status(400).json({ error: 'Поле csv обязательно (строка CSV)' }); return
  }

  const lines = csv.trim().split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) { res.status(400).json({ error: 'Минимум 1 строка данных + заголовок' }); return }

  // Get all classes by org teachers for matching
  const orgTeachers = await prisma.orgMembership.findMany({ where: { orgId }, select: { userId: true } })
  const teacherIds = orgTeachers.map(m => m.userId)
  const allClasses = await prisma.class.findMany({
    where: { teacherId: { in: teacherIds } },
    select: { id: true, name: true },
  })
  const classMap = new Map(allClasses.map(c => [c.name.toLowerCase(), c.id]))

  const created: string[] = []
  const errors: { row: number; message: string }[] = []

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i]!.split(',').map(s => s.trim())
    const [name, email, password, className] = parts

    if (!name || !email || !password) {
      errors.push({ row: i + 1, message: 'Нужны минимум 3 поля: name,email,password' }); continue
    }

    if (password.length < 6) {
      errors.push({ row: i + 1, message: 'Пароль мин. 6 символов' }); continue
    }

    try {
      let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

      if (!user) {
        const passwordHash = await bcrypt.hash(password, 10)
        user = await prisma.user.create({
          data: { name, email: email.toLowerCase(), passwordHash, role: 'student' },
        })
      }

      // Join class if className provided
      if (className) {
        const classId = classMap.get(className.toLowerCase())
        if (classId) {
          const alreadyMember = await prisma.classMembership.findUnique({
            where: { classId_studentId: { classId, studentId: user.id } },
          })
          if (!alreadyMember) {
            await prisma.classMembership.create({ data: { classId, studentId: user.id } })
          }
        } else {
          errors.push({ row: i + 1, message: `Класс "${className}" не найден` })
        }
      }

      created.push(name)
    } catch (err) {
      errors.push({ row: i + 1, message: err instanceof Error ? err.message : 'Ошибка' })
    }
  }

  res.json({ created: created.length, createdNames: created, errors })
})

export default router
