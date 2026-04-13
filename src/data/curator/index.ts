// This file combines all subject content into a single export
// Individual subject files contain the detailed topic content

import type { TopicContent, ContentLanguage } from '@/types/curator'
import { mathTopics } from './math'
import { historyTopics } from './history'
import { physicsTopics } from './physics'
import { englishTopics } from './english'
import { chemistryTopics } from './chemistry'
import { biologyTopics } from './biology'

// ── Kazakh (қазақ тілі) content ──────────────────────────────────────────────
import { mathTopicsKk } from './mathKk'
import { historyTopicsKk } from './historyKk'
import { physicsTopicsKk } from './physicsKk'
import { biologyTopicsKk } from './biologyKk'
import { chemistryTopicsKk } from './chemistryKk'

export const allCuratorContent: TopicContent[] = [
  ...mathTopics,
  ...historyTopics,
  ...physicsTopics,
  ...englishTopics,
  ...chemistryTopics,
  ...biologyTopics,
  // Kazakh content
  ...mathTopicsKk,
  ...historyTopicsKk,
  ...physicsTopicsKk,
  ...biologyTopicsKk,
  ...chemistryTopicsKk,
]

/** Filter content by language. Topics without language field are treated as 'ru'. */
export function getContentByLanguage(lang: ContentLanguage): TopicContent[] {
  return allCuratorContent.filter(t => (t.language ?? 'ru') === lang)
}

/** Get all available languages for a subject */
export function getLanguagesForSubject(subject: string): ContentLanguage[] {
  const langs = new Set<ContentLanguage>()
  for (const t of allCuratorContent) {
    if (t.subject === subject) langs.add(t.language ?? 'ru')
  }
  return [...langs]
}

export {
  mathTopics,
  historyTopics,
  physicsTopics,
  englishTopics,
  chemistryTopics,
  biologyTopics,
  mathTopicsKk,
  historyTopicsKk,
  physicsTopicsKk,
  biologyTopicsKk,
  chemistryTopicsKk,
}
