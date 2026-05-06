// ── Topic tagger ────────────────────────────────────────────────────────────
//
// Given a chunk of theory text plus a subject, asks Groq Llama 3.3 to pick
// the most relevant topic IDs from our canonical taxonomy. Returns at most N
// IDs, all guaranteed to exist in TOPIC_TAXONOMY (post-validation strips
// hallucinations).

import { TOPIC_TAXONOMY, isValidTopicId, topicsForSubject } from '../data/topicTaxonomy'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

interface TaggerOptions {
  apiKey?: string
  /** Max IDs to return after filtering. Default 3. */
  maxTopics?: number
}

/**
 * Tag a piece of theory with up to N taxonomy topic IDs for the given subject.
 * Returns [] if Groq is unavailable, the response is malformed, or no taxonomy
 * topics match — never throws (so it's safe to call inline during content
 * creation without breaking the request).
 */
export async function tagLessonTopics(
  theory: string,
  subject: string,
  opts: TaggerOptions = {},
): Promise<string[]> {
  const apiKey = opts.apiKey ?? process.env.GROQ_API_KEY
  if (!apiKey) return []
  const maxTopics = Math.min(5, Math.max(1, opts.maxTopics ?? 3))

  const allowed = topicsForSubject(subject)
  if (allowed.length === 0) return []

  const taxonomyList = allowed.map((t) => `- ${t.id} (${t.label_ru})`).join('\n')
  const truncated = theory.slice(0, 4000)

  const system = `Ты классификатор учебных текстов. Выбираешь из ФИКСИРОВАННОГО списка тем те, которые покрывает текст.
Возвращаешь СТРОГО JSON: { "topics": ["topic-id-1", "topic-id-2"] }.
Используешь ТОЛЬКО английские ID из списка ниже. Не выдумываешь свои. До ${maxTopics} тем.`

  const user = `Список разрешённых тем для предмета "${subject}":
${taxonomyList}

Текст урока:
${truncated}

Верни JSON: { "topics": [...] } с ID из списка выше.`

  let res: Response
  try {
    res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 200,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    })
  } catch {
    return []
  }
  if (!res.ok) return []

  let body: unknown
  try {
    body = await res.json()
  } catch {
    return []
  }
  const content = (body as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content
  if (!content) return []

  let parsed: unknown
  try { parsed = JSON.parse(content) } catch { return [] }
  const raw = (parsed as { topics?: unknown }).topics
  if (!Array.isArray(raw)) return []

  // Strip anything not in the taxonomy. This is the security net against
  // model hallucinations and lets the rest of the system trust the result.
  const valid = raw
    .filter((x): x is string => typeof x === 'string')
    .map((s) => s.trim())
    .filter(isValidTopicId)
    // Also enforce subject scope
    .filter((id) => TOPIC_TAXONOMY.find((t) => t.id === id)?.subject === subject)

  // Dedupe + cap
  return [...new Set(valid)].slice(0, maxTopics)
}
