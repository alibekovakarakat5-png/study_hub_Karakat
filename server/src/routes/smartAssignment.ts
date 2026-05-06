// ── Smart Assignment Routes — Auto-homework based on student weaknesses ────────
//
// POST /api/smart-assignment/generate   → analyze class + create personalized ДЗ
// GET  /api/smart-assignment/analysis/:classId → get weakness analysis for class

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'
import { getQuestionsForTopics, AVAILABLE_SUBJECTS } from '../data/questionBank'
import { weakTopicsToIds } from '../lib/topicMatcher'
import { pickQuestionsFromContent } from '../lib/contentQuestionPicker'

const router = Router()

// ── GET /api/smart-assignment/analysis/:classId ──────────────────────────────

router.get('/analysis/:classId', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const classId = String(req.params['classId'])
  const userId = String(req.user!.userId)

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: { members: { include: { student: { select: { id: true, name: true } } } } },
  })
  if (!cls) { res.status(404).json({ error: 'Класс не найден' }); return }
  if (cls.teacherId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав' }); return
  }

  // For each student, find weak topics from diagnostics + low-scoring submissions
  const analysis = await Promise.all(
    cls.members.map(async (m) => {
      const studentId = m.studentId

      // Latest diagnostic results
      const diagnostics = await prisma.diagnosticResult.findMany({
        where: { userId: studentId },
        orderBy: { takenAt: 'desc' },
        take: 10,
      })

      const weakTopics: string[] = []
      const weakSubjects: string[] = []

      for (const d of diagnostics) {
        const sc = d.scores as { weakTopics?: string[]; percentage?: number }
        if (sc.weakTopics) weakTopics.push(...sc.weakTopics)
        if (sc.percentage !== undefined && sc.percentage < 60) weakSubjects.push(d.subject)
      }

      // Low-scoring assignment submissions
      const lowScoreSubs = await prisma.assignmentSubmission.findMany({
        where: { studentId, score: { not: null, lt: 60 } },
        include: { assignment: { select: { title: true, type: true } } },
        orderBy: { submittedAt: 'desc' },
        take: 5,
      })

      return {
        studentId,
        studentName: m.student.name,
        weakTopics: [...new Set(weakTopics)].slice(0, 10),
        weakSubjects: [...new Set(weakSubjects)],
        lowScoreAssignments: lowScoreSubs.map(s => ({
          title: s.assignment.title,
          score: s.score,
        })),
        diagnosticCount: diagnostics.length,
      }
    })
  )

  res.json({ classId, className: cls.name, subject: cls.subject, students: analysis, availableSubjects: AVAILABLE_SUBJECTS })
})

// ── POST /api/smart-assignment/generate ──────────────────────────────────────

const GenerateSchema = z.object({
  classId: z.string(),
  subject: z.string(),
  questionCount: z.number().int().min(5).max(30).default(10),
  title: z.string().min(1).max(200).optional(),
})

router.post('/generate', verifyToken, requireRole('teacher', 'admin'), async (req, res) => {
  const parsed = GenerateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Неверные данные' }); return
  }

  const { classId, subject, questionCount } = parsed.data
  const userId = String(req.user!.userId)

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: { members: { include: { student: { select: { id: true, name: true } } } } },
  })
  if (!cls) { res.status(404).json({ error: 'Класс не найден' }); return }
  if (cls.teacherId !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Нет прав' }); return
  }

  // Collect weak topics across all students in class
  const allWeakTopics: string[] = []
  for (const m of cls.members) {
    const diagnostics = await prisma.diagnosticResult.findMany({
      where: { userId: m.studentId, subject },
      orderBy: { takenAt: 'desc' },
      take: 3,
    })
    for (const d of diagnostics) {
      const sc = d.scores as { weakTopics?: string[] }
      if (sc.weakTopics) allWeakTopics.push(...sc.weakTopics)
    }
  }

  // Count topic frequency — most common weak topics get more questions
  const topicFreq = new Map<string, number>()
  for (const t of allWeakTopics) {
    topicFreq.set(t, (topicFreq.get(t) ?? 0) + 1)
  }
  const sortedTopics = [...topicFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic)

  // ── Resolve the class's org so we can prefer the center's own content ────
  const cls2 = await prisma.class.findUnique({ where: { id: classId }, select: { orgId: true } })
  const studentOrgId = cls2?.orgId ?? null

  // Map free-form weak topics → canonical taxonomy IDs (drops unknowns).
  const weakTopicIds = weakTopicsToIds(sortedTopics, subject)

  // First try: pull questions from Content table (org's lessons + global).
  const fromContent = await pickQuestionsFromContent({
    subject,
    weakTopicIds,
    orgId: studentOrgId,
    count: questionCount,
  })

  type AssemblyQuestion = {
    id: string; text: string; options: string[]; correctAnswer: number
    explanation?: string; topic: string; subject: string
  }
  let questions: AssemblyQuestion[] = fromContent.map((q) => ({
    id: q.id, text: q.text, options: q.options, correctAnswer: q.correctAnswer,
    explanation: q.explanation, topic: q.topic, subject: q.subject,
  }))

  // Fallback: if Content didn't yield enough, top up from the legacy bank.
  if (questions.length < questionCount) {
    const need = questionCount - questions.length
    const fallback = getQuestionsForTopics(
      subject,
      sortedTopics.length > 0 ? sortedTopics : [subject],
      need,
    )
    questions = [...questions, ...fallback]
  }

  if (questions.length === 0) {
    res.status(422).json({ error: `Нет вопросов для предмета "${subject}". Доступные: ${AVAILABLE_SUBJECTS.join(', ')}` }); return
  }

  // Create assignment
  const title = parsed.data.title ?? `Персональное ДЗ: ${subject} (${new Date().toLocaleDateString('ru-RU')})`
  const assignment = await prisma.assignment.create({
    data: {
      classId,
      teacherId: userId,
      title,
      description: `Автоматически подобрано по слабым темам класса. Темы: ${sortedTopics.slice(0, 5).join(', ') || 'общие'}`,
      type: 'test',
      content: {
        questions: questions.map(q => ({ ...q })),
        personalized: true,
        weakTopics: sortedTopics.slice(0, 5),
        weakTopicIds,
        orgContentCount: fromContent.length,
        fallbackBankCount: Math.max(0, questions.length - fromContent.length),
      } as object,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
    },
  })

  res.status(201).json({
    assignment,
    meta: {
      questionsGenerated: questions.length,
      weakTopicsUsed: sortedTopics.slice(0, 5),
      weakTopicIds,
      studentsAnalyzed: cls.members.length,
      orgContentUsed: fromContent.length,
      fallbackBankUsed: Math.max(0, questions.length - fromContent.length),
    },
  })
})

export default router
