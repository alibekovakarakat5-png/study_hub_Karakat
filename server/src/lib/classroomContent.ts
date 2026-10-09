export type ClassroomQuestion = { id?: string; text: string; options: string[]; correctAnswer: number; explanation?: string; topic?: string }
export function classroomQuestions(type: string, value: unknown): ClassroomQuestion[] {
  const content = value as { questions?: ClassroomQuestion[]; quiz?: ClassroomQuestion[]; isLesson?: boolean } | null
  const questions = type === 'test' ? content?.questions : type === 'reading' && content?.isLesson ? content.quiz : undefined
  return Array.isArray(questions) ? questions : []
}

export function studentContent(value: unknown): unknown {
  const content = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
  // Only display fields are sent before submission. Unknown answer-key fields stay server-side.
  const result: Record<string, unknown> = {}
  for (const field of ['text', 'theory', 'isLesson', 'keyFormulas', 'minutes', 'stage', 'rubric']) {
    if (content[field] !== undefined) result[field] = content[field]
  }
  for (const field of ['questions', 'quiz']) {
    if (Array.isArray(content[field])) result[field] = (content[field] as ClassroomQuestion[]).map(q => ({ id: q.id, text: q.text, options: q.options, topic: q.topic }))
  }
  return result
}

export function classroomScore(questions: ClassroomQuestion[], answers: unknown): number | null {
  if (!questions.length) return null
  if (!Array.isArray(answers) || answers.length !== questions.length || questions.some((q, i) =>
    !Array.isArray(q.options) || !Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer >= q.options.length ||
    !Number.isInteger(answers[i]) || answers[i] < 0 || answers[i] >= q.options.length)) throw new Error('INVALID_ANSWERS')
  return Math.round(100 * questions.filter((q, i) => q.correctAnswer === answers[i]).length / questions.length)
}
