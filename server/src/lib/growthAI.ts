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
const APP_URL      = process.env.APP_URL || 'https://skylla.netlify.app'

const SKYLLA_SYSTEM = `Ты — Skylla, AI-репетитор образовательной платформы StudyHub (Казахстан).
Помогаешь школьникам 9-11 класса готовиться к ЕНТ, IELTS и поступлению в вуз.

Правила:
- Отвечай по-русски, дружелюбно, как умный старший друг (не как робот)
- Вопрос про учёбу/ЕНТ/IELTS/профессию — дай конкретный полезный ответ
- Вопрос не по теме — мягко направь к учёбе
- Ответ: 3-5 предложений, по делу, без воды
- Заканчивай мотивирующей фразой
- НЕ используй markdown (#, **, _), только HTML (<b>, <i>)
- В конце: 💡 Подробнее — на StudyHub: ${APP_URL}`

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

// ── Channel Post v2 — реальные новости для @skyllaAI ────────────────────────
//
// Парсим реальные новости → AI пишет пост на основе фактов
// Тематика: поступление за рубеж, гранты, стипендии, дедлайны

const NEWS_SOURCES = [
  'https://www.educations.com/articles-and-advice',
  'https://www.topuniversities.com/student-info/studying-abroad',
]

const WEEKDAY_FOCUS: Record<number, string> = {
  1: 'Гранты и стипендии для казахстанских студентов за рубежом (Болашак, Chevening, DAAD, Erasmus, Korean Government Scholarship)',
  2: 'Поступление в Европу (Чехия, Германия, Польша, Турция) — бесплатное или дешёвое обучение',
  3: 'Поступление в Азию (Корея, Китай, Малайзия, Япония) — стипендии и программы',
  4: 'IELTS/TOEFL — конкретные советы для казахстанских студентов, разбор частых ошибок',
  5: 'Истории успеха — казахстанцы которые поступили в топ-вузы мира, их путь и советы',
  6: 'Дедлайны ближайших программ и грантов, что подавать прямо сейчас',
  0: 'Сравнение стран для учёбы: стоимость жизни, язык, перспективы после диплома',
}

const CHANNEL_POST_SYSTEM = `Ты — редактор Telegram-канала о поступлении за рубеж для казахстанских студентов.

ТВОЯ ЗАДАЧА: написать один информативный, полезный пост.

ФОРМАТ ПОСТА:
1. Эмодзи + заголовок-крючок (вопрос или факт который заставит остановить скролл)
2. 4-6 предложений с КОНКРЕТНОЙ полезной информацией (цифры, названия программ, дедлайны, суммы грантов)
3. Один практический совет (что делать прямо сейчас)
4. CTA: ссылка на платформу
5. 3-4 хештега

СТИЛЬ:
- Пиши как умный друг который уже поступил и делится опытом
- Конкретика > мотивация. Цифры, даты, названия > "верь в себя"
- Казахстанский контекст обязателен (цены в тенге, сравнение с КЗ вузами, визовые нюансы)
- Короткие абзацы, воздух между строками
- HTML теги: <b>, <i>, <a href="...">. НЕ markdown

ДЛИНА: 150-250 слов
ЯЗЫК: русский`

/** Fetch a news page and extract key sentences about studying abroad */
async function fetchNewsContext(): Promise<string> {
  try {
    const url = NEWS_SOURCES[Math.floor(Math.random() * NEWS_SOURCES.length)]!
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 StudyHub Bot' },
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) return ''
    const html = await res.text()

    // Extract text content, strip tags
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 3000)

    return text
  } catch {
    return ''
  }
}

