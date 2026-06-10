import { prisma } from '../src/lib/prisma'
import { isTautologicalQuestion } from '../src/lib/growthAI'

// Cache health inspector: scans every cached lesson and reports any whose quiz
// the tautology heuristic would gut (flagged > half). A clean run means no
// cached lesson will be silently dropped & regenerated on read.
;(async () => {
  const rows = await prisma.aILessonCache.findMany({
    select: { topicKey: true, subject: true, lesson: true, hitCount: true },
  })
  let problems = 0
  let ru = 0, kk = 0
  for (const r of rows) {
    const isKk = r.topicKey.startsWith('kk:')
    isKk ? kk++ : ru++
    const quiz = ((r.lesson as any)?.quiz ?? []) as any[]
    const bad = quiz.filter((q) => isTautologicalQuestion(q.text, q.options, q.correctAnswer)).length
    const floor = Math.floor(quiz.length / 2)
    if (bad > floor) {
      problems++
      console.log(`⚠ WOULD GUT  [${isKk ? 'kk' : 'ru'}] ${r.subject} ${r.topicKey.slice(0, 44)} | q=${quiz.length} flagged=${bad}`)
    }
  }
  console.log(`\nScanned ${rows.length} cached lessons (ru=${ru}, kk=${kk}). Problem entries: ${problems}.`)
  console.log(problems === 0 ? '✅ All cached quizzes survive the tautology filter.' : '❌ Some quizzes would be wrongly gutted.')
  process.exit(0)
})().catch((e) => { console.error(e); process.exit(1) })
