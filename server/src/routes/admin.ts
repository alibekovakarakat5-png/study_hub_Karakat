import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { verifyToken, requireRole } from '../middleware/auth'

const router = Router()

// ── GET /api/admin/stats ──────────────────────────────────────────────────────

router.get('/stats', verifyToken, requireRole('admin'), async (_req, res) => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Last 7 days for registrations chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayStart)
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const [
    totalUsers,
    premiumUsers,
    activeToday,
    totalEntResults,
    totalStudyPlans,
    usersByRole,
    usersByGrade,
    usersByCity,
    usersByUniversity,
    usersBySpecialty,
    regsByDay,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isPremium: true } }),
    prisma.user.count({ where: { lastActiveDate: { gte: todayStart.toISOString() } } }),
    prisma.entResult.count(),
    prisma.studyPlan.count(),

    prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
    prisma.user.groupBy({
      by: ['grade'],
      where: { grade: { not: null } },
      _count: { id: true },
      orderBy: { grade: 'asc' },
    }),
    prisma.user.groupBy({
      by: ['city'],
      where: { city: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 6,
    }),
    prisma.user.groupBy({
      by: ['targetUniversity'],
      where: { targetUniversity: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    prisma.user.groupBy({
      by: ['targetSpecialty'],
      where: { targetSpecialty: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),

    // Registrations per day for last 7 days
    Promise.all(
      last7.map(async (dayStart) => {
        const dayEnd = new Date(dayStart)
        dayEnd.setDate(dayEnd.getDate() + 1)
        const count = await prisma.user.count({
          where: { createdAt: { gte: dayStart, lt: dayEnd } },
        })
        const label = `${String(dayStart.getDate()).padStart(2, '0')}.${String(dayStart.getMonth() + 1).padStart(2, '0')}`
        return { date: label, count }
      })
    ),
  ])

  res.json({
    totalUsers,
    premiumUsers,
    activeToday,
    totalEntResults,
    totalStudyPlans,
    usersByRole: usersByRole.map(r => ({ role: r.role, count: r._count.id })),
    usersByGrade: usersByGrade.map(g => ({ grade: `${g.grade} кл.`, count: g._count.id })),
    usersByCity: usersByCity.map(c => ({ city: c.city as string, count: c._count.id })),
    topUniversities: usersByUniversity.map(u => ({
      name: u.targetUniversity as string,
      count: u._count.id,
    })),
    topSpecialties: usersBySpecialty.map(s => ({
      name: s.targetSpecialty as string,
      count: s._count.id,
    })),
    registrationsByDay: regsByDay,
  })
})

export default router
