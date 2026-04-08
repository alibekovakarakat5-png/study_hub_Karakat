// ── StudyHub Telegram Bot ─────────────────────────────────────────────────────
//
// Роль бота: заинтересовать → диагностировать → отправить на платформу
//
// Потоки: ЕНТ диагностика, Поступление за рубеж, Выбор профессии, IELTS, Стартап
// Знания: БД (mentor_qa, vocab_word, ent_question) + hardcoded fallback
// Никакого внешнего AI — всё на собственных данных
//
// Env: TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT
// Webhook: POST /api/telegram/webhook

import { prisma } from './prisma'
import { handleGrowthCommand, handleGrowthCallback, isAdmin } from './growthBot'
import { askSkylla } from './growthAI'

const BOT_TOKEN  = process.env.TELEGRAM_BOT_TOKEN
const ADMIN_CHAT = process.env.TELEGRAM_ADMIN_CHAT ?? process.env.TELEGRAM_CHAT_ID
const APP_URL    = process.env.APP_URL ?? 'https://skylla.netlify.app'

// ── Low-level helpers ─────────────────────────────────────────────────────────

async function call(method: string, body: Record<string, unknown>): Promise<unknown> {
  if (!BOT_TOKEN) return
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  return res.json()
}

async function sendMsg(chat_id: string | number, text: string, extra?: Record<string, unknown>) {
  return call('sendMessage', { chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra })
}

async function editMsg(chat_id: string | number, message_id: number, text: string, extra?: Record<string, unknown>) {
  return call('editMessageText', { chat_id, message_id, text, parse_mode: 'HTML', ...extra })
}

async function answerCallback(callback_query_id: string, text?: string) {
  return call('answerCallbackQuery', { callback_query_id, text })
}

// ── Keyboard builders ─────────────────────────────────────────────────────────

const MAIN_MENU_KB = {
  inline_keyboard: [
    [
      { text: '🎓 Подготовка к ЕНТ',    callback_data: 'flow:ent' },
      { text: '🌍 Поступление за рубеж', callback_data: 'flow:abroad' },
    ],
    [
      { text: '🧭 Выбор профессии', callback_data: 'flow:career' },
      { text: '🇬🇧 IELTS',          callback_data: 'flow:ielts' },
    ],
    [
      { text: '🚀 Стартап',        callback_data: 'flow:startup' },
      { text: '📊 Мой прогресс',   callback_data: 'flow:progress' },
    ],
    [
      { text: '📱 Открыть StudyHub', web_app: { url: `${APP_URL}/dashboard` } },
    ],
  ],
}

const BACK_TO_MENU = [[{ text: '↩️ Главное меню', callback_data: 'flow:main' }]]

function optKb(flow: string, opts: string[]) {
  const rows: { text: string; callback_data: string }[][] = []
  for (let i = 0; i < opts.length; i += 2) {
    const row = [{ text: opts[i]!, callback_data: `${flow}:ans:${i}` }]
    if (opts[i + 1]) row.push({ text: opts[i + 1]!, callback_data: `${flow}:ans:${i + 1}` })
    rows.push(row)
  }
  return { inline_keyboard: rows }
}

// ── ENT question bank (shared module) ────────────────────────────────────────

import {
  type Question,
  LABELS, FALLBACK_QUESTIONS,
  getRandomQuestion, getQuestions,
  buildQuestionText, buildQuestionKeyboard,
} from './questions'

// ── State machine ─────────────────────────────────────────────────────────────

type FlowType = 'idle' | 'ent_diag' | 'abroad' | 'career' | 'startup'

interface UserState {
  flow: FlowType
  step: number
  score: number
  answers: number[]
  questions: Question[]
  lastActive: number
}

const userStates = new Map<string, UserState>()

const STATE_TTL = 60 * 60 * 1000 // 1 hour

// Periodic cleanup of stale states every 30 minutes
setInterval(() => {
  const cutoff = Date.now() - STATE_TTL
  for (const [key, state] of userStates) {
    if (state.lastActive < cutoff) userStates.delete(key)
  }
}, 30 * 60 * 1000)

function getState(chatId: number): UserState {
  const key = String(chatId)
  if (!userStates.has(key)) userStates.set(key, { flow: 'idle', step: 0, score: 0, answers: [], questions: [], lastActive: Date.now() })
  return userStates.get(key)!
}

function setState(chatId: number, patch: Partial<UserState>): void {
  userStates.set(String(chatId), { ...getState(chatId), ...patch, lastActive: Date.now() })
}

function resetState(chatId: number): void {
  userStates.delete(String(chatId))
}

// ── Main menu ─────────────────────────────────────────────────────────────────

async function showMainMenu(chatId: number) {
  resetState(chatId)
  await sendMsg(chatId,
    `👋 <b>Привет! Я бот StudyHub</b>\n\n` +
    `Помогаю казахстанским школьникам:\n\n` +
    `🎓 Подготовиться к ЕНТ\n` +
    `🌍 Поступить за рубеж\n` +
    `🧭 Выбрать профессию\n` +
    `🇬🇧 Сдать IELTS\n` +
    `🚀 Запустить стартап\n\n` +
    `Выбери направление 👇`,
    { reply_markup: MAIN_MENU_KB },
  )
}

// ── Helpers: персонализация по слабому предмету ───────────────────────────────

async function getWeakSubject(chatId: number): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({ where: { telegramChatId: String(chatId) } })
    if (!user) return null
    const results = await prisma.diagnosticResult.findMany({
      where: { userId: user.id }, orderBy: { takenAt: 'desc' }, take: 20,
    })
    if (!results.length) return null
    const bySubject: Record<string, number[]> = {}
    for (const r of results) {
      const subj = r.subject ?? 'ЕНТ'
      const d = r.scores as Record<string, unknown>
      const pct = Number(d.percentage ?? d.score ?? 0) / 100
      if (!bySubject[subj]) bySubject[subj] = []
      bySubject[subj].push(pct)
    }
    let weakSubj: string | null = null
    let weakScore = Infinity
    for (const [subj, scores] of Object.entries(bySubject)) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      if (avg < weakScore) { weakScore = avg; weakSubj = subj }
    }
    return weakSubj
  } catch { return null }
}

