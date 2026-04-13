// ── Reports Routes — HTML reports for center managers ──────────────────────────
//
// GET /api/orgs/:id/reports/weekly?week=2026-W16
// GET /api/orgs/:id/reports/monthly?month=2026-04
// GET /api/orgs/:id/reports/student/:studentId

import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { verifyToken } from '../middleware/auth'

const router = Router()

// ── Helpers ──────────────────────────────────────────────────────────────────

function getWeekRange(weekStr: string): { start: Date; end: Date } | null {
  // "2026-W16" → ISO week
  const m = weekStr.match(/^(\d{4})-W(\d{1,2})$/)
  if (!m) return null
  const year = parseInt(m[1]!)
  const week = parseInt(m[2]!)
  // ISO week 1 = week with the first Thursday
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const start = new Date(jan4)
  start.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function getMonthRange(monthStr: string): { start: Date; end: Date } | null {
  const m = monthStr.match(/^(\d{4})-(\d{2})$/)
  if (!m) return null
  const year = parseInt(m[1]!)
  const month = parseInt(m[2]!) - 1
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

async function authOrgOwner(orgId: string, userId: string, userRole: string) {
  const org = await prisma.organization.findUnique({ where: { id: orgId } })
  if (!org) return null
  if (org.ownerId !== userId && userRole !== 'admin') return null
  return org
}

async function buildReportData(orgId: string, start: Date, end: Date) {
  // Get all teacher IDs in org
  const memberships = await prisma.orgMembership.findMany({
    where: { orgId },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  const teacherIds = memberships.map((m) => m.userId)

  // Assignments created in period
  const assignments = await prisma.assignment.findMany({
    where: { teacherId: { in: teacherIds }, createdAt: { gte: start, lte: end } },
    include: {
      class: { select: { name: true } },
      teacher: { select: { name: true } },
      submissions: { select: { score: true, studentId: true } },
    },
  })

  // Submissions in period
  const submissions = await prisma.assignmentSubmission.findMany({
    where: {
      assignment: { teacherId: { in: teacherIds } },
      submittedAt: { gte: start, lte: end },
    },
    include: {
      student: { select: { id: true, name: true } },
      assignment: { select: { title: true, type: true, classId: true } },
    },
  })

  // All students in org's classes
  const allClasses = await prisma.class.findMany({
    where: { teacherId: { in: teacherIds } },
    include: { _count: { select: { members: true } } },
  })

  const totalStudents = allClasses.reduce((s, c) => s + (c as typeof c & { _count: { members: number } })._count.members, 0)
  const scores = submissions.filter(s => s.score !== null).map(s => s.score!)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

  // Per-teacher breakdown
  const teacherStats = memberships.map((m) => {
    const tAssignments = assignments.filter(a => a.teacherId === m.userId)
    const tSubmissions = submissions.filter(s => s.assignment.classId && tAssignments.some(a => a.classId === s.assignment.classId))
    const tScores = tSubmissions.filter(s => s.score !== null).map(s => s.score!)
    const tAvg = tScores.length > 0 ? Math.round(tScores.reduce((a, b) => a + b, 0) / tScores.length) : null

    return {
      name: m.user.name,
      assignmentCount: tAssignments.length,
      submissionCount: tSubmissions.length,
      avgScore: tAvg,
    }
  })

  // Per-student top/bottom
  const studentMap = new Map<string, { name: string; count: number; scoreSum: number; scoreN: number }>()
  for (const sub of submissions) {
    const prev = studentMap.get(sub.studentId) ?? { name: sub.student.name, count: 0, scoreSum: 0, scoreN: 0 }
    prev.count++
    if (sub.score !== null) { prev.scoreSum += sub.score; prev.scoreN++ }
    studentMap.set(sub.studentId, prev)
  }
  const studentStats = Array.from(studentMap.values())
    .map(s => ({ ...s, avgScore: s.scoreN > 0 ? Math.round(s.scoreSum / s.scoreN) : null }))
    .sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0))

  return {
    totalTeachers: memberships.length,
    totalStudents,
    totalAssignments: assignments.length,
    totalSubmissions: submissions.length,
    avgScore,
    teacherStats,
    studentStats,
  }
}

function renderHTML(orgName: string, period: string, data: Awaited<ReturnType<typeof buildReportData>>): string {
  const teacherRows = data.teacherStats.map(t =>
    `<tr><td>${t.name}</td><td>${t.assignmentCount}</td><td>${t.submissionCount}</td><td>${t.avgScore ?? '—'}</td></tr>`
  ).join('')

  const studentRows = data.studentStats.slice(0, 50).map(s =>
    `<tr><td>${s.name}</td><td>${s.count}</td><td>${s.avgScore ?? '—'}</td></tr>`
  ).join('')

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Отчёт — ${orgName}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  .period { color: #64748b; margin-bottom: 24px; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
  .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
  .stat-value { font-size: 28px; font-weight: 700; color: #6366f1; }
  .stat-label { font-size: 13px; color: #64748b; margin-top: 4px; }
  h2 { font-size: 18px; margin: 24px 0 12px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
  th { background: #f1f5f9; font-weight: 600; font-size: 13px; text-transform: uppercase; color: #64748b; }
  .footer { margin-top: 32px; color: #94a3b8; font-size: 12px; text-align: center; }
  @media print { body { padding: 20px; } .stats { grid-template-columns: repeat(4, 1fr); } }
</style>
</head>
<body>
  <h1>${orgName}</h1>
  <p class="period">${period} &bull; Сформирован: ${new Date().toLocaleDateString('ru-RU')}</p>

  <div class="stats">
    <div class="stat"><div class="stat-value">${data.totalTeachers}</div><div class="stat-label">Преподавателей</div></div>
    <div class="stat"><div class="stat-value">${data.totalStudents}</div><div class="stat-label">Учеников</div></div>
    <div class="stat"><div class="stat-value">${data.totalAssignments}</div><div class="stat-label">Заданий</div></div>
    <div class="stat"><div class="stat-value">${data.avgScore ?? '—'}</div><div class="stat-label">Средний балл</div></div>
  </div>

  <h2>Преподаватели</h2>
  <table>
    <thead><tr><th>Имя</th><th>Заданий</th><th>Сдано</th><th>Средний балл</th></tr></thead>
    <tbody>${teacherRows || '<tr><td colspan="4">Нет данных</td></tr>'}</tbody>
  </table>

  <h2>Ученики (топ-50)</h2>
  <table>
    <thead><tr><th>Имя</th><th>Сдано</th><th>Средний балл</th></tr></thead>
    <tbody>${studentRows || '<tr><td colspan="3">Нет данных</td></tr>'}</tbody>
  </table>

  <div class="footer">ESEP — Цифровая образовательная платформа</div>
</body>
</html>`
}

// ── GET /api/orgs/:id/reports/weekly ─────────────────────────────────────────

router.get('/:id/reports/weekly', verifyToken, async (req, res) => {
  const orgId = String(req.params['id'])
  const userId = String(req.user!.userId)
  const weekStr = String(req.query['week'] ?? '')

  const org = await authOrgOwner(orgId, userId, req.user!.role)
  if (!org) { res.status(403).json({ error: 'Нет доступа' }); return }

  const range = getWeekRange(weekStr)
  if (!range) { res.status(400).json({ error: 'Формат: 2026-W16' }); return }

  const data = await buildReportData(orgId, range.start, range.end)
  const html = renderHTML(org.name, `Неделя ${weekStr}`, data)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(html)
})

// ── GET /api/orgs/:id/reports/monthly ────────────────────────────────────────

router.get('/:id/reports/monthly', verifyToken, async (req, res) => {
  const orgId = String(req.params['id'])
  const userId = String(req.user!.userId)
  const monthStr = String(req.query['month'] ?? '')

  const org = await authOrgOwner(orgId, userId, req.user!.role)
  if (!org) { res.status(403).json({ error: 'Нет доступа' }); return }

  const range = getMonthRange(monthStr)
  if (!range) { res.status(400).json({ error: 'Формат: 2026-04' }); return }

  const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
  const data = await buildReportData(orgId, range.start, range.end)
  const html = renderHTML(org.name, `${months[range.start.getMonth()]} ${range.start.getFullYear()}`, data)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(html)
})

// ── GET /api/orgs/:id/reports/student/:studentId ─────────────────────────────

router.get('/:id/reports/student/:studentId', verifyToken, async (req, res) => {
  const orgId = String(req.params['id'])
  const studentId = String(req.params['studentId'])
  const userId = String(req.user!.userId)

  const org = await authOrgOwner(orgId, userId, req.user!.role)
  if (!org) { res.status(403).json({ error: 'Нет доступа' }); return }

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { id: true, name: true, email: true, grade: true },
  })
  if (!student) { res.status(404).json({ error: 'Ученик не найден' }); return }

  // All submissions
  const submissions = await prisma.assignmentSubmission.findMany({
    where: { studentId },
    include: {
      assignment: { select: { title: true, type: true, class: { select: { name: true, subject: true } }, createdAt: true } },
    },
    orderBy: { submittedAt: 'desc' },
    take: 50,
  })

  // Diagnostic results
  const diagnostics = await prisma.diagnosticResult.findMany({
    where: { userId: studentId },
    orderBy: { takenAt: 'desc' },
    take: 20,
  })

  const scores = submissions.filter(s => s.score !== null).map(s => s.score!)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

  // Find weak topics from diagnostics
  const weakTopics: string[] = []
  for (const d of diagnostics) {
    const sc = d.scores as { weakTopics?: string[] }
    if (sc.weakTopics) weakTopics.push(...sc.weakTopics)
  }
  const uniqueWeak = [...new Set(weakTopics)].slice(0, 10)

  const subRows = submissions.map(s =>
    `<tr><td>${s.assignment.title}</td><td>${s.assignment.class?.name ?? '—'}</td><td>${s.score ?? '—'}</td><td>${new Date(s.submittedAt).toLocaleDateString('ru-RU')}</td></tr>`
  ).join('')

  const diagRows = diagnostics.map(d => {
    const sc = d.scores as { percentage?: number; level?: string }
    return `<tr><td>${d.subject}</td><td>${sc.percentage ?? '—'}%</td><td>${sc.level ?? '—'}</td><td>${new Date(d.takenAt).toLocaleDateString('ru-RU')}</td></tr>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Отчёт ученика — ${student.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  .sub { color: #64748b; margin-bottom: 24px; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
  .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
  .stat-value { font-size: 28px; font-weight: 700; color: #6366f1; }
  .stat-label { font-size: 13px; color: #64748b; margin-top: 4px; }
  h2 { font-size: 18px; margin: 24px 0 12px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
  th { background: #f1f5f9; font-weight: 600; font-size: 13px; text-transform: uppercase; color: #64748b; }
  .weak { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
  .weak span { background: #fef2f2; color: #dc2626; padding: 4px 12px; border-radius: 20px; font-size: 13px; }
  .footer { margin-top: 32px; color: #94a3b8; font-size: 12px; text-align: center; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <h1>${student.name}</h1>
  <p class="sub">${student.email} &bull; ${student.grade ? student.grade + ' класс' : ''} &bull; ${org.name}</p>

  <div class="stats">
    <div class="stat"><div class="stat-value">${submissions.length}</div><div class="stat-label">Заданий сдано</div></div>
    <div class="stat"><div class="stat-value">${avgScore ?? '—'}</div><div class="stat-label">Средний балл</div></div>
    <div class="stat"><div class="stat-value">${diagnostics.length}</div><div class="stat-label">Диагностик</div></div>
  </div>

  ${uniqueWeak.length > 0 ? `<h2>Слабые темы</h2><div class="weak">${uniqueWeak.map(t => `<span>${t}</span>`).join('')}</div>` : ''}

  <h2>Задания</h2>
  <table>
    <thead><tr><th>Задание</th><th>Класс</th><th>Балл</th><th>Дата</th></tr></thead>
    <tbody>${subRows || '<tr><td colspan="4">Нет данных</td></tr>'}</tbody>
  </table>

  <h2>Диагностика</h2>
  <table>
    <thead><tr><th>Предмет</th><th>Результат</th><th>Уровень</th><th>Дата</th></tr></thead>
    <tbody>${diagRows || '<tr><td colspan="4">Нет данных</td></tr>'}</tbody>
  </table>

  <div class="footer">ESEP — Цифровая образовательная платформа</div>
</body>
</html>`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(html)
})

export default router
