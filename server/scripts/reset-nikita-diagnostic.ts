// Wipe all of Никита's fake diagnostic + study plan data so he can start fresh
import { prisma } from '../src/lib/prisma'

;(async () => {
  const nikita = await prisma.user.findUnique({ where: { email: 'nikita@studyhub.kz' } })
  if (!nikita) { console.log('Никита не найден'); process.exit(1) }

  const d = await prisma.diagnosticResult.deleteMany({ where: { userId: nikita.id } })
  const p = await prisma.studyPlan.deleteMany({ where: { userId: nikita.id } })
  const m = await prisma.moduleProgress.deleteMany({ where: { userId: nikita.id } })
  const s = await prisma.assignmentSubmission.deleteMany({ where: { studentId: nikita.id } })

  console.log(`✓ Диагностики удалено: ${d.count}`)
  console.log(`✓ Учебных планов: ${p.count}`)
  console.log(`✓ Прогресса модулей: ${m.count}`)
  console.log(`✓ Сабмишенов заданий: ${s.count}`)

  await prisma.$disconnect()
})()