// ── Flow: /question — персонализированный по слабому предмету ─────────────────

async function handleQuestion(chatId: number) {
  const weakSubject = await getWeakSubject(chatId)
  const q = await getRandomQuestion(weakSubject ?? undefined)
  const lines = q.options.map((o, i) => `${LABELS[i]}. ${o}`).join('\n')
  const prefix = weakSubject ? `🎯 <i>Тренируем слабую тему: ${weakSubject}</i>\n\n` : ''
  const text = `${prefix}📚 <b>${q.subject}</b>\n\n${q.q}\n\n${lines}`
  const kb = { inline_keyboard: [LABELS.slice(0, q.options.length).map((l, i) => ({ text: l, callback_data: `ans:${q.id}:${i}` }))] }
  await sendMsg(chatId, text, { reply_markup: kb })
}

async function handleQuestionAnswer(chatId: number, messageId: number, questionId: string, answerIdx: number) {
  let q = FALLBACK_QUESTIONS.find(x => x.id === questionId)
  if (!q) {
    try {
      const dbQ = await prisma.content.findUnique({ where: { id: questionId } })
      if (dbQ) {
        const d = dbQ.data as Record<string, unknown>
        q = { id: dbQ.id, subject: String(d.subject ?? 'ЕНТ'), q: String(d.question ?? d.q ?? ''),
              options: (d.options as string[]) ?? [], correct: Number(d.correct ?? 0), explanation: String(d.explanation ?? '') }
      }
    } catch { /* ignore */ }
  }
  if (!q) { await editMsg(chatId, messageId, '⚠️ Вопрос не найден. Попробуй /question'); return }

  const isCorrect = answerIdx === q.correct
  const result =
    `📚 <b>${q.subject}</b>\n\n${q.q}\n\n` +
    (isCorrect
      ? `✅ <b>Правильно!</b> ${LABELS[q.correct]}. ${q.options[q.correct]}\n\n`
      : `❌ <b>Неверно.</b> Правильный: ${LABELS[q.correct]}. ${q.options[q.correct]}\n\n`) +
    `💡 ${q.explanation}`

  await editMsg(chatId, messageId, result, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎯 Ещё вопрос', callback_data: 'flow:question' }],
        [{ text: '📚 500+ вопросов на платформе', url: `${APP_URL}/diagnostic` }],
        BACK_TO_MENU[0]!,
      ],
    },
  })
}

// ── Flow: ENT диагностика (5 вопросов) ───────────────────────────────────────

async function startEntDiag(chatId: number) {
  const questions = await getQuestions(5)
  setState(chatId, { flow: 'ent_diag', step: 0, score: 0, answers: [], questions })
  await showEntQ(chatId, 0, questions)
}

async function showEntQ(chatId: number, step: number, questions: Question[]) {
  const q = questions[step]!
  const lines = q.options.map((o, i) => `${LABELS[i]}. ${o}`).join('\n')
  await sendMsg(chatId,
    `🎓 <b>Мини-диагностика ЕНТ — ${step + 1}/5</b>\n\n<b>${q.subject}</b>\n${q.q}\n\n${lines}`,
    { reply_markup: { inline_keyboard: [q.options.map((_, i) => ({ text: LABELS[i]!, callback_data: `diag:ans:${i}` }))] } },
  )
}

async function handleEntDiagAns(chatId: number, ansIdx: number) {
  const s = getState(chatId)
  if (s.flow !== 'ent_diag') return
  const q = s.questions[s.step]!
  const correct = ansIdx === q.correct
  const newScore = s.score + (correct ? 1 : 0)
  const nextStep = s.step + 1

  await sendMsg(chatId,
    correct
      ? `✅ <b>Правильно!</b> ${q.explanation}`
      : `❌ <b>Неверно.</b> Правильный ответ: <b>${LABELS[q.correct]}</b>. ${q.explanation}`,
  )

  if (nextStep >= 5) {
    resetState(chatId)
    const projected = Math.round(newScore * 24 + 20) // 20–140 scale approx
    const level = newScore <= 1 ? '🔴 Начальный' : newScore <= 3 ? '🟡 Средний' : '🟢 Хороший'
    const advice = newScore <= 1
      ? 'Нужна серьёзная подготовка. Персональный план закроет пробелы быстрее.'
      : newScore <= 3
      ? 'Хорошая база! Осталось закрыть слабые темы — платформа покажет какие.'
      : 'Отличный результат! Ещё немного — и 120+. Платформа поможет довести до максимума.'

    await sendMsg(chatId,
      `📊 <b>Результат диагностики ЕНТ</b>\n\n` +
      `Правильных ответов: <b>${newScore}/5</b>\n` +
      `Прогноз балла ЕНТ: <b>~${projected}</b>\n` +
      `Уровень: ${level}\n\n${advice}`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎯 Полная диагностика (40 вопросов)', url: `${APP_URL}/diagnostic` }],
            [{ text: '📚 Получить учебный план',            url: `${APP_URL}/dashboard` }],
            BACK_TO_MENU[0]!,
          ],
        },
      },
    )
  } else {
    setState(chatId, { step: nextStep, score: newScore })
    await showEntQ(chatId, nextStep, s.questions)
  }
}

// ── Flow: Поступление за рубеж (3 вопроса) ───────────────────────────────────

const ABROAD_QS = [
  { text: '🌍 <b>Поступление за рубеж</b>\n\nЕсть ли у тебя языковой сертификат?',
    opts: ['✅ IELTS 6.0+', '📝 IELTS < 6', '📖 Учу английский', '❌ Нет'] },
  { text: '💰 Какой бюджет на учёбу в год?',
    opts: ['До $5 000', '$5 000–15 000', '$15 000+', '🎓 Только грант'] },
  { text: '🗺️ Какой регион интересует?',
    opts: ['🇪🇺 Европа', '🌏 Азия', '🇺🇸 США/Канада', '🌐 Любой'] },
]

