// Wipe lesson cache + Каракат's drafts so fresh Claude-generated ones replace them
import { prisma } from '../src/lib/prisma'

;(async () => {
  const teacher = await prisma.user.findUnique({ where: { email: 'alibekovakarakat5@gmail.com' } })
  if (!teacher) { console.log('Teacher not found'); process.exit(1) }

  const c = await prisma.aILessonCache.deleteMany({})
  const d = await prisma.teacherLessonDraft.deleteMany({ where: { teacherId: teacher.id } })
  const a = await prisma.assignment.deleteMany({ where: { teacherId: teacher.id, type: 'reading' } })

  console.log(`✓ Cache cleared:        ${c.count} lessons`)
  console.log(`✓ Drafts deleted:       ${d.count}`)
  console.log(`✓ Reading assignments:  ${a.count}`)
  console.log(`\nReady to re-generate via Claude CLI.`)

  await prisma.$disconnect()
})()