export async function generateChannelPost(): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')

  const now     = new Date()
  const weekday = now.getDay()
  const focus   = WEEKDAY_FOCUS[weekday] ?? WEEKDAY_FOCUS[1]!
  const dateStr = now.toLocaleDateString('ru-KZ', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Almaty' })
  const month   = now.toLocaleDateString('ru-KZ', { month: 'long', timeZone: 'Asia/Almaty' })

  // Try to get real news context
  const newsContext = await fetchNewsContext()
  const contextBlock = newsContext
    ? `\n\nВот фрагмент свежих новостей для вдохновения (НЕ копируй, а используй как основу):\n${newsContext.slice(0, 1500)}`
    : ''

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:      GROQ_MODEL,
      max_tokens: 600,
      temperature: 0.8,
      messages: [
        { role: 'system', content: CHANNEL_POST_SYSTEM },
        { role: 'user', content: `Сегодня ${dateStr}. Сейчас ${month} — учитывай актуальные дедлайны.

Фокус поста: ${focus}

Ссылка для CTA: ${APP_URL}${contextBlock}

Напиши пост.` },
      ],
    }),
  })

  if (!res.ok) throw new Error(`Groq error: ${res.status}`)
  const json = await res.json() as { choices: Array<{ message: { content: string } }> }
  return json.choices[0]?.message?.content ?? ''
}

// ── Multi-channel post generator (для будущих каналов ЕНТ, IELTS) ───────────

type ChannelType = 'abroad' | 'ent' | 'ielts'

const CHANNEL_CONFIGS: Record<ChannelType, { system: string; topics: string[] }> = {
  abroad: {
    system: CHANNEL_POST_SYSTEM,
    topics: Object.values(WEEKDAY_FOCUS),
  },
  ent: {
    system: `Ты — редактор Telegram-канала о подготовке к ЕНТ для казахстанских школьников.
Пиши посты с конкретными разборами заданий, лайфхаками по предметам, новостями о ЕНТ.
Формат: эмодзи + заголовок, 4-6 предложений, практический совет, CTA, хештеги.
HTML теги: <b>, <i>. НЕ markdown. Русский язык. 150-250 слов.`,
    topics: [
      'Разбор сложного задания по математике ЕНТ — пошаговое решение',
      'Лайфхак: как запоминать даты по истории Казахстана',
      'Топ ошибок на ЕНТ по грамотности чтения и как их избежать',
      'Физика/химия — формулы которые ТОЧНО будут на ЕНТ',
      'Тайм-менеджмент на ЕНТ: сколько минут на каждый блок',
      'Новости ЕНТ: изменения формата, пороговые баллы, даты',
      'Мотивация + план подготовки на неделю',
    ],
  },
  ielts: {
    system: `Ты — редактор Telegram-канала о подготовке к IELTS для казахстанских студентов.
Пиши посты с конкретными советами по Speaking, Writing, Reading, Listening.
Формат: эмодзи + заголовок, 4-6 предложений, конкретный совет или разбор, CTA, хештеги.
HTML теги: <b>, <i>. НЕ markdown. Русский язык (можно английские примеры). 150-250 слов.`,
    topics: [
      'IELTS Speaking Part 2 — разбор реального cue card + модельный ответ',
      'IELTS Writing Task 2 — структура эссе на 7.0+ с примером',
      'Vocabulary boost: 10 слов которые впечатлят экзаменатора',
      'IELTS Reading — техника skimming & scanning за 60 секунд на passage',
      'Listening — как не пропустить ответ: типичные ловушки IELTS',
      'Разбор частых ошибок казахстанских студентов на IELTS',
      'Мотивация: истории студентов из КЗ которые сдали на 7.5+',
    ],
  },
}

export async function generateChannelPostForType(type: ChannelType): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')

  const config = CHANNEL_CONFIGS[type]
  const now = new Date()
  const dateStr = now.toLocaleDateString('ru-KZ', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Almaty' })
  const topic = config.topics[now.getDay() % config.topics.length]!

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:      GROQ_MODEL,
      max_tokens: 600,
      temperature: 0.8,
      messages: [
        { role: 'system', content: config.system },
        { role: 'user', content: `Сегодня ${dateStr}. Фокус: ${topic}. Ссылка для CTA: ${APP_URL}. Напиши пост.` },
      ],
    }),
  })

  if (!res.ok) throw new Error(`Groq error: ${res.status}`)
  const json = await res.json() as { choices: Array<{ message: { content: string } }> }
  return json.choices[0]?.message?.content ?? ''
}

