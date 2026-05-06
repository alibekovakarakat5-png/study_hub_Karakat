// ── Content question picker ─────────────────────────────────────────────────
//
// Pick quiz questions from ent_lesson Content rows whose data.topics
// intersects with the requested weakTopicIds. Orders by:
//   1. Lessons in the student's org (org-scoped come first)
//   2. Global lessons (orgId IS NULL) — platform default content
// Within each tier, pick questions from up to N lessons, distributing
// across topics proportionally.

import { prisma } from './prisma'

export interface PickedQuestion {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation?: string
  topic: string          // resolved to whichever taxonomy ID the lesson covers
  subject: string
  /** Source lesson Content.id — useful for analytics + dedupe across calls */
  sourceLessonId: string
  /** 'org' if from caller's center, 'global' if platform content, 'ai' for fresh Groq generation (Task 12). */
  source: 'org' | 'global' | 'ai'
}

interface PickInput {
  subject: string
  weakTopicIds: string[]
  orgId: string | null   // student's org. null = no org → only global content
  count: number
}

interface LessonRow {
  id: string
  orgId: string | null
  data: {
    subject?: string
    topics?: string[]
    quiz?: Array<{ q?: string; options?: string[]; correct?: number; explanation?: string }>
  }
}

export async function pickQuestionsFromContent({
  subject, weakTopicIds, orgId, count,
}: PickInput): Promise<PickedQuestion[]> {
  if (count <= 0) return []
  if (weakTopicIds.length === 0) return []

  // Fetch candidates: ent_lesson rows in subject, where (orgId = student's org OR null)
  const orFilters: Array<Record<string, unknown>> = [{ orgId: null }]
  if (orgId) orFilters.push({ orgId })

  const candidates = (await prisma.content.findMany({
    where: { type: 'ent_lesson', active: true, OR: orFilters },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })) as unknown as LessonRow[]

  // Filter by subject + topic intersection
  const matched = candidates.filter((row) => {
    const data = row.data
    if (data?.subject !== subject) return false
    const t = Array.isArray(data?.topics) ? data.topics : []
    if (t.length === 0) return false
    return t.some((id) => weakTopicIds.includes(id))
  })

  // Org-first ordering: rows whose orgId === orgId argument come before global.
  const orgRows = orgId ? matched.filter((r) => r.orgId === orgId) : []
  const globalRows = matched.filter((r) => r.orgId === null)
  const ordered = [...orgRows, ...globalRows]

  // Walk lessons in priority order, take up to 2 questions per lesson, until
  // we have `count` questions or exhausted matches.
  const picked: PickedQuestion[] = []
  const seenIds = new Set<string>()
  const PER_LESSON_CAP = 2

  for (const row of ordered) {
    if (picked.length >= count) break
    const quiz = Array.isArray(row.data.quiz) ? row.data.quiz : []
    let takenFromThis = 0
    for (let qIdx = 0; qIdx < quiz.length && takenFromThis < PER_LESSON_CAP; qIdx++) {
      if (picked.length >= count) break
      const q = quiz[qIdx]!
      if (typeof q.q !== 'string' || !Array.isArray(q.options) || q.options.length !== 4) continue
      if (typeof q.correct !== 'number') continue
      const id = `content-${row.id}-${qIdx}`
      if (seenIds.has(id)) continue
      seenIds.add(id)
      const matchingTopic = (row.data.topics ?? []).find((t) => weakTopicIds.includes(t)) ?? weakTopicIds[0]!
      picked.push({
        id,
        text: q.q,
        options: q.options,
        correctAnswer: q.correct,
        explanation: typeof q.explanation === 'string' ? q.explanation : undefined,
        topic: matchingTopic,
        subject,
        sourceLessonId: row.id,
        source: row.orgId === orgId && orgId !== null ? 'org' : 'global',
      })
      takenFromThis++
    }
  }

  return picked
}
