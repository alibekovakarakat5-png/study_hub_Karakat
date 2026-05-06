// ── Backfill topics for existing ent_lesson rows ────────────────────────────
//
// One-shot tagger that walks every ent_lesson Content row in the DB and
// fills `data.topics` if missing. Idempotent — rows that already have a
// non-empty topics array are skipped (unless --force).
//
// Usage:
//   cd server && npx tsx scripts/backfill-topics.ts          # write
//   cd server && npx tsx scripts/backfill-topics.ts --dry    # report only
//   cd server && npx tsx scripts/backfill-topics.ts --force  # re-tag everything
//
// Honours Groq rate limits with 6 s pause between calls.

import { prisma } from '../src/lib/prisma'
import { tagLessonTopics } from '../src/lib/topicTagger'

const dryRun = process.argv.includes('--dry')
const force = process.argv.includes('--force')

interface LessonData {
  subject?: string
  theory?: string
  topics?: string[]
}

async function main(): Promise<void> {
  const all = await prisma.content.findMany({
    where: { type: 'ent_lesson', active: true },
    orderBy: { createdAt: 'asc' },
  })
  console.log(`ent_lesson rows total: ${all.length}`)
  console.log(`mode: ${dryRun ? 'DRY-RUN' : 'WRITE'}${force ? ' (force)' : ''}\n`)

  let processed = 0
  let skipped = 0
  let failed = 0
  let updated = 0

  for (const row of all) {
    const d = row.data as LessonData | null
    const subject = d?.subject ?? ''
    const theory = d?.theory ?? ''
    const existingTopics = Array.isArray(d?.topics) ? d.topics : []

    if (!force && existingTopics.length > 0) {
      skipped++
      continue
    }
    if (!subject || theory.length < 200) {
      console.log(`  skip ${row.id}: missing subject or theory too short`)
      skipped++
      continue
    }

    processed++
    console.log(`→ ${row.id} (${subject}): tagging ${theory.length} chars…`)

    let topics: string[] = []
    try {
      topics = await tagLessonTopics(theory, subject)
    } catch (err) {
      console.error(`  fail ${row.id}: ${err instanceof Error ? err.message : 'unknown'}`)
      failed++
      continue
    }

    console.log(`  → topics: [${topics.join(', ')}]`)

    if (topics.length === 0) {
      skipped++
      continue
    }

    if (!dryRun) {
      const newData = { ...(d ?? {}), topics } as Record<string, unknown>
      await prisma.content.update({ where: { id: row.id }, data: { data: newData as never } })
      updated++
    }

    // Throttle to stay within Groq free-tier TPM limits.
    await new Promise((r) => setTimeout(r, 6000))
  }

  console.log(`\nDone. processed=${processed} updated=${updated} skipped=${skipped} failed=${failed}`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
