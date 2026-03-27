// ── Growth AI — Claude-powered functions for Growth Assistant ─────────────────
//
// Uses Claude Haiku for fast, cheap AI generation:
//   - Content ideas (posts, reels, stories)
//   - Lead analysis and outreach suggestions
//   - Document processing (PDF → lessons)
//   - Competitor analysis

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = 'claude-haiku-4-5'

// ── Content Generation ───────────────────────────────────────────────────────

export async function generateContent(): Promise<string> {
  const today = new Date().toLocaleDateString('ru-KZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Almaty',
  })

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: `Ты — контент-менеджер образовательной EdTech платформы StudyHub (Казахстан).
Платформа готовит школьников к ЕНТ и IELTS, помогает поступить в вузы.
Целевая аудитория: школьники 9-11 класс и их родители в Казахстане.

Генерируй контент-план на день. Формат ответа — HTML (для Telegram):

Структура:
1. 📱 3 поста для Instagram/Telegram (с текстом и хештегами)
2. 🎬 2 Reels/TikTok идеи (краткий сценарий)
3. 📸 5 идей для Stories

Правила:
- Пиши по-русски, с казахстанским контекстом (ЕНТ, гранты, Болашак, казахстанские вузы)
- Используй актуальные тренды и боли ЦА
- Каждый пост должен иметь CTA (call-to-action)
- Хештеги: #StudyHub #ЕНТ #IELTS #Казахстан + тематические
- Текст адаптирован под молодёжь (не формальный)
- НЕ используй markdown (# ##), используй HTML (<b>, <i>)`,
    messages: [{
      role: 'user',
      content: `Сегодня ${today}. Сгенерируй контент-план на сегодня. Учти сезонность (если близко к ЕНТ — больше про подготовку, если лето — про поступление и отдых).`,
    }],
  })

  const block = response.content.find(b => b.type === 'text')
  return block?.type === 'text' ? block.text : 'Не удалось сгенерировать контент.'
}

// ── Lead Analysis ────────────────────────────────────────────────────────────

export async function analyzeLead(keyword: string): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: `Ты — growth-аналитик EdTech стартапа StudyHub (Казахстан).
Платформа: подготовка к ЕНТ/IELTS, AI-репетитор, учебные планы.

Задача: проанализировать потенциальный лид (клиент/партнёр) и дать рекомендации.

Формат ответа (HTML для Telegram):
- Тип лида (B2B центр / репетитор / школа / B2C студент)
- Оценка потенциала (1-10)
- Рекомендация: писать или нет
- Шаблон первого сообщения
- Возможный канал связи

НЕ используй markdown, только HTML (<b>, <i>).`,
    messages: [{
      role: 'user',
      content: `Проанализируй потенциальный лид: "${keyword}". Дай оценку и рекомендацию по подходу.`,
    }],
  })

  const block = response.content.find(b => b.type === 'text')
  return block?.type === 'text' ? block.text : 'Не удалось проанализировать.'
}

// ── Document Processing ──────────────────────────────────────────────────────

export async function processDocument(text: string): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: `Ты — методист образовательной платформы StudyHub.

Задача: разбить полученный текст/материал на структурированные уроки для платформы.

Формат ответа (HTML для Telegram):
1. <b>Тема:</b> общая тема материала
2. <b>Предмет:</b> к какому предмету ЕНТ относится
3. <b>Уровень:</b> beginner / intermediate / advanced
4. <b>Структура уроков:</b>
   - Урок 1: название + краткое содержание
   - Урок 2: ...
   (до 10 уроков)
5. <b>Тестовые вопросы:</b> 3-5 вопросов по материалу
6. <b>Рекомендация:</b> как лучше добавить в StudyHub

НЕ используй markdown, только HTML.`,
    messages: [{
      role: 'user',
      content: `Разбери этот материал на уроки для StudyHub:\n\n${text.slice(0, 3000)}`,
    }],
  })

  const block = response.content.find(b => b.type === 'text')
  return block?.type === 'text' ? block.text : 'Не удалось обработать документ.'
}

// ── Competitor Analysis ──────────────────────────────────────────────────────

export async function analyzeCompetitor(name: string, description: string): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: `Ты — бизнес-аналитик EdTech стартапа StudyHub (Казахстан).
Задача: проанализировать конкурента и дать actionable рекомендации.

Формат ответа (HTML для Telegram, коротко):
- <b>Сильные стороны:</b> что у них хорошо
- <b>Слабые стороны:</b> где мы можем быть лучше
- <b>Угрозы:</b> что они могут сделать
- <b>Рекомендации:</b> что нам стоит скопировать/улучшить

НЕ используй markdown.`,
    messages: [{
      role: 'user',
      content: `Конкурент: "${name}"\nОписание: ${description.slice(0, 1000)}`,
    }],
  })

  const block = response.content.find(b => b.type === 'text')
  return block?.type === 'text' ? block.text : ''
}

