// ── Assignments Routes ────────────────────────────────────────────────────────

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'
import { notifyParent } from '../lib/parentNotify'

const router = Router()

// ── POST /api/assignments ─────────────────────────────────────────────────────

const CreateAssignmentSchema = z.object({
  classId:     z.string(),
  title:       z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type:        z.enum(['test', 'homework', 'reading']),
  content:     z.unknown(),
  dueDate:     z.string().optional(),
})

router.post('/', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const parsed = CreateAssignmentSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Неверные данные' }); return
  }

  const { classId, title, description, type, content, dueDate } = parsed.data
  const userId = String(req.user!.userId)

  const cls = await prisma.class.findUnique({ where: { id: classId } })
  if (!cls) { res.status(404).json({ error: 'Класс не найден' }); return }
  if (cls.teacherId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав на этот класс' }); return
  }

  const assignment = await prisma.assignment.create({
    data: {
      classId,
      title,
      description: description ?? null,
      type,
      content:   content as object,
      teacherId: userId,
      dueDate:   dueDate ? new Date(dueDate) : null,
    },
  })

  res.status(201).json({ assignment })
})

// ── GET /api/assignments/:id ──────────────────────────────────────────────────

router.get('/:id', verifyToken, async (req, res) => {
  const id     = String(req.params['id'])
  const userId = String(req.user!.userId)

  const assignment = await prisma.assignment.findUnique({
    where:   { id },
    include: { class: { include: { members: { select: { studentId: true } } } } },
  })
  if (!assignment) { res.status(404).json({ error: 'Задание не найдено' }); return }

  const a = assignment as typeof assignment & { class: { members: Array<{ studentId: string }> } }
  const isTeacher = a.teacherId === userId
  const isMember  = a.class.members.some((m: { studentId: string }) => m.studentId === userId)
  if (!isTeacher && !isMember && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет доступа' }); return
  }

  res.json({ assignment })
})

// ── DELETE /api/assignments/:id ───────────────────────────────────────────────

router.delete('/:id', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const id     = String(req.params['id'])
  const userId = String(req.user!.userId)

  const assignment = await prisma.assignment.findUnique({ where: { id } })
  if (!assignment) { res.status(404).json({ error: 'Задание не найдено' }); return }
  if (assignment.teacherId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав' }); return
  }

  await prisma.assignment.delete({ where: { id } })
  res.json({ ok: true })
})

// ── POST /api/assignments/:id/submit ──────────────────────────────────────────

router.post('/:id/submit', verifyToken, async (req, res) => {
  const id     = String(req.params['id'])
  const userId = String(req.user!.userId)
  const { answers } = req.body as { answers: unknown }

  const assignment = await prisma.assignment.findUnique({
    where:   { id },
    include: { class: { include: { members: { select: { studentId: true } } } } },
  })
  if (!assignment) { res.status(404).json({ error: 'Задание не найдено' }); return }

  const a = assignment as typeof assignment & { class: { members: Array<{ studentId: string }> } }
  const isMember = a.class.members.some((m: { studentId: string }) => m.studentId === userId)
  if (!isMember) { res.status(403).json({ error: 'Вы не состоите в этом классе' }); return }

  const existing = await prisma.assignmentSubmission.findUnique({
    where: { assignmentId_studentId: { assignmentId: id, studentId: userId } },
  })
  if (existing) { res.status(409).json({ error: 'Вы уже сдали это задание' }); return }

  // Auto-score for tests
  let score: number | null = null
  if (assignment.type === 'test') {
    const content = assignment.content as { questions?: Array<{ correctAnswer: number }> }
    const studentAnswers = answers as number[]
    if (Array.isArray(studentAnswers) && content.questions?.length) {
      let correct = 0
      content.questions.forEach((q, i) => {
        if (studentAnswers[i] === q.correctAnswer) correct++
      })
      score = Math.round((correct / content.questions.length) * 100)
    }
  }

  const submission = await prisma.assignmentSubmission.create({
    data: { assignmentId: id, studentId: userId, answers: answers as object, score },
  })

  const totalQuestions = assignment.type === 'test'
    ? ((assignment.content as { questions?: unknown[] }).questions?.length ?? 0)
    : undefined

  // Notify parent via Telegram (fire & forget)
  const student = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, parentTgChatId: true } })
  if (student?.parentTgChatId) {
    const scoreText = score !== null ? `${score}%` : 'на проверке'
    notifyParent(student.parentTgChatId, `📝 ${student.name} сдал(а) задание «${assignment.title}» — ${scoreText}`)
  }

  res.status(201).json({ submission: { ...submission, totalQuestions } })
})

// ── GET /api/assignments/:id/my-submission ────────────────────────────────────

router.get('/:id/my-submission', verifyToken, async (req, res) => {
  const id     = String(req.params['id'])
  const userId = String(req.user!.userId)

  const submission = await prisma.assignmentSubmission.findUnique({
    where: { assignmentId_studentId: { assignmentId: id, studentId: userId } },
  })

  res.json({ submission: submission ?? null })
})

// ── GET /api/assignments/:id/results ─────────────────────────────────────────

router.get('/:id/results', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const id     = String(req.params['id'])
  const userId = String(req.user!.userId)

  const assignment = await prisma.assignment.findUnique({
    where:   { id },
    include: {
      class:       { include: { _count: { select: { members: true } } } },
      submissions: { include: { student: { select: { id: true, name: true, email: true } } }, orderBy: { submittedAt: 'desc' } },
    },
  })
  if (!assignment) { res.status(404).json({ error: 'Задание не найдено' }); return }

  const r = assignment as typeof assignment & {
    class: { _count: { members: number } }
    submissions: Array<{ score: number | null; student: { id: string } }>
  }

  if (r.teacherId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав' }); return
  }

  const scores = r.submissions.map(s => s.score).filter((s): s is number => s !== null)
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

  res.json({
    assignment,
    submissions: r.submissions,
    stats: { totalMembers: r.class._count.members, submitted: r.submissions.length, avgScore },
  })
})

// ── PUT /api/assignments/:id/grade/:submissionId ──────────────────────────────

const GradeSchema = z.object({
  score:    z.number().int().min(0).max(100),
  feedback: z.string().max(500).optional(),
})

router.put('/:id/grade/:submissionId', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const id           = String(req.params['id'])
  const submissionId = String(req.params['submissionId'])
  const userId       = String(req.user!.userId)

  const parsed = GradeSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Неверные данные' }); return
  }

  const assignment = await prisma.assignment.findUnique({ where: { id } })
  if (!assignment) { res.status(404).json({ error: 'Задание не найдено' }); return }
  if (assignment.teacherId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав' }); return
  }

  const submission = await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data:  { score: parsed.data.score, feedback: parsed.data.feedback ?? null },
    include: { student: { select: { name: true, parentTgChatId: true } } },
  })

  // Notify parent about grade
  const sub = submission as typeof submission & { student: { name: string; parentTgChatId: string | null } }
  if (sub.student.parentTgChatId) {
    const fb = parsed.data.feedback ? ` — ${parsed.data.feedback}` : ''
    notifyParent(sub.student.parentTgChatId, `✅ Оценка за «${assignment.title}»: ${parsed.data.score}%${fb}`)
  }

  res.json({ submission })
})

export default router
