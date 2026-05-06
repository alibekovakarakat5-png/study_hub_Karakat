// ── Topic matcher ───────────────────────────────────────────────────────────
//
// Map free-form Russian weakTopics strings (as they appear in
// DiagnosticResult.scores.weakTopics) to canonical taxonomy IDs.
// Pure functions — no I/O — so they're trivial to unit-test.

import { TOPIC_TAXONOMY } from '../data/topicTaxonomy'

/**
 * Map an array of free-form Russian weakTopics to canonical topic IDs from
 * the taxonomy, scoped to a subject. Performs case-insensitive trimmed
 * exact match first, then falls back to substring containment in either
 * direction (label includes weakTopic or weakTopic includes label).
 *
 * Returns deduplicated IDs. Unknown topics are silently dropped — never
 * throws — so the caller can pipe DiagnosticResult content directly in.
 */
export function weakTopicsToIds(weakTopics: string[], subject: string): string[] {
  const subjectTopics = TOPIC_TAXONOMY.filter((t) => t.subject === subject)
  const seen = new Set<string>()
  const result: string[] = []

  for (const raw of weakTopics) {
    const norm = raw.trim().toLowerCase()
    if (!norm) continue

    // Exact match first
    let hit = subjectTopics.find((t) => t.label_ru.toLowerCase() === norm)
    // Substring containment (either direction)
    if (!hit) {
      hit = subjectTopics.find((t) => {
        const label = t.label_ru.toLowerCase()
        return label.includes(norm) || norm.includes(label)
      })
    }
    if (hit && !seen.has(hit.id)) {
      seen.add(hit.id)
      result.push(hit.id)
    }
  }

  return result
}

/** True if the two id arrays share at least one element. */
export function topicsIntersect(a: readonly string[], b: readonly string[]): boolean {
  if (a.length === 0 || b.length === 0) return false
  const setA = new Set(a)
  for (const id of b) if (setA.has(id)) return true
  return false
}
