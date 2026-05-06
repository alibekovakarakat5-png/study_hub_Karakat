// ── Apply Claude-produced topic tags to ent_lesson rows ─────────────────────
//
// Reads a JSON mapping `{ <contentId>: ["topic-id-1", "topic-id-2"] }` from
// .cache/lesson-tags.json (or path passed as first arg) and writes each
// array into Content.data.topics. Validates every topic ID against the
// canonical taxonomy — unknown IDs are dropped.
//
// Usage:
//   cd server && npx tsx scripts/apply-tags.ts
//   cd server && npx tsx scripts/apply-tags.ts path/to/mapping.json
//   cd server && npx tsx scripts/apply-tags.ts --dry  (just report)

import fs from 'fs/promises'
import path from 'path'
import { prisma } from '../src/lib/prisma'
import { isValidTopicId, TOPIC_TAXONOMY } from '../src/data/topicTaxonomy'

const dryRun = process.argv.includes('--dry')
const inputArg = process.argv.find((a) => !a.startsWith('--') && a.endsWith('.json'))
const inputPath = inputArg
  ? path.resolve(process.cwd(), inputArg)
  : path.resolve(process.cwd(), '.cache/lesson-tags.json')

interface LessonData {
  subject?: string
  topics?: string[]
  [k: string]: unknown
}

async function main(): Promise<void> {
  const raw = await fs.readFile(inputPath, 'utf-8')
  const mapping = JSON.parse(raw) as Record<string, string[]>

  const ids = Object.keys(mapping)
  console.log(`Loaded ${ids.length} mappings from ${inputPath}`)
  console.log(`mode: ${dryRun ? 'DRY-RUN' : 'WRITE'}\n`)

  let updated = 0
  let skippedNotFound = 0
  let skippedEmpty = 0
  let skippedNoSubject = 0
  let droppedTotal = 0

  for (const id of ids) {
    const proposed = (mapping[id] ?? []).filter((x) => typeof x === 'string')
    const row = await prisma.content.findUnique({ where: { id } })
    if (!row) {
      console.log(`  skip ${id}: not found in DB`)
      skippedNotFound++
      continue
    }
    if (row.type !== 'ent_lesson') {
      console.log(`  skip ${id}: type=${row.type}, not ent_lesson`)
      skippedNotFound++
      continue
    }

    const data = (row.data as LessonData | null) ?? {}
    const subject = data.subject

    // Filter against taxonomy (drop hallucinated/typo'd ids) AND subject scope
    const valid = proposed
      .map((s) => s.trim())
      .filter(isValidTopicId)
      .filter((tid) => !subject || TOPIC_TAXONOMY.find((t) => t.id === tid)?.subject === subject)
    const cleaned = [...new Set(valid)]
    droppedTotal += proposed.length - cleaned.length

    if (cleaned.length === 0) {
      console.log(`  skip ${id}: no valid topics after filter (proposed: ${JSON.stringify(proposed)})`)
      skippedEmpty++
      continue
    }
    if (!subject) {
      console.log(`  skip ${id}: lesson has no subject`)
      skippedNoSubject++
      continue
    }

    console.log(`✓ ${id} (${subject}): [${cleaned.join(', ')}]`)
    if (!dryRun) {
      const newData = { ...data, topics: cleaned } as Record<string, unknown>
      await prisma.content.update({ where: { id }, data: { data: newData as never } })
      updated++
    }
  }

  console.log(`\nDone. updated=${updated}  skippedNotFound=${skippedNotFound}  skippedEmpty=${skippedEmpty}  skippedNoSubject=${skippedNoSubject}  droppedHallucinations=${droppedTotal}`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
