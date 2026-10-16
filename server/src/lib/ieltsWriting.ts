import { z } from 'zod'
import { grammarTopics, type GrammarTopic } from './ieltsWritingContent'
export const writingFeedbackSchema = z.object({
  strengths: z.string().min(1).max(260),
  criteria: z.object({ task: z.string().min(1).max(200), coherence: z.string().min(1).max(200), vocabulary: z.string().min(1).max(200), grammar: z.string().min(1).max(200) }).strict(),
  corrections: z.array(z.object({ quote: z.string().min(1).max(150), replacement: z.string().min(1).max(180), reason: z.string().min(1).max(200), topic: z.enum(grammarTopics).nullable() }).strict()).max(3),
  nextStep: z.string().min(1).max(300), comparison: z.string().max(250),
}).strict()
export type WritingFeedback = z.infer<typeof writingFeedbackSchema>
export type WritingJob = { id: string; taskId: string; revision: number; text: string; previousText?: string; previousFeedback?: WritingFeedback; startedAt: string }
export type WritingEvaluator = (job: WritingJob) => Promise<WritingFeedback>
export type WritingState = { taskId: string; draft: string; revision: number; drafts?: Record<string, string>; job?: WritingJob; error?: string; submissions: { taskId: string; text: string; revision: number; feedback: WritingFeedback; at: string }[]; usage?: { day: string; count: number } }
export type GrammarState = { pending: GrammarTopic[]; active?: { id: string; topic: GrammarTopic }; answered: number; correct: number }
export function validateWritingFeedback(value: unknown, text: string) {
  const feedback = writingFeedbackSchema.parse(value)
  if (feedback.corrections.some(c => !text.includes(c.quote))) throw Error('Ungrounded writing correction')
  return feedback
}