async function startAbroadFlow(chatId: number) {
  setState(chatId, { flow: 'abroad', step: 0, score: 0, answers: [], questions: [] })
  const q = ABROAD_QS[0]!
  await sendMsg(chatId, q.text, { reply_markup: optKb('abroad', q.opts) })
}

async function handleAbroadAns(chatId: number, idx: number) {
  const s = getState(chatId)
  if (s.flow !== 'abroad') return
  const newAnswers = [...s.answers, idx]
  const nextStep = s.step + 1

  if (nextStep < ABROAD_QS.length) {
    setState(chatId, { step: nextStep, answers: newAnswers })
    const q = ABROAD_QS[nextStep]!
    await sendMsg(chatId, q.text, { reply_markup: optKb('abroad', q.opts) })
    return
  }

  resetState(chatId)
  const [cert, budget, region] = newAnswers

  let countries: string[]
  let grants: string

  if (cert === 0) {
    // IELTS 6+
    if (region === 0) { countries = ['🇩🇪 Германия (бесплатно)', '🇦🇹 Австрия', '🇳🇱 Нидерланды']; grants = 'DAAD, Erasmus+' }
    else if (region === 1) { countries = ['🇰🇷 Корея (NIIED)', '🇯🇵 Япония (MEXT)']; grants = 'NIIED, MEXT' }
    else if (region === 2) { countries = ['🇺🇸 США', '🇨🇦 Канада']; grants = 'Scholarship.com' }
    else { countries = ['🇩🇪 Германия', '🇰🇷 Корея', '🇨🇿 Чехия']; grants = 'DAAD, NIIED' }
  } else if (cert === 3 || budget === 3) {
    // Ищет грант / нет сертификата
    countries = ['🇭🇺 Венгрия (Stipendium Hungaricum)', '🇨🇳 Китай (CSC грант)', '🇹🇷 Турция']
    grants = 'Stipendium Hungaricum, CSC, Болашак'
  } else {
    if (region === 0) { countries = ['🇵🇱 Польша', '🇨🇿 Чехия', '🇭🇺 Венгрия']; grants = 'Erasmus+, Болашак' }
    else { countries = ['🇨🇳 Китай', '🇲🇾 Малайзия', '🇰🇿 Болашак']; grants = 'CSC, Болашак' }
  }

  await sendMsg(chatId,
    `🎯 <b>Подходящие страны для тебя:</b>\n\n` +
    countries.join('\n') + '\n\n' +
    `🏆 Доступные гранты: ${grants}\n\n` +
    `Полный гайд по документам, дедлайнам и требованиям — на платформе:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌍 Открыть Admit Lab',         url: `${APP_URL}/abroad` }],
          [{ text: '📋 Roadmap поступления',        url: `${APP_URL}/abroad` }],
          BACK_TO_MENU[0]!,
        ],
      },
    },
  )
}

// ── Flow: Выбор профессии (4 вопроса) ────────────────────────────────────────

// 6 personality axes matching frontend careerTestData.ts
type Axis = 'tech' | 'creative' | 'analyst' | 'leader' | 'helper' | 'maker'
interface CareerQ { text: string; opts: { label: string; scores: Partial<Record<Axis, number>> }[] }

const CAREER_QS: CareerQ[] = [
  { text: '🧭 <b>Тест профессий</b>\n\nПятница вечером — ты свободен. Что выберешь?',
    opts: [
      { label: '💻 Код или новая технология', scores: { tech: 3, analyst: 1 } },
      { label: '🎨 Рисую / снимаю видео', scores: { creative: 3, maker: 1 } },
      { label: '📚 Читаю книгу / документалку', scores: { analyst: 3, helper: 1 } },
      { label: '🎉 Встречаюсь с друзьями', scores: { leader: 3, helper: 1 } },
    ] },
  { text: '👥 В команде ты обычно...',
    opts: [
      { label: '⚙️ Решаю технические задачи', scores: { tech: 3, maker: 1 } },
      { label: '💡 Придумываю идеи', scores: { creative: 3, leader: 1 } },
      { label: '📊 Анализирую данные', scores: { analyst: 3, tech: 1 } },
      { label: '🚀 Веду команду', scores: { leader: 3, helper: 1 } },
    ] },
  { text: '📚 Какой предмет в школе нравился?',
    opts: [
      { label: '🔢 Математика / Информатика', scores: { tech: 2, analyst: 2 } },
      { label: '🎭 Рисование / Литература', scores: { creative: 3, helper: 1 } },
      { label: '🌍 История / Экономика', scores: { analyst: 2, leader: 2 } },
      { label: '🔬 Биология / Химия / Физика', scores: { maker: 2, analyst: 2 } },
    ] },
  { text: '🔧 Ты видишь сломанный механизм. Реакция?',
    opts: [
      { label: '🛠️ Разбираю и чиню', scores: { maker: 3, tech: 1 } },
      { label: '✨ Думаю как сделать красивее', scores: { creative: 3, maker: 1 } },
      { label: '🔍 Ищу инфу — почему сломался', scores: { analyst: 3, tech: 1 } },
      { label: '📞 Нахожу того кто умеет', scores: { leader: 2, helper: 2 } },
    ] },
  { text: '💼 Что важнее в работе?',
    opts: [
      { label: '⚡ Сложные технические задачи', scores: { tech: 3, analyst: 1 } },
      { label: '🎨 Создавать уникальное', scores: { creative: 3 } },
      { label: '❤️ Помогать людям', scores: { helper: 3, leader: 1 } },
      { label: '💰 Строить бизнес', scores: { leader: 3, analyst: 1 } },
    ] },
  { text: '☀️ Идеальный рабочий день:',
    opts: [
      { label: '🎧 Код в тишине, наушники', scores: { tech: 3 } },
      { label: '🖼️ Дизайн, визуал, контент', scores: { creative: 3, maker: 1 } },
      { label: '🤝 Встречи, переговоры', scores: { leader: 3, helper: 1 } },
      { label: '📈 Исследования и данные', scores: { analyst: 3, tech: 1 } },
    ] },
  { text: '💵 У тебя $100,000. Что делаешь?',
    opts: [
      { label: '🚀 Запускаю стартап', scores: { leader: 3, tech: 1 } },
      { label: '📊 Инвестирую', scores: { analyst: 3, leader: 1 } },
      { label: '🎬 Творческий проект / студия', scores: { creative: 3, maker: 1 } },
      { label: '🫶 Помогаю семье / соц. проект', scores: { helper: 3, leader: 1 } },
    ] },
  { text: '🌟 Что тебя восхищает?',
    opts: [
      { label: '🤖 Как работает ChatGPT / Tesla', scores: { tech: 3, analyst: 1 } },
      { label: '🎮 Как создают фильмы / игры', scores: { creative: 3, maker: 1 } },
      { label: '📈 Как стартапы стают миллиардными', scores: { leader: 3, analyst: 1 } },
      { label: '🏥 Как врачи спасают жизни', scores: { helper: 3, maker: 1 } },
    ] },
]

interface CareerProfile {
  name: string
  emoji: string
  desc: string
  jobs: { title: string; salary: string }[]
  entSubjects: string
}

const CAREER_PROFILES: Record<Axis, CareerProfile> = {
  tech: {
    name: 'Tech Builder 🤖',
    emoji: '💻',
    desc: 'Ты мыслишь системно и любишь разбираться как всё устроено. Технологии — твой язык.',
    jobs: [
      { title: 'Software Developer', salary: '400–800K ₸/мес' },
      { title: 'Data Scientist / AI', salary: '500K–1M ₸/мес' },
      { title: 'DevOps / Cloud Engineer', salary: '450–900K ₸/мес' },
    ],
    entSubjects: 'Математика + Информатика',
  },
  creative: {
    name: 'Creative Maker 🎨',
    emoji: '🎨',
    desc: 'Ты видишь красоту там где другие видят обычные вещи. Твоя сила — превращать идеи в образы.',
    jobs: [
      { title: 'UI/UX Designer', salary: '300–600K ₸/мес' },
      { title: 'Motion Designer / 3D', salary: '250–500K ₸/мес' },
      { title: 'Brand Strategist', salary: '350–700K ₸/мес' },
    ],
    entSubjects: 'Творческие экзамены + Английский',
  },
  analyst: {
    name: 'Strategic Analyst 📊',
    emoji: '📊',
    desc: 'Ты видишь паттерны в хаосе. Цифры для тебя — история, которую ты читаешь лучше других.',
    jobs: [
      { title: 'Product / Business Analyst', salary: '350–700K ₸/мес' },
      { title: 'Financial Analyst', salary: '400–800K ₸/мес' },
      { title: 'Data Analyst', salary: '400–750K ₸/мес' },
    ],
    entSubjects: 'Математика + География / История',
  },
  leader: {
    name: 'Visionary Leader 🚀',
    emoji: '🚀',
    desc: 'Ты задаёшь направление. Видишь возможности там где другие видят препятствия.',
    jobs: [
      { title: 'Product Manager', salary: '500K–1.2M ₸/мес' },
      { title: 'Entrepreneur / Founder', salary: 'Без потолка' },
      { title: 'Business Development', salary: '400–900K ₸/мес' },
    ],
    entSubjects: 'Математика + История / Английский',
  },
  helper: {
    name: 'Impact Creator ❤️',
    emoji: '❤️',
    desc: 'Смысл твоей работы — люди. Ты чувствуешь чужие эмоции и знаешь как помочь.',
    jobs: [
      { title: 'Психолог / Коуч', salary: '250–600K ₸/мес' },
      { title: 'HR / Talent Manager', salary: '300–600K ₸/мес' },
      { title: 'Врач / Педагог', salary: '200–500K ₸/мес' },
    ],
    entSubjects: 'Биология + Химия / История',
  },
  maker: {
    name: 'Engineering Mind ⚙️',
    emoji: '⚙️',
    desc: 'Ты превращаешь идеи в реальные объекты. Мир нуждается в людях которые умеют строить.',
    jobs: [
      { title: 'Инженер / Конструктор', salary: '300–600K ₸/мес' },
      { title: 'Robotics / Hardware', salary: '400–800K ₸/мес' },
      { title: 'Архитектор', salary: '300–700K ₸/мес' },
    ],
    entSubjects: 'Физика + Математика',
  },
}

function careerOptKb(step: number): { inline_keyboard: { text: string; callback_data: string }[][] } {
  const q = CAREER_QS[step]!
  return {
    inline_keyboard: q.opts.map((opt, i) => [{ text: opt.label, callback_data: `career:ans:${i}` }]),
  }
}

async function startCareerFlow(chatId: number) {
  setState(chatId, { flow: 'career', step: 0, score: 0, answers: [], questions: [] })
  const q = CAREER_QS[0]!
  await sendMsg(chatId, `${q.text}\n\n<i>Вопрос 1 из ${CAREER_QS.length}</i>`, { reply_markup: careerOptKb(0) })
}

async function handleCareerAns(chatId: number, idx: number) {
  const s = getState(chatId)
  if (s.flow !== 'career') return
  const newAnswers = [...s.answers, idx]
  const nextStep = s.step + 1

  if (nextStep < CAREER_QS.length) {
    setState(chatId, { step: nextStep, answers: newAnswers })
    const q = CAREER_QS[nextStep]!
    await sendMsg(chatId, `${q.text}\n\n<i>Вопрос ${nextStep + 1} из ${CAREER_QS.length}</i>`, { reply_markup: careerOptKb(nextStep) })
    return
  }

  resetState(chatId)

  // Score across 6 axes
  const scores: Record<Axis, number> = { tech: 0, creative: 0, analyst: 0, leader: 0, helper: 0, maker: 0 }
  newAnswers.forEach((ansIdx, qIdx) => {
    const q = CAREER_QS[qIdx]
    if (!q) return
    const opt = q.opts[ansIdx]
    if (!opt) return
    for (const [axis, pts] of Object.entries(opt.scores) as [Axis, number][]) {
      scores[axis] += pts
    }
  })

  // Find top 2 axes
  const sorted = (Object.entries(scores) as [Axis, number][]).sort((a, b) => b[1] - a[1])
  const primaryAxis = sorted[0]![0]
  const secondaryAxis = sorted[1]![0]
  const primary = CAREER_PROFILES[primaryAxis]
  const secondary = CAREER_PROFILES[secondaryAxis]
  const total = Object.values(scores).reduce((s, v) => s + v, 0)
  const topPct = total > 0 ? Math.round((sorted[0]![1] / total) * 100) : 0

  // Build score bar
  const bar = sorted.slice(0, 4).map(([axis, pts]) => {
    const p = CAREER_PROFILES[axis]
    const pct = total > 0 ? Math.round((pts / total) * 100) : 0
    const filled = Math.round(pct / 10)
    return `${p.emoji} ${p.name.split(' ')[0]}: ${'█'.repeat(filled)}${'░'.repeat(10 - filled)} ${pct}%`
  }).join('\n')

  await sendMsg(chatId,
    `🧭 <b>Твой карьерный профиль:</b>\n\n` +
    `<b>${primary.name}</b> (${topPct}% совпадение)\n` +
    `${primary.desc}\n\n` +
    `📊 <b>Твои оси:</b>\n${bar}\n\n` +
    `💼 <b>Подходящие профессии:</b>\n` +
    primary.jobs.map(j => `— ${j.title} <i>(${j.salary})</i>`).join('\n') + '\n\n' +
    `📝 <b>ЕНТ предметы:</b> ${primary.entSubjects}\n\n` +
    `🔄 Вторая ось: <b>${secondary.name}</b>\n` +
    secondary.jobs.slice(0, 2).map(j => `— ${j.title}`).join('\n') + '\n\n' +
    `Пройди полный тест на сайте — там 12 вопросов и глубокий анализ:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔮 Полный тест профориентации', web_app: { url: `${APP_URL}/career-test` } }],
          [{ text: '📱 Открыть StudyHub', web_app: { url: `${APP_URL}/dashboard` } }],
          BACK_TO_MENU[0]!,
        ],
      },
    },
  )
}

