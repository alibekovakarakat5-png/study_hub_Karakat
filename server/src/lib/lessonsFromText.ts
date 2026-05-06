// ── Lessons-from-text generator ──────────────────────────────────────────────
//
// Reads a chunk of educational text (a chapter, an article, a textbook
// excerpt) and asks Groq's Llama 3.3 to turn it into a list of structured
// lessons that fit the existing `ent_lesson` Content shape.
//
// The output deliberately mirrors what we already store from
// biologyEntCourse.ts and historyKZCourse.ts so the same UI components and
// the same smartAssignment logic can consume it.

import { chunkText } from './textChunker'

interface QuizQ {
  q: string
  options: [string, string, string, string]
  correct: 0 | 1 | 2 | 3
  explanation: string
}

export interface GeneratedLesson {
  title: string
  duration: number
  theory: string
  keyFormulas?: { formula: string; name: string }[]
  quiz: QuizQ[]
  /** Topic IDs from TOPIC_TAXONOMY this lesson covers. May be empty. */
  topics: string[]
}

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

const SYSTEM = `Ты — методист, превращающий любой учебный текст в структурированные уроки на РУССКОМ языке.
Возвращаешь СТРОГО JSON формата:

{
  "lessons": [
    {
      "title": "название урока (короткое, 5-10 слов)",
      "duration": 25,
      "theory": "markdown 1500-3500 символов с ##, **, списками. Покрывает один логически целый кусок исходного текста.",
      "keyFormulas": [{"formula": "...", "name": "..."}],   // 3-6 опорных пунктов / формул / правил / дат / определений
      "quiz": [
        {"q": "вопрос", "options": ["A","B","C","D"], "correct": 0, "explanation": "почему верно"}
        // ровно 5 вопросов
      ]
    }
    // 3-7 уроков всего, в зависимости от длины исходного текста
  ]
}

Требования:
- Уроки должны быть логически связными — один урок = одна тема исходного текста
- Не выдумывай факты которых нет в исходном тексте
- Quiz проверяет понимание, options всегда РОВНО 4
- correct — индекс 0-3
- НЕ markdown-обёртка \`\`\`json — только сам JSON`

interface CallOptions {
  /** Subject hint, e.g. "biology", "history" */
  subject?: string
  /** Display name for the source document */
  materialName?: string
  /** Maximum lessons to generate (defaults to 7, hard cap 10) */
  maxLessons?: number
  /** Optional override for the API key — defaults to GROQ_API_KEY env var */
  apiKey?: string
}

