// ── Export untagged ent_lesson rows to JSON ─────────────────────────────────
//
// Writes every ent_lesson Content row that has no topics yet (or all, with
// --force) to .cache/untagged-lessons.json so Claude can classify them in
// the chat and produce a mapping for apply-tags.ts.
//
// Output shape: Array<{ id, subject, moduleTitle, title, theoryExcerpt }>
//
// Usage:
//   cd server && npx tsx scripts/export-untagged.ts
//   cd server && npx tsx scripts/export-untagged.ts --force --limit=200

import fs from 'fs/promises'
import path from 'path'
import { prisma } from '../src/lib/prisma'

const force = process.argv.includes('--force')
const limitArg = process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1]
const limit = limitArg ? Number(limitArg) : 999

interface LessonData {
  subject?: string
  title?: string
  moduleTitle?: string
  theory?: string
  topics?: string[]
}

async function main(): Promise<void> {
  const all = await prisma.content.findMany({
    where: { type: 'ent_lesson', active: true },
    orderBy: { createdAt: 'asc' },
  })

  const untagged = all
    .filter((row) => {
      const d = row.data as LessonData | null
      const t = Array.isArray(d?.topics) ? d.topics : []
      return force ? true : t.length === 0
    })
    .slice(0, limit)
    .map((row) => {
      const d = row.data as LessonData | null
      const theory = d?.theory ?? ''
      return {
        id: row.id,
        subject: d?.subject ?? 'unknown',
        moduleTitle: d?.moduleTitle ?? '',
        title: d?.title ?? '',
        // 600 chars is plenty for taxonomy classification
        theoryExcerpt: theory.slice(0, 600),
      }
    })

  const outPath = path.resolve(process.cwd(), '.cache/untagged-lessons.json')
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, JSON.stringify(untagged, null, 2), 'utf-8')

  console.log(`Exported ${untagged.length} untagged lessons (of ${all.length} total) to ${outPath}`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
