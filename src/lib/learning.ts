import { api } from './api'

export type LearningProfile = {
  source: 'chatgpt' | 'teacher' | 'self' | 'other'; sourceDate: string; summary: string; goal: string;
  strengths: string[]; completedTopics: string[]; focusAreas: string[]; nextStep: string; interests: string;
  dailyMinutes: number; aiConsent: boolean;
}
export type LearningRecord<T> = { id: string; revision: number; updatedAt: string; data: T }
export type Lesson = { id: string; title: string; minutes: number; rule: string; mnemonic: string; examples: string[]; quiz: { text: string; options: string[]; answer: number; why: string }[]; writingPrompt: string; speakingPrompt: string; chunks: string[] }
export type LearningDraft = { topicId: string; writing: string; reflection: string; answers: number[]; parentId: string | null }
export type LearningAttempt = LearningDraft & { id: string; mode: 'light' | 'standard'; score: { correct: number; total: number }; feedback: string | null; createdAt: string }
export type LearningItem = { kind: 'error' | 'phrase'; topic: string; original: string; correction: string; explanation: string; streak: number; nextReviewAt: string; history: { recalled: boolean; example: string; at: string }[] }
export type LearningTurn = { message: string; reply: string; mode: string; createdAt: string }
export type LearningState = { memory: LearningRecord<LearningProfile> | null; draft: LearningRecord<LearningDraft> | null; turns: LearningRecord<LearningTurn>[]; attempts: LearningRecord<LearningAttempt>[]; items: LearningRecord<LearningItem>[]; curriculum: Lesson[] }
export const learningApi = {
  load: () => api.get<LearningState>('/learning'),
  memory: (p: LearningProfile, revision: number) => api.put<{ record: LearningRecord<LearningProfile> }>('/learning/memory', { profile: { source: p.source, sourceDate: p.sourceDate, summary: p.summary, goal: p.goal, strengths: p.strengths.filter(Boolean), completedTopics: p.completedTopics.filter(Boolean), focusAreas: p.focusAreas.filter(Boolean), nextStep: p.nextStep, interests: p.interests, dailyMinutes: p.dailyMinutes, aiConsent: p.aiConsent }, revision, confirmed: true }),
  draft: (draft: LearningDraft, revision: number) => api.put<{ record: LearningRecord<LearningDraft> }>('/learning/draft', { draft, revision }),
  attempt: (draft: LearningDraft, id: string, mode: string) => api.post<{ record: LearningRecord<LearningAttempt> }>('/learning/attempts', { ...draft, id, mode }),
  feedback: (id: string) => api.post<{ record: LearningRecord<LearningAttempt> }>(`/learning/attempts/${id}/feedback`),
  chat: (message: string, id: string, mode: string) => api.post<{ record: LearningRecord<LearningTurn> }>('/learning/chat', { message, id, mode }),
  item: (item: Pick<LearningItem, 'kind' | 'topic' | 'original' | 'correction' | 'explanation'>, id: string) => api.post<{ record: LearningRecord<LearningItem> }>('/learning/items', { item, id }),
  review: (id: string, revision: number, recalled: boolean, example: string) => api.post<{ record: LearningRecord<LearningItem> }>(`/learning/items/${id}/review`, { revision, recalled, example }),
}

export { blankProfile, transferPrompt, parseLearningImport, suggestLearningLesson } from './learningTransfer'

export function downloadLearningFile(name: string, content: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = name; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
