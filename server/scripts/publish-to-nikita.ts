// Publish a few math lessons from Каракат's library into Никита's class,
// so the student demo flow (read lesson → quiz → graded) works out of the box.
import { prisma } from '../src/lib/prisma'

const WANT = ['Квадратные уравнения', 'Производная', 'Проценты']  // title keywords

;(async () => {
  const teacher = await prisma.user.findUnique({ where: { email: 'alibekovakarakat5@gmail.com' } })
  if (!teacher) { console.log('Каракат не найдена'); process.exit(1) }
  const cls = await prisma.class.findFirst({ where: { teacherId: teacher.id }, orderBy: { createdAt: 'asc' } })
  if (!cls) { console.log('Класс не найден'); process.exit(1) }

  const drafts = await prisma.teacherLessonDraft.findMany({ where: { teacherId: teacher.id } })

  let published = 0
  for (const kw of WANT) {
    const d = drafts.find(x => x.title.includes(kw))
    if (!d) { console.log(`— нет черновика «${kw}»`); continue }
    const lesson = d.lesson as { theory: string; keyFormulas?: unknown[]; quiz: unknown[] }
    // Skip if already published with this title in the class
    const exists = await prisma.assignment.findFirst({ where: { classId: cls.id, title: d.title } })
    if (exists) { console.log(`= уже опубликован: ${d.title}`); continue }
    const a = await prisma.assignment.create({
      data: {
        classId: cls.id, teacherId: teacher.id, orgId: cls.orgId,
        title: d.title, description: `AI-урок. Тема: ${d.topic.slice(0, 180)}`,
        type: 'reading',
        content: { theory: lesson.theory, keyFormulas: lesson.keyFormulas ?? [], quiz: lesson.quiz, isLesson: true },
      },
    })
    await prisma.teacherLessonDraft.update({ where: { id: d.id }, data: { publishedAssignmentId: a.id } })
    console.log(`✓ опубликован: ${d.title}`)
    published++
  }

  console.log(`\n✅ В класс "${cls.name}" опубликовано уроков: ${published}`)
  await prisma.$disconnect()
})().catch(e => { console.error(e); process.exit(1) })
