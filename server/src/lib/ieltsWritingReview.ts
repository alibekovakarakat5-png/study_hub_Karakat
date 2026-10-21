import type { WritingEvaluator } from './ieltsWriting'
// Deterministic acceptance fixture. Never used by the real Telegram route.
export const reviewWritingEvaluator: WritingEvaluator = async job => ({
  strengths: 'Тестовый разбор: позиция обозначена. Это синтетический ответ для проверки процесса, не оценка качества эссе.',
  criteria: { task: 'Проверь, обсуждены ли обе стороны.', coherence: 'Добавь связь между аргументом и примером.', vocabulary: 'Проверь точность слов в контексте.', grammar: 'Тестовое правило: students need, а не students needs.' },
  corrections: job.text.includes('students needs') ? [{ quote: 'students needs', replacement: 'students need', reason: 'Множественное число: базовая форма глагола.', topic: 'agreement' }] : [],
  nextStep: 'Исправь students needs, если эта фраза есть, и пришли полный текст заново.',
  comparison: job.previousText ? 'Синтетическое сравнение: предыдущая версия и разбор переданы проверяющему.' : '',
})
