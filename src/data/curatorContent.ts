import type { TopicContent, ContentLanguage } from '@/types/curator'
import { mathTopics } from './curator/math'
import { historyTopics } from './curator/history'
import { physicsTopics } from './curator/physics'
import { englishTopics } from './curator/english'
import { chemistryTopics } from './curator/chemistry'
import { biologyTopics } from './curator/biology'
// Kazakh content
import { mathTopicsKk } from './curator/mathKk'
import { historyTopicsKk } from './curator/historyKk'
import { physicsTopicsKk } from './curator/physicsKk'
import { biologyTopicsKk } from './curator/biologyKk'
import { chemistryTopicsKk } from './curator/chemistryKk'

// ── Combined Content ────────────────────────────────────────────────────────

export const curatorContent: TopicContent[] = [
  ...mathTopics,
  ...historyTopics,
  ...physicsTopics,
  ...englishTopics,
  ...chemistryTopics,
  ...biologyTopics,
  // Kazakh
  ...mathTopicsKk,
  ...historyTopicsKk,
  ...physicsTopicsKk,
  ...biologyTopicsKk,
  ...chemistryTopicsKk,
]

// ── Query Helpers ───────────────────────────────────────────────────────────

export function getContentBySubject(subject: string): TopicContent[] {
  return curatorContent.filter(t => t.subject === subject)
}

export function getContentByLevel(level: string): TopicContent[] {
  return curatorContent.filter(t => t.level === level)
}

export function getContentBySubjectAndLevel(subject: string, level: string): TopicContent[] {
  return curatorContent.filter(t => t.subject === subject && t.level === level)
}

export function getContentByLanguage(lang: ContentLanguage): TopicContent[] {
  return curatorContent.filter(t => (t.language ?? 'ru') === lang)
}

export function getContentBySubjectAndLanguage(subject: string, lang: ContentLanguage): TopicContent[] {
  return curatorContent.filter(t => t.subject === subject && (t.language ?? 'ru') === lang)
}

// ── ENT Mandatory subjects ─────────────────────────────────────────────────

export const ENT_MANDATORY_SUBJECTS = ['math', 'history'] as const

// ── IELTS sections (placeholder) ────────────────────────────────────────────

export const IELTS_SECTIONS = ['reading', 'writing', 'listening', 'speaking'] as const

// ── Re-exports for convenience ──────────────────────────────────────────────

export {
  mathTopics,
  historyTopics,
  physicsTopics,
  englishTopics,
  chemistryTopics,
  biologyTopics,
}