// ── Flow: IELTS ───────────────────────────────────────────────────────────────

async function startIeltsFlow(chatId: number) {
  resetState(chatId)

  let wordBlock = ''
  try {
    const words = await prisma.content.findMany({ where: { type: 'vocab_word', active: true }, take: 30 })
    if (words.length > 0) {
      const w = words[new Date().getDate() % words.length]!
      const d = w.data as Record<string, unknown>
      wordBlock = `\n\n📖 <b>Слово дня:</b> <b>${d.word}</b> — ${d.definition}` +
                  (d.example ? `\n<i>«${d.example}»</i>` : '')
    }
  } catch { /* ignore */ }

  await sendMsg(chatId,
    `🇬🇧 <b>IELTS подготовка</b>\n\n` +
    `IELTS нужен для:\n` +
    `— Поступления в зарубежные вузы\n` +
    `— Иммиграции (Канада, Австралия)\n` +
    `— Работы за границей\n\n` +
    `Band 6.0+ открывает большинство европейских вузов.` + wordBlock,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📚 IELTS Lab — полный курс',  url: `${APP_URL}/ielts` }],
          [{ text: '🎯 Вопрос дня по ЕНТ/IELTS',  callback_data: 'flow:question' }],
          BACK_TO_MENU[0]!,
        ],
      },
    },
  )
}