// ── Teacher Test Generator — 3 варианта через Groq ───────────────────────────

export interface AITestQuestion {
  id: string
  text: string
  options: string[]        // exactly 4
  correctAnswer: number    // 0-indexed
  explanation: string
}

export interface AITestVariant {
  variantIndex: number
  questions: AITestQuestion[]
}

const SUBJECT_LABELS: Record<string, string> = {
  math:        'Математика',
  physics:     'Физика',
  chemistry:   'Химия',
  history:     'История Казахстана',
  english:     'Английский язык',
  biology:     'Биология',
  geography:   'География',
  informatics: 'Информатика',
  kazakh:      'Казахский язык',
  russian:     'Русский язык',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy:   'лёгкий (уровень 9 класс, базовые знания)',
  medium: 'средний (уровень ЕНТ, стандартная сложность)',
  hard:   'сложный (уровень олимпиады, нестандартные задачи)',
}

export async function generateTest(params: {
  topic: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  questionCount: number
}): Promise<{ variants: AITestVariant[] }> {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')

  const subjectLabel = SUBJECT_LABELS[params.subject] ?? params.subject
  const diffLabel    = DIFFICULTY_LABELS[params.difficulty] ?? DIFFICULTY_LABELS.medium
  const n            = Math.max(5, Math.min(20, params.questionCount))

  const systemPrompt = `Ты — опытный казахстанский учитель и составитель тестов ЕНТ.
Твоя задача: сгенерировать 3 разных варианта теста по одной теме.

СТРОГИЕ ПРАВИЛА:
1. Ответ ТОЛЬКО в формате JSON — никакого текста до или после JSON
2. Каждый вариант содержит ровно ${n} вопросов
3. Каждый вопрос имеет ровно 4 варианта ответа (options: string[4])
4. correctAnswer — индекс правильного ответа (0, 1, 2 или 3)
5. Варианты между собой НЕ повторяются (разные формулировки, разный порядок)
6. Дистракторы (неправильные ответы) должны быть правдоподобными
7. explanation — краткое объяснение правильного ответа (1-2 предложения)
8. Нумерация id: "v1_q1", "v1_q2" для варианта 1; "v2_q1" для варианта 2 и т.д.

ФОРМАТ ОТВЕТА (только JSON, ничего больше):
{"variants":[{"variantIndex":1,"questions":[{"id":"v1_q1","text":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correctAnswer":0,"explanation":"..."}]},{"variantIndex":2,"questions":[...]},{"variantIndex":3,"questions":[...]}]}`

  const userPrompt = `Предмет: ${subjectLabel}
Тема: ${params.topic}
Уровень сложности: ${diffLabel}
Количество вопросов в каждом варианте: ${n}

Сгенерируй 3 варианта теста. Только JSON.`

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:       GROQ_MODEL,
      max_tokens:  4000,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
    }),
  })

  if (!res.ok) throw new Error(`Groq error: ${res.status}`)

  const json = await res.json() as { choices: Array<{ message: { content: string } }> }
  const raw  = json.choices[0]?.message?.content ?? ''

  // Strip accidental markdown fences
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

  let parsed: { variants: AITestVariant[] }
  try {
    parsed = JSON.parse(cleaned) as { variants: AITestVariant[] }
  } catch {
    throw new Error('AI вернул некорректный JSON — попробуйте ещё раз')
  }

  if (!Array.isArray(parsed.variants) || parsed.variants.length !== 3) {
    throw new Error('AI вернул неполный ответ — попробуйте ещё раз')
  }

  return parsed
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
