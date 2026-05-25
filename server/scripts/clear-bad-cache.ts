// Delete cached lessons that contain tautological questions
// (answer text duplicates question text).
import { prisma } from '../src/lib/prisma'

function looksTautological(lesson: unknown): boolean {
  type Q = { text?: string; options?: string[]; correctAnswer?: number }
  type L = { quiz?: Q[] }
  const l = lesson as L
  if (!Array.isArray(l?.quiz)) return false
  for (const q of l.quiz) {
    if (!q.text || !Array.isArray(q.options) || typeof q.correctAnswer !== 'number') continue
    const ans = (q.options[q.correctAnswer] ?? '')
      .replace(/^[A-DА-Г]\)\s*/, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .toLowerCase()
      .trim()
    const qt = q.text.replace(/[^\p{L}\p{N}\s]/gu, ' ').toLowerCase()
    const ansWords = ans.split(/\s+/).filter(w => w.length > 2)
    if (ansWords.length > 0 && ansWords.every(w => qt.includes(w))) return true
  }
  return false
}

;(async () => {
  const all = await prisma.aILessonCache.findMany()
  let bad = 0
  for (const c of all) {
    if (looksTautological(c.lesson)) {
      console.log(`✗ Dropping bad cache: "${c.topicOriginal}" (${c.subject}/${c.difficulty})`)
      await prisma.aILessonCache.delete({ where: { id: c.id } })
      bad++
    }
  }
  console.log(`\nTotal cached: ${all.length}, dropped bad: ${bad}, kept: ${all.length - bad}`)
  await prisma.$disconnect()
})()