// ── Flow: Стартап (2 вопроса) ─────────────────────────────────────────────────

const STARTUP_QS = [
  { text: '🚀 <b>Стартапы со StudyHub</b>\n\nНа какой стадии твоя идея?',
    opts: ['💡 Просто идея', '🧪 Уже тестирую', '👥 Ищу команду', '💰 Нужны инвестиции'] },
  { text: '🏭 В какой сфере?',
    opts: ['📚 EdTech', '💻 IT/Технологии', '🌱 Социальный бизнес', '🛒 Другое'] },
]

const STARTUP_TIPS = [
  ['Начни с проблемы, а не с идеи. Поговори с 10 потенциальными клиентами.', 'Создай MVP за 2 недели — не нужно быть идеальным.'],
  ['Собери данные: что работает, что нет?', 'Думай о unit economics уже сейчас.'],
  ['Используй LinkedIn и Telegram для поиска команды.', 'Опиши роли чётко: CTO, CEO, CMO — кто что делает.'],
  ['Изучи pre-seed: Techpreneurs KZ, AIFC.', 'Подготовь pitch deck на 10 слайдов.'],
]

async function startStartupFlow(chatId: number) {
  setState(chatId, { flow: 'startup', step: 0, score: 0, answers: [], questions: [] })
  const q = STARTUP_QS[0]!
  await sendMsg(chatId, q.text, { reply_markup: optKb('startup', q.opts) })
}

