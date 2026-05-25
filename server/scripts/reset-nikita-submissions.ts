// Delete Никита's submissions so we can re-test the auto-grading
import { prisma } from '../src/lib/prisma'

;(async () => {
  const nikita = await prisma.user.findUnique({ where: { email: 'nikita@studyhub.kz' } })
  if (!nikita) { console.log('Никита не найден'); process.exit(1) }
  const r = await prisma.assignmentSubmission.deleteMany({ where: { studentId: nikita.id } })
  console.log(`Удалено сабмишенов: ${r.count}`)
  await prisma.$disconnect()
})()