// ── Skylla AI — умный ответ через Groq (бесплатно, Llama 3.3) ────────────────
//
// Groq free tier: 30 req/min, без кредитки. Получи ключ на console.groq.com
// Добавь в .env: GROQ_API_KEY=gsk_...

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL   = 'llama-3.3-70b-versatile'

const SKYLLA_SYSTEM = `Ты — Skylla, AI-репетитор образовательной платформы StudyHub (Казахстан).
Помогаешь школьникам 9-11 класса готовиться к ЕНТ, IELTS и поступлению в вуз.

Правила:
- Отвечай по-русски, дружелюбно, как умный старший друг (не как робот)
- Вопрос про учёбу/ЕНТ/IELTS/профессию — дай конкретный полезный ответ
- Вопрос не по теме — мягко направь к учёбе
- Ответ: 3-5 предложений, по делу, без воды
- Заканчивай мотивирующей фразой
- НЕ используй markdown (#, **, _), только HTML (<b>, <i>)
- В конце: 💡 Подробнее — на StudyHub: https://skylla.netlify.app`

export async function askSkylla(question: string, userName = 'друг'): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:      GROQ_MODEL,
      max_tokens: 450,
      messages: [
        { role: 'system', content: SKYLLA_SYSTEM },
        { role: 'user',   content: `${userName} спрашивает: ${question}` },
      ],
    }),
  })

  if (!res.ok) throw new Error(`Groq error: ${res.status}`)
  const json = await res.json() as { choices: Array<{ message: { content: string } }> }
  return json.choices[0]?.message?.content ?? 'Хороший вопрос! Давай разберём его на платформе 👇'
}

// ── Channel Post — один готовый пост для канала @skyllaAI ────────────────────

const WEEKDAY_TOPICS: Record<number, string> = {
  1: 'Понедельник — математика. Разбери одну формулу или метод решения задач ЕНТ',
  2: 'Вторник — история Казахстана. Интересный факт или важная дата для ЕНТ',
  3: 'Среда — лайфхак учёбы. Конкретный совет как эффективно готовиться',
  4: 'Четверг — IELTS/английский. Слово дня, полезная фраза или grammar tip',
  5: 'Пятница — мотивация и прогресс. Вдохновляющий пост про цели и поступление',
  6: 'Суббота — карьера и профессии. Разбор востребованной профессии в Казахстане',
  0: 'Воскресенье — итоги недели. Мотивационный пост + совет на следующую неделю',
}

export async function generateChannelPost(): Promise<string> {
  const now = new Date()
  const weekday = now.getDay()
  const topic = WEEKDAY_TOPICS[weekday] ?? WEEKDAY_TOPICS[1]!
  const dateStr = now.toLocaleDateString('ru-KZ', { day: 'numeric', month: 'long', timeZone: 'Asia/Almaty' })

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: `Ты — контент-менеджер канала @skyllaAI — Telegram-канала образовательной платформы StudyHub (Казахстан).
Аудитория: школьники 9-11 класс и их родители.

Напиши ОДИН готовый пост для Telegram-канала.
Формат:
- Начало: эмодзи + цепляющий заголовок
- Тело: 3-4 предложения с полезной информацией
- Конец: призыв к действию со ссылкой на платформу
- Хештеги: 3-4 релевантных

Требования:
- НЕ используй markdown, только HTML (<b>, <i>)
- Тон: дружелюбный, молодёжный, по-казахстански близкий
- Длина: 150-250 слов
- Ссылка на платформу: https://skylla.netlify.app`,
    messages: [{
      role: 'user',
      content: `Сегодня ${dateStr}. Тема: ${topic}. Напиши один пост для канала.`,
    }],
  })

  const block = response.content.find(b => b.type === 'text')
  return block?.type === 'text' ? block.text : ''
}

// ── Feedback Analysis (парсинг отзывов) ──────────────────────────────────────

export async function analyzeFeedback(messages: string[]): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: `Ты — product-аналитик EdTech платформы StudyHub.
Задача: проанализировать обратную связь от пользователей и выделить ключевые инсайты.

Формат (HTML для Telegram):
- <b>Топ-3 запроса:</b> что хотят пользователи
- <b>Боли:</b> с чем сталкиваются
- <b>Рекомендации:</b> что добавить в продукт

Коротко и по делу.`,
    messages: [{
      role: 'user',
      content: `Вот отзывы/сообщения пользователей:\n\n${messages.join('\n---\n').slice(0, 2000)}`,
    }],
  })

  const block = response.content.find(b => b.type === 'text')
  return block?.type === 'text' ? block.text : 'Не удалось проанализировать.'
}