async function handleStartupAns(chatId: number, idx: number) {
  const s = getState(chatId)
  if (s.flow !== 'startup') return
  const newAnswers = [...s.answers, idx]
  const nextStep = s.step + 1

  if (nextStep < STARTUP_QS.length) {
    setState(chatId, { step: nextStep, answers: newAnswers })
    const q = STARTUP_QS[nextStep]!
    await sendMsg(chatId, q.text, { reply_markup: optKb('startup', q.opts) })
    return
  }

  resetState(chatId)
  const [stage] = newAnswers
  const tips = STARTUP_TIPS[stage ?? 0] ?? STARTUP_TIPS[0]!

  await sendMsg(chatId,
    `🚀 <b>Roadmap для твоего стартапа:</b>\n\n` +
    tips.map((t, i) => `${i + 1}. ${t}`).join('\n\n') + '\n\n' +
    `StudyHub помогает основателям с менторами, нетворкингом и ресурсами:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Startup Lab', url: `${APP_URL}/startup` }],
          [{ text: '📋 Создать проект', url: `${APP_URL}/startup` }],
          BACK_TO_MENU[0]!,
        ],
      },
    },
  )
}

// ── /progress ─────────────────────────────────────────────────────────────────

async function handleProgress(chatId: number) {
  const user = await prisma.user.findUnique({
    where: { telegramChatId: String(chatId) },
    include: { studyPlans: { where: { isActive: true }, take: 1 } },
  })

  if (!user) {
    await sendMsg(chatId,
      `❌ <b>Аккаунт не привязан</b>\n\nЗайди в настройки → "Подключить Telegram" → скопируй код → отправь /link КОД`,
      { reply_markup: {
        inline_keyboard: [
          [{ text: '⚙️ Настройки профиля', url: `${APP_URL}/settings` }],
          BACK_TO_MENU[0]!,
        ],
      } },
    )
    return
  }

  const plan = user.studyPlans[0]
  const streakEmoji = (user.streak ?? 0) >= 7 ? '🔥' : (user.streak ?? 0) >= 3 ? '⚡' : '📅'

  let text = `📊 <b>Прогресс ${user.name}</b>\n\n`
  text += `${streakEmoji} Стрик: <b>${user.streak ?? 0} дней</b>\n`
  text += `⏱ Время занятий: <b>${user.totalStudyMinutes ?? 0} мин</b>\n`
  if (plan) {
    const pct = plan.totalModules > 0 ? Math.round((plan.completedModules / plan.totalModules) * 100) : 0
    const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10))
    text += `\n📚 <b>Учебный план:</b> ${plan.completedModules}/${plan.totalModules} (${pct}%)\n${bar}`
  }

  await sendMsg(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📱 Открыть дашборд', url: `${APP_URL}/dashboard` }],
        BACK_TO_MENU[0]!,
      ],
    },
  })
}

// ── /stats — баллы по предметам из диагностики ───────────────────────────────

async function handleStats(chatId: number) {
  const user = await prisma.user.findUnique({
    where: { telegramChatId: String(chatId) },
  })

  if (!user) {
    await sendMsg(chatId,
      `❌ <b>Аккаунт не привязан</b>\n\nОтправь /link КОД чтобы привязать аккаунт и видеть свою статистику.`,
      { reply_markup: { inline_keyboard: [[{ text: '⚙️ Настройки', url: `${APP_URL}/settings` }], BACK_TO_MENU[0]!] } },
    )
    return
  }

  const results = await prisma.diagnosticResult.findMany({
    where: { userId: user.id },
    orderBy: { takenAt: 'desc' },
    take: 30,
  })

  const streakEmoji = (user.streak ?? 0) >= 7 ? '🔥' : (user.streak ?? 0) >= 3 ? '⚡' : '📅'
  let text = `📊 <b>Статистика ${user.name}</b>\n\n`
  text += `${streakEmoji} Стрик: <b>${user.streak ?? 0} дней</b>\n`
  text += `⏱ Время занятий: <b>${user.totalStudyMinutes ?? 0} мин</b>\n`

  if (results.length > 0) {
    const bySubject: Record<string, number[]> = {}
    for (const r of results) {
      const s = r.subject ?? 'ЕНТ'
      const d = r.scores as Record<string, unknown>
      const pct = Number(d.percentage ?? d.score ?? 0)
      if (!bySubject[s]) bySubject[s] = []
      bySubject[s].push(pct)
    }

    text += `\n📚 <b>Баллы по предметам:</b>\n`
    const sorted = Object.entries(bySubject).sort((a, b) => {
      const pa = a[1].reduce((x, y) => x + y, 0) / a[1].length
      const pb = b[1].reduce((x, y) => x + y, 0) / b[1].length
      return pa - pb // worst first
    })

    for (const [subj, scores] of sorted) {
      const pct = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      const filled = Math.round(pct / 10)
      const bar = '█'.repeat(filled) + '░'.repeat(10 - filled)
      const emoji = pct >= 70 ? '🟢' : pct >= 50 ? '🟡' : '🔴'
      text += `${emoji} ${subj}: ${pct}% ${bar}\n`
    }

    const weakest = sorted[0]
    if (weakest) text += `\n💡 <b>Фокус:</b> ${weakest[0]} — именно там будут твои вопросы дня`
  } else {
    text += `\n⚡ Пройди диагностику чтобы увидеть баллы по предметам`
  }

  await sendMsg(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📱 Открыть дашборд', web_app: { url: `${APP_URL}/dashboard` } }],
        [{ text: '🎯 Вопрос по слабой теме', callback_data: 'flow:question' }],
        BACK_TO_MENU[0]!,
      ],
    },
  })
}

// ── /link ─────────────────────────────────────────────────────────────────────

async function handleLink(chatId: number, token: string) {
  const code = token.trim().toUpperCase()
  const linkToken = await prisma.telegramLinkToken.findUnique({ where: { token: code } })

  if (!linkToken) {
    await sendMsg(chatId,
      `❌ <b>Неверный или устаревший код.</b>\n\nПолучи новый на странице настроек.`,
      { reply_markup: { inline_keyboard: [[{ text: '⚙️ Настройки', url: `${APP_URL}/settings` }]] } },
    )
    return
  }

  if (linkToken.expiresAt < new Date()) {
    await prisma.telegramLinkToken.delete({ where: { id: linkToken.id } })
    await sendMsg(chatId, `⏰ <b>Код истёк.</b> Сгенерируй новый в настройках.`,
      { reply_markup: { inline_keyboard: [[{ text: '⚙️ Настройки', url: `${APP_URL}/settings` }]] } })
    return
  }

  await prisma.user.update({ where: { id: linkToken.userId }, data: { telegramChatId: String(chatId) } })
  await prisma.telegramLinkToken.delete({ where: { id: linkToken.id } })
  const user = await prisma.user.findUnique({ where: { id: linkToken.userId } })

  await sendMsg(chatId,
    `✅ <b>Аккаунт привязан!</b>\n\nПривет, ${user?.name ?? 'друг'}! 🎉\n\nТеперь я буду присылать тебе вопрос дня и отслеживать твой прогресс.`,
    { reply_markup: {
      inline_keyboard: [
        [{ text: '📱 Открыть платформу', url: `${APP_URL}/dashboard` }],
        BACK_TO_MENU[0]!,
      ],
    } },
  )
}

// ── Free-text handler (keyword matching from DB) ──────────────────────────────

const KEYWORD_MAP = [
  { re: /ент|егэ|экзамен|подготов|готовит|сдать|балл/i,        flow: 'ent' as const },
  { re: /матем|алгебр|геометр|уравнен|формул|логариф|тригон|производн|интеграл/i, flow: 'ent' as const },
  { re: /истори|казахст|хан|ханств|независим/i,                 flow: 'ent' as const },
  { re: /физик|биолог|хими/i,                                   flow: 'ent' as const },
  { re: /поступ|вуз|универс|грант|заграниц|зарубеж|abroad/i,    flow: 'abroad' as const },
  { re: /ielts|айелтс|английск|toefl|speaking|writing|band/i,   flow: 'ielts' as const },
  { re: /профес|карьер|специальн|работ|профориент/i,            flow: 'career' as const },
  { re: /стартап|startup|бизнес|идея|инвест|питч|mvp/i,         flow: 'startup' as const },
]

async function handleFreeText(chatId: number, text: string, userName?: string) {
  // 1. Try DB mentor_qa first (мгновенно, без AI)
  try {
    const entries = await prisma.content.findMany({ where: { type: 'mentor_qa', active: true }, take: 100 })
    const lower = text.toLowerCase()
    for (const entry of entries) {
      const d = entry.data as Record<string, unknown>
      const keywords = (d.keywords as string[] | undefined) ?? []
      if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
        const answer = String(d.answer ?? '')
        await sendMsg(chatId, answer, {
          reply_markup: { inline_keyboard: [
            [{ text: '📱 Подробнее на StudyHub', url: APP_URL }],
            BACK_TO_MENU[0]!,
          ]},
        })
        return
      }
    }
  } catch { /* fallback */ }

  // 2. Keyword → запустить тематический флоу (быстро)
  for (const { re, flow } of KEYWORD_MAP) {
    if (re.test(text)) {
      await sendMsg(chatId, `Отличный вопрос! Давай разберёмся подробнее 👇`)
      if (flow === 'ent')    { await startEntDiag(chatId); return }
      if (flow === 'abroad') { await startAbroadFlow(chatId); return }
      if (flow === 'ielts')  { await startIeltsFlow(chatId); return }
      if (flow === 'career') { await startCareerFlow(chatId); return }
      if (flow === 'startup'){ await startStartupFlow(chatId); return }
    }
  }

  // 3. Skylla AI — умный ответ через Claude Haiku
  try {
    await sendMsg(chatId, '🤔 Думаю...')
    const answer = await askSkylla(text, userName ?? 'друг')
    await sendMsg(chatId, answer, {
      reply_markup: { inline_keyboard: [
        [{ text: '📱 Учиться на StudyHub', url: APP_URL }],
        BACK_TO_MENU[0]!,
      ]},
    })
  } catch {
    // Финальный fallback — меню
    await sendMsg(chatId,
      `Не совсем понял вопрос 🤔\n\nВыбери направление — и я помогу:`,
      { reply_markup: MAIN_MENU_KB },
    )
  }
}

// ── Callback query router ─────────────────────────────────────────────────────

async function handleCallback(
  callbackQueryId: string,
  chatId: number,
  messageId: number,
  data: string,
) {
  await answerCallback(callbackQueryId)

  // Main menu flows
  if (data === 'flow:main')     { await showMainMenu(chatId); return }
  if (data === 'flow:ent')      { await sendMsg(chatId, '🎓 <b>Подготовка к ЕНТ</b>\n\nПройди мини-диагностику из 5 вопросов — узнаешь свой примерный балл и слабые места.', { reply_markup: { inline_keyboard: [
    [{ text: '🎯 Пройти мини-диагностику', callback_data: 'flow:ent_diag' }],
    [{ text: '❓ Вопрос дня',              callback_data: 'flow:question' }],
    [{ text: '📚 Учебный план на платформе', url: `${APP_URL}/dashboard` }],
    BACK_TO_MENU[0]!,
  ]}}) ; return }
  if (data === 'flow:ent_diag') { await startEntDiag(chatId); return }
  if (data === 'flow:abroad')   { await startAbroadFlow(chatId); return }
  if (data === 'flow:career')   { await startCareerFlow(chatId); return }
  if (data === 'flow:ielts')    { await startIeltsFlow(chatId); return }
  if (data === 'flow:startup')  { await startStartupFlow(chatId); return }
  if (data === 'flow:question') { await handleQuestion(chatId); return }
  if (data === 'flow:progress') { await handleProgress(chatId); return }

  // ENT diagnostic answers
  if (data.startsWith('diag:ans:')) {
    await handleEntDiagAns(chatId, Number(data.split(':')[2]))
    return
  }

  // Abroad quiz answers
  if (data.startsWith('abroad:ans:')) {
    await handleAbroadAns(chatId, Number(data.split(':')[2]))
    return
  }

  // Career test answers
  if (data.startsWith('career:ans:')) {
    await handleCareerAns(chatId, Number(data.split(':')[2]))
    return
  }

  // Startup quiz answers
  if (data.startsWith('startup:ans:')) {
    await handleStartupAns(chatId, Number(data.split(':')[2]))
    return
  }

  // /question answer (existing format)
  if (data.startsWith('ans:')) {
    const [, questionId, ansStr] = data.split(':')
    await handleQuestionAnswer(chatId, messageId, questionId!, Number(ansStr))
    return
  }
}

// ── Main update handler ───────────────────────────────────────────────────────

export interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from?: { id: number; first_name?: string; username?: string }
    chat: { id: number }
    text?: string
  }
  callback_query?: {
    id: string
    from: { id: number }
    message?: { message_id: number; chat: { id: number } }
    data?: string
  }
}

export async function handleUpdate(update: TelegramUpdate): Promise<void> {
  try {
    if (update.message?.text) {
      const chatId = update.message.chat.id
      const text   = update.message.text.trim()

      // ── Growth Assistant commands (admin-only, /g_ prefix) ────────────
      if (isAdmin(chatId) && (text.startsWith('/g') || text === '/g')) {
        const handled = await handleGrowthCommand(chatId, text)
        if (handled) return
      }

      // ── Growth Assistant: multi-step flow input (admin typing responses) ─
      if (isAdmin(chatId)) {
        const handled = await handleGrowthCommand(chatId, text)
        if (handled) return
      }

      if (text.startsWith('/start')) {
        const payload = text.slice(6).trim()
        if (payload) { await handleLink(chatId, payload); return }
        await showMainMenu(chatId); return
      }
      if (text === '/help')          { await showMainMenu(chatId); return }
      if (text === '/question')      { await handleQuestion(chatId); return }
      if (text === '/progress')      { await handleProgress(chatId); return }
      if (text === '/stats')         { await handleStats(chatId); return }
      if (text.startsWith('/link'))  { await handleLink(chatId, text.slice(5).trim()); return }

      // Free text → DB lookup + keyword matching + Skylla AI
      const userName = update.message?.from?.first_name ?? undefined
      await handleFreeText(chatId, text, userName)
      return
    }

    if (update.callback_query) {
      const cq = update.callback_query
      const chatId    = cq.message?.chat.id
      const messageId = cq.message?.message_id
      if (chatId && messageId && cq.data) {
        // ── Growth Assistant callbacks (admin-only, g: prefix) ──────────
        if (isAdmin(chatId) && cq.data.startsWith('g:')) {
          const handled = await handleGrowthCallback(chatId, cq.data)
          if (handled) { await answerCallback(cq.id); return }
        }

        await handleCallback(cq.id, chatId, messageId, cq.data)
      }
    }
  } catch (err) {
    console.error('[Bot] handleUpdate error:', err)
  }
}

// ── Admin notifications ───────────────────────────────────────────────────────

function now() { return new Date().toLocaleString('ru-KZ', { timeZone: 'Asia/Almaty' }) }

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function adminSend(text: string) {
  if (!BOT_TOKEN || !ADMIN_CHAT) return
  try { await sendMsg(ADMIN_CHAT, text) } catch (e) { console.error('[Telegram] admin send failed:', e) }
}

export const tg = {
  serverStart: () => adminSend(`✅ <b>Сервер запущен</b>\n🕐 ${now()}`),

  newUser: (name: string, email: string, role: string, city?: string | null) =>
    adminSend(`🆕 <b>Новый пользователь</b>\n👤 ${escHtml(name)}\n📧 ${escHtml(email)}\n🎭 ${escHtml(role)}${city ? `\n📍 ${escHtml(city)}` : ''}\n🕐 ${now()}`),

  newSubscription: (userName: string, planName: string, expires: string) =>
    adminSend(`🔔 <b>Новая подписка</b>\n👤 ${escHtml(userName)}\n📦 ${escHtml(planName)}\n📅 до ${escHtml(expires)}\n🕐 ${now()}`),

  newPayment: (userName: string, amount: number, method: string, planName?: string) =>
    adminSend(`💰 <b>Оплата</b>\n👤 ${escHtml(userName)}\n💵 ${amount.toLocaleString('ru-RU')} ₸\n💳 ${escHtml(method)}${planName ? `\n📦 ${escHtml(planName)}` : ''}\n🕐 ${now()}`),

  support: (name: string, email: string, message: string) =>
    adminSend(`💬 <b>Поддержка</b>\n👤 ${escHtml(name)}\n📧 ${escHtml(email)}\n📝 ${escHtml(message.slice(0, 500))}\n🕐 ${now()}`),

  error: (message: string, stack?: string) =>
    adminSend(`🚨 <b>Ошибка</b>\n<code>${escHtml(message.slice(0, 300))}</code>${stack ? `\n<code>${escHtml(stack.slice(0, 400))}</code>` : ''}\n🕐 ${now()}`),

  dailyStats: (users: number, premium: number, revenueToday: number) =>
    adminSend(`📊 <b>Статистика</b>\n👥 ${users.toLocaleString('ru-RU')} пользователей\n👑 Премиум: ${premium.toLocaleString('ru-RU')}\n💰 Доход: ${revenueToday.toLocaleString('ru-RU')} ₸\n🕐 ${now()}`),
}

// ── Polling mode (dev — no webhook needed) ───────────────────────────────────

let pollingOffset = 0

async function pollUpdates(): Promise<void> {
  if (!BOT_TOKEN) return
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${pollingOffset}&timeout=30`)
    const json = await res.json() as { ok: boolean; result?: TelegramUpdate[] }
    if (json.ok && json.result) {
      for (const update of json.result) {
        pollingOffset = (update as TelegramUpdate & { update_id: number }).update_id + 1
        await handleUpdate(update)
      }
    }
  } catch (err) {
    console.error('[Bot polling] error:', err)
  }
  setTimeout(pollUpdates, 1000)
}

export function startPolling(): void {
  if (!BOT_TOKEN) { console.log('[Bot] No TELEGRAM_BOT_TOKEN — polling disabled'); return }
  console.log('[Bot] Polling mode started')
  pollUpdates()
}