export async function lessonsFromText(text: string, opts: CallOptions = {}): Promise<GeneratedLesson[]> {
  const apiKey = opts.apiKey ?? process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  // Trim to a manageable size — Groq free tier has a 12k TPM ceiling, so
  // we keep the input under ~9k chars to leave room for the model's output.
  const MAX_INPUT_CHARS = 9000
  const inputText = text.length > MAX_INPUT_CHARS
    ? `${text.slice(0, MAX_INPUT_CHARS)}\n\n[Текст обрезан до ${MAX_INPUT_CHARS} символов для генерации]`
    : text

  const maxLessons = Math.min(10, Math.max(1, opts.maxLessons ?? 7))
  const userPrompt = [
    opts.subject ? `Предмет: ${opts.subject}` : '',
    opts.materialName ? `Источник: ${opts.materialName}` : '',
    `Сгенерируй ${maxLessons === 1 ? '1 урок' : `до ${maxLessons} уроков`} из этого текста:`,
    '',
    inputText,
    '',
    'Только JSON формата { "lessons": [...] }, без обёрток.',
  ].filter(Boolean).join('\n')

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 5500,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Groq ${res.status}: ${errText.slice(0, 300)}`)
  }

  const json = (await res.json()) as { choices: Array<{ message: { content: string } }> }
  const content = json.choices[0]?.message?.content
  if (!content) throw new Error('Groq returned empty content')

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('Groq returned invalid JSON')
  }

  const obj = parsed as { lessons?: unknown }
  if (!Array.isArray(obj.lessons)) {
    throw new Error('Groq response missing "lessons" array')
  }

  return obj.lessons.map(validate)
}

function validate(raw: unknown): GeneratedLesson {
  const o = raw as Record<string, unknown>
  if (typeof o.title !== 'string' || !o.title.trim()) {
    throw new Error('Lesson missing title')
  }
  if (typeof o.theory !== 'string' || o.theory.length < 500) {
    throw new Error(`Lesson "${o.title}": theory too short (${(o.theory as string)?.length ?? 0} chars)`)
  }
  const quiz = o.quiz as Array<Record<string, unknown>> | undefined
  if (!Array.isArray(quiz) || quiz.length < 3) {
    throw new Error(`Lesson "${o.title}": quiz must have >=3 items`)
  }
  for (const [i, q] of quiz.entries()) {
    const options = q.options as string[] | undefined
    if (typeof q.q !== 'string') throw new Error(`Lesson "${o.title}" q${i}: q not string`)
    if (!Array.isArray(options) || options.length !== 4) throw new Error(`Lesson "${o.title}" q${i}: options must be array of 4`)
    if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) throw new Error(`Lesson "${o.title}" q${i}: correct must be 0-3`)
    if (typeof q.explanation !== 'string') throw new Error(`Lesson "${o.title}" q${i}: explanation not string`)
  }
  const formulas = o.keyFormulas as Array<{ formula: unknown; name: unknown }> | undefined
  return {
    title: o.title.trim(),
    duration: typeof o.duration === 'number' ? o.duration : 25,
    theory: o.theory,
    keyFormulas: Array.isArray(formulas)
      ? formulas
          .filter((f) => typeof f.formula === 'string' && typeof f.name === 'string')
          .map((f) => ({ formula: f.formula as string, name: f.name as string }))
      : undefined,
    quiz: quiz.slice(0, 7).map((q) => ({
      q: q.q as string,
      options: q.options as [string, string, string, string],
      correct: q.correct as 0 | 1 | 2 | 3,
      explanation: q.explanation as string,
    })),
    // Server-side tagger fills this in after generation. Default to [] so the
    // type contract is always honoured even if the model omits the field.
    topics: [],
  }
}

// ── Multi-chunk wrapper ─────────────────────────────────────────────────────

/**
 * Wrap lessonsFromText with auto-chunking for big texts. Splits input via
 * chunkText, runs the generator per chunk with a 6s pause between calls
 * (Groq free-tier TPM ≈ 12k), aggregates lessons. Failed chunks are
 * skipped — does NOT abort the whole run.
 *
 * Returns aggregated lessons + per-chunk stats so callers can show progress.
 */
export async function lessonsFromTextChunked(
  text: string,
  opts: CallOptions & { onChunkStart?: (i: number, total: number) => void } = {},
): Promise<{
  lessons: GeneratedLesson[]
  stats: { chunksTotal: number; chunksOk: number; chunksFailed: number }
}> {
  const chunks = chunkText(text)
  const all: GeneratedLesson[] = []
  let ok = 0, failed = 0

  for (let i = 0; i < chunks.length; i++) {
    opts.onChunkStart?.(i + 1, chunks.length)
    try {
      const lessons = await lessonsFromText(chunks[i]!, {
        subject: opts.subject,
        materialName: opts.materialName ? `${opts.materialName} (часть ${i + 1}/${chunks.length})` : undefined,
        maxLessons: 4, // smaller per-chunk to fit token budget
        apiKey: opts.apiKey,
      })
      all.push(...lessons)
      ok++
    } catch (err) {
      console.warn(`[lessonsFromTextChunked] chunk ${i + 1} failed: ${err instanceof Error ? err.message : 'unknown'}`)
      failed++
    }
    if (i < chunks.length - 1) await new Promise((r) => setTimeout(r, 6000))
  }

  return { lessons: all, stats: { chunksTotal: chunks.length, chunksOk: ok, chunksFailed: failed } }
}
