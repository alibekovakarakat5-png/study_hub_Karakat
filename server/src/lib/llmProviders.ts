// ── Multi-provider LLM router with automatic fallback ────────────────────────
//
//   Primary  : Anthropic Claude (claude-haiku-4-5)
//   Fallback : Google Gemini    (gemini-2.0-flash)
//   Last     : Groq Llama       (existing GROQ_MODEL)
//
// Each provider call returns a parsed JSON object. On failure (no key, API
// error, malformed JSON), we move to the next provider. The caller gets
// { json, provider, ms } so we can log which model was actually used and
// surface that to teachers.

import Anthropic from '@anthropic-ai/sdk'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const GEMINI_API_KEY    = process.env.GEMINI_API_KEY
const GROQ_API_KEY      = process.env.GROQ_API_KEY

const ANTHROPIC_MODEL = 'claude-haiku-4-5'
const GEMINI_MODEL    = 'gemini-2.0-flash'
const GEMINI_URL      = (model: string) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
const GROQ_URL        = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL      = 'llama-3.3-70b-versatile'

export type Provider = 'anthropic' | 'gemini' | 'groq'

export interface LLMCallOptions {
  system:      string
  user:        string
  maxTokens?:  number
  temperature?: number
  /** Strip markdown fences and parse JSON before returning */
  parseJson?:  boolean
}

export interface LLMCallResult<T = unknown> {
  json:     T
  raw:      string
  provider: Provider
  ms:       number
}

function stripFences(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
}

function tryParse<T>(raw: string): T {
  let cleaned = stripFences(raw)
  // Tolerate a leading explanation line before the JSON body
  const firstBrace = cleaned.indexOf('{')
  if (firstBrace > 0) cleaned = cleaned.slice(firstBrace)
  return JSON.parse(cleaned) as T
}

// ── Provider implementations ─────────────────────────────────────────────────

async function callAnthropic<T>(opts: LLMCallOptions): Promise<T> {
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set')
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  const res = await client.messages.create({
    model:       ANTHROPIC_MODEL,
    max_tokens:  opts.maxTokens  ?? 4000,
    temperature: opts.temperature ?? 0.5,
    system:      opts.system,
    messages: [{ role: 'user', content: opts.user }],
  })
  const block = res.content.find(b => b.type === 'text')
  const raw   = block?.type === 'text' ? block.text : ''
  if (!raw) throw new Error('Anthropic returned empty response')
  return opts.parseJson === false ? (raw as unknown as T) : tryParse<T>(raw)
}

async function callGemini<T>(opts: LLMCallOptions): Promise<T> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set')
  const res = await fetch(GEMINI_URL(GEMINI_MODEL), {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents:          [{ role: 'user', parts: [{ text: opts.user }] }],
      generationConfig: {
        temperature:     opts.temperature ?? 0.5,
        maxOutputTokens: opts.maxTokens   ?? 4000,
        responseMimeType: opts.parseJson === false ? 'text/plain' : 'application/json',
      },
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 200)}`)
  }
  const json = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!raw) throw new Error('Gemini returned empty response')
  return opts.parseJson === false ? (raw as unknown as T) : tryParse<T>(raw)
}

async function callGroq<T>(opts: LLMCallOptions): Promise<T> {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:        GROQ_MODEL,
      max_tokens:   opts.maxTokens  ?? 4000,
      temperature:  opts.temperature ?? 0.5,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user',   content: opts.user   },
      ],
      // Groq supports JSON-mode flag — drastically improves valid-JSON rate
      response_format: opts.parseJson === false ? undefined : { type: 'json_object' },
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Groq ${res.status}: ${body.slice(0, 200)}`)
  }
  const json = await res.json() as { choices: Array<{ message: { content: string } }> }
  const raw  = json.choices[0]?.message?.content ?? ''
  if (!raw) throw new Error('Groq returned empty response')
  return opts.parseJson === false ? (raw as unknown as T) : tryParse<T>(raw)
}

// ── Public dispatcher with fallback chain ────────────────────────────────────

const CHAIN: Array<{ name: Provider; call: <T>(o: LLMCallOptions) => Promise<T> }> = [
  { name: 'anthropic', call: callAnthropic },
  { name: 'gemini',    call: callGemini    },
  { name: 'groq',      call: callGroq      },
]

export async function callLLM<T = unknown>(opts: LLMCallOptions): Promise<LLMCallResult<T>> {
  const errors: string[] = []
  for (const p of CHAIN) {
    const t0 = Date.now()
    try {
      const json = await p.call<T>(opts)
      return { json, raw: '', provider: p.name, ms: Date.now() - t0 }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      errors.push(`[${p.name}] ${msg}`)
      // Skip "key not set" silently — keep looking; on real API errors keep going too
      continue
    }
  }
  throw new Error(`All LLM providers failed:\n${errors.join('\n')}`)
}

export function providerStatus() {
  return {
    anthropic: !!ANTHROPIC_API_KEY,
    gemini:    !!GEMINI_API_KEY,
    groq:      !!GROQ_API_KEY,
  }
}
