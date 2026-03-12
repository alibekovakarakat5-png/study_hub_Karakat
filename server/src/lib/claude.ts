// ── AI Tutor via Claude API ───────────────────────────────────────────────────
//
// Powers the "free text → ENT answer" feature in the Telegram bot.
// Uses claude-haiku-4-5 (fast + cheap) — ideal for high-volume chat.
// Rate limit: 10 AI messages per user per day (in-memory, resets at midnight).

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Rate limiter (in-memory, resets daily) ────────────────────────────────────

const DAILY_LIMIT = 10
const usage = new Map<string, { count: number; date: string }>()

function todayKey() {
  return new Date().toISOString().slice(0, 10) // "2026-03-12"
}

export function getRemainingQuestions(userId: string): number {
  const today = todayKey()
  const rec = usage.get(userId)
  if (!rec || rec.date !== today) return DAILY_LIMIT
  return Math.max(0, DAILY_LIMIT - rec.count)
}

function incrementUsage(userId: string): void {
  const today = todayKey()
  const rec = usage.get(userId)
  if (!rec || rec.date !== today) {
    usage.set(userId, { count: 1, date: today })
  } else {
    rec.count++
  }
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Ты — ИИ-репетитор платформы StudyHub, помогаешь казахстанским школьникам готовиться к ЕНТ.

Предметы ЕНТ: Математика, История Казахстана, Грамота (русский/казахский язык), Биология, Физика, Химия, География, Всемирная история, Английский язык.

Правила ответов:
- Отвечай КОРОТКО и ЧЁТКО — это Telegram, не учебник
- Используй структуру: объяснение + пример/формула если нужно
- Используй эмодзи умеренно для наглядности
- Если вопрос по математике — покажи решение шаг за шагом
- Если вопрос по истории — дай конкретные даты и факты
- Если вопрос не по учёбе — вежливо направь обратно к ЕНТ
- Максимум 3-4 абзаца, каждый короткий
- НЕ используй markdown-заголовки (# ##) — в Telegram они не работают
- Можно использовать <b>жирный</b> и <i>курсив</i> в HTML формате`

// ── Main function ─────────────────────────────────────────────────────────────

export async function askTutor(
  userId: string,
  question: string,
  userName?: string,
): Promise<{ answer: string; remaining: number } | { limitReached: true; remaining: 0 }> {
  const remaining = getRemainingQuestions(userId)

  if (remaining === 0) {
    return { limitReached: true, remaining: 0 }
  }

  incrementUsage(userId)

  const userMessage = userName
    ? `${userName} спрашивает: ${question.slice(0, 1000)}`
    : question.slice(0, 1000)

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const textBlock = response.content.find(b => b.type === 'text')
  const answer = textBlock?.type === 'text' ? textBlock.text : 'Не смог ответить, попробуй ещё раз.'

  return { answer, remaining: getRemainingQuestions(userId) }
}
