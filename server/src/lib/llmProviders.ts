// ── Multi-provider LLM router with automatic fallback ────────────────────────
//
//   Primary  : Claude Code CLI (uses user's Claude Code subscription via stdin)
//   Then     : Anthropic API   (claude-haiku-4-5)
//   Then     : Google Gemini   (gemini-2.0-flash)
//   Last     : Groq Llama      (existing GROQ_MODEL)
//
// Each provider call returns a parsed JSON object. On failure (no key, API
// error, malformed JSON), we move to the next provider. The caller gets
// { json, provider, ms } so we can log which model was actually used and
// surface that to teachers.

import Anthropic from '@anthropic-ai/sdk'
import { spawn } from 'child_process'

const CLAUDE_CLI_BIN    = process.env.CLAUDE_CLI ?? 'claude'
const CLAUDE_CLI_ENABLED = process.env.CLAUDE_CLI_ENABLED !== 'false'  // on by default
// Model for the Claude Code CLI — 'opus' uses the latest Opus on the account
// (highest quality). Override with CLAUDE_CLI_MODEL=sonnet for faster/cheaper.
const CLAUDE_CLI_MODEL  = process.env.CLAUDE_CLI_MODEL ?? 'claude-opus-4-8'
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const GEMINI_API_KEY    = process.env.GEMINI_API_KEY
const GROQ_API_KEY      = process.env.GROQ_API_KEY

// Direct-API model (only used if ANTHROPIC_API_KEY is set). Latest Opus.
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-6'
const GEMINI_MODEL    = 'gemini-2.0-flash'
const GEMINI_URL      = (model: string) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
const GROQ_URL        = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL      = 'llama-3.3-70b-versatile'

export type Provider = 'claude-cli' | 'anthropic' | 'gemini' | 'groq'

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
  const firstBrace = cleaned.indexOf('{')
  if (firstBrace > 0) cleaned = cleaned.slice(firstBrace)
  const lastBrace = cleaned.lastIndexOf('}')
  if (lastBrace !== -1 && lastBrace < cleaned.length - 1) cleaned = cleaned.slice(0, lastBrace + 1)
  try {
    return JSON.parse(cleaned) as T
  } catch (e) {
    // Opus sometimes emits invalid control chars; strip them (keep tab/newline/CR) and retry once.
    const sanitized = Array.from(cleaned).filter(ch => {
      const code = ch.charCodeAt(0)
      return code >= 32 || code === 9 || code === 10 || code === 13
    }).join('')
    try { return JSON.parse(sanitized) as T } catch { throw e }
  }
}

// ── Provider implementations ─────────────────────────────────────────────────

// Claude Code CLI — invokes the local `claude` binary which uses the user's
// own Claude Code subscription (no API key needed in env). Sends the prompt
// via stdin and reads JSON from stdout. Slower per request (~3-8s overhead
// for process spawn + auth) than direct API but doesn't need a paid key.
//
// Modes:
//   `claude -p "<prompt>"`  → headless one-shot; prints answer to stdout.
//   `claude -p --output-format json`  → wraps with metadata. We use plain
//                                       text to keep parsing simple.
async function callClaudeCli<T>(opts: LLMCallOptions): Promise<T> {
  if (!CLAUDE_CLI_ENABLED) throw new Error('CLAUDE_CLI disabled by env')

  // Merge system + user into a single prompt — Claude Code CLI uses one stdin.
  const combined = `${opts.system}\n\n──────────\n\n${opts.user}\n\nReturn ONLY valid JSON, no commentary.`

  const stdout: Buffer[] = []
  const stderr: Buffer[] = []

  await new Promise<void>((resolve, reject) => {
    const proc = spawn(CLAUDE_CLI_BIN, ['-p', '--model', CLAUDE_CLI_MODEL, '--output-format', 'text'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32',  // .cmd shim on Windows
    })
    proc.stdout.on('data', d => stdout.push(d))
    proc.stderr.on('data', d => stderr.push(d))
    proc.on('error', reject)
    proc.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(`claude CLI exited ${code}: ${Buffer.concat(stderr).toString().slice(0, 400)}`))
    })
    proc.stdin.write(combined)
    proc.stdin.end()
  })

  const raw = Buffer.concat(stdout).toString().trim()
  if (!raw) throw new Error('Claude CLI returned empty stdout')
  return opts.parseJson === false ? (raw as unknown as T) : tryParse<T>(raw)
}

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
  { name: 'claude-cli', call: callClaudeCli },
  { name: 'anthropic',  call: callAnthropic },
  { name: 'gemini',     call: callGemini    },
  { name: 'groq',       call: callGroq      },
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
    'claude-cli': CLAUDE_CLI_ENABLED,
    anthropic:    !!ANTHROPIC_API_KEY,
    gemini:       !!GEMINI_API_KEY,
    groq:         !!GROQ_API_KEY,
  }
}
