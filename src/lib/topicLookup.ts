import type { Subject } from '@/types'
import type { TopicContent } from '@/types/curator'
import { curatorContent } from '@/data/curatorContent'

/**
 * Exact match: find TopicContent by subject + topic name.
 */
export function findTopicContent(
  subject: Subject,
  topicName: string,
): TopicContent | null {
  const normalized = topicName.trim().toLowerCase()
  return (
    curatorContent.find(
      (t) => t.subject === subject && t.topic.trim().toLowerCase() === normalized,
    ) ?? null
  )
}

/**
 * Fuzzy match: find TopicContent using substring matching.
 * Handles cases like task title "Логарифмы — Теория" matching topic "Логарифмы".
 */
export function findTopicContentFuzzy(
  subject: Subject,
  searchText: string,
): TopicContent | null {
  const normalized = searchText.trim().toLowerCase()
  const subjectTopics = curatorContent.filter((t) => t.subject === subject)

  // 1. Exact match
  const exact = subjectTopics.find(
    (t) => t.topic.trim().toLowerCase() === normalized,
  )
  if (exact) return exact

  // 2. Topic name is contained in searchText
  const contained = subjectTopics.find((t) =>
    normalized.includes(t.topic.trim().toLowerCase()),
  )
  if (contained) return contained

  // 3. searchText is contained in topic name
  const reverse = subjectTopics.find((t) =>
    t.topic.trim().toLowerCase().includes(normalized),
  )
  return reverse ?? null
}

/**
 * Given weak topic names from diagnostic/ENT results, return matching content.
 */
export function findWeakTopicContent(
  subject: Subject,
  weakTopicNames: string[],
): TopicContent[] {
  return weakTopicNames
    .map((name) => findTopicContentFuzzy(subject, name))
    .filter((t): t is TopicContent => t !== null)
}
